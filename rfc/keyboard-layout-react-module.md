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
[  d   ][ e    ]|   |
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

Both the `<Key>` and `<KeysGroup>` components must implement a fully working **polymorphic `as` prop**. This allows developers to change the underlying HTML element rendered at runtime (e.g., swapping a `<div>` layout container for a `<section>`, or turning a `<Key>` into an anchor `<a>` or semantic `<button>`) while preserving all internal layout systems.

### Component Prop Types

#### `<Key>` Components
The `<Key>` component forwards all intrinsic attributes of its target element type and introduces the following API configuration:

| Prop | Type | Description |
| :--- | :--- | :--- |
| `as` | `React.ElementType` | The polymorphic HTML tag or custom element to render at runtime. Defaults to `"button"`. |
| `area` | `string` | Optional. Specifies the target grid-template-area string connector. If omitted, the element infers its location from its text string children. |

#### `<KeysGroup>` Components
The `<KeysGroup>` component serves as the grid manager wrapper:

| Prop | Type | Description |
| :--- | :--- | :--- |
| `as` | `React.ElementType` | The polymorphic HTML tag or custom element wrapper. Defaults to `"div"`. |
| `layout` | `string` | The multiline grid-template-areas configuration block defining the 2n column sequence. |

---

### Implementation Trade-offs & Security Architecture

The architectural choices for passing dynamic matrix profiles like `layout` directly from template inputs create distinct trade-offs regarding browser runtime speed, rendering lifecycles, and environment isolation.

Below is an analytical overview of the implementation vectors considered, tracking structural complexity against security compliance parameters.

| Implementation Vector | CSP Compliance Profile | SSR/Hydration Lock | Client Performance |
| :--- | :--- | :--- | :--- |
| **1. Pure Inline Attributes** | ❌ Broken / Risky | 🟢 Flawless | 🟢 Native CSS |
| **2. Server Custom Style** | 🟢 High Security | 🟡 Network Overhead | 🟡 Cache Bottleneck |
| **3. Hybrid CSR Mutation** | 🟢 High Security | ❌ Layout Thrash | ❌ Intermittent Lag |
| **4. Native Engine Mapping** | 🟢 High Security | 🟢 Flawless | 🟢 Native CSS |

#### Vector 1: Pure Inline Attribute Injection
Developers using this module often gravitate toward direct HTML `style` object string generation (`style={{ gridTemplateAreas: layout }}`). 

* **The Security Trade-off:** This configuration requires degrading the production host environment to support `style-src 'unsafe-inline'` or `style-src-attr 'unsafe-inline'`. 
* **The Hazard Profile:** It drops defenses against Cross-Site Styling (XSSss) and UI Redressing. If the input parsing pipeline fails to properly escape layout configurations pulled from database stores, malicious actors can exploit quote escapes to append dangerous style blocks (e.g., full-screen fixed overlays or background tracker links).
* **The Development Cost:** Low. It offers instant rendering out of the box with zero runtime configuration overhead, making it a common choice for developers willing to compromise security protocols for rapid implementation.

#### Vector 2: Server-Generated Dynamic CSS Modules
An alternate approach involves shifting layout generation to a server-side endpoint or Service Worker fallback layer that transforms string profiles into cacheable CSS files.

* **The Security Profile:** Keeps environments strictly locked down under a strict `style-src 'self'` policy.
* **The Hazard Profile:** High operational overhead. It introduces data synchronization delays and increases CDN cache fragmentation. Generating independent, per-user layout sheets on the fly drops cache hit rates and forces page loads to stall while fetching blocking layout-related asset endpoints over the network.

#### Vector 3: Client-Side Runtime Dom Mutation (Hybrid CSR)
To maintain a strict CSP while avoiding server stylesheet bottlenecks, the module can execute feature detection hooks during client hydration to catch legacy environments.

