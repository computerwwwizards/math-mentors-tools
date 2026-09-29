---
status: draft
start-date: 2026-09-27
---

# RFC-001: Keyboard layout react module

## Summary
Provide a structured, declarative React layout system for virtual keyboards using a 2n-column grid matrix defined via template strings. This allows developers to design complex horizontal offsets and multi-row vertical key intersections without structural alignment math.

## Motivation
Creating a keyboard layout is a task that would benefit from structured abstractions.

As explained in the design notes and considering the dynamic, configurable, and extensible needs for the current app's virtual keyboard, we need a flexible and modular system to declare layouts cleanly.

### Design Inspiration
This layout engine takes direct inspiration from physical keyboard layouts, specifically the irregular shape standards found in **ISO mechanical keyboard configurations** (such as the distinctive vertical, multi-row Enter key). While this module does not strictly enforce or bind itself to hardware manufacturing constraints, it uses those multi-row physical intersections as design inspiration to ensure our web layout abstractions can handle complex vertical and horizontal key forms gracefully.

## Guide-level explanation
The layout math engine is built on a specific scaling rule: **If the keyboard admits a width of n single keys, the layout grid is divided into 2n columns.** This 2n grid allocation allows for granular fractional positioning, enabling keys to be offset or centered neatly without falling off a strict vertical track.

### 1. Standard Staggered Grouping
For example, if you need to program a keyboard group that looks like this:

```text
[ a ][ b ][ c ]
   [ d ][ e ]
```

You can define the layout using a concatenated string matrix inside the `<KeysGroup>` component:

```tsx
<KeysGroup 
    layout={
        '"a a b b c c"' + 
        '".  d d e e ."' 
    } 
>
    <Key>a</Key>
    <Key>b</Key>
    <Key>c</Key>
    <Key>d</Key>
    <Key>e</Key>
</KeysGroup>
```

### 2. Custom Content and Named Areas
Let's expand this example by adding another row containing a key with an icon:

```text
[ a ][ b ][ c ]
   [ d ][ e ]
      [del]  (del here is going to be an svg icon)
```

When a key renders rich UI elements (like an SVG) instead of plain text, use the explicit `area` prop to bridge it to your layout definition:

```tsx
import { Delete as DelIcon } from 'hypothetical-icon-lib';

<KeysGroup 
    layout={
        '"a a b b c c"' + 
        '".  d d e e ."' + 
        '".  .  del del . ."'
    } 
>
    <Key>a</Key>
    <Key>b</Key>
    <Key>c</Key>
    <Key>d</Key>
    <Key>e</Key>
    <Key area="del">
      <DelIcon />
    </Key>
</KeysGroup>
```

### 3. Vertical Key Intersections (ISO-Inspired Enter Key)
For layouts requiring a single vertical key that spans down beside multiple rows (inspired by the classic multi-row layout of physical ISO Enter keys):

```text
[ a ][ b ][ c ]| v |
[  d    ][ e    ]|   |
```

Simply repeat the target character identifier vertically across consecutive layout string rows. The engine combines them into a shared continuous vertical track:

```tsx
<KeysGroup 
    layout={
        '"a a b b c c v v"' + 
        '"d d d e e e v v"'
    } 
>
    <Key>a</Key>
    <Key>b</Key>
    <Key>c</Key>
    <Key>d</Key>
    <Key>e</Key>
    <Key>v</Key>
</KeysGroup>
```

## Reference-level explanation

Both the `<Key>` and `<KeysGroup>` components implement a fully working **polymorphic `as` prop**. This allows developers to change the underlying HTML element rendered at runtime (e.g., swapping a `<div>` layout container for a `<section>`, or turning a `<Key>` into an anchor `<a>` or semantic `<button>`) while preserving all internal layout systems.

Because both components are polymorphic, standard intrinsic HTML attributes (such as `children`, `id`, `className`, or `style`) are inherited automatically via the chosen polymorphic element type and do not require redundant manual declarations in custom prop contracts.

