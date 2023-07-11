const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');
const { tsv2json } = require ('tsv-json');
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

  // Clear the old values
  await supabaseClient
    .from('queries')
    .delete()
    .not('id', 'is', null);

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
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabaseClient
    .storage
    .from('resources')
    .download('queries.tsv');

  const tsvText = await data.text();

  const json = tsv2json(tsvText);
  const formatted = json.map(item => {
    return { 
      query: item[0],
      metadata: item[1].split(', ')
    };
  });

  return formatted;
}

generateEmbeddings();