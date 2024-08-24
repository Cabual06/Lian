<template>
    <v-container>
      <v-form @submit.prevent="addCandidate">
        <v-text-field
          v-model="newCandidate.id"
          label="Candidate ID"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCandidate.name"
          label="Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCandidate.address"
          label="Address"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCandidate.age"
          label="Age"
          type="number"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCandidate.course"
          label="Course"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCandidate.photo"
          label="Photo URL"
          required
        ></v-text-field>
        <v-btn type="submit" color="green">Add Candidate</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { supabase } from '@/lib/supabaseClient';
  
  const newCandidate = ref({
    id: '',
    name: '',
    address: '',
    age: '',
    course: '',
    photo: ''
  });
  
  const router = useRouter();
  
  async function addCandidate() {
    try {
      const { error } = await supabase
        .from('Contestants')
        .insert([newCandidate.value]);
  
      if (error) throw new Error(error.message);
  
      // Redirect to the list of candidates after successful insertion
      router.push('/Admin/Candidates');
    } catch (error) {
      console.error('Error adding candidate:', error.message);
    }
  }
  </script>
  