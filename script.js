/* ===== 곡 목록 =====
   지금은 모두 Sample.mp3를 재생합니다.
   나중에 곡마다 다른 파일을 쓰려면 src만 바꾸면 됩니다.
   상단 타이틀은 playlistLines 를 바꾸면 됩니다. (줄바꿈 단위 배열)
*/
const tracks = [
  {
    title: "December",
    duration: "2:37",
    src: "assets/music/Sample.mp3",
    playlistLines: ["The Bear", "Official Playlist"],
  },
  {
    title: "Home",
    duration: "2:37",
    src: "assets/music/Sample.mp3",
    playlistLines: ["Sunday Morning", "Kitchen Mix"],
  },
  {
    title: "Ikokuyuki",
    duration: "2:37",
    src: "assets/music/Sample.mp3",
    playlistLines: ["Night Drive", "Vol. 01"],
  },
  {
    title: "Coffee & TV",
    duration: "2:37",
    src: "assets/music/Sample.mp3",
    playlistLines: ["Cafe Hours", "Soft Focus"],
  },
  {
    title: "Under Pressure",
    duration: "2:37",
    src: "assets/music/Sample.mp3",
    playlistLines: ["Late Shift", "Official Playlist"],
  },
];

/* ===== 화면 요소 가져오기 ===== */
const playlistEl = document.getElementById("playlist");
const playlistTitleEl = document.getElementById("playlist-title");
const audio = document.getElementById("audio");
const transportWrap = document.getElementById("transport-wrap");
const transportBtn = document.getElementById("transport-btn");
const transportArrow = document.getElementById("transport-arrow");
const transportPlay = document.getElementById("transport-play");
const transportPause = document.getElementById("transport-pause");
const progressBar = document.getElementById("progress-bar");

const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 49;

let currentIndex = -1;
let isPlaying = false;

/* ===== 상단 타이틀 바꾸기 ===== */
function updatePlaylistTitle(track) {
  const lines = track.playlistLines || [track.title];
  playlistTitleEl.innerHTML = lines
    .map((line) => `<span class="playlist__title-line">${line}</span>`)
    .join("");
}

/* ===== 플레이리스트 목록 그리기 ===== */
function renderPlaylist() {
  playlistEl.innerHTML = "";

  tracks.forEach((track, index) => {
    const li = document.createElement("li");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "playlist__item";
    button.dataset.index = String(index);

    button.innerHTML = `
      <span class="playlist__song">${track.title}</span>
      <span class="playlist__duration">${track.duration}</span>
    `;

    button.addEventListener("click", () => playTrack(index));
    li.appendChild(button);
    playlistEl.appendChild(li);
  });
}

/* ===== 곡 재생 ===== */
function playTrack(index) {
  const track = tracks[index];
  if (!track) return;

  const isSameTrack = index === currentIndex;

  /* 같은 곡을 다시 누르면 일시정지 / 재생 */
  if (isSameTrack && isPlaying) {
    audio.pause();
    isPlaying = false;
    updateActiveItem();
    updateTransport();
    return;
  }

  currentIndex = index;
  updatePlaylistTitle(track);
  updateActiveItem();
  updateTransport();

  if (!isSameTrack) {
    audio.src = track.src;
  }

  audio
    .play()
    .then(() => {
      isPlaying = true;
      updateActiveItem();
      updateTransport();
    })
    .catch(() => {
      isPlaying = false;
      updateActiveItem();
      updateTransport();
      console.warn("음악 파일을 찾을 수 없어요:", track.src);
    });
}

function toggleTransport() {
  /* 아직 곡을 고르지 않았으면 첫 곡부터 재생 */
  if (currentIndex < 0) {
    playTrack(0);
    return;
  }

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio
      .play()
      .then(() => {
        isPlaying = true;
        updateActiveItem();
        updateTransport();
      })
      .catch(() => {
        isPlaying = false;
        updateActiveItem();
        updateTransport();
      });
    return;
  }

  updateActiveItem();
  updateTransport();
}

function playNext() {
  if (tracks.length === 0) return;
  const next = currentIndex >= tracks.length - 1 ? 0 : currentIndex + 1;
  playTrack(next);
}

function updateActiveItem() {
  const items = playlistEl.querySelectorAll(".playlist__item");
  items.forEach((item, index) => {
    item.classList.toggle("is-active", index === currentIndex && isPlaying);
  });
}

