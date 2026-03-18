import json
import uuid
import urllib.request
import urllib.parse
import websocket
import asyncio
import os
import time
import random
import logging
import requests # Added for Supabase uploads
import shutil # Added for file operations
import asyncio
from fastapi import FastAPI, Form, UploadFile, File, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional, Dict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COMFYUI_SERVER_ADDRESS = os.getenv("COMFYUI_URL", "127.0.0.1:8188")
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Supabase Configuration (Set these on your VPS!)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key for backend uploads
BUCKET_NAME = "generated-content"

# --- NEW: WebSocket Route for Frontend ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, clientId: Optional[str] = None):
    await websocket.accept()
    logger.info(f"Frontend connected via WebSocket. ClientID: {clientId}")
    try:
        while True:
            # We just keep the connection alive. 
            # You can later use this to send real progress to the frontend!
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info(f"Frontend disconnected. ClientID: {clientId}")

# Job Queue
job_queue = asyncio.Queue()
job_results: Dict[str, dict] = {}

class ComfyUIClient:
    def __init__(self, server_address):
        self.server_address = server_address
        self.client_id = str(uuid.uuid4())

    def queue_prompt(self, prompt):
        p = {"prompt": prompt, "client_id": self.client_id}
        data = json.dumps(p).encode('utf-8')
        req = urllib.request.Request(f"http://{self.server_address}/prompt", data=data)
        return json.loads(urllib.request.urlopen(req).read())

    def get_image(self, filename, subfolder, folder_type):
        data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
        url_values = urllib.parse.urlencode(data)
        with urllib.request.urlopen(f"http://{self.server_address}/view?{url_values}") as response:
            return response.read()

    def get_history(self, prompt_id):
        with urllib.request.urlopen(f"http://{self.server_address}/history/{prompt_id}") as response:
            return json.loads(response.read())

    async def run_workflow(self, workflow):
        ws = websocket.WebSocket()
        ws.connect(f"ws://{self.server_address}/ws?clientId={self.client_id}")
        
        prompt_id = self.queue_prompt(workflow)['prompt_id']
        logger.info(f"Queued prompt ID: {prompt_id}")
        
        while True:
            out = ws.recv()
            if isinstance(out, str):
                message = json.loads(out)
                if message['type'] == 'executing':
                    data = message['data']
                    if data['node'] is None and data['prompt_id'] == prompt_id:
                        break
            else:
                continue
        
        ws.close()
        history = self.get_history(prompt_id)[prompt_id]
        
        # Find the output node
        for node_id in history['outputs']:
            node_output = history['outputs'][node_id]
            
            # Check for Images
            if 'images' in node_output:
                image = node_output['images'][0]
                return self.get_image(image['filename'], image['subfolder'], image['type']), "image/png"
            
            # Check for Videos/GIFs (VHS nodes often use 'gifs' or 'videos')
            video_key = next((k for k in ['gifs', 'videos', 'images'] if k in node_output), None)
            if video_key and (video_key != 'images' or node_output[video_key][0].get('format') == 'mp4'):
                video = node_output[video_key][0]
                mime = "video/mp4" if video.get('format') == 'mp4' else "image/gif"
                return self.get_image(video['filename'], video['subfolder'], video['type']), mime
        
        return None, None

comfy_client = ComfyUIClient(COMFYUI_SERVER_ADDRESS)

def upload_to_supabase(file_data, filename, mime_type):
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase credentials not set. Returning local path.")
        return None

    try:
        # 1. Upload to Supabase Storage
        # Path: bucket/filename
        url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": mime_type,
            "x-upsert": "true"
        }
        
        response = requests.post(url, headers=headers, data=file_data)
        if response.status_code == 200:
            # 2. Return the public URL
            return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
        else:
            logger.error(f"Supabase upload failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error uploading to Supabase: {str(e)}")
        return None

