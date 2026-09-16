# Zabbix → Xymon-Style Dashboard: Research & Implementation Plan

This document captures everything researched and planned for building a custom monitoring dashboard that replicates the classic Xymon look and feel, powered entirely by the Zabbix API.

## 1. What is Xymon?

Xymon (formerly Hobbit, descended from Big Brother) is an open-source network/server monitoring tool. Its defining feature is the **scanable status grid**: a table where **rows are hosts** and **columns are test types**, with each cell a colored block.

### Xymon Colors

| Color | Meaning | Zabbix Derivation |
|---|---|---|
| **Green** | OK | No problem triggers on column |
| **Yellow** | Warning | Trigger severity 2-3 (Warning/Average) in problem state |
| **Red** | Down/Failure | Trigger severity 4-5 (High/Disaster), or host unreachable via `zabbix[host,available]` |
| **Purple** | Acknowledged problem | `problem.get` / `event.get` `acknowledged=true` |
| **Blue** | No fresh data (stale) | `nodata` triggers, or items with `lastclock` too old |
| **Grey** | Disabled / not monitored | Host `status != 0` or in maintenance (`maintenance.get`) |
| **White/Clear** | No data yet / unknown | Host exists but no classified triggers for that column |

Rule of thumb: **red/yellow = the check saw a bad value. Blue = the check stopped talking to us.** Both behaviors get replicated.

### Xymon Grid Behavior

- Rows = hosts, columns = test types (arbitrary names: `conn`, `cpu`, `mem`, `disk`, `http`, ...)
- Each cell is a solid colored block — the colors do all the work
- Column headers also colored = worst status across hosts in that column
- Page tabs split hosts into logical groups
- Click a cell → detail page; hover → status popup
- Below/above the grid: chronological **recent state-change list** (alert feed)
- RRD graphs per host (the `trends` column)
- Host down := the `conn` cell goes red and everything else goes blue (no data arriving)

### The "Host Down Cascade" Rule

The single most-important Xymon behavior to reproduce:

> host unreachable → `conn` column cell = **red**, all other columns for that host = **blue**.

In Zabbix this comes from an internal item on the Zabbix server host: `zabbix[host,available]`. When it reports "unavailable", apply the cascade. (Verification step during setup: confirm this internal item is collecting for your hosts.)

## 2. The Zabbix API — What It Can and Can't Do

### Protocol & Auth

- HTTP-based, JSON-RPC 2.0, shipped as part of the web frontend (`api_jsonrpc.php`)
- Auth via API token (`Authorization: Bearer <token>` header) or `user.login`
- Version matches Zabbix server version (`apiinfo.version`)
- CORS is enabled (`Access-Control-Allow-Origin: *`), so browser-direct calls are possible, but a backend proxy is safer (token custody)

### What the API CAN do (full CRUD unless noted)

| Category | Methods |
|---|---|
| Hosts | create, delete, get, massadd, massremove, massupdate, update |
| Items | create, delete, get, massadd, massremove, massupdate, update (+ prototypes) |
| Triggers | create, delete, get, massadd, massremove, massupdate, update (+ prototypes), see also `get` with `monitoredHosts` |
| Graphs | create, delete, get, update (+ prototypes) |
| Templates | create, delete, get, massadd, massremove, update |
| Host/Template Groups | full CRUD + mass operations |
| Discovery Rules | full CRUD + mass operations |
| Events / Problems | `get`, `acknowledge` |
| History / Trends | `get`, `push`, `clear` |
| Dashboards | create, delete, get, update (all widget types) |
| Maps | create, delete, get, update (+ map elements) |
| Actions / Correlations | create, delete, get, update |
| Maintenance | create, delete, get, update |
| Users / Roles / Groups | full CRUD + mass ops |
| API Tokens | create, delete, get, update |
| Media Types | create, delete, get, update |
| SLA / Services | create, delete, get, update |
| Proxies / Proxy Groups | create, delete, get, update |
| Scripts | create, delete, get, update |
| Config Export/Import | export, import, importcompare |
| Connectors | create, delete, get, update (Zabbix 7.x event push) |
| Regular Expressions | create, delete, get, update |
| Value Maps | create, delete, get, update |
| Web Scenarios | create, delete, get, massadd, massremove, massupdate, update |
| Housekeeping | get, update |
| Authentication | get, update (can toggle LDAP/SAML settings) |
| Autoregistration | get, update |
| Audit Log | get |
| HA Nodes | get |

### What the API CANNOT do

| Limitation | Notes |
|---|---|
| No server process control | Cannot restart/stop/query the Zabbix server process |
| No real-time graph/image rendering | `history.get` returns raw data; frontend must render charts |
| No `zabbix_server.conf` editing | Cache sizes, timeouts, poller counts are file-based |
| No frontend UI management | Themes, menu layout, frontend config are not API-driven |
| No user profile/GUI prefs | Can't change a user's language/theme/display options |
| No log access | Zabbix server/proxy logs not readable via API |
| No agent/proxy command execution | Can't run ad-hoc commands on monitored hosts |
| No manual housekeeping sync | Internal processes not triggerable |

**Headless note:** the API lives inside the PHP frontend, so the frontend must be installed — but it can be firewalled/reverse-proxied and never used by humans.

## 3. Proposal Stack & Architecture

### Chosen stack
- **Backend**: Python with FastAPI + official `zabbix_utils` library
- **Frontend**: server-served static HTML, vanilla JS + Chart.js (CDN)
- **Data delivery**: backend polls every ~15s, caches a computed `Grid`, serves JSON; browser refreshes every ~15s (same cadence as Xymon)
- Runs headless; fits the AlmaLinux Docker sandbox workflow

