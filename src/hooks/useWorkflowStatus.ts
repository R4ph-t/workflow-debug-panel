import { useEffect, useState } from 'react'

interface WorkflowStatusResponse {
  workflow_configured?: boolean
  workflow_slug?: string | null
  tasks?: string[] | null
}

interface UseWorkflowStatusResult {
  tasks: string[]
  workflowSlug: string | null
  workflowConfigured: boolean
  apiReachable: boolean
  loading: boolean
}

/**
 * Hook to fetch workflow status from the status check endpoint.
 * Returns workflow configuration, available tasks, and API reachability.
 */
export function useWorkflowStatus(
  statusCheckUrl: string | undefined
): UseWorkflowStatusResult {
  const [tasks, setTasks] = useState<string[]>([])
  const [workflowSlug, setWorkflowSlug] = useState<string | null>(null)
  const [workflowConfigured, setWorkflowConfigured] = useState(false)
  const [apiReachable, setApiReachable] = useState(true)
  const [loading, setLoading] = useState(!!statusCheckUrl)

  useEffect(() => {
    if (!statusCheckUrl) {
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchStatus = async () => {
      try {
        const response = await fetch(statusCheckUrl)
        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }

        const data: WorkflowStatusResponse = await response.json()

        if (!cancelled) {
          setApiReachable(true)
          setWorkflowConfigured(data.workflow_configured ?? false)
          setWorkflowSlug(data.workflow_slug ?? null)
          setTasks(data.tasks ?? [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch workflow status:', error)
        if (!cancelled) {
          setApiReachable(false)
          setWorkflowConfigured(false)
          setTasks([])
          setLoading(false)
        }
      }
    }

    fetchStatus()

    return () => {
      cancelled = true
    }
  }, [statusCheckUrl])

  return {
    tasks,
    workflowSlug,
    workflowConfigured,
    apiReachable,
    loading,
  }
}
