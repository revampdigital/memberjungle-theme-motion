# Member Jungle theme motion

One small script shared by every Member Jungle website theme built by Revamp Digital.

It does nothing unless the active theme sets `--t-motion: 1` on `:root`, and nothing when the visitor has asked for reduced motion. When it runs it adds `t-motion` to the `html` element, marks each top level widget with `t-reveal`, and adds `is-in` as the widget scrolls into view. The theme CSS decides what those classes look like, so a theme without motion can leave the script installed.

It also adds previous and next buttons to a quicklink row that a theme has turned into a sideways scroller. A theme asks for them by setting `--t-scroll: 1` on the row. The buttons (`div.t-scroll-nav > button.t-scroll-btn`) are placed straight after the row, the row is marked `t-scroll-on`, and each button is disabled at its end of the strip (unless the row loops). The theme styles and places them. This part does not depend on `--t-motion`, and a row with no `--t-scroll` is left alone.

A scroller row can also turn by itself. A theme sets `--t-scroll-auto: <milliseconds>` on the row (2000 or more) and the row moves on by one card at that interval, going back to the first card after the last. `--t-scroll-loop: 1` on its own makes the buttons go round without turning by itself. Turning stops while the pointer is over the row or its buttons, while either has keyboard focus, while the row is off screen and while the tab is hidden, and restarts its wait after every click or swipe. It never runs for a visitor who has asked for reduced motion. Rows that set neither behave as before.

The scroller buttons also work on a photo strip (`.des-photostrip`) that a theme gives `--t-scroll: 1`; each photo counts as a card.

A slideshow's Opacity setting fades the whole slideshow, text and colour panels included. The script moves it onto the photos: the slideshow is set back to full strength, marked `t-slide-faded`, and given the value as `--t-slide-opacity` for the theme to put on its images. Without the script the platform's fade stays as it was.

## Install

Organisation settings > Content Management > Site Body Code:

```html
<script src="https://cdn.jsdelivr.net/gh/revampdigital/memberjungle-theme-motion@main/mj-theme-motion.js" defer></script>
```

For production, pin to a tag rather than `main` so the file does not change under a live site.
