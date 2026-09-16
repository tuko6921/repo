# 🔗 PCAP Merging – `merge_pcaps.ps1`

📥 **[Download the script](scripts/merge_pcaps.ps1)**

This PowerShell script merges all `.pcap` files found in a specified folder into a single `.pcap` output file using **`mergecap`**, a utility bundled with Wireshark.  
It's ideal for combining fragmented captures or consolidating PCAPs before filtering or analysis.

---

## 📜 Script Name

`merge_pcaps.ps1`

---

## ⚙️ General Usage Format

```powershell
.\merge_pcaps.ps1 `
  -InputFolder "<path_to_folder>" `
  -OutputFile "<merged_output.pcap>"
```

---

## ✅ Example

```powershell
.\merge_pcaps.ps1 `
  -InputFolder ".\pcap" `
  -OutputFile "merged_filtered.pcap"
```

This command merges all `.pcap` files found in the `.\pcap` directory (relative to the script’s location) and creates a file named `merged_filtered.pcap` in the same directory as the script.

---

## 🧼 Requirements

- [Wireshark](https://www.wireshark.org/download.html) must be installed on your system.
- The script expects `mergecap.exe` to be located at:

  ```
  C:\Program Files\Wireshark\mergecap.exe
  ```

  If Wireshark is installed elsewhere, update the `$mergecapPath` variable in the script to point to the correct location.

---

📚 **Resources**:
- [mergecap Documentation (Wireshark)](https://www.wireshark.org/docs/man-pages/mergecap.html)
- [Wireshark CLI Tools Overview](https://www.wireshark.org/docs/wsug_html_chunked/ChapterUseTools.html)
