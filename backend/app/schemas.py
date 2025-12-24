from typing import Optional
from sqlmodel import SQLModel
import datetime
from pydantic import EmailStr # Added EmailStr import

# --- Authentication Schemas ---

class UserCreate(SQLModel):
    email: EmailStr
    password: str

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    id: Optional[int] = None # User ID stored in JWT 'sub' claim

# --- Task Schemas ---

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase): # Corrected base class
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class TaskRead(TaskBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    owner_id: int # Include owner_id for API response

class TaskCompletionStatus(SQLModel):
    completed: bool
