# ✂️ PCAP Splitting – `split_pcap.ps1`

📥 **[Download the script](scripts/split_pcap.ps1)**

This PowerShell script splits a large `.pcap` file into multiple smaller `.pcap` files based on a specified number of packets per file.  
It uses **`editcap`**, a utility included with Wireshark, to perform the splitting.

---

## 📜 Script Name

`split_pcap.ps1`

---

## ⚙️ General Usage Format

```powershell
.\split_pcap.ps1 `
  -InputFile "<your_file>.pcap" `
  -PacketsPerSplit <packet_count>
```

---

## ✅ Example

```powershell
.\split_pcap.ps1 `
  -InputFile ".\captures\full_session.pcap" `
  -PacketsPerSplit 50000
```

This command splits the `full_session.pcap` file into multiple files, each containing up to 50,000 packets.  
The output files will be named like:

```
full_session_split_00000_00001.pcap
full_session_split_00001_00002.pcap
...
```

---

## 🧼 Requirements

- [Wireshark](https://www.wireshark.org/download.html) must be installed on your system.
- The script expects `editcap.exe` to be located at:

  ```
  C:\Program Files\Wireshark\editcap.exe
  ```

  If Wireshark is installed elsewhere, update the `$editcapPath` variable in the script to match your system.

---

📚 **Resources**:
- [editcap Documentation (Wireshark)](https://www.wireshark.org/docs/man-pages/editcap.html)
- [Wireshark CLI Tools Overview](https://www.wireshark.org/docs/wsug_html_chunked/ChapterUseTools.html)
