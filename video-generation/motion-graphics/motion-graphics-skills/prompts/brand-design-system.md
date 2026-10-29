# Your brand design system

On a fresh Claude Code with nothing set up, the one-line prompt picks its own colours, its own type and its own idea of motion. The fix is one file of rules (your colours, type, timing and what never to do) that Claude reads before it animates anything.

These two prompts are what the `brand-intake` skill runs for you. Use them directly if you want to set it up by hand.

## 1. Write MOTION.md from your references

Put five frames from motion you already like in a folder called `examples`. Screenshots from Dribbble or Pinterest are fine. Then paste this:

```
I am giving you five frames from motion graphics I already like. They are in the examples folder.

Write me one file called MOTION.md that any AI can read before it animates anything for me. It must cover:

1. Every colour as a hex code, and what each one is for
2. The fonts and the type sizes
3. Timing: how things come in, how long they hold, and how they leave
4. How things move: the frame rate, the easing, and anything that makes it feel handmade
5. Texture and finish
6. Five things my motion must never do, named plainly
7. One example, described shot by shot, of it done right

Work only from what is in the frames. Where you cannot tell, write ASK ME rather than guessing.

Show me the file before you save it.
```

When I ran it on five frames from my own work, it noticed I use four different looks and asked which one to use. Pick one master look, or say which look goes with which job.

## 2. Make Claude read it first

Use this once, straight after MOTION.md is saved. It adds the read-first rule to CLAUDE.md:

```
Add this to CLAUDE.md, and create the file if it does not exist:

Before designing, generating or animating anything, read MOTION.md in full.

Every colour, font, timing and motion value comes from that file.

The file sets the look, not the ambition. When I say go all out, go all out.

If something I ask for is not covered there, ask me rather than choosing for yourself.

When you have finished, check your own frames against MOTION.md, fix what fails, and only then show me.
```

The ambition line matters. Without it, the first build with the file comes out far too polite.

## 3. Compare the two

Run the one-line prompt from [start-here.md](start-here.md) again, once in an empty folder and once in this project. With the file in place it should stop and ask before it builds anything. That is the file working. Both versions go all out. Only one of them looks like yours.
