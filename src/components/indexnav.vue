<template>
    <v-responsive>
        <v-toolbar class="bg-black border-b-sm px-16">
            
            <v-toolbar-title>
                <span class="text-green font-weight-bold text-h4">T</span>
                <span>abulation</span> | 
                <span>SYSTEM</span>
            </v-toolbar-title>

            <v-btn to="/Login" variant="outlined">
                Logout
            </v-btn>
        </v-toolbar>

        <v-toolbar class="bg-black px-16 border-b-sm">
            <!-- <v-btn>
                <v-icon class="text-green mr-4">mdi mdi-menu</v-icon>
                All Catergories
            </v-btn> -->

            <v-spacer></v-spacer>

            <div class="text-center">
                <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                    <v-btn to="/Users/VotingForm" color="green" v-bind="props">
                        Home
                    </v-btn>
                </template>


                </v-menu>

                <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                    <v-btn color="green" v-bind="props">
                        Candidates
                    </v-btn>
                </template>

                <v-list class="bg-black">
                    <v-list-item>
                        <v-list-item-title><RouterLink to="/Users/Male"><v-btn class="bg-black">Male</v-btn></RouterLink></v-list-item-title>
                        <v-list-item-title><RouterLink to="/Users/Female"><v-btn class="bg-black">Female</v-btn></RouterLink></v-list-item-title>
                        <!-- <v-list-item-title><v-btn class="bg-black">Gold Lane</v-btn></v-list-item-title>
                        <v-list-item-title><v-btn class="bg-black">Mage</v-btn></v-list-item-title>
                        <v-list-item-title><v-btn class="bg-black">Roamer</v-btn></v-list-item-title> -->
                    </v-list-item>
                </v-list>
                </v-menu>

                <v-menu open-on-hover>
                <!-- <template v-slot:activator="{ props }">
                    <v-btn color="green" v-bind="props">
                        Categories
                    </v-btn>
                </template> -->
                </v-menu>

                <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                        <RouterLink to="/User/Vote"><v-btn color="green" v-bind="props">Print</v-btn></RouterLink>
                </template>
                </v-menu>
            </div>

            <v-spacer></v-spacer>

            <!-- <v-btn>
                <v-icon size="30px" class="text-green">mdi mdi-account</v-icon>
            </v-btn>

            <v-btn>
                <v-icon class="text-green">mdi mdi-heart</v-icon>
            </v-btn>

            <v-btn>
                <v-icon class="text-green">mdi mdi-cart</v-icon>
            </v-btn> -->
        </v-toolbar>
    </v-responsive>
</template>

<script>
    export default {
        name: 'indexnav',
        data(){
            return{
                routes: [
                    {President: './User/President'}
                ]
            }
        }
    }
</script>

<style scoped>

</style>