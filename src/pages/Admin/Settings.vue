<template>
    <Nav />
    <v-container>
      <v-container class="d-flex pt-16 pb-2 pt-2">
        <h1 class="text-medium-emphasis"><span class="text-green">S</span>cores</h1>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" class="ma-2 z-index" color="red" @click="resetSubmissionState">
          Reset <v-icon icon="mdi mdi-refresh" end></v-icon>
        </v-btn>
        <v-btn variant="tonal" class="ma-2 z-index" color="green" @click="submitScores" :disabled="submitted">
          Print <v-icon icon="mdi mdi-check" end></v-icon>
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
              <th class="text-left text-green font-weight-bold">Candidate ID</th>
              <th class="text-left text-green font-weight-bold">Candidate Name</th>
              <th class="text-left text-green font-weight-bold">Round Name</th>
              <th v-for="criteria in round.criteria" :key="criteria.id" class="text-center text-green font-weight-bold">
                {{ criteria.criteriaName }}
              </th>
              <th class="text-center text-green font-weight-bold">Total Scores</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in round.items" :key="item.candidateId">
              <td>{{ item.candidateId || 'Unknown' }}</td>
              <td>{{ item.candidateName || 'Unknown' }}</td>
              <td>{{ item.roundName }}</td>
              <td class="text-center" v-for="criteria in round.criteria" :key="criteria.id">
                {{ item.criteriaMap[criteria.id] || 'No Score' }}
              </td>
              <td class="text-center" :class="{ 'text-green': calculateTotalScore(item, round) === getHighestScore(round) }">
                {{ calculateTotalScore(item, round) }}
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
  const isLoadingRounds = ref(true);
  const isMatchRounds = ref(false);
  const submitted = ref(false);
  
  async function getCurrentUserId() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      return user ? user.id : null;
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
  
      const { data: roundData, error: roundError } = await supabase.from('Round').select('id, name');
      if (roundError) throw new Error(roundError.message);
  
      if (roundData.length === 0) {
        isMatchRounds.value = true;
        return;
      }
      isMatchRounds.value = false;
  
      const roundsWithCriteria = await Promise.all(roundData.map(async (round) => {
        const { data: criteriaData, error: criteriaError } = await supabase
          .from('Criteria')
          .select('id, criteriaName')
          .eq('Round_id', round.id);
        if (criteriaError) throw new Error(criteriaError.message);
  
        const { data: scoreData, error: scoreError } = await supabase
          .from('Score')
          .select('Contestants_id, Criteria_id, Score')
          .eq('Round_id', round.id)
          .eq('Users_id', userId);
        if (scoreError) throw new Error(scoreError.message);
  
        const scoresMap = {};
        scoreData.forEach(score => {
          if (!scoresMap[score.Contestants_id]) {
            scoresMap[score.Contestants_id] = {};
          }
          scoresMap[score.Contestants_id][score.Criteria_id] = score.Score;
        });
  
        return {
          id: round.id,
          name: round.name,
          page: 1,
          itemsPerPage: 10,
          items: [],
          totalItems: 0,
          criteria: criteriaData,
          scoresMap
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
        .select('id, name, photo, Round(name)', { count: 'exact' })
        .eq('Round.id', roundId)
        .range((round.page - 1) * round.itemsPerPage, round.page * round.itemsPerPage - 1);
      if (error) throw new Error(error.message);
  
      round.items = data.map(contestant => {
        const item = {
          candidateId: String(contestant.id),
          candidateName: contestant.name || 'Unknown',
          roundName: contestant.Round[0]?.name || 'Not Qualify',
          criteriaMap: round.scoresMap[contestant.id] || {}
        };
        return item;
      });
      round.totalItems = count;
    } catch (error) {
      console.error(`Error fetching data for round ${roundId}:`, error.message);
    }
  }
  
  function calculateTotalScore(item, round) {
    return round.criteria.reduce((total, criteria) => {
      const score = item.criteriaMap[criteria.id];
      return total + (score ? Number(score) : 0);
    }, 0);
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
                Contestants_id: Number(item.candidateId),
                Criteria_id: Number(criteriaId),
                Users_id: String(userId),
                Round_id: Number(round.id),
                Score: Number(score)
              });
            }
          });
        });
      });
  
      if (scoresToSubmit.length === 0) {
        $toast.error('No scores to submit', {
          position: 'bottom-right',
          duration: 8000,
          dismissible: true,
        });
        return;
      }
  
      const { error } = await supabase.from('Score').upsert(scoresToSubmit);
      if (error) throw new Error(error.message);
  
      $toast.success('Scores submitted successfully', {
        position: 'bottom-right',
        duration: 8000,
        dismissible: true,
      });
      submitted.value = true;
      localStorage.setItem('scoresSubmitted', 'true');
      await fetchRounds(); // Refresh state after submission
    } catch (error) {
      alert('Error submitting scores: ' + error.message);
    }
  }

  function getHighestScore(round) {
  return Math.max(...round.items.map(item => calculateTotalScore(item, round)));
  }

  
  function resetSubmissionState() {
    submitted.value = false;
    localStorage.removeItem('scoresSubmitted');
  }
  
  async function initialize() {
    await fetchRounds();
    submitted.value = localStorage.getItem('scoresSubmitted') === 'true';
  }
  
  onMounted(initialize);
  </script>
  