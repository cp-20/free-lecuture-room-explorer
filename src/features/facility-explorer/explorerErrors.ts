import { FacilityFetchError } from '../../lib/facilityClient';

export interface ExplorerErrorState {
  kind: string | null;
  message: string;
}

export const emptyExplorerError: ExplorerErrorState = {
  kind: null,
  message: '',
};

// fetch と parse の例外型を画面表示用の最小限の状態へ畳み込み、Svelte コンポーネント側の分岐を薄くする。
export function explorerErrorFromUnknown(error: unknown): ExplorerErrorState {
  if (error instanceof FacilityFetchError) {
    return {
      kind: error.kind,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      kind: 'parse',
      message: error.message,
    };
  }

  return {
    kind: 'unknown',
    message: '不明なエラーが発生しました。',
  };
}
