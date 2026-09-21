# DESIGN.md — NAHS Attendance

The design direction for this app. `antislop.md` is the filter; this file is the soul.

## Design Read
Reading this as: a weekly-use utility for a high-school National Art Honor Society chapter, in a
**gallery-catalog / studio-register** style. Dials: **ENERGY 2 / RHYTHM 2 / MOTION 1**.

## Concept
An art society keeps records: who showed up, what they made, hours logged. The app is built to look
like that record, a cross between an **exhibition catalog** and an attendance **ledger** kept on the
studio wall. Meetings are catalog entries. Members are a registry. Checking in leaves *your mark*.

The single question the design answers: "did I show up, what have I made, and where do I stand?"

## Identity motif
- **The mark / stamp.** Checking in is the one loud moment: a wax-stamp red confirmation, like
  stamping a register. Reserved for that focal action and a few live indicators.
- **Catalog numbering.** Meetings are numbered like exhibition entries (`No. 014`) using the mono
  face. Order carries real meaning (chronological record), so numbering is earned, not decoration.
- **Pigment set.** The NAHS rainbow is reinterpreted as an artist's pigment palette and used *only*
  to encode categories (grades, activity types, chart series), never as a decorative gradient.

## Palette
Core is warm paper and ink; one signature accent; a data-only pigment set. (R-29: 2 core + 1 accent.)
- Paper (background): `#F4F2EB`
- Panel (surface): `#FBFAF6`
- Ink (text/primary): `#1C1815`
- Muted ink: `#6C665C`
- Hairline (borders): `#DAD5C9`
- **Stamp (signature accent): `#D8382A`** — a cadmium/wax red, used sparingly for the focal action
  and live status only.

Pigment set (data encoding only): alizarin `#A83240`, cadmium orange `#C56A1E`, ochre `#B98A1E`,
viridian `#3F7A5E`, cerulean `#2C7C90`, ultramarine `#33509E`, dioxazine violet `#6B4E8E`.
Grades map cool→senior: 9 viridian, 10 cerulean, 11 ultramarine, 12 violet.

## Typography
- **Display: Bricolage Grotesque** — contemporary, slightly irregular, art-school character. Used
  large for page titles and key figures.
- **Body/UI: Hanken Grotesk** — humanist, highly legible for dense tables and forms.
- **Utility/mono: IBM Plex Mono** — small caps-ish labels, catalog numbers, dates, and the check-in
  code. This is the "registry" voice and a repeated identity element. Never large terminal headings.

Type scale is deliberate: oversized Bricolage figures for the one number that matters per screen,
mono eyebrows above section titles, quiet body.

## Structure & surfaces
- Surfaces are flat **placards**: 1px hairline, small radius (4px), tonal separation, no drop
  shadows and no floating cards. Elevation only where it means something (open dialogs).
- Radius is small and consistent; nothing is pill-shaped except true status is shown as squared tags.
- Whitespace and hairline rules do the separating, in an editorial left-aligned hierarchy.

## Motion (dial 1)
Hover/focus transitions and one purposeful confirmation: the check-in stamp settling into place.
Respect `prefers-reduced-motion`. No scattered fade-up/float/scale.

## Copy voice
Plain, specific, sentence case. Buttons say what happens ("Check in", "Open check-in", "Approve
member"). No buzzwords, no em dashes, no invented statistics; every number on screen is real data
from the database or it is not shown.

## Reasons (R-31, one line each)
- Paper+ink over the old violet: an art chapter's record should feel like a catalog, not a SaaS app.
- Stamp red as the only accent: gives the check-in a single memorable focal moment.
- Pigments for data only: honors the NAHS rainbow while removing it as decoration.
- Bricolage + Hanken + Plex Mono: art-school character, table legibility, and a registry voice.
- Small radius, no shadows: reads as printed catalog/ledger, the opposite of floaty AI cards.
