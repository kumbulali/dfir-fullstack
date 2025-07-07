<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" :plugins="plugins" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import type { LineChartData } from '../../types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface Props {
  data: LineChartData
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
    fill: true,
    borderWidth: 3,
    pointRadius: 6,
    pointHoverRadius: 8,
    pointBackgroundColor: dataset.borderColor,
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointHoverBackgroundColor: dataset.borderColor,
    pointHoverBorderColor: '#ffffff',
    pointHoverBorderWidth: 3,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
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
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          size: 12,
          weight: '500' as const,
        },
        color: '#6b7280',
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
          return `${context.dataset.label}: ${context.parsed.y} responders`
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: '#f3f4f6',
        drawBorder: false,
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 12,
        },
        padding: 8,
      },
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        display: true,
        color: '#f3f4f6',
        drawBorder: false,
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 12,
        },
        padding: 8,
        callback: (value: any) => `${value}`,
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const,
  },
}))

const plugins = [
  {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart: any) => {
      const { ctx } = chart
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, chart.width, chart.height)
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
