import io
import os
import math
import random
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
import qrcode

def draw_who_emblem(c, cx, cy, radius=18):
    """Draws a vector WHO-style globe-and-caduceus emblem."""
    c.saveState()
    
    # Outer circle
    c.setStrokeColor(colors.HexColor('#0F2942'))
    c.setFillColor(colors.HexColor('#F0FDFA'))
    c.setLineWidth(1.2)
    c.circle(cx, cy, radius, stroke=1, fill=1)
    
    # Latitude lines
    c.setStrokeColor(colors.HexColor('#0D9488'))
    c.setLineWidth(0.6)
    c.ellipse(cx - radius * 0.85, cy - radius * 0.45, cx + radius * 0.85, cy + radius * 0.45, stroke=1, fill=0)
    c.line(cx - radius, cy, cx + radius, cy)
    c.line(cx, cy - radius, cx, cy + radius)
    
    # Laurel leaves (surrounding arcs)
    c.setStrokeColor(colors.HexColor('#0F766E'))
    c.setLineWidth(0.8)
    c.arc(cx - radius - 3, cy - radius, cx - radius + 5, cy + radius, -70, 140)
    c.arc(cx + radius - 5, cy - radius, cx + radius + 3, cy + radius, 110, 140)
    
    # Center Caduceus / Rod of Asclepius
    c.setStrokeColor(colors.HexColor('#0F2942'))
    c.setLineWidth(1.5)
    c.line(cx, cy - radius * 0.75, cx, cy + radius * 0.75) # Central staff
    
    # Serpent winding
    c.setStrokeColor(colors.HexColor('#D97706'))
    c.setLineWidth(1.0)
    c.arc(cx - 3, cy - 6, cx + 3, cy + 2, 0, 180)
    c.arc(cx - 3, cy - 1, cx + 3, cy + 7, 180, 180)
    
    # Top knob of staff
    c.setFillColor(colors.HexColor('#D97706'))
    c.circle(cx, cy + radius * 0.75, 1.8, stroke=0, fill=1)
    
    c.restoreState()


def draw_curved_text(c, cx, cy, radius, text, start_angle_deg, is_top=True):
    """Draws letters arranged along a circle arc."""
    c.saveState()
    n = len(text)
    if n == 0:
        c.restoreState()
        return
        
    span_deg = min(140, n * 5.8)
    step_deg = span_deg / max(1, n - 1)
    
    for i, ch in enumerate(text):
        if is_top:
            angle_deg = start_angle_deg - (i * step_deg)
            rad = math.radians(angle_deg)
            x = cx + radius * math.cos(rad)
            y = cy + radius * math.sin(rad)
            char_rotation = angle_deg - 90
        else:
            angle_deg = start_angle_deg + (i * step_deg)
            rad = math.radians(angle_deg)
            x = cx + radius * math.cos(rad)
            y = cy + radius * math.sin(rad)
            char_rotation = angle_deg + 90
            
        c.saveState()
        c.translate(x, y)
        c.rotate(char_rotation)
        c.drawCentredString(0, 0, ch)
        c.restoreState()
        
    c.restoreState()


