// ========================================
// TIME SLOTS (12 AM - 1 AM ... 11 PM - 12 AM)
// ========================================

const slots = [];

function formatHour(hour) {
    const h = hour % 24;
    return (h % 12 || 12) + (h < 12 ? " AM" : " PM");
}

for (let i = 0; i < 24; i++) {
    slots.push(formatHour(i) + " - " + formatHour(i + 1));
}


// ========================================
// FILL THE DROPDOWNS
// ========================================

function fillSelect(id, selectedTime) {
    const select = document.getElementById(id);

    slots.forEach((slot, index) => {
        const option = document.createElement("option");

        option.value = index;
        option.textContent = slot;

        if (slot === selectedTime) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

// Default timings
fillSelect("wakeTime", "10 AM - 11 AM");
fillSelect("lunchTime", "12 PM - 1 PM");
fillSelect("napTime", "4 PM - 5 PM");
fillSelect("nightTime", "8 PM - 9 PM");


// ========================================
// DIGITAL CLOCK
// ========================================

function updateClock() {
    const now = new Date();

    const hour24 = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // AM / PM and 12-hour format
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    document.getElementById("hours").textContent =
        String(hour12).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");

    document.getElementById("zone").textContent = ampm;

    // Current date
    document.getElementById("date").textContent =
        now.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    // Status message
    const status = document.getElementById("status");

    if (hour24 >= 5 && hour24 < 12) {
        status.textContent = "GRAB SOME HEALTHY BREAKFAST!!! 🥞";
    } else if (hour24 >= 12 && hour24 < 16) {
        status.textContent = "TIME FOR A HEALTHY LUNCH!!! 🍱";
    } else if (hour24 >= 16 && hour24 < 19) {
        status.textContent = "TAKE A SHORT BREAK & RELAX!!! 😴";
    } else {
        status.textContent = "GOOD NIGHT! HAVE A PEACEFUL SLEEP!!! 🌙";
    }
}

// Start immediately, then update every second
updateClock();
setInterval(updateClock, 1000);


// ========================================
// SET ROUTINE BUTTON
// ========================================

function selectedText(id) {
    return document.getElementById(id).selectedOptions[0].textContent;
}

document.getElementById("setAlarm").addEventListener("click", function () {
    const wake = selectedText("wakeTime");
    const lunch = selectedText("lunchTime");
    const nap = selectedText("napTime");
    const night = selectedText("nightTime");

    document.getElementById("summary").innerHTML = `
        <p>
            Wake Up Time : ${wake}<br>
            Lunch Time : ${lunch}<br>
            Nap Time : ${nap}<br>
            Night Time : ${night}
        </p>
    `;

    document.getElementById("message").textContent =
        "Your daily routine is set! ✨";
});
