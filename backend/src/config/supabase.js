// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// dotenv.config();

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// // Storage bucket names
// export const BUCKETS = {
//   STUDENT_PHOTOS: 'student-photos',
//   STAFF_PHOTOS: 'staff-photos',
//   DOCUMENTS: 'documents'
// };








import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate credentials exist
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Supabase credentials missing!');
  console.error('Please add SUPABASE_URL and SUPABASE_SERVICE_KEY to backend/.env');
  process.exit(1); // Stop the server if no credentials
}

// Validate URL format
if (!supabaseUrl.startsWith('http')) {
  console.error('❌ ERROR: Invalid SUPABASE_URL format. Must start with https://');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('✅ Supabase connected successfully');

// Storage bucket names
export const BUCKETS = {
  STUDENT_PHOTOS: 'student-photos',
  STAFF_PHOTOS: 'staff-photos',
  DOCUMENTS: 'documents'
};