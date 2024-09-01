<template>
    <Nav />
    <v-app class="bg-black">
      <v-container>
        <v-container class="d-flex pb-6 pt-16 mt-6">
          <h1 class="text-medium-emphasis"><span class="text-green">J</span>udges</h1> 
    
          <v-spacer></v-spacer>
    
          <v-btn to="/Admin/Addstudent" variant="tonal" class="ma-2 z-index" color="green">
            Add Judge<v-icon icon="mdi-plus" end></v-icon>
          </v-btn>
        </v-container>
    
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
            <v-tooltip
              activator="parent"
              location="bottom"
            >Search User's name</v-tooltip>
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
              <!-- <th class="text-left text-green">ID</th> -->
              <th class="text-left text-green">Name</th>
              <th class="text-left text-green">Email</th>
              <th class="text-left text-green">Address</th>
              <th class="text-left text-green">Phone</th>
              <!-- <th class="text-left text-green">Course</th> -->
              <th class="text-center text-green">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="User in serverItems" :key="User.id">
              
              <td>{{ User.name }}</td>
              <td>{{ User.email }}</td>
              <td>{{ User.address }}</td>
              <td>{{ User.phone }}</td>
              <!-- <td>{{ User.course }}</td> -->
              <td class="text-center">
                <v-btn variant="tonal" size="small" class="ma-2" color="primary">
                  Edit <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>
                </v-btn>
                <v-btn variant="tonal" size="small" class="ma-2" color="red">
                  Delete <v-icon icon="mdi-delete" end></v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-data-table>
    
        <v-progress-linear
          v-if="isLoading"
          color="green"
          height="6"
          indeterminate
          rounded
        ></v-progress-linear>
    
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
  import { supabase } from '@/lib/supabaseClient'; // Ensure this path is correct
  
  // For Search
  const search = ref('');
  
  // For Pagination
  const page = ref(1);
  const itemsPerPage = ref(25);
  const serverItems = ref([]);
  const totalItems = ref(0);
  
  // Progress Bar
  const isMatch = ref(false);
  const isLoading = ref(true);
  
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
  
  // Initial fetch
  onMounted(() => {
    fetchPageData();
  });
  </script>
  
  <style scoped>
  </style>
  