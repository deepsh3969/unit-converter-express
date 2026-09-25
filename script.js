/* ==========================================================================
   Unit Converter Express — script.js
   --------------------------------------------------------------------------
   Sections
     1.  Configuration
     2.  Icons
     3.  Unit registry (categories + units)
     4.  Conversion engine
     5.  Number parsing & formatting
     6.  Persistent storage (history / favorites / preferences)
     7.  DOM references
     8.  Rendering
     9.  Converter state
    10.  Search
    11.  Event handlers
    12.  Initialization
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. CONFIGURATION
   ========================================================================== */

const CONFIG = {
  APP_NAME: 'Unit Converter Express',
  STORAGE: {
    HISTORY: 'uce.history.v1',
    FAVORITES: 'uce.favorites.v1',
    PRECISION: 'uce.precision.v1',
  },
  MAX_HISTORY: 20,
  DEFAULT_PRECISION: 5,
  PRECISION_OPTIONS: [2, 4, 5, 6, 8, 10],
  SEARCH_LIMIT: 14,
  HISTORY_DEBOUNCE_MS: 1500,
  MAX_FAVORITES: 40,
};

const MESSAGES = {
  invalid: 'Please enter a valid number.',
  empty: 'Enter a value to convert.',
  infinite: 'This value cannot be converted into the selected unit.',
  negativeNote: 'Note: negative values are usually only meaningful for temperature.',
  copied: 'Copied!',
  copyFailed: 'Copy failed — select the result and copy manually.',
  savedFav: 'Saved to favorites.',
  removedFav: 'Removed from favorites.',
  cleared: 'Cleared.',
};

/* ==========================================================================
   2. ICONS  (inline SVG — no icon font, no emoji)
   ========================================================================== */

const CATEGORY_ICONS = {
  length:
    '<rect x="2.5" y="7.5" width="19" height="9" rx="2"/>' +
    '<path d="M7 7.5v3M11 7.5v4.5M15 7.5v3M19 7.5v4.5"/>',
  area:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/>' +
    '<rect x="8" y="8" width="8" height="8" rx="1.5"/>',
  volume:
    '<path d="M7.5 3h9M9.5 3v5.4L6.1 17.6A2.6 2.6 0 0 0 8.5 21.4h7a2.6 2.6 0 0 0 2.4-3.8L14.5 8.4V3"/>' +
    '<path d="M7.3 15.5h9.4"/>',
  mass:
    '<path d="M12 3.5v17M7.5 20.5h9M4.5 7.5h15"/>' +
    '<path d="M2 13.8 4.5 7.5 7 13.8zM17 13.8 19.5 7.5 22 13.8z"/>' +
    '<path d="M2.3 13.8a2.5 2.5 0 0 0 4.4 0M17.3 13.8a2.5 2.5 0 0 0 4.4 0"/>',
  temperature:
    '<path d="M14 14.9V5a2 2 0 1 0-4 0v9.9a4.2 4.2 0 1 0 4 0z"/><path d="M12 8.5v6.6"/>',
  time:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 6.8v5.4l3.4 2"/>',
  speed:
    '<path d="M3.8 17.5a8.5 8.5 0 1 1 16.4 0"/><path d="m12 15 3.9-4.8"/><circle cx="12" cy="15.8" r="1.4"/>',
  data:
    '<ellipse cx="12" cy="6.2" rx="7.5" ry="3"/>' +
    '<path d="M4.5 6.2v11.6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6.2"/>' +
    '<path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3"/>',
  pressure:
    '<rect x="3" y="5" width="18" height="14" rx="3"/>' +
    '<path d="M7.5 15.5a4.5 4.5 0 0 1 9 0"/><path d="m12 15.5 3-3.4"/><path d="M6 15.5h.01M18 15.5h.01"/>',
  energy:
    '<path d="M13.2 2.6 4.6 13.6h6.3l-.8 7.8 8.6-11h-6.3z"/>',
  force:
    '<path d="M2.8 12h11.4"/><path d="m11 8.4 3.6 3.6-3.6 3.6"/>' +
    '<rect x="16.8" y="6" width="4.4" height="12" rx="1.6"/>',
  power:
    '<circle cx="12" cy="12" r="8.5"/>' +
    '<path d="M12.9 6.4 8.4 13.2h3.4l-.5 4.4 4.6-6.8h-3.4z"/>',
  frequency:
    '<path d="M2.5 12q2.5-6 5 0t5 0 5 0 4 0"/><path d="M2.5 17.5h19"/>',
  angle:
    '<path d="M4 19.5h16M4 19.5V4.5"/><path d="M4 19.5 17.5 6.5"/>' +
    '<path d="M9.8 19.5a5.8 5.8 0 0 0-1.7-4.1"/>',
  density:
    '<path d="M12 3 21 7.5 12 12 3 7.5z"/><path d="m3 12 9 4.5L21 12"/><path d="m3 16.5 9 4.5 9-4.5"/>',
  fuel:
    '<path d="M4.6 20.6V5.2a2 2 0 0 1 2-2h4.2a2 2 0 0 1 2 2v15.4M3 20.6h11"/>' +
    '<rect x="6.5" y="6.2" width="4.4" height="3.6" rx="0.6"/>' +
    '<path d="M13 10.2h3a2 2 0 0 1 2 2v4.8a1.5 1.5 0 0 0 3 0V8.6l-2.4-2.4"/>',
  acceleration:
    '<path d="M4.5 19.5 16.5 7.5"/><path d="M10.5 7.5h6v6"/>' +
    '<path d="M4 6.5h4.5M4 11h3M4 15.5h1.8"/>',
  torque:
    '<path d="M20.4 13.6A8.5 8.5 0 1 1 18 6.7"/><path d="M21 3.6v5h-5"/>' +
    '<rect x="9" y="10.8" width="6" height="2.4" rx="1.2"/>',
  digital:
    '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>' +
    '<rect x="10" y="10" width="4" height="4" rx="1"/>' +
    '<path d="M9.5 3.4v3.1M14.5 3.4v3.1M9.5 17.5v3.1M14.5 17.5v3.1M3.4 9.5h3.1M3.4 14.5h3.1M17.5 9.5h3.1M17.5 14.5h3.1"/>',
  cooking:
    '<path d="M5.6 6.6h10.8l-1.2 12.3a2.1 2.1 0 0 1-2.1 1.8H8.9a2.1 2.1 0 0 1-2.1-1.8z"/>' +
    '<path d="M16.4 9h1.8a2.3 2.3 0 0 1 0 4.6h-2.2"/><path d="M7 11.2h8M7.6 15.2h7"/>',
  'plane-angle':
    '<path d="M3.5 17.5h17"/><path d="M3.5 17.5a8.5 8.5 0 0 1 17 0"/>' +
    '<path d="m12 17.5 4.8-6.2"/><path d="M7.5 17.5a4.5 4.5 0 0 1 9 0"/>',
  electrical:
    '<path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v2.6a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.1v4.9"/>',
  radiation:
    '<circle cx="12" cy="12" r="2"/>' +
    '<ellipse cx="12" cy="12" rx="9" ry="3.9"/>' +
    '<ellipse cx="12" cy="12" rx="9" ry="3.9" transform="rotate(60 12 12)"/>' +
    '<ellipse cx="12" cy="12" rx="9" ry="3.9" transform="rotate(120 12 12)"/>',
};

function categoryIconSvg(categoryId, extraClass) {
  const path = CATEGORY_ICONS[categoryId] || CATEGORY_ICONS.length;
  return (
    '<svg class="' +
    (extraClass || 'cat-ico') +
    '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    path +
    '</svg>'
  );
}

/* ==========================================================================
   3. UNIT REGISTRY
   --------------------------------------------------------------------------
   Every unit is declared once. Linear units store a `factor` relative to the
   category base unit. Special engines (`temperature`, `fuel`) supply their own
   to/from base functions.
   ========================================================================== */

function u(label, symbol, factor, aliases) {
  return { label: label, symbol: symbol, factor: factor, aliases: aliases || [] };
}

function du(label, symbol, factor, dimension, aliases) {
  const unit = u(label, symbol, factor, aliases);
  unit.dimension = dimension;
  return unit;
}