### Focus Management & Preventing Focus Stealing
Virtual keyboards primarily serve to enter information into an active input or editable area. Inputs being edited SHOULD not lose focus while the user triggers keys. By default, interactive HTML elements like `<button>` capture focus upon user interaction.

To prevent this default focus shift, `<KeysGroup>` intercepts and cancels the `pointerdown` default behavior across its delegated boundaries.

#### Opt-Out Configuration
Because specific workflows or custom inputs may require native browser focus retention on individual keys, this mechanism can be explicitly disabled at the group container level via the `preventFocusSteal` prop:

* **Default (`true`):** Cancels `pointerdown` default events, preserving focus on the active input.
* **Opt-out (`false`):** Restores native browser focus behavior, allowing keys to receive focus when pressed.

#### Accessibility & ARIA Contract Overrides
To balance focus retention with assistive technology navigation, `<KeysGroup>` and `<Key>` provide native accessibility defaults:
* `<KeysGroup>` defaults its semantic accessibility role to `role="toolbar"` (or `role="grid"` for structured multi-row navigation) and accepts association to the target input via `aria-controls`.
* Key navigation across tab tracks is managed via an internal Roving `tabindex` strategy, preventing keyboard focus lockups without stripping assistive devices of cursor awareness.

> **Crucial Warning on Overrides:** Because these components are polymorphic, standard ARIA props (`role`, `aria-controls`, `aria-label`, etc.) are already valid and accepted on the component interfaces. However, these accessibility attributes are **pre-configured with calibrated internal defaults**. Manually overriding these properties without adhering to WAI-ARIA Virtual Keyboard design patterns risks clobbering the component's internal accessibility wiring, breaking screen reader interaction models and making the component non-accessible.

### Event Emissions & Delegation

#### Unified Event Model
Each time a key is pressed, the event system identifies which key was triggered and routes that data to the target input or state listener. Attaching individual event listeners to every key introduces unnecessary DOM listeners and complicates focus-prevention logic. Therefore, `<KeysGroup>` MUST use **event delegation**.

`<KeysGroup>` provides a dual-dispatch event architecture:
1. **Global Callback (`onKey`):** Fires generically whenever any key inside the group is pressed, passing the resolved key value.
2. **Targeted Area Callbacks (`onKey*`):** Concurrently dispatches key-specific handlers mapped dynamically to layout area identifiers (e.g., if a layout declares an area named `del`, `<KeysGroup>` triggers both `onKey("del")` and `onKeyDel("del")`).

#### Event Target Resolution & CSS Containment
In delegated event models, child nodes (such as nested SVGs, paths, or inner icon labels) can become the event's raw `target`. To preserve seamless delegation without requiring manual traversal logic like `.closest()` at runtime, the `<Key>` component explicitly applies `pointer-events: none` via CSS to all of its descendant children (`& > * { pointer-events: none; }`). This guarantees that `event.target` consistently resolves to the top-level `<Key>` container hosting the `data-value` and `data-area` attributes, completely preventing inner icon nodes from intercepting pointer interactions.

```tsx
const toggleReducer = (prev: boolean) => !prev;
const appendReducer = (prev: string, next: string) => prev + next;

function Example() {
   const [isHidden, toggle] = useReducer(toggleReducer, true);
   const [value, addValue] = useReducer(appendReducer, "");

   return (
     <>
      <input
        id="sample-input"
        value={value} 
        onFocus={toggle}
        onBlur={toggle}
        inputMode="none"
      /> 
      <div
        tabIndex={-1}
        hidden={isHidden} 
        onPointerDown={(event) => {
            // Focus preservation pattern
            event.preventDefault();
        }} 
        onPointerUp={(event) => {
            const { value } = (event.target as HTMLElement).dataset;

            if (!value)
                return;
            
            addValue(value);
        }}  
      >
        <button type="button" data-value="A">A</button>
        <button type="button" data-value="B">B</button>
        <button type="button" data-value="C">
            {/* Descendant pointer-events are disabled to ensure button is event.target */}
            <svg 
                style={{ pointerEvents: "none" }} 
                width="10" 
                height="10" 
                xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="10" height="10" fill="black" />
            </svg>
        </button>
      </div>
     </>
   );
}
```

