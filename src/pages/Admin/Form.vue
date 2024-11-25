<template>

  <Nav />
  <v-app class="" style="background-color: #f2f2f2">

    <v-container class="px-16 mt-12 pt-12">
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <h1 class="mt-12 mb-4 text-medium-emphasis">
            <span class="text-purple ml-4">EVENTS</span><span class="text-black"> LISTS</span>
          </h1>
        </v-col>
        
        <v-col cols="auto">
          <v-btn class="mt-8 mr-4 font-weight-bold" color="purple" dark @click="openPopup">Create Event</v-btn>
        </v-col>
      </v-row>
      <v-container class="d-flex">
        <v-dialog v-model="showPopup" persistent max-width="800px">
      <template #activator="{ on, attrs }">
        <v-breadcrumbs :items="['Home', 'Dashboard', 'Forms']"></v-breadcrumbs>
      </template>

  <v-card class="pa-6 position-relative rounded-lg">
    <!-- Sticky Cancel Button -->
    <v-btn
      icon
      class="cancel-button"
      color="red"
      variant="flat"
      @click="closePopup"
    >
    <v-tooltip activator="parent" location="bottom">Close</v-tooltip>
      <v-icon icon="mdi mdi-close"></v-icon>
    </v-btn>

    <v-card-title class="mt-4 mb-2 ml-2">
      <span class="text-h4 font-weight-bold text-purple">Create Event</span>
    </v-card-title>
    <v-card-text>
      <v-form ref="eventForm">
        <!-- Event Details -->
        <v-text-field v-model="newEvent.name" variant="outlined" label="Event Name" required></v-text-field>
        <v-textarea v-model="newEvent.description" variant="outlined" label="Event Description" required></v-textarea>

        <v-row>
          <v-col cols="6">
            <!-- Start Date Input -->
            <v-text-field
              variant="outlined"
              v-model="newEvent.start_date"
              label="Start Date"
              required
              hint="YYYY-MM-DD"
              persistent-hint
              :rules="[dateFormatRule]"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <!-- End Date Input -->
            <v-text-field
              variant="outlined"
              v-model="newEvent.end_date"
              label="End Date"
              required
              hint="YYYY-MM-DD"
              persistent-hint
              :rules="[dateFormatRule, endDateRule]"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Add Contestants -->
        <h5 class="mb-4">Add Contestants</h5>
        <v-btn color="purple" class="mb-4 font-weight-bold" small @click="addContestant">Add Contestant</v-btn>
        <div v-for="(contestant, index) in newEvent.contestants" :key="index" class="my-2">
          <v-row>
            <v-col cols="4">
              <v-text-field variant="outlined" v-model="contestant.name" label="Name" dense></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field variant="outlined" v-model="contestant.age" label="Age" dense></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field variant="outlined" v-model="contestant.address" label="Address" dense></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field variant="outlined" v-model="contestant.course" label="Course" dense></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-select
                variant="outlined"
                v-model="contestant.gender"
                :items="['Male', 'Female']"
                label="Gender"
                dense
              ></v-select>
            </v-col>
            <v-col cols="8">
              <v-file-input
                variant="outlined"
                v-model="contestant.photo"
                label="Upload Photo"
                accept="image/*"
                dense
                outlined
              ></v-file-input>
            </v-col>
            <!-- Remove button -->
            <v-col cols="12">
              <v-btn color="red" class="font-weight-bold" @click="removeContestant(index)" small>
                Remove
                <v-icon icon="mdi mdi-close-circle" end></v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Add Rounds and Criteria -->
        <h5>Add Rounds</h5>
        <v-btn color="purple" class="mb-2 font-weight-bold" small @click="addRound">Add Round</v-btn>
        <div v-for="(round, roundIndex) in newEvent.rounds" :key="roundIndex" class="my-3">
          <v-text-field variant="outlined" v-model="round.name" label="Round Name" dense></v-text-field>
          <v-btn color="primary" class="font-weight-bold mb-2" small @click="addCriterion(roundIndex)">Add Criteria</v-btn>
          <div v-for="(criterion, critIndex) in round.criteria" :key="critIndex" class="my-2">
            <v-row>
              <v-col cols="8">
                <v-text-field variant="outlined" v-model="criterion.criteriaName" label="Criteria Name" dense></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field variant="outlined" v-model.number="criterion.percentage" label="Percentage" type="number" dense></v-text-field>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn class="font-weight-bold px-8 mr-2" color="green" variant="flat" @click="saveEvent">
        Save
        <v-icon icon="mdi mdi-check-circle" end></v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


        <!-- View Scores Popup -->
        <v-dialog v-model="showScoresPopup" persistent max-width="1500px">
          <template #activator="{ on, attrs }"></template>

          <v-card class="pa-6 rounded-lg position-relative">
            <!-- Sticky Close Button -->
            <v-btn
              icon
              class="close-button"
              color="red"
              variant="flat"
              @click="closeScoresPopup"
            >
            <v-tooltip activator="parent" location="bottom">Close</v-tooltip>
              <v-icon icon="mdi mdi-close"></v-icon>
            </v-btn>

            <!-- Title -->
            <v-card-title class="pt-8">
              <span class="text-h4 font-weight-bold text-purple ml-8">Scores Submitted</span>
            </v-card-title>

            <!-- Content -->
            <v-card-text class="rounded-lg mx-6">
              <div v-if="eventScores.length > 0" v-for="round in eventScores" :key="round.roundName">
                <v-data-table
                  :items="round.scores"
                  :headers="[
                    { text: 'Contestant Name', align: 'start' },
                    { text: 'Round Name', align: 'start' },
                    ...Object.keys(round.scores[0].scores).map(criteria => ({
                      text: criteria,
                      align: 'center'
                    })),
                    { text: 'Total Score', align: 'center' }
                  ]"
                  item-value="contestantName"
                  class="rounded-lg mb-4 mt-12"
                >
                  <template v-slot:default="{ items }">
                    <thead>
                      <tr>
                        <th class="text-left text-white font-weight-bold" style="background-color: #5c2f91;">Contestant Name</th>
                        <th class="text-left text-white font-weight-bold" style="background-color: #5c2f91;">Round Name</th>
                        <th
                          v-for="(criteria, index) in Object.keys(round.scores[0].scores)"
                          :key="index"
                          class="text-center text-white font-weight-bold"
                          style="background-color: #5c2f91;"
                        >
                          {{ criteria }}
                        </th>
                        <th class="text-center text-white font-weight-bold" style="background-color: #5c2f91;">Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in items" :key="item.contestantName">
                        <td class="font-weight-bold">{{ item.contestantName }}</td>
                        <td class="font-weight-bold">{{ round.roundName }}</td>
                        <td
                          v-for="(criteria, index) in Object.keys(round.scores[0].scores)"
                          :key="index"
                          class="text-center font-weight-bold"
                        >
                          {{ item.scores[criteria] || 'No Score' }}
                        </td>
                        <td class="text-center font-weight-bold">
                          {{ Object.values(item.scores).reduce((sum, score) => sum + score, 0) }}
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-data-table>
              </div>
            </v-card-text>

            <!-- Actions -->
            <v-card-actions class="mb-4">
              <v-btn class="px-4" color="primary" variant="flat" @click="downloadPDF">Download PDF <v-icon icon="mdi mdi-download" end></v-icon></v-btn>
              <v-btn class="px-4 mr-12" color="purple" variant="flat" @click="printScores">Print <v-icon icon="mdi mdi-printer" end></v-icon></v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


      </v-container>

      <v-data-table-server
      v-model:items-per-page="itemsPerPageEvents"
      :items="serverItemsEvents"
      :items-length="totalItemsEvents"
      :page.sync="pageEvents"
      fixed-header
      theme="light rounded opacity-100"
      class="bg-transparent"
      @update:page="handlePageUpdateEvents"
      @update:items-per-page="handleItemsPerPageUpdateEvents"
    >
      <thead class="opacity-100">
        <tr>
          <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Event ID</th>
          <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Event Name</th>
          <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Description</th>
          <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Start Date</th>
          <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">End Date</th>
          <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Status</th>
          <th class="text-center text-white font-weight-bold" style="background-color: #9e71d1;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in serverItemsEvents" :key="event.id" class="font-weight-bold">
          <td>{{ event.id }}</td>
          <td>{{ event.name }}</td>
          <td>{{ event.description }}</td>
          <td>{{ formatDate(event.start_date) }}</td>
          <td>{{ formatDate(event.end_date) }}</td>
          <td :class="{ 'text-green': event.status === 'ongoing', 'text-yellow': event.status === 'upcoming', 'text-red': event.status === 'ended' }">
            {{ event.status }}
          </td>
          <td class="text-center">
            <v-btn @click="viewScores(event.id)" variant="flat" size="small" class="ma-2 font-weight-bold" color="primary">
              <v-tooltip activator="parent" location="bottom">View Scores</v-tooltip>
              <v-icon icon="mdi mdi-eye"></v-icon>
            </v-btn>
            <v-btn @click="closeEvent(event.id)" variant="flat" size="small" class="ma-2 font-weight-bold" color="green">
              <v-tooltip activator="parent" location="bottom">End Event</v-tooltip>
              <v-icon icon="mdi mdi-close-circle-outline"></v-icon>
            </v-btn>
            <v-btn @click="deleteEvent(event.id)" variant="flat" size="small" class="ma-2 font-weight-bold" color="red">
              <v-tooltip activator="parent" location="bottom">Delete Event</v-tooltip>
              <v-icon icon="mdi mdi-delete"></v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-data-table-server>

      <v-progress-linear v-if="isLoading" color="purple" height="6" indeterminate rounded></v-progress-linear>

    <v-empty-state
      class=""
      v-if="isMatch"
      icon="mdi-magnify"
      text="Try restarting your connections. Sometimes less specific terms or broader queries can help you find what you're looking for."
      title="We couldn't fetch data from Database."
    ></v-empty-state>
    </v-container>
  </v-app>
