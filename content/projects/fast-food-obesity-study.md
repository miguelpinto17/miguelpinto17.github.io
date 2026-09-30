---
title: Fast Food and Obesity Study
summary: A geospatial study of US fast-food locations and obesity, mapping where the two line up.
year: "2025–2026"
featured: false
order: 7
stack: [Pandas, SQL, QGIS, GeoPandas, Tableau]
github: ""
demo: ""
report: ""
---

## The problem

The link between fast-food access and obesity is easy to assert and harder to *see*. A national average tells you nothing about where the relationship actually holds. I wanted to treat it as a geospatial question: map US fast-food locations against obesity data and check whether the two line up in space, not just in a summary statistic.

## What I built

A geospatial analysis pipeline over US fast-food restaurant data and obesity indicators.

The raw data needed real work before any map made sense — cleaning and transforming inconsistent records with **Pandas and SQL** so locations and indicators could be joined reliably. I then used **QGIS and GeoPandas** to geolocate the restaurants and analyze the data spatially, layering fast-food density against obesity to look for geographic patterns. Finally I built a **Tableau** dashboard so the findings could be explored interactively by region rather than read off a single chart.

## Results

- A cleaned, joined dataset linking US fast-food locations to obesity indicators
- Geospatial analysis in QGIS/GeoPandas that surfaced a **visible spatial correlation** between fast-food density and obesity
- An interactive Tableau dashboard for exploring the patterns by location

## What I learned

The insight lived in the geography, not the aggregate. Most of the value came from getting the data clean enough to place accurately on a map — once the locations were trustworthy, the spatial correlation was something you could actually see rather than argue about.

## Stack

Pandas, SQL, QGIS, GeoPandas, Tableau.