With the proposed abstraction layer:

```tsx
function AnotherExample() {
    const [isHidden, toggle] = useReducer(toggleReducer, true);
    const [value, addValue] = useReducer(appendReducer, "");

    return (
      <>
        <input
            id="virtual-input"
            value={value} 
            onFocus={toggle}
            onBlur={toggle} 
        /> 
        <KeysGroup 
            aria-controls="virtual-input"
            onKey={addValue}
            onKeyDel={() => console.log("Delete specific action")}
            preventFocusSteal={true}
            hidden={isHidden}
        >
            <Key>A</Key>
            <Key>B</Key>
            <Key area="c" value="C">
                <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
                  <rect width="10" height="10" fill="black" />
                </svg>
            </Key>
            <Key area="del">Del</Key>
        </KeysGroup>
      </>
    );
}
```

*Note on Data Storage:* Values assigned via `value` reside in DOM dataset attributes. For architectures requiring values to remain strictly in application memory (e.g., secure credential input), implementors should note that this implementation is designated strictly for non-critical, non-sensitive input flows.

---

### Component Prop Types

#### `<Key>` Component
Inherits all attributes of its polymorphic element type `T` (`React.ComponentPropsWithoutRef<T>`).

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `as` | `React.ElementType` | `"button"` | The polymorphic HTML tag or component to render. |
| `area` | `string` | `undefined` | Grid-template-area identifier. If omitted, the area is inferred from text content. |
| `value` | `string` | Derived from `area` or text | The string payload emitted when the key is pressed. |

*Note: Descendant nodes inside `<Key>` automatically receive `pointer-events: none` via internal CSS to protect delegation target consistency.*

#### `<KeysGroup>` Component
Inherits all attributes of its polymorphic element type `T` (`React.ComponentPropsWithoutRef<T>`).

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `as` | `React.ElementType` | `"div"` | The polymorphic HTML container element. |
| `layout` | `string` | `""` | The multiline grid-template-areas matrix defining the 2n column sequence. |
| `preventFocusSteal` | `boolean` | `true` | When `true`, intercepts `pointerdown` default events to prevent the input from losing focus. Set to `false` to opt out. |
| `onKey` | `(value: string) => void` | `undefined` | Dispatched when any child key is activated. |
| `[key: onKey${string}]` | `((value: string) => void) \| undefined` | `undefined` | Dynamic handlers mapped to specific named areas (e.g., `onKeyDel` for `area="del"`). |

---

### Implementation Trade-offs & Security Architecture

Below is an overview of the implementation vectors considered, evaluating structural complexity, runtime performance, and security profiles.

| Implementation Vector | CSP Compliance Profile | SSR/Hydration Lock | Client Performance | Browser Compatibility |
| :--- | :--- | :--- | :--- | :--- |
| **1. Pure Inline Attributes** | ❌ Risky (`unsafe-inline`) | 🟢 Flawless | 🟢 Native CSS | 🟢 Universal |
| **2. Server Custom Style** | 🟢 Strict (`style-src 'self'`) | 🟡 Network Overhead | 🟡 Cache Bottleneck | 🟢 Universal |
| **3. Hybrid CSR Mutation** | 🟢 Strict (`style-src 'self'`) | ❌ Layout Thrash | ❌ Intermittent Lag | 🟢 Universal |
| **4. Native Engine Mapping (Research Target)** | 🟢 Strict (`style-src 'self'`) | 🟢 Flawless | 🟢 Native CSS | 🔴 Unconfirmed / In Spec Draft |

