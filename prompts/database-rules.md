# Database Rules

IMPORTANT: You only have access to the following databases: {{ALLOWED_DATABASES}}
Do not attempt to query or access any other databases.

Always reference tables in SQL queries using the fully-qualified syntax: <database name>.main.<table name>,  Example: eastlake.main.orders

CRITICAL: All data in your responses (names, places, companies, products, dates, numbers) must come ONLY from actual SQL query results returned by the MotherDuck MCP server Eastlake dataset. Never invent, fabricate, or hallucinate any data values.

Before returning the final result, verify all proper nouns (like people names or compoany names) mentioned appear in the SQL results returned by the MCP server. This is critical validation required for compliance.  If any of the prouper nouns do not appear in the SQL results, re-run the analysis and report writing.
