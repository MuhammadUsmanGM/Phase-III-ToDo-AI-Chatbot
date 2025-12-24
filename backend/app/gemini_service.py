import os
import json
import google.generativeai as genai
from typing import Dict, Any, List
from sqlmodel import Session
from app.task_mcp_tools import execute_tool_call

class GeminiAIService:
    """
    Service class to handle interactions with Google's Gemini API
    """
    
    def __init__(self, api_key: str = None):
        # Use provided API key or get from environment
        api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        # Use the gemini-2.0-flash model as requested (using gemini-2.0-flash as per user request)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-lite",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 8192,
            }
        )
    
    def chat_with_function_calling(
        self, 
        messages: List[Dict[str, str]], 
        tools: List[Dict[str, Any]], 
        db_session: Session, 
        user_id: str
    ) -> str:
        """
        Send messages to Gemini API with function calling capabilities
        """
        try:
            # Convert messages to Gemini format
            gemini_contents = []
            for msg in messages:
                # Map roles: user/assistant remain the same, but tool becomes function response
                role = "model" if msg["role"] == "assistant" else "user"
                if msg["role"] == "tool":
                    # For tool responses in Gemini, we format as function response
                    gemini_contents.append({
                        "role": "function",
                        "parts": [json.dumps({"result": msg["content"]})]
                    })
                else:
                    gemini_contents.append({
                        "role": role,
                        "parts": [msg["content"]]
                    })
            
            # Convert tools to Gemini format
            gemini_tools = self._convert_tools_to_gemini_format(tools)
            
            # Call the model with tools
            response = self.model.generate_content(
                contents=gemini_contents,
                tools=gemini_tools,
                tool_config={"function_calling_config": {"mode": "AUTO"}}  # AUTO mode to automatically decide when to call functions
            )
            
            # Process the response
            result_text = ""
            if response.candidates:
                candidate = response.candidates[0]
                if candidate.finish_reason and candidate.finish_reason > 1:  # If there were issues
                    print(f"Response didn't finish normally: {candidate.finish_reason}")
                
                # Check if there are function calls in the response
                has_function_call = False
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        # Check if this part is a function call
                        if hasattr(part, 'function_call') and part.function_call:
                            has_function_call = True
                            # Execute the function call
                            function_call = part.function_call
                            function_name = function_call.name
                            function_args = {}
                            
                            # Convert the function arguments from protobuf to dict
                            if hasattr(function_call, 'args') and function_call.args:
                                for key, value in function_call.args.items():
                                    function_args[key] = value
                            
                            # Execute the tool function
                            function_result = execute_tool_call(
                                tool_name=function_name,
                                arguments_str=json.dumps(function_args),
                                db_session=db_session,
                                user_id=user_id
                            )
                            
                            # Add the function result to the conversation history
                            gemini_contents.append({
                                "role": "function",
                                "parts": [json.dumps(function_result)]
                            })
                            
                            # Make another call to get the final response after function execution
                            final_response = self.model.generate_content(
                                contents=gemini_contents,
                                tools=gemini_tools
                            )
                            
                            if final_response.candidates:
                                final_candidate = final_response.candidates[0]
                                if final_candidate.content and final_candidate.content.parts:
                                    for part in final_candidate.content.parts:
                                        if hasattr(part, 'text') and part.text:
                                            result_text += part.text
                        elif hasattr(part, 'text') and part.text:
                            # Regular text response
                            result_text += part.text
            
            # If no function calls were made, return the initial response text
            if not has_function_call and result_text == "":
                for part in candidate.content.parts:
                    if hasattr(part, 'text') and part.text:
                        result_text += part.text
            
            return result_text if result_text else "I couldn't process your request. Please try again."
            
        except Exception as e:
            print(f"Error in Gemini API call: {str(e)}")
            return f"Sorry, I encountered an error processing your request: {str(e)}"
    
    def _convert_tools_to_gemini_format(self, tools: List[Dict[str, Any]]) -> List[Any]:
        """
        Convert OpenAI-style tools to Gemini format
        """
        gemini_tools = []
        for tool in tools:
            # Create a Gemini Function Declaration using the correct approach
            function_decl = {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": tool["parameters"]
            }
            gemini_tools.append(function_decl)
        
        return [{"function_declarations": gemini_tools}]
    
    def simple_chat(self, messages: List[Dict[str, str]]) -> str:
        """
        Send messages to Gemini API without function calling
        """
        try:
            # Convert messages to Gemini format
            gemini_contents = []
            for msg in messages:
                role = "model" if msg["role"] == "assistant" else "user"
                gemini_contents.append({
                    "role": role,
                    "parts": [msg["content"]]
                })
            
            response = self.model.generate_content(gemini_contents)
            
            if response.candidates and response.candidates[0].content.parts:
                return " ".join([part.text for part in response.candidates[0].content.parts if hasattr(part, 'text') and part.text])
            else:
                return "I couldn't process your request. Please try again."
                
        except Exception as e:
            print(f"Error in Gemini API call: {str(e)}")
            return f"Sorry, I encountered an error processing your request: {str(e)}"