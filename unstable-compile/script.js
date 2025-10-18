const DATA_PATH = "data.json";
const PAGE_SIZE = 12;
let allVideos = [];
let shown = 0;

const grid = document.getElementById("grid");
const loadMoreBtn = document.getElementById("loadMore");
const modal = document.getElementById("modal");
const playerWrap = document.getElementById("playerWrap");
const playerTitle = document.getElementById("playerTitle");
const closeModal = document.getElementById("closeModal");

function thumbUrl(vid){
  return `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
}

function showSkeletons(n=6){
  grid.innerHTML = Array.from({length:n}).map(_=>`<div class="card"><div class="skeleton"></div></div>`).join("");
}

function renderBatch(){
  const batch = allVideos.slice(shown, shown + PAGE_SIZE);
  const html = batch.map(v=>`
    <div class="card">
      <a class="thumb-link" data-id="${v.videoId}" data-title="${escapeHtml(v.title)}" href="#" >
        <img class="thumb" loading="lazy" src="${thumbUrl(v.videoId)}" alt="${escapeHtml(v.title)}">
      </a>
      <div class="meta">
        <div class="title">${escapeHtml(v.title)}</div>
        <div class="chinfo">${escapeHtml(v.channel)} • ${new Date(v.published).toLocaleString()}</div>
      </div>
    </div>
  `).join("");
  if (shown === 0) grid.innerHTML = html;
  else grid.insertAdjacentHTML("beforeend", html);
  shown += batch.length;
  if (shown >= allVideos.length) loadMoreBtn.style.display = "none";
}

function escapeHtml(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

async function init(){
  showSkeletons(8);
  try{
    const res = await fetch(DATA_PATH, {cache: "no-cache"});
    const data = await res.json();
    // ensure newest-first. If workflow already sorted descending, this is safe:
    // but do a defensive sort here anyway:
    allVideos = data.sort((a,b)=> new Date(b.published) - new Date(a.published));
    // only keep needed fields (reduce memory)
    allVideos = allVideos.map(v=>({
      title: v.title,
      videoId: v.videoId,
      published: v.published,
      channel: v.channel
    }));
    renderBatch();
    attachThumbnailClicks();
  }catch(err){
    grid.innerHTML = `<div style="color:#ff7b7b;padding:20px">failed to load data. console for details.</div>`;
    console.error(err);
  }
}

function attachThumbnailClicks(){
  grid.addEventListener("click", e=>{
    const a = e.target.closest(".thumb-link");
    if(!a) return;
    e.preventDefault();
    const id = a.dataset.id;
    const title = a.dataset.title;
    openPlayer(id, title);
  });
}

function openPlayer(videoId, title){
  playerWrap.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.setAttribute("allowfullscreen","");
  playerWrap.appendChild(iframe);
  playerTitle.textContent = title;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
}

closeModal.addEventListener("click", ()=>{
  playerWrap.innerHTML = "";
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden","true");
});

loadMoreBtn.addEventListener("click", ()=>{
  renderBatch();
  window.scrollBy({ top: 200, behavior: "smooth" });
});

init();
