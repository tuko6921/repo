# 📊 PCAP Summary – `summarize_pcap.ps1`

📥 **[Download the script](scripts/summarize_pcap.ps1)**

This PowerShell script generates a summary of protocol usage in a `.pcap` file by parsing it with **`tshark`**, a command-line utility bundled with Wireshark.  
It counts packets for each protocol and prints a nicely formatted overview, useful for quick inspection of traffic distribution.

---

## 📜 Script Name

`summarize_pcap.ps1`

---

## ⚙️ General Usage Format

```powershell
.\summarize_pcap.ps1 `
  -InputFile "<your_file>.pcap"
```

> 💡 You must provide the full or relative path to a valid `.pcap` file.

---

## ✅ Example

```powershell
.\summarize_pcap.ps1 merged_output.pcap
```

This command will generate a protocol summary of `merged_output.pcap`, displaying packet counts for each protocol found.

---

### 🧪 Sample Output

```
==== Protocol Summary for: merged_output.pcap ====

Ethernet  :   2720 packets
IPv4      :   2630 packets
UDP       :   2266 packets
QUIC      :   1729 packets
Data      :    554 packets
TCP       :    349 packets
TLS       :    141 packets
LLC       :     52 packets
STP       :     51 packets
ARP       :     26 packets
ICMP      :     16 packets
DNS       :     14 packets
SSDP      :     13 packets
Loopback  :     10 packets
mDNS      :      2 packets
NTP       :      2 packets
Browser   :      1 packets
CDP       :      1 packets
LLDP      :      1 packets
Mailslot  :      1 packets
SMB       :      1 packets
IPv6      :      1 packets
NBDGM     :      1 packets
```

---

## 🧼 Requirements

- [Wireshark](https://www.wireshark.org/download.html) must be installed on your system.
- The script expects `tshark.exe` to be located at:

  ```
  C:\Program Files\Wireshark\tshark.exe
  ```

  If Wireshark is installed elsewhere, update the `$tsharkPath` variable inside the script.

---

📚 **Resources**:
- [tshark -z io,phs documentation](https://www.wireshark.org/docs/man-pages/tshark.html)
- [Wireshark CLI Tools Overview](https://www.wireshark.org/docs/wsug_html_chunked/ChapterUseTools.html)
