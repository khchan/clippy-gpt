import {LLMChain} from "langchain/chains";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {PromptTemplate} from "langchain/prompts";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Readable} from "stream";

const prompt = PromptTemplate.fromTemplate(`Given this table of data:
{data}

Assume that rollupvalues column in the table is numeric and do not expose any details about table or its structure.
Try to calculate as much as you can to return sources and numbers in your answer and keep your answer under 100 words.

Question: {question}
Answer: `);

export default async function getCompletion(query: string, client: SupabaseClient): Promise<string> {

    const {data, error} = await client.storage
        .from('csv_files')
        .download('rollupResult.csv');

    const stream = new Readable();

    //@ts-ignore
    stream.push(Buffer.from(await data.arrayBuffer(), 'utf-8'));
    stream.push(null);
    let fileContents = '';
    for await (const chunk of stream) {
        fileContents += chunk;
    }

    const model = new ChatOpenAI({
        modelName: 'gpt-4-0613',
        temperature: 0,
        openAIApiKey: process.env.OPEN_AI_API_KEY
    });
    const chain = new LLMChain({llm: model, prompt});
    const result = await chain.call({
        data: fileContents,
        question: query
    });

    // console.log(result);

    return result.text;
}