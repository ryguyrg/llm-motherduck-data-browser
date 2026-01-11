# Eastlake Database Metadata

## Business Context

Eastlake is a fictitious B2B company that manufactures and sells products to businesses worldwide. The database contains transactional data including customers, orders, products, employees, and suppliers spanning from 2019 to 2026.

## Query Tips

**Important**: Don't assume all products are categorized or that similar INNER JOINs will always include all data. Some products may have NULL category_id values, and using INNER JOIN on categories will exclude these uncategorized products. Consider using LEFT JOIN when you need complete product listings.

**Date Ranges**: If no date range is specified, always include orders up to the current date, defined by `today()` in DuckDB. Do not include orders after the current date.

**Maps**: When rendering maps in generated HTML, always use OpenStreetMap (via Leaflet.js) or a similar free mapping service. Do not use Google Maps or other services that require API keys.

## Database: `eastlake`

### Tables Overview

| Table | Rows | Description |
|-------|------|-------------|
| eastlake.main.categories | 8 | Product categories (Meat/Poultry, Grains/Cereals, Produce, Seafood, Confections, Beverages) |
| eastlake.main.customers | 1,000 | Business customers across 21 countries |
| eastlake.main.employees | 9 | Sales staff with titles and reporting structure |
| eastlake.main.employee_territories | 49 | Maps employees to sales territories |
| eastlake.main.orders | 163,452 | Customer orders with shipping details |
| eastlake.main.order_details | 214,108 | Line items for each order (products, quantities, prices) |
| eastlake.main.products | 77 | Products with pricing and inventory |
| eastlake.main.regions | 4 | Sales regions (Southern, Western) |
| eastlake.main.shippers | 3 | Shipping companies (United Package, Speedy Express, Federal Shipping) |
| eastlake.main.suppliers | 29 | Product suppliers |
| eastlake.main.territories | 53 | Sales territories linked to regions |

---

## Table Schemas

### eastlake.main.categories
| Column | Type | Description |
|--------|------|-------------|
| category_id | BIGINT | Primary key |
| category_name | VARCHAR | Category name |
| description | VARCHAR | Category description |

### eastlake.main.customers
| Column | Type | Description |
|--------|------|-------------|
| customer_id | VARCHAR | Primary key (5-char code) |
| company_name | VARCHAR | Business name |
| contact_name | VARCHAR | Primary contact |
| contact_title | VARCHAR | Contact's job title |
| address | VARCHAR | Street address |
| city | VARCHAR | City |
| region | VARCHAR | State/region |
| postal_code | VARCHAR | Postal/ZIP code |
| country | VARCHAR | Country |
| phone | VARCHAR | Phone number |
| fax | VARCHAR | Fax number |
| primary_category | INTEGER | Customer's primary product category preference |
| category_breadth | INTEGER | Number of different categories customer buys from |

### eastlake.main.employees
| Column | Type | Description |
|--------|------|-------------|
| employee_id | BIGINT | Primary key |
| first_name | VARCHAR | First name |
| last_name | VARCHAR | Last name |
| title | VARCHAR | Job title (Sales Representative, Sales Manager, etc.) |
| title_of_courtesy | VARCHAR | Mr., Ms., Dr., etc. |
| birth_date | TIMESTAMP | Date of birth |
| hire_date | TIMESTAMP | Employment start date |
| address | VARCHAR | Street address |
| city | VARCHAR | City |
| region | VARCHAR | State/region |
| postal_code | VARCHAR | Postal code |
| country | VARCHAR | Country |
| home_phone | VARCHAR | Phone number |
| extension | VARCHAR | Office extension |
| reports_to | JSON | Manager's employee_id |

### eastlake.main.orders
| Column | Type | Description |
|--------|------|-------------|
| order_id | BIGINT | Primary key |
| customer_id | JSON | Foreign key to eastlake.main.customers (NOTE: stored with quotes, use REPLACE to join) |
| employee_id | BIGINT | Foreign key to eastlake.main.employees |
| order_date | TIMESTAMP | Date order was placed |
| required_date | TIMESTAMP | Customer's requested delivery date |
| shipped_date | TIMESTAMP | Actual ship date |
| ship_via | BIGINT | Foreign key to eastlake.main.shippers |
| freight | DECIMAL(18,3) | Shipping cost |
| ship_name | JSON | Recipient name |
| ship_address | JSON | Delivery address |
| ship_city | JSON | Delivery city |
| ship_region | JSON | Delivery state/region |
| ship_postal_code | JSON | Delivery postal code |
| ship_country | JSON | Delivery country |
| customer_primary_category | INTEGER | Denormalized from customer |
| customer_category_breadth | INTEGER | Denormalized from customer |

