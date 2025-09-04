import { createClient } from '@supabase/supabase-js';

// Remplacez par votre URL et clé de projet Supabase
const supabaseUrl = 'https://xusroouovvrdaciiqtdq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3Jvb3VvdnZyZGFjaWlxdGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTQ2NTcsImV4cCI6MjA3MTE3MDY1N30.t4UVOzU2dcsTgY3txbDjnkTag4yjs7KblvGHOHNw7wA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);