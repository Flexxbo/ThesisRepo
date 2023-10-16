const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
//require('dotenv').config();
require("dotenv").config({
  path: "C:/Users/Work/Desktop/Masterprojekt_WIBACHAT/wibasechat/.env.local",
});
//import { createClient } from "@supabase/supabase-js";
const { createClient } = require("@supabase/supabase-js");

async function getEmbedding(texts) {
  //console.log("apikey", process.env.OPENAI_API_KEY)

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    persistSession: false,
  });
  

  for (let i = 0; i < texts.length; i++) {
    const chunk = texts[i];
    //console.log("chunk", chunk);

    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: chunk.context,
    });
    const { embedding } = response.data.data[0];
    //const { prompt_tokens, total_tokens } = response.data.usage;
    //console.log("Das ist das Embedding", embedding);
    //console.log("Das ist das prompt_tokens", prompt_tokens);
    //console.log("Das ist das total_tokens", total_tokens);


    const { data, error } = await supabase
    .from("squad") 
    .insert({
      id: chunk.id,
      document_title: chunk.title,
      context: chunk.context,
      question: chunk.question,
      answer_text: chunk.answers.text,
      answer_start: chunk.answers.answer_start,
      url: 'N/A', 
      token_count: 0, 
      embedding
    })
    .select("*");

    if (error) {
      console.error("Error bei Eingabe in Datenbank:", error);
    } else {
      console.log("Erfolgreich hinzugefügt zu Supabase:", data);
    }
  }
}

/**1. Textdatei einlesen: Lese die JSON-Datei(en) ein und extrahiere die Inhalte.
 * Liest eine JSON-Datei ein und gibt deren Inhalt in der Konsole aus.
 *
 * @param {string} filename - Der Pfad zur JSON-Datei, die eingelesen werden soll.
 */
async function processTextFiles(filename) {

  const fileContent = fs.readFileSync(filename, "utf-8");

  const texts = JSON.parse(fileContent);


  await getEmbedding(texts);
}

// Verwendung:
processTextFiles("../knowledge_alt/squad_reduced.json");
//processTextFiles("../knowledge_alt/squad_reduced_short.json");
//processTextFiles("../knowledge_alt/squad_reduced_long.json");
