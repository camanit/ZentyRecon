#!/usr/bin/env python3
# ============================================================
# ZentyRecon — Native Messaging Host for ZentyQuetry Desktop
# Bridges Chrome MV3 extension with ZentyQuetry Sovereign Desktop (port 9527)
# ============================================================

import sys
import json
import struct
import urllib.request
import urllib.error
import os

DESKTOP_API_URL = "http://127.0.0.1:9527"
LICENSE_SERVER_URL = "http://127.0.0.1:9528"

def read_message():
    """Read a 32-bit length-prefixed message from stdin."""
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length or len(raw_length) < 4:
        return None
    message_length = struct.unpack('<I', raw_length)[0]
    raw_message = sys.stdin.buffer.read(message_length)
    if not raw_message:
        return None
    return json.loads(raw_message.decode('utf-8'))

def send_message(response):
    """Write a 32-bit length-prefixed message to stdout."""
    encoded = json.dumps(response).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('<I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()

def handle_message(msg):
    action = msg.get("action", "")

    if action == "PING":
        return {
            "status": "connected",
            "host": "ZentyQuetry Native Messaging Bridge",
            "version": "1.0.0",
            "desktopPort": 9527,
            "licensePort": 9528
        }

    elif action == "CHECK_DESKTOP_STATUS":
        try:
            req = urllib.request.Request(f"{DESKTOP_API_URL}/api/status", method='GET')
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return {"desktopOnline": True, "data": data}
        except Exception as e:
            return {"desktopOnline": False, "error": str(e), "message": "ZentyQuetry Desktop is not running on 127.0.0.1:9527"}

    elif action == "FORWARD_CBOM":
        cbom = msg.get("cbom", {})
        try:
            req = urllib.request.Request(
                f"{DESKTOP_API_URL}/api/cbom",
                data=json.dumps(cbom).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return {"success": True, "response": data}
        except Exception as e:
            # Fallback: Save to local user desktop directory
            fallback_dir = os.path.expanduser("~/Documents/ZentyQuetry/cbom_inbox")
            os.makedirs(fallback_dir, exist_ok=True)
            filename = f"cbom_{msg.get('domain', 'target')}.json"
            filepath = os.path.join(fallback_dir, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(cbom, f, indent=2)
            return {"success": True, "savedLocal": True, "path": filepath}

    elif action == "READ_LOCAL_LICENSE":
        lic_path = os.path.expanduser("~/Documents/ZentyQuetry/license.lic")
        if os.path.exists(lic_path):
            with open(lic_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {"hasLicense": True, "licenseText": content}
        return {"hasLicense": False, "message": "No local license found in ~/Documents/ZentyQuetry"}

    else:
        return {"error": f"Unknown action: {action}"}

def main():
    while True:
        try:
            message = read_message()
            if message is None:
                break
            response = handle_message(message)
            send_message(response)
        except Exception as e:
            send_message({"error": str(e)})

if __name__ == "__main__":
    main()
