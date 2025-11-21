// subtitle-loader.js

let hasVtt = false;
let hasSrt = false;
let srtCues = [];
let activeListener = null;
let srtEnabled = false; // stato toggle per SRT

document.addEventListener('videosReady', () => initSubtitles('video1'));

function parseTime(t) {
  const [h, m, s] = t.replace(',', ':').split(':');
  return (+h) * 3600 + (+m) * 60 + parseFloat(s);
}

// === Disabilita UI sottotitoli ===
function disableSubtitlesUI() {
  const subtitleBox = document.getElementById('subtitleBox');
  const ccBtn = document.getElementById('ccBtn');
  const ccBtnDisabled = document.getElementById('ccBtnDisabled');
  const subtitleStatus = document.getElementById('subtitleStatus');

  if (subtitleBox) {
    subtitleBox.textContent = '';
    subtitleBox.style.display = 'none';
  }
  if (ccBtn) {
    ccBtn.setAttribute('disabled', 'true');
    ccBtn.style.opacity = '0.5';
  }
  if (ccBtnDisabled) {
    ccBtnDisabled.style.display = 'none';
  }
  if (subtitleStatus) {
    subtitleStatus.textContent = 'Off';
  }
}

// === Inizializza sottotitoli ===
async function initSubtitles(baseName = 'video1') {
  const video = document.getElementById(baseName);
  const subtitleBox = document.getElementById('subtitleBox');
  const ccBtn = document.getElementById('ccBtn');
  const ccBtnDisabled = document.getElementById('ccBtnDisabled');
  const subtitleStatus = document.getElementById('subtitleStatus');

  if (!video || !subtitleBox) {
    console.warn('Video o subtitleBox non trovato');
    disableSubtitlesUI();
    return;
  }

  // reset
  if (activeListener) {
    video.removeEventListener('timeupdate', activeListener);
    activeListener = null;
  }
  hasVtt = false;
  hasSrt = false;
  srtEnabled = false;
  subtitleBox.textContent = '';
  subtitleBox.style.display = 'none';

  // === tentativo VTT ===
  const vttUrl = `${baseName}.vtt?nocache=${Date.now()}`;
  try {
    const res = await fetch(vttUrl, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      hasVtt = true;
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = 'Italiano';
      track.srclang = 'it';
      track.src = vttUrl;
      track.default = true;
      video.appendChild(track);

      track.addEventListener('load', () => {
        const textTrack = video.textTracks[0];
        if (!textTrack) {
          console.warn('textTracks non disponibili per VTT');
          return;
        }
        textTrack.mode = 'disabled'; // OFF di default
        subtitleBox.textContent = '';

        textTrack.addEventListener('cuechange', () => {
          const cue = textTrack.activeCues?.[0];
          subtitleBox.textContent = cue ? cue.text : '';
        });
      });

      ccBtn && (ccBtn.onclick = () => toggleSubtitles(true, video, subtitleBox));
      ccBtnDisabled && (ccBtnDisabled.onclick = () => toggleSubtitles(false, video, subtitleBox));
      subtitleStatus && (subtitleStatus.textContent = 'Off');
      return; // VTT trovato
    }
  } catch (e) {
    console.warn('Errore fetch VTT:', e);
  }

  // === fallback SRT ===
  const srtUrl = `${baseName}.srt?nocache=${Date.now()}`;
  try {
    const res = await fetch(srtUrl, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      hasSrt = true;
      const text = await res.text();

      srtCues = text
        .split(/\r?\n\r?\n+/)
        .map((block) => {
          const lines = block.split(/\r?\n/);
          let timeLineIdx = 0;
          if (lines[0] && /^\d+$/.test(lines[0].trim())) {
            timeLineIdx = 1;
          }
          const timeLine = lines[timeLineIdx] || '';
          const time = timeLine.split(' --> ');
          if (time.length !== 2) return null;
          return {
            start: parseTime(time[0].trim()),
            end: parseTime(time[1].trim()),
            text: lines.slice(timeLineIdx + 1).join('\n'),
          };
        })
        .filter(Boolean);

      activeListener = () => {
        if (!srtEnabled) return;
        const current = video.currentTime;
        const cue = srtCues.find((c) => current >= c.start && current <= c.end);
        subtitleBox.textContent = cue ? cue.text : '';
      };
      video.addEventListener('timeupdate', activeListener);

      ccBtn && (ccBtn.onclick = () => toggleSubtitles(true, video, subtitleBox));
      ccBtnDisabled && (ccBtnDisabled.onclick = () => toggleSubtitles(false, video, subtitleBox));
      subtitleStatus && (subtitleStatus.textContent = 'Off');
      return; // SRT trovato
    }
  } catch (e) {
    console.warn('Errore fetch SRT:', e);
  }

  // === nessun sottotitolo ===
  console.warn('Nessun sottotitolo disponibile');
  disableSubtitlesUI();
}

// === Toggle sottotitoli ===
function toggleSubtitles(enable, video, subtitleBox) {
  video = video || document.getElementById('video1');
  subtitleBox = subtitleBox || document.getElementById('subtitleBox');

  const ccBtn = document.getElementById('ccBtn');
  const ccBtnDisabled = document.getElementById('ccBtnDisabled');
  const subtitleStatus = document.getElementById('subtitleStatus');

  if (!video || !subtitleBox) {
    disableSubtitlesUI();
    return;
  }

  // VTT
  if (hasVtt && video.textTracks && video.textTracks.length) {
    for (const track of video.textTracks) {
      track.mode = enable ? 'hidden' : 'disabled';
    }
  }

  // SRT
  if (hasSrt) {
    srtEnabled = !!enable;
    if (!srtEnabled) subtitleBox.textContent = '';
  }

  // UI box
  subtitleBox.style.display = enable ? 'block' : 'none';

  // Pulsanti CC
  if (ccBtn) ccBtn.style.display = enable ? 'none' : 'inline-block';
  if (ccBtnDisabled) ccBtnDisabled.style.display = enable ? 'inline-block' : 'none';

  // Stato menù
  if (subtitleStatus) subtitleStatus.textContent = enable ? 'Italiano' : 'Off';
}
