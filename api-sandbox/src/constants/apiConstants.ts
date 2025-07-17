export const COMMON_HEADERS = [
  { value: 'Authorization', label: 'Authorization' },
  { value: 'Content-Type', label: 'Content-Type' },
  { value: 'Accept', label: 'Accept' },
  { value: 'User-Agent', label: 'User-Agent' },
  { value: 'Cache-Control', label: 'Cache-Control' },
  { value: 'Accept-Encoding', label: 'Accept-Encoding' },
  { value: 'Accept-Language', label: 'Accept-Language' },
  { value: 'Connection', label: 'Connection' },
  { value: 'Cookie', label: 'Cookie' },
  { value: 'Host', label: 'Host' },
  { value: 'Origin', label: 'Origin' },
  { value: 'Referer', label: 'Referer' },
  { value: 'X-API-Key', label: 'X-API-Key' },
  { value: 'X-Requested-With', label: 'X-Requested-With' },
  { value: 'X-Forwarded-For', label: 'X-Forwarded-For' },
  { value: 'X-Real-IP', label: 'X-Real-IP' },
  { value: 'X-CSRF-Token', label: 'X-CSRF-Token' },
  { value: 'If-None-Match', label: 'If-None-Match' },
  { value: 'If-Modified-Since', label: 'If-Modified-Since' },
  { value: 'Range', label: 'Range' },
];

export const CONTENT_TYPES = [
  { value: 'application/json', label: 'application/json' },
  { value: 'application/xml', label: 'application/xml' },
  { value: 'application/x-www-form-urlencoded', label: 'application/x-www-form-urlencoded' },
  { value: 'multipart/form-data', label: 'multipart/form-data' },
  { value: 'text/plain', label: 'text/plain' },
  { value: 'text/html', label: 'text/html' },
  { value: 'text/csv', label: 'text/csv' },
  { value: 'application/pdf', label: 'application/pdf' },
  { value: 'application/octet-stream', label: 'application/octet-stream' },
  { value: 'image/jpeg', label: 'image/jpeg' },
  { value: 'image/png', label: 'image/png' },
  { value: 'image/gif', label: 'image/gif' },
];

export const ACCEPT_TYPES = [
  { value: 'application/json', label: 'application/json' },
  { value: 'application/xml', label: 'application/xml' },
  { value: 'text/html', label: 'text/html' },
  { value: 'text/plain', label: 'text/plain' },
  { value: 'text/csv', label: 'text/csv' },
  { value: 'application/pdf', label: 'application/pdf' },
  { value: '*/*', label: '*/* (Accept all)' },
  { value: 'application/vnd.api+json', label: 'application/vnd.api+json (JSON API)' },
  { value: 'application/hal+json', label: 'application/hal+json (HAL)' },
];

export const AUTH_TYPES = [
  { value: 'Bearer', label: 'Bearer Token' },
  { value: 'Basic', label: 'Basic Auth' },
  { value: 'API-Key', label: 'API Key' },
  { value: 'OAuth', label: 'OAuth' },
  { value: 'JWT', label: 'JWT' },
  { value: 'Custom', label: 'Custom' },
];

export const COMMON_QUERY_PARAMS = [
  { value: 'page', label: 'page' },
  { value: 'limit', label: 'limit' },
  { value: 'offset', label: 'offset' },
  { value: 'sort', label: 'sort' },
  { value: 'order', label: 'order' },
  { value: 'filter', label: 'filter' },
  { value: 'search', label: 'search' },
  { value: 'q', label: 'q (query)' },
  { value: 'fields', label: 'fields' },
  { value: 'include', label: 'include' },
  { value: 'exclude', label: 'exclude' },
  { value: 'format', label: 'format' },
  { value: 'callback', label: 'callback' },
  { value: 'since', label: 'since' },
  { value: 'until', label: 'until' },
  { value: 'per_page', label: 'per_page' },
  { value: 'size', label: 'size' },
  { value: 'count', label: 'count' },
  { value: 'start', label: 'start' },
  { value: 'end', label: 'end' },
];

export const CACHE_CONTROL_VALUES = [
  { value: 'no-cache', label: 'no-cache' },
  { value: 'no-store', label: 'no-store' },
  { value: 'max-age=0', label: 'max-age=0' },
  { value: 'max-age=3600', label: 'max-age=3600 (1 hour)' },
  { value: 'max-age=86400', label: 'max-age=86400 (1 day)' },
  { value: 'public', label: 'public' },
  { value: 'private', label: 'private' },
  { value: 'must-revalidate', label: 'must-revalidate' },
];

export const USER_AGENTS = [
  { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', label: 'Chrome (Windows)' },
  { value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', label: 'Chrome (macOS)' },
  { value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', label: 'Chrome (Linux)' },
  { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0', label: 'Firefox (Windows)' },
  { value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0', label: 'Firefox (macOS)' },
  { value: 'PostmanRuntime/7.28.4', label: 'Postman' },
  { value: 'insomnia/2021.5.3', label: 'Insomnia' },
  { value: 'curl/7.68.0', label: 'cURL' },
  { value: 'Python/3.9 requests/2.25.1', label: 'Python Requests' },
  { value: 'Custom', label: 'Custom User Agent' },
];

// Helper function to extract path parameters from URL
export const extractPathParameters = (url: string): string[] => {
  const regex = /\{([^}]+)\}/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(url)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
};

// Helper function to get header value suggestions based on header name
export const getHeaderValueSuggestions = (headerName: string) => {
  switch (headerName.toLowerCase()) {
    case 'content-type':
      return CONTENT_TYPES;
    case 'accept':
      return ACCEPT_TYPES;
    case 'cache-control':
      return CACHE_CONTROL_VALUES;
    case 'user-agent':
      return USER_AGENTS;
    case 'authorization':
      return AUTH_TYPES.map(auth => ({ 
        value: auth.value === 'Bearer' ? 'Bearer YOUR_TOKEN_HERE' : 
               auth.value === 'Basic' ? 'Basic YOUR_BASE64_CREDENTIALS' :
               auth.value === 'API-Key' ? 'YOUR_API_KEY_HERE' : 
               'YOUR_AUTH_VALUE_HERE', 
        label: auth.label 
      }));
    default:
      return [];
  }
}; 