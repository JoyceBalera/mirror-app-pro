

# Fix Human Design Calculation: Lunar Nodes and Missing Pluto

## Problem Summary

After comparing Luciana Belenton's chart on the reference platform (aHumanDesign.com) with our platform, two critical calculation errors were identified:

### Issue 1: Lunar Node Calculation is Wrong
The North Node and South Node positions are significantly off, producing completely different gate activations:

| Planet | Correct (Reference) | Our Platform |
|--------|---------------------|-------------|
| Design North Node | Gate 10, Line 1 | Gate 11, Line 5 |
| Design South Node | Gate 15, Line 1 | Gate 12, Line 5 |
| Personality North Node | Gate 26, Line 6 | Gate 11, Line 1 |
| Personality South Node | Gate 45, Line 6 | Gate 12, Line 1 |

This means the chart shows gates 11 and 12 activated when they should not be, and is missing gates 10, 15, 26, and 45 from node activations. For this user the channels and defined centers coincidentally match, but for other users this could produce completely wrong Types, Authorities, and Definitions.

### Issue 2: Pluto is Not Included
Our calculator uses 12 celestial bodies (Sun, Earth, Moon, North Node, South Node, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune) but Human Design uses 13 -- Pluto is missing. The reference shows Pluto activating gate 18 for this user.

## Root Cause Analysis

### Lunar Nodes
The current implementation in `humanDesignCalculator.ts` uses a custom approximation formula (`calculateLunarNodeApprox`) based on Meeus' mean longitude with nutational corrections. However, this formula is producing results that are off by many degrees compared to the reference. The issue is likely that the formula calculates a "Mean Node" (or a poorly corrected True Node) rather than the actual "True North Node" used in Human Design.

The `astronomy-bundle` library does not provide a built-in Lunar Node function, so we need a more accurate calculation -- either improving the Meeus formula with full perturbation terms, or using a different algorithmic approach (e.g., Swiss Ephemeris-quality calculations).

### Pluto
The `astronomy-bundle` library does not include Pluto (it was removed from the main planets module). We need to either calculate Pluto's position using a polynomial approximation or integrate a different data source.

## Implementation Plan

### Step 1: Fix Lunar Node Calculation
**File: `src/utils/humanDesignCalculator.ts`**

Replace the current `calculateLunarNodeApprox` function with a high-precision True North Node calculation using the full series of periodic terms from Meeus Chapter 47 (Nutation and the Obliquity of the Ecliptic). The key improvement is applying the complete set of 62+ periodic correction terms to the mean longitude of the ascending node, rather than just the 5 main terms currently used.

Alternatively, implement the calculation using the Moon's orbital elements approach:
- Calculate the mean longitude of the ascending node (omega)
- Apply the full set of periodic perturbation corrections (not just 5 terms)
- The True Node oscillates around the Mean Node by up to ~1.7 degrees

### Step 2: Add Pluto Calculation  
**File: `src/utils/humanDesignCalculator.ts`**

Add Pluto to the PLANETS array and implement a polynomial approximation for Pluto's ecliptic longitude. Since Pluto moves very slowly (~0.01 degrees/day), a polynomial fit covering the relevant date range (1920-2050) can achieve sufficient accuracy for gate determination (within ~0.5 degrees).

### Step 3: Validate Against Reference
**File: `src/utils/__tests__/humanDesignCalculator.test.ts`**

Add test cases comparing our calculated positions against the reference chart for Luciana Belenton:
- Verify all 13 planetary gate/line values match the reference
- Verify activated gates list matches
- Verify channels, centers, type, authority, profile all match

## Technical Details

### Files to modify:
- `src/utils/humanDesignCalculator.ts` -- Fix lunar node formula, add Pluto planet and calculation
- `src/utils/__tests__/humanDesignCalculator.test.ts` -- Add validation test cases

### Key considerations:
- The `longitudeToGate` function uses MANDALA_OFFSET of 302.0 degrees, which has been validated as correct for all other planets -- no change needed there
- The 88-degree solar arc Design Date calculation is also correct -- no change needed
- After fixing, existing users' charts in the database will still have the old (wrong) data; a recalculation may be needed for existing results
- The bodygraph rendering code (HDBodyGraph.tsx) is correct -- it faithfully renders whatever data it receives, so fixing the calculation is the only change needed for the visual to be correct

### Impact on existing data:
After deploying the fix, existing Human Design results in the database will still contain the old incorrect gate activations. Users would need to recalculate their charts (there is already a "Recalculate" button on the results page) to get corrected results.

