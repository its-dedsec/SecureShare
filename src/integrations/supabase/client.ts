// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://forpyibpmnwafrkcalmb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcnB5aWJwbW53YWZya2NhbG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Njk3MjgsImV4cCI6MjA2NjE0NTcyOH0._c7ti0Za6A3S13HvmS5s9SDM5bj945cyn7ce8Ejd2WQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);