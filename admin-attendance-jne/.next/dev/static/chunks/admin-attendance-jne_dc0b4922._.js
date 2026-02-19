(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/admin-attendance-jne/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin-attendance-jne/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin-attendance-jne/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin-attendance-jne/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin-attendance-jne/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin-attendance-jne/src/context/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function RootPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(11);
    if ($[0] !== "fd3b4f83ba90ebfefc4dbe85f06c802f0959550b087649a726b8fc9fd2062619") {
        for(let $i = 0; $i < 11; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "fd3b4f83ba90ebfefc4dbe85f06c802f0959550b087649a726b8fc9fd2062619";
    }
    const { user, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t0;
    let t1;
    if ($[1] !== loading || $[2] !== router || $[3] !== user) {
        t0 = ({
            "RootPage[useEffect()]": ()=>{
                if (!loading) {
                    if (user) {
                        router.replace("/dashboard");
                    } else {
                        router.replace("/login");
                    }
                }
            }
        })["RootPage[useEffect()]"];
        t1 = [
            user,
            loading,
            router
        ];
        $[1] = loading;
        $[2] = router;
        $[3] = user;
        $[4] = t0;
        $[5] = t1;
    } else {
        t0 = $[4];
        t1 = $[5];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    let t2;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            background: "#0F172A"
        };
        $[6] = t2;
    } else {
        t2 = $[6];
    }
    let t3;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = {
            width: 64,
            height: 64,
            background: "#E31E24"
        };
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    let t4;
    let t5;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl flex items-center justify-center",
            style: t3,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: "32",
                height: "32",
                viewBox: "0 0 24 24",
                fill: "none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
                    stroke: "white",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }, void 0, false, {
                    fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
                    lineNumber: 68,
                    columnNumber: 143
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
                lineNumber: 68,
                columnNumber: 83
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
            lineNumber: 68,
            columnNumber: 10
        }, this);
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-white font-semibold text-lg",
            children: "JNE MTP"
        }, void 0, false, {
            fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
            lineNumber: 69,
            columnNumber: 10
        }, this);
        $[8] = t4;
        $[9] = t5;
    } else {
        t4 = $[8];
        t5 = $[9];
    }
    let t6;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            style: t2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-4",
                children: [
                    t4,
                    t5,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1.5",
                        children: [
                            0,
                            1,
                            2
                        ].map(_RootPageAnonymous)
                    }, void 0, false, {
                        fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
                        lineNumber: 78,
                        columnNumber: 142
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
                lineNumber: 78,
                columnNumber: 84
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
            lineNumber: 78,
            columnNumber: 10
        }, this);
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    return t6;
}
_s(RootPage, "dy7xWVrvVVXL01ZnDuupSciFaow=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = RootPage;
function _RootPageAnonymous(i) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2d$attendance$2d$jne$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-full",
        style: {
            width: 8,
            height: 8,
            background: "#E31E24",
            animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`
        }
    }, i, false, {
        fileName: "[project]/admin-attendance-jne/src/app/page.tsx",
        lineNumber: 86,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "RootPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin-attendance-jne/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/admin-attendance-jne/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=admin-attendance-jne_dc0b4922._.js.map