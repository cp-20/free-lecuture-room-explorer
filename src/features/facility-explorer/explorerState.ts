import { addDays, todayInputDate } from '../../lib/date';
import type { QueryState } from '../../lib/types';

export function createInitialQueryState(): QueryState {
  return {
    date: todayInputDate(),
  };
}

export function normalizeDayState(state: QueryState): QueryState {
  return {
    date: state.date,
  };
}

export function setDate(state: QueryState, date: string): QueryState {
  return normalizeDayState({ ...state, date });
}

export function moveDate(state: QueryState, direction: number): QueryState {
  return setDate(state, addDays(state.date, direction));
}
