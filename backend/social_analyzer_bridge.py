#!/usr/bin/env python3
"""Bridge: run QeeqBox social-analyzer for a username and emit JSON on stdout.

social-analyzer detects profiles across many sites and attaches a confidence
"rate" and a website category ("type") to each — higher precision than a plain
existence check. We use its Python API (run_as_object) and dump the detected
list as JSON.

Usage: social_analyzer_bridge.py <username> [top] [timeout_seconds]
"""
import sys
import json
from importlib import import_module


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "username argument required"}))
        sys.exit(1)
    username = sys.argv[1]
    top = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    timeout = int(sys.argv[3]) if len(sys.argv) > 3 else 10

    try:
        SA = import_module("social-analyzer").SocialAnalyzer()
        res = SA.run_as_object(
            username=username,
            silent=True,
            output="json",
            filter="good",          # keep high-confidence detections
            metadata=False,
            timeout=timeout,
            profiles="detected",
            top=top,
            method="find",
        )
        print(json.dumps(res.get("detected", [])))
    except Exception as e:  # noqa: BLE001
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
