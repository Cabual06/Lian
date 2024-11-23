<template>
   
    <nav style="z-index:1000" class="position-fixed w-100 pr-6">
        <v-toolbar class="border-b-sm" style="background-color: #8654bf ;">

            <!-- <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon> -->

            <v-toolbar-title>
                <span class="text-black font-weight-bold text-h6">TABULATION</span>  
                <span class="font-weight-light text-white"> SYSTEM</span>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <RouterLink to="/Login">
                <v-btn size="small" class="bg-red mr-16">
                    <span class="text-white">Logout</span>
                </v-btn>
            </RouterLink>

        </v-toolbar>

      <v-navigation-drawer expand-on-hover rail class="" style="background-color: #8654bf;">

        <v-list>
            <v-app-bar-nav-icon class="text-white" @click="drawer = !drawer"></v-app-bar-nav-icon>
        </v-list>

        <v-divider></v-divider>

        <v-list>
            <v-list density="compact" nav v-for="link in links" class="text-white font-weight-bold py-2">
            <v-list-item :to="link.route" :prepend-icon="link.icon" value="myfiles">{{ link.text }}</v-list-item>
            <!-- <v-list-item prepend-icon="mdi-account-multiple" title="Account" value="shared" route="./Admin/Addstudent"></v-list-item>
            <v-list-item prepend-icon="mdi-list-box-outline" title="Request" value="starred"></v-list-item> -->
            </v-list>
        </v-list>

      </v-navigation-drawer>

    </nav>
</template>

<script>
    export default {
        name: 'nav',
        data(){
            return{
                theme: 'light',  // 'light' or 'dark'
                drawer: false,
                links: [
                    {icon: 'mmdi mdi-view-dashboard', text: 'Dashboard', route: '/Admin/Dashboard'},
                    {icon: 'mdi mdi-account-badge', text: 'Judges', route: '/Admin/Judges'},
                    {icon: 'mdi mdi-list-box-outline', text: 'Form', route: '/Admin/Form'},
                    // {icon: 'mdi mdi-list-box-outline', text: 'Tabulations', route: '/Admin/CreateEvent'},
                    // {icon: 'mdi mdi-account-supervisor-circle', text: 'Candidates', route: '/Admin/Candidates'},
                    // {icon: 'mdi mdi-counter', text: 'Scores', route: '/Admin/Settings'},
                    {icon: 'mdi mdi-alert-circle', text: 'Information', route: '/Admin/Information'},
                ]
            }
        }
    }
</script>

<style scoped>

</style>