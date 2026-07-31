/**
 * Utility functions for Three Kingdoms Combat Prototype
 */

const Utils = {
  // Clamp number between min and max
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  // Generate SVG Data URL for character portraits
  generatePortrait(hero) {
    let svgString = '';
    
    if (hero === 'guanyu') {
      // Guan Yu - Emerald & Gold theme with majestic beard
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgGuan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1e3c20"/>
            <stop offset="100%" stop-color="#0a180b"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgGuan)" stroke="#d4af37" stroke-width="3"/>
        <path d="M 20 90 Q 50 65 80 90 L 85 100 L 15 100 Z" fill="#2d5a27" stroke="#d4af37" stroke-width="2"/>
        <ellipse cx="50" cy="45" rx="18" ry="22" fill="#a84332"/>
        <path d="M 34 50 Q 50 95 66 50 Q 50 85 34 50 Z" fill="#111111"/>
        <path d="M 30 35 Q 50 10 70 35 Q 50 25 30 35 Z" fill="#2d5a27" stroke="#d4af37" stroke-width="2"/>
        <polygon points="50,8 55,20 45,20" fill="#d4af37"/>
        <path d="M 36 38 L 44 41" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <path d="M 64 38 L 56 41" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <circle cx="41" cy="43" r="2" fill="#fff"/>
        <circle cx="59" cy="43" r="2" fill="#fff"/>
      </svg>`;
    } else if (hero === 'liubei') {
      // Liu Bei - Noble Emerald/Gold Imperial Robes & Crown
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgLB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#145a32"/>
            <stop offset="100%" stop-color="#072313"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgLB)" stroke="#d4af37" stroke-width="3"/>
        <path d="M 18 90 Q 50 62 82 90 L 88 100 L 12 100 Z" fill="#196f3d" stroke="#d4af37" stroke-width="2"/>
        <ellipse cx="50" cy="46" rx="18" ry="21" fill="#f5cba7"/>
        <path d="M 40 56 Q 50 62 60 56 Q 50 58 40 56 Z" fill="#222"/>
        <path d="M 47 62 Q 50 68 53 62 Z" fill="#222"/>
        <path d="M 30 32 Q 50 18 70 32 L 66 20 Q 50 10 34 20 Z" fill="#d4af37" stroke="#b38715" stroke-width="1.5"/>
        <circle cx="50" cy="18" r="4" fill="#27ae60"/>
        <path d="M 36 41 L 44 42" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 64 41 L 56 42" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="41" cy="45" r="2" fill="#000"/>
        <circle cx="59" cy="45" r="2" fill="#000"/>
      </svg>`;
    } else if (hero === 'zhangfei') {
      // Zhang Fei - Fierce Wild Beard & Crimson Headband
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgZF" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4a1c1c"/>
            <stop offset="100%" stop-color="#140606"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgZF)" stroke="#e74c3c" stroke-width="3"/>
        <path d="M 16 90 Q 50 60 84 90 L 90 100 L 10 100 Z" fill="#2c3e50" stroke="#e74c3c" stroke-width="2"/>
        <ellipse cx="50" cy="47" rx="19" ry="22" fill="#d98880"/>
        <path d="M 28 48 Q 50 95 72 48 Q 50 82 28 48 Z" fill="#111111"/>
        <path d="M 26 34 L 74 34 L 72 26 L 28 26 Z" fill="#e74c3c" stroke="#c0392b" stroke-width="1.5"/>
        <circle cx="39" cy="44" r="3.5" fill="#fff"/>
        <circle cx="61" cy="44" r="3.5" fill="#fff"/>
        <circle cx="39" cy="44" r="2" fill="#000"/>
        <circle cx="61" cy="44" r="2" fill="#000"/>
        <path d="M 33 39 L 44 42" stroke="#000" stroke-width="3"/>
        <path d="M 67 39 L 56 42" stroke="#000" stroke-width="3"/>
      </svg>`;
    } else if (hero === 'bandit_commander') {
      // Bandit Commander - Heavy Bandit Overlord with Spiked Iron Helmet
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgBC" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#641e16"/>
            <stop offset="100%" stop-color="#190604"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgBC)" stroke="#c0392b" stroke-width="3"/>
        <path d="M 14 90 Q 50 56 86 90 L 92 100 L 8 100 Z" fill="#4a1811" stroke="#c0392b" stroke-width="2"/>
        <ellipse cx="50" cy="48" rx="20" ry="22" fill="#a04000"/>
        <path d="M 22 34 Q 50 12 78 34 L 72 20 Q 50 6 28 20 Z" fill="#2c3e50" stroke="#c0392b" stroke-width="2"/>
        <polygon points="50,4 57,18 43,18" fill="#e74c3c"/>
        <path d="M 18 20 Q 2 5 -4 -12" stroke="#c0392b" stroke-width="4" fill="none"/>
        <path d="M 82 20 Q 98 5 104 -12" stroke="#c0392b" stroke-width="4" fill="none"/>
        <path d="M 33 43 L 44 46" stroke="#000" stroke-width="3.5"/>
        <path d="M 67 43 L 56 46" stroke="#000" stroke-width="3.5"/>
        <circle cx="39" cy="48" r="2.5" fill="#e74c3c"/>
        <circle cx="61" cy="48" r="2.5" fill="#e74c3c"/>
        <path d="M 36 62 Q 50 56 64 62" stroke="#300" stroke-width="3" fill="none"/>
      </svg>`;
    } else if (hero === 'yellowturban_commander') {
      // Yellow Turban Commander
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgYTC" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#5b4812"/>
            <stop offset="100%" stop-color="#1c1603"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgYTC)" stroke="#f1c40f" stroke-width="3"/>
        <path d="M 14 90 Q 50 58 86 90 L 92 100 L 8 100 Z" fill="#786111" stroke="#f1c40f" stroke-width="2"/>
        <ellipse cx="50" cy="47" rx="20" ry="22" fill="#cc8e5e"/>
        <path d="M 24 34 Q 50 14 76 34 L 72 22 Q 50 10 28 22 Z" fill="#f1c40f" stroke="#b7950b" stroke-width="2"/>
        <polygon points="50,6 56,18 44,18" fill="#e74c3c"/>
        <path d="M 32 43 L 43 46" stroke="#000" stroke-width="3.5"/>
        <path d="M 68 43 L 57 46" stroke="#000" stroke-width="3.5"/>
        <circle cx="39" cy="48" r="2.5" fill="#e74c3c"/>
        <circle cx="61" cy="48" r="2.5" fill="#e74c3c"/>
        <path d="M 38 62 Q 50 56 62 62" stroke="#400" stroke-width="3" fill="none"/>
      </svg>`;
    } else if (hero === 'lubu') {
      // Lu Bu
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgLubu" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4a1212"/>
            <stop offset="100%" stop-color="#170505"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgLubu)" stroke="#d4af37" stroke-width="3"/>
        <path d="M 40 25 Q 15 -10 10 -25" stroke="#e74c3c" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 60 25 Q 85 -10 90 -25" stroke="#e74c3c" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 18 90 Q 50 62 82 90 L 88 100 L 12 100 Z" fill="#333333" stroke="#d4af37" stroke-width="2"/>
        <ellipse cx="50" cy="48" rx="19" ry="22" fill="#d19c73"/>
        <path d="M 28 35 L 50 22 L 72 35 L 50 30 Z" fill="#d4af37" stroke="#b38715" stroke-width="1.5"/>
        <circle cx="50" cy="27" r="4" fill="#e74c3c"/>
        <path d="M 35 43 L 44 46" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <path d="M 65 43 L 56 46" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <circle cx="40" cy="48" r="2.5" fill="#000"/>
        <circle cx="60" cy="48" r="2.5" fill="#000"/>
        <path d="M 44 60 Q 50 56 56 60" stroke="#600" stroke-width="2.5" fill="none"/>
      </svg>`;
    } else if (hero === 'caocao') {
      // Cao Cao
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgCao" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1c2d42"/>
            <stop offset="100%" stop-color="#080f1a"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgCao)" stroke="#d4af37" stroke-width="3"/>
        <path d="M 18 90 Q 50 62 82 90 L 88 100 L 12 100 Z" fill="#1e375a" stroke="#d4af37" stroke-width="2"/>
        <ellipse cx="50" cy="46" rx="18" ry="21" fill="#e8c39e"/>
        <path d="M 38 56 Q 50 64 62 56 Q 50 58 38 56 Z" fill="#222"/>
        <path d="M 46 62 Q 50 72 54 62 Z" fill="#222"/>
        <path d="M 28 32 Q 50 18 72 32 L 68 22 Q 50 12 32 22 Z" fill="#d4af37" stroke="#b38715" stroke-width="1.5"/>
        <polygon points="50,10 54,20 46,20" fill="#3498db"/>
        <path d="M 36 41 L 44 43" stroke="#111" stroke-width="3" stroke-linecap="round"/>
        <path d="M 64 41 L 56 43" stroke="#111" stroke-width="3" stroke-linecap="round"/>
        <circle cx="41" cy="45" r="2" fill="#000"/>
        <circle cx="59" cy="45" r="2" fill="#000"/>
      </svg>`;
    } else if (hero === 'xiahou_dun') {
      // Xiahou Dun
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgXD" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#2c3e50"/>
            <stop offset="100%" stop-color="#0e1726"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgXD)" stroke="#3498db" stroke-width="3"/>
        <path d="M 16 90 Q 50 60 84 90 L 90 100 L 10 100 Z" fill="#1b2a47" stroke="#3498db" stroke-width="2"/>
        <ellipse cx="50" cy="47" rx="18" ry="21" fill="#e0b288"/>
        <line x1="28" y1="36" x2="54" y2="52" stroke="#111" stroke-width="3.5"/>
        <polygon points="32,38 43,38 41,49 30,49" fill="#111" stroke="#d4af37" stroke-width="1"/>
        <path d="M 28 30 Q 50 12 72 30 L 66 18 Q 50 8 34 18 Z" fill="#2c3e50" stroke="#d4af37" stroke-width="2"/>
        <polygon points="50,6 55,16 45,16" fill="#e74c3c"/>
        <path d="M 66 41 L 56 44" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <circle cx="61" cy="46" r="2.5" fill="#000"/>
        <path d="M 40 60 Q 50 66 60 60" stroke="#333" stroke-width="2.5" fill="none"/>
      </svg>`;
    } else if (hero === 'mountain_bandit_leader') {
      // Mountain Bandit Leader
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgMBL" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#512e17"/>
            <stop offset="100%" stop-color="#190d05"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgMBL)" stroke="#e67e22" stroke-width="3"/>
        <path d="M 14 90 Q 50 58 86 90 L 92 100 L 8 100 Z" fill="#3e2723" stroke="#e67e22" stroke-width="2"/>
        <ellipse cx="50" cy="48" rx="20" ry="22" fill="#b07d57"/>
        <path d="M 25 32 Q 50 14 75 32 L 70 20 Q 50 8 30 20 Z" fill="#4e342e" stroke="#e67e22" stroke-width="2"/>
        <path d="M 20 22 Q 5 8 0 -8" stroke="#e67e22" stroke-width="4" fill="none"/>
        <path d="M 80 22 Q 95 8 100 -8" stroke="#e67e22" stroke-width="4" fill="none"/>
        <path d="M 33 44 L 43 47" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M 67 44 L 57 47" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="38" cy="49" r="2.5" fill="#e74c3c"/>
        <circle cx="62" cy="49" r="2.5" fill="#e74c3c"/>
        <path d="M 38 64 Q 50 58 62 64" stroke="#222" stroke-width="3" fill="none"/>
      </svg>`;
    } else if (hero === 'yellowturban') {
      // Yellow Turban Bandit
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgYT" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#3d3512"/>
            <stop offset="100%" stop-color="#141104"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgYT)" stroke="#f1c40f" stroke-width="3"/>
        <path d="M 18 90 Q 50 64 82 90 L 88 100 L 12 100 Z" fill="#4a3f25" stroke="#f1c40f" stroke-width="1.5"/>
        <ellipse cx="50" cy="48" rx="19" ry="22" fill="#d99b70"/>
        <path d="M 26 38 Q 50 20 74 38 L 76 26 Q 50 14 24 26 Z" fill="#f1c40f" stroke="#b7950b" stroke-width="1.5"/>
        <path d="M 70 30 Q 85 35 90 45" stroke="#f1c40f" stroke-width="4" fill="none"/>
        <path d="M 34 44 L 43 47" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <path d="M 66 44 L 57 47" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <circle cx="39" cy="49" r="2.5" fill="#000"/>
        <circle cx="61" cy="49" r="2.5" fill="#000"/>
        <path d="M 30 40 L 40 55" stroke="#a93226" stroke-width="1.5"/>
      </svg>`;
    } else if (hero === 'bandit_leader') {
      // Bandit Leader
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgBL" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4a2318"/>
            <stop offset="100%" stop-color="#120604"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bgBL)" stroke="#e74c3c" stroke-width="3"/>
        <path d="M 16 90 Q 50 60 84 90 L 90 100 L 10 100 Z" fill="#2c3e50" stroke="#e74c3c" stroke-width="2"/>
        <ellipse cx="50" cy="47" rx="19" ry="22" fill="#c08a5d"/>
        <line x1="28" y1="38" x2="52" y2="52" stroke="#111" stroke-width="3"/>
        <polygon points="34,40 44,40 42,50 32,50" fill="#111"/>
        <path d="M 28 32 Q 50 14 72 32 L 68 20 Q 50 10 32 20 Z" fill="#7f8c8d" stroke="#d4af37" stroke-width="2"/>
        <path d="M 25 24 Q 10 10 5 -5" stroke="#d4af37" stroke-width="3" fill="none"/>
        <path d="M 75 24 Q 90 10 95 -5" stroke="#d4af37" stroke-width="3" fill="none"/>
        <path d="M 66 43 L 56 46" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <circle cx="61" cy="48" r="2.5" fill="#e74c3c"/>
        <path d="M 42 62 Q 50 56 58 62" stroke="#4a0000" stroke-width="3" fill="none"/>
      </svg>`;
    } else if (hero === 'soldier') {
      // Wei Messenger Guard
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#1c2536" stroke="#95a5a6" stroke-width="3"/>
        <path d="M 20 90 Q 50 65 80 90 L 85 100 L 15 100 Z" fill="#34495e" stroke="#7f8c8d" stroke-width="2"/>
        <ellipse cx="50" cy="48" rx="17" ry="20" fill="#e5c09f"/>
        <path d="M 30 38 Q 50 22 70 38 L 65 26 Q 50 16 35 26 Z" fill="#7f8c8d"/>
        <circle cx="41" cy="46" r="2" fill="#000"/>
        <circle cx="59" cy="46" r="2" fill="#000"/>
      </svg>`;
    } else if (hero === 'elder') {
      // Village Elder
      svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#2c2825" stroke="#d5dbdb" stroke-width="3"/>
        <path d="M 20 90 Q 50 65 80 90 L 85 100 L 15 100 Z" fill="#5d6d7e"/>
        <ellipse cx="50" cy="46" rx="18" ry="21" fill="#dfb897"/>
        <path d="M 32 50 Q 50 90 68 50 Z" fill="#ecf0f1"/>
        <path d="M 30 34 Q 50 25 70 34 Z" fill="#ecf0f1"/>
        <circle cx="41" cy="43" r="2" fill="#000"/>
        <circle cx="59" cy="43" r="2" fill="#000"/>
      </svg>`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }
};
