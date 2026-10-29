# The 16 effects, as build recipes

Every recipe runs on the same 8-second clock. Times are seconds from the start of the loop.

| Phase | Seconds | What happens |
|---|---|---|
| Start | 0.0 | The start state, held for one frame |
| Move | 0.0 to 2.2 | The one change, eased in and out (cubic) |
| Hold | 2.2 to 6.6 | The finished state. Something small keeps living here, so the hold never looks frozen |
| Return | 6.6 to 8.0 | Everything eases back to the start state |
| Loop | 8.0 | Identical to 0.0, pixel for pixel |

Inside the move, parts start at different moments. "Early" means the first 0.8 seconds, "middle" about 0.8 to 1.4, "late" 1.4 to 2.2.

Colour roles below are written as **ground**, **surface**, **ink**, **muted**, **accent** and **second accent**. Take every one from MOTION.md. The demo words in each recipe show the shape of the content. Replace them with the user's real words.

---

## Interfaces: show a product doing something

### 01 Button → player

**What it is:** a small Preview button grows into a full video player.

- **Start:** a pill button with a play triangle and the word "Preview", top left, on a dark ground.
- **End:** a large player filling the tile: a thumbnail image, a title ("Spring launch"), a time readout ("0:17 / 0:42") and a progress bar with a round handle.
- **Timing:** 0.0 to 2.2 the button's own shell stretches into the player shape. Its label fades out in the first quarter of the move. The player contents fade in over the second half. The play icon travels from the button to the centre of the player, grows a dark disc behind it and turns from ink to surface colour. At about 2.6 the play icon morphs into pause. Through the hold the progress bar creeps forward and the time readout counts up. From 6.6 the pause turns back into play and the shell shrinks home.
- **What makes it premium:** it is one object changing shape, never a fade from one thing to another. A faint ghost of the button stays where it started, so the eye sees where the player came from. The play-to-pause change is a morph of two shapes, not a swap.
- **Use it when:** you add a "watch the demo" moment to a landing page or launch email.

### 02 Search → results

**What it is:** a search box opens, a query types itself and results stack in.

- **Start:** a short pill with a magnifier and the grey placeholder "Search".
- **End:** a full-width search bar reading "spring campaign" and three result cards below it, each with a coloured tile, a title and one metric line ("Email · 48% opens").
- **Timing:** early, the pill widens to full width and a caret appears. From about 0.75 to 1.2 the query types one letter at a time. From 1.1 the three results rise 14 pixels into place, one after another, each starting a beat after the last. The hold keeps the finished list. The return reverses it, results first.
- **What makes it premium:** the pill opens before the typing starts, so the two moves never fight. Results stage in, they do not pop in together. Every result carries one real number, not filler bars.
- **Use it when:** you show what people find when they search your help centre or content library.

### 03 Card → workspace

**What it is:** one small card opens into the full editor it belongs to.

- **Start:** a collapsed card bottom left, outlined, titled "Q3 brief" with two grey text bars.
- **End:** an editor window: title bar with three dots, a sidebar with one active item in the accent colour, a document title ("Launch plan"), text bars, an image and two status chips ("Draft", "3 edits").
- **Timing:** 0.0 to about 1.4 the card's shell grows from its own corner into the window. Faint dashed guides run from the card's corners to the window's corners. The card's own text bars fade out in the first fifth. The window's contents only fade in once the shell is past halfway. The "Q3 brief" title travels from the card into the window's title bar. The hold keeps the open workspace. The return folds it back into the card.
- **What makes it premium:** the title is a shared element. It moves, it is never duplicated. A dashed ghost of the closed card stays at the origin. The contents wait until there is room for them, so nothing is squashed.
- **Use it when:** you announce a feature, and one small card becomes the whole editor.

### 04 Tabs → panels

**What it is:** a selected tab slides across to the next tab and the panel below changes with it.

- **Start:** three tabs (Reels, Posts, Email) with Reels selected in a dark pill. The panel shows "Reels this week", a count chip and three ranked rows.
- **End:** Posts selected. The panel shows "Posts this week", a new count and three new rows.
- **Timing:** early, the selection pill stretches. Its leading edge moves first and its trailing edge follows a beat behind, so the pill gets long, then short again as it lands. Two short speed lines trail it. Each tab label brightens as the pill covers it. From about 0.9 the panel header and the three rows swap, each sliding 14 to 16 pixels sideways as it fades, top row first.
- **What makes it premium:** the stretch. A pill that slides at one width looks mechanical. Label colour follows how much of the pill sits over it, so the text never flips.
- **Use it when:** you compare plans, packages or channels without a wall of text.

---

## Data and lists: make a point land

### 05 Chart morph

**What it is:** six bars turn into a line through their own tops.

