const form = document.getElementById("form");

// Number inputs: blank or invalid (the sheet only accepts numbers >= 0) is treated as blank.
function num(id) {
  const raw = document.getElementById(id).value.trim();
  if (raw === "") return "";
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 ? v : "";
}

function text(id) {
  return document.getElementById(id).value;
}

// Sheet formats result numbers as 0.0.
function show(id, value) {
  const el = document.getElementById(id);
  el.textContent = typeof value === "number" ? value.toFixed(1) : value;
}

function showBadge(id, value) {
  const el = document.getElementById(id);
  el.textContent = value;
  el.className = "badge" + (value ? " " + value.toLowerCase() : "");
}

function update() {
  const r = calculate({
    twa: num("twa"),
    target: Number(text("target")),
    type: text("type"),
    nrr: num("nrr"),
    double: text("double"),
    type2: text("type2"),
    nrr2: num("nrr2"),
    sts: text("sts"),
    par: num("par"),
  });
  show("osha", r.osha);
  show("realistic", r.realistic);
  showBadge("oshaResult", r.oshaResult);
  showBadge("realisticResult", r.realisticResult);
  show("oshaMinNrr", r.oshaMinNrr);
  show("realisticMinNrr", r.realisticMinNrr);
  show("programStatus", r.programStatus);
  show("note", r.note);
}

document.getElementById("derating").innerHTML = Object.entries(DERATING)
  .map(([type, sub]) => `<tr><td>${type}</td><td>${Math.round(sub * 100)}%</td><td>${(1 - sub).toFixed(2)}</td></tr>`)
  .join("");

form.addEventListener("input", update);
form.addEventListener("change", update);
update();
