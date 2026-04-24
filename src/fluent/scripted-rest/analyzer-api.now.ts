import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'

RestApi({
  $id: Now.ID['analyzer-rest-api'],
  name: 'Analyzer API',
  serviceId: 'analyzer',
  active: true,
  consumes: 'application/json',
  produces: 'application/json',
  routes: [
    { $id: Now.ID['rt-tables'],   name: 'Get Tables',      path: '/tables',                method: 'GET',    active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/get-tables.js') },
    { $id: Now.ID['rt-fields'],   name: 'Get Fields',      path: '/tables/{table}/fields', method: 'GET',    active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/get-fields.js') },
    { $id: Now.ID['rt-preflight'],name: 'Preflight',       path: '/analyses/preflight',    method: 'POST',   active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/preflight.js') },
    { $id: Now.ID['rt-create'],   name: 'Create Analysis', path: '/analyses',              method: 'POST',   active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/create-analysis.js') },
    { $id: Now.ID['rt-list'],     name: 'List Analyses',   path: '/analyses',              method: 'GET',    active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/list-analyses.js') },
    { $id: Now.ID['rt-status'],   name: 'Get Status',      path: '/analyses/{id}/status',  method: 'GET',    active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/get-status.js') },
    { $id: Now.ID['rt-results'],  name: 'Get Results',     path: '/analyses/{id}/results', method: 'GET',    active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/get-results.js') },
    { $id: Now.ID['rt-delete'],   name: 'Delete Analysis', path: '/analyses/{id}',         method: 'DELETE', active: true, authentication: true, authorization: false, script: Now.include('../../server/routes/delete-analysis.js') },
  ],
})
