<template>
    
    <Nav />

    <!-- FOR CANDIDATES -->
    <v-container>
      <v-container class="d-flex pb-6 pt-16 mt-6">
        <h1 class="text-medium-emphasis"><span class="text-green">C</span>andidates</h1> 
  
        <v-spacer></v-spacer>
  
        <v-btn @click="showCandidateDialog = true" variant="tonal" class="ma-2 z-index" color="green">
          Add Candidate<v-icon icon="mdi-plus" end></v-icon>
        </v-btn>

        <v-btn 
          @click="resetCandidates" 
          variant="tonal" 
          class="ma-2 z-index" 
          color="red"
        >
          Reset Candidates<v-icon icon="mdi mdi-delete" end></v-icon>
        </v-btn>

      </v-container>
  
      <v-toolbar class="bg-transparent mb-4 opacity-80">
        <v-text-field
          v-model="search"
          density="comfortable"
          placeholder="Search Candidate"
          prepend-inner-icon="mdi-magnify"
          style="max-width: 320px;"
          variant="solo"
  
          hide-details
        >
        <v-tooltip
          activator="parent"
          location="bottom"
        >Search Candidate's name</v-tooltip>
      </v-text-field>
      </v-toolbar>
  
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :items="serverItems"
        :items-length="totalItems"
        :page.sync="page"
        fixed-header
        theme="dark rounded opacity-100"
        class="bg-transparent border-sm"
        @update:page="handlePageUpdate"
        @update:items-per-page="handleItemsPerPageUpdate"
        >
        <thead class="opacity-60">
            <tr>
            <th class="text-left text-green">ID</th>
            <th class="text-left text-green">Name</th>
            <th class="text-left text-green">Address</th>
            <th class="text-left text-green">Age</th>
            <th class="text-left text-green">Course</th>
            <th class="text-center text-green">Gender</th>
            <th class="text-center text-green">Action</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="Contestant in serverItems" :key="Contestant.id">
            <td>{{ Contestant.id }}</td>
            <td>{{ Contestant.name }}</td>
            <td>{{ Contestant.address }}</td>
            <td>{{ Contestant.age }} Yrs old</td>
            <td class="text-left">{{ Contestant.course }}</td>
            <td class="text-center">{{ Contestant.gender }}</td>
            <!-- <td><v-img :src="Contestant.photo"></v-img></td> -->
            <td class="text-center">
              <v-btn 
                @click="editContestant(Contestant)"
                variant="tonal" 
                size="small" 
                class="ma-2" 
                color="primary">
                Edit <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>
              </v-btn>
                <v-btn 
                variant="tonal" 
                size="small" 
                class="ma-2" 
                color="red" 
                @click="deleteCandidate(Contestant.id)"
                >
                Delete <v-icon icon="mdi-delete" end></v-icon>
                </v-btn>
            </td>
            </tr>
        </tbody>
        </v-data-table-server>

      <v-progress-linear
        v-if="isLoading"
        color="green"
        height="6"
        indeterminate
        rounded
      ></v-progress-linear>   
  
      <v-empty-state
        class="mt-10 pt-10"
        v-if="isMatch"
        icon="mdi-magnify"
        text="Try restarting your connections. Sometimes less specific terms or broader queries can help you find what you're looking for."
        title="We couldn't fetch data from Database."
      ></v-empty-state>

      <v-empty-state
        class="mt-6 pt-6"
        v-if="roundAvailable"
        text="No Candidates Available, Please Create a Candidate."
        title="No Candidates."
      ></v-empty-state>
    </v-container>



    <!-- FOR ROUNDS -->
    <v-container>
  <v-container class="d-flex pb-6 pt-12 mt-2">
    <h1 class="text-medium-emphasis"><span class="text-green">R</span>ounds</h1>

    <v-spacer></v-spacer>

    <v-btn @click="showDialog = true" variant="tonal" class="ma-2 z-index" color="green">
      Create Round<v-icon icon="mdi-plus" end></v-icon>
    </v-btn>

    <v-btn 
      variant="tonal" 
      size="default" 
      color="red" 
      @click="deleteRound(selectedRoundId)" 
      class="ma-2"
    >
      Delete Round<v-icon icon="mdi-delete" end></v-icon>
    </v-btn>

  </v-container>

  <v-select
    width="280"
    variant="outlined"
    density="compact"
    v-model="selectedRoundId"
    :items="uniqueRoundIds"
    label="Select Round to Delete"
    class=""
  ></v-select>


  <!-- The Data Table -->
  <v-data-table-server
    v-model:items-per-page="itemsPerPageRounds"
    :items="serverItemsRounds"
    :items-length="totalItemsRounds"
    :page.sync="pageRounds"
    fixed-header
    theme="dark rounded opacity-100"
    class="bg-transparent border-sm"
    @update:page="handlePageUpdateRounds"
    @update:items-per-page="handleItemsPerPageUpdateRounds"
  >
    <thead class="opacity-60">
      <tr>
        <th class="text-left text-green">Round ID</th>
        <th class="text-left text-green">Round Name</th>
        <th class="text-left text-green">Criteria ID</th>
        <th class="text-left text-green">Criteria Name</th>
        <th class="text-left text-green">Percentage</th>
        <th class="text-center text-green">Action</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in serverItemsRounds" :key="item.roundId">
        <td>{{ item.roundId }}</td>
        <td>{{ item.roundName }}</td>
        <td>{{ item.criteriaId }}</td>
        <td>{{ item.criteriaName }}</td>
        <td>{{ item.percentage }} %</td>
        <td class="text-center">
          <v-btn variant="tonal" size="small" class="ma-2" color="primary">
          Edit <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>
        </v-btn>
          <!-- Remove this button from here -->
        </td>
      </tr>
    </tbody>
  </v-data-table-server>

  <!-- For Editing Candidates -->
  <v-dialog v-model="editDialog" max-width="570px">
    <v-card class="bg-black rounded-lg px-6 py-4">
      <v-card-title class="text-h4 text-green">Edit Candidate</v-card-title>
      <v-card-text>
        <v-text-field variant="outlined" v-model="editedContestant.name" label="Name"></v-text-field>
        <v-text-field variant="outlined" v-model="editedContestant.age" label="Age"></v-text-field>
        <v-text-field variant="outlined" v-model="editedContestant.address" label="Address"></v-text-field>
        <v-text-field variant="outlined" v-model="editedContestant.course" label="Course"></v-text-field>
        <v-select variant="outlined" v-model="editedContestant.gender" label="Gender"  :items="candidateGender"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" class="bg-black text-red mr-2 px-4 mb-4" @click="editDialog = false" text>Cancel</v-btn>
        <v-btn variant="outlined" class="bg-black text-green px-6 mr-4 mb-4" @click="updateUser" text>Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


    <!-- Progress and Empty State Components -->
    <v-progress-linear
      v-if="isLoadingRounds"
      color="green"
      height="6"
      indeterminate
      rounded
    ></v-progress-linear>

    <v-empty-state
      class="mt-10 pt-10"
      v-if="isMatchRounds"
      icon="mdi-magnify"
      text="Try restarting your connections. Sometimes less specific terms or broader queries can help you find what you're looking for."
      title="We couldn't fetch data from Database."
    ></v-empty-state>

    <v-empty-state
      class="mt-6 pt-6"
      v-if="criteriaAvailable"
      text="No Rounds Available, Please Create a Round and Criteria's."
      title="No Rounds."
    ></v-empty-state>
