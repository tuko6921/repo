#!/usr/bin/env python3
"""Extract CPU, memory, and connection/network data from Zabbix as JSON.

Usage:
    ZABBIX_URL=http://localhost:8087 ZABBIX_TOKEN=<token> ./zabbix_extract.py [hostname]
    ./zabbix_extract.py --host gambit-solid-state-tapbox
"""

import argparse
import json
import os
import sys

import requests

URL = os.getenv("ZABBIX_URL", "http://localhost:8087")
TOKEN = os.getenv("ZABBIX_TOKEN", "")

_TOKEN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".zbx_token")
if not TOKEN and os.path.isfile(_TOKEN_FILE):
    with open(_TOKEN_FILE) as f:
        TOKEN = f.read().strip()
API = f"{URL.rstrip('/')}/api_jsonrpc.php"

# Categorize items by key pattern; anything matching is captured
CATEGORY_PATTERNS = {
    "cpu": ["system.cpu.", "percpu.cpu."],
    "memory": ["vm.memory.", "vm.pages."],
    "conn": [
        "net.tcp.",
        "net.udp.",
        "net.socket.",
        "net.listen.",
        "system.uptime",
    ],
}


def rpc(method, params):
    body = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TOKEN}",
    }
    resp = requests.post(API, json=body, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise RuntimeError(f"Zabbix error: {data['error']}")
    return data.get("result")


def get_hosts(hostname=None):
    params = {"output": ["hostid", "host", "name"]}
    if hostname:
        params["filter"] = {"host": [hostname]}
    return rpc("host.get", params)


def get_items(hostid):
    return rpc(
        "item.get",
        {
            "output": ["itemid", "name", "key_", "lastvalue", "lastclock", "units", "value_type"],
            "hostids": [hostid],
        },
    )


def matches(key, patterns):
    return any(key.startswith(p) for p in patterns)


def extract(host, items):
    result = {"host": host["host"], "name": host.get("name", ""), "categories": {}}

    for category, patterns in CATEGORY_PATTERNS.items():
        result["categories"][category] = {}
        for it in items:
            k = it.get("key_", "")
            if not matches(k, patterns):
                continue
            result["categories"][category][k] = {
                "itemid": it["itemid"],
                "name": it["name"],
                "value": it.get("lastvalue"),
                "clock": it.get("lastclock"),
                "units": it.get("units", ""),
                "value_type": it["value_type"],
            }

    # Network interface traffic (discovered per-interface)
    ifaces = {}
    for it in items:
        k = it.get("key_", "")
        if not (k.startswith("net.if.in[") or k.startswith("net.if.out[")):
            continue
        inner = k.split("[", 1)[1].rsplit("]", 1)[0]
        parts = [p.strip('"') for p in inner.split(",")]
        iface, params = parts[0], parts[1:]
        if params:  # skip dropped/errors variants
            continue
        direction = "in" if k.startswith("net.if.in[") else "out"
        ifaces.setdefault(iface, {})[direction] = {
            "itemid": it["itemid"],
            "name": it["name"],
            "value": it.get("lastvalue"),
            "clock": it.get("lastclock"),
            "units": it.get("units", ""),
        }
    if ifaces:
        result["categories"]["network"] = ifaces

    return result


def main():
    parser = argparse.ArgumentParser(description="Zabbix CPU/mem/conn extractor")
    parser.add_argument("host", nargs="?", help="Host technical name (defaults to all hosts)")
    args = parser.parse_args()

    if not TOKEN:
        sys.exit("Set ZABBIX_TOKEN env var")

    hosts = get_hosts(args.host)
    if not hosts:
        sys.exit(f"No hosts found matching '{args.host}'")

    output = [extract(h, get_items(h["hostid"])) for h in hosts]
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()