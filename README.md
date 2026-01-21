# Workflow Debug Panel

A reusable React component for debugging [Render Workflows](https://render.com/docs/workflows) in demo applications.

Provides real-time task monitoring with SSE streaming and polling fallback, timeline visualization, and log display.

## Features

- Real-time task monitoring via SSE with polling fallback
- Timeline visualization with task durations
- Self-contained CSS (no Tailwind configuration required)
- Mock mode for local development
- TypeScript support

## Requirements

- React 18 or 19

## Installation

```bash
npm install github:render-examples/workflow-debug-panel
```

## Usage

```tsx
import { WorkflowDebugPanel } from 'workflow-debug-panel'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [taskRunId, setTaskRunId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <WorkflowDebugPanel
      taskRunId={taskRunId}
      statusUrl={`${API_URL}/audit/{taskRunId}`}
      streamUrl={`${API_URL}/audit/{taskRunId}/stream`}
      displayName="https://example.com"
      taskDefinitions={['audit_site', 'crawl_pages', 'analyze_page']}
      taskDescriptions={{
        audit_site: 'Entry point (root)',
        crawl_pages: 'Discovers pages',
        analyze_page: 'Runs SEO checks',
      }}
      onComplete={(result) => console.log('Done:', result)}
      onError={(error) => console.error('Error:', error)}
      collapsed={collapsed}
      onToggle={() => setCollapsed(!collapsed)}
    />
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `taskRunId` | `string \| null` | No | The task run ID to monitor. When provided, starts monitoring. |
| `statusUrl` | `string` | Yes | URL template for status endpoint. Use `{taskRunId}` as placeholder. |
| `streamUrl` | `string` | Yes | URL template for SSE stream. Use `{taskRunId}` as placeholder. |
| `title` | `string` | No | Panel header title. Default: `"Workflow Debug"` |
| `displayName` | `string` | No | Display name shown in timeline (e.g., URL being processed). |
| `taskDefinitions` | `string[]` | No | List of task names in this workflow. |
| `taskDescriptions` | `Record<string, string>` | No | Descriptions for each task. |
| `workflowSlug` | `string \| null` | No | Workflow slug for configuration messages. |
| `workflowConfigured` | `boolean` | No | Whether workflow is configured. Default: `true` |
| `apiReachable` | `boolean` | No | Whether API is reachable. Default: `true` |
| `onComplete` | `(result: TResult) => void` | No | Callback when workflow completes. |
| `onError` | `(message: string) => void` | No | Callback when error occurs. |
| `collapsed` | `boolean` | No | Whether panel is collapsed. Default: `false` |
| `onToggle` | `() => void` | No | Callback when collapse toggle is clicked. |
| `useMock` | `boolean` | No | Enable mock mode for development. |
| `mockTasks` | `TaskRun[]` | No | Custom mock tasks for development. |
| `mockLogs` | `LogEntry[]` | No | Custom mock logs for development. |

## Backend API Contract

Your backend needs to provide two endpoints that proxy the Render Workflows API:

### Status Endpoint

```
GET /your-path/{taskRunId}
```

Response:
```json
{
  "status": "pending" | "running" | "completed" | "failed",
  "tasks": [
    {
      "id": "trn-xxx",
      "task_id": "task_name",
      "status": "completed",
      "input": "...",
      "startedAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:00:01Z"
    }
  ],
  "results": { ... }
}
```

### SSE Stream Endpoint

```
GET /your-path/{taskRunId}/stream
```

Events (from Render Workflows API):
- `connected` - Connection established
- `initial` - Initial state with `{ status, tasks }`
- `taskUpdate` - Task status change with `{ id, task_name, status, input, startedAt, completedAt }`
- `done` - Workflow completed with `{ status, results }`
- `error` - Error with `{ error }`

## Using the Hook Directly

You can also use the underlying hook for custom implementations:

```tsx
import { useWorkflowStream } from 'workflow-debug-panel'

function CustomDebugPanel() {
  const { status, tasks, logs, elapsed, connected, finished, addLog } =
    useWorkflowStream({
      taskRunId: 'trn-xxx',
      statusUrl: '/api/tasks/{taskRunId}',
      streamUrl: '/api/tasks/{taskRunId}/stream',
      onComplete: (result) => console.log(result),
      onError: (error) => console.error(error),
    })

  // Build your own UI
}
```

## Development

```bash
# Install dependencies
npm install

# Run dev preview with mock data
npm run dev

# Build the library
npm run build
```

The dev preview lets you test different component states (ready, running, not configured, API unreachable) with mock data.

## License

MIT
