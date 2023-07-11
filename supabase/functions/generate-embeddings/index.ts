import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { OpenAI } from "https://deno.land/x/openai/mod.ts";
import { tsv2json } from 'https://esm.sh/tsv-json';

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  const openAI = new OpenAI(Deno.env.get('OPEN_AI_API_KEY'));

  // Clear the old values
  await clearQueriesTable(supabaseClient);
  // Get the new values
  const queryData = await getQueryData(supabaseClient);

  for (const data of queryData) {
    console.log("create embedding: \"" + data.query + "\"");
    const embedding = await getOpenAIEmbedding(openAI, data.query);

    // Add the new record
    await supabaseClient.from('queries').insert({
      content: data.query,
      metadata: data.metadata,
      embedding
    });
  }

  console.log("Done.");
  return new Response(
    "Added " + queryData.length + " embeddings.",
    { headers: { "Content-Type": "application/json" } },
  )
});

async function clearQueriesTable(supabaseClient) {
  // Need a filter when deleting records, so I have a filter
  // that just returns everything (id is not null)
  await supabaseClient
    .from('queries')
    .delete()
    .not('id', 'is', null);
}

async function getQueryData(supabaseClient) {
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

async function getOpenAIEmbedding(openAI, input) {
  const embeddingsResponse = await openAI.createEmbeddings({
    model: 'text-embedding-ada-002',
    input
  });

  return embeddingsResponse.data[0].embedding;
}