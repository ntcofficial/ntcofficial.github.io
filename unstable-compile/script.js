async function loadAll() {
  const res = await fetch("data.json");
  const videos = await res.json();
  renderVideos(videos);
}

function renderVideos(videos) {
  const container = document.getElementById("videos");
  container.innerHTML = videos.map(v => `
    <div class="video">
      <h3>${v.title}</h3>
      <small>${v.channel} • ${new Date(v.published).toLocaleString()}</small>
      <iframe src="https://www.youtube-nocookie.com/embed/${v.videoId}" 
        width="560" height="315" frameborder="0" allowfullscreen></iframe>
    </div>
  `).join("");
}

loadAll();
