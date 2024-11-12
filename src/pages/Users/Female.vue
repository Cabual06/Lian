<template>
    <Indexnav />
    <v-container>
        <h1 class="mt-8 mb-8">{{ gender }} Candidates</h1>

        <!-- Use v-row and v-col to arrange cards in a grid -->
        <v-row class="d-flex" dense>
            <v-col cols="12" sm="6" md="4" lg="3" xl="3" v-for="card in cards" :key="card.id">
                <v-card class="mb-8 bg-transparent border-sm mx-auto" width="90%">
                    <v-card-item>
                        <!-- Candidate image -->
                        <img width="100%" height="350px" class="pa-6" :src="card.photo" alt="No image found">
                        <!-- Candidate name and description -->
                        <h2 class="text-green text-center mt-4">{{ card.name }}</h2><br>
                        <p class="text-center">{{ card.description }}</p><br>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>

        <!-- Loading spinner or empty state if no candidates are found -->
        <v-container class="d-flex justify-center align-center" style="min-height: 75vh;">
            <v-progress-circular v-if="isLoading" color="green" :size="60" :width="7" indeterminate></v-progress-circular>

            <v-empty-state
                v-else-if="isMatchRounds"
                icon="mdi mdi-file-document-alert-outline"
                text="Contact the Administrator or Restart your Connections."
                title="No Candidates Set by the Admin"
            ></v-empty-state>
        </v-container>
    </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';

export default {
    setup() {
        const cards = ref([]);
        const isLoading = ref(false);
        const gender = ref('Male'); // Default gender filter

        async function fetchData(gender) {
            isLoading.value = true;
            try {
                const { data, error, count } = await supabase
                    .from('Contestants')
                    .select('*', { count: 'exact' })
                    .eq('gender', gender);

                if (error) throw new Error(error.message);

                cards.value = count === 0 ? [] : data.map(card => ({
                    ...card,
                    photo: card.photo || 'default-image-url.jpg',
                    description: card.description || 'No description available',
                }));
                
            } catch (error) {
                console.error('Error fetching data:', error.message);
            } finally {
                isLoading.value = false;
            }
        }

        // Fetch candidates based on the selected gender
        onMounted(() => {
            fetchData(gender.value);
        });

        return {
            gender,
            cards,
            isLoading,
            fetchData
        };
    }
}
</script>
