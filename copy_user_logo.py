
import shutil
import os

source = r'c:\Users\USER\admin-attendance-jne\assets\logo-jne.png'
dest = r'c:\Users\USER\admin-attendance-jne\src\assets\logo-jne.png'

os.makedirs(os.path.dirname(dest), exist_ok=True)
shutil.copy2(source, dest)
print(f"Copied {source} to {dest}")
