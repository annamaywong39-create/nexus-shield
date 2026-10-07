/**
 * Nexus Shield — True 3D Celestial Crypto Solar System & Secret 360° Galaxy Gem
 * 
 * FEATURES:
 * 1. SECRET 360° CELESTIAL GEM (Easter Egg Controller):
 *    - Minimalist 32px stardust gem in the bottom-left corner (occupies practically zero screen space!)
 *    - Unobtrusive idle opacity (0.38) that looks like a starry coordinate mark
 *    - Expands smoothly on hover/tap into a micro-pill with live bearing, ↻ Spin, and ⏸ Toggle
 *    - Secret Gamer Shortcuts:
 *      * Press 'G' key anytime to trigger the 360° celestial flyaround
 *      * Click the central "N" Sun core for a high-energy solar flare wave & 360° boost
 *      * Double-click background to spin 360°
 *      * Drag anywhere on the background to freely spin 360° with physical inertia
 *      * Discreet achievement toast: "✨ Secret Unlocked: 360° Celestial Drive [Press G]"
 * 2. TRUE 3D DEPTH OCCLUSION & PROJECTION (FOV = 720):
 *    - 24 crypto planets dynamically depth-sorted each frame
 *    - Sweeping in front (z > 0) scales up to 1.35x and occludes the Sun
 *    - Sweeping behind (z < 0) scales down to 0.7x, dims softly, and passes behind Sun
 *    - 3D perspective orbital tracks, constellation branches, and data tethers
 * 3. HEROIC ZOOMED-IN "N" SUN CORE:
 *    - Anchored solar core (340px base width on desktop)
 *    - Geometric "N" vector with dual-tone Trust Blue/Cyan lighting
 *    - Refined, dignified corona without harsh glare
 * 4. SHOOTING STARS & INTERACTIVE MOUSE LIGHT FOLLOWER:
 *    - Meteors shooting at intervals across the dark cosmos
 *    - Smooth cursor-tracking light orb with click ripples and stardust bursts
 */
