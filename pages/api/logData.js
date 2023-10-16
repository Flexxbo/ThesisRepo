import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { timestamp, searchQuery, answerWithChunks, answerWithoutChunks } = req.body;

      const logEntry = {
        timestamp,
        searchQuery,
        answerWithChunks,
        answerWithoutChunks,
      };

      const logFilePath = path.resolve('./logs.json');

      let logData = [];
      try {
        const existingLog = fs.readFileSync(logFilePath, 'utf-8');
        logData = JSON.parse(existingLog);
      } catch (error) {
        console.error('Error reading log file:', error);
      }

      logData.push(logEntry);

      fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error logging data:', error);
      res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ status: 'error', error: 'Method Not Allowed' });
  }
}
