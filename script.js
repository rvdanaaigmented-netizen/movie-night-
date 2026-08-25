/* =========================================================
   WEDNESDAY MOVIE PLAN — configuration
   Edit everything in this one object. Nothing else in this
   file needs to change for a new movie / cinema / number.
   ========================================================= */
const MOVIE_CONFIG = {
  movieName: "Toxic: A Fairy Tale for Grown-ups",
  moviePoster: "poster.jpg",        // put the poster image next to this file, or a full image URL
  cinema: "PVR Cinemas",             // EDIT: your cinema name
  location: "Add your cinema's area/city here", // EDIT: e.g. "Forum Mall, Koramangala"
  date: "Wednesday",
  // These are the actual "Couple Seats" showtimes for this film —
  // shown as a little badge on each card.
  showTimes: [
    { time: "9:00 AM",  tag: "Couple Seats" },
    { time: "12:40 PM", tag: "Couple Seats" },
    { time: "4:20 PM",  tag: "Couple Seats" },
    { time: "8:00 PM",  tag: "Couple Seats" }
  ],
  whatsappNumber: "919727489334" // your WhatsApp number (with India country code)
};

/* ========================================================= */

(function(){
  "use strict";

  const state = {
    selectedTime: null,
    interested: false,
    snack: null,
    reminderTapped: false
  };

  const $ = (sel) => document.querySelector(sel);
  const screens = Array.from(document.querySelectorAll(".screen"));

  function goTo(id){
    const current = document.querySelector('.screen[data-active="true"]');
    const next = document.getElementById(id);
    if (!next || current === next) return;

    if (current){
      current.removeAttribute("data-active");
      current.classList.remove("is-entering");
    }
    next.setAttribute("data-active", "true");
    // force reflow so the entering animation restarts
    void next.offsetWidth;
    next.classList.add("is-entering");
    next.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- populate movie card from config ---------- */
  function renderMovieCard(){
    $("#movie-poster").src = MOVIE_CONFIG.moviePoster;
    $("#movie-poster").alt = MOVIE_CONFIG.movieName + " poster";
    $("#movie-name").textContent = MOVIE_CONFIG.movieName;
    $("#movie-cinema").textContent = MOVIE_CONFIG.cinema;
    $("#movie-location").textContent = MOVIE_CONFIG.location;
    $("#movie-date").textContent = MOVIE_CONFIG.date;
  }

  /* ---------- populate time cards from config ---------- */
  function renderTimeGrid(){
    const grid = $("#time-grid");
    grid.innerHTML = "";
    MOVIE_CONFIG.showTimes.forEach((slot) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "time-card";
      card.dataset.time = slot.time;
      card.innerHTML =
        `<span class="time-value">${slot.time}</span>` +
        (slot.tag ? `<span class="time-tag">${slot.tag}</span>` : "");
      card.addEventListener("click", () => selectTime(slot.time, card));
      grid.appendChild(card);
    });
  }

  function selectTime(time, cardEl){
    document.querySelectorAll(".time-card").forEach(c => c.classList.remove("selected"));
    cardEl.classList.add("selected");
    state.selectedTime = time;
    $("#time-status").textContent = "Good choice 😌";
    $("#btn-lock-time").disabled = false;
  }

  /* ---------- WhatsApp helpers ---------- */
  function buildWhatsAppLink(message){
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${MOVIE_CONFIG.whatsappNumber}?text=${encoded}`;
  }

  function updateYesWhatsAppLink(){
    const msg =
`Okay, I'm in 😌
🎬 Movie: ${MOVIE_CONFIG.movieName}
🕐 Time: ${state.selectedTime}
📍 Cinema: ${MOVIE_CONFIG.cinema}

See you tomorrow ❤️`;
    $("#btn-whatsapp-yes").href = buildWhatsAppLink(msg);
  }

  function updateNoWhatsAppLink(){
    const msg = "Tomorrow doesn't work for me 😌";
    $("#btn-whatsapp-no").href = buildWhatsAppLink(msg);
  }

  /* ---------- confetti (yes celebration) ---------- */
  function launchConfetti(){
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const wrap = $("#confetti-wrap");
    const colors = ["#E8571F", "#D9A94E", "#F3ECDD", "#B33A12"];
    wrap.innerHTML = "";
    for (let i = 0; i < 32; i++){
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = (2.2 + Math.random() * 1.6) + "s";
      piece.style.animationDelay = (Math.random() * 0.4) + "s";
      wrap.appendChild(piece);
    }
    setTimeout(() => { wrap.innerHTML = ""; }, 4200);
  }

  /* ---------- event wiring ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderMovieCard();
    renderTimeGrid();

    $("#btn-start").addEventListener("click", () => goTo("step-1"));
    $("#btn-to-movie").addEventListener("click", () => goTo("step-2"));

    $("#btn-interested").addEventListener("click", (e) => {
      state.interested = !state.interested;
      e.currentTarget.setAttribute("aria-pressed", String(state.interested));
      $("#interest-label").textContent = state.interested ? "Interesting 👀" : "Looks interesting";
    });

    $("#btn-to-time").addEventListener("click", () => goTo("step-3"));

    $("#btn-lock-time").addEventListener("click", () => goTo("step-4"));

    document.querySelectorAll(".chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        state.snack = btn.dataset.snack;
      });
    });

    $("#btn-to-decision").addEventListener("click", () => {
      $("#decision-summary").textContent =
        `${MOVIE_CONFIG.movieName} · ${state.selectedTime}, Briva — in or out? 😌`;
      goTo("step-5");
    });

    $("#btn-yes").addEventListener("click", () => {
      $("#confirm-movie").textContent = MOVIE_CONFIG.movieName;
      $("#confirm-time").textContent = state.selectedTime;
      $("#confirm-cinema").textContent = MOVIE_CONFIG.cinema;
      updateYesWhatsAppLink();
      goTo("outcome-yes");
      launchConfetti();
    });

    $("#btn-maybe").addEventListener("click", () => goTo("outcome-maybe"));

    $("#btn-no").addEventListener("click", () => {
      updateNoWhatsAppLink();
      goTo("outcome-no");
    });

    $("#btn-remind-later").addEventListener("click", () => {
      state.reminderTapped = true;
      $("#remind-status").textContent = "Got it — I'll check back with you later 😌";
      $("#btn-remind-later").disabled = true;
      $("#btn-remind-later").style.opacity = "0.5";
    });

    $("#btn-secret").addEventListener("click", () => {
      $("#secret-reveal").classList.toggle("open");
    });

    // kick off the first screen's entrance animation
    document.getElementById("step-0").classList.add("is-entering");
  });
})();
