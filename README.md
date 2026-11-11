# Obsidian Setup

My [Obsidian] vault minus the notes. It has the folder layout, templates,
themes, CSS snippets, plugins and plugin settings. Clone it and open the folder
as a vault.

- Every new note goes into one **flat `Notes/` folder**. I find things
  through links and MOCs, so I almost never touch the folder tree.
- Only **six community plugins**, and most of them are cosmetic. Core
  plugins handle daily notes, templates and bases.
- **Minimal theme** with the ribbon, tabs and status bar hidden. I added
  a snippet because Minimal's headings are too flat for me.
- **Vim mode** is on. Turn it off in Settings → Editor if that's not you.

## Conceptual Note-Taking

I write notes about concepts, not about lectures or chapters. If a lecture
covers gradient descent, the notes go in `Gradient Descent.md`, not
`Week 3.md`. When gradient descent comes up again in a different course or
a paper, I open that same note and add to it.

Each note links to the other concepts it depends on. The first version is
usually rough. It gets better every time I come back to it.

I picked this up from Chris Pomeroy's video
[How to achieve more while studying less - Obsidian & Conceptual Notes][video],
which I found on [Steven Gong's site][gong]. Watch it before you copy any of this.

[Obsidian]: https://obsidian.md
[video]: https://www.youtube.com/watch?v=MYJsGksojms
[gong]: https://stevengong.co/notes/Conceptual-Notetaking

## Structure

```
Notes/         concept notes, all in one place
MOC/           maps of content, plus Bookshelf.base
Library/       books, articles, web clippings
Courses/       one hub note per course that links into Notes/
Projects/
Meta/
  Templates/   Note, MOC, Book, Source, Library Item
  Web Clipper/ browser clipper templates
  Sessions/    daily notes, YYYY-MM-DD
  Attachments/ images and PDFs
```

The templates only set frontmatter (`type`, `tags`, and sometimes `status`,
`source` or `author`). `Bookshelf.base` shows every `type: book` note as a
grid of covers.

## Web Clipper

`Meta/Web Clipper/` has templates for the [Obsidian Web Clipper] browser
extension. Import them from the extension's settings. All three save into `Library/`.

- `podcast.json` works on Apple Podcasts, Spotify, Overcast and Pocket Casts.
  It uses the clipper's AI interpreter to fill in a summary and the episode
  details, and leaves Notes and Quotes empty for you to write.
- `youtube-clipper.json` saves the embedded video, channel and upload date.
- `wikipedia-clipper.json` saves the article body without navboxes.

[Obsidian Web Clipper]: https://obsidian.md/clipper

## Plugins

| Plugin | What it's for |
| --- | --- |
| [Style Settings] | Tweak theme and snippet variables from settings |
| [Minimal Theme Settings] | Line width, color scheme |
| [Hider] | Hides tabs, status bar and vault name |
| [Thumbnails] | YouTube thumbnails inside notes |
| [Calendar] | Sidebar calendar that opens daily notes |
| [Code Styler] | Nicer code blocks |

[Style Settings]: https://github.com/mgmeyers/obsidian-style-settings
[Minimal Theme Settings]: https://github.com/kepano/obsidian-minimal-settings
[Hider]: https://github.com/kepano/obsidian-hider
[Thumbnails]: https://github.com/meikul/obsidian-thumbnails
[Calendar]: https://github.com/liamcain/obsidian-calendar-plugin
[Code Styler]: https://github.com/mayurankv/Obsidian-Code-Styler

## Snippets

- `bigger-headings.css` restores a normal H1–H6 scale. You can adjust it
  in Style Settings.
- `hide-system-folders.css` hides `Meta/Templates`, `Meta/Attachments` and
  `CLAUDE.md` in the file explorer.
- `graph-tag-color.css` makes tag nodes grey in the graph view.
- `TasksMonoEmojis-lucide.css` replaces the Tasks plugin emoji with
  [Lucide] icons. It's disabled.

[Lucide]: https://lucide.dev

## Themes

[Minimal] is the active theme. Baseline, Things, Ash Spruce and Ember Spruce
are also installed in case I want to switch.

[Minimal]: https://github.com/kepano/obsidian-minimal

## Hotkeys

| Keys | Action |
| --- | --- |
| `Ctrl+\` | Split right |
| `Ctrl+Alt+\` | Split down |
| `Alt+H/J/K/L` | Move focus left, down, up, right (Vim directions) |
| `Ctrl+W` | Close the pane (Obsidian default) |
| `Alt+1` / `Alt+2` | Toggle left / right sidebar |
| `Ctrl+T` | Insert template |
| `Ctrl+Alt+N` | New folder |

On macOS, `Ctrl` is `Cmd`.

## What's Not Here

My notes and attachments aren't included, and neither is `workspace.json`,
which tracks open tabs and recent files. `webviewer.json` is also excluded
because it contains a search engine URL with a personal token.
