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


/* ==========================================================
   InTEGRA LIVE WORLD v5 — CLEAN
   Só NPCs + aviões + autocarro contínuo
   ========================================================== */

const liveWorld = document.getElementById("integraLiveWorld");
const airspace = document.getElementById("liveAirspace");
const npcStage = document.getElementById("npcStage");
const integrationGate = document.getElementById("integrationGate");
const busStage = document.getElementById("busStage");

const liveWorldMotionAllowed =
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

const planeSVG = `
  <span class="live-plane-trail"></span>
  <svg viewBox="0 0 140 64" aria-hidden="true">
    <defs>
      <linearGradient id="planeBodyGradient" x1="0" x2="1">
        <stop offset="0%" stop-color="#fdfdfd"/>
        <stop offset="55%" stop-color="#edf0f3"/>
        <stop offset="100%" stop-color="#cfd6dc"/>
      </linearGradient>
      <linearGradient id="planeTailGradient" x1="0" x2="1">
        <stop offset="0%" stop-color="#ff5d20"/>
        <stop offset="100%" stop-color="#ffb446"/>
      </linearGradient>
    </defs>
    <path class="live-plane-under"
      d="M12 34 C33 23 92 21 121 27 C132 29 137 34 126 40 C96 47 37 46 12 36 Z"/>
    <path class="live-plane-body"
      d="M12 30 C34 19 92 18 121 24 C133 26 137 31 126 36 C97 43 36 42 12 33 Z"/>
    <path class="live-plane-wing" d="M64 24 L94 5 L108 7 L89 27 Z"/>
    <path class="live-plane-wing" d="M62 38 L98 58 L110 55 L87 35 Z"/>
    <path class="live-plane-tail" d="M25 25 L34 8 L44 10 L42 27 Z"/>
    <circle class="live-plane-window" cx="75" cy="27" r="2.2"/>
    <circle class="live-plane-window" cx="85" cy="27" r="2.2"/>
    <circle class="live-plane-window" cx="95" cy="27" r="2.2"/>
  </svg>
`;

const busSVG = `
<svg viewBox="0 0 220 96" aria-hidden="true">
  <defs>
    <linearGradient id="busBodyGrad" x1="0" x2="1">
      <stop offset="0%" stop-color="#ff6824"/>
      <stop offset="52%" stop-color="#ff8d34"/>
      <stop offset="100%" stop-color="#ffb249"/>
    </linearGradient>
    <linearGradient id="busWindowGrad" x1="0" x2="1">
      <stop offset="0%" stop-color="#4e6879"/>
      <stop offset="100%" stop-color="#18232c"/>
    </linearGradient>
  </defs>

  <ellipse cx="110" cy="90" rx="84" ry="5" fill="rgba(0,0,0,.25)"/>

  <path
    d="M20 70 L20 42 C20 26 34 18 50 18 H165 C181 18 194 28 198 42
       L202 60 C204 69 198 76 189 76 H36 C26 76 20 74 20 70Z"
    fill="url(#busBodyGrad)"
    stroke="rgba(255,255,255,.28)"
    stroke-width="1.4"
  />

  <rect x="44" y="28" width="112" height="26" rx="8" fill="url(#busWindowGrad)"/>
  <rect x="159" y="29" width="24" height="38" rx="6" fill="url(#busWindowGrad)"/>
  <rect x="55" y="35" width="92" height="7" rx="3.5" fill="rgba(255,255,255,.13)"/>

  <text
    x="101"
    y="65"
    text-anchor="middle"
    font-size="14"
    font-weight="800"
    fill="#fff4ea"
    font-family="Manrope, Arial, sans-serif"
  >INTEGRA</text>

  <circle cx="59" cy="77" r="12" fill="#212121"/>
  <circle cx="59" cy="77" r="5" fill="#bfc5ca"/>

  <circle cx="168" cy="77" r="12" fill="#212121"/>
  <circle cx="168" cy="77" r="5" fill="#bfc5ca"/>

  <circle cx="32" cy="53" r="4" fill="#ffd47c"/>
  <circle cx="188" cy="56" r="4" fill="#ffd47c"/>
</svg>`;

