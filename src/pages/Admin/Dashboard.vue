<template>
    
    <Nav />
    <v-container>
        <v-container class="pb-6 pt-16 mt-8">
            <h1 class="text-medium-emphasis"><span class="text-green">D</span>ashboard</h1> 
        </v-container>
        <dashInfo />
    </v-container>
</template>

<script>
import nav from '@/components/nav.vue'

    export default{
        name: 'dashboard',
        data(){
            return{

            }
        }
    }
</script>

<style>


</style>