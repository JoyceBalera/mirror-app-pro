

## Problem Identified

The Big Five results page (`src/pages/app/BigFiveResults.tsx`) is missing two things:

1. **Facets are not displayed** -- The page only renders the 5 main trait bars (Neuroticismo, Extroversao, etc.) but never renders the individual facets (6 per trait). The data exists in the database and is even prepared by `getFormattedTraitScores()`, but that function is only used for the AI analysis, not for the UI.

2. **"Abertura a Experiencia" IS present** in the database and should be rendering as a trait bar. If it's not appearing, it may be a label mapping issue since the DB key is `"abertura a experiencia"` (full name) while `normalizeTraitKey` only maps to `"abertura"` (short form).

Both issues are purely frontend -- the database has all the correct data.

## Plan

### 1. Add facet display section under each trait bar

Below each trait's progress bar in the "Trait Scores" card, add a collapsible or always-visible grid of facets (similar to the pattern in `src/components/Results.tsx`), showing:
- Facet name (using `FACET_NAMES` mapping)
- Facet score
- Classification (recalculated via `getScoreFacetClassification`)
- Color indicator dot

### 2. Fix trait label mapping

Update the `normalizeTraitKey` function and `getTraitLabel` to handle the full key `"abertura a experiencia"` correctly, mapping it to the display label "Abertura a Experiencia".

---

### Technical Details

**File**: `src/pages/app/BigFiveResults.tsx`

**Change 1 -- Fix label mapping** (around line 26):
Add `"abertura a experiencia": "abertura"` to the `normalizeTraitKey` map so the full DB key resolves correctly.

**Change 2 -- Render facets** (after line 356, inside the trait loop):
Add a grid rendering `result.facet_scores[trait]` entries with:
- Name from `FACET_NAMES[facetKey]` or fallback to the raw key
- Score value
- Classification from `getScoreFacetClassification(score)`
- Color dot based on classification

This follows the same visual pattern already used in `src/components/Results.tsx` (the older results component).