let planeCounter = 0;
let planeRunning = false;

async function spawnLivePlane() {
  if (!airspace || !liveWorldMotionAllowed) return;

  const plane = document.createElement("div");
  plane.className = "live-plane";
  plane.innerHTML = planeSVG;
  airspace.appendChild(plane);

  const fromLeft = planeCounter % 2 === 0;
  const variation = planeCounter % 5;
  planeCounter += 1;

  const width = airspace.clientWidth;
  const height = airspace.clientHeight;

  const startX = fromLeft ? -120 : width + 120;
  const startY = 12 + variation * 11;

  const endX = width * (.49 + (variation % 2 ? .03 : -.03));
  const endY = height * (.84 - variation * .03);

  const midX = fromLeft
    ? width * (.22 + variation * .03)
    : width * (.78 - variation * .03);

  const midY = height * (.18 + variation * .05);

  const flip = fromLeft ? 1 : -1;

  const animation = plane.animate(
    [
      {
        transform:
          `translate(${startX}px, ${startY}px)
           scale(${flip},1)
           rotate(${fromLeft ? 5 : -5}deg)`,
        opacity: 0
      },
      {
        transform:
          `translate(${midX}px, ${midY}px)
           scale(${flip},1)
           rotate(${fromLeft ? 1.5 : -1.5}deg)`,
        opacity: .98,
        offset: .28
      },
      {
        transform:
          `translate(${endX}px, ${endY}px)
           scale(${flip * .40},.40)
           rotate(${fromLeft ? -5 : 5}deg)`,
        opacity: .9,
        offset: .85
      },
      {
        transform:
          `translate(${endX + (fromLeft ? 8 : -8)}px, ${endY + 5}px)
           scale(${flip * .12},.12)
           rotate(0deg)`,
        opacity: 0
      }
    ],
    {
      duration: 6200 + variation * 220,
      easing: "cubic-bezier(.25,.65,.25,1)",
      fill: "forwards"
    }
  );

  await animation.finished;
  plane.remove();
}

async function startPlaneTraffic() {
  if (!airspace || !liveWorldMotionAllowed || planeRunning) return;

  planeRunning = true;

  while (true) {
    await spawnLivePlane();
    await wait(3000);
  }
}

/* ---------------- NPCS ---------------- */

