// One-off generator for placeholder app icons/splash (solid color PNGs) so `expo export` and
// EAS builds have valid asset files out of the box. Replace these with real artwork before
// shipping — see docs/RENAME_CHECKLIST.md.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const type_buf = Buffer.from(type, "ascii");
  const len_buf = Buffer.alloc(4);
  len_buf.writeUInt32BE(data.length, 0);
  const crc_buf = Buffer.alloc(4);
  crc_buf.writeUInt32BE(crc32(Buffer.concat([type_buf, data])), 0);
  return Buffer.concat([len_buf, type_buf, data, crc_buf]);
}

function solidPng(width, height, [r, g, b]) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const row = Buffer.alloc(1 + width * 3);
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  const idat = zlib.deflateSync(raw);

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const BRAND_BLUE = [47, 111, 237]; // matches src/theme.ts COLORS.primary
const assetsDir = path.resolve(__dirname, "..", "app", "assets");
fs.mkdirSync(assetsDir, { recursive: true });

const targets = [
  ["icon.png", 1024, 1024],
  ["adaptive-icon.png", 1024, 1024],
  ["splash.png", 1024, 1024],
  ["favicon.png", 48, 48],
];

for (const [name, w, h] of targets) {
  fs.writeFileSync(path.join(assetsDir, name), solidPng(w, h, BRAND_BLUE));
}

console.log(`Generated ${targets.length} placeholder asset(s) in ${assetsDir}`);
