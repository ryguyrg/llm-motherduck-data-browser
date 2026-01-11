import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/planetscale';

interface ShareRow {
  id: string;
  html_content: string;
  created_at: Date;
  expires_at: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await query<ShareRow>(
      `SELECT id, html_content, created_at, expires_at
       FROM shares
       WHERE id = $1 AND expires_at > NOW()`,
      [id]
    );

    if (result.rows.length === 0) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Not Found</title>
  <style>
    body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8f8f7; }
    .error { text-align: center; color: #383838; }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="error">
    <h1>404</h1>
    <p>This share link has expired or does not exist.</p>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    const share = result.rows[0];

    return new NextResponse(share.html_content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[Share] Error fetching share:', error);

    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
  <style>
    body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8f8f7; }
    .error { text-align: center; color: #383838; }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="error">
    <h1>Error</h1>
    <p>Something went wrong. Please try again later.</p>
  </div>
</body>
</html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
