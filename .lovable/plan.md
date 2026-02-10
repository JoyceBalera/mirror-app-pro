
## Fix Remaining i18n Bugs in Human Design

### 1. Translate BodyGraph Legend (HDBodyGraph.tsx)

The legend in the SVG has 5 hardcoded Portuguese strings. The component needs to accept translated labels via props (since it's an SVG component, using hooks directly adds complexity).

**Changes to `HDBodyGraph.tsx`:**
- Add a `legendLabels` prop with keys: `design`, `personality`, `both`, `definedCenter`, `undefined`
- Replace hardcoded text in `renderLegend()` with these props

**Changes to `DesenhoHumanoResults.tsx`:**
- Pass `legendLabels` prop to `HDBodyGraph` using `t()` translations

**New translation keys** (in all 3 locale files):
```
"bodygraphLegend": {
  "design": "Design (Unconscious)" / "Design (Inconsciente)" / "Design (Inconsciente)",
  "personality": "Personality (Conscious)" / "Personalidade (Consciente)" / "Personalidad (Consciente)",
  "both": "Both" / "Ambos" / "Ambos",
  "definedCenter": "Defined Center" / "Centro Definido" / "Centro Definido",
  "undefined": "Undefined" / "Indefinido" / "Indefinido"
}
```

### 2. Add LanguageSwitcher to Results Header

The header at line 548-565 of `DesenhoHumanoResults.tsx` has a spacer `<div className="w-20" />` on the right side. Replace it with the `LanguageSwitcher` component (compact variant) styled for the dark header background.

### 3. Translate Incarnation Cross

At line 597, `result.incarnation_cross` is displayed raw from the database (always in Portuguese). Add a translation mapping for common Incarnation Cross names in all 3 locale files under a `hdCrosses` key, and use a helper function `tv()` or a new dedicated helper to translate the cross name with a fallback to the raw value.

**New translation keys** (common crosses):
```
"hdCrosses": {
  "Cruz do Inesperado": "Cross of the Unexpected" (EN) / "Cruz de lo Inesperado" (ES),
  "Cruz da Explicação": "Cross of Explanation" / "Cruz de la Explicación",
  ... (cover all 192 crosses or the most common ones)
}
```

Since there are 192 possible Incarnation Crosses, a practical approach is to create a lookup object in a new data file (`src/data/humanDesignCrosses.ts`) with all cross translations, rather than putting them in the JSON locale files. The component will import this and look up the translation by the Portuguese key.

### Technical Details

**Files to modify:**
- `src/components/humandesign/HDBodyGraph.tsx` -- add `legendLabels` prop
- `src/pages/DesenhoHumanoResults.tsx` -- import LanguageSwitcher, pass legend props, translate cross
- `src/locales/pt/translation.json` -- add `bodygraphLegend` keys
- `src/locales/en/translation.json` -- add `bodygraphLegend` keys
- `src/locales/es/translation.json` -- add `bodygraphLegend` keys

**New file to create:**
- `src/data/humanDesignCrosses.ts` -- cross name translations for PT/EN/ES (all 192 crosses)
