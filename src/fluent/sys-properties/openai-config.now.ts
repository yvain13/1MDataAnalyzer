import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

Record({
  $id: Now.ID['openai-model-property'],
  table: 'sys_properties',
  data: {
    name:        'x_1119723_1mdataan.openai_model',
    value:       'gpt-4.1-nano',
    description: '1MDataAnalyzer: OpenAI model used for analysis',
    type:        'string',
    private:     false,
  },
})
