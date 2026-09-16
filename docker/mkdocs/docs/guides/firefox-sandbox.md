# Isolated Firefox Sandbox in Docker

This guide documents how to run an isolated Firefox browser inside a single Docker container, accessed through a web interface at `http://localhost:5800`. The container is hardened and its profile data is persisted to a local directory.

## Overview

The `jlesage/firefox` image bundles everything needed in one container:

- Firefox
- A virtual X server (Xvfb)
- A VNC server
- The noVNC web interface

All in one container — no extra software or client tools required on the host.

## Setup Steps

### 1. Create the Data Directory

This directory holds the Firefox profile (bookmarks, cookies, history) and persists across restarts:

```bash
mkdir -p ~/firefox-sandbox
```

### 2. Pull the Image

```bash
docker pull jlesage/firefox
```

### 3. Run the Container

First, if you have a previous broken attempt, remove it:

```bash
docker rm -f firefox
```

Start the isolated browser in the background with hardening applied:

```bash
docker run -d \
  --name firefox \
  --restart=unless-stopped \
  --security-opt no-new-privileges \
  --memory=2g \
  --cpus=2 \
  -e USER_ID="$(id -u)" \
  -e GROUP_ID="$(id -g)" \
  -e TAKE_CONFIG_OWNERSHIP=1 \
  -p 127.0.0.1:5800:5800 \
  -v ~/firefox-sandbox:/config \
  jlesage/firefox
```

> **Note:** `docker run -d` is a command typed into the terminal on the Docker host, not a file. On success it prints a container ID.

> **Warning:** Do **not** add `--cap-drop=ALL` here. It removes the `CAP_DAC_OVERRIDE` capability that the image's root init needs to write to and fix ownership of the `/config` mount. Without it, startup fails with `mkdir: can't create directory '/config/var/': Permission denied` and the container loops restarting. The app still runs as non-root without this flag.

### 4. Access the Browser

Open a normal web browser and go to:

```
http://localhost:5800
```

You get a full Firefox interface with working keyboard and mouse.

### 5. Copy/Paste Between the Container and Your Machine

Clipboard is shared through the noVNC clipboard drawer, not automatically. To copy text out of the container:

1. In the container Firefox, press `Ctrl+C` on the text you want (it goes onto Firefox's clipboard).
2. Click the **noVNC sidebar** (toggle at the left edge of the remote screen) to open the panel.
3. Open the **Clipboard** tab — the copied text should appear there.
4. `Ctrl+A` / `Ctrl+C` the text, then paste it normally into local apps.

To paste **into** the container: copy text locally, open the same Clipboard drawer, paste it there, then paste into Firefox.

> If the Clipboard tab is not visible, use the eye/arrow icon in the noVNC left panel or Settings → **Clipboard** to enable it.

## How Persistence Works

Your entire browser state — logins, bookmarks, cookies, history, and settings — lives **on the host disk** at

```
/home/admin/firefox-sandbox/
```

(the host user's `~/firefox-sandbox`, mapped into the container as `/config`). The profile data sits under subdirectories inside it:

```
~/firefox-sandbox/
├── firefox/   # Firefox profile (logins, bookmarks, cookies, history, prefs)
├── ssl/       # TLS certs for the web UI
└── var/       # runtime state
```

Key behaviors:

- **Logins and settings persist.** Anything you save while using the container browser is written to that directory and survives `docker stop`/`docker start`.
- **Removing the container does NOT reset the browser.** `docker rm firefox` deletes only the container; the `~/firefox-sandbox` directory and its data remain. Re-running the `docker run` command restores the *same* browser state, not a fresh one.
- **Deleting the folder starts fresh.** Removing `~/firefox-sandbox` erases all saved state permanently. The next run re-creates the directory structure and Firefox starts with a brand-new empty profile.

## Removing the Container and Its Data

This fully tears down the isolated browser: the container **and** all saved profile data (logins, bookmarks, cookies, history, settings).

```bash
# 1. Stop and remove the running container
docker rm -f firefox

