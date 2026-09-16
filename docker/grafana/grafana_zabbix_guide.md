# Grafana + Zabbix Integration Guide

This guide documents how Grafana was integrated with the existing Zabbix instance so
that Zabbix metrics can be visualized in Grafana dashboards. It covers the end-to-end
setup: datasource, provisioning, dashboards, live data verification, and how to extend
it when new hosts are added.

Companion doc: `grafana_install_guide.md` (base Grafana Docker installation).

## 1. Overview / Architecture

```
                 +-------------------------------------+
   browser       |  Grafana (3001)                    |
   :3001 ------->|  - alexanderzobnin-zabbix plugin    |
   :8087 ------->|  - provisioned datasource + dashboard|
   :8088 ------->|  - ZabbixHost dashboard (9 panels)  |
                 +------------------+------------------+
                                    | API (JSON-RPC, token auth)
                                    v
                 +-------------------------------------+
                 |  Zabbix web/api (8087 host : 8080)  |
                 |  zabbix-server + zabbix-agent2     |
                 +------------------+------------------+
                                    | agent polling
                                    v
                              monitored hosts/users
```

- **Grafana** container name: `grafana`, host port `3001` (internal 3000).
- **Zabbix** API URL (from inside the Grafana container): `http://zabbix-web:8080/api_jsonrpc.php`
- Both join the externally-defined Docker network `homelab-net`, which is what lets
  Grafana reach `zabbix-web` by service name.
- Authentication to the Zabbix API uses a **personal API token**, the same token already
  used by the `zabbix-viewer` (xymon-style) dashboard.

Monitored hosts at time of writing:

| Host | Host ID | Notes |
|------|---------|-------|
| `gambit-solid-state-tapbox` | 10683 | Linux host, full item set (CPU/mem/net/ssh/http/https) |
| `Zabbix server` | 10084 | Zabbix self-monitoring |

## 2. Files Created

```
/home/mjward/docker/grafana/
├── .env                                  # ZABBIX_API_TOKEN (used by docker-compose)
├── docker-compose.yml                    # grafana service + networks + plugin + provisioning
├── grafana_install_guide.md              # base install doc
├── grafana_zabbix_guide.md               # THIS FILE
└── provisioning/
    ├── datasources/
    │   └── zabbix.yaml                   # provisioned Zabbix datasource
    └── dashboards/
        ├── dashboards.yaml               # dashboard provider config
        └── zabbix-tapbox.json            # "Zabbix Host Overview" dashboard
```

## 3. Prerequisites

- A running **Zabbix** stack with its web server reachable over the shared `homelab-net`
  docker network.
- A **Zabbix API token** for a user with read access. The same token is used by
  `zabbix-viewer`; in this setup it lives in:
  - `/home/mjward/docker/zabbix/.zbx_token`
  - `/home/mjward/docker/grafana/.env` (`ZABBIX_API_TOKEN=...`)

## 4. Environment: `.env`

`docker-compose` automatically reads `.env` in the project directory, so the token is
never hard-coded into `docker-compose.yml`:

```bash
# /home/mjward/docker/grafana/.env
ZABBIX_API_TOKEN=<40-hex-character token>
```

## 5. docker-compose.yml

The final Grafana service definition:

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./provisioning:/etc/grafana/provisioning:ro
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=alexanderzobnin-zabbix-app
      - ZABBIX_API_TOKEN=${ZABBIX_API_TOKEN}
    networks:
      - grafana-net
      - homelab-net
    depends_on: []

networks:
  grafana-net:
  homelab-net:
    external: true

volumes:
  grafana-data:
```

Key changes over the base install:

| Setting | Purpose |
|---------|---------|
| `./provisioning:/etc/grafana/provisioning:ro` | Mounts datasource/dashboard provisioning config |
| `GF_INSTALL_PLUGINS=alexanderzobnin-zabbix-app` | Auto-installs the Grafana Zabbix plugin on container start |
| `ZABBIX_API_TOKEN=${ZABBIX_API_TOKEN}` | Passes the API token into the container for secure datasource config |
| `homelab-net: external: true` | Joins the shared network so `zabbix-web` resolves by name |

> **Note on plugin env var:** `GF_INSTALL_PLUGINS` currently works but is logged as
> deprecated by Grafana. The replacement is `GF_PLUGINS_PREINSTALL`
> (and `GF_PLUGINS_PREINSTALL_SYNC` for plugin signing info). Can be migrated later.

Apply changes:

```bash
cd /home/mjward/docker/grafana
docker compose up -d
docker restart grafana        # if the container already existed
```

## 6. Provisioning the Zabbix Datasource

File: `provisioning/datasources/zabbix.yaml`

```yaml
apiVersion: 1

datasources:
  - name: Zabbix
    uid: zabbix
    type: alexanderzobnin-zabbix-datasource
    access: proxy
    url: http://zabbix-web:8080/api_jsonrpc.php
    jsonData:
      authType: token
      trends: true
      trendsFrom: '7d'
      trendsRange: '4d'
      cacheTTL: '1h'
      disableReadOnlyUsersAck: false
      disableDataAlignment: false
    secureJsonData:
      apiToken: '${ZABBIX_API_TOKEN}'
    version: 1
    editable: true
