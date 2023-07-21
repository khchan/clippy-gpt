import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js';
import { Document } from "https://esm.sh/langchain/document";
import { OpenAIEmbeddings } from "https://esm.sh/langchain/embeddings/openai";
import { SupabaseVectorStore } from "https://esm.sh/langchain/vectorstores/supabase";
import { readerFromStreamReader } from "https://deno.land/std@0.160.0/streams/conversion.ts";
import { readCSVObjects } from "https://deno.land/x/csv@v0.8.0/mod.ts";

serve(async (_req) => {
  const client = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: Deno.env.get('OPEN_AI_API_KEY'),
  });

  // Clear the old values
  await clearQueriesTable(client);

  const { data, error } = await client
    .storage
    .from('resources')
    .download('queries.csv');

  if (!data || error) {
    throw new Error(`Data was empty or error occurred: ${error}`);
  }

  // Convert the blob to a Deno stream
  const stream = readerFromStreamReader(data.stream().getReader());

  const documents = [];
  for await (const { query, dimensions } of readCSVObjects(stream)) {
    documents.push(new Document({ pageContent: query, metadata: { dimensions: dimensions.split(",") } }));
  }

  await SupabaseVectorStore.fromDocuments(documents, embeddings, {
    client,
    tableName: "queries",
    queryName: "match_queries",
  });

  return new Response(
    "Added " + documents.length + " embeddings.",
    { headers: { "Content-Type": "application/json" } },
  )
});

async function clearQueriesTable(supabaseClient: SupabaseClient) {
  // Need a filter when deleting records, so I have a filter
  // that just returns everything (id is not null)
  await supabaseClient
    .from('queries')
    .delete()
    .not('id', 'is', null);
}