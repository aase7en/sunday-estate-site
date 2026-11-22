# Dashboard V3 prototype · JOBS/085

Open [index.html](index.html) directly in a browser. The standalone HTML includes its CSS, icons, fixtures and JavaScript. Use the theme switch or append `?theme=dark` to open Modern Dark. Every dashboard figure is covered by the persistent **ข้อมูลตัวอย่าง** label. This is the design-author iteration for the owner and independent reviewer.

## Structure and changes from J084 v2

- **Desktop at 1280px.** Sidebar, search/bell/avatar header, layered aurora hero and four unified icon-led THB cards. Land appraisal occupies the fourth KPI slot. The paid-installment ring moves to the analytical strip and its label reflects the available 54/57 count.
- **Main row.** Approximately 60:40 cashflow and contract-status composition. The chart uses violet gradient inflow bars, pink outflow bars, a purple net line and points, and a visible zero baseline. The donut counts 10 exclusive statuses (6 active, 1 due soon, 1 overdue and 2 redeemed/renewed). Its legend and center total use the same data.
- **Summaries.** Trend availability, payment channels and follow-up status occupy the three mini cards. The follow-up button and bell open a sample queue dialog. Four compact metrics below show paid installments, complete installments over 12 months, weighted LTV and actionable contracts.
- **Tablet at 768px.** The chart and composition stay side by side. Within the composition card, the legend sits below the ring.
- **Mobile at 375px.** Compact header and hero, 2×2 KPI grid, four persistent FlipContentCard pages (กระแสเงินสด / สัญญา / ที่ดิน / งานด่วน), compact summaries and fixed bottom navigation. The due queue also has a **ดำเนินการต่อ** button within the fourth page.

## J084 findings

| Finding | V3 fix and evidence |
| --- | --- |
| Pending callbacks could restore an earlier flip | A flip owns its two Web Animations phases. A new input cancels the pending animation and settles to the latest request. Only the current request may commit after an awaited phase. The harness interrupts both halves and rechecks the settled state after the earlier animation would have finished. |
| Mobile chart range controls were hidden | The mobile chart has its own visible 3/6/12-month buttons with 44px targets. The selected range is shared across layouts and persists through flips. The harness clicks every range at 375px. |
| Axis labels and plot scale diverged | Integer ticks, bar heights and net points share one linear mapping in thousands of baht. The domain reserves space below zero when the selected range contains negative net. The harness verifies SVG coordinates and the August −112 point below the baseline. |
| Hidden chart could clip after a theme change | A `ResizeObserver` observes chart hosts, skips zero-size boxes and renders real layout geometry on resize or reveal. The flip viewport uses natural height. CSS custom properties recolor existing SVGs on theme changes. The harness toggles the theme and resizes with cashflow hidden, reveals it and then crosses to desktop while retaining the six-month range. |

Inactive flip pages are both `hidden` and `inert`. Click, Enter and Space move focus to the active panel. Arrow keys, Home and End activate among visibly focused tabs. Reduced motion settles immediately. The queue dialog closes via Escape or its close button.

## Design comparison log

| Pass | Rendered comparison and changes |
| --- | --- |
| [Round 1](shots/v3-round1/) | Compared both desktop and mobile themes with ref-02, using ref-01 for the light surfaces, ref-03 for the supporting component treatment and ref-04 for the responsive layout. Replaced the J084 chart/queue pairing with cashflow and a gradient composition donut, built a unified icon-over-value KPI row and added lavender/navy elevation. The desktop strip extended past the 800px fold (842px total). The mobile flip ended at y=855px in the full-page capture. The tablet flip used more vertical space than the chart/donut pairing in ref-04. |
| [Round 2](shots/v3-round2/) | Tightened desktop and mobile padding, kept 44px mobile range controls, softened the hero wave edges and strengthened the dark active-nav accent. Put the donut next to the chart at 768px and added a small repayment ring to the strip. Viewed both desktop and mobile themes after rendering. Desktop now fit at 800px, and the mobile flip ended at y=797px in the full-page capture. The tablet ring was still pinched beside its legend and the narrow cashflow axis omitted the latest month label. |
| [Round 3](shots/v3-round3/) | Stacked the legend below a larger tablet ring and retained the final month label on narrow charts. Tuned the light card base and checked the final desktop, tablet and mobile renders against the same references. Added a [live mobile viewport capture](shots/v3-round3/mobile-light-viewport.png) showing the fixed navigation. |

### Round 4 (orchestrator review round)

Compared the four attached Round 3 captures with ref-02 as the primary target. Ref-01 informed the light surface treatment, ref-03 the icon and chart finishes, and ref-04 the mobile density. The mobile reference images are small design-study previews and provide a hierarchy and density target.

