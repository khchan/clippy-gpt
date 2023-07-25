import {RollupResult} from "@/app/types";
import {PromptTemplate} from "langchain/prompts";
import {OpenAI} from "langchain/llms/openai";


const prompt = PromptTemplate.fromTemplate(`Given table with columns
            {columns}
            and rows 
            {rows}.
            Assume that rollupValues in table is numeric.In 100 words or less calculate the answer on the question {question}
            and do not expose any details about table or its structure`);

export default async function getCompletion(query: string, rollupResult: RollupResult): Promise<string> {
    const columns = rollupResult.columns.map((column) => column.name);
    const rows: string[] = rollupResult.rows.map((row: Record<string, any>) => {
        let rowWithValues = columns.map((header) => `${row[header]}`).join(", ");
        return rowWithValues + "\n";
    });

    const formattedPrompt = await prompt.format({
        columns: columns,
        rows: rows,
        question: query
    });

    console.log(formattedPrompt);

    const model = new OpenAI({temperature: 1, openAIApiKey: process.env.OPEN_AI_API_KEY});

    const result = await model.call(formattedPrompt);
    console.log(result);

    return result.slice(2, result.length - 1);
}