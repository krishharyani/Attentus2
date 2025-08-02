import { openai } from '../config/openai.js';

export async function generateConsultNote(transcript, template) {
  const prompt = `
You are a medical scribe. Given this transcript of a doctor–patient consultation:
###
${transcript}
###
And this doctor’s note template:
###
${template}
###
Write a complete consultation note following the template exactly.
`;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });
  return res.choices[0].message.content;
}
