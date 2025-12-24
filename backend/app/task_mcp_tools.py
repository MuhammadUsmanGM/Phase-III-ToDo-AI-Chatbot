import os
import json
from typing import Dict, Any, List
from openai import OpenAI
from app.crud import get_tasks_by_owner, create_task, get_task_by_id_and_owner, update_task, delete_task
from app.schemas import TaskCreate, TaskUpdate
from sqlmodel import Session

class TaskMCPTools:
    """
    MCP Tools for task operations that can be used by the AI assistant
    """

    def __init__(self, db_session: Session, user_id: str):
        self.db_session = db_session
        self.user_id = user_id
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def add_task(self, title: str, description: str = None) -> Dict[str, Any]:
        """
        Create a new task
        """
        try:
            task_data = TaskCreate(title=title, description=description)
            new_task = create_task(self.db_session, task_data, self.user_id)

            return {
                "task_id": new_task.id,
                "status": "created",
                "title": new_task.title,
                "description": new_task.description
            }
        except Exception as e:
            return {
                "error": f"Failed to create task: {str(e)}"
            }

    def list_tasks(self, status: str = "all") -> List[Dict[str, Any]]:
        """
        Retrieve tasks from the list
        """
        try:
            tasks = get_tasks_by_owner(self.db_session, self.user_id)

            if status == "pending":
                tasks = [task for task in tasks if not task.completed]
            elif status == "completed":
                tasks = [task for task in tasks if task.completed]

            return [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed
                }
                for task in tasks
            ]
        except Exception as e:
            return [{"error": f"Failed to retrieve tasks: {str(e)}"}]

    def complete_task(self, task_id: int) -> Dict[str, Any]:
        """
        Mark a task as complete
        """
        try:
            task = get_task_by_id_and_owner(self.db_session, task_id, self.user_id)
            if not task:
                return {
                    "error": f"Task with ID {task_id} not found"
                }

            task_update = TaskUpdate(completed=True)
            updated_task = update_task(self.db_session, task, task_update)

            return {
                "task_id": updated_task.id,
                "status": "completed",
                "title": updated_task.title
            }
        except Exception as e:
            return {
                "error": f"Failed to complete task: {str(e)}"
            }

    def delete_task(self, task_id: int) -> Dict[str, Any]:
        """
        Remove a task from the list
        """
        try:
            task = get_task_by_id_and_owner(self.db_session, task_id, self.user_id)
            if not task:
                return {
                    "error": f"Task with ID {task_id} not found"
                }

            # In the actual crud implementation, delete_task only takes session and db_task
            from app.crud import delete_task as delete_db_task
            delete_db_task(self.db_session, task)

            return {
                "task_id": task_id,
                "status": "deleted",
                "title": task.title
            }
        except Exception as e:
            return {
                "error": f"Failed to delete task: {str(e)}"
            }

    def update_task(self, task_id: int, title: str = None, description: str = None) -> Dict[str, Any]:
        """
        Modify task title or description
        """
        try:
            task = get_task_by_id_and_owner(self.db_session, task_id, self.user_id)
            if not task:
                return {
                    "error": f"Task with ID {task_id} not found"
                }

            # Prepare update data
            update_data = {}
            if title is not None:
                update_data["title"] = title
            if description is not None:
                update_data["description"] = description

            task_update = TaskUpdate(**update_data)
            updated_task = update_task(self.db_session, task, task_update)

            return {
                "task_id": updated_task.id,
                "status": "updated",
                "title": updated_task.title
            }
        except Exception as e:
            return {
                "error": f"Failed to update task: {str(e)}"
            }

def execute_tool_call(tool_name: str, arguments_str: str, db_session: Session, user_id: str) -> Dict[str, Any]:
    """
    Execute a tool call with the provided arguments
    """
    try:
        # Parse the arguments string as JSON
        arguments = json.loads(arguments_str)

        # Initialize tools
        tools = TaskMCPTools(db_session, user_id)

        # Map tool name to function
        tool_functions = {
            "add_task": tools.add_task,
            "list_tasks": tools.list_tasks,
            "complete_task": tools.complete_task,
            "delete_task": tools.delete_task,
            "update_task": tools.update_task,
        }

        # Get the function
        if tool_name not in tool_functions:
            return {"error": f"Unknown tool: {tool_name}"}

        # Call the function with arguments
        func = tool_functions[tool_name]
        result = func(**arguments)

        return result
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON arguments: {str(e)}"}
    except Exception as e:
        return {"error": f"Error executing tool: {str(e)}"}