</template>


























<script setup>

import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 
import { useToast } from 'vue-toast-notification';
import { supabase } from '@/lib/supabaseClient';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isMatch = ref(false);
const $toast = useToast();
const isLoading = ref(true);
const serverItemsEvents = ref([]);
const totalItemsEvents = ref(0);
const pageEvents = ref(1);
const itemsPerPageEvents = ref(10);
const showPopup = ref(false);
const showScoresPopup = ref(false);  // Added ref for scores popup
const eventScores = ref([]);  // Store event scores
const scoreHeaders = ref([
  { text: 'Contestant Name', align: 'start', key: 'contestantName' },
  { text: 'Round', align: 'start', key: 'roundName' },
  { text: 'Criteria', align: 'start', key: 'criteriaName' },
  { text: 'Score', align: 'start', key: 'score' }
]);

// Static Breadcrumbs Array
const breadcrumbs = ref([
  { text: 'Dashboard', disabled: false, href: '/' },
  { text: 'Form', disabled: false, href: '/events' },
  { text: 'Events', disabled: true }
]);

const newEvent = ref({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  contestants: [],
  rounds: [],
});

// Date format validation rule (YYYY-MM-DD)
const dateFormatRule = (value) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) {
    return 'Date must be in the format YYYY-MM-DD';
  }
  return true;
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Adjust for local timezone
  return localDate.toISOString().split('T')[0]; // Formats date as 'YYYY-MM-DD'
}


