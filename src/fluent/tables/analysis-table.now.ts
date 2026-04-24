import '@servicenow/sdk/global'
import { Table, StringColumn, IntegerColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const x_1119723_1mdataan_analysis = Table({
  name: 'x_1119723_1mdataan_analysis',
  label: 'Data Analysis',
  schema: {
    table_name:          StringColumn({ label: 'Table Name', maxLength: 80, mandatory: true }),
    date_from:           StringColumn({ label: 'Date From', maxLength: 20, mandatory: true }),
    date_to:             StringColumn({ label: 'Date To', maxLength: 20, mandatory: true }),
    status:              StringColumn({
      label: 'Status', maxLength: 20,
      choices: { queued: 'Queued', sampling: 'Sampling', analyzing: 'Analyzing', completed: 'Completed', failed: 'Failed' },
    }),
    progress_pct:        IntegerColumn({ label: 'Progress %' }),
    phase_label:         StringColumn({ label: 'Phase', maxLength: 200 }),
    estimated_records:   IntegerColumn({ label: 'Estimated Records' }),
    processed_records:   IntegerColumn({ label: 'Processed Records' }),
    sampling_strategy:   StringColumn({
      label: 'Sampling Strategy', maxLength: 20,
      choices: { temporal: 'Temporal', category: 'Category', cluster: 'Cluster', keyword: 'Keyword' },
    }),
    selected_fields:     StringColumn({ label: 'Selected Fields (JSON)', maxLength: 2000 }),
    category_field:      StringColumn({ label: 'Category Field', maxLength: 80 }),
    subcategory_field:   StringColumn({ label: 'Subcategory Field', maxLength: 80 }),
    encoded_query:       StringColumn({ label: 'Encoded Query', maxLength: 2000 }),
    custom_instructions: StringColumn({ label: 'Custom Instructions', maxLength: 2000 }),
    sample_size:         IntegerColumn({ label: 'Sample Size' }),
    sampling_keywords:   StringColumn({ label: 'Sampling Keywords', maxLength: 1000 }),
    error_message:       StringColumn({ label: 'Error Message', maxLength: 1000 }),
    completed_at:        DateTimeColumn({ label: 'Completed At' }),
  },
})
