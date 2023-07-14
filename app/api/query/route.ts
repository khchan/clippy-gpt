import { SupabaseClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { NextRequest, NextResponse } from 'next/server'

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const { query } = await request.json();
    
    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const response = await extractDimensionality(query, supabase);

    return NextResponse.json(response);
}

async function extractDimensionality(query: string, client: SupabaseClient) {
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY }),
        {
            client,
            tableName: "queries",
            queryName: "match_queries",
        }
    );

    const response = await vectorStore.similaritySearchWithScore(query, 1);
    return response.map((r) => {
        const [document, score] = r;
        return {...document, score};
    });
}