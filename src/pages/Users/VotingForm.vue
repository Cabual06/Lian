<template>
<v-responsive>
  <v-toolbar class="border-b-sm px-16 py-2" style="background-color: #8654bf;">
    <v-toolbar-title>
      <span class="text-black font-weight-bold text-h6">TABULATION</span>
      <span> SYSTEM</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Display the account icon and user's email -->
    <div class="d-flex align-center mr-4">
      <v-icon color="white" class="mr-2">mdi-account-circle</v-icon>
      <span class="text-white font-weight-bold">{{ userEmail }}</span>
    </div>

    <v-btn color="black" @click="logout" class="bg-white">Logout</v-btn>
  </v-toolbar>

  <v-toolbar class="bg-white px-16 border-b-lg">
    <v-spacer></v-spacer>
    <div class="text-center d-flex align-center">
      <!-- Add the logo -->
      <img
        src="/src/assets/mdc1.png"
        alt="Logo"
        class="mr-4"
        style="width: 30px; height: 30px;"
      />
      <span class="text-medium-emphasis opacity-80">
        A System created by BSIT Students from MDC
      </span>
    </div>
    <v-spacer></v-spacer>
  </v-toolbar>
</v-responsive>

  <v-app style="background-color: #f2f2f2">
    <v-container>
      <!-- Event Selection Boxes -->
      <v-container class="mb-4 mt-4">
        <h1 class=" mb-4 text-purple font-weight-bold mt-6 ml-4">Available Events</h1><span class="ml-6  text-medium-emphasis">Please Choose an Event to Judge</span>

        <v-row dense class="mt-10">
            <v-col
              v-for="event in events"
              :key="event.id"
              cols="12" sm="6" md="4"
            >
              <!-- Card container for the overlay -->
              <div class="position-relative">
                <!-- Filling Overlay for Animation (only for the v-card) -->
                <div
                  v-if="loadingEvent === event.id"
                  class="loading-overlay"
                ></div>

                <!-- v-card content -->
                <v-card
                  outlined
                  hover
                  class="pa-4 mb-2 mx-2"
                  @click="handleCardClick(event)"
                >
                  <v-card-title class="text-h6 font-weight-bold">
                    {{ event.name }}
                    <!-- Display event status -->
                    <v-chip
                      v-if="event.status"
                      :color="event.status === 'ongoing' ? 'green' : event.status === 'upcoming' ? 'yellow' : 'red'"
                      class="ml-2 font-weight-bold"
                    >
                      {{ event.status.charAt(0).toUpperCase() + event.status.slice(1) }}
                    </v-chip>
                  </v-card-title>
                  <v-card-text>
                    <div>{{ event.description }}</div>
                    <!-- Start Date -->
                    <div class="mt-2 text-medium-emphasis">
                      <span class="font-weight-bold">Start Date:</span> {{ formatDate(event.start_date) }}
                    </div>
                    <div class="text-medium-emphasis">
                      <span class="font-weight-bold">End Date:</span> {{ formatDate(event.end_date) }}
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-col>
          </v-row>
            <v-alert v-if="events.length === 0" type="info" border="top">
              No events available for scoring at the moment.
            </v-alert>
          </v-container>

          <!-- Loading and other states (unchanged) -->
          <!-- <v-container class="d-flex justify-center align-center" style="min-height: 75vh;">
            <v-progress-circular
              v-if="isLoadingRounds"
              color="green"
              :size="60"
              :width="7"
              indeterminate
            ></v-progress-circular>
            <v-empty-state
              v-else-if="isMatchRounds"
              icon="mdi mdi-file-document-alert-outline"
              text="Contact the Administrator or Restart your Connections."
              title="No Tabulation set by the Admin."
            ></v-empty-state>
          </v-container> -->

      <!-- Dialog for submitting scores (unchanged) -->
      <v-dialog v-model="dialogVisible" persistent max-width="80%">
        <v-card class="px-8 py-4 rounded-lg position-relative">
          <!-- Sticky Cancel Button -->
          <v-btn
            icon
            class="cancel-button"
            color="red"
            variant="flat"
            @click="dialogVisible = false"
          >
          <v-tooltip activator="parent" location="bottom">Close</v-tooltip>
            <v-icon icon="mdi mdi-close"></v-icon>
          </v-btn>

          <v-card-title class="headline text-medium-emphasis font-weight-bold mt-10 ml-8 mb-4">
            Submit Scores for <span class="text-purple"><h2>{{ selectedEvent?.name }}</h2></span>
          </v-card-title>
          <a class="ml-12" href="#" @click.prevent="showCandidatesDialog">View Candidates</a>
          <v-card-text>
            <v-container class="rounded">
              <v-row v-for="(round, roundIndex) in rounds" :key="round.id">
                <v-col cols="12" class="mb-4">
                  <v-data-table
                    v-model:items-per-page="round.itemsPerPage"
                    :items="round.items"
                    :items-length="round.totalItems"
                    :page.sync="round.page"
                    fixed-header
                    theme="rounded opacity-100"
                    class="bg-transparent rounded-lg"
                    @update:page="(page) => handlePageUpdate(round.id, page)"
                    @update:items-per-page="(itemsPerPage) => handleItemsPerPageUpdate(round.id, itemsPerPage)"
                  >
                    <thead class="opacity-100">
                      <tr>
                        <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Candidate ID</th>
                        <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Candidate Name</th>
                        <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Round Name</th>
                        <th
                          v-for="criteria in round.criteria"
                          :key="criteria.id"
                          class="text-center text-white font-weight-bold"
                          style="background-color: #9e71d1;"
                        >
                          {{ criteria.criteriaName }}
                        </th>
                        <th class="text-center text-white font-weight-bold" style="background-color: #9e71d1;">Total Scores</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in round.items" :key="item.candidateId" class="font-weight-bold">
                        <td>{{ item.candidateId || 'Unknown' }}</td>
                        <td>{{ item.candidateName || 'Unknown' }}</td>
                        <td>{{ item.roundName }}</td>
                        <td v-for="criteria in round.criteria" :key="criteria.id" class="text-center">
                          <v-select
                            variant="plain"
                            v-model="item.criteriaMap[criteria.id]"
                            :items="generateScoreOptions(criteria.percentage)"
                            hide-details
                            density="default"
                            style="width: 60px; margin: auto;"
                          ></v-select>
                        </td>
                        <td class="text-center">
                          {{ calculateTotalScore(item, round) }}
                        </td>
                      </tr>
                    </tbody>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions class="mb-6">
            <v-btn color="white" class="bg-green mr-10" @click="submitScores" :disabled="selectedEvent?.status === 'ended' || selectedEvent?.status === 'upcoming'">
              Submit Scores
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <!-- New Dialog for Candidates -->
       
      <v-dialog v-model="candidatesDialogVisible" max-width="80%">
      <!-- Additional Bottom Section -->
      <v-card-text class="mt-4 text-rightdow">
        <p class="font-weight-bold text-black">Total Contestants: {{ contestants.length }}</p>
      </v-card-text>
      <v-card class="px-8 py-4 rounded-lg">
        <v-card-title class="headline text-medium-emphasis font-weight-bold mt-10 ml-8 mb-4">
          Contestants registered
          <span class="text-purple"><h2>{{ selectedEvent?.name }}</h2></span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <!-- Check if contestants array is populated -->
              <v-col v-if="contestants.length === 0" class="text-center">No contestants available.</v-col>

              <!-- Display each contestant -->
              <v-col
                v-for="contestant in contestants"
                :key="contestant.id"
                cols="12"
                sm="4"
                md="3"
                class="mb-4"
              >
                <v-card class="rounded-lg px-4 d-flex flex-column" style="height: 400px;" elevation="2">
                  <!-- Image with 80% height -->
                  <v-img
                    :src="contestant.photo"
                    class="rounded-top mt-2 rounded-lg"
                    style="flex: 1 0 auto; height: 80%;"
                  ></v-img>
                  <!-- Contestant Name -->
                  <v-card-text class="text-center mb-2">
                    <span class="font-weight-bold">Contestant Name: </span> {{ contestant.name }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="mb-6">
          <v-btn
            color="white"
            class="bg-red px-6"
            @click="candidatesDialogVisible = false"
          >
            Close <v-icon icon="mdi mdi-close-circle-outline" end></v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

      <v-dialog persistent v-model="congratulationsDialog" max-width="500px">
            <v-card class="rounded-lg">

              <v-card-title class="text-h4 d-flex flex-column justify-center align-center text-green text-center font-weight-bold mt-8">Scores Submitted!
                <img src="@/assets/ty.png" alt="Congratulations Icon" width="220" height="220" class="m-8 mt-10 mb-4" />
              </v-card-title>

              <v-card-subtitle class="font-weight-bold text-center mt-4">Your scores have been successfully submitted for the Event.</v-card-subtitle>
              <v-card-actions>
                <v-btn variant="flat" class="mr-10 mb-6 mt-6 font-weight-bold" color="green" text @click="congratulationsDialog = false">DONE</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
    </v-container>


    <v-dialog persistent v-model="statusDialogVisible" max-width="500px">
      <v-card class="rounded-lg pa-8">
        <v-card-title class="mt-4 text-h5 d-flex flex-column justify-center align-center text-red text-center font-weight-bold"> 
          {{ statusDialogMessage }}
          <img src="@/assets/sad.png" alt="Congratulations Icon" width="280" height="280" class="m-8 mb-4" />
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="mt-6" variant="flat" color="red" @click="statusDialogVisible = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

const congratulationsDialog = ref(false);
const $toast = useToast();
const router = useRouter();
const events = ref([]);
const selectedEvent = ref(null);
const rounds = ref([]);
const isLoadingRounds = ref(false);
const dialogVisible = ref(false);
const candidatesDialogVisible = ref(false);
const contestants = ref([]);
const loadingEvent = ref(null); // Track the event being loaded
const userEmail = ref(''); 
const statusDialogVisible = ref(false);
const statusDialogMessage = ref('');

// Fetch the logged-in user's UUID
async function fetchUserId() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const userId = data.user?.id;
    console.log('Fetched User ID:', userId); // Debug log to confirm user is correct
    return userId || null;
  } catch (err) {
    console.error('Error fetching user ID:', err.message);
    return null;
  }
}

