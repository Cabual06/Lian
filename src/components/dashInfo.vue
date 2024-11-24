<template>
    <v-container>
        <div class="d-flex mx-auto">
            <v-card variant="tonal" width="380px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalItems }}</h1>
                    <p class="font-weight-bold text-green">Registered Judges</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-account-multiple text-purple"></span></v-icon>
                </v-card-item>
            </v-card>

            <v-card variant="tonal" width="360px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalCandidates }}</h1>
                    <p class="font-weight-bold text-green">Total Candidates</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-account-group text-purple"></span></v-icon>
                </v-card-item>
            </v-card>

            <v-card variant="tonal" width="360px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalEvents }}</h1>
                    <p class="font-weight-bold text-green">No. Events</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-calendar-edit text-purple"></span></v-icon>
                </v-card-item>
            </v-card>

            <v-card variant="tonal" width="360px" height="auto" class="py-4 px-10 d-flex mx-auto">
                <v-card-item class="text-center">
                    <h1 class="text-h2 font-weight-bold mb-2">{{ totalOngoingEvents }}</h1>
                    <p class="font-weight-bold text-green">Ongoing Events</p>
                </v-card-item>
                <v-spacer></v-spacer>
                <v-card-item>
                    <v-icon size="70px"><span class="mdi mdi-clock-out text-purple"></span></v-icon>
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
        const totalEvents = ref(0);
        const totalCandidates = ref(0);
        const totalRounds = ref(0);
        const isLoading = ref(false);
        const isMatch = ref(false);
        const totalOngoingEvents = ref(0);
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
                
                ({ count, error } = await supabase
                    .from('Event')
                    .select('*', { count: 'exact', head: true }));
                if (error) throw new Error(error.message);
                totalEvents.value = count;        
                
                ({ count, error } = await supabase
                    .from('Event')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'ongoing'));
                if (error) throw new Error(error.message);
                totalOngoingEvents.value = count;

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

        return { serverItems, totalItems, totalVotes, totalCandidates, totalOngoingEvents, totalEvents, totalRounds, isLoading, isMatch };
    }
};
</script>

<style scoped>
/* Your styles here */
</style>
