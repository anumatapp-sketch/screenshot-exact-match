 # Anumat mock UX completion

 - [x] Resolve preview and test errors; preview builds successfully and all 42 tests pass.
 - [x] Verify all pages, approval/rejection, Settings save/read-back, retry, and unsaved-change protection with mock data.
 - [x] Check desktop, tablet and phone layouts; no page overflow at 390, 768, 1024 and 1280 pixels. Verify phone approval sheet opens and closes.
 - [x] Add mock Request types, Forms, and Workflows workspaces from the uploaded authoring guide.
 - [x] Add quick-start composition, live preview, step inspector, and mock route testing.
 - [x] Verify authoring flows, existing tests, and phone layouts; quick-start, save/publish/read-back, discard protection, retry, and no overflow at 320/390/768/1024/1280 pixels.
- [x] Restore missing authoring routes and connect desktop and Menu navigation.
## Approval decisions & request lifecycle (docs 02/03)
- [x] Request changes decision, optional approve comment, required reject/changes comment (min 3)
- [x] Activity history on request page
- [x] Demo New request flow with live approver preview
- [ ] Inbox quick/bulk approve, cancel/resubmit, drafts autosave (next)
  - Deferred: separate request lifecycle work, outside this workflow authoring update.

## Non-technical workflow authoring (mock adaptation)
- [ ] Plain-language approval summaries and field-linked correction notices.
- [ ] Test unsaved approval routes at amount boundaries and preview decision outcomes.
- [ ] Publish checklist, session-only test cases, and desktop/phone verification.
- Live simulation APIs, version switching, cross-device drafts, and native Khmer review require a separate live-product request or reviewer.