#### Vector 1: Pure Inline Attribute Injection
Direct HTML `style` object injection (`style={{ gridTemplateAreas: layout }}`).
* **Trade-off:** Requires `style-src 'unsafe-inline'` or `style-src-attr 'unsafe-inline'`. Exposes environments to Cross-Site Styling (XSS) and UI Redressing if dynamic layouts are ingested unescaped.

#### Vector 2: Server-Generated Dynamic CSS Modules
Extracting dynamic layouts to a server-side endpoint or Service Worker that generates cached CSS stylesheets.
* **Trade-off:** Satisfies strict CSP rules, but introduces network synchronization overhead, cache fragmentation, and potential layout delays on slower connections.

#### Vector 3: Client-Side Runtime DOM Mutation (Hybrid CSR)
Applying dynamic layout properties via client-side hydration hooks or inline element style attributes post-mount.
* **Trade-off:** Strict CSP compatibility, but increases the risk of Cumulative Layout Shift (CLS) and forces synchronous layout reflows during tree hydration.

#### Vector 4: Native CSS Core Mapping (Experimental Research Target)
Utilizes modern CSS token-level `attr()` capabilities directly in static stylesheets:
```css
.grid-container {
  grid-template-areas: attr(data-layout type(*));
}
.grid-item {
  grid-area: attr(data-area type(<custom-ident>));
}
```
* **Trade-off & Research Status:** Offers ideal CSP compliance and frame-one parsing with zero JS execution. However, **engine support remains in doubt and is actively an open research topic**, as stable browser engines do not yet provide baseline implementations for typed token evaluation across layout properties.

---

## Drawbacks

* **Grid Overallocations:** Forcing a mandatory `2n` grid doubles the column footprint under the hood. Large keyboards can lead to large DOM/CSS tree traces when calculating deeply multi-layered intersections.
* **String Parsing Delays:** Mapping string keys (`layout='"a a"'`) directly to identifiers means that mistyping or introducing stray white spaces inside string templates directly breaks the visual layout map without triggering compile-time errors.

## Alternatives

### 1. Primitive String Array Layouts
Libraries like `react-simple-keyboard` rely on raw string arrays (`layout: ['a b c', 'd e']`). This pattern restricts keys entirely to primitive string data values, making it difficult to pass rich React subcomponents, custom interactive states, or distinct markup (like SVG icons) into specific keys cleanly.

### 2. Fractional Unit Layout Components (`span` / `offset`)
An approach mimicking traditional UI column grids where sizes are assigned via numeric variables (e.g., `<Key offset={1} span={2}>`). Keyboards map to fixed physical unit structures, not abstract fractions; writing explicit column coordinates turns structural alterations into tedious alignment math equations and breaks readability when constructing vertical keys.

### 3. Programmatic Fluent Builders
A factory-style fluent chaining API (e.g., `new KeyboardBuilder().addRow(...)`). While type-safe, method chaining strips away spatial scannability. Layout profiles are spatial, and template string matrices allow developers to preview the physical representation of the interface directly inside the codebase.

## Prior art

* **`react-simple-keyboard`**: Configuration via string arrays; limited JSX markup flexibility.
* **W3C CSS Grid Layout Specification**: Direct baseline reference for `grid-template-areas`.
* **WAI-ARIA Toolbar and Grid Patterns**: Standards for keyboard accessibility and directional focus management.

## Unresolved questions

* **Browser Viability of Vector 4:** What is the browser support timeline and fallback viability for advanced CSS typed `attr()` values in `grid-template-areas`?
* **Dynamic Localization Transformations:** How can layout matrices shift instantly from ANSI QWERTY to ISO AZERTY without risking UI re-renders or hydration mismatches?
* **Build-Time Verification:** Can a linting plugin or macro be developed to validate that template string matrices balance correctly to the expected `2n` column factor at compile time?

## Future possibilities

* Introducing a dedicated build-time Babel plugin or Vite macro that reads static template literals to pre-bake static class maps, entirely removing layout serialization costs at runtime.
