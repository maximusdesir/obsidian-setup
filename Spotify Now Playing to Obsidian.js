// Spotify Now Playing -> Obsidian (Scriptable)
// Tap the widget (or run the script) to save the podcast episode you're playing right now.
// Still works from the Spotify share sheet: a shared episode link takes priority over now playing.

// ---- CONFIG ----
const CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
const CLIENT_SECRET = "YOUR_SPOTIFY_CLIENT_SECRET";
const REDIRECT_URI = "http://127.0.0.1:8888/callback"; // must match the Spotify dashboard exactly
const VAULT_BOOKMARK = "Obsidian";   // Scriptable Settings > File Bookmarks name (vault root)
const VAULT_NAME = "Obsidian";       // vault name in Obsidian (used to open the note)
const FOLDER = "Clippings/Podcasts";
const MARKET = "US";
const OPEN_AFTER_SAVE = true;
// ----------------

const KC_REFRESH = "spotify_obsidian_refresh_token";
const SCOPES = "user-read-currently-playing user-read-playback-state";

if (config.runsInWidget) {
  Script.setWidget(buildWidget());
  Script.complete();
} else {
  await main();
}

async function main() {
  try {
    const token = await getUserToken();

    let ep, progressMs = null;
    const sharedId = await resolveEpisodeId(sharedInput());
    if (sharedId) {
      ep = await getEpisode(sharedId, token);
    } else {
      const now = await getNowPlaying(token);
      if (now) {
        ep = now.item;
        progressMs = now.progress_ms;
      } else {
        // last resort: an episode link on the clipboard
        const clipId = await resolveEpisodeId(Pasteboard.paste());
        if (!clipId) throw new Error("Nothing playing, and no episode link was shared or copied.");
        ep = await getEpisode(clipId, token);
      }
    }

    const canOpen = OPEN_AFTER_SAVE && !config.runsInActionExtension;
    const note = saveNote(ep, progressMs, canOpen);
    notify("Saved to Obsidian", ep.name + (progressMs != null ? ` @ ${fmtTime(progressMs)}` : ""));

    if (canOpen) {
      const v = encodeURIComponent(VAULT_NAME);
      const f = encodeURIComponent(note.vaultPath);
      if (note.content) {
        // New note: let Obsidian create it, so it exists in Obsidian's index before it tries to open it
        Safari.open(`obsidian://new?vault=${v}&file=${f}&content=${encodeURIComponent(note.content)}`);
      } else {
        Safari.open(`obsidian://open?vault=${v}&file=${f}`);
      }
    }
  } catch (e) {
    const a = new Alert();
    a.title = "Podcast clip failed";
    a.message = String(e.message || e);
    a.addAction("OK");
    await a.present();
  }
  Script.complete();
}

// ---------- Auth ----------

async function getUserToken() {
  if (!Keychain.contains(KC_REFRESH)) {
    if (config.runsInActionExtension) {
      throw new Error("Run this script once inside the Scriptable app to log in to Spotify.");
    }
    await firstTimeLogin();
  }
  const r = tokenRequest(`grant_type=refresh_token&refresh_token=${encodeURIComponent(Keychain.get(KC_REFRESH))}`);
  const json = await r.loadJSON();
  if (!json.access_token) {
    Keychain.remove(KC_REFRESH); // force a fresh login next run
    throw new Error("Spotify token refresh failed, run again to log in.\n" + JSON.stringify(json));
  }
  if (json.refresh_token) Keychain.set(KC_REFRESH, json.refresh_token); // Spotify may rotate it
  return json.access_token;
}

async function firstTimeLogin() {
  const state = String(Math.random()).slice(2);
  const authUrl =
    "https://accounts.spotify.com/authorize" +
    `?client_id=${CLIENT_ID}&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPES)}&state=${state}`;

  let code = null;
  const wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    if (req.url.startsWith(REDIRECT_URI)) {
      const params = parseQuery(req.url);
      if (params.state === state && params.code) code = params.code;
      wv.loadHTML(
        `<body style="font:20px -apple-system;text-align:center;padding-top:40%">
           ${code ? "✅ Spotify connected.<br>Tap <b>Close</b>." : "❌ Login failed. Tap Close."}
         </body>`
      );
      return false;
    }
    return true;
  };
  await wv.loadURL(authUrl);
  await wv.present(true);

  if (!code) throw new Error("Spotify login was cancelled or failed.");

  const r = tokenRequest(
    `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  );
  const json = await r.loadJSON();
  if (!json.refresh_token) throw new Error("Token exchange failed: " + JSON.stringify(json));
  Keychain.set(KC_REFRESH, json.refresh_token);
}

function tokenRequest(body) {
  const r = new Request("https://accounts.spotify.com/api/token");
  r.method = "POST";
  r.headers = {
    Authorization: "Basic " + Data.fromString(`${CLIENT_ID}:${CLIENT_SECRET}`).toBase64String(),
    "Content-Type": "application/x-www-form-urlencoded",
  };
  r.body = body;
  return r;
}

function parseQuery(url) {
  const out = {};
  const q = url.split("?")[1] || "";
  for (const pair of q.split("&")) {
    const [k, v] = pair.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || "");
  }
  return out;
}

// ---------- Spotify ----------

async function getNowPlaying(token) {
  const r = new Request(
    `https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode&market=${MARKET}`
  );
  r.headers = { Authorization: `Bearer ${token}` };
  const text = await r.loadString();
  const status = r.response.statusCode;
  if (status === 204 || !text) return null; // nothing playing
  const json = JSON.parse(text);
  if (json.error) throw new Error("Spotify API: " + json.error.message);
  if (json.currently_playing_type !== "episode" || !json.item) {
    throw new Error("What's playing isn't a podcast episode.");
  }
  return json;
}

async function getEpisode(id, token) {
  const r = new Request(`https://api.spotify.com/v1/episodes/${id}?market=${MARKET}`);
  r.headers = { Authorization: `Bearer ${token}` };
  const json = await r.loadJSON();
  if (json.error) throw new Error("Spotify API: " + json.error.message);
  return json;
}

