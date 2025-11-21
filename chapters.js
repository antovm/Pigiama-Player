// chapters.js
// Gestione capitoli, parte solo dopo videosReady

function toSeconds(timeString) {
	const parts = timeString.split(':');
	const h = parseInt(parts[0], 10);
	const m = parseInt(parts[1], 10);
	const sParts = parts[2].split('.');
	const s = parseInt(sParts[0], 10);
	const ms = sParts[1] ? parseInt(sParts[1], 10) : 0;
	return h * 3600 + m * 60 + s + ms / 1000;
}

function formatTime(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	if (h > 0) {
		return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
		} else {
		return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
	}
}

// Carica e parsifica VTT → Promise
function loadVTTtoArray(url) {
	return fetch(url)
    .then(res => {
		if (!res.ok){
			throw new Error("File VTT non trovato");
		}
		document.getElementById('chaptersBtn').style="display:inline-flex";
		return res.text();
	})
    .then(text => {
		const lines = text.split(/\r?\n/);
		const chapters = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.includes('-->')) {
				const [startRaw, endRaw] = line.split('-->').map(s => s.trim());
				const start = toSeconds(startRaw);
				const end = toSeconds(endRaw);
				const textLine = lines[i + 1] ? lines[i + 1].trim() : '';
				if (textLine) chapters.push({ start, end, text: textLine });
			}
		}
		return chapters;
	});
}

// Costruisce UI capitoli
function buildChaptersUI(video, chapters) {
	const menu = document.getElementById('chaptersMenu');
	const list = document.getElementById('chapterList');
	const toggle = document.getElementById('chaptersBtn');
	if (!menu || !list || !toggle) return;
	
	list.innerHTML = '';
	
	if (chapters.length > 0) {
		chapters.forEach(ch => {
			const li = document.createElement('li');
			li.className = 'chapter-item';
			li.innerHTML = `<span>${ch.text}</span><span class="chapter-time">${formatTime(ch.start)}</span>`;
			
			li.addEventListener('click', () => {
				// Salta al tempo giusto
				video.currentTime = ch.start;
				
				// Se il video è in pausa → avvia
				if (video.paused) {
					const playBtn = document.getElementById('playBtn');
					if (playBtn) playBtn.click();
				}
				
				// Chiudi menu e resetta freccia/barra
				menu.classList.remove('visible');
				toggle.classList.remove('open');
				const chapterBar = document.querySelector('.chapter-bar');
				if (chapterBar) chapterBar.classList.remove('open');
			});
			
			list.appendChild(li);
		});
	}
}

// Inizializza capitoli
function initChapters(videoSelector, vttUrl) {
	const video = document.querySelector(videoSelector);
	if (!video) return;
	
	loadVTTtoArray(vttUrl)
    .then(chapters => {
		buildChaptersUI(video, chapters);
		document.dispatchEvent(new CustomEvent('chaptersReady', { detail: { chapters } }));
	})
    .catch(err => {
		console.error("Errore caricamento capitoli:", err);
		buildChaptersUI(video, []); // fallback: menu vuoto
	});
}

// Aggancio automatico: parte solo dopo videosReady
document.addEventListener('videosReady', () => {
	initChapters('#video1', 'video1-chapter.vtt');
	
	// Listener sul pulsante capitoli
	const chaptersBtn = document.getElementById('chaptersBtn');
	const chaptersMenu = document.getElementById('chaptersMenu');
	const chapterBar = document.querySelector('.chapter-bar');
	
	if (chaptersBtn && chaptersMenu && chapterBar) {
		chaptersBtn.addEventListener('click', () => {
			const isOpen = chaptersMenu.classList.toggle('visible');
			chaptersBtn.classList.toggle('open', isOpen);
			chapterBar.classList.toggle('open', isOpen);
		});
	}
});