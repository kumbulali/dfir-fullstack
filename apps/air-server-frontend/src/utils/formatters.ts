import type { StatusFormat, ResponderStatus, JobStatus } from '../types'

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

  // Format status with proper styling
  formatStatus(status: ResponderStatus | JobStatus): StatusFormat {
    const statusMap: Record<string, StatusFormat> = {
      online: { text: 'Online', class: 'status-online' },
      offline: { text: 'Offline', class: 'status-offline' },
      completed: { text: 'Completed', class: 'status-online' },
      pending: { text: 'Pending', class: 'status-badge' },
      failed: { text: 'Failed', class: 'status-offline' },
    }

    return statusMap[status] || { text: status, class: 'status-badge' }
  },
}
