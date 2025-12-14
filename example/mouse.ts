import { Tui } from '../mod.ts';

const tui = new Tui();

// Enable mouse input.
tui.enableMouse();

// Disable onMouse.
// Because you set onClick or onWheel.
tui.onMouse = (event) => {
  tui.terminal.clear();
  tui.terminal.move(1, 2);
  console.log('ESC ... exit.');
  console.log('Mouse: (Disable)');
  console.log(event);
};

tui.onClick = (event) => {
  tui.terminal.clear();
  tui.terminal.move(1, 2);
  console.log('ESC ... exit.');
  console.log('Mouse click:');
  console.log(event);
};

tui.onWheel = (event) => {
  tui.terminal.clear();
  tui.terminal.move(1, 2);
  console.log('ESC ... exit.');
  console.log('Mouse wheel:');
  console.log(event);
};

// Get keyboard input.
tui.onInput = (buffer) => {
  tui.terminal.clear();
  tui.terminal.move(1, 2);
  console.log('ESC ... exit.');
  console.log('Keyboard:');
  console.log(buffer);
};

await tui.start();
