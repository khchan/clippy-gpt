const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');
const { tsv2json } = require ('tsv-json');
const fs = require('fs');
const fsPromises = fs.promises;
const df = require('dotenv-flow');
df.config();

async function generateEmbeddings() {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const openaiConfiguration = new Configuration({
    organization: process.env.OPEN_AI_ORG,
    apiKey: process.env.OPEN_AI_API_KEY
  });
  const openai = new OpenAIApi(openaiConfiguration);

  const queryData = await getQueryData();

  for (const qd of queryData) {
    console.log("create embedding: \"" + qd.query + "\"");
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: qd.query,
    })

    const [{ embedding }] = embeddingResponse.data.data
    await supabaseClient.from('queries').insert({
      content: qd.query,
      metadata: qd.metadata,
      embedding,
    })
  }
}

async function getQueryData() {
  const filehandle = await fsPromises.open('scripts\\queries.tsv');
  const data = await filehandle.readFile('utf-8');

  const json = tsv2json(data);
  const formatted = json.map(item => {
    return { 
      query: item[0],
      metadata: item[1].split(', ')
    };
  });

  filehandle.close();
  return formatted;
}

generateEmbeddings();