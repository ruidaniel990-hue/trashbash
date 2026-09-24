// ── Music ──
// Small synthesized loop per hotspot (bass + arpeggio), scheduled ahead with Web Audio.

import { getAudioGraph, isMuted } from './audio-manager.js';

const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);

// root = MIDI note, scale = semitone steps, bpm, progression = scale degrees per bar
const THEMES = {
  park:       { root: 60, scale: [0, 2, 4, 7, 9, 12, 14], bpm: 96,  wave: 'triangle', prog: [0, 4, 2, 3] },
  spielplatz: { root: 67, scale: [0, 2, 4, 5, 7, 9, 11],  bpm: 108, wave: 'triangle', prog: [0, 3, 4, 0] },
  strasse:    { root: 57, scale: [0, 2, 3, 5, 7, 8, 10],  bpm: 100, wave: 'square',   prog: [0, 5, 3, 4] },
  festival:   { root: 62, scale: [0, 2, 4, 5, 7, 9, 11],  bpm: 120, wave: 'square',   prog: [0, 4, 5, 3] },
  industrie:  { root: 52, scale: [0, 2, 3, 5, 7, 8, 10],  bpm: 92,  wave: 'sawtooth', prog: [0, 0, 5, 4] },
};

let bus = null;
let timer = null;
let theme = THEMES.park;
let step = 0;
let nextTime = 0;
let boost = 1;

function degree(d) {
  const { scale } = theme;
  const octave = Math.floor(d / scale.length);
  return theme.root + scale[((d % scale.length) + scale.length) % scale.length] + octave * 12;
}

function note(ctx, midi, time, dur, type, vol) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(NOTE(midi), time);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(vol, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g);
  g.connect(bus);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

// Eighth-note grid: bass on beats, triad arpeggio in between.
function scheduleStep(ctx, time) {
  const bar = Math.floor(step / 8) % theme.prog.length;
  const base = theme.prog[bar];
  const pos = step % 8;
  const eighth = 30 / (theme.bpm * boost);
  if (!isMuted()) {
    if (pos % 4 === 0) note(ctx, degree(base) - 24, time, eighth * 1.8, 'sine', 0.35);
    const arp = [0, 2, 4, 2][pos % 4];
    note(ctx, degree(base + arp), time, eighth * 0.9, theme.wave, theme.wave === 'triangle' ? 0.12 : 0.05);
  }
  step++;
  return eighth;
}

function pump() {
  const graph = getAudioGraph();
  if (!graph) return;
  const { ctx } = graph;
  while (nextTime < ctx.currentTime + 0.15) {
    nextTime += scheduleStep(ctx, Math.max(nextTime, ctx.currentTime));
  }
}

export function startMusic(sceneId) {
  const graph = getAudioGraph();
  if (!graph) return;
  if (!bus) {
    bus = graph.ctx.createGain();
    bus.gain.value = 0.22;
    bus.connect(graph.master);
  }
  theme = THEMES[sceneId] || THEMES.park;
  stopMusic();
  nextTime = graph.ctx.currentTime + 0.05;
  timer = setInterval(pump, 40);
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
}

// Speeds the loop up for the final seconds of a round.
export function setMusicUrgent(urgent) {
  boost = urgent ? 1.2 : 1;
}
