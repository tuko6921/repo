<#
.SYNOPSIS
    Generate a protocol summary of a PCAP file using tshark.

.DESCRIPTION
    This script provides a quick overview of protocol distribution within a .pcap file.
    It uses `tshark` with the `-z io,phs` option and maps protocol names to friendly labels.

.PARAMETER InputFile
    The path to the input `.pcap` file.

.EXAMPLE
    .\summarize_pcap.ps1 -InputFile "example.pcap"
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$InputFile
)

# Path to tshark
$tsharkPath = "C:\Program Files\Wireshark\tshark.exe"

if (-not (Test-Path $tsharkPath)) {
    Write-Error "tshark.exe not found at: $tsharkPath. Please install Wireshark or adjust the path."
    exit 1
}

if (-not (Test-Path $InputFile)) {
    Write-Error "Input file not found: $InputFile"
    exit 1
}

# Print summary header
Write-Host ""
Write-Host "==== Protocol Summary for: $InputFile ===="
Write-Host ""

$tsharkOutput = & "$tsharkPath" -r $InputFile -q -z io,phs

# Protocol label mappings
$labelMap = @{
    "IP"       = "IPv4"
    "IPV6"     = "IPv6"
    "TCP"      = "TCP"
    "UDP"      = "UDP"
    "ICMP"     = "ICMP"
    "QUIC"     = "QUIC"
    "TLS"      = "TLS"
    "DNS"      = "DNS"
    "ARP"      = "ARP"
    "MDNS"     = "mDNS"
    "SSDP"     = "SSDP"
    "STP"      = "STP"
    "CDP"      = "CDP"
    "LLDP"     = "LLDP"
    "ETH"      = "Ethernet"
    "LLC"      = "LLC"
    "NTP"      = "NTP"
    "BROWSER"  = "Browser"
    "MAILSLOT" = "Mailslot"
    "SMB"      = "SMB"
    "NBDGM"    = "NBDGM"
    "LOOP"     = "Loopback"
    "DATA"     = "Data"
}

$ignoreList = @("TCP.SEGMENTS")
$protocolCounts = @{}

foreach ($line in $tsharkOutput) {
    if ($line -match '^\s*(\S+).*?frames:(\d+)') {
        $raw = $matches[1].ToUpper()
        $count = [int]$matches[2]

        if ($ignoreList -contains $raw) { continue }

        if ($protocolCounts.ContainsKey($raw)) {
            $protocolCounts[$raw] += $count
        } else {
            $protocolCounts[$raw] = $count
        }
    }
}

# Sort and print results
$sorted = $protocolCounts.GetEnumerator() | Sort-Object Value -Descending

foreach ($entry in $sorted) {
    $label = $labelMap[$entry.Key]
    if (-not $label) {
        $label = $entry.Key.Substring(0,1).ToUpper() + $entry.Key.Substring(1).ToLower()
    }
    Write-Host ("{0,-10}: {1,6} packets" -f $label, $entry.Value)
}

Write-Host ""
