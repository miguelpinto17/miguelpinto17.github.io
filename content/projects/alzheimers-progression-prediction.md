---
title: Alzheimer's Progression Prediction
summary: Predicting disease-stage transitions from MRI radiomics, with an ensemble tuned for stability over raw score.
year: "2025–2026"
featured: false
order: 4
stack: [Python, scikit-learn]
github: ""
demo: ""
report: ""
---

## The problem

Predicting how Alzheimer's progresses is hard partly because the data is wide and messy: hundreds of MRI-derived features per patient, many of them redundant, and relatively few patients. The temptation is to chase the best score on one split, but a model that overfits a small, high-dimensional dataset is useless. I wanted a model that predicted stage transitions *stably* — one that would generalize rather than win a single train/test lottery.

## What I built

An end-to-end classification pipeline over an MRI **radiomics** dataset — **305 training** and **100 test** records with **2,181 features** each, extracted from imaging with tools like PyRadiomics.

Most of the effort went into the data, not the model:

- Confirmed there were no missing values or duplicate rows, then counted outliers directly (the feature count made box-plots unreadable)
- Dropped constant and redundant columns that only added processing cost with no signal
- **Feature engineering** on coordinate-tuple columns, splitting each `(x, y, z)` into its own feature
- Down-cast `float64`/`int64` to `float32`/`int32` to shrink the dataset and speed up training
- Removed non-informative identifier/hash columns left over from the extraction step

On the cleaned data I tuned **four supervised models — Random Forest, SVM, Gradient-Boosted Trees and a Max Voting ensemble** — with `GridSearchCV`, then combined the strongest models into the **Max Voting ensemble** so that no single model's variance drove the prediction.

## Results

- A reproducible pipeline from raw 2,181-feature radiomics data to stage-transition predictions
- A Max Voting ensemble that was more stable than any single tuned model
- Feature engineering and dtype reduction that made the wide dataset tractable to train on

## What I learned

On a small, high-dimensional dataset, stability beats peak accuracy. Careful feature pruning and an ensemble that averages out individual models' variance generalized better than pushing any one classifier to its best score on a single split.

## Stack

Python, scikit-learn (Random Forest, SVM, Gradient-Boosted Trees, Max Voting, GridSearchCV), Pandas.
