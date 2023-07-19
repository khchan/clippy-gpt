import { ModelContext } from "@/app/types";
import { createExtractionChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { FunctionParameters } from "langchain/output_parsers";

export async function extractEntities(query: string, context: ModelContext) {
    const dimensions = Object.keys(context.dimensionality);

    const chatModel = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-0613",
        temperature: 0,
        openAIApiKey: process.env.OPEN_AI_API_KEY
    });

    const schema: FunctionParameters = {
        type: "object",
        properties: dimensions.reduce((acc, dim) => {
            acc[dim] = {
                type: "string",
                description: `Refers to the ${dim} dimension in an OLAP cube or financial data model.`
            }
            return acc;
        }, {} as Record<string, { type: string, description: string }>),
        required: dimensions
    };

    const chain = createExtractionChain(schema, chatModel);

    try {
        return await chain.run(query);
    } catch (err) {
        console.error(err);
        return [];
    }
}