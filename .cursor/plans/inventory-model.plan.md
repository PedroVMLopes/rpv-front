---
name: Inventory Model
overview: Modelo de inventário com bag (possuídos) e equipped (slots genéricos); apenas itens equipados alimentam grants/modifiers. Piloto sem peso/moeda/atunamento; itens como dados em @rpv/content; UI mínima só para validação.
todos:
  - id: etapa-0-contrato
    content: "Etapa 0 — Tipos CharacterInventory (bag + equipped), sanitizeInventory, substituir selections.items; testes unitários"
    status: pending
  - id: etapa-1-catalogo
    content: "Etapa 1 — Evoluir ItemEntry (system, allowedSlots, stackable); 5–10 itens piloto; testes em packages/content"
    status: pending
  - id: etapa-2-slots
    content: "Etapa 2 — equipmentSlots.dnd.ts + canEquipItem/sanitizeEquipped; regras bag↔equip; testes"
    status: pending
  - id: etapa-3-pipeline
    content: "Etapa 3 — collectGrantSources só equipped; store equip/unequip + rebuildStoredCharacter; testes buildCharacter"
    status: pending
  - id: etapa-4-stored
    content: "Etapa 4 — StoredCharacter + normalize; remover startingItem como fonte de verdade; PROJECT_CONTEXT"
    status: pending
  - id: etapa-5-authoring
    content: "Etapa 5 — Checklist authoring itens comunitários em AGENTS.md / PROJECT_CONTEXT"
    status: pending
  - id: etapa-6-ui-smoke
    content: "Etapa 6 — UI mínima CharacterCardInventory (bag, slots, equip/unequip) para smoke test"
    status: pending
  - id: etapa-7-api-notes
    content: "Etapa 7 — Notas de contrato API (StoredCharacter payload, PATCH inventory, ItemDefinition vs estado)"
    status: pending
isProject: false
---

# Inventário — bag + equipado (modelo e pipeline)

## Contexto e prioridades

- **Foco:** backend / estrutura de `StoredCharacter` sólida; pipeline de grants/modifiers previsível.
- **UI atual:** apenas visualização e testes; não é produto final.
- **Multi-sistema:** D&D é o primeiro `system`; slots e itens por namespace (`*.dnd.ts`, catálogo por system).
- **Itens comunitários:** mesmo padrão do catálogo (dados em `@rpv/content`); API de publicação fica para depois.
- **Dados legados:** localStorage e personagens salvos serão **apagados antes** da implementação — **sem** migração pesada de `startingItem` / `items[]`; apenas o modelo novo e sanitização em runtime.

---

## Decisões fechadas

| Tópico | Decisão |
|--------|---------|
| Identidade na bag | `{ slug, quantity }` agregado (sem instâncias no piloto) |
| Equipamento | `equipped: Record<slotId, slug>` — slots definidos por sistema em `*.dnd.ts` |
| O que gera grants | **Somente** slugs em `equipped` (bag não altera stats) |
| Itens de usuário | Catálogo em `@rpv/content` (como races/spells); remoto depois |
| Escopo piloto | Bag + equipar/des equipar + rebuild; sem peso, moeda, atunamento |
| `startingItem` legado | Se existir em testes/form: vai **só para bag** (não auto-equipar) |
| Mesmo slug em 2 slots | **Proibido** — no máximo um slot por slug equipado |
| Persistência do plano | Este arquivo em [`.cursor/plans/inventory-model.plan.md`](inventory-model.plan.md) |

### Sanitização em runtime (mesmo sem migração legada)

- Dropar slugs inexistentes no catálogo do `system` do personagem.
- Merge de stacks duplicados na bag; `quantity >= 1`.
- Slot desconhecido ou item incompatível com slot → limpar slot (dados serão resetados antes do piloto; política simples).
- Garantir conservação de quantidade: total do slug = bag + contagem em slots equipados.

---

## Estado atual (baseline)

| Peça | Status |
|------|--------|
| `selections.items: string[]` | Todos os slugs aplicam grants (sem distinção bag/equip) |
| `startingItem` no form | Mapeia para `items[0]` |
| `CharacterCardInventory` | Stub ("Inventory") |
| `itemGrants.dnd.ts` | 3 itens piloto; sem `allowedSlots` / `system` |
| `collectGrantSources` | Itera `selections.items` |
| Pipeline build | `sanitizeSelections → deriveCharacterGrants → deriveResourceTotals` |

---

## Arquitetura alvo

