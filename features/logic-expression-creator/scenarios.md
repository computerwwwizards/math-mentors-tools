---
status: discovery
---

# Logic Expression Creator Scenarios

## Scenarios

### Inline Syntax Creation and Correction
* Initialize application on a "touch-screen" device
* Tap virtual keyboard buttons "p", "∧", "q"
* Verify feedback screen displays "p ∧ q" with cursor at the end
* Tap virtual keyboard button "DEL"
* Verify feedback screen displays "p ∧" with cursor at the end
* Verify syntax validation state is "incomplete"

### Physical Keyboard Token Translation
* Initialize application on an "external keyboard" device
* Type physical keys "p", "&", "(", "q", "v", "r", ")"
* Verify feedback screen displays "p ∧ (q ∨ r)"
* Verify syntax validation state is "valid"

## Optional Scenarios

### Middle of Expression Modification
* Initialize application with active tokens "p", "∧", "r"
* Tap cursor navigation button "<" 2 times
* Verify cursor is positioned between "∧" and "r"
* Tap virtual keyboard buttons "q", "∧"
* Verify feedback screen displays "p ∧ q ∧ r"
* Verify syntax validation engine executes from current cursor index

### Layout Label Toggle Switch
* Initialize application with active tokens "p", "∧", "q"
* Toggle notation preference switch to "Text" mode
* Verify virtual keyboard buttons change display to "NOT", "AND", "OR"
* Verify feedback screen notation transforms display to "p AND q"
* Verify underlying abstract syntax tree tokens remain unchanged

### Extended Variable Key Allocation
* Initialize application on an "external keyboard" device
* Type physical hardware keys "a", "∧", "b"
* Verify feedback screen displays "a ∧ b"
* Verify system parses expressions exceeding standard "7" variable panel limitations
