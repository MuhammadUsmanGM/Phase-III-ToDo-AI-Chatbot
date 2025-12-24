from typing import List, Optional
from sqlmodel import Session, select
from app.models import User, Task
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
def get_task_by_id_and_owner(session: Session, task_id: int, owner_id: int) -> Optional[Task]:
    return session.exec(select(Task).where(Task.id == task_id, Task.owner_id == owner_id)).first()

def get_tasks_by_owner(session: Session, owner_id: int) -> List[Task]:
    return session.exec(select(Task).where(Task.owner_id == owner_id)).all()

def create_task(session: Session, task_create: TaskCreate, owner_id: int) -> Task:
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
