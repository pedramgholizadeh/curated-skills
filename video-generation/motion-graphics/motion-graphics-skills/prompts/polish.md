# Polish

Three prompts for the last 10%: turn "it feels a bit cheap" into a list of fixes, stop Claude drawing fake UI, and fix one thing without breaking the rest.

## Audit it against Apple's motion rules

A free skill (not mine) turns Apple's design guidelines into rules Claude follows. Install it once, in your terminal:

```
npx skills add emilkowalski/skills --skill apple-design
```

Use this on any animation that feels off but you cannot say why:

```
Use the apple-design skill to audit this animation. Give me a ranked list of everything that feels off, worst first.
```

Paste the fixes back as notes, one at a time.

## Use real components, not drawn ones

If your video shows a product, do not let Claude draw the buttons and cards from scratch. It guesses the spacing, and the UI looks fake (anyone who uses good software spots it in a second). [21st.dev](https://21st.dev) publishes real components with a prompt under each one.

Paste this once, then paste any component prompt straight in:

```
Add this rule to CLAUDE.md: whenever I paste a component prompt or third-party component code, treat it as a structural donor only. Keep its engineering. Replace its demo copy with my real copy, and translate every colour, border, shadow, font and timing to MOTION.md.
```

## Fix one thing at a time

Use this when it is close but not right. Name one thing. It gets you there faster, and it stops Claude changing the motion you liked:

```
effect.html is close. Fix one thing only: [what looks wrong, e.g. the headline runs past its box at 3 seconds]. Keep the motion, the timing and the loop exactly as they are. Tell me what you changed.
```