async function fetchUserEmail() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    userEmail.value = data.user?.email || 'Guest'; // Set the email or default to 'Guest'
  } catch (err) {
    console.error('Error fetching user email:', err.message);
  }
}



function generateScoreOptions(percentage) {
  return Array.from({ length: percentage }, (_, i) => i + 1);
}

async function fetchEvents() {
  try {
    const { data, error } = await supabase
      .from('Event')
      .select('id, name, description, status, start_date, end_date');

    if (error) throw error;

    console.log('Fetched Events:', data); // Log to verify

    events.value = data;
  } catch (err) {
    console.error('Error fetching events:', err.message);
    $toast.error('Failed to load events. Please try again later.');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Adjust for local timezone
  return localDate.toISOString().split('T')[0]; // Formats date as 'YYYY-MM-DD'
}


// Logout Function
async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    $toast.success('Successfully logged out.');
    router.push('/login'); // Redirect to login or home page
  } catch (err) {
    console.error('Error during logout:', err.message);
    $toast.error('Failed to log out. Please try again.');
  }
}

// Function to fetch contestants based on the selected event
const fetchContestants = async () => {
  console.log("Fetching contestants...");

  if (!selectedEvent.value) return;

  // Fetch contestants based on event_id
  const { data, error } = await supabase
    .from('Contestants')
    .select('id, name, photo')
    .eq('event_id', selectedEvent.value.id);

  if (error) {
    console.error('Error fetching contestants:', error.message);
  } else {
    contestants.value = data;  // Update contestants with fetched data
    console.log('Contestants fetched:', contestants.value); // Verify the data
  }
};

