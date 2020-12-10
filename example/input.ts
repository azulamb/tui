// deno run --unstable example/input.ts
// ESC ... exit.

import { Tui } from '../tui.ts'

const tui = new Tui();

// Enable mouse input.
tui.enableMouse();

// Get all input.
// You can get mouse input if enableMouse() & do not set onMouse callback.
tui.onInput = ( buffer ) =>
{
    tui.terminal.clear();
    tui.terminal.move( 1 , 1 );
    console.log( buffer );
};

await tui.start();