</v-container>



    <!-- Dialog for adding a new candidate -->
<v-dialog v-model="showCandidateDialog" max-width="570">
  <v-card class="bg-black rounded-lg">
    <v-card-title class="py-8 pl-12">
      <h1 class="text-h4 text-green">Add New Candidate</h1>
    </v-card-title>
    <v-card-subtitle class="pl-12">Enter the details for the new candidate</v-card-subtitle>
    <v-card-text>
      <v-form class="px-6">
        <v-text-field
          variant="outlined"
          v-model="newCandidate.id"
          label="Candidate ID"
          required
        ></v-text-field>

        <v-text-field
          variant="outlined"
          v-model="newCandidate.name"
          label="Name"
          required
        ></v-text-field>

        <v-select
          variant="outlined"
          v-model="newCandidate.gender"
          label="Gender"
          :items="candidateGender"
        ></v-select>

        <v-text-field
          variant="outlined"
          label="Address"
          v-model="newCandidate.address"
          required
        ></v-text-field>

        <v-text-field
          variant="outlined"
          v-model="newCandidate.age"
          label="Age"
          type="number"
          required
        ></v-text-field>

        <v-text-field
          variant="outlined"
          v-model="newCandidate.course"
          label="Course"
          required
        ></v-text-field>

        <!-- New file input for the candidate's image -->
        <v-file-input
          variant="outlined"
          v-model="newCandidate.photo"
          label="Upload Candidate Photo"
          accept="image/*"
          required
        ></v-file-input>

        <!-- Optional preview of the uploaded image -->
        <v-img
          v-if="newCandidate.photo"
          :src="newCandidate.photo"
          max-width="150"
          class="mt-4"
        ></v-img>

      </v-form>
    </v-card-text>
    <v-card-actions class="mb-4 mr-8">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" @click="saveCandidate" class="bg-black text-green mb-2">Save Candidate</v-btn>
      <v-btn variant="outlined" @click="showCandidateDialog = false" class="bg-black text-red ml-2 mb-2">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>




