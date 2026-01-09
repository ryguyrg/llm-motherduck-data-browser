# Tufte-Style Data Analysis — Design Specification

A comprehensive style guide for generating single-page, high-density data analyses inspired by Edward Tufte's principles of data visualization.

---

## Core Philosophy

Follow these Tufte principles:

1. **Maximize data-ink ratio** — Every pixel should convey information. Remove chartjunk, decorative elements, and redundant encoding.
2. **Small multiples** — Use consistent visual encoding across repeated elements (bars, sparklines) for easy comparison.
3. **Integrate text and data** — Weave narrative prose with inline statistics. Data should flow naturally within sentences.
4. **Show data variation, not design variation** — Use a restrained palette; let the data create visual interest.
5. **High information density** — Pack maximum insight into minimum space without sacrificing clarity.

---

## Typography

### Fonts

```css
/* Primary text — elegant serif for body and headers */
font-family: 'ET Book', Palatino, 'Palatino Linotype', 'Palatino LT STD', Georgia, serif;

/* Numeric data — tabular figures for alignment */
font-family: 'Source Sans Pro', -apple-system, sans-serif;
font-variant-numeric: tabular-nums;
```

**Font loading:**
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
```

Note: ET Book is Tufte's preferred font but requires self-hosting. Palatino/Georgia are acceptable fallbacks available on all systems.

### Type Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Page title | 28px | 400 | Letter-spacing: -0.5px |
| Subtitle | 13px | 400 | Italic, muted color |
| Big numbers | 42px | 400 | Letter-spacing: -1px |
| Section headers | 11px | 400 | Uppercase, letter-spacing: 1.5px |
| Body prose | 14px | 400 | Line-height: 1.6, max-width: 600px |
| Table headers | 10px | 400 | Uppercase, letter-spacing: 0.5px |
| Table body | 12px | 400 | — |
| Annotations/sidenotes | 10-11px | 400 | Italic for annotations |
| Footer | 10px | 400 | Muted color |

### Text Styling

- **Bold** — Use sparingly for key statistics within prose
- **Italic** — Annotations, emphasis on concepts (not data)
- **Highlights** — Subtle background for critical numbers: `background: rgba(160,0,0,0.08); padding: 0 3px;`

---

## Color Palette

A restrained, warm palette with a single accent color:

```css
:root {
    --text-color: #111;        /* Primary text */
    --muted: #666;             /* Secondary text, labels */
    --lighter: #999;           /* Tertiary text, axis labels */
    --bg: #fffff8;             /* Warm cream background (Tufte signature) */
    --accent: #a00;            /* Burgundy — used sparingly for emphasis */
    --line: #ccc;              /* Borders, rules */
}
```

### Color Usage Rules

1. **Background** — Always cream (#fffff8), never pure white
2. **Accent color** — Reserve for:
   - Most important data point (e.g., current period dot on sparkline)
   - Peak values in seasonal charts
   - Critical highlights in text
3. **Grayscale for data** — Use value (light to dark) to encode magnitude:
   - Bars: #888 to #444 gradient or solid #888
   - Secondary data: #ccc or 50% opacity
4. **Never use** — Bright colors, gradients for decoration, colored backgrounds for sections

---

## Layout System

### Page Structure

```css
body {
    padding: 40px 60px;
    max-width: 1200px;
    margin: 0 auto;
    line-height: 1.5;
}
```

### Grid Systems

```css
/* Four-column for KPI row */
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 32px;
}

/* Two-column for main content (wider left) */
.grid-2 {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
}

/* Three-column for detailed sections */
.grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
}
```

### Section Spacing

- Between major sections: 28px margin-bottom
- Divider between areas: 1px solid #ccc with 24px margin top/bottom
- Within sections: 8-16px gaps

---

## Components

### Big Numbers (KPIs)

```html
<div>
    <div class="big-number num">$18.6<span style="font-size: 24px;">M</span></div>
    <div class="big-number-label">Total Revenue</div>
</div>
```

```css
.big-number {
    font-size: 42px;
    font-weight: 400;
    letter-spacing: -1px;
    line-height: 1;
}

