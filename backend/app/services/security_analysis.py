from dotenv import load_dotenv
import os
import json
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL_NAME = "gpt-4.1-nano"

PROMPT_TEMPLATE = """
Analyze the following API code for security flaws. Identify all potential vulnerabilities. Your goal is to ensure the code is fully secure. Be thorough.

Code:
"{code}"

You may only respond using the following JSON format (shown for a single issue; multiple issues should be returned in an array):

[
  {{
    "issue": "Concise description of the security flaw.",
    "line": <line_number>,
    "severity": "moderate" | "high" | "critical",
    "recommendation": "How to fix the issue."
  }}
]

Field definitions:
issue: Briefly describe the flaw (1 to 2 sentences max).
line: Line number where the issue occurs (integer).
severity: One of "moderate", "high", or "critical".
recommendation: Clear, concise fix (1 to 3 sentences).

Remember: Output only the JSON array. No extra commentary is required.
"""

def run_security_scan(code: str) -> str:
    prompt = PROMPT_TEMPLATE.format(code=code)

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=1500,
        )
        
        result = response.choices[0].message.content

        # temp. logging
        print(f"Raw OpenAI response: {result}")
        
        # Parse the JSON to ensure it's valid
        try:
            # Remove any markdown formatting
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            
            # Parse to validate JSON
            parsed = json.loads(result.strip())

            # temp. logging
            print("[INFO] OpenAI scan completed successfully.")
            
            # Return the parsed JSON as a string
            return json.dumps(parsed)
        except json.JSONDecodeError:
            # If parsing fails, return the raw result
            print("[WARN] Failed to parse OpenAI response as JSON. Returning raw string.")
            return result
            
    except Exception as e:
        # temp. logging
        print(f"[ERROR] OpenAI API call failed: {str(e)}")
        
        raise