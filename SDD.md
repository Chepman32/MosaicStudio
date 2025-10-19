# Software Design Document: Mosaic Studio

## 1. Executive Summary

**Mosaic Studio** is a premium iOS mobile application for creating stunning photo collages with an emphasis on fluid, gesture-based interactions and captivating animations. Built entirely with React Native, the app operates completely offline, leveraging local storage for all user data and assets. The application monetizes through a carefully crafted In-App Purchase system offering premium templates, effects, and export options.

The app distinguishes itself through physics-based animations powered by React Native Reanimated 3 and React Native Skia, creating a tactile, responsive experience that feels native and delightful. Every interaction—from navigation to photo manipulation—is designed around intuitive gestures, minimizing button taps in favor of swipes, pinches, and long-presses.

---

## 2. Application Architecture

### 2.1 Technology Stack

**Core Framework:**
- React Native 0.73+
- TypeScript for type safety
- React Native New Architecture (Fabric + TurboModules)

**Animation & Graphics:**
- React Native Reanimated 3.x (worklet-based animations, shared values, gesture handling)
- React Native Skia (custom drawing, shader effects, particle systems)
- React Native Gesture Handler 2.x (pan, pinch, rotation, tap gestures)

**State Management:**
- Zustand (lightweight, performant state management)
- MMKV (ultra-fast key-value storage for user preferences)
- React Native MMKV for persistent state

**Media Handling:**
- React Native Image Picker (photo selection from library/camera)
- React Native RNFS (file system operations for offline storage)
- React Native Image Crop Picker (cropping functionality)
- @shopify/react-native-skia (image processing, filters)

**Monetization:**
- React Native IAP (In-App Purchases with StoreKit 2 support)

**Navigation:**
- Custom gesture-based navigation system built on Reanimated + Gesture Handler
- No traditional navigation library (tabs/stacks) to maximize gesture control

**UI Components:**
- React Native Vector Icons (Feather, Ionicons sets)
- Custom components built with Reanimated + Skia

**Storage Architecture:**
- SQLite (react-native-quick-sqlite) for collage projects metadata
- Local file system for cached images and exported collages
- MMKV for app settings and IAP state

### 2.2 Project Structure

```
src/
├── animations/
│   ├── splash/
│   │   ├── PhysicsBreakdownSplash.tsx
│   │   ├── TwistingTextSplash.tsx
│   │   └── LogoParticleSystem.ts
│   ├── transitions/
│   │   ├── PageTransitions.ts
│   │   ├── ModalTransitions.ts
│   │   └── SharedElementTransitions.ts
│   └── gestures/
│       ├── SwipeGestures.ts
│       ├── PinchRotateGestures.ts
│       └── LongPressGestures.ts
├── components/
│   ├── canvas/
│   │   ├── CollageCanvas.tsx
│   │   ├── PhotoLayer.tsx
│   │   └── SkiaRenderer.tsx
│   ├── gestures/
│   │   ├── DraggablePhoto.tsx
│   │   ├── ResizableFrame.tsx
│   │   └── RotatableContainer.tsx
│   ├── overlays/
│   │   ├── FilterSheet.tsx
│   │   ├── TemplateDrawer.tsx
│   │   └── ExportModal.tsx
│   └── common/
│       ├── AnimatedButton.tsx
│       ├── GestureIcon.tsx
│       └── ProgressIndicator.tsx
├── screens/
│   ├── SplashScreen.tsx
│   ├── HomeScreen.tsx
│   ├── EditorScreen.tsx
│   ├── LibraryScreen.tsx
│   └── SettingsScreen.tsx
├── services/
│   ├── storage/
│   │   ├── ProjectManager.ts
│   │   ├── AssetCache.ts
│   │   └── DatabaseService.ts
│   ├── iap/
│   │   ├── PurchaseManager.ts
│   │   └── ProductCatalog.ts
│   ├── export/
│   │   ├── ImageExporter.ts
│   │   └── QualityPresets.ts
│   └── media/
│       ├── PhotoPicker.ts
│       └── ImageProcessor.ts
├── stores/
│   ├── useProjectStore.ts
│   ├── useUIStore.ts
│   └── usePurchaseStore.ts
├── utils/
│   ├── geometry.ts
│   ├── physics.ts
│   └── colorUtils.ts
└── constants/
    ├── animations.ts
    ├── gestures.ts
    └── themes.ts
```

### 2.3 Data Flow Architecture

**Project Data Model:**
```typescript
interface CollageProject {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  thumbnail: string; // base64 or file path
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  layers: PhotoLayer[];
  template: string | null; // template ID if used
}

interface PhotoLayer {
  id: string;
  sourceUri: string; // local file path
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number; // radians
  };
  dimensions: {
    width: number;
    height: number;
  };
  filters: AppliedFilter[];
  opacity: number;
  blendMode: string;
  zIndex: number;
  crop: CropData | null;
  mask: MaskData | null;
}
```

**State Management Flow:**
1. User gesture → Gesture Handler detects
2. Gesture updates shared values (Reanimated)
3. Worklets execute on UI thread (immediate visual feedback)
4. State mutation queued on JS thread
5. Zustand store updated
6. Derived states recalculated
7. Database persistence (debounced)

---

## 3. Detailed Screen Specifications

### 3.1 Animated Splash Screen

**Visual Design:**
The splash screen showcases the Mosaic Studio brand through one of two alternating physics-based animations (randomly selected on app launch).

