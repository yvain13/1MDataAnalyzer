var AnalyzerLLMService = Class.create();
AnalyzerLLMService.prototype = {
  initialize: function() {
    this.model  = gs.getProperty('x_1119723_1mdataan.openai_model', 'gpt-4.1-nano');
    this.apiKey = gs.getProperty('x_1119723_1mdataan.openai_api_key', '');
  },

  complete: function(prompt, maxTokens) {
    if (!this.apiKey) throw new Error('OpenAI API key not configured (sys_property x_1119723_1mdataan.openai_api_key)');

    var rm = new sn_ws.RESTMessageV2();
    rm.setEndpoint('https://api.openai.com/v1/chat/completions');
    rm.setHttpMethod('POST');
    rm.setRequestHeader('Content-Type', 'application/json');
    rm.setRequestHeader('Authorization', 'Bearer ' + this.apiKey);

    rm.setRequestBody(JSON.stringify({
      model:      this.model,
      max_tokens: maxTokens || 1200,
      messages:   [{ role: 'user', content: prompt }],
    }));

    var response   = rm.execute();
    var statusCode = response.getStatusCode();
    var body       = response.getBody();

    if (statusCode !== 200) throw new Error('OpenAI error ' + statusCode + ': ' + body);

    var parsed  = JSON.parse(body);
    var content = (parsed.choices && parsed.choices[0] && parsed.choices[0].message)
      ? parsed.choices[0].message.content.trim() : '';

    return { content: content, model: this.model };
  },

  type: 'AnalyzerLLMService',
};
