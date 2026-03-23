import requests
import base64

def get_access_token(sandbox=True):
    consumer_key = "testapi"
    consumer_secret = "Safaricom123!!"
    
    base_url = "https://sandbox.safaricom.co.ke" if sandbox else "https://api.safaricom.co.ke"
    api_url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"
    
    auth_str = f"{consumer_key}:{consumer_secret}"
    encoded_auth = base64.b64encode(auth_str.encode()).decode()
    
    headers = {"Authorization": f"Basic {encoded_auth}"}
    try:
        response = requests.get(api_url, headers=headers)
        print(f"Testing {'Sandbox' if sandbox else 'Production'} URL: {api_url}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        if response.status_code == 200:
            return response.json().get("access_token")
    except Exception as e:
        print(f"Error: {e}")
    return None

print("Checking Sandbox...")
token = get_access_token(sandbox=True)
if token:
    print("Sandbox Token successful!")
else:
    print("Sandbox Token failed.")

print("\nChecking Production...")
token = get_access_token(sandbox=False)
if token:
    print("Production Token successful!")
else:
    print("Production Token failed.")
