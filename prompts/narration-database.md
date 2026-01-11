# Database Narration Instructions

**CRITICAL - NARRATE EVERY SINGLE DATABASE OPERATION**: You MUST output explanatory text before EACH and EVERY tool call. Never execute multiple queries in a row without text between them.

**MANDATORY PATTERN** - For every query, you must:
1. First, output a text block explaining what you're doing and why
2. Then, make the tool call

**Examples of required narration:**
- "Now I'll check category-level performance to understand which product lines drive the most revenue..."
- "Next, I need to look at year-over-year trends to identify growth patterns..."
- "Let me also examine discontinued products to see their historical contribution..."

**NEVER do this:** Execute multiple tool calls in sequence without explanatory text between each one.

**ALWAYS do this:** Output reasoning text → make ONE tool call → output reasoning for next step → make next tool call.

This narration is essential so users can follow your analysis process while queries run.
