export default (req, res) => {
    // Prüfe, ob die Anfrage ein POST-Request ist
    if (req.method !== "POST") {
      return res.status(405).end();  // Method Not Allowed
    }
  
    // Prüfe, ob req.body und req.body.query vorhanden sind
    if (!req.body || !req.body.query) {
      return res.status(400).send('Bad Request: JSON fehlt oder ist unvollständig');
    }
  
    // Logge den Wert von req.body.query
    console.log("Empfangene Query:", req.body.query);
  
    // Sende eine erfolgreiche Antwort zurück
    res.status(200).json({ success: true, message: "Query erfolgreich empfangen" });
  };
  