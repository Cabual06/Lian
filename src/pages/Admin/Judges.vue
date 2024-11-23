<template>
  <Nav />
  <v-app class="" style="background-color: #FEFEFE">
    <v-container class="px-16">
      <v-container class="d-flex pb-6 pt-16 mt-16">
        <h1 class="text-medium-emphasis"><span class="text-purple">JUDGE</span><span class="text-black"> LIST</span></h1>
        <v-spacer></v-spacer>
        <!-- <v-btn to="" variant="tonal" class="ma-2 z-index" color="green">
          Add Judge<v-icon icon="mdi-plus" end></v-icon>
        </v-btn> -->
      </v-container>
      <v-breadcrumbs :items="['Home', 'Dashboard', 'Judges']" class=""></v-breadcrumbs>
      <!-- Edit User Dialog -->
      <v-dialog v-model="editDialog" max-width="570px">
        <v-card class="rounded-lg px-6 py-4" style="background-color:;">
          <v-card-title class="text-h4 text-purple ml-2 mt-4 mb-2 font-weight-bold">Edit Judge</v-card-title>
          <v-card-text>
            <v-text-field class="font-weight-bold" variant="outlined" v-model="editedUser.name" label="Name"></v-text-field>
            <v-text-field class="font-weight-bold" variant="outlined" v-model="editedUser.email" label="Email"></v-text-field>
            <v-text-field class="font-weight-bold" variant="outlined" v-model="editedUser.address" label="Address"></v-text-field>
            <v-text-field class="font-weight-bold" variant="outlined" v-model="editedUser.phone" label="Phone"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" class="text-white mr-2 mb-4 bg-red px-4 font-weight-bold" text @click="editDialog = false">Cancel <v-icon icon="mdi mdi-close-circle" end></v-icon></v-btn>
            <v-btn variant="outlined" class="text-white bg-green px-4 mr-5 mb-4 font-weight-bold" text @click="updateUser">Update <v-icon icon="mdi mdi-check-circle" end></v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-toolbar class="bg-transparent mb-4 opacity-80">
        <v-text-field
          class="border-sm mb-4 mt-2"
          v-model="search"
          density="comfortable"
          placeholder="Search User"
          prepend-inner-icon="mdi-magnify"
          style="max-width: 320px;"
          variant="solo"
          hide-details
        >
          <v-tooltip activator="parent" location="bottom">Search Judge name</v-tooltip>
        </v-text-field>
      </v-toolbar>

      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :items="serverItems"
        :items-length="totalItems"
        :page.sync="page"
        fixed-header
        theme="light rounded opacity-100"
        @update:page="handlePageUpdate"
        @update:items-per-page="handleItemsPerPageUpdate"
      >
        <thead class="opacity-100">
          <tr>
            <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Name</th>
            <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Email</th>
            <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Address</th>
            <th class="text-left text-white font-weight-bold" style="background-color: #9e71d1;">Phone</th>
            <th class="text-center text-white font-weight-bold" style="background-color: #9e71d1;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="User in serverItems" :key="User.id" class="text-black font-weight-bold ">
            <td>{{ User.name }}</td>
            <td>{{ User.email }}</td>
            <td>{{ User.address }}</td>
            <td>{{ User.phone }}</td>
            <td class="text-center">
              <v-btn @click="editUser(User)" variant="flat" size="small" class="ma-2 font-weight-bold" color="primary">
                Edit <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>
              </v-btn>
              <v-btn @click="deletejudge(User.id)" variant="flat" size="small" class="ma-2 font-weight-bold" color="red">
                Delete <v-icon icon="mdi-delete" end></v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-data-table>

      <v-progress-linear v-if="isLoading" color="purple" height="6" indeterminate rounded></v-progress-linear>

      <v-empty-state
        class="mt-16 pt-16"
        v-if="isMatch"
        icon="mdi-magnify"
        text="Try restarting your connections. Sometimes less specific terms or broader queries can help you find what you're looking for."
        title="We couldn't fetch data from Database."
      ></v-empty-state>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

// Toast
const $toast = useToast();

// Edit Dialog State
const editDialog = ref(false);
const editedUser = ref({
  id: null,
  name: '',
  email: '',
  address: '',
  phone: ''
});

// Search, Pagination, and Loading States
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const serverItems = ref([]);
const totalItems = ref(0);
const isMatch = ref(false);
const isLoading = ref(true);

// Fetch Data from Database
async function fetchPageData() {
  isLoading.value = true;
  try {
    const { data, error, count } = await supabase
      .from('Users')
      .select('id, name, email, phone, address', { count: 'exact' })
      .range((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value - 1)
      .ilike('name', `%${search.value}%`);
    if (error) throw new Error(error.message);
    serverItems.value = data.sort((a, b) => a.id - b.id);
    totalItems.value = count;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    isMatch.value = true;
  } finally {
    isLoading.value = false;
  }
}

// Delete User Function
async function deletejudge(id) {
  try {

    const confirmed = window.confirm("Are you sure you want the candidates?");
    if (!confirmed) return;

    const { error } = await supabase.from('Users').delete().match({ id });
    if (error) {
      console.error('Error deleting judge', error.message);
      return;
    }
    serverItems.value = serverItems.value.filter(User => User.id !== id);
    $toast.info('Candidate deleted successfully!', { position: 'bottom-right', duration: 8000 });
  } catch (error) {
    console.error('Error deleting judge', error.message);
  }
}

// Edit User Function
function editUser(User) {
  editedUser.value = { ...User };
  editDialog.value = true;
}

// Update User Function
async function updateUser() {
  try {
    const { error } = await supabase
      .from('Users')
      .update({
        name: editedUser.value.name,
        email: editedUser.value.email,
        address: editedUser.value.address,
        phone: editedUser.value.phone
      })
      .eq('id', editedUser.value.id);
    if (error) throw new Error(error.message);

    const index = serverItems.value.findIndex(user => user.id === editedUser.value.id);
    if (index !== -1) serverItems.value[index] = { ...editedUser.value };

    editDialog.value = false;
    $toast.success('User updated successfully!', { position: 'bottom-right', duration: 5000 });
  } catch (error) {
    console.error('Error updating user:', error.message);
    $toast.error('Failed to update user.', { position: 'bottom-right', duration: 5000 });
  }
}

// Handle page updates
function handlePageUpdate(newPage) {
  page.value = newPage;
  fetchPageData();
}

function handleItemsPerPageUpdate(newItemsPerPage) {
  itemsPerPage.value = newItemsPerPage;
  fetchPageData();
}

watch([search, page, itemsPerPage], () => {
  fetchPageData();
});

onMounted(() => {
  fetchPageData();
});
</script>

<style scoped>
.v-data-table {
  border-collapse: collapse;
  border: .5px solid grey; /* Example: change border color to green */
}

.v-data-table thead {
  background-color: #007bff !important; /* Blue background */
  color: red !important; /* White text */
}

.v-data-table td {

}

.v-data-table tbody tr:hover {
  background-color: #DCDCDC; /* Light green background on hover */
}

</style>
