<template>
    
    <Nav />
    <v-app class="bg-black">
        <v-container>
            <v-container class="pb-6 pt-16 mt-8">
                <h1 class="text-medium-emphasis"><span class="text-green">D</span>ashboard</h1> 
            </v-container>
            <dashInfo />
            <Chart />
        </v-container>
    </v-app>

</template>

<script>
import nav from '@/components/nav.vue'
import chart from '@/components/chart.vue'

    export default {
        name: 'dashboard',
        components:{
            chart,
        },
        data(){
            return{

            }
        }
    }
</script>

<style>


</style>