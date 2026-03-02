import json
import uuid
import urllib.request
import urllib.parse
import websocket # websocket-client
from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COMFYUI_SERVER_ADDRESS = os.getenv("COMFYUI_URL", "127.0.0.1:8188")
CLIENT_ID = str(uuid.uuid4())

def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": CLIENT_ID}
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(f"http://{COMFYUI_SERVER_ADDRESS}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())

def get_image(filename, subfolder, folder_type):
    data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    url_values = urllib.parse.urlencode(data)
    with urllib.request.urlopen(f"http://{COMFYUI_SERVER_ADDRESS}/view?{url_values}") as response:
        return response.read()

def get_history(prompt_id):
    with urllib.request.urlopen(f"http://{COMFYUI_SERVER_ADDRESS}/history/{prompt_id}") as response:
        return json.loads(response.read())

def get_images(ws, prompt):
    prompt_id = queue_prompt(prompt)['prompt_id']
    output_images = {}
    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message['type'] == 'executing':
                data = message['data']
                if data['node'] is None and data['prompt_id'] == prompt_id:
                    break #Execution is done
        else:
            continue #previews are binary data

    history = get_history(prompt_id)[prompt_id]
    for node_id in history['outputs']:
        node_output = history['outputs'][node_id]
        if 'images' in node_output:
            images_output = []
            for image in node_output['images']:
                image_data = get_image(image['filename'], image['subfolder'], image['type'])
                images_output.append(image_data)
            output_images[node_id] = images_output

    return output_images

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
    try:
        # 1. Load the workflow
        with open("workflow_api.json", "r") as f:
            workflow = json.load(f)

        # 2. Update the workflow with the user's prompt
        # Node "6" is the positive prompt in your JSON
        workflow["6"]["inputs"]["text"] = prompt
        
        # Optionally update seed for variety
        import random
        workflow["3"]["inputs"]["seed"] = random.randint(0, 1125899906842624)

        # 3. Connect to ComfyUI via WebSocket
        ws = websocket.WebSocket()
        ws.connect(f"ws://{COMFYUI_SERVER_ADDRESS}/ws?clientId={CLIENT_ID}")

        # 4. Run the workflow
        images = get_images(ws, workflow)
        ws.close()

        # 5. Process results
        # Assuming node "9" is the SaveImage node
        if "9" in images and len(images["9"]) > 0:
            # In a real app, you would upload this to S3/Supabase Storage
            # For now, we'll return a placeholder or base64 (simplified)
            # Here we just return a mock URL since we can't host the image easily in this snippet
            return {"url": f"https://picsum.photos/seed/{random.random()}/1024/1024", "status": "success"}
        
        return {"status": "error", "message": "No images generated"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
