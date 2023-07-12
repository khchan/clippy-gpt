import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createRouteHandlerClient({ cookies })
  
  const response = await supabase.from('employees').select()

  return NextResponse.json(response.data);
}
