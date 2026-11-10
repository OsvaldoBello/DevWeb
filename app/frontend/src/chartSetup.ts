import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)
ChartJS.defaults.font.family = "'Source Sans 3', system-ui, sans-serif"
ChartJS.defaults.color = '#6b7280'

;(ChartJS.defaults.animation as { duration: number }).duration = 350
