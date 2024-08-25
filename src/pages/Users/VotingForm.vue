<template>
  <Indexnav />
  <v-container>
    <v-container class="d-flex pb-2 pt-2">
      <h1 class="text-medium-emphasis"><span class="text-green">R</span>ounds</h1>
      <v-spacer></v-spacer>
      <v-btn
        variant="tonal"
        class="ma-2 z-index"
        color="blue"
        @click="submitScores"
        :disabled="submitted"
      >
        Submit Score<v-icon icon="mdi mdi-check" end></v-icon>
      </v-btn>

      <v-btn
        variant="tonal"
        class="ma-2 z-index"
        color="red"
        @click="resetSubmissionState"
      >
        Reset Submission<v-icon icon="mdi mdi-refresh" end></v-icon>
      </v-btn>
    </v-container>

    <div v-for="round in rounds" :key="round.id">
      <h1 class="text-medium-emphasis mt-8 mb-10">{{ round.name }}</h1>
      <v-data-table-server
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
                @change="handleScoreChange(item.candidateId, criteria.id)"
                density="default"
                hide-details
              />
            </td>
          </tr>
        </tbody>
      </v-data-table-server>
    </div>

    <v-progress-linear
      v-if="isLoadingRounds"
      color="green"
      height="6"
      indeterminate
      rounded
    ></v-progress-linear>

    <v-empty-state
      class="mt-16 pt-16"
      v-if="isMatchRounds"
      icon="mdi-magnify"
      text="Try restarting your connections. Sometimes less specific terms or broader queries can help you find what you're looking for."
      title="We couldn't fetch data from Database."
    ></v-empty-state>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient'; // Ensure this path is correct

const rounds = ref([]);
const scoreOptions = ref([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]); // Example score options

const isLoadingRounds = ref(true);
const isMatchRounds = ref(false);
const submitted = ref(false); // Add a reactive variable to track if scores have been submitted

async function getCurrentUserId() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    if (!user) throw new Error('No authenticated user found');
    return user.id; // Assuming this is the ID that corresponds to `Users.id`
  } catch (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
}

async function fetchRounds() {
  isLoadingRounds.value = true;
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User is not authenticated');
    
    const { data: roundData, error: roundError } = await supabase
      .from('Round')
      .select('id, name');

    if (roundError) throw new Error(roundError.message);

    const roundsWithCriteria = await Promise.all(roundData.map(async (round) => {
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('Criteria')
        .select('id, criteriaName')
        .eq('Round_id', round.id);

      if (criteriaError) throw new Error(criteriaError.message);

      // Fetch scores for the current user and round
      const { data: scoreData, error: scoreError } = await supabase
        .from('Score')
        .select('Criteria_id, Score')
        .eq('Round_id', round.id)
        .eq('Users_id', userId);

      if (scoreError) throw new Error(scoreError.message);

      const scoresMap = {};
      scoreData.forEach(score => {
        scoresMap[score.Criteria_id] = score.Score;
      });

      return {
        id: round.id,
        name: round.name,
        page: 1,
        itemsPerPage: 10,
        items: [],
        totalItems: 0,
        criteria: criteriaData,
        scoresMap // Add scoresMap to each round
      };
    }));

    rounds.value = roundsWithCriteria;
    await Promise.all(rounds.value.map(round => fetchPageData(round.id)));
  } catch (error) {
    console.error('Error fetching rounds data:', error.message);
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
      .from('Contestants')
      .select(`
        id,
        name,
        photo,
        Round(name)
      `, { count: 'exact' })
      .eq('Round.id', roundId)
      .range((round.page - 1) * round.itemsPerPage, round.page * round.itemsPerPage - 1);

    if (error) throw new Error(error.message);

    round.items = data
      .filter(contestant => contestant.Round[0]?.name)
      .map(contestant => ({
        candidateId: String(contestant.id),  // Convert to string to match UUID
        candidateName: contestant.name || 'Unknown',
        candidateImage: contestant.photo || '',
        roundName: contestant.Round[0]?.name || 'No Round',
        criteriaMap: {} // Initialize as an empty object
      }));
    round.totalItems = count;
  } catch (error) {
    console.error(`Error fetching data for round ${roundId}:`, error.message);
  }
}



async function submitScores() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User is not authenticated');

    const scoresToSubmit = [];

    rounds.value.forEach(round => {
      round.items.forEach(item => {
        Object.entries(item.criteriaMap).forEach(([criteriaId, score]) => {
          if (score !== null && score !== undefined) {
            scoresToSubmit.push({
              Contestants_id: String(item.candidateId),
              Criteria_id: Number(criteriaId),
              Users_id: String(userId),
              Round_id: String(round.id),
              Score: Number(score)
            });
          }
        });
      });
    });

    if (scoresToSubmit.length === 0) {
      alert('No scores to submit. Please choose your score.');
      return;
    }

    const { error } = await supabase
      .from('Score')
      .upsert(scoresToSubmit);

    if (error) throw new Error(error.message);

    alert('Scores submitted successfully');
    submitted.value = true;
    localStorage.setItem('scoresSubmitted', 'true');
  } catch (error) {
    alert('Error submitting scores: ' + error.message);
  }
}



function handleScoreChange(candidateId, criteriaId) {
  console.log(`Score changed for candidate ${candidateId}, criteria ${criteriaId}`);
  // Additional logic to handle score changes if needed
}



function resetSubmissionState() {
  submitted.value = false;
  localStorage.removeItem('scoresSubmitted');
}


function handleItemsPerPageUpdate(roundId, newItemsPerPage) {
  const round = rounds.value.find(r => r.id === roundId);
  if (round) {
    round.itemsPerPage = newItemsPerPage;
    fetchPageData(roundId);
  }
}

// Use watch to trigger fetchPageData only when page or itemsPerPage changes
watch(
  () => rounds.value.map(round => ({ id: round.id, page: round.page, itemsPerPage: round.itemsPerPage })),
  (newValues) => {
    newValues.forEach(round => fetchPageData(round.id));
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  const storedSubmittedState = localStorage.getItem('scoresSubmitted');
  if (storedSubmittedState === 'true') {
    submitted.value = true;
  }
  fetchRounds();
});


</script>
