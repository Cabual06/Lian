<template>
  <v-app>
    <v-container>
      <v-container class="d-flex pb-2 pt-2">
        <h1>Scoring for Round: {{ roundId }}</h1>
        <v-btn variant="flat" class="ma-2 z-index" color="blue" @click="submitScores" :disabled="submitted">
          Submit Score <v-icon icon="mdi mdi-check" end></v-icon>
        </v-btn>
      </v-container>

      <!-- Scoring Table -->
      <v-table
        v-model:items-per-page="round.itemsPerPage"
        :items="round.items"
        :items-length="round.totalItems"
        :page.sync="round.page"
        fixed-header
        theme="dark rounded opacity-100"
        class="bg-transparent border-sm"
        v-if="round && round.items && Array.isArray(round.items) && Array.isArray(round.criteria)"
      >
        <thead class="opacity-60">
          <tr class="font-weight-bold">
            <th class="text-left text-green">Candidate ID</th>
            <th class="text-left text-green">Candidate Name</th>
            <th class="text-left text-green">Round Name</th>
            <th v-for="criteria in round.criteria" :key="criteria.id" class="text-left text-green">
              {{ criteria.criteriaName }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in round.items" :key="item.candidateId" class="font-weight-bold">
            <td>{{ item.candidateId || 'Unknown' }}</td>
            <td>{{ item.candidateName || 'Unknown' }}</td>
            <td>{{ item.roundName }}</td>
            <td v-for="criteria in round.criteria" :key="criteria.id">
              <v-select
                variant="plain"
                class="text-green pb-4 font-weight-bold"
                style="width: 100px"
                :items="generateScoreOptions(criteria.percentage)"
                v-model="item.criteriaMap[criteria.id]"
                @change="handleScoreChange(round.id, item.candidateId, criteria.id)"
                density="default"
                hide-details
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from 'vue-toast-notification';
import { onBeforeRouteEnter } from 'vue-router';

const $toast = useToast();
const route = useRoute();
const roundId = ref(route.params.roundId);
const round = ref({
  id: null,
  name: '',
  criteria: [],
  items: [],
  page: 1,
  itemsPerPage: 10,
  totalItems: 0
});
const submitted = ref(false);

// Generate score options based on percentage
const generateScoreOptions = (percentage) => {
  return Array.from({ length: percentage }, (_, i) => i + 1);
};

// Fetch round data based on roundId
const fetchRoundData = async () => {
  const { roundId } = route.params;

  try {
    // Fetch round data from the database using the roundId
    const { data: roundData, error } = await supabase
      .from('Round')
      .select('id, name')
      .eq('id', roundId)
      .single();

    if (error) {
      $toast.error('Error loading round data');
      return;
    }

    // Fetch criteria data for the round
    const { data: criteriaData, error: criteriaError } = await supabase
      .from('Criteria')
      .select('id, criteriaName, percentage')
      .eq('Round_id', roundId);

    if (criteriaError) {
      $toast.error('Error loading criteria data');
      return;
    }

    // Fetch contestants data for the round
    const { data: contestantsData, error: contestantsError } = await supabase
      .from('ContestantRound')
      .select('Contestants(id, name)')
      .eq('Round_id', roundId);

    if (contestantsError) {
      $toast.error('Error loading contestants data');
      return;
    }

    // Ensure the data is iterable and not undefined
    const items = Array.isArray(contestantsData) && Array.isArray(criteriaData)
      ? contestantsData.map(contestant => ({
          candidateId: String(contestant.Contestants.id),
          candidateName: contestant.Contestants.name || 'Unknown',
          roundName: roundData.name,
          criteriaMap: Object.fromEntries(criteriaData.map(c => [c.id, null]))
        }))
      : [];

    round.value = {
      id: roundData.id,
      name: roundData.name,
      criteria: criteriaData,
      items,
      page: 1,
      itemsPerPage: 10,
      totalItems: contestantsData.length
    };
  } catch (err) {
    console.error('Error fetching round data:', err.message);
    $toast.error('Failed to load round data. Please try again later.');
  }
};

// Fetch data before route is entered
onBeforeRouteEnter((to, from, next) => {
  console.log('Navigating to round:', to.params.roundId);
  next(async (vm) => {
    await vm.fetchRoundData(); // Fetch data before rendering
  });
});

onMounted(() => {
  console.log('Round ID:', roundId.value);
  fetchRoundData();
});
</script>
