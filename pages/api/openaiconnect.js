// pages/api/openai.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { prompt } = await req.body;
    // console.log("this is the prompt that gets send to open api: ", prompt, "end of prompt");

    try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-16k",
                messages: [
                    { role: "assistant", content: prompt },
                    { role: "user", content: req.body.searchQuery },
                ],
                max_tokens: 5000,
                temperature: 0,
            })
        });

        const data = await openAIResponse.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from OpenAI' });
    }
}
