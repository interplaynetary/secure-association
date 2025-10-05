# 🔄 CLI Migration to Holster-Only

## Summary

The CLI has been updated to use **only** Holster (decentralized storage), removing SQLite completely.

---

## Key Changes

### 1. Storage Initialization

**Before (SQLite):**

```typescript
const storage = new SQLiteStorage("rdx.db");
```

**After (Holster):**

```typescript
let storage: HolsterStorage | null = null;

async function initStorage(did: string): Promise<HolsterStorage> {
  if (storage && userId === did) {
    return storage;
  }

  storage = new HolsterStorage({ indexedDB: false });
  await storage.initialize(did);
  userId = did;

  return storage;
}
```

### 2. All Commands Now Async

**Before:**

```typescript
.action((options) => {
  storage.addParticipant(...);
})
```

**After:**

```typescript
.action(async (options) => {
  const store = await initStorage(options.did);
  store.addParticipant(...);
})
```

### 3. Async Data Retrieval

**Before:**

```typescript
const participants = storage.listParticipants();
```

**After:**

```typescript
const participants = await storage.listParticipants();
```

---

## Benefits

### For Users

- ✅ **Decentralized by Default** - No central database
- ✅ **Real-Time Sync** - Changes sync across peers automatically
- ✅ **Offline-First** - Works without internet
- ✅ **P2P Ready** - Direct peer-to-peer communication

### For Developers

- ✅ **Simpler** - One storage backend instead of two
- ✅ **Consistent** - All operations use the same async pattern
- ✅ **Future-Proof** - Built for decentralized apps

---

## Updated Commands

All commands now require a `--did` parameter to initialize storage:

```bash
# Register (initializes storage)
rdx register --did did:example:alice --name Alice

# List participants (requires DID for storage access)
rdx list-participants --did did:example:alice

# Declare capacity
rdx declare-capacity --did did:example:alice --id cap-1 --type consulting --quantity 10 --unit hours

# Express desire
rdx express-desire --did did:example:bob --capacity-id cap-1 --quantity 5

# Compute allocation
rdx compute-allocation --did did:example:alice --capacity-id cap-1
```

---

## Migration Path

### If you have existing SQLite data:

1. **Export from SQLite** (if you have the old version):

   ```typescript
   // Old CLI
   const participants = oldStorage.listParticipants();
   const capacities = oldStorage.listCapacities();
   ```

2. **Import to Holster** (new CLI):

   ```bash
   # Register each participant
   rdx register --did did:example:alice --name Alice

   # Recreate capacities
   rdx declare-capacity --did did:example:alice ...
   ```

### Fresh Start:

Just start using the new commands! Each participant gets their own decentralized storage automatically.

---

## Technical Details

### Storage Location

- **Node.js**: `~/.holster/` directory
- **Browser**: IndexedDB (for future web apps)

### Initialization

Storage is initialized lazily on first command per DID. This means:

- Fast startup (no database connection needed)
- Per-user isolation (each DID has separate storage)
- Automatic P2P discovery (Gun network)

### Data Structure

Each user's Holster storage contains:

```
user/
├── participants/
├── capacities/
├── slots/
├── desires/
├── providerDesires/
├── commitments/
└── allocations/
```

---

## Removed Files

- ❌ `src/storage.ts` (SQLite implementation)
- ❌ `better-sqlite3` dependency
- ❌ `@types/better-sqlite3` dependency

## New Behavior

- ✅ Async operations throughout
- ✅ Real-time sync enabled
- ✅ P2P by default
- ✅ Decentralized storage

---

## Example Session

```bash
# Alice registers
rdx register --did did:example:alice --name Alice

# Alice declares a capacity
rdx declare-capacity \
  --did did:example:alice \
  --id cap-consulting \
  --type "blockchain_consulting" \
  --quantity 20 \
  --unit "hours/month"

# Alice sees her capacities (synced in real-time)
rdx list-capacities --did did:example:alice

# Bob (on another machine) expresses desire
rdx express-desire \
  --did did:example:bob \
  --capacity-id cap-consulting \
  --quantity 5

# Alice computes allocation (sees Bob's desire in real-time)
rdx compute-allocation \
  --did did:example:alice \
  --capacity-id cap-consulting

# Both Alice and Bob see the allocation (real-time sync!)
rdx show-allocation \
  --did did:example:alice \
  --capacity-id cap-consulting
```

---

## Status

✅ **Migration Complete**  
✅ **All Commands Updated**  
✅ **SQLite Removed**  
✅ **Holster-Only**  
✅ **Decentralized by Default**

Your RDX CLI is now fully decentralized! 🎉
