import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { extractDimensionality } from './dimensionalitySimilarity';
import { extractClassification } from './queryClassifier';
import { extractEntities } from './entityExtraction';
import rollup from './rollupQuery';
import { extractMemberDimensionality } from './memberSimilarity';
import getCompletion from "../prompt/prompt";

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const dimensions = await extractDimensionality(query, supabase);
    const memberContext = await extractMemberDimensionality(query, dimensions, supabase, 3);
    // console.log("-- memberContext:", JSON.stringify(memberContext));
    // const classification = await extractClassification(query);
    const entityContext = await extractEntities(query, dimensions, supabase);

    memberContext.merge(entityContext);
    // console.log("-- merged context:", JSON.stringify(memberContext));

    // const betterMemberContext = await findEntities(query, supabase);
    // console.log("-- betterMemberContext:", JSON.stringify(betterMemberContext));

    const rollupResultId = await rollup(memberContext, supabase);

    return NextResponse.json(rollupResultId);
}