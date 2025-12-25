from typing import Optional, List, Dict, Any
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
    id: Optional[str] = None # User ID stored in JWT 'sub' claim - using string to support UUIDs

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
    owner_id: str # Include owner_id for API response - changed to string to match User.id

class TaskCompletionStatus(SQLModel):
    completed: bool

# --- Chat Schemas ---

class ChatRequest(SQLModel):
    message: str
    conversation_id: Optional[int] = None

class ChatResponse(SQLModel):
    response: str
    conversation_id: int
    message_id: Optional[int] = None

class MessageBase(SQLModel):
    conversation_id: int
    role: str
    content: str
    tool_calls: Optional[Dict[str, Any]] = None
    tool_responses: Optional[Dict[str, Any]] = None

class MessageCreate(MessageBase):
    pass

class MessageRead(MessageBase):
    id: int
    created_at: datetime.datetime

class ConversationBase(SQLModel):
    user_id: str

class ConversationCreate(ConversationBase):
    pass

class ConversationRead(ConversationBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

class ConversationWithMessages(ConversationRead):
    messages: List[MessageRead] = []
