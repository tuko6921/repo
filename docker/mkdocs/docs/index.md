# System Documentation Home

Welcome to the homelab documentation hub. This site hosts the Standard Operating Procedures (SOPs) and guides for the self-hosted stack.

## Application & OS Guides

- [Installing Firefox](guides/firefox-install-guide.md) — Firefox on AlmaLinux/RHEL
- [Installing VSCode](guides/vscode-install-guide.md) — VS Code on AlmaLinux/RHEL via CLI
- [Installing Homepage](guides/homepage-install-guide.md) — Self-hosted dashboard start page
- [Installing opencode](guides/opencode-install-guide.md) — opencode on Fedora/RHEL
- [BIS Student Survival Guide](guides/bis-survival-guide.md) — DND/BIS orientation reference

## Container & Sandbox Isolation

- [Isolated Firefox Sandbox in Docker](guides/firefox-sandbox.md) — hardened Firefox in a single container
- [Distrobox Guide](guides/rough_distrobox_guide.md) — AlmaLinux sandbox via Distrobox
- [Isolated AlmaLinux Docker Sandbox](docker_container_isolated_env.md) — Docker container sandbox guide
- [Self-Hosted Knowledge Base & Docs Stack](guides/homelab-stack-guide.md) — architecture & deployment of the homelab stack

## File Transfer & Hosting

- [SCP File Transfer Guide](guides/scp-guide.md)
- [Hosting Files with Python's HTTP Server](guides/http-server-guide.md)

## Network Isolation

- [Tailscale-Only Device Isolation](networking/tailscale-isolation-guide.md) — block LAN, Tailscale-only connectivity
- [One-Click SSH Dashboard with Ping Status](networking/Remote_SSH_And_PingDashboard/Remote_SSH_And_PingDashboard.md)
- [Running the SSH Dashboard App](networking/Remote_SSH_And_PingDashboard/Running_The_App.md)

## Monitoring

- [Zabbix Setup Guide](monitoring/zabbix-setup-guide.md)
- [Zabbix → Xymon-Style Dashboard Plan](monitoring/zabbix_xymon_dashboard_plan.md) — research & implementation plan
- [Xymon Display Icons — Reference Notes](monitoring/xymon_notes.md)

## Proxmox

- [Elevating User Privileges on Proxmox](proxmox/elevate_privilege_guide_proxmox.md) — sudoers & least privilege

## PCAP Toolkit

- [Toolkit Layout](pcap-toolkit/index.md)
- [Filtering PCAPs](pcap-toolkit/filter_pcaps.md)
- [Merging PCAPs](pcap-toolkit/merge_pcaps.md)
- [Splitting PCAPs](pcap-toolkit/split_pcap.md)
- [Repacking PCAPs](pcap-toolkit/repack_pcaps.md)
- [Summarizing PCAPs](pcap-toolkit/summarize_pcap.md)

## Training & Courses

- [Defence & Workplace Training Courses](courses/courses-index.md) — courses, materials, and certificates

## Internal Documentation

- [MkDocs Setup on AlmaLinux](internal/mkdocs_alma_setup.md)