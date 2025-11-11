(function () {
  const items = document.querySelectorAll(".reveal");

  function inView(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return r.top < vh - 60 && r.bottom > 60;
  }

  function onEnter(el) {
    if (el.classList.contains("show")) return;
    el.classList.add("show");
    const c = el.querySelector(".counter");
    if (c && !c.dataset.started) {
      const target = parseInt(c.dataset.target || c.textContent, 10) || 0;
      runCounter(c, target);
    }
  }

  function check() {
    items.forEach((el) => inView(el) && onEnter(el));
  }

  window.addEventListener("load", check);
  window.addEventListener("scroll", check);
})();

function runCounter(el, target) {
  const duration = parseInt(el.dataset.duration, 10) || 900;
  const startValue = parseInt(el.dataset.from || 0, 10) || 0;
  const startTime = performance.now();
  el.dataset.started = "1";
  el.textContent = startValue;

  function step(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(startValue + (target - startValue) * eased);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".counter").forEach((el) => {
    if (el.dataset.started) return;
    const target = parseInt(el.dataset.target || el.textContent, 10) || 0;
    runCounter(el, target);
  });
});

$(".filter-btn").on("click", function () {
  const f = $(this).data("filter");
  $(".project-item").hide();
  (f === "all" ? $(".project-item") : $(".project-item." + f)).fadeIn();
});

window.addEventListener("load", () => {
  const photo = document.querySelector(".profile-photo");
  if (photo) photo.classList.add("show");
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      el.checkValidity();
      form.classList.add("was-validated");
    });
  });

  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }
  });
});

(function () {
  const storageKey = "theme";
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const sunSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24' +
    '" class="theme-icon icon-sun" fill="currentColor">' +
    '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.66 2.05l1.41-1.41-1.79-1.8-1.42 1.42 1.8 1.79zM17 13h3v-2h-3v2zM12 6a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8zm-1 5h2v3h-2v-3zM4.24 19.16l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM18.36 19.16l1.42-1.42-1.8-1.79-1.41 1.41 1.79 1.8z"/></svg>';
  const moonSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24' +
    '" class="theme-icon icon-moon" fill="currentColor">' +
    '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';

  if (!toggle) return;

  if (!toggle.innerHTML.trim()) toggle.innerHTML = moonSvg + sunSvg;

  const saved = localStorage.getItem(storageKey);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = saved || (prefersDark ? "dark" : "light");
  if (initial === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");

  toggle.setAttribute(
    "aria-pressed",
    root.getAttribute("data-theme") === "dark" ? "true" : "false"
  );

  toggle.addEventListener("click", function () {
    const isDark = root.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    if (next === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem(storageKey, next);
    this.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
  });
})();

// BACKEND
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form) {
    console.error("form not found");
    return;
  }

  const isLocalHost = (host) => {
    if (!host) return true;
    const normalized = host.trim().toLowerCase();
    return (
      normalized === "localhost" ||
      normalized === "127.0.0.1" ||
      normalized.endsWith(".localhost")
    );
  };

  const defaultApi = (() => {
    if (typeof window === "undefined") return "http://localhost:8080";
    const proto = window.location?.protocol || "";
    if (proto === "http:" || proto === "https:") {
      return (window.location.origin || "").replace(/\/+$/, "");
    }
    return "http://localhost:8080";
  })();
  const preferSameOrigin = isLocalHost(window.location?.hostname);
  const configuredApi = preferSameOrigin ? undefined : window.API_URL;
  const API = (configuredApi || defaultApi).replace(/\/+$/, "");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.classList.add("was-validated");

    const name = form.fullName?.value?.trim();
    const email = form.email?.value?.trim();
    const message = form.message?.value?.trim();

    if (!name || !email || !message || !form.checkValidity()) {
      console.warn("invalid form");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    try {
      btn.disabled = true;
      btn.textContent = "Sending…";

      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

      status.classList.remove("d-none", "text-danger");
      status.classList.add("text-success");
      status.textContent = "Message sent. We will respond soon.";
      form.reset();
      form.classList.remove("was-validated");
    } catch (err) {
      console.error(err);
      status.classList.remove("d-none", "text-success");
      status.classList.add("text-danger");
      status.textContent = "Error. Check console.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Send";
    }
  });
});
