<template>
    
    <Nav />
    <v-app class="px-12" style="background-color: #f2f2f2">
        <v-container>
            <v-container class="pb-6 pt-16 mt-8">
                <h1 class="text-medium-emphasis ml-8 mt-6 "><span class="text-purple">D</span><span class="text-black">ASHBOARD</span></h1> 
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