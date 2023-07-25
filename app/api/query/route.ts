import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { extractDimensionality } from './dimensionalitySimilarity';
import { extractClassification } from './queryClassifier';
import { extractEntities } from './entityExtraction';
import { findEntities } from './entityRecognition';
import rollup from './rollup';
import { extractMemberDimensionality } from './memberSimilarity';
import getCompletion from "./prompt";

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const dimensions = await extractDimensionality(query, supabase);
    const memberContext = await extractMemberDimensionality(query, dimensions, supabase);
    // console.log("-- memberContext:", JSON.stringify(memberContext));

    const classification = await extractClassification(query);
    const entityContext = await extractEntities(query, dimensions, supabase);

    memberContext.merge(entityContext);
    // console.log("-- merged context:", JSON.stringify(memberContext));

    // const betterMemberContext = await findEntities(query, supabase);
    // console.log("-- betterMemberContext:", JSON.stringify(betterMemberContext));

    const response = {
        dimensionality: memberContext.get(),
        classification
    };

    const rollupResult = await rollup(memberContext);
    const completion = await getCompletion(query, rollupResult);

    return NextResponse.json(completion);
}