- **Start:** a bar chart titled "Weekly reach", six bars (Monday to Saturday), light gridlines and a baseline. The label "illustrative" sits top right when the numbers are samples.
- **End:** a smooth line through the same six values, a soft fill under it, a dot on every point, the last point in the accent colour and a small tag showing its value ("92").
- **Timing:** from the start of the move each bar slims to a hairline, left to right, each a beat after the last. From about 0.84 the line draws on from left to right with the fill fading in under it. Each dot pops in as the line reaches it. At about 1.5 the value tag rises onto the last point. The return fattens the bars again and the line retracts.
- **What makes it premium:** the values never change. The same six numbers are bars and then a line, so the viewer trusts it. The line is drawn, it does not fade in.
- **Use it when:** you drop a weekly result into a client report or a results post.

### 06 Dashboard zoom

**What it is:** one KPI tile lifts out of a full dashboard and fills the frame.

- **Start:** a quiet dashboard: three KPI tiles, a trend line and two grey text bars.
- **End:** the dashboard dimmed behind a large card: "Signups", a delta chip ("+18%"), the big number ("12,480") and a sparkline.
- **Timing:** in the first 0.9 seconds four corner brackets in the accent colour snap around the chosen tile. Across the move the rest of the dashboard dims. From about 0.7 the tile scales forward from its exact position to the large card, with dashed guides joining the tile's corners to the card's. The card's contents fade in over the second half. The hold keeps the card. The return shrinks it back into its slot.
- **What makes it premium:** the card grows from the tile's real position and size, so it reads as the same object coming closer. The brackets say "this one" before anything moves.
- **Use it when:** you pull the one KPI that matters out of your monthly dashboard.

### 07 Spring stack

**What it is:** a neat stack of cards fans out and the top card overshoots, then settles.

- **Start:** three product cards stacked at the same angle. The top one shows an image, a name ("Summer kit"), a price and a tick button.
- **End:** the three cards fanned at three different angles.
- **Timing:** each card follows a real spring with its own damping. The back card is heavily damped, the middle one less, the top card least, so it swings past its resting angle and wobbles back. The top card leads, the others follow 0.05 and 0.1 behind. The spring has settled by about 1.8. A dashed ghost shows the top card's resting angle. While it swings, a short trail of accent dots follows its corner. A small easing graph in the corner shows a dot riding the overshoot curve in time with the card. The return eases all three back into the stack with no spring.
- **What makes it premium:** springs, not easing curves, and different damping per card. The ghost and the curve inset explain the physics without a word.
- **Use it when:** you show three offers, case studies or testimonials, one after another.

### 08 Magnetic dock

**What it is:** a dark app dock whose icons swell as a cursor passes over them.

- **Start:** seven small square icons in a translucent dock, all the same size, cursor off to the right.
- **End:** the cursor over the middle of the dock, the icons nearest it grown, a label above the biggest one.
- **Timing:** during the move the cursor glides in and the icons grow. Each icon's size follows a bell curve of its distance from the cursor. The dock re-centres as it widens, so it grows around the cursor rather than to one side. Through the hold the cursor sweeps left and right once, and the swell and the label follow it. On the return the cursor leaves and the icons shrink.
- **What makes it premium:** the size is a smooth falloff, not "this icon big, the rest small". The label always sits over the largest icon, and a faint dashed curve above the dock draws the falloff.
- **Use it when:** you show the tools you use, or the integrations your product has.

---

## Type: make the words move

### 09 Masked type

**What it is:** artwork rises through the letters of a big outlined word.

- **Start:** the word "OPUS" as a thin outline, an issue label ("ISSUE 05") top left, a season top right, an empty line below.
- **End:** the letters filled with artwork, and a second line ("in motion") sitting under the word.
- **Timing:** over the first 1.35 seconds the fill edge rises from the bottom of the letters to the top. An accent line with a small square handle marks the edge as it climbs. From about 0.95 the second line rises into view from behind a clean cut line. The edge marker fades once the fill is complete.
- **What makes it premium:** the artwork only shows inside the letterforms. The second line is revealed by a mask, not faded in. The marker line shows the viewer what the motion is doing.
- **Use it when:** you reveal a campaign name, newsletter issue or launch headline.

### 10 Elastic type

**What it is:** each letter of a word stretches on one locked baseline.

- **Start:** the word "STRETCH" at rest on a labelled baseline, a small ghost of the word underneath.
- **End:** the letters stretched into a peak. The middle letter is the tallest and narrowest, and the rest fall away evenly on both sides.
- **Timing:** the stretch starts from the middle letter and spreads outwards, each pair a beat later. The middle letter peaks at about 1.3 and the outer letters finish with the move at 2.2. A cursor and a handle sit on the middle letter's top, with a dashed line showing how far it moved. A readout counts the width down ("wdth 100" to "wdth 62"). The hold keeps the peak. The return relaxes every letter together.
- **What makes it premium:** the baseline never moves. Letters change width as well as height, so the word stays one word. The middle letter is the only one in the accent colour.
- **Use it when:** you open an event, webinar or podcast with a moving title card.

