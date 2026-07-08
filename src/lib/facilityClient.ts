import { CORS_DIAGNOSTIC } from './constants';
import { buildFacilityFetchUrl, proxyEndpointFromEnv } from './proxy';

export class FacilityFetchError extends Error {
  readonly kind: 'cors' | 'http' | 'network';

  constructor(kind: 'cors' | 'http' | 'network', message: string) {
    super(message);
    this.name = 'FacilityFetchError';
    this.kind = kind;
  }
}

interface FetchFacilityOptions {
  proxyEndpoint?: string;
}

export async function fetchFacilityHtml(url: string, options: FetchFacilityOptions = {}): Promise<string> {
  const proxyEndpoint = options.proxyEndpoint ?? proxyEndpointFromEnv();
  const fetchUrl = buildFacilityFetchUrl(url, proxyEndpoint);

  try {
    const response = await fetch(fetchUrl, {
      cache: 'no-store',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new FacilityFetchError('http', `HTTP ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    if (error instanceof FacilityFetchError) throw error;
    if (error instanceof TypeError) {
      const message = proxyEndpoint
        ? '施設予約 proxy への通信に失敗しました。配信サーバーの起動 URL と VITE_FACILITY_PROXY_URL を確認してください。'
        : CORS_DIAGNOSTIC;
      throw new FacilityFetchError('cors', message);
    }
    throw new FacilityFetchError('network', '取得中にネットワークエラーが発生しました。');
  }
}
