<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
    <!-- Optionally, show a message if no data is available -->
    <div v-if="!chartData.length" class="no-data-message">
      No data available for the chart.
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';

// Register necessary components for a bar chart
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);

export default {
  name: "MyChart",
  setup() {
    const chartCanvas = ref(null);
    const chartData = ref([]);
    let chartInstance = null;

    // Fetch and aggregate data from Supabase
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('Score')
        .select('Contestants_id, Score'); // Selecting Contestants_id and Score

      if (error) {
        console.error("Error fetching data:", error);
        return [];
      }

      if (!data || !data.length) {
        console.warn("No data found in Supabase table 'Score'");
        return [];
      }

      console.log("Fetched data:", data); // Log data to verify structure

      // Aggregate the scores by Contestants_id
      const aggregatedData = data.reduce((acc, item) => {
        // If contestant already exists, add the score to the existing total
        if (acc[item.Contestants_id]) {
          acc[item.Contestants_id] += item.Score;
        } else {
          // Otherwise, initialize the score for this contestant
          acc[item.Contestants_id] = item.Score;
        }
        return acc;
      }, {});

      // Map the aggregated data to Chart.js format
      return Object.keys(aggregatedData).map(contestantId => ({
        x: `Contestant ${contestantId}`, // Label each bar by Contestants_id
        y: aggregatedData[contestantId] // Sum of the scores as y-value
      }));
    };

    // Create the Chart.js bar chart
    const createChart = async () => {
      const dataPoints = await fetchData();
      chartData.value = dataPoints; // Store data points for conditional rendering

      if (!dataPoints.length) {
        console.warn('No data available to display in chart');
        return;
      }

      // Destroy any existing chart instance
      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(chartCanvas.value, {
        type: 'bar', 
        data: {
          labels: dataPoints.map(point => point.x), // Contestants as x-axis labels
          datasets: [{
            label: 'Total Score by Contestant',
            data: dataPoints.map(point => point.y), // Aggregated scores as y-values
            borderColor: '#FFFFFF',
            backgroundColor: '#62B969',
            borderWidth: 1,
          }]
        },
        options: {
          scales: {
            x: {
              title: { display: true, text: 'Contestants' }
            },
            y: {
              title: { display: true, text: 'Total Score' },
              beginAtZero: true 
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItem) {
                  const contestantId = tooltipItem[0].label.split(" ")[1];
                  return `Contestant ${contestantId}`;
                },
                label: function(tooltipItem) {
                  const score = tooltipItem.raw;
                  return `Total Score: ${score}`;
                }
              }
            }
          }
        },
        plugins: [{
          id: 'chartAreaBorder',
          beforeDraw: (chart) => {
            const { ctx, chartArea: { left, right, top, bottom } } = chart;
            ctx.save();
            ctx.strokeStyle = '#1F1F1F'; // Border color
            ctx.lineWidth = 4;        // Border thickness
            ctx.strokeRect(left, top, right - left, bottom - top); // Draw rectangle around chart area
            ctx.restore();
          }
        }]
      });

    };

    onMounted(async () => {
      if (!chartCanvas.value) {
        console.error('Canvas element not found');
        return;
      }
      await createChart();
    });

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    return { chartCanvas, chartData };
  }
};
</script>

<style scoped>
canvas {
  padding: 30px;
  border-radius: 5px;
  margin-top: 10px;
  margin-left:;
  max-width: 99%;
  max-height: 650px; 

}

.no-data-message {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: #888;

}

</style>
