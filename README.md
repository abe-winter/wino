# WINO

![James Doyle, a prominent example of the type, at a low point in his run](static/james-doyle-mugshot.jpg)

wysiwyg in name only. Wino provides the `<wino>` element:
* a multiline auto-height editor
* the focused line is rendered as plaintext
* unfocused lines are rendered by a user-provided function that transforms (string)->Node (for example, a markdown to html function)

## vs similar projects

The main **advantages** of Wino are simplicity (under 200 lines), extensibility (designed for your custom view) and the fact that it uses `<textarea>` instead of `contenteditable` (though certain arrow key operations are a little clunky). If you've ever been on a `contenteditable` editor and felt that subtle hang after pressing each key, you'll appreciate the speed of using raw `<textarea>`.

The main **disadvantage** of Wino is that lines aren't styled while they're being edited.

| project | similar | different |
|---|---|---|
| medium.js et al | not really | way less full featured, uses raw textarea |
| codemirror | uses a mirror element to display text | can't style focused line |

## demo

coming soon

## npm package

coming soon
