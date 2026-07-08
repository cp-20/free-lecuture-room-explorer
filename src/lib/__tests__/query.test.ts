import { describe, expect, it } from 'vite-plus/test';
import { buildFacilityFetchUrl } from '../proxy';
import { buildFacilityRequest } from '../query';
import type { QueryState } from '../types';

const state: QueryState = {
  date: '2026-07-01',
};

describe('施設予約 URL', () => {
  it('単日表示の Ajax URL を生成する', () => {
    const request = buildFacilityRequest(state);

    expect(request.ajaxUrl).toContain('DayList.aspx?');
    expect(request.ajaxUrl).toContain('date=20260701');
    expect(request.ajaxUrl).toContain('b=3');
  });

  it('proxy endpoint へ ASPX パスと検索条件を詰め替える', () => {
    const request = buildFacilityRequest(state);
    const proxyUrl = buildFacilityFetchUrl(
      request.ajaxUrl,
      'https://proxy.example/api/facility',
      'http://localhost:5173',
    );

    expect(proxyUrl).toBe(
      'https://proxy.example/api/facility/DayList.aspx?date=20260701&b=3',
    );
  });

  it('同一 origin 配信では相対 proxy endpoint を使う', () => {
    const request = buildFacilityRequest(state);
    const proxyUrl = buildFacilityFetchUrl(request.ajaxUrl, '/api/facility', 'https://app.example');

    expect(proxyUrl).toBe(
      '/api/facility/DayList.aspx?date=20260701&b=3',
    );
  });
});
