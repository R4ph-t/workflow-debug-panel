import { jsxs as o, jsx as r, Fragment as ee } from "react/jsx-runtime";
import { useState as h, useEffect as F, useRef as E, useCallback as X } from "react";
function te(i) {
  const [b, W] = h([]), [w, v] = h(null), [N, p] = h(!1), [M, O] = h(!0), [x, S] = h(!!i);
  return F(() => {
    if (!i) {
      S(!1);
      return;
    }
    let j = !1;
    return (async () => {
      try {
        const k = await fetch(i);
        if (!k.ok)
          throw new Error("Failed to fetch status");
        const g = await k.json();
        j || (O(!0), p(g.workflow_configured ?? !1), v(g.workflow_slug ?? null), W(g.tasks ?? []), S(!1));
      } catch (k) {
        console.error("Failed to fetch workflow status:", k), j || (O(!1), p(!1), W([]), S(!1));
      }
    })(), () => {
      j = !0;
    };
  }, [i]), {
    tasks: b,
    workflowSlug: w,
    workflowConfigured: N,
    apiReachable: M,
    loading: x
  };
}
const re = [
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
], ae = [
  { time: "12:34:56", message: "Workflow started", type: "success" },
  { time: "12:34:55", message: "✓ Task completed" }
];
function ne({
  taskRunId: i,
  statusUrl: b,
  streamUrl: W,
  onComplete: w,
  onError: v,
  extractPath: N = (x) => {
    try {
      return new URL(x).pathname || "/";
    } catch {
      return x;
    }
  },
  useMock: p = !1,
  mockTasks: M,
  mockLogs: O
}) {
  const x = M ?? re, S = O ?? ae, [j, z] = h(p ? "running" : "idle"), [k, g] = h(p ? x : []), [J, K] = h(p ? S : []), [q, L] = h(0), [Q, $] = h(!1), [m, C] = h(!1), U = E(Date.now()), A = E(null), I = E(null), _ = E(/* @__PURE__ */ new Set()), y = E(!1), B = E(!1), R = E(!1), P = !!i || p, f = X(
    (n) => i ? n.replace("{taskRunId}", i) : n,
    [i]
  ), c = X((n, d) => {
    const l = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    K((t) => [{ time: l, message: n, type: d }, ...t].slice(0, 15));
  }, []), G = X(async () => {
    const n = await fetch(f(b));
    if (!n.ok)
      throw new Error("Failed to fetch status");
    return n.json();
  }, [f, b]), T = X(() => {
    if (!i || !w || !v) return;
    c("Using polling fallback");
    const n = async () => {
      if (!R.current)
        try {
          const d = await G();
          if (z(d.status), d.tasks) {
            g(d.tasks);
            for (const l of d.tasks)
              l.status === "completed" && !_.current.has(l.id) && (_.current.add(l.id), l.input && c(`✓ ${N(l.input)}`));
          }
          d.status === "completed" && d.results ? (R.current = !0, C(!0), y.current = !0, c("Workflow completed", "success"), w(d.results)) : d.status === "failed" ? (R.current = !0, C(!0), y.current = !0, c("Workflow failed", "error"), v("Workflow execution failed")) : setTimeout(n, 2e3);
        } catch (d) {
          console.error("Polling error:", d), setTimeout(n, 2e3);
        }
    };
    n();
  }, [i, c, N, w, v, G]);
  return F(() => {
    p && (z("running"), g(x), K(S), L(0), U.current = Date.now());
  }, [p, x, S]), F(() => {
    i && !p && (z("pending"), g([]), K([]), L(0), $(!1), C(!1), U.current = Date.now(), _.current = /* @__PURE__ */ new Set(), y.current = !1, R.current = !1);
  }, [i, p]), F(() => {
    if (P)
      return c("Workflow started"), A.current = setInterval(() => {
        L(Math.floor((Date.now() - U.current) / 1e3));
      }, 1e3), () => {
        A.current && clearInterval(A.current);
      };
  }, [P, c]), F(() => {
    m && A.current && (clearInterval(A.current), A.current = null);
  }, [m]), F(() => {
    var d;
    if (!P || !i || m || p) {
      (d = I.current) == null || d.close();
      return;
    }
    const n = new EventSource(f(W));
    return I.current = n, n.addEventListener("connected", () => {
      $(!0), B.current = !0, c("Connected to event stream");
    }), n.addEventListener("initial", (l) => {
      try {
        const t = JSON.parse(l.data);
        z(t.status), t.tasks && g(t.tasks);
      } catch (t) {
        console.error("Error parsing initial event:", t);
      }
    }), n.addEventListener("taskUpdate", (l) => {
      try {
        const t = JSON.parse(l.data);
        g((D) => D.find((e) => e.id === t.id) ? D.map(
          (e) => e.id === t.id ? {
            ...e,
            status: t.status,
            startedAt: t.startedAt || e.startedAt,
            completedAt: t.completedAt || e.completedAt,
            input: t.input || e.input
          } : e
        ) : [
          ...D,
          {
            id: t.id,
            status: t.status,
            task_id: t.task_name,
            input: t.input,
            startedAt: t.startedAt,
            completedAt: t.completedAt
          }
        ]), t.status === "completed" && !_.current.has(t.id) && (_.current.add(t.id), t.input && c(`✓ ${N(t.input)}`));
      } catch (t) {
        console.error("Error parsing taskUpdate:", t);
      }
    }), n.addEventListener("done", async (l) => {
      y.current = !0, C(!0);
      try {
        const t = JSON.parse(l.data);
        z(t.status);
        try {
          const D = await G();
          D.tasks && g(D.tasks);
        } catch {
          console.warn("Could not fetch final task statuses");
        }
        if (t.status === "completed" && t.results && w) {
          const D = Array.isArray(t.results) ? t.results[0] : t.results;
          c("Workflow completed", "success"), setTimeout(() => w(D), 300);
        } else t.status === "failed" && v && (c("Workflow failed", "error"), v("Workflow execution failed"));
      } catch (t) {
        console.error("Error parsing done event:", t);
      }
      n.close();
    }), n.addEventListener("error", (l) => {
      if (!(y.current || m)) {
        console.error("SSE error event:", l);
        try {
          const t = JSON.parse(l.data || "{}");
          t.error && c(`Error: ${t.error}`, "error");
        } catch {
          B.current || (c("SSE unavailable, using polling"), T());
        }
      }
    }), n.onerror = () => {
      y.current || m || (console.warn("SSE connection error"), B.current || (n.close(), T()));
    }, () => {
      n.close();
    };
  }, [
    P,
    i,
    f,
    W,
    c,
    N,
    w,
    v,
    T,
    m,
    G,
    p
  ]), {
    status: j,
    tasks: k,
    logs: J,
    elapsed: q,
    connected: Q,
    finished: m,
    addLog: c
  };
}
let Z = !1;
function oe(i) {
  if (Z || typeof document > "u") return;
  const b = document.createElement("style");
  b.setAttribute("data-workflow-debug-panel", ""), b.textContent = i, document.head.appendChild(b), Z = !0;
}
const ie = '/*! tailwindcss v4.1.18 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-space-y-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial}}}@layer theme{:root,:host{--font-sans:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--color-red-400:oklch(70.4% .191 22.216);--color-red-500:oklch(63.7% .237 25.331);--color-red-950:oklch(25.8% .092 26.042);--color-yellow-400:oklch(85.2% .199 91.936);--color-yellow-500:oklch(79.5% .184 86.047);--color-emerald-500:oklch(69.6% .17 162.48);--color-emerald-600:oklch(59.6% .145 163.225);--color-neutral-300:oklch(87% 0 0);--color-neutral-400:oklch(70.8% 0 0);--color-neutral-500:oklch(55.6% 0 0);--color-neutral-600:oklch(43.9% 0 0);--color-neutral-700:oklch(37.1% 0 0);--color-neutral-800:oklch(26.9% 0 0);--color-neutral-900:oklch(20.5% 0 0);--color-neutral-950:oklch(14.5% 0 0);--color-white:#fff;--spacing:.25rem;--container-2xl:42rem;--text-xs:.75rem;--text-xs--line-height:calc(1/.75);--text-sm:.875rem;--text-sm--line-height:calc(1.25/.875);--text-2xl:1.5rem;--text-2xl--line-height:calc(2/1.5);--font-weight-bold:700;--tracking-wider:.05em;--leading-relaxed:1.625;--animate-pulse:pulse 2s cubic-bezier(.4,0,.6,1)infinite;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4,0,.2,1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){-webkit-appearance:button;-moz-appearance:button;appearance:button}::file-selector-button{-webkit-appearance:button;-moz-appearance:button;appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}}@layer components;@layer utilities{.collapse{visibility:collapse}.absolute{position:absolute}.relative{position:relative}.top-0{top:calc(var(--spacing)*0)}.mx-auto{margin-inline:auto}.mt-2{margin-top:calc(var(--spacing)*2)}.mr-3{margin-right:calc(var(--spacing)*3)}.mb-1{margin-bottom:calc(var(--spacing)*1)}.mb-1\\.5{margin-bottom:calc(var(--spacing)*1.5)}.mb-2{margin-bottom:calc(var(--spacing)*2)}.ml-1{margin-left:calc(var(--spacing)*1)}.ml-2{margin-left:calc(var(--spacing)*2)}.flex{display:flex}.inline-block{display:inline-block}.table{display:table}.h-1{height:calc(var(--spacing)*1)}.h-1\\.5{height:calc(var(--spacing)*1.5)}.h-3{height:calc(var(--spacing)*3)}.h-full{height:100%}.max-h-20{max-height:calc(var(--spacing)*20)}.max-h-56{max-height:calc(var(--spacing)*56)}.min-h-screen{min-height:100vh}.w-1{width:calc(var(--spacing)*1)}.w-1\\.5{width:calc(var(--spacing)*1.5)}.w-3{width:calc(var(--spacing)*3)}.w-4{width:calc(var(--spacing)*4)}.w-16{width:calc(var(--spacing)*16)}.w-28{width:calc(var(--spacing)*28)}.w-full{width:100%}.max-w-2xl{max-width:var(--container-2xl)}.flex-1{flex:1}.shrink-0{flex-shrink:0}.-rotate-90{rotate:-90deg}.animate-pulse{animation:var(--animate-pulse)}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.justify-between{justify-content:space-between}.gap-1{gap:calc(var(--spacing)*1)}.gap-1\\.5{gap:calc(var(--spacing)*1.5)}.gap-2{gap:calc(var(--spacing)*2)}.gap-3{gap:calc(var(--spacing)*3)}:where(.space-y-0>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*0)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*0)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-1>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*1)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*1)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-6>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*6)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*6)*calc(1 - var(--tw-space-y-reverse)))}.gap-x-4{column-gap:calc(var(--spacing)*4)}.gap-y-1{row-gap:calc(var(--spacing)*1)}.self-stretch{align-self:stretch}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-y-auto{overflow-y:auto}.rounded{border-radius:.25rem}.rounded-full{border-radius:3.40282e38px}.border{border-style:var(--tw-border-style);border-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-neutral-600{border-color:var(--color-neutral-600)}.border-neutral-700{border-color:var(--color-neutral-700)}.border-neutral-800{border-color:var(--color-neutral-800)}.bg-emerald-500{background-color:var(--color-emerald-500)}.bg-emerald-600{background-color:var(--color-emerald-600)}.bg-neutral-600{background-color:var(--color-neutral-600)}.bg-neutral-700{background-color:var(--color-neutral-700)}.bg-neutral-800{background-color:var(--color-neutral-800)}.bg-neutral-800\\/30{background-color:#2626264d}@supports (color:color-mix(in lab,red,red)){.bg-neutral-800\\/30{background-color:color-mix(in oklab,var(--color-neutral-800)30%,transparent)}}.bg-neutral-950{background-color:var(--color-neutral-950)}.bg-red-500{background-color:var(--color-red-500)}.bg-red-950{background-color:var(--color-red-950)}.bg-red-950\\/20{background-color:#46080933}@supports (color:color-mix(in lab,red,red)){.bg-red-950\\/20{background-color:color-mix(in oklab,var(--color-red-950)20%,transparent)}}.bg-yellow-500{background-color:var(--color-yellow-500)}.p-3{padding:calc(var(--spacing)*3)}.p-8{padding:calc(var(--spacing)*8)}.px-2{padding-inline:calc(var(--spacing)*2)}.px-3{padding-inline:calc(var(--spacing)*3)}.py-0{padding-block:calc(var(--spacing)*0)}.py-1{padding-block:calc(var(--spacing)*1)}.py-1\\.5{padding-block:calc(var(--spacing)*1.5)}.py-2{padding-block:calc(var(--spacing)*2)}.py-px{padding-block:1px}.text-right{text-align:right}.font-mono{font-family:var(--font-mono)}.text-2xl{font-size:var(--text-2xl);line-height:var(--tw-leading,var(--text-2xl--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[10px\\]{font-size:10px}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.tracking-wider{--tw-tracking:var(--tracking-wider);letter-spacing:var(--tracking-wider)}.text-emerald-500{color:var(--color-emerald-500)}.text-neutral-300{color:var(--color-neutral-300)}.text-neutral-400{color:var(--color-neutral-400)}.text-neutral-500{color:var(--color-neutral-500)}.text-neutral-600{color:var(--color-neutral-600)}.text-neutral-700{color:var(--color-neutral-700)}.text-red-400{color:var(--color-red-400)}.text-red-500{color:var(--color-red-500)}.text-white{color:var(--color-white)}.text-yellow-400{color:var(--color-yellow-400)}.uppercase{text-transform:uppercase}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}@media(hover:hover){.hover\\:bg-neutral-700:hover{background-color:var(--color-neutral-700)}.hover\\:bg-neutral-900\\/30:hover{background-color:#1717174d}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-neutral-900\\/30:hover{background-color:color-mix(in oklab,var(--color-neutral-900)30%,transparent)}}.hover\\:bg-neutral-900\\/50:hover{background-color:#17171780}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-neutral-900\\/50:hover{background-color:color-mix(in oklab,var(--color-neutral-900)50%,transparent)}}}}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-tracking{syntax:"*";inherits:false}@keyframes pulse{50%{opacity:.5}}';
oe(ie);
function de({
  taskRunId: i,
  statusCheckUrl: b,
  statusUrl: W,
  streamUrl: w,
  title: v = "Workflow Debug",
  displayName: N,
  taskDefinitions: p,
  taskDescriptions: M = {},
  workflowSlug: O,
  workflowConfigured: x,
  apiReachable: S,
  onComplete: j,
  onError: z,
  collapsed: k = !1,
  onToggle: g,
  useMock: J = !1,
  mockTasks: K,
  mockLogs: q
}) {
  const L = E(null), Q = E(Date.now()), $ = te(J ? void 0 : b), m = p ?? $.tasks, C = O ?? $.workflowSlug, U = x ?? $.workflowConfigured, A = S ?? $.apiReachable, I = (e) => {
    try {
      return new URL(e).pathname || "/";
    } catch {
      return e;
    }
  }, { status: _, tasks: y, logs: B, elapsed: R, finished: P } = ne({
    taskRunId: i,
    statusUrl: W,
    streamUrl: w,
    onComplete: j,
    onError: z,
    extractPath: I,
    useMock: J,
    mockTasks: K,
    mockLogs: q
  }), f = !!i || J;
  F(() => {
    L.current && y.length > 0 && (L.current.scrollTop = L.current.scrollHeight);
  }, [y]);
  const c = (e) => {
    const a = Math.floor(e / 60), u = e % 60;
    return `${a}:${u.toString().padStart(2, "0")}`;
  }, G = (e) => {
    if (!e.startedAt) return null;
    const a = new Date(e.startedAt).getTime(), s = (e.completedAt ? new Date(e.completedAt).getTime() : Date.now()) - a;
    return s < 1e3 ? `${s}ms` : `${(s / 1e3).toFixed(1)}s`;
  }, T = [...y].sort((e, a) => {
    const u = e.startedAt ? new Date(e.startedAt).getTime() : Number.MAX_SAFE_INTEGER, s = a.startedAt ? new Date(a.startedAt).getTime() : Number.MAX_SAFE_INTEGER;
    return u - s;
  }), n = (() => {
    const e = T.filter((s) => s.startedAt);
    if (e.length === 0)
      return {
        start: Q.current,
        end: Date.now(),
        duration: R * 1e3 || 1
      };
    const a = Math.min(
      ...e.map((s) => new Date(s.startedAt ?? Date.now()).getTime())
    ), u = Math.max(
      ...e.map(
        (s) => s.completedAt ? new Date(s.completedAt).getTime() : Date.now()
      )
    );
    return { start: a, end: u, duration: Math.max(u - a, 1) };
  })(), d = (e) => {
    if (!e.startedAt) return { left: "0%", width: "0%" };
    const a = new Date(e.startedAt).getTime(), u = e.completedAt ? new Date(e.completedAt).getTime() : Date.now(), s = (a - n.start) / n.duration * 100, H = (u - a) / n.duration * 100;
    return {
      left: `${Math.max(0, s)}%`,
      width: `${Math.max(1, Math.min(100 - s, H))}%`
    };
  }, l = {};
  for (const e of m) {
    const a = T.filter((u) => u.task_id === e);
    l[e] = {
      total: a.length,
      completed: a.filter((u) => u.status === "completed").length,
      running: a.filter((u) => u.status === "running").length
    };
  }
  const t = T.filter((e) => e.status === "failed"), V = A ? U ? f ? P ? _ === "completed" ? { text: "Completed", color: "bg-emerald-500" } : { text: "Failed", color: "bg-red-500" } : { text: _.toUpperCase(), color: "bg-emerald-500 animate-pulse" } : { text: "Ready", color: "bg-emerald-500" } : { text: "Not configured", color: "bg-yellow-500" } : { text: "API unreachable", color: "bg-red-500" };
  return /* @__PURE__ */ o("div", { className: "border border-neutral-700", children: [
    /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        onClick: g,
        className: `w-full px-3 py-2 flex justify-between items-center text-xs hover:bg-neutral-900/50 transition-colors ${k ? "" : "border-b border-neutral-700"}`,
        children: [
          /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ r(
              "svg",
              {
                className: `w-3 h-3 text-neutral-500 transition-transform ${k ? "-rotate-90" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                "aria-hidden": "true",
                strokeWidth: 2,
                children: /* @__PURE__ */ r("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" })
              }
            ),
            /* @__PURE__ */ r("span", { className: "text-neutral-400 uppercase tracking-wider", children: v })
          ] }),
          /* @__PURE__ */ o("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ r("div", { className: `w-1.5 h-1.5 rounded-full ${V.color}` }),
              /* @__PURE__ */ r("span", { className: "text-neutral-500", children: V.text })
            ] }),
            f && /* @__PURE__ */ r("span", { className: "font-mono text-neutral-500", children: c(R) })
          ] })
        ]
      }
    ),
    !k && /* @__PURE__ */ o(ee, { children: [
      /* @__PURE__ */ o("div", { className: "border-b border-neutral-700 px-3 py-2", children: [
        /* @__PURE__ */ r("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5", children: "Discovered Tasks" }),
        A ? U ? m.length === 0 ? /* @__PURE__ */ o("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ o("p", { className: "mb-1", children: [
            "No tasks found",
            C ? ` for "${C}"` : ""
          ] }),
          /* @__PURE__ */ r("p", { className: "text-neutral-500 text-[10px]", children: "Deploy the workflow service first." })
        ] }) : /* @__PURE__ */ r("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs", children: m.map((e) => {
          const a = l[e];
          return /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ r("span", { className: "font-mono text-neutral-300", children: e }),
            f && a && /* @__PURE__ */ o("span", { className: "text-neutral-600", children: [
              "(",
              a.total,
              ")",
              a.total > 0 && /* @__PURE__ */ o("span", { className: "ml-1", children: [
                a.completed > 0 && /* @__PURE__ */ o("span", { className: "text-emerald-500", children: [
                  "✓",
                  a.completed
                ] }),
                a.running > 0 && /* @__PURE__ */ o("span", { className: "text-neutral-400 ml-1", children: [
                  a.running,
                  "↻"
                ] })
              ] })
            ] }),
            M[e] && /* @__PURE__ */ r("span", { className: "text-neutral-700 text-[10px]", children: M[e] })
          ] }, e);
        }) }) : /* @__PURE__ */ o("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ r("p", { className: "mb-1", children: "Workflow not configured" }),
          /* @__PURE__ */ r("p", { className: "text-neutral-500 text-[10px]", children: C ? "Set WORKFLOW_SLUG env var on your API service." : "Configure the workflow on your backend." })
        ] }) : /* @__PURE__ */ o("div", { className: "text-xs text-red-400", children: [
          /* @__PURE__ */ r("p", { className: "mb-1", children: "Cannot reach the API" }),
          /* @__PURE__ */ r("p", { className: "text-neutral-500 text-[10px]", children: "Check that the backend is deployed and API URL is set." })
        ] })
      ] }),
      f && t.length > 0 && /* @__PURE__ */ o("div", { className: "border-b border-neutral-700 px-3 py-2 bg-red-950/20", children: [
        /* @__PURE__ */ o("div", { className: "text-[10px] text-red-500 uppercase tracking-wider mb-1.5", children: [
          "Errors (",
          t.length,
          ")"
        ] }),
        /* @__PURE__ */ r("div", { className: "space-y-1", children: t.slice(0, 3).map((e) => /* @__PURE__ */ o("div", { className: "text-xs", children: [
          /* @__PURE__ */ r("span", { className: "text-red-500", children: "⚠" }),
          " ",
          /* @__PURE__ */ r("span", { className: "font-mono text-neutral-400", children: e.task_id }),
          e.input && /* @__PURE__ */ r("span", { className: "text-neutral-500 ml-2 font-mono", children: I(e.input) })
        ] }, e.id)) })
      ] }),
      f && /* @__PURE__ */ o("div", { ref: L, className: "border-b border-neutral-700 max-h-56 overflow-y-auto", children: [
        /* @__PURE__ */ r("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider px-3 py-1.5 border-b border-neutral-800", children: "Timeline" }),
        T.length === 0 && /* @__PURE__ */ o("div", { className: "p-3 flex items-center gap-2 text-xs text-neutral-400", children: [
          /* @__PURE__ */ r("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ r("span", { children: "Starting workflow..." })
        ] }),
        T.map((e) => {
          const a = d(e), u = G(e), s = e.status === "running", H = e.status === "completed", Y = e.status === "failed";
          return /* @__PURE__ */ o(
            "div",
            {
              className: "flex items-center px-2 py-0 hover:bg-neutral-900/30 text-xs",
              children: [
                /* @__PURE__ */ r("span", { className: "shrink-0 w-4", children: H ? /* @__PURE__ */ r("span", { className: "text-emerald-500", children: "✓" }) : Y ? /* @__PURE__ */ r("span", { className: "text-red-500", children: "✗" }) : s ? /* @__PURE__ */ r("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }) : /* @__PURE__ */ r("span", { className: "inline-block w-1.5 h-1.5 border border-neutral-600 rounded-full" }) }),
                /* @__PURE__ */ r("span", { className: "shrink-0 w-28 font-mono text-neutral-400 truncate", children: N && e.task_id === m[0] ? N : e.input ? I(e.input) : e.task_id || e.id || "-" }),
                /* @__PURE__ */ r("span", { className: "shrink-0 w-16 font-mono text-neutral-500 text-right mr-3", children: u || (s ? "…" : "") }),
                /* @__PURE__ */ r("div", { className: "flex-1 self-stretch py-px", children: /* @__PURE__ */ r("div", { className: "relative h-full bg-neutral-800/30", children: /* @__PURE__ */ r(
                  "div",
                  {
                    className: `absolute top-0 h-full ${Y ? "bg-red-500" : H ? "bg-neutral-600" : s ? "bg-emerald-500" : "bg-neutral-700"}`,
                    style: { left: a.left, width: a.width }
                  }
                ) }) })
              ]
            },
            e.id
          );
        })
      ] }),
      f && /* @__PURE__ */ o("div", { className: "px-3 py-2 max-h-20 overflow-y-auto", children: [
        /* @__PURE__ */ r("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1", children: "Log" }),
        /* @__PURE__ */ r("div", { className: "space-y-0", children: B.slice(0, 5).map((e) => /* @__PURE__ */ o(
          "div",
          {
            className: `text-[10px] font-mono flex gap-2 leading-relaxed ${e.type === "success" ? "text-emerald-500" : e.type === "error" ? "text-red-500" : "text-neutral-500"}`,
            children: [
              /* @__PURE__ */ r("span", { className: "text-neutral-700 shrink-0", children: e.time }),
              /* @__PURE__ */ r("span", { className: "truncate", children: e.message })
            ]
          },
          `${e.time}-${e.message}`
        )) })
      ] })
    ] })
  ] });
}
export {
  de as WorkflowDebugPanel,
  te as useWorkflowStatus,
  ne as useWorkflowStream
};
