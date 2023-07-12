import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { pathname } = new URL(request.url);
    const functionName = pathname.substring(pathname.lastIndexOf('/') + 1);

    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase.functions.invoke(functionName, { body });

    if (error) {
        console.error('Error invoking edge function', error);
        return NextResponse.error();
    }

    return NextResponse.json(data);
}
