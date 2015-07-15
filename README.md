# WINO

wysiwyg in name only. Wino provides the `<wino>` DOM element:
* a multiline auto-height editor
* the focused line is rendered as plaintext
* unfocused lines are rendered by a user-provided function that transforms (string)->Node (for example, a markdown to html function)

## vs similar projects

**advantages** of Wino:
* simplicity (under 200 lines)
* extensibility (designed for your custom view)
* using `<textarea>` instead of `contenteditable` (though certain arrow key operations are a little clunky). If you've ever been on a `contenteditable` editor and felt that subtle hang after pressing each key, you'll appreciate the speed of using raw `<textarea>`.

**disadvantage** of Wino:
* lines aren't styled while they're being edited.
* arrow-key navigation between lines of text is clunky

| project | similar | different |
|---|---|---|
| medium.js et al | not really | way less full featured, uses raw textarea |
| codemirror | uses a mirror element to display text | can't style focused line |

## demo

1. clone the repo `&& cd wino`
1. `npm install && npm run build`
1. `cd examples`, then
  - `open -a firefox tags.htm` (osx)
  - `firefox tags.htm`? (os!x)

## npm package

too soon

![James Doyle, a prominent example of the type, at a low point in his run](static/james-doyle-mugshot.jpg)
