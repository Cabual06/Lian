<template>
  <Nav />
  <v-app class="bg-black">
    <v-container>
      <v-container class="d-flex pb-6 pt-16 mt-6">
        <h1 class="text-medium-emphasis"><span class="text-green">J</span>udges</h1>
        <v-spacer></v-spacer>
        <!-- <v-btn to="" variant="tonal" class="ma-2 z-index" color="green">
          Add Judge<v-icon icon="mdi-plus" end></v-icon>
        </v-btn> -->
      </v-container>

      <!-- Edit User Dialog -->
      <v-dialog v-model="editDialog" max-width="570px">
        <v-card class="bg-black rounded-lg px-6 py-4">
          <v-card-title class="text-h4 text-green">Edit Judge</v-card-title>
          <v-card-text>
            <v-text-field variant="outlined" v-model="editedUser.name" label="Name"></v-text-field>
            <v-text-field variant="outlined" v-model="editedUser.email" label="Email"></v-text-field>
            <v-text-field variant="outlined" v-model="editedUser.address" label="Address"></v-text-field>
            <v-text-field variant="outlined" v-model="editedUser.phone" label="Phone"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="outlined" class="bg-black text-red mr-2 mb-4 px-6" text @click="editDialog = false">Cancel</v-btn>
            <v-btn variant="outlined" class="bg-black text-green px-6 mr-5 mb-4" text @click="updateUser">Update</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-toolbar class="bg-transparent mb-4 opacity-80">
        <v-text-field
          v-model="search"
          density="comfortable"
          placeholder="Search User"
          prepend-inner-icon="mdi-magnify"
          style="max-width: 320px;"
          variant="solo"
          hide-details
        >
          <v-tooltip activator="parent" location="bottom">Search User's name</v-tooltip>
        </v-text-field>
      </v-toolbar>

      <v-data-table
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
            <th class="text-left text-green">Name</th>
            <th class="text-left text-green">Email</th>
            <th class="text-left text-green">Address</th>
            <th class="text-left text-green">Phone</th>
            <th class="text-center text-green">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="User in serverItems" :key="User.id">
            <td>{{ User.name }}</td>
            <td>{{ User.email }}</td>
            <td>{{ User.address }}</td>
            <td>{{ User.phone }}</td>
            <td class="text-center">
              <v-btn @click="editUser(User)" variant="tonal" size="small" class="ma-2" color="primary">
                Edit <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>
              </v-btn>
              <v-btn @click="deletejudge(User.id)" variant="tonal" size="small" class="ma-2" color="red">
                Delete <v-icon icon="mdi-delete" end></v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-data-table>

      <v-progress-linear v-if="isLoading" color="green" height="6" indeterminate rounded></v-progress-linear>

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
const itemsPerPage = ref(25);
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
</style>
