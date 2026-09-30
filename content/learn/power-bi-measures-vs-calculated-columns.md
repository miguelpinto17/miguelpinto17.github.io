---
title: Measures vs. calculated columns
date: 2026-09-23
description: The distinction that decides whether your Power BI report stays fast.
topic: Power BI
level: beginner
draft: true
---

## The problem

New Power BI users reach for calculated columns for everything, because they behave like a familiar Excel column. Then the model gets slow, the file gets huge, and nobody's sure why.

## The minimal example

Say you have a `Sales` table with `Quantity` and `UnitPrice`, and you want total revenue.

**Calculated column** (computed once per row, stored in the model, on disk):

```
Revenue Column = Sales[Quantity] * Sales[UnitPrice]
```

**Measure** (computed on the fly, at query time, only for the rows currently in view):

```
Total Revenue = SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])
```

Both give you a correct number on a simple table visual. The difference shows up the moment you slice, filter, or put it next to a visual with a different granularity, that's where a calculated column gives you a stale, row-level value, and a measure recalculates correctly for whatever context it's in.

## The common mistake

Using a calculated column for anything that needs to respond to filters or slicers, like "% of total" or "revenue this month vs. last month". Those need to be measures, because they depend on the current filter context, something a calculated column doesn't know about, it's frozen at refresh time.

A rough rule: if the value should change depending on what the user clicks, it's a measure. If it's a fixed attribute of the row itself, like a category or a flag, it's a calculated column, or better, done upstream in the source data.

## Takeaway

Default to measures. Reach for a calculated column only when you need a static, row-level value to filter, sort, or group by, not to display a number.
