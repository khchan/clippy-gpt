import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

export async function extractSimilarity(query: string, client: SupabaseClient) {
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY });
    const dimensionalityStore = await SupabaseVectorStore.fromExistingIndex(
        embeddings,
        {
            client,
            tableName: "queries",
            queryName: "match_queries",
        }
    );

    const memberStore = await SupabaseVectorStore.fromExistingIndex(
        embeddings,
        {
            client,
            tableName: "member_lvl_dim",
            queryName: "match_members",
        }
    );

    const dimensionalityResponse = await dimensionalityStore.similaritySearchWithScore(query);
    const dimensionality = dimensionalityResponse.map((r) => {
        const [document, score] = r;
        return {...document, score};
    });

    const memberResponse = await memberStore.similaritySearchWithScore(query);
    const members = memberResponse.map((r) => {
        const [document, score] = r;
        return {...document, score};
    });

    return {dimensionality, members};
}