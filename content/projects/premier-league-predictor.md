---
title: Premier League Outcome Predictor
summary: Predicting Premier League results from scratch, with no prediction APIs.
year: "2026"
featured: true
order: 1
stack: [Python, SQL, SQLite, XGBoost, LightGBM, scikit-learn]
github: ""
demo: ""
report: ""
---

## The problem

Match prediction services exist, but they're black boxes. I wanted to know whether I could build the whole thing myself, end to end, from raw public data to calibrated title and relegation probabilities, without touching a single prediction API.

## What I built

An ETL/SQL pipeline that ingests three separate public sources into a single SQLite warehouse:

- **9,880** historical matches
- **224,741** Elo-rating records
- **4,560** team-match xG records

<div class="diagram">
<svg viewBox="0 0 720 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pipeline: three public sources feed an ETL process into a SQLite warehouse, which feeds model benchmarking and a Monte Carlo simulation.">
  <defs>
    <marker id="arrow1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="Inter, sans-serif" font-size="13" fill="currentColor">
    <rect x="10" y="20" width="120" height="36" rx="8" fill="none" stroke="currentColor" opacity="0.5"/>
    <text x="70" y="42" text-anchor="middle">Matches</text>
    <rect x="10" y="62" width="120" height="36" rx="8" fill="none" stroke="currentColor" opacity="0.5"/>
    <text x="70" y="84" text-anchor="middle">Elo ratings</text>
    <rect x="10" y="104" width="120" height="36" rx="8" fill="none" stroke="currentColor" opacity="0.5"/>
    <text x="70" y="126" text-anchor="middle">xG records</text>

    <line x1="130" y1="38" x2="230" y2="70" stroke="currentColor" opacity="0.5" marker-end="url(#arrow1)"/>
    <line x1="130" y1="80" x2="230" y2="80" stroke="currentColor" opacity="0.5" marker-end="url(#arrow1)"/>
    <line x1="130" y1="122" x2="230" y2="90" stroke="currentColor" opacity="0.5" marker-end="url(#arrow1)"/>

    <rect x="235" y="55" width="130" height="50" rx="8" fill="none" stroke="currentColor"/>
    <text x="300" y="85" text-anchor="middle">ETL / SQL</text>

    <line x1="365" y1="80" x2="450" y2="80" stroke="currentColor" marker-end="url(#arrow1)"/>

    <rect x="455" y="55" width="130" height="50" rx="8" fill="none" stroke="currentColor"/>
    <text x="520" y="80" text-anchor="middle">SQLite</text>
    <text x="520" y="97" text-anchor="middle" font-size="11" opacity="0.7">warehouse</text>

    <line x1="520" y1="105" x2="520" y2="135" stroke="currentColor" opacity="0.5" marker-end="url(#arrow1)"/>
    <rect x="440" y="135" width="160" height="20" rx="6" fill="none" stroke="currentColor" opacity="0.5"/>
    <text x="520" y="150" text-anchor="middle" font-size="11">Models + Monte Carlo</text>
  </g>
</svg>
<p class="diagram-caption">Three public sources merged into a SQLite warehouse, then modeled and simulated.</p>
</div>

I benchmarked three model families: Logistic Regression, XGBoost and LightGBM. The winning model reached a **log loss of ≈1.008** on held-out matches, against a bookmaker benchmark of **≈0.996**, close enough to be meaningful without any market data as an input.

To sanity-check it beyond a single metric, I backtested the model on the season already played: it correctly identified the 2025-26 champion and both relegated teams.

Finally, I ran a **Monte Carlo simulation** of thousands of simulated seasons to turn a single prediction into a distribution: title, top-4 and relegation probabilities for every club in the league.

## Results

- Log loss ≈1.008, within ~1.2% of the bookmaker benchmark, using only public historical data
- Correct backtest on champion and relegation outcomes for the most recent completed season
- A full probability table for every club, refreshed from the simulation rather than a single point estimate

## What I learned

Getting a model "close to the market" is mostly a data-engineering problem before it's a modeling one: cleaning and joining three inconsistent public sources correctly mattered more than the choice between XGBoost and LightGBM.

## Stack

Python, SQL, SQLite, XGBoost, LightGBM, scikit-learn
