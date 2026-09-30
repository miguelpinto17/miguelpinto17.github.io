---
title: Real-Time Behavioral Analytics Platform
summary: Real-time product analytics used daily by Product and Design.
year: "2025–present"
featured: true
order: 3
stack: [Snowplow, dbt, Snowflake, Streamlit]
github: ""
demo: ""
report: ""
---

## The problem

At Uphold, Product and Design needed to see how users actually moved through the product, in something close to real time, rather than waiting on a weekly report.

## What I built

*This section describes the architecture only. No screenshots, internal dashboards, or company data beyond what's below.*

A real-time behavioral analytics platform: **Snowplow → dbt → Snowflake → Streamlit**, used daily by Product and Design. It tracks user journeys end to end and surfaces friction points, which directly informed a page-design change that improved user flow across the product.

<div class="diagram">
<svg viewBox="0 0 680 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Event pipeline: Snowplow collects events, dbt transforms them in Snowflake, and a Streamlit app surfaces the results daily.">
  <defs>
    <marker id="arrow3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="Inter, sans-serif" font-size="13" fill="currentColor">
    <rect x="10" y="45" width="130" height="45" rx="8" fill="none" stroke="currentColor"/>
    <text x="75" y="72" text-anchor="middle">Snowplow</text>

    <line x1="140" y1="67" x2="215" y2="67" stroke="currentColor" marker-end="url(#arrow3)"/>

    <rect x="220" y="45" width="90" height="45" rx="8" fill="none" stroke="currentColor"/>
    <text x="265" y="72" text-anchor="middle">dbt</text>

    <line x1="310" y1="67" x2="385" y2="67" stroke="currentColor" marker-end="url(#arrow3)"/>

    <rect x="390" y="45" width="130" height="45" rx="8" fill="none" stroke="currentColor"/>
    <text x="455" y="72" text-anchor="middle">Snowflake</text>

    <line x1="520" y1="67" x2="595" y2="67" stroke="currentColor" marker-end="url(#arrow3)"/>

    <rect x="600" y="45" width="75" height="45" rx="8" fill="none" stroke="currentColor"/>
    <text x="637" y="72" text-anchor="middle">Streamlit</text>
  </g>
</svg>
<p class="diagram-caption">Snowplow → dbt → Snowflake → Streamlit, refreshed continuously.</p>
</div>

Alongside this, I restructured the underlying dbt models to improve table design, cutting query runtime by **80%** and making reports faster and more reliable for 50+ stakeholders.

## Results

- A real-time analytics platform used daily by Product and Design
- One surfaced friction point directly informed a shipped page-design change
- 80% reduction in query runtime after restructuring dbt models, for 50+ stakeholders

## What I learned

Fast queries change behavior, not just dashboards. Once the dbt restructuring cut runtime, people started checking the data more often, which mattered more than the raw speed number.

## Stack

Snowplow, dbt, Snowflake, Streamlit
