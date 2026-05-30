
---

### Character.types.ts

**Purpose:**
Defines types and structural contracts.

**Responsibilities:**
- Define `CharacterType`
- Define `CharacterId`
- Define `BaseStats` structure
- Define `CharacterProps` interface

**Important Constraints:**
- No business logic
- No calculations
- Purely structural definitions

**Answers:**
> "What is a Character?"

---

### Character.ts

**Purpose:**
Implements the Character entity.

**Responsibilities:**
- Create character instances
- Store internal state
- Manage modifiers
- Expose character data

**Allowed:**
- Constructor
- Methods like:
  - `addModifier`
  - `removeModifier`

**Not Allowed:**
- Heavy stat resolution logic
- Complex mathematical calculations

Stat resolution must be delegated externally (e.g., `resolveStats`).

**Answers:**
> "How does a Character behave?"

---

## Architectural Constraints

- Stat calculation must be centralized (no duplication)
- Modifier application must be predictable and deterministic
- Core logic should be composable and extensible
- Avoid coupling between Character and resolution logic

---

## Known Problems

- Lack of clear flow between:
  - Character
  - Modifiers
  - Stat resolution

- Possible redundancy in modifier implementation

- Incomplete integration between system parts

---

## Desired Outcome

A working pipeline where:

1. A Character has base stats
2. A Character has a list of modifiers
3. `resolveStats` processes:
   - base stats
   - modifiers
4. Final stats are computed in a predictable, pure, and extensible way

---

## Guidance for AI (Cursor)

When generating plans or code:

- Prefer small, incremental steps
- Avoid overengineering
- Keep logic decoupled
- Ensure functions are pure when possible
- Do not introduce hidden state
- Respect separation of concerns between:
  - Types
  - Entities
  - Resolvers

When suggesting tasks:
- Break work into minimal actionable units
- Always define clear "definition of done"
- Prioritize completing a full working pipeline over partial abstractions