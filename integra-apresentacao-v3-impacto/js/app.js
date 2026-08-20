const topbar = document.getElementById("topbar");
const modal = document.getElementById("videoModal");
const modalClose = document.getElementById("modalClose");
const modalVideo = document.getElementById("modalVideo");
const modalTitle = document.getElementById("modalTitle");
const videoPlaceholder = document.getElementById("videoPlaceholder");

window.addEventListener("scroll", () => {
  topbar.classList.toggle("scrolled", window.scrollY > 24);
});

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

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Make hero visible immediately
document.querySelectorAll(".hero .reveal").forEach((el) => {
  setTimeout(() => el.classList.add("visible"), 120);
});

function openVideo(fileName, title) {
  modalTitle.textContent = title || "Vídeo InTEGRA";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const source = `videos/${fileName}`;
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modalVideo.style.display = "none";
  videoPlaceholder.style.display = "grid";

  fetch(source, { method: "HEAD" })
    .then((response) => {
      if (!response.ok) throw new Error("Vídeo não encontrado");
      modalVideo.src = source;
      modalVideo.style.display = "block";
      videoPlaceholder.style.display = "none";
      modalVideo.load();
    })
    .catch(() => {
      // When opened directly via file:// some browsers block fetch.
      // Try loading the video and fall back to the placeholder if it fails.
      modalVideo.src = source;
      modalVideo.onloadedmetadata = () => {
        modalVideo.style.display = "block";
        videoPlaceholder.style.display = "none";
      };
      modalVideo.onerror = () => {
        modalVideo.style.display = "none";
        videoPlaceholder.style.display = "grid";
      };
      modalVideo.load();
    });
}

function closeVideo() {
  modalVideo.pause();
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-video]").forEach((item) => {
  item.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    openVideo(item.dataset.video, item.dataset.title);
  });
});

modalClose.addEventListener("click", closeVideo);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeVideo();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeVideo();
  }
});

// Subtle interactive 3D parallax for the InTEGRA world.
const world = document.getElementById("world3d");
const stage = document.querySelector(".world-stage");

if (stage && world && window.matchMedia("(pointer:fine)").matches) {
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
