

# Fix: definedCenters sending array indices instead of center names

## Root Cause

The `centers` data has two different formats depending on how it was saved:

1. **Original save path** (`DesenhoHumanoTest.tsx` lines 178): Saves `chart.centers` directly as an **array** of objects: `[{ id: 'head', defined: true, ... }, { id: 'ajna', defined: false, ... }]`. When stored in the database, `Object.entries()` on this produces keys `"0"`, `"1"`, `"2"` (array indices).

2. **Recalculate path** (`DesenhoHumanoResults.tsx` lines 366-369): Correctly converts to a **key-value object**: `{ head: true, ajna: false, ... }`. After recalculation, `Object.entries()` gives proper `"head"`, `"ajna"` keys.

So users who recalculated their chart have correct data, but users who only generated once have array-format data.

## Changes

### 1. Fix the save path in both `DesenhoHumanoTest.tsx` files

Convert `chart.centers` (array) to a `Record<string, boolean>` before saving, matching the recalculate logic:

```
// Before (broken)
centers: chart.centers as unknown as any,

// After (correct)
const centersData: Record<string, boolean> = {};
chart.centers.forEach(center => {
  centersData[center.id] = center.defined;
});
// ...
centers: centersData,
```

This applies to:
- `src/pages/app/DesenhoHumanoTest.tsx` (line 178)
- `src/pages/DesenhoHumanoTest.tsx` (line 115)

### 2. Fix the read path in `DesenhoHumanoResults.tsx`

Make the `handleGenerateAnalysis` function handle **both** data formats (array and object), so existing data in the database still works:

```
// Handle both formats: array of objects OR key-value object
let definedCenters: string[];
let openCenters: string[];

if (Array.isArray(result.centers)) {
  // Array format: [{ id: 'head', defined: true }, ...]
  definedCenters = result.centers
    .filter((c: any) => c.defined)
    .map((c: any) => c.id);
  openCenters = result.centers
    .filter((c: any) => !c.defined)
    .map((c: any) => c.id);
} else {
  // Object format: { head: true, ajna: false, ... }
  definedCenters = Object.entries(result.centers || {})
    .filter(([_, isDefined]) => isDefined)
    .map(([centerId]) => centerId);
  openCenters = Object.entries(result.centers || {})
    .filter(([_, isDefined]) => !isDefined)
    .map(([centerId]) => centerId);
}
```

Also fix the same pattern at line 461-463 (the `definedCenters` used for rendering the BodyGraph).

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/app/DesenhoHumanoTest.tsx` | Convert centers array to object before saving |
| `src/pages/DesenhoHumanoTest.tsx` | Same conversion (legacy route) |
| `src/pages/DesenhoHumanoResults.tsx` | Handle both array and object formats when reading centers |

**Total: 3 files, no database migration needed**

