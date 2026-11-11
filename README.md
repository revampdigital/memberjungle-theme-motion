# Member Jungle theme motion

One small script shared by every Member Jungle website theme built by Revamp Digital.

It does nothing unless the active theme sets `--t-motion: 1` on `:root`, and nothing when the visitor has asked for reduced motion. When it runs it adds `t-motion` to the `html` element, marks each top level widget with `t-reveal`, and adds `is-in` as the widget scrolls into view. The theme CSS decides what those classes look like, so a theme without motion can leave the script installed.

## Install

Organisation settings > Content Management > Site Body Code:

```html
<script src="https://cdn.jsdelivr.net/gh/revampdigital/memberjungle-theme-motion@main/mj-theme-motion.js" defer></script>
```

For production, pin to a tag rather than `main` so the file does not change under a live site.
