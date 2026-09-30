---
title: Window functions in 5 minutes
date: 2026-09-23
description: The one SQL concept that replaces most self-joins and subqueries.
topic: SQL
level: beginner
draft: true
---

## The problem

You want a running total, a rank, or "compare this row to the previous row", without collapsing your rows with `GROUP BY`. A lot of people reach for a self-join or a correlated subquery. Both work. Both are slower to write and slower to read than the alternative.

## The minimal example

Say you have daily revenue and want a running total plus each day's rank:

```sql
SELECT
  order_date,
  daily_revenue,
  SUM(daily_revenue) OVER (ORDER BY order_date) AS running_total,
  RANK() OVER (ORDER BY daily_revenue DESC) AS revenue_rank
FROM daily_sales;
```

That's it. `OVER (...)` is the whole trick: it tells the function "compute this across a window of rows" instead of collapsing them into one.

Want it per group instead of globally? Add `PARTITION BY`:

```sql
SELECT
  region,
  order_date,
  daily_revenue,
  SUM(daily_revenue) OVER (PARTITION BY region ORDER BY order_date) AS region_running_total
FROM daily_sales;
```

Now the running total resets per region.

## The common mistake

Confusing `ROW_NUMBER()`, `RANK()` and `DENSE_RANK()`. With a tie at the top:

- `ROW_NUMBER()` gives 1, 2, 3: arbitrary tie-break, never repeats
- `RANK()` gives 1, 1, 3: ties share a rank, then skips
- `DENSE_RANK()` gives 1, 1, 2: ties share a rank, no gap

Most "top N per group" bugs come from picking the wrong one of these three without checking what happens on a tie.

## Takeaway

If you're about to write a self-join to compare a row to another row in the same table, try a window function first, it's almost always shorter and faster.
