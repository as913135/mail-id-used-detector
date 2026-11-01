import os
import sys
import webbrowser
import time
import threading
import uvicorn

def open_browser():
    time.sleep(1.5)
    url = "http://localhost:8000"
    print(f"\n========================================================")
    print(f" PrivaScan is live and running at: {url}")
    print(f" Real OSINT public discovery & legal removal active.")
    print(f"========================================================\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
