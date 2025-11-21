// player-core.js
// Inizializza controlli solo dopo che i video sono pronti

document.addEventListener('videosReady', () => {
	const playBtn = document.getElementById('playBtn');
	const muteBtn = document.getElementById('muteBtn');
	const volumeSlider = document.getElementById('volumeSlider');
	const seekBar = document.getElementById('seekBar');
	const timeDisplay = document.getElementById('timeDisplay');
	const fullscreenBtn = document.getElementById('fullscreenBtn');
	
	// Usa i video caricati da video-loader.js
	const video1 = window.primaryVideo;
	const video2 = window.secondaryVideo;
	
	if (!video1) {
		console.warn("player-core: nessun video disponibile");
		return;
	}
	if (video1&&!video2) {
		console.warn("video2 non disponibile");
	}
	// === Play/Pause ===
	playBtn.addEventListener('click', () => {
		if (video1.paused) {
			video1.play();
			if (video2) video2.play().catch(err => console.warn("Autoplay bloccato:", err));
			playBtn.innerHTML = '<span class="material-icons">pause</span>';
			} else {
			video1.pause();
			if (video2) video2.pause();
			playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
		}
	});
	
	// === Mute/Volume ===
	muteBtn.addEventListener('click', () => {
		video1.muted = !video1.muted;
		if (video2) video2.muted = video1.muted;
		muteBtn.innerHTML = video1.muted
		? '<span class="material-icons">volume_off</span>'
		: '<span class="material-icons">volume_up</span>';
	});
	
	volumeSlider.addEventListener('input', () => {
		video1.volume = volumeSlider.value;
		if (video2) video2.volume = video1.volume;
		video1.muted = (video1.volume === 0);
		if (video2) video2.muted = video1.muted;
		muteBtn.innerHTML = video1.muted
		? '<span class="material-icons">volume_off</span>'
		: '<span class="material-icons">volume_up</span>';
	});
	
	// === SeekBar ===
	video1.addEventListener('timeupdate', () => {
		const progress = (video1.currentTime / video1.duration) * 100;
		seekBar.value = progress || 0;
		updateTimeDisplay();
		if (video2 && !isNaN(video2.duration)) {
			video2.currentTime = video1.currentTime;
		}
	});
	
	seekBar.addEventListener('input', () => {
		const time = (seekBar.value / 100) * video1.duration;
		video1.currentTime = time;
		if (video2) video2.currentTime = time;
	});
	
	// === Time Display ===
	function updateTimeDisplay() {
		const current = formatTime(video1.currentTime);
		const total = formatTime(video1.duration);
		timeDisplay.textContent = `${current} / ${total}`;
	}
	
	function formatTime(seconds) {
		if (!isFinite(seconds)) return "00:00";
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
	}
	
	// === Salto frazionario con tasti numerici ===
	function jumpByDigit(num, v1, v2) {
		if (!v1 || isNaN(v1.duration)) return;
		const fraction = num / 10;
		const targetTime = v1.duration * fraction;
		v1.currentTime = targetTime;
		if (v2) v2.currentTime = targetTime;
	}
	function plus10(){
        video1.currentTime = Math.min(video1.currentTime + 10, video1.duration);
        if (video2) video2.currentTime = video1.currentTime;
	}
	function minus10(){
        video1.currentTime = Math.max(video1.currentTime - 10, 0);
        if (video2) video2.currentTime = video1.currentTime;
	}
	
	const rewindBtn = document.getElementById('rewindBtn');
	const forwardBtn = document.getElementById('forwardBtn');
	
	rewindBtn.addEventListener('click', () => {
		minus10();
	});
	
	forwardBtn.addEventListener('click', () => {
		plus10();
	});
	// === Fullscreen ===
	fullscreenBtn.addEventListener('click', () => {
		if (!document.fullscreenElement) {
			video1.parentElement.requestFullscreen().catch(err => {
				console.error("Errore fullscreen:", err);
			});
			} else {
			document.exitFullscreen();
		}
	});
	
	// === Keyboard shortcuts ===
	document.addEventListener('keydown', (e) => {
		switch (e.code) {
			case 'Space':
			e.preventDefault();
			playBtn.click();
			break;
			
			case 'KeyM':
			muteBtn.click();
			break;
			
			case 'KeyF':
			fullscreenBtn.click();
			break;
			
			case 'ArrowRight':
			plus10();
			break;
			
			case 'ArrowLeft':
			minus10();
			break;
			
			case 'KeyC': // toggle sottotitoli
			e.preventDefault();
			const ccBtn = document.getElementById('ccBtn');
			const ccBtnDisabled = document.getElementById('ccBtnDisabled');
			if (ccBtn && ccBtn.style.display !== 'none') {
				ccBtn.click();
				} else if (ccBtnDisabled && ccBtnDisabled.style.display !== 'none') {
				ccBtnDisabled.click();
			}
			break;
			
			case 'Digit0':
			case 'Digit1':
			case 'Digit2':
			case 'Digit3':
			case 'Digit4':
			case 'Digit5':
			case 'Digit6':
			case 'Digit7':
			case 'Digit8':
			case 'Digit9':
			e.preventDefault();
			jumpByDigit(parseInt(e.key, 10), video1, video2);
			break;
		}
	});
});