```mermaid
flowchart TD
  subgraph selections [CharacterSelections]
    bag[bag: ItemStack[]]
    equipped[equipped: Record slotId slug]
  end
  subgraph content [@rpv/content]
    itemCatalog[Item catalog by system]
    slotRules[equipmentSlots.dnd.ts]
  end
  bag --> sanitize[sanitizeInventory]
  equipped --> sanitize
  sanitize --> validateSlots[validate slots + slug rules]
  validateSlots --> collect[collectGrantSources]
  itemCatalog --> collect
  collect -->|"equipped slugs only"| grants[deriveCharacterGrants]
  grants --> modifiers[deriveModifiers]
  grants --> resources[deriveResourceTotals]
  modifiers --> stored[StoredCharacter]
```

**Princípio:** definição do item (`grants`, `allowedSlots`) é **content**; estado (`bag`, `equipped`) é **selections**; resolução reutiliza o mesmo pipeline de raça/classe com `source: { type: "item", id: slug }`.

---

## Etapa 0 — Contrato de dados

**Objetivo:** tipos estáveis e sanitização, system-agnostic.

### Tipos (exportar de `@rpv/domain` ou espelhar em web até absorver no domain)

```ts
type ItemStack = { slug: string; quantity: number };

type CharacterInventory = {
  bag: ItemStack[];
  equipped: Record<string, string>; // slotId → item slug
};
```

- Adicionar `inventory: CharacterInventory` em `CharacterSelections`.
- **Remover** `items: string[]` como fonte de verdade (substituir usos; testes atualizados).
- `emptyCharacterSelections()` → `inventory: { bag: [], equipped: {} }`.

### `sanitizeInventory(inventory, system)`

1. Remover stacks com slug inválido ou `quantity < 1`.
2. Merge stacks com mesmo `slug` na bag.
3. Validar `equipped`: slot válido para `system`, item existe, `canEquipItem(slug, slot, system)`.
4. Enforce: mesmo `slug` no máximo em **um** slot.
5. Reconciliar quantidades: cada slug equipado consome 1 da bag (decrementar ao equipar; incrementar ao des equipar — ver Etapa 2).

### Arquivos principais

- [`packages/domain`](packages/domain) — tipos genéricos (se adicionados ao domain).
- [`apps/web/lib/character/storedCharacter.ts`](apps/web/lib/character/storedCharacter.ts)
- Novo: `apps/web/lib/character/inventory.ts` (sanitize + ops puras)

**Critério de pronto:** testes unitários de sanitize e tipos; sem UI.

---

## Etapa 1 — Catálogo de itens (content)

**Objetivo:** `ItemEntry` pronto para SRD piloto e itens de comunidade.

### Evolução de [`ItemEntry`](packages/content/src/curation/itemGrants.dnd.ts)

```ts
interface ItemEntry {
  slug: string;
  system: "dnd";
  name: string;
  description: string;
  grants: Grant[];
  allowedSlots?: string[];
  stackable?: boolean; // default true no piloto
}
```

### API

- `getItem(slug, system?)`, `listItems(system)`, `getItemGrants(slug, system?)`
- Overlay pt-BR em [`packages/content/data/translations/pt-BR.json`](packages/content/data/translations/pt-BR.json) (seção `items`)

### Piloto (5–10 itens)

- Manter: scroll, amuleto, ring (stat_modifier)
- Adicionar: 1–2 armas/armaduras com `allowedSlots` (validação de slot; AC automático fora do piloto)

**Critério de pronto:** testes em `packages/content/__tests__/`.

---

## Etapa 2 — Slots por sistema

**Objetivo:** mapa genérico `equipped` + validação data-driven.

### Novo: `packages/content/src/curation/equipmentSlots.dnd.ts`

```ts
// Piloto: armor, main-hand, off-hand, ring (exemplo)
{ id: "armor", labelKey: "equipmentSlots.armor" }
```

### Helpers

- `getEquipmentSlots(system)`
- `canEquipItem(itemSlug, slotId, system): boolean`
- `equipItem(inventory, slotId, slug, system): CharacterInventory`
- `unequipItem(inventory, slotId, system): CharacterInventory`
- `addToBag` / `removeFromBag` (quantity)

### Regras bag ↔ equipado

- **Equipar:** `bag` −1 do slug; `equipped[slot] = slug` (falha se sem stock ou slot inválido ou slug já equipado noutro slot).
- **Des equipar:** remove slot; `bag` +1.
- Item **só na bag** → sem grants.

**Critério de pronto:** testes puros de equip/unequip e slot validation.

---

## Etapa 3 — Pipeline de personagem

**Objetivo:** equipado altera personagem como classe/raça.

### Alterações

[`characterGrants.ts`](apps/web/lib/character/characterGrants.ts) — `collectGrantSources`:

```ts
// Antes: for (const itemSlug of selections.items ?? [])
// Depois: for (const slug of uniqueEquippedSlugs(selections.inventory.equipped))
```

- `deriveStatModifiers` — sem mudança de contrato (`source.type === "item"`).
- `sanitizeSelections` — chama `sanitizeInventory` antes de `sanitizeGrantPicks`.
- `buildStoredCharacter` / `rebuildStoredCharacter` — inventário em `selections`, não `startingItem`.