const CATEGORIES = [
  { id: 'length', name: 'Length', group: 'common', base: 'meter' },
  { id: 'area', name: 'Area', group: 'common', base: 'square-meter' },
  { id: 'volume', name: 'Volume', group: 'common', base: 'liter' },
  { id: 'mass', name: 'Weight / Mass', group: 'common', base: 'kilogram' },
  { id: 'temperature', name: 'Temperature', group: 'common', engine: 'temperature', base: 'celsius' },
  { id: 'time', name: 'Time', group: 'common', base: 'second' },
  { id: 'speed', name: 'Speed', group: 'common', base: 'meter-per-second' },
  { id: 'data', name: 'Data Storage', group: 'common', base: 'byte' },
  { id: 'pressure', name: 'Pressure', group: 'common', base: 'pascal' },
  { id: 'energy', name: 'Energy', group: 'common', base: 'joule' },

  { id: 'force', name: 'Force', group: 'engineering', base: 'newton' },
  { id: 'power', name: 'Power', group: 'engineering', base: 'watt' },
  { id: 'frequency', name: 'Frequency', group: 'engineering', base: 'hertz' },
  { id: 'angle', name: 'Angle', group: 'engineering', base: 'radian' },
  { id: 'density', name: 'Density', group: 'engineering', base: 'kilogram-per-cubic-meter' },
  { id: 'fuel', name: 'Fuel Economy', group: 'engineering', engine: 'fuel', base: 'km-per-liter' },
  { id: 'acceleration', name: 'Acceleration', group: 'engineering', base: 'meter-per-second-squared' },
  { id: 'torque', name: 'Torque', group: 'engineering', base: 'newton-meter' },

  { id: 'digital', name: 'Digital / Data', group: 'additional', base: 'byte' },
  { id: 'cooking', name: 'Cooking / Kitchen', group: 'additional', base: 'milliliter' },
  { id: 'plane-angle', name: 'Plane Angle', group: 'additional', base: 'radian' },
  { id: 'electrical', name: 'Electrical', group: 'additional', base: 'volt' },
  { id: 'radiation', name: 'Radiation', group: 'additional', base: 'gray' },
];

const CATEGORY_GROUPS = [
  { id: 'common', title: 'Common Converters' },
  { id: 'engineering', title: 'Engineering / Scientific' },
  { id: 'additional', title: 'Additional' },
];

const DIMENSION_LABELS = {
  voltage: 'Voltage',
  current: 'Electric current',
  resistance: 'Resistance',
  power: 'Power',
  charge: 'Electric charge',
  'dose-absorbed': 'Absorbed dose',
  'dose-equivalent': 'Equivalent dose',
  activity: 'Radioactivity',
  storage: 'Storage size',
  rate: 'Transfer rate',
};

