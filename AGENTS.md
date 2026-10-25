<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Authoring uses a shared workspace across the Templates, Forms, and Workflows leaf routes so edits share the same request-type model.
- Mock request types use an in-memory API and React Query cache; never persist demo changes or alter live approval data.
- Draft authoring checks are pure browser-safe functions shared by field-level guidance and the session-only route tester, so testing and publishing inspect the same unsaved model.