// Watch for selectedEvent changes to fetch contestants
watch(() => selectedEvent.value, fetchContestants, { immediate: true });

// Show the candidates dialog
function showCandidatesDialog() {
  candidatesDialogVisible.value = true;
  fetchContestants();  // Fetch contestants for the event
}

async function fetchRoundsForEvent(eventId) {
  isLoadingRounds.value = true;
  try {
    // Fetch the logged-in user's UUID (ensure it's correctly fetched)
    const userId = await fetchUserId();
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    console.log('Logged-in User ID:', userId); // Debug log to confirm user is correct

    // Fetch round IDs associated with the event
    const { data: roundIds, error: roundIdsError } = await supabase
      .from('event_rounds')
      .select('Round_id')
      .eq('Event_id', eventId);

    if (roundIdsError) throw roundIdsError;

    // Fetch round data for each round
    const { data: roundData, error: roundError } = await supabase
      .from('Round')
      .select('id, name')
      .in('id', roundIds.map(id => id.Round_id));

    if (roundError) throw roundError;

    // Fetch all criteria for each round
    const roundsWithCriteria = await Promise.all(
      roundData.map(async (round) => {
        const { data: criteriaData, error: criteriaError } = await supabase
          .from('Criteria')
          .select('id, criteriaName, percentage')
          .eq('Round_id', round.id);

        if (criteriaError) throw criteriaError;

        // Fetch all contestants for this round
        const { data: contestantData, error: contestantError } = await supabase
          .from('ContestantRound')
          .select('Contestants(id, name)')
          .eq('Round_id', round.id);

        if (contestantError) throw contestantError;

        // Fetch scores for the specific user, event, round, and criteria
        const { data: scoreData, error: scoreError } = await supabase
          .from('Score')
          .select('Contestants_id, Criteria_id, Score, Round_id')
          .eq('Event_id', eventId)
          .eq('Users_id', userId);  // Explicitly filter scores by logged-in user (Users_id)

        if (scoreError) {
          console.error('Error fetching scores:', scoreError.message);
        } else {
          console.log('Fetched Scores:', scoreData); // Check which scores are returned for the user
        }


        // Debugging: Check what scores are fetched for the user
        console.log('Fetched Scores:', scoreData);

        // Map the scores to a dictionary by round, contestant, and criteria
        const scoresMap = scoreData.reduce((map, score) => {
          const key = `${score.Round_id}_${score.Contestants_id}_${score.Criteria_id}`;
          map[key] = score.Score;
          return map;
        }, {});

        // Prepare items for display
        const items = contestantData.map((contestant) => ({
          candidateId: String(contestant.Contestants.id),
          candidateName: contestant.Contestants.name,
          roundName: round.name,
          criteriaMap: Object.fromEntries(
            criteriaData.map((c) => [
              c.id,
              scoresMap[`${round.id}_${contestant.Contestants.id}_${c.id}`] || null,
            ])
          ),
        }));

        return {
          id: round.id,
          name: round.name,
          criteria: criteriaData,
          items: items,
          page: 1,
          itemsPerPage: 20,
          totalItems: items.length,
        };
      })
    );

    rounds.value = roundsWithCriteria;
    dialogVisible.value = true;
  } catch (err) {
    console.error('Error fetching rounds:', err.message);
    $toast.error('Failed to load rounds. Please try again later.');
  } finally {
    isLoadingRounds.value = false;
  }
}


