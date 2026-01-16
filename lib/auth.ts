import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates the API key from the Authorization header
 * Expected format: "Bearer <api_key>"
 */
export function validateApiKey(request: NextRequest): { valid: boolean; error?: NextResponse } {
  const authHeader = request.headers.get('Authorization');
  const adminApiKey = process.env.ADMIN_API_KEY;

  if (!adminApiKey) {
    console.error('[Auth] ADMIN_API_KEY environment variable is not set');
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      ),
    };
  }

  if (!authHeader) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      ),
    };
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid Authorization header format. Expected: Bearer <token>' },
        { status: 401 }
      ),
    };
  }

  if (token !== adminApiKey) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}
