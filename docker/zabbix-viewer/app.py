#!/usr/bin/env python3
"""Zabbix status board with Xymon-style look and feel."""

import os

from flask import Flask, Response, jsonify, render_template_string, send_from_directory

from board import build_board
from zabbix_extract import get_hosts, get_items, extract

app = Flask(__name__, static_folder="static", static_url_path="/static")


@app.route("/static/gifs/<path:filename>")
def xymon_gif(filename):
    return send_from_directory("static/gifs", filename)


@app.route("/static/xymonbody.css")
def xymon_css():
    return send_from_directory("static/gifs", "xymonbody.css")


INDEX_HTML = r"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Xymon-Style Status Board</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @import url("/static/xymonbody.css");

  body { margin:0; padding:10px 18px 40px; }
  h1 {
    font-family: sans-serif;
    font-size: 1.3rem;
    margin: 10px 0 4px;
    color: #FFFF00;
  }
  .updated { color: #888; font-size: .85rem; margin-bottom: 6px; }
  table.board {
    border-collapse: collapse;
    font-family: "Lucida Console", "Consolas", monospace;
    font-size: .92rem;
    margin-top: 6px;
  }
  table.board th {
    font-weight: bold;
    font-size: .82rem;
    color: #D8D8BF;
    padding: 3px 8px 1px;
    text-align: center;
    border-bottom: 1px solid #555;
  }
  table.board th:first-child {
    text-align: left;
  }
  table.board td {
    padding: 2px 8px;
    text-align: center;
    white-space: nowrap;
  }
  table.board td.host-cell {
    text-align: left;
    font-weight: bold;
    color: #D8D8BF;
  }
  table.board tr {
    background-color: #1a1a1a;
  }
  table.board tr:hover {
    background-color: #2a2a2a;
  }
  table.board td.minus {
    color: #555;
  }
  .bar {
    width: 6px;
    padding: 0 !important;
  }
  .bar.green  { background-color: #00cc00; }
  .bar.yellow { background-color: #ffcc00; }
  .bar.red    { background-color: #ff0000; }
  .bar.purple { background-color: #cc00cc; }
  .bar.blue   { background-color: #0066ff; }
  .bar.clear  { background-color: #cccccc; }
  .bar.unknown{ background-color: #666666; }
  .host-cell { padding-left: 10px !important; }
  .status-dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    image-rendering: pixelated;
  }
  .test-label {
    text-align: left !important;
    color: #ccc;
    font-weight: bold;
    padding-right: 12px;
  }
  a:link { color: #00FFAA; }
  a:visited { color: #FFFF44; }
</style>
</head>
<body>
<h1>Xymon Status Board</h1>
<div class="updated" id="updated">Loading...</div>
<div id="board"></div>
<script>
const GIF = '/static/gifs/';

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function load() {
  const r = await fetch('/api/board');
  if (!r.ok) { return; }
  const data = await r.json();
  document.getElementById('updated').textContent =
    'Last update: ' + new Date(data.updated * 1000).toLocaleString() +
    ' (' + data.rows.length + ' host(s), ' + (data.tests.length) + ' test(s))';

  let html = '<table class="board">';

  html += '<tr><th class="bar"></th><th></th>';
  for (const t of data.tests) {
    html += '<th>' + escapeHtml(t.label) + '</th>';
  }
  html += '</tr>\n';

  for (const row of data.rows) {
    html += '<tr>';
    html += '<td class="bar ' + escapeHtml(row.overall) + '" title="' + escapeHtml(row.overall) + '"></td>';
    html += '<td class="host-cell">' + escapeHtml(row.name) + '</td>';

    for (const t of data.tests) {
      const c = row.cells[t.id];
      if (c) {
        html += '<td><img class="status-dot" src="' + GIF + escapeHtml(c.gif)
          + '" ALT="' + escapeHtml(c.tooltip)
          + '" TITLE="' + escapeHtml(c.tooltip)
          + '" width="16" height="16" BORDER=0></td>';
      } else {
        html += '<td class="minus">-</td>';
      }
    }
    html += '</tr>\n';
  }

  html += '</table>';
  document.getElementById('board').innerHTML = html;
}

load();
setInterval(load, 15000);
</script>
</body>
</html>
"""


@app.route("/")
def index():
    return render_template_string(INDEX_HTML)


@app.route("/api/data")
def api_data():
    try:
        hosts = get_hosts()
        data = [extract(h, get_items(h["hostid"])) for h in hosts]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/board")
def api_board():
    try:
        hosts = get_hosts()
        data = [extract(h, get_items(h["hostid"])) for h in hosts]
        board = build_board(data)
        return jsonify(board)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health")
def health():
    return Response("ok", status=200, mimetype="text/plain")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8088"))
    app.run(host="0.0.0.0", port=port)