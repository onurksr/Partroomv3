'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

function safeRequire(relPath) {
  const candidates = [
    path.join(__dirname, relPath),
    path.join(__dirname, '..', relPath),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p) || fs.existsSync(p + '.js')) return require(p);
    } catch (_) {}
  }
  return require(relPath);
}

const bank = safeRequire('./data/content-bank');
const extra = safeRequire('./data/extra-content');
const bonus = safeRequire('./data/bonus-content');
const okMusic = safeRequire('./data/oguzhan-koc-music');
const pixelPool = safeRequire('./data/pixel-pool');
const media = safeRequire('./data/media');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const publicDir = fs.existsSync(path.join(__dirname, 'public', 'index.html'))
  ? path.join(__dirname, 'public')
  : (fs.existsSync(path.join(__dirname, 'index.html')) ? __dirname : path.join(__dirname, '..', 'public'));

app.use(express.static(publicDir));
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

const GAME_META = {
  tf: { name: 'Doğru mu Yanlış mı', group: 'trivia' },
  closest: { name: 'En Yakın Cevap', group: 'trivia' },
  quiz: { name: 'Hızlı Quiz', group: 'trivia' },
  liar: { name: 'Hangisi Yalan', group: 'trivia' },
  wyr: { name: 'Kimi Seçerdin', group: 'social' },
  ml: { name: 'Kim Daha Olası', group: 'social' },
  emoji: { name: 'Emojiden Tahmin', group: 'guess' },
  song: { name: 'Şarkıyı İlk Sen Bil', group: 'media' },
  film: { name: 'Filmden Kareyi Bil', group: 'media' },
  pixel: { name: 'Pikseli Aç', group: 'media' },
  codenames: { name: 'Codenames', group: 'team' },
  werewolf: { name: 'Vampir Köylü', group: 'deduction' },
  imposter: { name: 'Casus Kim', group: 'deduction' },
};

const MIX_ALLOWED = new Set(['tf', 'closest', 'quiz', 'liar', 'wyr', 'ml', 'emoji', 'song', 'film', 'pixel']);
const MIX_FORBIDDEN = new Set(['codenames', 'werewolf', 'imposter']);

const customCatalog = {
  music: [...(bank.MUSIC || [])],
  films: [...(bank.FILMS || [])],
  imposter: [...(bank.IMPOSTER_BANK || [])],
  codenames: {
    easy: [...(bank.CODENAMES_WORDS || [])],
    medium: [],
    hard: [],
  },
  musicCategories: [...new Set((bank.MUSIC_CATEGORIES || []))],
  artists: {
    tr: [...new Set((bank.ARTISTS && bank.ARTISTS.tr) || [])],
    en: [...new Set((bank.ARTISTS && bank.ARTISTS.en) || [])],
  },
};

const fmtCn = w => {
  const s = String(w || '').trim();
  return s ? s.charAt(0).toLocaleUpperCase('tr') + s.slice(1).toLocaleLowerCase('tr') : '';
};

const haveCn = new Set(customCatalog.codenames.easy.map(w => w.toLocaleLowerCase('tr')));

for (const k of Object.keys(bonus || {})) {
  if (k === 'CODENAMES_WORDS_EXTRA') {
    for (const w of bonus[k]) {
      const lw = String(w || '').toLocaleLowerCase('tr');
      if (lw && !haveCn.has(lw)) {
        haveCn.add(lw);
        customCatalog.codenames.easy.push(fmtCn(w));
      }
    }
    continue;
  }
  if (k === 'IMPOSTER_BANK') {
    customCatalog.imposter.push(...bonus[k]);
    continue;
  }
  if (Array.isArray(bank[k])) bank[k].push(...bonus[k]);
}

if (extra && Array.isArray(extra.MUSIC)) customCatalog.music.push(...extra.MUSIC);
if (extra && Array.isArray(extra.FILMS)) customCatalog.films.push(...extra.FILMS);
if (extra && Array.isArray(extra.ARTISTS_TR)) {
  for (const a of extra.ARTISTS_TR) if (!customCatalog.artists.tr.includes(a)) customCatalog.artists.tr.push(a);
}
if (extra && Array.isArray(extra.ARTISTS_EN)) {
  for (const a of extra.ARTISTS_EN) if (!customCatalog.artists.en.includes(a)) customCatalog.artists.en.push(a);
}

if (okMusic && Array.isArray(okMusic.OGUZHAN_KOC_SONGS)) {
  customCatalog.music.push(...okMusic.OGUZHAN_KOC_SONGS);
  if (!customCatalog.musicCategories.includes('Oğuzhan Koç')) {
    customCatalog.musicCategories.push('Oğuzhan Koç');
  }
  if (!customCatalog.artists.tr.includes('Oğuzhan Koç')) {
    customCatalog.artists.tr.push('Oğuzhan Koç');
  }
}

const norm = s =>
  String(s || '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const partial = (target, guess) => {
  const tWords = norm(target).split(' ').filter(w => w.length >= 3);
  const gWords = new Set(norm(guess).split(' ').filter(w => w.length >= 2));
  if (!tWords.length) return false;
  let hit = 0;
  for (const w of tWords) if (gWords.has(w)) hit++;
  return hit >= Math.max(1, Math.ceil(tWords.length * 0.6));
};

const escRe = s => String(s || '').replace(/[.*+?^${}()|[\]\]/g, '\$&');
function matchTarget(guess, target) {
  const x = norm(target);
  if (!x) return false;
  if (x.length < 4) return guess === x || new RegExp('(?:^|\s)' + escRe(x) + '(?:$|\s)').test(guess);
  return guess.includes(x) || partial(x, guess);
}

function checkTextGuessMatch(gameId, q, rawText) {
  const guess = norm(rawText);
  if (!guess || !q) return false;
  if (gameId === 'emoji') return (q.a || []).some(ans => matchTarget(guess, ans));
  if (gameId === 'song') return matchTarget(guess, q.title);
  if (gameId === 'film' || gameId === 'pixel') return (q.answers || []).some(ans => matchTarget(guess, ans));
  return false;
}

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const clamp = (v, min, max, def) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.round(n)));
};

