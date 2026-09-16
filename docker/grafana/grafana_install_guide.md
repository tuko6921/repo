# Grafana Docker Installation Guide

## Overview

Grafana is an open-source analytics and interactive visualization web application. This guide documents the Docker-based installation process.

## Prerequisites

- Docker Engine
- Docker Compose

## Files

- `docker-compose.yml` - Container configuration

## Installation Steps

### 1. Create the Project Directory

```bash
mkdir -p /home/mjward/docker/grafana
cd /home/mjward/docker/grafana
```

### 2. Create docker-compose.yml

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
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false

volumes:
  grafana-data:
```

### 3. Start the Container

```bash
docker compose up -d
```

### 4. Verify the Container is Running

```bash
docker ps --filter name=grafana
```

Expected output:

```
CONTAINER ID   IMAGE                    COMMAND     CREATED          STATUS          PORTS                                         NAMES
xxxxxxxxxxxx   grafana/grafana:latest   "/run.sh"   XX seconds ago   Up XX seconds   0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp   grafana
```

## Access

- **URL:** http://localhost:3001
- **Username:** admin
- **Password:** admin

You will be prompted to change the password on first login.

## Configuration

| Environment Variable | Value | Description |
|---------------------|-------|-------------|
| `GF_SECURITY_ADMIN_USER` | `admin` | Default admin username |
| `GF_SECURITY_ADMIN_PASSWORD` | `admin` | Default admin password |
| `GF_USERS_ALLOW_SIGN_UP` | `false` | Disable public sign-up |

## Volumes

- `grafana-data` - Persists Grafana data (dashboards, settings, etc.)

## Port Mapping

Port 3000 was already in use, so the container maps host port **3001** to container port **3000**.

## Management Commands

```bash
# Stop Grafana
docker compose stop

# Start Grafana
docker compose start

# Restart Grafana
docker compose restart

# View logs
docker compose logs grafana

# Remove container
docker compose down

# Remove container and data
docker compose down -v
```