### Store ([`useCharacterStore.ts`](apps/web/store/useCharacterStore.ts))

Novas ações (todas → `rebuildStoredCharacter`):

- `equipItem(characterId, slotId, slug)`
- `unequipItem(characterId, slotId)`
- `addToBag(characterId, slug, quantity?)`
- `removeFromBag(characterId, slug, quantity?)`

### Form / sanitização reativa

- Remover dependência de `startingItem` como fonte de grants.
- `useGrantPickSanitizer`: observar `inventory` (ou deprecar watch de `startingItem`).

**Critério de pronto:** testes em [`buildCharacter.test.ts`](apps/web/__tests__/buildCharacter.test.ts):

- Amuleto equipado → +HP; só na bag → sem bônus.
- Trocar equipamento recalcula modifiers/grants.
- Slug inválido removido on sanitize.

---

## Etapa 4 — StoredCharacter e documentação

**Objetivo:** contrato estável para persistência (localStorage hoje, API amanhã).

- `StoredCharacter.selections.inventory` obrigatório após normalize.
- `normalizeStoredCharacter`: default `inventory` vazio; **sem** migração legada (dados resetados pelo time).
- Remover `startingItem` do schema Zod / form como fonte de verdade (opcional manter campo deprecated até Etapa 6).
- Atualizar [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — tabela "Where data lives" (bag / equipped / grants).
- Opcional: `schemaVersion` no root para futuras migrações.

**Critério de pronto:** round-trip normalize → build; docs atualizados.

---

## Etapa 5 — Authoring comunitário

**Objetivo:** qualquer item autorável = `ItemEntry` + `Grant[]` (AGENTS.md).

Checklist (estender PROJECT_CONTEXT / [`packages/content/AGENTS.md`](packages/content/AGENTS.md)):

1. Entrada no catálogo do `system`
2. `grants` + `allowedSlots`
3. Overlay pt-BR
4. `npm test` (content + web)

**Fora do piloto:** editor UI, API publish, moderação, `buildCatalog` incluir items automaticamente.

---

## Etapa 6 — UI mínima (smoke test)

**Objetivo:** validação manual descartável.

- Implementar [`CharacterCardInventory.tsx`](apps/web/components/characters/CharacterCard/CharacterCardInventory.tsx): lista bag, slots do system, equip/unequip.
- Teste React opcional: equip amuleto → texto/indicador de HP sobe (via store + resolved stats).

**Não objetivo:** UX final, drag-and-drop, peso, moeda.

---

## Etapa 7 — Notas para API (sem implementar backend)

- **Payload personagem:** `StoredCharacter` completo.
- **Payload item (definição):** `ItemEntry` no catálogo global por `system` + `slug`.
- **Operação:** `PATCH /characters/:id/inventory` com ops ou estado completo → server executa `sanitizeInventory` + `buildStoredCharacter` (mesma lógica que web).
- Separar sempre **definição** (content) de **estado** (selections.inventory).

---

## Ordem de execução

| Ordem | Etapa | Depende de |
|-------|--------|------------|
| 1 | 0 — Contrato + sanitize | — |
| 2 | 1 — Catálogo itens | 0 |
| 3 | 2 — Slots + ops bag/equip | 1 |
| 4 | 3 — Pipeline + store | 0, 1, 2 |
| 5 | 4 — StoredCharacter + docs | 3 |
| 6 | 5 — Authoring checklist | 1 |
| 7 | 6 — UI smoke | 4 |
| 8 | 7 — Notas API | 4 |

---

## Fora de escopo (piloto)

- Peso, moeda, consumíveis, cargas
- Atunamento (limite 3)
- Instâncias únicas / itens encantados distintos
- `choose > 0` em grants de item
- Migração de localStorage legado (reset manual antes do deploy)
- Backend / API real
- NPC/enemy inventory (foco player)

---

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| `selections.items` espalhado no código | Grep + substituição na Etapa 0; testes de regressão |
| Slug na bag e equipado ao mesmo tempo | Ops `equip`/`unequip` movem quantidade; sanitize reconcilia |
| AC/armadura D&D | Piloto: slot + grants stat_modifier; AC manual até grant de AC |
| Catálogo pequeno | 5–10 itens cobrindo slots e modifiers |
| Leak D&D no domain | Slots e `allowedSlots` só em `@rpv/content` |

---

## Referências

- [`AGENTS.md`](../../AGENTS.md) — princípios system-agnostic
- [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) — pipeline de personagem
- [`packages/content/AGENTS.md`](../../packages/content/AGENTS.md) — modelo Grant
- [`apps/web/lib/character/buildCharacter.ts`](../../apps/web/lib/character/buildCharacter.ts) — rebuild central
