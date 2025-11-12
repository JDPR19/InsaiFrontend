export function getSocketUrl(BaseUrl) {
  try {
    if (/^https?:\/\//i.test(BaseUrl)) {
      const u = new URL(BaseUrl);
      return u.origin; // http://host:puerto
    }
  } catch (error) {
    console.error('socketConfig error:', error);
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin; // cuando BaseUrl = '/api'
  }
  return 'http://localhost:4000';
}