* **The Security Profile:** Fully compliant with `style-src 'self'`.
* **The Hazard Profile:** High risk of layout thrashing and Cumulative Layout Shift (CLS). If feature metrics default to a generic baseline grid during SSR, client hydration hooks must step in post-render to append fallback CSS custom properties. 
* **The Performance Cost:** Bypassing state variables in favor of callback ref mutations mitigates double-rendering issues, but legacy environments still experience visible layout shifts as the browser engine forces synchronous layout calculations right before painting the interface frame.

#### Vector 4: Native CSS Core Mapping (The Target Architecture)
The recommended production standard bypasses JavaScript manipulation and custom stylesheet builders entirely by utilizing modern CSS Level 3 data-parsing features.

* **The Security Profile:** Maximizes infrastructure safety under a strict `style-src 'self'` rule. No inline style definitions or hashes required.
* **The Mechanics:** The server outputs layout parameters inside clean `data-layout` and `data-area` node matrices. The module’s static external CSS file intercepts these entries using advanced typed token attributes:

```css
.grid-container {
  grid-template-areas: attr(data-layout type(*));
}
.grid-item {
  grid-area: attr(data-area type(<custom-ident>));
}
```

* **The Trade-off Profile:** Native layout parsing occurs on frame one during initial tree assembly, ensuring zero rendering delays and completely removing JavaScript from the layout execution loop. 
* **The Compatibility Cost:** Relies on modern browser engines with stable baseline support for advanced typed `attr()` token evaluations. Legacy browser variations that fail token compatibility checks will safely fall back to the module's standardized hardcoded single-unit grid default unless paired with a structured, animated layout fallback loop.

## Drawbacks

* **Grid Overallocations:** Forcing a mandatory `2n` grid doubles the column footprint under the hood. While hidden from the developer, large keyboards can lead to large DOM/CSS tree traces when calculating deeply multi-layered intersections.
* **String Parsing Delays:** Mapping string keys (`layout='"a a"'`) directly to identifiers means that mistyping or introducing stray white spaces inside string templates directly breaks the visual layout map without triggering compile-time errors.

## Alternatives

### 1. Primitive String Array Layouts
We looked at industry standards (like `react-simple-keyboard`) that define layouts using raw string arrays (`layout: ['a b c', 'd e']`). 

This pattern restricts keys entirely to primitive string data values. It makes it incredibly difficult to pass rich React subcomponents, custom interactive states, or distinct markup (like SVG icons) into specific keys cleanly.

### 2. Fractional Unit Layout Components (`span` / `offset`)
We evaluated an approach mimicking traditional UI column grids where sizes are assigned via numeric variables (e.g., `<Key span={2} offset={1}>`).

Keyboards map to fixed physical unit structures, not abstract fractions. Writing explicit column coordinates separates the developer from the spatial layout identity. It turns simple structural alterations into tedious alignment math equations and completely breaks readability when constructing vertical keys.

### 3. Programmatic Fluent Builders
We considered exposing a factory style fluent chaining API (e.g., `new KeyboardBuilder().addRow(...)`).

While highly type-safe, method chaining strips away all visual scannability. Layout profiles are spatial, and our template string pattern allows developers to preview the physical representation of the interface directly inside the codebase.

## Prior art

* **`react-simple-keyboard`**: Relies heavily on rigid configuration blocks via simple arrays. Highly limiting for custom JSX markup inclusion or modular template component scoping.
* **W3C CSS Grid Layout Specification**: Direct baseline reference for `grid-template-areas`. The proposed system is essentially a lightweight typed abstraction layered over native CSS grids.

## Unresolved questions

* How do we handle dynamic localization transformations (e.g., shifting layout matrices instantly from ANSI QWERTY configurations to ISO Azerty setups) cleanly without risking UI re-renders or hydration mismatches?
* Can we build an automated build-time compiler or macro to warn developers if their template string column counts fail to resolve back cleanly to the expected `2n` factor?

## Future possibilities

* Introducing a dedicated build-time Babel plugin or Vite macro that reads static template literals to pre-bake static class maps, entirely removing layout serialization costs at runtime.