```

Notes:

- `uid: zabbix` gives the datasource a stable, predictable UID used by dashboards and
  the Grafana API. Dashboards reference it with
  `"datasource": { "type": "alexanderzobnin-zabbix-datasource", "uid": "zabbix" }`.
- `secureJsonData.apiToken` supports environment-variable references like `${ZABBIX_API_TOKEN}`.
- `access: proxy` means Grafana fetches from Zabbix server-side, so no browser traffic
  to the Zabbix API.
- `trends: true` lets the plugin fall back to hourly trends for long time ranges,
  avoiding heavy history queries.

## 7. Provisioning the Dashboard Provider

File: `provisioning/dashboards/dashboards.yaml`

```yaml
apiVersion: 1

providers:
  - name: zabbix
    orgId: 1
    folder: Zabbix
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

- Dashboards are loaded from the mounted `provisioning/dashboards/` directory into a
  Grafana folder named **Zabbix**.
- `updateIntervalSeconds: 30` means edits to dashboard JSON files are picked up within
  30s *if the provider already existed at startup*. If you create the provider folder
  after Grafana booted, restart Grafana:

```bash
docker restart grafana
```

## 8. The Dashboard: "Zabbix Host Overview"

File: `provisioning/dashboards/zabbix-tapbox.json`

A single, reusable dashboard driven by a **Host** template variable. When you pick a
host in the dropdown, every panel re-queries Zabbix for that host.

### 8.1 The Host template variable

```json
{
  "name": "host",
  "label": "Host",
  "type": "query",
  "datasource": { "type": "alexanderzobnin-zabbix-datasource", "uid": "zabbix" },
  "query": "{/.*/}{*}",        // legacy Zabbix variable query format
  "refresh": 2,
  "sort": 1,
  "includeAll": true,
  "multi": false,
  "allValue": "/.*/"
}
```

How the variable query works:

- The plugin's `metricFindQuery` supports a **legacy string format**
  `{host group}{host}{application}{item}`.
