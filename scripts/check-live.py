"""Check that a reachable site's HTML matches its published release manifest."""
import hashlib
import json
import os
import sys
import time
from urllib.parse import urlsplit
from urllib.request import urlopen

expected_app = sys.argv[1] if len(sys.argv) == 2 else "screenshot-cleaner"
origin = os.environ["LIVE_URL"].rstrip("/")
url = urlsplit(origin)
if url.scheme != "https" or not url.hostname or url.username or url.query or url.fragment:
    raise SystemExit("LIVE_URL must be an HTTPS site URL without credentials or a query.")

def fetch(path):
    with urlopen(origin + path, timeout=15) as response:
        return response.read(1_000_000)

for attempt in range(2):
    try:
        release = json.loads(fetch("/release.json"))
        actual = hashlib.sha256(fetch("/")).hexdigest()
        if release.get("app") != expected_app or actual != release.get("sha256"):
            raise ValueError("Published HTML does not match the release manifest")
        print("Live release verified:", actual)
        break
    except (OSError, ValueError) as error:
        if attempt:
            raise SystemExit(f"Health check failed: {error}") from error
        time.sleep(5)
