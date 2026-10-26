const form = document.getElementById("form");
const $ = (id) => document.getElementById(id);

// Number inputs: blank or invalid (the sheet only accepts numbers >= 0) is treated as blank.
function num(id) {
  const raw = $(id).value.trim();
  if (raw === "") return "";
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 ? v : "";
}

// Segmented controls: no selection is blank, like an empty dropdown in the sheet.
function choice(name) {
  const el = form.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}

// Sheet formats result numbers as 0.0.
function fmt(value) {
  return typeof value === "number" ? value.toFixed(1) : value;
}

function setPill(el, value, prefix) {
  el.textContent = value ? prefix + value : "";
  el.className = el.className.replace(/ ?(pass|fail)/g, "") + (value ? " " + value.toLowerCase() : "");
}

// Bars are drawn on a 60 dBA to 100 dBA scale (extended if the inputs go higher).
function setBar(el, value, hi) {
  const lo = 60;
  const show = typeof value === "number";
  el.style.width = show ? Math.min(100, Math.max(0, ((value - lo) / (hi - lo)) * 100)) + "%" : "0";
}

function update() {
  const double = choice("double");
  document.querySelectorAll(".second").forEach((el) => (el.hidden = double !== "Yes"));

  const twa = num("twa");
  const target = Number(choice("target"));
  const r = calculate({
    twa,
    target,
    type: choice("type"),
    nrr: num("nrr"),
    double,
    type2: choice("type2"),
    nrr2: num("nrr2"),
    sts: choice("sts"),
    par: num("par"),
  });

  const heroText = fmt(r.realistic);
  $("realistic").textContent = heroText || "--";
  $("realistic").parentElement.classList.toggle("text", typeof r.realistic !== "number");
  setPill($("realisticResult"), r.realisticResult, "Realistic: ");

  const hi = Math.max(100, typeof twa === "number" ? twa : 0, target);
  $("targetLine").style.setProperty("--p", (target - 60) / (hi - 60));
  $("targetLabel").textContent = "Target " + target;
  setBar($("barTwa"), twa, hi);
  setBar($("barOsha"), r.osha, hi);
  setBar($("barRealistic"), r.realistic, hi);
  $("barOsha").classList.toggle("fail", r.oshaResult === "FAIL");
  $("barRealistic").classList.toggle("fail", r.realisticResult === "FAIL");
  $("valTwa").textContent = fmt(twa);
  $("osha").textContent = fmt(r.osha);
  $("valRealistic").textContent = typeof r.realistic === "number" ? fmt(r.realistic) : "";
  setPill($("oshaResult"), r.oshaResult, "");
  setPill($("realisticResult2"), r.realisticResult, "");

  $("oshaMinNrr").textContent = fmt(r.oshaMinNrr);
  $("realisticMinNrr").textContent = fmt(r.realisticMinNrr);
  $("programStatus").textContent = r.programStatus;
  $("note").textContent = r.note;
}

form.addEventListener("input", update);
form.addEventListener("change", update);
update();
