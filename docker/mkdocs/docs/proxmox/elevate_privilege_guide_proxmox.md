# Elevating User Privileges on Proxmox

This guide documents how to grant a non-root user elevated permissions on a Proxmox VE host by editing the sudoers file. It covers the specific example of expanding a user's allowed `qm` (QEMU/KVM) commands.

## Background

On Proxmox, non-root users can be granted limited sudo access by adding entries to the sudoers file. Each entry specifies exactly which commands the user may run as root — nothing more. This follows the principle of least privilege.

## Scenario

A user was originally granted permission to run only one command:

```
username ALL=(ALL) /usr/sbin/qm importovf
```

The goal was to additionally allow VM restore so the user could restore virtual machine backups.

## Steps

### 1. Open the Sudoers File

Always edit the sudoers file using `visudo`, which validates syntax before saving and prevents lockouts:

```bash
sudo visudo
```

> **Warning:** Never edit `/etc/sudoers` directly with a text editor. A syntax error will break `sudo` for all users. `visudo` checks for errors before writing.

### 2. Locate the User's Existing Entry

Find the line granting the user access. In this case:

```
username ALL=(ALL) /usr/sbin/qm importovf
```

### 3. Add the New Command

Append the additional command(s) to the existing line, separated by a comma and space:

```
username ALL=(ALL) /usr/sbin/qm importovf *, /usr/sbin/qm restore *, /usr/sbin/qmrestore *
```

| Part | Meaning |
|------|---------|
| `username ALL=(ALL)` | The user `username` may run commands as any user/group on any host. |
| `/usr/sbin/qm importovf *` | Allowed to run `qm importovf` with any arguments. |
| `/usr/sbin/qm restore *` | Allowed to run `qm restore` with any arguments. |
| `/usr/sbin/qmrestore *` | Allowed to run the standalone `qmrestore` binary with any arguments. |

> **Note:** The `*` wildcard allows any arguments to be passed to the command. For tighter security, you can restrict specific arguments instead.

> **Warning:** `qm restore` and `qmrestore` are **not** the same thing. `qm restore` is a subcommand of the `qm` binary; `qmrestore` is a separate standalone binary. They perform the same restore operation but with **different argument order**:
>
> ```
> qm restore <vmid> <archive>        # VMID first
> qmrestore <archive> <vmid>          # archive first
> ```
>
> If you only add `/usr/sbin/qm restore`, calls to `qmrestore` (e.g. `sudo qmrestore archive.vma.zst 420 --storage VM`) will be denied. You need both.

### 4. Save and Exit

In `visudo`:

- Press `Esc` to ensure you are in normal mode (if using `vi`/`vim`).
- Type `:wq` and press `Enter` to write and quit.

If there are syntax errors, `visudo` will reject the change and prompt you to fix them.

### 5. Verify the Permissions

Switch to the user and test that the new command works:

```bash
su - username
sudo /usr/sbin/qm restore --help
```

If the entry is correct, the command will execute. If not, the user will see a sudoers denial message.

## Common `qm` Commands That May Be Useful

| Command | Description |
|---------|-------------|
| `qm importovf` | Import a VM from an OVF/OVA file |
| `qm restore` | Restore a VM from a backup archive |
| `qmrestore` | Standalone restore binary (archive-first argument order) |
| `qm start` | Start a virtual machine |
| `qm stop` | Stop a virtual machine |
| `qm shutdown` | Gracefully shut down a VM |
| `qm status` | Show the status of a VM |
| `qm list` | List all VMs on the host |

To grant access to additional commands, follow the same pattern:

```
username ALL=(ALL) /usr/sbin/qm importovf *, /usr/sbin/qm restore *, /usr/sbin/qmrestore *, /usr/sbin/qm start *
```

## Security Considerations

- **Grant only what is needed.** Each command added increases the user's power on the host.
- **Avoid `ALL=(ALL) ALL`** unless the user is fully trusted — this grants unrestricted root access.
- **Use `visudo` always.** A broken sudoers file disables all sudo access.
- **Wildcard arguments (`*`) are permissive.** Consider restricting arguments for sensitive commands.
