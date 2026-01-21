/**
 * Task status values from Render Workflows API
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'

/**
 * Workflow status values from Render Workflows API
 */
export type WorkflowStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed'

/**
 * A task run instance from Render Workflows
 */
export interface TaskRun {
  id: string
  status: TaskStatus
  task_id?: string
  input?: string
  startedAt?: string
  completedAt?: string
}

/**
 * A log entry displayed in the debug panel
 */
export interface LogEntry {
  time: string
  message: string
  type?: 'success' | 'error'
}

/**
 * Response shape from the status endpoint
 */
export interface StatusResponse<TResult = unknown> {
  status: WorkflowStatus
  tasks?: TaskRun[]
  results?: TResult
}

/**
 * Props for the WorkflowDebugPanel component
 */
export interface WorkflowDebugPanelProps<TResult = unknown> {
  /**
   * The task run ID to monitor. When provided, the panel starts monitoring.
   */
  taskRunId?: string | null

  /**
   * URL for checking workflow status (tasks, configuration).
   * If provided, the component will fetch task definitions and workflow status automatically.
   * @example "/api/status"
   */
  statusCheckUrl?: string

  /**
   * URL template for fetching task status.
   * Use {taskRunId} as placeholder for the task run ID.
   * @example "/api/audit/{taskRunId}"
   */
  statusUrl: string

  /**
   * URL template for the SSE stream.
   * Use {taskRunId} as placeholder for the task run ID.
   * @example "/api/audit/{taskRunId}/stream"
   */
  streamUrl: string

  /**
   * Title shown in the panel header.
   * @default "Workflow Debug"
   */
  title?: string

  /**
   * Display name shown in the timeline (e.g., URL being processed, order ID).
   */
  displayName?: string

  /**
   * List of task definition names in this workflow.
   * Used to show discovered tasks section.
   */
  taskDefinitions?: string[]

  /**
   * Descriptions for each task definition.
   * @example { audit_site: "Entry point (root)", crawl_pages: "Discovers pages" }
   */
  taskDescriptions?: Record<string, string>

  /**
   * The workflow slug (for display in not-configured state).
   */
  workflowSlug?: string | null

  /**
   * Whether the workflow is properly configured.
   * When false, shows a configuration warning.
   */
  workflowConfigured?: boolean

  /**
   * Whether the API is reachable.
   * When false, shows an API unreachable error.
   */
  apiReachable?: boolean

  /**
   * Callback when the workflow completes successfully.
   */
  onComplete?: (result: TResult) => void

  /**
   * Callback when an error occurs.
   */
  onError?: (message: string) => void

  /**
   * Whether the panel is collapsed.
   */
  collapsed?: boolean

  /**
   * Callback when the collapse toggle is clicked.
   */
  onToggle?: () => void

  /**
   * Enable mock mode for local UI development.
   * Uses mock data instead of real API calls.
   */
  useMock?: boolean

  /**
   * Custom mock tasks for development.
   */
  mockTasks?: TaskRun[]

  /**
   * Custom mock logs for development.
   */
  mockLogs?: LogEntry[]
}

/**
 * SSE event types from Render Workflows API
 */
export type SSEEventType = 'connected' | 'initial' | 'taskUpdate' | 'done' | 'error'

/**
 * Initial event data from SSE stream
 */
export interface SSEInitialEvent {
  status: WorkflowStatus
  tasks?: TaskRun[]
}

/**
 * Task update event data from SSE stream
 */
export interface SSETaskUpdateEvent {
  id: string
  task_name: string
  status: TaskStatus
  input?: string
  startedAt?: string
  completedAt?: string
}

/**
 * Done event data from SSE stream
 */
export interface SSEDoneEvent<TResult = unknown> {
  status: WorkflowStatus
  results?: TResult | TResult[]
}

/**
 * Error event data from SSE stream
 */
export interface SSEErrorEvent {
  error: string
}
