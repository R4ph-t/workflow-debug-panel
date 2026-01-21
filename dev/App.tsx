import React, { useState } from "react";
import type { LogEntry, TaskRun } from "../src";
import { WorkflowDebugPanel } from "../src";

// Mock data that simulates a running workflow
const MOCK_TASKS: TaskRun[] = [
  {
    id: "trn-001",
    task_id: "audit_site",
    status: "completed",
    input: "https://example.com",
    startedAt: new Date(Date.now() - 45000).toISOString(),
    completedAt: new Date(Date.now() - 40000).toISOString(),
  },
  {
    id: "trn-002",
    task_id: "crawl_pages",
    status: "completed",
    input: "https://example.com",
    startedAt: new Date(Date.now() - 39000).toISOString(),
    completedAt: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: "trn-003",
    task_id: "analyze_page",
    status: "completed",
    input: "https://example.com/",
    startedAt: new Date(Date.now() - 29000).toISOString(),
    completedAt: new Date(Date.now() - 27000).toISOString(),
  },
  {
    id: "trn-004",
    task_id: "analyze_page",
    status: "completed",
    input: "https://example.com/about",
    startedAt: new Date(Date.now() - 28000).toISOString(),
    completedAt: new Date(Date.now() - 25000).toISOString(),
  },
  {
    id: "trn-005",
    task_id: "analyze_page",
    status: "running",
    input: "https://example.com/contact",
    startedAt: new Date(Date.now() - 5000).toISOString(),
  },
  {
    id: "trn-006",
    task_id: "analyze_page",
    status: "running",
    input: "https://example.com/blog",
    startedAt: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: "trn-007",
    task_id: "analyze_page",
    status: "pending",
    input: "https://example.com/pricing",
  },
  {
    id: "trn-008",
    task_id: "analyze_page",
    status: "failed",
    input: "https://example.com/broken",
    startedAt: new Date(Date.now() - 20000).toISOString(),
    completedAt: new Date(Date.now() - 18000).toISOString(),
  },
];

const MOCK_LOGS: LogEntry[] = [
  { time: "12:34:56", message: "Spawned analyze_page tasks" },
  { time: "12:34:50", message: "✓ crawl_pages complete" },
  { time: "12:34:48", message: "crawl_pages started" },
  { time: "12:34:45", message: "Connected to event stream" },
  { time: "12:34:44", message: "Workflow started" },
];

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [scenario, setScenario] = useState<
    "running" | "ready" | "not-configured" | "api-down"
  >("ready");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Workflow Debug Panel</h1>
        <p className="text-neutral-400 text-sm">
          Development preview with mock data
        </p>
      </div>

      {/* Scenario selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setScenario("ready")}
          className={`px-3 py-1.5 text-xs rounded ${scenario === "ready" ? "bg-emerald-600" : "bg-neutral-800 hover:bg-neutral-700"}`}
        >
          Ready (idle)
        </button>
        <button
          type="button"
          onClick={() => setScenario("running")}
          className={`px-3 py-1.5 text-xs rounded ${scenario === "running" ? "bg-emerald-600" : "bg-neutral-800 hover:bg-neutral-700"}`}
        >
          Running
        </button>
        <button
          type="button"
          onClick={() => setScenario("not-configured")}
          className={`px-3 py-1.5 text-xs rounded ${scenario === "not-configured" ? "bg-emerald-600" : "bg-neutral-800 hover:bg-neutral-700"}`}
        >
          Not Configured
        </button>
        <button
          type="button"
          onClick={() => setScenario("api-down")}
          className={`px-3 py-1.5 text-xs rounded ${scenario === "api-down" ? "bg-emerald-600" : "bg-neutral-800 hover:bg-neutral-700"}`}
        >
          API Unreachable
        </button>
      </div>

      {/* The component */}
      <WorkflowDebugPanel
        taskRunId={scenario === "running" ? "trn-mock-123" : null}
        statusUrl="/api/audit/{taskRunId}"
        streamUrl="/api/audit/{taskRunId}/stream"
        displayName="example.com"
        taskDefinitions={["audit_site", "crawl_pages", "analyze_page"]}
        taskDescriptions={{
          audit_site: "Entry point (root)",
          crawl_pages: "Discovers pages",
          analyze_page: "Runs SEO checks",
        }}
        workflowSlug="seo-audit"
        workflowConfigured={scenario !== "not-configured"}
        apiReachable={scenario !== "api-down"}
        onComplete={(result) => console.log("Complete:", result)}
        onError={(error) => console.error("Error:", error)}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        useMock={scenario === "running"}
        mockTasks={MOCK_TASKS}
        mockLogs={MOCK_LOGS}
      />

      {/* Info */}
      <div className="text-xs text-neutral-600 space-y-1">
        <p>Switch scenarios above to see different states.</p>
        <p>Check the console for onComplete/onError callbacks.</p>
        <p className="mt-2 text-neutral-500">
          Note: This preview uses explicit props for testing. In production, use{" "}
          <code className="text-neutral-400">statusCheckUrl</code> for automatic status fetching.
        </p>
      </div>
    </div>
  );
}