| Round 3 view | Gap observed | Round 4 verdict |
| --- | --- | --- |
| Desktop Light | The four icon-led KPIs and approximately 60:40 chart/donut layout already matched ref-02's anatomy. The canvas leaned uniformly lavender, cards had similar elevation, and KPI color was concentrated around the icons. Ref-01 and ref-02 showed more distinct tonal panels and a recessed sidebar landscape. | **Already matched** the row order and proportions. **Fixed** the surface hierarchy with a warmer lavender canvas and cool edge, tone at both corners of the KPI cards, quieter analytical tiles, stronger elevation for the two chart panels and lower sidebar waves. |
| Desktop Dark | Navy surfaces and the readable chart baseline already matched the direction. Purple dominated the active navigation and hero, the cards had similarly heavy shadows, and the KPI icon wells lacked some of ref-02's individual color. Both desktop donuts read flatter than ref-02's ring. | **Fixed** the blue-violet nav treatment, cooler and quieter hero, localized KPI tint, and lighter shadow on secondary surfaces. Both donut rings use a slightly thicker stroke and a recessed track. **Already matched** the dark navy foundation and grouped bar/line chart. |
| Mobile Light | The compact shell, 2×2 KPI scan and bottom nav already worked. The two-row tab block used about 100px before the chart and the fixed nav covered part of the chart footer in the first viewport. Ref-02 and ref-04 give the chart more of the visible screen. | **Fixed** the chart's first-viewport position by putting all four tabs in one row at 375px, with 44px targets and a two-row fallback at 350px and below. **Deliberately left** the 2×2 KPI grid and all four persistent pages required by J085. |
| Mobile Dark | The 2×2 scan and labels were readable. The same two-row tab block delayed the chart, and the hero wash leaned more purple than ref-02's Modern Dark mobile preview. | **Fixed** the tab density and moved the hero toward navy with blue-violet waves. **Already matched** the dark palette family, KPI order and bottom navigation. |
| Detail across themes | The demo amounts already had appropriate prominence. Thai headings were tightly tracked and KPI labels receded into muted text. The chart already had gradient bars, a smooth net line and a signed baseline, but the fill was faint against the bars. | **Fixed** heading spacing, KPI label contrast and the visibility of the net fill. The fill fades to transparent. **Deliberately left** the current font stack, full baht amounts, chart series, signed geometry and contract counts. |

Both desktop views fit in 800px. Tablet document height is 923px. At 375×812, both mobile captures are 1349px tall and the interactive page measures 1352px. The chart ends at y=746px and its footer clears the fixed bottom nav by 25px on initial load. Chromium reported zero console errors and no horizontal overflow at 375, 640, 768 or 1280px. Supplemental checks in both themes confirmed eight rapid tab clicks settle on the final tab with one visible page, a theme change and resize while cashflow is hidden reveal all 24 bars at the new size, and the donut legend remains 6/1/1/2 with a total of 10. The seven palette hexes and seven source occurrences of **ข้อมูลตัวอย่าง** were verified. The harness also rechecked the signed coordinates and the 3/6/12-month controls. [Round 4 captures and measurements](shots/v3-round4/).

Run with the installed Playwright from `webapp/`:

```powershell
node ../docs/design/prototypes/dashboard-v3/capture-v3.mjs v3-round4
```

The command above refreshes Round 4. Pass a fresh `v3-roundN` argument to preserve earlier evidence. Full-page mobile captures place the bottom nav in flow via `capture=1`. The separate viewport capture leaves it fixed. The root-level images in `shots/` are historical J084 evidence.

## Demo data and remaining gaps

- The THB KPIs, contract counts and analytical figures inherit the J084 demo dataset. Cashflow uses the 12-month fixture series (net = inflow − outflow). The 70/20/10 channel split is sample layout data. The 88.9% strip entry is a count of fully paid installments from one demo schedule. Weighted LTV covers 2 of 6 active loans.
- KPI badges show verified sample context such as scope, estimate or arrears. Period-on-period changes require a comparison baseline. Portfolio balance history is unavailable, so its trend card shows a dash. The donut represents contract counts. A value-based donut needs a separate valuation and reconciliation contract.
- CSS and inline paths approximate the reference landscape. The reference's detailed property artwork, brand lockup and photo avatar remain outside this pass. The IBM Plex Sans Thai stack uses system fallbacks offline, so glyph shapes still differ from the study.
- The reference chart uses fewer visible periods in several compositions. The 12-month mobile view retains all 12 bar pairs and net points, with selected month labels including August and the latest month. The supporting sections remain reachable by scrolling below the first viewport.
- Search and sidebar/bottom-menu destinations are visual samples. Chart point details use native SVG titles and an accessible chart description. Verification covered desktop Chromium and emulated dimensions. Physical-device Safari and screen-reader output remain unverified.
