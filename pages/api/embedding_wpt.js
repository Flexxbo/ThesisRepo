// In dieser Datei wird Wordpress, Documentloader, Preprocessing, Chunking und Embedding zu Supabase Komponenten zusammengeführt.

const axios = require("axios");
const { htmlToText } = require("html-to-text");
const { encode } = require("gpt-3-encoder");
const { v4: uuidv4 } = require("uuid");
const { Configuration, OpenAIApi } = require("openai");
const { createClient } = require("@supabase/supabase-js");
const he = require("he");

require("dotenv").config({
  path: "C:/Users/Work/Desktop/Masterprojekt_WIBACHAT/wibasechat/.env.local",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getEmbedding(chunks) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: chunk.text,
    });
    const { embedding } = response.data.data[0];
    const { data, error } = await supabase
      .from("preptest2")
      .insert({
        url: chunk.url,
        content: chunk.text,
        title: chunk.title,
        embedding,
        postid: chunk.postid,
      })
      .select("*");

    if (error) {
      console.error("Error bei Eingabe in Datenbank:", error);
    } else {
      console.log("Erfolgreich hinzugefügt zu Supabase:", data);
    }
  }
}

export default async function handler(req, res) {
  console.log("Function handler started");
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const receivedSecret = req.headers["x-webhook-secret"];
    console.log(
      `Received secret: ${receivedSecret}, Expected secret: ${webhookSecret}`
    );

    if (receivedSecret !== webhookSecret) {
      return res.status(403).send("Unauthorized");
    }

    const response = await axios.get("https://fb-code.com/wp-json/wp/v2/posts");
    const fetchedIds = response.data.map((post) => post.id);
    const { data: existingPosts, error: fetchError } = await supabase
      .from("preptest2")
      .select("postid");

    if (fetchError) {
      console.error("Error fetching from database:", fetchError);
      return res.status(500).send("An error occurred.");
    }
    console.log("Existing posts:", existingPosts);

    const existingIds = existingPosts.map((post) => post.postid);
    const newIds = fetchedIds.filter((id) => !existingIds.includes(id));
    //console.log("fetchedIds:", fetchedIds);
    //console.log("newIds:", newIds);
    let allChunks = [];

    for (const post of response.data) {
      const postId = post.id;
      if (newIds.includes(postId)) {
        const modifiedTime = post.modified_gmt;
        const textContent = he
          .decode(htmlToText(post.content.rendered))
          .replace(/\n/g, " ");
        const sentences = textContent
          .split(". ")
          .map((sentence) => sentence + ".");
        let chunk = [];
        let chunkTokens = 0;
        let chunks = [];

        for (let sentence of sentences) {
          const encodedSentence = encode(sentence);
          const sentenceTokens = encodedSentence.length;
          if (chunkTokens + sentenceTokens <= 500) {
            chunk.push(sentence);
            chunkTokens += sentenceTokens;
          } else {
            chunks.push({
              text: post.title.rendered + " " + chunk.join(" "),
              tokens: chunkTokens,
              uuid: uuidv4(),
              title: post.title.rendered,
              url: post.link,
              postid: postId,
            });
            chunk = [sentence];
            chunkTokens = sentenceTokens;
          }
        }

        if (chunk.length > 0) {
          chunks.push({
            text: post.title.rendered + " " + chunk.join(" "),
            tokens: chunkTokens,
            uuid: uuidv4(),
            title: post.title.rendered,
            url: post.link,
            postid: postId,
          });
        }

        allChunks = allChunks.concat(chunks);
      }
    }
    console.log("All chunks:", allChunks);

    await getEmbedding(allChunks);
    res
      .status(200)
      .send("Posts successfully fetched, processed, and embeddings stored.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
}
