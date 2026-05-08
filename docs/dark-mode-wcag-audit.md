# Dark Mode — WCAG 2.1 contrast audit

Reference: issue [#1033](https://github.com/WebJamApps/JaMmusic/issues/1033),
PR [#1034](https://github.com/WebJamApps/JaMmusic/pull/1034).

Audit performed against the post-fix theme tokens defined in
[src/styles/_theme.scss](../src/styles/_theme.scss). Methodology and
follow-up section at the bottom.

## Thresholds (WCAG 2.1)

| Level | Normal text | Large text (18pt or 14pt bold) | Non-text / UI components |
| --- | ---: | ---: | ---: |
| **AA** (SC 1.4.3 / 1.4.11) | ≥ 4.5:1 | ≥ 3:1 | ≥ 3:1 |
| **AAA** (SC 1.4.6) | ≥ 7:1 | ≥ 4.5:1 | — |

## Dark mode

| Surface | Pair | Ratio | Grade |
| --- | --- | ---: | :---: |
| body fg / bg | `#e8e8e8` on `#121212` | 15.29:1 | AAA |
| sidebar text | `#ffffff` on `#000000` | **21.00:1** | AAA — WCAG ceiling |
| sidebar hover text | `#ffffff` on `#1f1f1f` | 16.48:1 | AAA |
| header text | `#f5f5f5` on `#0e0a0e` | 18.03:1 | AAA |
| footer text | `#e8e8e8` on `#1a1a1a` | 14.20:1 | AAA |
| footer link icons | `#c09580` on `#1a1a1a` | 6.51:1 | AA |
| nav-link / page bg | `#bbdefb` on `#121212` | 13.34:1 | AAA |
| nav-link hover / bg | `#ffffff` on `#121212` | 18.73:1 | AAA |
| placeholder / input bg | `#e8e8e8` on `#1a1a1a` | 14.20:1 | AAA |
| input fg / input bg | `#ffffff` on `#1a1a1a` | 17.40:1 | AAA |
| input border / input bg | `#888888` on `#1a1a1a` | 4.91:1 | AA |
| table fg / row-alt | `#e8e8e8` on `#232f33` | 11.23:1 | AAA |
| table border / table bg | `#6b6b6b` on `#1c1c1c` | 3.20:1 | AA non-text |
| dialog fg / dialog bg | `#e8e8e8` on `#1f1f1f` | 13.45:1 | AAA |

Every text surface in dark mode passes AAA. Every non-text surface
passes AA (3:1).

## Light mode

| Surface | Pair | Ratio | Grade |
| --- | --- | ---: | :---: |
| body fg / bg | `#212529` on `#ffffff` | 15.43:1 | AAA |
| sidebar text | `#1c4878` on `#c0c0c0` | 5.14:1 | AA |
| sidebar hover text | `#1c4878` on `#ffffff` | 8.95:1 | AAA |
| header text | `#ffffff` on `#2a222a` | 15.43:1 | AAA |
| footer text | `#ffffff` on `#565656` | 7.34:1 | AAA |
| footer link icons | `#edd0b8` on `#565656` | 5.00:1 | AA |
| nav-link / page bg | `#23527c` on `#ffffff` | 8.17:1 | AAA |
| nav-link hover / bg | `#0056b3` on `#ffffff` | 7.04:1 | AAA |
| placeholder / input bg | `#595959` on `#ffffff` | 7.00:1 | AAA |
| input fg / input bg | `#212529` on `#ffffff` | 15.43:1 | AAA |
| input border / input bg | `#767676` on `#ffffff` | 4.54:1 | AA |
| table fg / row-alt | `#212529` on `#d8ecf3` | 12.64:1 | AAA |
| table border / table bg | `#777777` on `#ffffff` | 4.48:1 | AA non-text |

Every surface in light mode passes AA. Most pass AAA.

## Remediations applied during PR #1034

These were corrected from values that originally failed the relevant
WCAG threshold:

| Surface | Before | After | Reason |
| --- | --- | --- | --- |
| dark `--table-border` | `#3a3a3a` (1.50:1) | `#6b6b6b` (3.20:1) | Failed SC 1.4.11 non-text 3:1 minimum. |
| light `--sidebar-fg` | `#23527c` (4.49:1) | `#1c4878` (5.14:1) | Just under SC 1.4.3 AA 4.5:1. |
| light `--footer-link` | `#c09580` (2.74:1) | `#edd0b8` (5.00:1) | Failed both 3:1 non-text and 4.5:1 text. Stayed in the warm-tan brand family. |
| dark `--placeholder` | `#a0a0a0` (~5.7:1) | `#e8e8e8` (14.20:1) | Surfaced after `::placeholder` opacity was pinned to 1; bumped for AAA. |
| dark sidebar | `#1f1f1f` bg, `#f5f5f5` fg (~14:1) | `#000000` bg, `#ffffff` fg (21:1) | User-perceived gray sidebar was actually `_mobile.scss` overriding the token; root-cause fix bumped contrast to the WCAG ceiling. |

## Methodology

Computed via the WCAG 2.1 relative-luminance formula:

```
L = 0.2126 R_lin + 0.7152 G_lin + 0.0722 B_lin
where channel_lin = channel_srgb / 12.92                     if channel_srgb ≤ 0.03928
                  = ((channel_srgb + 0.055) / 1.055) ** 2.4  otherwise

Contrast = (L_lighter + 0.05) / (L_darker + 0.05)
```

The audit script (kept inline in the PR thread) iterates through every
themed foreground/background pair the user sees on the homepage,
gigs page, and contact form, and grades each ratio against the
thresholds above.

To re-run the audit yourself after a token change:

```bash
node -e "
const lum = h => {
  h = h.replace('#','');
  const [r,g,b] = [0,2,4].map(i => parseInt(h.slice(i,i+2),16)/255);
  const f = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
};
const ratio = (a,b) => { const [l1,l2]=[lum(a),lum(b)].sort((x,y)=>y-x); return (l1+0.05)/(l2+0.05); };
console.log(ratio('#ffffff', '#000000').toFixed(2));  // 21.00
"
```

## Out of scope (tracked elsewhere)

This audit only covers chrome + gigs table + Contact Us form (the
surfaces themed in PR #1034). When music player, slideshow, picture
components, and remaining forms are themed in follow-up PRs, re-run
the audit and add the new pairs to the tables above.