(function() {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Ensure canvas exists
  let canvas = document.getElementById('crypto3dCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'crypto3dCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.display = 'block';
    document.body.prepend(canvas);
  }

  // Ensure Gaussian blur veil exists directly between canvas and content
  let veil = document.getElementById('cosmicVeil');
  if (!veil) {
    veil = document.createElement('div');
    veil.id = 'cosmicVeil';
    veil.className = 'cosmic-gaussian-veil';
    veil.setAttribute('aria-hidden', 'true');
    canvas.after(veil);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Load official high-res shield image
  const shieldImg = new Image();
  let shieldLoaded = false;
  shieldImg.crossOrigin = 'anonymous';
  shieldImg.onload = () => { shieldLoaded = true; };
  shieldImg.src = 'assets/images/logo-512.png';

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animId = null;

  // 360° Galaxy Orbit State
  let angle360 = 0; // Current azimuth angle in radians (0 to 2*PI)
  let autoSpin = true;
  let autoSpinSpeed = 0.0016; // Gentle ambient revolution (~45s per 360° cycle)
  let spinVelocity = 0;
  let cinematicSpinRemaining = 0;
  let isDragging = false;
  let dragStartX = 0;
  let lastDragX = 0;

  // 3D Perspective & Camera Tilt
  const FOV = 720;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let time = 0;

  // Mouse Light Follower
  let rawMouseX = -1000;
  let rawMouseY = -1000;
  let cursorX = -1000;
  let cursorY = -1000;
  let mouseActive = false;
  let mouseTrail = [];
  const MAX_TRAIL = 8;
  let clickPulse = 0;

  // Click shockwaves & sparks
  const ripples = [];
  const sparks = [];

  // Shooting stars
  const shootingStars = [];
  let nextStarTimer = 90;

  // 24 CRYPTO COINS IN TRUE 3D ORBITS AROUND THE "N" SUN
  const PLANETS = [
    // --- TIER 1: INNER CORE PLANETS (R: 210px - 330px) ---
    { name: 'BTC', sym: '₿', color: '#F7931A', r: 210, speed: 0.0065, theta: 0.5, incY: 0.38, incZ: 0.65, size: 24 },
    { name: 'ETH', sym: 'Ξ', color: '#627EEA', r: 250, speed: 0.0055, theta: 2.2, incY: 0.35, incZ: 0.68, size: 22 },
    { name: 'USDT', sym: '₮', color: '#26A17B', r: 290, speed: 0.0048, theta: 4.1, incY: 0.40, incZ: 0.62, size: 22 },
    { name: 'USDC', sym: '$', color: '#2775CA', r: 330, speed: 0.0042, theta: 1.3, incY: 0.37, incZ: 0.66, size: 21 },
    { name: 'NODE-A', sym: 'A', color: '#00F59B', r: 230, speed: -0.0046, theta: 3.6, incY: 0.42, incZ: 0.60, size: 16, isDataNode: true },

    // --- TIER 2: MID-INNER ORBITS (R: 370px - 490px) ---
    { name: 'SOL', sym: '◎', color: '#00FFA3', r: 370, speed: 0.0037, theta: 5.4, incY: 0.36, incZ: 0.67, size: 21 },
    { name: 'BNB', sym: '⬡', color: '#F3BA2F', r: 410, speed: 0.0033, theta: 3.1, incY: 0.39, incZ: 0.63, size: 21 },
    { name: 'XRP', sym: '✕', color: '#38BDF8', r: 450, speed: 0.0030, theta: 0.8, incY: 0.35, incZ: 0.68, size: 20 },
    { name: 'ADA', sym: '₳', color: '#60A5FA', r: 490, speed: 0.0027, theta: 2.5, incY: 0.41, incZ: 0.61, size: 20 },
    { name: 'NODE-B', sym: 'B', color: '#2D9FFF', r: 390, speed: -0.0032, theta: 1.8, incY: 0.38, incZ: 0.65, size: 16, isDataNode: true },

    // --- TIER 3: MID-OUTER ORBITS (R: 530px - 690px) ---
    { name: 'LINK', sym: '⬡', color: '#3B82F6', r: 530, speed: 0.0024, theta: 4.6, incY: 0.37, incZ: 0.66, size: 19 },
    { name: 'AVAX', sym: '▲', color: '#E84142', r: 570, speed: 0.0021, theta: 1.6, incY: 0.39, incZ: 0.64, size: 19 },
    { name: 'DOT', sym: '●', color: '#E6007A', r: 610, speed: 0.0019, theta: 3.7, incY: 0.36, incZ: 0.67, size: 19 },
    { name: 'MATIC', sym: '⬢', color: '#8247E5', r: 650, speed: 0.0017, theta: 5.9, incY: 0.40, incZ: 0.62, size: 19 },
    { name: 'DOGE', sym: 'Ð', color: '#C2A633', r: 690, speed: 0.0015, theta: 0.3, incY: 0.35, incZ: 0.68, size: 19 },
    { name: 'NODE-C', sym: 'C', color: '#2D9FFF', r: 550, speed: -0.0023, theta: 4.9, incY: 0.41, incZ: 0.61, size: 16, isDataNode: true },

    // --- TIER 4: DEEP GALAXY ORBITS (R: 730px - 970px) ---
    { name: 'TRX', sym: '⬡', color: '#EF0027', r: 730, speed: 0.0014, theta: 2.0, incY: 0.37, incZ: 0.66, size: 18 },
    { name: 'LTC', sym: 'Ł', color: '#345D9D', r: 770, speed: 0.0012, theta: 4.3, incY: 0.39, incZ: 0.64, size: 18 },
    { name: 'NEAR', sym: 'Ⓝ', color: '#00EC97', r: 810, speed: 0.0011, theta: 1.0, incY: 0.36, incZ: 0.67, size: 18 },
    { name: 'ATOM', sym: '⚛', color: '#6F76D9', r: 850, speed: 0.0010, theta: 3.3, incY: 0.40, incZ: 0.62, size: 18 },
    { name: 'UNI', sym: '🦄', color: '#FF007A', r: 890, speed: 0.0009, theta: 5.1, incY: 0.35, incZ: 0.68, size: 18 },
    { name: 'SHIB', sym: 'S', color: '#FFA409', r: 930, speed: 0.0008, theta: 0.7, incY: 0.38, incZ: 0.65, size: 17 },
    { name: 'XMR', sym: 'ɱ', color: '#FF6600', r: 970, speed: 0.0007, theta: 2.9, incY: 0.41, incZ: 0.61, size: 17 },
    { name: 'NODE-D', sym: 'D', color: '#00F59B', r: 710, speed: -0.0016, theta: 2.7, incY: 0.37, incZ: 0.66, size: 16, isDataNode: true }
  ];

  // Distinct 3D orbital rings/tracks
  const ORBITAL_TRACK_TIERS = [210, 330, 490, 650, 810];

  // Deep galaxy constellation nodes & branches
  const GALAXY_NODES = [];
  const GALAXY_BRANCHES = [];
  const TOTAL_GALAXY_NODES = 26;

  for (let i = 0; i < TOTAL_GALAXY_NODES; i++) {
    const angle = (i / TOTAL_GALAXY_NODES) * Math.PI * 2 + (i % 3) * 0.2;
    const dist = 600 + (i % 6) * 120;
    GALAXY_NODES.push({
      angle: angle,
      dist: dist,
      speed: 0.0003 * (i % 2 === 0 ? 1 : -1),
      parentIdx: i % PLANETS.length
    });
  }

  for (let i = 0; i < GALAXY_NODES.length; i++) {
    GALAXY_BRANCHES.push({ pIdx: GALAXY_NODES[i].parentIdx, gIdx: i });
    if (i > 0 && i % 3 !== 0) {
      GALAXY_BRANCHES.push({ gIdx1: i - 1, gIdx2: i });
    }
  }

  // Data pulses flowing along 3D tethers
  const pulses = [];
  for (let i = 0; i < PLANETS.length; i++) {
    pulses.push({
      planetIdx: i,
      t: Math.random(),
      speed: 0.004 + Math.random() * 0.005,
      outward: Math.random() > 0.5
    });
  }

  // 3D space dust/stars
  const stars = [];
  for (let i = 0; i < 45; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1100,
      z: (Math.random() - 0.5) * 600,
      size: 1 + Math.random() * 1.6
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Spawn Shooting Star with natural interval
  function spawnShootingStar() {
    const angle = Math.PI * 0.22 + (Math.random() - 0.5) * 0.18;
    const speed = 9 + Math.random() * 6;
    shootingStars.push({
      x: Math.random() * width * 0.9,
      y: -20 + Math.random() * (height * 0.35),
      len: 75 + Math.random() * 95,
      speed: speed,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: angle,
      life: 0,
      maxLife: 35 + Math.random() * 25,
      color: Math.random() > 0.5 ? '#00f59b' : (Math.random() > 0.4 ? '#38bdf8' : '#ffffff')
    });
    nextStarTimer = 180 + Math.floor(Math.random() * 180);
  }

  // Toast notification for secret achievement
  let toastTimer = null;
  function showSecretToast(msg = '✨ Secret Unlocked: 360° Celestial Drive') {
    const toast = document.getElementById('cosmicSecretToast');
    if (!toast) return;
    const label = toast.querySelector('span:first-child');
    if (label) label.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }

  // Trigger full cinematic 360-degree rotation sweep
  function triggerCinematic360Spin(fromUser = true) {
    cinematicSpinRemaining += Math.PI * 2;
    if (fromUser) {
      showSecretToast();
    }
    // Spawn celebration cosmic sparks
    const sunX = width / 2;
    const sunY = width > 800 ? Math.min(height * 0.4, 290) : height * 0.33;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const spd = 3.5 + Math.random() * 4.5;
      sparks.push({
        x: sunX,
        y: sunY,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2 + Math.random() * 2.5,
        life: 1.1,
        color: i % 2 === 0 ? '#00f59b' : '#38bdf8'
      });
    }
  }

  // Project 3D point in world space through camera rotation and perspective
  function projectPoint3D(wx, wy, wz, rx, ry, cx, cy) {
    // Rotation around Y (horizontal 360° yaw)
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x1 = wx * cosY - wz * sinY;
    const z1 = wx * sinY + wz * cosY;

    // Rotation around X (vertical pitch tilt)
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const y2 = wy * cosX - z1 * sinX;
    const z2 = wy * sinX + z1 * cosX;

    // 3D Perspective Projection
    const depth = FOV + z2;
    const scale = Math.max(0.15, FOV / (depth > 20 ? depth : 20));
    const sx = cx + x1 * scale;
    const sy = cy + y2 * scale;
    const alpha = Math.max(0.2, Math.min(1.0, (z2 + 450) / 750));

    return { sx, sy, scale, z: z2, alpha };
  }

  // Main Render Loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    time += 0.015;

    // 1. UPDATE 360° GALAXY ANGLE
    if (cinematicSpinRemaining > 0) {
      const step = Math.min(cinematicSpinRemaining, 0.075);
      angle360 += step;
      cinematicSpinRemaining -= step;
    } else if (!isDragging) {
      if (Math.abs(spinVelocity) > 0.0001) {
        angle360 += spinVelocity;
        spinVelocity *= 0.94; // Smooth physical friction
      } else if (autoSpin) {
        angle360 += autoSpinSpeed; // Gentle ambient 360° drift
      }
    }

    // Keep angle360 normalized 0 to 2*PI
    angle360 = ((angle360 % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Update Secret Gem Compass & Needle
    updateCosmicGem();

    // Smooth lerp for mouse elevation tilt
    currentTiltX += (targetTiltX - currentTiltX) * 0.06;
    currentTiltY += (targetTiltY - currentTiltY) * 0.06;

    // Fixed Sun Center (Anchor)
    const sunX = width / 2;
    const sunY = width < 480 ? Math.min(height * 0.28, 220) : (width > 800 ? Math.min(height * 0.4, 290) : height * 0.33);
    const scaleFactor = width < 480 ? 0.44 : (width < 768 ? 0.58 : (width < 1200 ? 0.78 : 0.95));

    // Camera rotation angles (Full 360° yaw around Y axis)
    const rotY = currentTiltX * 0.35 + angle360;
    const rotX = currentTiltY * 0.28 - 0.22; // Base isometric angle

    // 2. UPDATE & DRAW SHOOTING STARS
    nextStarTimer--;
    if (nextStarTimer <= 0) {
      spawnShootingStar();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const star = shootingStars[i];
      star.x += star.vx;
      star.y += star.vy;
      star.life++;

      const progress = star.life / star.maxLife;
      const alpha = progress < 0.25 ? (progress / 0.25) : (1 - (progress - 0.25) / 0.75);

      if (star.life >= star.maxLife || star.x > width + 100 || star.y > height + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      const tailX = star.x - Math.cos(star.angle) * star.len;
      const tailY = star.y - Math.sin(star.angle) * star.len;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(tailX, tailY);

      const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      grad.addColorStop(0, star.color);
      grad.addColorStop(1, 'rgba(4, 8, 18, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = alpha * 0.75;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(star.x, star.y, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = star.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = alpha * 0.95;
      ctx.fill();
      ctx.restore();
    }

    // 3. DRAW 3D BACKGROUND STARS (Rotate with galaxy)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const p = projectPoint3D(s.x, s.y, s.z, rotX * 0.3, rotY * 0.3, sunX, sunY);
      if (p.sx >= 0 && p.sx <= width && p.sy >= 0 && p.sy <= height) {
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, s.size * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. DRAW 3D ORBITAL TRACK RINGS
    ctx.strokeStyle = 'rgba(45, 159, 255, 0.08)';
    ctx.lineWidth = 0.9;
    for (let t = 0; t < ORBITAL_TRACK_TIERS.length; t++) {
      const ringR = ORBITAL_TRACK_TIERS[t] * scaleFactor;
      ctx.beginPath();
      const SAMPLES = 40;
      for (let s = 0; s <= SAMPLES; s++) {
        const phi = (s / SAMPLES) * Math.PI * 2;
        const wx = Math.cos(phi) * ringR;
        const wy = Math.sin(phi) * (ringR * 0.38);
        const wz = Math.sin(phi) * (ringR * 0.65);
        const pt = projectPoint3D(wx, wy, wz, rotX, rotY, sunX, sunY);
        if (s === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
      ctx.stroke();
    }

    // 5. COMPUTE 24 PLANETS IN TRUE 3D ORBITS
    const planetPos = [];
    for (let i = 0; i < PLANETS.length; i++) {
      const p = PLANETS[i];
      p.theta += p.speed;

      const currentR = p.r * scaleFactor;
      const wx = Math.cos(p.theta) * currentR;
      const wy = Math.sin(p.theta) * (currentR * p.incY);
      const wz = Math.sin(p.theta) * (currentR * p.incZ);

      const proj = projectPoint3D(wx, wy, wz, rotX, rotY, sunX, sunY);

      planetPos.push({
        ...p,
        idx: i,
        x: proj.sx,
        y: proj.sy,
        z: proj.z,
        scale: proj.scale,
        alpha: proj.alpha
      });
    }

    // 6. COMPUTE GALAXY NODES IN 3D
    const galaxyPos = [];
    for (let i = 0; i < GALAXY_NODES.length; i++) {
      const gn = GALAXY_NODES[i];
      gn.angle += gn.speed;

      const d = gn.dist * scaleFactor;
      const wx = Math.cos(gn.angle) * d;
      const wy = Math.sin(gn.angle) * (d * 0.42);
      const wz = Math.sin(gn.angle) * (d * 0.65);

      const proj = projectPoint3D(wx, wy, wz, rotX, rotY, sunX, sunY);
      galaxyPos.push({ x: proj.sx, y: proj.sy, scale: proj.scale });
    }

    // 7. DRAW DEEP GALAXY BRANCHES
    ctx.strokeStyle = 'rgba(45, 159, 255, 0.12)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < GALAXY_BRANCHES.length; i++) {
      const b = GALAXY_BRANCHES[i];
      let p1, p2;
      if (b.pIdx !== undefined) {
        p1 = planetPos[b.pIdx];
        p2 = galaxyPos[b.gIdx];
      } else {
        p1 = galaxyPos[b.gIdx1];
        p2 = galaxyPos[b.gIdx2];
      }
      if (!p1 || !p2) continue;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 8. DRAW FAINT GALAXY NODES
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    for (let i = 0; i < galaxyPos.length; i++) {
      const g = galaxyPos[i];
      ctx.beginPath();
      ctx.arc(g.x, g.y, 2 * g.scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. DRAW 3D PLANET-TO-SUN TETHERS
    ctx.strokeStyle = 'rgba(0, 245, 155, 0.18)';
    ctx.lineWidth = 1.0;
    for (let i = 0; i < planetPos.length; i++) {
      const p = planetPos[i];
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // 10. DRAW TETHER DATA PULSES
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < pulses.length; i++) {
      const pkt = pulses[i];
      pkt.t += pkt.speed * (pkt.outward ? 1 : -1);
      if (pkt.t > 1) { pkt.t = 1; pkt.outward = false; }
      else if (pkt.t < 0) { pkt.t = 0; pkt.outward = true; }

      const p = planetPos[pkt.planetIdx];
      if (!p) continue;

      const px = sunX + (p.x - sunX) * pkt.t;
      const py = sunY + (p.y - sunY) * pkt.t;

      ctx.beginPath();
      ctx.arc(px, py, 1.8 * p.scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 11. DEPTH-SORT ALL 24 PLANETS (Z-INDEX PAINTER'S ALGORITHM)
    const sortedPlanets = [...planetPos].sort((a, b) => a.z - b.z);

    // 12. DRAW PLANETS BEHIND SUN (z < 0)
    for (let i = 0; i < sortedPlanets.length; i++) {
      if (sortedPlanets[i].z < 0) {
        drawPlanetNode(sortedPlanets[i]);
      }
    }

    // 13. DRAW THE HEROIC ZOOMED-IN "N" SUN CORE
    drawCentralSunN(sunX, sunY);

    // 14. DRAW PLANETS IN FRONT OF SUN (z >= 0)
    for (let i = 0; i < sortedPlanets.length; i++) {
      if (sortedPlanets[i].z >= 0) {
        drawPlanetNode(sortedPlanets[i]);
      }
    }

    // 15. DRAW CLICK RIPPLES
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += 3.2;
      rip.alpha *= 0.93;

      if (rip.alpha <= 0.02 || rip.r >= rip.maxR) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = rip.color;
      ctx.lineWidth = Math.max(1, 2.5 * (rip.alpha / 0.85));
      ctx.globalAlpha = rip.alpha;
      ctx.shadowColor = rip.color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }

    // 16. DRAW CLICK STARDUST SPARKS
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spk = sparks[i];
      spk.x += spk.vx;
      spk.y += spk.vy;
      spk.vx *= 0.95;
      spk.vy *= 0.95;
      spk.life -= 0.025;

      if (spk.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(spk.x, spk.y, spk.size * spk.life, 0, Math.PI * 2);
      ctx.fillStyle = spk.color;
      ctx.globalAlpha = spk.life * 0.85;
      ctx.shadowColor = spk.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    // 17. DRAW BLURRY MOUSE LIGHT FOLLOWER
    if (mouseActive) {
      cursorX += (rawMouseX - cursorX) * 0.16;
      cursorY += (rawMouseY - cursorY) * 0.16;
      clickPulse *= 0.88;

      mouseTrail.unshift({ x: cursorX, y: cursorY });
      if (mouseTrail.length > MAX_TRAIL) {
        mouseTrail.pop();
      }

      for (let i = mouseTrail.length - 1; i > 0; i--) {
        const p1 = mouseTrail[i];
        const trailAlpha = ((MAX_TRAIL - i) / MAX_TRAIL) * 0.22;
        const trailR = Math.max(12, (MAX_TRAIL - i) * 3);

        ctx.save();
        const trailGrad = ctx.createRadialGradient(p1.x, p1.y, 0, p1.x, p1.y, trailR);
        trailGrad.addColorStop(0, 'rgba(45, 159, 255, 0.25)');
        trailGrad.addColorStop(1, 'rgba(4, 8, 18, 0)');
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, trailR, 0, Math.PI * 2);
        ctx.fillStyle = trailGrad;
        ctx.globalAlpha = trailAlpha;
        ctx.fill();
        ctx.restore();
      }

      const lightRadius = 45 + clickPulse * 30;
      ctx.save();
      const orbGrad = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, lightRadius);
      orbGrad.addColorStop(0, `rgba(255, 255, 255, ${0.45 + clickPulse * 0.4})`);
      orbGrad.addColorStop(0.25, `rgba(0, 245, 155, ${0.35 + clickPulse * 0.3})`);
      orbGrad.addColorStop(0.6, `rgba(45, 159, 255, ${0.18 + clickPulse * 0.2})`);
      orbGrad.addColorStop(1, 'rgba(4, 8, 18, 0)');

      ctx.beginPath();
      ctx.arc(cursorX, cursorY, lightRadius, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 2.5 + clickPulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.shadowColor = '#00f59b';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    animId = requestAnimationFrame(render);
  }

  // DRAW THE ZOOMED-IN BOLD "N" SUN CORE
  function drawCentralSunN(x, y) {
    const sunBaseSize = width < 480 ? 190 : (width < 768 ? 230 : (width < 1200 ? 280 : 340));
    const w = sunBaseSize;
    const h = sunBaseSize;

    ctx.save();
    ctx.translate(x, y);

    // Refined solar corona
    const haloRadius = w * 0.54;
    const corona = ctx.createRadialGradient(0, 0, haloRadius * 0.2, 0, 0, haloRadius);
    corona.addColorStop(0, 'rgba(0, 245, 155, 0.20)');
    corona.addColorStop(0.5, 'rgba(45, 159, 255, 0.09)');
    corona.addColorStop(1, 'rgba(4, 8, 18, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
    ctx.fillStyle = corona;
    ctx.fill();

    // Shield Contour
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.46);
    ctx.lineTo(w * 0.42, -h * 0.32);
    ctx.lineTo(w * 0.36, h * 0.18);
    ctx.lineTo(0, h * 0.46);
    ctx.lineTo(-w * 0.36, h * 0.18);
    ctx.lineTo(-w * 0.42, -h * 0.32);
    ctx.closePath();

    ctx.fillStyle = 'rgba(6, 11, 26, 0.90)';
    ctx.strokeStyle = 'rgba(0, 245, 155, 0.5)';
    ctx.lineWidth = 2.4;
    ctx.fill();
    ctx.stroke();

    // THE BOLD ZOOMED-IN "N"
    const nw = w * 0.46;
    const nh = h * 0.56;

    // Left Pillar of "N"
    ctx.beginPath();
    ctx.moveTo(-nw * 0.45, -nh * 0.42);
    ctx.lineTo(-nw * 0.18, -nh * 0.42);
    ctx.lineTo(-nw * 0.18, nh * 0.42);
    ctx.lineTo(-nw * 0.45, nh * 0.42);
    ctx.closePath();
    ctx.fillStyle = '#2D9FFF';
    ctx.fill();

    // Diagonal Slash of "N"
    ctx.beginPath();
    ctx.moveTo(-nw * 0.22, -nh * 0.42);
    ctx.lineTo(nw * 0.22, nh * 0.42);
    ctx.lineTo(nw * 0.45, nh * 0.42);
    ctx.lineTo(-nw * 0.05, -nh * 0.42);
    ctx.closePath();
    ctx.fillStyle = '#00F59B';
    ctx.fill();

    // Right Pillar of "N"
    ctx.beginPath();
    ctx.moveTo(nw * 0.18, -nh * 0.42);
    ctx.lineTo(nw * 0.45, -nh * 0.48);
    ctx.lineTo(nw * 0.45, nh * 0.42);
    ctx.lineTo(nw * 0.18, nh * 0.42);
    ctx.closePath();
    ctx.fillStyle = '#38BDF8';
    ctx.fill();

    // Diagonal Energy Ridge
    ctx.beginPath();
    ctx.moveTo(-nw * 0.18, -nh * 0.42);
    ctx.lineTo(nw * 0.32, nh * 0.42);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Draw authentic official texture if loaded
    if (shieldLoaded) {
      ctx.globalAlpha = 0.84;
      ctx.drawImage(shieldImg, -w / 2, -h / 2, w, h);
    }

    ctx.restore();
  }

  // DRAW 3D PLANET NODE
  function drawPlanetNode(node) {
    const r = node.size * node.scale;

    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.globalAlpha = node.alpha;

    // Glowing halo
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.globalAlpha = node.alpha * 0.3;
    ctx.fill();

    // Dark celestial disc
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 11, 26, 0.92)';
    ctx.strokeStyle = node.color;
    ctx.lineWidth = Math.max(1.2, 1.8 * node.scale);
    ctx.globalAlpha = node.alpha;
    ctx.fill();
    ctx.stroke();

    // Symbol (₿, Ξ, ₮, ◎, etc.)
    const fontSize = Math.round(r * (node.isDataNode ? 0.95 : 1.15));
    ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.sym, 0, 0.5);

    // Ticker Label underneath
    if (r > 13) {
      ctx.font = `700 ${Math.round(8.5 * node.scale)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.fillText(node.name, 0, r + 9 * node.scale);
    }

    ctx.restore();
  }

  // CREATE SECRET COSMIC GEM (Minimalist Easter Egg Controller)
  function createCosmicGem() {
    if (document.getElementById('cosmicGem')) return;

    const gem = document.createElement('aside');
    gem.id = 'cosmicGem';
    gem.className = 'cosmic-gem';
    gem.setAttribute('aria-label', 'Secret 360° Celestial Gem');

    gem.innerHTML = `
      <div class="cosmic-gem-capsule" id="cosmicGemCapsule" title="✨ Secret Gem: 360° Celestial Drive (Hover / Tap)">
        <div class="cosmic-gem-icon">
          <svg viewBox="0 0 24 24" class="cosmic-gem-svg">
            <circle cx="12" cy="12" r="9" stroke="rgba(0,245,155,0.4)" stroke-width="1.5" fill="none"/>
            <g id="cosmicGemNeedle">
              <line x1="12" y1="12" x2="12" y2="4" stroke="#00f59b" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="12" x2="12" y2="20" stroke="rgba(45,159,255,0.7)" stroke-width="1.5" stroke-linecap="round"/>
            </g>
            <circle cx="12" cy="12" r="2.2" fill="#2d9fff"/>
          </svg>
        </div>
        <div class="cosmic-gem-tray">
          <span class="cosmic-gem-bearing" id="cosmicGemDeg">0°</span>
          <button type="button" class="cosmic-gem-btn" id="btnGemSpin" title="Cinematic 360° Flyaround">↻</button>
          <button type="button" class="cosmic-gem-btn active" id="btnGemAuto" title="Toggle Auto Orbit">⏸</button>
        </div>
      </div>
    `;

    // Achievement Toast
    const toast = document.createElement('div');
    toast.id = 'cosmicSecretToast';
    toast.className = 'cosmic-secret-toast';
    toast.innerHTML = `
      <span>✨ Secret Unlocked: 360° Celestial Drive</span>
      <span class="toast-key">Press G</span>
    `;

    document.body.appendChild(gem);
    document.body.appendChild(toast);

    // Event listeners
    const btnSpin = document.getElementById('btnGemSpin');
    if (btnSpin) {
      btnSpin.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerCinematic360Spin(true);
      });
    }

    const btnAuto = document.getElementById('btnGemAuto');
    if (btnAuto) {
      btnAuto.addEventListener('click', (e) => {
        e.stopPropagation();
        autoSpin = !autoSpin;
        btnAuto.textContent = autoSpin ? '⏸' : '▶';
        btnAuto.classList.toggle('active', autoSpin);
      });
    }

    // Touch support: Tap gem to expand/collapse on mobile
    const capsule = document.getElementById('cosmicGemCapsule');
    if (capsule) {
      capsule.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        gem.classList.toggle('expanded');
        if (gem.classList.contains('expanded')) {
          setTimeout(() => { gem.classList.remove('expanded'); }, 4000);
        }
      });
    }
  }

  // Update Secret Gem Needle & Degrees
  function updateCosmicGem() {
    const deg = Math.round((angle360 * 180) / Math.PI) % 360;
    const degEl = document.getElementById('cosmicGemDeg');
    if (degEl) degEl.textContent = `${deg}°`;

    const needle = document.getElementById('cosmicGemNeedle');
    if (needle) {
      needle.setAttribute('transform', `rotate(${deg} 12 12)`);
    }
  }

  // Mouse tracking
  function updateMouse(clientX, clientY) {
    mouseActive = true;
    rawMouseX = clientX;
    rawMouseY = clientY;

    if (cursorX === -1000) {
      cursorX = clientX;
      cursorY = clientY;
    }

    const nx = (clientX - width / 2) / (width / 2);
    const ny = (clientY - height / 2) / (height / 2);

    targetTiltX = nx * 0.42;
    targetTiltY = -ny * 0.32;
  }

  // Click handler (Sparks, shockwaves, and Sun click detection)
  function onUserClick(clientX, clientY) {
    mouseActive = true;
    rawMouseX = clientX;
    rawMouseY = clientY;
    cursorX = clientX;
    cursorY = clientY;

    clickPulse = 1.0;

    // Check if user clicked directly on the central "N" Sun core (Secret Easter Egg!)
    const sunX = width / 2;
    const sunY = width > 800 ? Math.min(height * 0.4, 290) : height * 0.33;
    const distToSun = Math.hypot(clientX - sunX, clientY - sunY);
    const sunTriggerR = width < 768 ? 90 : 130;

    if (distToSun < sunTriggerR) {
      // Direct hit on the "N" Sun!
      triggerCinematic360Spin(true);
      showSecretToast('✨ Solar Drive Engaged: 360° Revolution');
      // Massive solar flare pulse
      for (let i = 0; i < 22; i++) {
        const ang = (i / 22) * Math.PI * 2;
        const spd = 4 + Math.random() * 5.5;
        sparks.push({
          x: sunX,
          y: sunY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 2.5 + Math.random() * 2,
          life: 1.2,
          color: i % 2 === 0 ? '#00f59b' : '#38bdf8'
        });
      }
      return;
    }

    ripples.push({
      x: clientX,
      y: clientY,
      r: 6,
      maxR: 85,
      alpha: 0.85,
      color: Math.random() > 0.5 ? '#00f59b' : '#38bdf8'
    });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const spd = 2 + Math.random() * 4;
      sparks.push({
        x: clientX,
        y: clientY,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 1.5 + Math.random() * 2,
        life: 1.0,
        color: Math.random() > 0.4 ? '#00f59b' : (Math.random() > 0.5 ? '#2d9fff' : '#ffffff')
      });
    }
  }

  // Check if target is an interactive UI element that must NOT trigger drag
  function isInteractiveElement(target) {
    if (!target || !target.closest) return false;
    return !!target.closest('button, a, input, textarea, select, label, .btn, .nav-link, .cosmic-gem, .mobile-nav-toggle, [role="button"]');
  }

  // Pointer & Drag Handlers (Seamless 360° Drag on desktop; unhindered vertical scroll on mobile)
  let touchStartX = 0;
  let touchStartY = 0;
  let isHorizontalTouchDrag = false;

  window.addEventListener('pointerdown', (e) => {
    if (isInteractiveElement(e.target)) return;
    if (e.pointerType === 'touch') {
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      isHorizontalTouchDrag = false;
      isDragging = false;
      onUserClick(e.clientX, e.clientY);
      return;
    }
    isDragging = true;
    dragStartX = e.clientX;
    lastDragX = e.clientX;
    spinVelocity = 0;
    onUserClick(e.clientX, e.clientY);
  });

  window.addEventListener('pointermove', (e) => {
    updateMouse(e.clientX, e.clientY);

    if (e.pointerType === 'touch') {
      const dx = e.clientX - touchStartX;
      const dy = e.clientY - touchStartY;
      // Only engage galaxy spin if gesture is deliberately horizontal (prevents scroll jamming)
      if (!isHorizontalTouchDrag && Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy) * 1.8) {
        isHorizontalTouchDrag = true;
        isDragging = true;
        lastDragX = e.clientX;
      }
      if (isHorizontalTouchDrag && isDragging) {
        const moveDx = e.clientX - lastDragX;
        lastDragX = e.clientX;
        angle360 += moveDx * 0.0055;
        spinVelocity = moveDx * 0.004;
      }
      return;
    }

    if (isDragging) {
      const dx = e.clientX - lastDragX;
      lastDragX = e.clientX;
      angle360 += dx * 0.0055;
      spinVelocity = dx * 0.004;
    }
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
    isHorizontalTouchDrag = false;
  });

  window.addEventListener('pointercancel', () => {
    isDragging = false;
    isHorizontalTouchDrag = false;
  });

  // Double-click on background triggers cinematic 360° orbit
  window.addEventListener('dblclick', (e) => {
    if (isInteractiveElement(e.target)) return;
    triggerCinematic360Spin(true);
  });

  // Mobile Touch Double-Tap detection
  let lastTouchTapTime = 0;
  window.addEventListener('touchstart', (e) => {
    if (isInteractiveElement(e.target)) return;
    const now = Date.now();
    if (now - lastTouchTapTime < 320) {
      triggerCinematic360Spin(true);
      lastTouchTapTime = 0;
    } else {
      lastTouchTapTime = now;
    }
  }, { passive: true });

  // Expose global trigger for mobile drawer button
  window.triggerCinematic360Spin = triggerCinematic360Spin;

  // Keyboard Easter Egg: Press 'G' for 360° Galaxy Orbit Flyaround
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
      return;
    }
    if (e.key === 'g' || e.key === 'G') {
      triggerCinematic360Spin(true);
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      if (isDragging) {
        const dx = e.touches[0].clientX - lastDragX;
        lastDragX = e.touches[0].clientX;
        angle360 += dx * 0.0055;
        spinVelocity = dx * 0.004;
      }
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(render);
    }
  });

  // Init
  function init() {
    resize();
    createCosmicGem();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
