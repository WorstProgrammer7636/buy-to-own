import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const getGPTResponse = async (prompt: string): Promise<string> => {
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a fun and helpful finance buddy who reacts to people buying things and investing.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err: any) {
    console.error('GPT error:', err.message);
    return 'Oops, I had a brain freeze. Try again!';
  }
};
