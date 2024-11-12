<template>
    <Indexnav />
    <v-container>
        <h1 class="mt-8 mb-6">{{ gender }} Candidates</h1>

        <v-container class="d-flex flex-column pb-6">
            <v-container class="d-flex ga-6">
                <v-card class="bg-transparent border-sm mx-auto" width="400" v-for="card in cards" :key="card.id">
                    <v-card-item>
                        <img width="100%" height="350px" class="pa-6" :src="card.photo" alt="No image found">
                        <v-card-title></v-card-title>
                        <h2 class="text-green text-center mt-4">{{ card.name }}</h2><br>
                        <p class="text-center">{{ card.description }}</p><br>

                    </v-card-item>
                </v-card>
            </v-container>
            <v-container
                    class="d-flex justify-center align-center"
                    style="min-height: 75vh;"
                >
                    <v-progress-circular
                    v-if="isLoading"
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
                    title="No Candidates Set by the Admin"
                    ></v-empty-state>
                </v-container>
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
        const gender = ref('Female'); // Default gender filter

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
