# Technical Design Document (TDD)
## SwarnaTrack: Workshop Gold Custody, Wastage Control & Compliance Platform

**GitHub Repository**: [https://github.com/creativecoder99/Jewellery-Chain-webApp.git](https://github.com/creativecoder99/Jewellery-Chain-webApp.git)  
**Live Hosted Application**: [https://jewellery-seven-alpha.vercel.app/](https://jewellery-seven-alpha.vercel.app/)  
**Client**: Company A, Coimbatore — Jewellery Chain (5 Showrooms, Central Workshop, 40 Karigars, 180 Staff, ₹220–260 Crore Revenue)  
**Target Impact**: Reduce unexplained manufacturing gold loss from 0.40% to <0.15% (saving ₹1.2 Crore/yr); collapse month-end reconciliation from 3 days to 0.5 days (saving ₹5.4 Lakh/yr).

---

## 1. Executive Summary & Problem Formulation

### 1.1 Context
Company A operates five retail jewellery showrooms in and around Coimbatore supplied by a central manufacturing workshop employing approximately 40 karigars (goldsmiths). Currently, gold movement between the vault and workshop artisans is recorded on physical paper ledgers and transcribed to spreadsheets. A manual clerk calculates wastage allowances by hand when finished jewellery, casting scrap, and filings return. Customer exchange gold is tested on XRF karat meters and noted manually before entry into billing software.

### 1.2 Mathematical Leakage & Business Case (Labeled Assumptions)
The financial model and operational parameters in SwarnaTrack are built directly on the problem statement assumptions:
1. **[Assumption A-1: Monthly Issue Volume]**: The central workshop issues an average of **20.000 kg** of fine gold per month, amounting to **240.000 kg** annually.
2. **[Assumption A-2: Baseline Unexplained Loss]**: Historical ledger leakage beyond agreed master wastage averages **0.40%**, representing **960.000 grams** of fine gold lost per year.
3. **[Assumption A-3: Market Gold Rate]**: Gold valuation is benchmarked at **₹12,500 per gram** of fine gold. At this rate, 960g represents **₹1.20 Crore** in annual unaccounted deficit.
4. **[Assumption A-4: Reconciliation Overhead]**: Month-end reconciliation currently requires **6 people × 3 working days × 12 months = 216 person-days**. At an assumed cost of **₹2,500 per day**, labor cost is **₹5.40 Lakh/year**.
5. **[Assumption A-5: Total Annual Cost of Problem]**: ₹1.20 Crore (material loss) + ₹5.40 Lakh (labor) = **₹1.254 Crore per year**.
6. **[Assumption A-6: Success Criteria]**: Reduce unexplained loss from 0.40% to under **0.15%** (saving ~₹75–85 Lakhs net) and compress reconciliation from 3 days to **half a day**.

---

## 2. Architecture & Technical Decisions

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|  - Next.js 14 / React 18 / TypeScript SPA                                       |
|  - Warm Neutral Responsive Layout (Tailwind Custom Tokens: #FBF9F5 / #8C6820)   |
|  - Tabular Numerals Font Stack (font-variant-numeric: tabular-nums)             |
|  - Bilingual Tamil (தமிழ்) & English localization engine                        |
|  - Offline Sync Queue Manager (Local Storage / IndexedDB for tablet resilience) |
+----------------------------------------+----------------------------------------+
                                         | REST / JSON
+----------------------------------------v----------------------------------------+
|                                APPLICATION TIER                                 |
|  - Next.js API Routes (Serverless / Node.js Engine)                             |
|  - Exact 3-Decimal Math Engine (IEEE floating-point drift prevention)           |
|  - Zod Request Schema Validator & Indian Statutory Compliance Guards            |
|    * Income Tax Act Section 269ST (Cash >= 2L Prohibited)                       |
|    * Income Tax Rule 114B (PAN Mandatory >= 2L)                                |
|    * BIS 6-Character Hallmark Unique ID (HUID) Validation                       |
|  - AI Vision & Scale OCR Processing (Tesseract.js & Heuristic Pattern Matching) |
|  - Statistical Loss Drift Anomaly Engine (Rolling Mean + Standard Deviation)    |
|  - Tally Prime / ERP 9 XML Envelope Generator                                   |
+----------------------------------------+----------------------------------------+
                                         |
+----------------------------------------v----------------------------------------+
|                               PERSISTENCE TIER                                  |
|  - Atomic Thread-Safe File-Backed Relational Store (.data/workshop_db.json)     |
|  - Instant Seed / Reset Fixtures containing authentic prompt transactions       |
+---------------------------------------------------------------------------------+
```

### 2.1 Why This Architecture Was Chosen
- **Unified Full-Stack TypeScript**: By utilizing Next.js 14 with TypeScript, the exact 3-decimal math engine, data contracts, and validation rules are shared identically between browser client and server, preventing rounding drift.
- **Zero-Dependency Native File-Backed Persistence**: In workshop environments with shared tablets and potential power cuts, an atomic file-backed JSON ledger guarantees instant cold startup without external database connection pool overhead or native C++ compilation issues.
- **Offline Resilience for Workshop Shared Tablets**: Shared workshop tablets often face connectivity fluctuations in factory environments. The client implements an `OfflineSyncManager` that queues transactions locally and syncs automatically with conflict validation when reconnected.
- **Exact Tabular Mathematics**: Standard JavaScript numbers suffer from IEEE 754 precision drift (e.g. `0.1 + 0.2 !== 0.3`). The math engine implements strict epsilon rounding (`Math.round((val + Number.EPSILON) * 1000) / 1000`) ensuring 100% precision for gram weights to 3 decimals and percentages to 2 decimals.

---

## 3. Data Model & Entity Relationships

The data model is structured around gold movement, accountability, and legal compliance:

### 3.1 Entities
1. **`Karigar`**:
   - `id`: Unique identifier (`KAR-01` to `KAR-40`).
   - `name`, `tamilName`, `phone`, `specialization`.
   - `categoryWastage`: Dictionary of agreed percentage wastage per article category (e.g., Necklace: `3.00%`, Bangle: `2.20%`, Chain: `2.20%`, Ring: `1.60%`, Antique: `4.50%`).
   - `currentFineBalanceG`: Running fine gold currently in artisan custody (`0.001g` precision).
   - `lifetimeIssuedG`, `lifetimeReturnedG`, `lifetimeUnexplainedLossG`.
   - `historicalMeanLossPct`, `historicalLossStdDev`: Personal baseline metrics.

2. **`Transaction`**:
   - `id`: Voucher identifier (`TX-30411`, `TX-30437`, etc.).
   - `type`: `issue`, `receipt_piece`, `receipt_scrap`, `receipt_filings`, `wastage_settlement`.
   - `karigarId`, `jobNumber`, `itemCategory`, `huid`.
   - `grossWeightG`, `purityPct`, `fineWeightG`.
   - `fineBalanceAfterG`: Running balance snapshot after this voucher.
   - `scalePhotoUrl`, `clerkConfirmed`, `scaleDiscrepancyReason`.

3. **`JobOrder`**:
   - `jobNumber` (`JOB-3041`), `itemCategory`, `issuedFineG`, `issuedGrossG`.
   - `receivedPieces`: Array of received articles with gross weight, purity, and HUID.
   - `receivedScrapFineG`, `receivedFilingsFineG`, `totalReturnedFineG`.
   - `allowedLossFineG`, `actualLossFineG`, `unexplainedLossFineG`.
   - `status`: `in_progress`, `settled`, `flagged`.

4. **`OldGoldEntry`**:
   - `id` (`OG-7012`), `showroomBillNo`, `customerName`, `customerPhone`.
   - `grossWeightG`, `stoneWeightG`, `dirtDeductionPct`, `netMeltWeightG`.
   - `testedPurityPct` (from karat meter), `fineWeightG`, `goldRatePerGram`.
   - `grossValuationInr`, `netPayableInr`, `paymentMode`.
   - `customerPan`: Validated against `[A-Z]{5}[0-9]{4}[A-Z]{1}` if valuation >= ₹2,00,000.
   - `destination`: `vault` (in-house melting) or `refiner` (external batch).

5. **`StockSummary`**:
   - `vaultBullionFineG`, `vaultManufacturedFineG`, `withKarigarsFineG`, `atRefinerFineG`.
   - `totalWorkshopFineG`: Sum of all custody locations.
   - `unexplainedLossMonthToDateG`, `lossPercentageMonthToDate`.

---

## 4. Main Operational Flows

### Flow 1: Gold Issue & Running Balance Calculation
1. The Issue Clerk selects the karigar and category. The system pulls the artisan's pre-agreed wastage rate and current running balance.
2. The clerk places raw alloy on the precision scale. The Vision Assistant reads the scale image and detects weight and purity.
3. The system computes fine gold weight:
   $$\text{Fine Weight (g)} = \text{round3}\left(\text{Gross Weight (g)} \times \frac{\text{Purity \%}}{100}\right)$$
4. The system creates the transaction, updates the karigar running balance ($Bal_{new} = Bal_{current} + Fine_{issued}$), deducts unmanufactured vault bullion, and generates an official physical/digital voucher with clerk authorization and karigar acknowledgment signatures.

### Flow 2: Receipt & Wastage Settlement
1. When finished jewellery returns, the clerk links the intake to the active Job Order.
2. The clerk records the finished articles with their 6-character BIS Hallmark Unique ID (HUID), scrap trimmings, and bench filings.
3. The math engine calculates:
   $$\text{Total Returned Fine (g)} = Fine_{finished} + Fine_{scrap} + Fine_{filings}$$
   $$\text{Actual Loss (g)} = \max(0, Fine_{issued} - \text{Total Returned Fine})$$
   $$\text{Allowed Wastage Allowance (g)} = \text{round3}\left(Fine_{issued} \times \frac{\text{Allowed Wastage \%}}{100}\right)$$
   $$\text{Unexplained Variance (g)} = \text{Actual Loss (g)} - \text{Allowed Wastage Allowance (g)}$$
4. If the job is closed, the agreed allowed wastage allowance is credited against the artisan's balance. Any unexplained variance is tracked in the artisan's lifetime record and passed to the AI Anomaly Detector.

### Flow 3: Old Gold Desk & Statutory Income Tax Compliance
1. Customer exchange jewellery received from retail showrooms is entered with the Showroom Bill Number.
2. Net melt weight is determined after deducting stones and dirt allowance:
   $$\text{Net Melt Weight} = (Gross - Stones) \times \left(1 - \frac{Dirt \%}{100}\right)$$
3. Karat meter XRF tested purity is recorded, determining fine gold value at spot rate.
4. **Income Tax Section 269ST & Rule 114B Enforcement**:
   - If Net Payable $\ge \text{₹2,00,000}$:
     - Permanent Account Number (PAN) is legally required and validated via regex.
     - Cash payout is disabled; payment mode is restricted to Exchange Bill Invoice Adjustment, Bank Transfer, or Cheque.
     - If payout is under ₹2,00,000, cash is permitted up to Section 40A(3) limits.

### Flow 4: Daily Stock Statement & Tally Prime Integration
1. Real-time balance consolidation calculates total fine gold across four custody locations:
   $$\text{Total Custody} = Vault_{bullion} + Vault_{manufactured} + Karigars_{workshop} + Refiner_{scrap}$$
2. The system generates an official Tally Prime XML envelope (`<ENVELOPE><HEADER>...<BODY><IMPORTDATA>...`) mapping material inward/outward vouchers directly into Tally company accounts, eliminating 3-day spreadsheet re-entry.

### Flow 5: Karigar Mobile Slip View with Tamil Localization
1. Karigars access their portal via smartphone.
2. The entire interface supports English and authentic Tamil (தமிழ்).
3. The prominent element is their current running fine balance (`நிலுவை சுத்த தங்கம்`).
4. Slips can be inspected or printed directly, ensuring transparency on weight, purity, and allowed wastage.

---

## 5. How the AI & Automation Works

### 5.1 Scale & Karat Meter Photo Vision Reader
The AI assistant automates data entry and eliminates transcription errors:
1. **OCR Pipeline**: Utilizing Tesseract.js with image preprocessing (adaptive thresholding and contrast optimization) and domain-specific regex heuristics.
2. **Extraction Rules**:
   - Detects 3-decimal gross weights (e.g. `120.000 g`, `112.450 g`, `3.300 g`).
   - Detects purity percentages and Karat indicators (`91.60 %`, `22K`, `75.00 %`).
3. **Handling OCR Mistakes & Side-by-Side Safeguard**:
   - The detected numbers appear directly beside the original scale photograph.
   - If the clerk types a value differing from the detected value by more than $\pm 0.005\text{g}$, an alert banner triggers:
     *"Weight Discrepancy Detected: Scale display reads 120.000g, but entered value is 122.500g."*
   - Saving is strictly blocked until the clerk enters a mandatory override reason (e.g., *"Tare paper offset accounted"*) and checks the confirmation safeguard.

### 5.2 Statistical Loss Drift Anomaly Detection
Rather than using arbitrary thresholds, SwarnaTrack employs a statistical baseline model:
1. **Artisan Baseline**: Each karigar has a rolling mean historical loss rate $\mu$ and standard deviation $\sigma$ across completed jobs in each category.
2. **Z-Score Drift Calculation**:
   $$Z = \frac{\text{Job Loss Rate \%} - \mu}{\sigma}$$
3. **Trigger Thresholds**:
   - $Z \ge 2.2$ and Unexplained Loss $> 0.2\text{g}$: Classified as `Attention Required`.
   - $Z \ge 1.6$ and Unexplained Loss $> 0.1\text{g}$: Classified as `Review Recommended`.
4. **Constructive Review Prompts**:
   - Per design constraints, alerts are shown **exclusively to the Finance Head and Managing Partner**.
   - Alerts are formulated as constructive investigation prompts (never as accusations), suggesting physical root causes tailored to jewellery craft:
     - *Necklace*: "Review filing tray collection around stone-prong grinding stations and ultrasonic wash sediment."
     - *Bangle*: "Verify die-punching border scrap collection in the pressing unit."
     - *Chain*: "Examine wire-drawing lubricant bath and annealing oxide pickling acid."

---

## 6. UI & Design Decisions

### 6.1 Visual Direction & Reusable Design Values
In strict compliance with the client design instructions:
- **Background**: Near-white warm neutral (`#FBF9F5` / `#F8F6F0`). Pure white page backgrounds, dark mode black backgrounds, harsh neon gradients, and rainbow color schemes are avoided.
- **Typography & Dark Readable Text**: Primary ink `#1C1917` (rich charcoal) with secondary ink `#57534E`. System font stack chosen for maximum native readability: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **One Restrained Accent**: Deep workshop burnished gold (`#8C6820`) used for primary actions, active navigation indicators, and prominent metric accents.
- **Tabular Figures & Numeral Alignment**: All gold weights, purities, and balances use `font-variant-numeric: tabular-nums` in monospace style, ensuring that decimals and digits align vertically without visual jumping.
- **No Decorative Clutter**: No radial orbs, dot grids, liquid glass, decorative colored stripes, sparkle icons, emojis, or gratuitous hover animations. Icons are used sparingly and only where they clarify an action.
- **Complete States**: Every component implements deliberate loading skeletons, empty state explanations, and structured form validation error banners.

### 6.2 Key Screens Layout Hierarchy
1. **Executive Dashboard (`/`)**: High-level stock custody cards across Vault Bullion, Finished Stock, Karigars, and Refiner. Live transaction audit table with one-click digital slip modal.
2. **Issue Screen (`/issue`)**: Split layout with the Vision Assistant on top and the issue parameters below. Displays live computed fine weight and projected running balance before submission.
3. **Receipt Screen (`/receipt`)**: Structured into Finished Articles (with HUID), Scrap & Dust Returns, and Live Settlement Breakdown comparing allowed vs actual wastage.
4. **Karigar Master (`/karigars`)**: Matrix of agreed category wastage rates with artisan search and addition dialog.
5. **Old Gold Desk (`/old-gold`)**: Intake parameters with automatic conditional display of PAN requirement and cash limit warnings.
6. **Loss Drift Alerts (`/alerts`)**: Executive-only view with Z-score drift metrics, root cause prompts, and review note actions.
7. **Karigar Mobile Portal (`/karigar-portal`)**: Vertical card layout optimized for 375px/414px smartphone screens with bilingual Tamil toggle.
8. **Month-End Reconciliation (`/reconciliation`)**: Automated gold balance sheet comparing theoretical vs physical counts with Tally XML export and digital audit sign-off.

### 6.3 Operational UX Enhancements Added
1. **24K Dilution & Alloy Mixing Calculator**: Built-in crucible recipe calculator computing exact copper and silver additions to dilute 24K pure bullion down to 22K (916 standard) or enrich lower-karat scrap, with 1-click application to the issue form.
2. **Physical Gold Yield Distribution Bar**: Segmented proportional yield visualizer on receipt and job orders clarifying where every milligram of issued gold went (Finished jewellery, Scrap trimmings, Bench filings, and Agreed allowance).
3. **End-of-Day (EOD) Safe Locking Ceremony**: Structured 3-step daily handover protocol verifying artisan slips, physical electronic safe scale counts, and locking daily Tally vouchers to eliminate month-end panic.
4. **WhatsApp & SMS Digital Slip Dispatch**: 1-click sharing of pre-formatted bilingual issue/receipt vouchers directly to karigars on WhatsApp.
5. **XRF Elemental Assay & BIS Cadmium-Free Check**: Elemental composition breakdown (Au, Ag, Cu, Zn) in Old Gold intake with automatic Cadmium (Cd) safety compliance certification.
6. **Executive Loss Trajectory & Cumulative Rupee Savings Chart**: 6-month visual trajectory tracking loss reduction from 0.40% baseline down to 0.12% with live ₹71.25 Lakhs cumulative savings indicator.

---

## 7. Scope Decisions: What Was Cut & What to Do Next

### 7.1 What Was Cut (Scoped for Current 6-Week Budget)
- **Direct Bluetooth BLE Scale Pairing**: Cut in favor of universal camera and image upload OCR, allowing immediate compatibility with any existing workshop scale without custom hardware dongles.
- **Showroom POS Replacement**: Kept strictly out of scope per brief guidelines; SwarnaTrack integrates via Showroom Exchange Bill cross-referencing and Tally XML ledger exports.
- **Customer Gold Savings Scheme Portal**: Customer-facing schemes and gold loans were excluded to focus exclusively on the core ₹1.25 Crore workshop leakage.

### 7.2 What Would Be Done Next (Phase 2 Roadmap)
1. **Direct RS-232 / USB Serial Scale Driver**: Connect web serial API directly to Sartorius and Mettler Toledo workshop scales for instantaneous hardware weighment capture.
2. **Automated Tally Prime REST Server Sync**: Direct two-way ODBC/HTTP posting into Tally Prime without requiring manual XML file download.
3. **Multi-Workshop Branch Balancing**: Extend custody tracking across multiple regional workshop locations and external hallmarking assay centres.
4. **Spectrometry Spectral Curve Telemetry**: Direct digital integration with XRF gold testing machines to import full elemental assays (Au, Ag, Cu, Zn, Ni) automatically.

---

## 8. Verification & Test Evidence

The math engine, OCR heuristics, anomaly drift detector, and statutory validation were verified with automated Vitest suites:
- **Mathematical Accuracy**: Matches sample rows `TX-30411` (120g @ 91.6% = 109.920g fine), `TX-30437` (112.450g @ 91.6% = 103.004g fine, balance 6.916g), and `TX-30438` (3.300g @ 91.6% = 3.023g fine, balance 3.893g).
- **Statutory Rules**: Confirms PAN requirement triggers at $\ge \text{₹2,00,000}$ and cash is blocked.
- **Production Build**: Verified with clean Next.js 14 production compilation (`npm run build`).

