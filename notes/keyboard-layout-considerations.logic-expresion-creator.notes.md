# Design Exploration Notes: Keyboard Layout Considerations

## Motivation

We need to create a keyboard for an application to input mathematical expressions that are not easy to do with the default keyboards on touch devices. We will try to generalize as much as possible; nevertheless, this specific case will drive our initial constraints.

## Why not a existent library?

Fundamentally, this "Virtual Keyboard" libraries modifies the DOM client-side to create the buttons. If we need to have a server-side approach to minimize the initial payload, or we use a framework like React, this libraries completely bypasses the use of the framework and directly works with the client-side DOM. React, for instance, has a virtual DOM, and the library that adapts this packages to React are a wrappers around those direct DOM mutations.

## An intermediate representation

Independently from the framework and the rendering capabilities, maybe what we need is an IR to then create adapters around this data structure to create the UI only. The client-side listeners seem to be another responsibility.

## A starter approach with React

We estimate the cost of abstracting for any framework would be 10 days, considering our lack of knowledge. Since React offers us the chance to pre-render around their tree representation, a way to explore and gain a proper notion of this problem perhaps could be trying to create a React 19 implementation to find out what needs to be abstracted. At the same time, the demo will provide reusable code for the feature.

Is there already a library that does this? A fast search suggests that there is not..

## Notions

Let's start discovering as we go how this construction would look. First of all, a keyboard is composed of keys, so a keyboard needs to render at least one key.

```tsx
export function Keyboard(){
    return <button>a</button>
}
```

But there are some relevant questions in mind, like accessibility. We are assuming here that we always want a button, but is that the only case? Is it the best case?

Using alternative elements like a stylized `<div>` or `<span>` introduces a severe accessibility tax—you would have to manually add roles, keyboard navigation behaviors, and focus management states that `<button>` gives you for free.

In semantic HTML, an actionable control that triggers an immediate in-page behavior, such as inserting a character or changing a layout, rather than navigating to a new URL is a button. By using `<button>`, screen readers immediately announce the element as a clickable control, and the browser naturally manages its active and disabled states.

But I argue that HTML buttons are the only solution, because is possible to use custom HTML elements (web components) that are derived from a button. This idea will be as pending support for the time being or at least we will not focus too much on it at the start because I believe that the exploration naturally will lead us to create programmatic interfaces for this case, but the default, at least, would be the button element. This could be resolved by actually not deciding how to render the keys of the keyboard, but creating a contract via composition:

```tsx
export function Keyboard({Key = 'button'}){
    return <Key> a </Key>
}
```

To simplify and avoid letting any element pass as `Key`, we will standardize that a `Key` and `HTMLButtonElement`, in terms of programming interface, are equivalent.

Now, in this single Key/Keyboard, we have another important matter: how to "connect" it to its input. Normally, in touchable devices, the browser asks for the virtual keyboard when focusing on an input, and screen readers work in a similar fashion, but the focus of the input doesn't vanish. Therefore, we need a way to preserve the expected behavior and maintain the virtual keyboard accessible.

The problem arises ff we use some accessibility tool to navigate this hypothetically HTML button based virtual keyboard in contrast to use the native OS keyboard, or just by tapping the button, the focus is captured by said button, so the input will focus out in our case. We do not want that kind of behavior.

As a user that does not use assistive technologies often, the main idea that comes to my mind is to avoid the focus going to the button whenever I tap it and just let me tap it. But if we do this, it gives us some problems for users that use something beside a pointer: they need a way to focus on the keys.

The solution to avoid stealing focus on clicks and taps without breaking accessibility is straightforward:

1. **Preventing focus loss on pointer interactions:** When a user taps or clicks a key, we call `event.preventDefault()` inside the `pointerdown` event handler of the button. This tells the browser not to move focus away from the current input. The input never blurs, and the caret and selection range remain unchanged.

2. **Allowing assistive tools and keyboard navigation:** Calling `preventDefault()` on `pointerdown` only affects pointer interactions (mouse and direct touch). It does not block focus triggered by `Tab`, arrow keys, or switch controllers, because those use keyboard navigation events (`keydown`) and native focus mechanics. By organizing the keyboard as an ARIA composite widget (like a `toolbar` or a `grid` using roving `tabindex`), keyboard-only and assistive technology users can navigate through the keys deliberately.

Will this work universally across every assistive setup? On desktop, this setup operates cleanly with keyboard navigation and screen readers. On mobile screen readers (like VoiceOver or TalkBack), there are extra platform boundaries to consider: activations are performed through an accessibility tree rather than normal pointer events, and setting `inputmode="none"` can sometimes lead the system to treat the input as non-editable. An `aria-live` region set to `polite` may be necessary so newly inserted mathematical symbols are immediately announced to the user.

