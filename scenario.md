# API Visualiser Demonstration Scenarios

## Overview
These scenarios demonstrate the API Visualiser tool's capabilities using popular GitHub API endpoints. Each scenario shows how to chain API calls with data processing nodes to create meaningful workflows.

---

## Scenario 1: Repository Analytics Dashboard
**Demonstration Goal**: Show how to fetch repository data and create analytics insights

### Workflow Steps:
1. **GET Repository Information** → **Data Processing** → **GET Repository Statistics**

### Required Endpoints:
- `GET /repos/{owner}/{repo}` - Get repository details
- `GET /repos/{owner}/{repo}/stats/participation` - Get weekly commit activity

### Node Configuration:

#### Node 1: GET Repository Info
- **Endpoint**: `GET /repos/{owner}/{repo}`
- **Path Parameters**: 
  - `owner`: "microsoft"
  - `repo`: "vscode"
- **Output Fields**: `["id", "name", "full_name", "description", "stargazers_count", "forks_count", "language", "created_at"]`

#### Node 2: Data Processing (Repository Analytics)
- **Operation**: `custom_code`
- **Input Mapping**: 
  - `repo_data` ← Node 1 output
- **Custom Code**:
```python
# Extract key metrics and format for display
repo_info = repo_data[0]  # Get first item from array
analytics = {
    "repository_name": repo_info["full_name"],
    "primary_language": repo_info["language"],
    "stars": repo_info["stargazers_count"],
    "forks": repo_info["forks_count"],
    "age_days": (datetime.now() - datetime.fromisoformat(repo_info["created_at"].replace('Z', '+00:00'))).days,
    "description": repo_info["description"][:100] + "..." if len(repo_info["description"]) > 100 else repo_info["description"]
}
return analytics
```

#### Node 3: GET Repository Statistics
- **Endpoint**: `GET /repos/{owner}/{repo}/stats/participation`
- **Path Parameters**: 
  - `owner`: "microsoft"
  - `repo`: "vscode"
- **Input Mapping**:
  - `owner` ← Node 2 output `repository_name.split('/')[0]`
  - `repo` ← Node 2 output `repository_name.split('/')[1]`

### Demonstration Points:
- Shows how to extract specific fields from API responses
- Demonstrates data transformation with custom Python code
- Illustrates dynamic parameter binding between nodes
- Creates a meaningful analytics workflow

---

## Scenario 2: User Activity Monitor
**Demonstration Goal**: Monitor user activity and identify top contributors

### Workflow Steps:
1. **GET User Profile** → **Data Processing** → **GET User Repositories** → **Data Processing**

### Required Endpoints:
- `GET /users/{username}` - Get user profile information
- `GET /users/{username}/repos` - Get user's repositories

### Node Configuration:

#### Node 1: GET User Profile
- **Endpoint**: `GET /users/{username}`
- **Path Parameters**: 
  - `username`: "torvalds"
- **Output Fields**: `["login", "name", "public_repos", "followers", "created_at", "bio"]`

#### Node 2: Data Processing (User Analysis)
- **Operation**: `custom_code`
- **Input Mapping**: 
  - `user_data` ← Node 1 output
- **Custom Code**:
```python
# Analyze user profile and determine activity level
user = user_data[0]
created_date = datetime.fromisoformat(user["created_at"].replace('Z', '+00:00'))
account_age_years = (datetime.now() - created_date).days / 365.25

activity_level = "High" if user["public_repos"] > 50 else "Medium" if user["public_repos"] > 10 else "Low"
influence_score = user["followers"] * 0.7 + user["public_repos"] * 0.3

analysis = {
    "username": user["login"],
    "display_name": user["name"],
    "account_age_years": round(account_age_years, 1),
    "activity_level": activity_level,
    "influence_score": round(influence_score, 0),
    "bio_summary": user["bio"][:50] + "..." if user["bio"] and len(user["bio"]) > 50 else user["bio"]
}
return analysis
```

#### Node 3: GET User Repositories
- **Endpoint**: `GET /users/{username}/repos`
- **Path Parameters**: 
  - `username`: "torvalds"
- **Query Parameters**:
  - `sort`: "updated"
  - `per_page`: "10"
- **Input Mapping**:
  - `username` ← Node 2 output `username`

#### Node 4: Data Processing (Repository Analysis)
- **Operation**: `custom_code`
- **Input Mapping**: 
  - `repos_data` ← Node 3 output
