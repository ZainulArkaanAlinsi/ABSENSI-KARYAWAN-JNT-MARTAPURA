import shutil, os, glob

base = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(base, "assets")
public_dir = os.path.join(base, "public")

# Copy every PNG from assets/ → public/ (keeps original filename)
images = glob.glob(os.path.join(assets_dir, "*.png"))
for src in images:
    dst = os.path.join(public_dir, os.path.basename(src))
    shutil.copy2(src, dst)
    print(f"Copied: {os.path.basename(src)}")

print(f"\nDone — {len(images)} image(s) are now in public/")