function sanitizeMusicFilter(raw) {
  const f = raw && typeof raw === 'object' ? raw : {};
  return {
    categories: Array.isArray(f.categories) ? f.categories.filter(Boolean) : [],
    artists: Array.isArray(f.artists) ? f.artists.filter(Boolean) : [],
    lang: ['all', 'tr', 'en'].includes(f.lang) ? f.lang : 'all',
    minYear: f.minYear ? clamp(f.minYear, 1950, 2030, '') : '',
    maxYear: f.maxYear ? clamp(f.maxYear, 1950, 2030, '') : '',
    onlyPopular: Boolean(f.onlyPopular),
    randomMix: Boolean(f.randomMix),
  };
}

function sanitizeFilmFilter(raw) {
  const f = raw && typeof raw === 'object' ? raw : {};
  return {
    categories: Array.isArray(f.categories) ? f.categories.filter(Boolean) : [],
    series: Array.isArray(f.series) ? f.series.filter(Boolean) : [],
    region: ['all', 'tr', 'hollywood'].includes(f.region) ? f.region : 'all',
    minYear: f.minYear ? clamp(f.minYear, 1950, 2030, '') : '',
    maxYear: f.maxYear ? clamp(f.maxYear, 1950, 2030, '') : '',
    popLevel: ['all', 'high', 'medium'].includes(f.popLevel) ? f.popLevel : 'all',
    randomMix: Boolean(f.randomMix),
  };
}

const rooms = new Map();
const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const genCode = () => {
  let out = '';
  for (let i = 0; i < 5; i++) out += codeChars[crypto.randomInt(codeChars.length)];
  return rooms.has(out) ? genCode() : out;
};

const activePlayers = r => [...r.players.values()].filter(p => p.connected && (!r.aliveIds || r.aliveIds.has(p.id)));
const connectedPlayers = r => [...r.players.values()].filter(p => p.connected);

function itemKey(prefix, item) {
  if (!item) return prefix + ':null';
  if (item.id) return prefix + ':' + item.id;
  if (item.common && item.imposter) return prefix + ':' + item.common + '|' + item.imposter;
  const opts = Array.isArray(item.o) ? item.o.join('|') : '';
  return prefix + ':' + (item.t || '') + '|' + opts + '|' + (item.x || '');
}

function pickNonRepeating(pool, prefix, usedSet, lastMap, excludeKeys) {
  if (!Array.isArray(pool) || !pool.length) return null;
  const keyOf = item => itemKey(prefix, item);
  const blocked = excludeKeys || new Set();
  const lastKey = lastMap ? lastMap.get(prefix) : null;

  let fresh = pool.filter(item => {
    const k = keyOf(item);
    return !usedSet.has(k) && !blocked.has(k);
  });

  if (!fresh.length) {
    for (const item of pool) usedSet.delete(keyOf(item));
    fresh = pool.filter(item => {
      const k = keyOf(item);
      return !blocked.has(k) && (pool.length <= 1 || k !== lastKey);
    });
    if (!fresh.length) fresh = pool.filter(item => !blocked.has(keyOf(item)));
    if (!fresh.length) fresh = pool;
  }

  const chosen = fresh[crypto.randomInt(fresh.length)];
  const k = keyOf(chosen);
  usedSet.add(k);
  if (lastMap) lastMap.set(prefix, k);
  return chosen;
}

function byCat(list, r) {
  const cats = (r.cfg && r.cfg.cats) || [];
  if (!cats.length) return list;
  const filtered = list.filter(x => cats.includes(x.c));
  return filtered.length ? filtered : list;
}

function getFilteredMusic(r) {
  const mf = sanitizeMusicFilter(r.cfg && r.cfg.musicFilter);
  const pool = customCatalog.music.filter(m => {
    if (mf.lang === 'tr' && m.lang !== 'tr') return false;
    if (mf.lang === 'en' && m.lang !== 'en') return false;
    if (mf.onlyPopular && m.pop !== 'high') return false;
    if (mf.minYear && m.year && m.year < mf.minYear) return false;
    if (mf.maxYear && m.year && m.year > mf.maxYear) return false;
    if (!mf.randomMix && mf.categories.length && !mf.categories.includes('Karışık')) {
      if (!Array.isArray(m.genres) || !m.genres.some(g => mf.categories.includes(g))) return false;
    }
    if (!mf.randomMix && mf.artists.length && !mf.artists.includes(m.artist)) return false;
    return true;
  });
  return pool.length ? pool : [...customCatalog.music];
}

function getFilteredFilms(r) {
  const ff = sanitizeFilmFilter(r.cfg && r.cfg.filmFilter);
  const pool = customCatalog.films.filter(item => {
    if (ff.region === 'tr' && item.region !== 'tr') return false;
    if (ff.region === 'hollywood' && item.region !== 'hollywood') return false;
    if (ff.popLevel !== 'all' && item.pop !== ff.popLevel) return false;
    if (ff.minYear && item.year && item.year < ff.minYear) return false;
    if (ff.maxYear && item.year && item.year > ff.maxYear) return false;
    if (!ff.randomMix && ff.categories.length && !item.categories.some(c => ff.categories.includes(c))) return false;
    if (!ff.randomMix && ff.series.length && (!item.series || !ff.series.includes(item.series))) return false;
    return true;
  });
  return pool.length ? pool : [...customCatalog.films];
}

function getPixelPool(r) {
  const c = (r.cfg && r.cfg.cats) || [];
  const base = pixelPool.filter(x => !c.length || c.includes(x.c));
  return base.length ? base : pixelPool;
}

const allCodenamesWords = () => [
  ...new Set([
    ...customCatalog.codenames.easy,
    ...customCatalog.codenames.medium,
    ...customCatalog.codenames.hard,
  ]),
];

function createRoom(hostSocketId, name) {
  const code = genCode();
  const room = {
    code,
    hostId: hostSocketId,
    phase: 'lobby',
    game: 'tf',
    round: 0,
    totalRounds: 5,
    deadline: 0,
    activeSec: 20,
    timer: null,
    stageTimer: null,
    gen: 0,
    q: null,
    players: new Map(),
    usedKeys: new Set(),
    lastKeys: new Map(),
    aliveIds: null,
    cn: null,
    ww: null,
    imp: null,
    mix: {
      active: false,
      games: ['emoji', 'song', 'film'],
      roundsPerGame: 2,
      completedRounds: 0,
    },
    cfg: {
      game: 'tf',
      mode: 'solo',
      rounds: 5,
      time: 20,
      teams: 2,
      imposterCount: 1,
      imposterGuessBonus: true,
      cats: [],
      mixMode: false,
      mixGames: ['emoji', 'song', 'film'],
      mixRoundsPerGame: 2,
      musicFilter: sanitizeMusicFilter(null),
      filmFilter: sanitizeFilmFilter(null),
    },
  };
  addPlayer(room, hostSocketId, name);
  rooms.set(code, room);
  return room;
}

