#!/usr/bin/env python3
"""Bridge: run Holehe for a single email and emit the results as JSON on stdout.

Holehe's CLI only writes CSV/colored text, so we use it as a library instead:
load every site module, run them concurrently, and dump the structured dicts
(each already has name/domain/exists/emailrecovery/phoneNumber/rateLimit).

Usage: holehe_bridge.py <email> [timeout_seconds]
"""
import sys
import json
import trio
import httpx

from holehe.core import import_submodules, get_functions, launch_module


async def run(email, timeout):
    modules = import_submodules("holehe.modules")
    websites = get_functions(modules)
    out = []
    client = httpx.AsyncClient(timeout=timeout)
    try:
        async with trio.open_nursery() as nursery:
            for website in websites:
                nursery.start_soon(launch_module, website, email, client, out)
    finally:
        await client.aclose()
    out = sorted(out, key=lambda i: i["name"])
    return out


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "email argument required"}))
        sys.exit(1)
    email = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    try:
        results = trio.run(run, email, timeout)
        print(json.dumps(results))
    except Exception as e:  # noqa: BLE001 - surface any failure as JSON
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