- `{/.*/}{*}` = "any group" + "any host" → returns **all host names**.
- It is fully **auto-populated**: add a new agent/host to Zabbix and it appears in the
  dropdown automatically (values refresh with the variable's `refresh: 2` = on dashboard load).
- Panels reference it as `$host` in their `host.filter`, e.g.
  `"host": { "filter": "$host", "limit": 0 }`. When the variable is interpolated the
  plugin wraps it in an anchored regex (`/^hostname$/`), and multi-value selections are
  expanded into `(value1|value2)`.

### 8.2 Query model used by panels

The plugin's backend parses each panel target into this model:

```json
{
  "refId": "A",
  "datasource": { "type": "alexanderzobnin-zabbix-datasource", "uid": "zabbix" },
  "queryType": 0,                                   // integer! 0 = metrics
  "mode": 0,                                        // deprecated, superseded by queryType
  "group":    { "filter": "/.*/",   "limit": 0 },
  "host":     { "filter": "$host",  "limit": 0 },
  "application": { "filter": "",    "limit": 0 },
  "itemTag":  {},
  "item":     { "filter": "<item name or /regex/>", "limit": 0 },
  "functions": [],
  "options": {
    "showDisabledItems": false,
    "useZabbixValueMapping": false,
    "disableDataAlignment": false,
    "useHistory": "",
    "useTrends": ""
  }
}
```

Gotchas discovered during development:

- `queryType` **must be an integer** (`0` for metrics). Using the string `"metric"`
  causes the error **"non-metrics queries are not supported"**.
- `item.filter` matches Zabbix **item names** (which may contain `$1`-style params that
  the plugin expands). Use a plain name (`"CPU utilization"`) for one item, or a regex
  between `/.../` slashes to select several (`"/Load average .* avg/"`).
- Optional keys (`application`, `itemTag`) are safe to include empty; the backend
  defaults missing filters to "".

### 8.3 Panels

| # | Panel | Type | Item filter | Notes |
|---|-------|------|-------------|-------|
| 1 | CPU utilization | timeseries | `CPU utilization` | % |
| 2 | CPU breakdown | timeseries | `/CPU (user\|system\|iowait\|softirq\|steal\|nice) time/` | stacked |
| 3 | Memory utilization | timeseries | `Memory utilization` | % |
| 4 | Load average | timeseries | `/Load average .* avg/` | 1/5/15 min |
| 5 | Network traffic (bits/s) | timeseries | `/Interface .*: Bits (sent\|received)/` | all interfaces, `bps` unit |
| 6 | SSH | stat | `ssh availability` | Up/Down tile |
| 7 | HTTP | stat | `http availability` | Up/Down tile |
| 8 | HTTPS | stat | `https availability` | Up/Down tile |
| 9 | System uptime | stat | `System uptime` | seconds |

The SSH/HTTP/HTTPS tiles emulate the Xymon status-board look: value `1` = UP (green),
`0` = DOWN (red), via threshold + value mappings:

```json
"thresholds": {
  "mode": "absolute",
  "steps": [
    { "color": "red",   "value": null },
    { "color": "green", "value": 1 }
  ]
},
"mappings": [
  { "type": "value", "options": { "0": { "index": 0, "text": "DOWN" } } },
  { "type": "value", "options": { "1": { "index": 1, "text": "UP" } } }
]
```

Item names/keys are specific to the Zabbix **Linux template with agent2**. A different
host (Windows, SNMP, etc.) may not have every item — panels simply render empty for
hosts that lack the matching items.

## 9. Verification

### 9.1 Datasource health

```bash
docker exec grafana sh -c 'AUTH=$(printf "admin:admin" | base64); \
  curl -s -H "Authorization: Basic $AUTH" \
  http://localhost:3000/api/datasources/uid/zabbix/health'
```

Expected:

```json
{"message":"Zabbix API version 7.0.30","status":"OK"}
```

> The `/api/datasources/uid/<uid>/test` and `/api/datasources/<id>/test` POST
> endpoints return 404 in this Grafana/plugin combo — the `health` endpoint is the
> reliable one.

### 9.2 Dashboard loaded

```bash
docker exec grafana sh -c 'AUTH=$(printf "admin:admin" | base64); \
  curl -s -H "Authorization: Basic $AUTH" \
  http://localhost:3000/api/dashboards/uid/zabbix-tapbox'
```

### 9.3 Live query through the datasource API

This executes a real Zabbix query end-to-end without the UI:

```bash
docker exec grafana sh -c 'AUTH=$(printf "admin:admin" | base64); \
  curl -s -H "Authorization: Basic $AUTH" -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/ds/query -d '\''{
    "from":"now-15m","to":"now",
    "queries":[{
      "refId":"A",
      "datasource":{"type":"alexanderzobnin-zabbix-datasource","uid":"zabbix"},
      "queryType":0,
      "group":{"filter":"/.*/","limit":0},
      "host":{"filter":"gambit-solid-state-tapbox","limit":0},
      "item":{"filter":"ssh availability","limit":0},
      "itemTag":{},
      "functions":[],
      "options":{},
      "intervalMs":30000,
      "maxDataPoints":50
    }]
  }'\'''
```

Tested responses: `CPU utilization` returns time series with values ~0.1–0.5 %;
`ssh availability` returns `1` (UP).

### 9.4 Zabbix API directly (for exploring items)

Inspect what items a host actually has (must send `Content-Type: application/json`,
otherwise Zabbix responds HTTP 412):

```bash
docker exec grafana sh -c 'wget -qO- \
  --header="Content-Type: application/json" \
  --post-data="{\"jsonrpc\":\"2.0\",\"method\":\"item.get\",\"params\":{
      \"output\":[\"name\",\"key_\",\"units\"],
      \"hostids\":[\"10683\"]},\"id\":1}" \
  http://zabbix-web:8080/api_jsonrpc.php'
```

Find the token value inside the container at `/home/mjward/docker/zabbix/.zbx_token`
(or use the `.env` value).

## 10. Adding New Hosts

1. Register the host/agent in Zabbix (hostname + linked template) as normal.
2. **Nothing to change in Grafana** — the host auto-appears:
   - in the Host dropdown (variable refresh),
   - in Xymon/`zabbix-viewer` (it queries hosts independently).
3. Open the dashboard and pick the new host from the dropdown.

If the new host uses a different operating system template the panel item names will
differ (e.g. Windows items are named differently). Then adjust the `item.filter`
values — either add a regex branch or rename the panel target.

## 11. Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| `non-metrics queries are not supported` | `queryType` was a string. Set `"queryType": 0`. |
| Datasource test POST returns 404 | Use the health endpoint: `GET /api/datasources/uid/zabbix/health`. |
| Zabbix API answers HTTP 412 | Missing `Content-Type: application/json` header on direct API calls. |
| New dashboard JSON not appearing | The provider folder didn't exist at boot. `docker restart grafana`. |
| Panels empty for a host | Host lacks those items (template/OS specific). Pick a host with the Linux template. |
| Plugin install log warning about `GF_INSTALL_PLUGINS` | Deprecated; migrate to `GF_PLUGINS_PREINSTALL` when convenient. |
| Can't reach Zabbix from Grafana | Both must share `homelab-net`; confirm the network exists and `zabbix-web` is its service name. |

## 12. Useful Commands

```bash
# Restart Grafana (re-runs provisioning)
cd /home/mjward/docker/grafana && docker restart grafana

# Follow Grafana logs
docker logs -f grafana

# Regenerate / verify the datasource was provisioned
docker exec grafana ls /etc/grafana/provisioning/datasources /etc/grafana/provisioning/dashboards
```

## 13. Summary

- Grafana visualizes the same Zabbix data as the xymon-style viewer (port 8088), but as
  time-series graphs instead of status squares.
- Everything is **file-provisioned** (`provisioning/` folder), so setup is reproducible
  and machine-friendly.
- The dashboard is host-agnostic thanks to a self-populating template variable, so
  adding hosts requires no Grafana changes.