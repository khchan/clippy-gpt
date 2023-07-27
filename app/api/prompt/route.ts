import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import rollup from '../query/rollupQuery';
import getCompletion from "./prompt";

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
    const { query } = await request.json();

    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const completion = await getCompletion(query, supabase);

    return NextResponse.json(completion);
}