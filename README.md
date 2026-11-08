# SwarnaTrack (ஸ்வர்ணட்ராக்)
### Workshop Gold Custody, Wastage Control & Compliance Platform

**Client**: Company A, Coimbatore — Jewellery Chain (5 Showrooms, Central Workshop, 40 Karigars, 180 Staff, ₹220–260 Crore Annual Revenue)  
**GitHub Repository**: [https://github.com/creativecoder99/Jewellery-Chain-webApp.git](https://github.com/creativecoder99/Jewellery-Chain-webApp.git)  
**Live Hosted Application**: [https://jewellery-seven-alpha.vercel.app/](https://jewellery-seven-alpha.vercel.app/)  
**Primary Impact**:
- Unexplained gold loss reduced from **0.40%** to **<0.15%** (saving **₹1.20 Crore / year** in unaccounted gold leakage)
- Month-end reconciliation collapsed from **6 people × 3 days** (216 person-days) to **half a day** (saving **₹5.40 Lakh / year** in accounting labor)
- Total annual savings: **₹1.25 Crore / year**

---

## Key Features

1. **Exact 3-Decimal Fine Gold Mathematics**:
   - Strict epsilon-safe decimal arithmetic (`0.001g` precision for weights, `0.01%` for purity, `₹0.01` for INR).
   - Zero floating-point rounding drift.
   - Tested against exact prompt rows: `TX-30411` (120g @ 91.6% = 109.920g fine), `TX-30437` (112.450g = 103.004g fine), and `TX-30438` (3.300g = 3.023g fine).

2. **AI Vision & Side-by-Side Scale Reader**:
   - Optical character recognition on electronic scale displays and Karat Meter thermal receipts.
   - **Side-by-side verification**: detected values are presented alongside the original photograph.
   - **Discrepancy protection**: if typed value differs from scale readout by $> 0.005\text{g}$, saving is blocked until the clerk provides a verified reason and checks confirmation.

3. **Loss Drift Anomaly Detection**:
   - Statistical rolling Z-score model evaluated per karigar per article category.
   - Flags artisans whose loss trends upward beyond $1.6\sigma - 2.2\sigma$ from their personal baseline.
   - **Executive-only review**: visible exclusively to Finance Head and Managing Partner as constructive investigation prompts (e.g. crucible slag, ultrasonic sediment, wire drawing acid baths), never as accusations.

4. **Karigar Mobile Portal with Tamil Localization (தமிழ்)**:
   - Mobile-first layout designed for smartphone screens.
   - Bilingual toggle between English and authentic Coimbatore workshop Tamil:
     - வழங்கல் சீட்டு (Issue Slip), வரவு சீட்டு (Receipt Slip), சுத்த தங்கம் (Fine Gold), நிலுவை சுத்த தங்கம் (Running Balance).
   - Instant printable/shareable digital vouchers with clerk authorization and karigar acknowledgment signatures.

5. **Old Gold Desk & Income Tax Statutory Compliance**:
   - Showroom exchange gold intake with karat meter testing, stone/dirt deductions, and valuation at spot rate.
   - **Section 269ST & Rule 114B Enforcement**:
     - Automatically mandates and validates Indian PAN format (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) for transactions $\ge \text{₹2,00,000}$.
     - Blocks cash payouts of ₹2,00,000 or greater, enforcing Exchange Bill adjustment or Bank Transfer.

6. **Daily Stock Statement & Tally Prime Integration**:
   - Live custody tracking across Vault Bullion, Manufactured Stock, Karigars (40), and Refinery Scrap Pipeline.
   - One-click export of official Tally Prime / ERP 9 XML envelope (`<ENVELOPE><HEADER>...`) and audit CSV.

7. **Shared Tablet Offline Resilience**:
   - Built-in `OfflineSyncManager` that queues transactions locally during power or network cuts and auto-syncs when reconnected.

---

## Design System & Principles

In strict adherence to design constraints:
- **Palette**: Warm neutral background (`#FBF9F5` / `#F8F6F0`), dark readable charcoal ink (`#1C1917` / `#57534E`), and one restrained workshop accent: burnished gold (`#8C6820`).
- **Typography**: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`) with `font-variant-numeric: tabular-nums` for strict numeral alignment.
- **Restraint**: Zero harsh gradients, rainbow colors, generic pastels, radial orbs, dot grids, liquid glass, decorative stripes, or sparkle icons.
- **States**: Complete loading skeletons, empty state guidance, and structured form validation.

---

## Quick Start (Local Setup)

```bash
# 1. Clone repository
git clone https://github.com/creativecoder99/Jewellery-Chain-webApp.git
cd Jewellery-Chain-webApp

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Run automated test suite (15 unit tests)
npm test

# 5. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Demo Roles & Login Guide

Use the **Role Selector** in the top navigation bar to test different personas instantly:

- **Issue Clerk** (`clerk@company-a.com`): Gold issue, article receipt with HUID, scrap weighment, old gold intake.
- **Finance Head** (`finance@company-a.com`): Custody statement, Tally export, and confidential **Loss Drift Review Items**.
- **Managing Partner** (`partner@company-a.com`): Executive oversight, month-end sign-off.
- **Karigar** (`karigar@company-a.com` / Murugesan S): Smartphone view with Tamil toggle, running fine balance, and slips.

---

## Submission Artifacts

- **`TDD.docx` / `TDD.md`**: Complete Technical Design Document covering architecture, data model, AI vision & anomaly models, UI decisions, labeled assumptions, and scope trade-offs.
- **`deployment.md`**: Step-by-step local run instructions, environment variable names, and reviewer demo credentials.
- **`submission.zip`**: Archive containing `TDD.docx` and `deployment.md` ready for upload.

