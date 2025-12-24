from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # Added import
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
import os

from app.database import create_db_and_tables, get_session
from app.models import User, Task, Conversation, Message # Ensure User is imported
from app.schemas import UserCreate, Token, TaskCreate, TaskRead, TaskUpdate, TaskCompletionStatus, ChatRequest, ChatResponse # Added TaskCompletionStatus
from app.security import (
    get_password_hash, verify_password,
    create_access_token, get_current_user,
    get_authorized_user # For path parameter authorization
)
from app import crud
from app.task_mcp_tools import execute_tool_call
from app.gemini_service import GeminiAIService

app = FastAPI(
    title="Todo Full-Stack Web Application Backend",
    version="Phase II",
    description="FastAPI backend for a multi-user Todo application with JWT authentication and Neon PostgreSQL."
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production - should be more specific in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- Authentication Endpoints ---
@app.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_create: UserCreate, session: Session = Depends(get_session)):
    db_user = crud.get_user_by_email(session, email=user_create.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    user = crud.create_user(session, user_create)
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer")

@app.post("/auth/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    user = crud.get_user_by_email(session, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer")


# --- Task Endpoints ---
@app.get("/api/{user_id}/tasks", response_model=List[TaskRead])
def read_tasks(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    tasks = crud.get_tasks_by_owner(session, owner_id=user_id)
    return tasks

@app.post("/api/{user_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task_for_user(
    user_id: int,
    task: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    db_task = crud.create_task(session, task, owner_id=user_id)
    return db_task

@app.get("/api/{user_id}/tasks/{task_id}", response_model=TaskRead)
def read_single_task(
    user_id: int,
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    task = crud.get_task_by_id_and_owner(session, task_id=task_id, owner_id=user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@app.put("/api/{user_id}/tasks/{task_id}", response_model=TaskRead)
def update_single_task(
    user_id: int,
    task_id: int,
    task_update: TaskUpdate, # Corrected to TaskUpdate
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    db_task = crud.get_task_by_id_and_owner(session, task_id=task_id, owner_id=user_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Using TaskUpdate for partial update logic
    updated_task = crud.update_task(session, db_task, task_update)
    return updated_task

@app.patch("/api/{user_id}/tasks/{task_id}/complete", response_model=TaskRead)
def toggle_task_completion(
    user_id: int,
    task_id: int,
    completed_status: TaskCompletionStatus, # Corrected to TaskCompletionStatus
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    db_task = crud.get_task_by_id_and_owner(session, task_id=task_id, owner_id=user_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Use the completed status directly from the schema model
    task_update_model = TaskUpdate(completed=completed_status.completed)
    updated_task = crud.update_task(session, db_task, task_update_model)
    return updated_task

@app.delete("/api/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_task(
    user_id: int,
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    db_task = crud.get_task_by_id_and_owner(session, task_id=task_id, owner_id=user_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    crud.delete_task(session, db_task)
    return

# --- Chat Endpoints ---
@app.post("/api/{user_id}/chat", response_model=ChatResponse)
def chat_with_assistant(
    user_id: str,  # Changed from int to str to match User.id type
    chat_request: ChatRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    # Verify the user_id in the path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's conversations"
        )

    # Create or get conversation
    if chat_request.conversation_id:
        # Verify the conversation belongs to the user
        conversation = crud.get_conversation_by_id(session, chat_request.conversation_id, user_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    else:
        # Create a new conversation
        conversation = crud.create_conversation(session, user_id)

    # Create user message
    user_message = crud.create_message(
        session,
        conversation_id=conversation.id,
        role="user",
        content=chat_request.message
    )

    try:
        # Initialize Gemini API service
        gemini_service = GeminiAIService()

        # Define the tools for Gemini (function calling)
        tools_list = [
            {
                "name": "add_task",
                "description": "Create a new task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "The task title"},
                        "description": {"type": "string", "description": "The task description"}
                    },
                    "required": ["title"]
                }
            },
            {
                "name": "list_tasks",
                "description": "Retrieve tasks from the list",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "enum": ["all", "pending", "completed"], "description": "Filter tasks by status"}
                    }
                }
            },
            {
                "name": "complete_task",
                "description": "Mark a task as complete",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "integer", "description": "The ID of the task to complete"}
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "delete_task",
                "description": "Remove a task from the list",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "integer", "description": "The ID of the task to delete"}
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "update_task",
                "description": "Modify task title or description",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "integer", "description": "The ID of the task to update"},
                        "title": {"type": "string", "description": "The new title"},
                        "description": {"type": "string", "description": "The new description"}
                    },
                    "required": ["task_id"]
                }
            }
        ]

        # Get conversation history for context
        messages = crud.get_messages_by_conversation(session, conversation.id)

        # Prepare messages for Gemini
        gemini_messages = []
        for msg in messages:
            gemini_messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add the new user message
        gemini_messages.append({
            "role": "user",
            "content": chat_request.message
        })

        # Call Gemini API with function calling
        response_content = gemini_service.chat_with_function_calling(
            messages=gemini_messages,
            tools=tools_list,
            db_session=session,
            user_id=user_id
        )

        # Create assistant message
        assistant_message = crud.create_message(
            session,
            conversation_id=conversation.id,
            role="assistant",
            content=response_content
        )

        return ChatResponse(
            response=response_content,
            conversation_id=conversation.id,
            message_id=assistant_message.id
        )
    except Exception as e:
        # In case of error, create an error response
        error_message = f"Sorry, I encountered an error processing your request: {str(e)}"
        assistant_message = crud.create_message(
            session,
            conversation_id=conversation.id,
            role="assistant",
            content=error_message
        )

        return ChatResponse(
            response=error_message,
            conversation_id=conversation.id,
            message_id=assistant_message.id
        )

@app.get("/api/{user_id}/conversations", response_model=List[ConversationRead])
def read_conversations(
    user_id: str,  # Changed from int to str to match User.id type
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    # Verify the user_id in the path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's conversations"
        )

    conversations = crud.get_conversations_by_user(session, user_id)
    return conversations

@app.get("/api/{user_id}/conversations/{conversation_id}", response_model=ConversationWithMessages)
def read_conversation(
    user_id: str,  # Changed from int to str to match User.id type
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    # Verify the user_id in the path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's conversations"
        )

    conversation = crud.get_conversation_by_id(session, conversation_id, user_id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    # Get messages for this conversation
    messages = crud.get_messages_by_conversation(session, conversation_id)

    # Convert to response model manually to avoid from_orm issues
    conversation_response = ConversationWithMessages(
        id=conversation.id,
        user_id=conversation.user_id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[MessageRead(
            id=msg.id,
            conversation_id=msg.conversation_id,
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at,
            tool_calls=msg.tool_calls,
            tool_responses=msg.tool_responses
        ) for msg in messages]
    )

    return conversation_response

@app.post("/api/{user_id}/conversations", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
def create_conversation_endpoint(
    user_id: str,  # Changed from int to str to match User.id type
    session: Session = Depends(get_session),
    current_user: User = Depends(get_authorized_user) # Authorization check
):
    # Verify the user_id in the path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create conversations for this user"
        )

    conversation = crud.create_conversation(session, user_id)
    return conversation
