from dotenv import load_dotenv
import os
import json
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL_NAME = "gpt-4.1-mini"  # Use the appropriate model for your needs


PROMPT_TEMPLATE = """
You are a secure code auditing assistant. Analyze the following API code for security vulnerabilities.

Code to analyze:
\"\"\"{code}\"\"\"

IMPORTANT: Be extremely precise with line numbers. Count lines starting from 1 (not 0), gaps inbetween lines count as line numbers.
If you're mentioning line X, verify that it's actually the Xth line in the provided code.

Respond with **only** the JSON array format:
[
  {{
    "issue": "Concise description of the security flaw.",
    "line": <line_number>,
    "severity": "moderate" | "high" | "critical",
    "recommendation": "How to fix the issue."
  }}
]

Field definitions:
- issue: Briefly describe the flaw (max 2 sentences).
- line: Line number where the issue occurs.
- severity: One of "moderate", "high", or "critical".
- recommendation: How to fix the issue (max 3 sentences).

If multiple issues are found, return a longer JSON array. One object per issue. Do not group or merge them. Each issue must be its own object in the array. The array of issues should be sorted in the order of occureance. 

Example output:
[
  {{
    "issue": "Hardcoded API key exposes sensitive information.",
    "line": 3,
    "severity": "critical",
    "recommendation": "Store API keys in environment variables and load them securely at runtime."
  }},
  {{
    "issue": "No error handling for API request failures.",
    "line": 7,
    "severity": "moderate",
    "recommendation": "Check the response status and handle possible exceptions to prevent crashes."
  }}
]

Strictly return only the JSON array. No quotes, no markdown, no text outside the array.
"""


def add_line_numbers(code: str) -> str:
    """Add line numbers to code for better AI analysis."""
    lines = code.split('\n')
    numbered_code = '\n'.join(f"{i+1}: {line}" for i, line in enumerate(lines))
    return numbered_code


def run_security_scan(code: str) -> str:
    # Store original code for line number verification later
    original_code = code
    
    # Add line numbers to the code for AI analysis
    numbered_code = add_line_numbers(code)
    
    prompt = PROMPT_TEMPLATE.format(code=numbered_code)
    print("Code received for security scan:")
    print(numbered_code)  # temp. logging
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=1500,
        )

        if not response.choices or not response.choices[0].message.content:
            print("[ERROR] Empty response from OpenAI")
            return [{
                "issue": "Empty response received from AI service.",
                "line": 0,
                "severity": "critical",
                "recommendation": "Please try running the Security Scan again."
            }]
        
        result = response.choices[0].message.content
        
        # Parse JSON to ensure it's valid
        try:
            result = result.strip()
            if result.startswith("```json"):
                result = result[7:]
            elif result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]

            result = result.strip()
            parsed = json.loads(result)

            # temp. logging
            print("[INFO] OpenAI scan completed successfully.")
            
            return parsed
        except json.JSONDecodeError as e:
            # If parsing fails, return the raw result
            print("[WARN] Failed to parse OpenAI response as JSON. Returning error JSON instead.")
            print(f"[DEBUG] Parse error: {e}")

            return [
              {
                "issue": f"Backend error response: {e}",
                "line": 0,
                "severity": "critical",
                "recommendation": "Please try running the Security Scan again.",
              },
            ]
            
    except Exception as e:
        # temp. logging
        print(f"[ERROR] OpenAI API call failed: {str(e)}")
        
        return [{
            "issue": f"AI service error: {str(e)}",
            "line": 0,
            "severity": "critical",
            "recommendation": "Please check your internet connection and try running the Security Scan again."
        }]