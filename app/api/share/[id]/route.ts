import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/planetscale';

interface ShareRow {
  id: string;
  model: string | null;
  is_mobile: boolean;
  created_at: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await query<ShareRow>(
      `SELECT id, model, is_mobile, created_at
       FROM shares
       WHERE id = $1 AND expires_at > NOW()`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Share not found or expired' },
        { status: 404 }
      );
    }

    const share = result.rows[0];
    return NextResponse.json({
      id: share.id,
      model: share.model,
      isMobile: share.is_mobile,
      createdAt: share.created_at,
    });
  } catch (error) {
    console.error('[Share API] Error fetching share info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share info' },
      { status: 500 }
    );
  }
}
