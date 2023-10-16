import { useState, useEffect } from "react";

import styles from "./myknowledgbase.module.css";
import SearchComponent from "@/components/SearchComponent";

function Myknowledgebase() {
  useEffect(() => {
    fetch("/api/getQuestions")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [textChunks, setTextChunks] = useState([]);
  const [openAIResponse, setOpenAIResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleSearch = async () => {
    // Statevariablen zurücksetzen
    setTextChunks([]);
    setOpenAIResponse("");
    setIsLoading(true);

    try {
      // Anfrage an den Server senden, um Text-Chunks zu erhalten
      const response = await fetch("/api/searchhandler_squad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery, database: "squad_search" }),
      });

      const data = await response.json();
      //console.log("data", data);
      // Aktualisieren des Stat e mit den neuen Text-Chunks
      setTextChunks(data.data);

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Prompt-Templates
      const generatePrompt = async (newTextChunks) => {
        let prompt = `
        1. Read the user's request [User Query].
        2. Read the text chunks [Text Chunks].
        3. Is there any indicators that help you answer the question, even though it is not explicitly mentioned?
        4a. If the answer is included. Output the answer.
        4b. If the answer is partial, then write exactly: "The answer is partial." and stop.
        4c. If the answer isn't included, reply with "Sorry, I don't know."
        User Query: ${searchQuery}
        \nText Chunks:\n`;
        newTextChunks.forEach((chunk, index) => {
          prompt += `Chunk ${index}: ${index + 1}. ${chunk.context}\n`;
        });
        return prompt;
      };

      let prompt = `Only answer the question if you know the answer. 
      If not, answer with "I do not know the answer"`;

      console.log(prompt);

      // Übergeben der neuen Text-Chunks direkt an generatePrompt
      const promptWithChunks = await generatePrompt(data.data);
      //console.log("promptWithChunks", promptWithChunks);

      // Restlicher Code zum Senden des Prompts an OpenAI über openaiconnect.js
      const promptWithoutChunks = searchQuery;
      const [responseWithChunks, responseWithoutChunks] = await Promise.all([
        fetch("/api/openaiconnect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: promptWithChunks,
            searchQuery: searchQuery,
          }),
        }),
        fetch("/api/openaiconnect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: promptWithoutChunks,
            searchQuery: searchQuery,
          }),
        }),
      ]);

      const [dataWithChunks, dataWithoutChunks] = await Promise.all([
        responseWithChunks.json(),
        responseWithoutChunks.json(),
      ]);
      console.log("searchQuery", searchQuery);
      console.log(
        "answerWithChunks",
        dataWithChunks.choices[0]?.message?.content
      );
      console.log(
        "answerWithoutChunks",
        dataWithoutChunks.choices[0]?.message?.content
      );
      try {
        await fetch("/api/logData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            searchQuery,
            answerWithChunks: dataWithChunks.choices[0]?.message?.content,
            answerWithoutChunks: dataWithoutChunks.choices[0]?.message?.content,
          }),
        });
      } catch (error) {
        console.error("Error logging data:", error);
      }

      setOpenAIResponse({
        withChunks: dataWithChunks.choices[0]?.message?.content || "",
        withoutChunks: dataWithoutChunks.choices[0]?.message?.content || "",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error searching:", error.message);
    }
  };

  return (
    <div className={styles.fullscreenDiv}>
      <h1 className={styles.header1}>SQuAD Testbase</h1>
      <p className={styles.paragraph}>Ask me</p>

      <SearchComponent
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        questions={questions}
      />
      <div className={styles.textChunksContainer}>
        {/* Conditional Rendering */}
        {isLoading ? (
          // Display "Loading..." when isLoading is true
          <div className={styles.loadingIndicator}>Loading...</div>
        ) : openAIResponse ? (
          // Display OpenAI response and text chunks when openAIResponse is not empty
          <div>
            <div className={styles.responseContainer}>
              <div className={styles.responseBox}>
                <h3>Answer with context</h3>

                {openAIResponse.withChunks}
              </div>
              <div className={styles.responseBox}>
                <h3>Answer without context</h3>
                {openAIResponse.withoutChunks}
              </div>
            </div>

            <div className={styles.textChunksContainer}>
              {textChunks.map((chunk, index) => (
                <div key={index} className={styles.textChunkCard}>
                  <h3>Context Chunk {`${index + 1}`}</h3>

                  <a
                    href={`${chunk.url}`}
                    className={styles.textChunkImage}
                    dangerouslySetInnerHTML={{ __html: chunk.url }}
                  ></a>
                  <div
                    className={styles.textChunkImage}
                    dangerouslySetInnerHTML={{ __html: chunk.context }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        ) : // Display nothing when openAIResponse is empty and isLoading is false
        null}
      </div>
    </div>
  );
}

export default Myknowledgebase;
