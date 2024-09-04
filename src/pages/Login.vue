<template>
  <div class="pt-16">
    <div class="text-center pt-16 mt-12 pb-2">
        <span class="text-h3 font-weight-bold">
          <span class="text-h2 text-green font-weight-bold">T</span>ABULATION SYSTEM
        </span>
    </div>

    <v-card
      class="mx-auto pa-12 pb-8 mt-10"
      elevation="8"
      max-width="455"
      rounded="lg"

    >
      <div class="text-subtitle-1 text-medium-emphasis">Account</div>

      <v-text-field
        v-model="email"
        density="comfortable"
        placeholder="Email address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Password

        <a
          class="text-caption text-decoration-none text-blue"
          href="/Recover"
          rel="noopener noreferrer"
          target="_blank"
        >
          Forgot login password?
        </a>
      </div>

      <v-text-field
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="comfortable"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        v-model="password"
        @click:append-inner="visible = !visible"
      ></v-text-field>

      <v-card
        v-if="error"
        class="mb-6"
        color="surface-variant"
        variant="tonal"
      >
        <v-card-text class="text-large-emphasis text-caption bg-red">
          {{ error }}
        </v-card-text>
      </v-card>

      <v-card
        v-if="success"
        class="mb-6"
        color="surface-variant"
        variant="tonal"
      >
        <v-card-text class="text-medium-emphasis text-caption bg-green">
          {{ success }}
        </v-card-text>
      </v-card>

      <v-btn
        class="mb-4 mt-2"
        color="green"
        size="large"
        variant="tonal"
        block
        @click="login"
      >
        LogIn
      </v-btn>

      <v-card-text class="text-center">
        <a
          class="text-blue text-decoration-none"
          href="#"
          rel="noopener noreferrer"
          target="_blank"
        >
          <RouterLink to="/Signup" class="text-decoration-none">
            SignUp now
            <v-icon icon="mdi-chevron-right"></v-icon>
          </RouterLink>
        </a>
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
    const loading = ref(false);
    const router = useRouter();
    const visible = ref(false);
    const email = ref('');
    const password = ref('');
    const error = ref('');
    const success = ref('');

    const login = async () => {
    loading.value = true;

    try {
      // Sign in with email and password
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,

      });

      if (loginError) {
        throw new Error(loginError.message);
      }

      // Access user ID from the response
      const user = data.user;

      if (!user) {
        throw new Error('User not found in the response');
      }

      console.log('User ID:', user.id); // Debugging line

      // Check if the user already exists in the `users` table
      const { data: existingUser, error: fetchError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', user.id);

      if (fetchError) {
        throw new Error(fetchError.message);
      }


      // Check if the email and password are both 'Admin'
      if (email.value === 'admin@gmail.com' && password.value === 'admin') {
        // Redirect to Admin Dashboard
        router.push('/Admin/Dashboard');
      } else {
        // Redirect to VotingForm for other users
        router.push('/Users/VotingForm');
      }

      $toast.success('Login Success',{
        position: 'top',
        duration: 8000,
        dismissible: true,
      })
      error.value = '';
      console.log('Login successful:', data);
    } catch (err) {

      $toast.error(err.message,{
        position: 'top',
        duration: 8000,
        dismissible: true,
      })
      success.value = '';
      console.log('Login error:', err.message);
    } finally {
      loading.value = false;
    }
  };


      return {
        email,
        password,
        error,
        success,
        login,
        visible,
        loading,
      };
    },
  };
</script>



<style scoped>
.error-message .v-card-text {
  color: #000000;
}
</style>
