# 🧱 PCAP Repacking – `repack_pcaps.ps1`

📥 **[Download the script](scripts/repack_pcaps.ps1)**

This PowerShell script takes a directory of `.pcap` files, merges them using `mergecap`, and then splits the merged file into smaller chunks using `editcap`.  
This is useful for normalizing capture files for analysis or dealing with large PCAPs by breaking them into manageable sizes.

---

## 📜 Script Name

`repack_pcaps.ps1`

---

## ⚙️ General Usage Format

```powershell
.epack_pcaps.ps1 `
  -InputFolder "<path_to_folder_with_pcaps>" `
  -ChunkSize <packets_per_file>
```

---

## ✅ Example

```powershell
.epack_pcaps.ps1 `
  -InputFolder ".\pcap" `
  -ChunkSize 1000
```

This command will:
1. Merge all `.pcap` files in the `./pcap` directory into a temporary merged file.
2. Split that file into multiple `.pcap` chunks, each with **1000 packets**.
3. Output files as `repacked_output_00000_20240403.pcap`, etc.

---

## 🧼 Requirements

- [Wireshark](https://www.wireshark.org/download.html) must be installed.
- `mergecap.exe` and `editcap.exe` must exist at:

  ```
  C:\Program Files\Wireshark\mergecap.exe
  C:\Program Files\Wireshark\editcap.exe
  ```

> If Wireshark is installed elsewhere, update the script paths accordingly.

---

## 🛡️ Execution Policy Note

If you're blocked from running the script, run this instead:

```powershell
powershell -ExecutionPolicy Bypass -File .\repack_pcaps.ps1 -InputFolder .\pcap -ChunkSize 1000
```

Or permanently allow local unsigned scripts:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

📚 **Resources**:
- [mergecap Documentation](https://www.wireshark.org/docs/man-pages/mergecap.html)
- [editcap Documentation](https://www.wireshark.org/docs/man-pages/editcap.html)
