from deep_translator import GoogleTranslator

class TranslatorService:
    def translate_text(self, text: str, source: str, target: str) -> str:
        """
        Translates text using Google Translator.
        Source can be 'auto'.
        """
        try:
            translator = GoogleTranslator(source=source, target=target)
            return translator.translate(text)
        except Exception as e:
            print(f"Translation Error: {e}")
            return f"Error: {str(e)}"

translator_service = TranslatorService()
