import sys
import os

# Ensure we can import from local directories (ai-engine folder)
# We add the current directory (ai-engine) to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from pipelines.detector import detect_fake_news

def test_engine():
    print("--- Testing AI Engine ---")
    
    samples = [
        {
            "type": "Real News (Expected)",
            "text": "NASA launched a new satellite today to monitor global sea levels. The mission is part of an international cooperation to track climate change effects.",
            "url": "https://nasa.gov"
        },
        {
            "type": "Fake/Clickbait (Expected)",
            "text": "YOU WON'T BELIEVE WHAT THEY HID! The secret government potion that cures all diseases instantly! Doctors hate this simple trick!!",
            "url": "https://shady-site.net"
        }
    ]
    
    for sample in samples:
        print(f"\nTesting: {sample['type']}")
        print(f"Input: {sample['text'][:60]}...")
        try:
            result = detect_fake_news(sample["text"], sample["url"])
            print("Result:")
            print(f"  Verdict: {result['verdict']}")
            print(f"  Score: {result['credibility_score']}")
            print(f"  Flags: {result['red_flags']}")
        except Exception as e:
            print(f"  Error: {e}")
            
if __name__ == "__main__":
    test_engine()
