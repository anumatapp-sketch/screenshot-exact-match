# UX Audit Based on Airbnb's Host Dashboard (Reusable Playbook)

> **Purpose:** a reusable UX benchmark and implementation playbook taken from Airbnb's **host dashboard** (desktop and compact/mobile). You can apply it to any dashboard-style product. Anumat ERP web is the first target, and §9 maps the patterns to it.
>
> **Rule:** treat Airbnb as a _usability benchmark only_. Do not copy its branding, logo, illustrations, copy, exact layouts or trade dress. Adapt the principles to your own brand and tokens.

| Field                     | Value                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Reference                 | airbnb.com host area (`/hosting`, `/hosting/listings`, listing editor, `/hosting/messages`, `/account-settings`)                         |
| Observation dates         | 2026-10-18 / 19                                                                                                                          |
| Browser                   | Chrome (desktop)                                                                                                                         |
| Viewports actually tested | **1428×881** (desktop) and **632×881** (compact, the narrowest the browser allowed)                                                      |
| Account state             | Host account with **0 published listings, 0 reservations, 0 messages**                                                                   |
| Method                    | Read-only. Real interactions (click, type, keyboard, Escape) plus a DOM/ARIA inspection. No data was saved and no preference was changed |
| Confidence labels         | **Observed** = tested directly · **Partially observed** = some aspects could not be confirmed · **Not verified** = not tested            |

---

## Contents

