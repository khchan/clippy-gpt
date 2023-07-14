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

    const response = await extractSimilarity(query, supabase);

    return NextResponse.json(response);
}

async function extractSimilarity(query: string, client: SupabaseClient) {
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