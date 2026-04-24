import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'analyzer-engine-service': {
                        table: 'sys_script_include'
                        id: '7cf78401d39c490eb49cdbb5826bade9'
                    }
                    'analyzer-field-service': {
                        table: 'sys_script_include'
                        id: '69779c2affbd4637a93999cad3659245'
                    }
                    'analyzer-job-service': {
                        table: 'sys_script_include'
                        id: '3c7b1d9f5ac64f5ea1a5a21deaa1333a'
                    }
                    'analyzer-llm-service': {
                        table: 'sys_script_include'
                        id: 'af3b58b1cea34fc8befd11bd1f2e9577'
                    }
                    'analyzer-preflight-service': {
                        table: 'sys_script_include'
                        id: 'd1c9573bc7194bb3942af7ee1ef116cc'
                    }
                    'analyzer-rest-api': {
                        table: 'sys_ws_definition'
                        id: '29c751a62f07450b901de8f9a6e24388'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '9f4440ff62b148bea8e59da405338a93'
                    }
                    'br-run-analysis': {
                        table: 'sys_script'
                        id: 'f7ffa7d1b7d34254821b8152c0c26f3e'
                    }
                    'download-report-action': {
                        table: 'sys_ui_action'
                        id: 'c4ebff0a2e4e45d29d246d72e72c4b0a'
                    }
                    'openai-model-property': {
                        table: 'sys_properties'
                        id: 'd80af7ff8d4e41099ef2857d68c13d7e'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'b816dd6e69d64c1cb859eeec0b172293'
                    }
                    'rt-create': {
                        table: 'sys_ws_operation'
                        id: '054671c1af34413b8217f2f17fda924c'
                    }
                    'rt-delete': {
                        table: 'sys_ws_operation'
                        id: '7943d40d15ee4753b43c138025a371a6'
                    }
                    'rt-fields': {
                        table: 'sys_ws_operation'
                        id: 'f48cfd37f2ec46adb25dd6f4575541fe'
                    }
                    'rt-list': {
                        table: 'sys_ws_operation'
                        id: 'e338fcadc3c54630953d4df4affe5069'
                    }
                    'rt-preflight': {
                        table: 'sys_ws_operation'
                        id: '59a3ee1ea2344f8ca976a275712a0f8e'
                    }
                    'rt-results': {
                        table: 'sys_ws_operation'
                        id: '4bf24deea4ec445c8e1fcc87ff6dc361'
                    }
                    'rt-status': {
                        table: 'sys_ws_operation'
                        id: '25be531d28394ea2aef09701c41677c5'
                    }
                    'rt-tables': {
                        table: 'sys_ws_operation'
                        id: '4b9d89901739448a99115f9feb830d07'
                    }
                    'src_server_analyzer-api-handlers_js': {
                        table: 'sys_module'
                        id: '3006bc2598b940a695cdadac8f31aa64'
                    }
                    src_server_AnalyzerEngineService_js: {
                        table: 'sys_module'
                        id: 'b825164a4f994757b932849c101084d0'
                    }
                    src_server_AnalyzerFieldService_js: {
                        table: 'sys_module'
                        id: '881ae0c280524c6788b422a4feb309ba'
                    }
                    src_server_AnalyzerJobService_js: {
                        table: 'sys_module'
                        id: 'abb2a19a032c49cf994c2d620e0aedc7'
                    }
                    src_server_AnalyzerLLMService_js: {
                        table: 'sys_module'
                        id: '87c781adf4e745b3b6beb38c2f575ae6'
                    }
                    src_server_AnalyzerPreflightService_js: {
                        table: 'sys_module'
                        id: '1a93d367234d43d0a5e70a3a70eb71fc'
                    }
                    'src_server_business-rules_run-analysis_js': {
                        table: 'sys_module'
                        id: '46a961b6bcd84ca8af1c1d5367f17f9a'
                    }
                    'src_server_routes_create-analysis_js': {
                        table: 'sys_module'
                        id: 'ab22b98e7e844f94a0a7871ff2c1da85'
                    }
                    'src_server_routes_delete-analysis_js': {
                        table: 'sys_module'
                        id: 'd898d52af3ec4c3fbd9ca50350bb3672'
                    }
                    'src_server_routes_get-fields_js': {
                        table: 'sys_module'
                        id: '66874329333e42ce9ad2194ef6585ce6'
                    }
                    'src_server_routes_get-results_js': {
                        table: 'sys_module'
                        id: 'd76a2ac815094104aafe41e8be1650b8'
                    }
                    'src_server_routes_get-status_js': {
                        table: 'sys_module'
                        id: '7f50459ea4364a789c4a039e79025bfc'
                    }
                    'src_server_routes_get-tables_js': {
                        table: 'sys_module'
                        id: 'c77fd05f8dee4b89a3db5ed55a96b35b'
                    }
                    'src_server_routes_list-analyses_js': {
                        table: 'sys_module'
                        id: '4ad8ba393cfd4472a00ab0bcebc31107'
                    }
                    src_server_routes_preflight_js: {
                        table: 'sys_module'
                        id: '030df6f8ae304951a6bf616e0522257f'
                    }
                }
                composite: [
                    {
                        table: 'sys_documentation'
                        id: '0907eab7fca24bb787862f4cababe3a1'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'completed_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '0bc20532816648c19e14ab93a23c88e5'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0bcde8fa8dbc4fe584237264ad60538c'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'error_message'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '117ac1840b2a4a38b7f6fc0b9572098b'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_strategy'
                            value: 'temporal'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1180898e7cf54d088a33972438e5bab3'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                            value: 'completed'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '139e22060a6e4a36988d9086672d7160'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'category_breakdown'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '14c8f523d6ce4c968fc2f3fc25c4f4da'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_keywords'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '150fd17e289a4f2fb47884658e4dd7c5'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '17a3e312315c48a68c1e40eaf971f94e'
                        key: {
                            name: 'x_1119723_1mdataan/vendor-react-dom.js.map'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '17e5e85ba61b4eb888e8cc15570d4168'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'llm_report'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '1b246f9d748a45b1a65274ecd2eb5cc2'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1d36efa8b1ac4348adc46314d466e199'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_strategy'
                            value: 'category'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '21edda6bf9e14e1f9a885968baa55eeb'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'fields_json'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '2494a325b2b540f484588a9abb26ed7b'
                        key: {
                            endpoint: 'x_1119723_1mdataan_analyzer.do'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '24d75be9ce8147f9bacbf483fa3dbde9'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'date_from'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '27c74868092742eaaeb7f1519d6ee568'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'table_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '292995dc4ff04d8eb1c462718c01a7f8'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '328ff41eb527402880df41d62f3dd5aa'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                            value: 'failed'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '344fbb148df945d0be512c8efecc7e3a'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'subcategory_field'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '355b6aa609934e50860e0a43d0f55965'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '37dd8bcd8c3d44b489a2ff5d4223e9df'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'encoded_query'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '383f6e2262b14839bda9d08530f3faa5'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'category_field'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '385e7a973c2c47558dbd6cc430223189'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'progress_pct'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3f230a6d894c49fcad2f74a964e383f5'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'subcategory_field'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '40036eeb2cd64e4287512415cd8742ab'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'encoded_query'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '41afa892c4ac4a49a332031515921caf'
                        key: {
                            name: 'x_1119723_1mdataan/vendor-react-dom'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '45dfb96c6dd749688f31dbf4590074fd'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '482f7616e694415d9bcc0584909f1660'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'temporal_trend'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4b9784761b3f43e0a7040886b0255b75'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_keywords'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '52bcbe9fa33548cda01139b675a68122'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                            value: 'sampling'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '54495bba93fd4bc2a14cb4023043819c'
                        key: {
                            endpoint: 'x_1119723_1mdataan_report.do'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '574dfa1baf7b42e5a476af420cecf6b1'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'estimated_records'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5aeeb6f5f97c4b5a9c8e9e819536dabf'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_strategy'
                            value: 'keyword'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5c4d2a94bbec4a70b3d1557227b21c80'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'category_field'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '5d210e3f54474928890432cd0444c817'
                        key: {
                            application_file: 'a4ae37feb6424fa7a1d1e3b6a8a7e7b6'
                            source_artifact: '9fb310bfcbb142d095959b6abd401d06'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '62d2e4b78d9444979bf32f6414f64d52'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'sn_table'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '644fe5961474461aac6c0f698b1a19b4'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'cached_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '68aa113a6c6e4ad286264a75d99c63a1'
                        key: {
                            name: 'x_1119723_1mdataan/report/report-main'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '6a5c7e2ba3364045b9e0d3e5c20ad38b'
                        key: {
                            application_file: 'eac1f957232848bfb47767635ae04dd9'
                            source_artifact: '9bac022faf5749ddbdfe859b20c8640a'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6d0b2b805f4e4175ab2be1e7238799c5'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'cached_at'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6f0cc4b7779c40dcb125520736807955'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'progress_pct'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '6fd876b1f6fc4bb19b3c3097bc5f317d'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_strategy'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6fe086cf6086429db16e177a6c486b64'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                            value: 'analyzing'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '71ac8946bd5549b8a3a48a196d918f9b'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'selected_fields'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '74f7ab308ceb4e85aae8801dcacc366f'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'date_to'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '75a898550d004428ad3391e3563e1175'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'phase_label'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '75e6525da36e45c9a6bcfb6f0e4d4363'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'custom_instructions'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7eb44685d211466b951cf37a66c2b065'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'analysis'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7ff652373285451483dae1fabc3eb767'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_strategy'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '81cb8b44a8ee4ae188895137255af826'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                            value: 'queued'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '850005a6344d462d86310f91eae67f7d'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '88cd79589ef947a88574216ce0423684'
                        key: {
                            application_file: '2494a325b2b540f484588a9abb26ed7b'
                            source_artifact: '9fb310bfcbb142d095959b6abd401d06'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '88f994c574944a37bdcb8748a93cd450'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '89dd658160b94993a5ba750937b44d39'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'estimated_records'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '8c9cf2d8d8954441b76411951b7632da'
                        key: {
                            endpoint: 'x_1119723_1mdataan_incident_manager.do'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '8cf73e76730644df866fa1adb7d329a8'
                        key: {
                            application_file: '8c9cf2d8d8954441b76411951b7632da'
                            source_artifact: 'a0e276dbf7814c6993c217c4d2ce533f'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8fefdc4b0df341ae821d00096660295a'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'selected_fields'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '951629be58c54f4e88e857372a2e8387'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '959bbf06f4fb4e8f9b464254634d05bb'
                        key: {
                            application_file: '68aa113a6c6e4ad286264a75d99c63a1'
                            source_artifact: '9bac022faf5749ddbdfe859b20c8640a'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9637aa2fd4b246ccae3dffc8737da2d9'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'custom_instructions'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '96fc5379bea04743bd576e6af18c7f08'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'table_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '9bac022faf5749ddbdfe859b20c8640a'
                        key: {
                            name: 'x_1119723_1mdataan_report.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9cd1548c50c64b63bcba263d21352ec4'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'phase_label'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '9fb310bfcbb142d095959b6abd401d06'
                        key: {
                            name: 'x_1119723_1mdataan_analyzer.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'a0e276dbf7814c6993c217c4d2ce533f'
                        key: {
                            name: 'x_1119723_1mdataan_incident_manager.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'a4ae37feb6424fa7a1d1e3b6a8a7e7b6'
                        key: {
                            name: 'x_1119723_1mdataan/main'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'a6e9f548ffe44effa1b0e2ccb2dd8dfc'
                        key: {
                            name: 'x_1119723_1mdataan/main.js.map'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a7f7cce09dcc42f5a54f7a0cbb6f4711'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'category_breakdown'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b44925559a504a31a6fe9c33778e6421'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sample_size'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b4e3d983605b43c5b1e400c3fe2ff44f'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'llm_report'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b8c27cd9d80a40b28bf72aea99aa9931'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'error_message'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'b8f715f7513f4392ab09c0c72c4a03f6'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'bb01d29bf4f84e80a2ddb828ed574f66'
                        key: {
                            application_file: 'a6e9f548ffe44effa1b0e2ccb2dd8dfc'
                            source_artifact: '9fb310bfcbb142d095959b6abd401d06'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c36ac4e4a4a7467d9db9aa049680f8c2'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'sn_table'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c6ec5ab46fc840dba3f847072b7f93ae'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'ce58038fb7514cebb14223b5652bb96c'
                        key: {
                            application_file: 'a4ae37feb6424fa7a1d1e3b6a8a7e7b6'
                            source_artifact: 'a0e276dbf7814c6993c217c4d2ce533f'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cf036fed573a40acae7151613b7c0a63'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'analysis'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd4cbd0c404b14b23b714a7227f1a7ace'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                            element: 'fields_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd4e8b560be524f6d91fa501484cb1ae2'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'completed_at'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'd505093c6e3c4b20bbc60cd82bd907da'
                        key: {
                            application_file: '54495bba93fd4bc2a14cb4023043819c'
                            source_artifact: '9bac022faf5749ddbdfe859b20c8640a'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5574f9e69df413b95328b97e6910191'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'date_to'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd62ed5d103264ef5831bf57a610dcbea'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sample_size'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'de2adbbaf783438d8640a3eaea929756'
                        key: {
                            application_file: 'a6e9f548ffe44effa1b0e2ccb2dd8dfc'
                            source_artifact: 'a0e276dbf7814c6993c217c4d2ce533f'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e0634f096dd94d7db105dd1c6d8cc83c'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'date_from'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e139d7628c90409db73af9f3a19de027'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'e3bf39fc664b435eb9b1fd030b27cb5a'
                        key: {
                            name: 'x_1119723_1mdataan_field_cache'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e8394bc7c8a944669775ef923e44ae01'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'processed_records'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'eac1f957232848bfb47767635ae04dd9'
                        key: {
                            name: 'x_1119723_1mdataan/report/report-main.js.map'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'eed1737d14db49df92428ec38c2386d2'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f03d4e5f33544c24b7a994ca1980a36a'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                            element: 'temporal_trend'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f24c2444a8db4a7ab10efbf15377f2bb'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_strategy'
                            value: 'cluster'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f873593d0fc0413e9f28952619951029'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'processed_records'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'fb0f29a21fc3405ca2330840b51ce403'
                        key: {
                            name: 'x_1119723_1mdataan_analysis'
                            element: 'sampling_strategy'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'ff5ad8f653824931a8f88636376dbc18'
                        key: {
                            name: 'x_1119723_1mdataan_result'
                        }
                    },
                ]
            }
        }
    }
}
