<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
    <!-- Show a message if no data is available -->
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
  name: "EventChart",
  setup() {
    const chartCanvas = ref(null);
    const chartData = ref([]);
    let chartInstance = null;

    // Define color mapping for statuses
    const statusColors = {
      upcoming: 'yellow',
      ongoing: 'green',
      ended: 'red',
    };

    // Fetch and aggregate data from Supabase
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('Event')
        .select('start_date, end_date, status');

      if (error) {
        console.error("Error fetching data:", error);
        return [];
      }

      if (!data || !data.length) {
        console.warn("No data found in Supabase table 'Event'");
        return [];
      }

      console.log("Fetched data:", data); // Log data to verify structure

      // Aggregate events by month for each status
      const upcomingCounts = Array(12).fill(0); 
      const ongoingCounts = Array(12).fill(0);
      const endedCounts = Array(12).fill(0); 

      const today = new Date();

      data.forEach(event => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const month = startDate.getMonth(); // 0-based month index

        // Determine status if not already set
        let status = event.status;
        if (status === 'upcoming' && today >= startDate && today <= endDate) {
          status = 'ongoing';
        } else if (status === 'ongoing' && today > endDate) {
          status = 'ended';
        }

        // Increment the respective month's count based on status
        if (status === 'upcoming') {
          upcomingCounts[month] += 1;
        } else if (status === 'ongoing') {
          ongoingCounts[month] += 1;
        } else if (status === 'ended') {
          endedCounts[month] += 1;
        }
      });

      // Map data to Chart.js format for multiple datasets
      return {
        labels: upcomingCounts.map((_, index) =>
          new Date(0, index).toLocaleString('default', { month: 'short' })
        ),
        datasets: [
          {
            label: 'Upcoming Events',
            data: upcomingCounts,
            backgroundColor: '#F6EE5F', // Color for upcoming events
            borderColor: '#000000',
            borderRadius: '550',
          },
          {
            label: 'Ongoing Events',
            data: ongoingCounts,
            backgroundColor: '#00FF7F', // Color for ongoing events
            borderColor: '#000000',
            borderRadius: '550',
          },
          {
            label: 'Ended Events',
            data: endedCounts,
            backgroundColor: '#F44336', // Color for ended events
            borderColor: '#000000',
            borderRadius: '550',
          },
        ],
      };
    };

    // Create the Chart.js bar chart
    const createChart = async () => {
      const data = await fetchData();
      chartData.value = data.datasets[0].data; // Store data points for conditional rendering

      if (!data.datasets[0].data.length) {
        console.warn('No data available to display in chart');
        return;
      }

      // Destroy any existing chart instance
      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(chartCanvas.value, {
        type: 'bar',
        data,
        options: {
          scales: {
            x: {
              grid: {
                color: '#1F1F1F',
              },
              ticks: {
                color: '#9F2B68',
              },
              title: { display: true, text: 'Months', color: '#000000' },
            },
            y: {
              grid: {
                color: '#1F1F1F',
              },
              ticks: {
                color: '#9F2B68',
              },
              title: { display: true, text: 'Number of Events', color: '#9F2B68' },
              beginAtZero: true,
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItem) {
                  return tooltipItem[0].label;
                },
                label: function(tooltipItem) {
                  const count = tooltipItem.raw;
                  return `Events: ${count}`;
                },
              },
            },
          },
        },
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
  max-width: 99%;
  max-height: 640px;
}

.no-data-message {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: purple;
  font-weight: bold;
}
</style>