/* Conversion factors ------------------------------------------------------- */
const UNIT_REGISTRY = {
  length: {
    meter: u('Meter', 'm', 1, ['metre', 'meters', 'metres']),
    kilometer: u('Kilometer', 'km', 1000, ['kilometre', 'kilometers', 'kilometres']),
    centimeter: u('Centimeter', 'cm', 0.01, ['centimetre', 'centimeters']),
    millimeter: u('Millimeter', 'mm', 0.001, ['millimetre', 'millimeters']),
    micrometer: u('Micrometer', 'µm', 1e-6, ['micrometre', 'micron', 'um', 'microns']),
    nanometer: u('Nanometer', 'nm', 1e-9, ['nanometre', 'nanometers']),
    mile: u('Mile', 'mi', 1609.344, ['miles', 'statute mile']),
    yard: u('Yard', 'yd', 0.9144, ['yards']),
    foot: u('Foot', 'ft', 0.3048, ['feet', 'foot']),
    inch: u('Inch', 'in', 0.0254, ['inches', 'inch']),
    'nautical-mile': u('Nautical Mile', 'nmi', 1852, ['nautical miles', 'nauticalmile']),
    'light-year': u('Light Year', 'ly', 9460730472580800, ['lightyear', 'lightyears', 'lyr']),
  },

  area: {
    'square-meter': u('Square Meter', 'm²', 1, ['sq m', 'square metre', 'sqm']),
    'square-kilometer': u('Square Kilometer', 'km²', 1e6, ['sq km', 'square kilometre', 'sqkm']),
    'square-centimeter': u('Square Centimeter', 'cm²', 1e-4, ['sq cm', 'square centimetre', 'sqcm']),
    'square-millimeter': u('Square Millimeter', 'mm²', 1e-6, ['sq mm', 'square millimetre']),
    'square-mile': u('Square Mile', 'mi²', 2589988.110336, ['sq mi', 'square miles']),
    'square-yard': u('Square Yard', 'yd²', 0.83612736, ['sq yd']),
    'square-foot': u('Square Foot', 'ft²', 0.09290304, ['sq ft', 'square feet']),
    'square-inch': u('Square Inch', 'in²', 0.00064516, ['sq in', 'square inches']),
    hectare: u('Hectare', 'ha', 10000, ['hectares']),
    acre: u('Acre', 'ac', 4046.8564224, ['acres']),
  },

  volume: {
    'cubic-meter': u('Cubic Meter', 'm³', 1000, ['cubic metre', 'cum']),
    liter: u('Liter', 'L', 1, ['litre', 'liters', 'litres', 'l']),
    milliliter: u('Milliliter', 'mL', 0.001, ['millilitre', 'millilitres', 'ml']),
    'cubic-centimeter': u('Cubic Centimeter', 'cm³', 0.001, ['cubic centimetre', 'cc']),
    'cubic-inch': u('Cubic Inch', 'in³', 0.016387064, ['cu in']),
    'cubic-foot': u('Cubic Foot', 'ft³', 28.316846592, ['cu ft', 'cubic feet']),
    gallon: u('Gallon (US)', 'gal', 3.785411784, ['gallons', 'us gallon']),
    quart: u('Quart (US)', 'qt', 0.946352946, ['quarts']),
    pint: u('Pint (US)', 'pt', 0.473176473, ['pints']),
    cup: u('Cup (US)', 'cup', 0.2365882365, ['cups']),
    'fluid-ounce': u('Fluid Ounce (US)', 'fl oz', 0.0295735295625, ['fluid ounces', 'floz']),
  },

  mass: {
    kilogram: u('Kilogram', 'kg', 1, ['kilogramme', 'kilograms', 'kgs']),
    gram: u('Gram', 'g', 0.001, ['gramme', 'grams']),
    milligram: u('Milligram', 'mg', 1e-6, ['milligramme', 'milligrams']),
    microgram: u('Microgram', 'µg', 1e-9, ['microgramme', 'mcg', 'ug']),
    'metric-ton': u('Metric Ton', 't', 1000, ['tonne', 'tonnes', 'metric ton']),
    pound: u('Pound', 'lb', 0.45359237, ['pounds', 'lbs', 'pound mass']),
    ounce: u('Ounce', 'oz', 0.028349523125, ['ounces']),
    stone: u('Stone', 'st', 6.35029318, ['stones']),
  },

  temperature: {
    celsius: u('Celsius', '°C', 1, ['centigrade', 'c', 'degc', 'degrees celsius']),
    fahrenheit: u('Fahrenheit', '°F', 1, ['f', 'degf', 'degrees fahrenheit']),
    kelvin: u('Kelvin', 'K', 1, ['k', 'kelvins', 'absolute temperature']),
  },

  time: {
    second: u('Second', 's', 1, ['sec', 'secs', 'seconds']),
    millisecond: u('Millisecond', 'ms', 0.001, ['msec', 'milliseconds']),
    microsecond: u('Microsecond', 'µs', 1e-6, ['usec', 'microseconds']),
    nanosecond: u('Nanosecond', 'ns', 1e-9, ['nanoseconds']),
    minute: u('Minute', 'min', 60, ['minutes', 'mins']),
    hour: u('Hour', 'h', 3600, ['hr', 'hrs', 'hours']),
    day: u('Day', 'd', 86400, ['days']),
    week: u('Week', 'wk', 604800, ['weeks']),
    month: u('Month', 'mo', 2629800, ['months', 'average month']),
    year: u('Year', 'yr', 31557600, ['years', 'julian year']),
  },

  speed: {
    'meter-per-second': u('Meter/second', 'm/s', 1, ['metres per second', 'meters per second']),
    'kilometer-per-hour': u('Kilometer/hour', 'km/h', 1 / 3.6, ['kph', 'kmh', 'kilometres per hour']),
    'mile-per-hour': u('Mile/hour', 'mph', 0.44704, ['miles per hour', 'mi/h']),
    'foot-per-second': u('Foot/second', 'ft/s', 0.3048, ['feet per second', 'fps']),
    knot: u('Knot', 'kn', 1852 / 3600, ['knots', 'kt', 'nautical miles per hour']),
  },

  data: {
    bit: u('Bit', 'bit', 0.125, ['bits', 'b']),
    byte: u('Byte', 'B', 1, ['bytes']),
    kilobyte: u('Kilobyte', 'KB', 1e3, ['kb', 'kilobytes']),
    megabyte: u('Megabyte', 'MB', 1e6, ['mb', 'megabytes']),
    gigabyte: u('Gigabyte', 'GB', 1e9, ['gb', 'gigabytes']),
    terabyte: u('Terabyte', 'TB', 1e12, ['tb', 'terabytes']),
    petabyte: u('Petabyte', 'PB', 1e15, ['pb', 'petabytes']),
    kibibyte: u('Kibibyte', 'KiB', 1024, ['kib', 'kibibytes']),
    mebibyte: u('Mebibyte', 'MiB', 1048576, ['mib', 'mebibytes']),
    gibibyte: u('Gibibyte', 'GiB', 1073741824, ['gib', 'gibibytes']),
    tebibyte: u('Tebibyte', 'TiB', 1099511627776, ['tib', 'tebibytes']),
    pebibyte: u('Pebibyte', 'PiB', 1125899906842624, ['pib', 'pebibytes']),
  },

  pressure: {
    pascal: u('Pascal', 'Pa', 1, ['pa', 'pascals']),
    kilopascal: u('Kilopascal', 'kPa', 1000, ['kpa']),
    bar: u('Bar', 'bar', 1e5, ['bars']),
    atmosphere: u('Atmosphere', 'atm', 101325, ['atmospheres', 'atm']),
    psi: u('PSI', 'psi', 6894.757293168, ['pounds per square inch', 'lbf/in²']),
    torr: u('Torr', 'Torr', 101325 / 760, ['torrs', 'mm torr']),
    mmhg: u('mmHg', 'mmHg', 133.322387415, ['millimeters of mercury', 'millimetres of mercury']),
  },

  energy: {
    joule: u('Joule', 'J', 1, ['joules', 'j']),
    kilojoule: u('Kilojoule', 'kJ', 1000, ['kj', 'kilojoules']),
    calorie: u('Calorie', 'cal', 4.184, ['cal', 'calories', 'small calorie']),
    kilocalorie: u('Kilocalorie', 'kcal', 4184, ['kcal', 'food calorie', 'calories (food)']),
    'watt-hour': u('Watt-hour', 'Wh', 3600, ['wh', 'watt hours']),
    'kilowatt-hour': u('Kilowatt-hour', 'kWh', 3.6e6, ['kwh', 'kilowatt hours', 'unit']),
    electronvolt: u('Electronvolt', 'eV', 1.602176634e-19, ['ev', 'electron volts', 'electronvolts']),
  },

  force: {
    newton: u('Newton', 'N', 1, ['newtons', 'n']),
    kilonewton: u('Kilonewton', 'kN', 1000, ['kn', 'kilonewtons']),
    dyne: u('Dyne', 'dyn', 1e-5, ['dynes']),
    'pound-force': u('Pound-force', 'lbf', 4.4482216152605, ['pound force', 'pounds force']),
  },

  power: {
    watt: u('Watt', 'W', 1, ['watts', 'w']),
    kilowatt: u('Kilowatt', 'kW', 1000, ['kw', 'kilowatts']),
    megawatt: u('Megawatt', 'MW', 1e6, ['mw', 'megawatts']),
    horsepower: u('Horsepower', 'hp', 745.6998715822702, ['hp', 'metric horsepower']),
  },

  frequency: {
    hertz: u('Hertz', 'Hz', 1, ['hz', 'cycles per second']),
    kilohertz: u('Kilohertz', 'kHz', 1e3, ['khz']),
    megahertz: u('Megahertz', 'MHz', 1e6, ['mhz']),
    gigahertz: u('Gigahertz', 'GHz', 1e9, ['ghz']),
    terahertz: u('Terahertz', 'THz', 1e12, ['thz']),
    rpm: u('RPM', 'rpm', 1 / 60, ['revolutions per minute', 'revs per minute']),
  },

  angle: {
    degree: u('Degree', '°', Math.PI / 180, ['deg', 'degrees']),
    radian: u('Radian', 'rad', 1, ['radians', 'r']),
    gradian: u('Gradian', 'grad', Math.PI / 200, ['gradian', 'grads', 'gon']),
    arcminute: u('Arcminute', '′', Math.PI / 10800, ['arc minutes', 'arcmin', 'moa']),
    arcsecond: u('Arcsecond', '″', Math.PI / 648000, ['arc seconds', 'arcsec']),
  },

  density: {
    'kilogram-per-cubic-meter': u('Kilogram/cubic meter', 'kg/m³', 1, ['kg per cubic metre', 'kgm3']),
    'gram-per-cubic-centimeter': u('Gram/cubic centimeter', 'g/cm³', 1000, ['g per cubic centimetre', 'gcc']),
    'gram-per-liter': u('Gram/liter', 'g/L', 1, ['g per litre', 'gl']),
    'pound-per-cubic-foot': u('Pound/cubic foot', 'lb/ft³', 16.018463373960142, ['pcf', 'pounds per cubic foot']),
  },

  fuel: {
    'km-per-liter': u('Kilometer/liter', 'km/L', 1, ['kilometres per litre', 'kpl']),
    'liter-per-100-km': u('Liter/100 km', 'L/100km', 1, ['litres per 100 kilometres', 'l100', 'l/100 km']),
    'mpg-us': u('MPG (US)', 'MPG US', 1, ['mpg', 'miles per us gallon', 'us mpg']),
    'mpg-uk': u('MPG (UK)', 'MPG UK', 1, ['imperial mpg', 'miles per imperial gallon']),
  },

  acceleration: {
    'meter-per-second-squared': u('Meter/second²', 'm/s²', 1, ['meters per second squared']),
    'foot-per-second-squared': u('Foot/second²', 'ft/s²', 0.3048, ['feet per second squared']),
    'standard-gravity': u('Standard gravity', 'g₀', 9.80665, ['standard acceleration of gravity', 'gn', '1g']),
  },

  torque: {
    'newton-meter': u('Newton meter', 'N·m', 1, ['newton metre', 'nm', 'newton-metre']),
    'kilonewton-meter': u('Kilonewton meter', 'kN·m', 1000, ['kilonewton metre', 'knm']),
    'pound-foot': u('Pound-foot', 'lbf·ft', 1.3558179483314004, ['foot-pound', 'ft-lb', 'ftlb']),
    'pound-inch': u('Pound-inch', 'lbf·in', 0.1129848290276167, ['inch-pound', 'in-lb', 'inlb']),
  },

  digital: {
    bit: du('Bit', 'bit', 0.125, 'storage', ['bits']),
    byte: du('Byte', 'B', 1, 'storage', ['bytes']),
    nibble: du('Nibble', 'nibble', 0.5, 'storage', ['nybbles', 'half byte']),
    kibibyte: du('Kibibyte', 'KiB', 1024, 'storage', ['kib', 'kibibytes']),
    mebibyte: du('Mebibyte', 'MiB', 1048576, 'storage', ['mib', 'mebibytes']),
    gibibyte: du('Gibibyte', 'GiB', 1073741824, 'storage', ['gib', 'gibibytes']),
    tebibyte: du('Tebibyte', 'TiB', 1099511627776, 'storage', ['tib', 'tebibytes']),
    pebibyte: du('Pebibyte', 'PiB', 1125899906842624, 'storage', ['pib', 'pebibytes']),
    'bit-per-second': du('Bit/second', 'bit/s', 1, 'rate', ['bps', 'bits per second']),
    'kilobit-per-second': du('Kilobit/second', 'kbit/s', 1e3, 'rate', ['kbps', 'kilobits per second']),
    'megabit-per-second': du('Megabit/second', 'Mbit/s', 1e6, 'rate', ['mbps', 'megabits per second']),
    'gigabit-per-second': du('Gigabit/second', 'Gbit/s', 1e9, 'rate', ['gbps', 'gigabits per second']),
  },

  cooking: {
    teaspoon: u('Teaspoon (US)', 'tsp', 4.92892159375, ['teaspoons', 'tsp']),
    tablespoon: u('Tablespoon (US)', 'tbsp', 14.78676478125, ['tablespoons', 'tbsp']),
    cup: u('Cup (US)', 'cup', 236.5882365, ['cups']),
    'fluid-ounce': u('Fluid Ounce (US)', 'fl oz', 29.5735295625, ['fluid ounces']),
    pint: u('Pint (US)', 'pt', 473.176473, ['pints']),
    quart: u('Quart (US)', 'qt', 946.352946, ['quarts']),
    gallon: u('Gallon (US)', 'gal', 3785.411784, ['gallons']),
    liter: u('Liter', 'L', 1000, ['litre', 'litres']),
    milliliter: u('Milliliter', 'mL', 1, ['millilitre', 'ml']),
    'cubic-meter': u('Cubic Meter', 'm³', 1e6, ['cubic metre']),
  },

  'plane-angle': {
    degree: u('Degree', '°', Math.PI / 180, ['deg', 'degrees']),
    radian: u('Radian', 'rad', 1, ['radians']),
    gradian: u('Gradian', 'grad', Math.PI / 200, ['grads', 'gon']),
    arcminute: u('Arcminute', '′', Math.PI / 10800, ['arc minutes', 'arcmin']),
    arcsecond: u('Arcsecond', '″', Math.PI / 648000, ['arc seconds', 'arcsec']),
    turn: u('Turn', 'turn', 2 * Math.PI, ['full circle', 'revolutions']),
    revolution: u('Revolution', 'rev', 2 * Math.PI, ['revs', 'rotations']),
    sextant: u('Sextant', 'sextant', Math.PI / 3, ['sextants']),
    quadrant: u('Quadrant', 'quadrant', Math.PI / 2, ['quadrants', 'right angle']),
    mil: u('NATO Mil', 'mil', (2 * Math.PI) / 6400, ['mils', 'milliradians (NATO)']),
  },

  electrical: {
    volt: du('Volt', 'V', 1, 'voltage', ['volts', 'v']),
    millivolt: du('Millivolt', 'mV', 1e-3, 'voltage', ['millivolts']),
    kilovolt: du('Kilovolt', 'kV', 1e3, 'voltage', ['kilovolts']),
    microvolt: du('Microvolt', 'µV', 1e-6, 'voltage', ['microvolts', 'uv']),
    ampere: du('Ampere', 'A', 1, 'current', ['amps', 'amp', 'amperes']),
    milliampere: du('Milliampere', 'mA', 1e-3, 'current', ['milliamps', 'ma']),
    kiloampere: du('Kiloampere', 'kA', 1e3, 'current', ['kiloamps']),
    microampere: du('Microampere', 'µA', 1e-6, 'current', ['microamps', 'ua']),
    ohm: du('Ohm', 'Ω', 1, 'resistance', ['ohms', 'ohm']),
    kiloohm: du('Kiloohm', 'kΩ', 1e3, 'resistance', ['kohm', 'kilohms']),
    megaohm: du('Megaohm', 'MΩ', 1e6, 'resistance', ['megohm', 'megohms']),
    milliohm: du('Milliohm', 'mΩ', 1e-3, 'resistance', ['mohm', 'milliohms']),
    watt: du('Watt', 'W', 1, 'power', ['watts']),
    kilowatt: du('Kilowatt', 'kW', 1e3, 'power', ['kilowatts']),
    megawatt: du('Megawatt', 'MW', 1e6, 'power', ['megawatts']),
    coulomb: du('Coulomb', 'C', 1, 'charge', ['coulombs']),
    millicoulomb: du('Millicoulomb', 'mC', 1e-3, 'charge', ['millicoulombs']),
    microcoulomb: du('Microcoulomb', 'µC', 1e-6, 'charge', ['microcoulombs', 'uc']),
    'ampere-hour': du('Ampere-hour', 'Ah', 3600, 'charge', ['amp hours', 'ampere hours', 'mah']),
  },

  radiation: {
    gray: du('Gray', 'Gy', 1, 'dose-absorbed', ['grays', 'gy']),
    milligray: du('Milligray', 'mGy', 1e-3, 'dose-absorbed', ['milligrays']),
    rad: du('Rad', 'rad', 0.01, 'dose-absorbed', ['rads', 'radiation absorbed dose']),
    sievert: du('Sievert', 'Sv', 1, 'dose-equivalent', ['sieverts', 'sv']),
    millisievert: du('Millisievert', 'mSv', 1e-3, 'dose-equivalent', ['millisieverts', 'msv']),
    rem: du('Rem', 'rem', 0.01, 'dose-equivalent', ['rems', 'roentgen equivalent man']),
    becquerel: du('Becquerel', 'Bq', 1, 'activity', ['becquerels', 'bq']),
    kilobecquerel: du('Kilobecquerel', 'kBq', 1e3, 'activity', ['kilobecquerels']),
    megabecquerel: du('Megabecquerel', 'MBq', 1e6, 'activity', ['megabecquerels']),
    gigabecquerel: du('Gigabecquerel', 'GBq', 1e9, 'activity', ['gigabecquerels']),
    curie: du('Curie', 'Ci', 3.7e10, 'activity', ['curies']),
  },
};

