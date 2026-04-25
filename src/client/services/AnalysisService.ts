import { apiFetch } from '../utils/api'

export interface AnalysisParams {
  table_name: string
  date_from: string
  date_to: string
  selected_fields: string[]
  sampling_strategy: string
  category_field?: string
  subcategory_field?: string
  encoded_query?: string
  custom_instructions?: string
  sample_size?: number
  sampling_keywords?: string[]
}

export interface Analysis {
  sys_id: string
  table_name: string
  date_from: string
  date_to: string
  status: string
  progress_pct: number
  phase_label: string
  estimated_records: number
  processed_records: number
  error_message: string
  completed_at: string
  created_at: string
}

export interface AnalysisResult {
  analysis: Analysis
  llm_report: string
  category_breakdown: Array<{ display: string; count: number; pct: number }>
  temporal_trend: Array<{ period: string; count: number }>
}

export const AnalysisService = {
  getTables: () =>
    apiFetch<Array<{ name: string; label: string; description: string }>>('/tables'),

  getFields: (table: string) =>
    apiFetch<{ fields: any[]; grouped: Record<string, any[]> }>(`/tables/${table}/fields`),

  preflight: (params: Partial<AnalysisParams> & { table_name: string; date_from: string; date_to: string }) =>
    apiFetch<{ totalCount: number; sampleRecords: any[] }>('/analyses/preflight', {
      method: 'POST', body: JSON.stringify(params),
    }),

  create: (params: AnalysisParams) =>
    apiFetch<Analysis>('/analyses', { method: 'POST', body: JSON.stringify(params) }),

  list: () => apiFetch<Analysis[]>('/analyses'),

  getStatus: (id: string) => apiFetch<Analysis>(`/analyses/${id}/status`),

  getResults: (id: string) => apiFetch<AnalysisResult>(`/analyses/${id}/results`),

  delete: (id: string) => apiFetch<{ ok: boolean }>(`/analyses/${id}`, { method: 'DELETE' }),
}