function addPlayer(room, socketId, name) {
  const cleanName = String(name || 'Oyuncu').trim().slice(0, 20) || 'Oyuncu';
  const teamCount = clamp(room.cfg && room.cfg.teams, 2, 4, 2);
  let assignedTeam = 0;
  if (room.cfg && room.cfg.mode === 'teams') {
    const counts = Array.from({ length: teamCount }, () => 0);
    for (const p of room.players.values()) counts[p.team % teamCount]++;
    assignedTeam = counts.indexOf(Math.min(...counts));
  }
  const p = {
    id: socketId,
    name: cleanName,
    score: 0,
    team: assignedTeam,
    role: null,
    connected: true,
    ans: null,
    ansAt: 0,
    penaltyUntil: 0,
  };
  room.players.set(socketId, p);
  return p;
}

function clearRoomTimers(room) {
  if (room.timer) { clearTimeout(room.timer); room.timer = null; }
  if (room.stageTimer) { clearTimeout(room.stageTimer); room.stageTimer = null; }
}

function currentGameId(room) {
  if (room.mix && room.mix.active && Array.isArray(room.mix.games) && room.mix.games.length) {
    const idx = Math.floor(room.mix.completedRounds / Math.max(1, room.mix.roundsPerGame)) % room.mix.games.length;
    return room.mix.games[idx];
  }
  return room.game || (room.cfg && room.cfg.game) || 'tf';
}

function buildView(room, p) {
  const gameId = room.phase === 'lobby' ? (room.cfg.mixMode ? (room.cfg.mixGames[0] || 'emoji') : room.cfg.game) : currentGameId(room);
  const ps = [...room.players.values()].map(pl => ({
    id: pl.id,
    name: pl.name,
    score: pl.score,
    team: pl.team,
    connected: pl.connected,
    alive: room.aliveIds ? room.aliveIds.has(pl.id) : true,
    answered: pl.ans !== null && pl.ans !== undefined,
    isHost: pl.id === room.hostId,
    role: room.phase === 'lobby' ? null : (pl.id === p.id || room.phase === 'gameover' ? pl.role : null),
  }));

  let qView = null;
  if (room.q) {
    const now = Date.now();
    const penaltyLeft = p.penaltyUntil > now ? p.penaltyUntil - now : 0;
    qView = { ...room.q, penaltyLeft };
    if (gameId === 'song' && room.q._fullAudioUrl) {
      qView.audioUrl = room.phase === 'reveal' ? room.q._fullAudioUrl : room.q.audioUrl;
    }
    delete qView._fullAudioUrl;
    delete qView._answerKey;
    delete qView.answers;
  }

  let mixView = null;
  if (room.mix && room.mix.active) {
    const rpg = Math.max(1, room.mix.roundsPerGame);
    const nextIdx = Math.floor((room.mix.completedRounds + 1) / rpg) % room.mix.games.length;
    mixView = {
      active: true,
      games: room.mix.games,
      roundsPerGame: rpg,
      completedRounds: room.mix.completedRounds,
      currentGame: gameId,
      nextGame: room.mix.games[nextIdx],
    };
  }

  const totalMs = room.phase === 'question'
    ? ((room.activeSec || room.cfg.time || 20) * 1000 + (['song', 'film', 'pixel'].includes(gameId) && room.q && !room.q.loading ? 3000 : 0))
    : 0;

  return {
    code: room.code,
    phase: room.phase,
    game: gameId,
    round: room.round,
    totalRounds: room.totalRounds,
    deadline: room.deadline,
    totalMs,
    now: Date.now(),
    me: p.id,
    isHost: p.id === room.hostId,
    cfg: room.cfg,
    players: ps,
    q: qView,
    mix: mixView,
    cn: room.cn ? {
      turnTeam: room.cn.turnTeam,
      clue: room.cn.clue,
      guessesLeft: room.cn.guessesLeft,
      winner: room.cn.winner,
      cards: room.cn.cards.map(c => ({
        word: c.word,
        revealed: c.revealed,
        color: c.revealed || p.role === 'spymaster' || room.cn.winner ? c.color : 'hidden',
      })),
    } : null,
    ww: room.ww ? {
      day: room.ww.day,
      subPhase: room.ww.subPhase,
      lastEvent: room.ww.lastEvent,
      winner: room.ww.winner,
      votes: room.ww.votes || {},
    } : null,
    imp: room.imp ? {
      subPhase: room.imp.subPhase,
      clues: room.imp.clues || [],
      votes: room.imp.votes || {},
      word: p.role === 'imposter' ? '??? (Sen Casussun)' : room.imp.commonWord,
      winner: room.imp.winner,
    } : null,
    catalog: {
      musicCount: customCatalog.music.length,
      filmCount: customCatalog.films.length,
      pixelCount: pixelPool.length,
      musicCategories: customCatalog.musicCategories,
      artists: customCatalog.artists,
      filmCategories: ['Türk Sineması', 'Hollywood', 'Komedi', 'Dram', 'Bilim Kurgu', 'Gerilim', 'Aksiyon', 'Animasyon', 'Romantik', 'Macera', 'Korku', 'Fantastik', 'Suç ve Polisiye', 'Eski Klasikler', 'Yeni Filmler', 'Tüm Zamanların Popüler Filmleri', 'Disney', 'Pixar', 'Marvel'],
      filmSeries: ['Kara Şövalye', 'Toy Story', 'Yüzüklerin Efendisi', 'Marvel Sinematik Evreni', 'Spider-Man'],
    },
  };
}

function broadcast(room) {
  for (const [sockId, p] of room.players.entries()) {
    if (!p.connected) continue;
    const sock = io.sockets.sockets.get(sockId);
    if (sock) sock.emit('s', buildView(room, p));
  }
}

function awardPoints(room, playerId, pts) {
  const p = room.players.get(playerId);
  if (!p) return;
  p.score = Math.max(0, (p.score || 0) + Math.round(pts));
}

function finishGame(room, summaryText) {
  clearRoomTimers(room);
  room.phase = 'gameover';
  room.deadline = 0;
  room.q = {
    c: 'Oyun Sonu',
    t: summaryText || 'Oyun tamamlandı!',
    revealText: summaryText || 'Oyun tamamlandı!',
  };
  broadcast(room);
}

