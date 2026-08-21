import zlib from 'node:zlib';

function createCrc32Table(): Uint32Array {
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

/**
 * 5x7 Standard ASCII Font Matrix (7 rows of 5-bit integers)
 */
const FONT_5X7: Record<string, number[]> = {
  'A': [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  'C': [0b01111, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b01111],
  'D': [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  'F': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  'G': [0b01111, 0b10000, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
  'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'I': [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  'J': [0b00001, 0b00001, 0b00001, 0b00001, 0b10001, 0b10001, 0b01110],
  'K': [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  'N': [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'P': [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10011, 0b01111],
  'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  'S': [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'V': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  'W': [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  'X': [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  'Z': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  'a': [0b00000, 0b00000, 0b01110, 0b00001, 0b01111, 0b10001, 0b01111],
  'b': [0b10000, 0b10000, 0b10110, 0b11001, 0b10001, 0b10001, 0b11110],
  'c': [0b00000, 0b00000, 0b01110, 0b10000, 0b10000, 0b10000, 0b01110],
  'd': [0b00001, 0b00001, 0b01101, 0b10011, 0b10001, 0b10001, 0b01111],
  'e': [0b00000, 0b00000, 0b01110, 0b10001, 0b11111, 0b10000, 0b01110],
  'f': [0b00110, 0b01001, 0b01000, 0b11100, 0b01000, 0b01000, 0b01000],
  'g': [0b00000, 0b01111, 0b10001, 0b10001, 0b01111, 0b00001, 0b01110],
  'h': [0b10000, 0b10000, 0b10110, 0b11001, 0b10001, 0b10001, 0b10001],
  'i': [0b00100, 0b00000, 0b01100, 0b00100, 0b00100, 0b00100, 0b01110],
  'j': [0b00010, 0b00000, 0b00110, 0b00010, 0b00010, 0b10010, 0b01100],
  'k': [0b10000, 0b10000, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010],
  'l': [0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  'm': [0b00000, 0b00000, 0b11010, 0b10101, 0b10101, 0b10101, 0b10001],
  'n': [0b00000, 0b00000, 0b10110, 0b11001, 0b10001, 0b10001, 0b10001],
  'o': [0b00000, 0b00000, 0b01110, 0b10001, 0b10001, 0b10001, 0b01110],
  'p': [0b00000, 0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000],
  'q': [0b00000, 0b01101, 0b10011, 0b10001, 0b01111, 0b00001, 0b00001],
  'r': [0b00000, 0b00000, 0b10110, 0b11001, 0b10000, 0b10000, 0b10000],
  's': [0b00000, 0b00000, 0b01111, 0b10000, 0b01110, 0b00001, 0b11110],
  't': [0b01000, 0b01000, 0b11100, 0b01000, 0b01000, 0b01001, 0b00110],
  'u': [0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b10011, 0b01101],
  'v': [0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  'w': [0b00000, 0b00000, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  'x': [0b00000, 0b00000, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001],
  'y': [0b00000, 0b10001, 0b10001, 0b01111, 0b00001, 0b10001, 0b01110],
  'z': [0b00000, 0b00000, 0b11111, 0b00010, 0b00100, 0b01000, 0b11111],
  '0': [0b01110, 0b10011, 0b10101, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  '3': [0b11110, 0b00001, 0b00001, 0b01110, 0b00001, 0b00001, 0b11110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
  '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  ',': [0b00000, 0b00000, 0b00000, 0b00000, 0b00110, 0b00100, 0b01000],
  '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00110, 0b00110],
  '&': [0b01100, 0b10010, 0b10100, 0b01000, 0b10101, 0b10010, 0b01101],
  ':': [0b00000, 0b00110, 0b00110, 0b00000, 0b00110, 0b00110, 0b00000],
  '/': [0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b00000, 0b00000],
  '!': [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000, 0b00100],
  '|': [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  '+': [0b00000, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0b00000],
  '(': [0b00010, 0b00100, 0b01000, 0b01000, 0b01000, 0b00100, 0b00010],
  ')': [0b01000, 0b00100, 0b00010, 0b00010, 0b00010, 0b00100, 0b01000],
};

function renderGlyph(
  rawData: Buffer,
  imgWidth: number,
  imgHeight: number,
  glyph: number[],
  x0: number,
  y0: number,
  scale: number,
  color: [number, number, number]
) {
  const [cr, cg, cb] = color;
  const rowSize = 1 + imgWidth * 4;

  for (let r = 0; r < 7; r++) {
    const rowBits = glyph[r];
    for (let c = 0; c < 5; c++) {
      // bit 4 is leftmost (c=0), bit 0 is rightmost (c=4)
      const isSet = (rowBits & (1 << (4 - c))) !== 0;
      if (isSet) {
        for (let dy = 0; dy < scale; dy++) {
          const py = Math.floor(y0 + r * scale + dy);
          if (py < 0 || py >= imgHeight) continue;
          const rowOffset = py * rowSize;

          for (let dx = 0; dx < scale; dx++) {
            const px = Math.floor(x0 + c * scale + dx);
            if (px < 0 || px >= imgWidth) continue;

            const pxOffset = rowOffset + 1 + px * 4;
            rawData[pxOffset] = cr;
            rawData[pxOffset + 1] = cg;
            rawData[pxOffset + 2] = cb;
            rawData[pxOffset + 3] = 255;
          }
        }
      }
    }
  }
}

function renderText(
  rawData: Buffer,
  imgWidth: number,
  imgHeight: number,
  text: string,
  startX: number,
  startY: number,
  scale: number,
  color: [number, number, number]
) {
  let curX = startX;
  const charSpacing = scale; // 1 column spacing
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const glyph = FONT_5X7[ch] || FONT_5X7[' '];
    renderGlyph(rawData, imgWidth, imgHeight, glyph, curX, startY, scale, color);
    curX += 5 * scale + charSpacing;
  }
}

/**
 * Generates a valid 1200x630 PNG buffer for Open Graph social media previews,
 * complete with rendered brand typography, visual badges, and factual messaging.
 */
export function generateOgPngBuffer(width = 1200, height = 630): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // no filter
  ihdrData.writeUInt8(0, 12); // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  // 1. Draw Background canvas & glows
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0

    const t = y / height;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Dark slate background gradient
      let r = Math.floor(15 * (1 - t) + 9 * t);
      let g = Math.floor(23 * (1 - t) + 13 * t);
      let b = Math.floor(42 * (1 - t) + 22 * t);

      // Subtle cyan accent glow near top right
      const distTopRight = Math.hypot(x - 1050, y - 150);
      if (distTopRight < 350) {
        const factor = (1 - distTopRight / 350) * 0.18;
        r = Math.min(255, Math.floor(r + 56 * factor));
        g = Math.min(255, Math.floor(g + 189 * factor));
        b = Math.min(255, Math.floor(b + 248 * factor));
      }

      // Subtle indigo glow near bottom left
      const distBottomLeft = Math.hypot(x - 150, y - 500);
      if (distBottomLeft < 300) {
        const factor = (1 - distBottomLeft / 300) * 0.18;
        r = Math.min(255, Math.floor(r + 129 * factor));
        g = Math.min(255, Math.floor(g + 140 * factor));
        b = Math.min(255, Math.floor(b + 248 * factor));
      }

      // Rounded logo icon box at (100, 150) size 60x60
      if (x >= 100 && x < 160 && y >= 150 && y < 210) {
        const lx = x - 100;
        const ly = y - 150;
        const lt = (lx + ly) / 120;
        r = Math.floor(56 * (1 - lt) + 129 * lt);
        g = Math.floor(189 * (1 - lt) + 140 * lt);
        b = Math.floor(248 * (1 - lt) + 248 * lt);
      }

      // Feature badge pills at bottom:
      // Badge 1: 100..400, 420..472
      // Badge 2: 424..724, 420..472
      // Badge 3: 748..1080, 420..472
      const inBadge1 = (x >= 100 && x < 400 && y >= 420 && y < 472);
      const inBadge2 = (x >= 424 && x < 724 && y >= 420 && y < 472);
      const inBadge3 = (x >= 748 && x < 1080 && y >= 420 && y < 472);

      if (inBadge1 || inBadge2 || inBadge3) {
        const isBorder =
          (y === 420 || y === 471 ||
          (inBadge1 && (x === 100 || x === 399)) ||
          (inBadge2 && (x === 424 || x === 723)) ||
          (inBadge3 && (x === 748 || x === 1079)));

        if (isBorder) {
          r = 51; g = 65; b = 85;
        } else {
          r = 30; g = 41; b = 59;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = 255;
    }
  }

  // 2. Render Text Typography into rawData pixel map
  // Title "ByGoodAI"
  renderText(rawData, width, height, 'ByGoodAI', 180, 160, 6, [255, 255, 255]);

  // Main Headline "Developer Utilities, Converters & APIs"
  renderText(rawData, width, height, 'Developer Utilities, Converters & APIs', 100, 250, 4, [255, 255, 255]);

  // Subtitle "High-performance in-browser tools & developer APIs."
  renderText(rawData, width, height, 'High-performance in-browser tools & developer APIs.', 100, 320, 3, [148, 163, 184]);

  // Badge 1 Text "In-Browser Execution"
  renderText(rawData, width, height, 'In-Browser Execution', 120, 438, 2, [56, 189, 248]);

  // Badge 2 Text "Client-Side Privacy"
  renderText(rawData, width, height, 'Client-Side Privacy', 448, 438, 2, [56, 189, 248]);

  // Badge 3 Text "Developer Tools & APIs"
  renderText(rawData, width, height, 'Developer Tools & APIs', 770, 438, 2, [56, 189, 248]);

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