### eastlake.main.order_details
| Column | Type | Description |
|--------|------|-------------|
| order_id | JSON | Foreign key to eastlake.main.orders (stored as string) |
| product_id | JSON | Foreign key to eastlake.main.products (stored as string) |
| unit_price | DECIMAL(18,3) | Price at time of order |
| quantity | INTEGER | Quantity ordered |
| discount | DECIMAL(18,3) | Discount percentage (0.0 to 1.0) |

### eastlake.main.products
| Column | Type | Description |
|--------|------|-------------|
| product_id | BIGINT | Primary key |
| product_name | VARCHAR | Product name |
| supplier_id | BIGINT | Foreign key to eastlake.main.suppliers |
| category_id | BIGINT | Foreign key to eastlake.main.categories |
| quantity_per_unit | VARCHAR | Package size description |
| unit_price | DECIMAL(18,3) | Current list price |
| units_in_stock | INTEGER | Current inventory |
| units_on_order | INTEGER | Units on order from supplier |
| reorder_level | INTEGER | Minimum stock before reorder |
| discontinued | BOOLEAN | Whether product is discontinued |

### eastlake.main.suppliers
| Column | Type | Description |
|--------|------|-------------|
| supplier_id | BIGINT | Primary key |
| company_name | VARCHAR | Supplier business name |
| contact_name | VARCHAR | Primary contact |
| contact_title | VARCHAR | Contact's job title |
| address | VARCHAR | Street address |
| city | VARCHAR | City |
| region | VARCHAR | State/region |
| postal_code | VARCHAR | Postal code |
| country | VARCHAR | Country |
| phone | VARCHAR | Phone number |

### eastlake.main.shippers
| Column | Type | Description |
|--------|------|-------------|
| shipper_id | BIGINT | Primary key |
| company_name | VARCHAR | Shipper name |
| phone | VARCHAR | Phone number |

**Shippers:** United Package (1), Speedy Express (2), Federal Shipping (3)

### eastlake.main.regions
| Column | Type | Description |
|--------|------|-------------|
| region_id | BIGINT | Primary key |
| region_description | VARCHAR | Region name |

**Regions:** Southern, Western

### eastlake.main.territories
| Column | Type | Description |
|--------|------|-------------|
| territory_id | VARCHAR | Primary key |
| territory_description | VARCHAR | Territory name |
| region_id | BIGINT | Foreign key to eastlake.main.regions |

### eastlake.main.employee_territories
| Column | Type | Description |
|--------|------|-------------|
| employee_id | BIGINT | Foreign key to eastlake.main.employees |
| territory_id | VARCHAR | Foreign key to eastlake.main.territories |

---

## Key Relationships

```
eastlake.main.customers.customer_id <-- eastlake.main.orders.customer_id (NOTE: orders.customer_id has embedded quotes)
eastlake.main.employees.employee_id <-- eastlake.main.orders.employee_id
eastlake.main.orders.order_id <-- eastlake.main.order_details.order_id (order_details.order_id is VARCHAR)
eastlake.main.products.product_id <-- eastlake.main.order_details.product_id (order_details.product_id is VARCHAR)
eastlake.main.categories.category_id <-- eastlake.main.products.category_id
eastlake.main.suppliers.supplier_id <-- eastlake.main.products.supplier_id
eastlake.main.shippers.shipper_id <-- eastlake.main.orders.ship_via
eastlake.main.regions.region_id <-- eastlake.main.territories.region_id
eastlake.main.territories.territory_id <-- eastlake.main.employee_territories.territory_id
eastlake.main.employees.employee_id <-- eastlake.main.employee_territories.employee_id
```

### Important Join Notes

The `eastlake.main.orders.customer_id` column stores values with embedded quotes (e.g., `"WZQHE"`). To join with customers:
```sql
JOIN eastlake.main.customers c ON REPLACE(o.customer_id, '"', '') = c.customer_id
```

The `eastlake.main.order_details.order_id` and `eastlake.main.order_details.product_id` are stored as VARCHAR/JSON. To join:
```sql
JOIN eastlake.main.order_details od ON o.order_id = CAST(od.order_id AS BIGINT)
JOIN eastlake.main.products p ON CAST(p.product_id AS VARCHAR) = od.product_id
```

---

## Common Query Patterns

### Product Performance
```sql
SELECT
  p.product_name,
  c.category_name,
  COUNT(DISTINCT od.order_id) as order_count,
  SUM(od.quantity) as total_quantity,
  SUM(od.unit_price * od.quantity * (1 - od.discount)) as revenue
FROM eastlake.main.products p
LEFT JOIN eastlake.main.categories c ON p.category_id = c.category_id
LEFT JOIN eastlake.main.order_details od ON CAST(p.product_id AS VARCHAR) = od.product_id
GROUP BY p.product_name, c.category_name
ORDER BY revenue DESC
```

