const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");
require("dotenv").config({
  path: "C:/Users/Work/Desktop/Masterprojekt_WIBACHAT/wibasechat/.env.local",
});
const fs = require("fs");
const path = require("path");

// Supabase-Konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL und/oder Key sind nicht gesetzt.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Lade den SQuAD-Datensatz
const squadData = require("../knowledge_alt/squad_reduced.json");

async function testSimilaritySearch() {
  // Objekt zur Speicherung der Positionsinformationen
  const positionStats = {
    "-1": [],
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  };
  // Pfad zur Log-Datei
  const logFilePath = path.join(
    __dirname,
    "logs",
    `retrieval_log_${Date.now()}.txt`
  );

  for (const item of squadData) {
    const { id, question } = item;

    // Embedding für die Frage erzeugen
    const openAIApiResponse = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input: question,
        }),
      }
    );

    if (!openAIApiResponse.ok) {
      console.error(
        "Fehler beim Abrufen des Embeddings von OpenAI:",
        await openAIApiResponse.text()
      );
      continue; // Zum nächsten Item in der Schleife springen
    }

    const openAIData = await openAIApiResponse.json();

    if (!openAIData.data || openAIData.data.length === 0) {
      console.error("Unerwartete Antwortstruktur von OpenAI:", openAIData);
      continue; // Zum nächsten Item in der Schleife springen
    }
    //console.log("openAIData", openAIData.data[0].embedding);

    const queryEmbedding = openAIData.data[0].embedding;
    // Similarity Search in der Datenbank durchführen
    const { data, error } = await supabaseAdmin.rpc("squad_search", {
      query_embedding: queryEmbedding,
      similarity_threshold: 0.01,
      match_count: 100,
    });

    if (error) {
      console.error("Fehler:", error.message);
      continue;
    }

    // Vergleiche ID des richtigen Textchunks mit den IDs der erhaltenen Textchunks
    const correctPosition = data.findIndex((chunk) => chunk.id === id);
    if (!positionStats[correctPosition]) {
      positionStats[correctPosition] = [];
    }
    positionStats[correctPosition].push(id);

    console.log(
      `ID: ${id}, Position in den Ergebnissen: ${correctPosition}, Frage: ${question},  Ergebnisse: ${JSON.stringify(
        data.map((result) => ({
          id: result.id,
          question: result.question,
          similarity: result.similarity,
        }))
      )}`
    );

    const logMessage = `ID: ${id}, Position in den Ergebnissen: ${correctPosition}, Frage: ${question},  Ergebnisse: ${JSON.stringify(
      data.map((result) => ({
        id: result.id,
        question: result.question,
        similarity: result.similarity,
      }))
    )}\n`;

    // Log-Nachricht in die Datei schreiben
    fs.appendFileSync(logFilePath, logMessage);
  }
  // Erstelle Ergebnisstring mit Timestamp
  const timestamp = new Date().toISOString();
  let resultString = `Timestamp: ${timestamp}\nPositionshäufigkeiten:\n`;
  for (const position in positionStats) {
    resultString += `Position ${position}: ${positionStats[position].length} mal\n`;
    resultString += "IDs: " + positionStats[position].join(", ") + "\n";
  }

  // Pfad zur Ergebnisdatei
  const resultsFilePath = path.join(__dirname, "testResults.txt");

  // Ergebnisse an Datei 
  fs.appendFileSync(resultsFilePath, resultString + "\n");
  console.log("Ergebnisse wurden in die Datei geschrieben:", resultsFilePath);
}


testSimilaritySearch();
