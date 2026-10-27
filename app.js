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

  const hi = Math.max(100, typeof twa === "number" ? twa : 0, target);
  const cards = [
    ["osha", r.osha, r.oshaResult, "barOsha", "oshaTick", "oshaTarget"],
    ["realistic", r.realistic, r.realisticResult, "barRealistic", "realisticTick", "realisticTarget"],
  ];
  for (const [id, value, result, bar, tick, label] of cards) {
    $(id).textContent = fmt(value) || "--";
    $(id).parentElement.classList.toggle("text", typeof value !== "number" && value !== "");
    setPill($(id + "Result"), result, "");
    setBar($(bar), value, hi);
    $(bar).classList.toggle("fail", result === "FAIL");
    $(tick).style.left = ((target - 60) / (hi - 60)) * 100 + "%";
    $(label).textContent = "Target " + target + " dBA";
  }

  for (const [id, value] of [["oshaMinNrr", r.oshaMinNrr], ["realisticMinNrr", r.realisticMinNrr]]) {
    $(id).textContent = fmt(value);
    $(id).classList.toggle("text", typeof value !== "number");
  }
  $("programStatus").textContent = r.programStatus;
  $("note").textContent = r.note;
}

// STS = Yes switches the target to 85 dBA and remembers the earlier choice,
// which comes back when STS is set to No. A manual target change clears the note.
let targetBeforeSts = null;

function setTarget(value) {
  form.querySelector(`input[name="target"][value="${value}"]`).checked = true;
}

form.querySelectorAll('input[name="sts"]').forEach((el) =>
  el.addEventListener("change", () => {
    if (choice("sts") === "Yes") {
      targetBeforeSts = choice("target");
      setTarget("85");
      $("stsNote").hidden = false;
    } else {
      if (targetBeforeSts !== null && !$("stsNote").hidden) setTarget(targetBeforeSts);
      targetBeforeSts = null;
      $("stsNote").hidden = true;
    }
  })
);

form.querySelectorAll('input[name="target"]').forEach((el) =>
  el.addEventListener("change", () => {
    $("stsNote").hidden = true;
  })
);

form.addEventListener("input", update);
form.addEventListener("change", update);
update();
