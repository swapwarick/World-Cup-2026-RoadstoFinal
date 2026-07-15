const finalDate = new Date("2026-07-20T00:30:00+05:30").getTime();

const parts = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = Date.now();
  const delta = Math.max(finalDate - now, 0);

  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  parts.days.textContent = pad(days);
  parts.hours.textContent = pad(hours);
  parts.minutes.textContent = pad(minutes);
  parts.seconds.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function getSectionState(section) {
  const isMobile = window.innerWidth <= 760;
  return {
    x: Number((isMobile ? section.dataset.ballMobileX : section.dataset.ballX) || 70),
    y: Number((isMobile ? section.dataset.ballMobileY : section.dataset.ballY) || 18),
    scale: Number((isMobile ? section.dataset.ballMobileScale : section.dataset.ballScale) || 1),
    rotate: Number((isMobile ? section.dataset.ballMobileRotate : section.dataset.ballRotate) || 0),
  };
}

function mountBallMotion() {
  const shell = document.getElementById("ball-shell");
  const model = document.getElementById("cup-ball");
  const sections = [...document.querySelectorAll(".ball-section")];
  if (!shell || !model || !sections.length) {
    return;
  }

  model.addEventListener("load", () => {
    model.cameraOrbit = "0deg 78deg 105%";
    model.fieldOfView = "28deg";
  });

  function updateShellPosition() {
    const viewportCenter = window.innerHeight * 0.5;
    const metrics = sections.map((section) => {
      const rect = section.getBoundingClientRect();
      return {
        rect,
        state: getSectionState(section),
        center: rect.top + rect.height / 2,
      };
    });

    let current = metrics[0];
    let next = metrics[metrics.length - 1];

    for (let index = 0; index < metrics.length; index += 1) {
      if (metrics[index].center <= viewportCenter) {
        current = metrics[index];
        next = metrics[Math.min(index + 1, metrics.length - 1)];
      }
    }

    let progress = 0;
    if (current !== next) {
      progress = clamp((viewportCenter - current.center) / (next.center - current.center), 0, 1);
    }

    const x = lerp(current.state.x, next.state.x, progress);
    const y = lerp(current.state.y, next.state.y, progress);
    const scale = lerp(current.state.scale, next.state.scale, progress);
    const rotate = lerp(current.state.rotate, next.state.rotate, progress);

    shell.style.setProperty("--ball-left", `${x}vw`);
    shell.style.setProperty("--ball-top", `${y}vh`);
    shell.style.setProperty("--ball-scale", scale.toFixed(3));
    model.style.transform = `rotate(${rotate}deg)`;
  }

  updateShellPosition();
  window.addEventListener("scroll", updateShellPosition, { passive: true });
  window.addEventListener("resize", updateShellPosition);
}

mountBallMotion();



