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

  // Parse FROM and JOIN clauses to extract entity -> alias mappings
  // Pattern: FROM <entity> as <alias> or JOIN <entity> as <alias>
  const entityAliasRegex = /(?:FROM|JOIN)\s+(\w+)\s+as\s+(\w+)/gi;
  let match: RegExpExecArray | null;

  while ((match = entityAliasRegex.exec(term)) !== null) {
    const entity = match[1].toLowerCase();
    const alias = match[2].toLowerCase();
    map[entity] = alias;
    console.log(`[parseAliasMap] ${entity} → ${alias}`);
  }

  return map;
}

export function dataKeyFor(col: HumanColumn, aliasMap: Record<string, string>): string {
  // Map the entity name to its table alias using the FROM/JOIN mapping
  const entityLower = col.entity?.toLowerCase() ?? '';
  const alias = aliasMap[entityLower] || 't1'; // Default to t1 if not found
  const key = `${alias}${col.column}`;
  return key;
}

// export async function fetchHumanList() {
//   const url = 'http://127.0.0.1:8000/api/t-data/humanmap.json?page=1&limit=10';

//   try {
//     console.log('[humanApi] Calling fetch...');
//     const res = await fetch(url, {
//       method: 'GET',
//       headers: { Accept: 'application/json' },
//     }).catch(err => {
//       console.log(err);
//     });
//     console.log('[humanApi] Fetch returned');
//     console.log(res);
//   } catch (err:any) {
//       console.log(err);
//   }
// }

export async function fetchHumanList(
  page = 1,
  limit = 10,
): Promise<ApiResult<HumanListResponse>> {
  const url = `${API_BASE_URL}/api/t-data/humanmap.json?page=${page}&limit=${limit}`;

  try {
    console.log('[humanApi] Calling fetch...');
    console.log('xzxxxxxxxxx');
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    console.log('[humanApi] Fetch returned');



    const json = await res.json();


    // Check if response has required fields
    if (!json.data || !Array.isArray(json.data)) {

      return { ok: false, message: 'Invalid API response: missing data array' };
    }

    if (!json.columns || !Array.isArray(json.columns)) {

      return { ok: false, message: 'Invalid API response: missing columns array' };
    }

    const aliasMap = parseAliasMap(json.term ?? '');

    const columns: HumanColumn[] = (json.columns ?? []).filter(
      (c: any) => c && c.column && c.label
    ); 

    columns.forEach((c, idx) => {
      const key = dataKeyFor(c, aliasMap);
      console.log(
        `[humanApi] col[${idx}] "${c.label}" (entity: "${c.entity}" | column: "${c.column}") → key: "${key}"`
      );
    });

    // Verify first row has expected keys
    const firstRow = json.data?.[0];
    if (firstRow) { 
      columns.forEach(c => {
        const key = dataKeyFor(c, aliasMap);
        const value = firstRow[key]; 
      });
    } 

    return {
      ok: true,
      data: {
        rows: json.data ?? [],
        columns: columns,
        aliasMap: aliasMap,
        total: json.total ?? 0,
        page: json.page ?? page,
        limit: json.limit ?? limit,
        last_page: json.last_page ?? 1,
      },
    };
  } catch (err: any) {
    const errorMsg = err?.message ?? String(err);
    console.error('[humanApi] FETCH ERROR:', errorMsg);
    return {
      ok: false,
      message: `API Error: ${errorMsg}. Make sure: 1) Server is running, 2) Phone and PC are on same Wi-Fi, 3) API_BASE_URL in src/constants/api.ts is correct`,
    };
  }
}