async function selectEvent(event) {
  selectedEvent.value = event;
  await fetchRoundsForEvent(event.id);
}

function calculateTotalScore(item, round) {
  return round.criteria.reduce((total, criteria) => {
    const score = item.criteriaMap[criteria.id];
    return total + (score || 0);
  }, 0);
}

async function submitScores() {
  try {
    // Fetch logged-in user's UUID
    const userId = await fetchUserId();

    if (!userId) {
      throw new Error('User is not authenticated');
    }

    const scoreData = rounds.value.flatMap(round =>
      round.items.flatMap(item =>
        Object.entries(item.criteriaMap).map(([criteriaId, score]) => ({
          Contestants_id: item.candidateId,
          Criteria_id: criteriaId,
          Score: score,
          Round_id: round.id,
          Event_id: selectedEvent.value.id,
          Users_id: userId, // Ensure the logged-in user's UUID is used when submitting the score
        }))
      )
    );

    // Log scoreData for debugging
    console.log('Score Data:', scoreData);

    const { error } = await supabase
      .from('Score')
      .upsert(scoreData, { onConflict: ['Contestants_id', 'Criteria_id', 'Round_id', 'Event_id', 'Users_id'] });

    if (error) throw error;

    dialogVisible.value = false;
    congratulationsDialog.value = true; // Show the modal
  } catch (error) {
    console.error('Error submitting scores:', error);
    $toast.error('Failed to submit scores. Please try again.');
  }
}

// Start loading animation when card is clicked
async function handleCardClick(event) {
  if (loadingEvent.value) return; // Prevent multiple clicks

  // Check if the event status requires a message
  if (event.status === 'ended' || event.status === 'upcoming') {
    statusDialogMessage.value =
      event.status === 'ended'
        ? 'Sorry, this event has already ended.'
        : 'Event is upcoming and not yet available.';
    statusDialogVisible.value = true;
    return;
  }

  // Start loading animation on the clicked event card
  loadingEvent.value = event.id;

  // Start the fetch process immediately without artificial delay
  try {
    // Fetch the event, rounds, and criteria data concurrently (or sequentially, depending on your needs)
    await selectEvent(event); // Fetch rounds and criteria for the selected event
  } catch (error) {
    console.error('Error during event fetch:', error);
  } finally {
    loadingEvent.value = null; // Reset loading state once the data fetching is done
  }

  // Show the dialog after loading animation and data fetching
  dialogVisible.value = true;
}

onMounted(() => {
  fetchUserEmail();
  fetchEvents();
});
</script>

<style>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 7px;
  width: 98.5%;
  height: 100%;
  background-color: rgba(157, 130, 189, 0.5);
  animation: fill-up 3.5s linear forwards; /* Default is 3s */
  z-index: 1;
  pointer-events: none; /* Ensure clicks pass through */
  border-radius: 5px; /* Match card border radius */
}

@keyframes fill-up {
  from {
    width: 0;
  }
  to {
    width: 97.2%;
  }
}

.cancel-button {
  position: sticky; /* Ensure it stays within the v-card */
  top: 50px;          /* Position near the top */
  left: 1363px;     /* Position near the right edge */
  z-index: 10;        /* Ensure it stays on top of other content */
}

.v-data-table {
  border-collapse: collapse;
  border: .5px solid grey; /* Example: change border color to green */
}

.v-data-table tbody tr:hover {
  background-color: #DCDCDC; /* Light green background on hover */
}

.text-green {
  color: green;
}

.text-red {
  color: red;
}

</style>
