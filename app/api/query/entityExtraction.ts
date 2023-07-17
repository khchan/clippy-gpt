import { z } from "zod";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { createExtractionChainFromZod } from "langchain/chains";

export async function extractEntities(query: string) {

    const zodSchema = z.object({
        "temporal-property": z.string().optional(),
        "financial-concept": z.string().optional(),
        "analysis-type": z.string().optional()
    });

    const chatModel = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-0613",
        temperature: 0,
    });

    const chain = createExtractionChainFromZod(zodSchema, chatModel);

    try {
        return await chain.run(query);
    } catch (err) {
        console.error(err);
        return [];
    }
}