const npcProfiles = [
  {
    id: "man-orange",
    type: "man",
    shirt: "#ff6d29",
    shirtDark: "#d54e13",
    pants: "#41342d",
    skin: "#e7b18e",
    hair: "#2f211b",
    bag: "#ff9b52",
    keyword: "Documentos",
    lines: [
      "Preciso de ajuda para começar bem.",
      "Quero tratar dos meus documentos.",
      "Aqui sinto que o caminho fica mais claro."
    ]
  },
  {
    id: "woman-blue",
    type: "woman",
    shirt: "#4f8edc",
    shirtDark: "#336cc2",
    pants: "#29384a",
    skin: "#8f5e45",
    hair: "#1a1614",
    bag: "#86c0ff",
    keyword: "Trabalho",
    lines: [
      "Estou à procura de trabalho e estabilidade.",
      "Quero construir o meu futuro em Portugal.",
      "Procuro oportunidades reais."
    ]
  },
  {
    id: "child-yellow",
    type: "child",
    shirt: "#e0b03b",
    shirtDark: "#b98b1a",
    pants: "#534226",
    skin: "#f0c6a7",
    hair: "#6f4729",
    bag: "#ffd777",
    keyword: "Escola",
    lines: [
      "Quero aprender e sentir-me em casa.",
      "Também faço parte desta viagem.",
      "Aqui parece haver um lugar para mim."
    ]
  },
  {
    id: "woman-purple",
    type: "woman",
    shirt: "#8b5bd6",
    shirtDark: "#6c41b5",
    pants: "#342b43",
    skin: "#c98968",
    hair: "#241813",
    bag: "#c5a1ff",
    keyword: "Casa",
    lines: [
      "Quero encontrar casa e recomeçar.",
      "Procuro segurança para a minha família.",
      "A chegada é difícil, mas não devia ser confusa."
    ]
  },
  {
    id: "man-green",
    type: "man",
    shirt: "#3f9f7b",
    shirtDark: "#2f7c61",
    pants: "#223530",
    skin: "#d9a17e",
    hair: "#231a16",
    bag: "#7ee2bc",
    keyword: "Saúde",
    lines: [
      "Preciso de saber onde ir e com quem falar.",
      "Orientação faz toda a diferença.",
      "Quero acesso simples a serviços essenciais."
    ]
  },
  {
    id: "girl-pink",
    type: "child",
    shirt: "#e5679d",
    shirtDark: "#bd477a",
    pants: "#4f2b3b",
    skin: "#f4c8aa",
    hair: "#4a2c21",
    bag: "#ffaad0",
    keyword: "Comunidade",
    lines: [
      "É bom encontrar pessoas que ajudam.",
      "Aqui ninguém devia sentir-se sozinho.",
      "Quero fazer parte de algo maior."
    ]
  },
  {
    id: "man-red",
    type: "man",
    shirt: "#da4f3e",
    shirtDark: "#b83c2d",
    pants: "#312824",
    skin: "#8c553f",
    hair: "#151210",
    bag: "#ff917f",
    keyword: "Português",
    lines: [
      "Quero comunicar melhor e integrar-me.",
      "A língua não devia ser uma barreira total.",
      "Aprender ajuda-me a abrir portas."
    ]
  },
  {
    id: "woman-teal",
    type: "woman",
    shirt: "#35a6b7",
    shirtDark: "#228395",
    pants: "#243a40",
    skin: "#b87958",
    hair: "#2a1d18",
    bag: "#80e1f1",
    keyword: "Oportunidades",
    lines: [
      "Quero uma oportunidade justa.",
      "Empresas e pessoas podem crescer juntas.",
      "A integração também cria valor para o país."
    ]
  },
  {
    id: "child-lime",
    type: "child",
    shirt: "#84c946",
    shirtDark: "#63a02c",
    pants: "#365128",
    skin: "#d09771",
    hair: "#453026",
    bag: "#c8ee93",
    keyword: "Futuro",
    lines: [
      "Quero um futuro mais simples e seguro.",
      "Sonhar é mais fácil quando há apoio.",
      "Começar de novo devia ser mais humano."
    ]
  },
  {
    id: "man-charcoal",
    type: "man",
    shirt: "#6d7485",
    shirtDark: "#525866",
    pants: "#222831",
    skin: "#f0be97",
    hair: "#2d211d",
    bag: "#adb6c5",
    keyword: "Integração",
    lines: [
      "Não é só chegar. É conseguir pertencer.",
      "Integrar é orientar, ligar e abrir caminhos.",
      "É isso que me trouxe até aqui."
    ]
  }
];

const npcCooldowns = new Map();
const lineCooldowns = new Map();
const activeNPCs = new Set();

let cycleIndex = 0;
let lineIndex = 0;
let laneToggle = 0;

function availableProfiles() {
  const now = Date.now();

  return npcProfiles.filter(profile => {
    const last = npcCooldowns.get(profile.id) || 0;
    return now - last > 60000;
  });
}

function reserveProfile(profile) {
  npcCooldowns.set(profile.id, Date.now());
}

function nextUniqueProfiles(count) {
  let pool = availableProfiles();

  if (pool.length < count) {
    pool = npcProfiles.slice();
  }

  const selected = [];

  while (selected.length < count && pool.length) {
    const idx = (cycleIndex + selected.length) % pool.length;
    const profile = pool.splice(idx, 1)[0];

    selected.push(profile);
    reserveProfile(profile);
  }

  cycleIndex += count;

  return selected;
}

function nextLine(profile) {
  const now = Date.now();

  const available = profile.lines.filter(line => {
    const key = profile.id + "|" + line;
    const last = lineCooldowns.get(key) || 0;

    return now - last > 60000;
  });

  const pool = available.length ? available : profile.lines;
  const line = pool[lineIndex % pool.length];

  lineCooldowns.set(profile.id + "|" + line, now);
  lineIndex += 1;

  return line;
}

function npcScale(profile) {
  if (profile.type === "child") return .76;
  if (profile.type === "woman") return .88;

  return .90;
}