/* Sensible default unit pairs per category -------------------------------- */
const CATEGORY_DEFAULTS = {
  length: ['meter', 'foot'],
  area: ['square-meter', 'square-foot'],
  volume: ['liter', 'gallon'],
  mass: ['kilogram', 'pound'],
  temperature: ['celsius', 'fahrenheit'],
  time: ['hour', 'minute'],
  speed: ['kilometer-per-hour', 'mile-per-hour'],
  data: ['megabyte', 'mebibyte'],
  pressure: ['atmosphere', 'psi'],
  energy: ['joule', 'calorie'],
  force: ['newton', 'pound-force'],
  power: ['watt', 'horsepower'],
  frequency: ['hertz', 'kilohertz'],
  angle: ['degree', 'radian'],
  density: ['kilogram-per-cubic-meter', 'gram-per-cubic-centimeter'],
  fuel: ['km-per-liter', 'mpg-us'],
  acceleration: ['meter-per-second-squared', 'foot-per-second-squared'],
  torque: ['newton-meter', 'pound-foot'],
  digital: ['byte', 'kibibyte'],
  cooking: ['tablespoon', 'milliliter'],
  'plane-angle': ['degree', 'turn'],
  electrical: ['volt', 'millivolt'],
  radiation: ['gray', 'rad'],
};

const POPULAR_CONVERSIONS = [
  { label: '1 km → miles', categoryId: 'length', fromId: 'kilometer', toId: 'mile', value: '1' },
  { label: '1 kg → pounds', categoryId: 'mass', fromId: 'kilogram', toId: 'pound', value: '1' },
  { label: '1 meter → feet', categoryId: 'length', fromId: 'meter', toId: 'foot', value: '1' },
  { label: '1 liter → gallons', categoryId: 'volume', fromId: 'liter', toId: 'gallon', value: '1' },
  { label: '25 °C → °F', categoryId: 'temperature', fromId: 'celsius', toId: 'fahrenheit', value: '25' },
  { label: '1 mph → km/h', categoryId: 'speed', fromId: 'mile-per-hour', toId: 'kilometer-per-hour', value: '1' },
  { label: '1 in → cm', categoryId: 'length', fromId: 'inch', toId: 'centimeter', value: '1' },
  { label: '1 kWh → joules', categoryId: 'energy', fromId: 'kilowatt-hour', toId: 'joule', value: '1' },
];

/* ==========================================================================
   4. CONVERSION ENGINE
   ========================================================================== */

/* --- Temperature: base unit = Celsius ------------------------------------ */
const TEMPERATURE_ENGINES = {
  celsius: { toBase: (v) => v, fromBase: (v) => v },
  fahrenheit: { toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
  kelvin: { toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
};

/* --- Fuel economy: base unit = kilometres per litre ---------------------- */
const MPG_US_TO_KM_PER_L = 1.609344 / 3.785411784;
const MPG_UK_TO_KM_PER_L = 1.609344 / 4.54609;

const FUEL_ENGINES = {
  'km-per-liter': { toBase: (v) => v, fromBase: (v) => v },
  'liter-per-100-km': { toBase: (v) => (v === 0 ? Infinity : 100 / v), fromBase: (v) => (v === 0 ? Infinity : 100 / v) },
  'mpg-us': { toBase: (v) => v * MPG_US_TO_KM_PER_L, fromBase: (v) => v / MPG_US_TO_KM_PER_L },
  'mpg-uk': { toBase: (v) => v * MPG_UK_TO_KM_PER_L, fromBase: (v) => v / MPG_UK_TO_KM_PER_L },
};

function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) || null;
}

function getUnit(categoryId, unitId) {
  const registry = UNIT_REGISTRY[categoryId];
  if (!registry) return null;
  return registry[unitId] || null;
}

function getUnitIds(categoryId) {
  const registry = UNIT_REGISTRY[categoryId] || {};
  return Object.keys(registry);
}

function getDimension(unitId, categoryId, unit) {
  if (unit && unit.dimension) return unit.dimension;
  return categoryId;
}

function getDimensions(categoryId) {
  const seen = [];
  getUnitIds(categoryId).forEach((id) => {
    const dim = getDimension(id, categoryId, UNIT_REGISTRY[categoryId][id]);
    if (seen.indexOf(dim) === -1) seen.push(dim);
  });
  return seen;
}

function getUnitsForDimension(categoryId, dimension) {
  return getUnitIds(categoryId).filter((id) => {
    const unit = UNIT_REGISTRY[categoryId][id];
    return getDimension(id, categoryId, unit) === dimension;
  });
}

function dimensionLabel(categoryId, dimension) {
  return DIMENSION_LABELS[dimension] || getCategory(categoryId).name;
}

/** Convert a value into the category base unit. */
function toBase(categoryId, unitId, value) {
  const category = getCategory(categoryId);
  const unit = getUnit(categoryId, unitId);
  if (!category || !unit) return NaN;

  if (category.engine === 'temperature') {
    return TEMPERATURE_ENGINES[unitId].toBase(value);
  }
  if (category.engine === 'fuel') {
    return FUEL_ENGINES[unitId].toBase(value);
  }
  return value * unit.factor;
}

/** Convert a value from the category base unit into the target unit. */
function fromBase(categoryId, unitId, value) {
  const category = getCategory(categoryId);
  const unit = getUnit(categoryId, unitId);
  if (!category || !unit) return NaN;

  if (category.engine === 'temperature') {
    return TEMPERATURE_ENGINES[unitId].fromBase(value);
  }
  if (category.engine === 'fuel') {
    return FUEL_ENGINES[unitId].fromBase(value);
  }
  return value / unit.factor;
}

/**
 * Core conversion.
 * @returns {{ok: boolean, value: number, reason?: string}}
 */
