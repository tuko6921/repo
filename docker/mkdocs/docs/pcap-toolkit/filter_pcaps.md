# 🕵️ PCAP Filtering – `filter_pcaps.ps1`

📥 **[Download the script](scripts/filter_pcaps.ps1)**

This PowerShell script filters packets from a `.pcap` file using a **Wireshark Display Filter**.  
It uses `tshark` under the hood to apply the filter and export the result to a new file.

---

## 📜 Script Name

`filter_pcaps.ps1`

---

## ⚙️ General Usage Format

```powershell
.ilter_pcaps.ps1 `
  -InputFile "<InputFileName.pcap>" `
  -OutputFile "<OutputFileName>.pcap" `
  -Filter "<your_filter_expression>"
```

> 💡 Both input and output paths are relative to the current working directory. You can use absolute paths if preferred.

---

## 🕵️ Example: Display Filter

```powershell
.ilter_pcaps.ps1 `
  -InputFile "merged_output.pcap" `
  -OutputFile "udp_filtered.pcap" `
  -Filter "udp"
```

This filters for **UDP traffic** from `merged_output.pcap` and writes the result to `udp_filtered.pcap`.

---

## 📘 Common Display Filter Expressions

| Description                         | Display Filter Expression                        |
|-------------------------------------|--------------------------------------------------|
| All UDP traffic                     | `udp`                                            |
| All TCP traffic                     | `tcp`                                            |
| Traffic to/from a specific IP       | `ip.addr == 192.168.1.1`                         |
| Source IP                           | `ip.src == 192.168.1.1`                          |
| Destination IP                      | `ip.dst == 192.168.1.1`                          |
| TCP to port 443                     | `tcp.port == 443`                                |
| HTTP requests only                  | `http.request`                                   |
| DNS traffic                         | `dns`                                            |
| TLS handshake                       | `tls.handshake`                                  |
| TCP from a source port              | `tcp.srcport == 443`                             |
| TCP to a destination port           | `tcp.dstport == 443`                             |
| Packets between two IPs             | `ip.addr == 10.0.0.1 && ip.addr == 10.0.0.2`     |
| UDP from specific host              | `udp && ip.src == 10.0.0.5`                      |
| ARP or LLDP traffic                 | `arp || lldp`                                    |
| Exclude broadcast/multicast traffic| `!(eth.dst[0] & 1)`                              |

--
-

## ⚠️ Script Execution Note

If you receive a security warning when running the script, temporarily allow script execution with:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## 📝 Tips

- Display filters are protocol-aware and ideal for post-capture filtering.
- Use logical operators:
  - `&&` = AND
  - `||` = OR
  - `!`  = NOT
- Use parentheses to group logical conditions.

---

📚 **Resources**:
- [Wireshark Display Filter Reference](https://wiki.wireshark.org/DisplayFilters)
