import { EntityExtractResult, MemberMetadata, ModelContext } from "@/app/types";
import { createExtractionChain } from "langchain/chains";
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { ChatOpenAI } from "langchain/chat_models/openai";
import { FunctionParameters } from "langchain/output_parsers";
import { extractMemberDimensionality } from "./memberSimilarity";
import { TABLE_PER_DIM } from "./constants";

export async function extractEntities(query: string, dimensions: Set<string>, client: SupabaseClient): Promise<ModelContext> {
    const chatModel = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-0613",
        temperature: 0,
        openAIApiKey: process.env.OPEN_AI_API_KEY
    });

    const dimensionsArray = Array.from(dimensions);
    const schema: FunctionParameters = {
        type: "object",
        properties: dimensionsArray.reduce((acc, dim) => {
            acc[dim] = {
                type: "string",
                description: TABLE_PER_DIM[dim].description
            }
            return acc;
        }, {} as Record<string, { type: string, description: string }>),
        required: dimensionsArray
    };

    const chain = createExtractionChain(schema, chatModel);

    try {
        const result = await chain.run(query) as unknown as Record<string, string>[];
        console.log('Extracted entities', result);

        const grouped = result.reduce((acc, next) => {
            Object.keys(next).forEach(key => {
                if (!acc[key]) {
                    acc[key] = [];
                }

                if (!acc[key].includes(next[key])) {
                    acc[key].push(next[key]);
                }
            });
            return acc;
        }, {} as EntityExtractResult);

        const output = new ModelContext();
        const promises = [];
        for (const key in grouped) {
            for (const value of grouped[key]) {
                promises.push(extractMemberDimensionality(value, dimensions, client));
            }
        }

        for (const ctx of await Promise.all(promises)) {
            output.merge(ctx);
        }

        return output;
    } catch (err) {
        console.error(err);
        return new ModelContext();
    }
}