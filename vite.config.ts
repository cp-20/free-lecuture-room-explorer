import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite-plus';

const FACILITY_PROXY_TARGET = 'https://kyomu0.gakumu.titech.ac.jp/fr/Common/FacilityReservation/';
const ALLOWED_PROXY_PATHS = new Set(['DayList.aspx']);

function rewriteFacilityProxyPath(path: string): string {
  const url = new URL(path, 'http://localhost');
  const sourcePath = sourcePathFromProxyRequest(url);
  if (!ALLOWED_PROXY_PATHS.has(sourcePath)) return '/__invalid_facility_path__';
  url.searchParams.delete('path');
  const query = url.searchParams.toString();
  return `/${sourcePath}${query ? `?${query}` : ''}`;
}

function sourcePathFromProxyRequest(url: URL): string {
  const prefix = '/api/facility/';
  if (!url.pathname.startsWith(prefix)) return '';
  return url.pathname.slice(prefix.length);
}

export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/api/facility': {
        target: FACILITY_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: rewriteFacilityProxyPath,
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'ja,en-US;q=0.8,en;q=0.6',
          Referer: FACILITY_PROXY_TARGET,
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
