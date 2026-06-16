module.exports = {

"[project]/apps/web/lib/schema/zodDynamic.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "createDynamicSchema": ()=>createDynamicSchema
});
function createDynamicSchema(presetSchema, type) {
    const commonSchema = presetSchema.common;
    const typeSchema = presetSchema[type];
    if (!commonSchema) {
        throw new Error(`Common schema is missing`);
    }
    if (!typeSchema) {
        throw new Error(`Schema for type "${type}" not found`);
    }
    return commonSchema.extend(typeSchema.shape);
}
}),
"[project]/apps/web/lib/character/choiceValidation.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "applyChoiceValidation": ()=>applyChoiceValidation,
    "findMissingRequiredChoices": ()=>findMissingRequiredChoices
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterGrants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/grantChoices.ts [app-ssr] (ecmascript)");
;
;
;
function readGrantPicks(formData) {
    const choices = formData.choices;
    return choices?.grantPicks ?? {};
}
function findMissingRequiredChoices(formData, locale) {
    const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formData);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["grantContextFromForm"])(formData);
    const pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collectPendingChoiceGrants"])(selections, context, locale);
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
}),
"[project]/apps/web/lib/character/abilityScoreGeneration.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

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
    return config.cost[score] ?? 0;
}
function readAttributeValues(attributes, abilities) {
    const byName = new Map((attributes ?? []).map((entry)=>[
            entry.name,
            entry.value ?? 0
        ]));
    return abilities.map((ability)=>byName.get(ability.name) ?? UNASSIGNED_ABILITY_VALUE);
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
        counts.set(value, (counts.get(value) ?? 0) + 1);
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
function rollAbilityScore(config, rng = Math.random) {
    const rolls = Array.from({
        length: config.dice
    }, ()=>Math.floor(rng() * config.sides) + 1);
    rolls.sort((a, b)=>a - b);
    return rolls.slice(config.drop).reduce((total, value)=>total + value, 0);
}
function rollAbilityPool(config, rng = Math.random) {
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
}),
"[project]/apps/web/components/characters/AbilityScoresField.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "AbilityScoresField": ()=>AbilityScoresField
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/raceModifiers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/abilityScoreGeneration.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function readAttributes(form) {
    return form.watch("attributes") ?? [];
}
function writeAttributes(form, attributes) {
    form.setValue("attributes", attributes, {
        shouldDirty: true,
        shouldValidate: true
    });
}
function setAttributeValue(form, abilities, index, value) {
    const current = readAttributes(form);
    const next = abilities.map((ability, abilityIndex)=>({
            name: ability.name,
            value: abilityIndex === index ? value : current[abilityIndex]?.value ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]
        }));
    writeAttributes(form, next);
}
function AbilityScoresField({ form, abilities, statConfig, contentLocale }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("abilityScores");
    const tAbilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("abilities");
    const config = statConfig.abilityGeneration;
    const formValues = form.watch();
    const method = form.watch("abilityScoreMethod") ?? "manual";
    const rolls = form.watch("abilityScoreRolls") ?? [];
    const previousMethodRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(method);
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
            writeAttributes(form, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMethodDefaults"])("manual", abilities, statConfig));
        }
    }, [
        abilities,
        form,
        statConfig
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (previousMethodRef.current === method) {
            return;
        }
        writeAttributes(form, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMethodDefaults"])(method, abilities, statConfig));
        if (method !== "roll") {
            form.setValue("abilityScoreRolls", undefined, {
                shouldDirty: true
            });
        }
        previousMethodRef.current = method;
    }, [
        abilities,
        form,
        method,
        statConfig
    ]);
    const attributeValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readAttributeValues"])(readAttributes(form), abilities), [
        formValues,
        abilities
    ]);
    const remainingPoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!config || method !== "point-buy") {
            return null;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointBuyRemaining"])(attributeValues, config.pointBuy);
    }, [
        attributeValues,
        config,
        method
    ]);
    const raceModifiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formValues);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$raceModifiers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deriveRaceModifiers"])(selections, contentLocale);
    }, [
        formValues,
        contentLocale
    ]);
    const raceBonusByStat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const bonuses = new Map();
        for (const modifier of raceModifiers){
            if (modifier.operation !== "add") {
                continue;
            }
            bonuses.set(modifier.stat, (bonuses.get(modifier.stat) ?? 0) + modifier.value);
        }
        return bonuses;
    }, [
        raceModifiers
    ]);
    const attributesError = form.formState.errors.attributes;
    if (!config) {
        return null;
    }
    const usedStandardValues = new Set(attributeValues.filter((value)=>value !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]));
    const usedRollValues = countPoolUsage(attributeValues, rolls);
    function handleRoll() {
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rollAbilityPool"])(config);
        form.setValue("abilityScoreRolls", pool, {
            shouldDirty: true,
            shouldValidate: true
        });
        writeAttributes(form, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMethodDefaults"])("roll", abilities, statConfig));
    }
    function canIncreasePointBuy(index) {
        const current = attributeValues[index];
        const next = current + 1;
        if (next > config.pointBuy.max) {
            return false;
        }
        const nextValues = attributeValues.map((value, valueIndex)=>valueIndex === index ? next : value);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointBuyRemaining"])(nextValues, config.pointBuy) >= 0;
    }
    function canDecreasePointBuy(index) {
        return attributeValues[index] > config.pointBuy.min;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 border rounded-lg p-4 bg-muted/30",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-bold",
                        children: t("title")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                        lineNumber: 200,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "bg-background rounded border px-2 py-1 text-sm",
                        value: method,
                        onChange: (event)=>form.setValue("abilityScoreMethod", event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true
                            }),
                        children: config.methods.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: entry,
                                children: t(`methods.${entry}`)
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
            method === "point-buy" && remainingPoints !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground",
                children: t("pointsRemaining", {
                    count: remainingPoints
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                lineNumber: 221,
                columnNumber: 17
            }, this),
            method === "roll" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                variant: "outline",
                onClick: handleRoll,
                children: t("roll")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                lineNumber: 227,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                children: abilities.map((ability, index)=>{
                    const value = attributeValues[index] ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"];
                    const raceBonus = raceBonusByStat.get(ability.statKey) ?? 0;
                    const total = value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? null : value + raceBonus;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2 rounded border p-3 bg-background",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold",
                                children: ability.labelKey ? tAbilities(ability.name) : ability.label ?? ability.name
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 246,
                                columnNumber: 29
                            }, this),
                            method === "manual" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                type: "number",
                                min: 0,
                                max: 20,
                                value: value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? "" : value,
                                onChange: (event)=>{
                                    const nextValue = event.target.value;
                                    setAttributeValue(form, abilities, index, nextValue === "" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] : Number(nextValue));
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                lineNumber: 253,
                                columnNumber: 33
                            }, this),
                            method === "standard-array" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "bg-background rounded border px-2 py-1 text-sm",
                                value: value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? "" : String(value),
                                onChange: (event)=>setAttributeValue(form, abilities, index, event.target.value === "" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] : Number(event.target.value)),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: t("assignScore")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 291,
                                        columnNumber: 37
                                    }, this),
                                    getStandardArrayOptions(config.standardArray, value, usedStandardValues).map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                            method === "point-buy" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "min-w-8 text-center font-semibold",
                                        children: value
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 322,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground",
                                        children: [
                                            "(",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointBuyCost"])(value, config.pointBuy),
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
                            method === "roll" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "bg-background rounded border px-2 py-1 text-sm",
                                value: value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] ? "" : String(value),
                                disabled: rolls.length === 0,
                                onChange: (event)=>setAttributeValue(form, abilities, index, event.target.value === "" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"] : Number(event.target.value)),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: t("assignScore")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/components/characters/AbilityScoresField.tsx",
                                        lineNumber: 367,
                                        columnNumber: 37
                                    }, this),
                                    getRollOptions(rolls, value, usedRollValues).map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                            total !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
            attributesError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-destructive",
                children: t(`errors.${String(attributesError.message)}`)
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
function countPoolUsage(values, pool) {
    const usage = new Map();
    for (const value of values){
        if (value === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]) {
            continue;
        }
        usage.set(value, (usage.get(value) ?? 0) + 1);
    }
    const poolCounts = new Map();
    for (const value of pool){
        poolCounts.set(value, (poolCounts.get(value) ?? 0) + 1);
    }
    return usage;
}
function getStandardArrayOptions(standardArray, selected, usedValues) {
    const options = new Set();
    if (selected !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]) {
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
        poolCounts.set(value, (poolCounts.get(value) ?? 0) + 1);
    }
    const options = new Set();
    if (selected !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNASSIGNED_ABILITY_VALUE"]) {
        options.add(selected);
    }
    for (const [value, poolCount] of poolCounts){
        const used = usedCounts.get(value) ?? 0;
        const selectedCount = selected === value ? 1 : 0;
        if (used - selectedCount < poolCount) {
            options.add(value);
        }
    }
    return [
        ...options
    ].sort((a, b)=>b - a);
}
}),
"[project]/apps/web/components/characters/HitPointsField.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "HitPointsField": ()=>HitPointsField
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/hp.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$hp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/hp.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-ssr] (ecmascript)");
"use client";
;
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
function HitPointsField({ form, system, contentLocale }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("hitPoints");
    const tFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("fields");
    const watchedValues = form.watch();
    const [manualOverride, setManualOverride] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const formSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            characterClass: watchedValues.characterClass,
            level: watchedValues.level,
            attributes: watchedValues.attributes,
            race: watchedValues.race,
            subrace: watchedValues.subrace,
            startingItem: watchedValues.startingItem,
            maxHp: watchedValues.maxHp,
            hp: watchedValues.hp
        }), [
        watchedValues.characterClass,
        watchedValues.level,
        watchedValues.attributes,
        watchedValues.race,
        watchedValues.subrace,
        watchedValues.startingItem,
        watchedValues.maxHp,
        watchedValues.hp
    ]);
    const derivationContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildHpDerivationContextFromForm"])(watchedValues, system, contentLocale), [
        watchedValues,
        system,
        contentLocale
    ]);
    const computedMaxHp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deriveMaxHpFromForm"])(watchedValues, system, contentLocale), [
        watchedValues,
        system,
        contentLocale
    ]);
    const resolvedMaxHp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$hp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveMaxHpFromForm"])(watchedValues, system, contentLocale), [
        watchedValues,
        system,
        contentLocale
    ]);
    const baseMaxHp = coerceNumber(watchedValues.maxHp) ?? computedMaxHp;
    const hpBonusFromSources = resolvedMaxHp !== undefined && baseMaxHp !== undefined && resolvedMaxHp > baseMaxHp ? resolvedMaxHp - baseMaxHp : undefined;
    const breakdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!derivationContext || system !== "dnd") {
            return undefined;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$hp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDndHpBreakdown"])(derivationContext);
    }, [
        derivationContext,
        system
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (initializedRef.current) {
            return;
        }
        const existingMaxHp = coerceNumber(formSnapshot.maxHp);
        if (existingMaxHp !== undefined && computedMaxHp !== undefined && existingMaxHp !== computedMaxHp) {
            setManualOverride(true);
        }
        initializedRef.current = true;
    }, [
        formSnapshot.maxHp,
        computedMaxHp
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
    }, [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "flex flex-col gap-3 rounded border bg-muted/30 p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold",
                        children: t("title")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                        lineNumber: 170,
                        columnNumber: 17
                    }, this),
                    computedMaxHp !== undefined && manualOverride ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3 sm:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex flex-col gap-1 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium",
                                children: tFields("maxHp")
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                                lineNumber: 185,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                type: "number",
                                min: 1,
                                value: maxHpValue ?? "",
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex flex-col gap-1 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium",
                                children: tFields("hp")
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                                lineNumber: 194,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                type: "number",
                                min: 0,
                                value: hpValue ?? "",
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
            breakdown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: breakdown
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 205,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: t("manualHint")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/HitPointsField.tsx",
                lineNumber: 207,
                columnNumber: 17
            }, this),
            hpBonusFromSources !== undefined && resolvedMaxHp !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
            manualOverride && computedMaxHp !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
}),
"[project]/apps/web/components/characters/ArmorClassField.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "ArmorClassField": ()=>ArmorClassField
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$ac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/ac.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$ac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/dnd/ac.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-ssr] (ecmascript)");
"use client";
;
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
function ArmorClassField({ form, system, contentLocale }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("armorClass");
    const tFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("fields");
    const watchedValues = form.watch();
    const [manualOverride, setManualOverride] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const formSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            attributes: watchedValues.attributes,
            race: watchedValues.race,
            subrace: watchedValues.subrace,
            startingItem: watchedValues.startingItem,
            ac: watchedValues.ac
        }), [
        watchedValues.attributes,
        watchedValues.race,
        watchedValues.subrace,
        watchedValues.startingItem,
        watchedValues.ac
    ]);
    const derivationContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$ac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildAcDerivationContextFromForm"])(watchedValues, system, contentLocale), [
        watchedValues,
        system,
        contentLocale
    ]);
    const computedBaseAc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$ac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deriveBaseAcFromForm"])(watchedValues, system, contentLocale), [
        watchedValues,
        system,
        contentLocale
    ]);
    const resolvedAc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$ac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveAcFromForm"])(watchedValues, system, contentLocale), [
        watchedValues,
        system,
        contentLocale
    ]);
    const baseAc = coerceNumber(watchedValues.ac) ?? computedBaseAc;
    const acBonusFromSources = resolvedAc !== undefined && baseAc !== undefined && resolvedAc > baseAc ? resolvedAc - baseAc : undefined;
    const breakdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (system !== "dnd") {
            return undefined;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$dnd$2f$ac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDndAcBreakdown"])(derivationContext);
    }, [
        derivationContext,
        system
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (initializedRef.current) {
            return;
        }
        const existingAc = coerceNumber(formSnapshot.ac);
        if (existingAc !== undefined && computedBaseAc !== undefined && existingAc !== computedBaseAc) {
            setManualOverride(true);
        }
        initializedRef.current = true;
    }, [
        formSnapshot.ac,
        computedBaseAc
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (manualOverride || computedBaseAc === undefined) {
            return;
        }
        form.setValue("ac", computedBaseAc, {
            shouldDirty: true,
            shouldValidate: true
        });
    }, [
        computedBaseAc,
        form,
        manualOverride
    ]);
    function handleAcChange(value) {
        setManualOverride(true);
        const parsed = value === "" ? undefined : Number(value);
        form.setValue("ac", Number.isNaN(parsed) ? undefined : parsed, {
            shouldDirty: true,
            shouldValidate: true
        });
    }
    function handleResetToComputed() {
        if (computedBaseAc === undefined) {
            return;
        }
        setManualOverride(false);
        form.setValue("ac", computedBaseAc, {
            shouldDirty: true,
            shouldValidate: true
        });
    }
    const acValue = coerceNumber(form.watch("ac"));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "flex flex-col gap-3 rounded border bg-muted/30 p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold",
                        children: t("title")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                        lineNumber: 147,
                        columnNumber: 17
                    }, this),
                    computedBaseAc !== undefined && manualOverride ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        onClick: handleResetToComputed,
                        children: t("resetToComputed")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                        lineNumber: 149,
                        columnNumber: 21
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                lineNumber: 146,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex flex-col gap-1 text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium",
                        children: tFields("ac")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                        lineNumber: 161,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                        type: "number",
                        min: 0,
                        value: acValue ?? "",
                        onChange: (event)=>handleAcChange(event.target.value)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                        lineNumber: 162,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                lineNumber: 160,
                columnNumber: 13
            }, this),
            breakdown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: breakdown
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                lineNumber: 171,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: t("manualHint")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                lineNumber: 173,
                columnNumber: 17
            }, this),
            acBonusFromSources !== undefined && resolvedAc !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: t("fromSources", {
                    base: baseAc,
                    bonus: acBonusFromSources,
                    total: resolvedAc
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                lineNumber: 177,
                columnNumber: 17
            }, this) : null,
            manualOverride && computedBaseAc !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground",
                children: t("overrideHint")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
                lineNumber: 187,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/characters/ArmorClassField.tsx",
        lineNumber: 145,
        columnNumber: 9
    }, this);
}
}),
"[project]/apps/web/components/ui/label.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Label": ()=>Label
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/apps/web/components/ui/form.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/label.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const Form = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormProvider"];
const FormFieldContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"]({});
const FormField = ({ ...props })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormFieldContext.Provider, {
        value: {
            name: props.name
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Controller"], {
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
const useFormField = ()=>{
    const fieldContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](FormFieldContext);
    const itemContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](FormItemContext);
    const { getFieldState } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFormContext"])();
    const formState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFormState"])({
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
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState
    };
};
const FormItemContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"]({});
function FormItem({ className, ...props }) {
    const id = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"]();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormItemContext.Provider, {
        value: {
            id
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            "data-slot": "form-item",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("grid gap-2", className),
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
function FormLabel({ className, ...props }) {
    const { error, formItemId } = useFormField();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "form-label",
        "data-error": !!error,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("data-[error=true]:text-destructive", className),
        htmlFor: formItemId,
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
function FormControl({ ...props }) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"], {
        "data-slot": "form-control",
        id: formItemId,
        "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
        "aria-invalid": !!error,
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
function FormDescription({ className, ...props }) {
    const { formDescriptionId } = useFormField();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        "data-slot": "form-description",
        id: formDescriptionId,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 129,
        columnNumber: 5
    }, this);
}
function FormMessage({ className, ...props }) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;
    if (!body) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        "data-slot": "form-message",
        id: formMessageId,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-destructive text-sm", className),
        ...props,
        children: body
    }, void 0, false, {
        fileName: "[project]/apps/web/components/ui/form.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/apps/web/components/forms/DynamicForm.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "DynamicForm": ()=>DynamicForm
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/form.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
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
function DynamicForm({ form, fields, onSubmit }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])();
    /**
     * Built-in systems carry a `labelKey` resolved through the UI locale, while
     * user-authored systems (future) will carry a literal `label` in their own
     * language. Fall back to the raw field name so nothing renders blank.
     */ const resolveLabel = (item)=>{
        if (item.labelKey) return t(item.labelKey);
        if (item.label) return item.label;
        return item.name ?? "";
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Inicializa os atributos com valores padrão se não existirem
        const attributeGroupFields = fields.filter((field)=>field.type === "attributeGroup");
        attributeGroupFields.forEach((attField)=>{
            attField.attributes?.forEach((attribute, index)=>{
                const currentName = form.getValues(`attributes.${index}.name`);
                const currentValue = form.getValues(`attributes.${index}.value`);
                if (!currentName) {
                    form.setValue(`attributes.${index}.name`, attribute.name);
                }
                if (currentValue === undefined || currentValue === null || currentValue === "") {
                    form.setValue(`attributes.${index}.value`, 10); // valor padrão
                }
            });
        });
    }, [
        fields,
        form,
        onSubmit
    ]);
    if (!fields || fields.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
    const groupedFields = regularFields.sort((a, b)=>(a.order ?? 0) - (b.order ?? 0)).reduce((groups, field)=>{
        const groupName = field.group || "default";
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(field);
        return groups;
    }, {});
    // Renderiza um campo individual
    const renderField = (fieldConfig)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormField"], {
            control: form.control,
            name: fieldConfig.name,
            render: ({ field })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormItem"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormLabel"], {
                            children: [
                                resolveLabel(fieldConfig),
                                fieldConfig.required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormControl"], {
                            children: (()=>{
                                switch(fieldConfig.type){
                                    case "text":
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                            ...field,
                                            value: field.value ?? ""
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                            lineNumber: 140,
                                            columnNumber: 41
                                        }, void 0);
                                    case "number":
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                            type: "number",
                                            ...field,
                                            value: field.value ?? "",
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
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            ...field,
                                            value: field.value ?? "",
                                            className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: t("forms.selectPlaceholder", {
                                                        label: resolveLabel(fieldConfig)
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                    lineNumber: 166,
                                                    columnNumber: 45
                                                }, void 0),
                                                fieldConfig.options?.map((opt)=>{
                                                    const { value, label } = normalizeSelectOption(opt);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                            ...field,
                                            value: field.value ?? ""
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormMessage"], {}, void 0, false, {
                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                            lineNumber: 193,
                            columnNumber: 21
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                    lineNumber: 130,
                    columnNumber: 17
                }, void 0)
        }, fieldConfig.name, false, {
            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
            lineNumber: 125,
            columnNumber: 9
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Form"], {
        ...form,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "space-y-8",
            children: [
                Object.entries(groupedFields).map(([groupName, groupFields])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
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
                            }, {})).map(([inlineKey, inlineFields])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `grid gap-4`,
                                    style: {
                                        gridTemplateColumns: `repeat(${Math.min(inlineFields.length, 4)}, 1fr)`
                                    },
                                    children: inlineFields.map((fieldConfig)=>renderField(fieldConfig))
                                }, inlineKey, false, {
                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                    lineNumber: 219,
                                    columnNumber: 29
                                }, this))
                        ]
                    }, groupName, true, {
                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                        lineNumber: 205,
                        columnNumber: 21
                    }, this)),
                attributeGroupFields.map((attField)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold",
                                children: resolveLabel(attField)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                lineNumber: 235,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-3 gap-4",
                                children: attField.attributes?.map((attribute, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormField"], {
                                                control: form.control,
                                                name: `attributes.${index}.name`,
                                                render: ({ field })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        ...field,
                                                        value: attribute.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 45
                                                    }, void 0)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                lineNumber: 240,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormField"], {
                                                control: form.control,
                                                name: `attributes.${index}.value`,
                                                render: ({ field })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormItem"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormLabel"], {
                                                                children: resolveLabel(attribute)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 258,
                                                                columnNumber: 49
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormControl"], {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    type: "number",
                                                                    ...field,
                                                                    value: field.value ?? "",
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
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormMessage"], {}, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 270,
                                                                columnNumber: 49
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 45
                                                    }, void 0)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                lineNumber: 253,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, `${attribute.name}-${index}`, true, {
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
                    }, this)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
}),
"[project]/apps/web/lib/character/playerFormFields.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "buildPlayerRaceFields": ()=>buildPlayerRaceFields
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/raceCatalog.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/grantCatalog.ts [app-ssr] (ecmascript)");
;
;
function buildPlayerRaceFields(fields, raceSlug, contentLocale) {
    const raceOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listRaceOptions"])(contentLocale);
    const subraceOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listSubraceOptions"])(raceSlug, contentLocale);
    const backgroundOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listBackgroundOptions"])();
    const startingItemOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listStartingItemOptions"])();
    const classOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listClassOptions"])();
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
}),
"[project]/apps/web/components/characters/CharacterGrantPickers.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "CharacterGrantPickers": ()=>CharacterGrantPickers
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterGrants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/grantChoices.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/lib/character/characterAdapter.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/choiceValidation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/grantCatalog.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function readGrantPicks(form) {
    const choices = form.watch("choices");
    return choices?.grantPicks ?? {};
}
function setGrantPick(form, key, value) {
    const current = form.getValues("choices") ?? {};
    form.setValue("choices", {
        ...current,
        grantPicks: {
            ...current.grantPicks ?? {},
            [key]: value
        }
    }, {
        shouldDirty: true,
        shouldValidate: true
    });
}
function CharacterGrantPickers({ form, contentLocale }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("grants");
    const formValues = form.watch();
    const selections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildSelectionsFromForm"])(formValues), [
        formValues
    ]);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["grantContextFromForm"])(formValues), [
        formValues
    ]);
    const fixedLanguages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFixedLanguageGrants"])(selections, context, contentLocale), [
        selections,
        context,
        contentLocale
    ]);
    const languageChoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collectLanguageChoiceGrants"])(selections, context, contentLocale), [
        selections,
        context,
        contentLocale
    ]);
    const otherChoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$grantChoices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collectNonLanguageChoiceGrants"])(selections, context, contentLocale), [
        selections,
        context,
        contentLocale
    ]);
    const languageBudget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$characterGrants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLanguageBudget"])(selections, context, contentLocale), [
        selections,
        context,
        contentLocale
    ]);
    const grantPicks = readGrantPicks(form);
    const choicesError = form.formState.errors.choices;
    const missingChoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findMissingRequiredChoices"])(formValues, contentLocale), [
        formValues,
        contentLocale
    ]);
    const missingChoiceKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new Set(missingChoices.map((choice)=>choice.key)), [
        missingChoices
    ]);
    const allLanguageOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$grantCatalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLanguageOptions"])();
    const lockedLanguageSlugs = new Set(fixedLanguages.map((grant)=>grant.ref));
    const pickedLanguageSlugs = new Set(languageChoices.map((choice)=>grantPicks[choice.key]).filter(Boolean));
    const selectableLanguageOptions = allLanguageOptions.filter((option)=>!lockedLanguageSlugs.has(option.value) && !pickedLanguageSlugs.has(option.value));
    if (fixedLanguages.length === 0 && languageChoices.length === 0 && otherChoices.length === 0) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4 border rounded-lg p-4 bg-muted/30",
        children: [
            choicesError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-destructive",
                children: t("choicesIncomplete")
            }, void 0, false, {
                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                lineNumber: 122,
                columnNumber: 17
            }, this),
            (fixedLanguages.length > 0 || languageChoices.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-bold",
                        children: t("languagesTitle")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 128,
                        columnNumber: 21
                    }, this),
                    fixedLanguages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: fixedLanguages.map((grant)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-secondary px-3 py-1 text-xs font-medium",
                                children: [
                                    grant.name ?? grant.ref,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 131,
                        columnNumber: 25
                    }, this),
                    languageBudget > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                        const selected = grantPicks[choice.key] ?? "";
                        const optionsForSlot = [
                            ...selected ? allLanguageOptions.filter((option)=>option.value === selected) : [],
                            ...selectableLanguageOptions.filter((option)=>option.value !== selected)
                        ];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex flex-col gap-1 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: choice.label
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 170,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: `bg-background rounded border px-2 py-1${missingChoiceKeys.has(choice.key) ? " border-destructive" : ""}`,
                                    value: selected,
                                    onChange: (event)=>setGrantPick(form, choice.key, event.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: t("selectLanguage")
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                            lineNumber: 186,
                                            columnNumber: 37
                                        }, this),
                                        optionsForSlot.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
            otherChoices.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-bold",
                        children: t("abilityChoicesTitle")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 204,
                        columnNumber: 21
                    }, this),
                    otherChoices.map((choice)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex flex-col gap-1 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: choice.label
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 210,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: `bg-background rounded border px-2 py-1${missingChoiceKeys.has(choice.key) ? " border-destructive" : ""}`,
                                    value: grantPicks[choice.key] ?? "",
                                    onChange: (event)=>setGrantPick(form, choice.key, event.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: t("selectOption")
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                            lineNumber: 226,
                                            columnNumber: 33
                                        }, this),
                                        choice.options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                        }, this))
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
}),
"[project]/apps/web/app/characters/player/create/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>CreatePlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/presets/index.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$schema$2f$zodDynamic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/schema/zodDynamic.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/choiceValidation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/abilityScoreGeneration.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$AbilityScoresField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/characters/AbilityScoresField.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$HitPointsField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/characters/HitPointsField.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$ArmorClassField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/characters/ArmorClassField.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$forms$2f$DynamicForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/forms/DynamicForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useCharacterStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/store/useContentLocale.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$playerFormFields$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/character/playerFormFields.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$CharacterGrantPickers$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/characters/CharacterGrantPickers.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
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
;
;
function CreatePlayer() {
    const addCharacter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCharacterStore"])((state)=>state.addCharacter);
    const contentLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useContentLocale$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContentLocale"])((state)=>state.contentLocale);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [system, setSystem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("dnd");
    const type = "player";
    const presetData = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["presets"][system].presetData;
    const schema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$abilityScoreGeneration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAbilityScoreValidation"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$choiceValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyChoiceValidation"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$schema$2f$zodDynamic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createDynamicSchema"])(presetData.characters.schema, type), contentLocale), presetData.statConfig), [
        presetData.characters.schema,
        presetData.statConfig,
        type,
        contentLocale
    ]);
    const baseFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...presetData.characters.fields.common,
            ...presetData.characters.fields[type] || []
        ], [
        presetData.characters.fields,
        type
    ]);
    const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zodResolver"])(schema),
        defaultValues: {}
    });
    const raceSlug = form.watch("race");
    const previousRaceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (previousRaceRef.current !== undefined && previousRaceRef.current !== raceSlug) {
            form.setValue("subrace", "");
        }
        previousRaceRef.current = raceSlug;
    }, [
        form,
        raceSlug
    ]);
    const fields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$playerFormFields$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildPlayerRaceFields"])(baseFields, raceSlug, contentLocale).filter((field)=>field.type !== "attributeGroup" && field.name !== "hp" && field.name !== "maxHp" && field.name !== "ac"), [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                asChild: true,
                variant: "destructive",
                className: "font-semibold",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/characters/player",
                    children: "Cancel"
                }, void 0, false, {
                    fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                    lineNumber: 97,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 96,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 w-full flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mb-2 text-lg font-bold bg-muted p-1 px-2 rounded",
                        children: "Create a New Player"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 100,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "bg-background font-semibold",
                        value: system,
                        onChange: (e)=>setSystem(e.target.value),
                        children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["presets"]).map(([key, preset])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: key,
                                children: preset.name
                            }, key, false, {
                                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                                lineNumber: 109,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 103,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$AbilityScoresField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbilityScoresField"], {
                        form: form,
                        abilities: presetData.statConfig.abilities,
                        statConfig: presetData.statConfig,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 114,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$HitPointsField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HitPointsField"], {
                        form: form,
                        system: system,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 120,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$ArmorClassField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ArmorClassField"], {
                        form: form,
                        system: system,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 125,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$forms$2f$DynamicForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DynamicForm"], {
                        form: form,
                        fields: fields,
                        onSubmit: handleSave
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 130,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$CharacterGrantPickers$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CharacterGrantPickers"], {
                        form: form,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 131,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 99,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
        lineNumber: 95,
        columnNumber: 9
    }, this);
}
}),

};

//# sourceMappingURL=apps_web_1731665c._.js.map