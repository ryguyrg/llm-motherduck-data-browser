import { NextRequest, NextResponse } from 'next/server';
import { query, readOnlyQuery, healthCheck } from '@/lib/planetscale';

// Pre-defined queries - only these can be executed via the API
// isWrite: true allows INSERT/UPDATE/DELETE for this specific query
const ALLOWED_QUERIES: Record<string, { sql: string; description: string; isWrite?: boolean }> = {
  // Share-related queries
  'save_share': {
    sql: `INSERT INTO shares (id, html_content, created_at, expires_at)
          VALUES ($1, $2, NOW(), NOW() + INTERVAL '30 days')
          RETURNING id, created_at, expires_at`,
    description: 'Save shared HTML content',
    isWrite: true,
  },
  'get_share': {
    sql: `SELECT id, html_content, created_at, expires_at
          FROM shares
          WHERE id = $1 AND expires_at > NOW()`,
    description: 'Retrieve shared HTML content by ID',
  },
  'delete_expired_shares': {
    sql: `DELETE FROM shares WHERE expires_at < NOW()`,
    description: 'Clean up expired shares',
    isWrite: true,
  },
};

interface QueryRequest {
  queryName: string;
  params?: unknown[];
}

export async function POST(request: NextRequest) {
  try {
    const body: QueryRequest = await request.json();
    const { queryName, params } = body;

    if (!queryName || typeof queryName !== 'string') {
      return NextResponse.json(
        { error: 'queryName is required' },
        { status: 400 }
      );
    }

    const queryDef = ALLOWED_QUERIES[queryName];
    if (!queryDef) {
      return NextResponse.json(
        { error: `Unknown query: ${queryName}. Allowed queries: ${Object.keys(ALLOWED_QUERIES).join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`[DB API] Executing pre-defined query: ${queryName}`);

    // Use the appropriate query function based on whether this is a write operation
    const queryFn = queryDef.isWrite ? query : readOnlyQuery;
    const result = await queryFn(queryDef.sql, params);

    return NextResponse.json({
      success: true,
      data: {
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields,
      },
    });
  } catch (error) {
    console.error('[DB API] Query error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isHealthy = await healthCheck();

    if (isHealthy) {
      return NextResponse.json({ status: 'healthy' });
    } else {
      return NextResponse.json(
        { status: 'unhealthy', error: 'Database connection failed' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[DB API] Health check error:', error);

    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 503 }
    );
  }
}
