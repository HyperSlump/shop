---
description: how to standardized noise layers in the project
---

When the user asks to "add noise" or "add grain" to an object, component, or page, follow these steps to maintain project aesthetic consistency:

1. **Verify Component**:
   Ensure you use the standardized `GrainedNoise` component located at `src/components/GrainedNoise.tsx`. 
   
   > [!IMPORTANT]
   > Do NOT use external CSS-only noise or URL-based background images (e.g., from `grainy-gradients.vercel.app`).

2. **Implementation**:
   - **Import**: `import GrainedNoise from '@/components/GrainedNoise';` (adjust path as necessary).
   - **Placement**: Place the component inside the target container's background layer. It should usually be an absolute child.
   - **Parent Styling**: Ensure the parent container has `relative` positioning and `overflow-hidden`.
   
3. **Calibration**:
   - **Intensity**: Do NOT add `opacity` classes to the parent container that contains `<GrainedNoise />`. The component is pre-calibrated for the site-wide intensity.
   - **Overlay**: If you need to combine it with other effects (like a scanning CRT line), add them as separate sibling layers over the `GrainedNoise` component.

4. **Example Structure**:
   ```tsx
   <div className="relative overflow-hidden ...">
     {/* Background Content */}
     <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary" />
     
     {/* Standard Noise Layer */}
     <GrainedNoise />
     
     {/* Content */}
     <div className="relative z-10">
       ...
     </div>
   </div>
   ```

5. **Verification**:
   Perform a local build or dev check to ensure the grain density and animation match the **Hero Section** and **Cart Drawer**.
