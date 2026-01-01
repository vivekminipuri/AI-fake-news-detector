import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_mongo():
    try:
        print("Attempting to connect to MongoDB...")
        client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
        # Force a connection
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB!")
    except Exception as e:
        print(f"FAILURE: Could not connect to MongoDB. {e}")

if __name__ == "__main__":
    asyncio.run(test_mongo())
