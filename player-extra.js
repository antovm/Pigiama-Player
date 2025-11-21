// player-extra.js
// Gestione pulsanti view e menu impostazioni

document.addEventListener('videosReady', () => {
  addListeners({
	btn0:'view-only-v1',
	btn1:'view-only-v2',
	btn2:'view-overlay-v2',
	btn3:'view-side-by-side',
	btnExtra1: 'view-overlay-v1',
    btnExtra2: 'view-overlay-v2'
  });
  // === Imposta vista iniziale ===
    const initialView = window.secondaryVideo  ? 'view-side-by-side' : 'view-only-v1';
    if (typeof setView === 'function') {
      setView(initialView);
    }
});
  

	
function addListeners(viewMap) {
  const container = document.getElementById('videocontainer');
  if (!container) return;

  // === VIEW BUTTONS ===
  Object.keys(viewMap).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        setView(viewMap[id]);
      });
    }
  });

  // === SETTINGS MENU ===
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');
  const submenuContainer = document.getElementById('submenuContainer');

  if (!settingsBtn || !settingsMenu || !submenuContainer) return;

  // Popola dinamicamente le opzioni principali
  settingsMenu.innerHTML = '';
  const options = [
    { key: 'subtitles', icon: 'closed_caption', label: 'Sottotitoli', statusId: 'subtitleStatus', default: 'Off' },
    { key: 'speed', icon: 'speed', label: 'Velocità', statusId: 'speedStatus', default: '1x' },
    { key: 'quality', icon: 'signal_cellular_alt', label: 'Qualità', statusId: 'qualityStatus', default: 'Automatico' }
  ];

  options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'settings-option';
    div.dataset.menu = opt.key;
    div.innerHTML = `
      <span class="material-icons">${opt.icon}</span>
      <span>${opt.label}</span>
      <span id="${opt.statusId}">${opt.default}</span>
      <span class="material-icons">chevron_right</span>
    `;
    div.addEventListener('click', () => showSubmenu(opt.key));
    settingsMenu.appendChild(div);
  });

  // Toggle menu impostazioni
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('visible');
    submenuContainer.style.display = 'none';
  });

  // Chiudi menu cliccando fuori
  document.addEventListener('click', (e) => {
    if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
      settingsMenu.classList.remove('visible');
      submenuContainer.style.display = 'none';
    }
  });
}

// === FUNZIONI DI SUPPORTO ===
function setView(className) {
  const container = document.getElementById('videocontainer');
  if (!container) return;
  container.className = 'video-container';
  container.classList.add(className);
  updateButtons(className);
}

function updateButtons(currentClass) {
	const hasSecondary = window.secondaryVideo; // true se esiste il secondo video
	const ids = ['btn0','btn1','btn2','btn3','btnExtra1','btnExtra2'];
	ids.forEach(id => {
		const el = document.getElementById(id);
		if (el) el.style.display = 'none';
	});
	if (!hasSecondary)return; 

	switch (currentClass) {
		case 'view-only-v1':
			document.getElementById('btn1').style.display = 'inline-block';
			break;
		case 'view-only-v2':
			if (hasSecondary) {
				document.getElementById('btn2').style.display = 'inline-block';
			}
			break;
		case 'view-overlay-v2':
			document.getElementById('btn3').style.display = 'inline-block';
			document.getElementById('btnExtra1').style.display = 'inline-block';
			break;
		case 'view-overlay-v1':
			document.getElementById('btn3').style.display = 'inline-block';
			document.getElementById('btnExtra2').style.display = 'inline-block';
			break;
		case 'view-side-by-side':
		default:
			document.getElementById('btn0').style.display = 'inline-block';
			break;
	}
}

function showSubmenu(type) {
  const submenuContainer = document.getElementById('submenuContainer');
  if (!submenuContainer) return;

  submenuContainer.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'submenu-title';
  title.innerHTML = `<span class="material-icons">chevron_left</span><span>${type}</span>`;
  title.querySelector('.material-icons').onclick = () => submenuContainer.style.display = 'none';
  submenuContainer.appendChild(title);

  let options = [];
  if (type === 'speed') {
    options = ['2x','1.75x','1.5x','1.25x','1x','0.75x','0.5x'];
  } else if (type === 'quality') {
    options = ['Alto','Medio','Basso','Automatico'];
  } else if (type === 'subtitles') {
    options = ['Off','Italiano'];
  }

  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'submenu-option';
    item.innerHTML = `<span>${opt}</span><span class="check">${getStatus(type) === opt ? '✓' : ''}</span>`;
    item.onclick = () => {
      setStatus(type, opt);
      submenuContainer.style.display = 'none';
    };
    submenuContainer.appendChild(item);
  });

  submenuContainer.style.display = 'flex';
}

function getStatus(type) {
  if (type === 'speed') return document.getElementById('speedStatus')?.textContent || '1x';
  if (type === 'quality') return document.getElementById('qualityStatus')?.textContent || 'Automatico';
  if (type === 'subtitles') return document.getElementById('subtitleStatus')?.textContent || 'Off';
  return '';
}

function setStatus(type, value) {
  if (type === 'speed') {
    document.getElementById('speedStatus').textContent = value;
    const rate = parseFloat(value);
    window.primaryVideo.playbackRate = rate;
    if (window.secondaryVideo) window.secondaryVideo.playbackRate = rate;
  }

  if (type === 'quality') {
    document.getElementById('qualityStatus').textContent = value;
    // TODO: logica di switch sorgenti se disponibile
  }

  if (type === 'subtitles') {
    const video = document.getElementById('video1');
    const subtitleBox = document.getElementById('subtitleBox');
    if (value === 'Off') {
      toggleSubtitles(false, video, subtitleBox);
    } else {
      toggleSubtitles(true, video, subtitleBox);
    }
  }
}
