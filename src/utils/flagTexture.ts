import * as THREE from 'three';

/**
 * Generates an ultra-high-resolution texture of the official Flag of Israel (דגל ישראל)
 * Aspect ratio 8:11 (220 : 160) per official Israeli Flag Law 5709-1949
 * Resolution: 4096 x 2978 (Super crisp 4K)
 */
export function createHighResIsraelFlagTexture(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const width = 4096;
  const height = Math.round((width * 8) / 11); // 2978.9 -> 2979 px (exact 8:11 ratio)

  // 1. Color Texture Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Could not get 2D canvas context for flag texture');
  }

  // Pure White woven fabric base with very subtle warm tint
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Subtle fabric edge stitching / hem line along borders
  ctx.strokeStyle = 'rgba(215, 225, 240, 0.6)';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Reinforcement stitching at the hoist (left edge)
  ctx.fillStyle = 'rgba(240, 244, 250, 0.9)';
  ctx.fillRect(0, 0, 48, height);
  ctx.strokeStyle = 'rgba(180, 195, 215, 0.8)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(48, 0);
  ctx.lineTo(48, height);
  ctx.stroke();

  // Official dimensions per Israeli law:
  // Flag height = H (2978px)
  // Flag width = W (4096px)
  // Distance from top/bottom to stripes = 15/160 * H
  // Stripe width = 25/160 * H
  // Star height = 66/160 * H
  const H = height;
  const W = width;
  const stripeOffset = (15 / 160) * H;
  const stripeHeight = (25 / 160) * H;
  const starHeight = (66 / 160) * H;
  const starWidth = (starHeight * 2) / Math.sqrt(3); // Equilateral triangles geometry

  // Official Royal / Techelet Blue (#0038b8 or #0046b8)
  const flagBlue = '#0038b8';
  ctx.fillStyle = flagBlue;

  // Top stripe
  ctx.fillRect(0, stripeOffset, W, stripeHeight);

  // Bottom stripe
  ctx.fillRect(0, H - stripeOffset - stripeHeight, W, stripeHeight);

  // Center Star of David (Magen David)
  const centerX = W / 2;
  const centerY = H / 2;

  drawStarOfDavid(ctx, centerX, centerY, starHeight, flagBlue);

  // Create High-Res Color Texture
  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.generateMipmaps = true;
  colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  colorMap.magFilter = THREE.LinearFilter;
  colorMap.anisotropy = 16;
  colorMap.needsUpdate = true;

  // 2. Micro-fabric Weave Bump Map (Gives realistic cotton/silk/polyester cloth weave)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    const imgData = bCtx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;

    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;
        // Fine thread weave pattern
        const weaveX = Math.sin((x / 1024) * Math.PI * 400);
        const weaveY = Math.cos((y / 1024) * Math.PI * 400);
        const noise = (Math.random() - 0.5) * 15;
        const val = 128 + Math.round((weaveX * weaveY) * 28 + noise);
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    bCtx.putImageData(imgData, 0, 0);
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(16, 12);
  bumpMap.needsUpdate = true;

  // 3. Roughness Map for fabric specular sheen
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rCtx = roughCanvas.getContext('2d');
  if (rCtx) {
    rCtx.fillStyle = '#C8C8C8'; // Matte fabric with subtle soft sheen
    rCtx.fillRect(0, 0, 512, 512);
  }
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(8, 6);
  roughnessMap.needsUpdate = true;

  return { colorMap, bumpMap, roughnessMap };
}

/**
 * Draws a geometrically precise, official Star of David (Magen David)
 * with thick ribbon borders and sharp crisp vertices.
 */
function drawStarOfDavid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  totalHeight: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Star consists of two overlapping equilateral triangles
  // Total height = 66 units relative to flag height
  // In an equilateral triangle of height H_tri, side length S = (2 / sqrt(3)) * H_tri
  // Outer triangle side and inner cutouts
  const triHeight = (totalHeight * 3) / 4; // Height of each triangle
  const side = (2 / Math.sqrt(3)) * triHeight;
  const ribbonThickness = totalHeight * 0.082; // Ribbon stroke width

  const drawEquilateralTriangle = (
    centerX: number,
    centerY: number,
    height: number,
    pointUp: boolean
  ) => {
    const r = height / 1.5; // Circumradius
    const angleOffset = pointUp ? -Math.PI / 2 : Math.PI / 2;

    const points: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      const angle = angleOffset + (i * 2 * Math.PI) / 3;
      points.push([
        centerX + r * Math.cos(angle),
        centerY + r * Math.sin(angle),
      ]);
    }

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.closePath();
  };

  // Upward triangle center is slightly below cy, downward triangle center is slightly above cy
  const offset = totalHeight * 0.125;

  ctx.lineWidth = ribbonThickness;
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;

  // Triangle pointing UP
  drawEquilateralTriangle(cx, cy - offset, triHeight, true);
  ctx.stroke();

  // Triangle pointing DOWN
  drawEquilateralTriangle(cx, cy + offset, triHeight, false);
  ctx.stroke();

  ctx.restore();
}
