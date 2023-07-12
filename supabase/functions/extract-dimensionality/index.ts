import { serve } from "https://deno.land/std@0.193.0/http/server.ts";
import { OpenAIEmbeddings } from "https://esm.sh/langchain/embeddings/openai";
import { SupabaseVectorStore } from "https://esm.sh/langchain/vectorstores/supabase";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const { query } = await req.json()
  const client = await createClient(
    Deno.env.get('SUPABASE_URL'), 
    Deno.env.get('SUPABASE_ANON_KEY'),
    {
      auth: {
        persistSession: false
      }
    }
  );

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: Deno.env.get('OPEN_AI_API_KEY') }),
    {
      client,
      tableName: "queries",
      queryName: "match_queries",
    }
  );

  const response = await vectorStore.similaritySearch(query, 1);
  
  return new Response(
    JSON.stringify(response),
    { headers: { "Content-Type": "application/json" } },
  )
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
