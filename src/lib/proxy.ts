const DEFAULT_PROXY_ENDPOINT = '/api/facility';

export function proxyEndpointFromEnv(): string {
  return import.meta.env.VITE_FACILITY_PROXY_URL?.trim() || DEFAULT_PROXY_ENDPOINT;
}

export function buildFacilityFetchUrl(
  ajaxUrl: string,
  proxyEndpoint: string,
  baseOrigin = globalThis.location?.origin ?? 'http://localhost',
): string {
  if (!proxyEndpoint) return ajaxUrl;

  const source = new URL(ajaxUrl);
  const path = source.pathname.split('/').at(-1);
  if (!path) return ajaxUrl;

  const isAbsoluteProxy = /^https?:\/\//.test(proxyEndpoint);
  const endpoint = proxyEndpoint.endsWith('/') ? proxyEndpoint : `${proxyEndpoint}/`;
  const proxyUrl = new URL(path, new URL(endpoint, baseOrigin));

  for (const [key, value] of source.searchParams) {
    proxyUrl.searchParams.set(key, value);
  }

  // 相対 endpoint を指定した場合は、同一 origin 配信で扱えるよう相対 URL のまま返す。
  return isAbsoluteProxy ? proxyUrl.toString() : `${proxyUrl.pathname}${proxyUrl.search}`;
}
