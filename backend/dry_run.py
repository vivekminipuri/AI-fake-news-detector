import sys
import os

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Attempting to import app.main...")
try:
    from app.main import app
    print("SUCCESS: app.main imported successfully.")
except Exception as e:
    print(f"CRASH: {e}")
    import traceback
    traceback.print_exc()
