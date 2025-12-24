# Database Setup Instructions

This document provides instructions for setting up the database for the Todo AI Chatbot application.

## SQL Schema for Neon DB

The `database_schema.sql` file contains all the necessary SQL commands to recreate the database schema for the Todo application with AI chatbot functionality.

### Tables Included:

1. **users** - Stores user information (email, password, etc.)
2. **tasks** - Stores individual tasks assigned to users
3. **conversations** - Stores chatbot conversation records
4. **messages** - Stores individual messages within conversations

### Setup Instructions:

1. Connect to your Neon DB instance
2. Execute the SQL commands in `database_schema.sql`
3. The schema includes:
   - All necessary table definitions
   - Foreign key relationships
   - Indexes for performance
   - Triggers for automatic timestamp updates

### Important Notes:

- The schema uses UUIDs for user IDs and serial integers for other primary keys
- Timestamps are stored with timezone information
- JSONB columns are used for flexible data storage (tool_calls, tool_responses)
- The schema includes proper foreign key constraints to maintain referential integrity
- Indexes are added on commonly queried columns for performance

### After Setup:

Once the database is set up:
1. Update your `.env` file with the new database connection string
2. Ensure your application is configured to use the new database
3. Test all functionality to confirm the database is working correctly