from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    # Fallback to a default value for development, but this should be set in production
    DATABASE_URL = os.getenv("DATABASE_URL_DEFAULT", "")

if not DATABASE_URL:
    # Raise an error if no database URL is provided
    raise ValueError("DATABASE_URL environment variable is not set. Please configure it in your deployment platform.")

# Create the engine with connection pooling and SSL settings
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections after 5 minutes
    connect_args={
        "connect_timeout": 10,  # Connection timeout
        # For PostgreSQL/Neon, you might need to adjust SSL settings
        # "sslmode": "require"  # Uncomment if needed
    }
)

from app.models import User

def create_db_and_tables():
    """Create database tables based on SQLModel metadata."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency to get a database session."""
    with Session(engine) as session:
        yield session
