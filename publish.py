import subprocess
import requests
import time
import sys
import os

# ── Config ─────────────────────────────────────────────────────
DOMAIN       = "kiannookala.com"
PAGES_TARGET = "portfolio-i7r.pages.dev"
ACCOUNT_ID   = "c84745ea852bc71fc23d460ab4901f16"
ZONE_ID      = "050ddbee7408230632b8ff049353bdec"
PROJECT_NAME = "portfolio"
PROJECT_DIR  = os.path.dirname(os.path.abspath(__file__))

print("=" * 50)
print("  📚 A+ Mathematics — Publish Script")
print("=" * 50)

EMAIL   = input("\nCloudflare email: ").strip()
API_KEY = input("Cloudflare Global API Key: ").strip()

HEADERS = {
    "X-Auth-Email": EMAIL,
    "X-Auth-Key":   API_KEY,
    "Content-Type": "application/json",
}

# ── Step 1: Build ───────────────────────────────────────────────
print("\n[1/4] Building site...")
result = subprocess.run(["npm", "run", "build"], cwd=PROJECT_DIR)
if result.returncode != 0:
    print("❌ Build failed. Fix errors above and try again.")
    sys.exit(1)
print("✅ Build complete")

# ── Step 2: Deploy to Cloudflare Pages ─────────────────────────
print("\n[2/4] Deploying to Cloudflare Pages...")
result = subprocess.run(
    ["wrangler", "pages", "deploy", "dist", "--project-name", PROJECT_NAME],
    cwd=PROJECT_DIR
)
if result.returncode != 0:
    print("❌ Deploy failed.")
    sys.exit(1)
print("✅ Deployed to Cloudflare Pages")

# ── Step 3: Add/update DNS CNAME record ────────────────────────
print(f"\n[3/4] Connecting {DOMAIN} DNS...")

# Check if CNAME already exists
existing = requests.get(
    f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns_records?type=CNAME&name={DOMAIN}",
    headers=HEADERS,
).json().get("result", [])

if existing:
    # Update existing record
    record_id = existing[0]["id"]
    res = requests.put(
        f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns_records/{record_id}",
        headers=HEADERS,
        json={"type": "CNAME", "name": "@", "content": PAGES_TARGET, "ttl": 1, "proxied": True},
    ).json()
    print("✅ CNAME record updated" if res.get("success") else f"❌ CNAME update failed: {res.get('errors')}")
else:
    # Create new record
    res = requests.post(
        f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns_records",
        headers=HEADERS,
        json={"type": "CNAME", "name": "@", "content": PAGES_TARGET, "ttl": 1, "proxied": True},
    ).json()
    print("✅ CNAME record added" if res.get("success") else f"❌ CNAME add failed: {res.get('errors')}")

# ── Step 4: Connect custom domain to Pages project ─────────────
print(f"\n[4/4] Linking {DOMAIN} to Pages project...")

# Remove old pending entry if exists
requests.delete(
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/domains/{DOMAIN}",
    headers=HEADERS,
)

# Add fresh
res = requests.post(
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/domains",
    headers=HEADERS,
    json={"name": DOMAIN},
).json()

if res.get("success"):
    print(f"✅ {DOMAIN} linked to Pages project")
else:
    print(f"⚠️  {res.get('errors')} (may already be linked)")

# ── Wait for activation ─────────────────────────────────────────
print(f"\n⏳ Waiting for {DOMAIN} to go live", end="", flush=True)
for i in range(30):
    time.sleep(5)
    print(".", end="", flush=True)
    res = requests.get(
        f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/domains",
        headers=HEADERS,
    ).json()
    domains = res.get("result", [])
    match = next((d for d in domains if d["name"] == DOMAIN), None)
    if match and match.get("status") == "active":
        print()
        break

print()
print("=" * 50)
if match and match.get("status") == "active":
    print(f"🎉 Done! Your site is live at https://{DOMAIN}")
else:
    print(f"⚠️  Still activating — check in a few minutes at https://{DOMAIN}")
    print("   If it's stuck, go to: dash.cloudflare.com → Workers & Pages → portfolio → Custom domains")
print("=" * 50)