// End date must be after start date
const endDateRule = (value) => {
  if (newEvent.value.start_date && new Date(value) < new Date(newEvent.value.start_date)) {
    return 'End date must be after start date';
  }
  return true;
};

function openPopup() {
  showPopup.value = true;
}

function closePopup() {
  resetForm();
  showPopup.value = false;
}

function addContestant() {
  newEvent.value.contestants.push({ name: '', age: '', address: '', course: '', gender: '', photo: '' });
}

function removeContestant(index) {
  // Remove the contestant from the array based on the index
  newEvent.value.contestants.splice(index, 1);
}

function addRound() {
  newEvent.value.rounds.push({ name: '', criteria: [] });
}


function addCriterion(roundIndex) {
  const round = newEvent.value.rounds[roundIndex];

  // Limit the number of criteria per round to 5
  if (round.criteria.length < 5) {
    round.criteria.push({ criteriaName: '', percentage: 20 });
  } else {
    $toast.error('You can only add up to 5 criteria per round.');
  }
}

async function saveEvent() {
  try {
    // Validate criteria percentages
    for (const round of newEvent.value.rounds) {
      const totalPercentage = round.criteria.reduce((sum, crit) => sum + crit.percentage, 0);
      if (totalPercentage !== 100) {
        $toast.error(`Criteria percentages in round "${round.name}" must sum to 100%.`);
        return;
      }
    }

    // Determine the initial status based on dates
    const currentDate = new Date();
    const startDate = new Date(newEvent.value.start_date);
    const endDate = new Date(newEvent.value.end_date);
    let initialStatus = 'upcoming';
    if (currentDate >= startDate && currentDate <= endDate) {
      initialStatus = 'ongoing';
    } else if (currentDate > endDate) {
      initialStatus = 'ended';
    }

    // Event saving logic
    const { data: eventData, error: eventError } = await supabase
      .from('Event')
      .insert({
        name: newEvent.value.name,
        description: newEvent.value.description,
        start_date: newEvent.value.start_date,
        end_date: newEvent.value.end_date,
        status: initialStatus,
      })
      .select()
      .single();

    if (eventError) throw eventError;
    const eventId = eventData.id;

    // Save contestants, rounds, and criteria (existing logic continues)
    const contestantIds = [];
    for (const contestant of newEvent.value.contestants) {
      let photoUrl = null;

      // Upload photo to Supabase Storage
      if (contestant.photo) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidate-photos')
          .upload(`photos/${contestant.name}-${Date.now()}`, contestant.photo);

        if (uploadError) {
          console.error('Failed to upload photo:', uploadError.message);
          $toast.error('Failed to upload contestant photo.');
          return;
        }

        // Get the public URL of the uploaded photo
        photoUrl = supabase.storage.from('candidate-photos').getPublicUrl(uploadData.path).data.publicUrl;
      }

      const { data: contestantData, error: contestantError } = await supabase
        .from('Contestants')
        .insert({
          name: contestant.name,
          age: contestant.age,
          address: contestant.address,
          course: contestant.course,
          gender: contestant.gender,
          photo: photoUrl,
          event_id: eventId,
        })
        .select()
        .single();

      if (contestantError) throw contestantError;
      contestantIds.push(contestantData.id);
    }

    // Handle rounds and criteria (existing logic continues)
    for (const round of newEvent.value.rounds) {
      const { data: roundData } = await supabase.from('Round').insert({ name: round.name }).select().single();
      const roundId = roundData.id;
      await supabase.from('event_rounds').insert({ Event_id: eventId, Round_id: roundId });

      for (const criterion of round.criteria) {
        await supabase.from('Criteria').insert({ ...criterion, Round_id: roundId });
      }

      for (const contestantId of contestantIds) {
        await supabase.from('ContestantRound').insert({
          Contestants_id: contestantId,
          Round_id: roundId,
        });
      }
    }

    $toast.success('Event created successfully!');
    closePopup();

    // Automatically reload the events list
    await fetchEvents();
  } catch (error) {
    console.error(error);
    $toast.error('Failed to save event.');
  }
}

