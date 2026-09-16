import concurrent.futures
import json
import os
import re
import shutil
import subprocess
import time
import uuid
from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import FileResponse, Response
from jinja2 import Environment, FileSystemLoader

app = FastAPI(title="AlmaLinux ISO Factory")
env = Environment(loader=FileSystemLoader("templates"))

BASE_ISO = "/iso-cache/AlmaLinux-9-latest-x86_64-dvd.iso"
OUTPUT_DIR = "/workspace/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
jobs = {}

def track_and_compile(job_id, ks_path, output_iso_path, output_filename):
    try:
        # Base size reference for percentage math
        base_size = os.path.getsize(BASE_ISO) if os.path.exists(BASE_ISO) else 1

        jobs[job_id]["stage"] = "Unpacking initrd & injecting kickstart configuration..."
        jobs[job_id]["progress"] = 12

        cmd = ["mkksiso", "--ks", ks_path, BASE_ISO, output_iso_path]
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

        # Monitor output file growth while subprocess executes
        while proc.poll() is None:
            time.sleep(1)
            if os.path.exists(output_iso_path):
                current_size = os.path.getsize(output_iso_path)
                # Map file size growth across the 20% - 95% range
                ratio = min(1.0, current_size / float(base_size))
                pct = int(20 + (ratio * 75))
                jobs[job_id]["progress"] = max(jobs[job_id]["progress"], pct)

                if ratio < 0.4:
                    jobs[job_id]["stage"] = "Repacking SquashFS & boot filesystem..."
                elif ratio < 0.85:
                    jobs[job_id]["stage"] = f"Mastering bootable ISO ({round(current_size / (1024**3), 2)} GB written)..."
                else:
                    jobs[job_id]["stage"] = "Finalizing image layout and MBR boot sectors..."

        if proc.returncode != 0:
            err_msg = proc.stderr.read().decode()
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = err_msg or "mkksiso exited with an error."
            return

        # Success
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["stage"] = "Compilation complete! Preparing download..."
        jobs[job_id]["progress"] = 100
        jobs[job_id]["download_url"] = f"/download/{output_filename}"

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
    finally:
        if os.path.exists(ks_path):
            os.remove(ks_path)

@app.get("/")
def serve_ui():
    with open("static/index.html") as f:
        content = f.read()
    return Response(
        content=content,
        media_type="text/html",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@app.get("/list-isos")
def list_isos():
    files = []
    total_iso_bytes = 0
    if os.path.exists(OUTPUT_DIR):
        for f in os.listdir(OUTPUT_DIR):
            if f.endswith(".iso"):
                full_path = os.path.join(OUTPUT_DIR, f)
                stat = os.stat(full_path)
                size_gb = round(stat.st_size / (1024**3), 2)
                total_iso_bytes += stat.st_size
                mtime = time.strftime('%b %d, %Y %I:%M %p', time.localtime(stat.st_mtime))
                
                meta_path = os.path.join(OUTPUT_DIR, f.replace(".iso", ".json"))
                config_data = {}
                if os.path.exists(meta_path):
                    try:
                        with open(meta_path, "r") as mf:
                            config_data = json.load(mf)
                    except Exception:
                        pass

                files.append({
                    "name": f,
                    "size": f"{size_gb} GB",
                    "date": mtime,
                    "raw_time": stat.st_mtime,
                    "config": config_data
                })

    files.sort(key=lambda x: x["raw_time"], reverse=True)
    _, _, free = shutil.disk_usage(OUTPUT_DIR)
    
    return {
        "files": files,
        "total_usage_gb": f"{round(total_iso_bytes / (1024**3), 2)} GB",
        "free_space_gb": f"{round(free / (1024**3), 2)} GB"
    }

@app.delete("/delete/{filename}")
def delete_file(filename: str):
    safe_name = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    meta_path = os.path.join(OUTPUT_DIR, safe_name.replace(".iso", ".json"))

    if os.path.exists(file_path):
        os.remove(file_path)
        if os.path.exists(meta_path):
            os.remove(meta_path)
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/download/{filename}")
def download_file(filename: str):
    safe_name = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path, filename=safe_name, media_type="application/octet-stream")

@app.post("/build")
def start_build(
    iso_name: str = Form(""),
    username: str = Form("almauser"),
    user_password: str = Form("AlmaLinux123!"),
    root_password: str = Form("AlmaLinux123!"),
    timezone: str = Form("America/Halifax"),
    keyboard: str = Form("us"),
    environment: str = Form("graphical")
):
    if not os.path.exists(BASE_ISO):
        raise HTTPException(status_code=400, detail=f"Base ISO missing from {BASE_ISO}.")

    clean_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', iso_name.strip())
    base_title = f"AlmaLinux-9-{username}-autoinstall" if not clean_name else (clean_name[:-4] if clean_name.endswith(".iso") else clean_name)

    output_filename = f"{base_title}.iso"
    meta_filename = f"{base_title}.json"
    output_iso_path = os.path.join(OUTPUT_DIR, output_filename)
    output_meta_path = os.path.join(OUTPUT_DIR, meta_filename)

    counter = 2
    while os.path.exists(output_iso_path):
        output_filename = f"{base_title}_{counter}.iso"
        meta_filename = f"{base_title}_{counter}.json"
        output_iso_path = os.path.join(OUTPUT_DIR, output_filename)
        output_meta_path = os.path.join(OUTPUT_DIR, meta_filename)
        counter += 1

    print(f"[BUILD] username={username!r} iso_name={iso_name!r} -> {output_filename}")

    template = env.get_template("ks.cfg.j2")
    rendered_ks = template.render(
        username=username,
        user_password=user_password,
        root_password=root_password,
        timezone=timezone,
        keyboard=keyboard,
        language="en_US.UTF-8",
        environment=environment
    )
    
    job_id = str(uuid.uuid4())
    ks_path = f"/tmp/ks-{job_id}.cfg"
    with open(ks_path, "w") as f:
        f.write(rendered_ks)

    config_metadata = {
        "custom_iso_name": output_filename,
        "username": username,
        "user_password": user_password,
        "root_password": root_password,
        "timezone": timezone,
        "environment": "Server with GUI (GNOME)" if environment == "graphical" else "Minimal (Headless)",
        "keyboard_layout": keyboard,
        "created_at": time.strftime('%Y-%m-%d %H:%M:%S')
    }
    with open(output_meta_path, "w") as mf:
        json.dump(config_metadata, mf, indent=2)

    jobs[job_id] = {
        "status": "building",
        "stage": "Initializing compilation workspace...",
        "progress": 5,
        "filename": output_filename
    }

    executor.submit(track_and_compile, job_id, ks_path, output_iso_path, output_filename)

    return {"job_id": job_id, "filename": output_filename}

@app.get("/job/{job_id}")
def check_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]
