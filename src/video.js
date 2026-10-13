// Turns a video picked from the phone into what the AI needs, entirely on the device:
//  - the soundtrack, as small 16 kHz mono WAV pieces (about 2 minutes each, under Vercel's upload limit)
//  - a few still frames as JPEGs, for place names shown on screen
// Only these pieces are uploaded, never the whole video.
"use strict";
const NYCVideo = (() => {
  const RATE = 16000, CHUNK_SEC = 120, MAX_SEC = 600;

  function wav(samples) {
    const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, RATE, true);
    v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, samples.length * 2, true);
    for (let i = 0, o = 44; i < samples.length; i++, o += 2) { const x = Math.max(-1, Math.min(1, samples[i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); }
    return new Blob([buf], { type: 'audio/wav' });
  }

  async function audioChunks(file) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('no-audio');
    const data = await file.arrayBuffer();
    const ctx = new AC();
    let decoded;
    try { decoded = await new Promise((ok, bad) => { const p = ctx.decodeAudioData(data, ok, bad); if (p && p.then) p.then(ok, bad); }); }
    finally { try { ctx.close(); } catch (e) {} }
    const secs = Math.min(decoded.duration, MAX_SEC);
    if (!secs || secs < 0.5) throw new Error('no-audio');
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const off = new OAC(1, Math.ceil(secs * RATE), RATE);
    const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start(0);
    const mono = (await off.startRendering()).getChannelData(0);
    // Skip near-silent videos (music-only posts still get sent; the speech service handles that).
    let peak = 0; for (let i = 0; i < mono.length; i += 97) peak = Math.max(peak, Math.abs(mono[i]));
    if (peak < 0.003) throw new Error('silent');
    const out = [], step = CHUNK_SEC * RATE;
    for (let i = 0; i < mono.length; i += step) out.push(wav(mono.subarray(i, Math.min(mono.length, i + step))));
    return { chunks: out, seconds: secs, trimmed: decoded.duration > MAX_SEC };
  }

  function frames(file, count = 3, width = 540) {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file), v = document.createElement('video'), shots = [];
      let done = false;
      const finish = () => { if (done) return; done = true; clearTimeout(timer); try { URL.revokeObjectURL(url); } catch (e) {} resolve(shots); };
      const timer = setTimeout(finish, 15000);
      v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.src = url;
      v.onerror = finish;
      v.onloadedmetadata = async () => {
        const d = v.duration && isFinite(v.duration) ? v.duration : 0;
        if (!d || !v.videoWidth) return finish();
        const c = document.createElement('canvas'), h = Math.round(width * v.videoHeight / v.videoWidth);
        c.width = width; c.height = h; const g = c.getContext('2d');
        const marks = count === 1 ? [0.5] : Array.from({ length: count }, (_, i) => 0.12 + i * (0.76 / (count - 1)));
        for (const m of marks) {
          await new Promise(ok => { const t = setTimeout(ok, 4000); v.onseeked = () => { clearTimeout(t); ok(); }; v.currentTime = Math.min(d - 0.05, d * m); });
          try { g.drawImage(v, 0, 0, width, h); const data = c.toDataURL('image/jpeg', 0.72).split(',')[1]; if (data && data.length > 2000) shots.push(data); } catch (e) {}
        }
        finish();
      };
      v.load();
    });
  }

  return { audioChunks, frames };
})();
window.NYCVideo = NYCVideo;
