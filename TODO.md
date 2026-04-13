# Firebase Storage & Auth Security Task

## Plan Steps:
- [x] Review auth code (AuthContext, login): ✅ Robust admin-only
- [x] Review current storage.rules: ✅ Perfect admin-only access
- [x] Prepare Storage init in firebase.ts
- [ ] (Future) Add upload hooks (employees photos, leave docs)
- [ ] Deploy: firebase deploy --only storage (if rules changed)
- [x] Test auth flow

## Status: Rules secured (admin-only). Storage ready. Auth solid.

Run `firebase deploy --only storage` to ensure rules active.

