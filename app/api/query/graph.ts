import fs from "fs";
import { RollupResult } from "@/app/types";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

const prompt = PromptTemplate.fromTemplate(`
Table data is found at {dataPath}.
Column names are {columns}.
{valuesText}
Given the table data, generate valid Python code that plots a graph and saves it to an image called output.png using matplotlib for the given query.
Return only the code as plaintext (no markdown or code formatting).  Also do not explain your reasoniong.

Question: {question}
Answer: `);

function onlyUnique(value: object, index: number, array: object[]) {
    return array.indexOf(value) === index;
  }

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

    let valuesText = "";
    rollupResult.columns.filter((column) => column.name != "rollupvalue")
        .map((column) => column.name)
        .forEach(columnName => {
            const uniqueValues = rollupResult.rows
                .map((row: Record<string, any>) => row[columnName])
                .filter(onlyUnique)

            valuesText += `${columnName} contains ${uniqueValues.join(",")}\n`;
        });

    const model = new ChatOpenAI({
        modelName: 'gpt-4-0613',
        temperature: 0, 
        openAIApiKey: process.env.OPEN_AI_API_KEY
    });
    const chain = new LLMChain({ llm: model, prompt });
    const result = await chain.call({
        dataPath,
        valuesText,
        columns: columns,
        question: query
    });

    // console.log(await prompt.format({
    //     dataPath,
    //     valuesText,
    //     columns: columns,
    //     question: query
    // }));

    const scriptPath = "/tmp/generate-graph.py";
    fs.writeFile(scriptPath, result.text, function(err) {
        if(err) {
            // too bad for us
        }
    });

    return scriptPath;
}