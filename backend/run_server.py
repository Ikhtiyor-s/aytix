"""
Direct server runner to ensure all routes are loaded
"""
import uvicorn
from app.main import app

# Print registered routes for debugging
print("\n=== Registered Routes ===")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"{list(route.methods)[0] if route.methods else 'GET':6s} {route.path}")
print("========================\n")

# Check if projects routes are loaded
project_routes = [r for r in app.routes if hasattr(r, 'path') and 'project' in r.path.lower()]
print(f"Found {len(project_routes)} project routes")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
