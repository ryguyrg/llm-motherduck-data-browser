import { query } from './planetscale';

export interface Dataset {
  id: number;
  name: string;
  description: string | null;
  url_path: string;
  motherduck_token: string | null;
  motherduck_share_url: string | null;
  metadata: string | null;
  example_prompts: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Get a dataset by its URL path
 */
export async function getDatasetByPath(urlPath: string): Promise<Dataset | null> {
  const result = await query<Dataset>(
    'SELECT * FROM datasets WHERE url_path = $1',
    [urlPath]
  );
  return result.rows[0] || null;
}

/**
 * Get all datasets
 */
export async function getAllDatasets(): Promise<Dataset[]> {
  const result = await query<Dataset>(
    'SELECT id, name, description, url_path, example_prompts, created_at, updated_at FROM datasets ORDER BY name'
  );
  return result.rows;
}

/**
 * Get a dataset by ID
 */
export async function getDatasetById(id: number): Promise<Dataset | null> {
  const result = await query<Dataset>(
    'SELECT * FROM datasets WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Create a new dataset
 */
export async function createDataset(dataset: Omit<Dataset, 'id' | 'created_at' | 'updated_at'>): Promise<Dataset> {
  const result = await query<Dataset>(
    `INSERT INTO datasets (name, description, url_path, motherduck_token, motherduck_share_url, metadata, example_prompts)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
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
  return result.rows[0];
}

/**
 * Update a dataset
 */
export async function updateDataset(
  id: number,
  updates: Partial<Omit<Dataset, 'id' | 'created_at' | 'updated_at'>>
): Promise<Dataset | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.url_path !== undefined) {
    fields.push(`url_path = $${paramIndex++}`);
    values.push(updates.url_path);
  }
  if (updates.motherduck_token !== undefined) {
    fields.push(`motherduck_token = $${paramIndex++}`);
    values.push(updates.motherduck_token);
  }
  if (updates.motherduck_share_url !== undefined) {
    fields.push(`motherduck_share_url = $${paramIndex++}`);
    values.push(updates.motherduck_share_url);
  }
  if (updates.metadata !== undefined) {
    fields.push(`metadata = $${paramIndex++}`);
    values.push(updates.metadata);
  }
  if (updates.example_prompts !== undefined) {
    fields.push(`example_prompts = $${paramIndex++}`);
    values.push(JSON.stringify(updates.example_prompts));
  }

  if (fields.length === 0) {
    return getDatasetById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<Dataset>(
    `UPDATE datasets SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Delete a dataset
 */
export async function deleteDataset(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM datasets WHERE id = $1',
    [id]
  );
  return result.rowCount > 0;
}
