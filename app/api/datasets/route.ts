import { NextRequest, NextResponse } from 'next/server';
import { getAllDatasets, createDataset } from '@/lib/datasets';
import { validateApiKey } from '@/lib/auth';

// GET /api/datasets - List all datasets (requires auth)
export async function GET(request: NextRequest) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.error;

  try {
    const datasets = await getAllDatasets();
    return NextResponse.json(datasets);
  } catch (error) {
    console.error('Failed to fetch datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

// POST /api/datasets - Create a new dataset (requires auth)
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.error;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.url_path) {
      return NextResponse.json(
        { error: 'name and url_path are required' },
        { status: 400 }
      );
    }

    // Validate url_path format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(body.url_path)) {
      return NextResponse.json(
        { error: 'url_path must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const dataset = await createDataset({
      name: body.name,
      description: body.description || null,
      url_path: body.url_path,
      motherduck_token: body.motherduck_token || null,
      motherduck_share_url: body.motherduck_share_url || null,
      metadata: body.metadata || null,
      example_prompts: body.example_prompts || [],
    });

    return NextResponse.json(dataset, { status: 201 });
  } catch (error) {
    console.error('Failed to create dataset:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A dataset with this url_path already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create dataset' },
      { status: 500 }
    );
  }
}
