# Tailscale-Only Device Isolation Guide

## Overview

This guide configures a Linux device to **only** communicate via Tailscale, blocking all local LAN traffic. The device becomes invisible to other devices on your home network while maintaining full Tailscale connectivity.

## Prerequisites

- Linux device (Debian/Ubuntu, RHEL/Fedora, Arch, etc.)
- Physical network interface (ethernet or WiFi)
- Internet connection (for Tailscale coordination)
- Root/sudo access

## Step 1: Install Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Start and enable the service:

```bash
sudo systemctl enable --now tailscaled
```

Authenticate and connect to your tailnet:

```bash
sudo tailscale up
```

Follow the authentication URL in your browser to link the device to your account.

## Step 2: Identify Network Interfaces

List all network interfaces:

```bash
ip a
```

Look for:
- `tailscale0` — Tailscale virtual interface (created automatically)
- Your physical interface (e.g., `eth0`, `enp3s0`, `wlan0`, `eno1`)

Note the physical interface name — you'll need it for firewall rules.

Check current interface details:

```bash
ip addr show tailscale0
ip addr show <physical-interface>
```

## Step 3: Configure Firewall Rules

### Option A: iptables (traditional)

Create a script or run commands directly:

```bash
# Flush existing rules
iptables -F INPUT
iptables -F OUTPUT
iptables -F FORWARD

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow Tailscale interface (all traffic)
iptables -A INPUT -i tailscale0 -j ACCEPT
iptables -A OUTPUT -o tailscale0 -j ACCEPT

# Allow established/related connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow DNS resolution (needed for Tailscale coordination)
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# Allow NTP (optional, for time sync)
iptables -A OUTPUT -p udp --dport 123 -j ACCEPT

# Drop all other traffic on physical interface
iptables -A INPUT -i eth0 -j DROP
iptables -A OUTPUT -o eth0 -j DROP
iptables -A FORWARD -i eth0 -j DROP
iptables -A FORWARD -o eth0 -j DROP
```

Replace `eth0` with your actual physical interface name.

### Option B: nftables (modern)

```bash
cat > /etc/nftables.conf << 'EOF'
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority filter; policy drop;

        # Allow loopback
        iif "lo" accept

        # Allow Tailscale
        iif "tailscale0" accept

        # Allow established/related
        ct state established,related accept

        # Allow DNS
        udp dport 53 accept
        tcp dport 53 accept

        # Drop everything else
        drop
    }

    chain output {
        type filter hook output priority filter; policy drop;

        # Allow loopback
        oif "lo" accept

        # Allow Tailscale
        oif "tailscale0" accept

        # Allow established/related
        ct state established,related accept

        # Allow DNS
        udp dport 53 accept
        tcp dport 53 accept

        # Allow NTP
        udp dport 123 accept

        # Drop everything else
        drop
    }

    chain forward {
        type filter hook forward priority filter; policy drop;
    }
}
EOF

sudo nft -f /etc/nftables.conf
```

## Step 4: Make Rules Persistent

### For iptables:

```bash
sudo apt install iptables-persistent    # Debian/Ubuntu
sudo yum install iptables-services      # RHEL/CentOS

sudo netfilter-persistent save
```

### For nftables:

```bash
sudo systemctl enable nftables
```

The rules in `/etc/nftables.conf` will load automatically on boot.

## Step 5: Verify Isolation

### Test Tailscale connectivity:

```bash
# Ping another device on your tailnet
tailscale ping <device-hostname-or-ip>

# Or use regular ping to a Tailscale IP
ping 100.x.x.x
```

### Test LAN isolation:

```bash
# Try pinging your router (should fail)
ping 192.168.1.1

# Try pinging other LAN devices (should fail)
ping 192.168.1.100

# Try accessing router web interface (should fail)
curl http://192.168.1.1
```

### Check active connections:

```bash
ss -tuln
netstat -tuln
```

You should only see Tailscale-related connections, not local LAN services.

## Step 6: Optional Hardening

### Disable WiFi/Ethernet entirely (if using Tailscale over another connection):

```bash
sudo ip link set eth0 down
```

**Warning:** This disables physical network. Only do this if your device has another internet path or you're sure Tailscale is working.

### Restrict Tailscale ACLs:

In the Tailscale admin console, add ACL rules to limit which devices/services this machine can access:

```json
{
  "acls": [
    {
      // Define specific access rules
    }
  ]
}
```

### Enable Tailscale SSH (if needed):

```bash
sudo tailscale up --ssh
```

## Troubleshooting

### Tailscale not working after firewall changes:

```bash
# Check Tailscale status
tailscale status

# Check interface exists
ip a show tailscale0

# Restart Tailscale
sudo systemctl restart tailscaled
```

### Need to temporarily disable firewall:

```bash
# iptables
sudo iptables -F
sudo iptables -P INPUT ACCEPT
sudo iptables -P OUTPUT ACCEPT

# nftables
sudo nft flush ruleset
```

### Check which interface Tailscale is using:

```bash
tailscale netcheck
```

### Logs:

```bash
sudo journalctl -u tailscaled -f
```

## Quick Reference

| Task | Command |
|------|---------|
| Check Tailscale status | `tailscale status` |
| Ping via Tailscale | `tailscale ping <host>` |
| List interfaces | `ip a` |
| Flush iptables | `sudo iptables -F` |
| Flush nftables | `sudo nft flush ruleset` |
| Save iptables rules | `sudo netfilter-persistent save` |
| Restart Tailscale | `sudo systemctl restart tailscaled` |
| View Tailscale logs | `sudo journalctl -u tailscaled -f` |

## Security Notes

- Tailscale uses WireGuard for encryption (ChaCha20/Poly1305)
- Traffic between Tailscale peers is end-to-end encrypted
- This setup prevents LAN devices from discovering or communicating with the isolated device
- The device can still reach the internet via Tailscale if configured as an exit node
- Consider using Tailscale ACLs for additional access control between tailnet devices
