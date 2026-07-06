from PIL import Image
import os

brand = r'c:\Users\ASUS\Desktop\EduVista\Frontend\src\assets\branding'
public = r'c:\Users\ASUS\Desktop\EduVista\Frontend\public'
src = os.path.join(brand, 'logo.png')

img = Image.open(src).convert('RGBA')
w, h = img.size

icon_crop = img.crop((int(w * 0.08), int(h * 0.02), int(w * 0.92), int(h * 0.52)))
icon_size = max(icon_crop.size)
icon_square = Image.new('RGBA', (icon_size, icon_size), (255, 255, 255, 0))
ox = (icon_size - icon_crop.size[0]) // 2
oy = (icon_size - icon_crop.size[1]) // 2
icon_square.paste(icon_crop, (ox, oy), icon_crop)
icon_square.save(os.path.join(brand, 'logo-icon.png'))

wordmark_crop = img.crop((int(w * 0.05), int(h * 0.02), int(w * 0.95), int(h * 0.78)))
wordmark_crop.save(os.path.join(brand, 'logo-wordmark.png'))

sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

for name, size in sizes.items():
    resized = icon_square.resize((size, size), Image.Resampling.LANCZOS)
    bg = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    bg.paste(resized, (0, 0), resized)
    bg.convert('RGB').save(os.path.join(public, name))

icon_32 = icon_square.resize((32, 32), Image.Resampling.LANCZOS)
icon_32.save(os.path.join(public, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32)])

og = img.copy()
og.thumbnail((1200, 630), Image.Resampling.LANCZOS)
canvas = Image.new('RGB', (1200, 630), (250, 250, 250))
og_x = (1200 - og.size[0]) // 2
og_y = (630 - og.size[1]) // 2
canvas.paste(og, (og_x, og_y), og)
canvas.save(os.path.join(public, 'og-image.png'))

print('Assets generated successfully')