**Animation Option 1: Physics Breakdown**
- **Initial State:** Complete app logo (stylized mosaic "M" composed of 12 geometric photo-frame shapes) centered on gradient background
- **Background:** Animated gradient transitioning from deep purple (#6B4FE0) to coral (#FF6B9D) using Skia shaders
- **Trigger:** Appears immediately on app open
- **Physics Engine:** Custom Reanimated worklet simulating rigid body physics
- **Breakdown Sequence:**
  - At t=0.3s: Logo fragments separate at collision boundaries
  - Each fragment assigned random velocity vectors (radial explosion pattern)
  - Gravity effect pulls fragments downward (9.8 units/s²)
  - Fragments rotate based on angular momentum
  - Subtle blur increases as fragments accelerate
  - Bounce physics on screen edges (damping coefficient 0.7)
  - Fragments fade out as they exit viewport
  - Duration: 2.1 seconds total
- **Particle Effects:** 50+ small sparkle particles spawn from fragment trails using Skia particle system
- **Completion:** Fragments fully dispersed → smooth fade to Home Screen (0.4s cross-dissolve)

**Animation Option 2: Twisting Text**
- **Initial State:** "MOSAIC STUDIO" text in bold geometric font (similar to Futura Bold), white color, centered
- **Background:** Animated mesh gradient (5x5 grid) with flowing colors (purples, pinks, blues) using Skia PathEffect
- **Text Animation:**
  - Each letter individually animated on Reanimated shared values
  - Enters from random off-screen position with spring physics (damping: 8, stiffness: 100)
  - 3D rotation effect: rotateY animates from -180° to 0°, rotateX from -90° to 0°
  - Letters arrive in staggered sequence (50ms delay between each)
  - Slight overshoot creates playful bounce
  - Once assembled, entire text scales up 1.2x while fading (0.8s)
  - Color transition from white → gradient text effect using Skia LinearGradient
  - Perspective transform creates depth illusion
- **Micro-interactions:** Subtle pulse on each letter (scale 1.0 → 1.05 → 1.0) at 1.2s mark
- **Particle Layer:** Color-matched particles drift upward behind text using Skia drawing
- **Duration:** 2.3 seconds total
- **Completion:** Text dissolves into particles that drift away → fade to Home Screen

**Technical Implementation:**
- Both animations built entirely in Reanimated worklets (UI thread)
- Skia Canvas for all rendering (60fps minimum)
- Shared values drive all transform properties
- Easing functions: spring for physics, easeInOutCubic for text
- Memory-efficient: animations dispose resources immediately on completion
- Loading indicator (subtle pulsing dots) appears only if app initialization exceeds 2.5s

**Transition to Home:**
- Cross-fade duration: 400ms
- Simultaneous scale animation on Home Screen (0.95 → 1.0)
- Gesture-ready immediately on transition completion

---

### 3.2 Home Screen

**Layout Structure:**
The Home Screen adopts a full-screen, immersive card-based interface with gesture-driven navigation.

**Visual Hierarchy:**

**Top Bar (Fixed, translucent blur):**
- Height: 88pt (includes safe area)
- Background: Ultra-thin material blur (iOS frosted glass effect via Skia blur)
- Left element: "Mosaic Studio" wordmark (30pt, medium weight, gradient text)
- Right element: Animated settings icon (https://api.iconify.design/feather:settings.svg)
  - Idle: static gear
  - Tap: rotates 180° with spring animation
  - Visual feedback: scale to 0.9 on press, return with bounce

**Main Content Area (Scrollable vertical gesture):**

**Section 1: Quick Actions Row**
- Horizontal scrollable strip (snap-to-point behavior)
- Height: 140pt
- Card style: Rounded 24pt, gradient backgrounds, elevation shadow
- 3 primary cards with spring animations on press:

1. **"New Blank" Card**
   - Gradient: Soft blue (#A8C5FF) to lavender (#C5A8FF)
   - Icon: Plus symbol in dashed square (60pt)
   - Label: "Blank Canvas" (16pt semibold)
   - Gesture: Tap triggers scale animation (1.0 → 0.95 → 1.05 → 1.0, 300ms) → navigates to Editor with blank canvas
   - Micro-animation: Dashed border rotates slowly (3s per rotation) using Skia PathEffect

2. **"Choose Template" Card**
   - Gradient: Coral (#FFB8A8) to pink (#FFA8D8)
   - Icon: Grid of 4 small photo frames (60pt)
   - Label: "From Template" (16pt semibold)
   - Gesture: Tap → Template Drawer slides up from bottom (500ms spring)
   - Micro-animation: Mini photo frames subtly shuffle positions (loop every 4s)

3. **"AI Layout" Card** (Premium IAP feature)
   - Gradient: Gold (#FFD700) to amber (#FFAA00) if purchased, grayscale if locked
   - Icon: Sparkle/magic wand (60pt)
   - Label: "AI Arrange" (16pt semibold)
   - Lock overlay: Small padlock icon (16pt) bottom-right corner if unpurchased
   - Gesture: Tap → if locked, Premium Sheet slides up; if unlocked, AI selection flow begins
   - Premium badge: Pulsing gold outline (1.5s interval)

**Section 2: Recent Projects Grid**
- Title: "Your Projects" (28pt bold) with count badge
- Grid layout: 2 columns on iPhone, 3 on iPad
- Cell spacing: 16pt horizontal, 20pt vertical
- Padding: 20pt horizontal edges

**Project Card Design:**
- Aspect ratio: 4:5 (portrait orientation)
- Rounded corners: 20pt
- Elevation: 2pt shadow, 50% opacity
- Border: 1pt solid white (10% opacity)
- Content:
  - Thumbnail: Full-bleed collage preview (generated on save)
  - Gradient overlay: Bottom 40% linear gradient (transparent → black 60% opacity)
  - Project name: 18pt semibold, white, bottom-left (12pt padding)
  - Modification date: 12pt regular, white 70% opacity, below name
  - Layer count badge: Top-right, 28pt rounded pill, translucent white background (20% opacity), icon + number

**Project Card Gestures:**
- **Tap:** Scales card 0.98 → ripple effect spreads from tap point → navigates to Editor (opens project)
- **Long Press (0.4s):** Card lifts with parallax shadow (8pt offset) → contextual menu appears below card with blur background:
  - Options: "Rename" | "Duplicate" | "Delete" | "Export"
  - Each option is 54pt tall, icon + label, haptic feedback on tap
  - Menu dismisses on tap outside or on selection
- **Swipe Left on Card:** Reveals delete action (red background with trash icon slides in from right edge, 200ms) → swipe commits delete with confirmation haptic
- **Pan Gesture (drag):** Card follows finger with slight lag (spring physics) → can drag to reorder (position swaps with spring animation) → drop commits new order

**Empty State (No Projects):**
- Centered illustration: Abstract mosaic pattern (rendered with Skia) (200pt diameter)
- Animation: Pattern pieces gently float (parallax motion, different speeds)
- Headline: "Create Your First Collage" (24pt semibold)
- Subtext: "Swipe up to start" (16pt regular, 60% opacity)
- Upward arrow animation: Bouncing arrow below text (loops every 2s)

**Section 3: Template Preview Row**
- Title: "Popular Templates" (22pt semibold) with "See All" link
- Horizontal scroll (momentum-based, snap to items)
- Template cards: 180pt × 240pt, rounded 16pt
- Each card:
  - Template preview render (using Skia, shows layout with placeholder photos from https://picsum.photos/)
  - Template name overlay (bottom, gradient background)
  - Premium badge (gold corner ribbon) if IAP-locked
- Gesture: Tap card → if free, opens Editor with template; if premium, shows Premium Sheet
- Card-to-card spacing: 12pt
- Edge insets: 20pt leading/trailing

**Bottom Tab-like Navigation (Gesture-based):**
Rather than traditional tabs, navigation occurs through gestures:
- **Swipe Right from Left Edge:** Opens Library Screen (slide-in transition, 300ms)
- **Swipe Left from Right Edge:** Opens Settings Screen (slide-in transition, 300ms)
- Visual affordance: Thin gradient bars on left/right edges (2pt wide, pulsing subtly) hint at swipe zones
- Alternative: Bottom floating action bar (72pt tall, rounded pill shape, blur background, 16pt from bottom)
  - Contains 3 icon buttons: Library | Home (highlighted) | Settings
  - Icons animate on press (scale + color change)
  - Sliding indicator (4pt height, 40pt width, rounded) animates to selected icon with spring

**Pull-to-Refresh:**
- Pull down on Home Screen content → custom refresh animation appears
- Animation: Mosaic logo fragments assemble (reverse of splash breakdown) in header area
- Rotation during pull: logo rotates based on pull distance
- Release triggers: refresh completes → fragments settle into logo → bounce out
- Actually refreshes: template list, checks for IAP restoration

**Scrolling Behavior:**
- Top bar remains fixed with blur
- Parallax effect: Quick Actions cards scroll slower than main content (0.7x speed)
- Over-scroll bounce with rubber-band physics
- Scroll velocity affects transition animations (faster scroll = faster transitions)

**Color Scheme & Styling:**
- Background: Deep gradient (#1A1625 → #2D1B3D), animated noise texture overlay (Skia shader)
- Accent color: Vibrant purple (#9B7FFF)
- Text: White primary, white 70% secondary
- Cards: Semi-transparent white backgrounds (5-10% opacity) with blur
- Shadows: Colored shadows matching card gradients (20% opacity, 8pt offset)

**Performance Optimization:**
- Virtual scrolling for project grid (only render visible + 2 rows buffer)
- Thumbnail images lazy-loaded with fade-in (200ms)
- Animation worklets run on UI thread
- Gesture responders attached only to visible elements

---

### 3.3 Template Drawer

**Presentation:**
The Template Drawer is a modal bottom sheet that slides up from the bottom edge of the screen.

**Animation Entry:**
- Trigger: Tap "Choose Template" card on Home
- Sheet enters with spring physics (damping: 15, stiffness: 150)
- Background dims with animated overlay (black, 40% opacity, 300ms ease-in)
- Sheet has grab handle (visual indicator): 36pt wide, 4pt height, rounded pill, centered, white 30% opacity, 12pt from top edge
- Over-scroll resistance: pulling down creates rubber-band effect, releasing dismisses drawer

**Layout:**
- **Header Section (fixed):**
  - Height: 80pt
  - Background: Translucent blur material
  - Title: "Choose Template" (28pt bold, white)
  - Subtitle: "X templates available" (14pt regular, white 60%)
  - Filter chips row (horizontal scroll, bottom of header):
    - Chips: "All" | "Grid" | "Freeform" | "Seasonal" | "Premium"
    - Each chip: 32pt height, rounded pill, tappable
    - Selected state: Gradient background (purple-pink), white text
    - Unselected: Translucent white (15% opacity), white 60% text
    - Tap animation: Scale 0.95 → 1.05 → 1.0 with haptic
    - Selected chip morphs to new selection with liquid animation (shape flows)

- **Content Section (scrollable):**
  - Grid layout: 2 columns on iPhone, 3 on iPad
  - Cell aspect ratio: 3:4
  - Inter-cell spacing: 12pt
  - Padding: 16pt edges

**Template Card Design:**
- Rounded corners: 16pt
- Border: 2pt solid white (0% opacity default, 40% on press)
- Shadow: 4pt offset, 30% opacity
- Background: Card shows template preview (rendered with Skia, uses example images from https://picsum.photos/200/300)
- Template structure overlay: Thin white lines (1pt, 30% opacity) showing frame divisions
- Hover/Press state: Card lifts (scale 1.02, shadow increases) with spring animation

**Card Content:**
- Template preview (full-bleed render)
- Bottom info bar (gradient overlay, white text):
  - Template name (14pt semibold)
  - Photo count badge (icon + number, 12pt)
  - Premium lock icon (12pt, gold) if IAP-locked
- Checkmark indicator (top-right, 24pt circle, gradient background) animates in when selected

**Template Categories:**

1. **Grid Templates:**
   - Classic grid layouts: 2×2, 3×3, 2×3, 4-column, etc.
   - Equal-sized frames
   - Tight or spaced options
   - 15+ variations

2. **Freeform Templates:**
   - Asymmetric layouts with varied frame sizes
   - Overlapping elements
   - Creative arrangements
   - 20+ variations

3. **Seasonal Templates:**
   - Holiday-themed layouts (Christmas, Halloween, birthdays, etc.)
   - Decorative frame shapes (hearts, stars, circles)
   - Special occasion templates
   - 12+ variations (free + premium)

4. **Premium Templates:**
   - Complex multi-layer designs
   - Artistic frame arrangements
   - Advanced masking effects
   - 25+ exclusive layouts (IAP-required)

**Gesture Interactions:**
- **Tap Template Card:** 
  - Card animates (scale 1.0 → 0.98 → 1.02 → 1.0, 400ms)
  - If free: Checkmark appears (scale + rotate animation)
  - If premium & locked: Premium Sheet slides up from bottom (500ms)
  - If premium & unlocked: Checkmark appears
  - After 300ms: Drawer dismisses with slide-down animation
  - Transition to Editor: Selected template data passed, Editor opens with template frames pre-rendered

- **Long Press Template Card:**
  - Card lifts higher (scale 1.08, shadow expands)
  - Quick preview modal appears (centered overlay, 80% screen width)
  - Modal shows larger template preview with "Use Template" button
  - Tap outside or swipe down dismisses preview
  - Haptic feedback (medium impact) on long press start

- **Swipe Down on Drawer:**
  - Follows finger with immediate response (gesture-driven animation)
  - Dismiss threshold: 100pt or swipe velocity > 500pt/s
  - Below threshold: springs back to full height
  - Above threshold: accelerates downward and dismisses
  - Background overlay fades in sync with drawer position

- **Swipe Between Filter Chips:**
  - Horizontal swipe on chip row scrolls smoothly (momentum)
  - Can fling with velocity (decays naturally)
  - Snap to chip alignment (optional)

**Filter Behavior:**
- Tap chip → content grid fades out (200ms) → filter applied → new content fades in with stagger effect (each card appears 30ms after previous)
- Grid layout animates: cards morph positions if layout changes (spring animation on x/y)
- Scroll position resets to top smoothly (animated scroll)

**Empty State (No Templates in Filter):**
- Centered icon: Empty grid illustration (120pt, gray)
- Text: "No templates here yet" (18pt semibold)
- Subtext: "Try another category" (14pt regular, 60% opacity)

**Performance:**
- Template previews pre-rendered and cached (regenerated only on template update)
- Lazy loading: renders visible cards + 6-card buffer
- Blur background uses efficient iOS API via Skia
- Dismissal animation runs entirely on UI thread

---

### 3.4 Editor Screen

The Editor Screen is the core of Mosaic Studio, where users compose their collages through direct manipulation and gesture-based controls.

**Layout Architecture:**

**Canvas Area (Primary):**
- Occupies full screen with UI overlays on top/bottom
- Background: User-selectable (solid colors, gradients, textures, or photo)
- Default: Soft gray (#F5F5F7) with subtle noise texture
- Canvas bounds: Visual indicators (thin dashed outline, white 20% opacity, 1pt width) appear briefly when photo approaches edge
- Workspace aspect ratio: Auto-detects from template or defaults to square (1:1), adjustable in settings

**Top Toolbar (Floating, Translucent):**
- Position: Top edge, full-width, 88pt height (includes safe area)
- Background: Ultra-thin blur material (frosted glass effect)
- Left section:
  - Back button: "<" chevron icon (28pt), tap returns to Home with slide-right transition
  - Undo button: Curved arrow icon (24pt), shows undo stack depth (small badge with number)
  - Redo button: Curved arrow icon (24pt), enabled when redo stack exists
- Center section:
  - Project name (18pt semibold, truncated with ellipsis)
  - Tap to rename: text field slides in with keyboard, done/cancel buttons
- Right section:
  - Export button: Share icon (24pt), opens Export Modal
  - More button: Three-dot menu icon (24pt), opens contextual menu

**Button Animation:**
- All toolbar buttons: Scale 0.9 on press, spring back to 1.0
- Disabled state: 30% opacity, no interaction
- Active state (e.g., selected tool): Subtle pulsing glow (scale 1.0 → 1.05 → 1.0, 2s loop)

**Bottom Control Bar (Floating, Dynamic):**
- Position: Bottom edge, centered, 68pt height, 92% screen width
- Background: Pill-shaped, rounded 34pt, translucent blur, white 10% opacity
- Shadow: 8pt elevation, 40% opacity
- Content adapts based on current mode/selection

**Default State (No Selection):**
- 4 primary action buttons (evenly spaced):
  1. **Add Photos:** Plus icon inside photo frame (28pt)
  2. **Templates:** Grid icon (28pt)
  3. **Backgrounds:** Color palette icon (28pt)
  4. **Layers:** Stack icon with number badge (28pt)
- Button press: Scale 0.85 → 1.1 → 1.0, haptic feedback (light)

**Photo Selected State:**
- Control bar morphs (shape animation, 400ms spring) to show editing tools:
  1. **Filters:** Wand icon (24pt)
  2. **Crop:** Crop frame icon (24pt)
  3. **Flip:** Horizontal/vertical flip icons (24pt)
  4. **Delete:** Trash icon (24pt, red tint)
  5. **More:** Three-dot icon (opens additional options)
- Transformation handles visible on selected photo (see Photo Manipulation section)

**Canvas Gestures & Interactions:**

**Adding Photos:**
- Tap "Add Photos" button → Photo Picker modal appears (native iOS sheet)
- Multi-select enabled (up to 30 photos per collage)
- Selected photos animate onto canvas:
  - Each photo appears from center, scaling from 0 to 1.0 with spring
  - Photos auto-arrange in spiral pattern or grid (based on template)
  - Staggered animation (80ms delay between each photo)
  - Photos slightly overlap on arrival, then spring to proper positions

**Photo Manipulation (Direct Manipulation):**

**Transform Handles:**
- Selected photo highlighted with thin white border (2pt, 80% opacity) and corner handles
- 4 corner handles: White circles (40pt diameter, 20pt visible, rest outside photo bounds)
- Corner handles have drop shadow and subtle gradient
- Rotation handle: Extended 60pt above top-center, circular grip (32pt diameter)

**Gesture 1: Move (Pan)**
- Single finger drag anywhere on photo
- Photo follows finger with 1:1 tracking (no lag)
- Simultaneous shadow movement: shadow translates in opposite direction (parallax effect)
- Visual feedback: Photo lifts (scale 1.05, shadow expands)
- Other photos slightly dodge (subtle push-away animation within 50pt radius)
- Release: Photo settles with spring animation (damping: 10, stiffness: 100)
- Boundary behavior: Rubber-band resistance when approaching canvas edge, can exceed bounds but springs back

**Gesture 2: Scale (Pinch)**
- Two-finger pinch anywhere on photo
- Scale transforms around gesture focal point (center of pinch)
- Minimum scale: 0.2x, maximum scale: 5.0x
- Visual feedback during pinch: Corner handles resize proportionally
- Haptic feedback at 1.0x scale (natural size)
- Scale displays temporarily: Small label (64pt × 28pt pill, blur background) appears above photo showing "95%" (current scale percentage)
- Label fades out 1.0s after gesture ends

**Gesture 3: Rotate (Two-finger rotation OR rotation handle)**
- Two-finger rotation gesture: Rotate around gesture center point
- Rotation handle drag: Drag circular handle to rotate around photo center
- Rotation continuous (no snap points by default)
- Snap-to-angle assist: When rotation approaches 0°, 90°, 180°, 270° (within 5°), subtle haptic + visual indicator (thin angle guide line) appears
- Can disable snap in settings
- Rotation angle displays: Similar pill label shows "45°" during gesture
- Smooth interpolation using quaternion math

**Gesture 4: Combined Transforms**
- User can pan, scale, and rotate simultaneously (multi-touch)
- Reanimated worklet processes all transforms in single pass (efficient)
- Z-index automatically increases for active photo (brings to front)
- Gesture end: Z-index adjustable via manual reorder (see Layer Management)

**Gesture 5: Quick Delete (Swipe off screen)**
- Fast swipe gesture on photo toward any screen edge
- Photo follows swipe with velocity physics
- If velocity > 800pt/s and direction toward edge: photo continues accelerating off-screen
- Photo fades and scales down during exit (0.6s animation)
- Other photos animate to fill space (gap closure animation, spring physics)
- Undo immediately available (toast notification: "Photo removed. Undo")

**Gesture 6: Duplicate (Long press + drag up)**
- Long press photo (0.5s hold)
- Haptic burst (medium impact)
- Photo duplicates: Original stays in place, duplicate appears under finger
- Visual effect: Flash of light, duplicate scales from 0.8 to 1.0
- Drag duplicate to position, release to place

**Gesture 7: Send to Back/Bring to Front (Three-finger tap)**
- Three-finger tap on photo: Quick menu appears (2 options)
  - "Send to Back"
  - "Bring to Front"
- Tap option: Photo z-index animates (if going back, photos above it part/lift, photo slides behind)
- Alternative: Volume button shortcut (if enabled in settings)

**Layer Management:**

**Layers Panel (Bottom Sheet):**
- Triggered by "Layers" button in bottom bar
- Slides up from bottom (spring animation, 500ms)
- Height: 60% of screen
- Grab handle visible (standard iOS pattern)

**Panel Content:**
- List of all photos/elements in collage (reverse z-order, top = front)
- Each row:
  - Thumbnail preview (60pt square, rounded 8pt)
  - Layer type icon (photo/text/shape)
  - Visibility toggle (eye icon, tap to hide/show)
  - Lock toggle (padlock icon, tap to lock/unlock transforms)
  - Reorder handle (three horizontal lines, drag to reorder)
- Selected layer highlighted with gradient background

**Layer Row Gestures:**
- **Tap row:** Selects photo on canvas (canvas centers + zooms slightly to selected photo with smooth animation)
- **Swipe left:** Reveals quick actions (duplicate, delete)
- **Drag reorder handle:** Reorders layer in stack
  - Other rows animate to make space (spring animation)
  - Canvas updates z-indices in real-time
  - Drop commits new order

**Visibility/Lock Behavior:**
- Hidden layers: Grayed out on canvas, non-interactive
- Locked layers: Cannot transform, show padlock icon overlay
- Both states persist in project save

**Filter System:**

**Filter Sheet (Bottom Sheet):**
- Triggered by "Filters" button when photo selected
- Slides up from bottom, 50% screen height
- Horizontal scrollable filter preview strip at top:
  - Each filter shows live preview thumbnail (120pt × 120pt, rounded 12pt)
  - Selected photo's preview rendered with filter applied
  - Filter name below preview (12pt, truncated)
  - 15+ filters included (free)
  - 25+ premium filters (IAP)
  - Premium filters have gold lock badge

**Filter Categories:**
- **Basic:** Brightness, Contrast, Saturation, Exposure, Warmth
- **Presets:** Vintage, B&W, Sepia, Cinematic, Vivid, Cool, Warm
- **Artistic:** Oil Paint, Watercolor, Sketch, Comic, HDR (premium)
- **Advanced:** Vignette, Grain, Blur, Sharpen, Tilt-Shift (premium)

**Filter Application:**
- Tap filter preview: Selected photo updates with live filter (smooth 300ms transition)
- Slider appears below preview strip (when applicable):
  - Intensity slider (0-100%)
  - Drag slider knob: Real-time filter intensity adjustment (worklet-driven, 60fps)
  - Label shows current percentage
- Apply button: Commits filter, sheet dismisses
- Cancel button: Reverts to previous state

**Filter Rendering:**
- Filters implemented with React Native Skia ImageFilters
- Shaders used for complex effects (oil paint, watercolor)
- Processing occurs on UI thread (worklet)
- Original image cached for fast revert

**Crop Tool:**

**Crop Mode Entry:**
- Tap "Crop" button (photo must be selected)
- Canvas animates:
  - Selected photo enlarges to fill screen (animated, 400ms)
  - Other photos fade out (200ms)
  - Dimmed overlay appears around photo (black, 60% opacity)
  - Crop frame overlays photo (white border, 3pt, dashed)

**Crop Frame:**
- Interactive rectangle with 8 control handles:
  - 4 corner handles (circular, 32pt diameter)
  - 4 edge handles (pill-shaped, 48pt × 32pt, positioned mid-edge)
- Grid overlay: Rule-of-thirds grid (2×2 lines, white 30% opacity, 1pt)
- Aspect ratio presets (bottom bar):
  - Free, 1:1, 4:5, 3:4, 9:16, 16:9
  - Tapping preset: crop frame morphs to ratio (spring animation)

**Crop Gestures:**
- **Drag corner handle:** Resizes crop frame maintaining aspect ratio (if locked)
- **Drag edge handle:** Resizes along single axis
- **Drag inside frame:** Moves entire crop frame
- **Pinch inside frame:** Scales photo (background photo, not crop frame)
- **Rotate gesture:** Rotates photo under crop frame (if rotation enabled)
- Visual feedback: Dimmed area adjusts in real-time, cropped area bright

**Crop Toolbar:**
- Top bar buttons:
  - Cancel: Reverts changes, exits crop mode
  - Rotate: Rotates photo 90° clockwise (animated rotation)
  - Flip: Flips photo horizontal/vertical
  - Reset: Resets crop to original
- Bottom bar:
  - Aspect ratio chips
  - Done button (primary, gradient background): Applies crop, exits mode

**Crop Animation:**
- Done pressed:
  - Crop frame shrinks to final cropped area
  - Photo scales and moves to fill original position on canvas
  - Other photos fade back in
  - Cropped photo settles with spring animation

**Background Customization:**

**Background Panel (Modal Sheet):**
- Trigger: "Backgrounds" button in bottom bar
- Slides up, 70% screen height
- Tab segmented control at top:
  - Colors | Gradients | Textures | Photos

**Colors Tab:**
- Grid of color swatches (40pt squares, rounded 8pt)
- Preset colors (20 options): pastels, vibrants, neutrals, dark tones
- Selected swatch: Checkmark overlay, scale animation
- Color picker button: Opens native iOS color picker (HSV wheel)
- Tap swatch: Canvas background animates to new color (300ms cross-fade)

**Gradients Tab:**
- List of gradient presets (each 80pt height, rounded 16pt, full gradient render)
- 30+ gradients: linear, radial, angular types
- Direction indicator arrows (for linear)
- Tap gradient: Canvas background transitions (500ms morph animation, color interpolates smoothly)
- Custom gradient editor (premium):
  - Color stops editable
  - Angle/center adjustable with gestures

**Textures Tab:**
- Grid of texture previews (100pt squares)
- Textures: Paper, Fabric, Concrete, Wood, Marble, Noise, etc.
- Rendered with Skia procedural generation or remote images from https://www.transparenttextures.com/
- Opacity slider below grid (adjusts texture overlay opacity)
- Tap texture: Applies with fade-in animation

**Photos Tab:**
- Access device photo library
- Selected background photo fills canvas (scaling/positioning adjustable)
- Blur slider: Gaussian blur background photo (0-100%), keeps collage photos sharp
- Opacity slider: Dims background photo
- Parallax toggle: Background shifts slightly with device tilt (gyroscope effect)

**Text Tool (Bonus Feature):**

**Adding Text:**
- "More" menu → "Add Text" option
- Text element appears center canvas: "Tap to Edit" (placeholder)
- Double-tap text to edit:
  - Keyboard appears (native iOS)
  - Text field inline, expands as user types
  - Done button commits text

**Text Styling Panel (Bottom Sheet):**
- Font picker: Horizontal scroll, 20+ font previews
- Size slider: 12pt - 200pt
- Color: Tap opens color picker
- Alignment: Left | Center | Right buttons
- Style: Bold | Italic | Underline toggles
- Stroke: Toggle outline with width/color controls
- Shadow: Toggle with blur/offset/color controls

**Text Manipulation:**
- Same gestures as photos: pan, scale, rotate
- Bounding box with handles
- Can apply same filters (though most won't apply)

**Undo/Redo System:**

**Undo Stack:**
- Tracks all state changes (photo transforms, filters applied, layer reorders, etc.)
- Max stack depth: 50 actions
- Each action stores: type, previous state, new state, timestamp
- Undo button: Reverts last action with reverse animation
- Redo button: Re-applies undone action

**Persistent Undo:**
- Undo stack saved with project
- Survives app close/reopen (within session)

**Performance Optimizations:**

**Animation Performance:**
- All transform gestures run on UI thread (Reanimated worklets)
- Shared values drive transform matrices (x, y, scale, rotation)
- Skia renders photo layers with applied transforms (single render pass)
- Debounced state updates to JS thread (only on gesture end)

**Memory Management:**
- Photo thumbnails cached at multiple resolutions (low, medium, high)
- Full-res photos loaded only for export
- Inactive layers rendered at lower resolution
- Filter previews pre-rendered and cached

**Layout Responsiveness:**
- Canvas adjusts to device orientation (rotation animated, 500ms)
- UI elements reposition with spring animations
- Safe area insets respected (iPhone notches, etc.)

---

### 3.5 Library Screen

**Access Method:**
- Swipe right from left screen edge on Home Screen, or tap Library icon in bottom bar
- Slide-in transition from left (300ms, easeOutCubic)

**Layout Structure:**

**Header (Fixed):**
- Height: 100pt (includes safe area)
- Background: Gradient (deep purple to black)
- Title: "Library" (34pt bold, white)
- Subtitle: "X collages, Y GB used" (14pt, white 60%)
- Search bar: Rounded 12pt, translucent white (15% opacity), magnifying glass icon (left), "Search projects..." placeholder
  - Tap activates: Keyboard appears, cancel button slides in (right edge)
  - Type filters projects in real-time (by name)

**Toolbar (Below header):**
- Height: 52pt
- Background: Translucent blur
- Left: Sort button ("Sort by: Recent" dropdown)
  - Tap opens popover menu: Recent | Name | Size | Date Created
  - Selected option checkmarked
- Right: View toggle (grid/list icon), tapping toggles view mode with animated transition

**Content Area (Scrollable):**

**Grid View (Default):**
- Same layout as Home Screen Recent Projects
- 2-column grid on iPhone
- Project cards identical to Home Screen design
- Supports same gestures (tap, long-press, swipe)

**List View:**
- Vertical list, each row 80pt height
- Row content:
  - Left: Thumbnail (64pt square, rounded 8pt)
  - Center: Project name (16pt semibold), date modified (12pt, gray), layer count (12pt, gray)
  - Right: Chevron (indicates tappable)
- Tap row: Opens project in Editor (slide-left transition)
- Swipe left: Reveals action buttons (Export, Duplicate, Delete)

**Sort & Filter:**
- Sort applied with animated reordering (cards/rows morph positions, 400ms spring)
- Search filters in real-time with fade-out/fade-in animation (non-matching items)

**Empty State:**
- Centered icon: Folder with magnifying glass (120pt, gray)
- Text: "No projects found" (20pt semibold)

**Batch Operations:**
- Long press any project → enters selection mode
- Checkboxes appear on all cards/rows
- Bottom action bar slides up: Select All | Delete | Export
- Tap cards to select (checkmark animates in)
- Exit selection mode: Cancel button (top-right)

**Storage Management Section:**
- Accessed via "Manage Storage" button (bottom of list)
- Shows breakdown: Projects, Cache, Temp files
- "Clear Cache" button with confirmation dialog

**Gesture Navigation:**
- Swipe left from right edge: Returns to Home Screen (reverse slide transition)

---

### 3.6 Settings Screen

**Access Method:**
- Swipe left from right screen edge on Home Screen, or tap Settings icon in bottom bar
- Slide-in transition from right (300ms, easeOutCubic)

**Layout Structure:**

**Header:**
- Height: 100pt
- Background: Gradient (coral to purple)
- Title: "Settings" (34pt bold, white)
- Subtitle: App version (14pt, white 60%)

**Content (Scrollable List):**
Grouped sections with headers:

**Section 1: Premium**
- **Restore Purchases** row
  - Icon: Star (gold)
  - Tap: Triggers IAP restore, loading spinner appears
  - Success: Toast notification "Purchases restored"
- **Upgrade to Premium** row (if not purchased)
  - Icon: Crown (gold, animated pulse)
  - Tap: Opens Premium Sheet
  - Shows "Premium" badge (gold pill)

**Section 2: Editor**
- **Default Canvas Size** row
  - Icon: Expand icon
  - Shows current value (e.g., "Square 1:1")
  - Tap opens selector sheet (aspect ratio options)
- **Snap to Grid** row
  - Icon: Grid
  - Toggle switch (right side)
  - Animated toggle (slide + color change)
- **Auto-Save** row
  - Icon: Cloud with checkmark
  - Toggle switch
  - Subtext: "Save projects automatically"
- **Gesture Sensitivity** row
  - Icon: Hand with sparkle
  - Shows current value (Low | Medium | High)
  - Tap opens slider sheet (adjust sensitivity 0-100%)

**Section 3: Export**
- **Default Export Quality** row
  - Icon: Image with checkmark
  - Shows current (e.g., "High (2048px)")
  - Tap opens options: Low, Medium, High, Original
- **Include Metadata** row
  - Icon: Info circle
  - Toggle switch
  - Subtext: "Embed date, app info"
- **Watermark** row (Premium feature)
  - Icon: Droplet
  - Toggle switch
  - Lock icon if unpurchased

**Section 4: About**
- **Rate Mosaic Studio** row
  - Icon: Star outline
  - Tap: Opens App Store rating prompt (native)
- **Share with Friends** row
  - Icon: Share arrow
  - Tap: Opens native share sheet with app link
- **Privacy Policy** row
  - Icon: Shield
  - Tap: Opens in-app web view (or Safari)
- **Terms of Service** row
  - Icon: Document
  - Tap: Opens in-app web view

**Section 5: Advanced**
- **Clear Cache** row
  - Icon: Trash
  - Subtext: "XX MB cached data"
  - Tap: Confirmation alert → clears cache → updates subtext
- **Reset All Settings** row
  - Icon: Warning triangle
  - Text color: Red
  - Tap: Confirmation alert (destructive action)

**Row Styling:**
- Height: 56pt (taller for rows with subtexts)
- Background: White 5% opacity, rounded 12pt (within section)
- Icon: Left side (28pt), colored
- Text: 16pt semibold, white
- Subtext: 13pt regular, white 60%
- Chevron: Right side (for selectable rows)
- Toggle: Right side (for switches)

**Row Interaction:**
- Tap: Scale 0.98, background lightens (white 10% opacity), haptic light
- Toggle: Slide animation (200ms), color change (gray → accent color)

**Gesture Navigation:**
- Swipe right from left edge: Returns to Home Screen (reverse slide transition)

---

### 3.7 Premium (IAP) Sheet

**Presentation:**
The Premium Sheet is a full-screen modal that showcases the premium features and handles In-App Purchases.

**Entry Animation:**
- Slide up from bottom (spring animation, 600ms)
- Background blur applies to previous screen content
- Scale animation: Sheet starts at 0.95, springs to 1.0

**Layout:**

**Header:**
- Height: 180pt
- Background: Animated gradient (gold to amber, subtle shift animation loops)
- Crown icon: Center, 80pt, gold, animated float (up/down 10pt, 3s loop)
- Title: "Unlock Premium" (32pt bold, white)
- Subtitle: "Create without limits" (16pt regular, white 80%)

**Feature List:**
- Scrollable content area
- Each feature row: 72pt height
- Row structure:
  - Left: Animated icon (custom Skia drawing, 48pt)
  - Right: Feature name (18pt semibold), description (14pt regular, 70% opacity)
- Features:
  1. **Unlimited Projects** - "Create as many collages as you want"
  2. **50+ Premium Templates** - "Exclusive artistic layouts"
  3. **Advanced Filters** - "Professional-grade effects"
  4. **AI Auto-Arrange** - "Let AI find the perfect layout"
  5. **No Watermarks** - "Export clean, professional collages"
  6. **Cloud Backup** - "Never lose your work"
  7. **Priority Support** - "Get help when you need it"
  8. **Exclusive Updates** - "Early access to new features"

**Feature Row Animation:**
- Rows fade in sequentially (stagger 50ms) when sheet appears
- Icons animate in with spring (scale 0 → 1.2 → 1.0)

**Pricing Section:**
- Background: Slightly darker gradient panel, rounded 24pt, 20pt margin
- Two pricing options (side-by-side on larger screens, stacked on small):

**Option 1: Monthly Subscription**
- Card: 160pt tall, rounded 20pt, white 10% opacity
- Badge: "Most Flexible" (top-right, pill shape, white 20% opacity)
- Price: "$4.99" (28pt bold)
- Period: "/month" (16pt regular, 60% opacity)
- Subtext: "Cancel anytime"
- Button: "Start Free Trial" (if trial available) or "Subscribe" (full-width, 52pt height, gradient background, white bold text)

**Option 2: Yearly Subscription**
- Card: Same style as monthly
- Badge: "Best Value" (gold background, white text, animated pulse)
- Price: "$29.99" (28pt bold)
- Period: "/year" (16pt regular, 60% opacity)
- Savings: "Save 50%" (14pt semibold, green color, below period)
- Subtext: "Billed annually"
- Button: "Subscribe" (gradient, more prominent than monthly)

**Selected State:**
- One option selected by default (yearly, best value)
- Selected card: Thicker border (3pt, white), scale 1.02
- Tap other card: Smooth transition (morph animation, 300ms)

**Footer:**
- Fine print (10pt, white 50% opacity): "Auto-renews. Cancel anytime. Terms apply."
- Links: "Terms of Service" | "Privacy Policy" | "Restore Purchases"
- Link taps open respective sheets/alerts

**Purchase Button Action:**
- Tap "Subscribe"/"Start Free Trial":
  - Button shows loading spinner (replaces text, 400ms fade)
  - Haptic feedback (medium)
  - Initiates IAP flow via React Native IAP
  - Native iOS payment sheet appears
  - On success: Celebration animation (confetti particles from top, 2s), "Welcome to Premium!" message, sheet dismisses (800ms delay)
  - On failure: Error alert appears, button returns to normal
  - On cancel: Button returns to normal, no alert

**Restore Purchases:**
- Tap link:
  - Alert confirms restoration in progress
  - Checks receipt with Apple
  - On success: "Purchases restored!" toast, sheet dismisses
  - On failure: "No purchases found" alert

**Close Button:**
- Top-left: X icon (28pt), translucent white circle (40pt diameter)
- Tap: Sheet dismisses with slide-down animation

**Gesture Dismissal:**
- Swipe down from top: Sheet follows finger, dismisses if swiped >150pt or velocity >600pt/s
- Rubber-band resistance on dismissal threshold

---

### 3.8 Export Modal

**Trigger:**
- Tap export button (share icon) in Editor top toolbar
- Also accessible from project context menu (long-press on Home/Library)

**Presentation:**
- Centered modal, 85% screen width, 70% screen height (max)
- Rounded 32pt corners
- Background: Gradient (deep blue to purple) with blur behind
- Entrance animation: Scale from 0.8 to 1.0, fade in (400ms spring)

**Layout:**

**Header:**
- Icon: Checkmark in circle (56pt, green gradient)
- Title: "Export Collage" (24pt bold, white)
- Subtitle: "Choose quality and format" (14pt, white 70%)

**Preview Section:**
- Collage preview thumbnail (full-width, 200pt height, rounded 16pt)
- Shows final render of collage
- Subtle shimmer animation (light sweep, 3s loop)

**Options Section:**

**Quality Selector:**
- Label: "Quality" (16pt semibold)
- Segmented control (3 options):
  - Low (1024px)
  - High (2048px) [Default]
  - Original (full resolution)
- Selected segment: Gradient background, white text
- Unselected: Translucent white 15%, white 60% text
- Tap animation: Morph to selection (liquid animation)

**Format Selector:**
- Label: "Format" (16pt semibold)
- Horizontal chip row:
  - JPG (95% quality)
  - PNG (lossless)
  - PDF (vector, premium feature)
- Selected chip: Gradient border (2pt), solid background
- Lock icon on PDF if unpurchased

**Size Information:**
- Label: "Estimated Size" (14pt regular, white 60%)
- Size: "~3.2 MB" (18pt semibold, white)
- Updates dynamically as quality/format changes

**Watermark Toggle (Premium feature):**
- Row: "Include Watermark" label, toggle switch (right)
- Subtext: "Remove with Premium" if unpurchased
- Switch disabled (grayed) if unpurchased

**Action Buttons:**

**Primary Button: "Export"**
- Full-width, 56pt height, rounded 16pt
- Gradient background (accent colors)
- White bold text (18pt)
- Tap animation: Scale 0.95, haptic medium

**Secondary Button: "Share Directly"**
- Same size/styling as primary, but translucent white 15% background, white text
- Tapping bypasses export, directly opens native share sheet

**Export Flow:**
- Tap "Export":
  - Button morphs to loading state (spinner replaces text, 300ms)
  - Progress bar appears below button (animated, 0-100%)
  - Export process:
    1. Renders collage at selected quality (Skia render)
    2. Applies filters/transforms
    3. Generates image file
    4. Saves to device photo library (Photos app)
    5. Progress bar updates (smooth animation)
  - On completion (typically 1-3 seconds):
    - Success checkmark animation (green, bounces in)
    - Modal auto-dismisses after 800ms
    - Toast notification: "Saved to Photos" (bottom of screen, 3s display)
  - On error:
    - Error alert appears with message
    - Button returns to "Export" state

**Share Flow:**
- Tap "Share Directly":
  - Native iOS share sheet appears immediately
  - Pre-rendered collage image included
  - Share options: Messages, Mail, Instagram, Facebook, Files, AirDrop, etc.
  - User completes share → share sheet dismisses → Export Modal dismisses

**Close Button:**
- Top-right: X icon (24pt), tap dismisses modal (scale-down + fade-out animation)

**Gesture Dismissal:**
- Tap outside modal (on blurred background): Modal dismisses with scale-down animation
- Swipe down from top: Modal follows finger, dismisses if threshold met

---

## 4. Gesture System Specifications

### 4.1 Global Gesture Vocabulary

Mosaic Studio implements a comprehensive gesture language that users learn progressively through use.

**Navigation Gestures:**
- **Edge Swipe Right (from left edge):** Navigate to Library Screen
- **Edge Swipe Left (from right edge):** Navigate to Settings Screen
- **Two-finger Swipe Left/Right:** Navigate between main sections (Home ↔ Editor ↔ Library)
- **Three-finger Swipe Down:** Dismiss current modal/sheet

**Editor Canvas Gestures:**
- **Single Tap (empty canvas):** Deselect all
- **Double Tap (empty canvas):** Zoom to fit all content
- **Long Press (empty canvas):** Open canvas background picker
- **Single Tap (photo):** Select photo
- **Double Tap (photo):** Enter full-screen quick-edit mode
- **Long Press (photo):** Duplicate photo
- **Pan (photo):** Move photo
- **Pinch (photo):** Scale photo
- **Rotate (two-finger rotation on photo):** Rotate photo
- **Swipe Fast (photo toward edge):** Delete photo
- **Three-finger Tap (photo):** Quick z-index menu

**List/Grid Gestures:**
- **Swipe Left (on item):** Reveal action buttons
- **Swipe Right (on item):** Quick preview
- **Long Press (on item):** Context menu or multi-select mode
- **Pull Down (at top of list):** Refresh
- **Pull Up (at bottom of list):** Load more (if paginated)

**Sheet/Modal Gestures:**
- **Swipe Down (on sheet):** Dismiss sheet
- **Swipe Up (from bottom edge):** Open quick actions
- **Tap Outside:** Dismiss modal

### 4.2 Gesture Feedback System

**Visual Feedback:**
- **Touch Indication:** Subtle circular ripple appears at touch point (20pt radius, expands to 60pt, fades, 400ms)
- **Element Press State:** Pressed element scales (0.95-0.98), shadow softens
- **Drag Preview:** Dragged element lifts (scale 1.05, shadow expands, follows finger)
- **Snap Guides:** Thin lines (1pt, white 40% opacity) appear when element aligns with other elements or canvas center
- **Boundary Indicators:** Red glow appears when element approaches delete threshold or canvas boundary

**Haptic Feedback:**
- **Light Impact:** Button taps, toggle switches, minor interactions
- **Medium Impact:** Photo selection, gesture start, snap-to-grid, undo/redo
- **Heavy Impact:** Delete action, premium feature unlock, export completion
- **Selection Changed:** Subtle vibration when picker value changes
- **Error:** Three quick light impacts in sequence

**Audio Feedback (Optional, user-toggleable):**
- **Tap Sound:** Subtle click (50ms, 800Hz tone, low volume)
- **Swipe Sound:** Soft whoosh (pitch varies with velocity)
- **Success Sound:** Pleasant chime (C-E-G chord, 200ms)
- **Error Sound:** Muted buzz (200Hz, 150ms)

**Animation Feedback:**
- All gestures use spring physics (natural feel)
- Damping ratio: 0.7-0.9 (slightly underdamped, slight overshoot)
- Stiffness: 100-200 (responsive, not sluggish)
- Mass: 0.5-1.0 (lightweight, agile)

### 4.3 Gesture Conflict Resolution

When multiple gestures could be recognized simultaneously, the system uses priority rules:

1. **Active gesture takes precedence:** Once a gesture begins (threshold crossed), it runs to completion
2. **Specific over general:** Photo drag takes precedence over canvas pan
3. **Timeout disambiguation:** Long press requires 500ms hold before triggering; shorter tap interrupts it
4. **Multi-touch priority:** Two/three-finger gestures recognized before single-finger
5. **Velocity consideration:** Fast swipes interpreted as flicks/throws, slow as pans

**Gesture State Machine:**
```
IDLE → TOUCH_START → (wait 100ms) → GESTURE_DETECTED → ACTIVE → TOUCH_END → COMPLETE → IDLE
         ↓                              ↓
      TOUCH_END                    CANCELLED → IDLE
   (tap detected)
```

---

## 5. Animation Specifications

### 5.1 Animation Timing & Easing Functions

**Standard Timing Values:**
- **Instant:** 0ms (immediate state change)
- **Quick:** 200ms (UI feedback, button press)
- **Standard:** 300-400ms (screen transitions, modal appearances)
- **Slow:** 500-600ms (dramatic reveals, complex transitions)
- **Extra Slow:** 800-1000ms (celebration animations, tutorial hints)

**Easing Curves:**
- **easeOutCubic:** Deceleration, natural settling (default for most animations)
- **easeInOutCubic:** Smooth acceleration/deceleration (modal open/close)
- **Spring (damping: 10, stiffness: 100):** Natural bounce (most gestures)
- **Spring (damping: 15, stiffness: 150):** Firm spring (UI elements)
- **Linear:** Continuous motion (progress bars, loaders)

### 5.2 Micro-interactions

**Button Press:**
```
Scale: 1.0 → 0.95 (100ms, easeOut) → 1.0 (200ms, spring)
Shadow: 8pt → 4pt (100ms) → 8pt (200ms)
Brightness: 100% → 110% (100ms) → 100% (200ms)
```

**Card Selection:**
```
Scale: 1.0 → 1.02 (200ms, spring)
Border: 0pt → 3pt (200ms, easeOut)
Shadow: 8pt 30% → 16pt 50% (200ms)
Background: Base → +10% brightness (200ms)
```

**Toggle Switch:**
```
Knob Position: Left → Right (300ms, spring damping:12)
Track Color: Gray → Accent (300ms, easeInOut)
Knob Scale: 1.0 → 1.1 → 1.0 (300ms, spring)
```

**Loading Spinner:**
```
Rotation: 0° → 360° (1000ms, linear, infinite loop)
Arc: Draws circular path, animated dash offset (1000ms loop)
Color: Gradient rotates (2000ms loop)
```

**Pull-to-Refresh:**
```
Pull distance 0-100pt: Rotation 0° → 180° (linear mapping)
Pull distance 100-150pt: Scale 1.0 → 1.2 (non-linear, accelerates)
Release: Spring back animation (500ms)
Refresh trigger: Spinner appears with fade-in (200ms)
```

### 5.3 Screen Transition Animations

**Home → Editor:**
```
1. Selected project card scales up (400ms, easeOutCubic)
2. Other cards fade out (200ms)
3. Card morphs to fill screen (300ms)
4. Editor UI fades in (staggered, 50ms delay per element)
5. Canvas content animates in: photos enter from scaled down (spring)
Total duration: ~800ms
```

**Modal Presentation:**
```
1. Background content scales down to 0.95 (300ms)
2. Blur applies to background (300ms, synchronized)
3. Modal scales from 0.9 to 1.0 (400ms, spring)
4. Modal content fades in (staggered, 30ms delay per row)
```

**Sheet Slide-Up:**
```
1. Sheet enters from bottom: translateY(100%) → 0% (500ms, spring damping:15)
2. Background dim applies (300ms, synchronized with sheet)
3. Sheet content ready immediately (no stagger)
4. Over-scroll: rubber-band resistance (spring physics)
```

**Page Swipe Transition:**
```
1. Current screen translateX: 0% → -30% (follows gesture)
2. Current screen scale: 1.0 → 0.95 (follows gesture)
3. Next screen translateX: 100% → 0% (follows gesture)
4. Next screen scale: 1.1 → 1.0 (follows gesture)
5. Release: springs to final positions (300ms)
```

### 5.4 Physics-Based Animations

**Photo Throw (Swipe Velocity):**
```
- Initial velocity from gesture
- Deceleration rate: 0.998 per frame (60fps)
- Rotation applied: velocity.x * 0.05 (spin effect)
- Boundary collision: velocity inverts, damping 0.7 (bounce)
- Settles when velocity < 0.1pt/frame
```

**Spring Simulation (Photo Movement):**
```
Hooke's Law: F = -k(x - x₀)
- k (stiffness): 100
- Damping coefficient: 10
- Mass: 1.0
- Solves differential equation in worklet (60fps)
- Natural oscillation with decay
```

**Liquid Morph (Segmented Control Selection):**
```
- Selected pill shape morphs to new position
- Uses Skia Path interpolation
- Control points animate with cubic bezier
- Duration: 300ms
- Easing: easeInOutCubic
- Result: smooth, liquid-like transition
```

**Particle System (Celebration Animation):**
```
- Spawn rate: 50 particles over 500ms
- Spawn position: Random width, top edge
- Initial velocity: Random vector (upward bias)
- Acceleration: Gravity (9.8 units/s² downward)
- Rotation: Random angular velocity (0-360°/s)
- Fade: Linear from 1.0 to 0.0 over 2s
- Size: Random 4-12pt
- Color: Random from accent palette
- Rendered with Skia particles (GPU-accelerated)
```

### 5.5 Loading States & Skeleton Screens

**Project Grid Loading:**
```
- Skeleton cards appear immediately (no delay)
- Each skeleton: rounded rect with animated gradient (shimmer effect)
- Gradient: 45° diagonal, white 0% → 20% → 0%, translates across (1500ms loop)
- Cards fade in as data loads (staggered 50ms per card)
- Skeleton fades out simultaneously with content fade-in (cross-dissolve)
```

**Image Loading:**
```
- Placeholder: Blurred thumbnail (if available) or solid color
- Loading indicator: Circular progress (thin ring, 32pt diameter, centered)
- Progress ring: Animated stroke-dashoffset (0-100%)
- Full image fades in over placeholder (300ms)
- Placeholder scales up slightly (1.0 → 1.05) during fade for depth
```

**Export Progress:**
```
- Progress bar: Full-width, 4pt height, rounded ends
- Fill: Animated width (0% → 100%), gradient color (blue → green)
- Duration: Matches actual export time (dynamic)
- Completion: Bar fills, then morphs to checkmark (500ms morph animation)
```

---

## 6. Visual Design System

### 6.1 Color Palette

**Primary Colors:**
- **Primary Purple:** #9B7FFF (main accent, buttons, highlights)
- **Deep Purple:** #6B4FE0 (gradients, backgrounds)
- **Coral:** #FF6B9D (secondary accent, warm elements)
- **Gold:** #FFD700 (premium features, highlights)

**Gradient Combinations:**
- **Primary Gradient:** #6B4FE0 → #9B7FFF → #FF6B9D (45° angle)
- **Premium Gradient:** #FFD700 → #FFAA00 (gold to amber)
- **Success Gradient:** #4CAF50 → #8BC34A (green tones)
- **Background Gradient:** #1A1625 → #2D1B3D (dark purple tones)

**Neutral Colors:**
- **Background Dark:** #1A1625
- **Surface Dark:** #2D1B3D
- **Surface Light:** #3A2F4A
- **Border:** White 10-20% opacity
- **Text Primary:** White 100%
- **Text Secondary:** White 60-70%
- **Text Tertiary:** White 40-50%

**Semantic Colors:**
- **Error:** #FF5252
- **Warning:** #FFC107
- **Success:** #4CAF50
- **Info:** #2196F3

### 6.2 Typography

**Font Family:**
- **Primary:** SF Pro (iOS system font, weight-varied)
- **Display:** SF Pro Display (large titles)
- **Monospaced:** SF Mono (for technical info, if needed)

**Type Scale:**
- **Hero (34pt):** Screen titles (Home, Library, Settings)
- **Title 1 (28pt):** Section headers, modal titles
- **Title 2 (24pt):** Card titles, important labels
- **Title 3 (20pt):** Secondary headers
- **Body (16pt):** Primary text, button labels
- **Subhead (14pt):** Secondary text, descriptions
- **Caption (12pt):** Metadata, timestamps
- **Small (10pt):** Fine print, legal text

**Font Weights:**
- **Regular (400):** Body text, descriptions
- **Semibold (600):** Labels, headers, emphasis
- **Bold (700):** Titles, important actions

**Line Height:**
- **Tight (1.2):** Large titles, headings
- **Normal (1.5):** Body text, paragraphs
- **Loose (1.8):** Small text, captions (for readability)

### 6.3 Spacing System

**Base Unit:** 4pt

**Spacing Scale:**
- **XXS:** 4pt (tight padding, small gaps)
- **XS:** 8pt (icon padding, compact layouts)
- **S:** 12pt (between related elements)
- **M:** 16pt (standard padding, between sections)
- **L:** 20pt (screen edge padding)
- **XL:** 24pt (between major sections)
- **XXL:** 32pt (large gaps, modal padding)
- **XXXL:** 48pt (dramatic spacing)

**Component-Specific Spacing:**
- **Card Padding:** 16pt (internal content)
- **Screen Padding:** 20pt (horizontal edge insets)
- **Button Padding:** 16pt horizontal, 12pt vertical
- **List Item Padding:** 16pt horizontal, 12pt vertical
- **Grid Gap:** 12-16pt (between cards)

### 6.4 Elevation & Shadows

**Shadow System:**
Shadows created with Skia for performance and consistency.

**Levels:**
- **Level 0 (Flat):** No shadow, 0pt offset
- **Level 1 (Subtle):** 2pt offset, 4pt blur, black 20% opacity
- **Level 2 (Standard):** 4pt offset, 8pt blur, black 30% opacity
- **Level 3 (Elevated):** 8pt offset, 16pt blur, black 40% opacity
- **Level 4 (Floating):** 12pt offset, 24pt blur, black 50% opacity

**Usage:**
- Buttons: Level 2
- Cards: Level 2 (Level 3 on press)
- Modals: Level 3
- Drag preview: Level 4
- Bottom bar: Level 2 (inverted, shadow above)

**Colored Shadows:**
For gradient elements, shadow color matches dominant gradient color (20-30% opacity).

### 6.5 Iconography

**Icon System:**
- Primary: Feather icon set (via React Native Vector Icons)
- Secondary: Ionicons (for iOS-specific icons)
- Custom: SVG icons rendered with react-native-svg (for brand-specific elements)

**Icon Sizes:**
- **Small:** 16pt (inline with text)
- **Standard:** 24pt (buttons, toolbar)
- **Medium:** 28pt (prominent actions)
- **Large:** 48pt (splash, empty states)
- **XL:** 80pt+ (splash screen, hero elements)

**Icon Style:**
- Stroke-based (not filled) for consistency
- 2pt stroke width
- Rounded line caps
- Color: White (varies opacity for states)

**Icon States:**
- **Default:** White 100%
- **Disabled:** White 30%
- **Active/Selected:** Accent color (purple/coral)
- **Hover/Press:** Scale 0.9 + brightness 110%

**Remote Icon Sources:**
For placeholder and example imagery:
- Feather icons via https://api.iconify.design/feather:{icon-name}.svg
- Example: https://api.iconify.design/feather:camera.svg

### 6.6 Corner Radius

**Radius Scale:**
- **XS:** 4pt (small chips, badges)
- **S:** 8pt (buttons, input fields)
- **M:** 12pt (cards, thumbnails)
- **L:** 16pt (prominent cards, modals)
- **XL:** 20pt (large cards, project cards)
- **XXL:** 24pt (sheets, drawers)
- **Pill:** 999pt / 50% (fully rounded ends)

**Usage:**
- Buttons: 12pt (Standard), 16pt (Large), Pill (special actions)
- Cards: 16-20pt (depending on size)
- Modals: 24pt (top corners only if bottom sheet)
- Bottom bar: 34pt (pill-shaped)
- Input fields: 12pt

### 6.7 Blur & Translucency

**Blur System:**
All blur effects implemented with Skia Blur ImageFilter.

**Blur Intensities:**
- **Light:** 10pt radius (subtle, text remains readable)
- **Medium:** 20pt radius (standard UI blur)
- **Heavy:** 40pt radius (dramatic, background context only)

**Translucent Materials:**
- **Glass (Ultra-thin):** 5% white opacity + 10pt blur
- **Glass (Thin):** 10% white opacity + 20pt blur
- **Glass (Regular):** 15% white opacity + 20pt blur
- **Glass (Thick):** 20% white opacity + 20pt blur

**Usage:**
- Top toolbar: Ultra-thin material
- Bottom bar: Thin material
- Sheet backgrounds: Regular material
- Modal backgrounds: 40% black opacity (no blur, dim only)
- Over-content overlays: Thick material

---

## 7. In-App Purchase (IAP) System

### 7.1 Premium Features

**Free Tier:**
- Unlimited collages (local storage only)
- 5 saved projects at a time (older projects archived to free space)
- 15 basic templates
- 10 basic filters
- Export: JPG/PNG up to 2048px
- Watermark on exported images ("Made with Mosaic Studio" in bottom corner, 12pt, white 60% opacity)

**Premium Tier ($4.99/month or $29.99/year):**
- Unlimited saved projects (no archive limit)
- 50+ premium templates (artistic, seasonal, advanced layouts)
- 25+ advanced filters (oil paint, watercolor, HDR, etc.)
- AI Auto-Arrange feature (uses device ML, no cloud processing)
- Export: JPG/PNG/PDF up to original resolution
- No watermark on exports
- Cloud backup to iCloud (automatic, optional)
- Custom gradient editor
- Priority support (email, 24hr response)
- Early access to new features

### 7.2 IAP Products

**Product IDs (Apple App Store):**
- `com.mosaicstudio.premium.monthly` - Monthly subscription
- `com.mosaicstudio.premium.yearly` - Yearly subscription

**Pricing:**
- Monthly: $4.99 USD
- Yearly: $29.99 USD (50% savings vs monthly)

**Free Trial:**
- 7-day free trial on first subscription (monthly or yearly)
- Auto-renews unless cancelled 24h before trial ends

**Subscription Management:**
- Managed through Apple Subscriptions (Settings → Apple ID → Subscriptions)
- Can upgrade/downgrade between monthly/yearly anytime
- Cancel anytime, access continues until end of billing period

### 7.3 Purchase Flow

**Trigger Points:**
- Tap premium template (locked)
- Tap premium filter (locked)
- Tap "AI Auto-Arrange" (locked)
- Tap "Upgrade to Premium" in Settings
- Attempt to export without watermark (if free tier)
- Reach project limit (if free tier)

**Flow:**
1. Trigger → Premium Sheet appears (see Section 3.7)
2. User selects subscription option (monthly/yearly)
3. Tap "Subscribe" → Native iOS payment sheet appears
4. User authenticates (Face ID/Touch ID/password)
5. Purchase processes (spinner on button)
6. Success → Celebration animation (confetti), "Welcome to Premium!" message
7. Sheet dismisses → Premium features immediately unlocked (state updated via Zustand + MMKV)
8. User returned to previous screen with feature now accessible

**Error Handling:**
- Purchase cancelled: No alert, button returns to normal
- Purchase failed: Alert with error message ("Payment Failed. Try again or check your payment method.")
- Network error: Alert ("No internet. Try again later.")

**Receipt Validation:**
- On purchase: Receipt validated locally (no server)
- On app launch: Receipt checked via React Native IAP
- Subscription status cached in MMKV (expires 24h, re-validates on expiry)
- If receipt invalid/expired: Premium features locked, prompt to restore/resubscribe

**Restore Purchases:**
- Accessible in Settings and Premium Sheet
- Tap "Restore Purchases" → Checks Apple receipt
- Success: "Purchases restored!" toast
- Failure: "No purchases found" alert
- Use case: New device, reinstalled app, different Apple ID

### 7.4 Premium UI Indicators

**Locked Features:**
- Lock icon (16pt, gold) overlaid on locked content (top-right or center)
- Tap locked item → Premium Sheet appears (not just disabled)
- Grayscale filter applied to locked previews (saturation: 0%)

**Unlocked Features (Post-purchase):**
- Lock icons removed immediately
- Subtle gold glow/outline on premium features (identifies them as premium)
- "Premium" badge (gold pill, 8pt padding, 12pt text) appears on premium templates/filters

**In-app Promotions:**
- Non-intrusive banners at bottom of template/filter lists: "Unlock 50+ more with Premium"
- Tap banner → Premium Sheet
- Banners dismissible (X button) but reappear after app restart (until purchased)

---

## 8. Data Management & Persistence

### 8.1 Local Storage Architecture

**Storage Layers:**

**Layer 1: MMKV (Key-Value Store)**
- Ultra-fast storage for settings and app state
- Stores:
  - User preferences (theme, quality presets, gesture sensitivity)
  - IAP status (subscription active/expired, product IDs)
  - Onboarding state (completed, skipped)
  - Feature flags (A/B tests, beta features)
- Synchronous API (immediate reads/writes)
- Encrypted storage for IAP data

**Layer 2: SQLite (Relational Database)**
- Stores project metadata and structured data
- Tables:
  - **Projects:** `id, name, createdAt, modifiedAt, thumbnailPath, templateId, canvasWidth, canvasHeight, backgroundColor`
  - **Layers:** `id, projectId, type, sourceUri, transformJson, filtersJson, opacity, blendMode, zIndex`
  - **Templates:** `id, name, category, layoutJson, isPremium`
- Indexed columns: `projectId`, `createdAt`, `modifiedAt`
- Queries optimized for fast project list rendering

**Layer 3: File System (RNFS)**
- Stores actual image files and exports
- Directory structure:
  ```
  /Documents
    /Projects
      /{projectId}
        /photos
          - photo1.jpg
          - photo2.jpg
        /thumbnails
          - photo1_thumb.jpg
      /{projectId}
        ...
    /Exports
      - collage_20250601_123045.jpg
    /Cache
      /thumbnails
      /filters
  ```
- Original photos stored at full resolution
- Thumbnails generated on import (256px, 512px, 1024px sizes)
- Cache cleared on app restart or manually via Settings

### 8.2 Project Save System

**Auto-Save:**
- Enabled by default (toggleable in Settings)
- Debounced saves: writes to database 2 seconds after last edit
- Only saves changed data (dirty checking via Zustand)
- Background saves (non-blocking, user can continue editing)

**Manual Save:**
- Implicit on navigation away from Editor
- Explicit "Save" not required (iOS-style auto-save pattern)

**Save Process:**
1. User edits collage (e.g., moves photo)
2. Zustand store updated immediately (UI reflects change instantly)
3. Debounced save function triggered (2s timer starts)
4. If another edit occurs within 2s: timer resets
5. Timer expires: save function executes
6. Database transaction: updates project modified timestamp + layer data
7. If new photos added: files copied to project directory
8. Thumbnail regenerated (background task)
9. Save complete (no UI indication unless error)

**Error Handling:**
- If save fails (disk full, permissions): Alert appears "Unable to save. Check storage."
- Unsaved changes cached in memory, retry on next edit
- Critical data loss prevented: app writes to temp file first, then atomic rename

### 8.3 Image Caching

**Caching Strategy:**
- Three-tier cache: memory (React Native Image) → disk (RNFS) → original (project directory)
- Memory cache: Fast Least-Recently-Used (LRU) cache for active images
- Disk cache: Persistent, cleared on app restart or low storage

**Cache Generation:**
- On photo import:
  - Full-res copy saved to project directory
  - 256px thumbnail generated (grid views)
  - 512px thumbnail generated (preview modes)
  - 1024px thumbnail generated (editor canvas)
- On filter apply:
  - Filtered image cached to disk (prevents re-rendering)
  - Cache key: `{photoId}_{filterName}_{intensity}`

**Cache Invalidation:**
- Photo edited (crop, filter): invalidates all cached versions
- Project deleted: associated cache entries removed
- App settings ("Clear Cache"): all cache cleared except project originals

**Performance:**
- Editor loads 1024px thumbnails (fast, sufficient quality)
- Export uses full-res originals (high quality)
- Cache pre-warming: next/previous project thumbnails loaded in background

### 8.4 Export System

**Export Engine:**
Powered by React Native Skia for high-quality rendering.

**Export Process:**
1. User selects quality/format in Export Modal
2. Tap "Export":
   - Skia canvas created at target resolution (e.g., 2048×2048)
   - Background drawn (solid color, gradient, or image)
   - Each layer rendered in z-order:
     - Load full-res photo (or cached filtered version)
     - Apply transforms (translate, scale, rotate) via Skia matrix
     - Apply filters (if any) via ImageFilters
     - Apply blend mode (multiply, overlay, etc.)
     - Draw to canvas
   - If watermark enabled (free tier): draw text with semi-transparent fill
   - Canvas exported to image buffer
3. Image saved to app's Documents directory
4. Image added to iOS Photos library (via CameraRoll API)
5. Success → Toast notification + auto-dismiss modal

**Format-Specific Export:**

**JPG:**
- Quality: 95% (default), adjustable in settings
- Color space: sRGB
- EXIF metadata: Optionally embedded (timestamp, app info)

**PNG:**
- Lossless compression
- Alpha channel supported (if background is transparent)
- Larger file size than JPG

**PDF (Premium):**
- Vector-based (when possible, e.g., shapes, text)
- Photos embedded at full resolution
- Scalable without quality loss
- Suitable for printing

**Export Locations:**
- Primary: iOS Photos library (user's photo roll)
- Secondary: App's Documents/Exports directory (accessible via Files app)
- Cloud: Optional iCloud backup (premium, automatic)

---

## 9. Performance Optimization

### 9.1 Rendering Performance

**React Native Reanimated Optimization:**
- All gesture-driven animations run on UI thread (worklets)
- Shared values updated directly without bridge crossing
- Transform matrices computed in worklets (translate, scale, rotate combined)
- State mutations batched and deferred to JS thread (on gesture end)

**Skia Rendering:**
- Canvas uses Skia's hardware-accelerated rendering (Metal on iOS)
- Photo layers rendered as textures (GPU memory)
- Filters applied via shaders (GPU-accelerated)
- Only visible area rendered (clipping optimizations)
- Layer composition optimized (z-order sorted, overdraw minimized)

**Image Optimization:**
- Images loaded at appropriate resolution (no over-fetching)
- Downsampling performed on background thread (native modules)
- Thumbnails cached aggressively
- Fast Image component used for all images (native caching, preloading)

**List Rendering:**
- Virtual scrolling (FlatList with optimized rendering)
- Only visible items + buffer rendered (3-5 items above/below)
- Item keys stable (prevents unnecessary re-renders)
- Memoization (React.memo) on expensive components

**Animation Frame Rate:**
- Target: 60fps minimum (16.67ms per frame)
- Achieved via:
  - Worklet-based animations (no JS thread blocking)
  - Debounced state updates (non-critical)
  - RequestAnimationFrame for JS-driven animations
  - Skip non-visible animations (viewport detection)

### 9.2 Memory Management

**Image Memory:**
- Full-res images loaded only when needed (export, cropping)
- Thumbnails used for UI (256px, 512px, 1024px)
- Unused images evicted from memory cache (LRU policy, max 50MB cache)
- Large images tiled (if >4096px, split into tiles for processing)

**JavaScript Heap:**
- Zustand stores kept minimal (only essential state)
- Event listeners cleaned up on unmount (avoids leaks)
- Heavy computations offloaded to native modules (image processing, filters)

**Native Memory:**
- Skia textures released when layers removed
- Reanimated shared values disposed on unmount
- File handles closed after operations

**Leak Prevention:**
- React Native DevTools memory profiler used during development
- Strict useEffect cleanup (all subscriptions, timers cleared)
- Weak references for observer patterns

### 9.3 Storage Optimization

**Database Optimization:**
- Indexed queries (projectId, createdAt)
- Batch inserts/updates (transactions)
- Vacuuming on app start (if >10MB overhead)

**File System:**
- Periodic cache cleanup (on app start, if cache >500MB)
- Thumbnail regeneration deferred (background task)
- Temporary files cleaned up immediately after use

**Disk Space Management:**
- User notified if storage <500MB remaining
- Cache auto-cleared if storage critically low (<100MB)
- Export directory capped at 2GB (oldest exports deleted)

### 9.4 Network Optimization (N/A for Offline App)

Since the app is fully offline:
- No network requests (except IAP validation with Apple)
- IAP validation cached (24h), reduces redundant checks
- All assets bundled with app (templates, icons)

---

## 10. Security & Privacy

### 10.1 Data Privacy

**User Data:**
- All user data stored locally (device only)
- No analytics or tracking SDKs (respects user privacy)
- No account creation required (no email/password storage)
- Photos never leave device (except user-initiated share)

**IAP Data:**
- Subscription status stored encrypted (MMKV)
- Receipt validation performed locally (no server calls)

**Permissions:**
- Photos library access: Required for importing/exporting (prompted on first use)
- Camera access: Optional for taking photos directly (prompted if user chooses)
- Storage access: Implicit (iOS sandbox)

### 10.2 App Transport Security

**ATS Compliance:**
- All remote resources (e.g., icon URLs) served over HTTPS
- No insecure HTTP connections allowed
- Exception: None (not needed for offline app)

### 10.3 Data Integrity

**Project Corruption Prevention:**
- Atomic writes (temp file → rename, ensures data not lost mid-write)
- Database transactions (all-or-nothing updates)
- Backup metadata stored alongside projects (recovery if corruption detected)

**Error Recovery:**
- On app crash: unsaved changes cached, prompt to restore on restart
- On database corruption: fallback to backup, alert user

---

## 11. Accessibility

### 11.1 VoiceOver Support

**Screen Reader:**
- All interactive elements labeled (accessibilityLabel prop)
- Gestures announced (e.g., "Swipe left to delete")
- State changes announced (e.g., "Photo selected")

**Focus Management:**
- Focus order logical (top-to-bottom, left-to-right)
- Focus indicators visible (outline on focused elements)

### 11.2 Dynamic Type

**Text Scaling:**
- Respects iOS Dynamic Type settings (text scales with user preference)
- Minimum font size enforced (prevents unreadable text)
- Layout adapts to larger text (buttons expand, cards reflow)

### 11.3 Contrast & Color

**WCAG Compliance:**
- Text contrast ratio: 4.5:1 minimum (normal text), 3:1 (large text)
- Interactive elements: 3:1 contrast with background
- Tested with Color Contrast Analyzer

**Color Blindness:**
- Not reliant on color alone (icons, labels, shapes provide context)
- Tested with color blindness simulators (deuteranopia, protanopia, tritanopia)

### 11.4 Motor Accessibility

**Touch Targets:**
- Minimum 44×44pt (Apple HIG guideline)
- Buttons: 56pt height (generous)
- Spacing between targets: 8pt minimum

**Gesture Alternatives:**
- Complex gestures (pinch, rotate) have button alternatives
- Long-press duration adjustable (accessibility settings, if implemented)

---

## 12. Testing Strategy

### 12.1 Unit Testing

**Framework:** Jest + React Native Testing Library

**Test Coverage:**
- Utility functions (geometry, color calculations)
- State management (Zustand stores)
- Data transformations (JSON serialization, layer transforms)

**Example Tests:**
- `geometry.ts`: Test matrix multiplication, rotation, scaling
- `useProjectStore.ts`: Test adding/removing layers, undo/redo

### 12.2 Component Testing

**Framework:** React Native Testing Library

**Test Coverage:**
- Component rendering (snapshots)
- User interactions (button presses, gestures via mocks)
- Props variations (different states)

**Example Tests:**
- `AnimatedButton.tsx`: Test press animation, disabled state
- `ProjectCard.tsx`: Test tap, long-press gestures (mocked)

### 12.3 Integration Testing

**Framework:** Detox (E2E for React Native)

**Test Scenarios:**
- Full user flows: Create collage → Add photos → Apply filters → Export
- Navigation: Home → Editor → Library → Settings
- IAP flow: Tap premium feature → Purchase modal → Cancel/Purchase
- Gesture testing: Swipe, pinch, rotate photos

**Example Test:**
```javascript
describe('Create Collage Flow', () => {
  it('should create a collage from template', async () => {
    await element(by.id('chooseTemplateButton')).tap();
    await element(by.id('template_0')).tap();
    await element(by.id('addPhotosButton')).tap();
    // Mock photo picker, select photos
    await element(by.id('exportButton')).tap();
    await expect(element(by.text('Export Collage'))).toBeVisible();
  });
});
```

### 12.4 Performance Testing

**Tools:**
- React Native Performance Monitor (FPS, memory)
- Xcode Instruments (Time Profiler, Allocations)
- Flashlight (React Native profiling tool)

**Metrics:**
- FPS: Maintain 60fps during gestures/animations
- Memory: <200MB during typical use
- App launch: <2 seconds to interactive
- Export time: <3 seconds for 2048px collage (5 photos)

### 12.5 User Acceptance Testing

**Beta Testing:**
- TestFlight distribution (100 beta testers)
- Feedback collected via in-app form + TestFlight comments
- Crash reporting (native iOS crash logs)

**Usability Testing:**
- 10 users observed creating collages (think-aloud protocol)
- Tasks: Create blank collage, use template, apply filter, export
- Metrics: Time to complete, errors, satisfaction (1-10 scale)

---

## 13. Deployment & Distribution

### 13.1 App Store Submission

**App Store Connect:**
- Bundle ID: `com.mosaicstudio.app`
- Version: 1.0.0 (initial release)
- Build number: Incremental (1, 2, 3, ...)

**App Store Listing:**
- **Name:** Mosaic Studio
- **Subtitle:** Create Stunning Photo Collages
- **Keywords:** collage, photo editor, mosaic, grid, layout, scrapbook, creative
- **Category:** Photo & Video
- **Age Rating:** 4+ (no objectionable content)
- **Screenshots:** 6.7" display + 5.5" display (iPhone required sizes)
- **App Preview Video:** 30s demo (create collage flow)

**What's New (Release Notes):**
```
- Beautiful gesture-driven interface
- 30+ free templates, 50+ premium templates
- 10 basic filters, 25+ premium filters
- AI Auto-Arrange (premium)
- Export to JPG, PNG, PDF (premium)
- Completely offline, your photos stay private
```

**App Review Information:**
- Demo account: Not required (no login)
- Review notes: "Premium features can be tested with free trial. Please allow camera/photos access."

### 13.2 Build Configuration

**Xcode Project:**
- Target: iOS 15.0+ (supports iPhone 8 and newer)
- Swift version: 5.x
- Architectures: arm64 (universal, supports all devices)
- Bitcode: Disabled (not required for modern apps)

**Build Modes:**
- **Debug:** Development builds, includes dev menu, fast refresh
- **Release:** Optimized builds, minified JS, no dev tools

**Code Signing:**
- Team: Apple Developer account
- Provisioning profile: App Store Distribution
- Certificate: Distribution certificate

**App Icon:**
- AppIcon.appiconset with all required sizes (1024×1024 master)
- Launch Screen: Custom Storyboard with brand colors

### 13.3 Continuous Integration

**CI/CD Pipeline (Optional):**
- **Platform:** GitHub Actions / Bitrise / CircleCI
- **Workflow:**
  1. Code push to `main` branch
  2. Run linter (ESLint, TypeScript compiler)
  3. Run unit tests (Jest)
  4. Build iOS app (Xcode Cloud or Fastlane)
  5. Upload to TestFlight (beta)
  6. Notify team (Slack)

**Versioning:**
- Semantic versioning: MAJOR.MINOR.PATCH
- Incremental build numbers: Auto-incremented by CI

---

## 14. Analytics & Monitoring (Privacy-Focused)

### 14.1 Event Tracking

**NO third-party analytics** (respects privacy).

**Optional: Anonymous local analytics:**
- Events logged to local database (never sent to server)
- Examples: "Project Created", "Photo Added", "Filter Applied"
- Used for internal understanding of feature usage
- User can opt-out in Settings

### 14.2 Crash Reporting

**Native Crash Logs:**
- iOS automatically collects crash logs (accessible via Xcode Organizer)
- Crashes uploaded to App Store Connect (anonymous)

**JavaScript Errors:**
- React Native error boundary captures JS errors
- Errors logged locally (never sent to server)
- User shown friendly error message + "Report Issue" button

### 14.3 Performance Monitoring

**Local Monitoring:**
- FPS tracker (optional, enabled in Settings for power users)
- Memory usage display (optional)
- Export time tracking (local only)

---

## 15. Future Enhancements (Roadmap)

While out of scope for initial release, these features are designed into the architecture for future updates:

**Version 1.1:**
- **Shapes & Stickers:** Add geometric shapes, decorative stickers to collages
- **Text Effects:** Curved text, text along path, gradient text fills
- **Advanced Masking:** Custom mask shapes (hearts, stars, polygons)

**Version 1.2:**
- **Cloud Backup:** iCloud sync for projects (premium, optional)
- **Collaboration:** Share projects with others for co-editing (via AirDrop or iCloud link)

**Version 1.3:**
- **Video Collages:** Add short video clips to collages (10s max per clip)
- **Animated Exports:** Export collages as animated GIFs or videos

**Version 2.0:**
- **iPad Optimization:** Split-screen support, Apple Pencil integration
- **Widgets:** Home screen widgets showing recent collages
- **Shortcuts Integration:** Create collages via Siri Shortcuts

---

## 16. Glossary

- **Worklet:** JavaScript function executed on UI thread (Reanimated)
- **Shared Value:** Reanimated value shared between JS and UI threads
- **IAP:** In-App Purchase (StoreKit, Apple's purchase system)
- **MMKV:** Memory-mapped key-value storage (fast, persistent)
- **Skia:** 2D graphics library (used by React Native Skia)
- **Spring Physics:** Animation curve simulating spring motion (mass, stiffness, damping)
- **Z-Index:** Stacking order (higher = front, lower = back)
- **Gesture Responder:** React Native component capturing touch gestures

---

## 17. Appendix: Technical Implementation Details

### 17.1 Reanimated Worklet Example

**Photo Pan Gesture:**
```typescript
import { useSharedValue, useAnimatedGestureHandler, useAnimatedStyle } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const translateX = useSharedValue(0);
const translateY = useSharedValue(0);

const gestureHandler = useAnimatedGestureHandler({
  onStart: (_, ctx) => {
    ctx.startX = translateX.value;
    ctx.startY = translateY.value;
  },
  onActive: (event, ctx) => {
    translateX.value = ctx.startX + event.translationX;
    translateY.value = ctx.startY + event.translationY;
  },
  onEnd: () => {
    // Snap logic or spring back if needed
  }
});

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { translateY: translateY.value }
  ]
}));

// JSX:
<PanGestureHandler onGestureEvent={gestureHandler}>
  <Animated.View style={[styles.photo, animatedStyle]} />
</PanGestureHandler>
```

### 17.2 Skia Filter Example

**Apply Grayscale Filter:**
```typescript
import { Canvas, Image, useImage, Shader } from '@shopify/react-native-skia';

const GrayscaleShader = Skia.RuntimeEffect.Make(`
  uniform shader image;
  half4 main(float2 coord) {
    half4 color = image.eval(coord);
    half gray = dot(color.rgb, half3(0.299, 0.587, 0.114));
    return half4(gray, gray, gray, color.a);
  }
`)!;

const FilteredImage = ({ uri }) => {
  const image = useImage(uri);
  return (
    <Canvas style={{ flex: 1 }}>
      <Shader shader={GrayscaleShader}>
        <Image image={image} fit="cover" />
      </Shader>
    </Canvas>
  );
};
```

### 17.3 Zustand Store Example

**Project Store:**
```typescript
import create from 'zustand';

interface Layer {
  id: string;
  sourceUri: string;
  transform: { x: number; y: number; scale: number; rotation: number };
  // ...
}

interface ProjectStore {
  layers: Layer[];
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  layers: [],
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
  })),
  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter(l => l.id !== id)
  })),
  undo: () => { /* undo logic */ },
  redo: () => { /* redo logic */ }
}));
```

---

## Conclusion

This Software Design Document provides a comprehensive blueprint for **Mosaic Studio**, a gesture-driven, offline-first iOS collage maker built with React Native. Every screen, interaction, animation, and technical detail has been specified to ensure the app is production-ready, performant, and delightful to use.

The app's core strengths:
- **Gesture-first UX:** Intuitive swipes, pinches, and taps minimize cognitive load
- **Stunning animations:** Physics-based transitions and Skia-powered effects create a premium feel
- **Complete offline functionality:** Users' photos never leave their device
- **Robust IAP integration:** Clear value proposition with free trial and transparent pricing
- **Production-ready architecture:** Optimized rendering, memory management, and error handling

This SDD serves as the definitive reference for development, ensuring all stakeholders—developers, designers, and product managers—share a unified vision for Mosaic Studio.