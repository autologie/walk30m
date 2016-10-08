
function isSafariPrivateBrowsing() {
  try {
    window.localStorage.setItem('test', 'test');
    window.localStorage.removeItem('test');
    return false;
  } catch (ignore) {
    return true;
  }
}

export function isMobile() {
  return window.matchMedia('(orientation: portrait)').matches;
}

export function save(key, data) {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e.name !== 'QuotaExceededError' || !isSafariPrivateBrowsing()) {
      throw e;
    }
  }
}

export function load(key) {
  const serialized = window.localStorage.getItem(key);

  if (!serialized) return {};

  try {
    return JSON.parse(serialized);
  } catch (e) {
    return {};
  }
}
