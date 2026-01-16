import { NextRequest, NextResponse } from 'next/server';
import { getDatasetByPath, updateDataset, deleteDataset } from '@/lib/datasets';
import { validateApiKey } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ path: string }>;
}

// GET /api/datasets/[path] - Get a specific dataset (requires auth)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.error;

  try {
    const { path } = await params;
    const dataset = await getDatasetByPath(path);

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dataset);
  } catch (error) {
    console.error('Failed to fetch dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}

// PUT /api/datasets/[path] - Update a dataset (requires auth)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.error;

  try {
    const { path } = await params;
    const body = await request.json();

    // Get the existing dataset first
    const existing = await getDatasetByPath(path);
    if (!existing) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Validate url_path format if being updated
    if (body.url_path && !/^[a-z0-9-]+$/.test(body.url_path)) {
      return NextResponse.json(
        { error: 'url_path must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const updated = await updateDataset(existing.id, {
      name: body.name,
      description: body.description,
      url_path: body.url_path,
      motherduck_token: body.motherduck_token,
      motherduck_share_url: body.motherduck_share_url,
      metadata: body.metadata,
      example_prompts: body.example_prompts,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update dataset:', error);

    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A dataset with this url_path already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update dataset' },
      { status: 500 }
    );
  }
}

// DELETE /api/datasets/[path] - Delete a dataset (requires auth)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.error;

  try {
    const { path } = await params;

    const existing = await getDatasetByPath(path);
    if (!existing) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    await deleteDataset(existing.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete dataset:', error);
    return NextResponse.json(
      { error: 'Failed to delete dataset' },
      { status: 500 }
    );
  }
}