.big-number-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #666;
    margin-top: 4px;
}
```

### Section Headers

```html
<div class="section-title">Geographic Distribution</div>
```

```css
.section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #999;
    margin-bottom: 12px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 4px;
}
```

### Inline Bar Charts in Tables

```html
<td class="bar-cell">
    <div class="bar-container">
        <div class="bar" style="width: 44.3%;"></div>
    </div>
</td>
```

```css
.bar-cell { width: 120px; }

.bar-container {
    background: #f0f0f0;
    height: 12px;
    width: 100%;
}

.bar { 
    background: #888; 
    height: 100%; 
}
```

### Sparklines (SVG)

```html
<div class="sparkline-container">
    <svg class="sparkline" viewBox="0 0 400 60" preserveAspectRatio="none">
        <!-- Area fill for context -->
        <path class="sparkline-area" d="M0,60 L0,{y1} L{x2},{y2} ... L{xn},60 Z"/>
        <!-- Line for data -->
        <path class="sparkline-line" d="M0,{y1} L{x2},{y2} ... L{xn},{yn}"/>
        <!-- Dot on final point -->
        <circle class="sparkline-dot" cx="{xn}" cy="{yn}" r="3"/>
    </svg>
</div>
```

```css
.sparkline-container { height: 50px; margin: 8px 0; }

svg.sparkline { width: 100%; height: 100%; }

.sparkline-line {
    fill: none;
    stroke: #666;
    stroke-width: 1.5;
}

.sparkline-area { fill: rgba(0,0,0,0.06); }

.sparkline-dot { fill: #a00; }  /* Accent color for current value */
```

### Horizontal Bar Rows (Year-over-Year)

```html
<div class="year-row">
    <span class="year-label">2024</span>
    <div class="year-bar-container">
        <div class="year-bar" style="width: 63.2%;"></div>
    </div>
    <span class="year-value num">$5.34M</span>
    <span class="year-growth change positive">+98%</span>
</div>
```

```css
.year-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #eee;
}

