# Art

Prints: finished CD spine images, one PNG each. The site serves them at
`/art/<name>.svg`, and a catalog badge (`/badge/<name>.svg`) shows its print
as soon as one exists here.

```text
art/
├── ai/         AI tools in the badge catalog      claude.png, cursor.png
├── stack/      tech stack in the badge catalog    typescript.png
├── models/     model families                     Qwen.png, Kimi.png
├── projects/   anything else: your app, your band, your side project
└── WANTED.md   catalog entries still waiting for a print (generated)
```

## Add a print

1. Draw **one spine per image** with the [cd-spine-art skill](../skills/cd-spine-art/SKILL.md).
   Give each subject its own art direction; do not batch several onto a sheet
   or stamp one pattern across many names.
2. For a real product, pass its genuine mark to the image model as a reference.
   If you cannot verify a mark, leave it out.
3. Crop tight to the plastic case, stand it upright (text reading top to
   bottom) and export at 1200 px tall with the skill's `assemble.py`.
4. Save it:
   - a catalog entry goes in `ai/` or `stack/` under the exact name listed in
     [WANTED.md](WANTED.md), such as `stack/react.png`;
   - anything else goes in `projects/`, named by its title with `_` for
     spaces, such as `projects/Nowledge_Mem.png` (served as `nowledge-mem`).
5. Run `pnpm art`. It checks every file, rebuilds the web copies and updates
   `WANTED.md`. Commit all of it and open a pull request.

## What a print must be

- PNG, upright, at least 720 px tall (1200 px preferred), no black border.
- One straight-on jewel case with both molded end tabs, no perspective.
- Title spelled exactly; no captions or text the subject does not own.
- Yours to contribute, and for a brand, faithful to its real mark.

To add a tool to the catalog itself, add an entry to
[`apps/web/catalog/presets.json`](../apps/web/catalog/presets.json), run
`pnpm presets`, and commit the generated registry too. It is typeset until
its print arrives. See the [catalog guide](../README.md#maintain-the-badge-catalog)
for fields and validation rules.
