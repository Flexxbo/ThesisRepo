import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('squad') 
      .select('question'); 

    if (error) return res.status(500).json({ error });

    const questions = data.map((row) => row.question); 
    return res.status(200).json({ questions });
  }

  return res.status(405).end(); 
}
