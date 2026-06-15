(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/packages/domain/src/stats/statKey.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Maybe all of the statkeys should be stored here
// so items from different systems could be used, just the stats will not change
__turbopack_context__.s({
    "STAT_KEYS": ()=>STAT_KEYS,
    "createDefaultStats": ()=>createDefaultStats
});
const STAT_KEYS = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
    "armorClass",
    "hitPoints"
];
function createDefaultStats(overrides) {
    const stats = {};
    for (const key of STAT_KEYS){
        var _overrides_key;
        stats[key] = (_overrides_key = overrides === null || overrides === void 0 ? void 0 : overrides[key]) !== null && _overrides_key !== void 0 ? _overrides_key : key === "hitPoints" ? 0 : 10;
    }
    return stats;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/modifier.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/modifier.operation.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/modifier.source.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/modifier.duration.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/modifier.stacking.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/modifier.resolver.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Resolution pipeline (per call):
//   1. duration filtering — drop modifiers that are not currently active
//   2. stacking resolution — collapse competing modifiers within a group
//   3. operation application — set → multiply → add → sub
//
// Within each operation group, modifiers are sorted by priority (ascending).
__turbopack_context__.s({
    "resolveStats": ()=>resolveStats
});
const OPERATION_ORDER = [
    "set",
    "multiply",
    "add",
    "sub"
];
function byPriority(a, b) {
    return a.priority - b.priority;
}
/**
 * Decides whether a modifier is active for the given context.
 *
 * - `permanent`   → always active.
 * - `temporary`   → active until `rounds` have elapsed. When the context does
 *                   not track elapsed rounds the modifier is assumed active
 *                   (expiry is managed by whoever advances the round counter).
 * - `conditional` → active only while its condition is listed in the context.
 *                   With no matching condition it is treated as inactive.
 */ function isActive(modifier, context) {
    const { duration } = modifier;
    switch(duration.type){
        case "permanent":
            return true;
        case "temporary":
            return context.elapsedRounds === undefined || context.elapsedRounds < duration.rounds;
        case "conditional":
            var _context_activeConditions;
            var _context_activeConditions_includes;
            return (_context_activeConditions_includes = (_context_activeConditions = context.activeConditions) === null || _context_activeConditions === void 0 ? void 0 : _context_activeConditions.includes(duration.condition)) !== null && _context_activeConditions_includes !== void 0 ? _context_activeConditions_includes : false;
    }
}
/**
 * Two modifiers compete for stacking only when they are the "same kind of
 * bonus": same target `stat`, same `operation`, and same `source.type`. This
 * keeps, for example, a race's `set` and a class's `add` independent while
 * making two item bonuses to AC contend with each other.
 */ function stackingGroupKey(modifier) {
    return "".concat(modifier.stat, "|").concat(modifier.operation, "|").concat(modifier.source.type);
}
function maxKeptValue(kept) {
    return kept.reduce((max, m)=>Math.max(max, m.value), Number.NEGATIVE_INFINITY);
}
/**
 * Collapses each stacking group down to the modifiers that actually apply.
 *
 * Modifiers in a group are processed in ascending priority order and folded
 * according to each one's `stacking` rule:
 *
 * - `stack`               → always kept (cumulative).
 * - `replace`             → discards everything kept so far in the group.
 * - `ignore-if-duplicate` → kept only if it is the first of its group.
 * - `ignore-if-higher`    → only the single highest-value modifier survives.
 */ function applyStacking(modifiers) {
    const groups = new Map();
    for (const modifier of modifiers){
        const key = stackingGroupKey(modifier);
        const group = groups.get(key);
        if (group) {
            group.push(modifier);
        } else {
            groups.set(key, [
                modifier
            ]);
        }
    }
    const result = [];
    for (const group of Array.from(groups.values())){
        const sorted = [
            ...group
        ].sort(byPriority);
        let kept = [];
        for (const modifier of sorted){
            switch(modifier.stacking){
                case "stack":
                    kept.push(modifier);
                    break;
                case "replace":
                    kept = [
                        modifier
                    ];
                    break;
                case "ignore-if-duplicate":
                    if (kept.length === 0) {
                        kept.push(modifier);
                    }
                    break;
                case "ignore-if-higher":
                    if (kept.length === 0 || modifier.value > maxKeptValue(kept)) {
                        kept = [
                            modifier
                        ];
                    }
                    break;
            }
        }
        result.push(...kept);
    }
    return result;
}
function applyOperation(result, operation, modifiers) {
    const sorted = modifiers.filter((m)=>m.operation === operation).sort(byPriority);
    for (const m of sorted){
        switch(operation){
            case "set":
                result[m.stat] = m.value;
                break;
            case "multiply":
                result[m.stat] *= m.value;
                break;
            case "add":
                result[m.stat] += m.value;
                break;
            case "sub":
                result[m.stat] -= m.value;
                break;
        }
    }
}
function resolveStats(baseStats, modifiers) {
    let context = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const active = modifiers.filter((m)=>isActive(m, context));
    const stacked = applyStacking(active);
    const result = {
        ...baseStats
    };
    for (const operation of OPERATION_ORDER){
        applyOperation(result, operation, stacked);
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/modifier.utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "removeModifiersBySource": ()=>removeModifiersBySource
});
function removeModifiersBySource(modifiers, source) {
    return modifiers.filter((modifier)=>{
        if (modifier.source.type !== source.type) {
            return true;
        }
        if (source.id !== undefined && modifier.source.id !== source.id) {
            return true;
        }
        return false;
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/index.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$operation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.operation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.source.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$duration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.duration.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$stacking$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.stacking.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.resolver.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.utils.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/modifiers/index.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$operation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.operation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.source.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$duration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.duration.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$stacking$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.stacking.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.resolver.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/index.ts [app-client] (ecmascript) <locals>");
}),
"[project]/packages/domain/src/grants/characterGrant.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/grants/characterGrant.utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getAbilities": ()=>getAbilities,
    "getLanguages": ()=>getLanguages,
    "getProficiencies": ()=>getProficiencies,
    "getSavingThrows": ()=>getSavingThrows,
    "getSpells": ()=>getSpells,
    "removeGrantsBySource": ()=>removeGrantsBySource
});
function removeGrantsBySource(grants, source) {
    return grants.filter((grant)=>{
        if (grant.source.type !== source.type) {
            return true;
        }
        if (source.id !== undefined && grant.source.id !== source.id) {
            return true;
        }
        return false;
    });
}
function getLanguages(grants) {
    return grants.filter((grant)=>grant.kind === "language");
}
function getAbilities(grants) {
    return grants.filter((grant)=>grant.kind === "ability");
}
function getSpells(grants) {
    return grants.filter((grant)=>grant.kind === "spell");
}
function getProficiencies(grants) {
    return grants.filter((grant)=>grant.kind === "proficiency");
}
function getSavingThrows(grants) {
    return grants.filter((grant)=>grant.kind === "saving_throw");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/grants/index.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/characterGrant.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/characterGrant.utils.ts [app-client] (ecmascript)");
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/grants/index.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/characterGrant.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/characterGrant.utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/index.ts [app-client] (ecmascript) <locals>");
}),
"[project]/packages/domain/src/character/Character.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/character/Character.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Character": ()=>Character
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/characterGrant.utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.resolver.ts [app-client] (ecmascript)");
;
;
;
class Character {
    static create(props) {
        return new Character(props);
    }
    getId() {
        return this.props.id;
    }
    getType() {
        return this.props.type;
    }
    getName() {
        return this.props.name;
    }
    getBaseStats() {
        return {
            ...this.props.baseStats
        };
    }
    getModifiers() {
        return [
            ...this.props.modifiers
        ];
    }
    getGrants() {
        var _this_props_grants;
        return [
            ...(_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : []
        ];
    }
    getLanguages() {
        var _this_props_grants;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLanguages"])((_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : []);
    }
    getAbilities() {
        var _this_props_grants;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAbilities"])((_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : []);
    }
    getSpells() {
        var _this_props_grants;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSpells"])((_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : []);
    }
    getProficiencies() {
        var _this_props_grants;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$characterGrant$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProficiencies"])((_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : []);
    }
    toProps() {
        var _this_props_grants;
        return {
            ...this.props,
            baseStats: {
                ...this.props.baseStats
            },
            modifiers: [
                ...this.props.modifiers
            ],
            grants: [
                ...(_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : []
            ]
        };
    }
    addModifier(modifier) {
        return new Character({
            ...this.props,
            modifiers: [
                ...this.props.modifiers,
                modifier
            ]
        });
    }
    removeModifier(id) {
        return new Character({
            ...this.props,
            modifiers: this.props.modifiers.filter((m)=>m.id !== id)
        });
    }
    addGrant(grant) {
        var _this_props_grants;
        return new Character({
            ...this.props,
            grants: [
                ...(_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : [],
                grant
            ]
        });
    }
    removeGrant(id) {
        var _this_props_grants;
        return new Character({
            ...this.props,
            grants: ((_this_props_grants = this.props.grants) !== null && _this_props_grants !== void 0 ? _this_props_grants : []).filter((g)=>g.id !== id)
        });
    }
    getResolvedStats() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveStats"])(this.props.baseStats, this.props.modifiers);
    }
    constructor(props){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "props", void 0);
        this.props = props;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/character/index.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$Character$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/character/Character.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$Character$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/character/Character.ts [app-client] (ecmascript)");
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/character/index.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$Character$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/character/Character.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$Character$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/character/Character.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/character/index.ts [app-client] (ecmascript) <locals>");
}),
"[project]/packages/domain/src/i18n/locale.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * Locale primitives shared across the domain, content catalog and web app.
 *
 * Two language axes exist in the product: the UI language (a user preference)
 * and the content language (a property of each piece of content). Both reuse the
 * same {@link Locale} type and fallback rules defined here so there is a single
 * source of truth for which languages are supported.
 */ __turbopack_context__.s({
    "DEFAULT_LOCALE": ()=>DEFAULT_LOCALE,
    "LOCALES": ()=>LOCALES,
    "isLocale": ()=>isLocale,
    "resolveLocalized": ()=>resolveLocalized
});
const LOCALES = [
    "en",
    "pt-BR"
];
const DEFAULT_LOCALE = "en";
function isLocale(value) {
    return typeof value === "string" && LOCALES.includes(value);
}
function resolveLocalized(value, locale) {
    let fallback = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : DEFAULT_LOCALE;
    if (!value) {
        return undefined;
    }
    if (value[locale] !== undefined) {
        return value[locale];
    }
    if (value[fallback] !== undefined) {
        return value[fallback];
    }
    for (const candidate of LOCALES){
        if (value[candidate] !== undefined) {
            return value[candidate];
        }
    }
    return undefined;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/index.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$stats$2f$statKey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/stats/statKey.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/character/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/i18n/locale.ts [app-client] (ecmascript)");
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$stats$2f$statKey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/stats/statKey.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$grants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/grants/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/character/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/i18n/locale.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <locals>");
}),
"[project]/apps/web/presets/dnd/characterStats.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "DND_DEFAULT_ABILITY_VALUE": ()=>DND_DEFAULT_ABILITY_VALUE,
    "dndAbilityAttributeNames": ()=>dndAbilityAttributeNames,
    "dndAbilityFieldAttributes": ()=>dndAbilityFieldAttributes,
    "dndDefaultAttributes": ()=>dndDefaultAttributes,
    "dndStatConfig": ()=>dndStatConfig
});
const DND_DEFAULT_ABILITY_VALUE = 10;
const dndStatConfig = {
    defaultAbilityValue: DND_DEFAULT_ABILITY_VALUE,
    abilityGeneration: {
        methods: [
            "manual",
            "standard-array",
            "point-buy",
            "roll"
        ],
        standardArray: [
            15,
            14,
            13,
            12,
            10,
            8
        ],
        pointBuy: {
            budget: 27,
            min: 8,
            max: 15,
            cost: {
                8: 0,
                9: 1,
                10: 2,
                11: 3,
                12: 4,
                13: 5,
                14: 7,
                15: 9
            }
        },
        roll: {
            dice: 4,
            sides: 6,
            drop: 1,
            count: 6
        }
    },
    abilities: [
        {
            name: "strength",
            labelKey: "abilities.strength",
            statKey: "strength",
            shortLabelKey: "abilitiesShort.strength"
        },
        {
            name: "dexterity",
            labelKey: "abilities.dexterity",
            statKey: "dexterity",
            shortLabelKey: "abilitiesShort.dexterity"
        },
        {
            name: "constitution",
            labelKey: "abilities.constitution",
            statKey: "constitution",
            shortLabelKey: "abilitiesShort.constitution"
        },
        {
            name: "intelligence",
            labelKey: "abilities.intelligence",
            statKey: "intelligence",
            shortLabelKey: "abilitiesShort.intelligence"
        },
        {
            name: "wisdom",
            labelKey: "abilities.wisdom",
            statKey: "wisdom",
            shortLabelKey: "abilitiesShort.wisdom"
        },
        {
            name: "charisma",
            labelKey: "abilities.charisma",
            statKey: "charisma",
            shortLabelKey: "abilitiesShort.charisma"
        }
    ],
    combatStats: [
        {
            formFields: [
                "maxHp",
                "hp"
            ],
            statKey: "hitPoints",
            labelKey: "combat.maxHp",
            defaultValue: 0
        },
        {
            formFields: [
                "ac"
            ],
            statKey: "armorClass",
            labelKey: "combat.ac",
            defaultValue: 10
        }
    ],
    resources: [
        {
            name: "hp",
            labelKey: "combat.hp",
            formField: "hp",
            maxStatKey: "hitPoints",
            defaultValue: 0
        }
    ]
};
const dndAbilityAttributeNames = dndStatConfig.abilities.map((ability)=>ability.name);
const dndAbilityFieldAttributes = dndStatConfig.abilities.map((param)=>{
    let { name, labelKey } = param;
    return {
        name,
        labelKey
    };
});
const dndDefaultAttributes = dndStatConfig.abilities.map((ability)=>({
        name: ability.name,
        value: DND_DEFAULT_ABILITY_VALUE
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/presets/dnd/characterFields.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndCharacterFields": ()=>dndCharacterFields
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/characterStats.ts [app-client] (ecmascript)");
;
const dndCharacterFields = {
    common: [
        {
            name: "name",
            labelKey: "fields.name",
            type: "text",
            required: true,
            group: "general",
            order: 1,
            inlineGroup: "line1"
        },
        {
            name: "age",
            labelKey: "fields.age",
            type: "select",
            options: [
                "Todler",
                "Child",
                "Teenager",
                "Young Adult",
                "Adult",
                "Old Adult",
                "Old"
            ],
            group: "general",
            order: 1,
            inlineGroup: "line3"
        },
        {
            name: "hp",
            labelKey: "fields.hp",
            type: "number",
            group: "combat",
            order: 1,
            inlineGroup: "line2"
        },
        {
            name: "maxHp",
            labelKey: "fields.maxHp",
            type: "number",
            group: "combat",
            order: 2,
            inlineGroup: "line2"
        },
        {
            name: "ac",
            labelKey: "fields.ac",
            type: "number",
            group: "combat",
            order: 3,
            inlineGroup: "line2"
        },
        {
            name: "attributes",
            labelKey: "fields.attributes",
            type: "attributeGroup",
            group: "attributes",
            order: 1,
            attributes: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndAbilityFieldAttributes"]
        },
        {
            name: "goals",
            labelKey: "fields.goals",
            type: "text",
            group: "general",
            order: 2
        }
    ],
    player: [
        {
            name: "characterClass",
            labelKey: "fields.characterClass",
            type: "select",
            options: [],
            group: "general",
            order: 2,
            inlineGroup: "line2"
        },
        {
            name: "subclass",
            labelKey: "fields.subclass",
            type: "text",
            group: "general",
            order: 3,
            inlineGroup: "line2"
        },
        {
            name: "level",
            labelKey: "fields.level",
            type: "number",
            defaultValue: 1,
            group: "general",
            order: 1,
            inlineGroup: "line2"
        },
        {
            name: "gold",
            labelKey: "fields.gold",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "silver",
            labelKey: "fields.silver",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "bronze",
            labelKey: "fields.bronze",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "equippedItems",
            labelKey: "fields.equippedItems",
            type: "text",
            group: "general",
            order: 3,
            inlineGroup: "line5"
        },
        {
            name: "inventory",
            labelKey: "fields.inventory",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line5"
        },
        {
            name: "race",
            labelKey: "fields.race",
            type: "select",
            options: [],
            group: "general",
            order: 2,
            inlineGroup: "line3"
        },
        {
            name: "subrace",
            labelKey: "fields.subrace",
            type: "select",
            options: [],
            group: "general",
            order: 2,
            inlineGroup: "line3"
        },
        {
            name: "background",
            labelKey: "fields.background",
            type: "select",
            options: [],
            group: "general",
            order: 3,
            inlineGroup: "line3"
        },
        {
            name: "startingItem",
            labelKey: "fields.startingItem",
            type: "select",
            options: [],
            group: "general",
            order: 4,
            inlineGroup: "line5"
        }
    ],
    enemy: [
        {
            name: "creatureType",
            labelKey: "fields.creatureType",
            type: "text",
            group: "enemy",
            order: 1
        },
        {
            name: "cr",
            labelKey: "fields.cr",
            type: "number",
            group: "enemy",
            order: 2
        }
    ],
    npc: [
        {
            name: "occupation",
            labelKey: "fields.occupation",
            type: "text",
            group: "npc",
            order: 1
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/presets/dnd/characterSchema.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "characterSchemasByType": ()=>characterSchemasByType,
    "dndCharacterSchema": ()=>dndCharacterSchema
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-client] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/characterStats.ts [app-client] (ecmascript)");
;
;
const dndCharacterSchema = {
    common: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Name is required"),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "player",
            "enemy",
            "npc"
        ]).optional(),
        system: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "dnd",
            "op",
            "coc"
        ]).optional(),
        hp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional().default(0),
        maxHp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional(),
        ac: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional(),
        initiative: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional(),
        attributes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndAbilityAttributeNames"]),
            value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(20).default(10).optional()
        })).default(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndDefaultAttributes"]).optional()
    }),
    player: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        level: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().min(1).optional().default(1),
        characterClass: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        race: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        subrace: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        background: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        startingItem: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        choices: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            grantPicks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional()
        }).optional(),
        abilityScoreMethod: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "manual",
            "standard-array",
            "point-buy",
            "roll"
        ]).optional(),
        abilityScoreRolls: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number()).optional()
    }),
    enemy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        creatureType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        cr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional()
    }),
    npc: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        occupation: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })
};
const characterSchemasByType = {
    player: dndCharacterSchema.common.extend(dndCharacterSchema.player.shape),
    enemy: dndCharacterSchema.common.extend(dndCharacterSchema.enemy.shape),
    npc: dndCharacterSchema.common.extend(dndCharacterSchema.npc.shape)
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/skillModifiers.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "abilityModifier": ()=>abilityModifier,
    "computeSkillModifiers": ()=>computeSkillModifiers,
    "formatModifier": ()=>formatModifier,
    "getProficientSkillSlugs": ()=>getProficientSkillSlugs,
    "proficiencyBonus": ()=>proficiencyBonus,
    "readCharacterLevel": ()=>readCharacterLevel
});
function abilityModifier(score) {
    return Math.floor((score - 10) / 2);
}
function proficiencyBonus(level) {
    const normalized = !Number.isFinite(level) || level < 1 ? 1 : Math.floor(level);
    return 2 + Math.floor((normalized - 1) / 4);
}
function readCharacterLevel(systemData) {
    const level = systemData.level;
    if (typeof level === "number" && !Number.isNaN(level) && level >= 1) {
        return Math.floor(level);
    }
    if (typeof level === "string" && level.trim() !== "") {
        const parsed = Number(level);
        if (!Number.isNaN(parsed) && parsed >= 1) {
            return Math.floor(parsed);
        }
    }
    return 1;
}
function getProficientSkillSlugs(grants, skills) {
    const skillSlugs = new Set(skills.map((skill)=>skill.slug));
    return new Set(grants.filter((grant)=>grant.kind === "proficiency" && skillSlugs.has(grant.ref)).map((grant)=>grant.ref));
}
function formatModifier(value) {
    if (value >= 0) {
        return "+".concat(value);
    }
    return String(value);
}
function computeSkillModifiers(stats, grants, level, skills) {
    const proficientSlugs = getProficientSkillSlugs(grants, skills);
    const bonus = proficiencyBonus(level);
    return skills.map((skill)=>{
        var _stats_skill_ability;
        const abilityMod = abilityModifier((_stats_skill_ability = stats[skill.ability]) !== null && _stats_skill_ability !== void 0 ? _stats_skill_ability : 10);
        const proficient = proficientSlugs.has(skill.slug);
        return {
            slug: skill.slug,
            name: skill.name,
            ability: skill.ability,
            modifier: abilityMod + (proficient ? bonus : 0),
            proficient
        };
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/presets/dnd/hp.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "averageHitDieGain": ()=>averageHitDieGain,
    "deriveDndMaxHp": ()=>deriveDndMaxHp,
    "dndHpRules": ()=>dndHpRules,
    "formatDndHpBreakdown": ()=>formatDndHpBreakdown
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$skillModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/skillModifiers.ts [app-client] (ecmascript)");
;
function averageHitDieGain(hitDie) {
    return hitDie / 2 + 1;
}
function levelHpContribution(gain, conMod) {
    return Math.max(1, gain + conMod);
}
function deriveDndMaxHp(ctx) {
    if (!ctx.classSlug || !ctx.hitDie) {
        return undefined;
    }
    if (!Number.isFinite(ctx.level) || ctx.level < 1) {
        return undefined;
    }
    const level = Math.floor(ctx.level);
    const conMod = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$skillModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abilityModifier"])(ctx.constitution);
    const firstLevel = levelHpContribution(ctx.hitDie, conMod);
    const laterLevels = levelHpContribution(averageHitDieGain(ctx.hitDie), conMod);
    return firstLevel + (level - 1) * laterLevels;
}
const dndHpRules = {
    deriveMaxHp: deriveDndMaxHp
};
function formatSigned(value) {
    return value >= 0 ? "+".concat(value) : "".concat(value);
}
function formatDndHpBreakdown(ctx) {
    const total = deriveDndMaxHp(ctx);
    if (total === undefined || !ctx.hitDie) {
        return undefined;
    }
    const conMod = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$skillModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abilityModifier"])(ctx.constitution);
    const conModLabel = formatSigned(conMod);
    const level = Math.floor(ctx.level);
    if (level <= 1) {
        return "d".concat(ctx.hitDie, " + CON ").concat(conModLabel, " at L1 = ").concat(total);
    }
    const avgGain = averageHitDieGain(ctx.hitDie);
    const perLevel = levelHpContribution(avgGain, conMod);
    return "d".concat(ctx.hitDie, " + CON ").concat(conModLabel, " at L1, +").concat(perLevel, " x ").concat(level - 1, " = ").concat(total);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/presets/dnd/index.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndPreset": ()=>dndPreset
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterFields$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/characterFields.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterSchema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/characterSchema.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/characterStats.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/hp.ts [app-client] (ecmascript)");
;
;
;
;
const dndPreset = {
    id: "dnd",
    name: "Dungeons & Dragons",
    characters: {
        fields: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterFields$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndCharacterFields"],
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterSchema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndCharacterSchema"]
    },
    statConfig: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$characterStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndStatConfig"],
    hpRules: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndHpRules"]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/presets/index.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "presets": ()=>presets
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/index.ts [app-client] (ecmascript)");
;
const presets = {
    dnd: {
        name: "Dungeons & Dragons",
        presetData: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndPreset"]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/presetStats.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "buildBaseStatsFromForm": ()=>buildBaseStatsFromForm,
    "buildResourcesFromForm": ()=>buildResourcesFromForm,
    "buildSystemDataFromForm": ()=>buildSystemDataFromForm,
    "flattenStoredToForm": ()=>flattenStoredToForm,
    "getCoreFieldNames": ()=>getCoreFieldNames,
    "getPresetStatConfig": ()=>getPresetStatConfig,
    "getResolvedStatDisplay": ()=>getResolvedStatDisplay,
    "getResourceMax": ()=>getResourceMax
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$stats$2f$statKey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/stats/statKey.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.resolver.ts [app-client] (ecmascript)");
;
;
function resolveCharacterStats(props) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveStats"])(props.baseStats, props.modifiers);
}
function getPresetStatConfig(system) {
    var _presets_system_presetData, _presets_system;
    const config = (_presets_system = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["presets"][system]) === null || _presets_system === void 0 ? void 0 : (_presets_system_presetData = _presets_system.presetData) === null || _presets_system_presetData === void 0 ? void 0 : _presets_system_presetData.statConfig;
    if (!config) {
        throw new Error("No stat config registered for system: ".concat(system));
    }
    return config;
}
function getCoreFieldNames(system) {
    const config = getPresetStatConfig(system);
    const names = new Set([
        "name",
        "attributes",
        "choices"
    ]);
    for (const combat of config.combatStats){
        for (const field of combat.formFields){
            names.add(field);
        }
    }
    for (const resource of config.resources){
        if (resource.formField) {
            names.add(resource.formField);
        }
    }
    return names;
}
function coerceNumber(value, fallback) {
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
}
function getFormAttributes(formData) {
    const attributes = formData.attributes;
    if (!Array.isArray(attributes)) {
        return undefined;
    }
    return attributes.map((entry)=>{
        if (typeof entry !== "object" || entry === null) {
            return {
                name: "",
                value: undefined
            };
        }
        const attr = entry;
        var _attr_name;
        return {
            name: String((_attr_name = attr.name) !== null && _attr_name !== void 0 ? _attr_name : ""),
            value: attr.value === undefined || attr.value === "" ? undefined : coerceNumber(attr.value, 0)
        };
    });
}
function readCombatStatFromForm(formData, combat) {
    for (const field of combat.formFields){
        const value = formData[field];
        if (value !== undefined && value !== "") {
            return coerceNumber(value, combat.defaultValue);
        }
    }
    return undefined;
}
function buildBaseStatsFromForm(formData, system) {
    const config = getPresetStatConfig(system);
    const attributes = getFormAttributes(formData);
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$stats$2f$statKey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDefaultStats"])();
    const attributeMap = new Map((attributes !== null && attributes !== void 0 ? attributes : []).map((attribute)=>[
            attribute.name,
            attribute.value
        ]));
    const knownAbilityNames = new Set(config.abilities.map((ability)=>ability.name));
    for (const attribute of attributes !== null && attributes !== void 0 ? attributes : []){
        if (!knownAbilityNames.has(attribute.name)) {
            continue;
        }
        const ability = config.abilities.find((entry)=>entry.name === attribute.name);
        if (ability) {
            var _attribute_value;
            stats[ability.statKey] = (_attribute_value = attribute.value) !== null && _attribute_value !== void 0 ? _attribute_value : config.defaultAbilityValue;
        }
    }
    for (const ability of config.abilities){
        if (!attributeMap.has(ability.name)) {
            stats[ability.statKey] = config.defaultAbilityValue;
        }
    }
    for (const combat of config.combatStats){
        var _readCombatStatFromForm;
        stats[combat.statKey] = (_readCombatStatFromForm = readCombatStatFromForm(formData, combat)) !== null && _readCombatStatFromForm !== void 0 ? _readCombatStatFromForm : combat.defaultValue;
    }
    return stats;
}
function buildResourcesFromForm(formData, system) {
    const config = getPresetStatConfig(system);
    const resources = {};
    for (const resource of config.resources){
        const raw = resource.formField !== undefined ? formData[resource.formField] : undefined;
        resources[resource.name] = raw !== undefined && raw !== "" ? coerceNumber(raw, resource.defaultValue) : resource.defaultValue;
    }
    return resources;
}
function buildSystemDataFromForm(formData, system) {
    const coreFields = getCoreFieldNames(system);
    const systemData = {};
    for (const [key, value] of Object.entries(formData)){
        if (!coreFields.has(key)) {
            systemData[key] = value;
        }
    }
    return systemData;
}
function flattenStoredToForm(stored, system) {
    var _stored_selections, _stored_selections1, _stored_selections2;
    const config = getPresetStatConfig(system);
    var _stored_selections_race, _stored_selections_subrace, _stored_selections_choices;
    const form = {
        ...stored.systemData,
        name: stored.name,
        race: (_stored_selections_race = (_stored_selections = stored.selections) === null || _stored_selections === void 0 ? void 0 : _stored_selections.race) !== null && _stored_selections_race !== void 0 ? _stored_selections_race : stored.systemData.race,
        subrace: (_stored_selections_subrace = (_stored_selections1 = stored.selections) === null || _stored_selections1 === void 0 ? void 0 : _stored_selections1.subrace) !== null && _stored_selections_subrace !== void 0 ? _stored_selections_subrace : stored.systemData.subrace,
        choices: (_stored_selections_choices = (_stored_selections2 = stored.selections) === null || _stored_selections2 === void 0 ? void 0 : _stored_selections2.choices) !== null && _stored_selections_choices !== void 0 ? _stored_selections_choices : {},
        attributes: config.abilities.map((ability)=>({
                name: ability.name,
                value: stored.baseStats[ability.statKey]
            }))
    };
    for (const combat of config.combatStats){
        const primaryField = combat.formFields[0];
        if (primaryField) {
            form[primaryField] = stored.baseStats[combat.statKey];
        }
    }
    for (const resource of config.resources){
        if (resource.formField) {
            form[resource.formField] = stored.resources[resource.name];
        }
    }
    return form;
}
function getResolvedStatDisplay(props, system) {
    const config = getPresetStatConfig(system);
    const resolved = resolveCharacterStats(props);
    const base = props.baseStats;
    return {
        abilities: config.abilities.map((ability)=>{
            var _ability_shortLabelKey, _ability_shortLabel;
            return {
                name: ability.name,
                labelKey: ability.labelKey,
                shortLabelKey: (_ability_shortLabelKey = ability.shortLabelKey) !== null && _ability_shortLabelKey !== void 0 ? _ability_shortLabelKey : ability.labelKey,
                label: ability.label,
                shortLabel: (_ability_shortLabel = ability.shortLabel) !== null && _ability_shortLabel !== void 0 ? _ability_shortLabel : ability.label,
                statKey: ability.statKey,
                base: base[ability.statKey],
                resolved: resolved[ability.statKey]
            };
        }),
        combat: config.combatStats.map((combat)=>({
                labelKey: combat.labelKey,
                label: combat.label,
                statKey: combat.statKey,
                base: base[combat.statKey],
                resolved: resolved[combat.statKey]
            }))
    };
}
function getResourceMax(stored, resourceName) {
    const config = getPresetStatConfig(stored.system);
    const resource = config.resources.find((r)=>r.name === resourceName);
    if (!(resource === null || resource === void 0 ? void 0 : resource.maxStatKey)) {
        return undefined;
    }
    const resolved = resolveCharacterStats({
        baseStats: stored.baseStats,
        modifiers: stored.modifiers
    });
    return resolved[resource.maxStatKey];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "buildSelectionsFromForm": ()=>buildSelectionsFromForm,
    "characterPropsToDomain": ()=>characterPropsToDomain,
    "formDataToCharacterProps": ()=>formDataToCharacterProps,
    "formDataToStoredCharacter": ()=>formDataToStoredCharacter,
    "getResolvedStatsForCharacter": ()=>getResolvedStatsForCharacter,
    "isLegacyStoredCharacter": ()=>isLegacyStoredCharacter,
    "migrateLegacyToStored": ()=>migrateLegacyToStored,
    "normalizeStoredCharacter": ()=>normalizeStoredCharacter,
    "storedCharacterToProps": ()=>storedCharacterToProps
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$Character$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/character/Character.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/i18n/locale.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.resolver.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/presetStats.ts [app-client] (ecmascript)");
;
;
function coerceString(value, fallback) {
    if (typeof value === "string" && value.length > 0) {
        return value;
    }
    return fallback;
}
function coerceOptionalString(value) {
    if (typeof value === "string" && value.trim().length > 0) {
        return value;
    }
    return undefined;
}
function coerceLocale(value) {
    let fallback = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_LOCALE"];
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLocale"])(value) ? value : fallback;
}
function coerceChoices(value, existing) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const record = value;
        const grantPicks = record.grantPicks && typeof record.grantPicks === "object" ? record.grantPicks : existing === null || existing === void 0 ? void 0 : existing.grantPicks;
        return {
            grantPicks: grantPicks !== null && grantPicks !== void 0 ? grantPicks : existing === null || existing === void 0 ? void 0 : existing.grantPicks
        };
    }
    return existing !== null && existing !== void 0 ? existing : {};
}
function buildSelectionsFromForm(formData, existing) {
    return {
        race: coerceOptionalString(formData.race),
        subrace: coerceOptionalString(formData.subrace),
        choices: coerceChoices(formData.choices, existing === null || existing === void 0 ? void 0 : existing.choices)
    };
}
function formDataToStoredCharacter(formData, id, type, system) {
    let modifiers = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : [], existingSelections = arguments.length > 5 ? arguments[5] : void 0, grants = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : [];
    const processedForm = {
        ...formData
    };
    if (processedForm.maxHp === undefined && processedForm.hp !== undefined) {
        processedForm.maxHp = processedForm.hp;
    }
    return {
        id,
        type,
        system,
        language: coerceLocale(formData.language),
        name: coerceString(formData.name, "Unnamed"),
        baseStats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBaseStatsFromForm"])(processedForm, system),
        modifiers,
        grants,
        selections: buildSelectionsFromForm(processedForm, existingSelections),
        resources: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildResourcesFromForm"])(processedForm, system),
        systemData: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildSystemDataFromForm"])(processedForm, system)
    };
}
function storedCharacterToProps(char) {
    var _char_grants;
    return {
        id: char.id,
        type: char.type,
        name: char.name,
        language: char.language,
        baseStats: char.baseStats,
        modifiers: char.modifiers,
        grants: (_char_grants = char.grants) !== null && _char_grants !== void 0 ? _char_grants : []
    };
}
function formDataToCharacterProps(formData, id, type, system) {
    let modifiers = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : [];
    return storedCharacterToProps(formDataToStoredCharacter(formData, id, type, system, modifiers));
}
function characterPropsToDomain(props) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$character$2f$Character$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Character"].create(props);
}
function getResolvedStatsForCharacter(props) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveStats"])(props.baseStats, props.modifiers);
}
function isLegacyStoredCharacter(char) {
    if (!char || typeof char !== "object") {
        return false;
    }
    const record = char;
    const hasNewShape = "resources" in record && "systemData" in record && typeof record.resources === "object" && record.resources !== null;
    if (hasNewShape) {
        return false;
    }
    return "hp" in record || "attributes" in record || "name" in record && !("systemData" in record);
}
function migrateLegacyToStored(legacy) {
    var _legacy_id;
    const id = String((_legacy_id = legacy.id) !== null && _legacy_id !== void 0 ? _legacy_id : crypto.randomUUID());
    var _ref;
    const type = (_ref = legacy.type) !== null && _ref !== void 0 ? _ref : "player";
    var _ref1;
    const system = (_ref1 = legacy.system) !== null && _ref1 !== void 0 ? _ref1 : "dnd";
    var _ref2;
    const modifiers = (_ref2 = legacy.modifiers) !== null && _ref2 !== void 0 ? _ref2 : [];
    const { id: _id, type: _type, system: _system, baseStats, modifiers: _mods, ...formFields } = legacy;
    const formData = {
        ...formFields,
        name: legacy.name,
        language: legacy.language,
        hp: legacy.hp,
        maxHp: legacy.maxHp,
        ac: legacy.ac,
        attributes: legacy.attributes
    };
    const stored = formDataToStoredCharacter(formData, id, type, system, modifiers);
    if (baseStats && typeof baseStats === "object") {
        stored.baseStats = {
            ...stored.baseStats,
            ...baseStats
        };
    }
    if (!stored.grants) {
        stored.grants = [];
    }
    if (typeof legacy.hp === "number") {
        stored.resources.hp = legacy.hp;
    }
    return stored;
}
function normalizeStoredCharacter(char) {
    if (isLegacyStoredCharacter(char)) {
        return migrateLegacyToStored(char);
    }
    const stored = char;
    if (!stored.resources || !stored.systemData) {
        return migrateLegacyToStored(stored);
    }
    // Backfill the language field for characters persisted before i18n support.
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLocale"])(stored.language)) {
        var _stored_grants, _stored_selections;
        return {
            ...stored,
            language: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_LOCALE"],
            grants: (_stored_grants = stored.grants) !== null && _stored_grants !== void 0 ? _stored_grants : [],
            selections: (_stored_selections = stored.selections) !== null && _stored_selections !== void 0 ? _stored_selections : {
                choices: {}
            }
        };
    }
    if (!stored.selections) {
        var _stored_grants1, _stored_systemData;
        return {
            ...stored,
            grants: (_stored_grants1 = stored.grants) !== null && _stored_grants1 !== void 0 ? _stored_grants1 : [],
            selections: buildSelectionsFromForm((_stored_systemData = stored.systemData) !== null && _stored_systemData !== void 0 ? _stored_systemData : {})
        };
    }
    if (!stored.grants) {
        return {
            ...stored,
            grants: []
        };
    }
    return stored;
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/presetStats.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <locals>");
}),
"[project]/packages/content/src/open5e/open5e.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/open5e/open5e.client.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "fetchAllRaces": ()=>fetchAllRaces,
    "fetchAllSpells": ()=>fetchAllSpells
});
const OPEN5E_BASE_URL = "https://api.open5e.com/v1";
async function fetchAllPages(initialUrl) {
    const results = [];
    let url = initialUrl;
    while(url){
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Open5e request failed (".concat(response.status, ") for ").concat(url));
        }
        const page = await response.json();
        results.push(...page.results);
        url = page.next;
    }
    return results;
}
function fetchAllRaces() {
    return fetchAllPages("".concat(OPEN5E_BASE_URL, "/races/?limit=50"));
}
function fetchAllSpells() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const params = new URLSearchParams({
        limit: "50"
    });
    if (options.levelInt !== undefined) {
        params.set("level_int", String(options.levelInt));
    }
    return fetchAllPages("".concat(OPEN5E_BASE_URL, "/spells/?").concat(params.toString()));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/spell/spell.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/spell/spell.mapper.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "mapOpen5eSpell": ()=>mapOpen5eSpell
});
function mapOpen5eSpell(api) {
    var _api_spell_lists, _api_document__slug;
    return {
        slug: api.slug,
        language: "en",
        name: api.name,
        levelInt: api.level_int,
        level: api.level,
        school: api.school,
        castingTime: api.casting_time,
        range: api.range,
        components: api.components,
        duration: api.duration,
        requiresConcentration: api.requires_concentration,
        canBeCastAsRitual: api.can_be_cast_as_ritual,
        description: api.desc,
        higherLevel: api.higher_level,
        spellLists: (_api_spell_lists = api.spell_lists) !== null && _api_spell_lists !== void 0 ? _api_spell_lists : [],
        sourceDocument: (_api_document__slug = api.document__slug) !== null && _api_document__slug !== void 0 ? _api_document__slug : ""
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/grant/grant.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/grant/grants.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "abilityScoreGrantsToModifiers": ()=>abilityScoreGrantsToModifiers,
    "choiceGrantToCharacterGrant": ()=>choiceGrantToCharacterGrant,
    "countLanguageChoices": ()=>countLanguageChoices,
    "fixedGrantsToCharacterGrants": ()=>fixedGrantsToCharacterGrants,
    "resolveGrantPool": ()=>resolveGrantPool,
    "resolveLanguagePool": ()=>resolveLanguagePool,
    "resolveSpellPool": ()=>resolveSpellPool
});
const GRANT_TYPE_TO_KIND = {
    ability: "ability",
    skill_proficiency: "proficiency",
    weapon_proficiency: "proficiency",
    tool_proficiency: "proficiency",
    armor_proficiency: "proficiency",
    saving_throw_proficiency: "saving_throw",
    language: "language",
    spell: "spell"
};
function grantKindFromType(grantType) {
    if (grantType === "ability_score") {
        return null;
    }
    return GRANT_TYPE_TO_KIND[grantType];
}
function abilityScoreGrantsToModifiers(grants, sourceId) {
    return grants.filter((grant)=>grant.grantType === "ability_score" && grant.choose === 0 && grant.targetStat !== undefined && grant.amount !== undefined).map((grant)=>({
            id: "race-".concat(sourceId, "-").concat(grant.targetStat),
            stat: grant.targetStat,
            operation: "add",
            value: grant.amount,
            source: {
                type: "race",
                id: sourceId
            },
            duration: {
                type: "permanent"
            },
            stacking: "stack",
            priority: 0
        }));
}
function optionToGrant(option, grant, source, index) {
    const kindFromGrantType = grantKindFromType(grant.grantType);
    const kind = kindFromGrantType !== null && kindFromGrantType !== void 0 ? kindFromGrantType : option.optionType === "spell" ? "spell" : option.optionType === "language" ? "language" : "proficiency";
    return {
        id: "".concat(source.type, "-").concat(source.id, "-").concat(grant.grantType, "-").concat(option.ref, "-").concat(index),
        kind,
        ref: option.ref,
        source
    };
}
function fixedGrantsToCharacterGrants(grants, source) {
    const result = [];
    for (const grant of grants){
        if (grant.choose !== 0) {
            continue;
        }
        const kind = grantKindFromType(grant.grantType);
        if (!kind) {
            continue;
        }
        if (grant.options && grant.options.length > 0) {
            grant.options.forEach((option, index)=>{
                const characterGrant = optionToGrant(option, grant, source, index);
                if ("TURBOPACK compile-time truthy", 1) {
                    result.push(characterGrant);
                }
            });
            continue;
        }
        if (grant.grantType === "ability" && grant.description) {
            result.push({
                id: "".concat(source.type, "-").concat(source.id, "-ability-").concat(result.length),
                kind: "ability",
                ref: grant.description,
                source,
                name: grant.description
            });
        }
    }
    return result;
}
function countLanguageChoices(grants) {
    return grants.filter((grant)=>grant.grantType === "language" && grant.choose > 0).reduce((total, grant)=>total + grant.choose, 0);
}
function resolveLanguagePool(grant, languages) {
    var _grant_selectionFilter;
    if (grant.grantType !== "language") {
        return [];
    }
    if (grant.options && grant.options.length > 0) {
        const refs = new Set(grant.options.filter((option)=>option.optionType === "language").map((option)=>option.ref));
        return languages.filter((language)=>refs.has(language.slug));
    }
    if ((_grant_selectionFilter = grant.selectionFilter) === null || _grant_selectionFilter === void 0 ? void 0 : _grant_selectionFilter.any) {
        return languages;
    }
    return [];
}
function choiceGrantToCharacterGrant(grant, source, choiceKey, ref, name) {
    const kind = grantKindFromType(grant.grantType);
    if (!kind) {
        return null;
    }
    return {
        id: "".concat(source.type, "-").concat(source.id, "-").concat(choiceKey, "-").concat(ref),
        kind,
        ref,
        source,
        name
    };
}
function resolveSpellPool(filter, spells) {
    return spells.filter((spell)=>{
        if (filter.levelInt !== undefined && spell.levelInt !== filter.levelInt) {
            return false;
        }
        if (filter.spellLists && !filter.spellLists.some((list)=>spell.spellLists.includes(list))) {
            return false;
        }
        return true;
    });
}
function resolveGrantPool(grant, catalog) {
    if (grant.options && grant.options.length > 0) {
        return {
            options: grant.options
        };
    }
    if (grant.grantType === "spell" && grant.selectionFilter) {
        return {
            spells: resolveSpellPool(grant.selectionFilter, catalog.spells)
        };
    }
    if (grant.grantType === "language" && grant.selectionFilter) {
        var _catalog_languages;
        return {
            languages: resolveLanguagePool(grant, (_catalog_languages = catalog.languages) !== null && _catalog_languages !== void 0 ? _catalog_languages : [])
        };
    }
    return {};
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/race/race.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/race/ability.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ABILITY_NAME_TO_STAT_KEY": ()=>ABILITY_NAME_TO_STAT_KEY
});
const ABILITY_NAME_TO_STAT_KEY = {
    Strength: "strength",
    Dexterity: "dexterity",
    Constitution: "constitution",
    Intelligence: "intelligence",
    Wisdom: "wisdom",
    Charisma: "charisma"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/race/trait.parser.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "kebabCase": ()=>kebabCase,
    "parseTraitBlocks": ()=>parseTraitBlocks
});
function kebabCase(input) {
    return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function parseTraitBlocks(markdown) {
    if (!markdown) {
        return [];
    }
    const header = /\*\*_(.+?)_\*\*/g;
    const headers = [];
    let match;
    while((match = header.exec(markdown)) !== null){
        headers.push({
            name: match[1],
            start: match.index,
            end: match.index + match[0].length
        });
    }
    const traits = [];
    for(let i = 0; i < headers.length; i++){
        const rawName = headers[i].name.replace(/\.\s*$/, "").trim();
        const descStart = headers[i].end;
        const descEnd = i + 1 < headers.length ? headers[i + 1].start : markdown.length;
        const description = markdown.slice(descStart, descEnd).trim();
        traits.push({
            slug: kebabCase(rawName),
            name: rawName,
            description
        });
    }
    return traits;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndRaceGrantOverrides": ()=>dndRaceGrantOverrides,
    "dndRaceLevelGrants": ()=>dndRaceLevelGrants
});
const dndRaceLevelGrants = {
    elf: [
        {
            grantType: "language",
            choose: 0,
            options: [
                {
                    optionType: "language",
                    ref: "common"
                },
                {
                    optionType: "language",
                    ref: "elvish"
                }
            ]
        }
    ],
    dwarf: [
        {
            grantType: "language",
            choose: 0,
            options: [
                {
                    optionType: "language",
                    ref: "common"
                },
                {
                    optionType: "language",
                    ref: "dwarvish"
                }
            ]
        }
    ]
};
const dndRaceGrantOverrides = {
    elf: {
        "keen-senses": {
            category: "proficiency",
            grants: [
                {
                    grantType: "skill_proficiency",
                    choose: 0,
                    options: [
                        {
                            optionType: "skill",
                            ref: "perception"
                        }
                    ]
                }
            ]
        },
        "fey-ancestry": {
            category: "resistance",
            grants: [
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Fey Ancestry"
                }
            ]
        }
    },
    "high-elf": {
        "elf-weapon-training": {
            category: "proficiency",
            grants: [
                {
                    grantType: "weapon_proficiency",
                    choose: 0,
                    options: [
                        {
                            optionType: "proficiency",
                            ref: "longsword"
                        },
                        {
                            optionType: "proficiency",
                            ref: "shortsword"
                        },
                        {
                            optionType: "proficiency",
                            ref: "shortbow"
                        },
                        {
                            optionType: "proficiency",
                            ref: "longbow"
                        }
                    ]
                }
            ]
        },
        cantrip: {
            category: "spellcasting",
            grants: [
                {
                    grantType: "spell",
                    choose: 1,
                    selectionFilter: {
                        spellLists: [
                            "wizard"
                        ],
                        levelInt: 0
                    },
                    description: "One cantrip of your choice from the wizard spell list."
                }
            ]
        },
        "extra-language": {
            category: "language",
            grants: [
                {
                    grantType: "language",
                    choose: 1,
                    selectionFilter: {
                        any: true
                    }
                }
            ]
        }
    },
    dwarf: {
        "dwarven-resilience": {
            category: "resistance",
            grants: [
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Dwarven Resilience"
                }
            ]
        },
        "dwarven-combat-training": {
            category: "proficiency",
            grants: [
                {
                    grantType: "weapon_proficiency",
                    choose: 0,
                    options: [
                        {
                            optionType: "proficiency",
                            ref: "battleaxe"
                        },
                        {
                            optionType: "proficiency",
                            ref: "handaxe"
                        },
                        {
                            optionType: "proficiency",
                            ref: "light-hammer"
                        },
                        {
                            optionType: "proficiency",
                            ref: "warhammer"
                        }
                    ]
                }
            ]
        },
        "tool-proficiency": {
            category: "proficiency",
            grants: [
                {
                    grantType: "tool_proficiency",
                    choose: 1,
                    options: [
                        {
                            optionType: "proficiency",
                            ref: "smiths-tools"
                        },
                        {
                            optionType: "proficiency",
                            ref: "brewers-supplies"
                        },
                        {
                            optionType: "proficiency",
                            ref: "masons-tools"
                        }
                    ]
                }
            ]
        }
    },
    "hill-dwarf": {
        "dwarven-toughness": {
            category: "other",
            grants: []
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/race/race.mapper.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "mapOpen5eRace": ()=>mapOpen5eRace
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$ability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/ability.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$trait$2e$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/trait.parser.ts [app-client] (ecmascript)");
;
;
;
function asiToGrants(asi) {
    const grants = [];
    for (const entry of asi !== null && asi !== void 0 ? asi : []){
        for (const attribute of entry.attributes){
            const stat = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$ability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ABILITY_NAME_TO_STAT_KEY"][attribute];
            if (!stat) {
                continue;
            }
            grants.push({
                grantType: "ability_score",
                choose: 0,
                targetStat: stat,
                amount: entry.value
            });
        }
    }
    return grants;
}
function buildAsiTrait(asiDesc, asi) {
    const grants = asiToGrants(asi);
    if (grants.length === 0) {
        return null;
    }
    return {
        slug: "ability-score-increase",
        name: "Ability Score Increase",
        description: asiDesc !== null && asiDesc !== void 0 ? asiDesc : "",
        category: "ability_score",
        grants
    };
}
function buildTraits(markdown, sourceSlug, overrides) {
    var _overrides_sourceSlug;
    const sourceOverrides = (_overrides_sourceSlug = overrides[sourceSlug]) !== null && _overrides_sourceSlug !== void 0 ? _overrides_sourceSlug : {};
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$trait$2e$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseTraitBlocks"])(markdown).map((trait)=>{
        const override = sourceOverrides[trait.slug];
        var _override_category, _override_grants;
        return {
            slug: trait.slug,
            name: trait.name,
            description: trait.description,
            category: (_override_category = override === null || override === void 0 ? void 0 : override.category) !== null && _override_category !== void 0 ? _override_category : "other",
            grants: (_override_grants = override === null || override === void 0 ? void 0 : override.grants) !== null && _override_grants !== void 0 ? _override_grants : []
        };
    });
}
function mapSubrace(api, raceSlug, overrides) {
    const asiTrait = buildAsiTrait(api.asi_desc, api.asi);
    const traits = buildTraits(api.traits, api.slug, overrides);
    return {
        slug: api.slug,
        raceSlug,
        language: "en",
        name: api.name,
        description: api.desc,
        asiDesc: api.asi_desc,
        traits: asiTrait ? [
            asiTrait,
            ...traits
        ] : traits
    };
}
function mapOpen5eRace(api) {
    let overrides = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndRaceGrantOverrides"];
    var _api_speed;
    const asiTrait = buildAsiTrait(api.asi_desc, api.asi);
    const traits = buildTraits(api.traits, api.slug, overrides);
    var _api_document__slug, _api_speed_walk, _api_subraces;
    return {
        slug: api.slug,
        language: "en",
        name: api.name,
        system: "dnd",
        sourceDocument: (_api_document__slug = api.document__slug) !== null && _api_document__slug !== void 0 ? _api_document__slug : "",
        description: api.desc,
        size: api.size_raw,
        speedWalk: (_api_speed_walk = (_api_speed = api.speed) === null || _api_speed === void 0 ? void 0 : _api_speed.walk) !== null && _api_speed_walk !== void 0 ? _api_speed_walk : 0,
        languagesDesc: api.languages,
        visionDesc: api.vision,
        asiDesc: api.asi_desc,
        traits: asiTrait ? [
            asiTrait,
            ...traits
        ] : traits,
        subraces: ((_api_subraces = api.subraces) !== null && _api_subraces !== void 0 ? _api_subraces : []).map((sub)=>mapSubrace(sub, api.slug, overrides))
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/catalog/catalog.types.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/catalog/skills.seed.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndSkills": ()=>dndSkills
});
const dndSkills = [
    {
        slug: "acrobatics",
        name: "Acrobatics",
        ability: "dexterity"
    },
    {
        slug: "animal-handling",
        name: "Animal Handling",
        ability: "wisdom"
    },
    {
        slug: "arcana",
        name: "Arcana",
        ability: "intelligence"
    },
    {
        slug: "athletics",
        name: "Athletics",
        ability: "strength"
    },
    {
        slug: "deception",
        name: "Deception",
        ability: "charisma"
    },
    {
        slug: "history",
        name: "History",
        ability: "intelligence"
    },
    {
        slug: "insight",
        name: "Insight",
        ability: "wisdom"
    },
    {
        slug: "intimidation",
        name: "Intimidation",
        ability: "charisma"
    },
    {
        slug: "investigation",
        name: "Investigation",
        ability: "intelligence"
    },
    {
        slug: "medicine",
        name: "Medicine",
        ability: "wisdom"
    },
    {
        slug: "nature",
        name: "Nature",
        ability: "intelligence"
    },
    {
        slug: "perception",
        name: "Perception",
        ability: "wisdom"
    },
    {
        slug: "performance",
        name: "Performance",
        ability: "charisma"
    },
    {
        slug: "persuasion",
        name: "Persuasion",
        ability: "charisma"
    },
    {
        slug: "religion",
        name: "Religion",
        ability: "intelligence"
    },
    {
        slug: "sleight-of-hand",
        name: "Sleight of Hand",
        ability: "dexterity"
    },
    {
        slug: "stealth",
        name: "Stealth",
        ability: "dexterity"
    },
    {
        slug: "survival",
        name: "Survival",
        ability: "wisdom"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/catalog/savingThrows.seed.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndSavingThrows": ()=>dndSavingThrows
});
const dndSavingThrows = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma"
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/catalog/languages.seed.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndLanguages": ()=>dndLanguages
});
const dndLanguages = [
    {
        slug: "common",
        name: "Common",
        type: "standard",
        script: "Common"
    },
    {
        slug: "dwarvish",
        name: "Dwarvish",
        type: "standard",
        script: "Dwarvish"
    },
    {
        slug: "elvish",
        name: "Elvish",
        type: "standard",
        script: "Elvish"
    },
    {
        slug: "giant",
        name: "Giant",
        type: "standard",
        script: "Dwarvish"
    },
    {
        slug: "gnomish",
        name: "Gnomish",
        type: "standard",
        script: "Dwarvish"
    },
    {
        slug: "goblin",
        name: "Goblin",
        type: "standard",
        script: "Dwarvish"
    },
    {
        slug: "halfling",
        name: "Halfling",
        type: "standard",
        script: "Common"
    },
    {
        slug: "orc",
        name: "Orc",
        type: "standard",
        script: "Dwarvish"
    },
    {
        slug: "abyssal",
        name: "Abyssal",
        type: "exotic",
        script: "Infernal"
    },
    {
        slug: "celestial",
        name: "Celestial",
        type: "exotic",
        script: "Celestial"
    },
    {
        slug: "deep-speech",
        name: "Deep Speech",
        type: "exotic"
    },
    {
        slug: "draconic",
        name: "Draconic",
        type: "exotic",
        script: "Draconic"
    },
    {
        slug: "infernal",
        name: "Infernal",
        type: "exotic",
        script: "Infernal"
    },
    {
        slug: "primordial",
        name: "Primordial",
        type: "exotic",
        script: "Dwarvish"
    },
    {
        slug: "sylvan",
        name: "Sylvan",
        type: "exotic",
        script: "Elvish"
    },
    {
        slug: "undercommon",
        name: "Undercommon",
        type: "exotic",
        script: "Elvish"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/curation/backgroundGrants.dnd.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndBackgrounds": ()=>dndBackgrounds,
    "getBackground": ()=>getBackground,
    "getBackgroundGrants": ()=>getBackgroundGrants,
    "listBackgrounds": ()=>listBackgrounds
});
const dndBackgrounds = [
    {
        slug: "sage",
        name: "Sage",
        description: "You spent years learning the lore of the multiverse. You know two additional languages of your choice.",
        grants: [
            {
                grantType: "language",
                choose: 2,
                selectionFilter: {
                    any: true
                },
                description: "Two languages of your choice."
            },
            {
                grantType: "skill_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "skill",
                        ref: "arcana"
                    },
                    {
                        optionType: "skill",
                        ref: "history"
                    }
                ]
            }
        ]
    }
];
function getBackground(slug) {
    return dndBackgrounds.find((entry)=>entry.slug === slug);
}
function listBackgrounds() {
    return dndBackgrounds;
}
function getBackgroundGrants(slug) {
    var _getBackground;
    var _getBackground_grants;
    return (_getBackground_grants = (_getBackground = getBackground(slug)) === null || _getBackground === void 0 ? void 0 : _getBackground.grants) !== null && _getBackground_grants !== void 0 ? _getBackground_grants : [];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/curation/itemGrants.dnd.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndItems": ()=>dndItems,
    "getItem": ()=>getItem,
    "getItemGrants": ()=>getItemGrants,
    "listItems": ()=>listItems
});
const dndItems = [
    {
        slug: "scroll-of-fire-bolt",
        name: "Scroll of Fire Bolt",
        description: "A scroll containing the Fire Bolt cantrip. Reading it teaches you the spell.",
        grants: [
            {
                grantType: "spell",
                choose: 0,
                options: [
                    {
                        optionType: "spell",
                        ref: "fire-bolt"
                    }
                ]
            }
        ]
    }
];
function getItem(slug) {
    return dndItems.find((entry)=>entry.slug === slug);
}
function listItems() {
    return dndItems;
}
function getItemGrants(slug) {
    var _getItem;
    var _getItem_grants;
    return (_getItem_grants = (_getItem = getItem(slug)) === null || _getItem === void 0 ? void 0 : _getItem.grants) !== null && _getItem_grants !== void 0 ? _getItem_grants : [];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/curation/classGrants.dnd.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "dndClasses": ()=>dndClasses,
    "getClass": ()=>getClass,
    "getClassGrants": ()=>getClassGrants,
    "getClassHitDie": ()=>getClassHitDie,
    "listClasses": ()=>listClasses
});
const dndClasses = [
    {
        slug: "fighter",
        name: "Fighter",
        description: "A master of martial combat, skilled with a variety of weapons and armor.",
        hitDie: 10,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "strength"
                    },
                    {
                        optionType: "proficiency",
                        ref: "constitution"
                    }
                ]
            },
            {
                grantType: "armor_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "light-armor"
                    },
                    {
                        optionType: "proficiency",
                        ref: "medium-armor"
                    },
                    {
                        optionType: "proficiency",
                        ref: "heavy-armor"
                    },
                    {
                        optionType: "proficiency",
                        ref: "shields"
                    }
                ]
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "simple-weapons"
                    },
                    {
                        optionType: "proficiency",
                        ref: "martial-weapons"
                    }
                ]
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    {
                        optionType: "skill",
                        ref: "acrobatics"
                    },
                    {
                        optionType: "skill",
                        ref: "animal-handling"
                    },
                    {
                        optionType: "skill",
                        ref: "athletics"
                    },
                    {
                        optionType: "skill",
                        ref: "history"
                    },
                    {
                        optionType: "skill",
                        ref: "insight"
                    },
                    {
                        optionType: "skill",
                        ref: "intimidation"
                    },
                    {
                        optionType: "skill",
                        ref: "perception"
                    },
                    {
                        optionType: "skill",
                        ref: "survival"
                    }
                ]
            }
        ]
    },
    {
        slug: "wizard",
        name: "Wizard",
        description: "A scholarly magic-user capable of manipulating the structures of reality.",
        hitDie: 6,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "intelligence"
                    },
                    {
                        optionType: "proficiency",
                        ref: "wisdom"
                    }
                ]
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "daggers"
                    },
                    {
                        optionType: "proficiency",
                        ref: "darts"
                    },
                    {
                        optionType: "proficiency",
                        ref: "slings"
                    },
                    {
                        optionType: "proficiency",
                        ref: "quarterstaffs"
                    },
                    {
                        optionType: "proficiency",
                        ref: "light-crossbows"
                    }
                ]
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    {
                        optionType: "skill",
                        ref: "arcana"
                    },
                    {
                        optionType: "skill",
                        ref: "history"
                    },
                    {
                        optionType: "skill",
                        ref: "insight"
                    },
                    {
                        optionType: "skill",
                        ref: "investigation"
                    },
                    {
                        optionType: "skill",
                        ref: "medicine"
                    },
                    {
                        optionType: "skill",
                        ref: "religion"
                    }
                ]
            }
        ]
    },
    {
        slug: "rogue",
        name: "Rogue",
        description: "A scoundrel who uses stealth and trickery to overcome obstacles and enemies.",
        hitDie: 8,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "dexterity"
                    },
                    {
                        optionType: "proficiency",
                        ref: "intelligence"
                    }
                ]
            },
            {
                grantType: "armor_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "light-armor"
                    }
                ]
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "simple-weapons"
                    },
                    {
                        optionType: "proficiency",
                        ref: "hand-crossbows"
                    },
                    {
                        optionType: "proficiency",
                        ref: "longswords"
                    },
                    {
                        optionType: "proficiency",
                        ref: "rapiers"
                    },
                    {
                        optionType: "proficiency",
                        ref: "shortswords"
                    }
                ]
            },
            {
                grantType: "skill_proficiency",
                choose: 4,
                description: "Choose four skills.",
                options: [
                    {
                        optionType: "skill",
                        ref: "acrobatics"
                    },
                    {
                        optionType: "skill",
                        ref: "athletics"
                    },
                    {
                        optionType: "skill",
                        ref: "deception"
                    },
                    {
                        optionType: "skill",
                        ref: "insight"
                    },
                    {
                        optionType: "skill",
                        ref: "intimidation"
                    },
                    {
                        optionType: "skill",
                        ref: "investigation"
                    },
                    {
                        optionType: "skill",
                        ref: "perception"
                    },
                    {
                        optionType: "skill",
                        ref: "performance"
                    },
                    {
                        optionType: "skill",
                        ref: "persuasion"
                    },
                    {
                        optionType: "skill",
                        ref: "sleight-of-hand"
                    },
                    {
                        optionType: "skill",
                        ref: "stealth"
                    }
                ]
            }
        ]
    },
    {
        slug: "cleric",
        name: "Cleric",
        description: "A priestly champion who wields divine magic in service of a higher power.",
        hitDie: 8,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "wisdom"
                    },
                    {
                        optionType: "proficiency",
                        ref: "charisma"
                    }
                ]
            },
            {
                grantType: "armor_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "light-armor"
                    },
                    {
                        optionType: "proficiency",
                        ref: "medium-armor"
                    },
                    {
                        optionType: "proficiency",
                        ref: "shields"
                    }
                ]
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    {
                        optionType: "proficiency",
                        ref: "simple-weapons"
                    }
                ]
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    {
                        optionType: "skill",
                        ref: "history"
                    },
                    {
                        optionType: "skill",
                        ref: "insight"
                    },
                    {
                        optionType: "skill",
                        ref: "medicine"
                    },
                    {
                        optionType: "skill",
                        ref: "persuasion"
                    },
                    {
                        optionType: "skill",
                        ref: "religion"
                    }
                ]
            }
        ]
    }
];
function getClass(slug) {
    return dndClasses.find((entry)=>entry.slug === slug);
}
function listClasses() {
    return dndClasses;
}
function getClassGrants(slug) {
    var _getClass;
    var _getClass_grants;
    return (_getClass_grants = (_getClass = getClass(slug)) === null || _getClass === void 0 ? void 0 : _getClass.grants) !== null && _getClass_grants !== void 0 ? _getClass_grants : [];
}
function getClassHitDie(slug) {
    var _getClass;
    return (_getClass = getClass(slug)) === null || _getClass === void 0 ? void 0 : _getClass.hitDie;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/data/catalog.json (json)": ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"generatedAt\":\"2026-06-13T04:19:58.371Z\",\"source\":\"open5e\",\"defaultLocale\":\"en\",\"races\":[{\"slug\":\"dwarf\",\"language\":\"en\",\"name\":\"Dwarf\",\"system\":\"dnd\",\"sourceDocument\":\"wotc-srd\",\"description\":\"## Dwarf Traits\\nYour dwarf character has an assortment of inborn abilities, part and parcel of dwarven nature.\",\"size\":\"Medium\",\"speedWalk\":25,\"languagesDesc\":\"**_Languages._** You can speak, read, and write Common and Dwarvish.\",\"visionDesc\":\"**_Darkvision._** Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.\",\"asiDesc\":\"**_Ability Score Increase._** Your Constitution score increases by 2.\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Constitution score increases by 2.\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"constitution\",\"amount\":2}]},{\"slug\":\"dwarven-resilience\",\"name\":\"Dwarven Resilience\",\"description\":\"You have advantage on saving throws against poison, and you have resistance against poison damage.\",\"category\":\"resistance\",\"grants\":[{\"grantType\":\"ability\",\"choose\":0,\"description\":\"Dwarven Resilience\"}]},{\"slug\":\"dwarven-combat-training\",\"name\":\"Dwarven Combat Training\",\"description\":\"You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"weapon_proficiency\",\"choose\":0,\"options\":[{\"optionType\":\"proficiency\",\"ref\":\"battleaxe\"},{\"optionType\":\"proficiency\",\"ref\":\"handaxe\"},{\"optionType\":\"proficiency\",\"ref\":\"light-hammer\"},{\"optionType\":\"proficiency\",\"ref\":\"warhammer\"}]}]},{\"slug\":\"tool-proficiency\",\"name\":\"Tool Proficiency\",\"description\":\"You gain proficiency with the artisan's tools of your choice: smith's tools, brewer's supplies, or mason's tools.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"tool_proficiency\",\"choose\":1,\"options\":[{\"optionType\":\"proficiency\",\"ref\":\"smiths-tools\"},{\"optionType\":\"proficiency\",\"ref\":\"brewers-supplies\"},{\"optionType\":\"proficiency\",\"ref\":\"masons-tools\"}]}]},{\"slug\":\"stonecunning\",\"name\":\"Stonecunning\",\"description\":\"Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.\",\"category\":\"other\",\"grants\":[]}],\"subraces\":[{\"slug\":\"hill-dwarf\",\"raceSlug\":\"dwarf\",\"language\":\"en\",\"name\":\"Hill Dwarf\",\"description\":\"As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.\",\"asiDesc\":\"**_Ability Score Increase._** Your Wisdom score increases by 1\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Wisdom score increases by 1\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"wisdom\",\"amount\":1}]},{\"slug\":\"dwarven-toughness\",\"name\":\"Dwarven Toughness\",\"description\":\"Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.\",\"category\":\"other\",\"grants\":[]}]}]},{\"slug\":\"elf\",\"language\":\"en\",\"name\":\"Elf\",\"system\":\"dnd\",\"sourceDocument\":\"wotc-srd\",\"description\":\"## Elf Traits\\nYour elf character has a variety of natural abilities, the result of thousands of years of elven refinement.\",\"size\":\"Medium\",\"speedWalk\":30,\"languagesDesc\":\"**_Languages._** You can speak, read, and write Common and Elvish.\",\"visionDesc\":\"**_Darkvision._** Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.\",\"asiDesc\":\"**_Ability Score Increase._** Your Dexterity score increases by 2.\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Dexterity score increases by 2.\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"dexterity\",\"amount\":2}]},{\"slug\":\"keen-senses\",\"name\":\"Keen Senses\",\"description\":\"You have proficiency in the Perception skill.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"skill_proficiency\",\"choose\":0,\"options\":[{\"optionType\":\"skill\",\"ref\":\"perception\"}]}]},{\"slug\":\"fey-ancestry\",\"name\":\"Fey Ancestry\",\"description\":\"You have advantage on saving throws against being charmed, and magic can't put you to sleep.\",\"category\":\"resistance\",\"grants\":[{\"grantType\":\"ability\",\"choose\":0,\"description\":\"Fey Ancestry\"}]},{\"slug\":\"trance\",\"name\":\"Trance\",\"description\":\"Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day.\",\"category\":\"other\",\"grants\":[]}],\"subraces\":[{\"slug\":\"high-elf\",\"raceSlug\":\"elf\",\"language\":\"en\",\"name\":\"High Elf\",\"description\":\"As a high elf, you have a keen mind and a mastery of at least the basics of magic.\",\"asiDesc\":\"**_Ability Score Increase._** Your Intelligence score increases by 1.\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Intelligence score increases by 1.\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"intelligence\",\"amount\":1}]},{\"slug\":\"elf-weapon-training\",\"name\":\"Elf Weapon Training\",\"description\":\"You have proficiency with the longsword, shortsword, shortbow, and longbow.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"weapon_proficiency\",\"choose\":0,\"options\":[{\"optionType\":\"proficiency\",\"ref\":\"longsword\"},{\"optionType\":\"proficiency\",\"ref\":\"shortsword\"},{\"optionType\":\"proficiency\",\"ref\":\"shortbow\"},{\"optionType\":\"proficiency\",\"ref\":\"longbow\"}]}]},{\"slug\":\"cantrip\",\"name\":\"Cantrip\",\"description\":\"You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.\",\"category\":\"spellcasting\",\"grants\":[{\"grantType\":\"spell\",\"choose\":1,\"selectionFilter\":{\"spellLists\":[\"wizard\"],\"levelInt\":0},\"description\":\"One cantrip of your choice from the wizard spell list.\"}]},{\"slug\":\"extra-language\",\"name\":\"Extra Language\",\"description\":\"You can speak, read, and write one extra language of your choice.\",\"category\":\"language\",\"grants\":[{\"grantType\":\"language\",\"choose\":1,\"selectionFilter\":{\"any\":true}}]}]}]}],\"spells\":[{\"slug\":\"acid-splash\",\"language\":\"en\",\"name\":\"Acid Splash\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Conjuration\",\"castingTime\":\"1 action\",\"range\":\"60 feet\",\"components\":\"V, S\",\"duration\":\"Instantaneous\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a dexterity saving throw or take 1d6 acid damage.\",\"higherLevel\":\"This spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).\",\"spellLists\":[\"sorcerer\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"},{\"slug\":\"fire-bolt\",\"language\":\"en\",\"name\":\"Fire Bolt\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Evocation\",\"castingTime\":\"1 action\",\"range\":\"120 feet\",\"components\":\"V, S\",\"duration\":\"Instantaneous\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage.\",\"higherLevel\":\"This spell's damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10).\",\"spellLists\":[\"sorcerer\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"},{\"slug\":\"light\",\"language\":\"en\",\"name\":\"Light\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Evocation\",\"castingTime\":\"1 action\",\"range\":\"Touch\",\"components\":\"V, M\",\"duration\":\"1 hour\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.\",\"higherLevel\":\"\",\"spellLists\":[\"cleric\",\"bard\",\"sorcerer\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"},{\"slug\":\"mage-hand\",\"language\":\"en\",\"name\":\"Mage Hand\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Conjuration\",\"castingTime\":\"1 action\",\"range\":\"30 feet\",\"components\":\"V, S\",\"duration\":\"1 minute\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"A spectral, floating hand appears at a point you choose within range. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.\",\"higherLevel\":\"\",\"spellLists\":[\"bard\",\"sorcerer\",\"warlock\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"}],\"skills\":[{\"slug\":\"acrobatics\",\"name\":\"Acrobatics\",\"ability\":\"dexterity\"},{\"slug\":\"animal-handling\",\"name\":\"Animal Handling\",\"ability\":\"wisdom\"},{\"slug\":\"arcana\",\"name\":\"Arcana\",\"ability\":\"intelligence\"},{\"slug\":\"athletics\",\"name\":\"Athletics\",\"ability\":\"strength\"},{\"slug\":\"deception\",\"name\":\"Deception\",\"ability\":\"charisma\"},{\"slug\":\"history\",\"name\":\"History\",\"ability\":\"intelligence\"},{\"slug\":\"insight\",\"name\":\"Insight\",\"ability\":\"wisdom\"},{\"slug\":\"intimidation\",\"name\":\"Intimidation\",\"ability\":\"charisma\"},{\"slug\":\"investigation\",\"name\":\"Investigation\",\"ability\":\"intelligence\"},{\"slug\":\"medicine\",\"name\":\"Medicine\",\"ability\":\"wisdom\"},{\"slug\":\"nature\",\"name\":\"Nature\",\"ability\":\"intelligence\"},{\"slug\":\"perception\",\"name\":\"Perception\",\"ability\":\"wisdom\"},{\"slug\":\"performance\",\"name\":\"Performance\",\"ability\":\"charisma\"},{\"slug\":\"persuasion\",\"name\":\"Persuasion\",\"ability\":\"charisma\"},{\"slug\":\"religion\",\"name\":\"Religion\",\"ability\":\"intelligence\"},{\"slug\":\"sleight-of-hand\",\"name\":\"Sleight of Hand\",\"ability\":\"dexterity\"},{\"slug\":\"stealth\",\"name\":\"Stealth\",\"ability\":\"dexterity\"},{\"slug\":\"survival\",\"name\":\"Survival\",\"ability\":\"wisdom\"}],\"languages\":[{\"slug\":\"common\",\"name\":\"Common\",\"type\":\"standard\",\"script\":\"Common\"},{\"slug\":\"dwarvish\",\"name\":\"Dwarvish\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"elvish\",\"name\":\"Elvish\",\"type\":\"standard\",\"script\":\"Elvish\"},{\"slug\":\"giant\",\"name\":\"Giant\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"gnomish\",\"name\":\"Gnomish\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"goblin\",\"name\":\"Goblin\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"halfling\",\"name\":\"Halfling\",\"type\":\"standard\",\"script\":\"Common\"},{\"slug\":\"orc\",\"name\":\"Orc\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"abyssal\",\"name\":\"Abyssal\",\"type\":\"exotic\",\"script\":\"Infernal\"},{\"slug\":\"celestial\",\"name\":\"Celestial\",\"type\":\"exotic\",\"script\":\"Celestial\"},{\"slug\":\"deep-speech\",\"name\":\"Deep Speech\",\"type\":\"exotic\"},{\"slug\":\"draconic\",\"name\":\"Draconic\",\"type\":\"exotic\",\"script\":\"Draconic\"},{\"slug\":\"infernal\",\"name\":\"Infernal\",\"type\":\"exotic\",\"script\":\"Infernal\"},{\"slug\":\"primordial\",\"name\":\"Primordial\",\"type\":\"exotic\",\"script\":\"Dwarvish\"},{\"slug\":\"sylvan\",\"name\":\"Sylvan\",\"type\":\"exotic\",\"script\":\"Elvish\"},{\"slug\":\"undercommon\",\"name\":\"Undercommon\",\"type\":\"exotic\",\"script\":\"Elvish\"}]}"));}),
