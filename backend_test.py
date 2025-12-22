#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class WrestlingAPITester:
    def __init__(self, base_url="https://grappling-guru.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
            if expected_status and actual_status:
                print(f"   Expected status: {expected_status}, Got: {actual_status}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def test_api_endpoint(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Test a single API endpoint"""
        url = f"{self.base_url}/{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                self.log_result(name, False, f"Unsupported method: {method}")
                return None

            success = response.status_code == expected_status
            details = ""
            if not success:
                try:
                    error_data = response.json()
                    details = error_data.get('detail', 'Unknown error')
                except:
                    details = response.text[:200] if response.text else "No response body"

            self.log_result(name, success, details, expected_status, response.status_code)
            
            if success:
                try:
                    return response.json()
                except:
                    return response.text
            return None

        except Exception as e:
            self.log_result(name, False, f"Request failed: {str(e)}")
            return None

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.test_api_endpoint("Root API", "GET", "", 200)

    def test_plans_endpoint(self):
        """Test subscription plans endpoint"""
        return self.test_api_endpoint("Get Plans", "GET", "plans", 200)

    def test_videos_endpoint(self):
        """Test videos endpoint (public access)"""
        return self.test_api_endpoint("Get Videos (Public)", "GET", "videos", 200)

    def test_categories_endpoint(self):
        """Test categories endpoint"""
        return self.test_api_endpoint("Get Categories", "GET", "categories", 200)

    def test_auth_me_unauthorized(self):
        """Test auth/me endpoint without authentication (should fail)"""
        return self.test_api_endpoint("Auth Me (Unauthorized)", "GET", "auth/me", 401)

    def test_video_creation_unauthorized(self):
        """Test video creation without admin auth (should fail)"""
        video_data = {
            "title": "Test Video",
            "description": "Test Description",
            "category": "Test",
            "video_url": "https://youtube.com/embed/test",
            "is_premium": False
        }
        return self.test_api_endpoint("Create Video (Unauthorized)", "POST", "videos", 403, video_data)

    def test_payment_creation_unauthorized(self):
        """Test payment creation without auth (should fail)"""
        payment_data = {
            "plan": "monthly",
            "origin_url": "https://example.com"
        }
        return self.test_api_endpoint("Create Payment (Unauthorized)", "POST", "payments/create-checkout", 401, payment_data)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Wrestling API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Test public endpoints
        print("\n📋 Testing Public Endpoints:")
        self.test_root_endpoint()
        self.test_plans_endpoint()
        self.test_videos_endpoint()
        self.test_categories_endpoint()

        # Test protected endpoints (should fail without auth)
        print("\n🔒 Testing Protected Endpoints (Should Fail):")
        self.test_auth_me_unauthorized()
        self.test_video_creation_unauthorized()
        self.test_payment_creation_unauthorized()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

    def get_detailed_results(self):
        """Get detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "results": self.results
        }

def main():
    tester = WrestlingAPITester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results
    results = tester.get_detailed_results()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    return exit_code

if __name__ == "__main__":
    sys.exit(main())