function convert(categoryId, fromId, toId, value) {
  const fromUnit = getUnit(categoryId, fromId);
  const toUnit = getUnit(categoryId, toId);
  if (!fromUnit || !toUnit) return { ok: false, value: NaN, reason: 'unknown-unit' };
  if (getDimension(fromId, categoryId, fromUnit) !== getDimension(toId, categoryId, toUnit)) {
    return { ok: false, value: NaN, reason: 'dimension-mismatch' };
  }
  if (!Number.isFinite(value)) return { ok: false, value: NaN, reason: 'invalid-value' };

  const result = fromBase(categoryId, toId, toBase(categoryId, fromId, value));
  if (!Number.isFinite(result)) return { ok: false, value: NaN, reason: 'non-finite' };
  return { ok: true, value: result };
}

/* ==========================================================================
   5. NUMBER PARSING & FORMATTING
   ========================================================================== */

const NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;
const GROUPED_NUMBER_PATTERN = /^[+-]?\d{1,3}(,\d{3})+(\.\d+)?([eE][+-]?\d+)?$/;

/** @returns {number|null} null when the input is not a usable number */
function parseNumber(raw) {
  if (raw === null || raw === undefined) return null;
  let text = String(raw).trim();
  if (text === '') return null;

  if (GROUPED_NUMBER_PATTERN.test(text)) {
    text = text.replace(/,/g, '');
  }
  if (!NUMBER_PATTERN.test(text)) return null;

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function trimTrailingZeros(text) {
  if (text.indexOf('.') === -1) return text;
  let out = text.replace(/0+$/, '');
  if (out.endsWith('.')) out = out.slice(0, -1);
  return out;
}

function toExponentialString(value, digits) {
  const parts = value.toExponential(digits).split('e');
  const mantissa = trimTrailingZeros(parts[0]);
  const exponent = Number(parts[1]);
  return mantissa + 'e' + exponent;
}

/**
 * Formats a number for display: no floating point artefacts, no unnecessary
 * trailing zeros, scientific notation for very large / very small values.
 */
function formatNumber(value, precision) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';

  const digits = Math.min(Math.max(precision, 0), 20);
  const abs = Math.abs(value);
  const fixed = value.toFixed(digits);
  const needsScientific = abs >= 1e15 || Number(fixed) === 0;

  if (needsScientific) {
    const sig = Math.min(Math.max(digits, 1), 12);
    return toExponentialString(value, sig);
  }
  return trimTrailingZeros(fixed);
}

function unitText(categoryId, unitId) {
  const unit = getUnit(categoryId, unitId);
  return unit ? unit.label : '';
}

function unitSymbol(categoryId, unitId) {
  const unit = getUnit(categoryId, unitId);
  return unit ? unit.symbol : '';
}

/* ==========================================================================
   6. PERSISTENT STORAGE
   ========================================================================== */

const Storage = {
  read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (err) {
      return fallback;
    }
  },
  write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  },
};

function sanitizeHistory(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter(
      (item) =>
        item &&
        typeof item.categoryId === 'string' &&
        typeof item.fromId === 'string' &&
        typeof item.toId === 'string' &&
        Number.isFinite(item.value) &&
        Number.isFinite(item.result) &&
        getCategory(item.categoryId) &&
        getUnit(item.categoryId, item.fromId) &&
        getUnit(item.categoryId, item.toId)
    )
    .slice(0, CONFIG.MAX_HISTORY);
}

function sanitizeFavorites(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter(
      (item) =>
        item &&
        typeof item.categoryId === 'string' &&
        typeof item.fromId === 'string' &&
        typeof item.toId === 'string' &&
        getCategory(item.categoryId) &&
        getUnit(item.categoryId, item.fromId) &&
        getUnit(item.categoryId, item.toId)
    )
    .slice(0, CONFIG.MAX_FAVORITES);
}

/* ==========================================================================
   7. DOM REFERENCES
   ========================================================================== */

const DOM = {};

function cacheDom() {
  const ids = [
    'nav-toggle',
    'site-nav',
    'category-nav',
    'category-select',
    'dimension-field',
    'dimension-select',
    'from-value',
    'from-unit',
    'to-unit',
    'result-value',
    'equation',
    'form-message',
    'convert-btn',
    'swap-btn',
    'swap-btn-2',
    'clear-btn',
    'copy-btn',
    'precision-select',
    'favorite-toggle',
    'popular-list',
    'unit-search',
    'search-clear',
    'search-results',
    'search-empty',
    'history-list',
    'history-empty',
    'clear-history',
    'favorites-list',
    'favorites-empty',
    'clear-favorites',
    'toast',
    'converter-card',
  ];
  ids.forEach((id) => {
    DOM[id] = document.getElementById(id);
  });
  DOM.navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  DOM.sections = ['home', 'converter', 'history', 'favorites', 'about']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
}

/* ==========================================================================
   8. RENDERING
   ========================================================================== */

const state = {
  categoryId: 'length',
  dimension: 'length',
  fromId: 'meter',
  toId: 'foot',
  precision: CONFIG.DEFAULT_PRECISION,
  lastResult: null,
  history: [],
  favorites: [],
  searchIndex: [],
  searchActiveIndex: -1,
  searchMatches: [],
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function showToast(message, isError) {
  const toast = DOM.toast;
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.toggle('is-error', Boolean(isError));
  // force reflow so the transition restarts cleanly
  void toast.offsetWidth;
  toast.classList.add('is-visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.hidden = true;
    }, 220);
  }, 1900);
}

function setFormMessage(text, kind) {
  const node = DOM['form-message'];
  if (!node) return;
  node.textContent = text || '';
  node.classList.remove('is-info', 'is-note');
  if (kind) node.classList.add(kind);
}

/* --- Category navigation & selector ------------------------------------- */
function renderCategoryNav() {
  const container = DOM['category-nav'];
  if (!container) return;
  container.textContent = '';

  CATEGORY_GROUPS.forEach((group) => {
    const wrapper = el('div', 'category-group');
    wrapper.appendChild(el('p', 'category-group-title', group.title));

    const list = el('div', 'category-list');
    CATEGORIES.filter((c) => c.group === group.id).forEach((category) => {
      const btn = el('button', 'category-btn');
      btn.type = 'button';
      btn.dataset.category = category.id;
      btn.setAttribute('aria-pressed', String(category.id === state.categoryId));
      btn.innerHTML = categoryIconSvg(category.id);
      btn.appendChild(el('span', null, category.name));
      list.appendChild(btn);
    });

    wrapper.appendChild(list);
    container.appendChild(wrapper);
  });
}

function renderCategorySelect() {
  const select = DOM['category-select'];
  if (!select) return;
  select.textContent = '';

  CATEGORY_GROUPS.forEach((group) => {
    const optGroup = document.createElement('optgroup');
    optGroup.label = group.title;
    CATEGORIES.filter((c) => c.group === group.id).forEach((category) => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      optGroup.appendChild(option);
    });
    select.appendChild(optGroup);
  });
  select.value = state.categoryId;
}

function syncCategoryChrome() {
  const select = DOM['category-select'];
  if (select) select.value = state.categoryId;

  const buttons = DOM['category-nav']
    ? DOM['category-nav'].querySelectorAll('[data-category]')
    : [];
  buttons.forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.category === state.categoryId));
  });
}

/* --- Dimension (type) selector ------------------------------------------ */
function renderDimensionField() {
  const field = DOM['dimension-field'];
  const select = DOM['dimension-select'];
  if (!field || !select) return;

  const dimensions = getDimensions(state.categoryId);
  if (dimensions.length <= 1) {
    field.hidden = true;
    select.textContent = '';
    return;
  }

  field.hidden = false;
  select.textContent = '';
  dimensions.forEach((dim) => {
    const option = document.createElement('option');
    option.value = dim;
    option.textContent = dimensionLabel(state.categoryId, dim);
    select.appendChild(option);
  });

  if (dimensions.indexOf(state.dimension) === -1) {
    state.dimension = dimensions[0];
  }
  select.value = state.dimension;
}

/* --- Unit selectors ------------------------------------------------------ */
function renderUnitSelects() {
  const unitIds = getUnitsForDimension(state.categoryId, state.dimension);

  if (unitIds.indexOf(state.fromId) === -1) state.fromId = unitIds[0];
  if (unitIds.indexOf(state.toId) === -1 || state.toId === state.fromId) {
    state.toId = unitIds.find((id) => id !== state.fromId) || unitIds[0];
  }

  [DOM['from-unit'], DOM['to-unit']].forEach((select, index) => {
    if (!select) return;
    select.textContent = '';
    unitIds.forEach((unitId) => {
      const unit = getUnit(state.categoryId, unitId);
      const option = document.createElement('option');
      option.value = unitId;
      option.textContent = unit.label + ' (' + unit.symbol + ')';
      select.appendChild(option);
    });
    select.value = index === 0 ? state.fromId : state.toId;
  });
}

function renderPrecisionOptions() {
  const select = DOM['precision-select'];
  if (!select) return;
  select.textContent = '';
  CONFIG.PRECISION_OPTIONS.forEach((value) => {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = String(value);
    select.appendChild(option);
  });
  select.value = String(state.precision);
}

/* --- Result area --------------------------------------------------------- */
function renderResult(value) {
  const resultNode = DOM['result-value'];
  const equationNode = DOM.equation;
  if (!resultNode || !equationNode) return;

  if (value === null || !Number.isFinite(value)) {
    state.lastResult = null;
    resultNode.textContent = '—';
    equationNode.textContent = state.fromId ? unitText(state.categoryId, state.fromId) + ' → ' + unitText(state.categoryId, state.toId) : '';
    return;
  }

  state.lastResult = value;
  const formatted = formatNumber(value, state.precision);
  resultNode.textContent = formatted;

  const fromUnit = getUnit(state.categoryId, state.fromId);
  const toUnit = getUnit(state.categoryId, state.toId);
  const inputValue = DOM['from-value'] ? DOM['from-value'].value.trim() : '';
  equationNode.textContent =
    inputValue + ' ' + fromUnit.label + ' = ' + formatted + ' ' + toUnit.label;

  resultNode.classList.remove('is-flash');
  void resultNode.offsetWidth;
  resultNode.classList.add('is-flash');
}

/* --- Popular conversions ------------------------------------------------- */
function renderPopular() {
  const list = DOM['popular-list'];
  if (!list) return;
  list.textContent = '';

  POPULAR_CONVERSIONS.forEach((item) => {
    const li = document.createElement('li');
    const btn = el('button', 'chip', item.label);
    btn.type = 'button';
    btn.dataset.category = item.categoryId;
    btn.dataset.from = item.fromId;
    btn.dataset.to = item.toId;
    btn.dataset.value = item.value;
    li.appendChild(btn);
    list.appendChild(li);
  });
}

/* --- History ------------------------------------------------------------- */
function historyText(entry) {
  const from = getUnit(entry.categoryId, entry.fromId);
  const to = getUnit(entry.categoryId, entry.toId);
  return (
    formatNumber(entry.value, state.precision) +
    ' ' +
    from.symbol +
    ' → ' +
    formatNumber(entry.result, state.precision) +
    ' ' +
    to.symbol
  );
}

function renderHistory() {
  const list = DOM['history-list'];
  const empty = DOM['history-empty'];
  if (!list || !empty) return;
  list.textContent = '';

  const hasItems = state.history.length > 0;
  empty.hidden = hasItems;
  list.hidden = !hasItems;

  state.history.forEach((entry, index) => {
    const category = getCategory(entry.categoryId);
    const li = el('li', 'record-item rise-in');
    li.style.animationDelay = Math.min(index * 20, 200) + 'ms';

    const load = el('button', 'record-load');
    load.type = 'button';
    load.dataset.index = String(index);
    load.setAttribute('aria-label', 'Load conversion ' + historyText(entry));
    load.appendChild(el('span', 'record-text', historyText(entry)));
    load.appendChild(el('span', 'record-tag', category.name));

    const remove = el('button', 'record-remove');
    remove.type = 'button';
    remove.dataset.removeHistory = String(index);
    remove.setAttribute('aria-label', 'Delete this conversion from history');
    remove.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"></path></svg>';

    li.appendChild(load);
    li.appendChild(remove);
    list.appendChild(li);
  });
}

/* --- Favorites ----------------------------------------------------------- */
function favoriteKey(categoryId, fromId, toId) {
  return categoryId + ':' + fromId + ':' + toId;
}

function isCurrentFavorite() {
  const key = favoriteKey(state.categoryId, state.fromId, state.toId);
  return state.favorites.some((f) => favoriteKey(f.categoryId, f.fromId, f.toId) === key);
}

function renderFavoriteToggle() {
  const btn = DOM['favorite-toggle'];
  if (!btn) return;
  const active = isCurrentFavorite();
  btn.setAttribute('aria-pressed', String(active));
  btn.setAttribute(
    'aria-label',
    active ? 'Remove this conversion from favorites' : 'Save this conversion to favorites'
  );
  btn.title = active ? 'Remove from favorites' : 'Save to favorites';
}

function renderFavorites() {
  const list = DOM['favorites-list'];
  const empty = DOM['favorites-empty'];
  if (!list || !empty) return;
  list.textContent = '';

  const hasItems = state.favorites.length > 0;
  empty.hidden = hasItems;
  list.hidden = !hasItems;

  state.favorites.forEach((entry, index) => {
    const category = getCategory(entry.categoryId);
    const from = getUnit(entry.categoryId, entry.fromId);
    const to = getUnit(entry.categoryId, entry.toId);

    const li = el('li', 'record-item rise-in');
    li.style.animationDelay = Math.min(index * 20, 200) + 'ms';

    const load = el('button', 'record-load');
    load.type = 'button';
    load.dataset.favIndex = String(index);
    load.setAttribute('aria-label', 'Load ' + from.label + ' to ' + to.label);
    load.appendChild(el('span', 'record-text', from.label + ' → ' + to.label));
    load.appendChild(el('span', 'record-tag', category.name));

    const remove = el('button', 'record-remove');
    remove.type = 'button';
    remove.dataset.removeFavorite = String(index);
    remove.setAttribute('aria-label', 'Remove ' + from.label + ' to ' + to.label + ' from favorites');
    remove.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"></path></svg>';

    li.appendChild(load);
    li.appendChild(remove);
    list.appendChild(li);
  });
}

/* ==========================================================================
   9. CONVERTER STATE
   ========================================================================== */

function applyCategory(categoryId, options) {
  const category = getCategory(categoryId);
  if (!category) return;
  const opts = options || {};

  state.categoryId = categoryId;
  const dims = getDimensions(categoryId);
  state.dimension = opts.dimension && dims.indexOf(opts.dimension) !== -1 ? opts.dimension : dims[0];

  const defaults = CATEGORY_DEFAULTS[categoryId] || getUnitsForDimension(categoryId, state.dimension);
  const dimUnits = getUnitsForDimension(categoryId, state.dimension);

  state.fromId = dimUnits.indexOf(defaults[0]) !== -1 ? defaults[0] : dimUnits[0];
  state.toId =
    dimUnits.indexOf(defaults[1]) !== -1 && defaults[1] !== state.fromId
      ? defaults[1]
      : dimUnits.find((id) => id !== state.fromId) || state.fromId;

  syncCategoryChrome();
  renderDimensionField();
  renderUnitSelects();
  renderFavoriteToggle();
  runConversion({ record: false });
}

function runConversion(options) {
  const opts = options || {};
  const input = DOM['from-value'];
  const message = DOM['form-message'];
  if (!input) return;

  const raw = input.value.trim();

  if (raw === '') {
    input.classList.remove('is-invalid');
    setFormMessage(MESSAGES.empty);
    renderResult(null);
    return;
  }

  const parsed = parseNumber(raw);
  if (parsed === null) {
    input.classList.add('is-invalid');
    setFormMessage(MESSAGES.invalid);
    renderResult(null);
    return;
  }

  input.classList.remove('is-invalid');

  const outcome = convert(state.categoryId, state.fromId, state.toId, parsed);
  if (!outcome.ok) {
    setFormMessage(MESSAGES.infinite);
    renderResult(null);
    return;
  }

  if (parsed < 0 && getCategory(state.categoryId).engine !== 'temperature') {
    setFormMessage(MESSAGES.negativeNote, 'is-note');
  } else {
    setFormMessage('');
  }

  renderResult(outcome.value);

  if (opts.record !== false) {
    scheduleHistory(parsed, outcome.value);
  }
}

function swapUnits() {
  const previousFrom = state.fromId;
  state.fromId = state.toId;
  state.toId = previousFrom;

  const fromSelect = DOM['from-unit'];
  const toSelect = DOM['to-unit'];
  if (fromSelect) fromSelect.value = state.fromId;
  if (toSelect) toSelect.value = state.toId;

  const input = DOM['from-value'];
  const resultNode = DOM['result-value'];
  if (input && resultNode && state.lastResult !== null && Number.isFinite(state.lastResult)) {
    input.value = formatNumber(state.lastResult, state.precision);
  }

  renderFavoriteToggle();
  runConversion();

  const swapButton = DOM['swap-btn'];
  if (swapButton) {
    swapButton.classList.remove('spin');
    void swapButton.offsetWidth;
    swapButton.classList.add('spin');
  }
}

function clearConverter() {
  const input = DOM['from-value'];
  if (input) {
    input.value = '';
    input.classList.remove('is-invalid');
  }
  if (DOM['unit-search']) DOM['unit-search'].value = '';
  setFormMessage('');
  renderResult(null);
  clearSearchResults();
  updateSearchClearButton();
  if (input) input.focus();
}

/* ==========================================================================
   10. SEARCH
   ========================================================================== */

function buildSearchIndex() {
  const index = [];
  CATEGORIES.forEach((category) => {
    index.push({
      type: 'category',
      categoryId: category.id,
      name: category.name,
      keywords: [category.name.toLowerCase(), category.id],
    });

    getUnitIds(category.id).forEach((unitId) => {
      const unit = UNIT_REGISTRY[category.id][unitId];
      index.push({
        type: 'unit',
        categoryId: category.id,
        unitId: unitId,
        name: unit.label,
        symbol: unit.symbol,
        categoryName: category.name,
        dimension: getDimension(unitId, category.id, unit),
        keywords: [
          unit.label.toLowerCase(),
          unit.symbol.toLowerCase(),
          category.name.toLowerCase(),
        ].concat(unit.aliases.map((a) => String(a).toLowerCase())),
      });
    });
  });
  state.searchIndex = index;
}

function scoreEntry(entry, query) {
  const name = entry.name.toLowerCase();
  const symbol = entry.symbol ? entry.symbol.toLowerCase() : '';
  const aliases = entry.keywords;

  if (name === query || symbol === query) return 100;
  if (aliases.indexOf(query) !== -1) return 95;
  if (name.startsWith(query) || symbol.startsWith(query)) return 80;
  if (aliases.some((k) => k.startsWith(query))) return 70;
  if (name.includes(query) || symbol.includes(query)) return 50;
  if (aliases.some((k) => k.includes(query))) return 40;
  return 0;
}

function searchUnits(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];

  return state.searchIndex
    .map((entry) => ({ entry: entry, score: scoreEntry(entry, q) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, CONFIG.SEARCH_LIMIT)
    .map((hit) => hit.entry);
}

function clearSearchResults() {
  const list = DOM['search-results'];
  if (list) list.textContent = '';
  const empty = DOM['search-empty'];
  if (empty) empty.hidden = true;
  state.searchMatches = [];
  state.searchActiveIndex = -1;
  if (DOM['unit-search']) {
    DOM['unit-search'].setAttribute('aria-expanded', 'false');
    DOM['unit-search'].removeAttribute('aria-activedescendant');
  }
}

function updateSearchClearButton() {
  const btn = DOM['search-clear'];
  const input = DOM['unit-search'];
  if (!btn || !input) return;
  btn.hidden = input.value.length === 0;
}

function renderSearchResults(query) {
  const list = DOM['search-results'];
  const empty = DOM['search-empty'];
  const input = DOM['unit-search'];
  if (!list || !empty) return;

  const matches = searchUnits(query);
  state.searchMatches = matches;
  state.searchActiveIndex = -1;
  list.textContent = '';

  const hasQuery = String(query || '').trim().length > 0;
  empty.hidden = !hasQuery || matches.length > 0;
  if (input) input.setAttribute('aria-expanded', String(hasQuery && matches.length > 0));

  matches.forEach((entry, index) => {
    const li = document.createElement('li');
    const btn = el('button', 'search-result');
    btn.type = 'button';
    btn.id = 'search-option-' + index;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', 'false');
    btn.dataset.index = String(index);

    const main = el('span', 'search-result-main');
    main.appendChild(el('span', 'search-result-name', entry.name));
    main.appendChild(
      el(
        'span',
        'search-result-meta',
        entry.type === 'category'
          ? 'Category'
          : entry.categoryName + (entry.symbol ? ' · ' + entry.symbol : '')
      )
    );
    btn.appendChild(main);

    if (entry.type === 'unit') {
      btn.appendChild(el('span', 'search-result-sym', entry.symbol));
    }
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function highlightSearchOption(index) {
  const buttons = DOM['search-results'] ? DOM['search-results'].querySelectorAll('.search-result') : [];
  buttons.forEach((btn, i) => {
    const active = i === index;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
    if (active) btn.scrollIntoView({ block: 'nearest' });
  });
  const input = DOM['unit-search'];
  if (input && index >= 0) {
    input.setAttribute('aria-activedescendant', 'search-option-' + index);
  } else if (input) {
    input.removeAttribute('aria-activedescendant');
  }
  state.searchActiveIndex = index;
}

function applySearchMatch(entry) {
  if (!entry) return;

  if (entry.type === 'category') {
    applyCategory(entry.categoryId);
  } else {
    const dimensions = getDimensions(entry.categoryId);
    const dimension = entry.dimension;
    const unitIds = getUnitsForDimension(entry.categoryId, dimension);
    const keepTo =
      entry.categoryId === state.categoryId && getUnit(entry.categoryId, state.toId)
        ? getDimension(state.toId, entry.categoryId, getUnit(entry.categoryId, state.toId))
        : null;

    applyCategory(entry.categoryId, { dimension: dimension });

    state.fromId = entry.unitId;
    if (state.toId === state.fromId) {
      state.toId = unitIds.find((id) => id !== state.fromId) || state.fromId;
    } else if (keepTo && keepTo !== dimension) {
      state.toId = unitIds.find((id) => id !== state.fromId) || state.fromId;
    }
    renderUnitSelects();
    renderFavoriteToggle();
    runConversion({ record: false });
  }

  if (DOM['unit-search']) DOM['unit-search'].value = '';
  clearSearchResults();
  updateSearchClearButton();
  DOM['converter-card'].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ==========================================================================
   HISTORY & FAVORITES OPERATIONS
   ========================================================================== */

let historyTimer = null;

function scheduleHistory(value, result) {
  clearTimeout(historyTimer);
  historyTimer = setTimeout(() => recordHistory(value, result), CONFIG.HISTORY_DEBOUNCE_MS);
}

function recordHistory(value, result) {
  clearTimeout(historyTimer);
  const entry = {
    categoryId: state.categoryId,
    fromId: state.fromId,
    toId: state.toId,
    value: value,
    result: result,
    at: Date.now(),
  };

  const top = state.history[0];
  const duplicate =
    top &&
    top.categoryId === entry.categoryId &&
    top.fromId === entry.fromId &&
    top.toId === entry.toId &&
    top.value === entry.value;

  if (duplicate) return;

  state.history.unshift(entry);
  state.history = state.history.slice(0, CONFIG.MAX_HISTORY);
  Storage.write(CONFIG.STORAGE.HISTORY, state.history);
  renderHistory();
}

function removeHistory(index) {
  if (index < 0 || index >= state.history.length) return;
  state.history.splice(index, 1);
  Storage.write(CONFIG.STORAGE.HISTORY, state.history);
  renderHistory();
}

function clearHistory() {
  state.history = [];
  Storage.write(CONFIG.STORAGE.HISTORY, state.history);
  renderHistory();
  showToast(MESSAGES.cleared);
}

function toggleFavorite() {
  const key = favoriteKey(state.categoryId, state.fromId, state.toId);
  const existing = state.favorites.findIndex(
    (f) => favoriteKey(f.categoryId, f.fromId, f.toId) === key
  );

  if (existing >= 0) {
    state.favorites.splice(existing, 1);
    showToast(MESSAGES.removedFav);
  } else {
    state.favorites.unshift({
      categoryId: state.categoryId,
      fromId: state.fromId,
      toId: state.toId,
    });
    state.favorites = state.favorites.slice(0, CONFIG.MAX_FAVORITES);
    showToast(MESSAGES.savedFav);
  }

  Storage.write(CONFIG.STORAGE.FAVORITES, state.favorites);
  renderFavoriteToggle();
  renderFavorites();

  const btn = DOM['favorite-toggle'];
  if (btn) {
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
  }
}

function removeFavorite(index) {
  if (index < 0 || index >= state.favorites.length) return;
  state.favorites.splice(index, 1);
  Storage.write(CONFIG.STORAGE.FAVORITES, state.favorites);
  renderFavorites();
  renderFavoriteToggle();
}

function clearFavorites() {
  state.favorites = [];
  Storage.write(CONFIG.STORAGE.FAVORITES, state.favorites);
  renderFavorites();
  renderFavoriteToggle();
  showToast(MESSAGES.cleared);
}

function applyConversionRecord(entry) {
  if (!entry) return;
  applyCategory(entry.categoryId, { dimension: getDimension(entry.fromId, entry.categoryId, getUnit(entry.categoryId, entry.fromId)) });
  state.fromId = entry.fromId;
  state.toId = entry.toId;
  renderUnitSelects();
  renderFavoriteToggle();
  if (DOM['from-value']) DOM['from-value'].value = String(entry.value);
  runConversion({ record: false });
  document.getElementById('converter').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==========================================================================
   COPY
   ========================================================================== */

async function copyResult() {
  const text = DOM.equation ? DOM.equation.textContent.trim() : '';
  if (!text) {
    showToast('Nothing to copy yet.', true);
    return;
  }

  let copied = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (err) {
      copied = false;
    }
  }

  if (!copied) {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      copied = document.execCommand('copy');
      document.body.removeChild(area);
    } catch (err) {
      copied = false;
    }
  }

  showToast(copied ? MESSAGES.copied : MESSAGES.copyFailed, !copied);
}

/* ==========================================================================
   11. EVENT HANDLERS
   ========================================================================== */

function onCategoryChange(categoryId) {
  applyCategory(categoryId);
  scheduleCurrentHistory();
}

function scheduleCurrentHistory() {
  const parsed = parseNumber(DOM['from-value'] ? DOM['from-value'].value : '');
  if (parsed === null) return;
  const outcome = convert(state.categoryId, state.fromId, state.toId, parsed);
  if (outcome.ok) recordHistory(parsed, outcome.value);
}

function bindEvents() {
  /* Mobile navigation ---------------------------------------------------- */
  const navToggle = DOM['nav-toggle'];
  const siteNav = DOM['site-nav'];
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      siteNav.classList.toggle('is-open', !open);
    });

    siteNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      }
    });
  }

  /* Category navigation -------------------------------------------------- */
  if (DOM['category-nav']) {
    DOM['category-nav'].addEventListener('click', (event) => {
      const btn = event.target.closest('[data-category]');
      if (btn) onCategoryChange(btn.dataset.category);
    });
  }

  if (DOM['category-select']) {
    DOM['category-select'].addEventListener('change', (event) => {
      onCategoryChange(event.target.value);
    });
  }

  /* Dimension selector --------------------------------------------------- */
  if (DOM['dimension-select']) {
    DOM['dimension-select'].addEventListener('change', (event) => {
      const unitIds = getUnitsForDimension(state.categoryId, event.target.value);
      state.dimension = event.target.value;
      state.fromId = unitIds[0];
      state.toId = unitIds.find((id) => id !== state.fromId) || unitIds[0];
      renderUnitSelects();
      renderFavoriteToggle();
      runConversion();
    });
  }

  /* Unit selectors ------------------------------------------------------- */
  if (DOM['from-unit']) {
    DOM['from-unit'].addEventListener('change', (event) => {
      state.fromId = event.target.value;
      if (state.toId === state.fromId) {
        const unitIds = getUnitsForDimension(state.categoryId, state.dimension);
        state.toId = unitIds.find((id) => id !== state.fromId) || state.fromId;
        DOM['to-unit'].value = state.toId;
      }
      renderFavoriteToggle();
      runConversion();
    });
  }

  if (DOM['to-unit']) {
    DOM['to-unit'].addEventListener('change', (event) => {
      state.toId = event.target.value;
      if (state.toId === state.fromId) {
        const unitIds = getUnitsForDimension(state.categoryId, state.dimension);
        state.fromId = unitIds.find((id) => id !== state.toId) || state.toId;
        DOM['from-unit'].value = state.fromId;
      }
      renderFavoriteToggle();
      runConversion();
    });
  }

  /* Input ---------------------------------------------------------------- */
  if (DOM['from-value']) {
    DOM['from-value'].addEventListener('input', () => runConversion());
    DOM['from-value'].addEventListener('blur', () => {
      const parsed = parseNumber(DOM['from-value'].value);
      if (parsed !== null) scheduleCurrentHistory();
    });
  }

  /* Buttons -------------------------------------------------------------- */
  if (DOM['convert-btn']) {
    DOM['convert-btn'].addEventListener('click', () => {
      runConversion();
      scheduleCurrentHistory();
    });
  }

  [DOM['swap-btn'], DOM['swap-btn-2']].forEach((btn) => {
    if (btn) btn.addEventListener('click', swapUnits);
  });

  if (DOM['clear-btn']) DOM['clear-btn'].addEventListener('click', clearConverter);
  if (DOM['copy-btn']) DOM['copy-btn'].addEventListener('click', copyResult);

  if (DOM['precision-select']) {
    DOM['precision-select'].addEventListener('change', (event) => {
      state.precision = Number(event.target.value);
      Storage.write(CONFIG.STORAGE.PRECISION, state.precision);
      runConversion({ record: false });
      renderHistory();
    });
  }

  if (DOM['favorite-toggle']) DOM['favorite-toggle'].addEventListener('click', toggleFavorite);

  /* Popular conversions --------------------------------------------------- */
  if (DOM['popular-list']) {
    DOM['popular-list'].addEventListener('click', (event) => {
      const chip = event.target.closest('[data-category]');
      if (!chip) return;
      applyCategory(chip.dataset.category);
      state.fromId = chip.dataset.from;
      state.toId = chip.dataset.to;
      renderUnitSelects();
      renderFavoriteToggle();
      DOM['from-value'].value = chip.dataset.value;
      runConversion();
      scheduleCurrentHistory();
      DOM['converter-card'].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* Search ---------------------------------------------------------------- */
  const searchInput = DOM['unit-search'];
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      updateSearchClearButton();
      renderSearchResults(event.target.value);
    });

    searchInput.addEventListener('keydown', (event) => {
      const count = state.searchMatches.length;
      if (event.key === 'ArrowDown' && count) {
        event.preventDefault();
        highlightSearchOption((state.searchActiveIndex + 1) % count);
      } else if (event.key === 'ArrowUp' && count) {
        event.preventDefault();
        highlightSearchOption(
          state.searchActiveIndex <= 0 ? count - 1 : state.searchActiveIndex - 1
        );
      } else if (event.key === 'Enter') {
        if (state.searchActiveIndex >= 0 && state.searchMatches[state.searchActiveIndex]) {
          event.preventDefault();
          applySearchMatch(state.searchMatches[state.searchActiveIndex]);
        } else if (count) {
          event.preventDefault();
          applySearchMatch(state.searchMatches[0]);
        }
      } else if (event.key === 'Escape') {
        event.stopPropagation();
        searchInput.value = '';
        updateSearchClearButton();
        clearSearchResults();
      }
    });
  }

  if (DOM['search-clear']) {
    DOM['search-clear'].addEventListener('click', () => {
      DOM['unit-search'].value = '';
      updateSearchClearButton();
      clearSearchResults();
      DOM['unit-search'].focus();
    });
  }

  if (DOM['search-results']) {
    DOM['search-results'].addEventListener('click', (event) => {
      const btn = event.target.closest('[data-index]');
      if (!btn) return;
      applySearchMatch(state.searchMatches[Number(btn.dataset.index)]);
    });
  }

  /* History ---------------------------------------------------------------- */
  if (DOM['history-list']) {
    DOM['history-list'].addEventListener('click', (event) => {
      const remove = event.target.closest('[data-remove-history]');
      if (remove) {
        removeHistory(Number(remove.dataset.removeHistory));
        return;
      }
      const load = event.target.closest('[data-index]');
      if (load) applyConversionRecord(state.history[Number(load.dataset.index)]);
    });
  }

  if (DOM['clear-history']) DOM['clear-history'].addEventListener('click', clearHistory);

  /* Favorites --------------------------------------------------------------- */
  if (DOM['favorites-list']) {
    DOM['favorites-list'].addEventListener('click', (event) => {
      const remove = event.target.closest('[data-remove-favorite]');
      if (remove) {
        removeFavorite(Number(remove.dataset.removeFavorite));
        return;
      }
      const load = event.target.closest('[data-fav-index]');
      if (load) {
        const entry = state.favorites[Number(load.dataset.favIndex)];
        applyConversionRecord({ ...entry, value: 1 });
      }
    });
  }

  if (DOM['clear-favorites']) DOM['clear-favorites'].addEventListener('click', clearFavorites);

  /* Keyboard shortcuts ------------------------------------------------------ */
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTextField =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'S' || event.key === 's')) {
      event.preventDefault();
      swapUnits();
      return;
    }

    if (event.key === 'Escape') {
      if (target === DOM['unit-search']) return; // handled by the search box
      if (target instanceof HTMLSelectElement) return; // keep native dropdown behaviour
      event.preventDefault();
      clearConverter();
      return;
    }

    if (event.key === 'Enter' && DOM['converter-card'] && DOM['converter-card'].contains(target)) {
      if (target instanceof HTMLButtonElement) return;
      event.preventDefault();
      runConversion();
      scheduleCurrentHistory();
    }
  });

  /* Scroll spy ---------------------------------------------------------------- */
  if ('IntersectionObserver' in window && DOM.sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setActiveNav(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    DOM.sections.forEach((section) => observer.observe(section));
  }
}

function setActiveNav(sectionId) {
  DOM.navLinks.forEach((link) => {
    const active = link.dataset.nav === sectionId;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

/* ==========================================================================
   12. INITIALIZATION
   ========================================================================== */

function loadPreferences() {
  const storedPrecision = Storage.read(CONFIG.STORAGE.PRECISION, null);
  if (
    Number.isInteger(storedPrecision) &&
    CONFIG.PRECISION_OPTIONS.indexOf(storedPrecision) !== -1
  ) {
    state.precision = storedPrecision;
  }
  state.history = sanitizeHistory(Storage.read(CONFIG.STORAGE.HISTORY, []));
  state.favorites = sanitizeFavorites(Storage.read(CONFIG.STORAGE.FAVORITES, []));
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!window.isSecureContext) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* offline support is a progressive enhancement — ignore failures */
    });
  });
}

function init() {
  cacheDom();
  loadPreferences();
  buildSearchIndex();

  renderCategoryNav();
  renderCategorySelect();
  renderPrecisionOptions();
  renderPopular();

  state.history = sanitizeHistory(state.history);
  state.favorites = sanitizeFavorites(state.favorites);

  applyCategory('length');
  renderHistory();
  renderFavorites();
  updateSearchClearButton();
  bindEvents();
  setActiveNav('home');
  registerServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
