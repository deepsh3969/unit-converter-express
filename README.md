# Unit Converter Express

A fast, accurate and fully responsive unit converter built with **HTML5**, **CSS3** and **vanilla JavaScript (ES6+)** — no frameworks, no build step, no backend, no database.

> Fast, accurate and easy unit conversions for everyday, scientific and engineering calculations.

---

## Features

- **23 conversion categories** covering everyday, engineering, scientific, digital, cooking and electrical units — **181 units** in total.
- **Centralised conversion registry** — every unit is declared once with a factor relative to its category base unit, so adding new units is a one-line change.
- **Dedicated conversion engines** for non-linear quantities:
  - Temperature (Celsius ⇄ Fahrenheit ⇄ Kelvin) with exact pairwise formulas.
  - Fuel economy (km/L, L/100 km, MPG US, MPG UK) using inverse relationships.
- **Instant conversion** while typing, when changing units, and on the *Convert* button.
- **Swap** units and values with a subtle animation (`Ctrl/Cmd + Shift + S`).
- **Clear** resets input, result, search and messages (`Esc`).
- **Copy Result** via the Clipboard API with an `execCommand` fallback (`100 Meter = 328.084 Foot`).
- **Unit search** ("Find the Units to Convert") with symbol and alias support — `kg`, `km`, `ft`, `lb`, `°C`, `psi`, `kph`, `fahrenheit`…
- **Conversion history** — last 20 conversions in `localStorage`, click to reuse, clear on demand.
- **Favorites** — save and reload the unit pairs you use most.
- **Popular conversions** one click away.
- **Precision control** — 2, 4, 5, 6, 8 or 10 decimal places with intelligent formatting:
  - no floating-point artefacts (`3.28084`, never `3.2808399999999997`)
  - trailing zeros stripped
  - scientific notation for very large and very small values
- **Input validation** — empty input, invalid characters, `NaN`, `Infinity`, grouped numbers (`2,500`), negatives.
- **Dimension-aware categories** — *Electrical* and *Radiation* expose a **Type** selector so you never try to convert volts into amperes.
- **Responsive** from 1920px down to 375px with no horizontal scrolling.
- **Accessible** — semantic HTML, labelled controls, visible focus states, ARIA live regions, skip link, keyboard shortcuts.
- **PWA-style** — `manifest.json`, generated PNG icons and an optional offline service worker.
- **Offline** after the first load; zero network requests for conversions.
- **Light pastel theme** with WCAG AA contrast on all text and controls.

---

## Supported Units

| Category | Units |
| --- | --- |
| **Length** | Meter, Kilometer, Centimeter, Millimeter, Micrometer, Nanometer, Mile, Yard, Foot, Inch, Nautical Mile, Light Year |
| **Area** | Square Meter, Square Kilometer, Square Centimeter, Square Millimeter, Square Mile, Square Yard, Square Foot, Square Inch, Hectare, Acre |
| **Volume** | Cubic Meter, Liter, Milliliter, Cubic Centimeter, Cubic Inch, Cubic Foot, Gallon, Quart, Pint, Cup, Fluid Ounce |
| **Weight / Mass** | Kilogram, Gram, Milligram, Microgram, Metric Ton, Pound, Ounce, Stone |
| **Temperature** | Celsius, Fahrenheit, Kelvin |
| **Time** | Second, Millisecond, Microsecond, Nanosecond, Minute, Hour, Day, Week, Month, Year |
| **Speed** | Meter/second, Kilometer/hour, Mile/hour, Foot/second, Knot |
| **Data Storage** | Bit, Byte, Kilobyte, Megabyte, Gigabyte, Terabyte, Petabyte (+ KiB, MiB, GiB, TiB, PiB) |
| **Pressure** | Pascal, Kilopascal, Bar, Atmosphere, PSI, Torr, mmHg |
| **Energy** | Joule, Kilojoule, Calorie, Kilocalorie, Watt-hour, Kilowatt-hour, Electronvolt |
| **Force** | Newton, Kilonewton, Dyne, Pound-force |
| **Power** | Watt, Kilowatt, Megawatt, Horsepower |
| **Frequency** | Hertz, Kilohertz, Megahertz, Gigahertz, Terahertz, RPM |
| **Angle** | Degree, Radian, Gradian, Arcminute, Arcsecond |
| **Density** | kg/m³, g/cm³, g/L, lb/ft³ |
| **Fuel Economy** | km/L, L/100 km, MPG US, MPG UK |
| **Acceleration** | m/s², ft/s², Standard gravity |
| **Torque** | Newton meter, Kilonewton meter, Pound-foot, Pound-inch |
| **Digital / Data** | Bit, Byte, Nibble, KiB, MiB, GiB, TiB, PiB, bit/s, kbit/s, Mbit/s, Gbit/s |
| **Cooking / Kitchen** | Teaspoon, Tablespoon, Cup, Fluid Ounce, Pint, Quart, Gallon, Liter, Milliliter, Cubic Meter |
| **Plane Angle** | Degree, Radian, Gradian, Arcminute, Arcsecond, Turn, Revolution, Sextant, Quadrant, NATO Mil |
| **Electrical** | Volt, Millivolt, Kilovolt, Microvolt, Ampere, Milliampere, Kiloampere, Microampere, Ohm, Kiloohm, Megaohm, Milliohm, Watt, Kilowatt, Megawatt, Coulomb, Millicoulomb, Microcoulomb, Ampere-hour |
| **Radiation** | Gray, Milligray, Rad, Sievert, millisievert, Rem, Becquerel, kBq, MBq, GBq, Curie |