### 11 Text → layout

**What it is:** one plain headline reflows into a full article page.

- **Start:** one line of small text in a dashed strip: "Design that moves people".
- **End:** an editorial page: a kicker ("FIELD NOTES"), the headline over two big lines, four body lines, an image and a pull quote card.
- **Timing:** from the start the headline splits into two halves that travel separately to their places and grow as they go. The second half drops down first and then slides left, so the halves never share a line. From about 0.8 dashed guides show where each half went and the source strip shows a ghost of the old line. The kicker fades in at about 1.0, the image wipes open left to right from about 1.05, the body lines draw on from about 1.1, and the quote card rises in last from about 1.2. The return collapses it back into one line.
- **What makes it premium:** the headline is the same text moving, never retyped. Everything else arrives in reading order.
- **Use it when:** you turn a blog headline into a carousel cover or article teaser.

### 12 Image reveal

**What it is:** dark shutter slats pull back to reveal an image.

- **Start:** the frame covered by seven dark vertical slats.
- **End:** the image in full, with a small label pill ("New drop") top left.
- **Timing:** each slat narrows to nothing towards its own centre line, left to right, each starting a beat after the last. The last slat is gone at about 1.7. The label fades in from about 1.05. The return closes the slats again.
- **What makes it premium:** each slat has a faint light edge that shows it is a physical object, and the slats go in sequence rather than together.
- **Use it when:** you tease a product drop (and swap in your own photo afterwards).

---

## Systems: explain how things connect

### 13 Perspective shift

**What it is:** the flat layers of a page pull apart in depth.

- **Start:** three layers stacked almost flat, like one page: a chart layer at the back, a list layer in the middle, a page layout on top.
- **End:** the three layers spread apart and angled towards one vanishing point on the right, each still showing its own content.
- **Timing:** the layers separate back to front, each a beat behind the last. From about 0.9 dashed perspective guides fade in towards the vanishing point and a small dot marks it. Through the hold the vanishing point drifts gently up and down, so the whole stack breathes. The return flattens it again.
- **What makes it premium:** every layer shares one vanishing point, so the depth is correct. Each layer keeps real content, which is what makes it read as "the layers of this thing" rather than three grey cards.
- **Use it when:** you explain the layers of your service, brand system or tech stack.

### 14 Glass focus

**What it is:** a lens slides down a blurred report and sharpens the row under it.

- **Start:** a report card ("Campaign report") with five rows of label and value, all softly blurred, and the lens on the first row.
- **End:** the lens resting on one row, that row sharp and slightly magnified.
- **Timing:** over the move the lens steps to the second row. Through the hold it travels down to the last row and back up to the second, following an eased curve. On the return it goes back to the first row.
- **What makes it premium:** only the text inside the lens is sharp, at 1.1 times the size. Two faint tinted copies of that text sit a fraction of a pixel either side, like real glass. The lens has a highlight across its top and a double rim.
- **Use it when:** you make people read the one line of a report or pricing table you care about.

### 15 Flowing paths

**What it is:** pulses of light travel from one source, through three channels, into one result.

- **Start:** five labelled pills on a dark ground: "Brief" on the left, "Email", "Reel" and "Post" in the middle, "Report" on the right, joined by faint curved lines.
- **End:** every line lit, every node glowing.
- **Timing:** from 0.25 three pulses leave "Brief", 0.14 apart, and light the three connectors as they travel. Each takes about a second. When a pulse arrives, that node answers with an expanding ring and a brighter dot. From about 1.75 a second set of pulses runs from the three channels into "Report", and those lines shade from the cool colour to the accent colour. At about 3.6 a second wave repeats the journey along the lit paths. On the return the lights fade out.
- **What makes it premium:** the nodes respond on arrival, so cause and effect are visible. The line is drawn by the pulse, it does not switch on. The second wave keeps the hold alive.
- **Use it when:** you show one piece of content feeding several channels, or a simple funnel.

### 16 Particle logo

**What it is:** scattered dots fly in and form a logo.

- **Start:** a scatter of small dots on the left and a faint dashed outline of the mark on the right.
- **End:** the dots packed into the mark, a ring with a diamond inside, the diamond in the accent colour. A label ("Mark 01") top left and "assembled" bottom right.
- **Timing:** each dot starts its flight at a slightly different moment, leftmost dots first with a little randomness, spread over the first 1.1 seconds. Each flies on a gentle arc with a short trail behind it. The last dots land at the end of the move, and at about 2.0 the label changes from "assembling" to "assembled". The return scatters them back to their exact starting points.
- **What makes it premium:** the dots sit on a grid inside the mark's real shape, so the finished logo is crisp. The scatter is seeded, so every loop is identical. The trails show direction without blur.
- **Use it when:** you close a video, reel or launch post with your mark.
