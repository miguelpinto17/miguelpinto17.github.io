---
title: "Manchester United Match Reports: Automated Reporting Pipeline"
summary: An automated post-match reporting pipeline that goes beyond the scoreline.
year: "2026"
featured: true
order: 2
stack: [SQL, Python, Power BI, REST APIs]
github: ""
demo: ""
report: ""
---

## The problem

A final score tells you almost nothing about how a match actually went. I wanted a reporting pipeline that could tell the real story of a season, match by match, using advanced stats rather than just results.

## What I built

An automated pipeline covering 38+ matches, pairing advanced stats (xG, per-player performance) with season-trend analysis, delivered through a dynamic Power BI dashboard.

Underneath it sits a **12-table SQL schema** modeling matches, shot events, lineups, transfers and standings, populated by integrating **2 external data APIs**.

The pipeline is triggered to run on demand after each fixture, refreshing reports and dashboards without any manual intervention, mirroring how a production analytics feed actually operates.

<div class="diagram">
<svg viewBox="0 0 680 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="After each fixture, two external APIs feed a SQL schema of twelve tables, which refreshes a Power BI dashboard automatically.">
  <defs>
    <marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="Inter, sans-serif" font-size="13" fill="currentColor">
    <rect x="10" y="55" width="120" height="40" rx="8" fill="none" stroke="currentColor" opacity="0.6"/>
    <text x="70" y="79" text-anchor="middle">Fixture ends</text>

    <line x1="130" y1="75" x2="215" y2="75" stroke="currentColor" marker-end="url(#arrow2)"/>

    <rect x="220" y="55" width="140" height="40" rx="8" fill="none" stroke="currentColor"/>
    <text x="290" y="79" text-anchor="middle">2 external APIs</text>

    <line x1="360" y1="75" x2="445" y2="75" stroke="currentColor" marker-end="url(#arrow2)"/>

    <rect x="450" y="40" width="150" height="70" rx="8" fill="none" stroke="currentColor"/>
    <text x="525" y="68" text-anchor="middle">SQL schema</text>
    <text x="525" y="85" text-anchor="middle" font-size="11" opacity="0.7">12 tables</text>

    <line x1="600" y1="75" x2="660" y2="75" stroke="currentColor" opacity="0.5"/>
    <line x1="525" y1="110" x2="525" y2="135" stroke="currentColor" opacity="0.5" marker-end="url(#arrow2)"/>
    <rect x="440" y="135" width="170" height="0" stroke="none"/>
    <text x="525" y="145" text-anchor="middle" font-size="12">Power BI dashboard</text>
  </g>
</svg>
<p class="diagram-caption">On-demand refresh after each fixture: two APIs, a 12-table schema, one dashboard.</p>
</div>

## Results

- 38+ matches covered with xG and per-player advanced stats, not just scorelines
- 12-table relational schema modeling matches, shot events, lineups, transfers and standings
- Zero manual steps between a fixture ending and the dashboard reflecting it

## What I learned

The hardest part wasn't the dashboard, it was the schema. Getting lineups, transfers and shot-events to join cleanly across a full season took more iteration than any single visual in the report.

## Stack

SQL, Python, Power BI, REST APIs

<p class="callout"><strong>Note</strong> No club crest, badge or other official branding is used on this page or in the dashboard shown here.</p>
