import urllib.request, urllib.parse, json

BASE_URL = "http://localhost:8000"

def test():
    print("Logging in...")
    data = urllib.parse.urlencode({"username": "demo@ciagent.com", "password": "demo123!"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, method="POST", headers={"Content-Type": "application/x-www-form-urlencoded"})
    
    try:
        with urllib.request.urlopen(req) as res:
            resp_data = json.loads(res.read().decode())
            token = resp_data["access_token"]
            print("Logged in, token:", token[:10]+"...")
    except urllib.error.HTTPError as e:
        print("Login failed! Auto-registering...")
        reg_payload = json.dumps({"email": "demo@ciagent.com", "password":"demo123!", "name":"Demo"}).encode()
        req_reg = urllib.request.Request(f"{BASE_URL}/auth/register", data=reg_payload, method="POST", headers={"Content-Type":"application/json"})
        with urllib.request.urlopen(req_reg) as res:
            token = json.loads(res.read().decode())["access_token"]

    print("Adding a competitor...")
    comp_payload = json.dumps({"name": "OpenAI", "url": "https://openai.com", "sections": ["pricing"]}).encode()
    req_comp = urllib.request.Request(f"{BASE_URL}/competitors/", data=comp_payload, method="POST", headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req_comp) as res_comp:
            print("Competitor added.")
    except Exception as e:
        print("Competitor might already exist.", e)

    print("Generating report...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = json.dumps({"template": "market_deep_dive", "competitor_ids": [], "sections": []}).encode()
    
    req2 = urllib.request.Request(f"{BASE_URL}/reports/generate", data=payload, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req2) as res2:
            print("Status:", res2.status)
            print(json.loads(res2.read().decode()))
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code)
        print("Raw error:", e.read().decode())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test()
