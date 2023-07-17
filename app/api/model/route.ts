import { ModelSummary } from '@/app/types';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

const tables = [
    'account',
    'periodmonth',
    'periodyear',
    'product',
    'store',
    'modelvalues'
];

export async function GET(request: NextRequest) {
    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const response: ModelSummary[] = await Promise.all(tables.map(async (table) => {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        return {table: table, count: count} as ModelSummary;
    }));

    return NextResponse.json(response);
}
