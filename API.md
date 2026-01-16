## Dataset Management API

Base URL: `http://localhost:3000/api/datasets`

### Authentication

All endpoints require an API key via the `Authorization` header:
```
Authorization: Bearer <ADMIN_API_KEY>
```

---

### List All Datasets

**GET** `/api/datasets`

Returns an array of all datasets (excludes sensitive fields like `motherduck_token` in list view).

```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  http://localhost:3000/api/datasets
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Eastlake",
    "description": "B2B company sales data",
    "url_path": "eastlake",
    "example_prompts": ["What are our top products?", "..."],
    "created_at": "2026-01-16T...",
    "updated_at": "2026-01-16T..."
  }
]
```

---

### Get Dataset by Path

**GET** `/api/datasets/{url_path}`

```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  http://localhost:3000/api/datasets/eastlake
```

**Response:** `200 OK` - Full dataset including `motherduck_token` and `metadata`

**Errors:** `404` if not found

---

### Create Dataset

**POST** `/api/datasets`

```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Data",
    "description": "Company sales analytics",
    "url_path": "sales",
    "motherduck_token": "eyJ...",
    "motherduck_share_url": "md:_share/...",
    "metadata": "# Schema\n\n## Tables\n...",
    "example_prompts": ["Show me revenue by month", "Top customers"]
  }' \
  http://localhost:3000/api/datasets
```

**Required fields:** `name`, `url_path`

**url_path rules:** lowercase letters, numbers, and hyphens only (e.g., `sales-data`)

**Response:** `201 Created`

**Errors:** `400` invalid input, `409` url_path already exists

---

### Update Dataset

**PUT** `/api/datasets/{url_path}`

```bash
curl -X PUT \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "metadata": "# New metadata..."
  }' \
  http://localhost:3000/api/datasets/eastlake
```

Only include fields you want to update.

**Response:** `200 OK` - Updated dataset

**Errors:** `404` not found, `409` url_path conflict

---

### Delete Dataset

**DELETE** `/api/datasets/{url_path}`

```bash
curl -X DELETE \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  http://localhost:3000/api/datasets/eastlake
```

**Response:** `200 OK`
```json
{"success": true}
```

**Errors:** `404` not found

---

### Dataset Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `description` | string | No | Dataset description |
| `url_path` | string | Yes | URL slug (unique, lowercase alphanumeric + hyphens) |
| `motherduck_token` | string | No | MotherDuck auth token for this dataset |
| `motherduck_share_url` | string | No | MotherDuck share URL |
| `metadata` | string | No | Schema metadata (markdown) for LLM prompts |
| `example_prompts` | string[] | No | Example questions shown in UI |
