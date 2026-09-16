# AlmaLinux 10.2 Hardened Build Guide

Lab build of a hardened (STIG-style) AlmaLinux 10.2 server running Zabbix monitoring + the Docker homelab stack.

**Target hardware profile:** 2 vCPU, 2 GB RAM, 2 x 60 GB virtual disks.

> **Read this before you start.** Every step has an explanation of what it does and why it matters. Run commands in order. Do not skip the reboots.

---

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [Host-side VM preparation (KVM)](#2-host-side-vm-preparation-kvm)
3. [Installing AlmaLinux 10.2 in the VM](#3-installing-almalinux-102-in-the-vm)
4. [Root account: password then lock](#4-root-account-password-then-lock)
5. [Remove wireless RPMs](#5-remove-wireless-rpms)
6. [Repos, full update, cleanup, reboot](#6-repos-full-update-cleanup-reboot)
7. [Zabbix repository](#7-zabbix-repository)
8. [Extra RPMs](#8-extra-rpms)
9. [OpenSCAP hardening (scan / remediate / tailor)](#9-openscap-hardening-scan--remediate--tailor)
10. [Re-deploying the Docker homelab stack](#10-re-deploying-the-docker-homelab-stack)
11. [Caveats, conflicts, and troubleshooting](#11-caveats-conflicts-and-troubleshooting)

---

## 1. Architecture overview

Goal: a production-style AlmaLinux 10.2 server, hardened to a corporate baseline, hosting:

- **Zabbix 7.4** (server + web + agent) with PostgreSQL database
- **Docker homelab stack** (Grafana, Gitea, homepage, etc., from the `docker/` folder)

Two disks on purpose:

| Disk | Size | Serves |
|------|------|--------|
| Disk 1 (`vda`) | 60 GB | OS + hardened partitions (boot, root, home, tmp, logs, audit, swap, var) |
| Disk 2 (`vdb`) | 60 GB | PostgreSQL data directory (`/var/lib/pgsql/data`) |

Separating the database onto its own physical disk keeps log/OS growth from ever starving the DB, and vice versa. This is a common corporate-hardening requirement.

**Phase map** (each is a section below):

| Phase | Purpose |
|-------|---------|
| 2-3 | Create the VM and install the OS with the hardened partition layout |
| 4 | Lock down the root account (set password, then disable password login) |
| 5 | Strip wireless drivers (servers don't need Wi-Fi) |
| 6 | Verified full update, remove firmware + old kernels |
| 7-8 | Add Zabbix repo, install logging/entropy/security tooling + Zabbix stack |
| 9 | Scan against the SSG "standard" profile, generate remediations, apply with exclusions |
| 10 | Bring over and re-create the Docker stack |
| 11 | Known conflicts and fixes |

> **FIPS warning (read now):** Zabbix's build will NOT work with FIPS mode enabled and the default crypto policy. You must keep FIPS disabled and (for initial build) use a relaxed crypto policy. This conflicts with some SCAP standard-profile settings, which is exactly why Section 9 covers the *tailoring file* (excluding rules that break Zabbix).

---

## 2. Host-side VM preparation (KVM)

This section runs on the **hypervisor** (the machine that will host the VM) — in this lab, the AlmaLinux 9.8 box that already runs the Docker stack.

### 2.1 Prerequisites on the host

- AlmaLinux (8/9/10) with KVM-capable CPU (`VT-x`/`AMD-V` confirmed)
- Enough free RAM for the VM (2 GB) — stop Docker containers first if needed
- ~130 GB free disk for the two 60 GB disks

### 2.2 Install the KVM stack

```bash
sudo dnf install -y qemu-kvm libvirt virt-manager virt-install virt-viewer
```

| Package | Why |
|---------|-----|
| `qemu-kvm` | The actual hypervisor/emulator |
| `libvirt` | Management daemon / API for VMs |
| `virt-manager` | GUI (VirtualBox-feel) front-end — "Virtual Machine Manager" |
| `virt-install` | CLI tool to script VM creation |
| `virt-viewer` | Console window used to see the VM screen |

Verify KVM is usable:

```bash
ls /dev/kvm && virsh version
# /dev/kvm printer = "KVM available"
```

### 2.3 Start the libvirt service + network

```bash
sudo systemctl enable --now libvirtd
sudo virsh net-start default && sudo virsh net-autostart default
```

- `libvirtd` is the daemon that manages all VMs. Without it nothing runs.
- The `default` network is a NAT network giving the VM outbound internet (needed during install and for `dnf update`).

Verify:

```bash
systemctl is-active libvirtd
virsh net-list --all            # should show default with active state
```

### 2.4 Download the ISO

You want the **DVD** image (full installer + all packages on-disk):

```bash
mkdir -p ~/Downloads/AlmaLinux-10.2-x86_64
# download Almalinux-10.2-x86_64-dvd.iso into that folder
```

DVD ISO = least network dependence during installation.

### 2.5 Create the VM (CLI method)

```bash
sudo mkdir -p /home/mjward/VMs

sudo virt-install \
  --name alma10-hardened \
  --memory 2048 --vcpus 2 \
  --os-variant almalinux10 \
  --disk path=/home/mjward/VMs/alma10-disk1.qcow2,size=60,bus=virtio,format=qcow2 \
  --disk path=/home/mjward/VMs/alma10-disk2.qcow2,size=60,bus=virtio,format=qcow2 \
  --location /home/mjward/Downloads/AlmaLinux-10.2-x86_64/AlmaLinux-10.2-x86_64-dvd.iso \
  --graphics spice --video qxl
```

What each flag does:

| Flag | Meaning |
|------|---------|
| `--memory 2048 --vcpus 2` | 2 GB RAM, 2 virtual CPUs (matches test spec) |
| `--os-variant almalinux10` | Tells libvirt the right chipset/driver defaults for Alma 10 |
| `--disk path=...size=60` | Creates a 60 GB **qcow2** sparse image (starts small, grows to 60 GB) |
| `bus=virtio` | Fast paravirtualized I/O drivers instead of emulated IDE |
| Second `--disk` | Disk 2 (`vdb`) — the dedicated DB disk |
| `--location <iso>` | Boots the installer from the DVD |
| `--graphics spice` | Spice console (mouse/keyboard/screen for the VM) |

If you prefer the GUI (**virt-manager**): New VM → select the ISO → 2 GB RAM / 2 CPUs → then in **Customize configuration before install** → Add Hardware → Storage → create the second 60 GB disk as `VirtIO`.

### 2.6 Power-on behavior

`virt-install` auto-boots and pops a console window (installing `virt-viewer` lets this work). If it exits, reconnect with:

```bash
sudo virsh start alma10-hardened
sudo virt-viewer alma10-hardened
```

**Take a snapshot before the install** so you can restart the whole walkthrough:

```bash
sudo virsh snapshot-create-as alma10-hardened pre-install \
  --description "clean state before anaconda install"
```

---

## 3. Installing AlmaLinux 10.2 in the VM

When the installer (Anaconda) loads:

1. **Language → continue.**
2. **Network & Host Name** — turn the interface ON (DHCP is fine for the lab), set a hostname e.g. `alma-hardened`.
3. **Installation Destination** — this is where the hardened partition layout happens (below).

### 3.1 Partitioning Disk 1 (the OS disk)

Choose **Custom partitioning**, select the 60 GB disk (`vda`). Create this layout:

| Mount Point | Size | Notes |
|-------------|------|-------|
| `/boot` | 768 MiB | Boot partition with kernel/initramfs |
| `/` | 8 GiB | Root filesystem |
| `/home` | 4 GiB | User homes |
| `/tmp` | 2 GiB | Temp workspace |
| `/var/tmp` | 2 GiB | Package/tools temp |
| `/var/log` | 5 GiB | System + app logs |
| `/var/log/audit` | 10 GiB | **Audit daemon records** (largest on purpose — audits can't be starved) |
| `swap` | 1 GiB | Half of RAM, per test spec |
| `/var` | *remaining* | Queue, spool, caches — absorbs all leftover space |

**Why so many partitions (hardening rationale):**

- A dedicated `/tmp` and `/var/tmp` prevents a runaway temp process from filling the root filesystem, and lets you mount them `noexec,nosuid,nodev`.
- Isolated `/var/log` means log flood → logs fill *their own* partition, not the whole box.
- `/var/log/audit` gets its own space because once audit logging fills, the system can halt — you never want it competing with `/var/log`.
- `/boot` 768 MiB comfortably holds several kernel updates.

**Recommended Filesystem mount options** (add in the mount-point options for hardening):

- `/tmp`: `nosuid,nodev,noexec`
- `/var/tmp`: `nosuid,nodev,noexec`
- `/home`: `nosuid,nodev`
- `/var`: `rw` (default)

> If you'd rather let SCAP apply these later, skip them here — Section 9's standard profile will enforce most of them.

### 3.2 Partitioning Disk 2 (the database disk)

Select the **second 60 GB disk** (`vdb`) and create:

| Mount Point | Size | Notes |
|-------------|------|-------|
| `/var/lib/pgsql/data` | *remaining (all 60 GB)* | PostgreSQL data home |

- `postgresql`/Zabbix DB server writes *only* here.
- Give it its own filesystem type (XFS is fine) — **do not** put it inside the `/var` partition, or the isolation benefit is lost.

### 3.3 Root password during install

- Set a **temporary** root password (the Section 4 hardening changes/locks it).
- Create your normal user (e.g. `alma`) as the admin user.

Then **Begin Installation** → reboot when done → log in with your normal user.

**Boot-time smoke test before continuing:**

```bash
cat /etc/almalinux-release     # AlmaLinux release 10.2...
lsblk                          # vda (60G) + vdb (60G) with your mount points
df -h /var/lib/pgsql/data      # should show ~60G from disk 2
```

---

## 4. Root account: password then lock

Locking root prevents any *password-based* SSH/login of root. Admins use `sudo` or key-based auth instead.

```bash
sudo passwd root
# New password: 6mt4wzEVh3+9Hv          <-- choose a REAL strong one
# Retype new password: 6mt4wzEVh3+9Hv

sudo passwd --status root
# root PS 2025-06-18 0 99999 7 -1 (Password set, SHA512 crypt.)

sudo passwd --lock root
# passwd: Success

sudo passwd --status root
# root LK ... (Password locked.)
```

Breakdown:

| Command | Effect |
|---------|--------|
| `passwd root` | Sets the root password (required first — locking a blank password is bad) |
| `passwd --status` | Shows state: `PS` = password set, `LK` = password locked |
| `passwd --lock` | Prepends `!` to the hashed password → password login deported/denied |

What stays true after locking:

- The root **account** still exists (UID 0, all its privileges).
- `sudo -i` / `su -` via an unlocked admin user still works.
- Password+SSH based root login is disabled.

> Your normal `alma` user must have `sudo` rights (`usermod -aG wheel alma`) or you'll lock yourself out of admin entirely.

---

## 5. Remove wireless RPMs

```bash
sudo dnf -y autoremove iwl*
```

| Piece | Meaning |
|-------|---------|
| `dnf autoremove` | Removes (now-unneeded) packages matching |
| `iwl*` | Intel Wireless (Wi-Fi/Bluetooth) drivers |

**Why before the update:** the *next* kernel (pulled by `dnf update`) will automatically re-detect and drag wireless kernel modules/firmware back in. `iwl*` are replaced by the newer `iwlwifi` wireless driver packages, so already-stale ones are gone before they can be re-bound.

After this your settings for `/etc/hosts`/SSH key still fine — nothing here touches SSH.

---

## 6. Repos, full update, cleanup, reboot

### 6.1 Verify the signing key

```bash
sudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-AlmaLinux-10
```

Imports AlmaLinux's official GPG key so dnf can cryptographically verify every package signature it fetches. Without it dnf refuses to install unsigned/foreign packages.

### 6.2 Full update + reboot

```bash
sudo dnf update -y
sudo reboot
```

`dnf update` brings kernel + everything to current. **Reboot** so you're running the new kernel (later steps reference the booted kernel).

### 6.3 After reboot: remove firmware + old kernels

```bash
sudo dnf -y remove linux-firmware
sudo dnf -y remove $(dnf repoquery --installonly --latest-limit=-1 -q)
```

| Command | What/Why |
|---------|----------|
| `remove linux-firmware` | Firmware blobs for hardware you don't have; drops hundreds of MB |
| `repoquery --installonly --latest-limit=-1` | Lists **all** installed kernels except the newest (`-1 = keep 1`) |
| `remove $(...)` | Removes every old kernel, keeping only the newest — frees `/boot` + `/usr` space |

Verify only one kernel remains:

```bash
rpm -q kernel
```

> **Warning:** verify the system still boots after removing old kernels **before** proceeding further.

---

## 7. Zabbix repository

```bash
sudo dnf install \
  https://repo.zabbix.com/zabbix/7.4/release/alma/10/noarch/zabbix-release-latest-7.4.el10.noarch.rpm
```

- Installs the Zabbix 7.4 repo definition + GPG key for **AlmaLinux 10** (`el10`).
- Makes the Zabbix server/web/agent/sql packages available to dnf.
- Package: `zabbix-release-latest-7.4.el10.noarch.rpm`.

Confirm it's enabled:

```bash
dnf repolist | grep -i zabbix
```

---

## 8. Extra RPMs

### 8.1 Logging + entropy

```bash
sudo dnf install rsyslog-gnutls rng-tools
```

| Package | Why |
|---------|-----|
| `rsyslog-gnutls` | Enables **encrypted remote logging** (syslog over TLS) for secure audit shipping |
| `rng-tools` | `rngd` feeds entropy from hardware RNG into the kernel pool — critical on a small VM where boot-time entropy is low (helps key generation, TLS, Zabbix crypto) |

### 8.2 Security scanner + benchmark

```bash
sudo dnf install openscap-scanner scap-security-guide
```

| Package | Why |
|---------|-----|
| `openscap-scanner` | `oscap` tool — performs compliance scans and applies remediations |
| `scap-security-guide` | Ships the SSG security profiles/datastreams for this OS (`/usr/share/xml/scap/ssg/content/`) |

### 8.3 The Zabbix server stack

```bash
sudo dnf install \
  zabbix-server-pgsql \
  zabbix-web-pgsql \
  zabbix-nginx-conf \
  zabbix-sql-scripts \
  zabbix-selinux-policy \
  zabbix-agent
```

| Package | Role |
|---------|------|
| `zabbix-server-pgsql` | Core Zabbix server (PostgreSQL backend) |
| `zabbix-web-pgsql` | Web front-end (PHP) for the Zabbix UI |
| `zabbix-nginx-conf` | Preconfigured nginx site for the web UI |
| `zabbix-sql-scripts` | Database schema/seed SQL files |
| `zabbix-selinux-policy` | SELinux policy module so Zabbix runs under targeted enforcement |
| `zabbix-agent` | The monitored-host agent (also lets the box monitor itself) |

> The DB is PostgreSQL on disk 2 (`/var/lib/pgsql/data`). Initialize it with `postgresql-setup --initdb`, then load the schema from `zabbix-sql-scripts`. The exact `zabbix-server.conf` DB host/user settings depend on whether you keep the DB on this box (native postgres) or move the stack to Docker (Section 10).

---

## 9. OpenSCAP hardening (scan / remediate / tailor)

The SSG datastream includes multiple government/corporate profiles. We use the **standard** (enterprise baseline) profile.

### 9.1 Find the datastream and profiles

```bash
ls /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

# List all profiles
sudo oscap info /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

# Confirm the standard profile exists
sudo oscap info /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml | grep -i standard
```

The **standard** profile = general production-server hardening (the "corporate baseline").

### 9.2 Set the profile as a variable

```bash
Id=xccdf_org.ssgproject.content_profile_standard

# Inspect what that profile would change
sudo oscap info --profile "$Id" /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml
```

> Note: only works if your shell keeps `$Id` around — export it if you switch terminals:
> `export Id=xccdf_org.ssgproject.content_profile_standard`

### 9.3 Audit scan (no changes)

```bash
sudo oscap xccdf eval \
  --profile "$Id" \
  --results /tmp/results.xml \
  --report /tmp/report.html \
  /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml
```

- `--results /tmp/results.xml` — machine-readable results
- `--report /tmp/report.html` — human-readable HTML report (open it, review what's failing)

If rules fail to evaluate due to missing CPE/OVAL content:

```bash
sudo oscap xccdf eval \
  --profile "$Id" \
  --results /tmp/results.xml \
  --report /tmp/report.html \
  --fetch-remote-resources \
  /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml
```

### 9.4 Remediation (auto-fix)

```bash
sudo oscap xccdf eval \
  --profile "$Id" \
  --remediate \
  --results /tmp/remediated_results.xml \
  --report /tmp/remediated_report.html \
  /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml
```

`--remediate` applies every failing rule it can fix automatically. **Expect a reboot afterward** (many fixes are in shipped config files only enforced at boot or service restart).

### 9.5 Generate remediation scripts (review before running)

```bash
# One script fixing all rules
sudo oscap xccdf generate fix \
  --profile "$Id" --fix-type bash \
  --output /tmp/all-remediations.sh \
  /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

# Script from an existing scan's results (only fixes what actually failed)
sudo oscap xccdf generate fix \
  --profile "$Id" --fix-type bash \
  --output /tmp/remediations.sh /tmp/results.xml
```

Why: review the script before executing — a "one-click remediate" can disable things you need (e.g., FIPS enforcement).

### 9.6 Generating a full security guide (documentation)

```bash
sudo oscap xccdf generate guide \
  --profile "$Id" --fetch-remote-resources \
  /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml > "$HOME/security_guide.html"
```

HTML reference of every rule — useful to justify exceptions to your compliance team.

### 9.7 Tailoring file (exclude rules that break Zabbix/FIPS)

The **tailoring file** is a small XML overlay that *unselects* rules from the base profile. This is how you keep the corporate baseline while skipping rules incompatible with Zabbix.

**Find the exact rule IDs to exclude:**

```bash
grep -oE 'id="xccdf_org.ssgproject.content_rule_[^"]+"' \
  /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml | grep -i "ssh"
# repeat with: firewall / crypto / fips / service_firewalld
```

**Example tailoring file** (skips firewalld daemon + default-zone rules):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xccdf:Tailoring xmlns:xccdf="National Institute of Standards and Technology" id="xccdf_custom_tailoring_file">
  <xccdf:benchmark href="/usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml"/>

  <xccdf:Profile id="xccdf_org.ssgproject.content_profile_standard_customized" extends="xccdf_org.ssgproject.content_profile_standard">
    <xccdf:title xml:lang="en">Enterprise Baseline with Zabbix/FIPS Exceptions</xccdf:title>
    <xccdf:description xml:lang="en">Corporate baseline minus rules that break Zabbix (firewall enforcement, crypto/FIPS).</xccdf:description>

    <!-- Excludes firewalld daemon enforcement -->
    <xccdf:select idref="xccdf_org.ssgproject.content_rule_service_firewalld_enabled" selected="false"/>
    <!-- Excludes default-zone changes -->
    <xccdf:select idref="xccdf_org.ssgproject.content_rule_set_firewalld_default_zone" selected="false"/>
    <!-- Enter your own exclusions here, e.g. crypto policy rules -->
  </xccdf:Profile>
</xccdf:Tailoring>
```

**Run the scan + remediate with the tailoring file:**

```bash
sudo oscap xccdf eval \
  --tailoring-file /tmp/tailoring.xml \
  --profile xccdf_org.ssgproject.content_profile_standard_customized \
  --remediate \
  --results /tmp/tailored_remediation_results.xml \
  --report /tmp/tailored_remediation_report.html \
  /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml
```

> Save the tailoring file in your repo (e.g. `alma_guide` folder) so the build is reproducible.

**FIPS + Zabbix conflict (the important one):**
Zabbix's initial build requires FIPS **off** and a relaxed crypto policy. If `oscap --remediate` enables FIPS (RHEL/Alma crypto-policy both customize and `fips-mode-setup --enable`), Zabbix will fail to start/build. Keep the system *out* of FIPS mode:

```bash
cat /proc/sys/crypto/fips_enabled    # 0 = disabled; 1 = enabled (bad for Zabbix)
sysctl crypto.fips_enabled

# If FIPS got enabled, disable + reboot:
sudo fips-mode-setup --disable && sudo reboot
```

---

## 10. Re-deploying the Docker homelab stack

The `docker/` folder from the previous host is portable **because it is plain source** (compose files + bind-mount data). Nothing needs `docker save`/`docker load`.

### 10.1 Move the folder

```bash
# From the OLD host (with the stack STOPPED first):
scp -r /home/mjward/docker user@<new-ip>:/home/mjward/   # recursively transfers the folder

# ON THE NEW HOST:
docker --version
docker compose version
```

> **Critical:** stop the stack on the old host before `scp` so `zabbix/pg-data` isn't copied mid-write. PostgreSQL data copied while running can be corrupt on arrival.

### 10.2 The data that comes with you

| Data | Where it lives | Comes with the copy? |
|------|----------------|----------------------|
| Zabbix history/trends/hosts | `zabbix/pg-data/` (Postgres bind mount) | Yes ✅ |
| Grafana dashboards + Zabbix datasource | `grafana/provisioning/` | Yes ✅ |
| Docker images | n/a (rebuilt) | No — recreated by `docker compose up -d --build` |
| Postgres data (Grafana's named volume `grafana-data`) | host volume | No — only holds UI-time settings, not history |

**Grafana stores no Zabbix history** — it queries Zabbix live. All history lives in Postgres `pg-data`.

### 10.3 Pre-flight on the new host

```bash
# homelab-net is declared external in the compose files:
docker network create homelab-net

# verify the .env files made the trip (they hold secrets like ZABBIX_API_TOKEN):
ls -la /home/mjward/docker/*/.env
```

### 10.4 Bring it up

```bash
cd /home/mjward/docker/zabbix && docker compose up -d --build
cd /home/mjward/docker/grafana && docker compose up -d --build
# ...repeat for each app (gitea, homepage, wiki, ...)
```

`docker compose up -d --build` recreates images from the Dockerfiles and mounts the copied bind-mount data — that's how everything (including historical DB data) is "rebuilt" rather than restored.

### 10.5 Point equipment at the new server

Zabbix **agents on your actual devices** still report to the old IP. Reconfigure each host's `Server=`/`ServerActive=` to the new box (and re-open port `10051` on the new firewall as needed):

```bash
sudo firewall-cmd --permanent --add-port=10051/tcp && sudo firewall-cmd --reload
```

---

## 11. Caveats, conflicts, and troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Zabbix fails to start/build | FIPS enabled or crypto-policy too strict | `/proc/sys/crypto/fips_enabled` must be `0`; `update-crypto-policies` to default/LEGACY for initial build |
| SCAP remediate switches crypto/FIPS | standard profile contains crypto-policy rules | Use the tailoring file to unselect those rules, or disable FIPS afterward |
| `oscap` errors about missing OVAL content | Offline scan missing remote defs | add `--fetch-remote-resources` |
| VM can't install / no network | libvirtd not running or NAT network down | `sudo virsh net-start default`; `systemctl status libvirtd` |
| No console window from CLI | `virt-viewer` missing | `sudo dnf install virt-viewer`, then `sudo virt-viewer alma10-hardened` |
| Root login rejected after hardening | Expected — password locked | admin user through `sudo`; verify with `sudo -i` |
| Only one kernel shows after cleanup, boot fails | Removed the running kernel | Boot old kernel from grub; re-install: `dnf install kernel-$(uname -r)` |
| Grafana can't reach `zabbix-web` after move | Datasource URL is a DNS service name, unreachable across hosts | Edit `grafana/provisioning/datasources/zabbix.yaml` URL to the host/IP running Zabbix, or recreate the Zabbix stack locally |
| Postgres won't start after copy | `pg-data` copied while running or permissions wrong | restart Postgres **before** copying; fix `chown -R` to the postgres uid used by the container |
| Low disk on hypervisor | qcow2 sparse images grew | re-run `scp`/clone with `--sparse`, or delete and recreate VM |

### "Restore this build from scratch" checklist

```text
1. virt-install the VM (Section 2.5)        2. Partition like Section 3
3. Root lock (4)                           4. wireless cleanup (5)
5. key import + update + reboot (6)        6. remove firmware/kernels (6.3)
7. zabbix repo (7)                         8. extra rpms (8)
9. SCAP audit/remediate + tailor (9)      10. copy docker/ + compose up (10)
11. reconfigure equipment agents (10.5)
```