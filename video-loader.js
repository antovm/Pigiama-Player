// video-loader.js
// Carica i video e inizializza i capitoli

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('videocontainer');
	if (!container) return;
	
	// Pulizia iniziale
	container.innerHTML = '';
	container.className = 'video-container';
	
	// File video
	const v1 = 'video1.mp4';
	const v2 = 'video2.mp4';
	
	// Flag globali di stato
	window.video1Ready = false;
	window.video2Ready = false;
	
	// Controllo riproducibilità con Promise.all
	Promise.all([checkVideoPlayable(v1), checkVideoPlayable(v2)])
    .then(([v1Playable, v2Playable]) => {
		if (v1Playable && v2Playable) {
			// Layout a due video
			container.classList.add('view-side-by-side');
			container.innerHTML = `
			<div id="chaptersMenu">
			<ul id="chapterList"></ul>
			</div>
			<video id="video1" >
            <source src="${v1}?nocache=${Date.now()}" type="video/mp4">
			</video>
			<video id="video2" >
            <source src="${v2}?nocache=${Date.now()}" type="video/mp4">
			</video>
			`;
			window.video1Ready = true;
			window.video2Ready = true;
			} else if (v1Playable && !v2Playable) {
			// Solo video1
			container.classList.add('view-only-v1');
			container.innerHTML = `
			<div id="chaptersMenu">
			<ul id="chapterList"></ul>
			</div>
			<video id="video1" >
            <source src="${v1}?nocache=${Date.now()}" type="video/mp4">
			</video>
			`;
			window.video1Ready = true;
			hideButton('btn0');
			} else {
			// Nessun video disponibile
			container.classList.add('view-empty');
			container.innerHTML = `<div class="no-video">❌ Nessun video disponibile</div>`;
		}
		
		// Assegna subito le variabili globali
		window.primaryVideo = document.getElementById('video1') || null;
		window.secondaryVideo = document.getElementById('video2') || null;
		
		// 🔧 Inizializza capitoli direttamente qui (Opzione B)
		if (window.primaryVideo) {
			initChapters('#video1', 'video1-chapter.vtt');
		}
		
		// Notifica che i video sono pronti (se serve ad altri moduli)
		document.dispatchEvent(new CustomEvent('videosReady'));
	});
});

// === Utility ===
function hideButton(id) {
	const btn = document.getElementById(id);
	if (btn) btn.style.display = 'none';
}

function checkVideoPlayable(url) {
	return new Promise((resolve) => {
		const v = document.createElement('video');
		v.src = url + '?nocache=' + Date.now();
		v.preload = 'metadata';
		
		v.addEventListener('loadedmetadata', () => {
			const d = v.duration;
			resolve(isFinite(d) && d > 0);
		});
		v.addEventListener('error', () => resolve(false));
		
		// Fallback timeout
		setTimeout(() => resolve(false), 2000);
	});
}
