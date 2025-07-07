<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string | string[]
    borderColor: string | string[]
    borderWidth?: number
  }[]
}

interface Props {
  data: BarChartData
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
    borderWidth: 2,
    borderRadius: 6,
    borderSkipped: false,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
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
        pointStyle: 'rect',
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
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
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
      },
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const,
  },
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
