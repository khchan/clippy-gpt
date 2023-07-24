import {RollupResult} from "@/app/types";
import {PromptTemplate} from "langchain/prompts";
import {OpenAI} from "langchain/llms/openai";


const prompt = PromptTemplate.fromTemplate(`Given MySQL table A with columns
            {columns}
            and rows 
            {rows}.
            Assume that Value in table A is numeric.In 100 words or less calculate the answer on the question {question}
            and do not expose any details about table or its structure'`);

export default async function getCompletion(query: string, rollupResult: RollupResult): Promise<string> {
    const columns = rollupResult.columns.map((column) => column.name);
    const rows: string[] = rollupResult.rows.map((row: Record<string, any>) => {
        return columns.slice(0, -1).map((header) => `${row[header]}`).join(",") + "\n";
    });

    const formattedPrompt = await prompt.format({
        columns: columns,
        rows: rows,
        question: query
    });

    const model = new OpenAI({temperature: 1, openAIApiKey: process.env.OPEN_AI_API_KEY});

    const result = await model.call(
        formattedPrompt);
    console.log(result);

    return result;
}