1. Installed and Configured Docker
(Host Setup)

1.1. Installed and Configured Docker:Host Setup.Because Distrobox relies on a container backend, you installed Docker and added your user account to the docker group so you can manage containers without using sudo every time:

```Bash
sudo usermod -aG docker $USER
sudo systemctl start docker
sudo systemctl enable docker
```

Verification: Running docker ps executes successfully without permission errors.

2. Created the AlmaLinux Sandbox
(Container Creation)

You created your isolated Distrobox environment using the AlmaLinux image, naming it alma-sandbox:

```Bash
distrobox create --name alma-sandbox --image almalinux:latest
```
Verification: Running distrobox list displays your alma-sandbox container in the list.

3. Entered and Verified the Sandbox
(Container Access)

You accessed the container environment and confirmed you were running AlmaLinux (version 10.2):

```Bash
distrobox enter alma-sandbox
```

Verification: Running cat /etc/os-release inside the container confirms the operating system is AlmaLinux.

4. Added a Visual Prompt Indicator
(Customization)

To solve the confusion of having the same username inside and outside the container, you updated your shell configuration inside the box to show a clear badge:

```Bash
echo 'export PS1="[alma-sandbox] \u@\h:\w\$ "' >> ~/.bashrc
source ~/.bashrc
```

Verification: Your terminal prompt now clearly displays [alma-sandbox] whenever you are inside the container.

double check you are in the right os.

```Bash
cat /etc/os-release
```



/////////////////////////////////////
bash command to remove old distrobox and remake it with a different hostname

///////////////////////////////////////////

distrobox rm alma-sandbox


distrobox create --name alma-sandbox --image almalinux:latest --hostname alma-sandbox