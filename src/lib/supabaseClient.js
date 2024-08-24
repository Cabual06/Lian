import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://urmmhwqxxnxcnqdnciez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybW1od3F4eG54Y25xZG5jaWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQyMTk4OTAsImV4cCI6MjAzOTc5NTg5MH0.j_qZIZiX03Cr81Bxgsq3pvyqrCyF5LiSUkZFKRKYv8k';

export const supabase = createClient(supabaseUrl, supabaseKey);