function resetForm() {
  newEvent.value = {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    contestants: [],
    rounds: [],
  };
}



// Function to manually check and update the event status to "upcoming"
async function updateEventStatusToUpcoming(eventId, startDate) {
  const currentDate = new Date();
  const eventStartDate = new Date(startDate);

  // Check if the event is 1 or 2 days away from today
  const diffDays = Math.ceil((eventStartDate - currentDate) / (1000 * 60 * 60 * 24));
  if (diffDays === 1 || diffDays === 2) {
    try {
      const { error } = await supabase
        .from('Event')
        .update({ status: 'upcoming' })
        .eq('id', eventId);

      if (error) throw error;

      // Find the event in serverItemsEvents and update its status
      const event = serverItemsEvents.value.find(e => e.id === eventId);
      if (event) {
        event.status = 'upcoming'; // Update the local status
      }

    } catch (error) {
      console.error('Error updating event status to upcoming:', error.message);
      $toast.error('Failed to update event status.');
    }
  }
}

async function updateEventStatusToEnded(eventId) {
  try {
    const { error } = await supabase
      .from('Event')
      .update({ status: 'ended' })
      .eq('id', eventId);

    if (error) throw error;

    // Find the event in serverItemsEvents and update its status
    const event = serverItemsEvents.value.find(e => e.id === eventId);
    if (event) {
      event.status = 'ended'; // Update the local status
    }

  } catch (error) {
    console.error('Error updating event status:', error.message);
    $toast.error('Failed to update event status.');
  }
}

