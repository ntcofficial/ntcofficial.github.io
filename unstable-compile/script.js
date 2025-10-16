const proxy = "https://api.codetabs.com/v1/proxy?quest="; 
const feedUrl = id => `${proxy}${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`)}`;
async function getFeed(channel) {
  const res = await fetch(feedUrl(channel.id));
  const data = await res.json();
  const xml = new DOMParser().parseFromString(data.contents, "text/xml");
  const entries = [...xml.querySelectorAll("entry")];
  return entries.map(e => ({
    title: e.querySelector("title")?.textContent,
    videoId: e.querySelector("yt\\:videoId")?.textContent,
    published: new Date(e.querySelector("published").textContent),
    channel: channel.name
  }));
}

async function loadAll() {
  const channels = await fetch("channels.json").then(r => r.json());
  let allVideos = [];
  for (const ch of channels) {
    const vids = await getFeed(ch);
    allVideos.push(...vids);
  }
  allVideos.sort((a, b) => a.published - b.published);
  renderVideos(allVideos);
}

function renderVideos(videos) {
  const container = document.getElementById("videos");
  container.innerHTML = videos.map(v => `
    <div class="video">
      <h3>${v.title}</h3>
      <small>${v.channel} • ${v.published.toLocaleString()}</small>
      <iframe src="https://www.youtube-nocookie.com/embed/${v.videoId}" 
        width="560" height="315" frameborder="0" allowfullscreen></iframe>
    </div>
  `).join("");
}

loadAll();
