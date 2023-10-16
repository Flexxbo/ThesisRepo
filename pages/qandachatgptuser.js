import { useState, useEffect } from "react";
import styles from "./qandachatgptuser.module.css";
import SearchComponent from "@/components/SearchComponent";
import questionlist from "../questions";

function Qandachatgptuser() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions([
      "Was ist HeyGen?",
      "Was ist Midjourney?",
      "Was ist Stable Diffusion?",
      "Welche Künstliche Intelligenz kann Bilder erstellen?",
      "Welches Tool kann Bilder erstellen?",
      "Gibt es eine KI mit der man Bilder direkt im Bild bearbeiten kann?",
      "Was ist besser, Stable Diffusion oder Midjourney?",
    ]);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [textChunks, setTextChunks] = useState([]);
  const [openAIResponse, setOpenAIResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //const [questions, setQuestions] = useState([]);

  const handleSearch = async () => {
    // Zustandsvariablen zurücksetzen
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
        body: JSON.stringify({ query: searchQuery, database: "qanda_search" }),
      });

      const data = await response.json();
      console.log("data", data);
      // Aktualisieren des Zustands mit den neuen Text-Chunks
      setTextChunks(data.data);

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Definition der generatePrompt-Funktion
      /*  const generatePrompt = async (newTextChunks) => {
        let prompt = `
        1. Lies die Anfrage des Kunden [User Query].
        2. Lies die Textbausteine [Text Chunks].
        3. Gibt es irgendwelche Indikatoren, die bei der Beantwortung der Frage helfen, auch wenn sie nicht explizit erwähnt sind?
        4a. Wenn die Antwort enthalten ist. Geben Sie die Antwort aus.
        4b. Wenn die Antwort unvollständig ist, dann schreibe genau: "Die Antwort ist unvollständig." und stoppen.
        4c. Wenn die Antwort nicht enthalten ist, antworten Sie mit "Sorry, I don't know".
        User Query: ${searchQuery}
        \nText Chunks:\n`;
        newTextChunks.forEach((chunk, index) => {
          prompt += `Chunk ${index}: ${index + 1}. ${chunk.content}\n`; //Achtung hier content nicht context
        });
        return prompt;
      };*/
      // Definition der generatePrompt-Funktion
      const generatePrompt = async (newTextChunks) => {
        let prompt = `
        1. Lies die Anfrage des Kunden [User Query].
        2. Lies die Textbausteine [Text Chunks].
        3. Gibt es irgendwelche Indikatoren, die bei der Beantwortung der Frage helfen, auch wenn sie nicht explizit erwähnt sind?
        4a. Wenn die Antwort enthalten ist. Geben Sie die Antwort aus.
        4b. Wenn die Antwort unvollständig ist, dann schreibe genau: "Die Antwort ist unvollständig." und stoppen.
        4c. Wenn die Antwort nicht enthalten ist, antworten Sie mit "Sorry, I don't know".
        5. Versuche nach Möglichkeit mehrere Textchunks zu einer Antwort zu kombinieren. So könnten beispielsweise 2 Tools miteineander kombiniert werden, um eine Aufgabe zu lösen.
        User Query: ${searchQuery}
        \nText Chunks:\n`;
        newTextChunks.forEach((chunk, index) => {
          prompt += `Chunk ${index}: ${index + 1}. ${chunk.content}\n`; //Achtung hier content nicht context
        });
        return prompt;
      };

      // Übergeben der neuen Text-Chunks direkt an generatePrompt
      const promptWithChunks = await generatePrompt(data.data);
      console.log("promptWithChunks", promptWithChunks);

      // Restlicher Code zum Senden des Prompts an OpenAI
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
      <h1 className={styles.header1}>
        Q & A With GPT And Custom Knowledgebase
      </h1>
      <p className={styles.paragraph}>
        Select a question below, since I am still learning
      </p>

      <SearchComponent
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        questions={questions}
      />
      <div className={styles.textChunksContainer}>
        {/* Conditional Rendering */}
        {isLoading ? (
          // Display "Loading..."
          <div className={styles.loadingIndicator}>Loading...</div>
        ) : openAIResponse ? (
          // Display OpenAI response wenn nicht leer
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
                    dangerouslySetInnerHTML={{ __html: chunk.content }} //Achtung hier content nicht context
                  ></div>
                </div>
              ))}
            </div>
          </div>
        ) : // Display nothing wenn leer und isLoading ist false
        null}
      </div>
    </div>
  );
}

export default Qandachatgptuser;
