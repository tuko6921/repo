# Zabbix Setup Guide

## Overview

- **Main/Server Machine**: Zabbix Server, Database, Frontend/API
- **Agent/Host Machines**: Zabbix Agent (monitored machines)
- **API**: Served by the Zabbix frontend (no separate service)

---

## 1. Main Machine (Zabbix Server + Database)

### Packages to Install

```bash
# RHEL/CentOS/AlmaLinux
dnf install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts

# Debian/Ubuntu
apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts
```

### Database Setup (MySQL/MariaDB)

```sql
-- Create the database
CREATE DATABASE zabbix CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- Create a dedicated user
CREATE USER 'zabbix'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON zabbix.* TO 'zabbix'@'localhost';

-- Enable log bin trust function creation (required for MySQL 8.0+)
SET GLOBAL log_bin_trust_function_creators = 1;
```

Import the default schema:

```bash
# RHEL/CentOS
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql --default-character-set=utf8mb4 -uzabbix -p zabbix

# Debian/Ubuntu
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql --default-character-set=utf8mb4 -uzabbix -p zabbix
```

After import, disable log bin trust:

```sql
SET GLOBAL log_bin_trust_function_creators = 0;
```

### Zabbix Server Config

File: `/etc/zabbix/zabbix_server.conf`

| Parameter       | Value                    | Description              |
|-----------------|--------------------------|--------------------------|
| `DBHost`        | `localhost`              | Database host            |
| `DBName`        | `zabbix`                 | Database name            |
| `DBUser`        | `zabbix`                 | Database user            |
| `DBPassword`    | `your_password`          | Database password        |
| `ListenPort`    | `10051`                  | Server listen port       |

### Services to Start

```bash
systemctl enable --now httpd        # or apache2
systemctl enable --now zabbix-server
systemctl enable --now mariadb      # or mysql
```

### Firewall Rules

| Port  | Protocol | Purpose              |
|-------|----------|----------------------|
| 80    | TCP      | Web frontend / API   |
| 443   | TCP      | HTTPS frontend / API |
| 10051 | TCP      | Zabbix server listen |

---

## 2. Agent/Host Machines (Monitored)

### Package to Install

```bash
# RHEL/CentOS/AlmaLinux
dnf install zabbix-agent2

# Debian/Ubuntu
apt install zabbix-agent2
```

### Agent Config

File: `/etc/zabbix/zabbix_agentd.conf`

| Parameter        | Value                  | Description                          |
|------------------|------------------------|--------------------------------------|
| `Server`         | `<zabbix_server_ip>`   | Passive checks (server polls agent)  |
| `ServerActive`   | `<zabbix_server_ip>`   | Active checks (agent pushes to server)|
| `Hostname`       | `<exact_name_in_ui>`   | Must match host name in Zabbix frontend |

### Services to Start

```bash
systemctl enable --now zabbix-agent2
```

### Firewall Rules

| Port  | Protocol | Purpose                                |
|-------|----------|----------------------------------------|
| 10050 | TCP      | Agent listen (must be open to server)  |

---

## 3. Zabbix API

The API is **not** a separate service. It is served by the Zabbix frontend (PHP/web server).

### API Endpoint

```
http://<zabbix-server>/api_jsonrpc.php
```

### Authentication Flow

```python
import requests
import json

url = "http://<zabbix-server>/api_jsonrpc.php"
headers = {"Content-Type": "application/json-rpc"}

# Step 1: Login
login_payload = {
    "jsonrpc": "2.0",
    "method": "user.login",
    "params": {
        "username": "Admin",
        "password": "zabbix"
    },
    "id": 1
}

response = requests.post(url, headers=headers, json=login_payload)
auth_token = response.json()["result"]

# Step 2: Read hosts
hosts_payload = {
    "jsonrpc": "2.0",
    "method": "host.get",
    "params": {
        "output": ["hostid", "host", "name"],
        "selectInterfaces": ["ip"]
    },
    "auth": auth_token,
    "id": 2
}

response = requests.post(url, headers=headers, json=hosts_payload)
hosts = response.json()["result"]

for host in hosts:
    print(f"{host['name']} - {host['interfaces'][0]['ip']}")
```

### Useful API Methods

| Method       | Description                              |
|--------------|------------------------------------------|
| `user.login` | Authenticate and get auth token          |
| `host.get`   | Get list of hosts                        |
| `item.get`   | Get items (metrics) for hosts            |
| `history.get`| Get historical data for items            |
| `event.get`  | Get events/alerts                        |
| `problem.get`| Get current problems                     |
| `template.get`| Get templates                           |
| `user.logout`| Logout (invalidate auth token)           |

### Key Points

- API calls **only** reach the server's web frontend
- No changes needed on agent hosts for API access
- The Zabbix server polls agents for data; the API reads what is already stored in the database
- Your external application only needs HTTP/HTTPS access to the Zabbix frontend

---

## 4. Full Port Reference

| Port  | Protocol | Direction               | Purpose              |
|-------|----------|-------------------------|----------------------|
| 80    | TCP      | External -> Server      | Frontend / API       |
| 443   | TCP      | External -> Server      | HTTPS Frontend / API |
| 10050 | TCP      | Server -> Agent         | Agent listen         |
| 10051 | TCP      | Agent -> Server         | Server listen        |

---

## 5. Troubleshooting

### Agent not connecting

```bash
# On agent host
zabbix_agent2 -t "agent.ping"

# Check agent logs
tail -f /var/log/zabbix/zabbix_agent2.log
```

### API returns auth error

- Ensure username/password are correct (default: `Admin` / `zabbix`)
- Check that the user has API access enabled in the frontend

### Database connection issues

```bash
# Test connection from server
mysql -uzabbix -p -h localhost zabbix

# Check server logs
tail -f /var/log/zabbix/zabbix_server.log
```
