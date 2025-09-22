from dotenv import load_dotenv
import os
import json
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL_NAME = "gpt-4.1-mini"  # Use the appropriate model for your needs


PROMPT_TEMPLATE = """
You are an expert API endpoint generator. Given a user's natural language description of what they want to accomplish with the GitHub API, generate a list of relevant endpoints with brief descriptions.

You MUST return your response as a valid JSON array ONLY. Do not include any markdown formatting, explanations, or additional text.

Each endpoint object must have exactly this structure:
{
  "id": "unique_identifier",
  "name": "Endpoint Name",
  "method": "HTTP_METHOD",
  "url_template": "https://api.github.com/endpoint/path",
  "description": "Brief description of what this endpoint does and why it's suitable for the user's needs",
  "confidence": 0.95
}

Guidelines:
- Generate 1-4 most relevant endpoints based on the user's request
- Use realistic GitHub API endpoints (https://api.github.com/...)
- Keep descriptions concise but informative (1-2 sentences max)
- Confidence should be between 0.0 and 1.0
- Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Include path parameters in URL templates using {parameter_name} format
- Return ONLY the JSON array, no markdown code blocks or extra text

User Request: {user_prompt}

Response format example:
[
  {
    "id": "1",
    "name": "Get Repository",
    "method": "GET",
    "url_template": "https://api.github.com/repos/{owner}/{repo}",
    "description": "Retrieves basic information about a repository including stars, forks, and description.",
    "confidence": 0.9
  }
]
"""

def create_fallback_endpoints(user_prompt: str) -> list:
    """Create fallback endpoints when AI is not available"""
    # Analyze the prompt for keywords to create relevant fallbacks
    prompt_lower = user_prompt.lower()
    
    fallback_endpoints = []
    
    # Repository-related endpoints
    if any(word in prompt_lower for word in ['repo', 'repository', 'get repo', 'repo info']):
        fallback_endpoints.append({
            "id": "repo_get",
            "name": "Get Repository",
            "method": "GET",
            "url_template": "https://api.github.com/repos/{owner}/{repo}",
            "description": "Retrieves basic information about a repository including stars, forks, description, and other metadata.",
            "confidence": 0.9
        })
    
    # Issues-related endpoints
    if any(word in prompt_lower for word in ['issue', 'issues', 'bug', 'problem']):
        fallback_endpoints.append({
            "id": "issues_list",
            "name": "List Repository Issues",
            "method": "GET",
            "url_template": "https://api.github.com/repos/{owner}/{repo}/issues",
            "description": "Lists all open and closed issues for a repository with optional filtering by state, labels, and assignee.",
            "confidence": 0.85
        })
        
        if any(word in prompt_lower for word in ['create', 'add', 'new', 'report']):
            fallback_endpoints.append({
                "id": "issue_create",
                "name": "Create New Issue",
                "method": "POST",
                "url_template": "https://api.github.com/repos/{owner}/{repo}/issues",
                "description": "Creates a new issue in the repository with title, body, labels, and assignees.",
                "confidence": 0.8
            })
    
    # Pull requests
    if any(word in prompt_lower for word in ['pull', 'pr', 'merge', 'branch']):
        fallback_endpoints.append({
            "id": "pulls_list",
            "name": "List Pull Requests",
            "method": "GET", 
            "url_template": "https://api.github.com/repos/{owner}/{repo}/pulls",
            "description": "Lists all pull requests for a repository with filtering options for state and sort order.",
            "confidence": 0.85
        })
    
    # User-related endpoints
    if any(word in prompt_lower for word in ['user', 'profile', 'account']):
        fallback_endpoints.append({
            "id": "user_get",
            "name": "Get User",
            "method": "GET",
            "url_template": "https://api.github.com/users/{username}",
            "description": "Retrieves public information about a GitHub user including bio, followers, and public repositories.",
            "confidence": 0.9
        })
    
    # If no specific keywords found, provide general endpoints
    if not fallback_endpoints:
        fallback_endpoints = [
            {
                "id": "repo_get",
                "name": "Get Repository",
                "method": "GET",
                "url_template": "https://api.github.com/repos/{owner}/{repo}",
                "description": "Retrieves basic information about a repository including stars, forks, and description.",
                "confidence": 0.9
            },
            {
                "id": "issues_list",
                "name": "List Issues",
                "method": "GET",
                "url_template": "https://api.github.com/repos/{owner}/{repo}/issues",
                "description": "Lists all issues for a repository with filtering options.",
                "confidence": 0.85
            }
        ]
    
    return fallback_endpoints[:4]  # Limit to 4 endpoints


def fetch_endpoints(user_prompt: str) -> list:
    
    prompt = PROMPT_TEMPLATE.replace("{user_prompt}", user_prompt)
    print(f"[DEBUG] Sending prompt to OpenAI: {prompt}")
    
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1000,
        )

        response_text = response.choices[0].message.content.strip()
        print(f"[DEBUG] Raw OpenAI response: {response_text}")
        
        # Clean the response text - remove any markdown formatting or extra text
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()
        
        # Try to find JSON array in the response
        start_bracket = response_text.find('[')
        end_bracket = response_text.rfind(']')
        
        if start_bracket != -1 and end_bracket != -1 and end_bracket > start_bracket:
            json_text = response_text[start_bracket:end_bracket + 1]
        else:
            json_text = response_text
        
        print(f"[DEBUG] Cleaned JSON text: {json_text}")
        
        endpoints = json.loads(json_text)
        
        # Validate the response structure
        if isinstance(endpoints, list):
            valid_endpoints = []
            for endpoint in endpoints:
                if all(key in endpoint for key in ['id', 'name', 'method', 'url_template', 'description', 'confidence']):
                    valid_endpoints.append(endpoint)
                else:
                    print(f"[WARNING] Invalid endpoint structure: {endpoint}")
            
            if valid_endpoints:
                return valid_endpoints
            else:
                raise ValueError("No valid endpoints found in AI response")
        else:
            raise ValueError("Expected list of endpoints")
            
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parsing failed: {str(e)}")
        print(f"[ERROR] Response text was: {response_text if 'response_text' in locals() else 'No response text'}")
        return [{
            "id": "error",
            "name": "Parsing Error",
            "method": "GET",
            "url_template": "https://api.github.com",
            "description": "Failed to parse AI response. Please try rephrasing your request.",
            "confidence": 0.0
        }]
        
    except Exception as e:
        # temp. logging
        print(f"[ERROR] OpenAI API call failed: {str(e)}")
        print(f"[INFO] Falling back to keyword-based endpoint generation")
        
        # Use fallback endpoints based on keywords
        try:
            fallback_endpoints = create_fallback_endpoints(user_prompt)
            return fallback_endpoints
        except Exception as fallback_error:
            print(f"[ERROR] Fallback generation also failed: {str(fallback_error)}")
            return [{
                "id": "error",
                "name": "Service Error",
                "method": "GET", 
                "url_template": "https://api.github.com",
                "description": f"Both AI and fallback services failed. Error: {str(e)}",
                "confidence": 0.0
            }]