export type SlotStatus = 'reserved' | 'open' | 'blank';

export interface DaySlot {
  label: string;
  status: SlotStatus;
}

export interface FacilityRoom {
  id: string;
  name: string;
  slots: DaySlot[];
}

export interface FacilityDataset {
  rooms: FacilityRoom[];
  timeSlots: string[];
}

export interface QueryState {
  date: string;
}

export interface FacilityRequest {
  ajaxUrl: string;
  path: 'DayList.aspx';
  query: string;
}
