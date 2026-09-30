---
title: Flight Delay Data Warehouse & Analysis
summary: A dimensional data warehouse that turns raw flight data into delay analysis, airport clustering and delay prediction.
year: "2025"
featured: false
order: 6
stack: [Apache NiFi, MySQL, Python, Power BI, scikit-learn]
github: ""
demo: ""
report: ""
---

## The problem

A flight delay is never caused by one thing — it's weather, the airport, the aircraft, the airline and the time of year all at once. A single average delay number hides all of that. I wanted a proper decision-support system: a warehouse that could hold flight, weather and airport data together, and let you explore *why* delays happen by route, carrier, airport and cause, rather than collapsing everything into one figure.

## What I built

A **dimensional data warehouse** in MySQL, populated by an **Apache NiFi** ETL pipeline, with Power BI on top for exploration and a Python analytics layer for the harder questions.

The warehouse follows a snowflake schema: a central `Viagem` (trip) fact table at the grain of a single flight, surrounded by six dimensions — Time, Airline, Airport, Aircraft, Weather and Flight. The NiFi pipeline runs in layers — raw staging, a preparation/cleaning layer, then the production warehouse — so bad and good records stay separate and every value is traceable back to its source.

<div class="diagram">
<svg viewBox="0 0 720 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three public sources are ingested by an Apache NiFi ETL into a MySQL snowflake warehouse, which feeds Power BI dashboards and a Python analytics layer for clustering and prediction.">
  <defs>
    <marker id="arrowF" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="Inter, sans-serif" font-size="12" fill="currentColor">
    <rect x="8" y="18" width="130" height="30" rx="8" fill="none" stroke="currentColor" opacity="0.55"/>
    <text x="73" y="38" text-anchor="middle">Kaggle flights</text>
    <rect x="8" y="66" width="130" height="30" rx="8" fill="none" stroke="currentColor" opacity="0.55"/>
    <text x="73" y="86" text-anchor="middle">Open-meteo API</text>
    <rect x="8" y="114" width="130" height="30" rx="8" fill="none" stroke="currentColor" opacity="0.55"/>
    <text x="73" y="134" text-anchor="middle">OpenFlights</text>

    <line x1="138" y1="33" x2="205" y2="75" stroke="currentColor" opacity="0.55" marker-end="url(#arrowF)"/>
    <line x1="138" y1="81" x2="205" y2="81" stroke="currentColor" opacity="0.55" marker-end="url(#arrowF)"/>
    <line x1="138" y1="129" x2="205" y2="87" stroke="currentColor" opacity="0.55" marker-end="url(#arrowF)"/>

    <rect x="207" y="61" width="110" height="40" rx="8" fill="none" stroke="currentColor"/>
    <text x="262" y="85" text-anchor="middle">NiFi ETL</text>

    <line x1="317" y1="81" x2="357" y2="81" stroke="currentColor" marker-end="url(#arrowF)"/>

    <rect x="359" y="56" width="130" height="50" rx="8" fill="none" stroke="currentColor"/>
    <text x="424" y="78" text-anchor="middle">MySQL warehouse</text>
    <text x="424" y="95" text-anchor="middle" font-size="10" opacity="0.7">snowflake · 6 dims</text>

    <line x1="489" y1="70" x2="560" y2="40" stroke="currentColor" marker-end="url(#arrowF)"/>
    <line x1="489" y1="92" x2="560" y2="122" stroke="currentColor" marker-end="url(#arrowF)"/>

    <rect x="562" y="22" width="150" height="36" rx="8" fill="none" stroke="currentColor"/>
    <text x="637" y="44" text-anchor="middle">Power BI dashboards</text>
    <rect x="562" y="104" width="150" height="36" rx="8" fill="none" stroke="currentColor"/>
    <text x="637" y="120" text-anchor="middle" font-size="11">Clustering +</text>
    <text x="637" y="133" text-anchor="middle" font-size="11">delay prediction</text>
  </g>
</svg>
<p class="diagram-caption">Kaggle, Open-meteo and OpenFlights → NiFi ETL → a MySQL snowflake warehouse → Power BI and a Python analytics layer.</p>
</div>

The data came from real public sources: the Kaggle *Flight Delay and Cancellation* dataset (2019–2023), a Kaggle airline database of 5,000+ carriers, the Open-meteo API for weather, and OpenFlights for airports. Where weather records were missing I inferred them from the reported delay causes rather than dropping the rows.

On top of the warehouse I built two Python layers:

- **Airport segmentation** — K-Means clustering (with PCA for dimensionality reduction, and the elbow and silhouette methods to pick *k*) grouped airports into six operational profiles, from "planned, high-diversity" hubs to regional and adverse-conditions airports.
- **A cascade recommender** — cluster filtering, then quantitative filtering, then a gradient-boosted regression model (XGBoost/LightGBM) to estimate expected delay and rank airports, so the system could recommend lower-risk options for a given route and conditions.

The Power BI dashboards sit over the same warehouse: delays by origin/destination, cancelled vs diverted flights, average and >30-minute delays per airline, and delay causes broken down by weather, security and prior-flight knock-on effects.

## Results

- Six-dimension snowflake warehouse at single-flight grain, populated end to end through a layered NiFi pipeline
- Six data-driven airport profiles from clustering, each with a distinct operational signature
- Interactive Power BI dashboards that make delay *causes* explorable rather than summarized to a single number
- A cascade recommender that ranked airports by expected delay with strong fit on held-out data

## What I learned

The modeling was the easy part; the pipeline was where the real work was. Joining five inconsistent public sources — different keys, formats and update cadences — and keeping staging, history and validation layers clean took far more effort than any single model, and it's exactly that discipline that made the later analysis trustworthy.

## Stack

Apache NiFi, MySQL, Python (Pandas, scikit-learn, XGBoost, LightGBM), Power BI, Jupyter.
