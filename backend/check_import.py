try:
    from deep_translator import GoogleTranslator
    print("SUCCESS: deep_translator is installed.")
except ImportError as e:
    print(f"FAILURE: {e}")
