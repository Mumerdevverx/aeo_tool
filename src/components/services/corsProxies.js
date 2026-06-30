// ============================================
// MULTIPLE CORS PROXY SERVICES
// ============================================

export const CORS_PROXIES = [
  // Option 1: AllOrigins (Most reliable)
  {
    name: 'allorigins',
    url: 'https://api.allorigins.win/raw?url=',
    priority: 1
  },
  // Option 2: CorsProxy.io
  {
    name: 'corsproxy',
    url: 'https://corsproxy.io/?',
    priority: 2
  },
  // Option 3: Cors-Anywhere
  {
    name: 'corsanywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    priority: 3
  },
  // Option 4: ThingProxy
  {
    name: 'thingproxy',
    url: 'https://thingproxy.freeboard.io/fetch/',
    priority: 4
  }
];

// ============================================
// HELPER: Try multiple proxies
// ============================================
export async function fetchWithMultipleProxies(url, timeout = 15000) {
  const errors = [];
  
  for (const proxy of CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const proxyUrl = proxy.url + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAuditor/2.0)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const html = await response.text();
        return { 
          success: true, 
          html, 
          proxy: proxy.name,
          headers: response.headers,
          status: response.status
        };
      }
      
      errors.push(`${proxy.name}: HTTP ${response.status}`);
      
    } catch (error) {
      errors.push(`${proxy.name}: ${error.message}`);
      continue;
    }
  }
  
  return { 
    success: false, 
    error: errors.join(' | ')
  };
}