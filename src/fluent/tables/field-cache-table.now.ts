import '@servicenow/sdk/global'
import { Table, StringColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const x_1119723_1mdataan_field_cache = Table({
  name: 'x_1119723_1mdataan_field_cache',
  label: 'Field Cache',
  schema: {
    sn_table:    StringColumn({ label: 'Table Name', maxLength: 80, mandatory: true }),
    fields_json: StringColumn({ label: 'Fields JSON', maxLength: 8000 }),
    cached_at:   DateTimeColumn({ label: 'Cached At' }),
  },
})
