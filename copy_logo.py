
import shutil
import os

source = r'C:\Users\USER\.gemini\antigravity\brain\c0c1bff6-4e1a-4f1d-a207-6b24729f87a2\jne_logo_1772512057717.png'
dest = r'c:\Users\USER\admin-attendance-jne\src\assets\logo.png'

os.makedirs(os.path.dirname(dest), exist_ok=True)
shutil.copy2(source, dest)
print(f"Copied {source} to {dest}")
print(f"File exists: {os.path.exists(dest)}")
