
import base64
import os

# A tiny 1x1 transparent PNG
png_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")

dest = r'c:\Users\USER\admin-attendance-jne\src\assets\logo.png'
os.makedirs(os.path.dirname(dest), exist_ok=True)

with open(dest, 'wb') as f:
    f.write(png_data)

print(f"Created {dest}")
print(f"File exists: {os.path.exists(dest)}")