function initCodenames(room) {
  const allW = shuffle(allCodenamesWords());
  const freshCn = allW.filter(w => !room.usedKeys.has('cn:' + w));
  const chosenWords = [...freshCn, ...allW.filter(w => room.usedKeys.has('cn:' + w))].slice(0, 25);
  chosenWords.forEach(w => room.usedKeys.add('cn:' + w));

  const teamCount = clamp(room.cfg.teams, 2, 4, 2);
  const startTeam = crypto.randomInt(teamCount);
  const colors = shuffle([
    ...Array(8).fill('red'),
    ...Array(8).fill('blue'),
    ...Array(8).fill('neutral'),
    'assassin',
  ]);
  if (startTeam === 0) colors[0] = 'red';
  else colors[0] = 'blue';

  const cards = chosenWords.map((word, i) => ({
    word,
    color: colors[i] || 'neutral',
    revealed: false,
  }));

  const cps = connectedPlayers(room);
  cps.forEach((p, idx) => {
    p.team = idx % teamCount;
    p.role = idx < teamCount ? 'spymaster' : 'operative';
  });

  room.cn = {
    cards,
    turnTeam: startTeam,
    clue: null,
    guessesLeft: 0,
    winner: null,
  };
  room.phase = 'question';
  room.q = { c: 'Codenames', t: 'İpucu bekleniyor...' };
  broadcast(room);
}

function initWerewolf(room) {
  const cps = shuffle(connectedPlayers(room));
  const wolfCount = cps.length >= 7 ? 2 : 1;
  room.aliveIds = new Set(cps.map(p => p.id));
  cps.forEach((p, idx) => {
    p.role = idx < wolfCount ? 'werewolf' : 'villager';
  });
  room.ww = {
    day: 1,
    subPhase: 'night',
    votes: {},
    lastEvent: 'Gece çöktü. Vampirler hedefini seçiyor...',
    winner: null,
  };
  room.phase = 'question';
  const sec = clamp(room.cfg.time, 10, 60, 25);
  room.activeSec = sec;
  room.deadline = Date.now() + sec * 1000;
  room.q = { c: 'Vampir Köylü', t: 'Gece Fazı: Vampirler kurbanını seçiyor.' };
  broadcast(room);
  room.timer = setTimeout(() => resolveWerewolfNight(room), sec * 1000);
}

function checkWerewolfWin(room) {
  if (!room.ww || !room.aliveIds) return false;
  const alive = [...room.players.values()].filter(p => p.connected && room.aliveIds.has(p.id));
  const wolves = alive.filter(p => p.role === 'werewolf');
  const villagers = alive.filter(p => p.role !== 'werewolf');
  if (wolves.length === 0) {
    room.ww.winner = 'villagers';
    finishGame(room, 'Köylüler kazandı! Tüm vampirler elendi.');
    return true;
  }
  if (wolves.length >= villagers.length) {
    room.ww.winner = 'werewolves';
    finishGame(room, 'Vampirler kazandı! Köyde denge vampirlerin lehine bozuldu.');
    return true;
  }
  return false;
}

function resolveWerewolfNight(room) {
  if (!room.ww || room.phase === 'gameover') return;
  const votes = Object.values(room.ww.votes || {});
  let victimId = null;
  if (votes.length) {
    const tally = {};
    for (const v of votes) tally[v] = (tally[v] || 0) + 1;
    victimId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  }
  if (victimId && room.aliveIds) {
    room.aliveIds.delete(victimId);
    const vp = room.players.get(victimId);
    room.ww.lastEvent = `Gece sonunda ${vp ? vp.name : 'bir oyuncu'} elendi.`;
  } else {
    room.ww.lastEvent = 'Gece sessiz geçti, kimse elenmedi.';
  }
  if (checkWerewolfWin(room)) return;

  room.ww.subPhase = 'day_vote';
  room.ww.votes = {};
  const sec = clamp(room.cfg.time, 10, 60, 25);
  room.activeSec = sec;
  room.deadline = Date.now() + sec * 1000;
  room.q = { c: 'Vampir Köylü', t: room.ww.lastEvent + ' Şimdi gündüz oylaması zamanı!' };
  broadcast(room);
  room.timer = setTimeout(() => resolveWerewolfDay(room), sec * 1000);
}

function resolveWerewolfDay(room) {
  if (!room.ww || room.phase === 'gameover') return;
  const votes = Object.values(room.ww.votes || {});
  if (votes.length) {
    const tally = {};
    for (const v of votes) tally[v] = (tally[v] || 0) + 1;
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    if (!sorted[1] || sorted[0][1] > sorted[1][1]) {
      const targetId = sorted[0][0];
      if (room.aliveIds) room.aliveIds.delete(targetId);
      const tp = room.players.get(targetId);
      room.ww.lastEvent = `Gündüz oylamasıyla ${tp ? tp.name : 'bir oyuncu'} gönderildi.`;
    } else {
      room.ww.lastEvent = 'Oylar eşit çıktı, kimse gönderilmedi.';
    }
  } else {
    room.ww.lastEvent = 'Oylama yapılmadı, kimse gönderilmedi.';
  }
  if (checkWerewolfWin(room)) return;

  room.ww.day += 1;
  room.ww.subPhase = 'night';
  room.ww.votes = {};
  const sec = clamp(room.cfg.time, 10, 60, 25);
  room.activeSec = sec;
  room.deadline = Date.now() + sec * 1000;
  room.q = { c: 'Vampir Köylü', t: `${room.ww.lastEvent} ${room.ww.day}. gece başladı.` };
  broadcast(room);
  room.timer = setTimeout(() => resolveWerewolfNight(room), sec * 1000);
}

function initImposter(room) {
  const cps = connectedPlayers(room);
  const pick = pickNonRepeating(customCatalog.imposter, 'imp', room.usedKeys, room.lastKeys) || {
    c: 'Genel',
    common: 'Kahve',
    imposter: 'Çay',
  };
  const impCount = Math.min(Math.max(1, cps.length - 1), clamp(room.cfg.imposterCount, 1, 3, 1));
  const impSet = new Set(shuffle(cps).slice(0, impCount).map(p => p.id));
  cps.forEach(p => {
    p.role = impSet.has(p.id) ? 'imposter' : 'citizen';
  });
  const sec = clamp(room.cfg.time, 10, 60, 30);
  room.imp = {
    subPhase: 'clue',
    commonWord: pick.common,
    imposterWord: pick.imposter,
    clues: [],
    votes: {},
    winner: null,
  };
  room.phase = 'question';
  room.activeSec = sec;
  room.deadline = Date.now() + sec * 1000;
  room.q = { c: 'Casus Kim (' + pick.c + ')', t: 'Herkes kelimesini ima eden tek bir ipucu versin!' };
  broadcast(room);
  room.timer = setTimeout(() => startImposterVote(room), sec * 1000);
}

