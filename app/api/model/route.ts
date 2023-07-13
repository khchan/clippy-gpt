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

    const response = tables.map(async (table) => {
        const resp = await supabase.from('account').select('*', { count: 'exact', head: true });
        return resp.data;
    });

    return NextResponse.json(response);
}
