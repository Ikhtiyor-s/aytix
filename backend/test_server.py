"""
Test server to debug routing issues
"""
import sys
import os
import io

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Print debug info
print("=" * 60)
print(f"Python: {sys.version}")
print(f"CWD: {os.getcwd()}")
print(f"Script: {__file__}")
print("=" * 60)

# Import the app
print("\nImporting app.main...")
from app.main import app

# Check routes
print(f"\nTotal routes in app: {len(app.routes)}")
project_routes = []
for route in app.routes:
    if hasattr(route, 'path'):
        if 'project' in route.path.lower():
            project_routes.append(route)
            methods = list(route.methods) if hasattr(route, 'methods') and route.methods else ['N/A']
            print(f"  ✓ {methods[0]:7s} {route.path}")

print(f"\nTotal project routes: {len(project_routes)}")

if len(project_routes) == 0:
    print("\n❌ NO PROJECT ROUTES FOUND!")
    print("This indicates the projects router was not included.")
else:
    print(f"\n✓ Found {len(project_routes)} project routes")

# Now start the server
print("\nStarting uvicorn server...")
print("=" * 60)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
