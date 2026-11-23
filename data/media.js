'use strict';

const TMDB_API_KEY =
  process.env.TMDB_API_KEY ||
  process.env.TMDB_KEY ||
  process.env.TMDB_TOKEN ||
  '';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

const filmCache = new Map();
const pixelCache = new Map();

async function fetchJson(url) {
  if (typeof fetch !== 'function') return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveFilm(item) {
  if (!item || !TMDB_API_KEY) return null;
  const cacheKey = String(item.id || item.en || item.title || '').toLowerCase();
  if (filmCache.has(cacheKey)) return filmCache.get(cacheKey);

  const queryTitle = encodeURIComponent(item.en || item.title || '');
  if (!queryTitle) return null;

  const yearParam = item.year ? `&year=${encodeURIComponent(item.year)}` : '';
  let searchData = await fetchJson(
    `${TMDB_BASE}/search/movie?api_key=${encodeURIComponent(TMDB_API_KEY)}&query=${queryTitle}&language=tr-TR${yearParam}`
  );

  if (!searchData || !Array.isArray(searchData.results) || !searchData.results.length) {
    searchData = await fetchJson(
      `${TMDB_BASE}/search/movie?api_key=${encodeURIComponent(TMDB_API_KEY)}&query=${queryTitle}&language=en-US`
    );
  }

  const movie = searchData && Array.isArray(searchData.results) ? searchData.results[0] : null;
  if (!movie || !movie.id) {
    filmCache.set(cacheKey, null);
    return null;
  }

  const imagesData = await fetchJson(
    `${TMDB_BASE}/movie/${movie.id}/images?api_key=${encodeURIComponent(TMDB_API_KEY)}`
  );

  const backdrops = Array.isArray(imagesData && imagesData.backdrops)
    ? imagesData.backdrops
        .filter(b => b && b.file_path)
        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0) || (b.width || 0) - (a.width || 0))
        .slice(0, 5)
        .map(b => `${TMDB_IMG}/w1280${b.file_path}`)
    : [];

  if (!backdrops.length) {
    filmCache.set(cacheKey, null);
    return null;
  }

  const resolved = {
    frames: backdrops,
    imageUrl: backdrops[0],
    title: item.title || movie.title || item.en,
    answers: Array.isArray(item.answers) && item.answers.length
      ? item.answers
      : [item.title, item.en].filter(Boolean),
  };

  filmCache.set(cacheKey, resolved);
  return resolved;
}

async function resolvePixel(item) {
  if (!item) return null;
  const cacheKey = String(item.id || item.title || '').toLowerCase();
  if (pixelCache.has(cacheKey)) return pixelCache.get(cacheKey);

  const wikiTitle = encodeURIComponent(String(item.title || item.name || '').replace(/ /g, '_'));
  if (!wikiTitle) return null;

  const summary = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`);
  const imgUrl =
    (summary && summary.originalimage && summary.originalimage.source) ||
    (summary && summary.thumbnail && summary.thumbnail.source) ||
    null;

  if (!imgUrl) {
    pixelCache.set(cacheKey, null);
    return null;
  }

  const resolved = {
    imageUrl: imgUrl,
    title: item.name || item.title,
    answers: Array.isArray(item.ans) && item.ans.length ? item.ans : [item.name || item.title],
  };

  pixelCache.set(cacheKey, resolved);
  return resolved;
}

async function resolveSong(item) {
  if (!item) return null;
  if (item.previewUrl || item.audioUrl) {
    return {
      audioUrl: item.previewUrl || item.audioUrl,
      title: item.title,
      artist: item.artist,
    };
  }
  const term = encodeURIComponent(`${item.title || ''} ${item.artist || ''}`.trim());
  if (!term) return null;
  const data = await fetchJson(`https://itunes.apple.com/search?term=${term}&media=music&limit=1`);
  const track = data && Array.isArray(data.results) ? data.results[0] : null;
  if (!track || !track.previewUrl) return null;
  return {
    audioUrl: track.previewUrl,
    title: item.title || track.trackName,
    artist: item.artist || track.artistName,
  };
}

module.exports = {
  resolveFilm,
  resolvePixel,
  resolveSong,
};
