# Zabbix Docker Setup

Zabbix 7.0 LTS monitoring stack running in Docker on the AlmaLinux host.

## Stack

| Service | Container name | Image | Purpose |
|---|---|---|---|
| Database | `zabbix-postgres` | `postgres:16-alpine` | Dedicated Zabbix database |
| Server | `zabbix-server` | `zabbix/zabbix-server-pgsql:alpine-7.0-latest` | Core Zabbix server |
| Frontend | `zabbix-web` | `zabbix/zabbix-web-nginx-pgsql:alpine-7.0-latest` | Web UI (Nginx) |
| Agent | `zabbix-agent` | `zabbix/zabbix-agent2:alpine-7.0-latest` | Monitors the docker host |

All containers share the existing external `homelab-net` network.

## Ports

| Port | Service |
|---|---|
| `8087` | Web UI (http://localhost:8087) |
| `10051/tcp` | Zabbix server listener (agents/proxies connect here) |
| `10050/tcp` | Agent2 listener (this host) |

Postgres (5432) is internal only.

## Default login

- URL: http://localhost:8087
- User: `Admin`
- Password: `zabbix`

Change the default password immediately after first login.

## Managing the stack

```bash
cd /home/mjward/docker/zabbix

docker compose up -d        # start
docker compose down         # stop (keeps data volumes)
docker compose restart      # restart services
docker compose logs -f zabbix-server   # follow server logs
```

Database data is persisted in `./pg-data`.

## Gotchas

### DNS conflict on shared network

All services share the external `homelab-net` network, which is also used by
other stacks (wiki, gitea, homepage, etc.). Docker Compose registers each
service name as a DNS alias on that network.

Two stacks must NOT use the same service name (e.g. `postgres`). If both Wiki.js
and Zabbix define a service called `postgres`, the `postgres` hostname becomes
ambiguous and containers can reconnect to the wrong database.

Fix: use a unique service name per stack (`zdb` here) and connect via the
container name (`zabbix-postgres`). Verify with:

```bash
docker inspect zabbix-postgres --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}: aliases={{$v.Aliases}}{{end}}'
```

### Adding agents on other devices

Install the agent on each device and point it at this host:

```bash
# RHEL/Alma/CentOS agent package:
#   zabbix-release then zabbix-agent2
# Configure /etc/zabbix/zabbix_agent2.conf:
#   Server=<host-ip>
#   ServerActive=<host-ip>
#   Hostname=<device-name>
```

Then add the host in the Zabbix UI under Configuration > Hosts. The server
listener on `10051` must be reachable from the network (firewall: `firewall-cmd
--permanent --add-port=10051/tcp`).

### Monitoring this host properly

The bundled `zabbix-agent` container only sees its own container, not the
full AlmaLinux host (CPU, memory, disk, processes). For full host monitoring,
install `zabbix-agent2` natively on the host instead.

## Credentials

Database credentials (dev defaults via env vars in docker-compose.yml):

- DB user: `zabbix`
- DB password: `zabbix`
- DB name: `zabbix`