// ========================================
// SETTINGS (saved in the browser)
// ========================================
function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
}
function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

let use24 = load("use24", false);
let theme = load("theme", "light");
let routine = load("routine", { wakeTime: 10, lunchTime: 12, napTime: 16, nightTime: 20 });
let audioCtx = null;
let lastRung = "";

// ========================================
// TIME SLOTS
// ========================================
function formatHour(hour) {
    const h = hour % 24;
    if (use24) return String(h).padStart(2, "0") + ":00";
    return (h % 12 || 12) + (h < 12 ? " AM" : " PM");
}
const slotLabel = i => formatHour(i) + " - " + formatHour(i + 1);

const EVENTS = [
    { id: "wakeTime",  name: "Wake up", icon: "☀️", msg: "GOOD MORNING! TIME TO WAKE UP & GRAB BREAKFAST!!! 🥞" },
    { id: "lunchTime", name: "Lunch",   icon: "🍽️", msg: "TIME FOR A HEALTHY LUNCH!!! 🍱" },
    { id: "napTime",   name: "Nap",     icon: "😴", msg: "TAKE A SHORT BREAK & NAP!!! 😴" },
    { id: "nightTime", name: "Night",   icon: "🌙", msg: "GOOD NIGHT! HAVE A PEACEFUL SLEEP!!! 🌙" }
];

function fillSelects() {
    EVENTS.forEach(ev => {
        const select = document.getElementById(ev.id);
        select.innerHTML = "";
        for (let i = 0; i < 24; i++) {
            const o = document.createElement("option");
            o.value = i;
            o.textContent = slotLabel(i);
            if (i === routine[ev.id]) o.selected = true;
            select.appendChild(o);
        }
    });
}

function renderSummary() {
    const rows = EVENTS.map(ev => `${ev.name} Time : ${slotLabel(routine[ev.id])}`);
    document.getElementById("summary").innerHTML = "<p>" + rows.join("<br>") + "</p>";
}

// ========================================
// ALARM SOUND + NOTIFICATION
// ========================================
function beep() {
    if (!audioCtx) return;
    [0, 0.35, 0.7].forEach(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.3);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + t);
        osc.stop(audioCtx.currentTime + t + 0.3);
    });
}

function ring(ev) {
    beep();
    document.getElementById("message").textContent = ev.icon + " It's " + ev.name.toLowerCase() + " time!";
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Digital Clock", { body: ev.icon + " " + ev.name + " time!" });
    }
}

// ========================================
// CLOCK, STATUS, COUNTDOWN
// ========================================
const pad = n => String(n).padStart(2, "0");

function updateClock() {
    const now = new Date();
    const h24 = now.getHours(), m = now.getMinutes(), s = now.getSeconds();

    document.getElementById("hours").textContent = pad(use24 ? h24 : (h24 % 12 || 12));
    document.getElementById("minutes").textContent = pad(m);
    document.getElementById("seconds").textContent = pad(s);
    const zone = document.getElementById("zone");
    zone.textContent = use24 ? "24H" : (h24 >= 12 ? "PM" : "AM");

    document.getElementById("date").textContent = now.toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    // Current activity: the latest routine start that has already passed
    const sorted = EVENTS.map(ev => ({ ev, start: routine[ev.id] })).sort((a, b) => a.start - b.start);
    let current = sorted[sorted.length - 1];
    sorted.forEach(x => { if (x.start <= h24) current = x; });
    document.getElementById("status").textContent = current.ev.msg;

    // Next up with countdown (wraps to tomorrow)
    let next = sorted.find(x => x.start > h24) || sorted[0];
    const target = new Date(now);
    target.setHours(next.start, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = Math.floor((target - now) / 1000);
    document.getElementById("nextName").textContent = next.ev.icon + " " + next.ev.name + " · " + formatHour(next.start);
    document.getElementById("countdown").textContent =
        pad(Math.floor(diff / 3600)) + ":" + pad(Math.floor(diff % 3600 / 60)) + ":" + pad(diff % 60);

    // Ring at the start of each slot
    if (m === 0 && s === 0) {
        EVENTS.forEach(ev => {
            const key = now.toDateString() + ev.id + h24;
            if (routine[ev.id] === h24 && lastRung !== key) { lastRung = key; ring(ev); }
        });
    }
}

// ========================================
// BUTTONS
// ========================================
document.getElementById("setAlarm").addEventListener("click", () => {
    EVENTS.forEach(ev => { routine[ev.id] = Number(document.getElementById(ev.id).value); });
    save("routine", routine);
    renderSummary();
    updateClock();

    // Needs a user click to unlock sound / notifications
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    beep();

    document.getElementById("message").textContent = "Your daily routine is set! Alarms are on ✨";
});

document.getElementById("formatBtn").addEventListener("click", () => {
    use24 = !use24;
    save("use24", use24);
    applyFormat();
});

document.getElementById("themeBtn").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    save("theme", theme);
    applyTheme();
});