function startImposterVote(room) {
  if (!room.imp || room.phase === 'gameover') return;
  clearTimeout(room.timer);
  room.imp.subPhase = 'vote';
  const voteSec = Math.max(15, Math.round((room.cfg.time || 30) * 0.7));
  room.activeSec = voteSec;
  room.deadline = Date.now() + voteSec * 1000;
  room.q = { c: 'Casus Kim', t: 'İpuçları tamamlandı! Casus olduğunu düşündüğün kişiye oy ver.' };
  broadcast(room);
  room.timer = setTimeout(() => resolveImposterVote(room), voteSec * 1000);
}

function resolveImposterVote(room) {
  if (!room.imp || room.phase === 'gameover') return;
  const votes = Object.values(room.imp.votes || {});
  const tally = {};
  for (const v of votes) tally[v] = (tally[v] || 0) + 1;
  const topId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topPlayer = topId ? room.players.get(topId) : null;
  const caught = topPlayer && topPlayer.role === 'imposter';

  if (caught) {
    room.imp.winner = 'citizens';
    for (const p of room.players.values()) {
      if (p.connected && p.role !== 'imposter') awardPoints(room, p.id, 150);
    }
    finishGame(room, `Casus yakalandı (${topPlayer.name})! Ortak kelime: "${room.imp.commonWord}".`);
  } else {
    room.imp.winner = 'imposter';
    for (const p of room.players.values()) {
      if (p.connected && p.role === 'imposter') awardPoints(room, p.id, 200);
    }
    finishGame(room, `Casus paçayı kurtardı! Ortak kelime: "${room.imp.commonWord}".`);
  }
}

function revealRound(room) {
  if (room.phase !== 'question') return;
  clearTimeout(room.timer);
  const gameId = currentGameId(room);
  const q = room.q || {};

  if (gameId === 'tf') {
    for (const p of room.players.values()) {
      if (p.connected && p.ans === q._answerKey) awardPoints(room, p.id, 100);
    }
  } else if (gameId === 'quiz') {
    for (const p of room.players.values()) {
      if (p.connected && Number(p.ans) === q._answerKey) awardPoints(room, p.id, 100);
    }
  } else if (gameId === 'closest') {
    const target = Number(q._answerKey);
    const entries = [...room.players.values()]
      .filter(p => p.connected && typeof p.ans === 'number' && Number.isFinite(p.ans))
      .map(p => ({ id: p.id, diff: Math.abs(p.ans - target) }))
      .sort((a, b) => a.diff - b.diff);
    if (entries.length) {
      const bestDiff = entries[0].diff;
      for (const e of entries) {
        if (e.diff === bestDiff) awardPoints(room, e.id, 120);
        else if (e.diff <= Math.max(1, Math.abs(target) * 0.1)) awardPoints(room, e.id, 60);
      }
    }
  } else if (gameId === 'wyr') {
    const countA = [...room.players.values()].filter(p => p.connected && p.ans === 0).length;
    const countB = [...room.players.values()].filter(p => p.connected && p.ans === 1).length;
    const maj = countA === countB ? null : (countA > countB ? 0 : 1);
    if (maj !== null) {
      for (const p of room.players.values()) {
        if (p.connected && p.ans === maj) awardPoints(room, p.id, 100);
      }
    }
  } else if (gameId === 'ml') {
    const tally = {};
    for (const p of room.players.values()) {
      if (p.connected && p.ans) tally[p.ans] = (tally[p.ans] || 0) + 1;
    }
    const topTarget = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topTarget) {
      for (const p of room.players.values()) {
        if (p.connected && p.ans === topTarget) awardPoints(room, p.id, 100);
      }
    }
  }

  room.phase = 'reveal';
  room.deadline = Date.now() + 4000;
  q.revealText = q.x || q.revealText || 'Tur tamamlandı.';
  broadcast(room);

  room.timer = setTimeout(() => {
    if (room.phase !== 'reveal') return;
    if (room.mix && room.mix.active) {
      room.mix.completedRounds += 1;
    }
    if (room.round >= room.totalRounds) {
      finishGame(room, 'Tüm turlar tamamlandı!');
    } else {
      startRound(room);
    }
  }, 4000);
}

