// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

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

  const queryData = await getQueryData(supabaseClient);

  // Clear the old values
  await supabaseClient
    .from('queries')
    .delete()
    .not('id', 'is', null);

  for (const qd of queryData) {
    console.log("create embedding: \"" + qd.query + "\"");

    const embeddingsResponse = await openAI.createEmbeddings({
      model: 'text-embedding-ada-002',
      input: qd.query,
    })

    await supabaseClient.from('queries').insert({
      content: qd.query,
      metadata: qd.metadata,
      embedding: embeddingsResponse.data[0].embedding
    });
  }

  return new Response(
    "Added " + queryData.length + " embeddings.",
    { headers: { "Content-Type": "application/json" } },
  )
});

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