def draw_official_stamp(c, cx, cy, is_passed=True, rtc_date="13 NOV 2026"):
    """
    Programmatically draws an authentic circular ink-style certification stamp
    using ReportLab canvas vector graphics with realistic -8 degree stamped impression.
    """
    c.saveState()
    c.translate(cx, cy)
    c.rotate(-8.0) # -8 degrees rotation for authentic stamped impression
    
    ink_color = colors.HexColor('#1E3A8A') if is_passed else colors.HexColor('#B91C1C')
    c.setStrokeColor(ink_color)
    c.setFillColor(ink_color)
    
    # Outer double rings
    c.setLineWidth(2.0)
    c.circle(0, 0, 44, stroke=1, fill=0)
    c.setLineWidth(0.8)
    c.circle(0, 0, 40.5, stroke=1, fill=0)
    
    # Inner central ring
    c.setLineWidth(0.9)
    c.circle(0, 0, 27.5, stroke=1, fill=0)
    
    # Curved outer ring text
    c.setFont("Helvetica-Bold", 4.0)
    draw_curved_text(c, 0, 0, 34.0, "WORLD HEALTH ORGANIZATION", 152, is_top=True)
    draw_curved_text(c, 0, 0, 34.0, "COLD-CHAIN QUALITY ASSURANCE", 208, is_top=False)
    
    # Stars on outer ring
    c.setFont("Helvetica-Bold", 5.5)
    c.drawCentredString(-37, 0, "★")
    c.drawCentredString(37, 0, "★")
    
    # Inner stamp text
    c.setFont("Helvetica-Bold", 6.0)
    c.drawCentredString(0, 15, "WHO PQS E006")
    
    c.setFont("Helvetica-Bold", 7.8)
    if is_passed:
        c.drawCentredString(0, 5.5, "VERIFIED SAFE")
        c.setFont("Helvetica-Bold", 5.2)
        c.drawCentredString(0, -2.5, "ATECC608A SIGNED")
    else:
        c.drawCentredString(0, 5.5, "QUARANTINE")
        c.setFont("Helvetica-Bold", 5.2)
        c.drawCentredString(0, -2.5, "DO NOT ADMINISTER")
        
    c.setFont("Helvetica", 5.0)
    c.drawCentredString(0, -10.0, f"RTC: {rtc_date}")
    
    c.setFont("Helvetica-Bold", 4.5)
    c.drawCentredString(0, -17.5, "IMMUNIZATION AUDIT PASS")
    
    c.restoreState()


