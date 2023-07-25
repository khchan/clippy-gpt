const { AzureKeyCredential, TextAnalysisClient } = require("@azure/ai-language-text");
import { ModelContext } from "@/app/types";
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { extractSingleMemberDimensionality } from "./memberSimilarity";

export async function findEntities(query: string, supabase: SupabaseClient): Promise<ModelContext> {
    try {
        const DIMENSION_ENTITIES = ["Store", "Year", "Period"];

        const client = new TextAnalysisClient(
            process.env.AZURE_NER_RESOURCE_ENDPOINT,
            new AzureKeyCredential(process.env.AZURE_NER_RESOURCE_API_KEY));

        const actions = [
            {
                kind: "CustomEntityRecognition",
                projectName: process.env.AZURE_NER_PROJECT_NAME,
                deploymentName: process.env.AZURE_NER_DEPLOYMENT_NAME,
            },
        ];
        const documents = [ query ];
        const output = new ModelContext();

        const poller = await client.beginAnalyzeBatch(actions, documents, "en");
        const results = await poller.pollUntilDone();

        for await (const actionResult of results) {
            if (actionResult.kind !== "CustomEntityRecognition") {
                throw new Error(`Expected a CustomEntityRecognition results but got: ${actionResult.kind}`);
            }
            if (actionResult.error) {
                const { code, message } = actionResult.error;
                throw new Error(`Unexpected error (${code}): ${message}`);
            }

            for (const result of actionResult.results) {
                // console.log(`- Document ${result.id}`);

                if (result.error) {
                    const { code, message } = result.error;
                    throw new Error(`Unexpected error (${code}): ${message}`);
                }

                console.log("\tRecognized Entities:");
                for (const entity of result.entities) {
                    // console.log(`\t- Entity "${entity.text}" of type ${entity.category}`);

                    // Some entities are labelled with a Dimension name, and others are named with a Member name.
                    // Whatever Azure Custom Named Entity Recognition finds, we try to find the closest match in
                    // our member_lvl_dim supabase table. This will often be an exact match (e.g. Azure will find "2020").

                    // If we found one of the "dimension-named entities", then the text is the member we're looking for.
                    // If it's not one of of the "dimension-named-entities", then the category is the member we're looking for.

                    // Example: "What are my 2020 Toronto sales?"
                    // Azure will find "2020" as a "Year" entitiy, "Toronto" as a "Store" entity, and "sales" as a "Revenue" entity.
                    // The members we want to use would be "2020" (the entity text), "Toronto" (the entity text), and "Revenue" (the entity category).
                    const value = DIMENSION_ENTITIES.includes(entity.category) ? entity.text : entity.category;

                    output.merge(await extractSingleMemberDimensionality(value, supabase));
                }
            }
        }

        return output;
    } catch (err) {
        console.error(err);
        return new ModelContext();
    }
}