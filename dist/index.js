import { jsxs as a, jsx as n, Fragment as q } from "react/jsx-runtime";
import { useState as $, useRef as N, useCallback as J, useEffect as W } from "react";
const z = [
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
], Q = [
  { time: "12:34:56", message: "Workflow started", type: "success" },
  { time: "12:34:55", message: "✓ Task completed" }
];
function V({
  taskRunId: c,
  statusUrl: j,
  streamUrl: I,
  onComplete: b,
  onError: u,
  extractPath: m = (p) => {
    try {
      return new URL(p).pathname || "/";
    } catch {
      return p;
    }
  },
  useMock: i = !1,
  mockTasks: O,
  mockLogs: G
}) {
  const p = O ?? z, F = G ?? Q, [K, f] = $(i ? "running" : "idle"), [B, h] = $(i ? p : []), [H, U] = $(i ? F : []), [k, C] = $(0), [R, M] = $(!1), [d, D] = $(!1), E = N(Date.now()), v = N(null), x = N(null), y = N(/* @__PURE__ */ new Set()), A = N(!1), g = N(!1), S = N(!1), L = !!c || i, T = J(
    (e) => c ? e.replace("{taskRunId}", c) : e,
    [c]
  ), l = J((e, r) => {
    const s = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    U((t) => [{ time: s, message: e, type: r }, ...t].slice(0, 15));
  }, []), P = J(async () => {
    const e = await fetch(T(j));
    if (!e.ok)
      throw new Error("Failed to fetch status");
    return e.json();
  }, [T, j]), _ = J(() => {
    if (!c || !b || !u) return;
    l("Using polling fallback");
    const e = async () => {
      if (!S.current)
        try {
          const r = await P();
          if (f(r.status), r.tasks) {
            h(r.tasks);
            for (const s of r.tasks)
              s.status === "completed" && !y.current.has(s.id) && (y.current.add(s.id), s.input && l(`✓ ${m(s.input)}`));
          }
          r.status === "completed" && r.results ? (S.current = !0, D(!0), A.current = !0, l("Workflow completed", "success"), b(r.results)) : r.status === "failed" ? (S.current = !0, D(!0), A.current = !0, l("Workflow failed", "error"), u("Workflow execution failed")) : setTimeout(e, 2e3);
        } catch (r) {
          console.error("Polling error:", r), setTimeout(e, 2e3);
        }
    };
    e();
  }, [c, l, m, b, u, P]);
  return W(() => {
    i && (f("running"), h(p), U(F), C(0), E.current = Date.now());
  }, [i, p, F]), W(() => {
    c && !i && (f("pending"), h([]), U([]), C(0), M(!1), D(!1), E.current = Date.now(), y.current = /* @__PURE__ */ new Set(), A.current = !1, S.current = !1);
  }, [c, i]), W(() => {
    if (L)
      return l("Workflow started"), v.current = setInterval(() => {
        C(Math.floor((Date.now() - E.current) / 1e3));
      }, 1e3), () => {
        v.current && clearInterval(v.current);
      };
  }, [L, l]), W(() => {
    d && v.current && (clearInterval(v.current), v.current = null);
  }, [d]), W(() => {
    var r;
    if (!L || !c || d || i) {
      (r = x.current) == null || r.close();
      return;
    }
    const e = new EventSource(T(I));
    return x.current = e, e.addEventListener("connected", () => {
      M(!0), g.current = !0, l("Connected to event stream");
    }), e.addEventListener("initial", (s) => {
      try {
        const t = JSON.parse(s.data);
        f(t.status), t.tasks && h(t.tasks);
      } catch (t) {
        console.error("Error parsing initial event:", t);
      }
    }), e.addEventListener("taskUpdate", (s) => {
      try {
        const t = JSON.parse(s.data);
        h((o) => o.find((w) => w.id === t.id) ? o.map(
          (w) => w.id === t.id ? {
            ...w,
            status: t.status,
            startedAt: t.startedAt || w.startedAt,
            completedAt: t.completedAt || w.completedAt,
            input: t.input || w.input
          } : w
        ) : [
          ...o,
          {
            id: t.id,
            status: t.status,
            task_id: t.task_name,
            input: t.input,
            startedAt: t.startedAt,
            completedAt: t.completedAt
          }
        ]), t.status === "completed" && !y.current.has(t.id) && (y.current.add(t.id), t.input && l(`✓ ${m(t.input)}`));
      } catch (t) {
        console.error("Error parsing taskUpdate:", t);
      }
    }), e.addEventListener("done", async (s) => {
      A.current = !0, D(!0);
      try {
        const t = JSON.parse(s.data);
        f(t.status);
        try {
          const o = await P();
          o.tasks && h(o.tasks);
        } catch {
          console.warn("Could not fetch final task statuses");
        }
        if (t.status === "completed" && t.results && b) {
          const o = Array.isArray(t.results) ? t.results[0] : t.results;
          l("Workflow completed", "success"), setTimeout(() => b(o), 300);
        } else t.status === "failed" && u && (l("Workflow failed", "error"), u("Workflow execution failed"));
      } catch (t) {
        console.error("Error parsing done event:", t);
      }
      e.close();
    }), e.addEventListener("error", (s) => {
      if (!(A.current || d)) {
        console.error("SSE error event:", s);
        try {
          const t = JSON.parse(s.data || "{}");
          t.error && l(`Error: ${t.error}`, "error");
        } catch {
          g.current || (l("SSE unavailable, using polling"), _());
        }
      }
    }), e.onerror = () => {
      A.current || d || (console.warn("SSE connection error"), g.current || (e.close(), _()));
    }, () => {
      e.close();
    };
  }, [
    L,
    c,
    T,
    I,
    l,
    m,
    b,
    u,
    _,
    d,
    P,
    i
  ]), {
    status: K,
    tasks: B,
    logs: H,
    elapsed: k,
    connected: R,
    finished: d,
    addLog: l
  };
}
function ee({
  taskRunId: c,
  statusUrl: j,
  streamUrl: I,
  title: b = "Workflow Debug",
  displayName: u,
  taskDefinitions: m = [],
  taskDescriptions: i = {},
  workflowSlug: O,
  workflowConfigured: G = !0,
  apiReachable: p = !0,
  onComplete: F,
  onError: K,
  collapsed: f = !1,
  onToggle: B,
  useMock: h = !1,
  mockTasks: H,
  mockLogs: U
}) {
  const k = N(null), C = N(Date.now()), R = (e) => {
    try {
      return new URL(e).pathname || "/";
    } catch {
      return e;
    }
  }, { status: M, tasks: d, logs: D, elapsed: E, finished: v } = V({
    taskRunId: c,
    statusUrl: j,
    streamUrl: I,
    onComplete: F,
    onError: K,
    extractPath: R,
    useMock: h,
    mockTasks: H,
    mockLogs: U
  }), x = !!c || h;
  W(() => {
    k.current && d.length > 0 && (k.current.scrollTop = k.current.scrollHeight);
  }, [d]);
  const y = (e) => {
    const r = Math.floor(e / 60), s = e % 60;
    return `${r}:${s.toString().padStart(2, "0")}`;
  }, A = (e) => {
    if (!e.startedAt) return null;
    const r = new Date(e.startedAt).getTime(), t = (e.completedAt ? new Date(e.completedAt).getTime() : Date.now()) - r;
    return t < 1e3 ? `${t}ms` : `${(t / 1e3).toFixed(1)}s`;
  }, g = [...d].sort((e, r) => {
    const s = e.startedAt ? new Date(e.startedAt).getTime() : Number.MAX_SAFE_INTEGER, t = r.startedAt ? new Date(r.startedAt).getTime() : Number.MAX_SAFE_INTEGER;
    return s - t;
  }), S = (() => {
    const e = g.filter((t) => t.startedAt);
    if (e.length === 0)
      return {
        start: C.current,
        end: Date.now(),
        duration: E * 1e3 || 1
      };
    const r = Math.min(
      ...e.map((t) => new Date(t.startedAt ?? Date.now()).getTime())
    ), s = Math.max(
      ...e.map(
        (t) => t.completedAt ? new Date(t.completedAt).getTime() : Date.now()
      )
    );
    return { start: r, end: s, duration: Math.max(s - r, 1) };
  })(), L = (e) => {
    if (!e.startedAt) return { left: "0%", width: "0%" };
    const r = new Date(e.startedAt).getTime(), s = e.completedAt ? new Date(e.completedAt).getTime() : Date.now(), t = (r - S.start) / S.duration * 100, o = (s - r) / S.duration * 100;
    return {
      left: `${Math.max(0, t)}%`,
      width: `${Math.max(1, Math.min(100 - t, o))}%`
    };
  }, T = {};
  for (const e of m) {
    const r = g.filter((s) => s.task_id === e);
    T[e] = {
      total: r.length,
      completed: r.filter((s) => s.status === "completed").length,
      running: r.filter((s) => s.status === "running").length
    };
  }
  const l = g.filter((e) => e.status === "failed"), _ = p ? G ? x ? v ? M === "completed" ? { text: "Completed", color: "bg-emerald-500" } : { text: "Failed", color: "bg-red-500" } : { text: M.toUpperCase(), color: "bg-emerald-500 animate-pulse" } : { text: "Ready", color: "bg-emerald-500" } : { text: "Not configured", color: "bg-yellow-500" } : { text: "API unreachable", color: "bg-red-500" };
  return /* @__PURE__ */ a("div", { className: "border border-neutral-700", children: [
    /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: B,
        className: `w-full px-3 py-2 flex justify-between items-center text-xs hover:bg-neutral-900/50 transition-colors ${f ? "" : "border-b border-neutral-700"}`,
        children: [
          /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ n(
              "svg",
              {
                className: `w-3 h-3 text-neutral-500 transition-transform ${f ? "-rotate-90" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                "aria-hidden": "true",
                strokeWidth: 2,
                children: /* @__PURE__ */ n("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" })
              }
            ),
            /* @__PURE__ */ n("span", { className: "text-neutral-400 uppercase tracking-wider", children: b })
          ] }),
          /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ n("div", { className: `w-1.5 h-1.5 rounded-full ${_.color}` }),
              /* @__PURE__ */ n("span", { className: "text-neutral-500", children: _.text })
            ] }),
            x && /* @__PURE__ */ n("span", { className: "font-mono text-neutral-500", children: y(E) })
          ] })
        ]
      }
    ),
    !f && /* @__PURE__ */ a(q, { children: [
      /* @__PURE__ */ a("div", { className: "border-b border-neutral-700 px-3 py-2", children: [
        /* @__PURE__ */ n("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5", children: "Discovered Tasks" }),
        p ? G ? m.length === 0 ? /* @__PURE__ */ a("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ a("p", { className: "mb-1", children: [
            "No tasks found",
            O ? ` for "${O}"` : ""
          ] }),
          /* @__PURE__ */ n("p", { className: "text-neutral-500 text-[10px]", children: "Deploy the workflow service first." })
        ] }) : /* @__PURE__ */ n("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs", children: m.map((e) => {
          const r = T[e];
          return /* @__PURE__ */ a("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ n("span", { className: "font-mono text-neutral-300", children: e }),
            x && r && /* @__PURE__ */ a("span", { className: "text-neutral-600", children: [
              "(",
              r.total,
              ")",
              r.total > 0 && /* @__PURE__ */ a("span", { className: "ml-1", children: [
                r.completed > 0 && /* @__PURE__ */ a("span", { className: "text-emerald-500", children: [
                  "✓",
                  r.completed
                ] }),
                r.running > 0 && /* @__PURE__ */ a("span", { className: "text-neutral-400 ml-1", children: [
                  r.running,
                  "↻"
                ] })
              ] })
            ] }),
            i[e] && /* @__PURE__ */ n("span", { className: "text-neutral-700 text-[10px]", children: i[e] })
          ] }, e);
        }) }) : /* @__PURE__ */ a("div", { className: "text-xs text-yellow-400", children: [
          /* @__PURE__ */ n("p", { className: "mb-1", children: "Workflow not configured" }),
          /* @__PURE__ */ n("p", { className: "text-neutral-500 text-[10px]", children: O ? "Set WORKFLOW_SLUG env var on your API service." : "Configure the workflow on your backend." })
        ] }) : /* @__PURE__ */ a("div", { className: "text-xs text-red-400", children: [
          /* @__PURE__ */ n("p", { className: "mb-1", children: "Cannot reach the API" }),
          /* @__PURE__ */ n("p", { className: "text-neutral-500 text-[10px]", children: "Check that the backend is deployed and API URL is set." })
        ] })
      ] }),
      x && l.length > 0 && /* @__PURE__ */ a("div", { className: "border-b border-neutral-700 px-3 py-2 bg-red-950/20", children: [
        /* @__PURE__ */ a("div", { className: "text-[10px] text-red-500 uppercase tracking-wider mb-1.5", children: [
          "Errors (",
          l.length,
          ")"
        ] }),
        /* @__PURE__ */ n("div", { className: "space-y-1", children: l.slice(0, 3).map((e) => /* @__PURE__ */ a("div", { className: "text-xs", children: [
          /* @__PURE__ */ n("span", { className: "text-red-500", children: "⚠" }),
          " ",
          /* @__PURE__ */ n("span", { className: "font-mono text-neutral-400", children: e.task_id }),
          e.input && /* @__PURE__ */ n("span", { className: "text-neutral-500 ml-2 font-mono", children: R(e.input) })
        ] }, e.id)) })
      ] }),
      x && /* @__PURE__ */ a("div", { ref: k, className: "border-b border-neutral-700 max-h-56 overflow-y-auto", children: [
        /* @__PURE__ */ n("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider px-3 py-1.5 border-b border-neutral-800", children: "Timeline" }),
        g.length === 0 && /* @__PURE__ */ a("div", { className: "p-3 flex items-center gap-2 text-xs text-neutral-400", children: [
          /* @__PURE__ */ n("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ n("span", { children: "Starting workflow..." })
        ] }),
        g.map((e) => {
          const r = L(e), s = A(e), t = e.status === "running", o = e.status === "completed", X = e.status === "failed";
          return /* @__PURE__ */ a(
            "div",
            {
              className: "flex items-center px-2 py-0 hover:bg-neutral-900/30 text-xs",
              children: [
                /* @__PURE__ */ n("span", { className: "shrink-0 w-4", children: o ? /* @__PURE__ */ n("span", { className: "text-emerald-500", children: "✓" }) : X ? /* @__PURE__ */ n("span", { className: "text-red-500", children: "✗" }) : t ? /* @__PURE__ */ n("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }) : /* @__PURE__ */ n("span", { className: "inline-block w-1.5 h-1.5 border border-neutral-600 rounded-full" }) }),
                /* @__PURE__ */ n("span", { className: "shrink-0 w-28 font-mono text-neutral-400 truncate", children: u && e.task_id === m[0] ? u : e.input ? R(e.input) : e.task_id || e.id || "-" }),
                /* @__PURE__ */ n("span", { className: "shrink-0 w-16 font-mono text-neutral-500 text-right mr-3", children: s || (t ? "…" : "") }),
                /* @__PURE__ */ n("div", { className: "flex-1 self-stretch py-px", children: /* @__PURE__ */ n("div", { className: "relative h-full bg-neutral-800/30", children: /* @__PURE__ */ n(
                  "div",
                  {
                    className: `absolute top-0 h-full ${X ? "bg-red-500" : o ? "bg-neutral-600" : t ? "bg-emerald-500" : "bg-neutral-700"}`,
                    style: { left: r.left, width: r.width }
                  }
                ) }) })
              ]
            },
            e.id
          );
        })
      ] }),
      x && /* @__PURE__ */ a("div", { className: "px-3 py-2 max-h-20 overflow-y-auto", children: [
        /* @__PURE__ */ n("div", { className: "text-[10px] text-neutral-600 uppercase tracking-wider mb-1", children: "Log" }),
        /* @__PURE__ */ n("div", { className: "space-y-0", children: D.slice(0, 5).map((e) => /* @__PURE__ */ a(
          "div",
          {
            className: `text-[10px] font-mono flex gap-2 leading-relaxed ${e.type === "success" ? "text-emerald-500" : e.type === "error" ? "text-red-500" : "text-neutral-500"}`,
            children: [
              /* @__PURE__ */ n("span", { className: "text-neutral-700 shrink-0", children: e.time }),
              /* @__PURE__ */ n("span", { className: "truncate", children: e.message })
            ]
          },
          `${e.time}-${e.message}`
        )) })
      ] })
    ] })
  ] });
}
export {
  ee as WorkflowDebugPanel,
  V as useWorkflowStream
};
