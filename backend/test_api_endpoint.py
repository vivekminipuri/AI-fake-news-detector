import requests
import json

url = "http://127.0.0.1:8000/api/v1/analyze"
headers = {"Content-Type": "application/json"}
payload = {
    "text": "Narendra Modi is the Prime Minister of India.",
    "url": ""
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    data = response.json()
    print("Sentiment Analysis Data:")
    print(json.dumps(data.get("sentiment_analysis", "MISSING"), indent=2))
except Exception as e:
    print(f"Request failed: {e}")
