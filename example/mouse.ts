// deno run --unstable example/mouse.ts
// ESC ... exit.

import { Tui } from '../tui.ts';

const tui = new Tui();

// Enable mouse input.
tui.enableMouse();

// You can get mouse click & release.
tui.onMouse = (event) => {
  tui.terminal.clear();
  tui.terminal.move(1, 1);
  console.log('Mouse:');
  console.log(event);
};

// Get keyboard input.
tui.onInput = (buffer) => {
  tui.terminal.clear();
  tui.terminal.move(1, 1);
  console.log('Keyboard:');
  console.log(buffer);
};

await tui.start();
