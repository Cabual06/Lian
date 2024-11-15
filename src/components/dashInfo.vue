<template>
    <v-container>
        <div class="d-flex mx-auto">
            <v-card variant="tonal" width="380px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalItems }}</h1>
                    <p>Registered Judges</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-account-multiple text-green"></span></v-icon>
                </v-card-item>
            </v-card>

            <v-card variant="tonal" width="360px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalCandidates }}</h1>
                    <p>Total Candidates</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-account-group text-green"></span></v-icon>
                </v-card-item>
            </v-card>

            <v-card variant="tonal" width="360px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalVotes }}</h1>
                    <p>Scores Submitted</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-calendar-edit text-green"></span></v-icon>
                </v-card-item>
            </v-card>

            <v-card variant="tonal" width="360px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalRounds }}</h1>
                    <p>No. of Rounds</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-clock-out text-green"></span></v-icon>
                </v-card-item>
            </v-card>
        </div>
    </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';

export default {
    setup() {
        const serverItems = ref([]);
        const totalItems = ref(0);
        const totalVotes = ref(0);
        const totalCandidates = ref(0);
        const totalRounds = ref(0);
        const isLoading = ref(false);
        const isMatch = ref(false);

        async function fetchPageData() {
            isLoading.value = true;
            try {
                // Fetch total number of Students
                let { count, error } = await supabase
                    .from('Users')
                    .select('*', { count: 'exact', head: true });
                if (error) throw new Error(error.message);
                totalItems.value = count;

                // Fetch total number of Products
                ({ count, error } = await supabase
                    .from('Contestants')
                    .select('*', { count: 'exact', head: true }));
                if (error) throw new Error(error.message);
                totalCandidates.value = count;

                // Fetch total number of Rounds
                ({ count, error } = await supabase
                    .from('Round')
                    .select('*', { count: 'exact', head: true }));
                if (error) throw new Error(error.message);
                totalRounds.value = count;    
                
                

            } catch (error) {
                console.error('Error fetching data:', error.message);
                isMatch.value = true;
            } finally {
                isLoading.value = false;
            }
        }

        onMounted(() => {
            fetchPageData();
        });

        return { serverItems, totalItems, totalVotes, totalCandidates, totalRounds, isLoading, isMatch };
    }
};
</script>

<style scoped>
/* Your styles here */
</style>
