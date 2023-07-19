import { createTaggingChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import type { FunctionParameters } from "langchain/output_parsers";

const schema: FunctionParameters = {
    type: "object",
    "properties": {
        "classification": {
            "type": "string",
            "enum": [
                "Sales Analysis", 
                "Expense Analysis", 
                "Cost and Procurement Analysis", 
                "Financial Health and Profitability Analysis", 
                "Budget and Performance Analysis"
            ],
            "description": "This property classifies the type of financial analysis being conducted. 'Sales Analysis' focuses on understanding the revenue streams, their drivers, and patterns over time, across different entities and locations. 'Expense Analysis' deals with the understanding and tracking of business expenditures, identifying major areas of spending, and monitoring the changes over time. 'Cost and Procurement Analysis' aims to evaluate the costs directly related to the production or procurement of goods and services, their changes over time, and their impact on the business. 'Financial Health and Profitability Analysis' assesses the overall financial status of the business, including liquidity, solvency, profitability, and operational efficiency. 'Budget and Performance Analysis' evaluates the business's financial performance against its set targets and budget, identifying areas of over or underperformance."
        }
    },
    "required": ["classification"]
};

export async function extractClassification(query: string) {
    const chatModel = new ChatOpenAI({ 
        modelName: "gpt-4-0613", 
        temperature: 0, 
        openAIApiKey: process.env.OPEN_AI_API_KEY
    });

    const chain = createTaggingChain(schema, chatModel);
    
    try {
        return await chain.run(query);
    } catch (err) {
        console.error(err);
        return {"classification": "N/A"};
    }
}