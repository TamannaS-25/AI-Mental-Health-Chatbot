class WellnessChartsManager {
  constructor() {
    this.moodChart = null;
  }

  initCharts(theme = 'light') {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    
    // Canvas element
    const ctx = document.getElementById('moodTrendsChart');
    if (!ctx) return;
    
    // Gradient background for Line Chart
    const chartContext = ctx.getContext('2d');
    const gradient = chartContext.createLinearGradient(0, 0, 0, 230);
    
    if (isDark) {
      gradient.addColorStop(0, 'rgba(139, 124, 246, 0.4)');
      gradient.addColorStop(1, 'rgba(139, 124, 246, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(91, 141, 239, 0.35)');
      gradient.addColorStop(1, 'rgba(91, 141, 239, 0.01)');
    }

    const dataValues = [3, 4, 3, 2, 4, 5, 4]; // neutral, calm, neutral, anxious, calm, happy, calm
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (this.moodChart) {
      this.moodChart.destroy();
    }

    this.moodChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Mood Level',
          data: dataValues,
          borderColor: isDark ? '#9d90ff' : '#5B8DEF',
          borderWidth: 3.5,
          pointBackgroundColor: isDark ? '#9d90ff' : '#5B8DEF',
          pointBorderColor: isDark ? '#0F172A' : '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: true,
          backgroundColor: gradient
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            titleColor: isDark ? '#FFFFFF' : '#334155',
            bodyColor: isDark ? '#E2E8F0' : '#64748B',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const moodMap = {
                  1: 'Sad / Angry 😢',
                  2: 'Anxious 😟',
                  3: 'Neutral 😐',
                  4: 'Calm 😌',
                  5: 'Happy 😊'
                };
                return 'Mood: ' + (moodMap[context.parsed.y] || 'Unknown');
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11
              }
            }
          },
          y: {
            min: 1,
            max: 5,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              stepSize: 1,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11
              },
              callback: function(value) {
                const labelMap = {
                  1: '😢',
                  2: '😟',
                  3: '😐',
                  4: '😌',
                  5: '😊'
                };
                return labelMap[value] || '';
              }
            }
          }
        }
      }
    });
  }

  // Update chart when a new mood is logged in the session
  appendNewMood(moodRating) {
    if (!this.moodChart) return;
    
    // Shift points
    const currentData = this.moodChart.data.datasets[0].data;
    currentData.shift();
    currentData.push(moodRating);
    
    this.moodChart.update();
  }
}

// Instantiate Chart Manager
let chartsManager;
document.addEventListener('DOMContentLoaded', () => {
  chartsManager = new WellnessChartsManager();
});
