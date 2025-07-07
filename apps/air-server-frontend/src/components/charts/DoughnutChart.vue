<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="chartOptions" :plugins="plugins" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import type { PieChartData } from '../../types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: PieChartData
  title?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  height: 300,
})

const chartData = computed(() => ({
  labels: props.data.labels,
  datasets: props.data.datasets.map((dataset) => ({
    ...dataset,
    borderWidth: 3,
    hoverBorderWidth: 4,
    hoverOffset: 8,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    title: {
      display: !!props.title,
      text: props.title,
      font: {
        size: 16,
        weight: 'bold' as const,
      },
      color: '#1f2937',
      padding: {
        bottom: 20,
      },
    },
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          size: 12,
          weight: '500' as const,
        },
        color: '#6b7280',
        generateLabels: (chart: any) => {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label: string, i: number) => {
              const dataset = data.datasets[0]
              const value = dataset.data[i]
              const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0)
              const percentage = ((value / total) * 100).toFixed(1)

              return {
                text: `${label}: ${value} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: dataset.borderColor,
                lineWidth: dataset.borderWidth,
                hidden: false,
                index: i,
              }
            })
          }
          return []
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold' as const,
      },
      bodyFont: {
        size: 13,
      },
      callbacks: {
        label: (context: any) => {
          const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = ((context.parsed / total) * 100).toFixed(1)
          return `${context.label}: ${context.parsed} jobs (${percentage}%)`
        },
      },
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 1000,
    easing: 'easeInOutQuart' as const,
  },
}))

const plugins = [
  {
    id: 'centerText',
    beforeDraw: (chart: any) => {
      // Safely check if data exists and has datasets
      if (
        !chart.data ||
        !chart.data.datasets ||
        !chart.data.datasets[0] ||
        !chart.data.datasets[0].data
      ) {
        return
      }

      const { ctx, data } = chart
      const total = data.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0)

      // Only draw if we have a valid total
      if (total === 0) {
        return
      }

      ctx.save()
      ctx.font = 'bold 24px sans-serif'
      ctx.fillStyle = '#1f2937'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2
      const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2

      ctx.fillText(total.toString(), centerX, centerY - 10)

      ctx.font = '12px sans-serif'
      ctx.fillStyle = '#6b7280'

      // Determine the label based on chart data labels
      let centerLabel = 'Total'
      if (data.labels && data.labels.length > 0) {
        // Check if this is a responder status chart
        if (data.labels.includes('Healthy') && data.labels.includes('Unhealthy')) {
          centerLabel = 'Total Responders'
        }
        // Check if this is a job status chart
        else if (
          data.labels.includes('Completed') ||
          data.labels.includes('Pending') ||
          data.labels.includes('Failed')
        ) {
          centerLabel = 'Total Jobs'
        }
      }

      ctx.fillText(centerLabel, centerX, centerY + 15)

      ctx.restore()
    },
  },
]
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
