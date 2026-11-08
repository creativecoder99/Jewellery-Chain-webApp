# SwarnaTrack — Deployment & Local Setup Guide

Company A, Coimbatore — Jewellery Workshop Gold Custody, Wastage Control & Old Gold Compliance System

---

## 1. Project Overview

- **GitHub Repository**: [https://github.com/creativecoder99/Jewellery-Chain-webApp.git](https://github.com/creativecoder99/Jewellery-Chain-webApp.git)
- **Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, Zod Validation, Tesseract.js OCR, Vitest.
- **Precision**: Exact 3-decimal fine gold calculations (`0.001g`), 2-decimal purity (`0.01%`), 2-decimal currency (`₹0.01`).

---

## 2. Step-by-Step Local Setup

### Prerequisites
- Node.js `v18.18.0` or higher (tested on Node `v20` and `v24`)
- npm `v9` or higher

### Step 1: Clone the Repository
```bash
git clone https://github.com/creativecoder99/Jewellery-Chain-webApp.git
cd Jewellery-Chain-webApp
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

*(On Windows PowerShell: `Copy-Item .env.example .env.local`)*

### Step 4: Run Unit Tests
To verify all mathematical calculations, anomaly detection, and validation rules:
```bash
npm test
```
All 15 automated test suites will execute across exact sample math, OCR pattern recognition, loss drift evaluation, and statutory PAN validation.

### Step 5: Start the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

Alternatively, to run an optimized production build:
```bash
npm run build
npm start
```

---

## 3. Environment Variables (Names Only)

As per submission instructions, only variable names are listed:

- `PORT`
- `NODE_ENV`
- `APP_SECRET_KEY`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_DEFAULT_GOLD_RATE`
- `NEXT_PUBLIC_TALLY_COMPANY_NAME`

---

## 4. Demo Login & Role Credentials for Reviewer

SwarnaTrack includes an **Instant Role Switcher** in the top navigation bar. You do not need to log out and re-enter credentials to test different personas.

| Role | Demo Identity | Access Level & Key Features |
|---|---|---|
| **Issue Clerk** | `clerk@company-a.com` | Issues gold to karigars, captures scale photos, records article receipts with HUID, scrap, and dust; handles old gold exchange intake. |
| **Finance Head** | `finance@company-a.com` | Full custody dashboard, Tally XML & CSV exports, audit reconciliation, and confidential **Loss Drift Review Items**. |
| **Managing Partner** | `partner@company-a.com` | Executive oversight, stock valuation, loss trend analysis, and digital month-end sign-off. |
| **Karigar (Artisan)** | `karigar@company-a.com` *(Murugesan S)* | Mobile-optimized smartphone view with full **Tamil (தமிழ்)** translation, live fine balance, active jobs, and digital slips. |

*Note: Use the "Role" dropdown located at the top-right of the header to instantly switch between roles.*

---

## 5. Walkthrough of Key Evaluation Flows

### Flow 1: Gold Issue Entry with Scale OCR (`/issue`)
1. Switch role to **Issue Clerk** and click **Issue Gold**.
2. Select **Murugesan S** (KAR-01) and article category **Necklace**.
3. Under the **Scale & Karat Meter Vision Assistant**, notice the preloaded scale photo (`120.000g`). Click **Apply Scale Reading to Form**.
4. Test the mismatch prevention: Change the typed weight in the form to `122.500g`. Notice the system detects the discrepancy and blocks submission until the clerk enters an override reason and checks confirmation.
5. Click **Confirm & Generate Karigar Slip** to generate the digital voucher and update the running balance.

### Flow 2: Receipt & Wastage Settlement (`/receipt`)
1. Select active Job `#JOB-3041` for **Murugesan S**.
2. Notice the prefilled test weighment: Finished Necklace `112.450g` with HUID `CB9421`, Scrap `3.300g`.
3. Review the **Live Settlement Maths**: Allowed wastage vs actual loss vs variance.
4. Click **Record Receipt & Generate Slip** to create receipt voucher `TX-30437`.

### Flow 3: Old Gold Desk & Statutory Compliance (`/old-gold`)
1. Review an exchange intake of `34.500g` at tested purity `91.60%`.
2. Notice the net valuation exceeds ₹2,00,000:
   - The system automatically requires a valid Indian PAN card (`ABCDE1234F`).
   - The system prohibits Cash payout per Section 269ST, selecting Exchange Bill Adjustment or Bank Transfer.

### Flow 4: Loss Drift Alerts (`/alerts`)
1. Switch role to **Finance Head** or **Managing Partner**.
2. View **Active Items for Senior Review**.
3. Inspect artisan **Palanisamy K** (Job `#JOB-3022`), whose loss drifted from baseline `2.15%` to `2.67%`.
4. Review the non-accusatory investigation focus prompt (*"Examine wire-drawing lubricant bath and annealing oxide pickling acid"*). Add notes and mark as reviewed.

### Flow 5: Karigar Mobile Portal in Tamil (`/karigar-portal`)
1. Switch role to **Karigar (Phone View)** or navigate to `/karigar-portal`.
2. Toggle language to **தமிழ் (Tamil)** using the top language switch.
3. Observe Tamil terminology: நிலுவை சுத்த தங்கம், வழங்கல் சீட்டு, வரவு சீட்டு, ஆரம் சேதாரம்.
4. Click on any transaction slip to view the printable voucher.

### Flow 6: Tally XML & Stock CSV Export (`/`)
1. On the main dashboard, click **Export Tally XML** or **Export CSV**.
2. The system generates an official Tally Prime / ERP 9 XML envelope (`<ENVELOPE><TALLYREQUEST>...`) ready for import into Tally company accounts.

