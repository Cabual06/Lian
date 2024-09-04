<template>
    <div class="pt-8">
  
      <div class="text-center pt-16 mt-12 pb-2">
        <span class="text-h3 font-weight-bold"><span class="text-h2 text-green font-weight-bold">C</span>REATE ACCOUNT</span>
      </div>
  
      <v-card
        class="mx-auto pa-12 pb-8 mt-10"
        elevation="8"
        max-width="455"
        rounded="lg"
      >
        <div class="text-subtitle-1 text-medium-emphasis">Account</div>
  
        <v-text-field
          density="comfortable"
          placeholder="Name"
          prepend-inner-icon="mdi mdi-account"
          variant="outlined"
          v-model="name"
        ></v-text-field>
  
        <v-text-field
          density="comfortable"
          placeholder="Email address"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          v-model="email"
        ></v-text-field>
        
        <v-text-field
          density="comfortable"
          placeholder="Phone Number"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          v-model="phone"
        ></v-text-field>
  
        <v-text-field
          density="comfortable"
          placeholder="Address"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          v-model="address"
        ></v-text-field>
  
        <!-- <v-combobox
          label="Course"
          density="comfortable"
          prepend-inner-icon="mdi mdi-book-open"
          variant="outlined"
          v-model="course"
          :items="['DDAT', 'DSET', 'BSIT', 'BSBA', 'BOXER']"
        ></v-combobox> -->
  
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
          <v-card-text class="text-medium-emphasis text-caption bg-red">
            {{ error }}
          </v-card-text>
        </v-card>
  
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
          class="mb-4"
          color="green"
          size="large"
          variant="tonal"
          block
          @click="signup"
        >
          SignUp
        </v-btn>
  
        <v-card-text class="text-center">
          <a
            class="text-blue text-decoration-none"
            href="#"
            rel="noopener noreferrer"
            target=""
          >
            <RouterLink to="/Login" class="text-decoration-none">LogIn now <v-icon icon="mdi-chevron-right"></v-icon></RouterLink>
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
import { supabase } from '../clients/supabase';  // Ensure the path is correct
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

export default {
  setup() {

    const $toast = useToast();
    const loading = ref(false);
    const name = ref('');
    const email = ref('');
    const phone = ref('');
    const address = ref('');
    const password = ref('');
    const visible = ref(false);
    const error = ref('');
    const success = ref('');

    const signup = async () => {
      loading.value = true;

      // Perform signup with email and password
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (signupError) {
        $toast.error(signupError.message,{
          position: 'top',
          duration: 8000,
        })
        success.value = '';
        loading.value = false;
        return;
      }

      // Ensure we have the user ID (UUID)
      const userId = authData?.user?.id;
      if (!userId) {
        $toast.error('User ID not returned after signup',{
          position: 'top',
          duration: 8000,
        })
        loading.value = false;
        return;
      }

      console.log('User ID:', userId);

      // Insert user details into the Users table with the same UUID
      const { data, error: dbError } = await supabase
        .from('Users')
        .insert([{
          id: userId,  // Use the UUID from Supabase authentication
          name: name.value,
          email: email.value,
          phone: phone.value,
          address: address.value,
        }]);

      if (dbError) {
        console.log('Database Insert Error:', dbError);
        $toast.error(dbError.message,{
          position: 'top',
          duration: 8000,
        })
        success.value = '';
        loading.value = false;
        return;
      }

      // success.value = 'SignUp Successful!.';
      $toast.success('Signup Success, Please Verify your email',{
        position: 'top',
        duration: 8000,
        dismissible: true,
      })
      error.value = '';
      loading.value = false;

      // Clear form fields
      name.value = '';
      email.value = '';
      phone.value = '';
      address.value = '';
      password.value = '';
    };

    return {
      name,
      email,
      phone,
      address,
      password,
      visible,
      error,
      success,
      signup,
      loading,
    };
  },
};


</script>

