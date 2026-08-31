import os
from PIL import Image, ImageDraw

src_path = r"C:\Users\Lenovo\.gemini\antigravity-ide\brain\615f41e6-aa94-4954-80f1-4c89684343c3\.user_uploaded\media_1787832046353.jpg"
res_dir = r"c:\Users\Lenovo\Music\EllipMart\apps\mobile\android\app\src\main\res"
storefront_public = r"c:\Users\Lenovo\Music\EllipMart\apps\storefront\public"

img = Image.open(src_path).convert("RGBA")

# 1. Update background color to #000000
bg_xml = os.path.join(res_dir, "values", "ic_launcher_background.xml")
with open(bg_xml, "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#000000</color>\n</resources>\n')

# 2. Generate standard mipmap icons (ic_launcher.png and ic_launcher_round.png)
sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

for folder, size in sizes.items():
    target_dir = os.path.join(res_dir, folder)
    os.makedirs(target_dir, exist_ok=True)
    
    # Standard square icon
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
    
    # Round icon (circular mask)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    round_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    round_img.paste(resized, (0, 0), mask=mask)
    round_img.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")

# 3. Generate adaptive foreground icons (108dp base canvas)
fg_sizes = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

for folder, size in fg_sizes.items():
    target_dir = os.path.join(res_dir, folder)
    content_size = int(size * 0.72)
    offset = (size - content_size) // 2
    
    fg_canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    content_resized = img.resize((content_size, content_size), Image.Resampling.LANCZOS)
    fg_canvas.paste(content_resized, (offset, offset), mask=content_resized)
    fg_canvas.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")

# 4. Generate splash screen images
splash_targets = [
    ("drawable", (480, 800)),
    ("drawable-port-mdpi", (320, 480)),
    ("drawable-port-hdpi", (480, 800)),
    ("drawable-port-xhdpi", (720, 1280)),
    ("drawable-port-xxhdpi", (960, 1600)),
    ("drawable-port-xxxhdpi", (1280, 1920)),
]

for folder, (w, h) in splash_targets:
    target_dir = os.path.join(res_dir, folder)
    os.makedirs(target_dir, exist_ok=True)
    splash = Image.new("RGBA", (w, h), (9, 9, 11, 255))
    logo_size = int(min(w, h) * 0.5)
    logo_resized = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    pos = ((w - logo_size) // 2, (h - logo_size) // 2)
    splash.paste(logo_resized, pos, mask=logo_resized)
    splash.save(os.path.join(target_dir, "splash.png"), "PNG")

# 5. Storefront public icons
img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(storefront_public, "icon.png"), "PNG")
img.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(storefront_public, "apple-icon.png"), "PNG")
img.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(storefront_public, "favicon.ico"), "ICO")

print("ALL ASSETS GENERATED SUCCESSFULLY!")
