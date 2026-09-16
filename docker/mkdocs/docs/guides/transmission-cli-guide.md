# Installing & Using Transmission on AlmaLinux

Transmission is a lightweight BitTorrent client available for AlmaLinux. It is not in the default repos, so you must enable **EPEL** and **CRB** first.

## Enable Repositories

```bash
sudo dnf config-manager --set-enabled crb
sudo dnf install epel-release -y
```

Verify:

```bash
dnf repolist
```

## Install Transmission

For a desktop you can use the GTK app; for a headless server install the daemon and CLI:

```bash
sudo dnf install transmission-daemon transmission-cli -y
```

Verify:

```bash
transmission-daemon --version
```

## Optional: Run the Daemon as a Service

```bash
sudo systemctl enable --now transmission-daemon
sudo systemctl status transmission-daemon
```

## Download a Torrent

### Method 1: Daemon + transmission-remote (recommended for servers)

Queue a local torrent file or magnet link:

```bash
transmission-remote -a /path/to/file.torrent
transmission-remote -a "magnet:?xt=urn:btih:..."
```

List torrents to see the queue and IDs:

```bash
transmission-remote -l
```

Start a stopped torrent by ID:

```bash
transmission-remote -t 1 -s
```

### Method 2: Standalone transmission-cli

With your terminal open in the directory containing the `.torrent` file:

```bash
transmission-cli your-file.torrent
```

While running:
- Press `q` to quit the interactive view (stops the download when not using the daemon).
- Press `h` for other controls such as pausing or peer details.

Files are saved to the download directory (usually `~/Downloads` by default).

### Method 3: Web Interface

Open a browser and go to:

```
http://<your-server-ip>:9091
```

Click the open/folder icon in the top-left, upload your `.torrent` file, or paste a magnet link to begin.