# 2. Permanently delete the saved browser state
rm -rf ~/firefox-sandbox
```

> **Note:** `docker rm -f` must come before `rm -rf`. While the container is running, the mount keeps the old directory open, so deleting under it may not fully take effect until the container is stopped.

These two steps are irreversible — after `rm -rf ~/firefox-sandbox` the browser state is gone for good.

## Bringing Up a Fresh Container and Data

After (or instead of) the removal above, this starts a brand-new browser with an empty profile / fresh data directory. Run from the host, in a terminal:

```bash
docker run -d \
  --name firefox \
  --restart=unless-stopped \
  --security-opt no-new-privileges \
  --memory=2g \
  --cpus=2 \
  -e USER_ID="$(id -u)" \
  -e GROUP_ID="$(id -g)" \
  -e TAKE_CONFIG_OWNERSHIP=1 \
  -p 127.0.0.1:5800:5800 \
  -v ~/firefox-sandbox:/config \
  jlesage/firefox
```

What happens:

- If `~/firefox-sandbox` was deleted (or was never created), the image's init scripts re-create the directory structure (`TAKE_CONFIG_OWNERSHIP=1` sets correct ownership) and Firefox starts with a brand-new empty profile.
- If `~/firefox-sandbox` still has data and you run this **without** removing it first, you get the *same* browser profile back, not a fresh one.

For a clean, fresh browser, you must do the **Remove** section first, then this one. Finally, open `http://localhost:5800` to access the new browser.

## Verifying Isolation

Container-level checks:

```bash
# Is the container running?
docker ps -a

# Check the startup log for errors
docker logs firefox | tail -20

# Confirm Firefox is bound to localhost only, not the public network
docker port firefox

# Confirm Firefox runs as your UID, not root
docker exec firefox ps aux

# Confirm no unexpected user account is present
docker exec firefox cat /etc/passwd
```

## Useful Container Commands

| Command | Description |
|---------|-------------|
| `docker ps` | Show running containers |
| `docker stop firefox` | Stop the browser (profile persists) |
| `docker start firefox` | Start it again later |
| `docker logs firefox` | View container logs |
| `docker rm firefox` | Remove the container (profile directory survives) |

## What the Flags Do

| Flag | Meaning |
|------|---------|
| `--name firefox` | Names the container `firefox` |
| `--restart=unless-stopped` | Auto-restarts on reboot/crash |
| `--security-opt no-new-privileges` | Prevents privilege escalation within the container |
| `--memory=2g --cpus=2` | Limits browser to 2 GB RAM and 2 CPUs |
| `-e USER_ID="$(id -u)" -e GROUP_ID="$(id -g)"` | Runs Firefox as your non-root UID/GID (auto-detected) |
| `-e TAKE_CONFIG_OWNERSHIP=1` | Allows init to set ownership of `/config` to the app user |
| `-p 127.0.0.1:5800:5800` | Web UI accessible only from this machine (localhost) |
| `-v ~/firefox-sandbox:/config` | Stores profile data in the directory |

> **Note:** `--cap-drop=ALL` was considered and deliberately omitted. See the warning in Step 3.

## Security Considerations

- **Ports are bound to localhost only.** Nothing is exposed to the network. For remote access, use an SSH tunnel (`ssh -L 5800:localhost:5800 user@host`) rather than opening ports.
- **`no-new-privileges` and a non-root app user** keep the browser from escalating privileges. The app never runs as root.
- **Resource limits prevent resource exhaustion.**
- **`--restart=unless-stopped`** keeps it available but manual `docker stop` still works.

## Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| `[cont-init] 09-var-dirs.sh: mkdir: can't create directory '/config/var/': Permission denied` + container restarts | `--cap-drop=ALL` removed `CAP_DAC_OVERRIDE`, so init root can't write to the bind mount. Recreate without `--cap-drop=ALL` (Option A). |
| "Unable to connect" at `localhost:5800` | Container crashed or still starting. Check `docker ps -a` and `docker logs firefox`; wait ~15s after start. |
| Name conflict on `docker run` | A `firefox` container already exists. Run `docker rm -f firefox` first. |
| Browser can't access the internet | Host firewall or company proxy. Check `docker logs firefox` for proxy errors. |