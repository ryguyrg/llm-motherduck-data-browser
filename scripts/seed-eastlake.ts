import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

async function seedEastlake() {
  const connectionString = process.env.PLANETSCALE_DATABASE_URL;

  if (!connectionString) {
    console.error('Error: PLANETSCALE_DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: true,
    },
  });

  const client = await pool.connect();

  try {
    // Read the metadata file
    const metadataPath = join(process.cwd(), 'eastlake_metadata.md');
    const metadata = readFileSync(metadataPath, 'utf-8');

    // Get the MotherDuck token from environment
    const motherduckToken = process.env.MOTHERDUCK_TOKEN || null;

    const dataset = {
      name: 'Eastlake',
      description: 'Eastlake is a fictitious B2B company that manufactures and sells products to businesses worldwide. The database contains transactional data including customers, orders, products, employees, and suppliers spanning from 2019 to 2026.',
      url_path: 'eastlake',
      motherduck_token: motherduckToken,
      motherduck_share_url: null,
      metadata: metadata,
      example_prompts: [
        'What products do we sell, and how have they performed?',
        'Which customers buy the largest variety of products?',
        'Analyze sales by region and show a map with details.',
        'What are our top 10 products by revenue?',
        'Show me monthly sales trends over time.',
        'Which employees have the highest sales?',
      ],
    };

    // Check if dataset already exists
    const existing = await client.query(
      'SELECT id FROM datasets WHERE url_path = $1',
      [dataset.url_path]
    );

    if (existing.rows.length > 0) {
      console.log('Eastlake dataset already exists, updating...');
      await client.query(
        `UPDATE datasets SET
          name = $1,
          description = $2,
          motherduck_token = $3,
          motherduck_share_url = $4,
          metadata = $5,
          example_prompts = $6,
          updated_at = NOW()
        WHERE url_path = $7`,
        [
          dataset.name,
          dataset.description,
          dataset.motherduck_token,
          dataset.motherduck_share_url,
          dataset.metadata,
          JSON.stringify(dataset.example_prompts),
          dataset.url_path,
        ]
      );
      console.log('Eastlake dataset updated successfully!');
    } else {
      console.log('Creating Eastlake dataset...');
      await client.query(
        `INSERT INTO datasets (name, description, url_path, motherduck_token, motherduck_share_url, metadata, example_prompts)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          dataset.name,
          dataset.description,
          dataset.url_path,
          dataset.motherduck_token,
          dataset.motherduck_share_url,
          dataset.metadata,
          JSON.stringify(dataset.example_prompts),
        ]
      );
      console.log('Eastlake dataset created successfully!');
    }

    client.release();
  } catch (error) {
    console.error('Failed to seed Eastlake dataset:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedEastlake();
