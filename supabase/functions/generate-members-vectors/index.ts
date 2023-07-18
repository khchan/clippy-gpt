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
    .download('hierarchies.csv');

  if (!data || error) {
    throw new Error(`Data was empty or error occurred: ${error}`);
  }

  const documents = await parseBlobToDocuments(data);

  await SupabaseVectorStore.fromDocuments(documents, embeddings, {
    client,
    tableName: "member_lvl_dim",
    queryName: "member_lvl_match_queries",
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
    .from('member_lvl_dim')
    .delete()
    .not('id', 'is', null);
}

async function parseBlobToDocuments(blob: Blob) {
  // Convert the blob to a Deno stream
  const stream = readerFromStreamReader(blob.stream().getReader());

  // Create Sets to store all members and parents
  const members = new Set();
  const parents = new Set();

  // Create a Map to keep track of levels
  const levels = new Map();
  const aliases = new Map();

  // Use the readLines utility from the standard library to read the CSV data as lines
  for await (const { Dimension: dimension, Member: member, Alias: memberAlias, Parent: parent } of readCSVObjects(stream)) {
    // Add the member and parent to the respective Sets
    members.add(member);
    parents.add(parent);

    const alias =
      memberAlias !== "" && memberAlias !== member
        ? `${memberAlias} (${member})`
        : member;
    aliases.set(member, { alias, dimension });

    // Determine the level of the member based on its parent
    // If the parent doesn't exist or it's an empty string, this is a level 1 (root) member
    if (!parent || parent === "") {
      levels.set(member, 1);
    } else {
      // The member's level is one more than its parent's level
      const parentLevel = levels.get(parent);
      levels.set(member, parentLevel + 1);
    }
  }

  const documents = [];
  for (const [member, { alias, dimension }] of aliases) {
    documents.push(new Document({ pageContent: alias, metadata: { level: levels.get(member), member, dimension } }));
  }

  return documents;
}