function npcSVG(profile, mirrored = false) {
  const isChild = profile.type === "child";

  const torsoY2 = isChild ? 74 : 82;
  const legStartY = isChild ? 72 : 82;

  const skirt =
    profile.type === "woman"
      ? `<path
           class="npc-skirt"
           d="M22 50 Q32 44 42 50 L46 80 Q32 86 18 80 Z"
           fill="url(#shirtGrad-${profile.id})"
         />`
      : "";

  const torso =
    profile.type === "woman"
      ? `<path
           class="npc-jacket"
           d="M22 34 Q32 28 42 34
              L44 ${torsoY2}
              Q32 ${torsoY2 + 4} 20 ${torsoY2} Z"
           fill="url(#shirtGrad-${profile.id})"
         />`
      : `<path
           class="npc-shirt"
           d="M22 34 Q32 29 42 34
              L45 ${torsoY2}
              Q32 ${torsoY2 + 3} 19 ${torsoY2} Z"
           fill="url(#shirtGrad-${profile.id})"
         />`;

  return `
    <svg viewBox="0 0 64 120" aria-hidden="true">
      <defs>
        <linearGradient
          id="shirtGrad-${profile.id}"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stop-color="${profile.shirt}"/>
          <stop offset="100%" stop-color="${profile.shirtDark}"/>
        </linearGradient>
      </defs>

      <ellipse
        cx="32"
        cy="114"
        rx="16"
        ry="4"
        fill="rgba(0,0,0,.23)"
      />

      <circle
        class="npc-head"
        cx="32"
        cy="18"
        r="12"
        fill="${profile.skin}"
      />

      <ellipse
        class="npc-head-shine"
        cx="36"
        cy="14"
        rx="3.6"
        ry="2.4"
      />

      <path
        class="npc-hair"
        d="M20 20
           C20 7 27 5 32 5
           C41 5 45 12 44 22
           C40 15 37 13 32 13
           C27 13 23 15 20 20 Z"
      />

      <circle class="npc-eye" cx="28" cy="18" r="1.2"/>
      <circle class="npc-eye" cx="36" cy="18" r="1.2"/>

      <path
        class="npc-mouth"
        d="M28 23 Q32 25 36 23"
      />

      <path
        class="npc-torso-shadow"
        d="M22 38
           Q32 33 42 38
           L43 ${torsoY2 - 4}
           Q32 ${torsoY2} 21 ${torsoY2 - 4} Z"
      />

      ${torso}
      ${skirt}

      <g class="npc-arm-left">
        <path
          d="M23 42 L13 62"
          stroke="${profile.skin}"
          stroke-width="6"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      <g class="npc-arm-right">
        <path
          d="M41 42 L51 60"
          stroke="${profile.skin}"
          stroke-width="6"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      <g class="npc-leg-left">
        <path
          class="npc-pants"
          d="M27 ${legStartY} L25 98"
          stroke="${profile.pants}"
          stroke-width="7"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M25 98 L18 103"
          stroke="#f3eee9"
          stroke-width="4"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      <g class="npc-leg-right">
        <path
          class="npc-pants"
          d="M37 ${legStartY} L39 98"
          stroke="${profile.pants}"
          stroke-width="7"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M39 98 L46 103"
          stroke="#f3eee9"
          stroke-width="4"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      <g class="npc-luggage">
        <rect
          x="${mirrored ? 4 : 45}"
          y="68"
          width="14"
          height="24"
          rx="4"
          fill="rgba(18,18,18,.78)"
          stroke="${profile.bag}"
          stroke-width="1.8"
        />

        <path
          d="${
            mirrored
              ? "M7 68 L7 63 Q7 60 10 60 L12 60 Q15 60 15 63 L15 68"
              : "M48 68 L48 63 Q48 60 51 60 L53 60 Q56 60 56 63 L56 68"
          }"
          stroke="${profile.bag}"
          stroke-width="1.6"
          fill="none"
        />
      </g>
    </svg>
  `;
}

function buildSpeechMarkup(profile, line) {
  return `
    <span class="npc-speech-keyword">
      ${profile.keyword}
    </span>

    <span class="npc-speech-text">
      ${line}
    </span>
  `;
}

