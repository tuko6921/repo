# Self-Hosted Knowledge Base & Documentation Stack — Architecture & Deployment Guide

This guide covers a self-hosted documentation, version control, and file management stack located at `/home/user/docker/`. It includes the architecture, directory structure, complete Docker Compose configuration, and the operational runbook.

---

## 1. Architectural Overview & Design Principles

The deployment follows the **Modular App-Centric Pattern** rather than a single, monolithic Docker Compose file:

- **Strict App Encapsulation** — Every application lives in its own isolated subfolder containing its `docker-compose.yml`, local state, database, and configuration.
- **Separation of Roles**:
  - **Obsidian** — private scratchpad, personal knowledge vault, and draft workspace.
  - **MkDocs** — published documentation hub for finalized Standard Operating Procedures (SOPs) and system guides.
  - **FileBrowser** — administrative web UI across all folders to easily move drafts into SOPs.
  - **Gitea** — local version control and backup repositories for notes and configs.
- **Direct Filesystem Portability** — No opaque Docker named volumes are used. Everything relies on host bind mounts, so backing up, inspecting, or migrating the system only requires archiving the host filesystem.
- **Unified Bridge Network** — All stacks hook into an external bridge network (`homelab-net`), enabling future inter-container routing or SSL termination via a reverse proxy without port conflicts.

---

## 2. Global Directory Layout

```
/home/user/docker/
│
├── filebrowser/
│   ├── docker-compose.yml
│   └── data/
│       ├── filebrowser.db                # User auth, share links, and preferences
│       └── settings.json                 # Web UI configuration defaults
│
├── gitea/
│   ├── docker-compose.yml
│   └── data/                             # Repositories, SSH keys, hooks, and internal SQLite DB
│
├── mkdocs/
│   ├── docker-compose.yml
│   ├── mkdocs.yml                        # Theme, plugin, and navigation settings
│   └── docs/                             # Published SOPs and guides (index.md, system manuals)
│
├── obsidian/
│   ├── docker-compose.yml
│   ├── config/                           # KasmVNC settings, app cache, Obsidian plugins
│   └── vaults/                           # Private personal notes and WIP drafts
```

---

## 3. Network & Storage Mapping Reference

| Service | Host Port | Internal Container Mount | Host Path | Purpose / Description |
|---------|-----------|--------------------------|-----------|------------------------|
| **FileBrowser** | `8080` | `/srv`, `/database/filebrowser.db`, `/.filebrowser.json` | `./data/filebrowser.db`, `./data/settings.json` | Administrative web file manager spanning all app directories. |
| **Gitea** | `3002` (Web), `2222` (SSH) | `/data` | `./data` | Self-hosted Git forge; stores repo bare trees and SQLite metadata. |
| **MkDocs** | `8000` | `/docs` | `./mkdocs.yml`, `./docs` | Static documentation builder; hot-reloads edits to SOPs. |
| **Obsidian** | `3001` (Web UI) | `/config`, `/vaults` | `./config`, `./vaults` | KasmVNC web desktop Obsidian instance for daily notes & drafts. |

---

## 4. Docker Compose Configurations

### A. FileBrowser

File: `/home/user/docker/filebrowser/docker-compose.yml`

```yaml
version: '3.8'

services:
  filebrowser:
    image: filebrowser/filebrowser:latest
    container_name: filebrowser
    user: "1000:1000"
    volumes:
      - ./data/filebrowser.db:/database/filebrowser.db
      - ./data/settings.json:/.filebrowser.json
      - /home/user/docker:/srv
    ports:
      - "8080:80"
    networks:
      - homelab-net
    restart: unless-stopped

networks:
  homelab-net:
    external: true
```

### B. Gitea (Single-Container SQLite Engine)

File: `/home/user/docker/gitea/docker-compose.yml`

```yaml
version: '3.8'

services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=sqlite3
      - GITEA__database__PATH=/data/gitea/gitea.db
    volumes:
      - ./data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3002:3000"
      - "2222:22"
    networks:
      - homelab-net
    restart: unless-stopped

networks:
  homelab-net:
    external: true
```

### C. MkDocs (Material Engine)

File: `/home/user/docker/mkdocs/docker-compose.yml`

```yaml
version: '3.8'

services:
  mkdocs:
    image: squidfunk/mkdocs-material:latest
    container_name: mkdocs
    volumes:
      - ./mkdocs.yml:/docs/mkdocs.yml
      - ./docs:/docs/docs
    ports:
      - "8000:8000"
    command: serve --dev-addr=0.0.0.0:8000
    networks:
      - homelab-net
    restart: unless-stopped

networks:
  homelab-net:
    external: true
```

### D. Obsidian (Containerized GUI)

File: `/home/user/docker/obsidian/docker-compose.yml`

```yaml
version: '3.8'

services:
  obsidian:
    image: linuxserver/obsidian:latest
    container_name: obsidian
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
      - ./vaults:/vaults
    ports:
      - "3001:3000"
    networks:
      - homelab-net
    restart: unless-stopped

networks:
  homelab-net:
    external: true
```

---

## 5. Deployment & Bootstrap Runbook

Execute these steps on the host machine using an account with UID `1000` (replace `user` with your actual username).

### Step 1: Initialize System Folders and Placeholders

Docker will initialize empty target directories as root if the files do not exist beforehand, so pre-create the tree first:

```bash
cd /home/user/docker

# 1. Directories
mkdir -p filebrowser/data
mkdir -p gitea/data
mkdir -p mkdocs/docs
mkdir -p obsidian/{config,vaults}

# 2. File placeholders
touch filebrowser/data/filebrowser.db
echo '{}' > filebrowser/data/settings.json
touch mkdocs/docs/index.md

# 3. Create initial home page for MkDocs
echo "# System Documentation Home" > mkdocs/docs/index.md

# 4. External Docker Network
docker network create homelab-net

# 5. Fix permissions
sudo chown -R 1000:1000 /home/user/docker
```

### Step 2: Start Services Individually

Navigate to each application folder to bring up its stack:

```bash
# Gitea
cd /home/user/docker/gitea && docker compose up -d

# FileBrowser
cd /home/user/docker/filebrowser && docker compose up -d

# MkDocs
cd /home/user/docker/mkdocs && docker compose up -d

# Obsidian
cd /home/user/docker/obsidian && docker compose up -d
```

---

## 6. Migration and Disaster Recovery Procedures

Because all dependencies use relative paths mapped directly to local folders, server migration is straightforward.

### Backup Procedure

1. Gracefully bring down the containers to flush SQLite state to disk.
2. Archive the root docker directory:

```bash
tar -czpvf homelab_stack_backup.tar.gz /home/user/docker
```

### Restore Procedure (New Host)

1. Install Docker Engine and the Docker Compose plugin on the target machine.
2. Extract the archive directly to `/home/user/docker`:

```bash
tar -xzpvf homelab_stack_backup.tar.gz -C /
```

3. Re-create the network and restart:

```bash
docker network create homelab-net
for dir in gitea filebrowser mkdocs obsidian; do
  (cd /home/user/docker/$dir && docker compose up -d)
done
```