### Customer Analysis
```sql
SELECT
  c.company_name,
  c.country,
  COUNT(DISTINCT od.product_id) as product_variety,
  COUNT(DISTINCT o.order_id) as order_count
FROM eastlake.main.customers c
JOIN eastlake.main.orders o ON REPLACE(c.customer_id, '"', '') = REPLACE(o.customer_id, '"', '')
JOIN eastlake.main.order_details od ON o.order_id = CAST(od.order_id AS BIGINT)
GROUP BY c.company_name, c.country
ORDER BY product_variety DESC
```

### Sales by Geography
```sql
SELECT
  c.country,
  COUNT(DISTINCT o.order_id) as order_count,
  SUM(o.freight) as total_freight,
  COUNT(DISTINCT c.customer_id) as customer_count
FROM eastlake.main.customers c
JOIN eastlake.main.orders o ON REPLACE(c.customer_id, '"', '') = REPLACE(o.customer_id, '"', '')
GROUP BY c.country
ORDER BY order_count DESC
```

---

## Geographic Data

**Customer Countries (21):** Argentina, Austria, Belgium, Brazil, Canada, Denmark, Finland, France, Germany, Ireland, Italy, Mexico, Norway, Poland, Portugal, Spain, Sweden, Switzerland, UK, USA, Venezuela

**Top Markets by Order Volume:**
1. Venezuela - 18,502 orders, 45 customers
2. Poland - 18,092 orders, 42 customers
3. Finland - 15,420 orders, 38 customers
4. Belgium - 12,924 orders, 44 customers
5. Brazil - 12,801 orders, 43 customers

---

## Product Categories

| ID | Category Name |
|----|---------------|
| 1 | Meat/Poultry |
| 2 | Grains/Cereals |
| 3 | Produce |
| 4 | Seafood |
| 5 | Confections |
| 6 | Beverages |
| 7 | Confections |
| 8 | Grains/Cereals |

---

## Employee Roles

- Sales Representative (4 employees)
- Sales Manager (2 employees)
- Inside Sales Coordinator (2 employees)
- Vice President, Sales (1 employee)

---

## Date Range

Orders span from **July 2019** to **November 2026**.

---

## Sample Values

| Column | Examples |
|--------|----------|
| eastlake.main.customers.customer_id | MMAUH, KRUES, BUNFB, KDEND, WZQHE |
| eastlake.main.customers.contact_title | Owner, Sales Manager, Sales Representative, Marketing Manager, Accounting Manager, Order Administrator, Sales Associate |
| eastlake.main.products.product_name | Durable Aluminum Watch, Aerodynamic Plastic Chair, Small Leather Shoes, Heavy Duty Cotton Bag, Gorgeous Leather Shoes |
| eastlake.main.employees.title | Sales Representative, Sales Manager, Inside Sales Coordinator, Vice President Sales |
| eastlake.main.territories.territory_id | 47647.09791718673, 76165.4595730574 (numeric strings) |
| eastlake.main.orders.customer_id | "WZQHE", "LCXRE" (note: has embedded quotes) |
| eastlake.main.order_details.order_id | "10248", "10249" (stored as strings) |

---

## Question-to-Table Guide

| Question Type | Primary Tables | Join Through |
|---------------|----------------|--------------|
| **Product performance/sales** | eastlake.main.products, eastlake.main.order_details | eastlake.main.order_details.product_id |
| **Product categories** | eastlake.main.products, eastlake.main.categories | eastlake.main.products.category_id |
| **Customer orders** | eastlake.main.customers, eastlake.main.orders | eastlake.main.orders.customer_id (use REPLACE for quotes) |
| **Order line items/revenue** | eastlake.main.orders, eastlake.main.order_details | eastlake.main.order_details.order_id |
| **Sales by employee** | eastlake.main.employees, eastlake.main.orders | eastlake.main.orders.employee_id |
| **Sales by region/country** | eastlake.main.customers, eastlake.main.orders | eastlake.main.orders.customer_id |
| **Shipping analysis** | eastlake.main.orders, eastlake.main.shippers | eastlake.main.orders.ship_via |
| **Supplier products** | eastlake.main.suppliers, eastlake.main.products | eastlake.main.products.supplier_id |
| **Employee territories** | eastlake.main.employees, eastlake.main.employee_territories, eastlake.main.territories | employee_id, territory_id |
| **Inventory/stock levels** | eastlake.main.products | (direct query) |

### Quick Patterns

- **Revenue calculation:** `SUM(od.unit_price * od.quantity * (1 - od.discount))`
- **Join eastlake.main.orders↔eastlake.main.customers:** `REPLACE(o.customer_id, '"', '') = c.customer_id`
- **Join eastlake.main.orders↔eastlake.main.order_details:** `o.order_id = CAST(od.order_id AS BIGINT)`
- **Join eastlake.main.products↔eastlake.main.order_details:** `CAST(p.product_id AS VARCHAR) = od.product_id`
