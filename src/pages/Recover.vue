<template>
    <div class="pt-16">
      <div class="text-center pt-16 mt-10">
        <h1>Recover Password</h1>
        <p>You'll receive an email to recover your password</p><br>
      </div>
  
      <v-card
        class="mx-auto pa-12 pb-4 mt-4"
        elevation="8"
        max-width="455"
        rounded="lg"
      >
        <v-text-field
          v-model="email"
          density="comfortable"
          placeholder="Email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
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

        <v-card
          v-if="error"
          class="mb-6 text-black"
          color="surface-variant"
          variant="tonal"
        >
          <v-card-text class="text-medium-emphasis text-caption bg-red">
            {{ error }}
          </v-card-text>
        </v-card>
  
        <v-btn
          class=""
          color="blue"
          size="large"
          variant="tonal"
          block
          @click="recoverPassword"
        >
          Send
        </v-btn>
  
        <v-card-text class="text-center">
          <!-- <a
            class="text-blue text-decoration-none"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
          >
            <RouterLink to="/Login" class="text-decoration-none">
              Login
              <v-icon icon="mdi-chevron-right"></v-icon>
            </RouterLink>
          </a> -->
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
  import { supabase } from '../clients/supabase';  
  import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
  
  export default {
    setup() {
      const $toast = useToast();
      const loading = ref(false);
      const email = ref('');
      const error = ref('');
      const success = ref('');
  
      const recoverPassword = async () => {
        loading.value = true;
  
        try {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value);
  
          if (resetError) {
            throw new Error(resetError.message);
          }
  
          success.value = 'Password recovery email sent!';
          $toast.success('Please check your email',{
            position: 'top',
            duration: 8000,
            dismissible: true,
          })
          error.value = '';
        } catch (err) {
          $toast.error(err.message,{
            position: 'top',
            duration: 8000,
            dismissible: true,
          })
          console.log('Password recovery error:', err.message);
        } finally {
          loading.value = false;
        }
      };
  
      return {
        email,
        error,
        success,
        recoverPassword,
        loading,
      };
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .error-message .v-card-text {
    color: #000000;
  }
  </style>
  
