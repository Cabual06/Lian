<template>
    <Nav />
    <v-app>
      <v-container class="px-12">
        <v-container class="d-flex pb-6 pt-16 mt-12">
          <h1 class="text-medium-emphasis">
            <span class="text-green">E</span><span class="text-black">vents</span>
          </h1>
  
          <v-spacer></v-spacer>
  
          <v-btn @click="showEventDialog = true" variant="flat" class="ma-2 z-index font-weight-bold" color="green">
            Add Event <v-icon icon="mdi-plus" end></v-icon>
          </v-btn>
        </v-container>
  
        <v-data-table-server
          v-model:items-per-page="itemsPerPageEvents"
          :items="serverItemsEvents"
          :items-length="totalItemsEvents"
          :page.sync="pageEvents"
          fixed-header
          theme="dark rounded opacity-100"
          class="bg-transparent"
          @update:page="handlePageUpdateEvents"
          @update:items-per-page="handleItemsPerPageUpdateEvents"
        >
          <thead class="opacity-60">
            <tr>
              <th class="text-left text-green font-weight-bold">Event ID</th>
              <th class="text-left text-green font-weight-bold">Event Name</th>
              <th class="text-left text-green font-weight-bold">Description</th>
              <th class="text-left text-green font-weight-bold">Start Date</th>
              <th class="text-left text-green font-weight-bold">End Date</th>
              <th class="text-left text-green font-weight-bold">Status</th>
              <th class="text-center text-green font-weight-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in serverItemsEvents" :key="event.id" class="font-weight-bold">
              <td>{{ event.id }}</td>
              <td>{{ event.name }}</td>
              <td>{{ event.description }}</td>
              <td>{{ event.start_date }}</td>
              <td>{{ event.end_date }}</td>
              <td>{{ event.status }}</td>
              <td class="text-center">
                <v-btn @click="editEvent(event)" variant="flat" size="small" class="ma-2 font-weight-bold" color="primary">
                  Edit <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>
                </v-btn>
                <v-btn @click="deleteEvent(event.id)" variant="flat" size="small" class="ma-2 font-weight-bold" color="red">
                  Delete <v-icon icon="mdi-delete" end></v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-data-table-server>
  
        <!-- Event Dialog -->
        <v-dialog v-model="showEventDialog" max-width="600px" class="rounded-lg">
          <v-card>
            <v-card-title class="text-h4 py-8 pl-12">
              <h1 class="text-h4 text-green font-weight-bold">Create New Event</h1>
            </v-card-title>
            <v-card-subtitle class="pl-12 font-weight-bold">Enter the details for the Event</v-card-subtitle>
            <v-card-text>
              <v-form class="px-4">
                <v-text-field variant="outlined" v-model="newEvent.name" label="Event Name" required></v-text-field>
                <v-textarea variant="outlined" v-model="newEvent.description" label="Event Description" required></v-textarea>
                <v-text-field variant="outlined" v-model="newEvent.start_date" label="Start Date" type="date" required></v-text-field>
                <v-text-field variant="outlined" v-model="newEvent.end_date" label="End Date" type="date" required></v-text-field>
  
                <!-- Round Autocomplete -->
                <v-autocomplete
                    v-model="newEvent.selectedRoundIds"
                    :items="validatedRounds"
                    item-value="id" 
                    item-text="name" 
                    label="Select Rounds"
                    multiple
                    required
                    />

                <v-select
                  variant="outlined"
                  v-model="newEvent.status"
                  :items="['Active', 'Inactive']"
                  label="Status"
                  required
                ></v-select>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn
                variant="flat"
                class="text-white bg-red mr-2 mb-6 font-weight-bold"
                @click="saveEvent"
                color="green"
              >
                Save Event
              </v-btn>
              <v-btn
                variant="flat"
                class="text-white bg-red mr-10 mb-6 font-weight-bold"
                @click="showEventDialog = false"
                color="red"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-app>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { supabase } from '@/lib/supabaseClient';
  import { useToast } from 'vue-toast-notification';
  import 'vue-toast-notification/dist/theme-bootstrap.css';
  
  const $toast = useToast();
  
  // State for the rounds and the event dialog
  const rounds = ref([]);
  const showEventDialog = ref(false);
  
  // The event object, including selected round IDs
  const newEvent = ref({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    selectedRoundIds: [], // Array of selected round IDs
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  // Fetch rounds from Supabase
  async function fetchRounds() {
    try {
      const { data, error } = await supabase
        .from('Round')
        .select('id, name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        rounds.value = data;
      } else {
        console.log('No rounds available.');
      }
    } catch (error) {
      console.error('Error fetching rounds:', error.message);
    }
  }
  
  // Computed property to format rounds for the v-autocomplete
  const validatedRounds = computed(() => {
    return rounds.value.map((round) => ({
      id: round.id,
      name: round.name,
    }));
  });
  
  // Fetch rounds when the component is mounted
  onMounted(() => {
    fetchRounds();
  });
  
  // Save the event along with selected rounds
  async function saveEvent() {
    try {
      // Step 1: Insert the event into the Event table
      const { data: eventData, error: eventError } = await supabase
        .from('Event')
        .insert({
          name: newEvent.value.name,
          description: newEvent.value.description,
          start_date: newEvent.value.start_date,
          end_date: newEvent.value.end_date,
          status: newEvent.value.status,
          created_at: newEvent.value.created_at,
          updated_at: newEvent.value.updated_at,
        })
        .single(); // Ensure to get a single response from the insert
      
      if (eventError) throw eventError;
  
      // Step 2: Insert the association between the event and selected rounds
      const eventId = eventData.id;
  
      // Map over selected round IDs and insert into the association table
      const roundAssociations = newEvent.value.selectedRoundIds.map(roundId => ({
        event_id: eventId,
        round_id: roundId
      }));
  
      const { error: associationError } = await supabase
        .from('EventRound') // Assuming you have an 'EventRound' table for the relation
        .insert(roundAssociations);
  
      if (associationError) throw associationError;
  
      $toast.success('Event and rounds saved successfully!', {
        position: 'bottom-right',
        duration: 8000
      });
  
      showEventDialog.value = false; // Close the dialog after saving
    } catch (error) {
      console.error('Error saving event:', error.message);
      alert('Failed to save event. Please try again.');
    }
  }
  </script>
  