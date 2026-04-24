import type { ApiResult } from '../types/common';
import { API_BASE_URL } from '../constants/api';

export interface HumanRow {
  id: number;
  [key: string]: string | number | null;
}

export interface HumanColumn {
  column: string;
  label: string;
  entity: string;
}

export interface HumanListResponse {
  rows: HumanRow[];
  columns: HumanColumn[];
  aliasMap: Record<string, string>;
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

function parseAliasMap(term: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!term) return map;
  const regex = /(\w+)\s+as\s+(t\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(term)) !== null) {
    map[m[1].toLowerCase()] = m[2];
  }
  return map;
}

export function dataKeyFor(col: HumanColumn, aliasMap: Record<string, string>): string {
  const alias = aliasMap[col.entity] ?? 't1';
  return `${alias}${col.column}`;
}

export async function fetchHumanList(
  page = 1,
  limit = 10,
): Promise<ApiResult<HumanListResponse>> {
  const url = `${API_BASE_URL}/t-data/humanmap.json?page=${page}&limit=${limit}`;
  console.log('[humanApi] GET', url);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    console.log('[humanApi] status', res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.log('[humanApi] error body', text);
      return { ok: false, message: `Request failed (${res.status})` };
    }

    const json = await res.json();
    console.log('[humanApi] response keys', Object.keys(json));
    console.log('[humanApi] rows count', (json.data ?? []).length);

    return {
      ok: true,
      data: {
        rows: json.data ?? [],
        columns: json.columns ?? [],
        aliasMap: parseAliasMap(json.term ?? ''),
        total: json.total ?? 0,
        page: json.page ?? page,
        limit: json.limit ?? limit,
        last_page: json.last_page ?? 1,
      },
    };
  } catch (err) {
    console.log('[humanApi] fetch failed for', url, err);
    return {
      ok: false,
      message: `Unable to connect to ${API_BASE_URL}. Check network / API URL.`,
    };
  }
}