function createNpc(profile, side = "left") {
  if (!npcStage) return null;

  const npc = document.createElement("div");

  npc.className = "game-npc";
  npc.dataset.profile = profile.id;
  npc.dataset.side = side;

  npc.innerHTML = `
    <div class="npc-speech"></div>

    <div class="npc-sprite-wrap">
      ${npcSVG(profile, side === "right")}
    </div>
  `;

  npcStage.appendChild(npc);
  activeNPCs.add(npc);

  return npc;
}

function setNpcPosition(npc, x, y) {
  npc.dataset.x = String(x);
  npc.dataset.y = String(y);

  npc.style.transform =
    `translate(${x}px, ${y}px)`;
}

/*
  IMPORTANTE:
  Só o SVG do personagem é espelhado.
  O balão fica sempre orientado corretamente.
*/
function setSpriteDirection(npc, direction, scale) {
  const sprite = npc.querySelector(".npc-sprite-wrap");
  const bubble = npc.querySelector(".npc-speech");

  if (sprite) {
    sprite.style.transform =
      `translateX(-50%)
       scale(${direction * scale}, ${scale})`;
  }

  if (bubble) {
    bubble.style.left =
      direction === 1 ? "70%" : "30%";
  }
}

function animateNpcTo(
  npc,
  x,
  y,
  duration,
  direction,
  scale = 1
) {
  const fromX = Number(npc.dataset.x || 0);
  const fromY = Number(npc.dataset.y || 0);

  setSpriteDirection(npc, direction, scale);

  npc.classList.add("walking");
  npc.classList.remove("talking");

  const animation = npc.animate(
    [
      {
        transform:
          `translate(${fromX}px, ${fromY}px)`
      },
      {
        transform:
          `translate(${x}px, ${y}px)`
      }
    ],
    {
      duration,
      easing: "linear",
      fill: "forwards"
    }
  );

  return animation.finished.then(() => {
    npc.classList.remove("walking");
    setNpcPosition(npc, x, y);
  });
}

function speakNpc(npc, profile, text, ms = 2500) {
  return new Promise(resolve => {
    const bubble =
      npc.querySelector(".npc-speech");

    if (bubble) {
      bubble.innerHTML =
        buildSpeechMarkup(profile, text);
    }

    npc.classList.add("talking");

    window.setTimeout(() => {
      npc.classList.remove("talking");
      resolve();
    }, ms);
  });
}

function laneData(index) {
  const lanes = [.50, .61, .70];

  return {
    lane: lanes[index % lanes.length],
    z: 18 + (index % lanes.length)
  };
}

async function runNpcStory(
  profile,
  side,
  laneIndex,
  partnerMode = false
) {
  if (
    !npcStage ||
    !integrationGate ||
    !liveWorldMotionAllowed
  ) return;

  const npc = createNpc(profile, side);

  if (!npc) return;

  const width = npcStage.clientWidth;
  const height = npcStage.clientHeight;

  const direction =
    side === "left" ? 1 : -1;

  const scale = npcScale(profile);

  const lane =
    laneData(laneIndex);

  npc.style.zIndex =
    String(lane.z);

  const startX =
    side === "left"
      ? -65
      : width + 65;

  const startY =
    height * lane.lane;

  const talkX =
    side === "left"
      ? width * (
          partnerMode
            ? .28 + laneIndex * .025
            : .34 + laneIndex * .025
        )
      : width * (
          partnerMode
            ? .62 - laneIndex * .025
            : .56 - laneIndex * .025
        );

  const talkY =
    height * lane.lane;

  const portalX =
    width * .50 - 20;

  const portalY =
    -height * .16;

  setNpcPosition(
    npc,
    startX,
    startY
  );

  setSpriteDirection(
    npc,
    direction,
    scale
  );

  npc.style.opacity = "1";

  await animateNpcTo(
    npc,
    talkX,
    talkY,
    4100 + laneIndex * 220,
    direction,
    scale
  );

  await speakNpc(
    npc,
    profile,
    nextLine(profile),
    partnerMode ? 2800 : 2400
  );

  const portalDirection =
    portalX >= talkX ? 1 : -1;

  await animateNpcTo(
    npc,
    portalX,
    portalY,
    3300 + laneIndex * 120,
    portalDirection,
    scale * .66
  );

  npc.classList.add("entering");

  await npc.animate(
    [
      {
        transform:
          `translate(${portalX}px, ${portalY}px)`,
        opacity: 1,
        filter: "blur(0px)"
      },
      {
        transform:
          `translate(${portalX + 10}px, ${portalY - 14}px)`,
        opacity: 0,
        filter: "blur(2px)"
      }
    ],
    {
      duration: 920,
      easing: "cubic-bezier(.4,0,.8,.2)",
      fill: "forwards"
    }
  ).finished;

  activeNPCs.delete(npc);
  npc.remove();
}

