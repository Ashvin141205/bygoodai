import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCrc32Table();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)) >>> 0;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

export function generateOgPngBuffer(width = 1200, height = 630): Buffer {
  // 1. Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // 2. IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // no filter
  ihdrData.writeUInt8(0, 12); // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // 3. Raw RGBA Scanlines
  // Each scanline is 1 byte filter type (0) + width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    // Dark sleek gradient background: top-left #0f172a to bottom-right #090d16
    const t = (y / height);
    
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const s = (x / width);
      
      // Calculate background gradient
      let r = Math.floor(15 * (1 - t) + 9 * t);
      let g = Math.floor(23 * (1 - t) + 13 * t);
      let b = Math.floor(42 * (1 - t) + 22 * t);

      // Subtle cyan accent glow near top right
      const distTopRight = Math.hypot(x - 1050, y - 150);
      if (distTopRight < 300) {
        const factor = (1 - distTopRight / 300) * 0.15;
        r = Math.min(255, Math.floor(r + 56 * factor));
        g = Math.min(255, Math.floor(g + 189 * factor));
        b = Math.min(255, Math.floor(b + 248 * factor));
      }

      // Subtle indigo glow near bottom left
      const distBottomLeft = Math.hypot(x - 150, y - 500);
      if (distBottomLeft < 250) {
        const factor = (1 - distBottomLeft / 250) * 0.15;
        r = Math.min(255, Math.floor(r + 129 * factor));
        g = Math.min(255, Math.floor(g + 140 * factor));
        b = Math.min(255, Math.floor(b + 248 * factor));
      }

      // Rounded logo icon box at (100, 180) size 56x56
      if (x >= 100 && x < 156 && y >= 180 && y < 236) {
        const lx = x - 100;
        const ly = y - 180;
        // Cyan-to-indigo gradient
        const lt = (lx + ly) / 112;
        r = Math.floor(56 * (1 - lt) + 129 * lt);
        g = Math.floor(189 * (1 - lt) + 140 * lt);
        b = Math.floor(248 * (1 - lt) + 248 * lt);
      }

      // Feature badge pills at bottom: (100..320, 420..462), (340..560, 420..462), (580..800, 420..462)
      const inBadge1 = (x >= 100 && x < 320 && y >= 420 && y < 462);
      const inBadge2 = (x >= 340 && x < 560 && y >= 420 && y < 462);
      const inBadge3 = (x >= 580 && x < 800 && y >= 420 && y < 462);

      if (inBadge1 || inBadge2 || inBadge3) {
        const isBorder = (y === 420 || y === 461 || (inBadge1 && (x === 100 || x === 319)) || (inBadge2 && (x === 340 || x === 559)) || (inBadge3 && (x === 580 || x === 799)));
        if (isBorder) {
          r = 51; g = 65; b = 85; // #334155
        } else {
          r = 30; g = 41; b = 59; // #1e293b
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = 255; // Fully opaque
    }
  }

  // Deflate compress scanlines
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // 4. IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate file if executed directly
if (process.argv[1]?.includes('generate-og-png')) {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const pngBuffer = generateOgPngBuffer(1200, 630);
  const outPath = path.join(publicDir, 'og-image.png');
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Generated 1200x630 OG image at ${outPath} (${pngBuffer.length} bytes)`);
}
