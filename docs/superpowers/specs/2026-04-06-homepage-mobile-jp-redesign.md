# Homepage Redesign — Mobile-First, Japanese Priority

**Date:** 2026-04-06  
**Scope:** `/src/app/[locale]/page.tsx` and all marketing section components  
**Repo:** `/Users/Daito/repos/WebMori` (local only — no deploy)

---

## Goal

Redesign the WebMori homepage to be genuinely mobile-first with Japanese as the priority language. English remains fully present but is visually subordinate to Japanese. Eliminate AI-slop patterns identified in the design critique. Apply the brand kit (cream/navy/gold) correctly throughout.

---

## What Is NOT Changing

- Page component architecture (`page.tsx` imports remain the same structure)
- Routing, i18n setup, next-intl configuration
- Auth, dashboard, or any non-marketing pages
- SEO metadata, JSON-LD, sitemap
- Number of sections (7 sections, same as current)

---

## Section-by-Section Design

### Section 1 — Hero (`hero-section.tsx`)

**Layout (mobile):** Single column, full-width. No split layout on mobile.  
**Background:** `#FDFBF7` (cream) — never flat white.

**Structure (top to bottom):**
1. Gold accent bar (`2px`, `48px wide`, `#C9A84C`) — left-aligned
2. Small badge: `ウェブ監査サービス · 東京` — `#5A6478`, `11px`, left-aligned
3. Japanese headline (H1): `毎月、プロが守る。` — `#0F1923`, `font-bold`, `font-ja-serif` (Noto Serif JP), `36px`, left-aligned, `leading-tight`
4. English paired line: `Every month, pros protect your site.` — `#1C2B3A`, `15px`, DM Sans, left-aligned, directly below JP with `4px` gap
5. Body copy (JP): `ウェブサイトの問題は、気づいたときには手遅れになっていることがあります。WebMoriが毎月チェックして、あなたのビジネスを守ります。` — `#5A6478`, `14px`, `leading-relaxed`
6. CTA group:
   - Primary: `無料診断を受ける →` — gold fill (`#C9A84C`), navy text (`#0F1923`), `font-bold`, `rounded-sm` (NOT pill), full-width on mobile
   - Secondary: `サンプルレポートを見る` — navy border, navy text, full-width on mobile, below primary
7. Reassurance line: `クレジットカード不要 · 5分で完了 · No credit card required` — `#9ca3af`, `11px`, centered
8. Audit report preview card (below reassurance, on mobile scrolls into view) — existing card component, keep as-is

**Desktop (md+):** Two-column grid. Text left, audit card right. JP headline scales to `48px`.

**Jargon fix:** Remove "Register your GitHub repository" from any hero subtext — replace with plain `GitHubのURLを入力するだけ`.

---

### Section 2 — Problem/Solution (`problem-solution.tsx`)

**Background:** `#F8F5EE` (warm-white)  
**Section heading (left-aligned):**
- JP: `こんなお悩みはありませんか？` — navy, `font-bold`, `24px`
- EN subtitle: `Sound familiar?` — `#5A6478`, `14px`

**Before cards:** Replace generic pink background with `#FDF0EF` + `3px left border #C0392B` (critical color). This uses the brand severity palette intentionally.

**After cards:** `#EEF8F3` + `3px left border #1A7A4A` (good color).

**Item copy:** Each pain point and solution written in Japanese first, English in smaller text below. No icons with rounded containers — use a simple colored dot or no icon.

---

### Section 3 — How It Works (`how-it-works.tsx`)

**Background:** `#FDFBF7` (cream)  
**Section heading (left-aligned):**
- EN label: `HOW IT WORKS` — `#C9A84C`, `10px`, `tracking-widest`, `font-semibold`
- JP heading: `はじめ方` — `#0F1923`, `24px`, `font-bold`, Noto Serif JP
- EN subtitle: `Four steps to a protected site` — `#5A6478`, `14px`

**Remove entirely:** The circular numbered icons with dashed connecting lines.

**Replace with:** Gold left-border vertical timeline.

```
Gold vertical line (2px, #C9A84C) running full height, left edge
  ├─ Gold dot (10px circle) at each step
  │   STEP 01  [10px, #C9A84C, tracking-widest]
  │   リポジトリを登録する  [14px, bold, #0F1923]
  │   Register your repo — 5 min setup  [12px, #5A6478]
  ├─ (repeat for STEP 02, 03)
  └─ Final dot: navy fill, gold border (signals completion)
      STEP 04
      修正を適用する  [gold text — #C9A84C, signals resolution]
      PRs auto-created. Just merge.
```

**On desktop (md+):** Same vertical timeline, centered in a narrower max-width container (`max-w-lg`), with increased padding. No structural change from mobile — the vertical timeline reads well at all widths.

---

### Section 4 — Key Features (`feature-grid.tsx`)

**Background:** `#F8F5EE` (warm-white)  
**Section heading (left-aligned):**
- JP: `診断内容` — `#0F1923`, `24px`, bold
- EN: `What we audit` — `#5A6478`, `14px`

**Replace the identical 3-column card grid** with an asymmetric layout:

**Mobile (single column):**
- Security — featured card, full-width, navy left border `4px`, larger heading `16px`
- Performance — full-width card
- LINE API — full-width card, with `LINE` badge chip
- i18n — full-width card
- Maintainability — full-width card
- Auto-fix PRs — full-width card, gold accent

**Desktop (md+):** Security takes up left half (tall featured card), right half is a 2×2 grid of the remaining features. Last card (Auto-fix PRs) spans full width below.

