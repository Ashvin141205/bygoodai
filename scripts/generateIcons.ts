import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * Programmatic PNG generator for crisp PWA icons
 */
function createPng(width: number, height: number, drawFn: (x: number, y: number) => [number, number, number, number]): Buffer {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcTarget = buf.subarray(4, 8 + len);
  const crcVal = crc32(crcTarget);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c >>>= 1;
  }
  CRC_TABLE[n] = c;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Ensure directories exist
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon Drawer: Clean ByGoodAI dark slate background with rounded squircle badge, cyan/emerald gradient accent, and stylized 'B'
function drawByGoodAiIcon(size: number, isMaskable: boolean) {
  const center = size / 2;
  const padding = isMaskable ? size * 0.15 : size * 0.08;
  const badgeRadius = isMaskable ? size * 0.5 : size * 0.22;

  return (x: number, y: number): [number, number, number, number] => {
    // Distance from center
    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (isMaskable) {
      // Full bleed dark slate background #0f172a
      // Draw central gradient circle or stylized 'B'
      const normX = (x - padding) / (size - padding * 2);
      const normY = (y - padding) / (size - padding * 2);

      if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
        // Draw letter 'B' in safe zone
        if (isPixelInB(normX, normY)) {
          // Cyan to Indigo gradient for 'B'
          const r = Math.round(56 + normY * 43); // 56 -> 99
          const g = Math.round(189 - normY * 87); // 189 -> 102
          const b = Math.round(248 - normY * 7); // 248 -> 241
          return [r, g, b, 255];
        }
      }
      // Background gradient #0f172a -> #1e293b
      const bgG = Math.round(23 + (y / size) * 18);
      const bgB = Math.round(42 + (y / size) * 17);
      return [15, bgG, bgB, 255];
    } else {
      // Standard icon: Rounded squircle badge on transparent or subtle background
      const cornerRadius = size * 0.22;
      const insideSquircle = isInsideRoundedRect(x, y, padding, padding, size - padding * 2, size - padding * 2, cornerRadius);

      if (!insideSquircle) {
        return [0, 0, 0, 0]; // Transparent outside badge
      }

      // Inside badge: check if inside letter 'B'
      const normX = (x - padding * 1.2) / (size - padding * 2.4);
      const normY = (y - padding * 1.2) / (size - padding * 2.4);

      if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1 && isPixelInB(normX, normY)) {
        // Vibrant Cyan (#38BDF8)
        return [56, 189, 248, 255];
      }

      // Badge Background: Deep Slate #0f172a
      return [15, 23, 42, 255];
    }
  };
}

function isInsideRoundedRect(x: number, y: number, rx: number, ry: number, rw: number, rh: number, r: number): boolean {
  if (x < rx || x > rx + rw || y < ry || y > ry + rh) return false;
  if (x >= rx + r && x <= rx + rw - r) return true;
  if (y >= ry + r && y <= ry + rh - r) return true;

  // Corners
  const cx = x < rx + r ? rx + r : rx + rw - r;
  const cy = y < ry + r ? ry + r : ry + rh - r;
  const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
  return d <= r;
}

// Geometric model of letter 'B'
function isPixelInB(u: number, v: number): boolean {
  // u in [0, 1], v in [0, 1]
  // Vertical stem: u in [0.22, 0.38], v in [0.15, 0.85]
  if (u >= 0.22 && u <= 0.38 && v >= 0.15 && v <= 0.85) return true;

  // Top bar: u in [0.38, 0.65], v in [0.15, 0.27]
  if (u >= 0.38 && u <= 0.65 && v >= 0.15 && v <= 0.27) return true;

  // Middle bar: u in [0.38, 0.62], v in [0.44, 0.56]
  if (u >= 0.38 && u <= 0.62 && v >= 0.44 && v <= 0.56) return true;

  // Bottom bar: u in [0.38, 0.68], v in [0.73, 0.85]
  if (u >= 0.38 && u <= 0.68 && v >= 0.73 && v <= 0.85) return true;

  // Top Loop curve: centered around (0.60, 0.355)
  const topCx = 0.58;
  const topCy = 0.355;
  const topDx = (u - topCx) / 0.22;
  const topDy = (v - topCy) / 0.18;
  const topDist = topDx * topDx + topDy * topDy;
  if (u >= 0.45 && topDist <= 1.0 && topDist >= 0.25) return true;

  // Bottom Loop curve: centered around (0.62, 0.645)
  const botCx = 0.60;
  const botCy = 0.645;
  const botDx = (u - botCx) / 0.24;
  const botDy = (v - botCy) / 0.20;
  const botDist = botDx * botDx + botDy * botDy;
  if (u >= 0.45 && botDist <= 1.0 && botDist >= 0.25) return true;

  return false;
}

// Generate all sizes
const sizes = [
  { file: 'public/icons/icon-192x192.png', size: 192, maskable: false },
  { file: 'public/icons/icon-512x512.png', size: 512, maskable: false },
  { file: 'public/icons/icon-maskable-192x192.png', size: 192, maskable: true },
  { file: 'public/icons/icon-maskable-512x512.png', size: 512, maskable: true },
  { file: 'public/apple-touch-icon.png', size: 180, maskable: false },
  { file: 'public/favicon-32x32.png', size: 32, maskable: false },
  { file: 'public/favicon-16x16.png', size: 16, maskable: false },
];

for (const item of sizes) {
  const buf = createPng(item.size, item.size, drawByGoodAiIcon(item.size, item.maskable));
  fs.writeFileSync(path.join(process.cwd(), item.file), buf);
  console.log(`Generated ${item.file} (${buf.length} bytes)`);
}

// Also write SVG favicon
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#0F172A"/>
  <path d="M8 6h7c3 0 5 1.5 5 4.2 0 1.8-1 3-2.5 3.6C19.3 14.4 21 16 21 18.8 21 22 18.5 24 15 24H8V6zm4 3.5v4.5h3c1.5 0 2.5-.8 2.5-2.2 0-1.5-1-2.3-2.5-2.3h-3zm0 8v4.5h3.5c1.7 0 2.8-.8 2.8-2.2 0-1.5-1.1-2.3-2.8-2.3H12z" fill="#38BDF8"/>
</svg>`;
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.svg'), faviconSvg, 'utf8');
console.log('Generated public/favicon.svg');
