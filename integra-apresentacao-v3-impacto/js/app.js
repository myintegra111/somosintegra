const topbar = document.getElementById("topbar");
const modal = document.getElementById("videoModal");
const modalClose = document.getElementById("modalClose");
const modalVideo = document.getElementById("modalVideo");
const modalTitle = document.getElementById("modalTitle");
const videoPlaceholder = document.getElementById("videoPlaceholder");
const videoCounter = document.getElementById("videoCounter");
const modalChapterLabel = document.getElementById("modalChapterLabel");
const nextVideoTitle = document.getElementById("nextVideoTitle");
const presentationProgress = document.getElementById("presentationProgress");
const prevVideo = document.getElementById("prevVideo");
const nextVideo = document.getElementById("nextVideo");

let lastFocusedElement = null;
let currentPresentationIndex = 0;
let shouldAutoplayOnLoad = false;

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

const presentationCards = [...document.querySelectorAll(".video-card[data-video]")];

const presentationItems = presentationCards.map((card) => ({
  fileName: card.dataset.video,
  title: card.dataset.title || "Vídeo InTEGRA",
  trigger: card
}));

function buildProgress() {
  if (!presentationProgress) return;
  presentationProgress.innerHTML = "";

  presentationItems.forEach((_, index) => {
    const segment = document.createElement("span");

    if (index < currentPresentationIndex) {
      segment.classList.add("completed");
    }

    if (index === currentPresentationIndex) {
      segment.classList.add("active");
    }

    presentationProgress.appendChild(segment);
  });
}

function updatePresentationNavigation() {
  const total = presentationItems.length;
  const current = presentationItems[currentPresentationIndex];

  if (videoCounter) {
    videoCounter.textContent = `${currentPresentationIndex + 1} / ${total}`;
  }

  if (modalChapterLabel) {
    modalChapterLabel.textContent =
      `Capítulo ${currentPresentationIndex + 1} de ${total}`;
  }

  if (prevVideo) {
    prevVideo.disabled = currentPresentationIndex === 0;
  }

  if (nextVideo) {
    nextVideo.disabled = currentPresentationIndex >= total - 1;
    nextVideo.classList.remove("attention");
  }

  if (nextVideoTitle) {
    if (currentPresentationIndex < total - 1) {
      nextVideoTitle.textContent =
        `A seguir: ${presentationItems[currentPresentationIndex + 1].title}`;
    } else {
      nextVideoTitle.textContent = "Último capítulo da apresentação";
    }
  }

  if (modalTitle && current) {
    modalTitle.textContent = current.title;
  }

  buildProgress();
}

function loadPresentationVideo(index, autoplay = false) {
  if (
    !modal ||
    !modalVideo ||
    !modalTitle ||
    !videoPlaceholder ||
    !presentationItems.length
  ) return;

  const safeIndex = Math.max(
    0,
    Math.min(index, presentationItems.length - 1)
  );

  currentPresentationIndex = safeIndex;
  shouldAutoplayOnLoad = autoplay;

  const current = presentationItems[currentPresentationIndex];

  updatePresentationNavigation();

  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modalVideo.style.display = "none";

  videoPlaceholder.style.display = "grid";

  modalVideo.src = `videos/${current.fileName}`;

  modalVideo.onloadedmetadata = () => {
    modalVideo.style.display = "block";
    videoPlaceholder.style.display = "none";

    if (shouldAutoplayOnLoad) {
      modalVideo.play().catch(() => {});
    }
  };

  modalVideo.onerror = () => {
    modalVideo.style.display = "none";
    videoPlaceholder.style.display = "grid";
  };

  modalVideo.load();
}

function openPresentation(index = 0, trigger = null) {
  if (!modal || !presentationItems.length) return;

  lastFocusedElement = trigger || document.activeElement;

  modal.hidden = false;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  modal.removeAttribute("inert");
  document.body.classList.add("modal-open");

  loadPresentationVideo(index, true);

  window.setTimeout(() => {
    modalClose?.focus();
  }, 20);
}

function closePresentation() {
  if (!modal || !modalVideo) return;

  modalVideo.pause();
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("inert", "");
  modal.hidden = true;
  document.body.classList.remove("modal-open");

  nextVideo?.classList.remove("attention");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

presentationCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    openPresentation(index, card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPresentation(index, card);
    }
  });
});

document.querySelectorAll("[data-presentation-start]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const index = Number(trigger.dataset.presentationStart || 0);
    openPresentation(index, trigger);
  });
});

prevVideo?.addEventListener("click", () => {
  if (currentPresentationIndex > 0) {
    loadPresentationVideo(currentPresentationIndex - 1, true);
  }
});

nextVideo?.addEventListener("click", () => {
  if (currentPresentationIndex < presentationItems.length - 1) {
    loadPresentationVideo(currentPresentationIndex + 1, true);
  }
});

modalVideo?.addEventListener("ended", () => {
  if (currentPresentationIndex < presentationItems.length - 1) {
    nextVideo?.classList.add("attention");
    nextVideo?.focus();
  }
});

modalClose?.addEventListener("click", closePresentation);

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    closePresentation();
  }
});

document.addEventListener("keydown", (event) => {
  if (!modal?.classList.contains("open")) return;

  if (event.key === "Escape") {
    closePresentation();
  }

  if (
    event.key === "ArrowRight" &&
    currentPresentationIndex < presentationItems.length - 1
  ) {
    loadPresentationVideo(currentPresentationIndex + 1, true);
  }

  if (
    event.key === "ArrowLeft" &&
    currentPresentationIndex > 0
  ) {
    loadPresentationVideo(currentPresentationIndex - 1, true);
  }
});

const world = document.getElementById("world3d");
const stage = document.querySelector(".world-stage");

if (
  stage &&
  world &&
  window.matchMedia(
    "(pointer: fine) and (prefers-reduced-motion: no-preference)"
  ).matches
) {
  stage.addEventListener("mousemove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    world.style.transform =
      `rotateX(${(-y * 8).toFixed(2)}deg) ` +
      `rotateY(${(x * 10).toFixed(2)}deg)`;
  });

  stage.addEventListener("mouseleave", () => {
    world.style.transform = "";
  });
}