**Each card:**
- NO rounded icon containers with colored icons. Use a simple `4px` left border in `#C9A84C` for standard, `#0F1923` for security (featured)
- JP label: e.g. `セキュリティ診断` — `14px`, bold
- EN sublabel: `Security Audit` — `11px`, `#5A6478`
- Plain-language JP description (no jargon): e.g. `不正アクセスや情報漏洩につながるリスクを洗い出します。` (not "OWASP Top 10")
- English plain-language description below

**Jargon replacements:**
| Current | Replace with |
|---|---|
| Auto-fix PRs | 修正を自動で作成 / Fixes auto-created as PRs |
| i18n Check | 日本語対応チェック / Japanese compatibility check |
| LINE webhook | LINEボット連携診断 / LINE bot integration audit |
| GitHub PRs | GitHubへの自動修正 |

---

### Section 5 — Proof Point (`stat-counter.tsx`)

**Remove:** The 4-number bar (5 · 3 days · 100% · PR).

**Replace with:** A single strong statement block.

**Background:** `#1C2B3A` (navy-mid)  
**Layout:** Centered, full-width. Generous vertical padding (`py-16`).

**Content:**
- JP: `3営業日で、プロの診断レポートをお届けします。` — white, `24px`, bold, Noto Serif JP, centered
- EN: `Expert audit report delivered in 3 business days.` — `rgba(255,255,255,0.55)`, `14px`, centered
- Gold divider bar (`2px`, `48px`) — centered, below EN line

This replaces four meaningless stats with one credible, specific promise.

---

### Section 6 — Pricing (`pricing-preview.tsx`)

**Background:** `#FDFBF7` (cream)  
**Section heading (left-aligned):**
- JP: `料金プラン` — `#0F1923`, `24px`, bold
- EN: `Pricing Plans` — `#5A6478`, `14px`

**Mobile:** Cards stacked full-width, vertically. Growth card first (most important on mobile).

**Card changes:**
- Remove rounded-full pill style from "Popular" badge — use `rounded-sm` with gold border
- Price display: `¥19,800 / 月` (not `/mo`) — Japanese month unit
- Feature list: JP label first, EN in parentheses or smaller below. Plain language.
- CTA buttons: `はじめる` (primary) / `はじめる` (outline for others)

---

### Section 7 — CTA (`cta-section.tsx`)

**Background:** `#0F1923` (navy)  
**Remove:** The warm brown gradient — lock to flat navy.

**Content:**
- JP headline: `まず、無料で診断してみる` — white, `28px`, bold, Noto Serif JP, centered
- EN subtitle: `Start with a free audit. No commitment.` — `rgba(255,255,255,0.55)`, `14px`, centered
- CTA button: `無料診断を受ける →` — gold fill, navy text, `rounded-sm`, NOT pill
- Reassurance: `クレジットカード不要 · No credit card required` — `rgba(255,255,255,0.4)`, `11px`, centered

---

## Cross-Cutting Rules

### Backgrounds (alternating — never flat white)
| Section | Background |
|---|---|
| Hero | `#FDFBF7` cream |
| Problem/Solution | `#F8F5EE` warm-white |
| How It Works | `#FDFBF7` cream |
| Features | `#F8F5EE` warm-white |
| Proof Point | `#1C2B3A` navy-mid |
| Pricing | `#FDFBF7` cream |
| CTA | `#0F1923` navy |

### Typography hierarchy (all sections)
- Section heading: JP bold first, EN muted subtitle directly below (`4px` gap)
- Body: JP at full opacity, EN at ~60% opacity or smaller
- Labels/badges: EN uppercase (`tracking-widest`) for visual rhythm — does NOT affect reading priority

### Buttons
- Primary: `bg-[#C9A84C] text-[#0F1923] font-bold rounded-sm` — no pill (`rounded-full`)
- Secondary: `border border-[#0F1923] text-[#0F1923] rounded-sm`
- Hover: primary → `#E8C97A` (gold-light), secondary → navy fill with white text

### Gold usage (punctuation only)
- CTAs
- Section accent bars (2px, 48px)
- Timeline step labels (STEP 01 text)
- Timeline line and dots
- Featured card gold border
- Step 4 completion highlight

### Mobile-first specifics
- All sections: single column, `px-5` padding
- Buttons: `w-full` on mobile, `w-auto` on `md+`
- Section headings: `text-2xl` mobile, `text-3xl` on `md+`
- Hero JP heading: `text-3xl` mobile, `text-5xl` on `md+`
- Card grids: `grid-cols-1` mobile, `grid-cols-2` on `md+`

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/marketing/hero-section.tsx` | Full redesign per spec |
| `src/components/marketing/problem-solution.tsx` | Left-border severity colors, JP-first copy, left-aligned heading |
| `src/components/marketing/how-it-works.tsx` | Remove circles/dashes, implement gold timeline |
| `src/components/marketing/feature-grid.tsx` | Asymmetric layout, remove round icon containers, jargon fix |
| `src/components/marketing/stat-counter.tsx` | Replace 4-stat bar with single proof statement |
| `src/components/marketing/pricing-preview.tsx` | Mobile stacking, JP price labels, pill → rounded-sm |
| `src/components/marketing/cta-section.tsx` | Flat navy, JP headline, pill → rounded-sm |
| `src/app/globals.css` | Verify cream/warm-white CSS variables exist |
| `src/messages/ja.json` | Add/update JP copy for new strings |
| `src/messages/en.json` | Add/update EN copy for new strings |

---

## Out of Scope

- Navigation redesign
- Footer redesign
- Any page other than the homepage (`/ja` and `/en`)
- New components (modify existing only)
- Database, API, or auth changes
- Deployment
