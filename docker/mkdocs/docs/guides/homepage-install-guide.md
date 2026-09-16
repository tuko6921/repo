# Installing Homepage (Self-Hosted Dashboard)

Homepage is a self-hosted start page that shows all your services as clickable tiles, with container status and resource statistics. It auto-discovers running Docker containers.

## Create the directory

```bash
mkdir -p /home/user/docker/homepage/config
```

## Create the docker-compose.yml

File: `/home/user/docker/homepage/docker-compose.yml`

```yaml
version: '3.8'

services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    environment:
      - PUID=1000
      - PGID=1000
    volumes:
      - ./config:/app/config
      - /var/run/docker.sock:/var/run/docker.sock:ro
    ports:
      - "3000:3000"
    networks:
      - homelab-net
    restart: unless-stopped

networks:
  homelab-net:
    external: true
```

> **Note:** Mounting the Docker socket (`/var/run/docker.sock`) lets Homepage discover running containers and show their status. This is a secure-as-default setup, but be aware that the socket grants broad control over Docker.

## Start Homepage

```bash
cd /home/user/docker/homepage && docker compose up -d
```

Homepage is now available at `http://localhost:3000`.

## Configure your services

Homepage reads YAML config files from the `config/` directory. It hot-reloads them, so no container restart is needed after edits.

### services.yaml (the dashboard tiles)

File: `/home/user/docker/homepage/config/services.yaml`

```yaml
---
- Documentation:
    - MkDocs:
        icon: sh-mkdocs
        href: http://localhost:8000
        description: Documentation hub
        server: my-docker
        container: mkdocs
```

Each entry under a group name is a tile. The `server` and `container` fields tie the tile to a running container (defined in `docker.yaml`) so its status is displayed.

### docker.yaml (Docker connection)

File: `/home/user/docker/homepage/config/docker.yaml`

```yaml
---
my-docker:
  socket: /var/run/docker.sock
```

### bookmarks.yaml (link-only tiles)

File: `/home/user/docker/homepage/config/bookmarks.yaml`

```yaml
---
- Developer:
    - GitHub:
        - abbr: GH
          href: https://github.com/
```

Replace the default demo groups and bookmarks with your own entries.

## Auto-discovery with Docker labels

Instead of writing every tile by hand, Homepage can discover services automatically if you add labels to their compose files:

```yaml
labels:
  - "homepage.group=Documentation"
  - "homepage.name=MkDocs"
  - "homepage.icon=sh-mkdocs"
  - "homepage.href=http://localhost:8000"
  - "homepage.description=Documentation hub"
```

After adding labels to a service's `docker-compose.yml`, restart that service:

```bash
cd /home/user/docker/mkdocs && docker compose up -d
```

## Useful links

- Homepage docs: https://gethomepage.dev
- Configuration reference: https://gethomepage.dev/configs/

## Uninstall

```bash
cd /home/user/docker/homepage && docker compose down
rm -rf /home/user/docker/homepage
```