let npcLoopRunning = false;

async function startNpcWorld() {
  if (
    !npcStage ||
    !liveWorldMotionAllowed ||
    npcLoopRunning
  ) return;

  npcLoopRunning = true;

  while (true) {
    while (activeNPCs.size > 3) {
      await wait(900);
    }

    const modeRoll =
      Math.random();

    if (modeRoll < .42) {
      const [profile] =
        nextUniqueProfiles(1);

      runNpcStory(
        profile,
        Math.random() > .5
          ? "left"
          : "right",
        laneToggle++
      );

      await wait(5000);
    }

    else if (modeRoll < .84) {
      const pair =
        nextUniqueProfiles(2);

      runNpcStory(
        pair[0],
        "left",
        laneToggle++,
        true
      );

      await wait(1200);

      runNpcStory(
        pair[1],
        "right",
        laneToggle++,
        true
      );

      await wait(7600);
    }

    else {
      const group =
        nextUniqueProfiles(3);

      runNpcStory(
        group[0],
        "left",
        laneToggle++,
        true
      );

      await wait(850);

      runNpcStory(
        group[1],
        "left",
        laneToggle++,
        true
      );

      await wait(950);

      runNpcStory(
        group[2],
        "right",
        laneToggle++,
        true
      );

      await wait(9000);
    }
  }
}

/* ---------------- AUTOCARRO CONTÍNUO ---------------- */

let busRunning = false;

async function runBusAcrossScene() {
  if (!busStage || !liveWorldMotionAllowed) return;

  const bus =
    document.createElement("div");

  bus.className = "integra-bus";
  bus.innerHTML = busSVG;

  busStage.appendChild(bus);

  const width =
    busStage.clientWidth;

  /*
    O autocarro não entra no logo.
    Passa pela frente da área inferior e continua caminho
    até sair do outro lado da cena.
  */
  const animation =
    bus.animate(
      [
        {
          transform:
            "translate(-180px, 0px) scale(1)",
          opacity: 0
        },
        {
          transform:
            `translate(${width * .14}px, 0px) scale(1)`,
          opacity: 1,
          offset: .18
        },
        {
          transform:
            `translate(${width * .48}px, -4px) scale(.96)`,
          opacity: 1,
          offset: .54
        },
        {
          transform:
            `translate(${width * .78}px, -2px) scale(.98)`,
          opacity: 1,
          offset: .82
        },
        {
          transform:
            `translate(${width + 190}px, 0px) scale(1)`,
          opacity: 0
        }
      ],
      {
        duration: 11800,
        easing: "linear",
        fill: "forwards"
      }
    );

  await animation.finished;

  bus.remove();
}

async function startBusTraffic() {
  if (
    !busStage ||
    !liveWorldMotionAllowed ||
    busRunning
  ) return;

  busRunning = true;

  await wait(4000);

  while (true) {
    await runBusAcrossScene();

    /*
      Pequena pausa antes de um novo autocarro.
      O anterior já continuou caminho e saiu da cena.
    */
    await wait(14000);
  }
}

function startIntegraLiveWorld() {
  if (
    !liveWorld ||
    !liveWorldMotionAllowed
  ) return;

  startPlaneTraffic();
  startNpcWorld();
  startBusTraffic();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      window.setTimeout(
        startIntegraLiveWorld,
        700
      );
    }
  );
}
else {
  window.setTimeout(
    startIntegraLiveWorld,
    700
  );
}
