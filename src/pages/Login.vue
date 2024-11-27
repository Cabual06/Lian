<template>
  <v-app style="background-color: #f2f2f2">
    <v-row>
      <!-- Left Column: Image -->
      <v-col
        cols="12"
        md="6"
        class="d-flex justify-center"
      >
        <img
          class="pa-10"
          src="/src/assets/bg2.png"
          alt="Login Illustration"
          style="max-width: 90%; height: 100%;"
        />
      </v-col>

      <!-- Right Column: Login Form -->
      <v-col cols="12" md="6" class="d-flex flex-column align-center bg-white">
        <div class="mt">
            <img
              src="/src/assets/mdc1.png"
              alt="Logo"
              style="max-width: 140px; height: auto; margin-bottom: 40px;"
            />
          </div>

        <v-card
          class="pa-10"
          elevation="6"
          width="47%"
          rounded="lg"
        >
          <!-- Logo Image -->


          <div class="text-center mb-6">
            <h3 class="font-weight-bold">
              <span class="text-purple mb-6"></span>Login Account
            </h3>
          </div>

          <div class="text-subtitle-1 text-medium-emphasis mb-2">Account</div>

          <v-text-field
            v-model="email"
            density="comfortable"
            placeholder="Email address"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between mb-2">
            Password
            <a
              class="text-caption text-decoration-none text-blue"
              rel="noopener noreferrer"
              href="/Recover"
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
            class="mb-6"
          ></v-text-field>

          <v-btn
            class="mb-2 mt-2 font-weight-bold"
            color="purple"
            size="large"
            variant="flat"
            block
            @click="login"
          >
            Log In
          </v-btn>

          <v-card-text class="text-center">
            <a
              class="text-blue text-decoration-none"
              href="#"
              rel="noopener noreferrer"
              target="_blank"
            >
              <RouterLink to="/Signup" class="text-decoration-none">
                Sign Up now
                <v-icon icon="mdi-chevron-right"></v-icon>
              </RouterLink>
            </a>
          </v-card-text>

          <v-progress-linear
            :active="loading"
            :indeterminate="loading"
            color="purple"
            absolute
            bottom
          ></v-progress-linear>
        </v-card>
      </v-col>
    </v-row>
  </v-app>
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
        duration: 4000,
        dismissible: true,
      })
      error.value = '';
      console.log('Login successful:', data);
    } catch (err) {

      $toast.error(err.message,{
        position: 'top',
        duration: 4000,
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

.mt{
  margin-top: 120px;
}
</style>
