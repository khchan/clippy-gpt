import fs from "fs";
import { RollupResult } from "@/app/types";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

const prompt = PromptTemplate.fromTemplate(`
Table data is found at {dataPath}.
Column names are {columns}.
account contains Revenue.

Given the table data, generate valid Python code that plots a graph and saves it to an image called output.png using matplotlib for the given query.
Return only the code as plaintext (no markdown or code formatting).  Also do not explain your reasoniong.

Question: {question}
Answer: `);

export default async function getGraphPythonScript(query: string, rollupResult: RollupResult): Promise<string> {
    const columns = rollupResult.columns.map((column) => column.name);
    const rows = rollupResult.rows
        .map((row: Record<string, any>) => columns.map((header) => `${row[header]}`).join(","))
        .join("\n");

    const data = `${columns}\n${rows}`;

    const dataPath = "/tmp/data.csv";
    fs.writeFile(dataPath, data, function(err) {
        if(err) {
            // too bad for us
        }
    });

    const model = new ChatOpenAI({
        modelName: 'gpt-4-0613',
        temperature: 0, 
        openAIApiKey: process.env.OPEN_AI_API_KEY
    });
    const chain = new LLMChain({ llm: model, prompt });
    const result = await chain.call({
        dataPath,
        columns: columns,
        question: query
    });

    // console.log(result);
    const scriptPath = "/tmp/generate-graph.py";
    fs.writeFile(scriptPath, result.text, function(err) {
        if(err) {
            // too bad for us
        }
    });

    return scriptPath;
}