# Installing opencode on Fedora/RHEL

## Prerequisites

```bash
sudo dnf install -y epel-release
sudo dnf install -y curl tar xclip wl-clipboard
```

## Install opencode

```bash
curl -fsSL https://opencode.ai/install -o /tmp/install.sh
bash /tmp/install.sh
```

## Run opencode

```bash
opencode
```
