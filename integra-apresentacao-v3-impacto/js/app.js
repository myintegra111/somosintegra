const topbar = document.getElementById("topbar");
const modal = document.getElementById("videoModal");
const modalClose = document.getElementById("modalClose");
const modalVideo = document.getElementById("modalVideo");
const modalTitle = document.getElementById("modalTitle");
const videoPlaceholder = document.getElementById("videoPlaceholder");
let lastFocusedElement = null;

if (topbar) {
  window.addEventListener("scroll", () => {
    topbar.classList.toggle("scrolled", window.scrollY > 24);
  }, { passive: true });
}

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

document.querySelectorAll(".hero .reveal").forEach((element) => {
  window.setTimeout(() => element.classList.add("visible"), 120);
});

function openVideo(fileName, title, trigger) {
  if (!modal || !modalVideo || !modalTitle || !videoPlaceholder) return;

  lastFocusedElement = trigger || document.activeElement;
  modal.hidden = false;
  modalTitle.textContent = title || "Vídeo InTEGRA";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  modal.removeAttribute("inert");
  document.body.classList.add("modal-open");
  modalClose?.focus();

  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modalVideo.style.display = "none";
  videoPlaceholder.style.display = "grid";

  modalVideo.src = `videos/${fileName}`;
  modalVideo.onloadedmetadata = () => {
    modalVideo.style.display = "block";
    videoPlaceholder.style.display = "none";
  };
  modalVideo.onerror = () => {
    modalVideo.style.display = "none";
    videoPlaceholder.style.display = "grid";
  };
  modalVideo.load();
}

function closeVideo() {
  if (!modal || !modalVideo) return;
  modalVideo.pause();
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("inert", "");
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

document.querySelectorAll("[data-video]").forEach((item) => {
  item.addEventListener("click", () => {
    openVideo(item.dataset.video, item.dataset.title, item);
  });

  if (!item.matches("button, a, input, select, textarea")) {
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openVideo(item.dataset.video, item.dataset.title, item);
      }
    });
  }
});

modalClose?.addEventListener("click", closeVideo);
modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeVideo();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("open")) closeVideo();
});

const world = document.getElementById("world3d");
const stage = document.querySelector(".world-stage");

if (stage && world && window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
  stage.addEventListener("mousemove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    world.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
  });

  stage.addEventListener("mouseleave", () => {
    world.style.transform = "";
  });
}