1. [Executive summary](#1-executive-summary)
2. [Reference page and flow inventory](#2-reference-page-and-flow-inventory)
3. [Interaction specifications](#3-interaction-specifications)
4. [Design-system principles](#4-design-system-principles)
5. [Gap analysis template (per project)](#5-gap-analysis-template-per-project)
6. [Implementation plan (generic phases)](#6-implementation-plan-generic-phases)
7. [Test plan](#7-test-plan)
8. [Decision log](#8-decision-log)
9. [Applying to Anumat ERP web](#9-applying-to-anumat-erp-web)
10. [Limitations and not-verified items](#10-limitations-and-not-verified-items)

---

## 1. Executive summary

### Main UX principles observed

1. **Attention first.** The home screen shows what is blocking the user ("Verify your identity – Required to publish") before anything else.
2. **Every list adapts to the device.** Desktop shows a semantic data table. Compact screens show a list grouped by status, with no horizontal scrolling.
3. **Status is never colour alone.** A coloured dot always comes with a word (Action required / In progress / Completed).
4. **Records are edited in master–detail form.** Section cards show the current value and the tasks still open, and the selected section's editor sits beside them. On compact screens the editor becomes a full-height sheet.
5. **One primary action per screen.** It is a solid dark button. Everything else is a secondary button, an icon button or a text link.
6. **Every non-ideal state is designed.** Loading uses skeletons that match the final layout. Empty states say _why_ there is nothing and _what to do next_. Errors appear inline, with an icon and text.
7. **Calm, consistent surfaces.** The look relies on a white canvas, 12px radii, light borders or soft shadows, and a strong border for the selected item.
8. **Keyboard-friendly basics.** There is a skip link, a labelled nav landmark, `aria-current`, real tabs, tables and radio groups, and a high-visibility double-ring focus indicator.

### Strongest patterns worth adapting

| Pattern                                           | Why it is valuable for dashboards                                  |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| Table → grouped list on mobile                    | Fixes the most common responsive failure in ERP/admin UIs          |
| Attention bar / required-actions sheet            | Turns blockers (approvals, missing data) into a to-do list         |
| Master–detail editor with section status          | Breaks large records into manageable, deep-linkable sections       |
| Inline row edit in settings                       | Low-risk edits without a separate page                             |
| Dirty-aware sticky Save                           | Prevents no-op saves and makes it obvious that a change is pending |
| Bottom tab bar (≤5) on compact screens            | Primary destinations stay reachable with a thumb                   |
| Expanding inline search with clear                | Saves toolbar space and keeps search one click away                |
| Column customisation with locked identity columns | Power users can tailor the table without breaking it               |

### Gaps in the reference itself (do better than Airbnb)

- Unsaved edits were **discarded silently** when the user switched sections.
- Sortable headers had **no `aria-sort`**.
- The wizard progress bar had **no `progressbar` role or text equivalent**.
- After the drawer closed, **focus went to `<body>`**, not back to the trigger (observed through automation).
- The alert band loaded late and **shifted the layout** (CLS).
- On compact screens, **floating layers stacked up** (attention bar, floating pill, tab bar) and covered content.
- Desktop Messages left an **empty detail pane with no placeholder**.
- Clearing search **also reset the sort**.

### Recommended priorities (generic)

1. **P0:** keyboard and focus management in dialogs and drawers, responsive tables with no horizontal page overflow, and an unsaved-changes guard.
2. **P1:** status badges (dot + text), skeleton/empty/error states, a mobile navigation pattern, and a dirty-aware form footer.
3. **P2:** master–detail editing, inline settings rows, column customisation, and an attention/approvals surface.
4. **P3:** grid/list toggle, visual polish, and motion with a reduced-motion fallback.

---

## 2. Reference page and flow inventory

| #   | Page / flow                                                                   | User goal                         | Entry → path                                             | Main components                                                                                                                                                                                             | Primary / secondary actions                                               | Compact behaviour (632 px)                                                                                                                                                         | States seen                                                                                                                                                                                                          | Keyboard / a11y                                                                                                                                                                                                          | Confidence                                  |
| --- | ----------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| R1  | **Today** (home)                                                              | See what needs attention now      | Logo or the "Today" nav item                             | Top nav (4 destinations), a row of alert cards, segmented control "Today / Upcoming", illustrated empty state                                                                                               | Primary: alert cards. Secondary: "Complete your listing"                  | Top nav → **fixed bottom tab bar** (5 items, icon + label). The 3 alert cards → **one docked "Actions need your attention" bar** that opens a full-height "Required actions" sheet | Empty: the title gives the cause and the body gives the fix, plus a CTA                                                                                                                                              | Skip link. `nav "Primary"`. `aria-current="page"`. The segmented control is a real `tablist` with `aria-selected`. Alert buttons have full names (record + task + consequence)                                           | Observed                                    |
| R2  | **Main menu drawer**                                                          | Reach secondary destinations      | ☰ button (`aria-label`, `aria-expanded`)                | Right drawer: notifications, close, promo card, icon + label list                                                                                                                                           | Settings, language, resources, help, create                               | Becomes a **full page under the "Menu" tab**, with a floating pill for switching mode                                                                                              | —                                                                                                                                                                                                                    | Focus moves into the drawer and the body scroll locks. Escape closes it. Focus returned to `<body>`, not the trigger                                                                                                     | Observed (focus return: Partially observed) |
| R3  | **Records table** (Listings)                                                  | Scan and manage all records       | Nav item                                                 | Title, icon toolbar (search, view toggle, add), table with thumbnail + title column, dot + text status, ⚙ customise columns                                                                                 | Primary: open a row. Secondary: search, toggle view, add, sort, customise | **Table → list grouped by status**, with thumbnail, title and a one-line subtitle. No horizontal scroll                                                                            | Loading: **skeleton rows with the table's geometry**. No results: illustration + "No matches found" + recovery text + inline create link. The view toggle is disabled while there are no results                     | Real `<table>` and `<th>`. Rows have `tabindex=0`. Sort headers are buttons with a caret, but **no `aria-sort`**. The table scrolls horizontally inside its own container, with an edge fade. **No row hover highlight** | Observed                                    |
| R4  | **Inline search**                                                             | Find a record quickly             | 🔍 icon                                                  | Icon **expands into a full-width input**, autofocused, with a labelled clear (×)                                                                                                                            | Clear                                                                     | Same                                                                                                                                                                               | Filters as you type (skeleton while fetching). Clear keeps the input open and focused, **and resets the sort**                                                                                                       | The input has an accessible name. No live region for the result count was found (inspection partly blocked)                                                                                                              | Partially observed                          |
| R5  | **Customise columns**                                                         | Fit the table to the task         | ⚙ in the header row                                      | Popover with a labelled checkbox per _optional_ column. Identity and status columns are locked                                                                                                              | Toggle                                                                    | —                                                                                                                                                                                  | —                                                                                                                                                                                                                    | `aria-expanded`. Focus moves to the first checkbox. Escape closes it. (Nothing was toggled)                                                                                                                              | Partially observed                          |
| R6  | **Grid view**                                                                 | Visual scanning                   | View toggle                                              | Image cards with an overlaid status chip, title and subtitle                                                                                                                                                | Open                                                                      | —                                                                                                                                                                                  | Placeholder when there is no image                                                                                                                                                                                   | The toggle's label changes with the state                                                                                                                                                                                | Observed                                    |
| R7  | **Record editor** (master–detail)                                             | Complete or edit one record       | Click a row                                              | **Left:** section cards (current value + "You have 2 tasks"), a "Complete steps to publish" checklist card, a segmented control. **Right:** the selected section's editor. A floating "View" (preview) pill | Edit section, Save                                                        | **Master only.** A section opens as a **full-height sheet** with ✕, a title, and a sticky footer holding **Cancel / Save**. The tab bar is hidden                                  | Skeletons in the detail pane. **Save is disabled until the form is dirty.** Required error **on blur** with icon and text, and Save disables again. **Unsaved edits were discarded silently when switching section** | Each section is a **link with its own URL**. The selected card has a 2px dark border. Labels float inside the fields. Character counter ("6/50")                                                                         | Observed                                    |
| R8  | **Steps checklist sheet**                                                     | Understand what blocks completion | Checklist card                                           | Side sheet: each step with a status (Action required / Not started / Completed) and an inline "Get started"                                                                                                 | Get started                                                               | —                                                                                                                                                                                  | —                                                                                                                                                                                                                    | Escape closes it                                                                                                                                                                                                         | Observed                                    |
| R9  | **Creation wizard**                                                           | Create a record step by step      | (A nav item redirected here while nothing was published) | Focus mode: no app nav. "Questions?" and "Save & exit". One question per screen. Large selectable cards in a radiogroup. A segmented progress bar. A fixed footer with Back / **Next**                      | Next (primary), Back (text), Save & exit                                  | Not checked                                                                                                                                                                        | —                                                                                                                                                                                                                    | Real `role=radio`. **No `progressbar` semantics.** The redirect **gave no explanation**                                                                                                                                  | Observed (Next not clicked)                 |
| R10 | **Messages**                                                                  | Communicate                       | Nav item                                                 | Desktop: list pane (search, settings) plus a detail pane                                                                                                                                                    | —                                                                         | **Single pane.** No empty detail pane                                                                                                                                              | Empty: illustration + "Your inbox is empty" + guidance, and a "Past conversations" link. **Desktop detail pane is blank**                                                                                            | —                                                                                                                                                                                                                        | Observed (empty only)                       |
| R11 | **Account settings**                                                          | Manage profile and security       | Menu → Settings                                          | Desktop: left section nav (icon + label, selected = filled pill, "New" badge) and **label / value / action rows** (Edit / Add / Start). Masked sensitive values. Tabs within a section                      | Edit / Add per row                                                        | Section nav → **drill-in list with chevrons**. Each section is its own page with a back button                                                                                     | **Inline row edit:** the row expands with helper text, the field and Save. **Other rows dim and their actions disable.** The trigger becomes "Cancel"                                                                | —                                                                                                                                                                                                                        | Observed (cancelled, nothing saved)         |
| R12 | Calendar grid, insights/earnings, populated reservations, notifications panel | —                                 | —                                                        | —                                                                                                                                                                                                           | —                                                                         | —                                                                                                                                                                                  | —                                                                                                                                                                                                                    | —                                                                                                                                                                                                                        | **Not verified** (no data on the account)   |

---

## 3. Interaction specifications

Each specification is implementation-neutral. "Improve" marks where you should go beyond the reference.

### 3.1 Responsive primary navigation

| Aspect     | Spec                                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trigger    | Viewport crosses the compact breakpoint                                                                                                                                                                                                                                  |
| Desktop    | Horizontal nav with 3–6 primary destinations. Active item: underline + `aria-current="page"`. Secondary items go in a menu drawer                                                                                                                                        |
| Compact    | A **fixed bottom tab bar** with at most 5 items, each icon + text label. The 5th item is "Menu", which holds secondary destinations as a full page. Bottom padding uses `env(safe-area-inset-bottom)`                                                                    |
| Keyboard   | The tab bar is a `<nav aria-label>` of links, in DOM order                                                                                                                                                                                                               |
| Edge cases | Hide the bar inside full-screen editing sheets and wizards. **Improve:** allow at most one floating layer above the bar, and reserve bottom padding so the last list item is never covered. Long labels truncate with an ellipsis and keep the full name in `aria-label` |

### 3.2 Attention / required-actions surface

| Aspect        | Spec                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger       | One or more items are blocked or need the user's action (in an ERP: pending approvals, rejected requests, missing data)                                        |
| Desktop       | A horizontal row of cards, one per item. Each card names the **record, the task and the consequence** ("PO-1042 · Approve · Blocks payment")                   |
| Compact       | Cards collapse into **one docked bar** ("3 actions need your attention"). Tapping it opens a full-height sheet listing every item with one primary action each |
| Dismissal     | Chevron, ✕ or Escape. Focus returns to the bar                                                                                                                 |
| Accessibility | The card's accessible name includes all three parts. The count update is announced politely                                                                    |
| Improve       | Reserve the band's height while it loads, to avoid layout shift                                                                                                |

### 3.3 Data table → compact list

| Aspect             | Spec                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop            | A semantic `<table>`. The first column is identity (avatar/thumbnail + title + optional subtitle). Status is a **dot + text badge**. Sortable headers are `<button>`s inside `<th aria-sort>`. Optional columns are hidden behind "Customise columns", and identity and status are locked. A wide table scrolls **inside its container**, with an edge fade and a sticky first column |
| Row interaction    | The whole row opens the record, but a **real link in the title cell** is the keyboard and screen-reader target. **Improve:** add a row hover and focus-within highlight                                                                                                                                                                                                               |
| Compact            | Rows become list items: thumbnail, title, and one meta line (2–3 key fields). **Group by status** with a section header and a count. Actions go behind a kebab menu or the detail screen                                                                                                                                                                                              |
| Loading            | Skeleton rows with the same geometry. Keep the header visible                                                                                                                                                                                                                                                                                                                         |
| Empty (no data)    | Illustration or icon, a title stating the cause, one sentence on what to do, and a primary CTA                                                                                                                                                                                                                                                                                        |
| Empty (no results) | "No matches for '…'", a suggestion to change the filters, a **Clear filters** action and, where allowed, a create link                                                                                                                                                                                                                                                                |
| Error              | Inline in the table area: what failed, plus Retry. The page chrome stays usable                                                                                                                                                                                                                                                                                                       |

### 3.4 Inline expanding search

| Aspect       | Spec                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger      | A search icon button (`aria-label="Search …"`)                                                                                               |
| State change | Expands into an input with focus. The placeholder lists the searchable fields. A clear button labelled "Clear search"                        |
| Feedback     | Results update with a debounce (≈300 ms), with skeletons while fetching. **Improve:** announce "N results" in an `aria-live="polite"` region |
| Dismissal    | Clear empties the input and keeps focus. Escape clears it, and a second Escape collapses it when it is empty                                 |
| Improve      | Don't reset unrelated sort or filters on clear. Reflect the query in the URL so the state is shareable                                       |

### 3.5 Column customisation

A popover attached to a ⚙ button in the header row. It contains a labelled checkbox per optional column. Focus moves to the first control, and Escape or an outside click closes it and returns focus. The selection is saved per user. Required columns are not listed, or are listed as disabled with a reason.

### 3.6 Master–detail record editor

| Aspect  | Spec                                                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout  | Desktop: left column of **section cards** (current value summary + outstanding-task indicator); right column is the selected section's editor. The selected card gets a strong border. A "completeness" checklist card sits at the top |
| URL     | Each section has its own route (`/records/:id/:section`) so it is deep-linkable and works with Back                                                                                                                                    |
| Form    | Labels stay visible (floating or above the field). Helper text and a counter where the field has a limit. Validation **on blur** and on submit, with icon + text linked by `aria-describedby` and `aria-invalid`                       |
| Footer  | Sticky. **Save disabled until dirty.** It shows a pending state while saving, then a success toast. Errors are shown inline plus a summary                                                                                             |
| Compact | The list of sections is a page. A section opens as a **full-height sheet** with ✕, a title, and a sticky Cancel / Save. The tab bar is hidden                                                                                          |
| Improve | **Unsaved-changes guard:** leaving a dirty section (another section, Back, a nav click, closing the tab) asks "Discard changes?" with Keep editing / Discard                                                                           |

### 3.7 Inline row edit (settings and profile pages)

The row shows a label, a value (or "Not provided") and an action (Edit / Add / Start). Clicking it expands the row with helper text, the field(s) and Save. **Only one row can be edited at a time:** the other rows dim and their actions disable, and the row's action turns into "Cancel". Saving collapses the row and shows the new value plus a toast. Sensitive values are masked.

### 3.8 Drawer, sheet and dialog

On open: focus moves to the first meaningful control (or the title), Tab is trapped inside, the background is inert and the body scroll locks. It closes on ✕, Escape and a scrim click (non-destructive content only). **On close, focus returns to the trigger** (improve on the reference). Destructive dialogs require an explicit button. The scrim does not close them.

### 3.9 Wizard / focus mode

Use it for multi-step creation. The app nav is hidden and "Save & exit" plus Help are always visible. Show one decision per screen, with large selectable cards inside a `radiogroup`. A fixed footer holds Back (text) and Next (primary), and Next stays disabled until the step is valid. **Improve:** show progress as text ("Step 2 of 5") or with `role="progressbar"` and `aria-valuenow` / `aria-valuemax`. Never redirect a nav item into a wizard without an explanation.

### 3.10 Status badges and checklists

A dot + text badge using semantic tones: danger "Action required", warning "In progress / Pending", success "Completed / Approved", neutral "Draft". A checklist item shows its title, its status line and one inline action. Completed items show a check icon and their text, never colour alone.

---

## 4. Design-system principles

Values marked **(est.)** are computed-style readings at 1428 px on the reference. Treat them as _orientation only_, and map them to your own tokens.

| Area         | Principle                                                                                                            | Reference observation                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Hierarchy    | Use size and weight, not colour, to create hierarchy. One H1 per page                                                | Wizard H1 32/36px, weight 600 (est.). Body 14px (est.)           |
| Spacing      | Generous vertical rhythm, a content max-width, and consistent card padding                                           | Table rows ≈88px with thumbnails (est.)                          |
| Surfaces     | Neutral canvas. Cards use a border _or_ a soft shadow, not both. A strong 2px border marks the selected item         | Card radius 12px (est.). Border 1px light grey (est.)            |
| Buttons      | Only one solid primary per view. Secondary is tonal. Icon buttons are round and labelled. Row actions are text links | Primary 48px tall, 12px radius (est.). Icon buttons 40×40 (est.) |
| Status       | A dot + label with semantic tones, never colour only                                                                 | Red / orange / green dots with text                              |
| Forms        | Labels always visible, helper text, counters, inline errors with an icon, dirty-aware Save                           | Floating labels, "6/50", error on blur                           |
| Feedback     | Skeletons for content, toasts for completed actions, inline errors for failures                                      | Skeleton rows and skeleton cards                                 |
| Empty states | Cause + next step + one CTA. Use an illustration or icon in your own brand style                                     | Every empty state followed this pattern                          |
| Navigation   | Desktop top or side nav. Compact bottom tab bar (≤5). Secondary items under Menu                                     | Observed                                                         |
| Focus        | A highly visible ring that works on any background (e.g. a 2px surface-colour gap + 2px contrasting ring)            | White 2px + dark 2px box-shadow ring                             |
| Motion       | Short slide or fade for sheets and drawers. **Respect `prefers-reduced-motion`**                                     | Reduced-motion behaviour **not verified**                        |
| Touch        | Targets ≥44×44 on touch layouts (WCAG 2.2 minimum is 24×24)                                                          | Tab bar items ≈123×40 at 632 px (est.)                           |

---

## 5. Gap analysis template (per project)

Fill this in for each project after inspecting its code and running it. **Every row needs evidence** (file path + line, URL + viewport, or screenshot ID).

| ID   | Current issue                                  | Evidence                                                | User impact                                 | Proposed improvement (ref. §) | Priority | Effort | Acceptance criteria                                           |
| ---- | ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- | ----------------------------- | -------- | ------ | ------------------------------------------------------------- |
| G-01 | _e.g. data table overflows the page at 375 px_ | `apps/web/app/requests/page.tsx:42`, 375×812 screenshot | Users can't see status or actions on mobile | Compact grouped list (§3.3)   | P0       | M      | No horizontal page scroll at 320–430 px; all fields reachable |
| G-02 |                                                |                                                         |                                             |                               |          |        |                                                               |

**Priority scale**

- **P0:** blocks a critical task, causes a serious accessibility failure, or risks data loss.
- **P1:** a major usability problem in a common task.
- **P2:** a meaningful improvement in consistency or efficiency.
- **P3:** polish.

**Effort:** S (<½ day) · M (½–2 days) · L (>2 days).

### Quick self-check list (run on every project)

- [ ] No horizontal page overflow at 320, 375, 390, 430, 768, 1280, 1440 and 1600 px
- [ ] Tables have a compact alternative and sticky identity column, or no overflow at all
- [ ] Status is shown with text, not colour only
- [ ] Every list has loading, empty, no-results and error states
- [ ] Forms: visible labels, inline errors linked via `aria-describedby`, Save disabled until dirty, unsaved-changes guard
- [ ] Dialogs/drawers: focus in, Tab trapped, Escape closes, focus returns to the trigger
- [ ] Sortable headers expose `aria-sort`
- [ ] Mobile navigation reachable with a thumb; floating layers never cover content
- [ ] Visible focus indicator on every interactive element
- [ ] Contrast ≥4.5:1 for text, ≥3:1 for UI parts and the focus ring
- [ ] Layout works at 200% zoom and with long or translated labels
- [ ] `prefers-reduced-motion` respected
- [ ] Destructive actions confirm and name the item being affected

---

## 6. Implementation plan (generic phases)

Keep each phase as a small, reviewable PR. Build shared components first, then pages.

| Phase                      | Scope                                                                                                                                                  | Shared components / work            | Depends on | Risks                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| **0. Baseline**            | Inventory the stack, tokens and breakpoints. Run lint, typecheck, test and build. Screenshot the key pages at all widths                               | —                                   | —          | Missing env vars or a backend for local runs; use mocks or dev mode, never production data |
| **1. Foundations**         | Focus ring token, status tones, spacing and radius tokens, a reduced-motion utility                                                                    | Tokens / theme only                 | 0          | Visual regressions; review with screenshots                                                |
| **2. Feedback primitives** | `StatusBadge` (dot + text), `Skeleton` variants, `EmptyState` (cause / next step / CTA), `InlineError`, toast conventions                              | `packages/ui`-level components      | 1          | Duplicating existing components; extend those first                                        |
| **3. Overlays**            | Audit the Dialog, Sheet and Drawer focus behaviour; add the unsaved-changes guard hook (`useUnsavedChangesGuard`)                                      | Dialog / Sheet wrappers, guard hook | 1          | Router-specific navigation blocking                                                        |
| **4. Data views**          | `ResponsiveDataView`: semantic table on desktop, grouped list on compact; `aria-sort`; column customisation; expanding search with a live result count | Table + list components             | 2          | Server pagination and sorting must keep their API contracts                                |
| **5. Navigation**          | Compact bottom tab bar (≤5) + Menu page; desktop nav with `aria-current`; reserved bottom padding                                                      | App shell                           | 1          | Changes to the information architecture need product sign-off                              |
| **6. Record editing**      | Master–detail section editor, sticky dirty-aware footer, compact full-height sheet, deep-linked sections                                               | Form footer, section card           | 2, 3       | Must not change validation or business rules                                               |
| **7. Attention surface**   | Approvals / required-actions band (desktop) and docked bar + sheet (compact)                                                                           | Attention card, docked bar          | 2, 5       | Data source must already exist; don't fake counts                                          |
| **8. Verification**        | Re-run all checks; browser re-test at every width; update this document with results                                                                   | —                                   | all        | —                                                                                          |

---

## 7. Test plan

### 7.1 Viewport matrix

| ID  | Width          | Device class  | Pass criteria                                                              |
| --- | -------------- | ------------- | -------------------------------------------------------------------------- |
| V1  | 320 / 375 px   | Small mobile  | No horizontal scroll; tab bar visible; no clipped controls; targets ≥44 px |
| V2  | 390 / 430 px   | Large mobile  | Same as V1; sheets are full height with a sticky footer                    |
| V3  | 768 px         | Tablet        | Layout adapts (not merely shrunk); tables either fit or switch to a list   |
| V4  | 1280 / 1440 px | Laptop        | Desktop nav; master–detail visible side by side                            |
| V5  | ≥1600 px       | Large desktop | Content max-width respected; no over-stretched lines                       |

### 7.2 Functional and state tests (template)

| Test ID   | Goal                      | Preconditions             | Steps                                              | Expected                                                                       | Actual | Result                | Evidence | Issue |
| --------- | ------------------------- | ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ | ------ | --------------------- | -------- | ----- |
| T-LIST-01 | Find a record by search   | ≥1 record                 | Open the list → click search → type a partial name | Matching rows appear; "N results" announced                                    |        | Pass / Fail / Blocked |          |       |
| T-LIST-02 | No-results recovery       | —                         | Search "zzqx"                                      | No-results state with Clear action; Clear restores the list and keeps the sort |        |                       |          |       |
| T-LIST-03 | Load error                | API stubbed to return 500 | Open the list                                      | Inline error + Retry; nav still works                                          |        |                       |          |       |
| T-FORM-01 | Save disabled until dirty | Open an editor            | Observe Save → edit a field                        | Disabled → enabled                                                             |        |                       |          |       |
| T-FORM-02 | Required validation       | —                         | Clear a required field → Tab                       | Error with icon + text, `aria-invalid=true`, Save disabled                     |        |                       |          |       |
| T-FORM-03 | Unsaved-changes guard     | Dirty form                | Click another section / Back / nav                 | "Discard changes?" dialog; Keep editing keeps the values                       |        |                       |          |       |
| T-FORM-04 | Repeated submit           | —                         | Double-click Save                                  | Only one request is sent; button shows pending                                 |        |                       |          |       |
| T-FORM-05 | Boundary values           | —                         | Enter a 255-character name, emoji, Khmer text      | Truncated or wrapped correctly; counter accurate; no overflow                  |        |                       |          |       |
| T-NAV-01  | Mobile navigation         | 375 px                    | Use each tab                                       | Correct page; `aria-current` set; last list item not hidden behind the bar     |        |                       |          |       |

### 7.3 Keyboard and accessibility tests

| Test ID | Check           | Pass criteria                                                                                                                               |
| ------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A-01    | Skip link       | The first Tab reveals "Skip to content" and it moves focus to `<main>`                                                                      |
| A-02    | Focus visible   | Every interactive element shows a ring with ≥3:1 contrast                                                                                   |
| A-03    | Dialog / drawer | Focus moves in; Tab cycles inside; Escape closes; focus returns to the trigger                                                              |
| A-04    | Table semantics | `<th scope>`, `aria-sort` on the sorted column, the row link is reachable by Tab                                                            |
| A-05    | Form errors     | The error is announced, linked via `aria-describedby`, and focus moves to the first invalid field on submit                                 |
| A-06    | Status          | Status is readable without colour (grayscale screenshot check)                                                                              |
| A-07    | Zoom            | 200% zoom: no loss of content or function                                                                                                   |
| A-08    | Reduced motion  | With `prefers-reduced-motion: reduce`, sheets appear without sliding                                                                        |
| A-09    | Automated scan  | axe / Lighthouse with zero critical issues. **Record automated and manual results separately; this is not a formal WCAG conformance claim** |

### 7.4 Regression

Run the repository's lint, typecheck, unit, e2e and build commands before and after each phase. Record the exact commands and their outputs. Never skip or delete failing tests to get a green run.

---

## 8. Decision log

| #   | Pattern adapted                                                                                           | Why it fits dashboard / ERP users                                       | How it differs from the reference                                                   | Trade-offs / assumptions                                                 |
| --- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| D1  | Table → grouped list on compact screens                                                                   | Approvers and managers often act from their phones                      | Groups by workflow status (Pending / Approved / Rejected) instead of listing status | Some columns are hidden on mobile; they are available in the detail view |
| D2  | Attention band / docked bar                                                                               | "What needs my decision?" is the main job of an approvals-first ERP     | Shows approvals and SLA, not identity verification                                  | Requires a reliable count endpoint                                       |
| D3  | Master–detail editor                                                                                      | ERP records (requests, vendors, items) have many sections               | **Adds an unsaved-changes guard** that the reference lacks                          | More routes to maintain                                                  |
| D4  | Dirty-aware sticky Save                                                                                   | Prevents accidental no-op submissions and makes pending changes obvious | Same principle, our tokens                                                          | —                                                                        |
| D5  | Bottom tab bar (≤5)                                                                                       | Thumb reach on mobile                                                   | Destinations come from our information architecture, not Airbnb's                   | Choosing the top 4 destinations needs a product decision                 |
| D6  | Dot + text status badge                                                                                   | Accessible, scannable                                                   | Our semantic palette                                                                | —                                                                        |
| D7  | Accessibility improvements over the reference (`aria-sort`, progressbar, focus return, live result count) | WCAG 2.2 AA target                                                      | Goes beyond what the reference does                                                 | Small extra effort per component                                         |

---

## 9. Applying to Anumat ERP web

> **Status:** the repository has **not been inspected yet**. Everything below is a _mapping and recommendation_, not findings. Replace this section with evidence-based rows (§5) after the baseline (§6, Phase 0).

The project context comes from the product description, not from the code. Anumat is a decision and operations ERP ("Ask → Approve → Move forward"). The MVP is an approval flow. The code is a Turborepo with the `console`, `landing` and `web` apps, plus shared UI in `packages/ui` (shadcn/ui on Radix; dark theme via `data-theme="dark"`).

| Airbnb pattern                | Anumat equivalent (recommendation)                                                                                                                | Likely home                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Today + attention cards       | **Inbox / Today**: "Waiting for your approval", "Returned to you", "Overdue SLA" cards; a docked "N approvals need you" bar on mobile             | `apps/web` dashboard home            |
| Listings table → grouped list | **Requests list**: table on desktop (ID, title, requester, amount, current approver, status, updated); grouped by status on mobile                | `packages/ui` `ResponsiveDataView`   |
| Status dot + text             | `StatusBadge`: Draft · Submitted · In review · Approved · Rejected · Returned                                                                     | `packages/ui`                        |
| Master–detail editor          | **Request detail**: sections (Summary, Line items, Attachments, Approval chain, Activity) with task indicators; approve/reject in a sticky footer | `apps/web` request route             |
| Steps checklist sheet         | **Approval chain sheet**: each approver step with status and timestamp                                                                            | `packages/ui` Sheet (Radix Dialog)   |
| Wizard                        | **New request** flow: type → details → attachments → review, with text progress ("Step 2 of 4") and Save as draft                                 | `apps/web`                           |
| Inline row settings           | Org, profile and notification settings                                                                                                            | `apps/console` / `apps/web` settings |
| Bottom tab bar                | e.g. Inbox · Requests · New · Activity · Menu (needs product sign-off)                                                                            | App shell                            |
| Unsaved-changes guard         | Request edit and draft forms                                                                                                                      | Shared hook in `packages/forms`      |

**Anumat-specific cautions**

- Approve and Reject are consequential, so they need a confirm step that names the request and amount. Reject should require a reason.
- Do not change Keycloak roles, approval rules, API contracts or stored data as part of UX work. Report any such need first.
- Check both themes (`data-theme="dark"`) for contrast and focus-ring visibility.
- Test Khmer and English labels for wrapping and truncation if the product is localised.

---

## 10. Limitations and not-verified items

- **Compact widths 320–430 px and 768 px were not verified on the reference.** The browser could not go below 632 px with the side panel open. Compact observations are from 632 px.
- **Populated states were not verified:** calendar grid, reservations with data, message threads, insights/earnings and the notifications panel. The account had no data.
- Reduced-motion behaviour, zoom/text scaling and the colour-contrast ratios on the reference were **not measured**.
- Some DOM inspections (live regions on the search results) were blocked by the browser tooling. Those items are marked _Partially observed_.
- Focus-return results come from automated keyboard events and may differ from a physical keyboard.
- No forms were submitted and no preferences were changed, so save, success and toast behaviour on the reference is **not verified**.
