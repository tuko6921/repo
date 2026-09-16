# Hosting and Downloading Files with Python's HTTP Server

## Host a file on your machine

Start a simple HTTP server on port `9999` from within the directory that contains the file you want to share:

```bash
cd /path/to/directory
python3 -m http.server 9999
```

The server stays running in the foreground. You can access it at:

```
http://localhost:9999
```

## Download the file from another machine

On the other machine, download the file using `wget` or `curl`, replacing `<IP-ADDRESS>` with the host machine's network address:

```bash
wget http://<IP-ADDRESS>:9999/myfile.txt
```

```bash
curl -O http://<IP-ADDRESS>:9999/myfile.txt
```

## Find the host machine's IP address

```bash
ip addr show
```

Or:

```bash
hostname -I
```

## Notes

- The downloader must be able to reach the host machine (same network, firewall rules permitting).
- Stop the server with `Ctrl+C`.

## Making it secure (HTTPS)

`python3 -m http.server` only supports plain HTTP — it has no HTTPS support. If you need encryption, use one of these alternatives:

- **`openssl` one-off TLS server:**

  ```bash
  openssl s_server -accept 9999 -cert cert.pem -key key.pem -WWW
  ```

- **`nginx` or `apache`** with a TLS certificate for a more robust setup.

- **`caddy`** which can auto-generate certificates:

  ```bash
  caddy file-server --listen :9999
  ```

Plain HTTP is generally fine for LAN transfers, but any traffic over the internet (or carrying sensitive data) should use TLS.
