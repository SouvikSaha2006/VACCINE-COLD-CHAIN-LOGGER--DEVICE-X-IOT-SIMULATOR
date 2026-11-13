# VaxGuard Zero-Trust Cold-Chain Sentinel 🧊🛡️
> **WHO PQS-Compliant Real-Time Cryptographic Vaccine Telemetry & ATECC608A Immutable Ledger System**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![ReportLab](https://img.shields.io/badge/ReportLab-PDF_Engine-red.svg)](https://www.reportlab.com/)
[![MQTT](https://img.shields.io/badge/MQTT-HiveMQ_WebSocket-orange.svg)](https://www.hivemq.com/)

---

## 📌 Executive Overview

**VaxGuard Zero-Trust Cold-Chain Sentinel** is a mission-critical biopharmaceutical cold-chain monitoring system engineered according to **WHO PQS E006 / TRS 961 Annex 9** and **FDA 21 CFR Part 11** guidelines. 

Traditional cold-chain loggers store raw sensor values in mutable databases susceptible to post-hoc record falsification by distributors concealing temperature excursions. VaxGuard solves this vulnerability through an **on-chip cryptographic hash-chaining architecture (Microchip ATECC608A emulation)**: each packet cryptographically binds sensor telemetry to the previous block's SHA-256 digest. Any retrospective database modification instantly breaks cryptographic continuity across the entire ledger.

---

## 🏛️ The 4 Core Engineering Pillars

### **Pillar 1: Live Telemetry & 3D Cryo-Box Physical Digital Twin**
- **Live MQTT WebSocket Stream**: Real-time connection to `wss://broker.hivemq.com:8884/mqtt` on topic `devicex/souvik/vaccine-chain`.
- **Interactive 3D Perspective Digital Twin**:
  - `VERIFIED_SAFE`: Emits an ambient cold cyan glow with vacuum seal interlock secured.
  - `COLD_CHAIN_EXCURSION`: Pulses in thermal amber alarm when exceeding safe bands.
  - `LID BREACHED`: Kinematically opens the vacuum lid on hinges with pulsing crimson warning and optical interlock beam severance alerts.
- **Top 4 KPI Metrics**:
  1. **Vaccine Core Temperature & Humidity**: Monitored against the strict WHO $2.0^\circ\text{C}–8.0^\circ\text{C}$ safe preservation band.
  2. **Dual-Sensor Fault Tolerance**: Real-time cross-probe drift analysis ($\Delta = |\text{temp\_dht} - \text{temp\_ntc}|$) with calibration tolerances ($\le \pm0.50^\circ\text{C}$).
  3. **Hardware RTC Timestamp**: Direct synchronization from onboard **DS1307 Real-Time Clock**.
  4. **WHO Arrhenius Bio-Potency Engine (Signature USP)**: Computes live antigen viability (%) and remaining safe shelf-life hours using Arrhenius kinetic degradation formulas:
     $$k(T) = A \cdot \exp\left(-\frac{E_a}{R \cdot T}\right)$$

---

### **Pillar 2: Continuous Environmental Metric Logging**
- **Multi-Trace Telemetry Chart**: Real-time dual-line plot tracking DHT22 Core Temp (°C), NTC Thermistor Probe (°C), and Relative Humidity (% RH).
- **Visual WHO Safe Ribbon**: Shaded emerald safe-zone ($2^\circ\text{C}–8^\circ\text{C}$) with dashed boundary reference lines.

---

### **Pillar 3: Hardware Cryptographic Hashing & Tamper-Evident Ledger**
- **Microchip ATECC608A Hardware Security Module Panel**:
  - Live Active Chain Tip hash.
  - Hardware signing benchmark ($1.8\,\text{ms}$).
  - Cryptographic standard: NIST FIPS 180-4 SHA-256 / Slot 0 ECC Private Key.
- **Micro-Blockchain Ledger Table**: Every telemetry block displays `block_index`, `timestamp`, `temp_dht`, `prev_hash`, and `signature_hash` with green `SHA-256 VERIFIED` badges.
- **Simulate Database Tamper Attack Engine**:
  - On any block row, simulate a rogue administrator falsifying an excursion (e.g., rewriting $12.00^\circ\text{C}$ down to $4.50^\circ\text{C}$).
  - Re-computed SHA-256 immediately disagrees with the signed digest.
  - That block and **all subsequent blocks cascade to bright red**:  
    `CRYPTOGRAPHIC CHAIN BROKEN — FALSIFICATION DETECTED`.

---

### **Pillar 4: Extended Coin-Cell Endurance & Adaptive Duty-Cycle Analyzer**
- **CR2450 Coin-Cell Voltage Bar**: Calibrated gauge from $3.0\,\text{V}$ nominal down to the $2.0\,\text{V}$ cutoff.
- **Adaptive Duty-Cycle Oscilloscope**:
  - Visualizes current draw signature: $14\,\mu\text{A}$ ULP Deep Sleep baseline vs. $45\,\text{mA}$ Emergency MQTT RF Bursts.
- **Projected Battery Endurance**: Real-time longevity projection ($\sim 184\,\text{Days}$ continuous runtime on a standard $620\,\text{mAh}$ lithium coin cell under $0.20\%$ adaptive duty cycle).

---

## 📜 Regulatory Handoff — One-Click WHO Audit Certificate

The system features a Python **FastAPI** + **ReportLab** + **qrcode** backend generating an official 1-page A4 PDF compliance certificate:

1. **Guilloche Security Border & Micro-Text**: Double-line `#0F2942` navy and `#0D9488` teal with registration marks and a diagonal watermark (`WHO PQS COLD-CHAIN AUDIT`).
2. **Official Header**: Vector-drawn WHO globe-and-caduceus emblem, Certificate Serial ID (`WHO-VAX-2026-XXXX`), and dynamic status banner.
3. **2×3 Metrics Grid**: Hardware node, verified blocks count, temperature min/max/mean, drift, seal integrity, and Arrhenius potency score.
4. **Audit Ledger Table**: Block-by-block cryptographic trail with the 64-character Merkle root hash.
5. **Authentic Vector Stamp & QR Code**:
   - Double concentric circular ink stamp rotated at **`-8.0 degrees`** (`#1E3A8A` ink-blue for approved, `#B91C1C` for quarantine).
   - Machine-readable QR Code encoding full verification JSON for inspector mobile scanning.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+) & **pip**

### 1. Clone Repository
```bash
git clone https://github.com/SouvikSaha2006/VACCINE-COLD-CHAIN-LOGGER--DEVICE-X-IOT-SIMULATOR.git
cd VACCINE-COLD-CHAIN-LOGGER--DEVICE-X-IOT-SIMULATOR
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
pip install fastapi uvicorn reportlab qrcode[pil] pydantic pymupdf
```

### 3. Launch Servers
**Terminal 1 — FastAPI Backend (Port 8000):**
```bash
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — React + Vite Frontend (Port 5173):**
```bash
npm run dev -- --host --port 5173
```

Open your browser at **`http://localhost:5173/`**.

---

## 📡 MQTT Interface Specs

| Parameter | Value |
| :--- | :--- |
| **Broker URL** | `wss://broker.hivemq.com:8884/mqtt` |
| **Topic** | `devicex/souvik/vaccine-chain` |
| **QoS** | `0` |
| **Payload Schema** | JSON with `block_index`, `timestamp`, `temp_dht`, `temp_ntc`, `humidity`, `batt_v`, `power_mode`, `enclosure`, `prev_hash`, `signature_hash` |

---

## 📄 License
This project is licensed under the MIT License.