- **Custom Code**:
```python
# Analyze user's repositories
if not repos_data:
    return {"error": "No repositories found"}

# Calculate repository statistics
total_stars = sum(repo["stargazers_count"] for repo in repos_data)
total_forks = sum(repo["forks_count"] for repo in repos_data)
languages = {}
for repo in repos_data:
    lang = repo["language"] or "Unknown"
    languages[lang] = languages.get(lang, 0) + 1

# Find most popular repository
most_popular = max(repos_data, key=lambda x: x["stargazers_count"])

analysis = {
    "total_repositories": len(repos_data),
    "total_stars": total_stars,
    "total_forks": total_forks,
    "top_languages": dict(sorted(languages.items(), key=lambda x: x[1], reverse=True)[:3]),
    "most_popular_repo": {
        "name": most_popular["name"],
        "stars": most_popular["stargazers_count"],
        "description": most_popular["description"][:100] + "..." if most_popular["description"] and len(most_popular["description"]) > 100 else most_popular["description"]
    }
}
return analysis
```

### Demonstration Points:
- Shows multi-step data processing workflows
- Demonstrates complex data analysis with Python code
- Illustrates how to handle different data types and structures
- Creates comprehensive user activity insights

---

## Scenario 3: Issue Management Automation
**Demonstration Goal**: Automate issue triage and categorization

### Workflow Steps:
1. **GET Repository Issues** → **Data Processing** → **POST Issue Comment**

### Required Endpoints:
- `GET /repos/{owner}/{repo}/issues` - Get repository issues
- `POST /repos/{owner}/{repo}/issues/{issue_number}/comments` - Add comment to issue

### Node Configuration:

#### Node 1: GET Repository Issues
- **Endpoint**: `GET /repos/{owner}/{repo}/issues`
- **Path Parameters**: 
  - `owner`: "facebook"
  - `repo`: "react"
- **Query Parameters**:
  - `state`: "open"
  - `per_page`: "5"
  - `sort`: "created"
- **Output Fields**: `["number", "title", "body", "user", "labels", "created_at", "comments"]`

#### Node 2: Data Processing (Issue Analysis)
- **Operation**: `custom_code`
- **Input Mapping**: 
  - `issues_data` ← Node 1 output
- **Custom Code**:
```python
# Analyze issues and generate automated responses
import re

def categorize_issue(title, body):
    title_lower = title.lower()
    body_lower = body.lower() if body else ""
    
    if any(word in title_lower for word in ["bug", "error", "crash", "broken"]):
        return "bug"
    elif any(word in title_lower for word in ["feature", "enhancement", "improvement"]):
        return "feature_request"
    elif any(word in title_lower for word in ["question", "help", "how to"]):
        return "question"
    else:
        return "general"

def generate_response(category, issue_number, title):
    responses = {
        "bug": f"Thank you for reporting this issue! Our team will investigate bug #{issue_number}: '{title}'. Please provide any additional error logs or steps to reproduce if possible.",
        "feature_request": f"Thank you for the feature request! We've logged enhancement #{issue_number}: '{title}'. Our team will review this and consider it for future releases.",
        "question": f"Thank you for your question! We'll help you with issue #{issue_number}: '{title}'. Please check our documentation first, and we'll respond with guidance.",
        "general": f"Thank you for your contribution! We've received issue #{issue_number}: '{title}'. Our team will review this and get back to you soon."
    }
    return responses.get(category, responses["general"])

# Process each issue
processed_issues = []
for issue in issues_data:
    category = categorize_issue(issue["title"], issue["body"])
    response = generate_response(category, issue["number"], issue["title"])
    
    processed_issues.append({
        "issue_number": issue["number"],
        "title": issue["title"],
        "category": category,
        "auto_response": response,
        "user": issue["user"]["login"],
        "created_at": issue["created_at"]
    })

return processed_issues
```

#### Node 3: POST Issue Comment
- **Endpoint**: `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`
- **Path Parameters**: 
  - `owner`: "facebook"
  - `repo`: "react"
  - `issue_number`: (dynamically set)
- **Headers**:
  - `Content-Type`: "application/json"
- **Body**: (dynamically set)
- **Input Mapping**:
  - `issue_number` ← Node 2 output `issue_number`
  - `body` ← Node 2 output `auto_response`

### Demonstration Points:
- Shows automated workflow creation
- Demonstrates conditional logic and categorization
- Illustrates how to generate dynamic content
- Creates practical automation use case

---

## Technical Notes for Demonstration

### Setup Requirements:
1. Ensure GitHub API access is configured
2. Have sample data ready for each scenario
3. Prepare fallback responses in case of API rate limits

### Key Features to Highlight:
- **Visual Node Configuration**: Show how easy it is to configure API endpoints
- **Data Flow Visualization**: Demonstrate the connection between nodes
- **Real-time Testing**: Test individual nodes during the demo
- **Code Generation**: Show the generated Python code for each workflow
- **Error Handling**: Demonstrate validation and error messages

### Expected Outcomes:
- Scenario 1: Repository analytics with key metrics
- Scenario 2: Comprehensive user activity analysis
- Scenario 3: Automated issue triage system

These scenarios showcase the tool's ability to create complex, multi-step API workflows with data processing, making it perfect for demonstrating the power and flexibility of the API Visualiser.
