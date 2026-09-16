# Installing Visual Studio Code on AlmaLinux/RHEL via CLI

This guide walks through installing VS Code using the yum package manager on AlmaLinux 9.8 or similar RHEL-based distributions.

## Prerequisites

- AlmaLinux 9.8 (or compatible RHEL-based system)
- sudo privileges
- Internet connection

## Installation Steps

### 1. Import Microsoft GPG Key

This verifies the authenticity of the VS Code package:

```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
```

### 2. Add VS Code Repository

Create a new repository file:

```bash
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
```

### 3. Install VS Code

Update package cache and install:

```bash
sudo yum install code
```

### 4. Launch VS Code

```bash
code
```

Or find it in your applications menu.

## Troubleshooting

- **GPG key errors**: Ensure the repository file has correct permissions and the GPG key is imported
- **Package not found**: Refresh the repository cache with `sudo yum clean all && sudo yum makecache`
- **Permission denied**: Make sure you're using sudo for all commands

## Verifying Installation

Check the installed version:

```bash
code --version
```

## Updating VS Code

VS Code will auto-update, or manually:

```bash
sudo yum update code
```