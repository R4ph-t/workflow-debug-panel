import { jsxs as i, jsx as r, Fragment as ae } from "react/jsx-runtime";
import { useState as k, useEffect as E, useRef as g, useCallback as ne } from "react";
function oe(s) {
  const [f, R] = k([]), [M, O] = k(null), [_, u] = k(!1), [P, G] = k(!0), [W, N] = k(!!s);
  return E(() => {
    if (!s) {
      N(!1);
      return;
    }
    let j = !1;
    return (async () => {
      try {
        const y = await fetch(s);
        if (!y.ok)
          throw new Error("Failed to fetch status");
        const h = await y.json();
        j || (G(!0), u(h.workflow_configured ?? !1), O(h.workflow_slug ?? null), R(h.tasks ?? []), N(!1));
      } catch (y) {
        console.error("Failed to fetch workflow status:", y), j || (G(!1), u(!1), R([]), N(!1));
      }
    })(), () => {
      j = !0;
    };
  }, [s]), {
    tasks: f,
    workflowSlug: M,
    workflowConfigured: _,
    apiReachable: P,
    loading: W
  };
}
const ie = (s) => {
  try {
    return new URL(s).pathname || "/";
  } catch {
    return s;
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
], ee = (s, f) => s.replace("{taskRunId}", f);
function ce({
  taskRunId: s,
  statusUrl: f,
  streamUrl: R,
  onComplete: M,
  onError: O,
  extractPath: _ = ie,
  useMock: u = !1,
  mockTasks: P,
  mockLogs: G
}) {
  const W = P ?? le, N = G ?? se, [j, L] = k(u ? "running" : "idle"), [y, h] = k(u ? W : []), [H, p] = k(u ? N : []), [V, z] = k(0), [Y, $] = k(!1), [S, T] = k(!1), J = g(Date.now()), D = g(null), w = g(null), C = g(/* @__PURE__ */ new Set()), x = g(!1), K = g(!1), F = g(!1), b = g(!1), A = g(f), X = g(R), v = g(M), m = g(O), I = g(_);
  E(() => {
    A.current = f, X.current = R, v.current = M, m.current = O, I.current = _;
  }), E(() => {
    b.current = S;
  }, [S]);
  const q = !!s || u, B = ne((U, Q) => {
    const d = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    p((t) => [{ time: d, message: U, type: Q }, ...t].slice(0, 15));
  }, []);
  return E(() => {
    u && (L("running"), h(W), p(N), z(0), J.current = Date.now());
  }, [u, W, N]), E(() => {
    s && !u && (L("pending"), h([]), p([]), z(0), $(!1), T(!1), J.current = Date.now(), C.current = /* @__PURE__ */ new Set(), x.current = !1, K.current = !1, F.current = !1, b.current = !1);
  }, [s, u]), E(() => {
    if (q)
      return B("Workflow started"), D.current = setInterval(() => {
        z(Math.floor((Date.now() - J.current) / 1e3));
      }, 1e3), () => {
        D.current && clearInterval(D.current);
      };
  }, [q, B]), E(() => {
    S && D.current && (clearInterval(D.current), D.current = null);
  }, [S]), E(() => {
    if (u || !s)
      return;
    if (w.current && w.current.readyState !== EventSource.CLOSED) {
      console.log("SSE already connected, skipping");
      return;
    }
    w.current && (w.current.close(), w.current = null);
    const U = s, Q = ee(X.current, U), d = new EventSource(Q);
    w.current = d;
    const t = async () => {
      const a = ee(A.current, U), e = await fetch(a);
      if (!e.ok)
        throw new Error("Failed to fetch status");
      return e.json();
    }, n = () => {
      if (!v.current || !m.current) return;
      p((e) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
        hour12: !1,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }), message: "Using polling fallback" }, ...e].slice(0, 15));
      const a = async () => {
        var e, o;
        if (!(F.current || b.current))
          try {
            const l = await t();
            if (L(l.status), l.tasks) {
              h(l.tasks);
              for (const c of l.tasks)
                if (c.status === "completed" && !C.current.has(c.id) && (C.current.add(c.id), c.input)) {
                  const Z = I.current(c.input);
                  p((re) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
                    hour12: !1,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  }), message: `✓ ${Z}` }, ...re].slice(0, 15));
                }
            }
            l.status === "completed" && l.results ? (F.current = !0, T(!0), x.current = !0, p((c) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
              hour12: !1,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }), message: "Workflow completed", type: "success" }, ...c].slice(0, 15)), (e = v.current) == null || e.call(v, l.results)) : l.status === "failed" ? (F.current = !0, T(!0), x.current = !0, p((c) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
              hour12: !1,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }), message: "Workflow failed", type: "error" }, ...c].slice(0, 15)), (o = m.current) == null || o.call(m, "Workflow execution failed")) : setTimeout(a, 2e3);
          } catch (l) {
            console.error("Polling error:", l), setTimeout(a, 2e3);
          }
      };
      a();
    };
    return d.addEventListener("connected", () => {
      b.current || ($(!0), K.current = !0, p((a) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
        hour12: !1,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }), message: "Connected to event stream" }, ...a].slice(0, 15)));
    }), d.addEventListener("initial", (a) => {
      if (!b.current)
        try {
          const e = JSON.parse(a.data);
          L(e.status), e.tasks && h(e.tasks), (e.status === "completed" || e.status === "failed") && (d.close(), b.current = !0, x.current = !0, T(!0));
        } catch (e) {
          console.error("Error parsing initial event:", e);
        }
    }), d.addEventListener("taskUpdate", (a) => {
      if (!b.current)
        try {
          const e = JSON.parse(a.data);
          if (h((o) => o.find((c) => c.id === e.id) ? o.map(
            (c) => c.id === e.id ? {
              ...c,
              status: e.status,
              startedAt: e.startedAt || c.startedAt,
              completedAt: e.completedAt || c.completedAt,
              input: e.input || c.input
            } : c
          ) : [
            ...o,
            {
              id: e.id,
              status: e.status,
              task_id: e.task_name,
              input: e.input,
              startedAt: e.startedAt,
              completedAt: e.completedAt
            }
          ]), e.status === "completed" && !C.current.has(e.id) && (C.current.add(e.id), e.input)) {
            const o = I.current(e.input);
            p((l) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
              hour12: !1,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }), message: `✓ ${o}` }, ...l].slice(0, 15));
          }
        } catch (e) {
          console.error("Error parsing taskUpdate:", e);
        }
    }), d.addEventListener("done", async (a) => {
      d.close(), x.current = !0, b.current = !0, T(!0);
      try {
        const e = JSON.parse(a.data);
        L(e.status);
        try {
          const o = await t();
          o.tasks && h(o.tasks);
        } catch {
          console.warn("Could not fetch final task statuses");
        }
        if (e.status === "completed" && e.results && v.current) {
          const o = Array.isArray(e.results) ? e.results[0] : e.results;
          p((l) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour12: !1,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }), message: "Workflow completed", type: "success" }, ...l].slice(0, 15)), setTimeout(() => {
            var l;
            return (l = v.current) == null ? void 0 : l.call(v, o);
          }, 300);
        } else e.status === "failed" && m.current && (p((o) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
          hour12: !1,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }), message: "Workflow failed", type: "error" }, ...o].slice(0, 15)), m.current("Workflow execution failed"));
      } catch (e) {
        console.error("Error parsing done event:", e);
      }
    }), d.addEventListener("error", (a) => {
      if (!(x.current || b.current)) {
        console.error("SSE error event:", a);
        try {
          const e = JSON.parse(a.data || "{}");
          e.error && (p((o) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour12: !1,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }), message: `Error: ${e.error}`, type: "error" }, ...o].slice(0, 15)), d.close(), n());
        } catch {
          K.current || (p((e) => [{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour12: !1,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }), message: "SSE unavailable, using polling" }, ...e].slice(0, 15)), d.close(), n());
        }
      }
    }), d.onerror = () => {
      x.current || b.current || (console.warn("SSE connection error"), d.close(), K.current || n());
    }, () => {
      d.close(), w.current = null;
    };
  }, [s, u]), {
    status: j,
    tasks: y,
    logs: H,
    elapsed: V,
    connected: Y,
    finished: S,
    addLog: B
  };
}
let te = !1;
function de(s) {
  if (te || typeof document > "u") return;
  const f = document.createElement("style");
  f.setAttribute("data-workflow-debug-panel", ""), f.textContent = s, document.head.appendChild(f), te = !0;
}
const ue = '/*! tailwindcss v4.1.18 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-space-y-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial}}}@layer theme{:root,:host{--font-sans:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--color-red-400:oklch(70.4% .191 22.216);--color-red-500:oklch(63.7% .237 25.331);--color-red-950:oklch(25.8% .092 26.042);--color-yellow-400:oklch(85.2% .199 91.936);--color-yellow-500:oklch(79.5% .184 86.047);--color-emerald-500:oklch(69.6% .17 162.48);--color-emerald-600:oklch(59.6% .145 163.225);--color-neutral-300:oklch(87% 0 0);--color-neutral-400:oklch(70.8% 0 0);--color-neutral-500:oklch(55.6% 0 0);--color-neutral-600:oklch(43.9% 0 0);--color-neutral-700:oklch(37.1% 0 0);--color-neutral-800:oklch(26.9% 0 0);--color-neutral-900:oklch(20.5% 0 0);--color-neutral-950:oklch(14.5% 0 0);--color-white:#fff;--spacing:.25rem;--container-2xl:42rem;--text-xs:.75rem;--text-xs--line-height:calc(1/.75);--text-sm:.875rem;--text-sm--line-height:calc(1.25/.875);--text-2xl:1.5rem;--text-2xl--line-height:calc(2/1.5);--font-weight-bold:700;--tracking-wider:.05em;--leading-relaxed:1.625;--animate-pulse:pulse 2s cubic-bezier(.4,0,.6,1)infinite;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4,0,.2,1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){-webkit-appearance:button;-moz-appearance:button;appearance:button}::file-selector-button{-webkit-appearance:button;-moz-appearance:button;appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}}@layer components;@layer utilities{.collapse{visibility:collapse}.absolute{position:absolute}.relative{position:relative}.top-0{top:calc(var(--spacing)*0)}.mx-auto{margin-inline:auto}.mt-2{margin-top:calc(var(--spacing)*2)}.mr-3{margin-right:calc(var(--spacing)*3)}.mb-1{margin-bottom:calc(var(--spacing)*1)}.mb-1\\.5{margin-bottom:calc(var(--spacing)*1.5)}.mb-2{margin-bottom:calc(var(--spacing)*2)}.ml-1{margin-left:calc(var(--spacing)*1)}.ml-2{margin-left:calc(var(--spacing)*2)}.flex{display:flex}.inline-block{display:inline-block}.table{display:table}.h-1{height:calc(var(--spacing)*1)}.h-1\\.5{height:calc(var(--spacing)*1.5)}.h-3{height:calc(var(--spacing)*3)}.h-full{height:100%}.max-h-20{max-height:calc(var(--spacing)*20)}.max-h-56{max-height:calc(var(--spacing)*56)}.min-h-screen{min-height:100vh}.w-1{width:calc(var(--spacing)*1)}.w-1\\.5{width:calc(var(--spacing)*1.5)}.w-3{width:calc(var(--spacing)*3)}.w-4{width:calc(var(--spacing)*4)}.w-16{width:calc(var(--spacing)*16)}.w-28{width:calc(var(--spacing)*28)}.w-full{width:100%}.max-w-2xl{max-width:var(--container-2xl)}.flex-1{flex:1}.shrink-0{flex-shrink:0}.-rotate-90{rotate:-90deg}.animate-pulse{animation:var(--animate-pulse)}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.justify-between{justify-content:space-between}.gap-1{gap:calc(var(--spacing)*1)}.gap-1\\.5{gap:calc(var(--spacing)*1.5)}.gap-2{gap:calc(var(--spacing)*2)}.gap-3{gap:calc(var(--spacing)*3)}:where(.space-y-0>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*0)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*0)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-1>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*1)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*1)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-6>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*6)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*6)*calc(1 - var(--tw-space-y-reverse)))}.gap-x-4{column-gap:calc(var(--spacing)*4)}.gap-y-1{row-gap:calc(var(--spacing)*1)}.self-stretch{align-self:stretch}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-y-auto{overflow-y:auto}.rounded{border-radius:.25rem}.rounded-full{border-radius:3.40282e38px}.border{border-style:var(--tw-border-style);border-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-neutral-600{border-color:var(--color-neutral-600)}.border-neutral-700{border-color:var(--color-neutral-700)}.border-neutral-800{border-color:var(--color-neutral-800)}.bg-emerald-500{background-color:var(--color-emerald-500)}.bg-emerald-600{background-color:var(--color-emerald-600)}.bg-neutral-600{background-color:var(--color-neutral-600)}.bg-neutral-700{background-color:var(--color-neutral-700)}.bg-neutral-800{background-color:var(--color-neutral-800)}.bg-neutral-800\\/30{background-color:#2626264d}@supports (color:color-mix(in lab,red,red)){.bg-neutral-800\\/30{background-color:color-mix(in oklab,var(--color-neutral-800)30%,transparent)}}.bg-neutral-950{background-color:var(--color-neutral-950)}.bg-red-500{background-color:var(--color-red-500)}.bg-red-950{background-color:var(--color-red-950)}.bg-red-950\\/20{background-color:#46080933}@supports (color:color-mix(in lab,red,red)){.bg-red-950\\/20{background-color:color-mix(in oklab,var(--color-red-950)20%,transparent)}}.bg-yellow-500{background-color:var(--color-yellow-500)}.p-3{padding:calc(var(--spacing)*3)}.p-8{padding:calc(var(--spacing)*8)}.px-2{padding-inline:calc(var(--spacing)*2)}.px-3{padding-inline:calc(var(--spacing)*3)}.py-0{padding-block:calc(var(--spacing)*0)}.py-1{padding-block:calc(var(--spacing)*1)}.py-1\\.5{padding-block:calc(var(--spacing)*1.5)}.py-2{padding-block:calc(var(--spacing)*2)}.py-px{padding-block:1px}.text-right{text-align:right}.font-mono{font-family:var(--font-mono)}.text-2xl{font-size:var(--text-2xl);line-height:var(--tw-leading,var(--text-2xl--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[10px\\]{font-size:10px}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.tracking-wider{--tw-tracking:var(--tracking-wider);letter-spacing:var(--tracking-wider)}.text-emerald-500{color:var(--color-emerald-500)}.text-neutral-300{color:var(--color-neutral-300)}.text-neutral-400{color:var(--color-neutral-400)}.text-neutral-500{color:var(--color-neutral-500)}.text-neutral-600{color:var(--color-neutral-600)}.text-neutral-700{color:var(--color-neutral-700)}.text-red-400{color:var(--color-red-400)}.text-red-500{color:var(--color-red-500)}.text-white{color:var(--color-white)}.text-yellow-400{color:var(--color-yellow-400)}.uppercase{text-transform:uppercase}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}@media(hover:hover){.hover\\:bg-neutral-700:hover{background-color:var(--color-neutral-700)}.hover\\:bg-neutral-900\\/30:hover{background-color:#1717174d}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-neutral-900\\/30:hover{background-color:color-mix(in oklab,var(--color-neutral-900)30%,transparent)}}.hover\\:bg-neutral-900\\/50:hover{background-color:#17171780}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-neutral-900\\/50:hover{background-color:color-mix(in oklab,var(--color-neutral-900)50%,transparent)}}}}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-tracking{syntax:"*";inherits:false}@keyframes pulse{50%{opacity:.5}}';
de(ue);
function fe({
  taskRunId: s,
  statusCheckUrl: f,
  statusUrl: R,
  streamUrl: M,
  title: O = "Workflow Debug",
  displayName: _,
  taskDefinitions: u,
  taskDescriptions: P = {},
  workflowSlug: G,
  workflowConfigured: W,
  apiReachable: N,
  onComplete: j,
  onError: L,
  collapsed: y = !1,
  onToggle: h,
  useMock: H = !1,
  mockTasks: p,
  mockLogs: V
}) {
  const z = g(null), Y = g(Date.now()), $ = oe(H ? void 0 : f), S = u ?? $.tasks, T = G ?? $.workflowSlug, J = W ?? $.workflowConfigured, D = N ?? $.apiReachable, w = (t) => {
    try {
      return new URL(t).pathname || "/";
    } catch {
      return t;
    }
  }, { status: C, tasks: x, logs: K, elapsed: F, finished: b } = ce({
    taskRunId: s,
    statusUrl: R,
    streamUrl: M,
    onComplete: j,
    onError: L,
    extractPath: w,
    useMock: H,
    mockTasks: p,
    mockLogs: V
  }), A = !!s || H;
  E(() => {
    z.current && x.length > 0 && (z.current.scrollTop = z.current.scrollHeight);
  }, [x]);
  const X = (t) => {
    const n = Math.floor(t / 60), a = t % 60;
    return `${n}:${a.toString().padStart(2, "0")}`;
  }, v = (t) => {
    if (!t.startedAt) return null;
    const n = new Date(t.startedAt).getTime(), e = (t.completedAt ? new Date(t.completedAt).getTime() : Date.now()) - n;
    return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
  }, m = [...x].sort((t, n) => {
    const a = t.startedAt ? new Date(t.startedAt).getTime() : Number.MAX_SAFE_INTEGER, e = n.startedAt ? new Date(n.startedAt).getTime() : Number.MAX_SAFE_INTEGER;
    return a - e;
  }), I = (() => {
    const t = m.filter((e) => e.startedAt);
    if (t.length === 0)
      return {
        start: Y.current,
        end: Date.now(),
        duration: F * 1e3 || 1
      };
    const n = Math.min(
      ...t.map((e) => new Date(e.startedAt ?? Date.now()).getTime())
    ), a = Math.max(
      ...t.map(
        (e) => e.completedAt ? new Date(e.completedAt).getTime() : Date.now()
      )
    );
    return { start: n, end: a, duration: Math.max(a - n, 1) };
  })(), q = (t) => {
    if (!t.startedAt) return { left: "0%", width: "0%" };
    const n = new Date(t.startedAt).getTime(), a = t.completedAt ? new Date(t.completedAt).getTime() : Date.now(), e = (n - I.start) / I.duration * 100, o = (a - n) / I.duration * 100;
    return {
      left: `${Math.max(0, e)}%`,
      width: `${Math.max(1, Math.min(100 - e, o))}%`
    };
  }, B = {};
  for (const t of S) {
    const n = m.filter((a) => a.task_id === t);
    B[t] = {
      total: n.length,
      completed: n.filter((a) => a.status === "completed").length,
      running: n.filter((a) => a.status === "running").length
    };
  }
  const U = m.filter((t) => t.status === "failed"), d = D ? J ? A ? b ? C === "completed" ? { text: "Completed", color: "bg-emerald-500" } : { text: "Failed", color: "bg-red-500" } : { text: C.toUpperCase(), color: "bg-emerald-500 animate-pulse" } : { text: "Ready", color: "bg-emerald-500" } : { text: "Not configured", color: "bg-yellow-500" } : { text: "API unreachable", color: "bg-red-500" };
  return /* @__PURE__ */ i("div", { className: "border border-neutral-700", children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        onClick: h,
        className: `w-full px-3 py-2 flex justify-between items-center text-xs hover:bg-neutral-900/50 transition-colors ${y ? "" : "border-b border-neutral-700"}`,
        children: [
          /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ r(
              "svg",
              {
                className: `w-3 h-3 text-neutral-500 transition-transform ${y ? "-rotate-90" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                "aria-hidden": "true",
                strokeWidth: 2,
                children: /* @__PURE__ */ r("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" })
              }
            ),
            /* @__PURE__ */ r("span", { className: "text-neutral-400 uppercase tracking-wider", children: O })
          ] }),
          /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ r("div", { className: `w-1.5 h-1.5 rounded-full ${d.color}` }),
              /* @__PURE__ */ r("span", { className: "text-neutral-500", children: d.text })
            ] }),
            A && /* @__PURE__ */ r("span", { className: "font-mono text-neutral-500", children: X(F) })
          ] })
        ]
      }
    ),
    !y && /* @__PURE__ */ i(ae, { children: [
      /* @__PURE__ */ i("div", { className: "border-b border-neutral-700 px-3 py-2", children: [
        /* @__PURE__ */ r("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5", children: "Discovered Tasks" }),
        D ? J ? S.length === 0 ? /* @__PURE__ */ i("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ i("p", { className: "mb-1", children: [
            "No tasks found",
            T ? ` for "${T}"` : ""
          ] }),
          /* @__PURE__ */ r("p", { className: "text-neutral-500 text-[10px]", children: "Deploy the workflow service first." })
        ] }) : /* @__PURE__ */ r("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs", children: S.map((t) => {
          const n = B[t];
          return /* @__PURE__ */ i("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ r("span", { className: "font-mono text-neutral-300", children: t }),
            A && n && /* @__PURE__ */ i("span", { className: "text-neutral-600", children: [
              "(",
              n.total,
              ")",
              n.total > 0 && /* @__PURE__ */ i("span", { className: "ml-1", children: [
                n.completed > 0 && /* @__PURE__ */ i("span", { className: "text-emerald-500", children: [
                  "✓",
                  n.completed
                ] }),
                n.running > 0 && /* @__PURE__ */ i("span", { className: "text-neutral-400 ml-1", children: [
                  n.running,
                  "↻"
                ] })
              ] })
            ] }),
            P[t] && /* @__PURE__ */ r("span", { className: "text-neutral-700 text-[10px]", children: P[t] })
          ] }, t);
        }) }) : /* @__PURE__ */ i("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ r("p", { className: "mb-1", children: "Workflow not configured" }),
          /* @__PURE__ */ r("p", { className: "text-neutral-500 text-[10px]", children: T ? "Set WORKFLOW_SLUG env var on your API service." : "Configure the workflow on your backend." })
        ] }) : /* @__PURE__ */ i("div", { className: "text-xs text-red-400", children: [
          /* @__PURE__ */ r("p", { className: "mb-1", children: "Cannot reach the API" }),
          /* @__PURE__ */ r("p", { className: "text-neutral-500 text-[10px]", children: "Check that the backend is deployed and API URL is set." })
        ] })
      ] }),
      A && U.length > 0 && /* @__PURE__ */ i("div", { className: "border-b border-neutral-700 px-3 py-2 bg-red-950/20", children: [
        /* @__PURE__ */ i("div", { className: "text-[10px] text-red-500 uppercase tracking-wider mb-1.5", children: [
          "Errors (",
          U.length,
          ")"
        ] }),
        /* @__PURE__ */ r("div", { className: "space-y-1", children: U.slice(0, 3).map((t) => /* @__PURE__ */ i("div", { className: "text-xs", children: [
          /* @__PURE__ */ r("span", { className: "text-red-500", children: "⚠" }),
          " ",
          /* @__PURE__ */ r("span", { className: "font-mono text-neutral-400", children: t.task_id }),
          t.input && /* @__PURE__ */ r("span", { className: "text-neutral-500 ml-2 font-mono", children: w(t.input) })
        ] }, t.id)) })
      ] }),
      A && /* @__PURE__ */ i("div", { ref: z, className: "border-b border-neutral-700 max-h-56 overflow-y-auto", children: [
        /* @__PURE__ */ r("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider px-3 py-1.5 border-b border-neutral-800", children: "Timeline" }),
        m.length === 0 && /* @__PURE__ */ i("div", { className: "p-3 flex items-center gap-2 text-xs text-neutral-400", children: [
          /* @__PURE__ */ r("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ r("span", { children: "Starting workflow..." })
        ] }),
        m.map((t) => {
          const n = q(t), a = v(t), e = t.status === "running", o = t.status === "completed", l = t.status === "failed";
          return /* @__PURE__ */ i(
            "div",
            {
              className: "flex items-center px-2 py-0 hover:bg-neutral-900/30 text-xs",
              children: [
                /* @__PURE__ */ r("span", { className: "shrink-0 w-4", children: o ? /* @__PURE__ */ r("span", { className: "text-emerald-500", children: "✓" }) : l ? /* @__PURE__ */ r("span", { className: "text-red-500", children: "✗" }) : e ? /* @__PURE__ */ r("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }) : /* @__PURE__ */ r("span", { className: "inline-block w-1.5 h-1.5 border border-neutral-600 rounded-full" }) }),
                /* @__PURE__ */ r("span", { className: "shrink-0 w-28 font-mono text-neutral-400 truncate", children: _ && t.task_id === S[0] ? _ : t.input ? w(t.input) : t.task_id || t.id || "-" }),
                /* @__PURE__ */ r("span", { className: "shrink-0 w-16 font-mono text-neutral-500 text-right mr-3", children: a || (e ? "…" : "") }),
                /* @__PURE__ */ r("div", { className: "flex-1 self-stretch py-px", children: /* @__PURE__ */ r("div", { className: "relative h-full bg-neutral-800/30", children: /* @__PURE__ */ r(
                  "div",
                  {
                    className: `absolute top-0 h-full ${l ? "bg-red-500" : o ? "bg-neutral-600" : e ? "bg-emerald-500" : "bg-neutral-700"}`,
                    style: { left: n.left, width: n.width }
                  }
                ) }) })
              ]
            },
            t.id
          );
        })
      ] }),
      A && /* @__PURE__ */ i("div", { className: "px-3 py-2 max-h-20 overflow-y-auto", children: [
        /* @__PURE__ */ r("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1", children: "Log" }),
        /* @__PURE__ */ r("div", { className: "space-y-0", children: K.slice(0, 5).map((t) => /* @__PURE__ */ i(
          "div",
          {
            className: `text-[10px] font-mono flex gap-2 leading-relaxed ${t.type === "success" ? "text-emerald-500" : t.type === "error" ? "text-red-500" : "text-neutral-500"}`,
            children: [
              /* @__PURE__ */ r("span", { className: "text-neutral-700 shrink-0", children: t.time }),
              /* @__PURE__ */ r("span", { className: "truncate", children: t.message })
            ]
          },
          `${t.time}-${t.message}`
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
