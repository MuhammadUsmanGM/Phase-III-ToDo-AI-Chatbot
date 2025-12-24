from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # Added import
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.database import create_db_and_tables, get_session
from app.models import User, Task # Ensure User is imported
from app.schemas import UserCreate, Token, TaskCreate, TaskRead, TaskUpdate, TaskCompletionStatus # Added TaskCompletionStatus
from app.security import (
    get_password_hash, verify_password,
    create_access_token, get_current_user,
    get_authorized_user # For path parameter authorization
)
from app import crud

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
