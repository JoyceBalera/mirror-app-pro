
# Fix: Big Five Score Consistency and Validation

## Problem Found

Luciana's Big Five results showed scores of 400+ (max is 300) and "Indefinido" classifications. Root causes:

1. **Corrupted scores in DB** -- Already fixed by running the recalculate function. The correct scores are now stored.
2. **Key mismatch between save and read paths** -- `Index.tsx` saves trait keys using full Portuguese names from `traitInfo` (e.g., `"abertura a experiencia"`), but `BigFiveResults.tsx` and `recalculate-results` expect short names (e.g., `"abertura"`). This inconsistency can cause data not to display or to be mismatched.
3. **No validation** -- There is no guard to prevent impossible scores (above 300 for traits, above 50 for facets) from being stored.

## Changes

### 1. Fix key mismatch in `src/pages/Index.tsx`

Change the trait key used when saving results to use the same short Portuguese names that the rest of the system expects:

```text
Before: acc[result.name.toLowerCase()] = result.score
  -> "abertura a experiencia", "neuroticismo", etc.

After: acc[TRAIT_NAME_MAP[trait]] = score
  -> "abertura", "neuroticismo", "extroversao", "amabilidade", "conscienciosidade"
```

This aligns with the `recalculate-results` edge function and `BigFiveResults.tsx`'s `normalizeTraitKey`.

Apply the same fix to the facet_scores and classifications save blocks.

### 2. Add score validation in `src/utils/scoreCalculator.ts`

Add a `validateAndCapScores` function that clamps trait scores to 60-300 and facet scores to 10-50. This prevents impossible values from ever being displayed or stored, even if a bug reappears.

### 3. Apply validation in `src/pages/Index.tsx`

Call `validateAndCapScores` after `calculateScore` in both the `handleAnswer` (last question) and `calculateResults` code paths, before saving to the database.

### 4. Fix `BigFiveResults.tsx` facet classification inconsistency

The results page at line 22-26 uses a 3-level classification (Baixa/Media/Alta) that differs from the official 5-level system in `scoreCalculator.ts` (Muito Baixo/Baixo/Medio/Alto/Muito Alto). Update it to use the imported `getScoreFacetClassification` consistently.

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Use consistent short PT trait keys when saving, add validation |
| `src/utils/scoreCalculator.ts` | Add `validateAndCapScores` helper |
| `src/pages/app/BigFiveResults.tsx` | Use 5-level facet classification consistently |

**Total: 3 files, no database migration needed**

## What is already done

- Luciana's scores have been recalculated and corrected in the database via the `recalculate-results` edge function.
