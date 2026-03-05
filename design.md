**Prompt:**

> I have course material content [paste content / upload file]. Please build an HTML slide deck using my DayDreamers template with these exact specs:
> 
> 
> **Design system:**
> 
> - Colors: `-ink:#0a0a0f`, `-paper:#f5f2ed`, `-cobalt:#1c3fdc`, `-amber:#d97706`, `-green:#16a34a`
> - Fonts: DM Serif Display (titles), DM Sans (body), DM Mono (labels/code)
> - Logo: the crescent moon SVG on every topbar (frameless, cobalt stroke on light slides, white on dark)
> 
> **Slide structure:**
> 
> - 52px topbar with: logo + "DayDreamers" wordmark | section label | slide counter
> - Dark ink title slide with floating hero logo, animated glow, hero tags
> - Light paper slides with blue radial gradient accents
> - Consistent progress bar + ← → nav buttons
> 
> **Infographic components to use where relevant:**
> 
> - Flow pipeline (`.flow` + `.fn` nodes with arrows) for step-by-step processes
> - Architecture diagram (`.arch-row` + `.arch-box`) for system overviews
> - Model comparison bars for comparisons/rankings
> - Security checklist (`.sc` with green/amber/red icons) for warnings
> - Paper cards with left cobalt border for research/references
> - Callout boxes (blue = info, amber = warning, green = success)
> - Link items with pill buttons for external resources
> 
> **Icon rules:**
> 
> - All icons must be **inline SVGs with verified paths** — no Font Awesome, no external icon fonts
> - Use 24×24 viewBox Material Design paths for flow nodes and card icons
> - Nav buttons use Unicode ← →
> 
> **Content rules:**
> 
> - Keep slides scannable — use eyebrow labels (e.g. `01 — Topic`)
> - Italic cobalt accent on one word in every slide title
> - Arrow keyboard navigation + slide counter must work