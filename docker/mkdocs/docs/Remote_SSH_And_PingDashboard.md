# 📡 One-Click SSH Dashboard with Ping Status

This guide walks you through setting up a web-based dashboard that:

- ✅ Displays a list of servers and network devices  
- ✅ Shows real-time online/offline status via ping  
- ✅ Allows one-click SSH access to servers  
- ✅ Supports both SSH-enabled and ping-only devices  
- ✅ Runs on **Windows**, built with **Python + Flask**

---

## 🧱 Project Structure

```
xymon_brainstorm/
├── app.py             # Flask app (web server + SSH logic)
├── hosts.json         # Device list (name, IP, user)
├── users.json         # Login credentials
└── templates/
    ├── index.html     # Dashboard UI
    └── login.html     # Login screen
```

---

## 🛠️ Setup Instructions (Windows)

### 1. ✅ Install Python and Flask

If not already installed:

```bash
pip install flask
```

---

### 2. ✅ Create Your SSH Key

In PowerShell or WSL:

```bash
ssh-keygen -t rsa -b 4096 -f C:\Users\Administrator\.ssh\xymon-access-key
```

Then, copy the `.pub` key to each remote server’s:

```bash
~/.ssh/authorized_keys
```

---

### 3. ✅ Add Devices to `hosts.json`

Example:

```json
[
  {
    "name": "console_node_1",
    "ip": "192.168.6.133",
    "user": "root"
  },
  {
    "name": "lab_switch_01",
    "ip": "192.168.6.205",
    "user": "N/A"
  }
]
```

> If `"user"` is `"N/A"` or blank, the device is treated as **ping-only**, and no SSH button will be shown.

---

### 4. ✅ Set Up Users in `users.json`

Example:

```json
{
  "admin": {
    "password": "password"
  },
  "martin": {
    "password": "pingisfun"
  }
}
```

---


---

### 🛠️ Updated: Set Up Users in `users.json` (Now Secure with Hashing)

> 🔐 Passwords should now be stored as **secure hashes**, not plain text.

Example:

```json
{
  "admin": {
    "password": "scrypt:32768:8:1$Smb24pmHohDEmCNv$eff1abee7145f65f0720cdbd2dc200538764ff81c70ed56a215e012fcc2e77556dd46fa70473a51b23ce8c9ecc913049199ce90faaf32c713f97f8b246a9177a"
  }
}
```

✅ This prevents plain-text password leaks and protects against brute-force attacks.

---

### 🔐 Generating Password Hashes (Helper Script)

You can generate password hashes using this Python snippet:

```python
from werkzeug.security import generate_password_hash

# Replace with your actual password
print(generate_password_hash("your_password_here"))
```

Copy the output into your `users.json`.

---

### 🔐 Verifying Passwords in `app.py`

In your login logic, make sure you check passwords like this:

```python
from werkzeug.security import check_password_hash

if username in users and check_password_hash(users[username]['password'], password):
    session['username'] = username
    return redirect(url_for('index'))
```


## 🚀 Running the Dashboard

From your project directory, launch the app:

```bash
python app.py
```

Then open your browser and visit:

```
http://localhost:5000
```

---

## ⚙️ How It Works

### 🟢 Ping Status

- Each device is pinged once per refresh (every 10 seconds)
- Online/offline status is updated using:

```html
<meta http-equiv="refresh" content="10">
```

---

### 🔐 SSH Access

- SSH sessions are launched with:

```bash
start cmd /k ssh -i KEY_PATH user@ip
```

- Requires your private key at:

```
C:\Users\Administrator\.ssh\xymon-access-key
```

---

### 🧼 Ping-Only Devices

If a device has:

```json
"user": "N/A"
```

Then:
- ✅ It still shows up in the dashboard
- ✅ Its ping status is monitored
- 🚫 No Launch button is shown (SSH is skipped)
