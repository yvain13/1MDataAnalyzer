response.setContentType('application/json');
response.setBody([
  { name: 'incident',                  label: 'Incidents',              description: 'IT service incidents and outages' },
  { name: 'change_request',            label: 'Change Requests',        description: 'Planned changes and releases' },
  { name: 'sn_customerservice_case',   label: 'Customer Service Cases', description: 'External customer support cases' },
  { name: 'sc_req_item',               label: 'Service Requests',       description: 'Service catalog requests' },
  { name: 'problem',                   label: 'Problems',               description: 'Root cause investigations' },
  { name: 'task',                      label: 'Tasks',                  description: 'General task records' },
]);