<!-- Dialog for adding a new round with multiple criteria -->
<v-dialog v-model="showDialog" max-width="570">
  <v-card class="bg-black rounded-lg">
    <v-card-title class="py-8 pl-12">
      <h1 class="text-h4 text-green">Create New Round</h1>
    </v-card-title>
    <v-card-subtitle class="pl-12">Enter the details for the new round</v-card-subtitle>
    <v-card-text>
      <v-form class="px-4">
        <v-text-field
          variant="outlined"
          v-model.number="newRound.roundId"
          label="Round ID"
          required
        ></v-text-field>

        <v-text-field
          variant="outlined"
          v-model="newRound.roundName"
          label="Round Name"
          required
        ></v-text-field>

        <!-- Text field for inputting candidate IDs or names -->
        <v-text-field
          variant="outlined"
          v-model="newRound.candidateInput"
          label="Enter Candidate IDs or Names (comma-separated)"
          placeholder="e.g., 1, 2, 3 or Cabual, Schvua"
          class="mt-4"
        ></v-text-field>

        <!-- Dynamic Criteria Form -->
        <v-container>
          <v-row v-for="(criteria, index) in newRound.criteria" :key="index">
            <v-col cols="12" md="4">
              <v-text-field
                variant="outlined"
                v-model="criteria.criteriaName"
                label="Criteria Name"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                variant="outlined"
                v-model="criteria.percentage"
                label="Percentage"
                type="number"
                min="20"
                max="100 - getTotalPercentage(index)"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="13" md="4">
              <v-btn variant="outlined" @click="removeCriteria(index)" class="bg-black text-red mt-2">Remove</v-btn>
            </v-col>
          </v-row>
          <v-btn 
            @click="addCriteria" 
            variant="outlined"
            class="bg-black text-green"
            :disabled="newRound.criteria.length >= 5"
          >
            Add Another Criteria
          </v-btn>
        </v-container>
      </v-form>
    </v-card-text>
    <v-card-actions class="mb-4 mr-10">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" @click="saveRound" class="bg-black text-green mb-2">Save Round</v-btn>
      <v-btn variant="outlined" @click="showDialog = false" class="bg-black text-red ml-2 mb-2">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

</template>










<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient'; // Ensure this path is correct
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { watchEffect } from 'vue';

// Toast
const $toast = useToast();

// State for search
const search = ref('');

// Pagination state for candidates
const page = ref(1);
const itemsPerPage = ref(10);
const serverItems = ref([]);
const totalItems = ref(0);
const roundAvailable = ref(false);
const criteriaAvailable = ref(false);
const candidateGender = ref(["Male", "Female"]);


// Pagination state for rounds
const pageRounds = ref(1);
const itemsPerPageRounds = ref(10);
const serverItemsRounds = ref([]);
const totalItemsRounds = ref(0);
const selectedRoundId = ref(null);


// Dialog and form state
const showDialog = ref(false);
const newRound = ref({
  roundId: '',
  roundName: '',
  candidateInput: '', // New field for candidate input
  candidateIds: [], // This will be populated based on candidateInput
  criteria: [{ criteriaName: '', percentage: 20 }] // Default criteria
});


// Dialog and form state for candidate
const showCandidateDialog = ref(false);
const newCandidate = ref({
  id: '',
  name: '',
  address: '',
  age: '',
  course: '',
  gender: '',
  // roundId: '' // Add this field
});


// Edit Dialog State
const editDialog = ref(false);
const editedContestant = ref({
  id: null,
  name: '',
  age: '',
  address: '',
  course: '',
  gender: '',
});


// Progress state
const isMatch = ref(false);
const isLoading = ref(true);
const isLoadingRounds = ref(true);
const isMatchRounds = ref(false);


