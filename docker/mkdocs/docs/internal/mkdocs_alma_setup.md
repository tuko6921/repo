# 📘 MkDocs Setup

This guide walks you through installing and configuring [MkDocs](https://www.mkdocs.org/) on **AlmaLinux**.

---

## 📦 Prerequisites

- AlmaLinux 8 or 9  
- sudo privileges  
- Internet access  

---

## ⚙️ Step 1: Update System

```bash
sudo dnf update -y
```

---

## 🐍 Step 2: Install Python and pip

MkDocs requires Python 3.7 or higher.

### ✅ Check if Python is already installed

```bash
python3 --version
```

### 📦 Install Python and pip

```bash
sudo dnf install python3 python3-pip -y
```

---

## 📥 Step 3: Install MkDocs

You can install it globally or inside a virtual environment.

### 🌐 Global Installation

```bash
pip3 install mkdocs
```

### 🔒 Virtual Environment Installation

```bash
python3 -m venv mkdocs-env
source mkdocs-env/bin/activate
pip install mkdocs
```

---

## 🆕 Step 4: Create a New MkDocs Project

```bash
mkdocs new my-project
cd my-project
```

This creates:

```
my-project/
├── docs/
│   └── index.md
└── mkdocs.yml
```

---

## 🔥 Step 4: Open port 8000 in your firewall (if needed)

If you're using firewalld:
```bash
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## 🚀 Step 5: Serve the Site (Not Just Locally)

To make the site accessible to other devices on your network:

```bash
mkdocs serve -a 0.0.0.0:8000
```

Then open your browser and go to:

```
http://<device-ip>:8000
```

📌 Example:

```
http://192.168.6.132:8000
```

---

## 🎨 Optional: Use a Theme (e.g. Material for MkDocs)

Install the Material theme:

```bash
pip install mkdocs-material
```

Edit your `mkdocs.yml` file to use it:

```yaml
site_name: My Docs
theme:
  name: material
```

---

## 📚 Resources

- 🌐 [MkDocs Official Website](https://www.mkdocs.org/)
- 🎨 [Material for MkDocs Theme](https://squidfunk.github.io/mkdocs-material/)
- 📦 [MkDocs GitHub Deployment Guide](https://www.mkdocs.org/user-guide/deploying-your-docs/)