async function startMediaRound(room, gameId, sec) {
  const myGen = room.gen;
  const alive = () => room.gen === myGen && room.phase === 'question';
  room.activeSec = sec;
  room.deadline = Date.now() + sec * 1000;
  room.q = { c: GAME_META[gameId]?.name || gameId, t: 'İçerik yükleniyor...', loading: true };
  broadcast(room);

  const pool = gameId === 'song'
    ? getFilteredMusic(room)
    : (gameId === 'film' ? getFilteredFilms(room) : getPixelPool(room));
  const prefix = gameId === 'song' ? 'm' : (gameId === 'film' ? 'f' : 'px');
  const triedInAttempt = new Set();
  let built = null;

  for (let i = 0; i < 6 && !built; i++) {
    const item = pickNonRepeating(pool, prefix, room.usedKeys, room.lastKeys, triedInAttempt);
    if (!item) break;
    const k = itemKey(prefix, item);
    triedInAttempt.add(k);

    let res = null;
    try {
      if (gameId === 'song') res = await media.resolveSong(item);
      else if (gameId === 'pixel') res = await media.resolvePixel(item);
      else res = await media.resolveFilm(item);
    } catch (_) {
      res = null;
    }
    if (!alive()) return;
    if (!res) {
      room.usedKeys.delete(k);
      continue;
    }

    if (gameId === 'song') {
      built = {
        c: (item.genres && item.genres[0]) || 'Müzik',
        t: 'Şarkının adını tahmin et!',
        audioUrl: res.audioUrl,
        _fullAudioUrl: res.audioUrl,
        title: item.title,
        x: `${item.artist} — ${item.title}`,
      };
    } else if (gameId === 'film') {
      const frames = Array.isArray(res.frames) && res.frames.length ? res.frames : [res.imageUrl].filter(Boolean);
      if (!frames.length) { room.usedKeys.delete(k); continue; }
      const frameStepMs = Math.max(2500, Math.floor((sec * 1000) / frames.length));
      const nextAt = frames.length > 1 ? Date.now() + frameStepMs : 0;
      built = {
        c: item.title,
        t: 'Bu sahne hangi filmden?',
        imageUrl: frames[0],
        _frames: frames,
        _frameIdx: 0,
        _frameStepMs: frameStepMs,
        nextAt,
        answers: res.answers || item.answers || [item.title, item.en].filter(Boolean),
        x: `${item.title} (${item.year || ''})`,
      };
    } else if (gameId === 'pixel') {
      const levels = [28, 18, 10, 4, 1];
      built = {
        c: item.c || 'Görsel',
        t: 'Pikseller açılıyor — kim veya nedir?',
        imageUrl: res.imageUrl,
        pixelSize: levels[0],
        _levels: levels,
        _lvlIdx: 0,
        nextAt: Date.now() + Math.max(2500, Math.floor((sec * 1000) / levels.length)),
        answers: res.answers || item.ans || [item.name || item.title],
        x: item.name || item.title,
      };
    }
  }

  if (!alive()) return;

  if (!built) {
    built = {
      c: GAME_META[gameId]?.name || gameId,
      t: 'Bu tur için dış medya kaynağı bulunamadı; puan turu atlandı.',
      x: 'Medya kaynağı bulunamadı.',
    };
  }

  room.q = built;
  room.deadline = Date.now() + sec * 1000 + 3000;
  broadcast(room);

  if (gameId === 'film' && built._frames && built._frames.length > 1) {
    const tickFrame = () => {
      if (!alive() || !room.q || room.q._frameIdx === undefined) return;
      room.q._frameIdx += 1;
      if (room.q._frameIdx < room.q._frames.length) {
        room.q.imageUrl = room.q._frames[room.q._frameIdx];
        room.q.nextAt = room.q._frameIdx + 1 < room.q._frames.length ? Date.now() + room.q._frameStepMs : 0;
        broadcast(room);
        room.stageTimer = setTimeout(tickFrame, room.q._frameStepMs);
      } else {
        room.q.nextAt = 0;
        broadcast(room);
      }
    };
    room.stageTimer = setTimeout(tickFrame, built._frameStepMs);
  } else if (gameId === 'pixel' && built._levels && built._levels.length > 1) {
    const stepMs = Math.max(2500, Math.floor((sec * 1000) / built._levels.length));
    const tickPixel = () => {
      if (!alive() || !room.q || room.q._lvlIdx === undefined) return;
      room.q._lvlIdx += 1;
      if (room.q._lvlIdx < room.q._levels.length) {
        room.q.pixelSize = room.q._levels[room.q._lvlIdx];
        room.q.nextAt = room.q._lvlIdx + 1 < room.q._levels.length ? Date.now() + stepMs : 0;
        broadcast(room);
        room.stageTimer = setTimeout(tickPixel, stepMs);
      } else {
        room.q.nextAt = 0;
        broadcast(room);
      }
    };
    room.stageTimer = setTimeout(tickPixel, stepMs);
  }

  room.timer = setTimeout(() => revealRound(room), sec * 1000 + 3000);
}

function startRound(room) {
  clearRoomTimers(room);
  room.gen += 1;
  room.round += 1;
  room.phase = 'question';
  for (const p of room.players.values()) {
    p.ans = null;
    p.ansAt = 0;
    p.penaltyUntil = 0;
  }

  const gameId = currentGameId(room);
  const sec = clamp(room.cfg.time, 10, 60, 20);

  if (['song', 'film', 'pixel'].includes(gameId)) {
    startMediaRound(room, gameId, sec);
    return;
  }

  room.activeSec = sec;
  room.deadline = Date.now() + sec * 1000;

  if (gameId === 'tf') {
    const item = pickNonRepeating(byCat(bank.TF_BANK || [], room), 'tf', room.usedKeys, room.lastKeys);
    room.q = { c: item.c, t: item.t, _answerKey: item.v, x: item.x };
  } else if (gameId === 'closest') {
    const item = pickNonRepeating(byCat(bank.CLOSEST_BANK || [], room), 'cl', room.usedKeys, room.lastKeys);
    room.q = { c: item.c, t: item.t, u: item.u || '', _answerKey: item.v, x: item.x };
  } else if (gameId === 'quiz') {
    const item = pickNonRepeating(byCat(bank.QUIZ_BANK || [], room), 'qz', room.usedKeys, room.lastKeys);
    room.q = { c: item.c, t: item.t, o: item.o, _answerKey: item.v, x: item.x };
  } else if (gameId === 'liar') {
    const item = pickNonRepeating(byCat(bank.LIAR_BANK || [], room), 'lr', room.usedKeys, room.lastKeys);
    room.q = { c: item.c, t: item.t, o: item.o, _answerKey: item.v, x: item.x };
  } else if (gameId === 'wyr') {
    const item = pickNonRepeating(bank.WYR_BANK || [], 'wy', room.usedKeys, room.lastKeys);
    room.q = { c: item.c, t: item.t, o: item.o, x: item.x };
  } else if (gameId === 'ml') {
    const item = pickNonRepeating(bank.ML_BANK || [], 'ml', room.usedKeys, room.lastKeys);
    const opts = connectedPlayers(room).map(pl => ({ id: pl.id, name: pl.name }));
    room.q = { c: item.c, t: item.t, o: opts, x: item.x };
  } else if (gameId === 'emoji') {
    const item = pickNonRepeating(byCat(bank.EMOJI_BANK || [], room), 'em', room.usedKeys, room.lastKeys);
    room.q = { c: item.c, t: item.t, a: item.a, x: item.x };
  }

  broadcast(room);
  room.timer = setTimeout(() => revealRound(room), sec * 1000);
}

function leaveRoom(socketId) {
  for (const [code, room] of rooms.entries()) {
    const p = room.players.get(socketId);
    if (!p) continue;
    p.connected = false;
    if (room.aliveIds) room.aliveIds.delete(socketId);

    if (room.hostId === socketId) {
      const nextHost = connectedPlayers(room)[0];
      if (nextHost) room.hostId = nextHost.id;
    }

    if (connectedPlayers(room).length === 0) {
      clearRoomTimers(room);
      rooms.delete(code);
      return;
    }

    if (room.game === 'werewolf' && room.phase === 'question' && checkWerewolfWin(room)) {
      return;
    }
    broadcast(room);
  }
}