.year-label { width: 40px; font-size: 12px; color: #666; }
.year-bar-container { flex: 1; height: 18px; }
.year-bar { height: 100%; background: linear-gradient(90deg, #bbb, #888); }
.year-value { width: 70px; text-align: right; font-size: 12px; }
.year-growth { width: 60px; text-align: right; font-size: 11px; }

.change.positive { color: #2a7; }
.change.negative { color: #a00; }
```

### Seasonal/Monthly Bar Chart

```html
<div class="seasonal-chart">
    <div class="seasonal-bar" style="height: 25%;"></div>
    <div class="seasonal-bar peak" style="height: 100%;"></div>
    <!-- ... one bar per month -->
</div>
```

```css
.seasonal-chart {
    display: flex;
    align-items: flex-end;
    height: 60px;
    gap: 2px;
}

.seasonal-bar {
    flex: 1;
    background: #999;
}

.seasonal-bar.peak { background: #a00; }  /* Accent for peaks */
```

### Stacked Segment Bar (Distribution)

```html
<div class="order-dist">
    <div class="order-dist-segment" style="width: 21.6%; background: #aaa;">$25-50</div>
    <div class="order-dist-segment" style="width: 24.3%; background: #666;">$100-200</div>
    <!-- ... -->
</div>
```

```css
.order-dist {
    display: flex;
    height: 24px;
}

.order-dist-segment {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: white;
}
```

### Concentration/Progress Bars

```html
<div style="display: flex; align-items: center; gap: 8px;">
    <span style="font-size: 11px; color: #666; width: 60px;">Top 10</span>
    <div style="flex: 1; height: 8px; background: #eee;">
        <div style="width: 17.5%; height: 100%; background: #888;"></div>
    </div>
    <span class="num" style="font-size: 11px; width: 40px;">17.5%</span>
</div>
```

### Tables

```css
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

th {
    text-align: left;
    font-weight: 400;
    color: #999;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 8px 4px 0;
    border-bottom: 1px solid #ccc;
}

td {
    padding: 5px 8px 5px 0;
    border-bottom: 1px solid #eee;
}

/* Right-align numeric columns */
th:last-child, td:last-child { text-align: right; }

/* Tabular figures for numbers */
.num { 
    font-variant-numeric: tabular-nums; 
    font-family: 'Source Sans Pro', sans-serif;
}
```

### Annotations and Sidenotes

```css
.annotation {
    font-size: 10px;
    color: #666;
    font-style: italic;
}

.sidenote {
    font-size: 11px;
    color: #666;
    line-height: 1.4;
}
```

### Prose Blocks

```css
.prose {
    font-size: 14px;
    line-height: 1.6;
    max-width: 600px;
}

.prose strong { font-weight: 600; }

.highlight {
    background: rgba(160,0,0,0.08);
    padding: 0 3px;
}
```

---

## Data Presentation Patterns

### Inline Statistics in Prose

> Revenue has grown **262× from 2019 to 2025**, with compound growth slowing from triple-digit rates to a more sustainable <span class="highlight">58% in 2025</span>.

### Comparative Context

Always provide context for numbers:
- Year-over-year change
- Percentage of total
- Ranking position
- Comparison to average/benchmark

### Show Distribution, Not Just Averages

Instead of "Average order: $62", show:
- Distribution across order size buckets
- Segment bars showing revenue contribution
- Concentration curves (top N% = X% of revenue)

---

## Chart Selection Guidelines

| Data Type | Recommended Visualization |
|-----------|--------------------------|
| Time series (20+ points) | Sparkline with area fill |
| Time series (5-10 points) | Horizontal bar rows with values |
| Part-to-whole | Inline bars in tables, segment bars |
| Ranking | Table with inline bar column |
| Seasonality/cyclical | Vertical bar chart (one bar per period) |
| Concentration | Progress bars (cumulative) |
| Comparison | Side-by-side tables, not grouped charts |

---

## Anti-Patterns (What NOT to Do)

1. **No pie charts** — Use tables with inline bars instead
2. **No 3D effects** — Ever
3. **No legends when labels suffice** — Label data directly
4. **No colored backgrounds for sections** — Use whitespace and rules
5. **No decorative icons** — Every element must convey data
6. **No chart borders/frames** — Charts float on the page
7. **No axis lines when unnecessary** — Bars encode position; axis lines are redundant
8. **No bold colors** — Grayscale with single accent
9. **No excessive gridlines** — Only when needed for reading values
10. **No "infographic" style** — This is analysis, not decoration

---

## Libraries & Dependencies

This style uses **pure HTML/CSS with inline SVG** — no JavaScript charting libraries required.

**Required:**
- Google Fonts (Source Sans Pro)
- Modern CSS (Grid, Flexbox)

**Optional enhancements:**
- D3.js for programmatic sparkline generation
- Server-side rendering for dynamic data

---

## Complete HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Analysis Title]</title>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
    <style>
        /* Include all CSS from sections above */
    </style>
</head>
<body>
    <h1>[Title]</h1>
    <p class="subtitle">[Descriptive subtitle with key metrics and date range]</p>
    
    <!-- KPI Row -->
    <div class="grid">
        <!-- 4 big numbers -->
    </div>
    
    <!-- Main Content: 2-column -->
    <div class="grid-2">
        <div>
            <!-- Primary analysis with charts -->
        </div>
        <div>
            <!-- Supporting tables and secondary charts -->
        </div>
    </div>
    
    <div class="divider"></div>
    
    <!-- Detail Sections: 3-column -->
    <div class="grid-3">
        <!-- Three detailed breakdowns -->
    </div>
    
    <div class="footer-note">
        Data source · Analysis period · Methodology notes · Generation date
    </div>
</body>
</html>
```

---

## Generating Sparkline Paths

To convert data to SVG sparkline paths:

```javascript
function generateSparkline(data, width = 400, height = 60) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    });
    
    const linePath = `M${points.join(' L')}`;
    const areaPath = `M0,${height} L${points.join(' L')} L${width},${height} Z`;
    
    return { linePath, areaPath };
}
```

---

*This style guide enables consistent, high-quality Tufte-inspired data analyses. The goal is always clarity, density, and respect for the reader's intelligence.*
