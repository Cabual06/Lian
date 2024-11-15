<template>
  <Indexnav />
  <v-container>
    <v-container class="d-flex pb-2 pt-2">
      <h1 class="text-medium-emphasis"><span class="text-green"> </span></h1>
      <v-spacer></v-spacer>
      <v-btn variant="tonal" class="ma-2 z-index" color="blue" @click="submitScores" :disabled="submitted">
        Submit Score <v-icon icon="mdi mdi-check" end></v-icon>
      </v-btn>
    </v-container>

    <div v-for="round in rounds" :key="round.id">
      <h1 class="text-medium-emphasis mt-8 mb-10">{{ round.name }}</h1>
      <v-table
        v-model:items-per-page="round.itemsPerPage"
        :items="round.items"
        :items-length="round.totalItems"
        :page.sync="round.page"
        fixed-header
        theme="dark rounded opacity-100"
        class="bg-transparent border-sm"
        @update:page="(page) => handlePageUpdate(round.id, page)"
        @update:items-per-page="(itemsPerPage) => handleItemsPerPageUpdate(round.id, itemsPerPage)"
      >
        <thead class="opacity-60">
          <tr>
            <th class="text-left text-green">Candidate ID</th>
            <th class="text-left text-green">Candidate Name</th>
            <th class="text-left text-green">Round Name</th>
            <th v-for="criteria in round.criteria" :key="criteria.id" class="text-left text-green">
              {{ criteria.criteriaName }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in round.items" :key="item.candidateId">
            <td>{{ item.candidateId || 'Unknown' }}</td>
            <td>{{ item.candidateName || 'Unknown' }}</td>
            <td>{{ item.roundName }}</td>
            <td v-for="criteria in round.criteria" :key="criteria.id">
              <v-select
                variant="plain"
                class="text-blue pb-4"
                style="width: 100px"
                :items="scoreOptions"
                v-model="item.criteriaMap[criteria.id]"
                @change="handleScoreChange(round.id, item.candidateId, criteria.id)"
                density="default"
                hide-details
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <v-container
        class="d-flex justify-center align-center"
        style="min-height: 75vh;"
      >
        <v-progress-circular
          v-if="isLoadingRounds"
          color="green"
          :size="60"
          :width="7"
          indeterminate
        ></v-progress-circular>

        <v-empty-state
          class=""
          v-else-if="isMatchRounds"
          icon="mdi mdi-file-document-alert-outline"
          text="Contact the Administrator or Restart your Connections."
          title="No Tabulation set by the Admin."
        ></v-empty-state>
      </v-container>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

const $toast = useToast();
const rounds = ref([]);
const scoreOptions = ref([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
const isLoadingRounds = ref(true);
const isMatchRounds = ref(false);
const submitted = ref(false);

async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return user ? user.id : null;
}

// Load scores from the database and apply them to the rounds data
async function loadScoresFromDatabase() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User is not authenticated');

    const { data: savedScores, error } = await supabase
      .from('Score')
      .select('Contestants_id, Criteria_id, Score, Round_id')
      .eq('Users_id', userId);

    if (error) throw new Error(error.message);

    savedScores.forEach(savedScore => {
      const round = rounds.value.find(r => r.id === savedScore.Round_id);
      if (round) {
        const item = round.items.find(i => i.candidateId === String(savedScore.Contestants_id));
        if (item) {
          item.criteriaMap[savedScore.Criteria_id] = savedScore.Score;
        }
      }
    });
  } catch (error) {
    console.error('Error loading scores from database:', error.message);
  }
}

// Fetch rounds and criteria from Supabase
async function fetchRounds() {
  isLoadingRounds.value = true;
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User is not authenticated');

    const { data: roundData, error: roundError } = await supabase
      .from('Round')
      .select('id, name');

    if (roundError) throw new Error(roundError.message);
    isMatchRounds.value = roundData.length === 0;

    const roundsWithCriteria = await Promise.all(roundData.map(async (round) => {
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('Criteria')
        .select('id, criteriaName')
        .eq('Round_id', round.id);
      if (criteriaError) throw new Error(criteriaError.message);

      const items = []; // Placeholder for contestants
      return { id: round.id, name: round.name, criteria: criteriaData, items, page: 1, itemsPerPage: 10, totalItems: 0 };
    }));

    rounds.value = roundsWithCriteria;
    rounds.value.forEach(round => fetchPageData(round.id));

    // Load saved scores from the database after fetching rounds and items
    await loadScoresFromDatabase();
  } catch (error) {
    console.error('Error fetching rounds:', error.message);
    isMatchRounds.value = true;
  } finally {
    isLoadingRounds.value = false;
  }
}

async function fetchPageData(roundId) {
  const round = rounds.value.find(r => r.id === roundId);
  if (!round) return;

  try {
    const { data, error, count } = await supabase
      .from('ContestantRound')
      .select('Contestants(id, name), Round(id)')
      .eq('Round_id', roundId)
      .range((round.page - 1) * round.itemsPerPage, round.page * round.itemsPerPage - 1);

    if (error) throw new Error(error.message);

    round.items = data.map(({ Contestants }) => ({
      candidateId: String(Contestants.id),
      candidateName: Contestants.name || 'Unknown',
      roundName: round.name,
      criteriaMap: {}
    })).sort((a, b) => a.candidateId - b.candidateId);

    round.totalItems = count;
  } catch (error) {
    console.error(`Error fetching data for round ${roundId}:`, error.message);
  }
}

// Submit scores to Supabase
async function submitScores() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User is not authenticated');

  const scoresToSubmit = rounds.value.flatMap(round => {
    return round.items.flatMap(item => {
      return Object.entries(item.criteriaMap).map(([criteriaId, score]) => ({
        Contestants_id: Number(item.candidateId),
        Criteria_id: Number(criteriaId),
        Users_id: userId,
        Round_id: round.id,
        Score: Number(score)
      }));
    });
  });

  if (scoresToSubmit.length === 0) {
    $toast.error('Please choose scores to submit');
    return;
  }

  try {
    const { error } = await supabase.from('Score').upsert(scoresToSubmit);
    if (error) throw new Error(error.message);
    $toast.success('Scores submitted successfully');
    submitted.value = true;
    localStorage.setItem('scoresSubmitted', 'true');
  } catch (error) {
    alert(`Error submitting scores: ${error.message}`);
  }
}

// Update score when a selection changes
function handleScoreChange(roundId, candidateId, criteriaId) {
  console.log(`Score changed for candidate ${candidateId}, criteria ${criteriaId}`);
}

// Initialize on page load
onMounted(() => {
  const storedSubmittedState = localStorage.getItem('scoresSubmitted');
  submitted.value = storedSubmittedState === 'true';
  fetchRounds(); // This will now load rounds and scores from the database
});
</script>

