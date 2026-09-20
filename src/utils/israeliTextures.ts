import * as THREE from 'three';

/**
 * Creates an Israeli Flag texture with the blue stripes and Magen David (Star of David)
 */
export function createIsraeliFlagTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  // White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blue = '#0038B8';
  ctx.fillStyle = blue;
  ctx.strokeStyle = blue;

  // Blue stripes (standard ratio: top 60-160, bottom 540-640)
  ctx.fillRect(0, 70, canvas.width, 95);
  ctx.fillRect(0, canvas.height - 165, canvas.width, 95);

  // Center Star of David (Magen David)
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = 110;

  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'miter';

  // Upward triangle
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * Math.cos(Math.PI / 6), cy + r * Math.sin(Math.PI / 6));
  ctx.lineTo(cx - r * Math.cos(Math.PI / 6), cy + r * Math.sin(Math.PI / 6));
  ctx.closePath();
  ctx.stroke();

  // Downward triangle
  ctx.beginPath();
  ctx.moveTo(cx, cy + r);
  ctx.lineTo(cx + r * Math.cos(Math.PI / 6), cy - r * Math.sin(Math.PI / 6));
  ctx.lineTo(cx - r * Math.cos(Math.PI / 6), cy - r * Math.sin(Math.PI / 6));
  ctx.closePath();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates standard Israeli blue/white street sign (Dizengoff / Rothschild / Herzl)
 */
