<template>
  <v-app class="bg-black">
    <v-main>
      <router-view />
    </v-main>
  </v-app>    
</template>

<script>
import index from './pages/index'

  export default{
    name: 'app',
    components: {
      index,
    },
    data(){
      return{

      }
    }
  }
</script>

<style>

</style>