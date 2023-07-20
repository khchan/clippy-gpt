import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

export async function extractDimensionality(query: string, client: SupabaseClient): Promise<Set<string>> {
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY });
    const dimensionalityStore = await SupabaseVectorStore.fromExistingIndex(
        embeddings,
        {
            client,
            tableName: "queries",
            queryName: "match_queries",
        }
    );

    const dimensionalityResponse = await dimensionalityStore.similaritySearchWithScore(query);
    const dimensions = new Set(dimensionalityResponse.flatMap(([doc, score]) => {
        console.log(`Matched query: "${doc.pageContent}" with score: ${score}`);
        return doc.metadata as string[];
    }));

    console.log('Matched dimensions', dimensions);
    return dimensions;
}