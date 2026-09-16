# Comprehensive Guide: Building and Configuring an Isolated AlmaLinux Docker Sandbox

## 1. Architectural Overview

- **Host System:** Your main workstation (macOS/Linux/Windows with Docker Desktop or Engine).
- **Container Environment:**
  - **Name:** sandbox
  - **Base Image:** almalinux:latest (Enterprise Linux / RHEL-compatible)
  - **Container Directory:** /workspace (where all active work takes place)
- **Host Directory:** ~/sandbox (bind-mounted to the container's /workspace)

### Core Isolation Rule

- **Files & Code:** Bidirectionally synced between /workspace and ~/sandbox. Changes persist when the container stops and can be edited via VS Code on the host.
- **System Packages & Tools:** Installed strictly inside the container via `dnf`. They are sandboxed and do not affect the host system.

## 2. Container Lifecycle & Navigation

### Starting / Re-entering the Container

To start your container for the first time or re-enter an existing stopped container interactively:

```bash
docker start -ai sandbox
```

### Exiting the Container Shell

To leave the interactive shell without destroying the container:

```bash
exit
```

### Verifying Your Path Location

Minimal containers default to `/root` upon login. Always confirm you are in the shared directory before creating project files:

```bash
pwd
```

- **Correct:** `/workspace` — files sync to ~/sandbox and VS Code.
- **Incorrect:** `/root` — files are trapped in container private storage and invisible to the host.

## 3. Initializing Basic Utilities & The EPEL Repository

Minimal enterprise container images strip out non-essential utilities to remain lightweight. The following commands populate the container with foundational tools and enable community repositories for advanced utilities.

### Essential Packages Setup

Run the following commands inside your container to enable core commands:

```bash
# Enable EPEL (Extra Packages for Enterprise Linux) for advanced tools like htop
dnf install -y epel-release

# Install core utilities, networking tools, and process viewers
dnf install -y ncurses iproute tree htop nano neovim
```

### What Each Tool Does

- **ncurses:** Provides basic terminal control commands like `clear` (alternatively, use `Ctrl+L` as a shortcut).
- **iproute:** Provides networking diagnostics such as `ip a` to view network interfaces.
- **tree:** Generates a recursive, visual directory tree structure of your files and folders.
- **htop:** An interactive, visual process viewer for monitoring CPU and memory usage inside the container.
- **nano:** A simple, beginner-friendly terminal text editor for creating and editing files directly inside the container.
- **neovim:** A modern, extensible terminal-based text editor with advanced features like syntax highlighting, plugins, and scriptability.

## 4. Verifying System Isolation

To confirm that the sandbox boundaries are working correctly:

### Package Isolation Test

1. Install a tool like `tree` inside the container.
2. Run `tree --version` inside the container (works successfully).
3. Open a separate terminal tab on your host machine and run `tree --version` (returns command not found, proving the host system remains untouched).

### File Sync Test

1. Inside the container, ensure you are in `/workspace`, then create a directory (`mkdir temp`).
2. Open your host terminal and run `ls -l ~/sandbox` to confirm the `temp` folder appears immediately.

## 5. IDE Integration (VS Code)

Because the host directory `~/sandbox` is bind-mounted to the container's `/workspace`:

1. Open VS Code on your host machine.
2. Open the folder: `~/sandbox`.
3. Any scripts, code files, or documentation you write or edit locally in VS Code will instantly synchronize and execute inside your running container environment.

## 6. Initial Setup from Scratch

This section covers the complete setup assuming you only have Docker installed on your host machine and nothing else has been configured.

### Prerequisites

Ensure Docker is installed and running:

```bash
docker --version
```

If this returns a version number, you're ready to proceed. If not, install Docker Desktop (macOS/Windows) or Docker Engine (Linux) first.

### Step 1: Create the Host Directory

This directory will be bind-mounted into the container so your files persist:

```bash
mkdir -p ~/sandbox
```

### Step 2: Pull the AlmaLinux Image

Download the base image from Docker Hub:

```bash
docker pull almalinux:latest
```

### Step 3: Create and Start the Container

Run the container with the bind mount, a name, and interactive access:

```bash
docker run -d \
  --name sandbox \
  -v ~/sandbox:/workspace \
  almalinux:latest \
  tail -f /dev/null
```

| Flag | Purpose |
|------|---------|
| `-d` | Runs the container in the background (detached mode). |
| `--name sandbox` | Assigns the name `sandbox` for easy reference. |
| `-v ~/sandbox:/workspace` | Bind-mounts the host directory to the container's `/workspace`. |
| `tail -f /dev/null` | Keeps the container running idle so you can attach to it. |

### Step 4: Enter the Container

Attach an interactive shell to the running container:

```bash
docker exec -it sandbox /bin/bash
```

You are now inside the container. Verify your location:

```bash
pwd
```

This should return `/workspace`. From here, proceed to **Section 3** to install essential utilities.
