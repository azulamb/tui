# tui

Deno Terminal UI library.

## Example

Example code is in the `./example` directory.

```ts
import { Tui } from '../mod.ts';

const tui = new Tui();

tui.onInput = (buffer) => {
  tui.terminal.clear();
  tui.terminal.move(1, 2);
  console.log('ESC ... exit.');
  console.log(buffer);
};

await tui.start();
```
