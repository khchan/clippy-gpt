import { NextRequest, NextResponse } from 'next/server'

// without this, nextjs renders this route as static HTML for some reason ffs
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const { rollupPath } = await request.json();
    return NextResponse.json({ completion: "completion result"});
}