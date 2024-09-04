<template>
  <div class="pt-16">
    <div class="text-center pt-16">
      <h1>Update your Password</h1>
      <p>Please enter your new password to confirm the changes.</p><br>
    </div>

    <v-card
      class="mx-auto pa-12 pb-4 mt-4"
      elevation="8"
      max-width="455"
      rounded="lg"
    >
      <v-text-field
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        v-model="password"
        density="comfortable"
        placeholder="New Password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visible = !visible"
      ></v-text-field>

      <v-card
        v-if="success"
        class="mb-6 text-black"
        color="surface-variant"
        variant="tonal"
      >
        <v-card-text class="text-medium-emphasis text-caption bg-green">
          {{ success }}
        </v-card-text>
      </v-card>

      <v-btn
        color="blue"
        size="large"
        variant="tonal"
        block
        @click="updatePassword"
      >
        Update
      </v-btn>

      <v-card-text class="text-center">

      </v-card-text>

      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        color="green"
        absolute
        bottom
      ></v-progress-linear>
    </v-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import { supabase } from '../clients/supabase';  
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

export default {
  setup() {
    const $toast = useToast();
    const visible = ref(false);
    const loading = ref(false);
    const router = useRouter();
    const password = ref('');
    const error = ref('');
    const success = ref('');

    const updatePassword = async () => {
      loading.value = true;

      try {
        // Update the user's password
        const { data, error: updateError } = await supabase.auth.updateUser({
          password: password.value,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        $toast.success('Password Updated Successfully!',{
            position: 'top',
            duration: 8000,
            dismissible: true,
          })
        error.value = '';
        
        // Optionally, redirect the user after successful password update
        router.push('/Login');
      } catch (err) {
        error.value = err.message;
        success.value = '';
        console.log('Password update error:', err.message);
      } finally {
        loading.value = false;
      }
    };

    return {
      password,
      error,
      success,
      updatePassword,
      loading,
      visible,
    };
  },
};
</script>

<style scoped>
.error-message .v-card-text {
  color: #000000;
}
</style>