### Project layout

```
zabbix_xymon_dashboard/
├── config.yaml          # Zabbix URL, API token, column definitions, host filter
├── main.py              # FastAPI app: /grid (JSON), / (grid page), /cell (details)
├── poller.py            # Zabbix API calls + grid color computation
├── templates/index.html # grid view
├── static/app.js        # 15s refresh + cell click-through
└── requirements.txt
```

## 4. Data Fetching (one poll cycle)

```python
# Rows (hosts) - with availability + maintenance
hosts = api.host.get(
    output=["hostid", "host", "name", "status", "available"],
    selectMaintenances=["name"],
    selectGroups=["name"],
    selectTags=["tag", "value"],
)

# Health (triggers) - problem triggers + their items + host linkage
triggers = api.trigger.get(
    monitored=True,
    only_true=True,          # only problems currently in problem state
    skipDependent=1,
    output=["triggerid", "description", "priority", "value", "lastchange", "tags"],
    selectHosts=["hostid", "host"],
    selectItems=["itemid", "key_", "name", "lastclock", "lastvalue"],
)

# Ack state (for purple) + alert list
events = api.event.get(
    object=0, source=0, value=1,
    output=["eventid", "acknowledged", "objectid", "clock"],
)
```

`only_true=True` means Zabbix already filters to problems — our job is **classifying which column** a trigger belongs to and **how severe** it is.

## 5. Column Membership (the translation layer)

Every trigger gets classified into a column. Two matching methods, tried in order (tag wins):

```yaml
# config.yaml
columns:
  conn:
    tags: {xymon_col: conn}            # method 1: explicit tag (robust, recommended)
    patterns: ["ICMP ping loss"]        # method 2: description substring (fallback)
  cpu:
    tags: {xymon_col: cpu}
    patterns: ["CPU utilization is too high", "CPU load average"]
  disk:
    tags: {xymon_col: disk}
  mem:
    tags: {xymon_col: mem}
```

- **Tag method** (recommended): one-time `trigger.massupdate` assigns `xymon_col=<name>` to chosen triggers. Requires no fragile name matching.
- **Pattern method** (fallback): substring/regex on trigger description. Zero Zabbix changes needed but fragile; pre-fill from the templates in use (e.g., "Linux by Zabbix agent").

```python
def column_of(trigger, cfg):
    for col, rule in cfg.columns.items():
        if any(trigger.get("tags") matches rule.tags): return col
        if any(re.search(p, trigger["description"]) for p in rule["patterns"]): return col
    return None   # unclassified triggers are ignored
```

## 6. Color Decision Logic (core function)

Precedence (highest first): grey > (host-down cascade) > blue/stale > purple > red/yellow > green > white.

```python
def classify_cell(host, col_triggers, host_available, in_maintenance):
    # 1. GREY - host disabled or in maintenance
    if host["status"] != 0 or in_maintenance:
        return GREY

    # 2. HOST-LEVEL RED - the conn column reports host unreachable
    if is_unreachable(host_available):         # zabbix[host,available] == unavailable
        if col == "conn": return RED
        return BLUE                            # all other cols: no data arriving

    # 3. BLUE / STALE - data stopped coming (nodata trigger, or old lastclock)
    if any(t["key"] == "nodata" for t in col_triggers) or data_is_stale(col_triggers):
        return BLUE

    # 4. PURPLE - active problems that are ALL acknowledged
    if col_triggers and all(t acknowledged for t in col_triggers):
        return PURPLE

    # 5. RED vs YELLOW - worst active, unacked problem severity
    if col_triggers:
        worst = max(t["priority"] for t in col_triggers)   # 4=High, 5=Disaster
        if worst >= 4: return RED
        return YELLOW                                       # 2=Warning, 3=Average

    # 6. GREEN - this host has a column and it's healthy
    return GREEN
```

### Resulting data structure

```python
Grid {
  columns: ["conn","cpu","disk","mem", ...]      # header order
  hosts: [{hostid, name, maintenance}...]        # row order
  cells: { (hostid, col): Cell }                 # the whole matrix
}
Cell { color, worst_priority, acked, stale,
       problems: [trigger descriptions],         # for popup/click-through
       item_ids: [...]                           # for history graphs
}
```

White = host present with zero classified triggers for that column → render cell as absent/empty (like Xymon's "column not enabled for this host").

## 7. Column Headers + Alert List

- **Header color**: `max()` over that column's cells across hosts → shows worst-status scanning down the page.
- **Alert list**: diff consecutive polls — any `(host, col)` whose color changed since last poll gets appended to a rolling "recent state changes" feed. Uses cached trigger/event descriptions; no extra API calls.

## 8. Click-Through Detail

Cell click → `GET /cell?host=X&column=Y` → backend returns that column's items' history via `history.get`/`trend.get` (last ~6h) → Chart.js sparkline + current values + active trigger descriptions.

## 9. Open Questions / Setup Checks

1. **Zabbix server URL + version** — affects API params (7.x adds Connectors for push mode).
2. **API token** — create in UI: Users → API tokens.
3. **`zabbix[host,available]` internal item** — verify it is collecting for your hosts or the host-down cascade won't work.
4. **Which Zabbix templates are in use** — needed to pre-fill `patterns` fallback (or commit to the tagging approach and leave patterns empty).
5. **Purple semantics** — decide: purple = acked problem event exists (Xymon "known issue"), OR keep simple and ignore ack (acked problems show normal red/yellow).
6. **Hosts to display** — which hosts/groups go on the dashboard.