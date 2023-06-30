import { OpenAIApi, Configuration } from 'openai'

let configuration = new Configuration({
    apiKey: "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",
});
delete configuration.baseOptions.headers['User-Agent'];
const openai = new OpenAIApi(configuration);

export async function getCompletions(text, role) {
    let conversations = [{role: "system", content: role}];
    
    conversations.push({
        role: "user",
        content: text
    });

    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversations,
        temperature: 1.2,
        presence_penalty: 0.5,
        max_tokens: 100,
      });
      
    const reply = response.data.choices[0].message.content;
    return reply;
}
  