# SCP File Transfer Guide

## Copy Files

### Single File

```bash
scp /path/to/file.txt user@host:/remote/path/
```

### All Files in a Folder (Recursive)

```bash
scp -r /path/to/folder user@host:/remote/path/
```

## Zip Before Transfer

Compress a file into a zip archive on the local machine, then send it to the remote home directory:

### Zip the file

```bash
zip archive_name.zip filename.txt
```

Verify: `ls -l archive_name.zip` confirms the zip was created in your current directory.

### Zip all contents of a folder

```bash
zip -r archive_name.zip /path/to/folder
```

`-r` is **required** for folders — it recurses into the folder and includes the contents. Without it, `zip` skips directories entirely.

Extract it with:

```bash
unzip archive_name.zip
```

### tar alternative (more common on Linux)

```bash
# Create (compress) a folder
tar czf archive_name.tar.gz /path/to/folder

# Extract
tar xzf archive_name.tar.gz
```

`tar` uses the same idea — folders need a flag to include their contents — but the flags mean different things (`-c` create, `-x` extract, `-z` gzip, `-f` file). Prefer `tar` on Linux machines; `zip` is more familiar on Windows/macOS. The trailing-slash rule in [Tips](#tips) applies to both.

### Send it via SCP

```bash
scp archive_name.zip username@remote_ip:~
```

Replace:

- `archive_name.zip` — the zip file you created
- `username` — login user on the remote machine
- `remote_ip` — IP address of the remote machine

The `~` targets the remote user's home directory.

Verify: the terminal shows `100%` transfer, or log in and run `ls ~`.

## Move/Rename Files via SSH

SCP does not support moving directly. Use `ssh` with `mv`:

```bash
ssh user@host "mv /remote/path/file.txt /remote/path/renamed.txt"
```

### Move Entire Folder

```bash
ssh user@host "mv /remote/path/folder /remote/path/new_folder"
```

## Useful Flags

| Flag | Description |
|------|-------------|
| `-r` | Recursive — copy directories and their contents |
| `-P` | Specify a custom SSH port |
| `-p` | Preserve file modification times and permissions |
| `-C` | Enable compression during transfer |

## Tips

- Trailing `/` on source copies the **contents**; no trailing `/` copies the **folder itself**.
- Use `-P 2222` if your SSH runs on a non-standard port.

## Download from a Remote Machine

Copy a folder from a remote machine to your local machine:

```bash
scp -r immich@192.168.x.x:~/Downloads ~/Downloads/
```

**Note:** This creates `~/Downloads/Downloads/` (the remote folder inside your local Downloads). To avoid this:

```bash
# Option A: cd there first
cd ~/Downloads && scp -r immich@192.168.x.x:~/Downloads .

# Option B: copy contents only (no trailing slash on remote)
scp -r immich@192.168.x.x:~/Downloads/* ~/Downloads/
```

Make sure SSH (`sshd`) is running on the remote machine and you know the password or have SSH keys set up.
