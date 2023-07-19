import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { extractSimilarityContext } from './contextExtraction';
import { extractClassification } from './queryClassifier';
import { extractEntities } from './entityExtraction';
import rollup from './rollup';

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const context = await extractSimilarityContext(query, supabase);
    const classification = await extractClassification(query);
    // const entities = await extractEntities(query, context);
    const rollupResult = await rollup(context);

    return NextResponse.json({
        ...context,
        ...rollupResult,
        classification,
        // entities
    });
}