export function createIsraeliStreetSignTexture(
  streetHe: string,
  streetEn: string,
  cityHe: string = 'תל אביב - יפו'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;

  // Israeli street sign blue background with rounded corners
  ctx.fillStyle = '#0047AB'; // Deep Mediterranean municipal blue
  ctx.beginPath();
  ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
  ctx.fill();

  // White inner border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(16, 16, canvas.width - 32, canvas.height - 32, 16);
  ctx.stroke();

  // Header: City Name
  ctx.fillStyle = '#BAE6FD';
  ctx.font = 'bold 22px Rubik, Heebo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cityHe, canvas.width / 2, 50);

  // Main: Hebrew Street Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 54px Rubik, Heebo, sans-serif';
  ctx.fillText(streetHe, canvas.width / 2, 115);

  // Sub: English Name
  ctx.fillStyle = '#E0F2FE';
  ctx.font = 'bold 26px Rubik, sans-serif';
  ctx.fillText(streetEn, canvas.width / 2, 155);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Hebrew Storefront Signs (Shawarma, Kiosk, Cafe, Tambour, AM:PM, etc.)
 */
export function createStoreSignTexture(
  type: 'shawarma' | 'kiosk' | 'cafe' | 'tambour' | 'ampm' | 'superpharm' | 'falafel' | 'post'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (type === 'shawarma') {
    // Warm fire / orange shawarma signage
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#B91C1C');
    grad.addColorStop(0.5, '#EA580C');
    grad.addColorStop(1, '#B91C1C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px Heebo, Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('שווארמה האחים', canvas.width / 2, 90);

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 32px Heebo, Rubik, sans-serif';
    ctx.fillText('בשר עגל & כבש אמיתי 🥙', canvas.width / 2, 150);

    ctx.fillStyle = '#FDE047';
    ctx.font = '600 24px Rubik, sans-serif';
    ctx.fillText('HOT SHAWARMA & PITA', canvas.width / 2, 200);
  } else if (type === 'falafel') {
    // Falafel King
    ctx.fillStyle = '#15803D';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = '#FEF08A';
    ctx.font = '900 54px Heebo, Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('פלאפל כדורי', canvas.width / 2, 95);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Heebo, Rubik, sans-serif';
    ctx.fillText('חם • פריך • טחינה חופשי 🧆', canvas.width / 2, 160);

    ctx.fillStyle = '#BBF7D0';
    ctx.font = '600 22px Rubik, sans-serif';
    ctx.fillText('THE BEST FALAFEL IN TOWN', canvas.width / 2, 205);
  } else if (type === 'kiosk') {
    // Israeli 24/7 Pitzutzia / Kiosk
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon border
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '900 60px Heebo, Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('קיוסק 24/7', canvas.width / 2, 95);

    ctx.fillStyle = '#F43F5E';
    ctx.font = 'bold 30px Heebo, Rubik, sans-serif';
    ctx.fillText('פיצוחים • שתייה קרה • קרטיב', canvas.width / 2, 155);

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 24px Rubik, sans-serif';
    ctx.fillText('OPEN 24 HOURS • TEL AVIV', canvas.width / 2, 205);
  } else if (type === 'cafe') {
    // Tel Aviv neighborhood cafe
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    ctx.fillStyle = '#FFE0B2';
    ctx.font = '900 52px Heebo, Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('קפה תמר ☕', canvas.width / 2, 90);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Heebo, Rubik, sans-serif';
    ctx.fillText('אספרסו & בורקס גבינה חם', canvas.width / 2, 150);

    ctx.fillStyle = '#BCAAA4';
    ctx.font = '500 24px Rubik, sans-serif';
    ctx.fillText('ARTISAN TEL-AVIV COFFEE', canvas.width / 2, 200);
  } else if (type === 'tambour') {
    // Tambour hardware store
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(16, 16, canvas.width - 32, canvas.height - 32);

    ctx.fillStyle = '#DC2626';
    ctx.font = '900 62px Heebo, Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('טמבוריה', canvas.width / 2, 95);

    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 28px Heebo, Rubik, sans-serif';
    ctx.fillText('כלי עבודה • שכפול מפתחות • צבע', canvas.width / 2, 150);

    ctx.fillStyle = '#475569';
    ctx.font = '600 22px Rubik, sans-serif';
    ctx.fillText('TAMBOUR HARDWARE & KEYS', canvas.width / 2, 195);
  } else if (type === 'ampm') {
    // Iconic AM:PM
    ctx.fillStyle = '#10B981';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#EC4899';
    ctx.fillRect(20, 20, canvas.width - 40, 100);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 70px Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('am:pm', canvas.width / 2, 95);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px Heebo, Rubik, sans-serif';
    ctx.fillText('סופרמרקט העיר 24/7', canvas.width / 2, 175);

    ctx.fillStyle = '#D1FAE5';
    ctx.font = '600 20px Rubik, sans-serif';
    ctx.fillText('ALWAYS OPEN • FRESH & FAST', canvas.width / 2, 215);
  } else if (type === 'superpharm') {
    // Super-Pharm
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px Heebo, Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('סופר-פארם', canvas.width / 2, 90);

    ctx.fillStyle = '#F0F9FF';
    ctx.font = 'bold 32px Rubik, sans-serif';
    ctx.fillText('SUPER-PHARM 💊', canvas.width / 2, 150);

    ctx.fillStyle = '#BAE6FD';
    ctx.font = '500 22px Heebo, Rubik, sans-serif';
    ctx.fillText('בית מרקחת • קוסמטיקה • טיפוח', canvas.width / 2, 195);
  } else if (type === 'post') {
    // Israel Post / דואר ישראל
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px Heebo, Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('דואר ישראל 🦌', canvas.width / 2, 100);

    ctx.fillStyle = '#FEE2E2';
    ctx.font = 'bold 28px Rubik, sans-serif';
    ctx.fillText('ISRAEL POST', canvas.width / 2, 160);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates solar panel grid texture for Israeli Dud Shemesh (קולט שמש)
 */
export function createSolarPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep dark blue / indigo photovoltaic surface
  ctx.fillStyle = '#0b1329';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Aluminum frame
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  // Copper / metallic thermal collector lines
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3;
  for (let y = 30; y < canvas.height - 30; y += 30) {
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(canvas.width - 25, y);
    ctx.stroke();
  }

  // Vertical support tubes
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 6;
  for (let x = 60; x < canvas.width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 25);
    ctx.lineTo(x, canvas.height - 25);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates AC brand sticker texture (ELECTRA / תדיראן / TORNADO)
 */
export function createACTexture(brand: 'electra' | 'tadiran' | 'tornado' = 'electra'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Off-white / light cream metal casing
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // AC front vents
  ctx.fillStyle = '#94A3B8';
  for (let y = 20; y < canvas.height - 20; y += 12) {
    ctx.fillRect(30, y, 90, 4);
  }

  // Fan circle grill
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(180, 64, 40, 0, Math.PI * 2);
  ctx.stroke();

  // Brand Name
  ctx.fillStyle = '#1E293B';
  ctx.font = '900 20px Rubik, Heebo, sans-serif';
  ctx.textAlign = 'left';
  if (brand === 'electra') {
    ctx.fillText('ELECTRA', 30, 115);
  } else if (brand === 'tadiran') {
    ctx.fillText('תדיראן TADIRAN', 20, 115);
  } else {
    ctx.fillText('TORNADO טורנדו', 20, 115);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates train destination display for Israeli Light Rail (רכבת קלה)
 */
export function createLightRailSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // LED Black Matrix Display
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glowing Amber/Yellow LED Text
  ctx.fillStyle = '#F59E0B';
  ctx.shadowColor = '#FBBF24';
  ctx.shadowBlur = 10;
  ctx.font = '900 40px Heebo, Rubik, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('קו אדום: פ"ת ⇄ בת ים', canvas.width / 2, 55);

  ctx.font = 'bold 24px Rubik, sans-serif';
  ctx.fillText('RED LINE • TEL AVIV LIGHT RAIL', canvas.width / 2, 100);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
