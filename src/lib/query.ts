import { DEFAULT_CATEGORY_ID, FACILITY_BASE_URL } from './constants';
import { compactDate, parseSourceDate, todayInputDate } from './date';
import type { FacilityRequest, QueryState } from './types';

export function buildFacilityRequest(state: QueryState): FacilityRequest {
  const path = 'DayList.aspx';
  const ajaxParams = new URLSearchParams();

  ajaxParams.set('date', compactDate(state.date));
  ajaxParams.set('b', String(DEFAULT_CATEGORY_ID));

  const ajaxUrl = new URL(`${path}?${ajaxParams.toString()}`, FACILITY_BASE_URL).toString();
  return {
    ajaxUrl,
    path,
    query: ajaxParams.toString(),
  };
}

export function queryStateFromSearch(search: string): QueryState {
  const params = new URLSearchParams(search);
  const date = parseSourceDate(params.get('date')) ?? todayInputDate();
  return {
    date,
  };
}

export function browserSearchFromState(state: QueryState): string {
  const params = new URLSearchParams();
  params.set('date', compactDate(state.date));
  return `?${params.toString()}`;
}
