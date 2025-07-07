import type { StatusFormat, ResponderStatus, JobStatus } from '../types'

// Helper function to check if a responder is healthy based on lastSeen
export const isResponderHealthy = (lastSeen: string | null): boolean => {
  if (!lastSeen) return false

  const lastSeenTime = new Date(lastSeen).getTime()
  const currentTime = new Date().getTime()
  const timeDifferenceInSeconds = (currentTime - lastSeenTime) / 1000

  // Consider healthy if last seen within 45 seconds
  return timeDifferenceInSeconds <= 45
}

// Helper function to get calculated responder status
export const getResponderStatus = (lastSeen: string | null): ResponderStatus => {
  return isResponderHealthy(lastSeen) ? 'healthy' : 'unhealthy'
}

export const formatters = {
  // Format date to readable string
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  },

  // Format relative time (e.g., "2 minutes ago")
  formatRelativeTime(dateString: string | null): string {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  },

  // Format status with proper styling (now calculates responder status)
  formatStatus(status: ResponderStatus | JobStatus, lastSeen?: string | null): StatusFormat {
    // For responder status, calculate based on lastSeen if provided
    if ((status === 'healthy' || status === 'unhealthy') && lastSeen !== undefined) {
      const calculatedStatus = getResponderStatus(lastSeen)
      const statusMap: Record<string, StatusFormat> = {
        healthy: { text: 'Healthy', class: 'status-online' },
        unhealthy: { text: 'Unhealthy', class: 'status-offline' },
      }
      return statusMap[calculatedStatus]
    }

    // For job status or when no lastSeen is provided
    const statusMap: Record<string, StatusFormat> = {
      healthy: { text: 'Healthy', class: 'status-online' },
      unhealthy: { text: 'Unhealthy', class: 'status-offline' },
      completed: { text: 'Completed', class: 'status-online' },
      pending: { text: 'Pending', class: 'status-badge' },
      failed: { text: 'Failed', class: 'status-offline' },
    }

    return statusMap[status] || { text: status, class: 'status-badge' }
  },

  // Format command arguments for display
  formatArgs(args: any[]): string {
    if (!args || args.length === 0) return '[]'
    return JSON.stringify(args)
  },

  // Parse JSON string safely
  parseArgs(argsString: string): any[] {
    try {
      const parsed = JSON.parse(argsString)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return []
    }
  },
}
