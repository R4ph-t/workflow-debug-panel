import { jsxs as o, jsx as a, Fragment as ae } from "react/jsx-runtime";
import { useState as b, useEffect as D, useRef as g, useCallback as ne } from "react";
function oe(d) {
  const [w, R] = b([]), [P, G] = b(null), [_, u] = b(!1), [J, K] = b(!0), [W, S] = b(!!d);
  return D(() => {
    if (!d) {
      S(!1);
      return;
    }
    let j = !1;
    return (async () => {
      try {
        const x = await fetch(d);
        if (!x.ok)
          throw new Error("Failed to fetch status");
        const f = await x.json();
        j || (K(!0), u(f.workflow_configured ?? !1), G(f.workflow_slug ?? null), R(f.tasks ?? []), S(!1));
      } catch (x) {
        console.error("Failed to fetch workflow status:", x), j || (K(!1), u(!1), R([]), S(!1));
      }
    })(), () => {
      j = !0;
    };
  }, [d]), {
    tasks: w,
    workflowSlug: P,
    workflowConfigured: _,
    apiReachable: J,
    loading: W
  };
}
const ie = (d) => {
  try {
    return new URL(d).pathname || "/";
  } catch {
    return d;
  }
}, le = [
  {
    id: "trn-mock001",
    task_id: "root_task",
    status: "completed",
    input: "https://example.com",
    startedAt: new Date(Date.now() - 45e3).toISOString(),
    completedAt: new Date(Date.now() - 2e3).toISOString()
  },
  {
    id: "trn-mock002",
    task_id: "child_task",
    status: "running",
    input: "https://example.com/page",
    startedAt: new Date(Date.now() - 5e3).toISOString()
  }
], se = [
  { time: "12:34:56", message: "Workflow started", type: "success" },
  { time: "12:34:55", message: "✓ Task completed" }
];
function ce({
  taskRunId: d,
  statusUrl: w,
  streamUrl: R,
  onComplete: P,
  onError: G,
  extractPath: _ = ie,
  useMock: u = !1,
  mockTasks: J,
  mockLogs: K
}) {
  const W = J ?? le, S = K ?? se, [j, L] = b(u ? "running" : "idle"), [x, f] = b(u ? W : []), [X, p] = b(u ? S : []), [Y, E] = b(0), [Z, $] = b(!1), [v, z] = b(!1), B = g(Date.now()), N = g(null), T = g(null), U = g(/* @__PURE__ */ new Set()), k = g(!1), H = g(!1), F = g(!1), y = g(!1), A = g(w), Q = g(R), h = g(P), m = g(G), I = g(_);
  D(() => {
    A.current = w, Q.current = R, h.current = P, m.current = G, I.current = _;
  }), D(() => {
    y.current = v;
  }, [v]);
  const V = !!d || u, q = (O, C) => O.replace("{taskRunId}", C), M = ne((O, C) => {
    const e = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    p((n) => [{ time: e, message: O, type: C }, ...n].slice(0, 15));
  }, []);
  return D(() => {
    u && (L("running"), f(W), p(S), E(0), B.current = Date.now());
  }, [u, W, S]), D(() => {
    d && !u && (L("pending"), f([]), p([]), E(0), $(!1), z(!1), B.current = Date.now(), U.current = /* @__PURE__ */ new Set(), k.current = !1, H.current = !1, F.current = !1, y.current = !1);
  }, [d, u]), D(() => {
    if (V)
      return M("Workflow started"), N.current = setInterval(() => {
        E(Math.floor((Date.now() - B.current) / 1e3));
      }, 1e3), () => {
        N.current && clearInterval(N.current);
      };
  }, [V, M]), D(() => {
    v && N.current && (clearInterval(N.current), N.current = null);
  }, [v]), D(() => {
    if (u || !d)
      return;
    T.current && (T.current.close(), T.current = null);
    const O = d, C = q(Q.current, O), e = new EventSource(C);
    T.current = e;
    const n = async () => {
      const r = q(A.current, O), t = await fetch(r);
      if (!t.ok)
        throw new Error("Failed to fetch status");
      return t.json();
    }, s = () => {
      if (!h.current || !m.current) return;
      p((t) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
        hour12: !1,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }), message: "Using polling fallback" }, ...t].slice(0, 15));
      const r = async () => {
        var t, i;
        if (!(F.current || y.current))
          try {
            const l = await n();
            if (L(l.status), l.tasks) {
              f(l.tasks);
              for (const c of l.tasks)
                if (c.status === "completed" && !U.current.has(c.id) && (U.current.add(c.id), c.input)) {
                  const ee = I.current(c.input);
                  p((re) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
                    hour12: !1,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  }), message: `✓ ${ee}` }, ...re].slice(0, 15));
                }
            }
            l.status === "completed" && l.results ? (F.current = !0, z(!0), k.current = !0, p((c) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
              hour12: !1,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }), message: "Workflow completed", type: "success" }, ...c].slice(0, 15)), (t = h.current) == null || t.call(h, l.results)) : l.status === "failed" ? (F.current = !0, z(!0), k.current = !0, p((c) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
              hour12: !1,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }), message: "Workflow failed", type: "error" }, ...c].slice(0, 15)), (i = m.current) == null || i.call(m, "Workflow execution failed")) : setTimeout(r, 2e3);
          } catch (l) {
            console.error("Polling error:", l), setTimeout(r, 2e3);
          }
      };
      r();
    };
    return e.addEventListener("connected", () => {
      y.current || ($(!0), H.current = !0, p((r) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
        hour12: !1,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }), message: "Connected to event stream" }, ...r].slice(0, 15)));
    }), e.addEventListener("initial", (r) => {
      if (!y.current)
        try {
          const t = JSON.parse(r.data);
          L(t.status), t.tasks && f(t.tasks);
        } catch (t) {
          console.error("Error parsing initial event:", t);
        }
    }), e.addEventListener("taskUpdate", (r) => {
      if (!y.current)
        try {
          const t = JSON.parse(r.data);
          if (f((i) => i.find((c) => c.id === t.id) ? i.map(
            (c) => c.id === t.id ? {
              ...c,
              status: t.status,
              startedAt: t.startedAt || c.startedAt,
              completedAt: t.completedAt || c.completedAt,
              input: t.input || c.input
            } : c
          ) : [
            ...i,
            {
              id: t.id,
              status: t.status,
              task_id: t.task_name,
              input: t.input,
              startedAt: t.startedAt,
              completedAt: t.completedAt
            }
          ]), t.status === "completed" && !U.current.has(t.id) && (U.current.add(t.id), t.input)) {
            const i = I.current(t.input);
            p((l) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
              hour12: !1,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }), message: `✓ ${i}` }, ...l].slice(0, 15));
          }
        } catch (t) {
          console.error("Error parsing taskUpdate:", t);
        }
    }), e.addEventListener("done", async (r) => {
      k.current = !0, z(!0);
      try {
        const t = JSON.parse(r.data);
        L(t.status);
        try {
          const i = await n();
          i.tasks && f(i.tasks);
        } catch {
          console.warn("Could not fetch final task statuses");
        }
        if (t.status === "completed" && t.results && h.current) {
          const i = Array.isArray(t.results) ? t.results[0] : t.results;
          p((l) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour12: !1,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }), message: "Workflow completed", type: "success" }, ...l].slice(0, 15)), setTimeout(() => {
            var l;
            return (l = h.current) == null ? void 0 : l.call(h, i);
          }, 300);
        } else t.status === "failed" && m.current && (p((i) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
          hour12: !1,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }), message: "Workflow failed", type: "error" }, ...i].slice(0, 15)), m.current("Workflow execution failed"));
      } catch (t) {
        console.error("Error parsing done event:", t);
      }
      e.close();
    }), e.addEventListener("error", (r) => {
      if (!(k.current || y.current)) {
        console.error("SSE error event:", r);
        try {
          const t = JSON.parse(r.data || "{}");
          t.error && p((i) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour12: !1,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }), message: `Error: ${t.error}`, type: "error" }, ...i].slice(0, 15));
        } catch {
          H.current || (p((t) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour12: !1,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }), message: "SSE unavailable, using polling" }, ...t].slice(0, 15)), s());
        }
      }
    }), e.onerror = () => {
      k.current || y.current || (console.warn("SSE connection error"), H.current || (e.close(), s()));
    }, () => {
      e.close(), T.current = null;
    };
  }, [d, u]), {
    status: j,
    tasks: x,
    logs: X,
    elapsed: Y,
    connected: Z,
    finished: v,
    addLog: M
  };
}
let te = !1;
function de(d) {
  if (te || typeof document > "u") return;
  const w = document.createElement("style");
  w.setAttribute("data-workflow-debug-panel", ""), w.textContent = d, document.head.appendChild(w), te = !0;
}
const ue = '/*! tailwindcss v4.1.18 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-space-y-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial}}}@layer theme{:root,:host{--font-sans:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--color-red-400:oklch(70.4% .191 22.216);--color-red-500:oklch(63.7% .237 25.331);--color-red-950:oklch(25.8% .092 26.042);--color-yellow-400:oklch(85.2% .199 91.936);--color-yellow-500:oklch(79.5% .184 86.047);--color-emerald-500:oklch(69.6% .17 162.48);--color-emerald-600:oklch(59.6% .145 163.225);--color-neutral-300:oklch(87% 0 0);--color-neutral-400:oklch(70.8% 0 0);--color-neutral-500:oklch(55.6% 0 0);--color-neutral-600:oklch(43.9% 0 0);--color-neutral-700:oklch(37.1% 0 0);--color-neutral-800:oklch(26.9% 0 0);--color-neutral-900:oklch(20.5% 0 0);--color-neutral-950:oklch(14.5% 0 0);--color-white:#fff;--spacing:.25rem;--container-2xl:42rem;--text-xs:.75rem;--text-xs--line-height:calc(1/.75);--text-sm:.875rem;--text-sm--line-height:calc(1.25/.875);--text-2xl:1.5rem;--text-2xl--line-height:calc(2/1.5);--font-weight-bold:700;--tracking-wider:.05em;--leading-relaxed:1.625;--animate-pulse:pulse 2s cubic-bezier(.4,0,.6,1)infinite;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4,0,.2,1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){-webkit-appearance:button;-moz-appearance:button;appearance:button}::file-selector-button{-webkit-appearance:button;-moz-appearance:button;appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}}@layer components;@layer utilities{.collapse{visibility:collapse}.absolute{position:absolute}.relative{position:relative}.top-0{top:calc(var(--spacing)*0)}.mx-auto{margin-inline:auto}.mt-2{margin-top:calc(var(--spacing)*2)}.mr-3{margin-right:calc(var(--spacing)*3)}.mb-1{margin-bottom:calc(var(--spacing)*1)}.mb-1\\.5{margin-bottom:calc(var(--spacing)*1.5)}.mb-2{margin-bottom:calc(var(--spacing)*2)}.ml-1{margin-left:calc(var(--spacing)*1)}.ml-2{margin-left:calc(var(--spacing)*2)}.flex{display:flex}.inline-block{display:inline-block}.table{display:table}.h-1{height:calc(var(--spacing)*1)}.h-1\\.5{height:calc(var(--spacing)*1.5)}.h-3{height:calc(var(--spacing)*3)}.h-full{height:100%}.max-h-20{max-height:calc(var(--spacing)*20)}.max-h-56{max-height:calc(var(--spacing)*56)}.min-h-screen{min-height:100vh}.w-1{width:calc(var(--spacing)*1)}.w-1\\.5{width:calc(var(--spacing)*1.5)}.w-3{width:calc(var(--spacing)*3)}.w-4{width:calc(var(--spacing)*4)}.w-16{width:calc(var(--spacing)*16)}.w-28{width:calc(var(--spacing)*28)}.w-full{width:100%}.max-w-2xl{max-width:var(--container-2xl)}.flex-1{flex:1}.shrink-0{flex-shrink:0}.-rotate-90{rotate:-90deg}.animate-pulse{animation:var(--animate-pulse)}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.justify-between{justify-content:space-between}.gap-1{gap:calc(var(--spacing)*1)}.gap-1\\.5{gap:calc(var(--spacing)*1.5)}.gap-2{gap:calc(var(--spacing)*2)}.gap-3{gap:calc(var(--spacing)*3)}:where(.space-y-0>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*0)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*0)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-1>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*1)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*1)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-6>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*6)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*6)*calc(1 - var(--tw-space-y-reverse)))}.gap-x-4{column-gap:calc(var(--spacing)*4)}.gap-y-1{row-gap:calc(var(--spacing)*1)}.self-stretch{align-self:stretch}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-y-auto{overflow-y:auto}.rounded{border-radius:.25rem}.rounded-full{border-radius:3.40282e38px}.border{border-style:var(--tw-border-style);border-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-neutral-600{border-color:var(--color-neutral-600)}.border-neutral-700{border-color:var(--color-neutral-700)}.border-neutral-800{border-color:var(--color-neutral-800)}.bg-emerald-500{background-color:var(--color-emerald-500)}.bg-emerald-600{background-color:var(--color-emerald-600)}.bg-neutral-600{background-color:var(--color-neutral-600)}.bg-neutral-700{background-color:var(--color-neutral-700)}.bg-neutral-800{background-color:var(--color-neutral-800)}.bg-neutral-800\\/30{background-color:#2626264d}@supports (color:color-mix(in lab,red,red)){.bg-neutral-800\\/30{background-color:color-mix(in oklab,var(--color-neutral-800)30%,transparent)}}.bg-neutral-950{background-color:var(--color-neutral-950)}.bg-red-500{background-color:var(--color-red-500)}.bg-red-950{background-color:var(--color-red-950)}.bg-red-950\\/20{background-color:#46080933}@supports (color:color-mix(in lab,red,red)){.bg-red-950\\/20{background-color:color-mix(in oklab,var(--color-red-950)20%,transparent)}}.bg-yellow-500{background-color:var(--color-yellow-500)}.p-3{padding:calc(var(--spacing)*3)}.p-8{padding:calc(var(--spacing)*8)}.px-2{padding-inline:calc(var(--spacing)*2)}.px-3{padding-inline:calc(var(--spacing)*3)}.py-0{padding-block:calc(var(--spacing)*0)}.py-1{padding-block:calc(var(--spacing)*1)}.py-1\\.5{padding-block:calc(var(--spacing)*1.5)}.py-2{padding-block:calc(var(--spacing)*2)}.py-px{padding-block:1px}.text-right{text-align:right}.font-mono{font-family:var(--font-mono)}.text-2xl{font-size:var(--text-2xl);line-height:var(--tw-leading,var(--text-2xl--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[10px\\]{font-size:10px}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.tracking-wider{--tw-tracking:var(--tracking-wider);letter-spacing:var(--tracking-wider)}.text-emerald-500{color:var(--color-emerald-500)}.text-neutral-300{color:var(--color-neutral-300)}.text-neutral-400{color:var(--color-neutral-400)}.text-neutral-500{color:var(--color-neutral-500)}.text-neutral-600{color:var(--color-neutral-600)}.text-neutral-700{color:var(--color-neutral-700)}.text-red-400{color:var(--color-red-400)}.text-red-500{color:var(--color-red-500)}.text-white{color:var(--color-white)}.text-yellow-400{color:var(--color-yellow-400)}.uppercase{text-transform:uppercase}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}@media(hover:hover){.hover\\:bg-neutral-700:hover{background-color:var(--color-neutral-700)}.hover\\:bg-neutral-900\\/30:hover{background-color:#1717174d}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-neutral-900\\/30:hover{background-color:color-mix(in oklab,var(--color-neutral-900)30%,transparent)}}.hover\\:bg-neutral-900\\/50:hover{background-color:#17171780}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-neutral-900\\/50:hover{background-color:color-mix(in oklab,var(--color-neutral-900)50%,transparent)}}}}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-tracking{syntax:"*";inherits:false}@keyframes pulse{50%{opacity:.5}}';
de(ue);
function fe({
  taskRunId: d,
  statusCheckUrl: w,
  statusUrl: R,
  streamUrl: P,
  title: G = "Workflow Debug",
  displayName: _,
  taskDefinitions: u,
  taskDescriptions: J = {},
  workflowSlug: K,
  workflowConfigured: W,
  apiReachable: S,
  onComplete: j,
  onError: L,
  collapsed: x = !1,
  onToggle: f,
  useMock: X = !1,
  mockTasks: p,
  mockLogs: Y
}) {
  const E = g(null), Z = g(Date.now()), $ = oe(X ? void 0 : w), v = u ?? $.tasks, z = K ?? $.workflowSlug, B = W ?? $.workflowConfigured, N = S ?? $.apiReachable, T = (e) => {
    try {
      return new URL(e).pathname || "/";
    } catch {
      return e;
    }
  }, { status: U, tasks: k, logs: H, elapsed: F, finished: y } = ce({
    taskRunId: d,
    statusUrl: R,
    streamUrl: P,
    onComplete: j,
    onError: L,
    extractPath: T,
    useMock: X,
    mockTasks: p,
    mockLogs: Y
  }), A = !!d || X;
  D(() => {
    E.current && k.length > 0 && (E.current.scrollTop = E.current.scrollHeight);
  }, [k]);
  const Q = (e) => {
    const n = Math.floor(e / 60), s = e % 60;
    return `${n}:${s.toString().padStart(2, "0")}`;
  }, h = (e) => {
    if (!e.startedAt) return null;
    const n = new Date(e.startedAt).getTime(), r = (e.completedAt ? new Date(e.completedAt).getTime() : Date.now()) - n;
    return r < 1e3 ? `${r}ms` : `${(r / 1e3).toFixed(1)}s`;
  }, m = [...k].sort((e, n) => {
    const s = e.startedAt ? new Date(e.startedAt).getTime() : Number.MAX_SAFE_INTEGER, r = n.startedAt ? new Date(n.startedAt).getTime() : Number.MAX_SAFE_INTEGER;
    return s - r;
  }), I = (() => {
    const e = m.filter((r) => r.startedAt);
    if (e.length === 0)
      return {
        start: Z.current,
        end: Date.now(),
        duration: F * 1e3 || 1
      };
    const n = Math.min(
      ...e.map((r) => new Date(r.startedAt ?? Date.now()).getTime())
    ), s = Math.max(
      ...e.map(
        (r) => r.completedAt ? new Date(r.completedAt).getTime() : Date.now()
      )
    );
    return { start: n, end: s, duration: Math.max(s - n, 1) };
  })(), V = (e) => {
    if (!e.startedAt) return { left: "0%", width: "0%" };
    const n = new Date(e.startedAt).getTime(), s = e.completedAt ? new Date(e.completedAt).getTime() : Date.now(), r = (n - I.start) / I.duration * 100, t = (s - n) / I.duration * 100;
    return {
      left: `${Math.max(0, r)}%`,
      width: `${Math.max(1, Math.min(100 - r, t))}%`
    };
  }, q = {};
  for (const e of v) {
    const n = m.filter((s) => s.task_id === e);
    q[e] = {
      total: n.length,
      completed: n.filter((s) => s.status === "completed").length,
      running: n.filter((s) => s.status === "running").length
    };
  }
  const M = m.filter((e) => e.status === "failed"), C = N ? B ? A ? y ? U === "completed" ? { text: "Completed", color: "bg-emerald-500" } : { text: "Failed", color: "bg-red-500" } : { text: U.toUpperCase(), color: "bg-emerald-500 animate-pulse" } : { text: "Ready", color: "bg-emerald-500" } : { text: "Not configured", color: "bg-yellow-500" } : { text: "API unreachable", color: "bg-red-500" };
  return /* @__PURE__ */ o("div", { className: "border border-neutral-700", children: [
    /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        onClick: f,
        className: `w-full px-3 py-2 flex justify-between items-center text-xs hover:bg-neutral-900/50 transition-colors ${x ? "" : "border-b border-neutral-700"}`,
        children: [
          /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ a(
              "svg",
              {
                className: `w-3 h-3 text-neutral-500 transition-transform ${x ? "-rotate-90" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                "aria-hidden": "true",
                strokeWidth: 2,
                children: /* @__PURE__ */ a("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" })
              }
            ),
            /* @__PURE__ */ a("span", { className: "text-neutral-400 uppercase tracking-wider", children: G })
          ] }),
          /* @__PURE__ */ o("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ a("div", { className: `w-1.5 h-1.5 rounded-full ${C.color}` }),
              /* @__PURE__ */ a("span", { className: "text-neutral-500", children: C.text })
            ] }),
            A && /* @__PURE__ */ a("span", { className: "font-mono text-neutral-500", children: Q(F) })
          ] })
        ]
      }
    ),
    !x && /* @__PURE__ */ o(ae, { children: [
      /* @__PURE__ */ o("div", { className: "border-b border-neutral-700 px-3 py-2", children: [
        /* @__PURE__ */ a("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5", children: "Discovered Tasks" }),
        N ? B ? v.length === 0 ? /* @__PURE__ */ o("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ o("p", { className: "mb-1", children: [
            "No tasks found",
            z ? ` for "${z}"` : ""
          ] }),
          /* @__PURE__ */ a("p", { className: "text-neutral-500 text-[10px]", children: "Deploy the workflow service first." })
        ] }) : /* @__PURE__ */ a("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs", children: v.map((e) => {
          const n = q[e];
          return /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ a("span", { className: "font-mono text-neutral-300", children: e }),
            A && n && /* @__PURE__ */ o("span", { className: "text-neutral-600", children: [
              "(",
              n.total,
              ")",
              n.total > 0 && /* @__PURE__ */ o("span", { className: "ml-1", children: [
                n.completed > 0 && /* @__PURE__ */ o("span", { className: "text-emerald-500", children: [
                  "✓",
                  n.completed
                ] }),
                n.running > 0 && /* @__PURE__ */ o("span", { className: "text-neutral-400 ml-1", children: [
                  n.running,
                  "↻"
                ] })
              ] })
            ] }),
            J[e] && /* @__PURE__ */ a("span", { className: "text-neutral-700 text-[10px]", children: J[e] })
          ] }, e);
        }) }) : /* @__PURE__ */ o("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ a("p", { className: "mb-1", children: "Workflow not configured" }),
          /* @__PURE__ */ a("p", { className: "text-neutral-500 text-[10px]", children: z ? "Set WORKFLOW_SLUG env var on your API service." : "Configure the workflow on your backend." })
        ] }) : /* @__PURE__ */ o("div", { className: "text-xs text-red-400", children: [
          /* @__PURE__ */ a("p", { className: "mb-1", children: "Cannot reach the API" }),
          /* @__PURE__ */ a("p", { className: "text-neutral-500 text-[10px]", children: "Check that the backend is deployed and API URL is set." })
        ] })
      ] }),
      A && M.length > 0 && /* @__PURE__ */ o("div", { className: "border-b border-neutral-700 px-3 py-2 bg-red-950/20", children: [
        /* @__PURE__ */ o("div", { className: "text-[10px] text-red-500 uppercase tracking-wider mb-1.5", children: [
          "Errors (",
          M.length,
          ")"
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-1", children: M.slice(0, 3).map((e) => /* @__PURE__ */ o("div", { className: "text-xs", children: [
          /* @__PURE__ */ a("span", { className: "text-red-500", children: "⚠" }),
          " ",
          /* @__PURE__ */ a("span", { className: "font-mono text-neutral-400", children: e.task_id }),
          e.input && /* @__PURE__ */ a("span", { className: "text-neutral-500 ml-2 font-mono", children: T(e.input) })
        ] }, e.id)) })
      ] }),
      A && /* @__PURE__ */ o("div", { ref: E, className: "border-b border-neutral-700 max-h-56 overflow-y-auto", children: [
        /* @__PURE__ */ a("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider px-3 py-1.5 border-b border-neutral-800", children: "Timeline" }),
        m.length === 0 && /* @__PURE__ */ o("div", { className: "p-3 flex items-center gap-2 text-xs text-neutral-400", children: [
          /* @__PURE__ */ a("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ a("span", { children: "Starting workflow..." })
        ] }),
        m.map((e) => {
          const n = V(e), s = h(e), r = e.status === "running", t = e.status === "completed", i = e.status === "failed";
          return /* @__PURE__ */ o(
            "div",
            {
              className: "flex items-center px-2 py-0 hover:bg-neutral-900/30 text-xs",
              children: [
                /* @__PURE__ */ a("span", { className: "shrink-0 w-4", children: t ? /* @__PURE__ */ a("span", { className: "text-emerald-500", children: "✓" }) : i ? /* @__PURE__ */ a("span", { className: "text-red-500", children: "✗" }) : r ? /* @__PURE__ */ a("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }) : /* @__PURE__ */ a("span", { className: "inline-block w-1.5 h-1.5 border border-neutral-600 rounded-full" }) }),
                /* @__PURE__ */ a("span", { className: "shrink-0 w-28 font-mono text-neutral-400 truncate", children: _ && e.task_id === v[0] ? _ : e.input ? T(e.input) : e.task_id || e.id || "-" }),
                /* @__PURE__ */ a("span", { className: "shrink-0 w-16 font-mono text-neutral-500 text-right mr-3", children: s || (r ? "…" : "") }),
                /* @__PURE__ */ a("div", { className: "flex-1 self-stretch py-px", children: /* @__PURE__ */ a("div", { className: "relative h-full bg-neutral-800/30", children: /* @__PURE__ */ a(
                  "div",
                  {
                    className: `absolute top-0 h-full ${i ? "bg-red-500" : t ? "bg-neutral-600" : r ? "bg-emerald-500" : "bg-neutral-700"}`,
                    style: { left: n.left, width: n.width }
                  }
                ) }) })
              ]
            },
            e.id
          );
        })
      ] }),
      A && /* @__PURE__ */ o("div", { className: "px-3 py-2 max-h-20 overflow-y-auto", children: [
        /* @__PURE__ */ a("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1", children: "Log" }),
        /* @__PURE__ */ a("div", { className: "space-y-0", children: H.slice(0, 5).map((e) => /* @__PURE__ */ o(
          "div",
          {
            className: `text-[10px] font-mono flex gap-2 leading-relaxed ${e.type === "success" ? "text-emerald-500" : e.type === "error" ? "text-red-500" : "text-neutral-500"}`,
            children: [
              /* @__PURE__ */ a("span", { className: "text-neutral-700 shrink-0", children: e.time }),
              /* @__PURE__ */ a("span", { className: "truncate", children: e.message })
            ]
          },
          `${e.time}-${e.message}`
        )) })
      ] })
    ] })
  ] });
}
export {
  fe as WorkflowDebugPanel,
  oe as useWorkflowStatus,
  ce as useWorkflowStream
};