"[project]/packages/content/data/translations/pt-BR.json (json)": ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"races\":{\"dwarf\":{\"name\":\"Anão\"},\"elf\":{\"name\":\"Elfo\"}},\"spells\":{\"acid-splash\":{\"name\":\"Respingo Ácido\"}}}"));}),
"[project]/packages/content/src/catalog/read.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getLanguage": ()=>getLanguage,
    "getRace": ()=>getRace,
    "getSpell": ()=>getSpell,
    "getSubrace": ()=>getSubrace,
    "listLanguages": ()=>listLanguages,
    "listRaces": ()=>listRaces
});
function applyTranslation(entry, overlay, locale) {
    const translation = overlay === null || overlay === void 0 ? void 0 : overlay[entry.slug];
    if (!translation) {
        return entry;
    }
    var _translation_name, _translation_description;
    return {
        ...entry,
        name: (_translation_name = translation.name) !== null && _translation_name !== void 0 ? _translation_name : entry.name,
        description: (_translation_description = translation.description) !== null && _translation_description !== void 0 ? _translation_description : entry.description,
        language: locale
    };
}
function localizeSubrace(subrace, translations, locale) {
    return applyTranslation(subrace, translations === null || translations === void 0 ? void 0 : translations.subraces, locale);
}
function localizeRace(race, translations, locale) {
    const localized = applyTranslation(race, translations === null || translations === void 0 ? void 0 : translations.races, locale);
    return {
        ...localized,
        subraces: localized.subraces.map((sub)=>localizeSubrace(sub, translations, locale))
    };
}
function listRaces(catalog) {
    let locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : catalog.defaultLocale, translations = arguments.length > 2 ? arguments[2] : void 0;
    if (locale === catalog.defaultLocale || !translations) {
        return catalog.races;
    }
    return catalog.races.map((race)=>localizeRace(race, translations, locale));
}
function getRace(catalog, slug) {
    let locale = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : catalog.defaultLocale, translations = arguments.length > 3 ? arguments[3] : void 0;
    const race = catalog.races.find((entry)=>entry.slug === slug);
    if (!race) {
        return undefined;
    }
    if (locale === catalog.defaultLocale || !translations) {
        return race;
    }
    return localizeRace(race, translations, locale);
}
function getSubrace(catalog, slug) {
    let locale = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : catalog.defaultLocale, translations = arguments.length > 3 ? arguments[3] : void 0;
    for (const race of catalog.races){
        const subrace = race.subraces.find((sub)=>sub.slug === slug);
        if (subrace) {
            if (locale === catalog.defaultLocale || !translations) {
                return subrace;
            }
            return localizeSubrace(subrace, translations, locale);
        }
    }
    return undefined;
}
function getSpell(catalog, slug) {
    let locale = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : catalog.defaultLocale, translations = arguments.length > 3 ? arguments[3] : void 0;
    const spell = catalog.spells.find((entry)=>entry.slug === slug);
    if (!spell) {
        return undefined;
    }
    if (locale === catalog.defaultLocale || !translations) {
        return spell;
    }
    return applyTranslation(spell, translations === null || translations === void 0 ? void 0 : translations.spells, locale);
}
function listLanguages(catalog) {
    return catalog.languages;
}
function getLanguage(catalog, slug) {
    return catalog.languages.find((entry)=>entry.slug === slug);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "catalog": ()=>catalog,
    "getLanguage": ()=>getLanguage,
    "getRace": ()=>getRace,
    "getSpell": ()=>getSpell,
    "getSubrace": ()=>getSubrace,
    "listLanguages": ()=>listLanguages,
    "listRaces": ()=>listRaces
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$data$2f$catalog$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/packages/content/data/catalog.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$data$2f$translations$2f$pt$2d$BR$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/packages/content/data/translations/pt-BR.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/read.ts [app-client] (ecmascript)");
;
;
;
const catalog = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$data$2f$catalog$2e$json__$28$json$29$__["default"];
/**
 * Locale overlays bundled alongside the base (English) catalog. The base catalog
 * needs no entry here; only languages we translate into are listed.
 */ const translationsByLocale = {
    "pt-BR": __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$data$2f$translations$2f$pt$2d$BR$2e$json__$28$json$29$__["default"]
};
function overlayFor(locale) {
    return translationsByLocale[locale];
}
function listRaces() {
    let locale = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : catalog.defaultLocale;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaces"](catalog, locale, overlayFor(locale));
}
function getRace(slug) {
    let locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : catalog.defaultLocale;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"](catalog, slug, locale, overlayFor(locale));
}
function getSubrace(slug) {
    let locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : catalog.defaultLocale;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSubrace"](catalog, slug, locale, overlayFor(locale));
}
function getSpell(slug) {
    let locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : catalog.defaultLocale;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSpell"](catalog, slug, locale, overlayFor(locale));
}
function listLanguages() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLanguages"](catalog);
}
function getLanguage(slug) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLanguage"](catalog, slug);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/index.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$open5e$2f$open5e$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/open5e/open5e.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$open5e$2f$open5e$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/open5e/open5e.client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$spell$2f$spell$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/spell/spell.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$spell$2f$spell$2e$mapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/spell/spell.mapper.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grant$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/grant/grant.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/grant/grants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$race$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/race.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$ability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/ability.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$trait$2e$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/trait.parser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$race$2e$mapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/race.mapper.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$catalog$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/catalog.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$skills$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/skills.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$savingThrows$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/savingThrows.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$languages$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/languages.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/backgroundGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/itemGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/classGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$open5e$2f$open5e$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/open5e/open5e.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$open5e$2f$open5e$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/open5e/open5e.client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$spell$2f$spell$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/spell/spell.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$spell$2f$spell$2e$mapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/spell/spell.mapper.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grant$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/grant/grant.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/grant/grants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$race$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/race.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$ability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/ability.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$trait$2e$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/trait.parser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$race$2f$race$2e$mapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/race/race.mapper.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$catalog$2e$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/catalog.types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$skills$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/skills.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$savingThrows$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/savingThrows.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$languages$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/languages.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/backgroundGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/itemGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/classGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <locals>");
}),
"[project]/apps/web/lib/catalog/raceCatalog.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getRace": ()=>getRace,
    "getSubrace": ()=>getSubrace,
    "listRaceOptions": ()=>listRaceOptions,
    "listRaces": ()=>listRaces,
    "listSubraceOptions": ()=>listSubraceOptions
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
;
function listRaces(locale) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaces"])(locale);
}
function getRace(slug, locale) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"])(slug, locale);
}
function getSubrace(slug, locale) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSubrace"])(slug, locale);
}
function listRaceOptions(locale) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaces"])(locale).map((race)=>({
            value: race.slug,
            label: race.name
        }));
}
function listSubraceOptions(raceSlug, locale) {
    if (!raceSlug) {
        return [];
    }
    const race = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"])(raceSlug, locale);
    if (!race) {
        return [];
    }
    return race.subraces.map((subrace)=>({
            value: subrace.slug,
            label: subrace.name
        }));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/raceModifiers.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "deriveRaceModifiers": ()=>deriveRaceModifiers
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/grant/grants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/raceCatalog.ts [app-client] (ecmascript)");
;
;
function deriveRaceModifiers(selections, locale) {
    const modifiers = [];
    if (selections.race) {
        const race = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"])(selections.race, locale);
        if (race) {
            const grants = race.traits.flatMap((trait)=>trait.grants);
            modifiers.push(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abilityScoreGrantsToModifiers"])(grants, race.slug));
        }
    }
    if (selections.subrace) {
        const subrace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSubrace"])(selections.subrace, locale);
        if (subrace) {
            const grants = subrace.traits.flatMap((trait)=>trait.grants);
            modifiers.push(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abilityScoreGrantsToModifiers"])(grants, subrace.slug));
        }
    }
    return modifiers;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/grantChoices.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "collectLanguageChoiceGrants": ()=>collectLanguageChoiceGrants,
    "collectNonLanguageChoiceGrants": ()=>collectNonLanguageChoiceGrants,
    "collectPendingChoiceGrants": ()=>collectPendingChoiceGrants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/grant/grants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/raceCatalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/backgroundGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/itemGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/classGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)");
;
;
;
;
function expandChoiceGrant(grant, source, grantIndex, traitName) {
    var _grant_description;
    if (grant.choose <= 0) {
        return [];
    }
    const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveGrantPool"])(grant, {
        spells: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["catalog"].spells,
        languages: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLanguages"])()
    });
    let options = [];
    if (pool.languages) {
        options = pool.languages.map((language)=>({
                value: language.slug,
                label: language.name
            }));
    } else if (pool.spells) {
        options = pool.spells.map((spell)=>({
                value: spell.slug,
                label: spell.name
            }));
    } else if (pool.options) {
        const skillNames = new Map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["catalog"].skills.map((skill)=>[
                skill.slug,
                skill.name
            ]));
        options = pool.options.map((option)=>{
            var _skillNames_get;
            return {
                value: option.ref,
                label: option.optionType === "skill" ? (_skillNames_get = skillNames.get(option.ref)) !== null && _skillNames_get !== void 0 ? _skillNames_get : option.ref : option.ref
            };
        });
    }
    const label = ((_grant_description = grant.description) === null || _grant_description === void 0 ? void 0 : _grant_description.trim()) || traitName || "".concat(grant.grantType, " choice");
    const results = [];
    for(let slot = 0; slot < grant.choose; slot++){
        const key = grant.grantType === "language" ? "".concat(source.type, ":").concat(source.id, ":language:").concat(grantIndex, ":").concat(slot) : "".concat(source.type, ":").concat(source.id, ":").concat(grant.grantType, ":").concat(grantIndex, ":").concat(slot);
        results.push({
            key,
            grant,
            source,
            label: grant.choose > 1 ? "".concat(label, " (").concat(slot + 1, "/").concat(grant.choose, ")") : label,
            options
        });
    }
    return results;
}
function collectFromTraits(traits, source) {
    const pending = [];
    traits.forEach((trait)=>{
        trait.grants.forEach((grant, grantIndex)=>{
            pending.push(...expandChoiceGrant(grant, source, grantIndex, trait.name));
        });
    });
    return pending;
}
function collectFromGrants(grants, source) {
    const pending = [];
    grants.forEach((grant, grantIndex)=>{
        pending.push(...expandChoiceGrant(grant, source, grantIndex, ""));
    });
    return pending;
}
function collectPendingChoiceGrants(selections, context, locale) {
    const pending = [];
    if (selections.race) {
        const race = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"])(selections.race, locale);
        var _dndRaceLevelGrants_selections_race;
        const raceLevelGrants = (_dndRaceLevelGrants_selections_race = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndRaceLevelGrants"][selections.race]) !== null && _dndRaceLevelGrants_selections_race !== void 0 ? _dndRaceLevelGrants_selections_race : [];
        pending.push(...collectFromGrants(raceLevelGrants, {
            type: "race",
            id: selections.race
        }));
        if (race) {
            pending.push(...collectFromTraits(race.traits, {
                type: "race",
                id: selections.race
            }));
        }
    }
    if (selections.subrace) {
        const subrace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSubrace"])(selections.subrace, locale);
        if (subrace) {
            pending.push(...collectFromTraits(subrace.traits, {
                type: "race",
                id: selections.subrace
            }));
        }
    }
    if (context.background) {
        pending.push(...collectFromGrants((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBackgroundGrants"])(context.background), {
            type: "background",
            id: context.background
        }));
    }
    if (context.startingItem) {
        pending.push(...collectFromGrants((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getItemGrants"])(context.startingItem), {
            type: "item",
            id: context.startingItem
        }));
    }
    if (context.characterClass) {
        pending.push(...collectFromGrants((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClassGrants"])(context.characterClass), {
            type: "class",
            id: context.characterClass
        }));
    }
    return pending;
}
function collectLanguageChoiceGrants(selections, context, locale) {
    return collectPendingChoiceGrants(selections, context, locale).filter((choice)=>choice.grant.grantType === "language");
}
function collectNonLanguageChoiceGrants(selections, context, locale) {
    return collectPendingChoiceGrants(selections, context, locale).filter((choice)=>choice.grant.grantType !== "language");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/characterGrants.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "deriveCharacterGrants": ()=>deriveCharacterGrants,
    "getFixedLanguageGrants": ()=>getFixedLanguageGrants,
    "getLanguageBudget": ()=>getLanguageBudget,
    "grantContextFromForm": ()=>grantContextFromForm
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/grant/grants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/backgroundGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/itemGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/classGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/raceCatalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/grantChoices.ts [app-client] (ecmascript)");
;
;
;
function collectGrantSources(selections, context, locale) {
    const sources = [];
    if (selections.race) {
        const race = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"])(selections.race, locale);
        var _dndRaceLevelGrants_selections_race;
        const raceLevelGrants = (_dndRaceLevelGrants_selections_race = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndRaceLevelGrants"][selections.race]) !== null && _dndRaceLevelGrants_selections_race !== void 0 ? _dndRaceLevelGrants_selections_race : [];
        var _race_traits_flatMap;
        const traitGrants = (_race_traits_flatMap = race === null || race === void 0 ? void 0 : race.traits.flatMap((trait)=>trait.grants)) !== null && _race_traits_flatMap !== void 0 ? _race_traits_flatMap : [];
        sources.push({
            source: {
                type: "race",
                id: selections.race
            },
            grants: [
                ...raceLevelGrants,
                ...traitGrants
            ]
        });
    }
    if (selections.subrace) {
        const subrace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSubrace"])(selections.subrace, locale);
        if (subrace) {
            sources.push({
                source: {
                    type: "race",
                    id: selections.subrace
                },
                grants: subrace.traits.flatMap((trait)=>trait.grants)
            });
        }
    }
    if (context.background) {
        sources.push({
            source: {
                type: "background",
                id: context.background
            },
            grants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBackgroundGrants"])(context.background)
        });
    }
    if (context.startingItem) {
        sources.push({
            source: {
                type: "item",
                id: context.startingItem
            },
            grants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getItemGrants"])(context.startingItem)
        });
    }
    if (context.characterClass) {
        sources.push({
            source: {
                type: "class",
                id: context.characterClass
            },
            grants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClassGrants"])(context.characterClass)
        });
    }
    return sources;
}
function resolveChoiceGrant(pending, ref, locale) {
    var _getLanguage, _getSpell;
    const name = pending.grant.grantType === "language" ? (_getLanguage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLanguage"])(ref)) === null || _getLanguage === void 0 ? void 0 : _getLanguage.name : pending.grant.grantType === "spell" ? (_getSpell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSpell"])(ref, locale)) === null || _getSpell === void 0 ? void 0 : _getSpell.name : ref;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["choiceGrantToCharacterGrant"])(pending.grant, pending.source, pending.key, ref, name);
}
function resolveChoiceGrants(selections, context, locale) {
    var _ref;
    const grantPicks = (_ref = selections.choices.grantPicks) !== null && _ref !== void 0 ? _ref : {};
    const pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collectPendingChoiceGrants"])(selections, context, locale);
    const resolved = [];
    for (const choice of pending){
        const ref = grantPicks[choice.key];
        if (!ref) {
            continue;
        }
        const grant = resolveChoiceGrant(choice, ref, locale);
        if (grant) {
            resolved.push(grant);
        }
    }
    return resolved;
}
function getLanguageBudget(selections, context, locale) {
    const sources = collectGrantSources(selections, context, locale);
    const allGrants = sources.flatMap((entry)=>entry.grants);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["countLanguageChoices"])(allGrants);
}
function getFixedLanguageGrants(selections, context, locale) {
    const sources = collectGrantSources(selections, context, locale);
    const grants = [];
    for (const entry of sources){
        const languageGrants = entry.grants.filter((grant)=>grant.grantType === "language" && grant.choose === 0);
        grants.push(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixedGrantsToCharacterGrants"])(languageGrants, entry.source).map((grant)=>{
            var _getLanguage;
            var _getLanguage_name;
            return {
                ...grant,
                name: (_getLanguage_name = (_getLanguage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLanguage"])(grant.ref)) === null || _getLanguage === void 0 ? void 0 : _getLanguage.name) !== null && _getLanguage_name !== void 0 ? _getLanguage_name : grant.name
            };
        }));
    }
    return grants;
}
function deriveCharacterGrants(selections, context, locale) {
    const sources = collectGrantSources(selections, context, locale);
    const fixedGrants = sources.flatMap((entry)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$grant$2f$grants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixedGrantsToCharacterGrants"])(entry.grants, entry.source).map((grant)=>{
            if (grant.kind === "language") {
                var _getLanguage;
                var _getLanguage_name;
                return {
                    ...grant,
                    name: (_getLanguage_name = (_getLanguage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLanguage"])(grant.ref)) === null || _getLanguage === void 0 ? void 0 : _getLanguage.name) !== null && _getLanguage_name !== void 0 ? _getLanguage_name : grant.name
                };
            }
            if (grant.kind === "spell") {
                var _getSpell;
                var _getSpell_name;
                return {
                    ...grant,
                    name: (_getSpell_name = (_getSpell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSpell"])(grant.ref, locale)) === null || _getSpell === void 0 ? void 0 : _getSpell.name) !== null && _getSpell_name !== void 0 ? _getSpell_name : grant.name
                };
            }
            return grant;
        }));
    const choiceGrants = resolveChoiceGrants(selections, context, locale);
    return [
        ...fixedGrants,
        ...choiceGrants
    ];
}
function grantContextFromForm(formData) {
    return {
        background: typeof formData.background === "string" && formData.background.trim() ? formData.background : undefined,
        startingItem: typeof formData.startingItem === "string" && formData.startingItem.trim() ? formData.startingItem : undefined,
        characterClass: typeof formData.characterClass === "string" && formData.characterClass.trim() ? formData.characterClass : undefined
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/catalog/grantCatalog.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getClassHitDie": ()=>getClassHitDie,
    "getLanguage": ()=>getLanguage,
    "getSkill": ()=>getSkill,
    "listBackgroundOptions": ()=>listBackgroundOptions,
    "listClassOptions": ()=>listClassOptions,
    "listLanguageOptions": ()=>listLanguageOptions,
    "listLanguages": ()=>listLanguages,
    "listSavingThrows": ()=>listSavingThrows,
    "listSkills": ()=>listSkills,
    "listStartingItemOptions": ()=>listStartingItemOptions
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/backgroundGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/itemGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/classGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$skills$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/skills.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$savingThrows$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/savingThrows.seed.ts [app-client] (ecmascript)");
;
;
;
;
;
function listLanguages() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLanguages"])();
}
function getLanguage(slug) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLanguage"])(slug);
}
function listLanguageOptions() {
    return listLanguages().map((language)=>({
            value: language.slug,
            label: language.name
        }));
}
function listBackgroundOptions() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listBackgrounds"])().map((background)=>({
            value: background.slug,
            label: background.name
        }));
}
function listStartingItemOptions() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listItems"])().map((item)=>({
            value: item.slug,
            label: item.name
        }));
}
function listClassOptions() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listClasses"])().map((characterClass)=>({
            value: characterClass.slug,
            label: characterClass.name
        }));
}
function getClassHitDie(slug) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$classGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClassHitDie"])(slug);
}
function listSkills() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$skills$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndSkills"];
}
function getSkill(slug) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$skills$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndSkills"].find((skill)=>skill.slug === slug);
}
function listSavingThrows() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$savingThrows$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dndSavingThrows"];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/hp.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "buildHpDerivationContextFromForm": ()=>buildHpDerivationContextFromForm,
    "deriveMaxHp": ()=>deriveMaxHp,
    "deriveMaxHpFromForm": ()=>deriveMaxHpFromForm,
    "getHpRules": ()=>getHpRules,
    "isMaxHpEmpty": ()=>isMaxHpEmpty,
    "resolveConstitutionFromForm": ()=>resolveConstitutionFromForm
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/grantCatalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/raceModifiers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/presetStats.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.resolver.ts [app-client] (ecmascript)");
;
;
;
;
;
;
function getHpRules(system) {
    var _presets_system_presetData, _presets_system;
    return (_presets_system = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["presets"][system]) === null || _presets_system === void 0 ? void 0 : (_presets_system_presetData = _presets_system.presetData) === null || _presets_system_presetData === void 0 ? void 0 : _presets_system_presetData.hpRules;
}
function deriveMaxHp(system, ctx) {
    const rules = getHpRules(system);
    if (!rules) {
        return undefined;
    }
    return rules.deriveMaxHp(ctx);
}
function coerceLevel(value) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 1) {
        return Math.floor(value);
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed >= 1) {
            return Math.floor(parsed);
        }
    }
    return undefined;
}
function coerceClassSlug(value) {
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
    }
    return undefined;
}
function resolveConstitutionFromForm(formData, system, locale) {
    const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formData);
    const raceModifiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveRaceModifiers"])(selections, locale);
    const baseStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBaseStatsFromForm"])(formData, system);
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$resolver$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveStats"])(baseStats, raceModifiers);
    return resolved.constitution;
}
function buildHpDerivationContextFromForm(formData, system, locale) {
    const level = coerceLevel(formData.level);
    const classSlug = coerceClassSlug(formData.characterClass);
    if (level === undefined || !classSlug) {
        return undefined;
    }
    const hitDie = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClassHitDie"])(classSlug);
    if (!hitDie) {
        return undefined;
    }
    return {
        level,
        constitution: resolveConstitutionFromForm(formData, system, locale),
        classSlug,
        hitDie
    };
}
function deriveMaxHpFromForm(formData, system, locale) {
    const ctx = buildHpDerivationContextFromForm(formData, system, locale);
    if (!ctx) {
        return undefined;
    }
    return deriveMaxHp(system, ctx);
}
function isMaxHpEmpty(value) {
    return value === undefined || value === null || value === "";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/store/useContentLocale.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useContentLocale": ()=>useContentLocale
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/i18n/locale.ts [app-client] (ecmascript)");
;
;
;
const useContentLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        contentLocale: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_LOCALE"],
        setContentLocale: (locale)=>set({
                contentLocale: locale
            })
    }), {
    name: "content-locale",
    merge: (persisted, current)=>{
        const state = persisted;
        return {
            ...current,
            contentLocale: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLocale"])(state === null || state === void 0 ? void 0 : state.contentLocale) ? state.contentLocale : current.contentLocale
        };
    }
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/store/useCharacterStore.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useCharacterStore": ()=>useCharacterStore
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/presetStats.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/raceModifiers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterGrants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/hp.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useContentLocale.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/modifiers/modifier.utils.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
const createStoredCharacter = (formData, type, system)=>{
    const id = crypto.randomUUID();
    const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formData);
    const contentLocale = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"].getState().contentLocale;
    const modifiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveRaceModifiers"])(selections, contentLocale);
    const grants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveCharacterGrants"])(selections, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["grantContextFromForm"])(formData), contentLocale);
    const processedForm = applyDerivedMaxHp(formData, system, contentLocale);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formDataToStoredCharacter"])(processedForm, id, type, system, modifiers, selections, grants);
};
function applyDerivedMaxHp(formData, system, contentLocale) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMaxHpEmpty"])(formData.maxHp)) {
        return formData;
    }
    const derivedMaxHp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveMaxHpFromForm"])(formData, system, contentLocale);
    if (derivedMaxHp === undefined) {
        return formData;
    }
    const processedForm = {
        ...formData,
        maxHp: derivedMaxHp
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMaxHpEmpty"])(formData.hp)) {
        processedForm.hp = derivedMaxHp;
    }
    return processedForm;
}
function rebuildCharacterFromForm(char, formData) {
    const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formData, char.selections);
    const contentLocale = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"].getState().contentLocale;
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["grantContextFromForm"])(formData);
    const raceModifiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveRaceModifiers"])(selections, contentLocale);
    const preservedModifiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$modifiers$2f$modifier$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeModifiersBySource"])(char.modifiers, {
        type: "race"
    });
    const modifiers = [
        ...preservedModifiers,
        ...raceModifiers
    ];
    const grants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveCharacterGrants"])(selections, context, contentLocale);
    const processedForm = applyDerivedMaxHp(formData, char.system, contentLocale);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formDataToStoredCharacter"])(processedForm, char.id, char.type, char.system, modifiers, selections, grants);
}
const useCharacterStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        characters: [],
        addCharacter: (formData, type, system)=>set((state)=>({
                    characters: [
                        ...state.characters,
                        createStoredCharacter(formData, type, system)
                    ]
                })),
        removeCharacter: (id)=>set((state)=>({
                    characters: state.characters.filter((c)=>c.id !== id)
                })),
        clearCharacters: ()=>set({
                characters: []
            }),
        updateCharacter: (id, formData)=>set((state)=>({
                    characters: state.characters.map((char)=>{
                        if (char.id !== id) return char;
                        return rebuildCharacterFromForm(char, formData);
                    })
                })),
        updateResource: (id, resourceName, delta)=>set((state)=>({
                    characters: state.characters.map((char)=>{
                        if (char.id !== id) return char;
                        var _char_resources_resourceName;
                        const current = (_char_resources_resourceName = char.resources[resourceName]) !== null && _char_resources_resourceName !== void 0 ? _char_resources_resourceName : 0;
                        const max = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getResourceMax"])(char, resourceName);
                        const next = current + delta;
                        const clamped = max !== undefined ? Math.max(0, Math.min(next, max)) : Math.max(0, next);
                        return {
                            ...char,
                            resources: {
                                ...char.resources,
                                [resourceName]: clamped
                            }
                        };
                    })
                })),
        getResolvedStats: (id)=>{
            const char = get().characters.find((c)=>c.id === id);
            if (!char) return undefined;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getResolvedStatsForCharacter"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["storedCharacterToProps"])(char));
        },
        getCharacterProps: (id)=>{
            const char = get().characters.find((c)=>c.id === id);
            if (!char) return undefined;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["storedCharacterToProps"])(char);
        },
        getFormDefaults: (id)=>{
            const char = get().characters.find((c)=>c.id === id);
            if (!char) return undefined;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$presetStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flattenStoredToForm"])(char, char.system);
        }
    }), {
    name: "character-storage",
    merge: (persisted, current)=>{
        const state = persisted;
        if (!(state === null || state === void 0 ? void 0 : state.characters)) return current;
        return {
            ...current,
            characters: state.characters.map((char)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeStoredCharacter"])(char))
        };
    }
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": ()=>cn
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": ()=>Button,
    "buttonVariants": ()=>buttonVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9",
            "icon-sm": "size-8",
            "icon-lg": "size-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button(param) {
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/input.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Input": ()=>Input
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input(param) {
    let { className, type, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/tooltip.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Tooltip": ()=>Tooltip,
    "TooltipContent": ()=>TooltipContent,
    "TooltipProvider": ()=>TooltipProvider,
    "TooltipTrigger": ()=>TooltipTrigger
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-tooltip/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function TooltipProvider(param) {
    let { delayDuration = 0, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        "data-slot": "tooltip-provider",
        delayDuration: delayDuration,
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/tooltip.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = TooltipProvider;
function Tooltip(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TooltipProvider, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
            "data-slot": "tooltip",
            ...props
        }, void 0, false, {
            fileName: "[project]/apps/web/components/ui/tooltip.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/tooltip.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c1 = Tooltip;
function TooltipTrigger(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "tooltip-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/tooltip.tsx",
        lineNumber: 34,
        columnNumber: 10
    }, this);
}
_c2 = TooltipTrigger;
function TooltipContent(param) {
    let { className, sideOffset = 0, children, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "tooltip-content",
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance", className),
            ...props,
            children: [
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Arrow"], {
                    className: "bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                }, void 0, false, {
                    fileName: "[project]/apps/web/components/ui/tooltip.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/components/ui/tooltip.tsx",
            lineNumber: 45,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/tooltip.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c3 = TooltipContent;
;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "TooltipProvider");
__turbopack_context__.k.register(_c1, "Tooltip");
__turbopack_context__.k.register(_c2, "TooltipTrigger");
__turbopack_context__.k.register(_c3, "TooltipContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/HealthSlider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "HealthSlider": ()=>HealthSlider
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slider/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
;
;
;
function HealthSlider(param) {
    let { className, thumbClassName, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full touch-none select-none items-center", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Track"], {
                className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-destructive/70",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Range"], {
                    className: "absolute h-full bg-chart-4/80"
                }, void 0, false, {
                    fileName: "[project]/apps/web/components/ui/HealthSlider.tsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/components/ui/HealthSlider.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Thumb"], {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("block size-3 rounded-full hover:bg-accent-foreground", thumbClassName),
                "aria-label": "Character Health"
            }, void 0, false, {
                fileName: "[project]/apps/web/components/ui/HealthSlider.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/ui/HealthSlider.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = HealthSlider;
var _c;
__turbopack_context__.k.register(_c, "HealthSlider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/iniciative/IniciativeCard.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>IniciativeCard
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucideHeart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as LucideHeart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucideShield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as LucideShield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fa6/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useCharacterStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$HealthSlider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/HealthSlider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
const HP_RESOURCE = "hp";
function IniciativeCard(param) {
    let { character } = param;
    _s();
    const [amount, setAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const updateResource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"])({
        "IniciativeCard.useCharacterStore[updateResource]": (state)=>state.updateResource
    }["IniciativeCard.useCharacterStore[updateResource]"]);
    const getResolvedStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"])({
        "IniciativeCard.useCharacterStore[getResolvedStats]": (state)=>state.getResolvedStats
    }["IniciativeCard.useCharacterStore[getResolvedStats]"]);
    const resolved = getResolvedStats(character.id);
    var _character_resources_HP_RESOURCE;
    const currentHp = (_character_resources_HP_RESOURCE = character.resources[HP_RESOURCE]) !== null && _character_resources_HP_RESOURCE !== void 0 ? _character_resources_HP_RESOURCE : 0;
    var _resolved_hitPoints;
    const maxHp = (_resolved_hitPoints = resolved === null || resolved === void 0 ? void 0 : resolved.hitPoints) !== null && _resolved_hitPoints !== void 0 ? _resolved_hitPoints : 0;
    var _resolved_armorClass;
    const ac = (_resolved_armorClass = resolved === null || resolved === void 0 ? void 0 : resolved.armorClass) !== null && _resolved_armorClass !== void 0 ? _resolved_armorClass : 0;
    let borderColor = "";
    let textColor = "";
    let backgroundColor = "";
    let backgroundColorHover = "";
    function handleHeal() {
        if (amount && amount > 0) {
            updateResource(character.id, HP_RESOURCE, amount);
            setAmount(undefined);
        }
    }
    function handleDamage() {
        if (amount) {
            updateResource(character.id, HP_RESOURCE, -amount);
            setAmount(undefined);
        }
    }
    switch(character.type){
        case "enemy":
            borderColor = "border-red-900";
            textColor = "text-red-700";
            backgroundColor = "bg-chart-2";
            backgroundColorHover = "hover:bg-chart-2/50";
            break;
        case "player":
            borderColor = "border-cyan-900";
            textColor = "text-chart-1";
            backgroundColor = "bg-chart-1";
            backgroundColorHover = "hover:bg-chart-1/50";
            break;
        case "npc":
            borderColor = "border-yellow-800";
            textColor = "text-chart-3";
            backgroundColor = "bg-chart-3";
            backgroundColorHover = "hover:bg-chart-3/50";
            break;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col bg-card rounded-xl p-2 pt-1.5 border border-stone-800",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-row justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-row gap-1 pl-1.5 items-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-semibold",
                            children: character.name
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                            lineNumber: 79,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                        lineNumber: 78,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/characters/".concat(character.type, "/edit/").concat(character.id),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            className: "h-6 w-10 text-card-foreground shadow-2xl ".concat(backgroundColor, " ").concat(backgroundColorHover),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaChevronRight"], {
                                className: "size-3 opacity-70 z-0"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                lineNumber: 83,
                                columnNumber: 128
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                            lineNumber: 83,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                        lineNumber: 82,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                lineNumber: 77,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col mt-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-row gap-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-row items-center gap-2 ml-1 font-semibold",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucideShield$3e$__["LucideShield"], {
                                    className: "size-4 ".concat(textColor)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                    lineNumber: 92,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: ac
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                    lineNumber: 93,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                            lineNumber: 91,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                        lineNumber: 90,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-row justify-between mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-row items-center gap-2 ml-1 font-semibold",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucideHeart$3e$__["LucideHeart"], {
                                        className: "size-4 ".concat(textColor)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                        lineNumber: 100,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            currentHp,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "opacity-50",
                                                children: [
                                                    " / ",
                                                    maxHp
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                lineNumber: 101,
                                                columnNumber: 39
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                        lineNumber: 101,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                lineNumber: 99,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-row gap-1 items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                        delayDuration: 500,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                asChild: true,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    onClick: handleDamage,
                                                    variant: "ghost",
                                                    className: "py-0 size-6 hover:bg-red-950/30",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaMinus"], {
                                                        className: "text-card-foreground"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 37
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                    lineNumber: 109,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                lineNumber: 108,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "Damage"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                    lineNumber: 114,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                lineNumber: 113,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                        lineNumber: 107,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        type: "number",
                                        className: "w-16 py-0 h-6",
                                        value: amount !== null && amount !== void 0 ? amount : '',
                                        onChange: (e)=>{
                                            const newValue = e.target.value;
                                            setAmount(newValue === '' ? undefined : Number(newValue));
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                        lineNumber: 118,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                        delayDuration: 500,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                asChild: true,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    onClick: handleHeal,
                                                    variant: "ghost",
                                                    className: "py-0 size-6",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaPlus"], {
                                                        className: "text-card-foreground"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                        lineNumber: 132,
                                                        columnNumber: 37
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                lineNumber: 130,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "Heal"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                                lineNumber: 135,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                        lineNumber: 129,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                                lineNumber: 104,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                        lineNumber: 98,
                        columnNumber: 17
                    }, this),
                    currentHp > 0 || maxHp > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$HealthSlider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthSlider"], {
                        className: "mt-2 px-1",
                        defaultValue: [
                            currentHp
                        ],
                        max: maxHp,
                        step: 1,
                        value: [
                            currentHp
                        ],
                        onValueChange: (value)=>{
                            const newValue = value[0];
                            const diff = newValue - currentHp;
                            if (diff !== 0) {
                                updateResource(character.id, HP_RESOURCE, diff);
                            }
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                        lineNumber: 145,
                        columnNumber: 21
                    }, this) : ""
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
                lineNumber: 87,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/iniciative/IniciativeCard.tsx",
        lineNumber: 74,
        columnNumber: 9
    }, this);
}
_s(IniciativeCard, "1tVc5t2il2EbWilUexQNH9jOu1E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"]
    ];
});
_c = IniciativeCard;
var _c;
__turbopack_context__.k.register(_c, "IniciativeCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/dropdown-menu.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "DropdownMenu": ()=>DropdownMenu,
    "DropdownMenuCheckboxItem": ()=>DropdownMenuCheckboxItem,
    "DropdownMenuContent": ()=>DropdownMenuContent,
    "DropdownMenuGroup": ()=>DropdownMenuGroup,
    "DropdownMenuItem": ()=>DropdownMenuItem,
    "DropdownMenuLabel": ()=>DropdownMenuLabel,
    "DropdownMenuPortal": ()=>DropdownMenuPortal,
    "DropdownMenuRadioGroup": ()=>DropdownMenuRadioGroup,
    "DropdownMenuRadioItem": ()=>DropdownMenuRadioItem,
    "DropdownMenuSeparator": ()=>DropdownMenuSeparator,
    "DropdownMenuShortcut": ()=>DropdownMenuShortcut,
    "DropdownMenuSub": ()=>DropdownMenuSub,
    "DropdownMenuSubContent": ()=>DropdownMenuSubContent,
    "DropdownMenuSubTrigger": ()=>DropdownMenuSubTrigger,
    "DropdownMenuTrigger": ()=>DropdownMenuTrigger
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRightIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle.js [app-client] (ecmascript) <export default as CircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
function DropdownMenu(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "dropdown-menu",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = DropdownMenu;
function DropdownMenuPortal(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "dropdown-menu-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c1 = DropdownMenuPortal;
function DropdownMenuTrigger(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "dropdown-menu-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c2 = DropdownMenuTrigger;
function DropdownMenuContent(param) {
    let { className, sideOffset = 4, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "dropdown-menu-content",
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_c3 = DropdownMenuContent;
function DropdownMenuGroup(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        "data-slot": "dropdown-menu-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c4 = DropdownMenuGroup;
function DropdownMenuItem(param) {
    let { className, inset, variant = "default", ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        "data-slot": "dropdown-menu-item",
        "data-inset": inset,
        "data-variant": variant,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
_c5 = DropdownMenuItem;
function DropdownMenuCheckboxItem(param) {
    let { className, children, checked, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckboxItem"], {
        "data-slot": "dropdown-menu-checkbox-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        checked: checked,
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                        className: "size-4"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_c6 = DropdownMenuCheckboxItem;
function DropdownMenuRadioGroup(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioGroup"], {
        "data-slot": "dropdown-menu-radio-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
_c7 = DropdownMenuRadioGroup;
function DropdownMenuRadioItem(param) {
    let { className, children, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioItem"], {
        "data-slot": "dropdown-menu-radio-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleIcon$3e$__["CircleIcon"], {
                        className: "size-2 fill-current"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 128,
        columnNumber: 5
    }, this);
}
_c8 = DropdownMenuRadioItem;
function DropdownMenuLabel(param) {
    let { className, inset, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "dropdown-menu-label",
        "data-inset": inset,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 154,
        columnNumber: 5
    }, this);
}
_c9 = DropdownMenuLabel;
function DropdownMenuSeparator(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        "data-slot": "dropdown-menu-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-border -mx-1 my-1 h-px", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
_c10 = DropdownMenuSeparator;
function DropdownMenuShortcut(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "data-slot": "dropdown-menu-shortcut",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground ml-auto text-xs tracking-widest", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 184,
        columnNumber: 5
    }, this);
}
_c11 = DropdownMenuShortcut;
function DropdownMenuSub(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sub"], {
        "data-slot": "dropdown-menu-sub",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 198,
        columnNumber: 10
    }, this);
}
_c12 = DropdownMenuSub;
function DropdownMenuSubTrigger(param) {
    let { className, inset, children, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubTrigger"], {
        "data-slot": "dropdown-menu-sub-trigger",
        "data-inset": inset,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__["ChevronRightIcon"], {
                className: "ml-auto size-4"
            }, void 0, false, {
                fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 210,
        columnNumber: 5
    }, this);
}
_c13 = DropdownMenuSubTrigger;
function DropdownMenuSubContent(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubContent"], {
        "data-slot": "dropdown-menu-sub-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/dropdown-menu.tsx",
        lineNumber: 230,
        columnNumber: 5
    }, this);
}
_c14 = DropdownMenuSubContent;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14;
__turbopack_context__.k.register(_c, "DropdownMenu");
__turbopack_context__.k.register(_c1, "DropdownMenuPortal");
__turbopack_context__.k.register(_c2, "DropdownMenuTrigger");
__turbopack_context__.k.register(_c3, "DropdownMenuContent");
__turbopack_context__.k.register(_c4, "DropdownMenuGroup");
__turbopack_context__.k.register(_c5, "DropdownMenuItem");
__turbopack_context__.k.register(_c6, "DropdownMenuCheckboxItem");
__turbopack_context__.k.register(_c7, "DropdownMenuRadioGroup");
__turbopack_context__.k.register(_c8, "DropdownMenuRadioItem");
__turbopack_context__.k.register(_c9, "DropdownMenuLabel");
__turbopack_context__.k.register(_c10, "DropdownMenuSeparator");
__turbopack_context__.k.register(_c11, "DropdownMenuShortcut");
__turbopack_context__.k.register(_c12, "DropdownMenuSub");
__turbopack_context__.k.register(_c13, "DropdownMenuSubTrigger");
__turbopack_context__.k.register(_c14, "DropdownMenuSubContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/iniciative/IniciativeHeader.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>IniciativeHeader
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$lu$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/lu/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucidePlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as LucidePlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucidePencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as LucidePencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function IniciativeHeader() {
    _s();
    const [position, setPosition] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("Encouter 1");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                asChild: true,
                className: "bg-muted hover:bg-sidebar-accent w-full rounded-lg flex flex-row border p-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-row items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-sidebar-accent text-accent-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$lu$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LuSwords"], {
                                className: "size-4"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 35,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                            lineNumber: 34,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col pl-2 gap-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium text-sm leading-none",
                                    children: "Encouter 1"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                    lineNumber: 38,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs",
                                    children: "Hard"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                    lineNumber: 39,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                            lineNumber: 37,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$lu$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LuChevronsUpDown"], {
                            className: "ml-auto size-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                            lineNumber: 41,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                    lineNumber: 33,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                lineNumber: 32,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                className: "w-(--radix-dropdown-menu-trigger-width)",
                align: "start",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuLabel"], {
                        className: "text-xs opacity-60 font-medium",
                        children: "Active Encounters"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuRadioGroup"], {
                        value: position,
                        onValueChange: setPosition,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuRadioItem"], {
                                value: "Encouter 1",
                                children: "Encouter 1"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 53,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuRadioItem"], {
                                value: "Encouter 2",
                                children: "Encouter 2"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 54,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuRadioItem"], {
                                value: "Encouter 3",
                                children: "Encouter 3"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 55,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                        lineNumber: 52,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {}, void 0, false, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                        lineNumber: 58,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuGroup"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSub"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSubTrigger"], {
                                        children: "Create Player"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                        lineNumber: 63,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuPortal"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSubContent"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "Name"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 67,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "AC"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 68,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "HP"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 69,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "Mod"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 70,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        children: "Add"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 71,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                lineNumber: 66,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                            lineNumber: 65,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                        lineNumber: 64,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 62,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSub"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSubTrigger"], {
                                        children: "Create Enemy"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                        lineNumber: 77,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuPortal"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSubContent"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "Name"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 81,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "AC"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 82,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "HP"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        placeholder: "Mod"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 84,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        children: "Add"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                        lineNumber: 85,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                                lineNumber: 80,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                            lineNumber: 79,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                        lineNumber: 78,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 76,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                        lineNumber: 61,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {}, void 0, false, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                        lineNumber: 92,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuGroup"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-row gap-2 items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucidePlus$3e$__["LucidePlus"], {
                                            className: "ml-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                            lineNumber: 98,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "leading-none",
                                            children: "New Encounter"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                            lineNumber: 99,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                    lineNumber: 97,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 96,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                className: "mt-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-row gap-2 items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LucidePencil$3e$__["LucidePencil"], {
                                            className: "ml-auto size-4"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                            lineNumber: 104,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "leading-none",
                                            children: "Edit Encounter"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                            lineNumber: 105,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                    lineNumber: 103,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                                lineNumber: 102,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                        lineNumber: 95,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
                lineNumber: 46,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/iniciative/IniciativeHeader.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, this);
}
_s(IniciativeHeader, "MfbPnaZ4Dw1FGsiZiwCC6ZubTus=");
_c = IniciativeHeader;
var _c;
__turbopack_context__.k.register(_c, "IniciativeHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/iniciative/Iniciative.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Iniciative
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useCharacterStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$iniciative$2f$IniciativeCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/iniciative/IniciativeCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$iniciative$2f$IniciativeHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/iniciative/IniciativeHeader.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Iniciative() {
    _s();
    const characters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"])({
        "Iniciative.useCharacterStore[characters]": (state)=>state.characters
    }["Iniciative.useCharacterStore[characters]"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$iniciative$2f$IniciativeHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/apps/web/components/iniciative/Iniciative.tsx",
                lineNumber: 12,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 gap-2",
                children: characters.map((character)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$iniciative$2f$IniciativeCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            character: character
                        }, character.id, false, {
                            fileName: "[project]/apps/web/components/iniciative/Iniciative.tsx",
                            lineNumber: 16,
                            columnNumber: 25
                        }, this)
                    }, character.id, false, {
                        fileName: "[project]/apps/web/components/iniciative/Iniciative.tsx",
                        lineNumber: 15,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/components/iniciative/Iniciative.tsx",
                lineNumber: 13,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/iniciative/Iniciative.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, this);
}
_s(Iniciative, "fa/2GC9XqBF1DJYqwURZbA1uJ48=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"]
    ];
});
_c = Iniciative;
var _c;
__turbopack_context__.k.register(_c, "Iniciative");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/navigation-menu.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "NavigationMenu": ()=>NavigationMenu,
    "NavigationMenuContent": ()=>NavigationMenuContent,
    "NavigationMenuIndicator": ()=>NavigationMenuIndicator,
    "NavigationMenuItem": ()=>NavigationMenuItem,
    "NavigationMenuLink": ()=>NavigationMenuLink,
    "NavigationMenuList": ()=>NavigationMenuList,
    "NavigationMenuTrigger": ()=>NavigationMenuTrigger,
    "NavigationMenuViewport": ()=>NavigationMenuViewport,
    "navigationMenuTriggerStyle": ()=>navigationMenuTriggerStyle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-navigation-menu/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
function NavigationMenu(param) {
    let { className, children, viewport = true, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "navigation-menu",
        "data-viewport": viewport,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center bg-sidebar rounded-lg p-1", className),
        ...props,
        children: [
            children,
            viewport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavigationMenuViewport, {}, void 0, false, {
                fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
                lineNumber: 27,
                columnNumber: 20
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = NavigationMenu;
function NavigationMenuList(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["List"], {
        "data-slot": "navigation-menu-list",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("group flex flex-1 list-none items-center justify-center gap-1", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c1 = NavigationMenuList;
function NavigationMenuItem(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        "data-slot": "navigation-menu-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c2 = NavigationMenuItem;
const navigationMenuTriggerStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("group inline-flex h-9 w-max items-center justify-center rounded-md bg-sidebar px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1");
function NavigationMenuTrigger(param) {
    let { className, children, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "navigation-menu-trigger",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(navigationMenuTriggerStyle(), "group", className),
        ...props,
        children: [
            children,
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                className: "relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_c3 = NavigationMenuTrigger;
function NavigationMenuContent(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        "data-slot": "navigation-menu-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto", "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
_c4 = NavigationMenuContent;
function NavigationMenuViewport(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute top-full left-0 isolate z-50 flex justify-center"),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
            "data-slot": "navigation-menu-viewport",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
            lineNumber: 112,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_c5 = NavigationMenuViewport;
function NavigationMenuLink(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Link"], {
        "data-slot": "navigation-menu-link",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4 !font-bold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 129,
        columnNumber: 5
    }, this);
}
_c6 = NavigationMenuLink;
function NavigationMenuIndicator(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$navigation$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
        "data-slot": "navigation-menu-indicator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md"
        }, void 0, false, {
            fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
            lineNumber: 153,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/navigation-menu.tsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
}
_c7 = NavigationMenuIndicator;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "NavigationMenu");
__turbopack_context__.k.register(_c1, "NavigationMenuList");
__turbopack_context__.k.register(_c2, "NavigationMenuItem");
__turbopack_context__.k.register(_c3, "NavigationMenuTrigger");
__turbopack_context__.k.register(_c4, "NavigationMenuContent");
__turbopack_context__.k.register(_c5, "NavigationMenuViewport");
__turbopack_context__.k.register(_c6, "NavigationMenuLink");
__turbopack_context__.k.register(_c7, "NavigationMenuIndicator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/layout/Navbar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Navbar
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fa6/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/navigation-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function Navbar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const isActive = (path)=>pathname === path;
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("nav");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full flex justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenu"], {
            viewport: true,
            className: "md:shadow-2xl",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuList"], {
                className: "flex flex-row items-start",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuItem"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                            asChild: true,
                            className: "p-0 ".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " ").concat(isActive("/") ? "bg-popover" : ""),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaHouse"], {
                                    className: "p-0 text-amber-100"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                    lineNumber: 36,
                                    columnNumber: 44
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                lineNumber: 36,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                            lineNumber: 32,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                        lineNumber: 31,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuItem"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuTrigger"], {
                                className: "font-bold",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUsers"], {
                                        className: "md:hidden text-amber-100"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                        lineNumber: 42,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "hidden md:inline",
                                        children: t("characters")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                        lineNumber: 43,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                lineNumber: 41,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuContent"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "grid gap-4 z-10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                                                asChild: true,
                                                className: "".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " hover:bg-secondary ").concat(isActive("/characters") ? "bg-secondary" : "bg-popover"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/characters",
                                                    children: t("allCharacters")
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                    lineNumber: 52,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                lineNumber: 48,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-[1px] w-full bg-muted my-1"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                lineNumber: 54,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                                                        asChild: true,
                                                        className: "".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " hover:bg-chart-1 ").concat(isActive("/characters/player") ? "bg-chart-1" : "bg-popover"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: "/characters/player",
                                                            children: t("players")
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                            lineNumber: 60,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                        lineNumber: 56,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                                                        asChild: true,
                                                        className: "".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " hover:bg-chart-2 ").concat(isActive("/characters/enemy") ? "bg-char-2" : "bg-popover"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: "/characters/enemy",
                                                            children: t("enemies")
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                            lineNumber: 66,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                        lineNumber: 62,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                                                        asChild: true,
                                                        className: "".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " hover:bg-chart-3 hover:text-foreground ").concat(isActive("/characters/npc") ? "bg-char-3" : "bg-popover"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: "/characters/npc",
                                                            children: t("npcs")
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                            lineNumber: 72,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                        lineNumber: 68,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                                lineNumber: 55,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                        lineNumber: 47,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                    lineNumber: 46,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                lineNumber: 45,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                        lineNumber: 40,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuItem"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                            asChild: true,
                            className: "".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " ").concat(isActive("/encounters") ? "bg-popover" : ""),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/encounters",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaMapLocationDot"], {
                                        className: "md:hidden text-amber-100"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                        lineNumber: 86,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "hidden md:inline",
                                        children: t("encounters")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                        lineNumber: 87,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                lineNumber: 85,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                            lineNumber: 81,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                        lineNumber: 80,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuItem"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                            asChild: true,
                            className: "text-orange-300 ".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " ").concat(isActive("/forge") ? "bg-orange-300 text-black" : ""),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                className: "flex flex-row",
                                href: "/forge",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "hidden md:inline",
                                    children: t("community")
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                    lineNumber: 99,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                lineNumber: 97,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                            lineNumber: 93,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                        lineNumber: 92,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuItem"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationMenuLink"], {
                            asChild: true,
                            className: "".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$navigation$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationMenuTriggerStyle"])(), " ").concat(isActive("/") ? "bg-muted" : ""),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa6$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUser"], {
                                    className: "size-4 text-amber-100"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                    lineNumber: 109,
                                    columnNumber: 44
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                                lineNumber: 109,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                            lineNumber: 105,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                        lineNumber: 104,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/layout/Navbar.tsx",
                lineNumber: 29,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/components/layout/Navbar.tsx",
            lineNumber: 28,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/layout/Navbar.tsx",
        lineNumber: 27,
        columnNumber: 9
    }, this);
}
_s(Navbar, "ubWVzN2Z0wcQh3unbvhqt4fw9Wc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/i18n/data:dac3f6 [app-client] (ecmascript) <text/javascript>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ [{"40e9edd2600933de82b009820a0da313d61ac41668":"setUserLocale"},"apps/web/i18n/locale.ts",""] */ __turbopack_context__.s({
    "setUserLocale": ()=>setUserLocale
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var setUserLocale = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40e9edd2600933de82b009820a0da313d61ac41668", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "setUserLocale"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vbG9jYWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHNlcnZlclwiO1xuXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSBcIm5leHQvaGVhZGVyc1wiO1xuaW1wb3J0IHsgREVGQVVMVF9MT0NBTEUsIGlzTG9jYWxlLCB0eXBlIExvY2FsZSB9IGZyb20gXCJAcnB2L2RvbWFpblwiO1xuXG4vKipcbiAqIFRoZSBVSSBsYW5ndWFnZSBpcyBhIHVzZXIgcHJlZmVyZW5jZSBwZXJzaXN0ZWQgaW4gYSBjb29raWUgKG5vIFVSTCBwcmVmaXgpLlxuICogSXQgaXMgaW50ZW50aW9uYWxseSBpbmRlcGVuZGVudCBmcm9tIHRoZSBjb250ZW50IGxhbmd1YWdlLCB3aGljaCBpcyBhIHByb3BlcnR5XG4gKiBvZiB0aGUgY29udGVudCBpdHNlbGYuXG4gKi9cbmNvbnN0IFVJX0xPQ0FMRV9DT09LSUUgPSBcIk5FWFRfTE9DQUxFXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRVc2VyTG9jYWxlKCk6IFByb21pc2U8TG9jYWxlPiB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBjb29raWVzKCk7XG4gICAgY29uc3QgdmFsdWUgPSBzdG9yZS5nZXQoVUlfTE9DQUxFX0NPT0tJRSk/LnZhbHVlO1xuICAgIHJldHVybiBpc0xvY2FsZSh2YWx1ZSkgPyB2YWx1ZSA6IERFRkFVTFRfTE9DQUxFO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0VXNlckxvY2FsZShsb2NhbGU6IExvY2FsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgY29va2llcygpO1xuICAgIHN0b3JlLnNldChVSV9MT0NBTEVfQ09PS0lFLCBsb2NhbGUpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI4UkFrQnNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/layout/LanguageSwitcher.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>LanguageSwitcher
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/i18n/locale.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$i18n$2f$data$3a$dac3f6__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/apps/web/i18n/data:dac3f6 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useContentLocale.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const LOCALE_LABELS = {
    en: "English",
    "pt-BR": "Português (BR)"
};
const selectClassName = "h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
function LanguageSwitcher() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const uiLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const [isPending, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"])();
    const contentLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"])({
        "LanguageSwitcher.useContentLocale[contentLocale]": (state)=>state.contentLocale
    }["LanguageSwitcher.useContentLocale[contentLocale]"]);
    const setContentLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"])({
        "LanguageSwitcher.useContentLocale[setContentLocale]": (state)=>state.setContentLocale
    }["LanguageSwitcher.useContentLocale[setContentLocale]"]);
    const onUiLocaleChange = (value)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLocale"])(value)) return;
        startTransition(async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$i18n$2f$data$3a$dac3f6__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["setUserLocale"])(value);
            router.refresh();
        });
    };
    const onContentLocaleChange = (value)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLocale"])(value)) return;
        setContentLocale(value);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-row items-center gap-3 text-xs text-muted-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "hidden sm:inline",
                        children: t("uiLanguage")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                        lineNumber: 42,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        "aria-label": t("uiLanguage"),
                        className: selectClassName,
                        value: uiLocale,
                        disabled: isPending,
                        onChange: (event)=>onUiLocaleChange(event.target.value),
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALES"].map((locale)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: locale,
                                children: LOCALE_LABELS[locale]
                            }, locale, false, {
                                fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                                lineNumber: 51,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                        lineNumber: 43,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                lineNumber: 41,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "hidden sm:inline",
                        children: t("contentLanguage")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                        lineNumber: 59,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        "aria-label": t("contentLanguage"),
                        className: selectClassName,
                        value: contentLocale,
                        onChange: (event)=>onContentLocaleChange(event.target.value),
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$i18n$2f$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALES"].map((locale)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: locale,
                                children: LOCALE_LABELS[locale]
                            }, locale, false, {
                                fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                                lineNumber: 67,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                        lineNumber: 60,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
                lineNumber: 58,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/layout/LanguageSwitcher.tsx",
        lineNumber: 40,
        columnNumber: 9
    }, this);
}
_s(LanguageSwitcher, "/CI+f4uCP3Plz69YmMxf4ihGwnw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"]
    ];
});
_c = LanguageSwitcher;
var _c;
__turbopack_context__.k.register(_c, "LanguageSwitcher");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/theme-provider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ThemeProvider": ()=>ThemeProvider
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
"use client";
;
;
function ThemeProvider(param) {
    let { children, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/components/theme-provider.tsx",
        lineNumber: 10,
        columnNumber: 12
    }, this);
}
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_43677610._.js.map