
export function isMobile() {
  return window.matchMedia('(orientation: portrait)').matches;
}

export function save(key, data) {
  window.localStorage.setItem('walk30m-data', JSON.stringify(data));
}

export function load(key) {
  const serialized = window.localStorage.getItem('walk30m-data');

  if (!serialized) return {};

  try {
    return JSON.parse(serialized);
  } catch (e) {
    return {};
  }
}