io.on('connection', sock => {
  sock.on('create', ({ name } = {}) => {
    leaveRoom(sock.id);
    const room = createRoom(sock.id, name);
    sock.join(room.code);
    sock.emit('s', buildView(room, room.players.get(sock.id)));
  });

  sock.on('join', ({ code, name } = {}) => {
    leaveRoom(sock.id);
    const cleanCode = String(code || '').trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) return sock.emit('toast', 'Oda bulunamadı.');
    const p = addPlayer(room, sock.id, name);
    sock.join(room.code);
    broadcast(room);
    sock.emit('s', buildView(room, p));
  });

  sock.on('cfg', patch => {
    const room = [...rooms.values()].find(r => r.hostId === sock.id);
    if (!room || !patch || typeof patch !== 'object') return;
    if (patch.game && GAME_META[patch.game]) {
      room.cfg.game = patch.game;
      room.game = patch.game;
      room.cfg.cats = [];
    }
    if (['solo', 'teams'].includes(patch.mode)) room.cfg.mode = patch.mode;
    if (patch.rounds !== undefined) room.cfg.rounds = clamp(patch.rounds, 3, 20, 5);
    if (patch.time !== undefined) room.cfg.time = clamp(patch.time, 10, 60, 20);
    if (patch.teams !== undefined) room.cfg.teams = clamp(patch.teams, 2, 4, 2);
    if (patch.imposterCount !== undefined) room.cfg.imposterCount = clamp(patch.imposterCount, 1, 3, 1);
    if (patch.imposterGuessBonus !== undefined) room.cfg.imposterGuessBonus = Boolean(patch.imposterGuessBonus);
    if (Array.isArray(patch.cats)) room.cfg.cats = patch.cats.slice(0, 8);
    if (patch.mixMode !== undefined) room.cfg.mixMode = Boolean(patch.mixMode);
    if (Array.isArray(patch.mixGames)) {
      room.cfg.mixGames = [...new Set(patch.mixGames)].filter(g => MIX_ALLOWED.has(g) && !MIX_FORBIDDEN.has(g)).slice(0, 4);
    }
    if (patch.mixRoundsPerGame !== undefined) room.cfg.mixRoundsPerGame = clamp(patch.mixRoundsPerGame, 1, 5, 2);
    if (patch.musicFilter) room.cfg.musicFilter = sanitizeMusicFilter(patch.musicFilter);
    if (patch.filmFilter) room.cfg.filmFilter = sanitizeFilmFilter(patch.filmFilter);
    broadcast(room);
  });

  sock.on('start', c => {
    const room = [...rooms.values()].find(r => r.hostId === sock.id);
    if (!room) return;
    if (c && typeof c === 'object') {
      if (c.game && GAME_META[c.game]) {
        room.cfg.game = c.game;
        room.game = c.game;
      }
      if (['solo', 'teams'].includes(c.mode)) room.cfg.mode = c.mode;
      if (c.rounds !== undefined) room.cfg.rounds = clamp(c.rounds, 3, 20, 5);
      if (c.time !== undefined) room.cfg.time = clamp(c.time, 10, 60, 20);
      if (c.teams !== undefined) room.cfg.teams = clamp(c.teams, 2, 4, 2);
      if (c.imposterCount !== undefined) room.cfg.imposterCount = clamp(c.imposterCount, 1, 3, 1);
      if (Array.isArray(c.cats)) room.cfg.cats = c.cats.slice(0, 8);
      if (c.mixMode !== undefined) room.cfg.mixMode = Boolean(c.mixMode);
      if (Array.isArray(c.mixGames)) {
        room.cfg.mixGames = [...new Set(c.mixGames)].filter(g => MIX_ALLOWED.has(g) && !MIX_FORBIDDEN.has(g)).slice(0, 4);
      }
      if (c.mixRoundsPerGame !== undefined) room.cfg.mixRoundsPerGame = clamp(c.mixRoundsPerGame, 1, 5, 2);
      if (c.musicFilter) room.cfg.musicFilter = sanitizeMusicFilter(c.musicFilter);
      if (c.filmFilter) room.cfg.filmFilter = sanitizeFilmFilter(c.filmFilter);
    }

    const ps = connectedPlayers(room);
    if (room.cfg.mixMode) {
      const validMix = [...new Set(room.cfg.mixGames || [])]
        .filter(gid => MIX_ALLOWED.has(gid) && !MIX_FORBIDDEN.has(gid)).slice(0, 4);
      if (validMix.length < 2) return sock.emit('toast', 'Karma Mod için en az 2 uyumlu oyun seçin.');
      room.cfg.cats = [];
      room.mix = {
        active: true,
        games: validMix,
        roundsPerGame: clamp(room.cfg.mixRoundsPerGame, 1, 5, 2),
        completedRounds: 0,
      };
      room.totalRounds = validMix.length * room.mix.roundsPerGame;
    } else {
      room.mix = { active: false, games: ['emoji', 'song', 'film'], roundsPerGame: 2, completedRounds: 0 };
      if (room.cfg.game === 'codenames' && ps.length < 4) return sock.emit('toast', 'Codenames için en az 4 oyuncu gerekli.');
      if (room.cfg.game === 'imposter' && ps.length < 4) return sock.emit('toast', 'Casus Kim için en az 4 oyuncu gerekli.');
      if (room.cfg.game === 'werewolf' && ps.length < 5) return sock.emit('toast', 'Vampir Köylü için en az 5 oyuncu gerekli.');
      room.totalRounds = ['codenames', 'werewolf', 'imposter'].includes(room.cfg.game) ? 1 : room.cfg.rounds;
    }

    for (const p of room.players.values()) {
      p.score = 0;
      p.role = null;
      p.ans = null;
      p.ansAt = 0;
      p.penaltyUntil = 0;
    }
    room.round = 0;
    room.aliveIds = null;
    room.cn = null;
    room.ww = null;
    room.imp = null;
    room.game = room.mix.active ? room.mix.games[0] : room.cfg.game;

    if (!room.mix.active && room.cfg.game === 'codenames') return initCodenames(room);
    if (!room.mix.active && room.cfg.game === 'werewolf') return initWerewolf(room);
    if (!room.mix.active && room.cfg.game === 'imposter') return initImposter(room);

    startRound(room);
  });

  sock.on('ans', val => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || room.phase !== 'question') return;
    const p = room.players.get(sock.id);
    if (!p || !p.connected || p.ans !== null) return;
    const gameId = currentGameId(room);

    if (gameId === 'tf') {
      p.ans = Boolean(val);
      p.ansAt = Date.now();
    } else if (gameId === 'quiz' || gameId === 'liar' || gameId === 'wyr') {
      p.ans = Number(val);
      p.ansAt = Date.now();
    } else if (gameId === 'closest') {
      const num = Number(String(val || '').replace(',', '.'));
      if (!Number.isFinite(num)) return sock.emit('toast', 'Geçerli bir sayı gir.');
      p.ans = num;
      p.ansAt = Date.now();
    } else if (gameId === 'ml') {
      if (!val || !room.players.has(String(val))) return sock.emit('toast', 'Bir oyuncu seç.');
      p.ans = String(val);
      p.ansAt = Date.now();
    }

    const active = connectedPlayers(room);
    if (active.length && active.every(pl => pl.ans !== null)) {
      revealRound(room);
    } else {
      broadcast(room);
    }
  });

  sock.on('guess', rawText => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || room.phase !== 'question' || !room.q) return;
    const p = room.players.get(sock.id);
    if (!p || !p.connected) return;
    const now = Date.now();
    if (p.penaltyUntil > now) return;

    const gameId = currentGameId(room);
    if (checkTextGuessMatch(gameId, room.q, rawText)) {
      p.ans = String(rawText || '').trim();
      p.ansAt = now;
      awardPoints(room, p.id, 150);
      sock.emit('toast', 'Doğru tahmin! +150 puan');
      revealRound(room);
    } else {
      p.penaltyUntil = now + 3000;
      sock.emit('toast', 'Yanlış tahmin! 3 sn bekleme cezası.');
      sock.emit('s', buildView(room, p));
    }
  });

  sock.on('cn:clue', ({ word, count } = {}) => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || !room.cn || room.cn.winner) return;
    const p = room.players.get(sock.id);
    if (!p || p.role !== 'spymaster' || p.team !== room.cn.turnTeam) return;
    const cleanWord = String(word || '').trim();
    if (!cleanWord) return sock.emit('toast', 'Bir ipucu kelimesi gir.');
    const nCount = clamp(count, 1, 9, 1);
    room.cn.clue = { word: cleanWord, count: nCount };
    room.cn.guessesLeft = nCount + 1;
    broadcast(room);
  });

  sock.on('cn:guess', idx => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || !room.cn || room.cn.winner || !room.cn.clue) return;
    const p = room.players.get(sock.id);
    if (!p || p.role !== 'operative' || p.team !== room.cn.turnTeam) return;
    const card = room.cn.cards[Number(idx)];
    if (!card || card.revealed) return;

    card.revealed = true;
    room.cn.guessesLeft -= 1;

    if (card.color === 'assassin') {
      const teamCount = clamp(room.cfg.teams, 2, 4, 2);
      room.cn.winner = (room.cn.turnTeam + 1) % teamCount;
      finishGame(room, `Suikastçı kartı açıldı! ${room.cn.winner + 1}. takım kazandı.`);
      return;
    }

    const teamKey = p.team === 0 ? 'red' : 'blue';
    if (card.color === teamKey) {
      awardPoints(room, p.id, 50);
    }

    const remainingTarget = room.cn.cards.filter(c => c.color === teamKey && !c.revealed).length;
    if (remainingTarget === 0) {
      room.cn.winner = p.team;
      finishGame(room, `${p.team + 1}. takım tüm kelimeleri buldu ve kazandı!`);
      return;
    }

    if (card.color !== teamKey || room.cn.guessesLeft <= 0) {
      const teamCount = clamp(room.cfg.teams, 2, 4, 2);
      room.cn.turnTeam = (room.cn.turnTeam + 1) % teamCount;
      room.cn.clue = null;
      room.cn.guessesLeft = 0;
    }
    broadcast(room);
  });

  sock.on('cn:endTurn', () => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || !room.cn || room.cn.winner) return;
    const p = room.players.get(sock.id);
    if (!p || p.team !== room.cn.turnTeam) return;
    const teamCount = clamp(room.cfg.teams, 2, 4, 2);
    room.cn.turnTeam = (room.cn.turnTeam + 1) % teamCount;
    room.cn.clue = null;
    room.cn.guessesLeft = 0;
    broadcast(room);
  });

  sock.on('ww:vote', targetId => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || !room.ww || room.phase !== 'question') return;
    const p = room.players.get(sock.id);
    if (!p || !p.connected || (room.aliveIds && !room.aliveIds.has(p.id))) return;
    if (room.ww.subPhase === 'night' && p.role !== 'werewolf') return;
    if (!room.players.has(String(targetId))) return;
    room.ww.votes[p.id] = String(targetId);
    broadcast(room);
  });

  sock.on('imp:clue', text => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || !room.imp || room.imp.subPhase !== 'clue') return;
    const p = room.players.get(sock.id);
    if (!p || !p.connected) return;
    if (room.imp.clues.some(c => c.playerId === p.id)) return;
    const clean = String(text || '').trim().slice(0, 60);
    if (!clean) return sock.emit('toast', 'İpucu boş olamaz.');
    room.imp.clues.push({ playerId: p.id, name: p.name, clue: clean });
    if (room.imp.clues.length >= connectedPlayers(room).length) {
      startImposterVote(room);
    } else {
      broadcast(room);
    }
  });

  sock.on('imp:vote', targetId => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || !room.imp || room.imp.subPhase !== 'vote') return;
    const p = room.players.get(sock.id);
    if (!p || !p.connected || !room.players.has(String(targetId))) return;
    room.imp.votes[p.id] = String(targetId);
    if (Object.keys(room.imp.votes).length >= connectedPlayers(room).length) {
      resolveImposterVote(room);
    } else {
      broadcast(room);
    }
  });

  sock.on('backToLobby', () => {
    const room = [...rooms.values()].find(r => r.players.has(sock.id));
    if (!room || room.hostId !== sock.id) return;
    clearRoomTimers(room);
    room.phase = 'lobby';
    room.q = null;
    room.cn = null;
    room.ww = null;
    room.imp = null;
    room.aliveIds = null;
    room.mix.active = false;
    for (const p of room.players.values()) {
      p.role = null;
      p.ans = null;
      p.ansAt = 0;
      p.penaltyUntil = 0;
    }
    broadcast(room);
  });

  sock.on('disconnect', () => leaveRoom(sock.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Parti Odası dinlemede: ' + PORT);
});
