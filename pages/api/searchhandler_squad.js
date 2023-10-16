// Importieren der erforderlichen Module und Konfigurationsvariablen
const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

// Supabase-Konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export default async (req, res) => {
  //console.log("hallo")
  try {
    if (!req.body || !req.body.query) {
      return res.status(400).send("Bad Request");
    }
    // Daten aus der eingehenden Anfrage 
    const { query, database } = req.body;
    console.log("req.body", req.body);
    console.log("query", query);

    // Externer API-Aufruf an OpenAI
    const openAIApiResponse = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: "text-embedding-ada-002", input: query }),
      }
    );
    //console.log("openAIApiResponse", openAIApiResponse);
    

    if (!openAIApiResponse.ok) {
      throw new Error("Fehler beim Abrufen des Embeddings von OpenAI");
    }

    const openAIData = await openAIApiResponse.json();
    console.log("openAIData", openAIData.data[0].embedding);

    // Datenbankabfrage, um die gespeicherte Prozedur basierend auf OpenAI-Daten aufzurufen
    const { data, error } = await supabaseAdmin.rpc(database, {
      //match_count: 5,
      query_embedding: openAIData.data[0].embedding,
      similarity_threshold: 0.01,
      match_count: 5,
    });

    if (error) {
      throw error;
    }

    // Antwort senden
    res.status(200).json({ success: true, data });
    console.log("data",data);
    //console.log("data", data);
  } catch (error) {
    // Allgemeine Fehlerbehandlung
    console.error("Fehler:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
