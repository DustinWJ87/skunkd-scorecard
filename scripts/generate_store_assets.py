import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT_DIR = r"e:\Dev Drive\SKUNKD_scorecard"
OUT_DIR = os.path.join(ROOT_DIR, "store_assets")
os.makedirs(OUT_DIR, exist_ok=True)

FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"
if not os.path.exists(FONT_REG):
    FONT_REG = FONT_BOLD

def create_showcase_screenshot(ss_file, tag, title, subtitle, out_name_base):
    ss_path = os.path.join(ROOT_DIR, ss_file)
    if not os.path.exists(ss_path):
        print(f"Error: Screenshot file not found at {ss_path}")
        return

    src_ss = Image.open(ss_path).convert("RGBA")

    # Base Canvas: iOS 6.7" (1290 x 2796)
    W, H = 1290, 2796
    canvas = Image.new("RGBA", (W, H), (10, 13, 20, 255))
    draw = ImageDraw.Draw(canvas)

    # Gradient background
    for y in range(H):
        ratio = y / H
        r = int(14 + (6 - 14) * ratio)
        g = int(18 + (9 - 18) * ratio)
        b = int(28 + (15 - 28) * ratio)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # Subtle gold glow at the top
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([W // 2 - 500, -120, W // 2 + 500, 650], fill=(255, 215, 0, 30))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)

    # Fonts
    tag_font = ImageFont.truetype(FONT_BOLD, 36)
    title_font = ImageFont.truetype(FONT_BOLD, 68)
    sub_font = ImageFont.truetype(FONT_REG, 42)

    # Pill Tag
    tag_text = tag.upper()
    tag_bbox = draw.textbbox((0, 0), tag_text, font=tag_font)
    tw = tag_bbox[2] - tag_bbox[0]
    th = tag_bbox[3] - tag_bbox[1]
    pill_x = (W - tw) // 2
    pill_y = 130
    pad_x, pad_y = 28, 12
    draw.rounded_rectangle(
        [pill_x - pad_x, pill_y - pad_y, pill_x + tw + pad_x, pill_y + th + pad_y],
        radius=20,
        fill=(30, 38, 54, 230),
        outline=(255, 215, 0, 180),
        width=2
    )
    draw.text((pill_x, pill_y - 2), tag_text, font=tag_font, fill=(255, 215, 0, 255))

    # Title
    t_bbox = draw.textbbox((0, 0), title, font=title_font)
    tx = (W - (t_bbox[2] - t_bbox[0])) // 2
    draw.text((tx, 220), title, font=title_font, fill=(255, 255, 255, 255))

    # Subtitle
    s_bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    sx = (W - (s_bbox[2] - s_bbox[0])) // 2
    draw.text((sx, 315), subtitle, font=sub_font, fill=(203, 213, 225, 255))

    # Phone Bezel Mockup
    phone_w = 980
    phone_h = int(phone_w * (src_ss.height / src_ss.width))
    phone_x = (W - phone_w) // 2
    phone_y = 430

    # Resize screenshot and create rounded mask
    ss_resized = src_ss.resize((phone_w, phone_h), Image.Resampling.LANCZOS)
    mask = Image.new("L", (phone_w, phone_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    corner_r = 50
    mask_draw.rounded_rectangle([0, 0, phone_w, phone_h], radius=corner_r, fill=255)

    # Shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [phone_x - 14, phone_y - 10, phone_x + phone_w + 14, phone_y + phone_h + 24],
        radius=corner_r + 14,
        fill=(0, 0, 0, 210)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(36))
    canvas = Image.alpha_composite(canvas, shadow)

    # Phone border rim
    border_w = 6
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        [phone_x - border_w, phone_y - border_w, phone_x + phone_w + border_w, phone_y + phone_h + border_w],
        radius=corner_r + border_w,
        fill=(22, 27, 39, 255),
        outline=(255, 215, 0, 150),
        width=3
    )

    # Paste screenshot
    canvas.paste(ss_resized, (phone_x, phone_y), mask)

    # 1. Save iOS 6.7" (1290 x 2796)
    ios_67_dir = os.path.join(OUT_DIR, "ios_6.7_display")
    os.makedirs(ios_67_dir, exist_ok=True)
    ios_67_path = os.path.join(ios_67_dir, f"{out_name_base}.png")
    canvas.convert("RGB").save(ios_67_path, format="PNG", optimize=True)

    # 2. Save iOS 6.5" (1242 x 2688)
    ios_65_dir = os.path.join(OUT_DIR, "ios_6.5_display")
    os.makedirs(ios_65_dir, exist_ok=True)
    ios_65_canvas = canvas.resize((1242, 2688), Image.Resampling.LANCZOS)
    ios_65_path = os.path.join(ios_65_dir, f"{out_name_base}.png")
    ios_65_canvas.convert("RGB").save(ios_65_path, format="PNG", optimize=True)

    # 3. Save Android Phone (1080 x 2400)
    android_dir = os.path.join(OUT_DIR, "google_play_phone")
    os.makedirs(android_dir, exist_ok=True)
    android_canvas = canvas.resize((1080, 2400), Image.Resampling.LANCZOS)
    android_path = os.path.join(android_dir, f"{out_name_base}.png")
    android_canvas.convert("RGB").save(android_path, format="PNG", optimize=True)

    print(f"Generated {out_name_base}: iOS 6.7\", iOS 6.5\", and Android 1080x2400")

def create_ipad_screenshot(ss_file, tag, title, subtitle, out_name_base):
    ss_path = os.path.join(ROOT_DIR, ss_file)
    if not os.path.exists(ss_path):
        return

    src_ss = Image.open(ss_path).convert("RGBA")

    # iPad 13-inch Display: 2048 x 2732
    W, H = 2048, 2732
    canvas = Image.new("RGBA", (W, H), (10, 13, 20, 255))
    draw = ImageDraw.Draw(canvas)

    for y in range(H):
        ratio = y / H
        r = int(14 + (6 - 14) * ratio)
        g = int(18 + (9 - 18) * ratio)
        b = int(28 + (15 - 28) * ratio)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([W // 2 - 700, -150, W // 2 + 700, 750], fill=(255, 215, 0, 32))
    glow = glow.filter(ImageFilter.GaussianBlur(110))
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)

    tag_font = ImageFont.truetype(FONT_BOLD, 48)
    title_font = ImageFont.truetype(FONT_BOLD, 92)
    sub_font = ImageFont.truetype(FONT_REG, 52)

    # Pill Tag
    tag_text = tag.upper()
    tag_bbox = draw.textbbox((0, 0), tag_text, font=tag_font)
    tw = tag_bbox[2] - tag_bbox[0]
    th = tag_bbox[3] - tag_bbox[1]
    pill_x = (W - tw) // 2
    pill_y = 140
    pad_x, pad_y = 36, 16
    draw.rounded_rectangle(
        [pill_x - pad_x, pill_y - pad_y, pill_x + tw + pad_x, pill_y + th + pad_y],
        radius=26,
        fill=(30, 38, 54, 230),
        outline=(255, 215, 0, 180),
        width=3
    )
    draw.text((pill_x, pill_y - 2), tag_text, font=tag_font, fill=(255, 215, 0, 255))

    # Title
    t_bbox = draw.textbbox((0, 0), title, font=title_font)
    tx = (W - (t_bbox[2] - t_bbox[0])) // 2
    draw.text((tx, 260), title, font=title_font, fill=(255, 255, 255, 255))

    # Subtitle
    s_bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    sx = (W - (s_bbox[2] - s_bbox[0])) // 2
    draw.text((sx, 385), subtitle, font=sub_font, fill=(203, 213, 225, 255))

    # Mockup Screen
    phone_w = 1140
    phone_h = int(phone_w * (src_ss.height / src_ss.width))
    phone_x = (W - phone_w) // 2
    phone_y = 520

    ss_resized = src_ss.resize((phone_w, phone_h), Image.Resampling.LANCZOS)
    mask = Image.new("L", (phone_w, phone_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    corner_r = 58
    mask_draw.rounded_rectangle([0, 0, phone_w, phone_h], radius=corner_r, fill=255)

    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [phone_x - 18, phone_y - 12, phone_x + phone_w + 18, phone_y + phone_h + 28],
        radius=corner_r + 16,
        fill=(0, 0, 0, 220)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(42))
    canvas = Image.alpha_composite(canvas, shadow)

    border_w = 8
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        [phone_x - border_w, phone_y - border_w, phone_x + phone_w + border_w, phone_y + phone_h + border_w],
        radius=corner_r + border_w,
        fill=(22, 27, 39, 255),
        outline=(255, 215, 0, 160),
        width=4
    )

    canvas.paste(ss_resized, (phone_x, phone_y), mask)

    ipad_dir = os.path.join(OUT_DIR, "ios_ipad_13_display")
    os.makedirs(ipad_dir, exist_ok=True)
    ipad_path = os.path.join(ipad_dir, f"{out_name_base}.png")
    canvas.convert("RGB").save(ipad_path, format="PNG", optimize=True)
    print(f"Generated iPad 13\": {ipad_path}")

def main():
    screens = [
        (
            "both_sprays_scoreboard.png",
            "Official Companion App",
            "Interactive Live Scoreboard",
            "Track turns, sprays, banked points & instant totals",
            "01_scoreboard"
        ),
        (
            "randomizer_rolled.png",
            "Custom Variation Engine",
            "Slot Rule Randomizer",
            "Spin 6 customizable reels for wild modifiers",
            "02_rule_randomizer"
        ),
        (
            "cards_dealt.png",
            "Cards & Dice Modes",
            "Real-Time Card Deals",
            "Flip cards with suspense and track hand actions",
            "03_cards_mode"
        ),
        (
            "setup_screen.png",
            "Fast Match Setup",
            "Flexible Game Modes",
            "Custom player line-ups, rulesets, and target scores",
            "04_game_setup"
        ),
        (
            "slowboat_modal.png",
            "Game Night Modifiers",
            "Dynamic Rule Modals",
            "Instant rules reference, mulligans, and banked scores",
            "05_dynamic_rules"
        ),
    ]

    for ss_file, tag, title, subtitle, out_name_base in screens:
        create_showcase_screenshot(ss_file, tag, title, subtitle, out_name_base)
        create_ipad_screenshot(ss_file, tag, title, subtitle, out_name_base)

if __name__ == "__main__":
    main()
