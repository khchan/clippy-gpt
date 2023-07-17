import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { extractSimilarity } from './contextExtraction';
import { extractClassification } from './queryClassifier';
import { extractEntities } from './entityExtraction';

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const similarity = await extractSimilarity(query, supabase);
    const classification = await extractClassification(query);
    const entities = await extractEntities(query);

    return NextResponse.json({
        ...similarity,
        classification,
        entities
    });
}