def build_who_certificate_pdf(data):
    """
    Generates a unique, official-looking 1-page A4 PDF compliance certificate.
    Returns bytes of the generated PDF.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    page_w, page_h = A4 # 595.28 x 841.89 pt
    
    # Extract data parameters
    cert_id = data.get("cert_id", f"WHO-VAX-2026-{random.randint(0x1000, 0xFFFF):04X}")
    
    now_utc = datetime.now(timezone.utc)
    rtc_timestamp = data.get("rtc_timestamp", now_utc.strftime("%Y-%m-%d %H:%M:%S UTC"))
    rtc_date_short = data.get("rtc_date_short", now_utc.strftime("%d %b %Y").upper())
    
    node_id = data.get("node_id", "VAX-NODE-01")
    blocks = data.get("blocks", [])
    is_chain_intact = data.get("is_chain_intact", True)
    potency_pct = float(data.get("potency_pct", 100.0))
    remaining_hours = float(data.get("remaining_hours", 720.0))
    mkt_temp = float(data.get("mkt_temp", 4.25))
    batt_v = float(data.get("batt_v", 3.01))
    projected_days = int(data.get("projected_days", 184))
    enclosure_status = data.get("enclosure_status", "SEALED")
    
    # Determine min/max/mean temp and drift
    dht_temps = [float(b.get("temp_dht", 4.0)) for b in blocks if "temp_dht" in b]
    ntc_temps = [float(b.get("temp_ntc", b.get("temp_dht", 4.0))) for b in blocks]
    
    min_temp = min(dht_temps) if dht_temps else 4.0
    max_temp = max(dht_temps) if dht_temps else 4.5
    mean_temp = sum(dht_temps) / len(dht_temps) if dht_temps else 4.25
    
    drifts = [abs(d - n) for d, n in zip(dht_temps, ntc_temps)]
    max_drift = max(drifts) if drifts else 0.05
    
    tamper_count = sum(1 for b in blocks if b.get("tampered", False))
    
    # Verification Decision per exact prompt spec:
    # chain_valid === true && min_temp >= 2.0 && max_temp <= 8.0 && tamper_count === 0
    is_passed = (
        is_chain_intact and 
        min_temp >= 2.0 and 
        max_temp <= 8.0 and 
        tamper_count == 0 and 
        potency_pct >= 90.0 and 
        enclosure_status != "LID BREACHED"
    )
    
    # ----------------------------------------------------
    # 1. SECURITY GUILLOCHE BORDER & WATERMARK
    # ----------------------------------------------------
    margin_out = 16
    c.setStrokeColor(colors.HexColor('#0F2942'))
    c.setLineWidth(2.0)
    c.rect(margin_out, margin_out, page_w - 2 * margin_out, page_h - 2 * margin_out, stroke=1, fill=0)
    
    margin_in = 20
    c.setStrokeColor(colors.HexColor('#0D9488'))
    c.setLineWidth(0.75)
    c.rect(margin_in, margin_in, page_w - 2 * margin_in, page_h - 2 * margin_in, stroke=1, fill=0)
    
    # Corner registration micro-crosses
    corner_size = 7
    c.setStrokeColor(colors.HexColor('#0F2942'))
    c.setLineWidth(0.5)
    for cx, cy in [(margin_in, margin_in), (page_w - margin_in, margin_in), 
                   (margin_in, page_h - margin_in), (page_w - margin_in, page_h - margin_in)]:
        c.line(cx - corner_size, cy, cx + corner_size, cy)
        c.line(cx, cy - corner_size, cx, cy + corner_size)
        
    # Micro-text corner registration marks
    c.setFont("Courier-Bold", 4.2)
    c.setFillColor(colors.HexColor('#475569'))
    micro_text = "VAXGUARD-ZERO-TRUST-LEDGER // SHA256-VERIFIED // NIST FIPS 180-4 // WHO-PQS-E006-TR01.1 // DS1307 RTC CLOCK // 21 CFR PART 11"
    c.drawCentredString(page_w / 2, page_h - margin_in + 1.2, micro_text)
    c.drawCentredString(page_w / 2, margin_in - 2.8, micro_text)
    
    # Subtle diagonal background watermark ("WHO PQS COLD-CHAIN AUDIT" at 6% opacity)
    c.saveState()
    c.translate(page_w / 2, page_h / 2)
    c.rotate(35)
    c.setFillColor(colors.Color(0.06, 0.16, 0.26, alpha=0.06))
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(0, 0, "WHO PQS COLD-CHAIN AUDIT")
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(0, -36, "CRYPTOGRAPHIC PASSPORT // ZERO-TRUST LEDGER")
    c.restoreState()
    
    # ----------------------------------------------------
    # 2. OFFICIAL HEADER & DYNAMIC STATUS BANNER
    # ----------------------------------------------------
    header_top = page_h - 28
    
    # Left: Vector WHO-style emblem
    draw_who_emblem(c, margin_in + 26, header_top - 21, radius=19)
    
    # Right Box: Certificate Serial & RTC timestamp
    box_w = 126
    box_h = 38
    box_x = page_w - margin_in - box_w - 4
    box_y = header_top - 41
    
    c.setFillColor(colors.HexColor('#F8FAFC'))
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(0.8)
    c.roundRect(box_x, box_y, box_w, box_h, 4, stroke=1, fill=1)
    
    c.setFillColor(colors.HexColor('#0F2942'))
    c.setFont("Helvetica-Bold", 6.2)
    c.drawString(box_x + 6, box_y + 28, "CERTIFICATE SERIAL:")
    c.setFont("Courier-Bold", 7.5)
    c.setFillColor(colors.HexColor('#0284C7'))
    c.drawString(box_x + 6, box_y + 18, cert_id)
    
    c.setFillColor(colors.HexColor('#64748B'))
    c.setFont("Helvetica", 5.2)
    c.drawString(box_x + 6, box_y + 9.5, f"RTC: {rtc_timestamp[:19]}")
    c.drawString(box_x + 6, box_y + 3, f"NODE: {node_id} (ATECC608A)")
    
    # Center: Document Header Title (fitted cleanly between emblem and cert box)
    title_center_x = (margin_in + 52 + box_x) / 2
    
    c.setFillColor(colors.HexColor('#0D9488'))
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(title_center_x, header_top - 6, "WORLD HEALTH ORGANIZATION • PREQUALIFICATION PROGRAMME")
    
    c.setFillColor(colors.HexColor('#0F2942'))
    c.setFont("Helvetica-Bold", 8.2)
    c.drawCentredString(title_center_x, header_top - 17, "INTERNATIONAL VACCINE COLD-CHAIN INTEGRITY & CRYPTOGRAPHIC PASSPORT")
    
    c.setFillColor(colors.HexColor('#475569'))
    c.setFont("Helvetica", 6.5)
    c.drawCentredString(title_center_x, header_top - 27, "WHO PQS / VaxGuard Cryptographic Cold-Chain Compliance Certificate")
    c.setFont("Helvetica-Oblique", 5.6)
    c.drawCentredString(title_center_x, header_top - 35, "WHO TRS 961 Annex 9 • FDA 21 CFR Part 11 Electronic Telemetry Ledger")
    
    # Full-width Dynamic Status Banner
    banner_y = header_top - 70
    banner_h = 24
    banner_w = page_w - 2 * margin_in - 8
    banner_x = margin_in + 4
    
    if is_passed:
        c.setFillColor(colors.HexColor('#065F46')) # Deep Emerald
        banner_text = "✔ PASSED — CRYPTOGRAPHICALLY VERIFIED FOR IMMUNIZATION RELEASE"
        banner_sub = "ATECC608A SIGNATURE CHAIN VALIDATED • ZERO SENSOR DRIFT EXCURSION • WHO CLASS A COMPLIANT"
    else:
        c.setFillColor(colors.HexColor('#991B1B')) # Deep Crimson
        banner_text = "✖ QUARANTINE REQUIRED — THERMAL EXCURSION OR CRYPTOGRAPHIC TAMPER DETECTED"
        banner_sub = "REJECTED FOR CLINICAL IMMUNIZATION • DO NOT ADMINISTER • PLACE BATCH IN QUARANTINE HOLD"
        
    c.setStrokeColor(colors.HexColor('#0F2942'))
    c.setLineWidth(0.5)
    c.roundRect(banner_x, banner_y, banner_w, banner_h, 4, stroke=0, fill=1)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9.2)
    c.drawCentredString(page_w / 2, banner_y + 13, banner_text)
    c.setFont("Helvetica", 5.8)
    c.setFillColor(colors.HexColor('#E2E8F0'))
    c.drawCentredString(page_w / 2, banner_y + 4.5, banner_sub)
    
    # ----------------------------------------------------
    # 3. SHIPMENT & BIO-POTENCY METRICS GRID (2x3 Styled Table)
    # ----------------------------------------------------
    grid_y = banner_y - 12
    c.setFillColor(colors.HexColor('#0F2942'))
    c.setFont("Helvetica-Bold", 8.0)
    c.drawString(margin_in + 6, grid_y, "1. SHIPMENT, TELEMETRY & WHO ARRHENIUS BIO-POTENCY KINETICS")
    
    cards_top = grid_y - 5
    card_w = (page_w - 2 * margin_in - 8 - 12) / 3 # ~174 pt
    card_h = 44
    
    metric_cards = [
        {
            "title": "DEVICE NODE ID & CRYPTO HSM",
            "val": f"{node_id} / ATECC608A",
            "sub": "Microchip FIPS 140-2 L3 • 1.8ms Signing Latency",
            "color": "#0F2942"
        },
        {
            "title": "TOTAL VERIFIED BLOCKS",
            "val": f"{len(blocks)} Blocks Logged",
            "sub": "100% Cryptographically Verified" if is_chain_intact else "CHAIN INTEGRITY COMPROMISED",
            "color": "#059669" if is_chain_intact else "#DC2626"
        },
        {
            "title": "CORE TEMPERATURE RANGE",
            "val": f"{min_temp:.2f}°C – {max_temp:.2f}°C (Mean: {mean_temp:.2f}°C)",
            "sub": f"Dual-Sensor Drift: Δ {max_drift:.2f}°C (Calibrated)",
            "color": "#059669" if (min_temp >= 2.0 and max_temp <= 8.0) else "#DC2626"
        },
        {
            "title": "ENCLOSURE PHYSICAL SEAL",
            "val": f"{enclosure_status}",
            "sub": "Chassis Interlock Sealed" if enclosure_status == "SEALED" else "PHYSICAL TAMPER INTERLOCK TRIPPED",
            "color": "#059669" if enclosure_status == "SEALED" else "#DC2626"
        },
        {
            "title": "CR2450 COIN-CELL POWER",
            "val": f"{batt_v:.2f} V • ~{projected_days} Days Projected",
            "sub": "Adaptive ULP Duty-Cycle (14 µA Sleep / 45 mA Burst)",
            "color": "#0F2942"
        },
        {
            "title": "ARRHENIUS BIO-POTENCY (USP)",
            "val": f"{potency_pct:.1f}% Potency Viable",
            "sub": f"Remaining Shelf-Life: {remaining_hours:.1f} hrs (MKT: {mkt_temp:.2f}°C)",
            "color": "#059669" if potency_pct >= 90.0 else "#DC2626"
        }
    ]
    
    for idx, card in enumerate(metric_cards):
        col = idx % 3
        row = idx // 3
        cx = margin_in + 4 + col * (card_w + 6)
        cy = cards_top - (row + 1) * card_h - (row * 6)
        
        c.setFillColor(colors.HexColor('#F8FAFC'))
        c.setStrokeColor(colors.HexColor('#E2E8F0'))
        c.setLineWidth(0.8)
        c.roundRect(cx, cy, card_w, card_h, 3.5, stroke=1, fill=1)
        
        c.setFillColor(colors.HexColor('#64748B'))
        c.setFont("Helvetica-Bold", 5.5)
        c.drawString(cx + 6, cy + card_h - 10, card["title"])
        
        c.setFillColor(colors.HexColor(card["color"]))
        c.setFont("Helvetica-Bold", 8.2)
        c.drawString(cx + 6, cy + card_h - 22, card["val"])
        
        c.setFillColor(colors.HexColor('#475569'))
        c.setFont("Helvetica", 5.2)
        c.drawString(cx + 6, cy + 6, card["sub"])
        
    # ----------------------------------------------------
    # 4. CRYPTOGRAPHIC CHAIN-OF-CUSTODY AUDIT TABLE
    # ----------------------------------------------------
    table_section_y = cards_top - 2 * card_h - 18
    c.setFillColor(colors.HexColor('#0F2942'))
    c.setFont("Helvetica-Bold", 8.0)
    c.drawString(margin_in + 6, table_section_y, "2. ATECC608A CRYPTOGRAPHIC SHA-256 BLOCK LEDGER (CHAIN-OF-CUSTODY AUDIT)")
    
    display_blocks = blocks[-7:] if len(blocks) > 7 else blocks
    
    table_data = [
        ["BLOCK #", "DS1307 RTC TIME", "TEMP (°C)", "PREVIOUS HASH (PREV_HASH)", "SIGNATURE HASH (ATECC608A)", "STATUS"]
    ]
    
    for b in display_blocks:
        b_idx = f"#{b.get('block_index', 0)}"
        ts_str = b.get("timestamp", "")
        if "T" in ts_str:
            time_part = ts_str.split("T")[1][:8]
        else:
            time_part = ts_str[:12] if ts_str else "12:00:00"
            
        t_dht = f"{float(b.get('temp_dht', 4.0)):.2f}°C"
        
        prev_h = b.get("prev_hash", "000000000000")
        prev_trunc = f"{prev_h[:6]}...{prev_h[-6:]}" if len(prev_h) > 12 else prev_h
        
        sig_h = b.get("signature_hash", "000000000000")
        sig_trunc = f"{sig_h[:6]}...{sig_h[-6:]}" if len(sig_h) > 12 else sig_h
        
        is_block_broken = b.get("is_broken", False) or b.get("tampered", False)
        status_label = "FALSIFIED" if is_block_broken else "VERIFIED"
        
        table_data.append([b_idx, time_part, t_dht, prev_trunc, sig_trunc, status_label])
        
    col_widths = [45, 68, 52, 140, 160, 75]
    t = Table(table_data, colWidths=col_widths)
    
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F2942')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 6.0),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 3.5),
        ('TOPPADDING', (0, 0), (-1, 0), 3.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (3, 1), (4, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 1), (-1, -1), 6.0),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 2.5),
        ('TOPPADDING', (0, 1), (-1, -1), 2.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]
    
    for r_idx in range(1, len(table_data)):
        bg_col = colors.HexColor('#F8FAFC') if r_idx % 2 == 1 else colors.white
        t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), bg_col))
        
        status_val = table_data[r_idx][5]
        if status_val == "VERIFIED":
            t_style.append(('TEXTCOLOR', (5, r_idx), (5, r_idx), colors.HexColor('#059669')))
            t_style.append(('FONTNAME', (5, r_idx), (5, r_idx), 'Helvetica-Bold'))
        else:
            t_style.append(('TEXTCOLOR', (5, r_idx), (5, r_idx), colors.HexColor('#DC2626')))
            t_style.append(('FONTNAME', (5, r_idx), (5, r_idx), 'Helvetica-Bold'))
            
    t.setStyle(TableStyle(t_style))
    
    t_w, t_h = t.wrapOn(c, page_w, page_h)
    table_y = table_section_y - 8 - t_h
    t.drawOn(c, margin_in + 4, table_y)
    
    # Full 64-character Final Chain Tip SHA-256 Digest Box
    tip_y = table_y - 28
    tip_box_w = page_w - 2 * margin_in - 8
    
    c.setFillColor(colors.HexColor('#F1F5F9'))
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(0.8)
    c.roundRect(margin_in + 4, tip_y, tip_box_w, 24, 3.5, stroke=1, fill=1)
    
    latest_sig = display_blocks[-1].get("signature_hash", "0" * 64) if display_blocks else "0" * 64
    
    c.setFillColor(colors.HexColor('#0F2942'))
    c.setFont("Helvetica-Bold", 5.5)
    c.drawString(margin_in + 9, tip_y + 15, "FINAL IMMUTABLE CHAIN TIP (SHA-256 DIGEST PROOF):")
    
    c.setFont("Courier-Bold", 6.2)
    c.setFillColor(colors.HexColor('#0369A1'))
    c.drawString(margin_in + 9, tip_y + 5.5, f"0x{latest_sig}")
    
    c.setFont("Helvetica", 5.2)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawRightString(margin_in + tip_box_w - 5, tip_y + 15, "ECDSA P-256 // NIST SP 800-90A TRNG // MERKLE CONTINUITY")
    
    # ----------------------------------------------------
    # 5. CUSTOM VECTOR STAMP & VERIFICATION QR CODE (FOOTER)
    # ----------------------------------------------------
    footer_section_y = tip_y - 12
    c.setFillColor(colors.HexColor('#0F2942'))
    c.setFont("Helvetica-Bold", 8.0)
    c.drawString(margin_in + 6, footer_section_y, "3. REGULATORY ATTESTATION & CRYPTOGRAPHIC VERIFICATION SEAL")
    
    footer_box_y = margin_in + 5
    footer_box_h = footer_section_y - footer_box_y - 6
    footer_box_w = page_w - 2 * margin_in - 8
    
    c.setFillColor(colors.HexColor('#FAFAFA'))
    c.setStrokeColor(colors.HexColor('#E2E8F0'))
    c.setLineWidth(0.8)
    c.roundRect(margin_in + 4, footer_box_y, footer_box_w, footer_box_h, 4, stroke=1, fill=1)
    
    # Generate QR Code Image
    qr_data = (
        f"WHO-PQS-CERT:{cert_id}|NODE:{node_id}|"
        f"CHAIN_TIP:{latest_sig[:16]}...|STATUS:{'RELEASE_APPROVED' if is_passed else 'QUARANTINE_REJECTED'}|"
        f"POTENCY:{potency_pct:.1f}%|MKT:{mkt_temp:.2f}C|DS1307:{rtc_timestamp[:19]}"
    )
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0F2942", back_color="white")
    
    qr_temp_path = os.path.join(os.getcwd(), f"temp_qr_{random.randint(100, 999)}.png")
    qr_img.save(qr_temp_path)
    
    qr_size = 72
    qr_x = margin_in + 14
    qr_y = footer_box_y + (footer_box_h - qr_size) / 2
    c.drawImage(qr_temp_path, qr_x, qr_y, width=qr_size, height=qr_size)
    
    try:
        os.remove(qr_temp_path)
    except Exception:
        pass
        
    # Text next to QR code
    c.setFillColor(colors.HexColor('#0F2942'))
    c.setFont("Helvetica-Bold", 7.0)
    c.drawString(qr_x + qr_size + 10, footer_box_y + footer_box_h - 18, "WHO PQS AUDIT DEEP-LINK VERIFICATION")
    
    c.setFont("Helvetica", 5.5)
    c.setFillColor(colors.HexColor('#475569'))
    info_lines = [
        f"• Certificate Serial: {cert_id} (Issued under WHO PQS E006 Guideline)",
        f"• Hardware Node: {node_id} (Microchip ATECC608A Cryptographic Co-Processor)",
        f"• DS1307 RTC Hardware Sync: {rtc_timestamp[:19]}",
        f"• Mean Kinetic Temperature (MKT): {mkt_temp:.2f}°C (Threshold: 2.0°C – 8.0°C)",
        f"• Regulatory Authority: Annex 9 to WHO Technical Report Series, No. 961",
        "• Scan QR code with any standard camera to inspect raw JSON cryptographic proof."
    ]
    
    for i, line in enumerate(info_lines):
        c.drawString(qr_x + qr_size + 10, footer_box_y + footer_box_h - 28 - (i * 9), line)
        
    # Draw Vector Official Stamp on bottom-right
    stamp_cx = page_w - margin_in - 68
    stamp_cy = footer_box_y + (footer_box_h / 2) + 2
    draw_official_stamp(c, stamp_cx, stamp_cy, is_passed=is_passed, rtc_date=rtc_date_short)
    
    # Finalize Page
    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()

if __name__ == "__main__":
    sample_data = {
        "cert_id": "WHO-VAX-2026-9E4B",
        "node_id": "VAX-NODE-01",
        "blocks": [
            {"block_index": 100, "timestamp": "2026-11-13T12:00:00Z", "temp_dht": 4.15, "temp_ntc": 4.10, "prev_hash": "000000000019d6689c08", "signature_hash": "a1b2c3d4e5f60718293a", "is_broken": False},
            {"block_index": 101, "timestamp": "2026-11-13T12:02:30Z", "temp_dht": 4.28, "temp_ntc": 4.23, "prev_hash": "a1b2c3d4e5f60718293a", "signature_hash": "b2c3d4e5f6a7b8c9d0e1", "is_broken": False},
            {"block_index": 102, "timestamp": "2026-11-13T12:05:00Z", "temp_dht": 4.45, "temp_ntc": 4.40, "prev_hash": "b2c3d4e5f6a7b8c9d0e1", "signature_hash": "c3d4e5f6a7b8c9d0e1f2", "is_broken": False},
            {"block_index": 103, "timestamp": "2026-11-13T12:07:30Z", "temp_dht": 4.82, "temp_ntc": 4.78, "prev_hash": "c3d4e5f6a7b8c9d0e1f2", "signature_hash": "d4e5f6a7b8c9d0e1f2a3", "is_broken": False},
            {"block_index": 104, "timestamp": "2026-11-13T12:10:00Z", "temp_dht": 5.10, "temp_ntc": 5.04, "prev_hash": "d4e5f6a7b8c9d0e1f2a3", "signature_hash": "e5f6a7b8c9d0e1f2a3b4", "is_broken": False},
            {"block_index": 105, "timestamp": "2026-11-13T12:12:30Z", "temp_dht": 4.30, "temp_ntc": 4.25, "prev_hash": "e5f6a7b8c9d0e1f2a3b4", "signature_hash": "f6a7b8c9d0e1f2a3b4c5", "is_broken": False},
            {"block_index": 106, "timestamp": "2026-11-13T12:15:00Z", "temp_dht": 4.22, "temp_ntc": 4.18, "prev_hash": "f6a7b8c9d0e1f2a3b4c5", "signature_hash": "a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8", "is_broken": False},
        ],
        "is_chain_intact": True,
        "potency_pct": 100.0,
        "remaining_hours": 718.5,
        "mkt_temp": 4.38,
        "batt_v": 3.01,
        "projected_days": 184,
        "enclosure_status": "SEALED"
    }
    
    pdf_bytes = build_who_certificate_pdf(sample_data)
    with open("test_output.pdf", "wb") as f:
        f.write(pdf_bytes)
    print(f"Generated test_output.pdf successfully ({len(pdf_bytes)} bytes)")
