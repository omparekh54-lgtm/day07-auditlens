# Day 07 — AuditLens

**100 Days of Data Science · Day 07**

AuditLens is a privacy-first transaction review workbench for internal audit and finance teams. It turns a flat ledger/expense export into an explainable review queue, shows exactly why each transaction was surfaced, lets an analyst document the outcome, and exports an audit evidence pack.

> AuditLens deliberately does **not** call an anomaly fraud. A risk score is a prioritization device for human review, not an accusation or causal finding.

## Product wedge

### Why this is not just another anomaly dashboard

Many anomaly demos stop at red dots or a black-box score. Internal audit teams have a different problem: **limited review capacity**. They need to know which cases deserve scarce analyst time, why, what evidence was checked, and what was ultimately decided.

AuditLens focuses on that operational loop:

```text
CSV export
   ↓
Column mapping + validation
   ↓
Transparent multi-signal scoring
   ↓
Capacity-limited review queue
   ↓
Case-level evidence + peer context
   ↓
New / Reviewing / Explained / Escalate
   ↓
Analyst notes
   ↓
Evidence-pack CSV
```

## Core workflows

### 1. Bring your own transaction data

The production product accepts a CSV export and performs analysis locally in the browser session. Only `date` and `amount` are required. Vendor, employee, category, description, payment method, approver and beneficiary account make the review signals richer.

A synthetic **Open interactive demo** exists only as an optional example. `?demo=1` opens the sample mapping workflow directly.

### 2. Fit the queue to real review capacity

An audit team can set how many cases it can inspect. AuditLens ranks the strongest available signals and shows only the highest-value review candidates instead of asking people to inspect every flag.

### 3. Investigate, document, export

Opening a case shows transaction facts, risk score, each reason code, whether the reason is **Known**, **Statistical**, or **Heuristic**, peer context, analyst status and analyst notes.

The final evidence pack exports the original case facts, score, reason codes, reason details, review status and notes.

## Explainable signal ensemble

| Signal | Type | Meaning |
|---|---|---|
| Peer amount outlier | Statistical | Robust z-score using median and MAD against category peers, with overall fallback when peers are sparse |
| Possible duplicate | Known | Same vendor, amount and date elsewhere in the file |
| First-seen vendor | Known | Vendor occurs only once in the uploaded file |
| Weekend transaction | Known | Date falls on Saturday/Sunday while the selected policy cue requires weekend justification |
| Large round amount | Heuristic | Large exact multiple of 1,000; a review cue, not evidence of wrongdoing |
| Possible split around threshold | Heuristic | Multiple same-day payments for the same vendor/employee individually below but collectively above the configured threshold |
| High same-day velocity | Known | Four or more payments for the same vendor/employee on one day |
| Shared beneficiary account | Known | Two or more vendor names share one uploaded beneficiary account identifier |
| Missing approver | Known | Transaction exceeds the configured threshold while the mapped approver field is blank |

Scores are capped at 100 and are only used for ranking. They are not calibrated probabilities of fraud.

## Confidence & honesty layer

Every reason is labelled as one of **Known**, **Statistical**, or **Heuristic**. The product also exposes a **Control coverage** panel showing which checks the current file can support and explicitly lists areas that are not assessed.

## Input contract

Minimum CSV:

```csv
date,amount
2026-08-01,12500
```

Recommended columns: `transaction_id`, `date`, `amount`, `vendor`, `employee`, `category`, `description`, `payment_method`, `approver`, `account`.

Common aliases are auto-detected, but the user reviews the mapping before analysis. Amount must be numeric and positive, date must parse into a valid date, invalid rows are rejected, and optional missing fields become explicit `Unspecified ...` values.

## Policy cue parser

The mapping step includes an optional policy-text box. The current parser can extract the largest explicit 4–8 digit monetary threshold and detect whether the text mentions weekend justification. This is a **heuristic parser**, not legal/policy interpretation.

## Privacy model

The user's transaction file is processed in browser memory. This Day 7 build has no login, application database, upload bucket, or server-side transaction persistence.

Analyst review status/notes are persisted locally in browser storage per filename and are included when the evidence pack is downloaded. They are never sent to an application database.

## Data-science methodology

For each transaction, AuditLens first compares amount against other transactions in the same category. If fewer than five category peers exist, it falls back to all other rows.

```text
robust_z = 0.6745 × (amount − peer_median) / MAD
```

A peer outlier signal begins at `robust_z >= 3.5`. Reason codes add explicit point contributions and the final score is capped at 100. The ranking is intentionally simple enough for an auditor to understand and challenge.

This is **not** a learned fraud probability. With labelled historical audit outcomes, a future version could validate/rerank the ensemble, but the current project does not invent labels.

## Tests

`npm test` covers quoted CSV fields, row rejection, robust peer outlier detection, split-threshold patterns, shared bank-account patterns, policy threshold extraction, and flagged-value summary behavior.

## UI / UX decisions

- clear five-step onboarding
- downloadable CSV template
- no account required
- responsive desktop/mobile layouts
- review-capacity slider
- filterable case queue
- side-panel investigation workflow
- confidence labels beside every reason
- direct analyst status + notes with browser-local persistence
- operational CSV export
- keyboard focus states
- restrained transitions and drawer motion
- `prefers-reduced-motion` support

## Honest limitations

AuditLens does **not** currently prove or predict fraud. It has no labelled fraud model, external sanctions/PEP/vendor registry lookup, verified account ownership, graph-database/entity-resolution layer, procurement price benchmark, or causal conclusion about split payments/round numbers. Exact duplicates and shared accounts can have legitimate explanations. Policy text parsing is intentionally narrow. The first production release accepts CSV rather than XLSX/PDF.

The correct interpretation of a high score is: **review this transaction before a lower-scoring one, given the currently available evidence.**

## Architecture

```text
Next.js 16 / React 19
        ↓
Browser-local CSV parser + column mapping
        ↓
Normalized transaction facts
        ↓
Transparent audit signal engine (TypeScript)
        ↓
Capacity-ranked review queue
        ↓
Analyst workflow state
        ↓
Evidence-pack CSV export
```

The core engine lives in `lib/audit.ts` and is independent of the React UI, which keeps the decision logic testable.

## Repository

`day07-auditlens`
