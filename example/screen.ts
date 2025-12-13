// deno run --unstable example/screen.ts
// ESC ... exit.

import { Tui } from '../tui.ts';

const tui = new Tui();

function draw() {
  tui.terminal.clear();

  tui.terminal.move(3, 3);
  console.log(`${tui.terminal.width} x ${tui.terminal.height}`);

  tui.terminal.move(1, 1);
  console.log('1');

  tui.terminal.move(tui.terminal.width, 1);
  console.log('2');

  tui.terminal.move(1, tui.terminal.height);
  Deno.stdout.writeSync((new TextEncoder()).encode('3'));

  tui.terminal.move(tui.terminal.width, tui.terminal.height);
  Deno.stdout.writeSync((new TextEncoder()).encode('4'));
}

tui.enableMouse();

tui.onClick = (event) => {
  draw();
  if (event.startX === event.x && event.startY === event.y) {
    tui.terminal.move(event.x, event.y);
    Deno.stdout.writeSync((new TextEncoder()).encode('*'));
  } else {
    tui.terminal.move(event.startX, event.startY);
    Deno.stdout.writeSync((new TextEncoder()).encode('<'));
    tui.terminal.move(event.x, event.y);
    Deno.stdout.writeSync((new TextEncoder()).encode('>'));
  }
  tui.terminal.move(3, 4);
  console.log(`${event.x} x ${event.y}`);
};

tui.onResize = draw;

await tui.start(draw).finally(() => {
  tui.terminal.move(tui.terminal.width, tui.terminal.height);
});
