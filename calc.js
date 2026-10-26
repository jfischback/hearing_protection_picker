// Calculation logic copied from the "Hearing Protection Picker V2" tab of the
// Hearing Protection Picker Google Sheet. Cell references are noted for each piece.
// Blank inputs are represented as "" to match the sheet's ="" checks.

// NIOSH derating factors (sheet D26:F29). Multiplier = 1 - subtract.
const DERATING = {
  "earmuff": 0.25,
  "foam plug": 0.5,
  "premolded plug": 0.7,
  "other plug": 0.7,
};

function multiplier(type) {
  return 1 - DERATING[type];
}

// Sheets works to 15 significant digits; this keeps JS float noise out of
// comparisons and text joins (e.g. 5.299999999999997 -> 5.3).
function clean(x) {
  return Number(x.toPrecision(15));
}

// N() in Sheets: numbers pass through, anything else is 0.
function N(v) {
  return typeof v === "number" ? v : 0;
}

function passFail(value, target) {
  return typeof value === "number" ? (value <= target ? "PASS" : "FAIL") : "";
}

function calculate(i) {
  const twa = i.twa;               // E5
  const target = i.target;         // E6
  const type = i.type;             // E7
  const nrr = i.nrr;               // E8
  const dbl = i.double === "Yes";  // E9
  const type2 = i.type2;           // E10
  const nrr2 = i.nrr2;             // E11
  const sts = i.sts;               // E12
  const par = i.par;               // E13
  const dblAdd = dbl ? 5 : 0;

  // E17: OSHA Appendix B estimated protected level
  let osha;
  if (twa === "" || nrr === "") osha = "";
  else if (dbl && nrr2 === "") osha = "Enter 2nd NRR";
  else osha = clean(twa - (Math.max(nrr, dbl ? nrr2 : 0) - 7 + dblAdd));

  // H17: realistic estimated protected level (NIOSH by type, or PAR)
  let realistic;
  if (twa === "" || type === "" || nrr === "") realistic = "";
  else if (N(par) > 0) realistic = clean(twa - (par + dblAdd));
  else if (dbl && (type2 === "" || nrr2 === "")) realistic = "Enter 2nd type + NRR";
  else realistic = clean(twa - (Math.max(nrr * multiplier(type), dbl ? nrr2 * multiplier(type2) : 0) - 7 + dblAdd));

  // E18 / H18
  const oshaResult = passFail(osha, target);
  const realisticResult = passFail(realistic, target);

  // E19: minimum NRR needed, OSHA
  let oshaMinNrr;
  if (twa === "") oshaMinNrr = "";
  else if (twa <= target) oshaMinNrr = "None needed";
  else oshaMinNrr = clean(Math.max(0, twa - target - dblAdd + 7));

  // H19: minimum NRR needed, realistic
  let realisticMinNrr;
  if (twa === "" || type === "") realisticMinNrr = "";
  else if (twa <= target) realisticMinNrr = "None needed";
  else if (N(par) > 0) realisticMinNrr = "PAR of " + clean(Math.max(0, twa - target - dblAdd)) + " or more";
  else if (dbl && type2 === "") realisticMinNrr = "Enter second protector type";
  else {
    let m = multiplier(type);
    if (dbl && N(nrr2) * multiplier(type2) > N(nrr) * multiplier(type)) m = multiplier(type2);
    realisticMinNrr = clean(Math.max(0, twa - target - dblAdd + 7) / m);
  }

  // E20: program status (1910.95)
  let programStatus;
  if (twa === "") programStatus = "";
  else if (twa >= 90 || (twa >= 85 && sts === "Yes")) programStatus = "Hearing conservation program required. Protectors required.";
  else if (twa >= 85) programStatus = "Hearing conservation program required. Protectors must be made available.";
  else programStatus = "Below 85 dBA action level. No hearing conservation program required.";

  // E21: note
  let note;
  if (twa === "" || type === "" || nrr === "") note = "Enter the inputs above.";
  else if (typeof osha !== "number") note = osha + ".";
  else if (typeof realistic !== "number") note = realistic + ".";
  else if (oshaResult === "PASS" && realisticResult === "PASS") note = "Passes both the OSHA compliance check and the realistic estimate.";
  else if (oshaResult === "PASS" && realisticResult === "FAIL") note = "Legal under OSHA, but the realistic estimate shows the worker may be under-protected. Choose a higher NRR or add double protection.";
  else if (oshaResult === "FAIL" && realisticResult === "PASS") note = "The realistic estimate passes, but the OSHA compliance check fails. Choose a higher NRR.";
  else note = "Fails both. Choose a higher NRR or add double protection.";

  return { osha, realistic, oshaResult, realisticResult, oshaMinNrr, realisticMinNrr, programStatus, note };
}

if (typeof module !== "undefined") module.exports = { calculate, DERATING };
