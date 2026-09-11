# 🚀 ULPF Production Deployment Guide

This guide provides step-by-step instructions to deploy **ULPF (Universal Log Pre-processing Framework)** across various deployment targets:
- **Option 1**: [Docker Compose (Single Command — Recommended)](#option-1-docker-compose-all-in-one--recommended)
- **Option 2**: [Cloud Platforms (Render / Railway / Fly.io)](#option-2-cloud-paas-render--railway--flyio)
- **Option 3**: [Split Deployment (Vercel/Netlify Frontend + Cloud Backend)](#option-3-split-deployment-vercel--cloud-backend)
- **Option 4**: [Linux Server / VPS (Ubuntu, Systemd + Nginx)](#option-4-linux-vps-systemd--nginx)

---

## Architecture Overview in Production

`
               ┌────────────────────────────────────────────────────────┐
               │              Browser / SOC Operator                    │
               └─────────────────────────┬──────────────────────────────┘
                                         │ HTTPS / WSS
                                         ▼
               ┌────────────────────────────────────────────────────────┐
               │              Nginx / Reverse Proxy (Port 80/3000)      │
               │  • Serves React SPA static build                       │
               │  • Proxies /api/ requests to Backend                   │
               │  • Proxies /api/stream/live WebSocket                  │
               └─────────────────────────┬──────────────────────────────┘
                                         │ internal:8000
                                         ▼
               ┌────────────────────────────────────────────────────────┐
               │              FastAPI Ingestion Engine (Port 8000)      │
               │  • Auto Format Detector (Syslog, XML, JSON, CEF)       │
               │  • OCSF Normalization Pipeline                         │
               │  • SQLite / PostgreSQL Storage                         │
               │  • SHA-256 Forensic Vault Verification                 │
               └────────────────────────────────────────────────────────┘
`

---

## Option 1: Docker Compose (All-in-One — Recommended)

This is the easiest way to run the entire framework on any machine or server with Docker installed.

### Prerequisites:
- Docker and Docker Compose installed (docker --version, docker compose version)

### Deployment Steps:
1. **Navigate to the project root:**
   `ash
   cd ULPF
   `

2. **Start the containers in detached mode:**
   `ash
   docker compose up --build -d
   `

3. **Verify the running containers:**
   `ash
   docker compose ps
   `
   You should see:
   - ulpf-backend (healthy, port 8000)
   - ulpf-frontend (running, port 3000)

4. **Access the Application:**
   - 🌐 **Dashboard UI**: http://localhost:3000 (or http://YOUR_SERVER_IP:3000)
   - 📖 **API Docs & Swagger**: http://localhost:8000/docs
   - 🩺 **Health Check**: http://localhost:8000/

5. **Stop or Restart:**
   `ash
   # View live logs
   docker compose logs -f

   # Stop services
   docker compose down
   `

---

## Option 2: Cloud PaaS (Render / Railway / Fly.io)

### Backend (Render / Railway):
1. **Source directory**: ./backend
2. **Environment**: Python 3.11+
3. **Build Command**: pip install -r requirements.txt
4. **Start Command**:
   `ash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 
   `
5. **Environment Variables**:
   - PYTHONPATH=.
   - DATABASE_URL=sqlite:///./ulpf_database.sqlite (or your managed PostgreSQL URL)

### Frontend (Render / Vercel):
1. **Source directory**: ./frontend
2. **Build Command**: 
pm install && npm run build
3. **Output Directory**: dist
4. **Environment Variables**:
   - VITE_API_URL=https://your-backend-service.onrender.com

---

## Option 3: Split Deployment (Vercel + Cloud Backend)

### 1. Deploy Backend on Render / Railway:
- Push the repo to GitHub.
- Create a Web Service on Render/Railway using the ackend/Dockerfile or native Python runtime.
- Note your live backend URL (e.g. https://ulpf-api.onrender.com).

### 2. Deploy Frontend on Vercel:
- In Vercel, import your repository.
- Set **Root Directory** to rontend.
- Under **Environment Variables**, add:
  `
  VITE_API_URL = https://ulpf-api.onrender.com
  `
- Click **Deploy**. Vercel will automatically build the Vite production bundle and serve it globally on CDN.

---

## Option 4: Linux VPS (Systemd + Nginx)

For deployment directly on an Ubuntu/Debian cloud server (AWS EC2, DigitalOcean, Hetzner, Linode):

### 1. Install System Dependencies:
`ash
sudo apt update && sudo apt install -y python3-pip python3-venv nginx nodejs npm git
`

### 2. Set Up Backend with Systemd:
`ash
# Setup virtual environment in project root
cd /var/www/ULPF
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
`

Create systemd service /etc/systemd/system/ulpf-backend.service:
`ini
[Unit]
Description=ULPF FastAPI Engine
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/ULPF
Environment=PATH=/var/www/ULPF/venv/bin
Environment=PYTHONPATH=/var/www/ULPF
ExecStart=/var/www/ULPF/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

[Install]
WantedBy=multi-user.target
`

Enable and start:
`ash
sudo systemctl daemon-reload
sudo systemctl enable --now ulpf-backend
sudo systemctl status ulpf-backend
`

### 3. Build Frontend:
`ash
cd /var/www/ULPF/frontend
npm install
npm run build
`

### 4. Configure Nginx:
Copy rontend/nginx.conf into /etc/nginx/sites-available/ulpf:
`ash
sudo cp /var/www/ULPF/frontend/nginx.conf /etc/nginx/sites-available/ulpf
# Ensure root points to /var/www/ULPF/frontend/dist
sudo ln -s /etc/nginx/sites-available/ulpf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
`

---

## Verification & Post-Deployment Checklist

| Step | Verification Check | Expected Result |
| :--- | :--- | :--- |
| 1 | GET / | {framework: ULPF, status: ONLINE} |
| 2 | GET /docs | Swagger UI loads with all 5 router groups |
| 3 | GET /api/dashboard/metrics | Returns 200 OK with total ingested counts |
| 4 | Frontend Dashboard | Real-time Data River animations & 3D WebGL core render at 60fps |
| 5 | Live Ingestion | WebSocket connects and stream indicators show green pulse |
| 6 | Threat Radar | 360° radar sweep active with OCSF incident correlation |

