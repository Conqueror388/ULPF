import subprocess
import sys
import time
import os
import webbrowser

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("==================================================================")
    print("🚀 Starting ULPF — Universal Log Pre-processing Framework")
    print("==================================================================")
    print(f"Backend directory:  {backend_dir}")
    print(f"Frontend directory: {frontend_dir}")
    print("------------------------------------------------------------------")

    # Start Backend
    print("[1/2] Launching FastAPI Backend on http://localhost:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=root_dir)

    time.sleep(2)

    # Start Frontend
    print("[2/2] Launching Vite Frontend on http://localhost:3000 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)

    time.sleep(2)
    print("\n✅ ULPF is live!")
    print("   • Dashboard UI:    http://localhost:3000")
    print("   • Backend Swagger: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down ULPF...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
