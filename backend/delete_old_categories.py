"""
Delete old duplicate categories (IDs 1-7)
"""
import requests
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000/api/v1"

# Login
login_data = {
    "email": "901009300@temp.uz",
    "password": "123456"
}

print("Logging in...")
response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if response.status_code == 200:
    token_data = response.json()
    access_token = token_data["access_token"]
    print("✓ Logged in successfully\n")
else:
    print(f"✗ Login failed: {response.text}")
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {access_token}"
}

# Delete old categories (1-7)
print("Deleting old duplicate categories...")
for cat_id in range(1, 8):
    response = requests.delete(f"{BASE_URL}/project-categories/{cat_id}", headers=headers)
    if response.status_code == 204:
        print(f"  ✓ Deleted category ID {cat_id}")
    elif response.status_code == 404:
        print(f"  - Category ID {cat_id} not found (already deleted)")
    else:
        print(f"  ✗ Failed to delete category {cat_id}: {response.status_code} - {response.text}")

print("\n✓ Cleanup complete!")
