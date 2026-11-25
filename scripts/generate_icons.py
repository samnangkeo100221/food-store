import zlib
import struct
import math
import os

def create_png(width, height, is_maskable=False):
    # Generates a PNG with amber gradient and bowl graphic
    raw_rows = []
    
    # Colors (RGBA)
    amber_top = (245, 158, 11, 255)
    amber_mid = (217, 119, 6, 255)
    amber_bot = (146, 64, 14, 255)
    
    gold_food = (251, 191, 36, 255)
    dark_bowl = (24, 24, 27, 255)
    white_steam = (255, 251, 235, 240)
    
    cx, cy = width / 2.0, height / 2.0
    scale = (width / 512.0) * (0.75 if is_maskable else 0.95)
    corner_radius = width * (0.0 if is_maskable else 0.22)
    
    for y in range(height):
        row = bytearray([0]) # filter byte: None (0)
        t = y / float(height - 1)
        
        # Gradient background
        if t < 0.5:
            fac = t / 0.5
            bg_r = int(amber_top[0] * (1 - fac) + amber_mid[0] * fac)
            bg_g = int(amber_top[1] * (1 - fac) + amber_mid[1] * fac)
            bg_b = int(amber_top[2] * (1 - fac) + amber_mid[2] * fac)
        else:
            fac = (t - 0.5) / 0.5
            bg_r = int(amber_mid[0] * (1 - fac) + amber_bot[0] * fac)
            bg_g = int(amber_mid[1] * (1 - fac) + amber_bot[1] * fac)
            bg_b = int(amber_mid[2] * (1 - fac) + amber_bot[2] * fac)
            
        for x in range(width):
            # Check rounded corner if not maskable
            r, g, b, a = bg_r, bg_g, bg_b, 255
            if not is_maskable:
                # distance to closest corner
                dx = min(x, width - 1 - x)
                dy = min(y, height - 1 - y)
                if dx < corner_radius and dy < corner_radius:
                    dist = math.sqrt((corner_radius - dx)**2 + (corner_radius - dy)**2)
                    if dist > corner_radius:
                        r, g, b, a = 0, 0, 0, 0
            
            if a > 0:
                # Local coords relative to center in 512 scale
                lx = (x - cx) / scale
                ly = (y - cy) / scale
                
                # Bowl base: ellipse & polygon
                # Food dome inside bowl
                if ly >= -55 and ly <= -25:
                    if (lx / 130.0)**2 + ((ly + 25) / 35.0)**2 <= 1.0:
                        r, g, b = gold_food[0], gold_food[1], gold_food[2]
                
                # Bowl rim ellipse
                if (lx / 145.0)**2 + ((ly + 35) / 28.0)**2 <= 1.0:
                    r, g, b = dark_bowl[0], dark_bowl[1], dark_bowl[2]
                    
                # Bowl body: bottom cup shape
                if ly >= -35 and ly <= 115:
                    cup_width = 145.0 * (1.0 - 0.45 * ((ly + 35) / 150.0)**1.2)
                    if abs(lx) <= cup_width:
                        r, g, b = dark_bowl[0], dark_bowl[1], dark_bowl[2]
                
                # Bowl stand
                if ly >= 115 and ly <= 140 and abs(lx) <= 60:
                    r, g, b = 39, 39, 42
                    
                # Steam waves
                for sx in [-60, 0, 60]:
                    if ly >= -185 and ly <= -75:
                        wave_x = sx + 8 * math.sin((ly + 75) * 0.08)
                        if abs(lx - wave_x) <= 6:
                            r, g, b = white_steam[0], white_steam[1], white_steam[2]
            
            row.extend([r, g, b, a])
        raw_rows.append(bytes(row))
        
    raw_data = b"".join(raw_rows)
    compressed = zlib.compress(raw_data, 9)
    
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)
        
    png = b"\x89PNG\r\n\x1a\n"
    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png += chunk(b"IHDR", ihdr_data)
    # IDAT
    png += chunk(b"IDAT", compressed)
    # IEND
    png += chunk(b"IEND", b"")
    return png

os.makedirs("public", exist_ok=True)

with open("public/pwa-192x192.png", "wb") as f:
    f.write(create_png(192, 192, is_maskable=False))

with open("public/pwa-512x512.png", "wb") as f:
    f.write(create_png(512, 512, is_maskable=False))

with open("public/pwa-maskable-512x512.png", "wb") as f:
    f.write(create_png(512, 512, is_maskable=True))

with open("public/apple-touch-icon.png", "wb") as f:
    f.write(create_png(180, 180, is_maskable=False))

print("All PNG icons created successfully!")
