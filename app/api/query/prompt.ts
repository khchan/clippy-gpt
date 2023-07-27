import { RollupResult } from "@/app/types";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

const prompt = PromptTemplate.fromTemplate(`Given this table of data:
{columns}
{rows}

Assume that rollupvalues column in the table is numeric and do not expose any details about table or its structure.
Try to calculate as much as you can to return sources and numbers in your answer and keep your answer under 100 words.

Question: {question}
Answer: `);

export default async function getCompletion(query: string, rollupResult: RollupResult): Promise<string> {
    const columns = rollupResult.columns.map((column) => column.name);
    const rows = rollupResult.rows
        .map((row: Record<string, any>) => columns.map((header) => `${row[header]}`).join(","))
        .join("\n");

    const model = new ChatOpenAI({
        modelName: 'gpt-4-0613',
        temperature: 0, 
        openAIApiKey: process.env.OPEN_AI_API_KEY
    });
    const chain = new LLMChain({ llm: model, prompt });
    const result = await chain.call({
        columns: columns,
        rows: rows,
        question: query
    });

    // console.log(result);

    return result.text;
}