function sharedInput() {
  if (args.urls && args.urls.length) return args.urls[0];
  if (args.plainTexts && args.plainTexts.length) return args.plainTexts[0];
  return null;
}

async function resolveEpisodeId(text) {
  if (!text) return null;
  const direct = text.match(/episode[\/:]([A-Za-z0-9]{22})/);
  if (direct) return direct[1];
  const short = text.match(/https?:\/\/spotify\.link\/\S+/);
  if (short) {
    const html = await new Request(short[0]).loadString();
    const m = html.match(/open\.spotify\.com\/episode\/([A-Za-z0-9]{22})/);
    if (m) return m[1];
  }
  return null;
}

// ---------- Obsidian ----------

// Returns { vaultPath, content }. content is set only when Obsidian should create the note itself.
function saveNote(ep, progressMs, obsidianWillCreate) {
  const fm = FileManager.local();
  if (!fm.bookmarkExists(VAULT_BOOKMARK)) {
    throw new Error(`No file bookmark named "${VAULT_BOOKMARK}". Add it in Scriptable Settings > File Bookmarks.`);
  }
  const dir = fm.joinPath(fm.bookmarkedPath(VAULT_BOOKMARK), FOLDER);
  if (!fm.fileExists(dir)) fm.createDirectory(dir, true);

  const base = sanitize(`${ep.show.name} - ${ep.name}`).slice(0, 150);
  const path = fm.joinPath(dir, `${base}.md`);
  const vaultPath = `${FOLDER}/${base}`;

  // Already clipped this episode: append a new timestamp instead of making a duplicate note
  if (fm.fileExists(path)) {
    if (progressMs != null) {
      fm.writeString(path, fm.readString(path).trimEnd() + `\n- [${fmtTime(progressMs)}] \n`);
    }
    return { vaultPath, content: null };
  }

  const content = buildMarkdown(ep, progressMs);
  if (obsidianWillCreate) return { vaultPath, content };

  // Share sheet can't open Obsidian, so write the file directly
  fm.writeString(path, content);
  return { vaultPath, content: null };
}

function buildMarkdown(ep, progressMs) {
  const q = (s) => JSON.stringify(s ?? "");
  const image = ep.images && ep.images.length ? ep.images[0].url : "";
  const minutes = Math.round((ep.duration_ms || 0) / 60000);
  const today = new Date().toISOString().slice(0, 10);
  const stamp = progressMs != null ? fmtTime(progressMs) : null;

  return `---
title: ${q(ep.name)}
show: ${q(`[[${sanitize(ep.show.name)}]]`)}
author: ${q(ep.show.publisher)}
source: ${q(ep.external_urls.spotify)}
published: ${ep.release_date}
created: ${today}
duration: ${minutes}
cover: ${q(image)}
tags:
  - clippings
  - podcast
---
${image ? `![cover|200](${image})\n` : ""}
## Notes
${stamp ? `- [${stamp}] ` : ""}
`;
}

// ---------- Helpers ----------

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

function sanitize(s) {
  return String(s).replace(/[\\/:*?"<>|#^\[\]]/g, "").replace(/\s+/g, " ").trim();
}

function notify(title, body) {
  const n = new Notification();
  n.title = title;
  n.body = body;
  n.schedule();
}

function buildWidget() {
  const w = new ListWidget();
  w.backgroundColor = new Color("#1DB954");
  w.url = URLScheme.forRunningScript();
  const t = w.addText("🎙️ Clip now playing");
  t.font = Font.boldSystemFont(16);
  t.textColor = Color.white();
  w.addSpacer(4);
  const s = w.addText("Saves episode + timestamp");
  s.font = Font.systemFont(11);
  s.textColor = new Color("#ffffff", 0.85);
  return w;
}
