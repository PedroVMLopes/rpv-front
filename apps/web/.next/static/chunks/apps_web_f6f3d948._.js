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
"[project]/apps/web/lib/catalog/grantCatalog.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getLanguage": ()=>getLanguage,
    "listBackgroundOptions": ()=>listBackgroundOptions,
    "listLanguageOptions": ()=>listLanguageOptions,
    "listLanguages": ()=>listLanguages,
    "listStartingItemOptions": ()=>listStartingItemOptions
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$backgroundGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/backgroundGrants.dnd.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$itemGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/itemGrants.dnd.ts [app-client] (ecmascript)");
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
        shouldDirty: true
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
            (fixedLanguages.length > 0 || languageChoices.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-bold",
                        children: t("languagesTitle")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 113,
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
                                        lineNumber: 123,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, grant.id, true, {
                                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                lineNumber: 118,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 116,
                        columnNumber: 25
                    }, this),
                    languageBudget > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground",
                        children: t("languageBudget", {
                            count: languageBudget
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                        lineNumber: 132,
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
                                    lineNumber: 155,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "bg-background rounded border px-2 py-1",
                                    value: selected,
                                    onChange: (event)=>setGrantPick(form, choice.key, event.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: t("selectLanguage")
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                            lineNumber: 167,
                                            columnNumber: 37
                                        }, this),
                                        optionsForSlot.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: option.value,
                                                children: option.label
                                            }, option.value, false, {
                                                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                                lineNumber: 169,
                                                columnNumber: 41
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 156,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, choice.key, true, {
                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                            lineNumber: 151,
                            columnNumber: 29
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                lineNumber: 112,
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
                        lineNumber: 185,
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
                                    lineNumber: 191,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "bg-background rounded border px-2 py-1",
                                    value: (_grantPicks_choice_key = grantPicks[choice.key]) !== null && _grantPicks_choice_key !== void 0 ? _grantPicks_choice_key : "",
                                    onChange: (event)=>setGrantPick(form, choice.key, event.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: t("selectOption")
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                            lineNumber: 203,
                                            columnNumber: 33
                                        }, this),
                                        choice.options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: option.value,
                                                children: option.label
                                            }, option.value, false, {
                                                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                                lineNumber: 205,
                                                columnNumber: 37
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                                    lineNumber: 192,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, choice.key, true, {
                            fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                            lineNumber: 187,
                            columnNumber: 25
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
                lineNumber: 184,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/characters/CharacterGrantPickers.tsx",
        lineNumber: 110,
        columnNumber: 9
    }, this);
}
_s(CharacterGrantPickers, "IEvXpF94OxPWVpIg8kJFnJqcmJo=", false, function() {
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
    const schema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$schema$2f$zodDynamic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDynamicSchema"])(presetData.characters.schema, type);
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
        "CreatePlayer.useMemo[fields]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$character$2f$playerFormFields$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPlayerRaceFields"])(baseFields, raceSlug, contentLocale)
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
                    lineNumber: 75,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 74,
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
                        lineNumber: 78,
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
                                lineNumber: 87,
                                columnNumber: 25
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 81,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$forms$2f$DynamicForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DynamicForm"], {
                        form: form,
                        fields: fields,
                        onSubmit: handleSave
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 92,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$characters$2f$CharacterGrantPickers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CharacterGrantPickers"], {
                        form: form,
                        contentLocale: contentLocale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 93,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 77,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
        lineNumber: 73,
        columnNumber: 9
    }, this);
}
_s(CreatePlayer, "9AjVKM2+qyH+SMv/m1B7du0zJ38=", false, function() {
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

//# sourceMappingURL=apps_web_f6f3d948._.js.map