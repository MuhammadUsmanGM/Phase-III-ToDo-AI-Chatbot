from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
import datetime
import uuid
import sqlalchemy as sa

class User(SQLModel, table=True):
    __tablename__ = "users"  # Explicitly use "users" to match conversation constraint

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    name: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)

    tasks: List["Task"] = Relationship(back_populates="owner")
    conversations: List["Conversation"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    completed: bool = False

    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)

    owner_id: str = Field(foreign_key="users.id")
    owner: Optional["User"] = Relationship(back_populates="tasks")

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)

    user: Optional["User"] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(sa_column_kwargs={"comment": "user, assistant, system, or tool"})
    content: str = Field(sa_column=sa.Column(sa.Text))
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)
    tool_calls: Optional[dict] = Field(default=None, sa_column=sa.Column(sa.JSON))
    tool_responses: Optional[dict] = Field(default=None, sa_column=sa.Column(sa.JSON))

    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
