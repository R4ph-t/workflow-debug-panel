import { JSX } from 'react/jsx-runtime';

/**
 * A log entry displayed in the debug panel
 */
export declare interface LogEntry {
    time: string;
    message: string;
    type?: 'success' | 'error';
}

/**
 * Done event data from SSE stream
 */
export declare interface SSEDoneEvent<TResult = unknown> {
    status: WorkflowStatus;
    results?: TResult | TResult[];
}

/**
 * Error event data from SSE stream
 */
export declare interface SSEErrorEvent {
    error: string;
}

/**
 * SSE event types from Render Workflows API
 */
export declare type SSEEventType = 'connected' | 'initial' | 'taskUpdate' | 'done' | 'error';

/**
 * Initial event data from SSE stream
 */
export declare interface SSEInitialEvent {
    status: WorkflowStatus;
    tasks?: TaskRun[];
}

/**
 * Task update event data from SSE stream
 */
export declare interface SSETaskUpdateEvent {
    id: string;
    task_name: string;
    status: TaskStatus;
    input?: string;
    startedAt?: string;
    completedAt?: string;
}

/**
 * Response shape from the status endpoint
 */
export declare interface StatusResponse<TResult = unknown> {
    status: WorkflowStatus;
    tasks?: TaskRun[];
    results?: TResult;
}

/**
 * A task run instance from Render Workflows
 */
export declare interface TaskRun {
    id: string;
    status: TaskStatus;
    task_id?: string;
    input?: string;
    startedAt?: string;
    completedAt?: string;
}

/**
 * Task status values from Render Workflows API
 */
export declare type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Hook for managing SSE connection and polling fallback for Render Workflows
 */
export declare function useWorkflowStream<TResult = unknown>({ taskRunId, statusUrl, streamUrl, onComplete, onError, extractPath, useMock, mockTasks, mockLogs, }: UseWorkflowStreamOptions<TResult>): UseWorkflowStreamResult;

declare interface UseWorkflowStreamOptions<TResult> {
    taskRunId: string | null | undefined;
    statusUrl: string;
    streamUrl: string;
    onComplete?: (result: TResult) => void;
    onError?: (message: string) => void;
    extractPath?: (input: string) => string;
    useMock?: boolean;
    mockTasks?: TaskRun[];
    mockLogs?: LogEntry[];
}

declare interface UseWorkflowStreamResult {
    status: WorkflowStatus;
    tasks: TaskRun[];
    logs: LogEntry[];
    elapsed: number;
    connected: boolean;
    finished: boolean;
    addLog: (message: string, type?: LogEntry['type']) => void;
}

/**
 * A reusable debug panel for monitoring Render Workflows execution.
 *
 * Displays real-time task status, timeline visualization, and logs
 * for workflow runs. Connects via SSE with polling fallback.
 */
export declare function WorkflowDebugPanel<TResult = unknown>({ taskRunId, statusUrl, streamUrl, title, displayName, taskDefinitions, taskDescriptions, workflowSlug, workflowConfigured, apiReachable, onComplete, onError, collapsed, onToggle, useMock, mockTasks, mockLogs, }: WorkflowDebugPanelProps<TResult>): JSX.Element;

/**
 * Props for the WorkflowDebugPanel component
 */
export declare interface WorkflowDebugPanelProps<TResult = unknown> {
    /**
     * The task run ID to monitor. When provided, the panel starts monitoring.
     */
    taskRunId?: string | null;
    /**
     * URL template for fetching task status.
     * Use {taskRunId} as placeholder for the task run ID.
     * @example "/api/audit/{taskRunId}"
     */
    statusUrl: string;
    /**
     * URL template for the SSE stream.
     * Use {taskRunId} as placeholder for the task run ID.
     * @example "/api/audit/{taskRunId}/stream"
     */
    streamUrl: string;
    /**
     * Title shown in the panel header.
     * @default "Workflow Debug"
     */
    title?: string;
    /**
     * Display name shown in the timeline (e.g., URL being processed, order ID).
     */
    displayName?: string;
    /**
     * List of task definition names in this workflow.
     * Used to show discovered tasks section.
     */
    taskDefinitions?: string[];
    /**
     * Descriptions for each task definition.
     * @example { audit_site: "Entry point (root)", crawl_pages: "Discovers pages" }
     */
    taskDescriptions?: Record<string, string>;
    /**
     * The workflow slug (for display in not-configured state).
     */
    workflowSlug?: string | null;
    /**
     * Whether the workflow is properly configured.
     * When false, shows a configuration warning.
     */
    workflowConfigured?: boolean;
    /**
     * Whether the API is reachable.
     * When false, shows an API unreachable error.
     */
    apiReachable?: boolean;
    /**
     * Callback when the workflow completes successfully.
     */
    onComplete?: (result: TResult) => void;
    /**
     * Callback when an error occurs.
     */
    onError?: (message: string) => void;
    /**
     * Whether the panel is collapsed.
     */
    collapsed?: boolean;
    /**
     * Callback when the collapse toggle is clicked.
     */
    onToggle?: () => void;
    /**
     * Enable mock mode for local UI development.
     * Uses mock data instead of real API calls.
     */
    useMock?: boolean;
    /**
     * Custom mock tasks for development.
     */
    mockTasks?: TaskRun[];
    /**
     * Custom mock logs for development.
     */
    mockLogs?: LogEntry[];
}

/**
 * Workflow status values from Render Workflows API
 */
export declare type WorkflowStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed';

export { }
