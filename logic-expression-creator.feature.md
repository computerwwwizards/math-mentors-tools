# Logic Expression Creator



An on-screen calculator-style keyboard for building propositional logic expressions, featuring real-time verification to prevent malformed syntax.



## Motivation



Students often struggle with various topics in math and logic courses. To address this, we plan to build digital tools that help students practice the usage and evaluation of propositional logic expressions.  



## Scenarios

The scenarios are in their respective markdown



## Definitions



### Virtual Keyboards vs. Physical Keyboards

**Virtual keyboards** are software-based keyboards provided by the device's operating system (OS) that appear directly on the screen—for example, when tapping a text field in a mobile app. In contrast, **physical keyboards** are hardware peripherals with mechanical or membrane keys that send hardware signals to the device, which the OS then translates into text (e.g., a laptop keyboard).



### Propositional Variable

A variable that represents a statement capable of holding a truth value. For example, in the molecular proposition:





```

p OR q 

```



Both `p` and `q` are propositional variables because they can hold either a `TRUE` or `FALSE` value.



### Feedback screen



Immediate representation of the expression that mutates upon pressing a button. E.g.  a green rectangle containing the expression "p AND q" that changes to "p AND" upon pressing the  "delete" button.



## Constraints



On **touch-screen environments**, the application will use a specialized, in-app virtual keyboard containing only the buttons necessary for logical operations, completely bypassing the device's native OS keyboard. On **external keyboard environments**, the application MUST support keyboard shortcuts and direct signal translations from the physical hardware alongside the custom in-app keyboard.



Specifically, for boolean operations, the system must support any lowercase letter to represent variables, `0` and `1`, and `T` and `F` (as reserved words) to represent true and false states.



We are developing a custom web-based virtual keyboard rather than relying on the device's native OS keyboard for two main reasons:

1. Native physical or virtual keyboards lack direct mapping or dedicated keys for specific logical operations.

2. The core logic processing engine requires a strictly structured representation of expressions and operations, which is easier to capture via a managed in-app interface.



Additionally, interfacing with or modifying native OS keyboards presents a [strong possibility of technical limitations](Virtual-keyboards-limitations).



## Ambiguity



### Virtual Keyboard Limitations

We are still evaluating whether to interface directly with the OS on-screen virtual keyboard or rely entirely on our in-browser keyboard. Modifying native keyboard behavior at the OS level is often restricted due to security measures against input interception. If a workaround exists, it will likely require strict, platform-specific conditions.



### Propositional Variables Quantity

By experience of the author of this document (so, this needs verification), most exercises do not feature more than 7 variables, the reason is believed to be that human students will have not enoguh time computing and tabulating. 



### Reserved words  and symbols

For some students using notations like AND, OR , XOR is going to be more readable rather than symbols, for other students will be the other case around, so it seems it would be important to allow switch representations in the buttons and the [feedback screen](#feedback-screen). 



This symbols and expressions MUST be reserved or conflicts would arise.



### Keyboard layout

Personbalziation fo the virtual custom layout seems to be neccesary, but first we would need data to support this possible feature.



### Validation

Rules on how to validate if the expression is correct or not are still pending, since this are mathemtical expressions there ougth to be a formal body of knwledge about it.



### Validation feedback

When the sintax of the expression is wrong, principle sof desing tells us that a direct reason and suggestions how to correct the possible problem are apprecitaed by users. Nevertheless we stil do not know the effort to make this work, so if it seems difficutl we may only feed the user with a general error alert and some general reason.



### Feedback screen cursor

If you ever used a very old CLI, you know that the cursor for the text you are writting is not cahngable by a mouse, you use usaully the keyboard to navigate back and foward. Beacuse we still do not know the cost of supportgin both  pointer based cursor anbd key based cursos position modification, is open to investigation which will be priotized.

