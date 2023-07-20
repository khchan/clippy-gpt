import { MemberMetadata, ModelContext } from '@/app/types';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

export async function extractMemberDimensionality(query: string, dimensions: Set<string>, client: SupabaseClient): Promise<ModelContext> {
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY });

    const memberStore = await SupabaseVectorStore.fromExistingIndex(
        embeddings,
        {
            client,
            tableName: "member_lvl_dim",
            queryName: "member_lvl_match_queries",
        }
    );

    const memberResponse = await memberStore.similaritySearchWithScore(query);
    const members = memberResponse
        .map(([document, score]) => {
            console.log(`Matched member: "${document.pageContent}" with score: ${score}`);
            return { ...document, score };
        })
        .filter(({ metadata }) => dimensions.has(metadata.dimension))
        .reduce((acc, next) => {
            const metadata = next.metadata as MemberMetadata;
            (acc[metadata.dimension] = acc[metadata.dimension] || []).push(metadata);
            return acc;
        }, {} as Record<string, MemberMetadata[]>);

    const context = Array.from(dimensions).reduce((acc, dim) => {
        acc[dim] = members[dim] || [];
        return acc;
    }, {} as Record<string, MemberMetadata[]>);

    return new ModelContext(context);
}