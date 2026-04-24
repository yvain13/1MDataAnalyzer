import '@servicenow/sdk/global'
import { Table, StringColumn } from '@servicenow/sdk/core'

export const x_1119723_1mdataan_result = Table({
  name: 'x_1119723_1mdataan_result',
  label: 'Analysis Result',
  schema: {
    analysis:           StringColumn({ label: 'Analysis Sys ID', maxLength: 32 }),
    llm_report:         StringColumn({ label: 'LLM Report (HTML)', maxLength: 65536 }),
    category_breakdown: StringColumn({ label: 'Category Breakdown (JSON)', maxLength: 4000 }),
    temporal_trend:     StringColumn({ label: 'Temporal Trend (JSON)', maxLength: 2000 }),
  },
})