## Input

The input behaves in some way differently now that we are forcing some behavior with the buttons. What should we take into consideration?

First of all, it comes to mind that we need to avoid the normal behavior of using the virtual keyboard provided by the OS. This is possible with the `inputMode="none"` property, and an `autoComplete="off"` would be nice too. `autoCorrect="off"` would also be good because these are mathematical expressions.

Also, on mobile browsers, it happens that the text autocapitalizes, so `autoCapitalize="none"` is needed.

But because this input will not pop a keyboard or work like a normal input would be expected to, we need also to tell people using assistive technologies that this input is special and works in a special way. We can do this with `aria-describedby="keyboard-instructions"` and, of course, an element (usually hidden visually but not omitted from assistive technology readers) that has an ID of `"keyboard-instructions"` and tells the user how to use this input/keyboard combination.

This reminds me that the keyboard groups and containers also need an `aria-label` to announce what these buttons are about.

## Communication between the keyboard and the input

The virtual keyboard and the input have different responsibilities, therefore they should be different components. But they need some way to tell the other about the symbol that needs to be visualized.

So every time a button is "pressed" (meaning by a mouse, a touchpad, an assistive reader, etc.), an event must be emitted so the input can subscribe to it, and in the payload of the event, the symbol representation must be passed.

We need to be careful with this because maybe other parts of the code need to be subscribed as well but need other things to read from the event, such as some `data-*` attribute values for other purposes, like creating a historic log of what was pressed.

## Vulnerabilities

Why do browsers, in the first place, not allow us to create OS-native virtual keyboards? Because there are some scenarios where the data can be intercepted, so it is feasible to reason that we need to be careful here as well to avoid the same pitfalls that an external keyboard evades, but with other mechanisms, of course.

We need to create the threat models, of course, but being pragmatic, this keyboard is for mathematical exercises and similar cases, so it is not for important data, or at least MUST not be used for those cases, for the time being. A sensible disclaimer to the development users of the keyboard would do.

In general, we can reason that for normal important data, the traditional OS-based virtual keyboard needs to be used, and this soon-to-be library would serve for edge cases and not be used for important cases like PII and password handling whatsoever.

## Layout

Since these are HTML elements, CSS can take care of this, but by default I believe we would need to follow a pattern of a structure like a brick wall, or at least it would be one of the presets. Presets like having everything straight, like a grid, could also exist.

Regarding the keys, some keys need to have more than one space, so it seems the initial approach fails. A real composition may better look like this:

```tsx
<Keyboard>
    <KeyboardGroup layout={preset('brick-wall')}>
        <Key>A</Key>
    </KeyboardGroup>
    <KeyboardGroup layout={preset('straight')}>
        <Key span={2}>Del</Key>
    </KeyboardGroup>
</Keyboard>
```

But another problem arises next: responsiveness.

## Responsiveness

I thought about trying to group keys inside rows, pretty much like a table, but that wouldn't solve the problem yet. How would this behave? For instance, if we have no more horizontal space, would keys reorder, going to the next row? Or would it be better to have fixed elements in a row and have these elements become smaller or bigger depending on the available space? What happens if someone zooms in or has, by default, a big font size?

The thing with keyboards is that we depend on muscle memory, so reordering would break that. Scaling seems like the way to go. We would need to define the edge cases where there are overflows.

So we can safely put "rows", and I put it in quotes because I am thinking about the case of a vertical stack. You may argue, well, these are two rows, right? But that may be too verbose.

Another way would also be to limit the number of keys per "row" (let's call them Lanes, like in bowling). I believe support for both cases would be nice to have.

```tsx
<Keyboard>
    <KeyboardGroup layout={preset('brick-wall')}>
        <Lane>
            <Key>A</Key>
        </Lane>
        <Lane>
            <Key>B</Key>
        </Lane>
    </KeyboardGroup>
    <KeyboardGroup layout={preset('straight')}>
        <Lane>
            <Key span={2}>Del</Key>
            <Key>C</Key>
        </Lane>
    </KeyboardGroup>
</Keyboard>
```

## Next Steps

1. Define the formal TypeScript interface for the React Components

2. Build the focus management hook using `preventDefault` on `pointerdown` and composite ARIA roles.

3. Test touch screen readers (iOS VoiceOver and Android TalkBack) against `inputmode="none"` and setup the `aria-live` announcements.

4. Write the RFC for the component interfaces.
