import requests
import time

# ── Config ─────────────────────────────────────────────────────
EMAIL        = input("Enter your Cloudflare email: ").strip()
API_KEY      = input("Enter your Cloudflare Global API Key: ").strip()
DOMAIN       = "kiannookala.com"
PAGES_TARGET = "portfolio-i7r.pages.dev"
ACCOUNT_ID   = "c84745ea852bc71fc23d460ab4901f16"
ZONE_ID      = "050ddbee7408230632b8ff049353bdec"
PROJECT_NAME = "portfolio"

HEADERS = {
    "X-Auth-Email": EMAIL,
    "X-Auth-Key":   API_KEY,
    "Content-Type": "application/json",
}

def ok(res, label):
    if res.get("success"):
        print(f"  ✅ {label}")
    else:
        print(f"  ❌ {label}: {res.get('errors')}")

# ── Step 1: Add CNAME DNS record ────────────────────────────────
print("\n1. Adding CNAME DNS record...")
res = requests.post(
    f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns_records",
    headers=HEADERS,
    json={"type": "CNAME", "name": "@", "content": PAGES_TARGET, "ttl": 1, "proxied": True},
).json()

if not res.get("success"):
    err = res.get("errors", [{}])[0].get("message", "")
    if "already exists" in err.lower():
        print("  ℹ️  CNAME already exists — skipping")
    else:
        print(f"  ❌ Failed to add CNAME: {err}")
else:
    print("  ✅ CNAME record added")

# ── Step 2: Delete old pending domain (if any) ──────────────────
print("\n2. Cleaning up old domain config...")
del_res = requests.delete(
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/domains/kiannookala.com",
    headers=HEADERS,
).json()
if del_res.get("success"):
    print("  ✅ Removed old domain entry")
else:
    print("  ℹ️  Nothing to remove")

# ── Step 3: Add custom domain to Pages project ──────────────────
print("\n3. Connecting kiannookala.com to Pages project...")
res = requests.post(
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/domains",
    headers=HEADERS,
    json={"name": DOMAIN},
).json()
ok(res, "Custom domain added to Pages project")

# ── Step 4: Wait for activation ─────────────────────────────────
print("\n4. Waiting for domain to activate...")
for i in range(24):
    time.sleep(5)
    res = requests.get(
        f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/domains",
        headers=HEADERS,
    ).json()
    domains = res.get("result", [])
    match = next((d for d in domains if d["name"] == DOMAIN), None)
    status = match["status"] if match else "not found"
    print(f"  Status: {status} ({(i+1)*5}s)")
    if status == "active":
        break

print()
if status == "active":
    print("🎉 Done! kiannookala.com is now live with your latest changes.")
else:
    print("⚠️  Domain not active yet — may need a few more minutes.")
    print("    Check dash.cloudflare.com → Workers & Pages → portfolio → Custom domains")
