Supabase setup for FRA_Atlas

1) In the Supabase dashboard > SQL Editor paste the contents of `supabase_schema.sql` and run it. This will create the `pattas` table and necessary triggers/indexes.

2) In the frontend folder `.env` add (or replace) these values:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

3) Start frontend dev server (from `frontend`):

npm install
npm run dev

4) Open the Claimant Patta page, click Apply for New Patta, upload a document and Run OCR. After the OCR completes you can edit fields and click Claim to insert a new row into the `pattas` table as owner 'guest'.

Notes:
- The frontend uses the `@supabase/supabase-js` client in `src/lib/supabaseClient.js`.
- If you want to store uploaded document files in Supabase Storage, I can add that flow (upload file to storage and save file URL in `patta_doc_url`).
