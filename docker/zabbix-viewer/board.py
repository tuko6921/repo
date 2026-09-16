"""Map Zabbix extracted data to a Xymon-style status board.

Produces a board structure: hosts as rows, tests as columns, each cell a
Xymon status color (green/yellow/red/clear/purple/blue/unknown). The host's
overall color (shown as the left-hand bar) is the worst (highest-priority)
color among its tests, per Xymon semantics.

Xymon color priority (worst -> best): red > yellow > purple > clear > blue > green.
"""

import time

COLOR_PRIORITY = {"red": 6, "yellow": 5, "purple": 4, "clear": 3, "blue": 2, "green": 1, "unknown": 0}

CPU_WARN = 80.0
CPU_CRIT = 95.0
MEM_WARN = 80.0
MEM_CRIT = 95.0

# A host/test that has not reported within this window is "stale" -> purple.
STALE_AFTER = 1800  # 30 minutes

GIF_EXT = "gif"


def color_gif(color):
    return f"{color}.{GIF_EXT}"


def worst_color(colors):
    best = "green"
    for c in colors:
        if COLOR_PRIORITY.get(c, 0) > COLOR_PRIORITY.get(best, 0):
            best = c
    return best


def metric_color(value, warn, crit):
    try:
        v = float(value)
    except (TypeError, ValueError):
        return "clear"
    if v >= crit:
        return "red"
    if v >= warn:
        return "yellow"
    return "green"


def conn_color(value):
    if value is None or value == "":
        return "clear"
    if str(value) == "1":
        return "green"
    return "red"


def test_color(kind, value, clock, now=None):
    """Return (color, value_text) for a normalized test cell.

    Missing/empty value -> clear (test defined but nothing to evaluate yet).
    Old clock -> purple (stale: host stopped reporting).
    """
    now = now or time.time()
    if clock is None or clock == "" or clock == "0":
        return "purple", ""
    try:
        ago = now - int(clock)
    except (TypeError, ValueError):
        return "purple", ""
    if ago > STALE_AFTER:
        return "purple", ""
    if value is None or value == "":
        return "clear", ""

    if kind == "conn":
        color = conn_color(value)
    elif kind == "cpu":
        color = metric_color(value, CPU_WARN, CPU_CRIT)
    elif kind == "memory":
        color = metric_color(value, MEM_WARN, MEM_CRIT)
    elif kind == "net":
        color = "green"
    else:
        color = "unknown"
    return color, str(value)


def conn_label(item):
    name = item.get("name", "")
    label = name.lower().replace(" availability", "").strip()
    return label or "conn"


def first_memory_item(cats):
    mem = cats.get("memory", {})
    for key in ("vm.memory.util", "vm.memory.util["):
        for k in mem:
            if k.startswith("vm.memory.util"):
                return mem[k]
    for k in ("vm.memory.size[available]", "vm.memory.size[used]"):
        if k in mem:
            return mem[k]
    return None


def build_board(hosts_data):
    """Turn the /api/data shape into a board dict.

    hosts_data: list of {name, categories: {cpu, memory, conn, network}}
    A cell is present only when the host actually has that test; hosts lacking
    a test get "-" and it is not counted toward their overall color.
    """
    now = time.time()
    tests = []          # ordered list of {id, label, kind}
    known = set()

    def add_test(tid, label, kind):
        if tid not in known:
            known.add(tid)
            tests.append({"id": tid, "label": label, "kind": kind})

    for host in hosts_data:
        cats = host.get("categories", {})
        add_test("cpu", "cpu", "cpu")
        add_test("memory", "memory", "memory")
        for it in cats.get("conn", {}).values():
            if it.get("name", "").lower() == "system uptime":
                continue
            add_test("conn-" + conn_label(it), conn_label(it), "conn")
        for iface in sorted(cats.get("network", {}).keys()):
            add_test("net-" + iface, iface, "net")

    rows = []
    for host in hosts_data:
        cats = host.get("categories", {})
        cells = {}
        counted = []

        for t in tests:
            tid, kind = t["id"], t["kind"]
            item = None
            if kind == "cpu":
                item = cats.get("cpu", {}).get("system.cpu.util")
            elif kind == "memory":
                item = first_memory_item(cats)
            elif kind == "conn":
                pill = tid[len("conn-"):]
                item = next(
                    (i for i in cats.get("conn", {}).values()
                     if conn_label(i) == pill), None)
            elif kind == "net":
                iface = tid[len("net-"):]
                idata = cats.get("network", {}).get(iface)
                if idata:
                    val = idata.get("in", {}).get("value", "")
                    clock = idata.get("in", {}).get("clock") or idata.get("out", {}).get("clock")
                    color, text = test_color("net", val, clock, now)
                    tooltip = f"{tid} {color} {fmt_clock(now, text)}"
                    cells[tid] = {"color": color, "gif": color_gif(color), "tooltip": tooltip}
                    counted.append(color)
                continue
            else:
                continue

            if not item:
                # Host has no such test -> not monitored for this column.
                continue
            color, text = test_color(kind, item.get("value"), item.get("clock"), now)
            tooltip = f"{tid} {color} {fmt_clock(now, text)}"
            cells[tid] = {"color": color, "gif": color_gif(color), "tooltip": tooltip}
            counted.append(color)

        overall = worst_color(counted) if counted else "unknown"
        rows.append({
            "name": host.get("name", host.get("host", "")),
            "host": host.get("host", ""),
            "overall": overall,
            "overall_gif": color_gif(overall),
            "cells": cells,
        })

    return {"tests": tests, "rows": rows, "updated": int(now)}


def fmt_clock(now, text):
    hm = time.strftime("%H:%M:%S", time.localtime(now))
    return f"{hm} {text}"