// Function to manually check and update the event status to "ongoing"
async function updateEventStatusToOngoing(eventId, startDate) {
  const currentDate = new Date().toISOString().split('T')[0];
  const eventStartDate = new Date(startDate).toISOString().split('T')[0];

  if (currentDate === eventStartDate) {
    try {
      const { error } = await supabase
        .from('Event')
        .update({ status: 'ongoing' })
        .eq('id', eventId);

      if (error) throw error;

      // Find the event in serverItemsEvents and update its status
      const event = serverItemsEvents.value.find(e => e.id === eventId);
      if (event) {
        event.status = 'ongoing'; // Update the local status
      }

    } catch (error) {
      console.error('Error updating event status to ongoing:', error.message);
      $toast.error('Failed to update event status.');
    }
  }
}

// Modify the fetchEvents function to include the status update check
async function fetchEvents() {
  try {

    const { data, count, error } = await supabase
      .from('Event')
      .select(`
        *,
        event_rounds (
          Round_id,
          Round:Round_id (
            id,
            name
          )
        ),
        Score (
          Score,
          Contestants:Contestants_id (id, name),
          Round:Round_id (id, name),
          Criteria:Criteria_id (criteriaName)
        )
      `, { count: 'exact' })
      .order('id', { ascending: true })
      .range((pageEvents.value - 1) * itemsPerPageEvents.value, pageEvents.value * itemsPerPageEvents.value - 1);

    isLoading.value = false;

    if (error) {
      throw new Error(error.message);
    }

    // Update the status of each event
    data.forEach(event => {
      updateEventStatusToUpcoming(event.id, event.start_date); // Check and update to "upcoming"
      updateEventStatusToOngoing(event.id, event.start_date);  // Check and update to "ongoing"
      const endDate = new Date(event.end_date);
      if (endDate < new Date() && event.status !== 'ended') {
        updateEventStatusToEnded(event.id); // Check and update to "ended"
      }
    });


    // Now group data by rounds and scores (same as before)
    serverItemsEvents.value = data.map(event => {
      event.rounds = event.event_rounds.map(round => round.Round);
      event.roundScores = {};
      event.event_rounds.forEach(round => {
        const roundName = round.Round.name;
        event.roundScores[roundName] = {
          scores: [],
          scoreHeaders: [{ text: 'Contestant Name', align: 'start' }, { text: 'Round Name', align: 'start' }]
        };

        event.Score.forEach(score => {
          if (score.Round.name === roundName) {
            const contestant = score.Contestants.name;
            const scoreObj = {
              contestantName: contestant,
              roundName: roundName,
              scores: { [score.Criteria.criteriaName]: score.Score },
              totalScore: score.Score
            };

            if (!event.roundScores[roundName].scoreHeaders.some(header => header.text === score.Criteria.criteriaName)) {
              event.roundScores[roundName].scoreHeaders.push({ text: score.Criteria.criteriaName, align: 'center' });
            }

            event.roundScores[roundName].scores.push(scoreObj);
          }
        });
      });

      return event;
    });

    totalItemsEvents.value = count;
  } catch (error) {
    $toast.error('Error fetching events: ' + error.message);
    isMatch.value = true;
  }
}

function handlePageUpdateEvents(newPage) {
  pageEvents.value = newPage;
  fetchEvents(); // Refetch data
}

