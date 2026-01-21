import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  LogEntry,
  SSEDoneEvent,
  SSEInitialEvent,
  SSETaskUpdateEvent,
  StatusResponse,
  TaskRun,
  WorkflowStatus,
} from '../types'

interface UseWorkflowStreamOptions<TResult> {
  taskRunId: string | null | undefined
  statusUrl: string
  streamUrl: string
  onComplete?: (result: TResult) => void
  onError?: (message: string) => void
  extractPath?: (input: string) => string
  useMock?: boolean
  mockTasks?: TaskRun[]
  mockLogs?: LogEntry[]
}

interface UseWorkflowStreamResult {
  status: WorkflowStatus
  tasks: TaskRun[]
  logs: LogEntry[]
  elapsed: number
  connected: boolean
  finished: boolean
  addLog: (message: string, type?: LogEntry['type']) => void
}

/**
 * Default extractPath function
 */
const defaultExtractPath = (input: string): string => {
  try {
    return new URL(input).pathname || '/'
  } catch {
    return input
  }
}

/**
 * Default mock tasks for development
 */
const DEFAULT_MOCK_TASKS: TaskRun[] = [
  {
    id: 'trn-mock001',
    task_id: 'root_task',
    status: 'completed',
    input: 'https://example.com',
    startedAt: new Date(Date.now() - 45000).toISOString(),
    completedAt: new Date(Date.now() - 2000).toISOString(),
  },
  {
    id: 'trn-mock002',
    task_id: 'child_task',
    status: 'running',
    input: 'https://example.com/page',
    startedAt: new Date(Date.now() - 5000).toISOString(),
  },
]

/**
 * Default mock logs for development
 */
const DEFAULT_MOCK_LOGS: LogEntry[] = [
  { time: '12:34:56', message: 'Workflow started', type: 'success' },
  { time: '12:34:55', message: '✓ Task completed' },
]

/**
 * Build actual URL from template
 */
const buildUrl = (template: string, id: string): string => {
  return template.replace('{taskRunId}', id)
}

/**
 * Hook for managing SSE connection and polling fallback for Render Workflows
 */
