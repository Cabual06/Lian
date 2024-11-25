<template>
    <Nav />
    <v-app style="background-color: #f2f2f2">
        <v-container class="d-flex flex-column pb-6 pt-16 mt-8">
            <!-- <h1 class="text-medium-emphasis">Information</h1> -->
            <v-card variant="tonal" width="700" height="310" class="bg-transparent text-center border-sm mx-auto mt-8">
                <v-card-item>
                    <v-card-title class="pa-6">
                        <h1 class="text-medium-emphasis">Automated Data Tabulation</h1>
                        <h1 class="text-medium-emphasis">for Event Management</h1>
                        <p class="text-subtitle-1 text-medium-emphasis">Lorem ipsum dolor sit amet consectetur, adipisicing elit. <br> Consectetur aut molestias incidunt inventore omnis, praesentium,<br> tempore recusandae ducimus quaerat, officiis voluptate! Error, quae <br> quod deserunt labore blanditiis nisi esse magni.</p>
                    </v-card-title>
                </v-card-item>
            </v-card>

            <v-container class="mt-12">
                <h1 class="text-purple pb-4 pl-6">Tech we Use</h1>
                
                <v-container class="d-flex ga-6">
                    <v-card variant="tonal" class="shadow-lg border-sm mx-auto pa-8" width="400" v-for="card in cards" :key="card.id">
                        <v-card-item class="d-flex flex-column align-center">
                            <v-card-title></v-card-title>
                            <h1 class="text-purple font-weight-bold">{{ card.title }}</h1><br>
                            <p class="font-weight-bold">{{ card.description }}</p><br>
                            <div class="image-container">
                                <img :src="card.icon" alt="No image found">
                            </div>
                        </v-card-item>
                    </v-card>
                </v-container>
            </v-container>
        </v-container>
    </v-app>
</template>

<script>
export default {
    name: 'information',
    data() {
        return {
            cards: [
                { icon: '../src/assets/vue.png', title: 'Vue Js', description: 'Vue Js is a JavaScript framework that provides a built in components that we can use.' },
                { icon: '../src/assets/supa.png', title: 'SupaBase', description: 'Vue Js is a JavaScript framework that provides a built in components that we can use.' },
                { icon: '../src/assets/logo.png', title: 'Vuetify', description: 'Vue Js is a JavaScript framework that provides a built in components that we can use.' },
                { icon: '../src/assets/gmail.png', title: 'SMTP Server', description: 'Vue Js is a JavaScript framework that provides a built in components that we can use.' },
            ]
        }
    }
}
</script>

<style scoped>
.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 160px; /* Optional: Adjust this based on your layout */
}

.image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