// Bucket



// Fetch data for candidates
async function fetchPageData() {
  isLoading.value = true;
  roundAvailable.value = false; 
  try {
    const { data, error, count } = await supabase
      .from('Contestants')
      .select('id, name, age, course, address, photo, gender', { count: 'exact' })
      .range((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value - 1)
      .ilike('name', `%${search.value}%`);

    if (error) throw new Error(error.message);

    if (data.length === 0) {
      roundAvailable.value = true; 
      return;
    }

    // Processing rounds data...
    isMatchRounds.value = false; 
    serverItems.value = data;
    console.log('Server items:', serverItems.value); // Log the data to ensure it's being fetched correctly
    totalItems.value = count;
    
  } catch (error) {
    console.error('Error fetching data:', error.message);
    roundAvailable.value = false; 
    isMatch.value = true;
  } finally {
    isLoading.value = false;
  }
}



// Save Candidate
async function saveCandidate() {
  try {
    // Ensure id is a number
    const candidateId = parseInt(newCandidate.value.id, 10);
    if (isNaN(candidateId)) {
      throw new Error('Candidate ID must be a number');
    }

    // Convert age to number if necessary
    const age = parseInt(newCandidate.value.age, 10);

    let photoUrl = null;
    
    // Check if there's a photo to upload
    if (newCandidate.value.photo) {
      const file = newCandidate.value.photo;
      const fileExt = file.name.split('.').pop();
      const filePath = `candidates/${candidateId}.${fileExt}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('candidate-photos') // ensure this matches your Supabase bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: fileData, error: urlError } = await supabase.storage
        .from('candidate-photos')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      photoUrl = fileData.publicUrl;
    }

    // Insert candidate data, including photo URL
    const { error } = await supabase
      .from('Contestants')
      .insert({
        id: candidateId,
        name: newCandidate.value.name,
        address: newCandidate.value.address,
        age: age,
        course: newCandidate.value.course,
        gender: newCandidate.value.gender,
        photo: photoUrl, // Save the photo URL here
      });

    if (error) throw error;

    $toast.success('Candidate Added Successfully!', {
      position: 'bottom-right',
      duration: 8000,
    });
    fetchPageData();
    showCandidateDialog.value = false;
  } catch (error) {
    console.error('Error adding candidate:', error.message);
    alert('Failed to add candidate. Please try again.');
  }
}

// Update the edited contestant in the database
async function updateUser() {
  try {
    const { data, error } = await supabase
      .from('Contestants')
      .update({
        name: editedContestant.value.name,
        age: editedContestant.value.age,
        address: editedContestant.value.address,
        course: editedContestant.value.course,
        gender: editedContestant.value.gender
      })
      .match({ id: editedContestant.value.id }); // Use the id to match the correct record

    if (error) {
      throw error;
    }

    // Provide feedback to the user
    $toast.success('Candidate Updated Successfully!', {
      position: 'bottom-right',
      duration: 8000,
    });

    // Refresh the data
    fetchPageData();
    editDialog.value = false; // Close the edit dialog

  } catch (error) {
    console.error('Error updating candidate:', error.message);
    alert('Failed to update candidate. Please try again.');
  }
}




// Edit Candidate Function
function editContestant(contestant) {
  editedContestant.value = { ...contestant };
  editDialog.value = true;
}





  
// Fetch data for rounds
async function fetchPageDataRounds() {
  isLoadingRounds.value = true;
  try {
    const { data, error, count } = await supabase
      .from('Round')
      .select(`
        id,
        name,
        Criteria (id, criteriaName, percentage)
      `, { count: 'exact' })
      .range((pageRounds.value - 1) * itemsPerPageRounds.value, pageRounds.value * itemsPerPageRounds.value - 1);


    if (data.length === 0) {
      criteriaAvailable.value = true; 
      return;
    }

    if (error) {
      console.error('Error fetching rounds data:', error.message);
      isMatchRounds.value = true;
      return;
    }

    // Flatten data to make each criterion its own entry
    const flattenedData = data.flatMap(round => 
      round.Criteria.map(criteria => ({
        roundId: round.id,
        roundName: round.name,
        criteriaId: criteria.id,
        criteriaName: criteria.criteriaName,
        percentage: criteria.percentage
      }))
    );

    criteriaAvailable.value = false; 
    serverItemsRounds.value = flattenedData;
    totalItemsRounds.value = count;
  } catch (error) {
    console.error('Unexpected error:', error.message);
    isMatchRounds.value = true;
  } finally {
    isLoadingRounds.value = false;
  }
}








// Handle page and items-per-page updates
function handlePageUpdate(newPage) {
    page.value = newPage;
    fetchPageData();
}

function handleItemsPerPageUpdate(newItemsPerPage) {
    itemsPerPage.value = newItemsPerPage;
    fetchPageData();
}

// Watch for changes in search, page, or itemsPerPage
watch([search, page, itemsPerPage], () => {
    fetchPageData();
});

// Watch for changes in rounds
watch([pageRounds, itemsPerPageRounds], () => {
    fetchPageDataRounds();
});

// Initial fetch
onMounted(() => {
  fetchPageData();
  fetchPageDataRounds();
});








// Function to delete a candidate
async function deleteCandidate(id) {
    try {

      const confirmed = window.confirm("Are you sure you want the candidates?");
      if (!confirmed) return;

        const { error } = await supabase
            .from('Contestants')
            .delete()
            .match({ id });

        if (error) {
            console.error('Error deleting candidate:', error.message);
            return;
        }

        // Remove the candidate from the local state immediately
        serverItems.value = serverItems.value.filter(candidate => candidate.id !== id);

        $toast.info('Candidate deleted Successfully!', {
            position: 'bottom-right',
            duration: 8000
        });
    } catch (error) {
        console.error('Error deleting candidate:', error.message);
    }
}


// Function to delete a single criterion
  async function deleteCriterion(criteriaId) {
    try {
      const { error } = await supabase
        .from('Criteria') // Ensure this matches your criteria table name
        .delete()
        .match({ id: criteriaId }); // Match by the specific criteria ID
      if (error) throw error;
      // Optionally, log success or show a message
      alert('Criterion deleted successfully');
      // Refresh data after deletion
      fetchPageDataRounds();
    } catch (error) {
      console.error('Error deleting criterion:', error.message);
    }
  }



// Function to reset (delete all) candidates
async function resetCandidates() {
  try {
    // Show a confirmation dialog before proceeding
    const confirmed = window.confirm("Are you sure you want to delete all candidates?");
    if (!confirmed) return;

    // Deleting all candidates from the 'Contestants' table
    const { error } = await supabase.from('Contestants').delete().neq('id', 0);

    if (error) throw new Error(error.message);

    // Clear the serverItems array and update the roundAvailable state
    $toast.info('All Candidates Deleted Successfully',{
      position: 'bottom-right',
      duration: 8000
    })
    serverItems.value = [];
    roundAvailable.value = true;

  } catch (error) {
    console.error('Error deleting all candidates:', error.message);
  }
}



  // Delete Round
  async function deleteRound(id) {
  try {
    const { error } = await supabase
      .from('Round') // Ensure this matches your table name
      .delete()
      .match({ id }); // Match by the specific ID to delete

    if (error) throw error;
    
    // Remove the candidate from the local state immediately
    serverItemsRounds.value = serverItemsRounds.value.filter(round => round.roundId !== id);

    $toast.info('Round and Criterias deleted Successfully!',{
      position: 'bottom-right',
      duration: 8000
      })
    // Refresh the rounds data
    fetchPageDataRounds();
  } catch (error) {
    console.error('Error deleting round:', error.message);
  }
  }


  
// Add criteria logic
function addCriteria() {
  // Calculate the current total percentage
  const totalPercentage = newRound.value.criteria.reduce((sum, c) => sum + Math.round(c.percentage), 0);

  console.log("Total Percentage before adding:", totalPercentage); // 
  
  const tolerance = 0.01;

  // Check if adding another 20% would exceed 100%
  if (newRound.value.criteria.length < 5 && totalPercentage + 20 <= 100 + tolerance) {
    // Add a new criterion with a default percentage of 20
    newRound.value.criteria.push({ criteriaName: '', percentage: 20 });
    console.log("Added new criteria. Total Percentage now:", newRound.value.criteria.reduce((sum, c) => sum + Math.round(c.percentage), 0)); // Log after addition
  } else if (newRound.value.criteria.length >= 5) {
    // Show warning if criteria limit is reached
    $toast.warning('You can only add up to 5 criteria', {
      position: 'bottom-right',
      duration: 8000,
    });
  } else {
    // Show warning if adding 20% would exceed 100%
    $toast.warning('Adding this criterion would exceed the 100% limit', {
      position: 'bottom-right',
      duration: 8000,
    });
  }
}

function updatePercentage(index, newPercentage) {
  // Temporarily update the specified criterion's percentage for validation
  const tempCriteria = [...newRound.value.criteria];
  tempCriteria[index].percentage = newPercentage;

  // Calculate the new total percentage
  const totalPercentage = tempCriteria.reduce((sum, c) => sum + Math.round(c.percentage), 0);

  console.log("Total Percentage during update:", totalPercentage); // Log the total during updates
  
  const tolerance = 0.01;

  if (totalPercentage <= 100 + tolerance) {
    // Update if within limit
    newRound.value.criteria[index].percentage = newPercentage;
  } else {
    // Show warning if updating would exceed 100
    $toast.warning('The total percentage cannot exceed to 100%', {
      position: 'bottom-right',
      duration: 8000,
    });
  }
}

// Save Round
async function saveRound() {
  try {
    // Calculate the total percentage of all criteria
    const totalPercentage = newRound.value.criteria.reduce((sum, c) => sum + Math.round(c.percentage), 0);

    console.log("Total Percentage during save:", totalPercentage); // Log the total percentage before saving

    const tolerance = 0.01;

    // Check if the total percentage exceeds 100%
    if (totalPercentage > 100 + tolerance) {
      // Show error message if the total percentage exceeds 100%
      $toast.error('The total percentage cannot exceed 100%', {
        position: 'bottom-right',
        duration: 8000
      });
      
      // Reset criteria and percentages to prevent invalid state
      newRound.value.criteria = []; // Reset the criteria array
      newRound.value.roundName = ''; // Optionally reset round name
      newRound.value.roundId = ''; // Optionally reset round ID
      newRound.value.candidateInput = ''; // Optionally reset candidate input

      return; // Prevent saving the round and allow the user to start over
    }

    // Convert IDs to numbers
    const roundId = parseInt(newRound.value.roundId, 10);
    if (isNaN(roundId)) {
      throw new Error('Round ID must be a number');
    }

    // Parse candidate input and convert to array of IDs
    const candidateIds = newRound.value.candidateInput
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    // Insert round data
    const { data: roundData, error: roundError } = await supabase
      .from('Round')
      .insert({
        id: roundId,
        name: newRound.value.roundName,
      })
      .single();

    if (roundError) {
      console.error('Error adding round:', roundError.message);
      alert('Failed to add round. Please try again.');
      return;
    }

    // Insert associations in ContestantRound
    const contestantRoundPromises = candidateIds.map(contestantId => {
      return supabase
        .from('ContestantRound')
        .insert({
          "Contestants_id": contestantId,
          "Round_id": roundId
        });
    });

    try {
      await Promise.all(contestantRoundPromises);
      console.log('All contestant-round associations added successfully');
    } catch (contestantRoundError) {
      console.error('Error adding contestant-round associations:', contestantRoundError.message);
      return;
    }

    // Insert criteria, ensuring percentages are integers
    const criteriaPromises = newRound.value.criteria.map(criterion => {
      return supabase
        .from('Criteria')
        .insert({
          criteriaName: criterion.criteriaName,
          Round_id: roundId,
          percentage: Math.round(criterion.percentage) // Round percentage before inserting
        });
    });

    try {
      await Promise.all(criteriaPromises);
      console.log('All criteria inserted successfully');
    } catch (criteriaError) {
      console.error('Error adding criteria:', criteriaError.message);
      return;
    }

    $toast.success('Round and associated data added successfully!', {
      position: 'bottom-right',
      duration: 8000
    });

    // Refresh the rounds data and close the dialog
    fetchPageDataRounds();
    showDialog.value = false;
  } catch (error) {
    console.error('Unexpected error:', error.message);
    alert('An unexpected error occurred. Please try again.');
  }
}

// Remove criteria function
function removeCriteria(index) {
  // Use splice to remove the criterion at the specified index
  newRound.value.criteria.splice(index, 1);
}



  const uniqueRoundIds = computed(() => {
    const roundIds = serverItemsRounds.value.map(item => item.roundId);
    return [...new Set(roundIds)]; // Remove duplicates
  });

  console.log('Server items for select:', serverItems.value.map(c => ({ text: c.name, value: c.id })));


  watchEffect(() => {
  if (serverItems.value.length === 0) {
    roundAvailable.value = true;
  } else {
    roundAvailable.value = false;
  }
});

</script>
