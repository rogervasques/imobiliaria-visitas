const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    scanlines.push(row);
  }

  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icon with emerald gradient background and stylized house logo
function generateIconPixels(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Center coordinate (-1 to 1)
  const cx = (x - w / 2) / (w / 2);
  const cy = (y - h / 2) / (h / 2);
  const r = Math.sqrt(cx * cx + cy * cy);

  // Background Gradient (Dark Slate to Emerald/Teal)
  // Top-left: #047857 (Emerald 700), Bottom-right: #0f766e (Teal 700), Base: #020617 (Slate 950)
  const gradT = (nx + ny) * 0.5;
  const bgR = Math.round(5 + gradT * (16 - 5));
  const bgG = Math.round(150 + gradT * (185 - 150));
  const bgB = Math.round(105 + gradT * (129 - 105));

  let red = bgR;
  let green = bgG;
  let blue = bgB;
  let alpha = 255;

  // Rounded Corner Mask for app icon
  const cornerRadius = 0.22;
  const absX = Math.abs(cx);
  const absY = Math.abs(cy);
  if (absX > 1 - cornerRadius && absY > 1 - cornerRadius) {
    const dx = absX - (1 - cornerRadius);
    const dy = absY - (1 - cornerRadius);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > cornerRadius) {
      alpha = 0;
      return [0, 0, 0, 0];
    }
  }

  // Draw House Icon in White (Center: -0.5 to 0.5)
  // Roof Triangle
  const roofTopY = -0.42;
  const roofBaseY = -0.05;
  const roofWidth = 0.55;

  const inRoof = cy >= roofTopY && cy <= roofBaseY &&
    Math.abs(cx) <= (cy - roofTopY) / (roofBaseY - roofTopY) * roofWidth;

  // Roof border thickness check
  const roofInnerTopY = -0.32;
  const roofInnerBaseY = -0.05;
  const roofInnerWidth = 0.40;
  const inRoofInner = cy >= roofInnerTopY && cy <= roofInnerBaseY &&
    Math.abs(cx) <= (cy - roofInnerTopY) / (roofInnerBaseY - roofInnerTopY) * roofInnerWidth;

  // House Body
  const bodyTopY = -0.05;
  const bodyBottomY = 0.42;
  const bodyWidth = 0.42;
  const inBody = cy >= bodyTopY && cy <= bodyBottomY && Math.abs(cx) <= bodyWidth;

  // Door (Emerald background color cutout)
  const doorTopY = 0.12;
  const doorBottomY = 0.42;
  const doorWidth = 0.16;
  const inDoor = cy >= doorTopY && cy <= doorBottomY && Math.abs(cx) <= doorWidth;

  // Window left
  const winTopY = 0.05;
  const winBottomY = 0.22;
  const winLeftX = -0.32;
  const winRightX = -0.20;
  const inWinLeft = cy >= winTopY && cy <= winBottomY && cx >= winLeftX && cx <= winRightX;

  // Window right
  const winRLeftX = 0.20;
  const winRRightX = 0.32;
  const inWinRight = cy >= winTopY && cy <= winBottomY && cx >= winRLeftX && cx <= winRRightX;

  // Chimney
  const chimTopY = -0.38;
  const chimBottomY = -0.18;
  const chimLeftX = 0.22;
  const chimRightX = 0.34;
  const inChimney = cy >= chimTopY && cy <= chimBottomY && cx >= chimLeftX && cx <= chimRightX;

  if (inChimney || (inRoof && !inRoofInner) || (inBody && !inDoor && !inWinLeft && !inWinRight)) {
    // White / Bright Slate
    red = 255;
    green = 255;
    blue = 255;
  }

  return [red, green, blue, alpha];
}

const publicDir = path.join(__dirname, '..', 'public');

const sizes = [
  { file: 'icon-180.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

sizes.forEach(({ file, size }) => {
  const png = createPng(size, size, generateIconPixels);
  const outPath = path.join(publicDir, file);
  fs.writeFileSync(outPath, png);
  console.log(`Generated ${file} (${size}x${size}, ${png.length} bytes)`);
});
