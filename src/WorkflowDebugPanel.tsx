import { useEffect, useRef } from 'react'
import { useWorkflowStream } from './hooks/useWorkflowStream'
import { injectStyles } from './injectStyles'
import type { TaskRun, WorkflowDebugPanelProps } from './types'
import styles from './styles.css?inline'

// Inject styles on module load
injectStyles(styles)

/**
 * A reusable debug panel for monitoring Render Workflows execution.
 *
 * Displays real-time task status, timeline visualization, and logs
 * for workflow runs. Connects via SSE with polling fallback.
 */
export function WorkflowDebugPanel<TResult = unknown>({
  taskRunId,
  statusUrl,
  streamUrl,
  title = 'Workflow Debug',
  displayName,
  taskDefinitions = [],
  taskDescriptions = {},
  workflowSlug,
  workflowConfigured = true,
  apiReachable = true,
  onComplete,
  onError,
  collapsed = false,
  onToggle,
  useMock = false,
  mockTasks,
  mockLogs,
}: WorkflowDebugPanelProps<TResult>) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const startTime = useRef(Date.now())

  const extractPath = (urlStr: string): string => {
    try {
      const u = new URL(urlStr)
      return u.pathname || '/'
    } catch {
      return urlStr
    }
  }

  const { status, tasks, logs, elapsed, finished } = useWorkflowStream<TResult>({
    taskRunId,
    statusUrl,
    streamUrl,
    onComplete,
    onError,
    extractPath,
    useMock,
    mockTasks,
    mockLogs,
  })

  const isRunning = !!taskRunId || useMock

  // Auto-scroll timeline
  useEffect(() => {
    if (timelineRef.current && tasks.length > 0) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight
    }
  }, [tasks])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTaskDuration = (task: TaskRun): string | null => {
    if (!task.startedAt) return null
    const start = new Date(task.startedAt).getTime()
    const end = task.completedAt ? new Date(task.completedAt).getTime() : Date.now()
    const durationMs = end - start
    if (durationMs < 1000) return `${durationMs}ms`
    return `${(durationMs / 1000).toFixed(1)}s`
  }

  const allTasks = [...tasks].sort((a, b) => {
    const aTime = a.startedAt ? new Date(a.startedAt).getTime() : Number.MAX_SAFE_INTEGER
    const bTime = b.startedAt ? new Date(b.startedAt).getTime() : Number.MAX_SAFE_INTEGER
    return aTime - bTime
  })

  const timelineBounds = (() => {
    const tasksWithTime = allTasks.filter((t) => t.startedAt)
    if (tasksWithTime.length === 0) {
      return {
        start: startTime.current,
        end: Date.now(),
        duration: elapsed * 1000 || 1,
      }
    }
    const start = Math.min(
      ...tasksWithTime.map((t) => new Date(t.startedAt ?? Date.now()).getTime())
    )
    const end = Math.max(
      ...tasksWithTime.map((t) =>
        t.completedAt ? new Date(t.completedAt).getTime() : Date.now()
      )
    )
    return { start, end, duration: Math.max(end - start, 1) }
  })()

  const getBarStyle = (task: TaskRun): { left: string; width: string } => {
    if (!task.startedAt) return { left: '0%', width: '0%' }
    const taskStart = new Date(task.startedAt).getTime()
    const taskEnd = task.completedAt ? new Date(task.completedAt).getTime() : Date.now()
    const left = ((taskStart - timelineBounds.start) / timelineBounds.duration) * 100
    const width = ((taskEnd - taskStart) / timelineBounds.duration) * 100
    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.max(1, Math.min(100 - left, width))}%`,
    }
  }

  // Build task stats dynamically based on taskDefinitions
  const taskStats: Record<string, { total: number; completed: number; running: number }> = {}
  for (const taskName of taskDefinitions) {
    const tasksOfType = allTasks.filter((t) => t.task_id === taskName)
    taskStats[taskName] = {
      total: tasksOfType.length,
      completed: tasksOfType.filter((t) => t.status === 'completed').length,
      running: tasksOfType.filter((t) => t.status === 'running').length,
    }
  }

  const failedTasks = allTasks.filter((t) => t.status === 'failed')

  // Determine header status
  const getHeaderStatus = () => {
    if (!apiReachable) return { text: 'API unreachable', color: 'bg-red-500' }
    if (!workflowConfigured) return { text: 'Not configured', color: 'bg-yellow-500' }
    if (!isRunning) return { text: 'Ready', color: 'bg-emerald-500' }
    if (finished) {
      return status === 'completed'
        ? { text: 'Completed', color: 'bg-emerald-500' }
        : { text: 'Failed', color: 'bg-red-500' }
    }
    return { text: status.toUpperCase(), color: 'bg-emerald-500 animate-pulse' }
  }

  const headerStatus = getHeaderStatus()

  return (
    <div className="border border-neutral-700">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-3 py-2 flex justify-between items-center text-xs hover:bg-neutral-900/50 transition-colors ${!collapsed ? 'border-b border-neutral-700' : ''}`}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3 h-3 text-neutral-500 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-neutral-400 uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${headerStatus.color}`} />
            <span className="text-neutral-500">{headerStatus.text}</span>
          </div>
          {isRunning && (
            <span className="font-mono text-neutral-500">{formatTime(elapsed)}</span>
          )}
        </div>
      </button>

      {!collapsed && (
        <>
          {/* Discovered Tasks / Config Status */}
          <div className="border-b border-neutral-700 px-3 py-2">
            <div className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5">
              Discovered Tasks
            </div>

            {!apiReachable ? (
              <div className="text-xs text-red-400">
                <p className="mb-1">Cannot reach the API</p>
                <p className="text-neutral-500 text-[10px]">
                  Check that the backend is deployed and API URL is set.
                </p>
              </div>
            ) : !workflowConfigured ? (
              <div className="text-xs text-yellow-400">
                <p className="mb-1">Workflow not configured</p>
                <p className="text-neutral-500 text-[10px]">
                  {workflowSlug
                    ? `Set WORKFLOW_SLUG env var on your API service.`
                    : 'Configure the workflow on your backend.'}
                </p>
              </div>
            ) : taskDefinitions.length === 0 ? (
              <div className="text-xs text-yellow-400">
                <p className="mb-1">
                  No tasks found{workflowSlug ? ` for "${workflowSlug}"` : ''}
                </p>
                <p className="text-neutral-500 text-[10px]">
                  Deploy the workflow service first.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {taskDefinitions.map((taskName) => {
                  const stats = taskStats[taskName]
                  return (
                    <div key={taskName} className="flex items-center gap-1.5">
                      <span className="font-mono text-neutral-300">{taskName}</span>
                      {isRunning && stats && (
                        <span className="text-neutral-600">
                          ({stats.total})
                          {stats.total > 0 && (
                            <span className="ml-1">
                              {stats.completed > 0 && (
                                <span className="text-emerald-500">✓{stats.completed}</span>
                              )}
                              {stats.running > 0 && (
                                <span className="text-neutral-400 ml-1">{stats.running}↻</span>
                              )}
                            </span>
                          )}
                        </span>
                      )}
                      {taskDescriptions[taskName] && (
                        <span className="text-neutral-700 text-[10px]">
                          {taskDescriptions[taskName]}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Errors - only when running and has errors */}
          {isRunning && failedTasks.length > 0 && (
            <div className="border-b border-neutral-700 px-3 py-2 bg-red-950/20">
              <div className="text-[10px] text-red-500 uppercase tracking-wider mb-1.5">
                Errors ({failedTasks.length})
              </div>
              <div className="space-y-1">
                {failedTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-xs">
                    <span className="text-red-500">⚠</span>{' '}
                    <span className="font-mono text-neutral-400">{task.task_id}</span>
                    {task.input && (
                      <span className="text-neutral-500 ml-2 font-mono">
                        {extractPath(task.input)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline - only when running */}
          {isRunning && (
            <div ref={timelineRef} className="border-b border-neutral-700 max-h-56 overflow-y-auto">
              <div className="text-[10px] text-neutral-600 uppercase tracking-wider px-3 py-1.5 border-b border-neutral-800">
                Timeline
              </div>
              {allTasks.length === 0 && (
                <div className="p-3 flex items-center gap-2 text-xs text-neutral-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Starting workflow...</span>
                </div>
              )}
              {allTasks.map((task) => {
                const barStyle = getBarStyle(task)
                const duration = getTaskDuration(task)
                const isTaskRunning = task.status === 'running'
                const isCompleted = task.status === 'completed'
                const isFailed = task.status === 'failed'

                const getDisplayInfo = () => {
                  if (displayName && task.task_id === taskDefinitions[0]) return displayName
                  if (task.input) return extractPath(task.input)
                  return task.task_id || task.id || '-'
                }

                return (
                  <div
                    key={task.id}
                    className="flex items-center px-2 py-0 hover:bg-neutral-900/30 text-xs"
                  >
                    {/* Status */}
                    <span className="shrink-0 w-4">
                      {isCompleted ? (
                        <span className="text-emerald-500">✓</span>
                      ) : isFailed ? (
                        <span className="text-red-500">✗</span>
                      ) : isTaskRunning ? (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ) : (
                        <span className="inline-block w-1.5 h-1.5 border border-neutral-600 rounded-full" />
                      )}
                    </span>
                    {/* ID or path */}
                    <span className="shrink-0 w-28 font-mono text-neutral-400 truncate">
                      {getDisplayInfo()}
                    </span>
                    {/* Duration */}
                    <span className="shrink-0 w-16 font-mono text-neutral-500 text-right mr-3">
                      {duration || (isTaskRunning ? '…' : '')}
                    </span>
                    {/* Bar */}
                    <div className="flex-1 self-stretch py-px">
                      <div className="relative h-full bg-neutral-800/30">
                        <div
                          className={`absolute top-0 h-full ${
                            isFailed
                              ? 'bg-red-500'
                              : isCompleted
                                ? 'bg-neutral-600'
                                : isTaskRunning
                                  ? 'bg-emerald-500'
                                  : 'bg-neutral-700'
                          }`}
                          style={{ left: barStyle.left, width: barStyle.width }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Log - only when running */}
          {isRunning && (
            <div className="px-3 py-2 max-h-20 overflow-y-auto">
              <div className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">
                Log
              </div>
              <div className="space-y-0">
                {logs.slice(0, 5).map((entry) => (
                  <div
                    key={`${entry.time}-${entry.message}`}
                    className={`text-[10px] font-mono flex gap-2 leading-relaxed ${
                      entry.type === 'success'
                        ? 'text-emerald-500'
                        : entry.type === 'error'
                          ? 'text-red-500'
                          : 'text-neutral-500'
                    }`}
                  >
                    <span className="text-neutral-700 shrink-0">{entry.time}</span>
                    <span className="truncate">{entry.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
