import unittest
from unittest.mock import patch, MagicMock
from app.services.fact_checker import FactChecker

class TestFactChecker(unittest.TestCase):
    def setUp(self):
        self.checker = FactChecker()
        self.checker.api_key = "dummy_key"

    def test_similarity_match(self):
        # A clearer match case
        query = "Modi free bike scheme 2025"
        claim_text = "PM Modi did not announce a free bike scheme for Chhath Puja 2025"
        similarity = self.checker.calculate_similarity(query, claim_text)
        print(f"Match Similarity: {similarity}")
        # Tokens: {modi, free, bike, scheme, 2025} (5)
        # Claim Tokens: {pm, modi, did, not, announce, free, bike, scheme, chhath, puja, 2025} (11)
        # Intersection: {modi, free, bike, scheme, 2025} (5)
        # Union: 11
        # Sim: 5/11 = 0.45 -> Should pass comfortably
        self.assertGreater(similarity, 0.2)

    def test_similarity_mismatch(self):
        # The user's specific failure case
        query = "Narendra modi is the prime minister of India in 2025"
        claim_text = "PM Modi did not announce a free bike scheme for Chhath Puja 2025"
        similarity = self.checker.calculate_similarity(query, claim_text)
        print(f"Mismatch Similarity: {similarity}")
        # Query Tokens: {narendra, modi, prime, minister, india, 2025} (6)
        # Claim Tokens: {pm, modi, did, not, announce, free, bike, scheme, chhath, puja, 2025} (11)
        # Intersection: {modi, 2025} (2)
        # Union: 6 + 11 - 2 = 15
        # Sim: 2/15 = 0.133 -> Should fail (be ignored)
        self.assertLess(similarity, 0.2)
        
    @patch('requests.get')
    def test_verify_claim_rejects_irrelevant(self, mock_get):
        # Simulate API response with an irrelevant claim
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "claims": [
                {
                    "text": "PM Modi did not announce a free bike scheme for Chhath Puja 2025",
                    "claimReview": [{
                        "publisher": {"name": "Factly"},
                        "textualRating": "False",
                        "url": "http://example.com"
                    }]
                }
            ]
        }
        mock_get.return_value = mock_response

        query = "Narendra modi is the prime minister of India in 2025"
        result = self.checker.verify_claim(query)
        self.assertIsNone(result, "Should return None for irrelevant fact check")

if __name__ == '__main__':
    unittest.main()
