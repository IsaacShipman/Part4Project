import sqlite3

def print_github_api_docs(db_path, limit=10):
    """Print a limited number of records from the github_api_docs table."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT method, path, summary, documentation
            FROM github_api_docs
            ORDER BY created_at DESC
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        print(f"Showing {len(rows)} GitHub API endpoints:\n")
        for i, (method, path, summary, documentation) in enumerate(rows, start=1):
            print(f"{i}. [{method}] {path}")
            print(f"   Summary: {summary or 'No summary available'}\n")
            print(f"   Documentation: {documentation or 'No documentation available'}\n")
        
        conn.close()
    except sqlite3.Error as e:
        print("Database error:", e)

# Example usage
if __name__ == "__main__":
    print_github_api_docs("github_api_docs.db")
