import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

export async function extractDimensionality(query: string, client: SupabaseClient): Promise<Set<string>> {
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY });
    // const embeddings = new OpenAIEmbeddings({
    //     azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    //     azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    //     azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    //     azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    //     azureOpenAIBasePath: process.env.AZURE_OPENAI_BASE_PATH
    // });
    
    const dimensionalityStore = await SupabaseVectorStore.fromExistingIndex(
        embeddings,
        {
            client,
            tableName: "queries",
            queryName: "match_queries",
        }
    );

    const dimensionalityResponse = await dimensionalityStore.similaritySearchWithScore(query, 1);
    const dimensions = new Set(dimensionalityResponse.flatMap(([doc, score]) => {
        console.log(`Matched query: "${doc.pageContent}" with score: ${score}`);
        return doc.metadata.dimensions as string[];
    }));

    console.log('Matched dimensions', dimensions);
    return dimensions;
}