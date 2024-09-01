<template>
    <Nav />

        <v-container class="d-flex flex-column pb-6 pt-16 mt-8">
            <!-- <h1 class="text-medium-emphasis">Information</h1> -->
            <v-card width="700" height="310" class="bg-transparent text-center border-sm mx-auto mt-8">
                <v-card-item>
                    <v-card-title>
                        <h1 class="text-medium-emphasis">TABULATION SYSTEM</h1>
                        <h1 class="text-medium-emphasis">FOR EVENTS </h1>
                        <br>
                        <p class="text-subtitle-1 text-medium-emphasis">Lorem ipsum dolor sit amet consectetur, adipisicing elit. <br> Consectetur aut molestias incidunt inventore omnis, praesentium,<br> tempore recusandae ducimus quaerat, officiis voluptate! Error, quae <br> quod deserunt labore blanditiis nisi esse magni.</p>
                    </v-card-title>
                </v-card-item>
            </v-card>

            <v-container class="mt-12">
                <h1 class="text-green pb-4 pl-6">Tech we Use</h1>
                
                <v-container class="d-flex ga-6">
                <v-card class="bg-transparent border-sm mx-auto" width="400" v-for="card in cards" :key="card.id">
                    <v-card-item>
                        <v-card-title></v-card-title>
                        <h1 class="text-green">{{ card.title }}</h1><br>
                        <p>{{ card.description }}</p><br>
                        <img width="160px" class="ml-14" :src="card.icon" alt="No image found">
                    </v-card-item>
                </v-card>
            </v-container>
            </v-container>
        </v-container>


    
</template>

<script>

    export default{
        name: 'information',
        data(){
            return{
                cards:[
                    {icon:'../src/assets/supabase.webp', title:'Vue Js', description:'Vue Js is a JavaScript framework that provides a built in components that we can use.'},
                    {icon:'../src/assets/vuetify.webp', title:'Vuetify', description:'Vue Js is a JavaScript framework that provides a built in components that we can use.'},
                    {icon:'../src/assets/supabase.webp', title:'SupaBase', description:'Vue Js is a JavaScript framework that provides a built in components that we can use.'},

                    {icon:'../src/assets/gmail.png', title:'SMTP Server', description:'Vue Js is a JavaScript framework that provides a built in components that we can use.'},
                    {icon:'../src/assets/Axios.svg', title:'Axios', description:'Vue Js is a JavaScript framework that provides a built in components that we can use.'},
                ]
            }
        }
    }

</script>

<style scoped>

</style>