async def worker():
    logger.info("Worker started")
    while True:
        job_id, job_data = await job_queue.get()
        logger.info(f"Processing job {job_id}")
        job_results[job_id] = {"status": "processing", "progress": 0}
        
        try:
            # 1. Load Workflow
            workflow_path = f"workflows/{job_data['workflow_file']}"
            with open(workflow_path, "r") as f:
                workflow = json.load(f)

            # 2. Map Frontend Data to Workflow Nodes
            # NOTE: You MUST update these node IDs to match your specific JSON files!
            
            # Common mappings:
            # Prompt Node (CLIP Text Encode)
            if "6" in workflow: workflow["6"]["inputs"]["text"] = job_data['prompt']
            
            # Seed Node (KSampler)
            if "3" in workflow: workflow["3"]["inputs"]["seed"] = random.randint(0, 10**15)
            
            # Resolution (Empty Latent Image)
            if "5" in workflow:
                res_map = {"480p": (640, 480), "720p": (1280, 720), "1080p": (1920, 1080)}
                w, h = res_map.get(job_data['resolution'], (512, 512))
                workflow["5"]["inputs"]["width"] = w
                workflow["5"]["inputs"]["height"] = h

            # Duration (for video workflows)
            if job_data['type'] == 'video' and "duration_node_id" in workflow:
                # Example: mapping duration to frame count
                dur_map = {"5s": 24, "10s": 48, "15s": 72, "20s": 96}
                workflow["duration_node_id"]["inputs"]["frame_count"] = dur_map.get(job_data['duration'], 24)

            # 3. Run Workflow
            result_data, mime_type = await comfy_client.run_workflow(workflow)
            
            if result_data:
                ext = "mp4" if "video" in mime_type else "png"
                filename = f"{job_id}.{ext}"
                
                # Try to upload to Supabase first
                public_url = upload_to_supabase(result_data, filename, mime_type)
                
                if not public_url:
                    # Fallback to local file if Supabase fails or credentials missing
                    filepath = os.path.join(OUTPUT_DIR, filename)
                    with open(filepath, "wb") as f:
                        f.write(result_data)
                    
                    # For ngrok/VPS, this would be your public IP or domain
                    domain = os.getenv('DOMAIN', 'mite-next-grouper.ngrok-free.app')
                    public_url = f"https://{domain}/outputs/{filename}"
                
                job_results[job_id] = {"status": "completed", "url": public_url}
            else:
                job_results[job_id] = {"status": "failed", "error": "No output from ComfyUI"}

        except Exception as e:
            logger.error(f"Job {job_id} failed: {str(e)}")
            job_results[job_id] = {"status": "failed", "error": str(e)}
        
        job_queue.task_done()

async def cleanup_task():
    """Periodically deletes local files older than 1 hour."""
    while True:
        try:
            logger.info("Running cleanup task...")
            now = time.time()
            one_hour_ago = now - 3600
            
            if os.path.exists(OUTPUT_DIR):
                for filename in os.listdir(OUTPUT_DIR):
                    file_path = os.path.join(OUTPUT_DIR, filename)
                    if os.path.isfile(file_path):
                        if os.path.getmtime(file_path) < one_hour_ago:
                            os.remove(file_path)
                            logger.info(f"Deleted expired local file: {filename}")
            
            # Also clean up inputs folder
            if os.path.exists("inputs"):
                for filename in os.listdir("inputs"):
                    file_path = os.path.join("inputs", filename)
                    if os.path.isfile(file_path):
                        if os.path.getmtime(file_path) < one_hour_ago:
                            os.remove(file_path)
                            logger.info(f"Deleted expired input file: {filename}")
                            
        except Exception as e:
            logger.error(f"Error in cleanup task: {str(e)}")
            
        await asyncio.sleep(600) # Run every 10 minutes

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(worker())
    asyncio.create_task(cleanup_task())

@app.post("/api/generate")
async def generate(
    prompt: str = Form(...),
    duration: Optional[str] = Form(None),
    resolution: Optional[str] = Form(None),
    type: str = Form(...),
    subType: Optional[str] = Form(None),
    user_id: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    job_id = str(uuid.uuid4())
    
    # Determine which workflow file to use
    workflow_file = "image_gen.json"
    if type == "video":
        workflow_file = "txt2vid.json" if subType == "text-to-video" else "img2vid.json"
    
    job_data = {
        "prompt": prompt,
        "duration": duration,
        "resolution": resolution,
        "type": type,
        "subType": subType,
        "workflow_file": workflow_file
    }
    
    # If file uploaded, save it for ComfyUI to use
    if file:
        input_path = f"inputs/{job_id}_{file.filename}"
        os.makedirs("inputs", exist_ok=True)
        with open(input_path, "wb") as f:
            f.write(await file.read())
        job_data["input_file"] = input_path

    await job_queue.put((job_id, job_data))
    job_results[job_id] = {"status": "queued"}
    
    # For simplicity in this beginner setup, we'll wait for the result
    # In a real production app, you'd return the job_id and the frontend would poll
    while job_results[job_id]["status"] in ["queued", "processing"]:
        await asyncio.sleep(1)
    
    result = job_results[job_id]
    if result["status"] == "failed":
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {"url": result["url"]}

# Serve output files
from fastapi.staticfiles import StaticFiles
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
