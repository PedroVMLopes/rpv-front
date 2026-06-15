(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/apps/web/lib/schema/zodDynamic.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "createDynamicSchema": ()=>createDynamicSchema
});
function createDynamicSchema(presetSchema, type) {
    const commonSchema = presetSchema.common;
    const typeSchema = presetSchema[type];
    if (!commonSchema) {
        throw new Error("Common schema is missing");
    }
    if (!typeSchema) {
        throw new Error('Schema for type "'.concat(type, '" not found'));
    }
    return commonSchema.extend(typeSchema.shape);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/choiceValidation.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "applyChoiceValidation": ()=>applyChoiceValidation,
    "findMissingRequiredChoices": ()=>findMissingRequiredChoices
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterGrants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/grantChoices.ts [app-client] (ecmascript)");
;
;
;
function readGrantPicks(formData) {
    const choices = formData.choices;
    var _choices_grantPicks;
    return (_choices_grantPicks = choices === null || choices === void 0 ? void 0 : choices.grantPicks) !== null && _choices_grantPicks !== void 0 ? _choices_grantPicks : {};
}
function findMissingRequiredChoices(formData, locale) {
    const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formData);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["grantContextFromForm"])(formData);
    const pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collectPendingChoiceGrants"])(selections, context, locale);
    const grantPicks = readGrantPicks(formData);
    return pending.filter((choice)=>{
        const picked = grantPicks[choice.key];
        return !picked || picked.trim() === "";
    });
}
function applyChoiceValidation(schema, locale) {
    return schema.superRefine((data, ctx)=>{
        const missing = findMissingRequiredChoices(data, locale);
        for (const choice of missing){
            ctx.addIssue({
                code: "custom",
                path: [
                    "choices"
                ],
                message: choice.label
            });
        }
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/abilityScoreGeneration.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "UNASSIGNED_ABILITY_VALUE": ()=>UNASSIGNED_ABILITY_VALUE,
    "applyAbilityScoreValidation": ()=>applyAbilityScoreValidation,
    "getMethodDefaults": ()=>getMethodDefaults,
    "isPointBuyValid": ()=>isPointBuyValid,
    "isRollValid": ()=>isRollValid,
    "isStandardArrayValid": ()=>isStandardArrayValid,
    "pointBuyCost": ()=>pointBuyCost,
    "pointBuyRemaining": ()=>pointBuyRemaining,
    "pointBuySpent": ()=>pointBuySpent,
    "readAttributeValues": ()=>readAttributeValues,
    "rollAbilityPool": ()=>rollAbilityPool,
    "rollAbilityScore": ()=>rollAbilityScore,
    "validateAbilityScoresForMethod": ()=>validateAbilityScoresForMethod
});
const UNASSIGNED_ABILITY_VALUE = 0;
function pointBuyCost(score, config) {
    var _config_cost_score;
    return (_config_cost_score = config.cost[score]) !== null && _config_cost_score !== void 0 ? _config_cost_score : 0;
}
function readAttributeValues(attributes, abilities) {
    const byName = new Map((attributes !== null && attributes !== void 0 ? attributes : []).map((entry)=>{
        var _entry_value;
        return [
            entry.name,
            (_entry_value = entry.value) !== null && _entry_value !== void 0 ? _entry_value : 0
        ];
    }));
    return abilities.map((ability)=>{
        var _byName_get;
        return (_byName_get = byName.get(ability.name)) !== null && _byName_get !== void 0 ? _byName_get : UNASSIGNED_ABILITY_VALUE;
    });
}
function pointBuySpent(values, config) {
    return values.reduce((total, value)=>total + pointBuyCost(value, config), 0);
}
function pointBuyRemaining(values, config) {
    return config.budget - pointBuySpent(values, config);
}
function isPointBuyValid(values, config) {
    if (values.some((value)=>value < config.min || value > config.max)) {
        return false;
    }
    return pointBuySpent(values, config) <= config.budget;
}
function isStandardArrayValid(values, config) {
    if (values.some((value)=>value === UNASSIGNED_ABILITY_VALUE)) {
        return false;
    }
    const expected = [
        ...config.standardArray
    ].sort((a, b)=>a - b);
    const actual = [
        ...values
    ].sort((a, b)=>a - b);
    return expected.length === actual.length && expected.every((value, index)=>value === actual[index]);
}
function countValues(values) {
    const counts = new Map();
    for (const value of values){
        var _counts_get;
        counts.set(value, ((_counts_get = counts.get(value)) !== null && _counts_get !== void 0 ? _counts_get : 0) + 1);
    }
    return counts;
}
function isRollValid(values, rolls, config) {
    if (!rolls || rolls.length !== config.roll.count) {
        return false;
    }
    if (values.some((value)=>value === UNASSIGNED_ABILITY_VALUE)) {
        return false;
    }
    const rollCounts = countValues(rolls);
    const valueCounts = countValues(values);
    if (rollCounts.size !== valueCounts.size) {
        return false;
    }
    for (const [value, count] of valueCounts){
        if (rollCounts.get(value) !== count) {
            return false;
        }
    }
    return true;
}
function rollAbilityScore(config) {
    let rng = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Math.random;
    const rolls = Array.from({
        length: config.dice
    }, ()=>Math.floor(rng() * config.sides) + 1);
    rolls.sort((a, b)=>a - b);
    return rolls.slice(config.drop).reduce((total, value)=>total + value, 0);
}
function rollAbilityPool(config) {
    let rng = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Math.random;
    return Array.from({
        length: config.roll.count
    }, ()=>rollAbilityScore(config.roll, rng));
}
function getMethodDefaults(method, abilities, statConfig) {
    const generation = statConfig.abilityGeneration;
    const defaultValue = method === "point-buy" && generation ? generation.pointBuy.min : method === "manual" ? statConfig.defaultAbilityValue : UNASSIGNED_ABILITY_VALUE;
    return abilities.map((ability)=>({
            name: ability.name,
            value: defaultValue
        }));
}
function readAbilityScoreMethod(formData) {
    const method = formData.abilityScoreMethod;
    if (method === "manual" || method === "standard-array" || method === "point-buy" || method === "roll") {
        return method;
    }
    return "manual";
}
function validateAbilityScoresForMethod(formData, statConfig) {
    const generation = statConfig.abilityGeneration;
    if (!generation) {
        return null;
    }
    const method = readAbilityScoreMethod(formData);
    const values = readAttributeValues(formData.attributes, statConfig.abilities);
    if (method === "manual") {
        return null;
    }
    if (method === "point-buy") {
        return isPointBuyValid(values, generation.pointBuy) ? null : "pointBuyInvalid";
    }
    if (method === "standard-array") {
        return isStandardArrayValid(values, generation) ? null : "standardArrayInvalid";
    }
    if (method === "roll") {
        const rolls = formData.abilityScoreRolls;
        return isRollValid(values, rolls, generation) ? null : "rollInvalid";
    }
    return null;
}
function applyAbilityScoreValidation(schema, statConfig) {
    return schema.superRefine((data, ctx)=>{
        const errorKey = validateAbilityScoresForMethod(data, statConfig);
        if (errorKey) {
            ctx.addIssue({
                code: "custom",
                path: [
                    "attributes"
                ],
                message: errorKey
            });
        }
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/characters/AbilityScoresField.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AbilityScoresField": ()=>AbilityScoresField
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/raceModifiers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/abilityScoreGeneration.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-client] (ecmascript)");
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
function readAttributes(form) {
    var _ref;
    return (_ref = form.watch("attributes")) !== null && _ref !== void 0 ? _ref : [];
}
function writeAttributes(form, attributes) {
    form.setValue("attributes", attributes, {
        shouldDirty: true,
        shouldValidate: true
    });
}
function setAttributeValue(form, abilities, index, value) {
    const current = readAttributes(form);
    const next = abilities.map((ability, abilityIndex)=>{
        var _current_abilityIndex;
        var _current_abilityIndex_value;
        return {
            name: ability.name,
            value: abilityIndex === index ? value : (_current_abilityIndex_value = (_current_abilityIndex = current[abilityIndex]) === null || _current_abilityIndex === void 0 ? void 0 : _current_abilityIndex.value) !== null && _current_abilityIndex_value !== void 0 ? _current_abilityIndex_value : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]
        };
    });
    writeAttributes(form, next);
}
function AbilityScoresField(param) {
    let { form, abilities, statConfig, contentLocale } = param;
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("abilityScores");
    const tAbilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("abilities");
    const config = statConfig.abilityGeneration;
    const formValues = form.watch();
    var _ref;
    const method = (_ref = form.watch("abilityScoreMethod")) !== null && _ref !== void 0 ? _ref : "manual";
    var _ref1;
    const rolls = (_ref1 = form.watch("abilityScoreRolls")) !== null && _ref1 !== void 0 ? _ref1 : [];
    const previousMethodRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(method);
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AbilityScoresField.useEffect": ()=>{
            if (initializedRef.current) {
                return;
            }
            initializedRef.current = true;
            if (!form.getValues("abilityScoreMethod")) {
                form.setValue("abilityScoreMethod", "manual", {
                    shouldDirty: false
                });
            }
            const currentAttributes = form.getValues("attributes");
            if (!currentAttributes || currentAttributes.length === 0) {
                writeAttributes(form, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMethodDefaults"])("manual", abilities, statConfig));
            }
        }
    }["AbilityScoresField.useEffect"], [
        abilities,
        form,
        statConfig
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AbilityScoresField.useEffect": ()=>{
            if (previousMethodRef.current === method) {
                return;
            }
            writeAttributes(form, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMethodDefaults"])(method, abilities, statConfig));
            if (method !== "roll") {
                form.setValue("abilityScoreRolls", undefined, {
                    shouldDirty: true
                });
            }
            previousMethodRef.current = method;
        }
    }["AbilityScoresField.useEffect"], [
        abilities,
        form,
        method,
        statConfig
    ]);
    const attributeValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AbilityScoresField.useMemo[attributeValues]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readAttributeValues"])(readAttributes(form), abilities)
    }["AbilityScoresField.useMemo[attributeValues]"], [
        formValues,
        abilities
    ]);
    const remainingPoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AbilityScoresField.useMemo[remainingPoints]": ()=>{
            if (!config || method !== "point-buy") {
                return null;
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointBuyRemaining"])(attributeValues, config.pointBuy);
        }
    }["AbilityScoresField.useMemo[remainingPoints]"], [
        attributeValues,
        config,
        method
    ]);
    const raceModifiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AbilityScoresField.useMemo[raceModifiers]": ()=>{
            const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formValues);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveRaceModifiers"])(selections, contentLocale);
        }
    }["AbilityScoresField.useMemo[raceModifiers]"], [
        formValues,
        contentLocale
    ]);
    const raceBonusByStat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AbilityScoresField.useMemo[raceBonusByStat]": ()=>{
            const bonuses = new Map();
            for (const modifier of raceModifiers){
                if (modifier.operation !== "add") {
                    continue;
                }
                var _bonuses_get;
                bonuses.set(modifier.stat, ((_bonuses_get = bonuses.get(modifier.stat)) !== null && _bonuses_get !== void 0 ? _bonuses_get : 0) + modifier.value);
            }
            return bonuses;
        }
    }["AbilityScoresField.useMemo[raceBonusByStat]"], [
        raceModifiers
    ]);
    const attributesError = form.formState.errors.attributes;
    if (!config) {
        return null;
    }
    const usedStandardValues = new Set(attributeValues.filter((value)=>value !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]));
    const usedRollValues = countPoolUsage(attributeValues, rolls);
    function handleRoll() {
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollAbilityPool"])(config);
        form.setValue("abilityScoreRolls", pool, {
            shouldDirty: true,
            shouldValidate: true
        });
        writeAttributes(form, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMethodDefaults"])("roll", abilities, statConfig));
    }
    function canIncreasePointBuy(index) {
        const current = attributeValues[index];
        const next = current + 1;
        if (next > config.pointBuy.max) {
            return false;
        }
        const nextValues = attributeValues.map((value, valueIndex)=>valueIndex === index ? next : value);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointBuyRemaining"])(nextValues, config.pointBuy) >= 0;
    }
    function canDecreasePointBuy(index) {
        return attributeValues[index] > config.pointBuy.min;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 border rounded-lg p-4 bg-muted/30",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-bold",
                        children: t("title")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                        lineNumber: 200,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "bg-background rounded border px-2 py-1 text-sm",
                        value: method,
                        onChange: (event)=>form.setValue("abilityScoreMethod", event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true
                            }),
                        children: config.methods.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: entry,
                                children: t("methods.".concat(entry))
                            }, entry, false, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 213,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                        lineNumber: 201,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                lineNumber: 199,
                columnNumber: 13
            }, this),
            method === "point-buy" && remainingPoints !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground",
                children: t("pointsRemaining", {
                    count: remainingPoints
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                lineNumber: 221,
                columnNumber: 17
            }, this),
            method === "roll" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                variant: "outline",
                onClick: handleRoll,
                children: t("roll")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                lineNumber: 227,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                children: abilities.map((ability, index)=>{
                    var _attributeValues_index;
                    const value = (_attributeValues_index = attributeValues[index]) !== null && _attributeValues_index !== void 0 ? _attributeValues_index : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"];
                    var _raceBonusByStat_get;
                    const raceBonus = (_raceBonusByStat_get = raceBonusByStat.get(ability.statKey)) !== null && _raceBonusByStat_get !== void 0 ? _raceBonusByStat_get : 0;
                    const total = value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? null : value + raceBonus;
                    var _ability_label;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2 rounded border p-3 bg-background",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold",
                                children: ability.labelKey ? tAbilities(ability.name) : (_ability_label = ability.label) !== null && _ability_label !== void 0 ? _ability_label : ability.name
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 246,
                                columnNumber: 29
                            }, this),
                            method === "manual" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                type: "number",
                                min: 0,
                                max: 20,
                                value: value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? "" : value,
                                onChange: (event)=>{
                                    const nextValue = event.target.value;
                                    setAttributeValue(form, abilities, index, nextValue === "" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] : Number(nextValue));
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 253,
                                columnNumber: 33
                            }, this),
                            method === "standard-array" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "bg-background rounded border px-2 py-1 text-sm",
                                value: value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? "" : String(value),
                                onChange: (event)=>setAttributeValue(form, abilities, index, event.target.value === "" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] : Number(event.target.value)),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: t("assignScore")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 291,
                                        columnNumber: 37
                                    }, this),
                                    getStandardArrayOptions(config.standardArray, value, usedStandardValues).map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: option,
                                            children: option
                                        }, option, false, {
                                            fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                            lineNumber: 297,
                                            columnNumber: 41
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 273,
                                columnNumber: 33
                            }, this),
                            method === "point-buy" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "button",
                                        variant: "outline",
                                        size: "icon",
                                        disabled: !canDecreasePointBuy(index),
                                        onClick: ()=>setAttributeValue(form, abilities, index, value - 1),
                                        children: "-"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 306,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "min-w-8 text-center font-semibold",
                                        children: value
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 322,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "button",
                                        variant: "outline",
                                        size: "icon",
                                        disabled: !canIncreasePointBuy(index),
                                        onClick: ()=>setAttributeValue(form, abilities, index, value + 1),
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 325,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground",
                                        children: [
                                            "(",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointBuyCost"])(value, config.pointBuy),
                                            " ",
                                            t("points"),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 341,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 305,
                                columnNumber: 33
                            }, this),
                            method === "roll" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "bg-background rounded border px-2 py-1 text-sm",
                                value: value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? "" : String(value),
                                disabled: rolls.length === 0,
                                onChange: (event)=>setAttributeValue(form, abilities, index, event.target.value === "" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] : Number(event.target.value)),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: t("assignScore")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 367,
                                        columnNumber: 37
                                    }, this),
                                    getRollOptions(rolls, value, usedRollValues).map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: option,
                                            children: option
                                        }, option, false, {
                                            fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                            lineNumber: 373,
                                            columnNumber: 41
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 348,
                                columnNumber: 33
                            }, this),
                            total !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: t("preview", {
                                    base: value,
                                    mod: raceBonus,
                                    total
                                })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 381,
                                columnNumber: 33
                            }, this)
                        ]
                    }, ability.name, true, {
                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                        lineNumber: 242,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                lineNumber: 232,
                columnNumber: 13
            }, this),
            attributesError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-destructive",
                children: t("errors.".concat(String(attributesError.message)))
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                lineNumber: 395,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
        lineNumber: 198,
        columnNumber: 9
    }, this);
}
_s(AbilityScoresField, "rbrYglrf6FE+l5hQaLPbTCOpDv0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = AbilityScoresField;
function countPoolUsage(values, pool) {
    const usage = new Map();
    for (const value of values){
        if (value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]) {
            continue;
        }
        var _usage_get;
        usage.set(value, ((_usage_get = usage.get(value)) !== null && _usage_get !== void 0 ? _usage_get : 0) + 1);
    }
    const poolCounts = new Map();
    for (const value of pool){
        var _poolCounts_get;
        poolCounts.set(value, ((_poolCounts_get = poolCounts.get(value)) !== null && _poolCounts_get !== void 0 ? _poolCounts_get : 0) + 1);
    }
    return usage;
}
function getStandardArrayOptions(standardArray, selected, usedValues) {
    const options = new Set();
    if (selected !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]) {
        options.add(selected);
    }
    for (const value of standardArray){
        if (!usedValues.has(value)) {
            options.add(value);
        }
    }
    return [
        ...options
    ].sort((a, b)=>b - a);
}
function getRollOptions(pool, selected, usedCounts) {
    const poolCounts = new Map();
    for (const value of pool){
        var _poolCounts_get;
        poolCounts.set(value, ((_poolCounts_get = poolCounts.get(value)) !== null && _poolCounts_get !== void 0 ? _poolCounts_get : 0) + 1);
    }
    const options = new Set();
    if (selected !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]) {
        options.add(selected);
    }
    for (const [value, poolCount] of poolCounts){
        var _usedCounts_get;
        const used = (_usedCounts_get = usedCounts.get(value)) !== null && _usedCounts_get !== void 0 ? _usedCounts_get : 0;
        const selectedCount = selected === value ? 1 : 0;
        if (used - selectedCount < poolCount) {
            options.add(value);
        }
    }
    return [
        ...options
    ].sort((a, b)=>b - a);
}
var _c;
__turbopack_context__.k.register(_c, "AbilityScoresField");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/characters/HitPointsField.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "HitPointsField": ()=>HitPointsField
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/hp.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/hp.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function coerceNumber(value) {
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}
function HitPointsField(param) {
    let { form, system, contentLocale } = param;
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("hitPoints");
    const tFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("fields");
    const watchedValues = form.watch();
    const [manualOverride, setManualOverride] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const formSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HitPointsField.useMemo[formSnapshot]": ()=>({
                characterClass: watchedValues.characterClass,
                level: watchedValues.level,
                attributes: watchedValues.attributes,
                race: watchedValues.race,
                subrace: watchedValues.subrace,
                startingItem: watchedValues.startingItem,
                maxHp: watchedValues.maxHp,
                hp: watchedValues.hp
            })
    }["HitPointsField.useMemo[formSnapshot]"], [
        watchedValues.characterClass,
        watchedValues.level,
        watchedValues.attributes,
        watchedValues.race,
        watchedValues.subrace,
        watchedValues.startingItem,
        watchedValues.maxHp,
        watchedValues.hp
    ]);
    const derivationContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HitPointsField.useMemo[derivationContext]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildHpDerivationContextFromForm"])(watchedValues, system, contentLocale)
    }["HitPointsField.useMemo[derivationContext]"], [
        watchedValues,
        system,
        contentLocale
    ]);
    const computedMaxHp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HitPointsField.useMemo[computedMaxHp]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveMaxHpFromForm"])(watchedValues, system, contentLocale)
    }["HitPointsField.useMemo[computedMaxHp]"], [
        watchedValues,
        system,
        contentLocale
    ]);
    const resolvedMaxHp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HitPointsField.useMemo[resolvedMaxHp]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveMaxHpFromForm"])(watchedValues, system, contentLocale)
    }["HitPointsField.useMemo[resolvedMaxHp]"], [
        watchedValues,
        system,
        contentLocale
    ]);
    var _coerceNumber;
    const baseMaxHp = (_coerceNumber = coerceNumber(watchedValues.maxHp)) !== null && _coerceNumber !== void 0 ? _coerceNumber : computedMaxHp;
    const hpBonusFromSources = resolvedMaxHp !== undefined && baseMaxHp !== undefined && resolvedMaxHp > baseMaxHp ? resolvedMaxHp - baseMaxHp : undefined;
    const breakdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HitPointsField.useMemo[breakdown]": ()=>{
            if (!derivationContext || system !== "dnd") {
                return undefined;
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$hp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDndHpBreakdown"])(derivationContext);
        }
    }["HitPointsField.useMemo[breakdown]"], [
        derivationContext,
        system
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HitPointsField.useEffect": ()=>{
            if (initializedRef.current) {
                return;
            }
            const existingMaxHp = coerceNumber(formSnapshot.maxHp);
            if (existingMaxHp !== undefined && computedMaxHp !== undefined && existingMaxHp !== computedMaxHp) {
                setManualOverride(true);
            }
            initializedRef.current = true;
        }
    }["HitPointsField.useEffect"], [
        formSnapshot.maxHp,
        computedMaxHp
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HitPointsField.useEffect": ()=>{
            if (manualOverride || computedMaxHp === undefined) {
                return;
            }
            form.setValue("maxHp", computedMaxHp, {
                shouldDirty: true,
                shouldValidate: true
            });
            const currentHp = coerceNumber(formSnapshot.hp);
            if (currentHp === undefined || currentHp === 0) {
                form.setValue("hp", computedMaxHp, {
                    shouldDirty: true,
                    shouldValidate: true
                });
            }
        }
    }["HitPointsField.useEffect"], [
        computedMaxHp,
        form,
        formSnapshot.hp,
        manualOverride
    ]);
    function handleMaxHpChange(value) {
        setManualOverride(true);
        const parsed = value === "" ? undefined : Number(value);
        form.setValue("maxHp", Number.isNaN(parsed) ? undefined : parsed, {
            shouldDirty: true,
            shouldValidate: true
        });
    }
    function handleHpChange(value) {
        const parsed = value === "" ? undefined : Number(value);
        form.setValue("hp", Number.isNaN(parsed) ? undefined : parsed, {
            shouldDirty: true,
            shouldValidate: true
        });
    }
    function handleResetToComputed() {
        if (computedMaxHp === undefined) {
            return;
        }
        setManualOverride(false);
        form.setValue("maxHp", computedMaxHp, {
            shouldDirty: true,
            shouldValidate: true
        });
    }
    const maxHpValue = coerceNumber(form.watch("maxHp"));
    const hpValue = coerceNumber(form.watch("hp"));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "flex flex-col gap-3 rounded border bg-muted/30 p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold",
                        children: t("title")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                        lineNumber: 170,
                        columnNumber: 17
                    }, this),
                    computedMaxHp !== undefined && manualOverride ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        onClick: handleResetToComputed,
                        children: t("resetToComputed")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                        lineNumber: 172,
                        columnNumber: 21
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 169,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3 sm:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex flex-col gap-1 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium",
                                children: tFields("maxHp")
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                                lineNumber: 185,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                type: "number",
                                min: 1,
                                value: maxHpValue !== null && maxHpValue !== void 0 ? maxHpValue : "",
                                onChange: (event)=>handleMaxHpChange(event.target.value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                                lineNumber: 186,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                        lineNumber: 184,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex flex-col gap-1 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium",
                                children: tFields("hp")
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                                lineNumber: 194,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                type: "number",
                                min: 0,
                                value: hpValue !== null && hpValue !== void 0 ? hpValue : "",
                                onChange: (event)=>handleHpChange(event.target.value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                                lineNumber: 195,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                        lineNumber: 193,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 183,
                columnNumber: 13
            }, this),
            breakdown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: breakdown
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 205,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: t("manualHint")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 207,
                columnNumber: 17
            }, this),
            hpBonusFromSources !== undefined && resolvedMaxHp !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: t("fromSources", {
                    base: baseMaxHp,
                    bonus: hpBonusFromSources,
                    total: resolvedMaxHp
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 211,
                columnNumber: 17
            }, this) : null,
            manualOverride && computedMaxHp !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground",
                children: t("overrideHint")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 221,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
        lineNumber: 168,
        columnNumber: 9
    }, this);
}
_s(HitPointsField, "4NUZ5PjbarCNveivXJyJiVIIaiE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = HitPointsField;
var _c;
__turbopack_context__.k.register(_c, "HitPointsField");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/label.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Label": ()=>Label
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Label(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Label;
;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/ui/form.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Form": ()=>Form,
    "FormControl": ()=>FormControl,
    "FormDescription": ()=>FormDescription,
    "FormField": ()=>FormField,
    "FormItem": ()=>FormItem,
    "FormLabel": ()=>FormLabel,
    "FormMessage": ()=>FormMessage,
    "useFormField": ()=>useFormField
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/label.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const Form = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormProvider"];
const FormFieldContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"]({});
const FormField = (param)=>{
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FormFieldContext.Provider, {
        value: {
            name: props.name
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Controller"], {
            ...props
        }, void 0, false, {
            fileName: "[project]/apps/web/components/ui/form.tsx",
            lineNumber: 40,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = FormField;
const useFormField = ()=>{
    _s();
    const fieldContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"](FormFieldContext);
    const itemContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"](FormItemContext);
    const { getFieldState } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"])();
    const formState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormState"])({
        name: fieldContext.name
    });
    const fieldState = getFieldState(fieldContext.name, formState);
    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }
    const { id } = itemContext;
    return {
        id,
        name: fieldContext.name,
        formItemId: "".concat(id, "-form-item"),
        formDescriptionId: "".concat(id, "-form-item-description"),
        formMessageId: "".concat(id, "-form-item-message"),
        ...fieldState
    };
};
_s(useFormField, "uYMhrJS1fbT4Yzmfu2feET1emX0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormState"]
    ];
});
const FormItemContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"]({});
function FormItem(param) {
    let { className, ...props } = param;
    _s1();
    const id = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FormItemContext.Provider, {
        value: {
            id
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            "data-slot": "form-item",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("grid gap-2", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/apps/web/components/ui/form.tsx",
            lineNumber: 81,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
_s1(FormItem, "WhsuKpSQZEWeFcB7gWlfDRQktoQ=");
_c1 = FormItem;
function FormLabel(param) {
    let { className, ...props } = param;
    _s2();
    const { error, formItemId } = useFormField();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "form-label",
        "data-error": !!error,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[error=true]:text-destructive", className),
        htmlFor: formItemId,
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
_s2(FormLabel, "Z4R+rKjylfAcqmbRnqWEg1TfTcg=", false, function() {
    return [
        useFormField
    ];
});
_c2 = FormLabel;
function FormControl(param) {
    let { ...props } = param;
    _s3();
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"], {
        "data-slot": "form-control",
        id: formItemId,
        "aria-describedby": !error ? "".concat(formDescriptionId) : "".concat(formDescriptionId, " ").concat(formMessageId),
        "aria-invalid": !!error,
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s3(FormControl, "mI3rlmONcPPBVtOc6UefMrXAJ6w=", false, function() {
    return [
        useFormField
    ];
});
_c3 = FormControl;
function FormDescription(param) {
    let { className, ...props } = param;
    _s4();
    const { formDescriptionId } = useFormField();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        "data-slot": "form-description",
        id: formDescriptionId,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 129,
        columnNumber: 5
    }, this);
}
_s4(FormDescription, "573aRXA8dloSrMaQM9SdAF4A9NI=", false, function() {
    return [
        useFormField
    ];
});
_c4 = FormDescription;
function FormMessage(param) {
    let { className, ...props } = param;
    _s5();
    const { error, formMessageId } = useFormField();
    var _error_message;
    const body = error ? String((_error_message = error === null || error === void 0 ? void 0 : error.message) !== null && _error_message !== void 0 ? _error_message : "") : props.children;
    if (!body) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        "data-slot": "form-message",
        id: formMessageId,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-destructive text-sm", className),
        ...props,
        children: body
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
_s5(FormMessage, "WONNS8VCMr8LShuUovb8QgOmMVY=", false, function() {
    return [
        useFormField
    ];
});
_c5 = FormMessage;
;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "FormField");
__turbopack_context__.k.register(_c1, "FormItem");
__turbopack_context__.k.register(_c2, "FormLabel");
__turbopack_context__.k.register(_c3, "FormControl");
__turbopack_context__.k.register(_c4, "FormDescription");
__turbopack_context__.k.register(_c5, "FormMessage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/forms/DynamicForm.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "DynamicForm": ()=>DynamicForm
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/form.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function normalizeSelectOption(option) {
    if (typeof option === "string") {
        return {
            value: option,
            label: option
        };
    }
    return option;
}
function DynamicForm(param) {
    let { form, fields, onSubmit } = param;
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])();
    /**
     * Built-in systems carry a `labelKey` resolved through the UI locale, while
     * user-authored systems (future) will carry a literal `label` in their own
     * language. Fall back to the raw field name so nothing renders blank.
     */ const resolveLabel = (item)=>{
        if (item.labelKey) return t(item.labelKey);
        if (item.label) return item.label;
        var _item_name;
        return (_item_name = item.name) !== null && _item_name !== void 0 ? _item_name : "";
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DynamicForm.useEffect": ()=>{
            // Inicializa os atributos com valores padrão se não existirem
            const attributeGroupFields = fields.filter({
                "DynamicForm.useEffect.attributeGroupFields": (field)=>field.type === "attributeGroup"
            }["DynamicForm.useEffect.attributeGroupFields"]);
            attributeGroupFields.forEach({
                "DynamicForm.useEffect": (attField)=>{
                    var _attField_attributes;
                    (_attField_attributes = attField.attributes) === null || _attField_attributes === void 0 ? void 0 : _attField_attributes.forEach({
                        "DynamicForm.useEffect": (attribute, index)=>{
                            const currentName = form.getValues("attributes.".concat(index, ".name"));
                            const currentValue = form.getValues("attributes.".concat(index, ".value"));
                            if (!currentName) {
                                form.setValue("attributes.".concat(index, ".name"), attribute.name);
                            }
                            if (currentValue === undefined || currentValue === null || currentValue === "") {
                                form.setValue("attributes.".concat(index, ".value"), 10); // valor padrão
                            }
                        }
                    }["DynamicForm.useEffect"]);
                }
            }["DynamicForm.useEffect"]);
        }
    }["DynamicForm.useEffect"], [
        fields,
        form,
        onSubmit
    ]);
    if (!fields || fields.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: t("forms.noFields")
        }, void 0, false, {
            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
            lineNumber: 91,
            columnNumber: 16
        }, this);
    }
    const handleSubmit = (e)=>{
        e.preventDefault();
        // Trigger validation and submission manually
        form.handleSubmit((data)=>{
            if (onSubmit) {
                onSubmit(data);
            } else {
                console.warn("No onSubmit function provided");
            }
        })();
    };
    // Separa campos regulares dos attributeGroups
    const regularFields = fields.filter((field)=>field.type !== "attributeGroup");
    const attributeGroupFields = fields.filter((field)=>field.type === "attributeGroup");
    // Agrupa campos regulares
    const groupedFields = regularFields.sort((a, b)=>{
        var _a_order, _b_order;
        return ((_a_order = a.order) !== null && _a_order !== void 0 ? _a_order : 0) - ((_b_order = b.order) !== null && _b_order !== void 0 ? _b_order : 0);
    }).reduce((groups, field)=>{
        const groupName = field.group || "default";
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(field);
        return groups;
    }, {});
    // Renderiza um campo individual
    const renderField = (fieldConfig)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormField"], {
            control: form.control,
            name: fieldConfig.name,
            render: (param)=>{
                let { field } = param;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormItem"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormLabel"], {
                            children: [
                                resolveLabel(fieldConfig),
                                fieldConfig.required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-red-500",
                                    children: "*"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                    lineNumber: 133,
                                    columnNumber: 50
                                }, void 0)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                            lineNumber: 131,
                            columnNumber: 21
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormControl"], {
                            children: (()=>{
                                switch(fieldConfig.type){
                                    case "text":
                                        var _field_value;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            ...field,
                                            value: (_field_value = field.value) !== null && _field_value !== void 0 ? _field_value : ""
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                            lineNumber: 140,
                                            columnNumber: 41
                                        }, void 0);
                                    case "number":
                                        var _field_value1;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            type: "number",
                                            ...field,
                                            value: (_field_value1 = field.value) !== null && _field_value1 !== void 0 ? _field_value1 : "",
                                            onChange: (e)=>{
                                                const value = e.target.value;
                                                field.onChange(value === "" ? "" : Number(value));
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                            lineNumber: 148,
                                            columnNumber: 41
                                        }, void 0);
                                    case "select":
                                        var _fieldConfig_options;
                                        var _field_value2;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            ...field,
                                            value: (_field_value2 = field.value) !== null && _field_value2 !== void 0 ? _field_value2 : "",
                                            className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: t("forms.selectPlaceholder", {
                                                        label: resolveLabel(fieldConfig)
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                    lineNumber: 166,
                                                    columnNumber: 45
                                                }, void 0),
                                                (_fieldConfig_options = fieldConfig.options) === null || _fieldConfig_options === void 0 ? void 0 : _fieldConfig_options.map((opt)=>{
                                                    const { value, label } = normalizeSelectOption(opt);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: value,
                                                        children: label
                                                    }, value, false, {
                                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                        lineNumber: 175,
                                                        columnNumber: 53
                                                    }, void 0);
                                                })
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                            lineNumber: 161,
                                            columnNumber: 41
                                        }, void 0);
                                    default:
                                        var _field_value3;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            ...field,
                                            value: (_field_value3 = field.value) !== null && _field_value3 !== void 0 ? _field_value3 : ""
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                            lineNumber: 185,
                                            columnNumber: 41
                                        }, void 0);
                                }
                            })()
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                            lineNumber: 135,
                            columnNumber: 21
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormMessage"], {}, void 0, false, {
                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                            lineNumber: 193,
                            columnNumber: 21
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                    lineNumber: 130,
                    columnNumber: 17
                }, void 0);
            }
        }, fieldConfig.name, false, {
            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
            lineNumber: 125,
            columnNumber: 9
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Form"], {
        ...form,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "space-y-8",
            children: [
                Object.entries(groupedFields).map((param)=>{
                    let [groupName, groupFields] = param;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold capitalize",
                                children: groupName
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                lineNumber: 206,
                                columnNumber: 25
                            }, this),
                            Object.entries(groupFields.reduce((inlineGroups, field)=>{
                                const inline = field.inlineGroup || field.name;
                                if (!inlineGroups[inline]) inlineGroups[inline] = [];
                                inlineGroups[inline].push(field);
                                return inlineGroups;
                            }, {})).map((param)=>{
                                let [inlineKey, inlineFields] = param;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid gap-4",
                                    style: {
                                        gridTemplateColumns: "repeat(".concat(Math.min(inlineFields.length, 4), ", 1fr)")
                                    },
                                    children: inlineFields.map((fieldConfig)=>renderField(fieldConfig))
                                }, inlineKey, false, {
                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                    lineNumber: 219,
                                    columnNumber: 29
                                }, this);
                            })
                        ]
                    }, groupName, true, {
                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                        lineNumber: 205,
                        columnNumber: 21
                    }, this);
                }),
                attributeGroupFields.map((attField)=>{
                    var _attField_attributes;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold",
                                children: resolveLabel(attField)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                lineNumber: 235,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-3 gap-4",
                                children: (_attField_attributes = attField.attributes) === null || _attField_attributes === void 0 ? void 0 : _attField_attributes.map((attribute, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormField"], {
                                                control: form.control,
                                                name: "attributes.".concat(index, ".name"),
                                                render: (param)=>{
                                                    let { field } = param;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        ...field,
                                                        value: attribute.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 45
                                                    }, void 0);
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                lineNumber: 240,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormField"], {
                                                control: form.control,
                                                name: "attributes.".concat(index, ".value"),
                                                render: (param)=>{
                                                    let { field } = param;
                                                    var _field_value;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormItem"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormLabel"], {
                                                                children: resolveLabel(attribute)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 258,
                                                                columnNumber: 49
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormControl"], {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                    type: "number",
                                                                    ...field,
                                                                    value: (_field_value = field.value) !== null && _field_value !== void 0 ? _field_value : "",
                                                                    onChange: (e)=>{
                                                                        const value = e.target.value;
                                                                        field.onChange(value === "" ? "" : Number(value));
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                    lineNumber: 260,
                                                                    columnNumber: 53
                                                                }, void 0)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 259,
                                                                columnNumber: 49
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormMessage"], {}, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 270,
                                                                columnNumber: 49
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 45
                                                    }, void 0);
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                lineNumber: 253,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, "".concat(attribute.name, "-").concat(index), true, {
                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                        lineNumber: 238,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                lineNumber: 236,
                                columnNumber: 25
                            }, this)
                        ]
                    }, attField.name, true, {
                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                        lineNumber: 234,
                        columnNumber: 21
                    }, this);
                }),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "submit",
                    className: "font-semibold",
                    children: t("forms.saveCharacter")
                }, void 0, false, {
                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                    lineNumber: 280,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
            lineNumber: 201,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
        lineNumber: 200,
        columnNumber: 9
    }, this);
}
_s(DynamicForm, "etYYvAa+NcFbn1DAUOfsAwohSEY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = DynamicForm;
var _c;
__turbopack_context__.k.register(_c, "DynamicForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/lib/character/playerFormFields.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "buildPlayerRaceFields": ()=>buildPlayerRaceFields
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/raceCatalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/grantCatalog.ts [app-client] (ecmascript)");
;
;
function buildPlayerRaceFields(fields, raceSlug, contentLocale) {
    const raceOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaceOptions"])(contentLocale);
    const subraceOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listSubraceOptions"])(raceSlug, contentLocale);
    const backgroundOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listBackgroundOptions"])();
    const startingItemOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listStartingItemOptions"])();
    const classOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listClassOptions"])();
    return fields.map((field)=>{
        if (field.name === "race" && raceOptions.length > 0) {
            return {
                ...field,
                options: raceOptions
            };
        }
        if (field.name === "subrace") {
            return {
                ...field,
                options: subraceOptions
            };
        }
        if (field.name === "background" && backgroundOptions.length > 0) {
            return {
                ...field,
                options: backgroundOptions
            };
        }
        if (field.name === "startingItem" && startingItemOptions.length > 0) {
            return {
                ...field,
                options: startingItemOptions
            };
        }
        if (field.name === "characterClass" && classOptions.length > 0) {
            return {
                ...field,
                options: classOptions
            };
        }
        return field;
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/components/characters/CharacterGrantPickers.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "CharacterGrantPickers": ()=>CharacterGrantPickers
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterGrants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/grantChoices.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/choiceValidation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/grantCatalog.ts [app-client] (ecmascript)");
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
function readGrantPicks(form) {
    const choices = form.watch("choices");
    var _choices_grantPicks;
    return (_choices_grantPicks = choices === null || choices === void 0 ? void 0 : choices.grantPicks) !== null && _choices_grantPicks !== void 0 ? _choices_grantPicks : {};
}
function setGrantPick(form, key, value) {
    var _ref;
    const current = (_ref = form.getValues("choices")) !== null && _ref !== void 0 ? _ref : {};
    var _current_grantPicks;
    form.setValue("choices", {
        ...current,
        grantPicks: {
            ...(_current_grantPicks = current.grantPicks) !== null && _current_grantPicks !== void 0 ? _current_grantPicks : {},
            [key]: value
        }
    }, {
        shouldDirty: true,
        shouldValidate: true
    });
}
function CharacterGrantPickers(param) {
    let { form, contentLocale } = param;
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("grants");
    const formValues = form.watch();
    const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[selections]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formValues)
    }["CharacterGrantPickers.useMemo[selections]"], [
        formValues
    ]);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[context]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["grantContextFromForm"])(formValues)
    }["CharacterGrantPickers.useMemo[context]"], [
        formValues
    ]);
    const fixedLanguages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[fixedLanguages]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFixedLanguageGrants"])(selections, context, contentLocale)
    }["CharacterGrantPickers.useMemo[fixedLanguages]"], [
        selections,
        context,
        contentLocale
    ]);
    const languageChoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[languageChoices]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collectLanguageChoiceGrants"])(selections, context, contentLocale)
    }["CharacterGrantPickers.useMemo[languageChoices]"], [
        selections,
        context,
        contentLocale
    ]);
    const otherChoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[otherChoices]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collectNonLanguageChoiceGrants"])(selections, context, contentLocale)
    }["CharacterGrantPickers.useMemo[otherChoices]"], [
        selections,
        context,
        contentLocale
    ]);
    const languageBudget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[languageBudget]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLanguageBudget"])(selections, context, contentLocale)
    }["CharacterGrantPickers.useMemo[languageBudget]"], [
        selections,
        context,
        contentLocale
    ]);
    const grantPicks = readGrantPicks(form);
    const choicesError = form.formState.errors.choices;
    const missingChoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[missingChoices]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findMissingRequiredChoices"])(formValues, contentLocale)
    }["CharacterGrantPickers.useMemo[missingChoices]"], [
        formValues,
        contentLocale
    ]);
    const missingChoiceKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterGrantPickers.useMemo[missingChoiceKeys]": ()=>new Set(missingChoices.map({
                "CharacterGrantPickers.useMemo[missingChoiceKeys]": (choice)=>choice.key
            }["CharacterGrantPickers.useMemo[missingChoiceKeys]"]))
    }["CharacterGrantPickers.useMemo[missingChoiceKeys]"], [
        missingChoices
    ]);
    const allLanguageOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLanguageOptions"])();
    const lockedLanguageSlugs = new Set(fixedLanguages.map((grant)=>grant.ref));
    const pickedLanguageSlugs = new Set(languageChoices.map((choice)=>grantPicks[choice.key]).filter(Boolean));
    const selectableLanguageOptions = allLanguageOptions.filter((option)=>!lockedLanguageSlugs.has(option.value) && !pickedLanguageSlugs.has(option.value));
    if (fixedLanguages.length === 0 && languageChoices.length === 0 && otherChoices.length === 0) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4 border rounded-lg p-4 bg-muted/30",
        children: [
            choicesError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-destructive",
                children: t("choicesIncomplete")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                lineNumber: 122,
                columnNumber: 17
            }, this),
            (fixedLanguages.length > 0 || languageChoices.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-bold",
                        children: t("languagesTitle")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 128,
                        columnNumber: 21
                    }, this),
                    fixedLanguages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: fixedLanguages.map((grant)=>{
                            var _grant_name;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-secondary px-3 py-1 text-xs font-medium",
                                children: [
                                    (_grant_name = grant.name) !== null && _grant_name !== void 0 ? _grant_name : grant.ref,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-1 opacity-60",
                                        children: [
                                            "(",
                                            t("autoKnown"),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                        lineNumber: 138,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, grant.id, true, {
                                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                lineNumber: 133,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 131,
                        columnNumber: 25
                    }, this),
                    languageBudget > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground",
                        children: t("languageBudget", {
                            count: languageBudget
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 147,
                        columnNumber: 25
                    }, this),
                    languageChoices.map((choice)=>{
                        var _grantPicks_choice_key;
                        const selected = (_grantPicks_choice_key = grantPicks[choice.key]) !== null && _grantPicks_choice_key !== void 0 ? _grantPicks_choice_key : "";
                        const optionsForSlot = [
                            ...selected ? allLanguageOptions.filter((option)=>option.value === selected) : [],
                            ...selectableLanguageOptions.filter((option)=>option.value !== selected)
                        ];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex flex-col gap-1 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: choice.label
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 170,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "bg-background rounded border px-2 py-1".concat(missingChoiceKeys.has(choice.key) ? " border-destructive" : ""),
                                    value: selected,
                                    onChange: (event)=>setGrantPick(form, choice.key, event.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: t("selectLanguage")
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                            lineNumber: 186,
                                            columnNumber: 37
                                        }, this),
                                        optionsForSlot.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: option.value,
                                                children: option.label
                                            }, option.value, false, {
                                                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                                lineNumber: 188,
                                                columnNumber: 41
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 171,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, choice.key, true, {
                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                            lineNumber: 166,
                            columnNumber: 29
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                lineNumber: 127,
                columnNumber: 17
            }, this),
            otherChoices.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-bold",
                        children: t("abilityChoicesTitle")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 204,
                        columnNumber: 21
                    }, this),
                    otherChoices.map((choice)=>{
                        var _grantPicks_choice_key;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex flex-col gap-1 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: choice.label
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 210,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "bg-background rounded border px-2 py-1".concat(missingChoiceKeys.has(choice.key) ? " border-destructive" : ""),
                                    value: (_grantPicks_choice_key = grantPicks[choice.key]) !== null && _grantPicks_choice_key !== void 0 ? _grantPicks_choice_key : "",
                                    onChange: (event)=>setGrantPick(form, choice.key, event.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: t("selectOption")
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                            lineNumber: 226,
                                            columnNumber: 33
                                        }, this),
                                        choice.options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: option.value,
                                                children: option.label
                                            }, option.value, false, {
                                                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                                lineNumber: 228,
                                                columnNumber: 37
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 211,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, choice.key, true, {
                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                            lineNumber: 206,
                            columnNumber: 25
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                lineNumber: 203,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
        lineNumber: 120,
        columnNumber: 9
    }, this);
}
_s(CharacterGrantPickers, "cgeaGSN/82GCnJjNzzUx7myIUv4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CharacterGrantPickers;
var _c;
__turbopack_context__.k.register(_c, "CharacterGrantPickers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/app/characters/player/create/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>CreatePlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$schema$2f$zodDynamic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/schema/zodDynamic.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/choiceValidation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/abilityScoreGeneration.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$AbilityScoresField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/characters/AbilityScoresField.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$HitPointsField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/characters/HitPointsField.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$forms$2f$DynamicForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/forms/DynamicForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useCharacterStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useContentLocale.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$playerFormFields$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/playerFormFields.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$CharacterGrantPickers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/characters/CharacterGrantPickers.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
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
;
;
;
;
;
;
;
;
function CreatePlayer() {
    _s();
    const addCharacter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"])({
        "CreatePlayer.useCharacterStore[addCharacter]": (state)=>state.addCharacter
    }["CreatePlayer.useCharacterStore[addCharacter]"]);
    const contentLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"])({
        "CreatePlayer.useContentLocale[contentLocale]": (state)=>state.contentLocale
    }["CreatePlayer.useContentLocale[contentLocale]"]);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [system, setSystem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("dnd");
    const type = "player";
    const presetData = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["presets"][system].presetData;
    const schema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreatePlayer.useMemo[schema]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyAbilityScoreValidation"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyChoiceValidation"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$schema$2f$zodDynamic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDynamicSchema"])(presetData.characters.schema, type), contentLocale), presetData.statConfig)
    }["CreatePlayer.useMemo[schema]"], [
        presetData.characters.schema,
        presetData.statConfig,
        type,
        contentLocale
    ]);
    const baseFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreatePlayer.useMemo[baseFields]": ()=>[
                ...presetData.characters.fields.common,
                ...presetData.characters.fields[type] || []
            ]
    }["CreatePlayer.useMemo[baseFields]"], [
        presetData.characters.fields,
        type
    ]);
    const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["zodResolver"])(schema),
        defaultValues: {}
    });
    const raceSlug = form.watch("race");
    const previousRaceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreatePlayer.useEffect": ()=>{
            if (previousRaceRef.current !== undefined && previousRaceRef.current !== raceSlug) {
                form.setValue("subrace", "");
            }
            previousRaceRef.current = raceSlug;
        }
    }["CreatePlayer.useEffect"], [
        form,
        raceSlug
    ]);
    const fields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreatePlayer.useMemo[fields]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$playerFormFields$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPlayerRaceFields"])(baseFields, raceSlug, contentLocale).filter({
                "CreatePlayer.useMemo[fields]": (field)=>field.type !== "attributeGroup" && field.name !== "hp" && field.name !== "maxHp"
            }["CreatePlayer.useMemo[fields]"])
    }["CreatePlayer.useMemo[fields]"], [
        baseFields,
        raceSlug,
        contentLocale
    ]);
    function handleSave(data) {
        addCharacter({
            ...data,
            choices: form.getValues("choices")
        }, type, system);
        router.push("/characters/player");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                asChild: true,
                variant: "destructive",
                className: "font-semibold",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/characters/player",
                    children: "Cancel"
                }, void 0, false, {
                    fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                    lineNumber: 95,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 94,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 w-full flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mb-2 text-lg font-bold bg-muted p-1 px-2 rounded",
                        children: "Create a New Player"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 98,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "bg-background font-semibold",
                        value: system,
                        onChange: (e)=>setSystem(e.target.value),
                        children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["presets"]).map((param)=>{
                            let [key, preset] = param;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: key,
                                children: preset.name
                            }, key, false, {
                                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                                lineNumber: 107,
                                columnNumber: 25
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 101,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$AbilityScoresField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AbilityScoresField"], {
                        form: form,
                        abilities: presetData.statConfig.abilities,
                        statConfig: presetData.statConfig,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 112,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$HitPointsField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HitPointsField"], {
                        form: form,
                        system: system,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$forms$2f$DynamicForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DynamicForm"], {
                        form: form,
                        fields: fields,
                        onSubmit: handleSave
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 123,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$CharacterGrantPickers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CharacterGrantPickers"], {
                        form: form,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 124,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 97,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
        lineNumber: 93,
        columnNumber: 9
    }, this);
}
_s(CreatePlayer, "ipCHFyEb/6gslJEY72zj63TYE3g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContentLocale"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"]
    ];
});
_c = CreatePlayer;
var _c;
__turbopack_context__.k.register(_c, "CreatePlayer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=apps_web_43cec50f._.js.map