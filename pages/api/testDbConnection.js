const { createClient } = require("@supabase/supabase-js");

// Supabase Konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export default async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('preptest2').select('*').limit(1);
  
      if (error) {
        throw error;
      }
  
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Database Connection Error:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };