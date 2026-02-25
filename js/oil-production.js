// ============================================================
// Global Oil Production Forecasting Model
// ============================================================

// --- CORE DATA: Historical + Estimated Production (million bbl/day) ---
// Sources: EIA, IEA, OPEC Monthly Reports, Rystad Energy
// Last updated: February 2026

const OIL_DATA = {
  lastUpdated: "2026-02-25",
  updateLog: [],
  priceAssumptions: {
    low:  { label: "Bear ($45–55)", prices: { 2020:40, 2021:55, 2022:75, 2023:65, 2024:55, 2025:50, 2026:48, 2027:45, 2028:45 } },
    base: { label: "Base ($65–80)", prices: { 2020:40, 2021:68, 2022:95, 2023:78, 2024:75, 2025:72, 2026:70, 2027:68, 2028:65 } },
    high: { label: "Bull ($90–110)", prices: { 2020:40, 2021:68, 2022:95, 2023:82, 2024:80, 2025:85, 2026:95, 2027:100, 2028:110 } }
  },

  // Country-level data: base scenario production (mb/d)
  // For each country: historical actuals (2020-2024), estimates (2025-2028)
  countries: {
    "United States": {
      flag: "🇺🇸",
      declineRate: 0.06,
      actuals: { 2020: 11.28, 2021: 11.19, 2022: 11.89, 2023: 12.93, 2024: 13.20 },
      baseEstimates: { 2025: 13.50, 2026: 13.70, 2027: 13.80, 2028: 13.85 },
      lowDelta:  { 2025: -0.10, 2026: -0.30, 2027: -0.55, 2028: -0.80 },
      highDelta: { 2025: 0.10, 2026: 0.25, 2027: 0.45, 2028: 0.65 },
      majorProjects: [
        { name: "Permian Basin (Midland + Delaware)", type: "Tight Oil", status: "Producing", peakAdd: "~1.0 mb/d growth since 2020", notes: "Growth slowing as Tier 1 inventory depletes; DUC count declining" },
        { name: "Gulf of Mexico Deepwater", type: "Offshore", status: "Producing", peakAdd: "~1.8 mb/d total", notes: "Anchor, Whale, Vito projects ramping 2024-2026" },
        { name: "Bakken (Williston Basin)", type: "Tight Oil", status: "Producing", peakAdd: "~1.1 mb/d plateau", notes: "Mature basin; holding flat with improved completions" }
      ]
    },
    "Saudi Arabia": {
      flag: "🇸🇦",
      declineRate: 0.03,
      actuals: { 2020: 9.21, 2021: 9.11, 2022: 10.53, 2023: 9.96, 2024: 9.00 },
      baseEstimates: { 2025: 9.00, 2026: 9.20, 2027: 9.50, 2028: 10.00 },
      lowDelta:  { 2025: 0.00, 2026: -0.30, 2027: -0.50, 2028: -0.80 },
      highDelta: { 2025: 0.30, 2026: 0.60, 2027: 1.00, 2028: 1.50 },
      majorProjects: [
        { name: "Jafurah Gas Field", type: "Gas/Condensate", status: "Developing", peakAdd: "0.2 mb/d condensate by 2030", notes: "Unconventional gas; $100B+ investment" },
        { name: "Spare Capacity Deployment", type: "Conventional", status: "Available", peakAdd: "Up to 12.0 mb/d capacity", notes: "OPEC+ cuts keeping ~2-3 mb/d offline; policy-driven" }
      ]
    },
    "Russia": {
      flag: "🇷🇺",
      declineRate: 0.04,
      actuals: { 2020: 9.86, 2021: 9.60, 2022: 9.90, 2023: 9.56, 2024: 9.20 },
      baseEstimates: { 2025: 9.10, 2026: 9.00, 2027: 8.85, 2028: 8.70 },
      lowDelta:  { 2025: -0.15, 2026: -0.30, 2027: -0.50, 2028: -0.70 },
      highDelta: { 2025: 0.10, 2026: 0.15, 2027: 0.20, 2028: 0.20 },
      majorProjects: [
        { name: "Vostok Oil (Taymyr)", type: "Arctic Onshore", status: "Developing", peakAdd: "Target 0.5 mb/d by 2030", notes: "Rosneft flagship; sanctions slowing Western tech access" },
        { name: "West Siberia Brownfields", type: "Conventional", status: "Producing", peakAdd: "Declining ~3-5%/yr", notes: "Mature fields requiring increasing EOR investment" }
      ]
    },
    "Canada": {
      flag: "🇨🇦",
      declineRate: 0.05,
      actuals: { 2020: 4.60, 2021: 4.69, 2022: 4.90, 2023: 5.00, 2024: 5.15 },
      baseEstimates: { 2025: 5.25, 2026: 5.35, 2027: 5.40, 2028: 5.45 },
      lowDelta:  { 2025: -0.05, 2026: -0.15, 2027: -0.25, 2028: -0.35 },
      highDelta: { 2025: 0.05, 2026: 0.15, 2027: 0.25, 2028: 0.30 },
      majorProjects: [
        { name: "TMX Pipeline (operational May 2024)", type: "Infrastructure", status: "Operational", peakAdd: "Unlocks 590 kb/d export capacity", notes: "Reduces WCS-WTI discount; incentivizes incremental oilsands" },
        { name: "Pathways Alliance / Oilsands CCS", type: "Oil Sands", status: "Developing", peakAdd: "Sustains 3.0+ mb/d oilsands", notes: "Carbon capture to extend oilsands viability" }
      ]
    },
    "Iraq": {
      flag: "🇮🇶",
      declineRate: 0.03,
      actuals: { 2020: 4.02, 2021: 4.10, 2022: 4.45, 2023: 4.30, 2024: 4.25 },
      baseEstimates: { 2025: 4.30, 2026: 4.40, 2027: 4.50, 2028: 4.60 },
      lowDelta:  { 2025: -0.05, 2026: -0.10, 2027: -0.15, 2028: -0.25 },
      highDelta: { 2025: 0.10, 2026: 0.20, 2027: 0.35, 2028: 0.50 },
      majorProjects: [
        { name: "Rumaila Redevelopment", type: "Conventional", status: "Producing", peakAdd: "Sustain ~1.4 mb/d", notes: "bp-operated; water injection expansion" },
        { name: "West Qurna 2", type: "Conventional", status: "Producing", peakAdd: "~0.4 mb/d", notes: "Lukoil-operated; expansion phases" },
        { name: "TotalEnergies Gas Growth Integrated (GGIP)", type: "Gas/Oil", status: "Developing", peakAdd: "+0.1 mb/d associated oil", notes: "Flared gas capture project, southern Iraq" }
      ]
    },
    "China": {
      flag: "🇨🇳",
      declineRate: 0.04,
      actuals: { 2020: 3.90, 2021: 3.99, 2022: 4.11, 2023: 4.19, 2024: 4.22 },
      baseEstimates: { 2025: 4.20, 2026: 4.18, 2027: 4.15, 2028: 4.10 },
      lowDelta:  { 2025: -0.05, 2026: -0.10, 2027: -0.15, 2028: -0.20 },
      highDelta: { 2025: 0.03, 2026: 0.05, 2027: 0.08, 2028: 0.10 },
      majorProjects: [
        { name: "CNOOC Offshore Expansion", type: "Offshore", status: "Producing", peakAdd: "Target maintain 4+ mb/d", notes: "South China Sea, Bohai Bay; offsetting onshore decline" },
        { name: "Changqing / Daqing EOR", type: "EOR", status: "Producing", peakAdd: "Slowing onshore decline", notes: "Mature fields with aggressive EOR programs" }
      ]
    },
    "UAE": {
      flag: "🇦🇪",
      declineRate: 0.03,
      actuals: { 2020: 3.50, 2021: 3.09, 2022: 3.40, 2023: 3.30, 2024: 3.25 },
      baseEstimates: { 2025: 3.30, 2026: 3.45, 2027: 3.60, 2028: 3.80 },
      lowDelta:  { 2025: -0.05, 2026: -0.10, 2027: -0.15, 2028: -0.30 },
      highDelta: { 2025: 0.10, 2026: 0.25, 2027: 0.45, 2028: 0.70 },
      majorProjects: [
        { name: "ADNOC 5 mb/d Capacity Target", type: "Conventional", status: "Developing", peakAdd: "5.0 mb/d by 2027", notes: "Upper Zakum, Dalma, offshore expansion; currently 4.85 mb/d capacity" },
        { name: "Hail & Ghasha Sour Gas", type: "Gas/Condensate", status: "Developing", peakAdd: "~0.12 mb/d condensate", notes: "Offshore sour gas mega-project" }
      ]
    },
    "Brazil": {
      flag: "🇧🇷",
      declineRate: 0.05,
      actuals: { 2020: 2.94, 2021: 2.91, 2022: 3.11, 2023: 3.40, 2024: 3.45 },
      baseEstimates: { 2025: 3.55, 2026: 3.70, 2027: 3.90, 2028: 4.10 },
      lowDelta:  { 2025: -0.05, 2026: -0.10, 2027: -0.20, 2028: -0.30 },
      highDelta: { 2025: 0.05, 2026: 0.15, 2027: 0.25, 2028: 0.40 },
      majorProjects: [
        { name: "Búzios (Franco) FPSO Ramp-ups", type: "Pre-Salt Deepwater", status: "Producing", peakAdd: "2.0+ mb/d at peak", notes: "Multiple FPSOs: Almirante Barroso (2023), Almirante Tamandaré (2025)" },
        { name: "Mero (Libra NW) FPSOs", type: "Pre-Salt Deepwater", status: "Producing", peakAdd: "~0.6 mb/d at peak", notes: "FPSO Sepetiba (2023), FPSO 3 (2025), FPSO 4 (2027)" },
        { name: "Tupi (Lula) Sustaining", type: "Pre-Salt Deepwater", status: "Producing", peakAdd: "~1.0 mb/d plateau", notes: "Mature pre-salt; FPSOs P-67, P-68 maintaining" },
        { name: "Atapu / Sépia", type: "Pre-Salt Deepwater", status: "Developing", peakAdd: "+0.3 mb/d combined", notes: "Transfer-of-rights surplus volumes" }
      ]
    },
    "Kuwait": {
      flag: "🇰🇼",
      declineRate: 0.03,
      actuals: { 2020: 2.44, 2021: 2.42, 2022: 2.70, 2023: 2.55, 2024: 2.41 },
      baseEstimates: { 2025: 2.45, 2026: 2.50, 2027: 2.55, 2028: 2.60 },
      lowDelta:  { 2025: 0.00, 2026: -0.05, 2027: -0.10, 2028: -0.15 },
      highDelta: { 2025: 0.05, 2026: 0.10, 2027: 0.15, 2028: 0.25 },
      majorProjects: [
        { name: "Al-Zour Refinery / Heavy Oil", type: "Heavy Oil", status: "Developing", peakAdd: "Sustain 2.8 mb/d capacity", notes: "Lower Burgan heavy oil development" }
      ]
    },
    "Iran": {
      flag: "🇮🇷",
      declineRate: 0.04,
      actuals: { 2020: 1.99, 2021: 2.39, 2022: 2.55, 2023: 3.15, 2024: 3.30 },
      baseEstimates: { 2025: 3.35, 2026: 3.30, 2027: 3.25, 2028: 3.20 },
      lowDelta:  { 2025: -0.30, 2026: -0.50, 2027: -0.60, 2028: -0.70 },
      highDelta: { 2025: 0.15, 2026: 0.30, 2027: 0.45, 2028: 0.60 },
      majorProjects: [
        { name: "South Pars Condensate", type: "Gas/Condensate", status: "Producing", peakAdd: "~0.4 mb/d condensate", notes: "Sanctions risk; output sensitive to enforcement" },
        { name: "West Karun Fields", type: "Conventional", status: "Producing", peakAdd: "~0.3 mb/d combined", notes: "Yadavaran, Azadegan; investment-constrained" }
      ]
    },
    "Norway": {
      flag: "🇳🇴",
      declineRate: 0.06,
      actuals: { 2020: 1.73, 2021: 1.77, 2022: 1.84, 2023: 1.82, 2024: 1.85 },
      baseEstimates: { 2025: 1.90, 2026: 1.92, 2027: 1.88, 2028: 1.82 },
      lowDelta:  { 2025: -0.03, 2026: -0.08, 2027: -0.12, 2028: -0.18 },
      highDelta: { 2025: 0.02, 2026: 0.05, 2027: 0.08, 2028: 0.10 },
      majorProjects: [
        { name: "Johan Sverdrup Phase 2", type: "Offshore", status: "Producing", peakAdd: "0.72 mb/d total field peak", notes: "Phase 2 online Dec 2023; peak production reached" },
        { name: "Johan Castberg", type: "Arctic Offshore", status: "Producing", peakAdd: "0.19 mb/d peak", notes: "First oil late 2024; Barents Sea" },
        { name: "Aker BP / Yggdrasil", type: "Offshore", status: "Developing", peakAdd: "0.25 mb/d peak by 2027", notes: "Formerly NOAKA; multiple fields tied back" }
      ]
    },
    "Libya": {
      flag: "🇱🇾",
      declineRate: 0.05,
      actuals: { 2020: 0.37, 2021: 1.14, 2022: 1.16, 2023: 1.18, 2024: 1.15 },
      baseEstimates: { 2025: 1.10, 2026: 1.05, 2027: 1.00, 2028: 0.95 },
      lowDelta:  { 2025: -0.20, 2026: -0.30, 2027: -0.35, 2028: -0.40 },
      highDelta: { 2025: 0.10, 2026: 0.15, 2027: 0.20, 2028: 0.25 },
      majorProjects: [
        { name: "Sharara / El-Feel Stabilization", type: "Conventional", status: "Producing", peakAdd: "Sustain ~0.3 mb/d each", notes: "Frequent disruptions from political instability" }
      ]
    },
    "Nigeria": {
      flag: "🇳🇬",
      declineRate: 0.06,
      actuals: { 2020: 1.49, 2021: 1.32, 2022: 1.21, 2023: 1.28, 2024: 1.42 },
      baseEstimates: { 2025: 1.50, 2026: 1.55, 2027: 1.58, 2028: 1.55 },
      lowDelta:  { 2025: -0.10, 2026: -0.15, 2027: -0.20, 2028: -0.25 },
      highDelta: { 2025: 0.08, 2026: 0.15, 2027: 0.20, 2028: 0.25 },
      majorProjects: [
        { name: "Bonga Southwest / Aparo", type: "Deepwater", status: "Developing", peakAdd: "0.15 mb/d", notes: "Shell-operated; FID pending" },
        { name: "Dangote Refinery Linkage", type: "Infrastructure", status: "Operational", peakAdd: "Domestic demand pull", notes: "650 kb/d refinery stimulating local crude demand" }
      ]
    },
    "Kazakhstan": {
      flag: "🇰🇿",
      declineRate: 0.04,
      actuals: { 2020: 1.76, 2021: 1.76, 2022: 1.77, 2023: 1.83, 2024: 1.85 },
      baseEstimates: { 2025: 1.88, 2026: 1.95, 2027: 2.05, 2028: 2.10 },
      lowDelta:  { 2025: -0.03, 2026: -0.08, 2027: -0.12, 2028: -0.18 },
      highDelta: { 2025: 0.05, 2026: 0.10, 2027: 0.15, 2028: 0.20 },
      majorProjects: [
        { name: "Tengiz FGP (Future Growth Project)", type: "Onshore/Sour", status: "Developing", peakAdd: "+0.26 mb/d incremental", notes: "Chevron-led TCO; startup mid-2025, ramp through 2027; $48B total cost" },
        { name: "Kashagan Phase 2 Studies", type: "Offshore Caspian", status: "Evaluating", peakAdd: "+0.2 mb/d potential", notes: "Phase 2 expansion repeatedly delayed; sour gas complexity" }
      ]
    },
    "Guyana": {
      flag: "🇬🇾",
      declineRate: 0.00,
      actuals: { 2020: 0.02, 2021: 0.10, 2022: 0.28, 2023: 0.39, 2024: 0.65 },
      baseEstimates: { 2025: 0.80, 2026: 1.00, 2027: 1.20, 2028: 1.40 },
      lowDelta:  { 2025: -0.03, 2026: -0.05, 2027: -0.10, 2028: -0.15 },
      highDelta: { 2025: 0.02, 2026: 0.05, 2027: 0.10, 2028: 0.15 },
      majorProjects: [
        { name: "Liza Phase 1 (Destiny FPSO)", type: "Deepwater", status: "Producing", peakAdd: "0.12 mb/d", notes: "ExxonMobil-operated; online Dec 2019" },
        { name: "Liza Phase 2 (Unity FPSO)", type: "Deepwater", status: "Producing", peakAdd: "0.22 mb/d", notes: "Online Feb 2022; ramped to nameplate" },
        { name: "Payara (Prosperity FPSO)", type: "Deepwater", status: "Producing", peakAdd: "0.22 mb/d", notes: "Online Nov 2023; Stabroek Block" },
        { name: "Yellowtail (One Guyana FPSO)", type: "Deepwater", status: "Developing", peakAdd: "0.25 mb/d", notes: "Expected first oil Q1 2026; largest FPSO" },
        { name: "Uaru (FPSO #5)", type: "Deepwater", status: "Developing", peakAdd: "0.25 mb/d", notes: "Sanctioned 2023; first oil ~2028" },
        { name: "Whiptail (FPSO #6)", type: "Deepwater", status: "Evaluating", peakAdd: "0.25 mb/d potential", notes: "FID expected 2025; first oil ~2029" }
      ]
    },
    "Mexico": {
      flag: "🇲🇽",
      declineRate: 0.07,
      actuals: { 2020: 1.69, 2021: 1.68, 2022: 1.65, 2023: 1.60, 2024: 1.53 },
      baseEstimates: { 2025: 1.48, 2026: 1.42, 2027: 1.38, 2028: 1.35 },
      lowDelta:  { 2025: -0.05, 2026: -0.10, 2027: -0.15, 2028: -0.20 },
      highDelta: { 2025: 0.02, 2026: 0.05, 2027: 0.08, 2028: 0.10 },
      majorProjects: [
        { name: "Olmeca (Dos Bocas) Refinery", type: "Infrastructure", status: "Ramping", peakAdd: "340 kb/d refining", notes: "Domestic processing; not new production" },
        { name: "Pemex Ku-Maloob-Zaap Complex", type: "Offshore", status: "Producing", peakAdd: "Declining from 0.8 mb/d", notes: "Heavy oil decline; limited new investment under Pemex budget constraints" }
      ]
    },
    "Angola": {
      flag: "🇦🇴",
      declineRate: 0.08,
      actuals: { 2020: 1.22, 2021: 1.12, 2022: 1.16, 2023: 1.11, 2024: 1.08 },
      baseEstimates: { 2025: 1.05, 2026: 1.02, 2027: 0.98, 2028: 0.95 },
      lowDelta:  { 2025: -0.03, 2026: -0.06, 2027: -0.10, 2028: -0.15 },
      highDelta: { 2025: 0.03, 2026: 0.05, 2027: 0.08, 2028: 0.10 },
      majorProjects: [
        { name: "Agogo (Block 15/06)", type: "Deepwater", status: "Producing", peakAdd: "~0.05 mb/d", notes: "Eni-operated; fast-track tiebacks" },
        { name: "Begonia / Camelia Tiebacks", type: "Deepwater", status: "Developing", peakAdd: "~0.04 mb/d", notes: "Small tiebacks to offset decline" }
      ]
    },
    "Algeria": {
      flag: "🇩🇿",
      declineRate: 0.04,
      actuals: { 2020: 0.90, 2021: 0.91, 2022: 0.97, 2023: 0.96, 2024: 0.95 },
      baseEstimates: { 2025: 0.94, 2026: 0.92, 2027: 0.90, 2028: 0.88 },
      lowDelta:  { 2025: -0.02, 2026: -0.04, 2027: -0.06, 2028: -0.08 },
      highDelta: { 2025: 0.02, 2026: 0.03, 2027: 0.04, 2028: 0.05 },
      majorProjects: [
        { name: "Hassi Messaoud EOR", type: "EOR", status: "Producing", peakAdd: "Sustain ~0.25 mb/d", notes: "Sonatrach giant field; steam/CO2 injection" }
      ]
    },
    "Oman": {
      flag: "🇴🇲",
      declineRate: 0.04,
      actuals: { 2020: 0.95, 2021: 0.97, 2022: 1.04, 2023: 1.05, 2024: 1.05 },
      baseEstimates: { 2025: 1.05, 2026: 1.04, 2027: 1.03, 2028: 1.02 },
      lowDelta:  { 2025: -0.02, 2026: -0.03, 2027: -0.05, 2028: -0.07 },
      highDelta: { 2025: 0.02, 2026: 0.03, 2027: 0.05, 2028: 0.06 },
      majorProjects: [
        { name: "Block 6 (PDO) EOR / Polymer Flood", type: "EOR", status: "Producing", peakAdd: "Sustain ~0.6 mb/d", notes: "PDO/Shell; Miraah solar EOR" }
      ]
    },
    "United Kingdom": {
      flag: "🇬🇧",
      declineRate: 0.08,
      actuals: { 2020: 0.95, 2021: 0.83, 2022: 0.78, 2023: 0.73, 2024: 0.68 },
      baseEstimates: { 2025: 0.65, 2026: 0.62, 2027: 0.58, 2028: 0.55 },
      lowDelta:  { 2025: -0.03, 2026: -0.05, 2027: -0.07, 2028: -0.10 },
      highDelta: { 2025: 0.02, 2026: 0.03, 2027: 0.04, 2028: 0.05 },
      majorProjects: [
        { name: "Rosebank (Equinor)", type: "Offshore", status: "Developing", peakAdd: "0.07 mb/d peak", notes: "West of Shetland; first oil ~2027; controversial permitting" },
        { name: "Cambo (Ithaca / Equinor)", type: "Offshore", status: "Evaluating", peakAdd: "0.05 mb/d potential", notes: "West of Shetland; FID uncertain amid policy headwinds" }
      ]
    }
  }
};

// ============================================================
// SCENARIO ENGINE
// ============================================================

function getProduction(country, year, scenario) {
  const c = OIL_DATA.countries[country];
  if (!c) return null;
  
  // Actual historical data
  if (c.actuals[year] !== undefined) return c.actuals[year];
  
  // Base estimates + scenario delta
  const base = c.baseEstimates[year];
  if (base === undefined) return null;
  
  if (scenario === "low") return +(base + (c.lowDelta[year] || 0)).toFixed(2);
  if (scenario === "high") return +(base + (c.highDelta[year] || 0)).toFixed(2);
  return +base.toFixed(2);
}

function getWorldTotal(year, scenario) {
  let total = 0;
  for (const country of Object.keys(OIL_DATA.countries)) {
    const val = getProduction(country, year, scenario);
    if (val !== null) total += val;
  }
  return +total.toFixed(2);
}

function getYoYChange(country, year, scenario) {
  const curr = getProduction(country, year, scenario);
  const prev = getProduction(country, year - 1, scenario);
  if (curr === null || prev === null) return null;
  return +(curr - prev).toFixed(2);
}

function getYoYChangePct(country, year, scenario) {
  const curr = getProduction(country, year, scenario);
  const prev = getProduction(country, year - 1, scenario);
  if (curr === null || prev === null || prev === 0) return null;
  return +(((curr - prev) / prev) * 100).toFixed(1);
}

// ============================================================
// UI RENDERING
// ============================================================

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];
const ACTUAL_CUTOFF = 2024; // years <= this are historical

let currentScenario = "base";
let sortColumn = null;
let sortAscending = true;
let expandedCountries = new Set();
let showChangeMode = false; // false = absolute, true = YoY change

function init() {
  renderControls();
  renderTable();
  renderProjects();
  renderDeclineRates();
  renderUpdateSection();
  renderScenarioComparison();
  bindEvents();
}

function renderControls() {
  const controls = document.getElementById("oil-controls");
  controls.innerHTML = `
    <div class="oil-controls-row">
      <div class="oil-control-group">
        <label>Price Scenario:</label>
        <div class="oil-scenario-buttons">
          <button class="oil-scenario-btn ${currentScenario === 'low' ? 'active' : ''}" data-scenario="low">
            ${OIL_DATA.priceAssumptions.low.label}
          </button>
          <button class="oil-scenario-btn ${currentScenario === 'base' ? 'active' : ''}" data-scenario="base">
            ${OIL_DATA.priceAssumptions.base.label}
          </button>
          <button class="oil-scenario-btn ${currentScenario === 'high' ? 'active' : ''}" data-scenario="high">
            ${OIL_DATA.priceAssumptions.high.label}
          </button>
        </div>
      </div>
      <div class="oil-control-group">
        <label>Display:</label>
        <div class="oil-scenario-buttons">
          <button class="oil-display-btn ${!showChangeMode ? 'active' : ''}" data-mode="absolute">Production (mb/d)</button>
          <button class="oil-display-btn ${showChangeMode ? 'active' : ''}" data-mode="change">YoY Change</button>
        </div>
      </div>
    </div>
    <div class="oil-price-strip">
      ${YEARS.map(y => `<span class="oil-price-tag">${y}: $${OIL_DATA.priceAssumptions[currentScenario].prices[y]}/bbl</span>`).join("")}
    </div>
  `;
}

function renderTable() {
  const container = document.getElementById("oil-table-container");
  const countries = Object.keys(OIL_DATA.countries);
  
  // Sort
  let sortedCountries = [...countries];
  if (sortColumn !== null) {
    sortedCountries.sort((a, b) => {
      let va, vb;
      if (sortColumn === "country") {
        va = a; vb = b;
        return sortAscending ? va.localeCompare(vb) : vb.localeCompare(va);
      } else if (sortColumn === "decline") {
        va = OIL_DATA.countries[a].declineRate;
        vb = OIL_DATA.countries[b].declineRate;
      } else {
        const year = parseInt(sortColumn);
        va = getProduction(a, year, currentScenario) || 0;
        vb = getProduction(b, year, currentScenario) || 0;
      }
      return sortAscending ? va - vb : vb - va;
    });
  } else {
    // Default: sort by 2024 production descending
    sortedCountries.sort((a, b) => {
      return (getProduction(b, 2024, currentScenario) || 0) - (getProduction(a, 2024, currentScenario) || 0);
    });
  }

  let html = `<div class="oil-table-scroll"><table class="oil-table">
    <thead>
      <tr>
        <th class="oil-th-country sortable" data-sort="country">Country</th>
        <th class="oil-th-decline sortable" data-sort="decline">Decline Rate</th>
        ${YEARS.map(y => `<th class="sortable ${y > ACTUAL_CUTOFF ? 'oil-th-estimate' : 'oil-th-actual'}" data-sort="${y}">${y}${y > ACTUAL_CUTOFF ? '*' : ''}</th>`).join("")}
      </tr>
    </thead>
    <tbody>`;

  for (const country of sortedCountries) {
    const c = OIL_DATA.countries[country];
    const isExpanded = expandedCountries.has(country);
    
    html += `<tr class="oil-country-row" data-country="${country}">
      <td class="oil-td-country">
        <span class="oil-expand-toggle">${isExpanded ? '▾' : '▸'}</span>
        <span class="oil-flag">${c.flag}</span> ${country}
      </td>
      <td class="oil-td-decline">${(c.declineRate * 100).toFixed(0)}%/yr</td>`;

    for (const y of YEARS) {
      const val = getProduction(country, y, currentScenario);
      const change = getYoYChange(country, y, currentScenario);
      const changePct = getYoYChangePct(country, y, currentScenario);
      const isEstimate = y > ACTUAL_CUTOFF;
      
      let cellClass = isEstimate ? "oil-td-estimate" : "oil-td-actual";
      let displayVal, changeIndicator = "";
      
      if (showChangeMode && y > 2020) {
        displayVal = change !== null ? (change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)) : "—";
        if (change !== null) {
          cellClass += change > 0 ? " oil-positive" : change < 0 ? " oil-negative" : "";
          changeIndicator = `<span class="oil-change-pct">${changePct >= 0 ? '+' : ''}${changePct}%</span>`;
        }
      } else {
        displayVal = val !== null ? val.toFixed(2) : "—";
        if (y > 2020 && change !== null) {
          changeIndicator = `<span class="oil-mini-change ${change > 0 ? 'oil-positive' : change < 0 ? 'oil-negative' : ''}">${change >= 0 ? '▲' : '▼'}${Math.abs(change).toFixed(2)}</span>`;
        }
      }
      
      html += `<td class="${cellClass}" data-country="${country}" data-year="${y}">
        <span class="oil-val">${displayVal}</span>
        ${changeIndicator}
      </td>`;
    }
    html += `</tr>`;
    
    // Expanded project details
    if (isExpanded) {
      const projCount = c.majorProjects.length;
      html += `<tr class="oil-project-row"><td colspan="${YEARS.length + 2}">
        <div class="oil-projects-inline">
          <table class="oil-project-table">
            <thead><tr><th>Project</th><th>Type</th><th>Status</th><th>Peak/Addition</th><th>Notes</th></tr></thead>
            <tbody>`;
      for (const p of c.majorProjects) {
        const statusClass = p.status === "Producing" ? "oil-status-producing" : 
                           p.status === "Developing" ? "oil-status-developing" : "oil-status-evaluating";
        html += `<tr>
          <td class="oil-proj-name">${p.name}</td>
          <td>${p.type}</td>
          <td><span class="oil-status-badge ${statusClass}">${p.status}</span></td>
          <td>${p.peakAdd}</td>
          <td class="oil-proj-notes">${p.notes}</td>
        </tr>`;
      }
      html += `</tbody></table></div></td></tr>`;
    }
  }

  // World total row
  html += `<tr class="oil-total-row">
    <td class="oil-td-country"><strong>WORLD TOTAL (listed)</strong></td>
    <td class="oil-td-decline">—</td>`;
  for (const y of YEARS) {
    const total = getWorldTotal(y, currentScenario);
    const prevTotal = y > 2020 ? getWorldTotal(y - 1, currentScenario) : null;
    const change = prevTotal !== null ? +(total - prevTotal).toFixed(2) : null;
    const isEstimate = y > ACTUAL_CUTOFF;
    
    let cellClass = isEstimate ? "oil-td-estimate" : "oil-td-actual";
    
    if (showChangeMode && y > 2020) {
      const displayVal = change !== null ? (change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)) : "—";
      cellClass += change > 0 ? " oil-positive" : change < 0 ? " oil-negative" : "";
      html += `<td class="${cellClass}"><strong>${displayVal}</strong></td>`;
    } else {
      html += `<td class="${cellClass}">
        <strong>${total.toFixed(2)}</strong>
        ${change !== null ? `<span class="oil-mini-change ${change > 0 ? 'oil-positive' : change < 0 ? 'oil-negative' : ''}">${change >= 0 ? '▲' : '▼'}${Math.abs(change).toFixed(2)}</span>` : ''}
      </td>`;
    }
  }
  html += `</tr>`;

  html += `</tbody></table></div>
    <p class="oil-table-note">* Estimated/projected values. Historical data (2020–${ACTUAL_CUTOFF}) from EIA/IEA/OPEC. Click a country row to see major projects.</p>`;

  container.innerHTML = html;
}

function renderProjects() {
  const container = document.getElementById("oil-projects-section");
  
  // Collect all projects with country info
  let allProjects = [];
  for (const [country, data] of Object.entries(OIL_DATA.countries)) {
    for (const p of data.majorProjects) {
      allProjects.push({ ...p, country, flag: data.flag });
    }
  }

  // Group by status
  const developing = allProjects.filter(p => p.status === "Developing");
  const evaluating = allProjects.filter(p => p.status === "Evaluating" || p.status === "Ramping");

  let html = `<h3>Key Growth Projects (Developing / Pre-FID)</h3>
    <div class="oil-project-cards">`;
  
  for (const p of [...developing, ...evaluating]) {
    const statusClass = p.status === "Developing" ? "oil-status-developing" : "oil-status-evaluating";
    html += `<div class="oil-project-card">
      <div class="oil-project-card-header">
        <span>${p.flag} ${p.country}</span>
        <span class="oil-status-badge ${statusClass}">${p.status}</span>
      </div>
      <h4>${p.name}</h4>
      <p class="oil-project-type">${p.type}</p>
      <p class="oil-project-peak">${p.peakAdd}</p>
      <p class="oil-project-note">${p.notes}</p>
    </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

function renderDeclineRates() {
  const container = document.getElementById("oil-decline-section");
  
  const countries = Object.entries(OIL_DATA.countries)
    .map(([name, data]) => ({ name, flag: data.flag, rate: data.declineRate }))
    .sort((a, b) => b.rate - a.rate);

  let html = `<h3>Base Decline Rates by Country</h3>
    <p class="oil-decline-explainer">Estimated natural decline rate of existing producing fields without new investment. Higher rates mean more new projects needed just to maintain current output.</p>
    <div class="oil-decline-bars">`;
  
  for (const c of countries) {
    const pct = c.rate * 100;
    const width = (pct / 10) * 100; // Scale: 10% = full width
    const severity = pct >= 7 ? "oil-decline-severe" : pct >= 5 ? "oil-decline-moderate" : "oil-decline-mild";
    html += `<div class="oil-decline-item">
      <span class="oil-decline-label">${c.flag} ${c.name}</span>
      <div class="oil-decline-bar-bg">
        <div class="oil-decline-bar ${severity}" style="width: ${width}%"></div>
      </div>
      <span class="oil-decline-value">${pct.toFixed(0)}%/yr</span>
    </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

function renderScenarioComparison() {
  const container = document.getElementById("oil-scenario-comparison");
  
  let html = `<h3>Scenario Comparison: World Total Production</h3>
    <div class="oil-scenario-table-wrap"><table class="oil-table oil-scenario-table">
      <thead><tr><th>Scenario</th>${YEARS.map(y => `<th>${y}</th>`).join("")}</tr></thead>
      <tbody>`;
  
  for (const sc of ["low", "base", "high"]) {
    const label = OIL_DATA.priceAssumptions[sc].label;
    html += `<tr class="${sc === currentScenario ? 'oil-active-scenario' : ''}">
      <td><strong>${label}</strong></td>`;
    for (const y of YEARS) {
      html += `<td>${getWorldTotal(y, sc).toFixed(1)}</td>`;
    }
    html += `</tr>`;
  }
  
  // Spread row
  html += `<tr class="oil-spread-row"><td><em>High–Low Spread</em></td>`;
  for (const y of YEARS) {
    const spread = (getWorldTotal(y, "high") - getWorldTotal(y, "low")).toFixed(1);
    html += `<td>${spread}</td>`;
  }
  html += `</tr>`;
  
  html += `</tbody></table></div>
    <div class="oil-price-row-labels">
      <div><strong>Price assumptions ($/bbl Brent):</strong></div>
      ${["low","base","high"].map(sc => `<div>${OIL_DATA.priceAssumptions[sc].label}: ${YEARS.map(y => `${y}:$${OIL_DATA.priceAssumptions[sc].prices[y]}`).join(", ")}</div>`).join("")}
    </div>`;
  
  container.innerHTML = html;
}

function renderUpdateSection() {
  const container = document.getElementById("oil-update-section");
  
  let html = `<h3>Data Update Log & Manual Adjustments</h3>
    <p class="oil-update-explainer">Update production estimates as new data becomes available. Paste JSON data below or manually adjust individual country values.</p>
    <div class="oil-update-controls">
      <div class="oil-update-left">
        <label>Quick Country Update:</label>
        <select id="oil-update-country">
          <option value="">Select country...</option>
          ${Object.keys(OIL_DATA.countries).map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
        <select id="oil-update-year">
          ${YEARS.filter(y => y >= 2024).map(y => `<option value="${y}">${y}</option>`).join("")}
        </select>
        <input type="number" id="oil-update-value" step="0.01" placeholder="mb/d" />
        <input type="text" id="oil-update-note" placeholder="Source / reason for update" />
        <button id="oil-update-btn" class="game-button">Apply Update</button>
      </div>
      <div class="oil-update-right">
        <label>Bulk JSON Import:</label>
        <textarea id="oil-json-import" rows="5" placeholder='{"United States": {"2025": 13.55, "2026": 13.75}}'></textarea>
        <button id="oil-json-import-btn" class="game-button">Import JSON</button>
        <button id="oil-json-export-btn" class="game-button">Export Current Data</button>
      </div>
    </div>
    <div class="oil-update-log">
      <h4>Update History</h4>
      <div id="oil-log-entries">
        ${OIL_DATA.updateLog.length === 0 ? '<p class="oil-no-updates">No updates yet. Original estimates loaded.</p>' : 
          OIL_DATA.updateLog.map(entry => `<div class="oil-log-entry"><span class="oil-log-date">${entry.date}</span> <span class="oil-log-detail">${entry.detail}</span></div>`).join("")}
      </div>
    </div>
    <div class="oil-auto-update-info">
      <h4>Automatic Updates</h4>
      <p>To keep this model current, you can:</p>
      <ul>
        <li><strong>EIA Data:</strong> Check <a href="https://www.eia.gov/international/data/world" target="_blank">EIA International Energy Statistics</a> monthly</li>
        <li><strong>OPEC MOMR:</strong> <a href="https://www.opec.org/opec_web/en/publications/338.htm" target="_blank">Monthly Oil Market Report</a> — released ~12th of each month</li>
        <li><strong>IEA OMR:</strong> <a href="https://www.iea.org/reports/oil-market-report-february-2026" target="_blank">Oil Market Report</a> — released mid-month</li>
        <li><strong>Rystad/S&P Global:</strong> Commercial services for field-level data</li>
      </ul>
      <p>Use the JSON import above or the quick-update form to apply new data as it becomes available.</p>
    </div>`;
  
  container.innerHTML = html;
}

// ============================================================
// EVENT HANDLING
// ============================================================

function bindEvents() {
  // Scenario buttons
  document.querySelectorAll(".oil-scenario-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentScenario = btn.dataset.scenario;
      renderControls();
      renderTable();
      renderScenarioComparison();
      bindEvents();
    });
  });

  // Display mode buttons
  document.querySelectorAll(".oil-display-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showChangeMode = btn.dataset.mode === "change";
      renderControls();
      renderTable();
      bindEvents();
    });
  });

  // Sort headers
  document.querySelectorAll(".oil-table th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.sort;
      if (sortColumn === col) {
        sortAscending = !sortAscending;
      } else {
        sortColumn = col;
        sortAscending = col === "country" ? true : false;
      }
      renderTable();
      bindEvents();
    });
  });

  // Expand/collapse country rows
  document.querySelectorAll(".oil-country-row").forEach(row => {
    row.addEventListener("click", (e) => {
      // Don't toggle if they clicked a link
      if (e.target.tagName === "A") return;
      const country = row.dataset.country;
      if (expandedCountries.has(country)) {
        expandedCountries.delete(country);
      } else {
        expandedCountries.add(country);
      }
      renderTable();
      bindEvents();
    });
  });

  // Quick update button
  const updateBtn = document.getElementById("oil-update-btn");
  if (updateBtn) {
    updateBtn.addEventListener("click", applyQuickUpdate);
  }

  // JSON import
  const jsonImportBtn = document.getElementById("oil-json-import-btn");
  if (jsonImportBtn) {
    jsonImportBtn.addEventListener("click", applyJsonImport);
  }

  // JSON export
  const jsonExportBtn = document.getElementById("oil-json-export-btn");
  if (jsonExportBtn) {
    jsonExportBtn.addEventListener("click", exportJson);
  }
}

function applyQuickUpdate() {
  const country = document.getElementById("oil-update-country").value;
  const year = parseInt(document.getElementById("oil-update-year").value);
  const value = parseFloat(document.getElementById("oil-update-value").value);
  const note = document.getElementById("oil-update-note").value || "Manual update";
  
  if (!country || !year || isNaN(value)) {
    alert("Please fill in country, year, and value.");
    return;
  }

  const c = OIL_DATA.countries[country];
  if (!c) return;

  const oldVal = getProduction(country, year, "base");
  
  if (year <= ACTUAL_CUTOFF) {
    c.actuals[year] = value;
  } else {
    c.baseEstimates[year] = value;
  }

  const logEntry = {
    date: new Date().toISOString().slice(0, 16).replace("T", " "),
    detail: `${country} ${year}: ${oldVal?.toFixed(2) || '—'} → ${value.toFixed(2)} mb/d — ${note}`
  };
  OIL_DATA.updateLog.push(logEntry);
  
  renderTable();
  renderUpdateSection();
  renderScenarioComparison();
  bindEvents();
}

function applyJsonImport() {
  const raw = document.getElementById("oil-json-import").value.trim();
  if (!raw) return;
  
  try {
    const data = JSON.parse(raw);
    let count = 0;
    
    for (const [country, years] of Object.entries(data)) {
      const c = OIL_DATA.countries[country];
      if (!c) continue;
      
      for (const [yearStr, value] of Object.entries(years)) {
        const year = parseInt(yearStr);
        if (year <= ACTUAL_CUTOFF) {
          c.actuals[year] = value;
        } else {
          c.baseEstimates[year] = value;
        }
        count++;
      }
    }
    
    OIL_DATA.updateLog.push({
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      detail: `Bulk JSON import: ${count} values updated`
    });
    
    renderTable();
    renderUpdateSection();
    renderScenarioComparison();
    bindEvents();
    
    alert(`Successfully imported ${count} values.`);
  } catch(e) {
    alert("Invalid JSON format. Please check your input.\n\nExpected format:\n{\"Country Name\": {\"2025\": 13.5, \"2026\": 13.7}}");
  }
}

function exportJson() {
  const exportData = {};
  for (const [country, data] of Object.entries(OIL_DATA.countries)) {
    exportData[country] = {};
    for (const y of YEARS) {
      exportData[country][y] = getProduction(country, y, currentScenario);
    }
    exportData[country].declineRate = data.declineRate;
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `oil-production-${currentScenario}-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// INITIALIZE
// ============================================================
document.addEventListener("DOMContentLoaded", init);