// Handle items-per-page change
function handleItemsPerPageUpdateEvents(newItemsPerPage) {
  itemsPerPageEvents.value = newItemsPerPage;
  fetchEvents(); // Refetch data
}

// Initial data fetch
onMounted(() => {
  fetchEvents();
});


// Call this function when the component is mounted or after inserting a new event
fetchEvents();

// Fetch event details including scores when the button is clicked
async function viewScores(eventId) {
  try {
      const { data, error } = await supabase
    .from('Score')
    .select(`
      Score,
      Contestants:Contestants_id (id, name),
      Round:Round_id (id, name),
      Criteria:Criteria_id (id, criteriaName),
      Users:Users_id (id, name)  // Make sure to reference 'Users_id' for judge information
    `)
    .eq('Event_id', eventId);

  if (error) {
    console.error('Error fetching scores:', error);
    return;
  }

// Continue processing the scores...


    // Initialize a structure to group scores by round and contestant
    const groupedScores = {};

    data.forEach((entry) => {
      const { Round, Contestants, Criteria, Score } = entry;
      const roundName = Round.name;
      const contestantName = Contestants.name;
      const criteriaName = Criteria.criteriaName;

      // Initialize round group if not present
      if (!groupedScores[roundName]) {
        groupedScores[roundName] = {
          roundName,
          scores: {}
        };
      }

      // Initialize contestant group if not present
      if (!groupedScores[roundName].scores[contestantName]) {
        groupedScores[roundName].scores[contestantName] = {
          contestantName,
          scores: {},
          totalScore: 0
        };
      }

      // Add or accumulate the score for the criteria
      groupedScores[roundName].scores[contestantName].scores[criteriaName] =
        (groupedScores[roundName].scores[contestantName].scores[criteriaName] || 0) + Score;

      // Update total score
      groupedScores[roundName].scores[contestantName].totalScore += Score;
    });

    // Transform grouped scores for rendering in the template
    eventScores.value = Object.values(groupedScores).map((round) => ({
      roundName: round.roundName,
      scores: Object.values(round.scores) // Convert object to array
    }));

    showScoresPopup.value = true;
  } catch (error) {
    console.error('Error processing scores:', error);
  }
}

async function closeEvent(eventId) {
  try {
    // Update the event status to "ended"
    const confirmed = window.confirm("Are you sure you to Close the Event? Judges would not be able to submit a score in this event!");
    if (!confirmed) return;

    const { error } = await supabase
      .from('Event')
      .update({ status: 'ended' })
      .eq('id', eventId);

    if (error) {
      throw new Error(error.message);
    }

    $toast.success('Event closed successfully!');
    // Refresh the events list to reflect the status change
    await fetchEvents();
  } catch (error) {
    console.error('Error closing event:', error.message);
    $toast.error('Failed to close the event. Please try again.');
  }
}

// Close the scores popup
function closeScoresPopup() {
  showScoresPopup.value = false;
}

// Function to handle PDF download
function downloadPDF() {
  const doc = new jsPDF();
  let yPosition = 20; // Initial position for text in the PDF

  // Title
  doc.setFontSize(18);
  doc.text('Scores Submitted', 14, yPosition);
  yPosition += 10;

  // Table Headers
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Get criteria headers dynamically from the first score entry
  const headers = ['Contestant Name', 'Round Name', ...Object.keys(eventScores.value[0].scores[0].scores), 'Total Score'];

  // Prepare data for the table (each row contains contestant name, round name, scores for each criterion, and total score)
  const data = [];

  eventScores.value.forEach(round => {
    round.scores.forEach(scoreEntry => {
      const row = [
        scoreEntry.contestantName,
        round.roundName,
        ...Object.keys(scoreEntry.scores).map(criterion => scoreEntry.scores[criterion] || 'No Score'),
        Object.values(scoreEntry.scores).reduce((sum, score) => sum + score, 0)
      ];
      data.push(row);
    });
  });

  // Table styling and generation using autoTable
  doc.autoTable({
    head: [headers],
    body: data,
    startY: yPosition + 10,
    theme: 'striped',
    headStyles: {
      fillColor: [92, 47, 145], // Purple color for headers
      textColor: [255, 255, 255], // White text
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
      lineColor: [92, 47, 145], // Purple border for table cells
      lineWidth: 0.1,
    },
    margin: { top: 10, left: 14 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
    }
  });

  // Save the PDF with a filename
  doc.save('scores.pdf');
}