function applyFormat() {
    document.getElementById("formatBtn").textContent = use24 ? "24h" : "12h";
    EVENTS.forEach(ev => { routine[ev.id] = Number(document.getElementById(ev.id).value); });
    fillSelects();
    renderSummary();
    updateClock();
}

function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
}

// ========================================
// START
// ========================================
applyTheme();
document.getElementById("formatBtn").textContent = use24 ? "24h" : "12h";
fillSelects();
renderSummary();
updateClock();
setInterval(updateClock, 1000);


// ========================================
// PAGES (Home / Routine)
// ========================================
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
        document.querySelectorAll(".view").forEach(v => v.classList.toggle("hidden", v.id !== tab.dataset.view));
    });
});


// ========================================
// HOME EXTRAS: day progress + world clock
// ========================================
const ZONES = [
    { name: "Pune (India)", tz: "Asia/Kolkata" },
    { name: "London", tz: "Europe/London" },
    { name: "New York", tz: "America/New_York" },
    { name: "Dubai", tz: "Asia/Dubai" },
    { name: "Tokyo", tz: "Asia/Tokyo" }
];

function updateExtras() {
    const now = new Date();

    const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const pct = secs / 86400 * 100;
    document.getElementById("dayBar").style.width = pct.toFixed(2) + "%";

    const yearStart = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - yearStart) / 86400000);
    const week = Math.ceil(dayOfYear / 7);
    document.getElementById("dayInfo").textContent =
        pct.toFixed(1) + "% of today gone · Day " + dayOfYear + " of the year · Week " + week;

    document.getElementById("worldClocks").innerHTML = ZONES.map(z => {
        const t = now.toLocaleTimeString("en-GB", { timeZone: z.tz, hour12: !use24, hour: "2-digit", minute: "2-digit" });
        return `<div class="wc"><span>${z.name}</span><b>${t}</b></div>`;
    }).join("");
}
updateExtras();
setInterval(updateExtras, 1000);


// ========================================
// STOPWATCH
// ========================================
let swStart = 0, swElapsed = 0, swTimer = null;

function swRender() {
    const ms = swElapsed + (swTimer ? Date.now() - swStart : 0);
    const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000), t = Math.floor(ms % 1000 / 100);
    document.getElementById("swTime").textContent = pad(m) + ":" + pad(s) + "." + t;
    return document.getElementById("swTime").textContent;
}

document.getElementById("swStart").addEventListener("click", function () {
    if (swTimer) {
        swElapsed += Date.now() - swStart;
        clearInterval(swTimer); swTimer = null;
        this.textContent = "Start";
    } else {
        swStart = Date.now();
        swTimer = setInterval(swRender, 100);
        this.textContent = "Stop";
    }
});

document.getElementById("swLap").addEventListener("click", () => {
    if (!swTimer) return;
    const li = document.createElement("li");
    li.textContent = swRender();
    document.getElementById("laps").prepend(li);
});

document.getElementById("swReset").addEventListener("click", () => {
    clearInterval(swTimer); swTimer = null; swElapsed = 0;
    document.getElementById("swStart").textContent = "Start";
    document.getElementById("laps").innerHTML = "";
    swRender();
});
