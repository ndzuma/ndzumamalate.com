/** Minimal hash-based SPA router using Svelte 5 runes */

let currentPath = $state(parseHash());
let params = $state({});

function parseHash() {
  const hash = window.location.hash.slice(1) || '/login';
  return hash.split('?')[0];
}

function parseParams() {
  const hash = window.location.hash.slice(1) || '';
  const qIdx = hash.indexOf('?');
  if (qIdx === -1) return {};
  const search = new URLSearchParams(hash.slice(qIdx + 1));
  const out = {};
  for (const [k, v] of search) out[k] = v;
  return out;
}

function handleHashChange() {
  currentPath = parseHash();
  params = parseParams();
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', handleHashChange);
  params = parseParams();
}

export function navigate(path) {
  window.location.hash = path;
}

export function getPath() {
  return currentPath;
}

export function getParams() {
  return params;
}

/** Match a route pattern like /editor/:type/:id against current path */
export function matchRoute(pattern) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = currentPath.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const extracted = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      extracted[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return extracted;
}
