# Conceptual Note-taking Obsidian Config

My [Obsidian] vault minus the notes. It has the folder layout, templates,
themes, CSS snippets, plugins and plugin settings.

## Conceptual Note-Taking

I write notes about concepts, not about lectures or chapters. If a lecture
covers gradient descent, the notes go in `Gradient Descent.md`. When gradient descent comes up again in a different course or
a paper, I open that same note and add to it.

Each note links to the other concepts it depends on. The first version is
usually rough and will be refined as I come back to it.

I picked this up from Chris Pomeroy's video
[How to achieve more while studying less - Obsidian & Conceptual Notes][video].

[Obsidian]: https://obsidian.md
[video]: https://www.youtube.com/watch?v=MYJsGksojms
[gong]: https://stevengong.co/notes/Conceptual-Notetaking

## Structure

Every new note goes into one **flat `Notes/` folder**. I find things
through links, MOCs, and `Shift+Ctrl+F`, so I almost never touch the folder tree.

```
Notes/         concept notes, all in one place
MOC/           maps of content, plus Bookshelf.base
Library/       books, articles, web clippings
Courses/       one hub note per course that links into Notes/
Projects/
Meta/
  Templates/   Note, MOC, Book, Source, Library Item
  Web Clipper/ browser clipper templates
  Attachments/ images and PDFs
```

The templates only set frontmatter (`type`, `tags`, and sometimes `status`,
`source` or `author`). `Bookshelf.base` shows every `type: book` note as a
grid of covers.

## Web Clipper

`Meta/Web Clipper/` has templates for the [Obsidian Web Clipper] browser
extension. Import them from the extension's settings. All three save into `Library/`.

- `podcast.json` saves Spotify podcasts from web, though I usually use [Spotify Podcast Clipper](#spotify-clipper)
- `youtube-clipper.json` saves the embedded video, channel and upload date.
- `wikipedia-clipper.json` saves the article body without navboxes.

[Obsidian Web Clipper]: https://obsidian.md/clipper

## Spotify Podcast Clipper (iOS) {spotify-clipper}

`Spotify Now Playing to Obsidian.js` is a [Scriptable] script for my phone.
It does what the Web Clipper does, but for whatever podcast I'm playing in
Spotify. One tap on a home screen widget saves the episode as a note with
the current timestamp under `## Notes`, so I can write the thought down
right next to it. Tapping again later in the same episode adds another
timestamp to the same note instead of making a duplicate.

It picks the episode in this order:

1. An episode link shared to it from Spotify's share sheet
2. Whatever is playing now on my Spotify account
3. An episode link on the clipboard

The note gets frontmatter (`title`, `show` as a `[[link]]`, `author`,
`source`, `published`, `created`, `duration`, `cover`,
`tags: [clippings, podcast]`), the cover image and a `## Notes` section.

[Scriptable]: https://scriptable.app

### Setup

1. **Add the script.** Install Scriptable from the App Store. Tap +, paste
   in the contents of `Spotify Now Playing to Obsidian.js`, and rename it
   to "Podcast to Obsidian".
2. **Create a Spotify app.** Go to the [Spotify Developer Dashboard] and log
   in with the account you listen on. Create an app with any name, add the
   Redirect URI `http://127.0.0.1:8888/callback` exactly, check **Web API**
   and save. Copy the Client ID and Client Secret from the app's settings.
3. **Fill in the config** at the top of the script:

   | Setting | Value |
   | --- | --- |
   | `CLIENT_ID`, `CLIENT_SECRET` | From the Spotify app |
   | `REDIRECT_URI` | Leave as is. It must match the dashboard exactly |
   | `VAULT_BOOKMARK` | Name of the Scriptable file bookmark (`Obsidian`) |
   | `VAULT_NAME` | Vault name exactly as Obsidian shows it (mine is `VAULT`) |
   | `FOLDER` | Folder in the vault for the notes (mine is `Notes`) |
   | `MARKET` | `US` |

   Keep your real Client ID and Secret only in Scriptable. Don't commit
   them to this repo.
4. **Bookmark the vault.** In Scriptable, go to Settings → File Bookmarks →
   + → Pick Folder and choose the vault's **root** folder (the one with
   `.obsidian` in it), not a subfolder. Name the bookmark `Obsidian`.
5. **Turn on the share sheet.** Open the script, tap the settings icon at
   the bottom of the editor, and under Share Sheet Inputs enable **URLs**
   and **Text**.
6. **Log in once.** Start a podcast in Spotify, then run the script inside
   the Scriptable app. Sign in to Spotify with email and password (Google
   or Apple sign-in may not work in that window), tap Agree, then tap
   **Close** at the green checkmark. The login is stored in the iOS Keychain
   and refreshes itself after that.
7. **Add the widget.** Long-press the home screen → Edit → Add Widget →
   Scriptable → small. Then long-press the widget → Edit Widget, set Script
   to "Podcast to Obsidian" and When Interacting to **Run Script**.

[Spotify Developer Dashboard]: https://developer.spotify.com/dashboard

### Use

- **While listening:** tap the widget. Scriptable opens briefly, saves the
  note and opens it in Obsidian.
- **An episode I'm not playing:** in Spotify, open the episode and tap
  Share → More → Run Script → "Podcast to Obsidian". This saves the note
  without opening Obsidian, since the share sheet can't switch apps.

### Troubleshooting

| Error or symptom | Cause |
| --- | --- |
| No file bookmark named "Obsidian" | Bookmark name doesn't match `VAULT_BOOKMARK` (case-sensitive) |
| INVALID_CLIENT: Invalid redirect URI | Dashboard Redirect URI doesn't match the script exactly |
| User not registered in the Developer Dashboard | Logged in with a different Spotify account. Add it under User Management |
| What's playing isn't a podcast episode | Music is playing |
| Note saves but Obsidian doesn't open it | `VAULT_NAME` doesn't match, or it was run from the share sheet (expected) |
| Note lands in the wrong folder | Bookmark points at a subfolder instead of the vault root |
| Token refresh failed | Access was revoked in Spotify. Run the script in Scriptable to log in again |

## Plugins

- **Vim mode** is on. I like keeping vim mode on in most applications so I can become more fluent.

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
