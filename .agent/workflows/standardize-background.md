---
description: how to standardize the background layer for any page in the project
---

When the user asks to "standardize background" or "fix background" for a page, follow these steps to ensure it matches the site-wide "Liquid Tech" identity:

1. **Verify Component**:
   Ensure you use the standardized `AestheticBackground` component located at `src/components/AestheticBackground.tsx`.

   > [!IMPORTANT]
   > This component unifies the `site-backdrop` gradients, the `GrainedNoise` texture, and the CRT scanlines. Individual injection of these elements is discouraged.

2. **Implementation**:
   - **Import**: `import AestheticBackground from '@/components/AestheticBackground';` (adjust path as necessary).
   - **Root Styling**: The page's root `div` or `main` tag must be set to `bg-transparent` and `relative`.
   - **Placement**: Place the `<AestheticBackground />` as a child of the root container. It uses `fixed inset-0`, so it will cover the entire viewport.

3. **Calibration**:
   - **Scanlines**: Pass `showScanlines={true}` for main dashboard or industrial-themed pages.
   - **Scanline Opacity**: Use `opacity-10` for standard pages and `opacity-15` for checkout or high-contrast utility pages.
   - **Customization**: Use the `className` prop for any additional z-index or positioning adjustments if necessary (though usually not required).

4. **Example Structure**:
   ```tsx
   export default function MyPage() {
     return (
       <div className="min-h-screen bg-transparent relative ...">
         {/* Use standardized background component */}
         <AestheticBackground showScanlines={true} scanlineOpacity="opacity-10" />

         {/* Content Layer (Must be relative and have z-index if needed) */}
         <div className="relative z-10">
           ...
         </div>
       </div>
     );
   }
   ```

5. **Verification**:
   Confirm that the radial gradients (surgical red/analog orange), noise grain, and scanlines are visible and synchronized with the **Homepage** and **Checkout** views.