// Function to handle printing
function printScores() {
  try {
    let printContent = `
      <div style="font-family: Arial, sans-serif; margin: 20px;">
        <h1 style="text-align: center; color: #5c2f91;">Event Scores</h1>
    `;

    // Loop through each round in eventScores to create separate tables
    eventScores.value.forEach((round) => {
      printContent += `
        <h3 style="color: #5c2f91; margin-top: 20px;">Round: ${round.roundName}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;">
          <thead style="background-color: #9D82BD; opacity: 100;">
            <tr>
              <th style="text-align: left; padding: 8px; color: white; font-weight: bold; border: 1px solid white;">Contestant Name</th>
      `;

      // Dynamically add headers for each criterion
      Object.keys(round.scores[0].scores).forEach((criteria) => {
        printContent += `
          <th style="text-align: center; padding: 8px; color: white; font-weight: bold; border: 1px solid white;">${criteria}</th>
        `;
      });

      // Add Total Score header
      printContent += `
              <th style="text-align: center; padding: 8px; color: white; font-weight: bold; border: 1px solid white;">Total Score</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Add rows for each contestant in the round
      round.scores.forEach((scoreEntry) => {
        printContent += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${scoreEntry.contestantName}</td>
        `;

        // Add scores for each criterion
        Object.keys(scoreEntry.scores).forEach((criteria) => {
          const score = scoreEntry.scores[criteria] || 'No Score';
          printContent += `
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${score}</td>
          `;
        });

        // Calculate and add the total score
        const totalScore = Object.values(scoreEntry.scores).reduce(
          (sum, score) => sum + score,
          0
        );
        printContent += `
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${totalScore}</td>
          </tr>
        `;
      });

      // Close the table for the round
      printContent += `
          </tbody>
        </table>
      `;
    });

    // Close the container div
    printContent += `
      </div>
    `;

    // Print the content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <style>
        table thead {
          background-color: #9D82BD !important;
        }
      </style>
    `);
    printWindow.document.write(printContent);
    printWindow.document.body.style.fontFamily = 'Arial, sans-serif';
    printWindow.document.body.style.fontSize = '12px';
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    console.error('Error printing scores:', error);
  }
}



// Function to delete an event and its connected data
async function deleteEvent(eventId) {
  try {
    // Confirm with the user before deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action is irreversible and will remove all associated data."
    );

    if (!confirmed) return; // Exit if the user cancels the operation

    // Proceed with deletion
    const { error } = await supabase
      .from('Event')
      .delete()
      .eq('id', eventId); // Match the event by its ID

    if (error) throw new Error(`Failed to delete event: ${error.message}`);

    $toast.success('Event and its associated data were successfully deleted.');

    // Refresh the events list after deletion
    await fetchEvents();

    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error.message);
    $toast.error(`Failed to delete the event: ${error.message}`);
    return { success: false, error: error.message };
  }
}

</script>


<style scoped>

.cancel-button {
  position: sticky; /* Position relative to the v-card */
  top: 20px;          /* Align with the top */
  left: 680px;        /* Align with the right */
  z-index: 10;        /* Ensure it is above other elements */
}


.close-button {
  position: sticky; /* Position the button relative to the v-card */
  top: 30px;          /* Adjust vertical position */
  left: 1355px;        /* Adjust horizontal position */
  z-index: 10;        /* Ensure it's above all other content */
}

.v-data-table {
  border-collapse: collapse;
  border: .5px solid grey; /* Example: change border color to green */
}

.v-data-table thead {
  background-color: black;
  opacity: 60%;
  color: red !important; /* White text */
}

.thead th{
  background-color: #9e71d1;
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
/* Optional: You can add some styles here to ensure visibility */
.v-breadcrumbs .v-breadcrumb {
  color: #000; /* Make sure text is visible */
}

.text-yellow{
  color: yellow;
}



</style>
