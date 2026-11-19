// All game art is drawn as SVG here and rasterized into Phaser textures at boot.
// No external image files needed: swap any entry for a PNG later if you get custom art.
(function () {
  const O = '#3b2716'; // outline colour used everywhere for a cohesive cartoon look

  const svg = (w, h, vw, vh, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}">${body}</svg>`;

  // Thick "limb" helper: outline stroke + colour stroke on top
  const limb = (x1, y1, x2, y2, col, wOut = 10, wIn = 6) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${O}" stroke-width="${wOut}" stroke-linecap="round" fill="none"/>` +
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${col}" stroke-width="${wIn}" stroke-linecap="round" fill="none"/>`;

  // Seeded random so the background looks the same every time
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------------------------------------------------------------- FARMER
  function farmer(step) {
    const a = step * 5;
    return svg(72, 112, 64, 100, `
      <ellipse cx="32" cy="95" rx="17" ry="4.5" fill="#000" opacity=".2"/>
      ${limb(27, 68, 26 + a, 87, '#2f5d9e', 11, 7)}
      ${limb(37, 68, 38 - a, 87, '#3a6cb3', 11, 7)}
      <ellipse cx="${25 + a}" cy="90" rx="6.5" ry="4" fill="#5a3a22" stroke="${O}" stroke-width="2"/>
      <ellipse cx="${39 - a}" cy="90" rx="6.5" ry="4" fill="#6b4529" stroke="${O}" stroke-width="2"/>
      ${limb(20, 46, 16 - a * 0.7, 64, '#b83a2e', 10, 6)}
      <circle cx="${16 - a * 0.7}" cy="65" r="3.8" fill="#f2c29b" stroke="${O}" stroke-width="2"/>
      <rect x="18" y="38" width="28" height="32" rx="10" fill="#d64a3a" stroke="${O}" stroke-width="2.5"/>
      <path d="M25 40v27M39 40v27M19 50h26" stroke="#a83226" stroke-width="2" opacity=".7"/>
      <path d="M24 41 L22 54 M40 41 L42 54" stroke="#3c74c4" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M21 53 h22 v12 q0 5 -5 5 h-12 q-5 0 -5 -5z" fill="#3c74c4" stroke="${O}" stroke-width="2.5"/>
      <rect x="27" y="57" width="10" height="6" rx="2" fill="#2f5d9e"/>
      <circle cx="24" cy="55.5" r="1.6" fill="#f2c14e"/><circle cx="40" cy="55.5" r="1.6" fill="#f2c14e"/>
      ${limb(44, 46, 48 + a * 0.7, 64, '#d64a3a', 10, 6)}
      <circle cx="${48 + a * 0.7}" cy="65" r="3.8" fill="#f2c29b" stroke="${O}" stroke-width="2"/>
      <circle cx="19.5" cy="28" r="3.2" fill="#f2bb93" stroke="${O}" stroke-width="2"/>
      <circle cx="44.5" cy="28" r="3.2" fill="#f2bb93" stroke="${O}" stroke-width="2"/>
      <circle cx="32" cy="27" r="12.5" fill="#f5c9a4" stroke="${O}" stroke-width="2.5"/>
      <path d="M20.5 22 q2 7 5 4 M43.5 22 q-2 7 -5 4" fill="#7a4a26" stroke="${O}" stroke-width="1.5"/>
      <circle cx="27.5" cy="28" r="1.9" fill="${O}"/><circle cx="36.5" cy="28" r="1.9" fill="${O}"/>
      <circle cx="28.1" cy="27.4" r=".6" fill="#fff"/><circle cx="37.1" cy="27.4" r=".6" fill="#fff"/>
      <ellipse cx="24.5" cy="32" rx="2.6" ry="1.6" fill="#ff8b8b" opacity=".55"/>
      <ellipse cx="39.5" cy="32" rx="2.6" ry="1.6" fill="#ff8b8b" opacity=".55"/>
      <path d="M28.5 33.5 q3.5 3 7 0" fill="none" stroke="${O}" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="32" cy="18.5" rx="22" ry="5.5" fill="#e8bd4f" stroke="${O}" stroke-width="2.5"/>
      <path d="M21 19 q0 -13 11 -13 q11 0 11 13z" fill="#f6d36e" stroke="${O}" stroke-width="2.5"/>
      <path d="M21.8 15.5 q10 3 20.4 0" stroke="#c0452f" stroke-width="3.2" fill="none"/>
      <path d="M26 9 q4 -2 8 0" stroke="#fff3c4" stroke-width="1.6" fill="none" opacity=".8"/>
    `);
  }

  // ---------------------------------------------------------------- COW
  const COWS = {
    holstein: { body: '#fbfbf7', spot: '#2d2a2a', leg: '#ecebe4' },
    brown: { body: '#fff8ee', spot: '#9a5a32', leg: '#efe6d8' },
  };
  function cow(variant, p) {
    const c = COWS[variant];
    const legDx = (i) => (i % 2 === 0 ? p : -p) * 4;
    const leg = (x, i, col) =>
      limb(x, 66, x + legDx(i), 94, col, 13, 9) +
      `<rect x="${x + legDx(i) - 5.5}" y="92" width="11" height="7" rx="2.5" fill="#4a3b33" stroke="${O}" stroke-width="2"/>`;
    return svg(160, 110, 160, 110, `
      <ellipse cx="78" cy="100" rx="56" ry="7" fill="#000" opacity=".18"/>
      ${leg(42, 1, c.leg)}${leg(108, 0, c.leg)}
      <clipPath id="b"><rect x="22" y="32" width="102" height="46" rx="23"/></clipPath>
      <rect x="22" y="32" width="102" height="46" rx="23" fill="${c.body}"/>
      <g clip-path="url(#b)" fill="${c.spot}">
        <path d="M38 28 q20 3 16 19 q-6 12 -21 6 q-10 -9 5 -25z"/>
        <ellipse cx="90" cy="72" rx="15" ry="11"/>
        <path d="M70 28 q15 0 13 11 q-4 9 -15 4z"/>
        <ellipse cx="114" cy="48" rx="7" ry="7"/>
        <ellipse cx="30" cy="70" rx="6" ry="5"/>
      </g>
      <rect x="22" y="32" width="102" height="46" rx="23" fill="none" stroke="${O}" stroke-width="3"/>
      <path d="M40 38 q25 -5 55 0" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M25 44 q-13 9 -10 28" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M25 44 q-13 9 -10 28" stroke="${c.body}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M15 70 q-5 4 -2 10 q5 2 7 -3 q0 -6 -5 -7z" fill="${c.spot}" stroke="${O}" stroke-width="2"/>
      <ellipse cx="62" cy="79" rx="11" ry="6.5" fill="#f7a8b0" stroke="${O}" stroke-width="2.2"/>
      <path d="M56 85v3M62 85.5v3M68 85v3" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>
      ${leg(54, 0, c.body)}${leg(118, 1, c.body)}
      <path d="M118 28 l-5 -9 M142 28 l5 -9" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
      <path d="M118 28 l-5 -9 M142 28 l5 -9" stroke="#f3e3b5" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="109" cy="36" rx="9" ry="5" transform="rotate(-25 109 36)" fill="${c.body}" stroke="${O}" stroke-width="2.2"/>
      <ellipse cx="151" cy="36" rx="9" ry="5" transform="rotate(25 151 36)" fill="${c.body}" stroke="${O}" stroke-width="2.2"/>
      <ellipse cx="109" cy="36" rx="4.5" ry="2.2" transform="rotate(-25 109 36)" fill="#f7a8b0"/>
      <ellipse cx="151" cy="36" rx="4.5" ry="2.2" transform="rotate(25 151 36)" fill="#f7a8b0"/>
      <clipPath id="h"><ellipse cx="130" cy="44" rx="17" ry="19"/></clipPath>
      <ellipse cx="130" cy="44" rx="17" ry="19" fill="${c.body}"/>
      <ellipse clip-path="url(#h)" cx="${variant === 'holstein' ? 120 : 141}" cy="34" rx="10" ry="12" fill="${c.spot}"/>
      <ellipse cx="130" cy="44" rx="17" ry="19" fill="none" stroke="${O}" stroke-width="2.6"/>
      <ellipse cx="130" cy="58" rx="16" ry="11" fill="#f6b6b0" stroke="${O}" stroke-width="2.6"/>
      <ellipse cx="124" cy="58" rx="2.2" ry="3" fill="#b56b6b"/><ellipse cx="136" cy="58" rx="2.2" ry="3" fill="#b56b6b"/>
      <circle cx="123" cy="41" r="3" fill="${O}"/><circle cx="137" cy="41" r="3" fill="${O}"/>
      <circle cx="124" cy="40" r="1" fill="#fff"/><circle cx="138" cy="40" r="1" fill="#fff"/>
      <ellipse cx="118" cy="49" rx="3" ry="1.8" fill="#ff8b8b" opacity=".5"/>
      <ellipse cx="142" cy="49" rx="3" ry="1.8" fill="#ff8b8b" opacity=".5"/>
    `);
  }
  // Mud overlay that matches the cow silhouette; alpha is driven by dirtiness
  const cowDirt = () => svg(160, 110, 160, 110, `
    <g fill="#7a5530" opacity=".85">
      <ellipse cx="48" cy="70" rx="12" ry="6"/><ellipse cx="100" cy="74" rx="9" ry="4"/>
      <circle cx="70" cy="60" r="4"/><circle cx="36" cy="56" r="3"/><circle cx="110" cy="62" r="3.5"/>
      <ellipse cx="44" cy="92" rx="7" ry="4"/><ellipse cx="114" cy="92" rx="7" ry="4"/>
      <ellipse cx="58" cy="92" rx="6" ry="3.5"/><ellipse cx="122" cy="92" rx="6" ry="3.5"/>
      <circle cx="132" cy="30" r="3"/>
    </g>`);

  // ---------------------------------------------------------------- CHICKEN
  const HENS = {
    white: { body: '#ffffff', wing: '#ebe7df', tail: '#f3efe7' },
    brown: { body: '#d48a4a', wing: '#b06a32', tail: '#8f5126' },
  };
  function chicken(variant, frame) {
    const c = HENS[variant];
    const s = frame === 1 ? 4 : 0;
    const head = frame === 2 ? 'transform="translate(6 15) rotate(32 42 18)"' : '';
    return svg(56, 56, 60, 60, `
      <ellipse cx="29" cy="56" rx="16" ry="3.5" fill="#000" opacity=".18"/>
      <path d="M26 44 L${23 - s} 55 M33 44 L${35 + s} 55" stroke="#e8902a" stroke-width="3" stroke-linecap="round"/>
      <path d="M${19 - s} 55 h8 M${32 + s} 55 h8" stroke="#e8902a" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M13 31 q-11 -16 0 -19 q3 9 8 11z" fill="${c.tail}" stroke="${O}" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="M10 32 q0 -15 19 -15 q16 0 18 13 q2 16 -17 18 q-20 0 -20 -16z" fill="${c.body}" stroke="${O}" stroke-width="2.5"/>
      <path d="M18 31 q11 -5 17 4 q-7 8 -17 1z" fill="${c.wing}" stroke="${O}" stroke-width="2"/>
      <g ${head}>
        <path d="M36.5 11.5 q0 -7 4.5 -3.5 q2 -6 5.5 -1 q4.5 -2 2.5 5z" fill="#e23b3b" stroke="${O}" stroke-width="1.8"/>
        <circle cx="42" cy="18" r="9" fill="${c.body}" stroke="${O}" stroke-width="2.5"/>
        <path d="M50 15.5 l7.5 3 l-7.5 3z" fill="#f5b82e" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/>
        <ellipse cx="49" cy="25" rx="2.4" ry="3.6" fill="#e23b3b" stroke="${O}" stroke-width="1.2"/>
        <circle cx="45" cy="16" r="1.9" fill="${O}"/><circle cx="45.6" cy="15.4" r=".6" fill="#fff"/>
        <ellipse cx="43" cy="21" rx="2" ry="1.2" fill="#ff8b8b" opacity=".6"/>
      </g>
    `);
  }
  const henDirt = () => svg(56, 56, 60, 60, `
    <g fill="#7a5530" opacity=".85"><ellipse cx="22" cy="42" rx="6" ry="3"/><circle cx="34" cy="38" r="2.5"/>
    <circle cx="16" cy="34" r="2"/><circle cx="40" cy="30" r="1.8"/></g>`);

  // ---------------------------------------------------------------- BUILDINGS
  const barn = () => {
    let planks = '';
    for (let x = 46; x < 230; x += 16) planks += `<path d="M${x} 100 V228" stroke="#a8332d" stroke-width="2"/>`;
    let shingles = '';
    for (let y = 38; y < 100; y += 12) shingles += `<path d="M${30 + (100 - y) * 0.2} ${y} H${230 - (100 - y) * 0.2}" stroke="#6a3324" stroke-width="2" opacity=".6"/>`;
    return svg(270, 250, 260, 240, `
      <ellipse cx="130" cy="230" rx="118" ry="10" fill="#000" opacity=".18"/>
      <rect x="30" y="95" width="200" height="133" fill="#c8423a" stroke="${O}" stroke-width="3"/>
      ${planks}
      <clipPath id="r"><path d="M18 102 L58 46 L130 18 L202 46 L242 102 Z"/></clipPath>
      <path d="M18 102 L58 46 L130 18 L202 46 L242 102 Z" fill="#8d4a34"/>
      <g clip-path="url(#r)">${shingles}</g>
      <path d="M18 102 L58 46 L130 18 L202 46 L242 102" fill="none" stroke="#f4efe6" stroke-width="7" stroke-linejoin="round"/>
      <path d="M18 102 L58 46 L130 18 L202 46 L242 102 Z" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="108" y="50" width="44" height="36" fill="#3b2716" stroke="#f4efe6" stroke-width="5"/>
      <path d="M112 86 q8 -14 18 -6 q10 -10 20 6z" fill="#efc95a" stroke="${O}" stroke-width="1.5"/>
      <rect x="82" y="138" width="96" height="90" fill="#b23a33" stroke="#f4efe6" stroke-width="6"/>
      <path d="M85 141 L130 225 M130 141 L85 225 M130 141 L175 225 M175 141 L130 225 M130 140 V228" stroke="#f4efe6" stroke-width="5"/>
      <rect x="79" y="135" width="102" height="93" fill="none" stroke="${O}" stroke-width="2.5"/>
      <rect x="42" y="120" width="26" height="24" fill="#3b2716" stroke="#f4efe6" stroke-width="4"/>
      <rect x="192" y="120" width="26" height="24" fill="#3b2716" stroke="#f4efe6" stroke-width="4"/>
      <path d="M130 18 V4 M122 8 h16" stroke="${O}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M126 4 q4 -5 9 -1 q-2 3 -9 1z" fill="#3b2716"/>
    `);
  };

  const coop = () => {
    let planks = '';
    for (let y = 72; y < 134; y += 12) planks += `<path d="M42 ${y} H168" stroke="#c99d5e" stroke-width="2"/>`;
    return svg(200, 180, 200, 180, `
      <ellipse cx="105" cy="172" rx="85" ry="7" fill="#000" opacity=".18"/>
      <path d="M52 134 V170 M158 134 V170 M70 134 V166 M140 134 V166" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
      <path d="M52 134 V170 M158 134 V170 M70 134 V166 M140 134 V166" stroke="#8b5a32" stroke-width="4" stroke-linecap="round"/>
      <rect x="40" y="60" width="130" height="76" fill="#e9c48a" stroke="${O}" stroke-width="3"/>
      ${planks}
      <rect x="166" y="92" width="26" height="30" fill="#d9ad6e" stroke="${O}" stroke-width="2.5"/>
      <path d="M168 100 q6 -6 10 0 q6 -6 12 0" fill="#efc95a" stroke="${O}" stroke-width="1.5"/>
      <path d="M26 68 L105 16 L184 68 Z" fill="#d8574a" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 56 H166 M64 43 H146 M84 30 H126" stroke="#b33f35" stroke-width="2.5"/>
      <path d="M26 68 L105 16 L184 68" fill="none" stroke="#fff4e0" stroke-width="3" opacity=".6"/>
      <path d="M86 136 V112 q0 -14 14 -14 q14 0 14 14 V136z" fill="#3b2716" stroke="${O}" stroke-width="2.5"/>
      <path d="M90 136 L60 174" stroke="${O}" stroke-width="12" stroke-linecap="round"/>
      <path d="M90 136 L60 174" stroke="#b07a45" stroke-width="8" stroke-linecap="round"/>
      <path d="M83 147 l6 4 M77 155 l6 4 M71 163 l6 4" stroke="${O}" stroke-width="2"/>
      <circle cx="140" cy="88" r="11" fill="#3b2716" stroke="#fff4e0" stroke-width="3"/>
      <path d="M131 94 q9 -9 18 0" fill="#efc95a"/>
    `);
  };

  const house = (glow) => {
    let siding = '';
    for (let y = 102; y < 200; y += 11) siding += `<path d="M32 ${y} H208" stroke="#e0c9a2" stroke-width="2"/>`;
    const win = (x) => glow
      ? `<rect x="${x}" y="118" width="38" height="34" fill="#ffd36a"/><rect x="${x - 6}" y="112" width="50" height="46" fill="#ffd36a" opacity=".25"/>`
      : `<rect x="${x}" y="118" width="38" height="34" fill="#9fd3f0" stroke="#fff" stroke-width="4"/>
         <path d="M${x + 19} 118 V152 M${x} 135 H${x + 38}" stroke="#fff" stroke-width="3"/>
         <path d="M${x + 4} 122 l10 0 l-10 10z" fill="#fff" opacity=".5"/>
         <rect x="${x - 2}" y="116" width="42" height="38" fill="none" stroke="${O}" stroke-width="2.5"/>
         <rect x="${x - 4}" y="154" width="46" height="9" fill="#9b6236" stroke="${O}" stroke-width="2"/>
         <circle cx="${x + 6}" cy="153" r="4" fill="#ff6f91"/><circle cx="${x + 17}" cy="151" r="4" fill="#ffd166"/>
         <circle cx="${x + 28}" cy="153" r="4" fill="#ff6f91"/><circle cx="${x + 37}" cy="151" r="3.5" fill="#c77dff"/>`;
    if (glow) return svg(240, 215, 240, 215, `${win(46)}${win(156)}<rect x="104" y="142" width="34" height="58" fill="#ffcf5a" opacity=".35"/>`);
    let shingles = '';
    for (let y = 40; y < 96; y += 11) shingles += `<path d="M0 ${y} H240" stroke="#3e64a3" stroke-width="2.5"/>`;
    return svg(240, 215, 240, 215, `
      <ellipse cx="120" cy="204" rx="104" ry="8" fill="#000" opacity=".18"/>
      <rect x="160" y="34" width="22" height="44" fill="#b35a45" stroke="${O}" stroke-width="2.5"/>
      <rect x="156" y="30" width="30" height="8" fill="#9a4936" stroke="${O}" stroke-width="2.5"/>
      <rect x="30" y="92" width="180" height="108" fill="#f3e2c4" stroke="${O}" stroke-width="3"/>
      ${siding}
      <clipPath id="rf"><path d="M12 98 L120 24 L228 98 Z"/></clipPath>
      <path d="M12 98 L120 24 L228 98 Z" fill="#5a83c9"/>
      <g clip-path="url(#rf)">${shingles}</g>
      <path d="M12 98 L120 24 L228 98 Z" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="120" cy="66" r="11" fill="#fff4e0" stroke="${O}" stroke-width="2.5"/>
      <path d="M120 58 V66 H126" stroke="${O}" stroke-width="2" fill="none"/>
      ${win(46)}${win(156)}
      <path d="M104 200 V152 q0 -12 17 -12 q17 0 17 12 V200z" fill="#8a5232" stroke="${O}" stroke-width="2.5"/>
      <path d="M121 142 V200" stroke="#6e3f24" stroke-width="2"/>
      <circle cx="131" cy="172" r="2.4" fill="#f2c14e"/>
      <rect x="96" y="198" width="50" height="8" rx="2" fill="#bfa58a" stroke="${O}" stroke-width="2"/>
    `);
  };

  const trough = (full) => svg(112, 54, 112, 54, `
    <ellipse cx="56" cy="49" rx="50" ry="5" fill="#000" opacity=".16"/>
    <path d="M18 34 V48 M94 34 V48" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
    <path d="M18 34 V48 M94 34 V48" stroke="#7d4f2c" stroke-width="4" stroke-linecap="round"/>
    ${full ? `<path d="M14 20 q8 -14 20 -8 q10 -10 22 -2 q12 -8 22 0 q12 -6 20 8z" fill="#efcb5e" stroke="${O}" stroke-width="2"/>
      <path d="M26 14 l6 6 M48 10 l3 8 M70 12 l-4 7 M86 15 l-5 5" stroke="#c9a03b" stroke-width="1.8"/>` : ''}
    <path d="M6 18 H106 L98 40 H14 Z" fill="#9b6236" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M12 29 H100" stroke="#7d4f2c" stroke-width="2"/>
  `);

  const feeder = (full) => svg(96, 44, 96, 44, `
    <ellipse cx="48" cy="38" rx="44" ry="5" fill="#000" opacity=".16"/>
    <ellipse cx="48" cy="26" rx="42" ry="11" fill="#9aa5b1" stroke="${O}" stroke-width="3"/>
    <ellipse cx="48" cy="24" rx="34" ry="7" fill="${full ? '#e6b24a' : '#6f7a86'}"/>
    ${full ? Array.from({ length: 22 }, (_, i) => `<circle cx="${18 + ((i * 37) % 60)}" cy="${20 + ((i * 7) % 8)}" r="1.4" fill="#b98420"/>`).join('') : ''}
    <path d="M14 28 q34 10 68 0" stroke="#c3ccd6" stroke-width="2" fill="none"/>
  `);

  const cart = () => svg(200, 175, 200, 175, `
    <ellipse cx="100" cy="166" rx="88" ry="7" fill="#000" opacity=".18"/>
    <path d="M28 70 V150 M172 70 V150" stroke="${O}" stroke-width="7"/><path d="M28 70 V150 M172 70 V150" stroke="#8b5a32" stroke-width="4"/>
    <path d="M14 70 L28 36 H172 L186 70 Z" fill="#fff" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M45 36 L36 70 H58 L63 36Z M81 36 L80 70 H102 L99 36Z M117 36 L124 70 H146 L135 36Z M153 36 L168 70 H186 L172 36Z" fill="#e2483d"/>
    <path d="M14 70 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0" fill="#e2483d" stroke="${O}" stroke-width="2.5"/>
    <rect x="18" y="100" width="164" height="48" rx="4" fill="#b07a45" stroke="${O}" stroke-width="3"/>
    <path d="M18 116 H182 M18 132 H182" stroke="#8b5a32" stroke-width="2"/>
    <rect x="30" y="86" width="56" height="18" rx="3" fill="#8b5a32" stroke="${O}" stroke-width="2.5"/>
    <ellipse cx="41" cy="88" rx="5" ry="6" fill="#fff6e6" stroke="${O}" stroke-width="1.6"/><ellipse cx="52" cy="87" rx="5" ry="6" fill="#f4e0c2" stroke="${O}" stroke-width="1.6"/>
    <ellipse cx="63" cy="88" rx="5" ry="6" fill="#fff6e6" stroke="${O}" stroke-width="1.6"/><ellipse cx="74" cy="87" rx="5" ry="6" fill="#f4e0c2" stroke="${O}" stroke-width="1.6"/>
    <rect x="112" y="74" width="14" height="28" rx="4" fill="#fff" stroke="${O}" stroke-width="2.2"/><rect x="114" y="70" width="10" height="6" fill="#4b8fe2" stroke="${O}" stroke-width="1.6"/>
    <rect x="132" y="74" width="14" height="28" rx="4" fill="#fff" stroke="${O}" stroke-width="2.2"/><rect x="134" y="70" width="10" height="6" fill="#4b8fe2" stroke="${O}" stroke-width="1.6"/>
    <rect x="152" y="74" width="14" height="28" rx="4" fill="#fff" stroke="${O}" stroke-width="2.2"/><rect x="154" y="70" width="10" height="6" fill="#4b8fe2" stroke="${O}" stroke-width="1.6"/>
    <circle cx="48" cy="150" r="16" fill="#8b5a32" stroke="${O}" stroke-width="3"/><circle cx="48" cy="150" r="4" fill="${O}"/>
    <circle cx="152" cy="150" r="16" fill="#8b5a32" stroke="${O}" stroke-width="3"/><circle cx="152" cy="150" r="4" fill="${O}"/>
    <path d="M48 136 V164 M34 150 H62 M152 136 V164 M138 150 H166" stroke="${O}" stroke-width="2"/>
    <rect x="60" y="10" width="80" height="26" rx="6" fill="#fff4dc" stroke="${O}" stroke-width="2.5"/>
    <text x="100" y="29" font-family="Trebuchet MS, sans-serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#7a3e1d">MARKET</text>
  `);

  // ---------------------------------------------------------------- NATURE
  const tree = (apples) => svg(150, 180, 150, 180, `
    <ellipse cx="75" cy="170" rx="48" ry="8" fill="#000" opacity=".18"/>
    <path d="M66 170 q4 -40 2 -70 h16 q-2 30 4 70z" fill="#8a5a34" stroke="${O}" stroke-width="3"/>
    <circle cx="45" cy="80" r="32" fill="#4f9a3a" stroke="${O}" stroke-width="3"/>
    <circle cx="105" cy="80" r="32" fill="#4f9a3a" stroke="${O}" stroke-width="3"/>
    <circle cx="75" cy="52" r="38" fill="#5cae43" stroke="${O}" stroke-width="3"/>
    <circle cx="75" cy="92" r="30" fill="#55a33f"/>
    <circle cx="60" cy="40" r="12" fill="#7cc65a" opacity=".7"/><circle cx="95" cy="68" r="8" fill="#7cc65a" opacity=".6"/>
    ${apples ? '<circle cx="50" cy="70" r="6" fill="#e43f3f" stroke="#3b2716" stroke-width="1.5"/><circle cx="95" cy="50" r="6" fill="#e43f3f" stroke="#3b2716" stroke-width="1.5"/><circle cx="110" cy="92" r="6" fill="#e43f3f" stroke="#3b2716" stroke-width="1.5"/><circle cx="72" cy="96" r="6" fill="#e43f3f" stroke="#3b2716" stroke-width="1.5"/>' : ''}
  `);
  const bush = () => svg(90, 56, 90, 56, `
    <ellipse cx="45" cy="50" rx="38" ry="5" fill="#000" opacity=".15"/>
    <circle cx="25" cy="34" r="17" fill="#4f9a3a" stroke="${O}" stroke-width="2.5"/>
    <circle cx="65" cy="34" r="17" fill="#4f9a3a" stroke="${O}" stroke-width="2.5"/>
    <circle cx="45" cy="24" r="20" fill="#5cae43" stroke="${O}" stroke-width="2.5"/>
    <circle cx="45" cy="38" r="15" fill="#55a33f"/>
    <circle cx="38" cy="17" r="6" fill="#7cc65a" opacity=".7"/>
    <circle cx="22" cy="30" r="3" fill="#ff8fab"/><circle cx="60" cy="22" r="3" fill="#fff"/><circle cx="70" cy="38" r="3" fill="#ff8fab"/>
  `);
  const flowers = () => svg(50, 30, 50, 30, `
    <path d="M10 28 V16 M25 28 V12 M40 28 V18" stroke="#3f8a2e" stroke-width="2"/>
    ${[[10, 14, '#ff6f91'], [25, 10, '#ffd166'], [40, 16, '#c77dff']].map(([x, y, c]) =>
      `<g>${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="${x}" cy="${y - 4}" rx="2.6" ry="4" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="2.2" fill="#fff3b0"/></g>`).join('')}
  `);
  const rock = () => svg(50, 32, 50, 32, `
    <ellipse cx="25" cy="28" rx="22" ry="4" fill="#000" opacity=".15"/>
    <path d="M5 26 q0 -18 18 -20 q18 0 22 20z" fill="#a7a49c" stroke="${O}" stroke-width="2.5"/>
    <path d="M14 14 q6 -5 12 -4" stroke="#d5d2ca" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  const hay = () => svg(78, 58, 78, 58, `
    <ellipse cx="39" cy="53" rx="34" ry="5" fill="#000" opacity=".16"/>
    <rect x="6" y="12" width="66" height="40" rx="8" fill="#efc95a" stroke="${O}" stroke-width="3"/>
    <path d="M10 22 h58 M10 32 h58 M10 42 h58" stroke="#c9a03b" stroke-width="2"/>
    <path d="M24 12 V52 M54 12 V52" stroke="#a0522d" stroke-width="3"/>
    <path d="M8 12 l-4 -6 M20 12 l-1 -7 M60 12 l3 -7 M70 14 l5 -5" stroke="#c9a03b" stroke-width="2" stroke-linecap="round"/>`);
  const cloud = () => svg(180, 80, 180, 80, `
    <g fill="#fff"><circle cx="50" cy="48" r="26"/><circle cx="90" cy="36" r="32"/><circle cx="130" cy="48" r="24"/><rect x="40" y="48" width="100" height="26" rx="13"/></g>
    <path d="M30 66 q60 10 120 0" stroke="#dcecf7" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  const sun = () => svg(140, 140, 140, 140, `
    ${Array.from({ length: 12 }, (_, i) => `<path d="M70 8 L76 26 H64 Z" fill="#ffd54d" transform="rotate(${i * 30} 70 70)"/>`).join('')}
    <circle cx="70" cy="70" r="36" fill="#ffd54d" stroke="#f2a93b" stroke-width="4"/>
    <circle cx="58" cy="60" r="10" fill="#fff3b0" opacity=".7"/>`);
  const butterfly = (open) => svg(28, 24, 28, 24, open
    ? `<ellipse cx="8" cy="9" rx="7" ry="6" fill="#ffb4d1" stroke="${O}" stroke-width="1.5"/><ellipse cx="20" cy="9" rx="7" ry="6" fill="#ffb4d1" stroke="${O}" stroke-width="1.5"/>
       <ellipse cx="9" cy="17" rx="5" ry="4" fill="#ffd166" stroke="${O}" stroke-width="1.5"/><ellipse cx="19" cy="17" rx="5" ry="4" fill="#ffd166" stroke="${O}" stroke-width="1.5"/>
       <rect x="13" y="5" width="2.5" height="15" rx="1.2" fill="${O}"/>`
    : `<ellipse cx="14" cy="9" rx="3" ry="7" fill="#ffb4d1" stroke="${O}" stroke-width="1.5"/><rect x="13" y="5" width="2.5" height="15" rx="1.2" fill="${O}"/>`);
  const egg = () => svg(22, 26, 22, 26, `
    <ellipse cx="11" cy="23.5" rx="8" ry="2.2" fill="#000" opacity=".18"/>
    <ellipse cx="11" cy="13" rx="8" ry="10" fill="#fff6e6" stroke="${O}" stroke-width="2"/>
    <ellipse cx="8" cy="9" rx="2.2" ry="3.2" fill="#fff" opacity=".9"/>`);
  const puff = () => svg(40, 40, 40, 40, `<circle cx="20" cy="20" r="17" fill="#fff" opacity=".9"/>`);
  const dot = () => svg(8, 8, 8, 8, `<circle cx="4" cy="4" r="3.5" fill="#fff"/>`);
  const glowDot = () => svg(24, 24, 24, 24, `<circle cx="12" cy="12" r="11" fill="#fff7a8" opacity=".25"/><circle cx="12" cy="12" r="4" fill="#fffbd1"/>`);
  const sparkle = () => svg(26, 26, 26, 26, `<path d="M13 1 Q15 11 25 13 Q15 15 13 25 Q11 15 1 13 Q11 11 13 1z" fill="#fff" stroke="#9fd8ff" stroke-width="1.5"/>`);
  const bubble = () => svg(52, 56, 52, 56, `
    <path d="M26 54 l-7 -10 h-9 q-8 0 -8 -8 v-26 q0 -8 8 -8 h32 q8 0 8 8 v26 q0 8 -8 8 h-9z" fill="#fff" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`);

  // ---------------------------------------------------------------- ICONS (36x36)
  const I = (body) => svg(36, 36, 36, 36, body);
  const icons = {
    icon_coin: I(`<circle cx="18" cy="18" r="15" fill="#ffcf3f" stroke="${O}" stroke-width="2.5"/><circle cx="18" cy="18" r="10.5" fill="none" stroke="#e6a417" stroke-width="2"/><path d="M18 11 l2.1 4.4 4.8 .6 -3.5 3.3 .9 4.7 -4.3 -2.3 -4.3 2.3 .9 -4.7 -3.5 -3.3 4.8 -.6z" fill="#fff3b0"/>`),
    icon_bolt: I(`<path d="M21 2 L7 20 h9 l-3 14 L29 14 h-10z" fill="#ffd23f" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>`),
    icon_hay: I(`<rect x="4" y="9" width="28" height="21" rx="5" fill="#efc95a" stroke="${O}" stroke-width="2.4"/><path d="M12 9 V30 M24 9 V30" stroke="#a0522d" stroke-width="2.4"/><path d="M7 16 h22 M7 23 h22" stroke="#c9a03b" stroke-width="1.6"/>`),
    icon_grain: I(`<path d="M9 12 q-4 18 2 20 h14 q6 -2 2 -20z" fill="#e8d3a0" stroke="${O}" stroke-width="2.4"/><path d="M9 12 q9 -8 18 0" fill="#d9bd7c" stroke="${O}" stroke-width="2.4"/><circle cx="15" cy="22" r="1.6" fill="#b98420"/><circle cx="21" cy="24" r="1.6" fill="#b98420"/><circle cx="18" cy="19" r="1.6" fill="#b98420"/><path d="M14 8 l4 4 4 -4" stroke="#c9a03b" stroke-width="2" fill="none"/>`),
    icon_milk: I(`<path d="M12 5 h12 v5 l3 5 v16 q0 2 -2 2 h-14 q-2 0 -2 -2 v-16 l3 -5z" fill="#fff" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/><rect x="11.5" y="3" width="13" height="5" rx="1" fill="#4b8fe2" stroke="${O}" stroke-width="2"/><rect x="11" y="18" width="14" height="8" fill="#cfe6ff"/>`),
    icon_egg: I(`<ellipse cx="18" cy="19" rx="10" ry="13" fill="#fff6e6" stroke="${O}" stroke-width="2.4"/><ellipse cx="14" cy="13" rx="3" ry="4" fill="#fff"/>`),
    icon_heart: I(`<path d="M18 31 C4 21 3 12 9 8 C13 5 17 8 18 11 C19 8 23 5 27 8 C33 12 32 21 18 31z" fill="#ff5d7a" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="12" cy="13" rx="2.5" ry="2" fill="#fff" opacity=".7"/>`),
    icon_drop: I(`<path d="M18 3 C12 13 7 18 7 23 a11 11 0 0 0 22 0 C29 18 24 13 18 3z" fill="#5bb8f5" stroke="${O}" stroke-width="2.4"/><ellipse cx="13" cy="22" rx="2.5" ry="4" fill="#fff" opacity=".7"/>`),
    icon_bucket: I(`<path d="M7 12 h22 l-3 19 h-16z" fill="#b8c2cc" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="18" cy="12" rx="11" ry="3.5" fill="#fff" stroke="${O}" stroke-width="2.2"/><path d="M7 12 q11 -14 22 0" fill="none" stroke="${O}" stroke-width="2"/>`),
    icon_cross: I(`<circle cx="18" cy="18" r="15" fill="#fff" stroke="${O}" stroke-width="2.4"/><path d="M14 8 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6z" fill="#e94b4b"/>`),
    icon_moon: I(`<path d="M24 4 a14 14 0 1 0 8 22 a11 11 0 0 1 -8 -22z" fill="#ffe28a" stroke="${O}" stroke-width="2.4"/>`),
    icon_sun: I(`${Array.from({ length: 8 }, (_, i) => `<path d="M18 1 L20.5 8 H15.5Z" fill="#ffb627" transform="rotate(${i * 45} 18 18)"/>`).join('')}<circle cx="18" cy="18" r="9" fill="#ffd54d" stroke="${O}" stroke-width="2.2"/>`),
    icon_shop: I(`<rect x="5" y="15" width="26" height="17" fill="#fff4dc" stroke="${O}" stroke-width="2.4"/><path d="M3 15 L7 5 H29 L33 15z" fill="#e2483d" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 5 L12 15 M23 5 L24 15" stroke="#fff" stroke-width="3"/><rect x="14" y="21" width="8" height="11" fill="#8a5232" stroke="${O}" stroke-width="2"/>`),
    icon_bed: I(`<rect x="3" y="17" width="30" height="10" rx="2" fill="#5a83c9" stroke="${O}" stroke-width="2.4"/><rect x="5" y="12" width="9" height="7" rx="3" fill="#fff" stroke="${O}" stroke-width="2"/><path d="M4 27 v5 M32 27 v5" stroke="${O}" stroke-width="3"/><text x="22" y="12" font-family="Arial" font-weight="bold" font-size="11" fill="#5a83c9">z</text><text x="28" y="7" font-family="Arial" font-weight="bold" font-size="8" fill="#5a83c9">z</text>`),
    icon_brush: I(`<rect x="6" y="18" width="24" height="9" rx="3" fill="#b07a45" stroke="${O}" stroke-width="2.4"/><path d="M8 27 v5 M12 27 v5 M16 27 v5 M20 27 v5 M24 27 v5 M28 27 v5" stroke="#efc95a" stroke-width="2.2"/><path d="M14 18 q-2 -12 8 -14" stroke="${O}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="27" cy="9" r="3" fill="#9fd8ff"/><circle cx="31" cy="15" r="2" fill="#9fd8ff"/>`),
    icon_close: I(`<circle cx="18" cy="18" r="15" fill="#e2483d" stroke="${O}" stroke-width="2.4"/><path d="M12 12 L24 24 M24 12 L12 24" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>`),
    icon_up: I(`<rect x="4" y="4" width="28" height="28" rx="8" fill="#6cc04a" stroke="${O}" stroke-width="2.4"/><path d="M18 9 L27 19 H21 V27 H15 V19 H9z" fill="#fff"/>`),
  };

  // ---------------------------------------------------------------- BACKGROUND (1600x900)
  function background() {
    seed = 11;
    let tufts = '';
    for (let i = 0; i < 520; i++) {
      const x = rnd() * 1600, y = 250 + rnd() * 650;
      const c = rnd() < 0.5 ? '#6fae3c' : '#8cc850';
      tufts += `<path d="M${x} ${y} l3 -8 l2 8 l3 -6 l2 6" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    let blobs = '';
    for (let i = 0; i < 40; i++) {
      blobs += `<ellipse cx="${rnd() * 1600}" cy="${260 + rnd() * 640}" rx="${40 + rnd() * 90}" ry="${14 + rnd() * 26}" fill="${rnd() < 0.5 ? '#a7d867' : '#86bd4a'}" opacity=".35"/>`;
    }
    let treeLine = '';
    for (let x = -20; x < 1640; x += 34) {
      const r = 22 + rnd() * 16;
      treeLine += `<circle cx="${x}" cy="${222 - rnd() * 18}" r="${r}" fill="${rnd() < 0.5 ? '#4f9a3a' : '#5aa845'}"/>`;
    }
    let straw = '';
    for (let i = 0; i < 160; i++) {
      const x = 975 + rnd() * 545, y = 375 + rnd() * 465, a = rnd() * 180;
      straw += `<path d="M${x} ${y} l8 0" stroke="#d1b065" stroke-width="2" transform="rotate(${a} ${x} ${y})" stroke-linecap="round"/>`;
    }
    let pebbles = '';
    for (let i = 0; i < 70; i++) {
      const t = rnd();
      const x = 770 + rnd() * 60, y = 330 + t * 560;
      pebbles += `<ellipse cx="${x}" cy="${y}" rx="${2 + rnd() * 3}" ry="${1.5 + rnd() * 2}" fill="#c49a5c"/>`;
    }
    return svg(1600, 900, 1600, 900, `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8f0"/><stop offset="1" stop-color="#d6f0ff"/></linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93cc55"/><stop offset="1" stop-color="#7ab843"/></linearGradient>
        <radialGradient id="pond" cx=".4" cy=".35"><stop offset="0" stop-color="#9be3ff"/><stop offset="1" stop-color="#4aa9d9"/></radialGradient>
      </defs>
      <rect width="1600" height="300" fill="url(#sky)"/>
      <path d="M0 210 Q180 120 400 180 T820 170 T1240 160 T1600 180 V300 H0z" fill="#b5dd96"/>
      <path d="M0 235 Q260 170 520 215 T1060 205 T1600 215 V300 H0z" fill="#9ccf72"/>
      ${treeLine}
      <rect y="236" width="1600" height="664" fill="url(#grass)"/>
      ${blobs}
      <rect x="975" y="372" width="545" height="470" rx="26" fill="#e3cd95"/>
      <rect x="975" y="372" width="545" height="470" rx="26" fill="none" stroke="#cdb174" stroke-width="6" opacity=".6"/>
      ${straw}
      <ellipse cx="560" cy="440" rx="80" ry="26" fill="#b99a62" opacity=".35"/>
      <ellipse cx="250" cy="420" rx="120" ry="30" fill="#b99a62" opacity=".3"/>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M800 300 C800 420 790 560 800 900" stroke="#c49a5c" stroke-width="86"/>
        <path d="M800 590 C760 600 730 610 690 610" stroke="#c49a5c" stroke-width="64"/>
        <path d="M800 610 C850 620 900 625 960 625" stroke="#c49a5c" stroke-width="64"/>
        <path d="M800 300 C800 420 790 560 800 900" stroke="#e2c28a" stroke-width="72"/>
        <path d="M800 590 C760 600 730 610 690 610" stroke="#e2c28a" stroke-width="52"/>
        <path d="M800 610 C850 620 900 625 960 625" stroke="#e2c28a" stroke-width="52"/>
      </g>
      ${pebbles}
      <ellipse cx="560" cy="282" rx="86" ry="28" fill="#7ab843"/>
      <ellipse cx="560" cy="280" rx="78" ry="24" fill="url(#pond)" stroke="#3b2716" stroke-width="3"/>
      <ellipse cx="535" cy="276" rx="12" ry="5" fill="#5cae43" stroke="#3b2716" stroke-width="1.5"/>
      <ellipse cx="590" cy="286" rx="9" ry="4" fill="#5cae43" stroke="#3b2716" stroke-width="1.5"/>
      <path d="M520 268 q20 -6 40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
      ${tufts}
    `);
  }

  // ---------------------------------------------------------------- REGISTRY
  const ART = {
    bg: background(),
    farmer_0: farmer(0), farmer_1: farmer(1), farmer_2: farmer(-1),
    barn: barn(), coop: coop(), house: house(false), house_glow: house(true),
    trough_empty: trough(false), trough_full: trough(true),
    feeder_empty: feeder(false), feeder_full: feeder(true),
    cart: cart(), tree: tree(false), tree_apple: tree(true), bush: bush(), flowers: flowers(), rock: rock(), hay: hay(),
    cloud: cloud(), sun: sun(), bf_0: butterfly(true), bf_1: butterfly(false),
    egg: egg(), puff: puff(), dot: dot(), glow: glowDot(), sparkle: sparkle(), bubble: bubble(),
    dirt_cow: cowDirt(), dirt_chicken: henDirt(),
    ...icons,
  };
  for (const v of Object.keys(COWS)) [0, 1, 2].forEach((f) => (ART[`cow_${v}_${f}`] = cow(v, [0, 1, -1][f])));
  for (const v of Object.keys(HENS)) [0, 1, 2].forEach((f) => (ART[`chicken_${v}_${f}`] = chicken(v, f)));

  window.ART = ART;
  window.ART_VARIANTS = { cow: Object.keys(COWS), chicken: Object.keys(HENS) };
})();
