# lasso-canvas-image

Polygon selecting tool for HTML5 Image Element

![View](example.jpg)

## Note

This package has been turned into a responsive react component and will no longer be supported.

Check out newest [version](https://github.com/akcyp/react-lasso-select)!

## Instalation

```bash
npm i lasso-canvas-image
```

## Usage

```js
// ES6 modules with Babel or TypeScript
import createLasso from 'lasso-canvas-image';

// CommonJS modules
const createLasso = require('lasso-canvas-image');

// Init
const lasso = createLasso({
  element: document.querySelector('img'),
  radius: 10,
  onChange (polygon) {
    console.log('Selection area changed: ' + polygon);
  },
  onUpdate (polygon) {
    console.log('Selection area updated: ' + polygon);
  }
});

// Methods
lasso.reset();
lasso.setPath('100,100 300,100 200,200');

lasso.disable();
lasso.enable();
```

## Examples

Check out this [example](https://akcyp.github.io/lasso-canvas-image/)

[![Edit lass-canvas-image](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/lasso-canvas-image-cboun?fontsize=14&hidenavigation=1&theme=dark&view=preview)

## Syntax

```ts
function createLasso ({
  element: HTMLImageElement,
  radius?: number,
  onChange?: (polygon: string) => void,
  onUpdate?: (polygon: string) => void,
  enabled?: boolean
})
```

Options

- `element` DOM HTMLImageElement Instance
- `radius` The radius of the circle's dots on the canvas
- `onChange` Runs when the selected area is updated or points are moved by the user
- `onUpdate` Runs when the selected area is updated
- `enabled` defaults to true