/* 4번 상태
   - 미재생(진입/새로고침): arrow
   - 재생 중: 일시정지
   - 일시정지: 재생(삼각형)
*/
function updateTransport() {
  transportWrap.hidden = false;
  transportBtn.classList.toggle("is-playing", isPlaying);

  if (currentIndex < 0) {
    transportArrow.hidden = false;
    transportPlay.hidden = true;
    transportPause.hidden = true;
    transportBtn.setAttribute("aria-label", "재생");
    setProgress(0);
    return;
  }

  if (isPlaying) {
    transportArrow.hidden = true;
    transportPlay.hidden = true;
    transportPause.hidden = false;
    transportBtn.setAttribute("aria-label", "일시정지");
  } else {
    transportArrow.hidden = true;
    transportPlay.hidden = false;
    transportPause.hidden = true;
    transportBtn.setAttribute("aria-label", "재생");
  }
}

/* 원형 progress bar: 음악 길이에 맞춰 채워짐 */
function setProgress(ratio) {
  const value = Math.min(1, Math.max(0, ratio || 0));
  progressBar.style.strokeDashoffset = String(
    PROGRESS_CIRCUMFERENCE * (1 - value)
  );
}

function updateProgress() {
  const duration = audio.duration;
  if (!duration || !Number.isFinite(duration)) {
    setProgress(0);
    return;
  }
  setProgress(audio.currentTime / duration);
}

transportBtn.addEventListener("click", toggleTransport);

audio.addEventListener("ended", playNext);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("loadedmetadata", updateProgress);
audio.addEventListener("pause", () => {
  if (!audio.ended) {
    isPlaying = false;
    updateActiveItem();
    updateTransport();
  }
});
audio.addEventListener("play", () => {
  isPlaying = true;
  updateActiveItem();
  updateTransport();
});

/* ===== 2·3번: 플립 시계 ===== */
const hoursFlip = document.getElementById("flip-hours");
const minutesFlip = document.getElementById("flip-minutes");

function pad2(value) {
  return String(value).padStart(2, "0");
}

function setFlipTexts(flipEl, topValue, bottomValue) {
  const topBase = flipEl.querySelector(".flip__base--top span");
  const bottomBase = flipEl.querySelector(".flip__base--bottom span");
  const topFlap = flipEl.querySelector(".flip__flap--top span");
  const bottomFlap = flipEl.querySelector(".flip__flap--bottom span");

  topBase.textContent = topValue;
  bottomBase.textContent = bottomValue;
  topFlap.textContent = topValue;
  bottomFlap.textContent = bottomValue;
}

function resetFlip(flipEl, value) {
  flipEl.classList.remove("is-flipping");
  flipEl.dataset.value = value;
  setFlipTexts(flipEl, value, value);

  const topFlap = flipEl.querySelector(".flip__flap--top");
  const bottomFlap = flipEl.querySelector(".flip__flap--bottom");
  topFlap.style.animation = "none";
  bottomFlap.style.animation = "none";
  topFlap.style.transform = "";
  bottomFlap.style.transform = "rotateX(90deg)";
}

function flipTo(flipEl, nextValue) {
  const currentValue = flipEl.dataset.value;

  if (currentValue === nextValue) return;
  if (flipEl.classList.contains("is-flipping")) return;

  /* 위 판: 이전 숫자 / 아래 판·위 베이스: 새 숫자 */
  const topBase = flipEl.querySelector(".flip__base--top span");
  const bottomBase = flipEl.querySelector(".flip__base--bottom span");
  const topFlap = flipEl.querySelector(".flip__flap--top span");
  const bottomFlap = flipEl.querySelector(".flip__flap--bottom span");

  topFlap.textContent = currentValue;
  bottomBase.textContent = currentValue;
  topBase.textContent = nextValue;
  bottomFlap.textContent = nextValue;

  const topFlapEl = flipEl.querySelector(".flip__flap--top");
  const bottomFlapEl = flipEl.querySelector(".flip__flap--bottom");
  topFlapEl.style.animation = "";
  bottomFlapEl.style.animation = "";
  topFlapEl.style.transform = "";
  bottomFlapEl.style.transform = "rotateX(90deg)";

  /* 다음 프레임에 애니메이션 시작 (리셋이 적용되도록) */
  requestAnimationFrame(() => {
    flipEl.classList.add("is-flipping");
  });

  window.setTimeout(() => {
    resetFlip(flipEl, nextValue);
  }, 580);
}

function updateClock(initial) {
  const now = new Date();
  const hours = pad2(now.getHours());
  const minutes = pad2(now.getMinutes());

  if (initial) {
    resetFlip(hoursFlip, hours);
    resetFlip(minutesFlip, minutes);
    return;
  }

  flipTo(hoursFlip, hours);
  flipTo(minutesFlip, minutes);
}

/* ===== 시작 ===== */
renderPlaylist();
updateTransport();
updateClock(true);
setInterval(() => updateClock(false), 1000);

/* ===== 6번: 사각형 클릭 시 opacity 토글 ===== */
document.querySelectorAll(".quad__cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    const dimmed = cell.classList.toggle("is-dimmed");
    cell.setAttribute("aria-pressed", dimmed ? "true" : "false");
  });
});
