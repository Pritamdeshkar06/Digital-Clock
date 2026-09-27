// ========================================
// TIME SLOTS
// ========================================

const slots = [
    "12 AM - 1 AM",
    "1 AM - 2 AM",
    "2 AM - 3 AM",
    "3 AM - 4 AM",
    "4 AM - 5 AM",
    "5 AM - 6 AM",
    "6 AM - 7 AM",
    "7 AM - 8 AM",
    "8 AM - 9 AM",
    "9 AM - 10 AM",
    "10 AM - 11 AM",
    "11 AM - 12 PM",
    "12 PM - 1 PM",
    "1 PM - 2 PM",
    "2 PM - 3 PM",
    "3 PM - 4 PM",
    "4 PM - 5 PM",
    "5 PM - 6 PM",
    "6 PM - 7 PM",
    "7 PM - 8 PM",
    "8 PM - 9 PM",
    "9 PM - 10 PM",
    "10 PM - 11 PM",
    "11 PM - 12 AM"
];


// ========================================
// CREATE SELECT OPTIONS
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

    let hours = now.getHours();

    const minutes = now.getMinutes();

    const seconds = now.getSeconds();


    // AM / PM

    const ampm = hours >= 12 ? "PM" : "AM";


    // Convert 24 hour to 12 hour

    hours = hours % 12;

    hours = hours || 12;


    // Display clock

    document.getElementById("hours").textContent =
        String(hours).padStart(2, "0");


    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");


    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");


    document.getElementById("zone").textContent =
        ampm;


    // ====================================
    // STATUS MESSAGE
    // ====================================

    const currentHour = now.getHours();

    const status = document.getElementById("status");


    if (currentHour >= 5 && currentHour < 12) {

        status.textContent =
            "GRAB SOME HEALTHY BREAKFAST!!! 🥞";

    }

    else if (currentHour >= 12 && currentHour < 16) {

        status.textContent =
            "TIME FOR A HEALTHY LUNCH!!! 🍱";

    }

    else if (currentHour >= 16 && currentHour < 19) {

        status.textContent =
            "TAKE A SHORT BREAK & RELAX!!! 😴";

    }

    else {

        status.textContent =
            "GOOD NIGHT! HAVE A PEACEFUL SLEEP!!! 🌙";
    }
}


// Start clock immediately

updateClock();


// Update every second

setInterval(updateClock, 1000);


// ========================================
// SET ROUTINE BUTTON
// ========================================

document
    .getElementById("setAlarm")
    .addEventListener("click", function () {


        // Get selected values

        const wake =
            document.getElementById("wakeTime")
            .selectedOptions[0]
            .textContent;


        const lunch =
            document.getElementById("lunchTime")
            .selectedOptions[0]
            .textContent;


        const nap =
            document.getElementById("napTime")
            .selectedOptions[0]
            .textContent;


        const night =
            document.getElementById("nightTime")
            .selectedOptions[0]
            .textContent;


        // ====================================
        // SHOW ROUTINE
        // ====================================

        document.getElementById("summary").innerHTML = `
            <p>
                Wake Up Time : ${wake}<br>
                Lunch Time : ${lunch}<br>
                Nap Time : ${nap}<br>
                Night Time : ${night}
            </p>
        `;


        // ====================================
        // SUCCESS MESSAGE
        // ====================================

        document.getElementById("message").textContent =
            "Your daily routine is set! ✨";

    });