*Cream-style units (gallon, quart, pint, cup, fluid ounce, teaspoon, tablespoon) are **US customary** values.*

---

## Technologies

| Layer | Choice |
| --- | --- |
| Markup | HTML5 (semantic elements, ARIA, Open Graph, PWA manifest) |
| Styling | CSS3 (custom properties, grid, flexbox, `clamp()`, reduced-motion, print styles) |
| Logic | Vanilla JavaScript ES6+ (modules-by-section, no framework, no bundler) |
| Storage | `localStorage` (history, favorites, precision preference) |
| Icons | Inline SVG + generated PNG app icons — no icon font, no emoji |
| Dependencies | **None** |

---

## Project Structure

```
unit-converter-express/
├── index.html          # Semantic markup, SEO meta, PWA links
├── style.css           # Design tokens, layout, components, responsive rules
├── script.js           # Config → registry → engine → state → UI → events
├── manifest.json       # PWA manifest (standalone, icons, theme colours)
├── sw.js               # Optional offline service worker (network-first)
├── README.md
├── .gitignore
└── assets/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

`script.js` is organised into clearly commented sections:

1. Configuration
2. Icons
3. Unit registry
4. Conversion engine
5. Number parsing & formatting
6. Persistent storage
7. DOM references
8. Rendering
9. Converter state
10. Search
11. Event handlers
12. Initialization

---

## How to Run

No build step is required.

**Option A — open directly**

```
double-click index.html
```

**Option B — local static server (recommended, enables the service worker)**

```bash
# Python
python -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Then open <http://localhost:8080>.

---

## How to Use

1. Pick a **category** from the sidebar (or the *Category* dropdown).
2. Type a value in **From** — the **To** result updates instantly.
3. Choose the source and target **units**.
4. Use **Swap**, **Clear**, **Convert** or **Copy Result** as needed.
5. Adjust **Precision** (decimal places) — history re-renders immediately.
6. Search a unit under **Find the Units to Convert** and click a result to configure the converter.
7. Click a **Popular Conversion**, a **History** entry or a **Favorite** to load it.
8. Press the **star** in the converter card to save the current unit pair.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Enter` | Convert |
| `Esc` | Clear (search box clears its own text first) |
| `Ctrl` / `⌘` + `Shift` + `S` | Swap units |
| `↑` / `↓` + `Enter` | Navigate and select search results |

---

## Browser Compatibility

| Browser | Status |
| --- | --- |
| Chrome / Edge 90+ | ✅ Fully tested |
| Firefox 88+ | ✅ Supported |
| Safari 14+ | ✅ Supported |
| iOS Safari 14+ | ✅ Responsive layout verified |
| Samsung Internet 14+ | ✅ Expected to work |

Requires `localStorage` for history/favorites (all modern browsers). The clipboard uses
`navigator.clipboard` where available and falls back to `document.execCommand('copy')`.
Everything except history/favorites/copy degrades gracefully if storage is blocked.

---

## Deployment

### GitHub

```bash
git init
git branch -M main
git add .
git commit -m "feat: create Unit Converter Express"
git remote add origin https://github.com/<your-user>/unit-converter-express.git
git push -u origin main
```

### Vercel

The project is a static site — no framework preset, no build command.

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or import the GitHub repository in the Vercel dashboard with the defaults:

- **Framework Preset:** Other
- **Build Command:** *(empty)*
- **Output Directory:** `.`

### Netlify / GitHub Pages

Drag the folder into Netlify, or enable Pages on the `main` branch — both work unchanged.

---

## Future Improvements

- Custom user-defined units and conversion formulas.
- Currency conversion (requires a live exchange-rate API).
- Unit conversion charts / formula reference panel.
- Shareable URLs encoding the current conversion (`?from=…&to=…&value=…`).
- Convert-on-copy of history entries into favorites.
- Dark theme toggle (the current design intentionally stays light).
- Offline push of updated unit lists via service worker versioning.
- Full keyboard-driven command palette for unit selection.

---

## Credits

- Colour palette inspired by the original *Unit Converter Express* reference material:
  Warm Yellow `#F6BD60`, Cream `#F7EDE2`, Soft Pink `#F5CAC3`, Muted Green `#84A59D`, Coral `#F28482`.
- Conversion factors sourced from standard SI, NIST and ISO definitions.
- Built as an engineering-college mini project and portfolio piece.
- No third-party libraries were used to build, style or run this application.

---

## License

Free to use for educational and portfolio purposes.
