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
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function DynamicForm(param) {
    let { form, fields, onSubmit } = param;
    _s();
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
            children: "No fields to render"
        }, void 0, false, {
            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
            lineNumber: 60,
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
                                fieldConfig.label,
                                fieldConfig.required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-red-500",
                                    children: "*"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                    lineNumber: 102,
                                    columnNumber: 50
                                }, void 0)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                            lineNumber: 100,
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
                                            lineNumber: 109,
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
                                            lineNumber: 117,
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
                                                    children: [
                                                        "Select ",
                                                        fieldConfig.label
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                    lineNumber: 135,
                                                    columnNumber: 45
                                                }, void 0),
                                                (_fieldConfig_options = fieldConfig.options) === null || _fieldConfig_options === void 0 ? void 0 : _fieldConfig_options.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: opt,
                                                        children: opt
                                                    }, opt, false, {
                                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                        lineNumber: 137,
                                                        columnNumber: 49
                                                    }, void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                            lineNumber: 130,
                                            columnNumber: 41
                                        }, void 0);
                                    default:
                                        var _field_value3;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            ...field,
                                            value: (_field_value3 = field.value) !== null && _field_value3 !== void 0 ? _field_value3 : ""
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                            lineNumber: 146,
                                            columnNumber: 41
                                        }, void 0);
                                }
                            })()
                        }, void 0, false, {
                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                            lineNumber: 104,
                            columnNumber: 21
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormMessage"], {}, void 0, false, {
                            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                            lineNumber: 154,
                            columnNumber: 21
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                    lineNumber: 99,
                    columnNumber: 17
                }, void 0);
            }
        }, fieldConfig.name, false, {
            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
            lineNumber: 94,
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
                                lineNumber: 167,
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
                                    lineNumber: 180,
                                    columnNumber: 29
                                }, this);
                            })
                        ]
                    }, groupName, true, {
                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                        lineNumber: 166,
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
                                children: attField.label
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                lineNumber: 196,
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
                                                        lineNumber: 205,
                                                        columnNumber: 45
                                                    }, void 0);
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                lineNumber: 201,
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
                                                                children: attribute.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 219,
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
                                                                    lineNumber: 221,
                                                                    columnNumber: 53
                                                                }, void 0)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 220,
                                                                columnNumber: 49
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormMessage"], {}, void 0, false, {
                                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                                lineNumber: 231,
                                                                columnNumber: 49
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                        lineNumber: 218,
                                                        columnNumber: 45
                                                    }, void 0);
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                                lineNumber: 214,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, "".concat(attribute.name, "-").concat(index), true, {
                                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                        lineNumber: 199,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                                lineNumber: 197,
                                columnNumber: 25
                            }, this)
                        ]
                    }, attField.name, true, {
                        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                        lineNumber: 195,
                        columnNumber: 21
                    }, this);
                }),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "submit",
                    className: "font-semibold",
                    children: "Save Character"
                }, void 0, false, {
                    fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
                    lineNumber: 241,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
            lineNumber: 162,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/forms/DynamicForm.tsx",
        lineNumber: 161,
        columnNumber: 9
    }, this);
}
_s(DynamicForm, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = DynamicForm;
var _c;
__turbopack_context__.k.register(_c, "DynamicForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
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
    "resolveGrantPool": ()=>resolveGrantPool,
    "resolveSpellPool": ()=>resolveSpellPool
});
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
    "dndRaceGrantOverrides": ()=>dndRaceGrantOverrides
});
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
            grants: []
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
            grants: []
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
"[project]/packages/content/data/catalog.json (json)": ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"generatedAt\":\"2026-06-01T01:27:48.491Z\",\"source\":\"open5e\",\"races\":[{\"slug\":\"dwarf\",\"name\":\"Dwarf\",\"system\":\"dnd\",\"sourceDocument\":\"wotc-srd\",\"description\":\"## Dwarf Traits\\nYour dwarf character has an assortment of inborn abilities, part and parcel of dwarven nature.\",\"size\":\"Medium\",\"speedWalk\":25,\"languagesDesc\":\"**_Languages._** You can speak, read, and write Common and Dwarvish.\",\"visionDesc\":\"**_Darkvision._** Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.\",\"asiDesc\":\"**_Ability Score Increase._** Your Constitution score increases by 2.\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Constitution score increases by 2.\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"constitution\",\"amount\":2}]},{\"slug\":\"dwarven-resilience\",\"name\":\"Dwarven Resilience\",\"description\":\"You have advantage on saving throws against poison, and you have resistance against poison damage.\",\"category\":\"resistance\",\"grants\":[]},{\"slug\":\"dwarven-combat-training\",\"name\":\"Dwarven Combat Training\",\"description\":\"You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"weapon_proficiency\",\"choose\":0,\"options\":[{\"optionType\":\"proficiency\",\"ref\":\"battleaxe\"},{\"optionType\":\"proficiency\",\"ref\":\"handaxe\"},{\"optionType\":\"proficiency\",\"ref\":\"light-hammer\"},{\"optionType\":\"proficiency\",\"ref\":\"warhammer\"}]}]},{\"slug\":\"tool-proficiency\",\"name\":\"Tool Proficiency\",\"description\":\"You gain proficiency with the artisan's tools of your choice: smith's tools, brewer's supplies, or mason's tools.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"tool_proficiency\",\"choose\":1,\"options\":[{\"optionType\":\"proficiency\",\"ref\":\"smiths-tools\"},{\"optionType\":\"proficiency\",\"ref\":\"brewers-supplies\"},{\"optionType\":\"proficiency\",\"ref\":\"masons-tools\"}]}]},{\"slug\":\"stonecunning\",\"name\":\"Stonecunning\",\"description\":\"Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.\",\"category\":\"other\",\"grants\":[]}],\"subraces\":[{\"slug\":\"hill-dwarf\",\"raceSlug\":\"dwarf\",\"name\":\"Hill Dwarf\",\"description\":\"As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.\",\"asiDesc\":\"**_Ability Score Increase._** Your Wisdom score increases by 1\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Wisdom score increases by 1\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"wisdom\",\"amount\":1}]},{\"slug\":\"dwarven-toughness\",\"name\":\"Dwarven Toughness\",\"description\":\"Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.\",\"category\":\"other\",\"grants\":[]}]}]},{\"slug\":\"elf\",\"name\":\"Elf\",\"system\":\"dnd\",\"sourceDocument\":\"wotc-srd\",\"description\":\"## Elf Traits\\nYour elf character has a variety of natural abilities, the result of thousands of years of elven refinement.\",\"size\":\"Medium\",\"speedWalk\":30,\"languagesDesc\":\"**_Languages._** You can speak, read, and write Common and Elvish.\",\"visionDesc\":\"**_Darkvision._** Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.\",\"asiDesc\":\"**_Ability Score Increase._** Your Dexterity score increases by 2.\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Dexterity score increases by 2.\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"dexterity\",\"amount\":2}]},{\"slug\":\"keen-senses\",\"name\":\"Keen Senses\",\"description\":\"You have proficiency in the Perception skill.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"skill_proficiency\",\"choose\":0,\"options\":[{\"optionType\":\"skill\",\"ref\":\"perception\"}]}]},{\"slug\":\"fey-ancestry\",\"name\":\"Fey Ancestry\",\"description\":\"You have advantage on saving throws against being charmed, and magic can't put you to sleep.\",\"category\":\"resistance\",\"grants\":[]},{\"slug\":\"trance\",\"name\":\"Trance\",\"description\":\"Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day.\",\"category\":\"other\",\"grants\":[]}],\"subraces\":[{\"slug\":\"high-elf\",\"raceSlug\":\"elf\",\"name\":\"High Elf\",\"description\":\"As a high elf, you have a keen mind and a mastery of at least the basics of magic.\",\"asiDesc\":\"**_Ability Score Increase._** Your Intelligence score increases by 1.\",\"traits\":[{\"slug\":\"ability-score-increase\",\"name\":\"Ability Score Increase\",\"description\":\"**_Ability Score Increase._** Your Intelligence score increases by 1.\",\"category\":\"ability_score\",\"grants\":[{\"grantType\":\"ability_score\",\"choose\":0,\"targetStat\":\"intelligence\",\"amount\":1}]},{\"slug\":\"elf-weapon-training\",\"name\":\"Elf Weapon Training\",\"description\":\"You have proficiency with the longsword, shortsword, shortbow, and longbow.\",\"category\":\"proficiency\",\"grants\":[{\"grantType\":\"weapon_proficiency\",\"choose\":0,\"options\":[{\"optionType\":\"proficiency\",\"ref\":\"longsword\"},{\"optionType\":\"proficiency\",\"ref\":\"shortsword\"},{\"optionType\":\"proficiency\",\"ref\":\"shortbow\"},{\"optionType\":\"proficiency\",\"ref\":\"longbow\"}]}]},{\"slug\":\"cantrip\",\"name\":\"Cantrip\",\"description\":\"You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.\",\"category\":\"spellcasting\",\"grants\":[{\"grantType\":\"spell\",\"choose\":1,\"selectionFilter\":{\"spellLists\":[\"wizard\"],\"levelInt\":0},\"description\":\"One cantrip of your choice from the wizard spell list.\"}]},{\"slug\":\"extra-language\",\"name\":\"Extra Language\",\"description\":\"You can speak, read, and write one extra language of your choice.\",\"category\":\"language\",\"grants\":[{\"grantType\":\"language\",\"choose\":1,\"selectionFilter\":{\"any\":true}}]}]}]}],\"spells\":[{\"slug\":\"acid-splash\",\"name\":\"Acid Splash\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Conjuration\",\"castingTime\":\"1 action\",\"range\":\"60 feet\",\"components\":\"V, S\",\"duration\":\"Instantaneous\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a dexterity saving throw or take 1d6 acid damage.\",\"higherLevel\":\"This spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).\",\"spellLists\":[\"sorcerer\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"},{\"slug\":\"fire-bolt\",\"name\":\"Fire Bolt\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Evocation\",\"castingTime\":\"1 action\",\"range\":\"120 feet\",\"components\":\"V, S\",\"duration\":\"Instantaneous\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage.\",\"higherLevel\":\"This spell's damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10).\",\"spellLists\":[\"sorcerer\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"},{\"slug\":\"light\",\"name\":\"Light\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Evocation\",\"castingTime\":\"1 action\",\"range\":\"Touch\",\"components\":\"V, M\",\"duration\":\"1 hour\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.\",\"higherLevel\":\"\",\"spellLists\":[\"cleric\",\"bard\",\"sorcerer\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"},{\"slug\":\"mage-hand\",\"name\":\"Mage Hand\",\"levelInt\":0,\"level\":\"Cantrip\",\"school\":\"Conjuration\",\"castingTime\":\"1 action\",\"range\":\"30 feet\",\"components\":\"V, S\",\"duration\":\"1 minute\",\"requiresConcentration\":false,\"canBeCastAsRitual\":false,\"description\":\"A spectral, floating hand appears at a point you choose within range. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.\",\"higherLevel\":\"\",\"spellLists\":[\"bard\",\"sorcerer\",\"warlock\",\"wizard\"],\"sourceDocument\":\"wotc-srd\"}],\"skills\":[{\"slug\":\"acrobatics\",\"name\":\"Acrobatics\",\"ability\":\"dexterity\"},{\"slug\":\"animal-handling\",\"name\":\"Animal Handling\",\"ability\":\"wisdom\"},{\"slug\":\"arcana\",\"name\":\"Arcana\",\"ability\":\"intelligence\"},{\"slug\":\"athletics\",\"name\":\"Athletics\",\"ability\":\"strength\"},{\"slug\":\"deception\",\"name\":\"Deception\",\"ability\":\"charisma\"},{\"slug\":\"history\",\"name\":\"History\",\"ability\":\"intelligence\"},{\"slug\":\"insight\",\"name\":\"Insight\",\"ability\":\"wisdom\"},{\"slug\":\"intimidation\",\"name\":\"Intimidation\",\"ability\":\"charisma\"},{\"slug\":\"investigation\",\"name\":\"Investigation\",\"ability\":\"intelligence\"},{\"slug\":\"medicine\",\"name\":\"Medicine\",\"ability\":\"wisdom\"},{\"slug\":\"nature\",\"name\":\"Nature\",\"ability\":\"intelligence\"},{\"slug\":\"perception\",\"name\":\"Perception\",\"ability\":\"wisdom\"},{\"slug\":\"performance\",\"name\":\"Performance\",\"ability\":\"charisma\"},{\"slug\":\"persuasion\",\"name\":\"Persuasion\",\"ability\":\"charisma\"},{\"slug\":\"religion\",\"name\":\"Religion\",\"ability\":\"intelligence\"},{\"slug\":\"sleight-of-hand\",\"name\":\"Sleight of Hand\",\"ability\":\"dexterity\"},{\"slug\":\"stealth\",\"name\":\"Stealth\",\"ability\":\"dexterity\"},{\"slug\":\"survival\",\"name\":\"Survival\",\"ability\":\"wisdom\"}],\"languages\":[{\"slug\":\"common\",\"name\":\"Common\",\"type\":\"standard\",\"script\":\"Common\"},{\"slug\":\"dwarvish\",\"name\":\"Dwarvish\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"elvish\",\"name\":\"Elvish\",\"type\":\"standard\",\"script\":\"Elvish\"},{\"slug\":\"giant\",\"name\":\"Giant\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"gnomish\",\"name\":\"Gnomish\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"goblin\",\"name\":\"Goblin\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"halfling\",\"name\":\"Halfling\",\"type\":\"standard\",\"script\":\"Common\"},{\"slug\":\"orc\",\"name\":\"Orc\",\"type\":\"standard\",\"script\":\"Dwarvish\"},{\"slug\":\"abyssal\",\"name\":\"Abyssal\",\"type\":\"exotic\",\"script\":\"Infernal\"},{\"slug\":\"celestial\",\"name\":\"Celestial\",\"type\":\"exotic\",\"script\":\"Celestial\"},{\"slug\":\"deep-speech\",\"name\":\"Deep Speech\",\"type\":\"exotic\"},{\"slug\":\"draconic\",\"name\":\"Draconic\",\"type\":\"exotic\",\"script\":\"Draconic\"},{\"slug\":\"infernal\",\"name\":\"Infernal\",\"type\":\"exotic\",\"script\":\"Infernal\"},{\"slug\":\"primordial\",\"name\":\"Primordial\",\"type\":\"exotic\",\"script\":\"Dwarvish\"},{\"slug\":\"sylvan\",\"name\":\"Sylvan\",\"type\":\"exotic\",\"script\":\"Elvish\"},{\"slug\":\"undercommon\",\"name\":\"Undercommon\",\"type\":\"exotic\",\"script\":\"Elvish\"}]}"));}),
"[project]/packages/content/src/catalog/read.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getRace": ()=>getRace,
    "getSubrace": ()=>getSubrace,
    "listRaces": ()=>listRaces
});
function listRaces(catalog) {
    return catalog.races;
}
function getRace(catalog, slug) {
    return catalog.races.find((race)=>race.slug === slug);
}
function getSubrace(catalog, slug) {
    for (const race of catalog.races){
        const subrace = race.subraces.find((sub)=>sub.slug === slug);
        if (subrace) {
            return subrace;
        }
    }
    return undefined;
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
    "getRace": ()=>getRace,
    "getSubrace": ()=>getSubrace,
    "listRaces": ()=>listRaces
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$data$2f$catalog$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/packages/content/data/catalog.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/read.ts [app-client] (ecmascript)");
;
;
const catalog = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$data$2f$catalog$2e$json__$28$json$29$__["default"];
function listRaces() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaces"](catalog);
}
function getRace(slug) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"](catalog, slug);
}
function getSubrace(slug) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSubrace"](catalog, slug);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$languages$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/languages.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$languages$2e$seed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/languages.seed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$curation$2f$raceGrants$2e$dnd$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/curation/raceGrants.dnd.ts [app-client] (ecmascript)");
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
    "listRaces": ()=>listRaces
});
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/packages/content/src/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/content/src/catalog/bundled.ts [app-client] (ecmascript)");
;
function listRaces() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaces"])();
}
function getRace(slug) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRace"])(slug);
}
function getSubrace(slug) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSubrace"])(slug);
}
function listRaceOptions() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$content$2f$src$2f$catalog$2f$bundled$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaces"])().map((race)=>race.name);
}
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/catalog/raceCatalog.ts [app-client] (ecmascript)");
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
function CreatePlayer() {
    _s();
    const addCharacter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"])({
        "CreatePlayer.useCharacterStore[addCharacter]": (state)=>state.addCharacter
    }["CreatePlayer.useCharacterStore[addCharacter]"]);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [system, setSystem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("dnd");
    const type = "player";
    const presetData = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$presets$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["presets"][system].presetData;
    const schema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$schema$2f$zodDynamic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDynamicSchema"])(presetData.characters.schema, type);
    const raceOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$catalog$2f$raceCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRaceOptions"])();
    const fields = [
        ...presetData.characters.fields.common,
        ...presetData.characters.fields[type] || []
    ].map((field)=>field.name === "race" && raceOptions.length > 0 ? {
            ...field,
            options: raceOptions
        } : field);
    const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["zodResolver"])(schema),
        defaultValues: {}
    });
    function handleSave(data) {
        addCharacter(data, type, system);
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
                    lineNumber: 48,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 47,
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
                        lineNumber: 51,
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
                                lineNumber: 60,
                                columnNumber: 25
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 54,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$forms$2f$DynamicForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DynamicForm"], {
                        form: form,
                        fields: fields,
                        onSubmit: handleSave
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                        lineNumber: 65,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
                lineNumber: 50,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/characters/player/create/page.tsx",
        lineNumber: 46,
        columnNumber: 9
    }, this);
}
_s(CreatePlayer, "ZdLfO3wnuag7PT/7+r3/o77n5pg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$store$2f$useCharacterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterStore"],
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

//# sourceMappingURL=_23ab18ff._.js.map