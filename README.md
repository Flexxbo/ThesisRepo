Installationsanleitung


Voraussetzung:  
- Eine aktuelle Version von Node muss installiert sein. 
Überprüfung:
- Öffnen Sie das Terminal und geben Sie `node -v` ein, um die installierte Node-Version zu überprüfen.
- Wenn Node nicht vorhanden ist oder die Version veraltet ist, laden Sie die neueste Version herunter und installieren Sie sie.

Schritt 1: Projekt und Pakete installieren
- Öffnen Sie das Terminal.
- Geben Sie `npm install` ein und drücken Sie die Eingabetaste.
- Dieser Befehl installiert das Projekt und alle zugehörigen Abhängigkeiten (Dependencies).

Schritt 2: Erstellen Sie eine `.env.local` Datei mit folgendem Inhalt:
OPENAI_API_KEY=
NEXT_PUBLIC_OPENAI_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=https://nejqatvgkdftwetxjsdb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
WEBHOOK_SECRET=

Schritt 3: OpenAI Key einfügen
- Fügen Sie Ihren persönlichen OpenAI API-Key in die  .env.local Datei ein, indem Sie ihn nach schreiben.

Schritt 4: Supabase Datenbank anlegen 
1. Starten Sie ein neues Supabase-Projekt.
2. Öffnen Sie den SQL-Manager in Supabase.
3. Führen Sie die Befehle aus der Datei `sql_Supabase.sql` nacheinander aus.

Schritt 5: 
- Fügen Sie die benötigten Umgebungsvariablen für die Datenbank in die .env.local Datei ein
Schritt 6: Umwandeln der SQuAD Testdaten
Führen sie im Ordner /scripts/ das embedding_squad.js aus. 
Befehl: node embedding_squad.js
Dieses wandelt die Testdaten in Embeddings um und fügt diese in die Datenbank ein. 
Achtung!  Hierbei wird die kostenpflichtige OpenAI Embeddings API genutzt. Setzen Sie sich sicherheitshalber ein maximales Budget in ihrem OpenAI Konto. Der Betrag für die Umwandlung in Embeddings sollte allerdings unter 10cent kosten.
Vergewissern Sie sich im Supabase Dashboard, ob alle Einträge in die Tabelle eingetragen wurden. 

Schritt 7: Starten des Programms
Starten sie die Applikation mit dem Befehl: npm run dev
Sie sollten die Applikation nun unter http://localhost:3000 aufrufen und nutzen können. 

Schritt 8: Frage stellen
Wählen Sie im Interface SQuAD Testbase aus. 
Sie können nun eine Frage stellen. 
Achtung! Jede Anfrage an die OpenAI API ist kostenpflichtig. 

Schritt 9: Beenden der Verbindung
Schließen sie die App im Terminal mit Strg + C

