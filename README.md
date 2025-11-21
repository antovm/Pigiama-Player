# 🎬 Pigiama‑Player

Pigiama‑Player è un video player HTML5 personalizzato, progettato per essere modulare, elegante e facilmente estendibile.  
Supporta fino a **2 sorgenti video**, sottotitoli e capitoli, con controlli avanzati, scorciatoie da tastiera e menù impostazioni.

---

## 🚀 Funzionalità principali

### 🎥 Gestione video
- Supporta **massimo 2 sorgenti video**:
  - **Video primario** (`video1`)
  - **Video secondario** (`video2`)
- Se c’è **un solo video**, viene mostrato solo quello.
- Se ci sono **due video**, il player parte in **modalità affiancata** (side‑by‑side).
- Modalità disponibili:
  - Solo video1
  - Solo video2
  - Modalità overlay (video2 sopra video1)  
    👉 In overlay è possibile **scambiare i due video**.
  - Modalità affiancata (default)

### ⏯️ Controlli di base
- **Play/Pause** con pulsante o barra spaziatrice.
- **Mute/Volume** con pulsante e slider.
- **Seek bar** per avanzare/indietreggiare.
- **Fullscreen**
  - Pulsante dedicato nella **barra di destra**.
  - Scorciatoia tastiera: `F`.

### ⏩ Avanzamento rapido
- Pulsanti dedicati **+10s / -10s**.
- Scorciatoie tastiera: freccia destra/sinistra.

### ⌨️ Scorciatoie da tastiera
- `Space` → Play/Pause  
- `M` → Mute  
- `F` → Fullscreen  
- `C` → Toggle sottotitoli  
- `ArrowRight` → +10s  
- `ArrowLeft` → -10s  
- `Digit0–9` → salto proporzionale (es. `5` → metà video)

### 📑 Capitoli
- Supporta capitoli in formato **VTT**.
- Se non ci sono capitoli, il pulsante rimane **nascosto**.
- Al click su un capitolo → salto al timestamp corrispondente.
- Menu capitoli con pulsante toggle e freccia animata.

### 💬 Sottotitoli
- Supporta **VTT** (nativo) e **SRT** (parsificato).
- Se non ci sono sottotitoli, il pulsante rimane **disattivato**.
- È possibile attivare/disattivare i sottotitoli anche dal **menù impostazioni**.
- Toggle sottotitoli con pulsante o tasto `C`.

### ⚡ Velocità
- Dal menù impostazioni è possibile cambiare la **velocità di riproduzione** (es. 0.5x, 1x, 1.5x, 2x).

### 🎚️ Qualità
- Esiste la voce **Qualità** nel menù impostazioni, ma **non è ancora implementata**.  
  👉 In futuro potrà gestire più versioni dello stesso video (480p, 720p, 1080p).

---

## ⚠️ Note importanti
- I file `.vtt` (sottotitoli e capitoli) **non funzionano se il player viene aperto da file locale (`file://`)**.  
- Le funzionalità di **capitoli e sottotitoli richiedono il deploy su un webserver** (anche locale).  
  👉 Soluzioni rapide:
  - `python -m http.server`
  - `npx serve` o `live-server`
  - **Apache** (es. tramite XAMPP/MAMP/LAMP)
  - Oppure un deploy su GitHub Pages, Netlify, Vercel, ecc.

---

## 📂 Struttura del progetto
- `index.html` → pagina principale
- `style.css` → stile generale
- `player-core.js` → logica di base (play, volume, seek, fullscreen, scorciatoie)
- `player-extra.js` → funzioni aggiuntive
- `chapters.js` → parsing e UI dei capitoli
- `chapters.css` → stile menu capitoli e pulsante toggle
- `video-loader.js` → caricamento video
- `subtitle-loader.js` → gestione sottotitoli

---

## 🔧 Installazione e uso
1. Clona la repo:
   ```bash
   git clone https://github.com/antovm/Pigiama-Player.git
