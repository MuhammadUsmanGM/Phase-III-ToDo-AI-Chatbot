from typing import List, Optional
from sqlmodel import Session, select
from app.models import User, Task, Conversation, Message
from app.schemas import UserCreate, TaskCreate, TaskUpdate
from app.security import get_password_hash
import datetime # Import datetime for utcnow

# --- User CRUD ---
def get_user_by_email(session: Session, email: str) -> Optional[User]:
    return session.exec(select(User).where(User.email == email)).first()

def create_user(session: Session, user_create: UserCreate) -> User:
    hashed_password = get_password_hash(user_create.password)
    user = User(email=user_create.email, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# --- Task CRUD ---
def get_task_by_id_and_owner(session: Session, task_id: int, owner_id: str) -> Optional[Task]:
    return session.exec(select(Task).where(Task.id == task_id, Task.owner_id == owner_id)).first()

def get_tasks_by_owner(session: Session, owner_id: str) -> List[Task]:
    return session.exec(select(Task).where(Task.owner_id == owner_id)).all()

def create_task(session: Session, task_create: TaskCreate, owner_id: str) -> Task:
    task = Task.from_orm(task_create, update={'owner_id': owner_id})
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def update_task(session: Session, db_task: Task, task_update: TaskUpdate) -> Task:
    # Use task_update.model_dump(exclude_unset=True) to get only provided fields
    task_data = task_update.model_dump(exclude_unset=True)
    
    # Update attributes of the db_task instance
    for key, value in task_data.items():
        setattr(db_task, key, value)
    
    # Update updated_at timestamp
    db_task.updated_at = datetime.datetime.utcnow()
    
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

def delete_task(session: Session, db_task: Task):
    session.delete(db_task)
    session.commit()

# --- Conversation CRUD ---
def create_conversation(session: Session, user_id: str) -> Conversation:
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation

def get_conversation_by_id(session: Session, conversation_id: int, user_id: str) -> Optional[Conversation]:
    return session.exec(
        select(Conversation)
        .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    ).first()

def get_conversations_by_user(session: Session, user_id: str) -> List[Conversation]:
    return session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
    ).all()

# --- Message CRUD ---
def create_message(session: Session, conversation_id: int, role: str, content: str, tool_calls: dict = None, tool_responses: dict = None) -> Message:
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_calls=tool_calls,
        tool_responses=tool_responses
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message

def get_messages_by_conversation(session: Session, conversation_id: int) -> List[Message]:
    return session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()

def get_latest_messages(session: Session, conversation_id: int, limit: int = 10) -> List[Message]:
    return session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all()