export function useWorkflowStream<TResult = unknown>({
  taskRunId,
  statusUrl,
  streamUrl,
  onComplete,
  onError,
  extractPath = defaultExtractPath,
  useMock = false,
  mockTasks,
  mockLogs,
}: UseWorkflowStreamOptions<TResult>): UseWorkflowStreamResult {
  const effectiveMockTasks = mockTasks ?? DEFAULT_MOCK_TASKS
  const effectiveMockLogs = mockLogs ?? DEFAULT_MOCK_LOGS

  const [status, setStatus] = useState<WorkflowStatus>(useMock ? 'running' : 'idle')
  const [tasks, setTasks] = useState<TaskRun[]>(useMock ? effectiveMockTasks : [])
  const [logs, setLogs] = useState<LogEntry[]>(useMock ? effectiveMockLogs : [])
  const [elapsed, setElapsed] = useState(0)
  const [connected, setConnected] = useState(false)
  const [finished, setFinished] = useState(false)

  const startTime = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const completedTasksRef = useRef<Set<string>>(new Set())
  const doneLoggedRef = useRef(false)
  const connectedRef = useRef(false)
  const stopPollingRef = useRef(false)
  const finishedRef = useRef(false)
  const hasReceivedDataRef = useRef(false)
  const sseFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Store all props in refs to avoid effect dependencies
  const statusUrlRef = useRef(statusUrl)
  const streamUrlRef = useRef(streamUrl)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)
  const extractPathRef = useRef(extractPath)

  // Keep refs up to date
  useEffect(() => {
    statusUrlRef.current = statusUrl
    streamUrlRef.current = streamUrl
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
    extractPathRef.current = extractPath
  })

  // Keep finishedRef in sync
  useEffect(() => {
    finishedRef.current = finished
  }, [finished])

  const isRunning = !!taskRunId || useMock

  /**
   * Add a log entry
   */
  const addLog = useCallback((message: string, type?: LogEntry['type']) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setLogs((prev) => [{ time, message, type }, ...prev].slice(0, 15))
  }, [])

  // Set mock data when mock mode is enabled
  useEffect(() => {
    if (useMock) {
      setStatus('running')
      setTasks(effectiveMockTasks)
      setLogs(effectiveMockLogs)
      setElapsed(0)
      startTime.current = Date.now()
    }
  }, [useMock, effectiveMockTasks, effectiveMockLogs])

  // Reset state when taskRunId changes (skip in mock mode)
  useEffect(() => {
    if (taskRunId && !useMock) {
      setStatus('pending')
      setTasks([])
      setLogs([])
      setElapsed(0)
      setConnected(false)
      setFinished(false)
      startTime.current = Date.now()
      completedTasksRef.current = new Set()
      doneLoggedRef.current = false
      connectedRef.current = false
      stopPollingRef.current = false
      finishedRef.current = false
      hasReceivedDataRef.current = false
    }
  }, [taskRunId, useMock])

  // Timer - only when running
  useEffect(() => {
    if (!isRunning) return

    addLog('Workflow started')
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, addLog])

  // Stop timer when finished
  useEffect(() => {
    if (finished && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [finished])

  // SSE connection - only depends on taskRunId and useMock
  useEffect(() => {
    // Skip if mock mode or no taskRunId
    if (useMock || !taskRunId) {
      return
    }

    // Skip if already connected to the same taskRunId
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      console.log('SSE already connected, skipping')
      return
    }

    // Skip if already finished
    if (finishedRef.current) {
      console.log('SSE skipped - workflow already finished')
      return
    }

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    const currentTaskRunId = taskRunId
    const actualStreamUrl = buildUrl(streamUrlRef.current, currentTaskRunId)
    console.log(`SSE: Creating new EventSource for ${currentTaskRunId}`)
    const eventSource = new EventSource(actualStreamUrl)
    eventSourceRef.current = eventSource
    const STATUS_POLL_INTERVAL_MS = 3000

    /**
     * Fetch status from API (defined inside effect to use current refs)
     */
    const fetchStatus = async (): Promise<StatusResponse<TResult>> => {
      const url = buildUrl(statusUrlRef.current, currentTaskRunId)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }
      return response.json()
    }

    const stopStatusPolling = () => {
      if (statusPollIntervalRef.current) {
        clearInterval(statusPollIntervalRef.current)
        statusPollIntervalRef.current = null
      }
    }

    const stopSseFallbackTimeout = () => {
      if (sseFallbackTimeoutRef.current) {
        clearTimeout(sseFallbackTimeoutRef.current)
        sseFallbackTimeoutRef.current = null
      }
    }

    const startStatusPolling = () => {
      if (statusPollIntervalRef.current) return

      statusPollIntervalRef.current = setInterval(async () => {
        if (stopPollingRef.current || finishedRef.current) return

        try {
          const data = await fetchStatus()
          setStatus(data.status)

          if (data.tasks) {
            setTasks(data.tasks)
            for (const t of data.tasks) {
              if (t.status === 'completed' && !completedTasksRef.current.has(t.id)) {
                completedTasksRef.current.add(t.id)
                if (t.input) {
                  const path = extractPathRef.current(t.input)
                  setLogs((prev) => {
                    const time = new Date().toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                    return [{ time, message: `✓ ${path}` }, ...prev].slice(0, 15)
                  })
                }
              }
            }
          }

          if (data.status === 'completed' && data.results) {
            stopPollingRef.current = true
            finishedRef.current = true
            setFinished(true)
            doneLoggedRef.current = true
            stopStatusPolling()
            setLogs((prev) => {
              const time = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              return [{ time, message: 'Workflow completed', type: 'success' as const }, ...prev].slice(0, 15)
            })
            onCompleteRef.current?.(data.results as TResult)
          } else if (data.status === 'failed') {
            stopPollingRef.current = true
            finishedRef.current = true
            setFinished(true)
            doneLoggedRef.current = true
            stopStatusPolling()
            setLogs((prev) => {
              const time = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              return [{ time, message: 'Workflow failed', type: 'error' as const }, ...prev].slice(0, 15)
            })
            onErrorRef.current?.('Workflow execution failed')
          }
        } catch (err) {
          console.error('Status poll error:', err)
        }
      }, STATUS_POLL_INTERVAL_MS)
    }

    /**
     * Fallback to polling when SSE fails
     */
    const fallbackToPoll = () => {
      if (!onCompleteRef.current || !onErrorRef.current) return
      stopStatusPolling()
      stopSseFallbackTimeout()
      
      setLogs((prev) => {
        const time = new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        return [{ time, message: 'Using polling fallback' }, ...prev].slice(0, 15)
      })

      const poll = async () => {
        if (stopPollingRef.current || finishedRef.current) return

        try {
          const data = await fetchStatus()
          setStatus(data.status)

          if (data.tasks) {
            setTasks(data.tasks)
            for (const t of data.tasks) {
              if (t.status === 'completed' && !completedTasksRef.current.has(t.id)) {
                completedTasksRef.current.add(t.id)
                if (t.input) {
                  const path = extractPathRef.current(t.input)
                  setLogs((prev) => {
                    const time = new Date().toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                    return [{ time, message: `✓ ${path}` }, ...prev].slice(0, 15)
                  })
                }
              }
            }
          }

          if (data.status === 'completed' && data.results) {
            stopPollingRef.current = true
            setFinished(true)
            doneLoggedRef.current = true
            setLogs((prev) => {
              const time = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              return [{ time, message: 'Workflow completed', type: 'success' as const }, ...prev].slice(0, 15)
            })
            onCompleteRef.current?.(data.results as TResult)
          } else if (data.status === 'failed') {
            stopPollingRef.current = true
            setFinished(true)
            doneLoggedRef.current = true
            setLogs((prev) => {
              const time = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              return [{ time, message: 'Workflow failed', type: 'error' as const }, ...prev].slice(0, 15)
            })
            onErrorRef.current?.('Workflow execution failed')
          } else {
            setTimeout(poll, 2000)
          }
        } catch (err) {
          console.error('Polling error:', err)
          setTimeout(poll, 2000)
        }
      }

      poll()
    }

    startStatusPolling()

    eventSource.addEventListener('connected', () => {
      if (finishedRef.current) return
      if (connectedRef.current) return
      setConnected(true)
      connectedRef.current = true
      // If we connect but never receive any data, fall back to polling.
      stopSseFallbackTimeout()
      sseFallbackTimeoutRef.current = setTimeout(() => {
        if (!hasReceivedDataRef.current && !finishedRef.current) {
          console.warn('SSE connected but no data received, falling back to polling')
          eventSource.close()
          fallbackToPoll()
        }
      }, 5000)
      setLogs((prev) => {
        const time = new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        return [{ time, message: 'Connected to event stream' }, ...prev].slice(0, 15)
      })
    })

    eventSource.addEventListener('initial', (e) => {
      if (finishedRef.current) return
      try {
        hasReceivedDataRef.current = true
        stopSseFallbackTimeout()
        const data: SSEInitialEvent = JSON.parse(e.data)
        setStatus(data.status)
        if (data.tasks) {
          setTasks(data.tasks)
        }
        // If already completed/failed, close immediately to prevent reconnect loop
        if (data.status === 'completed' || data.status === 'failed') {
          eventSource.close()
          finishedRef.current = true
          doneLoggedRef.current = true
          setFinished(true)
        }
      } catch (err) {
        console.error('Error parsing initial event:', err)
      }
    })

    eventSource.addEventListener('taskUpdate', (e) => {
      if (finishedRef.current) return
      try {
        hasReceivedDataRef.current = true
        stopSseFallbackTimeout()
        const event: SSETaskUpdateEvent = JSON.parse(e.data)
        setTasks((prev) => {
          const existing = prev.find((t) => t.id === event.id)
          if (existing) {
            return prev.map((t) =>
              t.id === event.id
                ? {
                    ...t,
                    status: event.status,
                    startedAt: event.startedAt || t.startedAt,
                    completedAt: event.completedAt || t.completedAt,
                    input: event.input || t.input,
                  }
                : t
            )
          }
          return [
            ...prev,
            {
              id: event.id,
              status: event.status,
              task_id: event.task_name,
              input: event.input,
              startedAt: event.startedAt,
              completedAt: event.completedAt,
            },
          ]
        })

        // Log task completion
        if (event.status === 'completed' && !completedTasksRef.current.has(event.id)) {
          completedTasksRef.current.add(event.id)
          if (event.input) {
            const path = extractPathRef.current(event.input)
            setLogs((prev) => {
              const time = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              return [{ time, message: `✓ ${path}` }, ...prev].slice(0, 15)
            })
          }
        }
      } catch (err) {
        console.error('Error parsing taskUpdate:', err)
      }
    })

    eventSource.addEventListener('done', async (e) => {
      if (finishedRef.current) return
      // Close IMMEDIATELY to prevent auto-reconnect before async processing
      eventSource.close()
      doneLoggedRef.current = true
      finishedRef.current = true
      setFinished(true)
      hasReceivedDataRef.current = true
      stopStatusPolling()
      stopSseFallbackTimeout()

      try {
        const data: SSEDoneEvent<TResult> = JSON.parse(e.data)
        setStatus(data.status)

        // Fetch final task statuses
        try {
          const finalData = await fetchStatus()
          if (finalData.tasks) {
            setTasks(finalData.tasks)
          }
        } catch {
          console.warn('Could not fetch final task statuses')
        }

        if (data.status === 'completed' && data.results && onCompleteRef.current) {
          const results = Array.isArray(data.results) ? data.results[0] : data.results
          setLogs((prev) => {
            const time = new Date().toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
            return [{ time, message: 'Workflow completed', type: 'success' as const }, ...prev].slice(0, 15)
          })
          setTimeout(() => onCompleteRef.current?.(results as TResult), 300)
        } else if (data.status === 'failed' && onErrorRef.current) {
          setLogs((prev) => {
            const time = new Date().toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
            return [{ time, message: 'Workflow failed', type: 'error' as const }, ...prev].slice(0, 15)
          })
          onErrorRef.current('Workflow execution failed')
        }
      } catch (err) {
        console.error('Error parsing done event:', err)
      }
    })

    eventSource.addEventListener('error', (e) => {
      if (doneLoggedRef.current || finishedRef.current) {
        console.log('SSE error event ignored - already finished')
        return
      }
      // Note: Native error events don't have .data, only server-sent error events do
      try {
        const data = JSON.parse((e as MessageEvent).data || '{}')
        if (data.error) {
          console.warn('SSE server error:', data.error)
          setLogs((prev) => {
            const time = new Date().toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
            return [{ time, message: `Error: ${data.error}`, type: 'error' as const }, ...prev].slice(0, 15)
          })
          // Close EventSource to prevent auto-reconnect loop
          eventSource.close()
          eventSourceRef.current = null
          // Fall back to polling
          fallbackToPoll()
        }
        // If no error in data, this is just a connection event - let onerror handle it
      } catch {
        // This is a native connection error, not a server-sent error event
        // The onerror handler will also fire, so we let it handle the logic
        console.log('SSE error event (native) - letting onerror handle it')
      }
    })

    eventSource.onerror = () => {
      if (doneLoggedRef.current || finishedRef.current) {
        console.log('SSE onerror ignored - already finished')
        return
      }
      console.warn('SSE connection error, readyState:', eventSource.readyState)
      // Always close on error to prevent auto-reconnect loop
      eventSource.close()
      eventSourceRef.current = null
      if (!connectedRef.current || !hasReceivedDataRef.current) {
        console.log('SSE: Falling back to polling (never connected or no data)')
        fallbackToPoll()
      } else {
        console.log('SSE: Connection lost after receiving data, not retrying')
      }
    }

    return () => {
      console.log('SSE: Cleanup running')
      eventSource.close()
      eventSourceRef.current = null
      stopStatusPolling()
      stopSseFallbackTimeout()
    }
  }, [taskRunId, useMock]) // Only depend on taskRunId and useMock

  return {
    status,
    tasks,
    logs,
    elapsed,
    connected,
    finished,
    addLog,
  }
}
