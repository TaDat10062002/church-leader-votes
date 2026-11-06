# Tasks

## 1. Provisional roster state

- [x] 1.1 Replace the single last-deleted entry with stable per-row identity and separate waiting/deleted collections; verify multiple deletions and restorations preserve the correct candidates and original order, including duplicate names.
- [x] 1.2 Reset both collections when a new workbook is imported and serialize only waiting candidate data for election start; verify deleted candidates are absent from the start request payload.

## 2. Deleted-candidate Sheet

- [x] 2.1 Add the Radix Dialog dependency and the shadcn/ui Sheet primitive under `src/components/ui`; verify installation succeeds and the Sheet supports right-side entry, focus handling, Escape, and close controls.
- [x] 2.2 Update the import page with a deleted-list trigger and count, empty state, and one restore button per deleted candidate while retaining a delete button on each waiting candidate; verify the Sheet opens from the right and restoring one candidate leaves other deleted rows available.
- [ ] 2.3 Add UI coverage for delete, opening and closing the Sheet, restoring a specific candidate, and starting with only the waiting roster; verify the end-to-end flow through the import page.
