import { openai } from '../config/openai.js';

export async function generateConsultNote(transcript, template, doctorName, patientName) {
  const prompt = `
You are a medical scribe tasked with creating a comprehensive consultation note from a doctor-patient conversation transcript.

DOCTOR: ${doctorName}
PATIENT: ${patientName}

TRANSCRIPT:
${transcript}

DOCTOR'S TEMPLATE:
${template}

INSTRUCTIONS:
1. **Role Differentiation**: Carefully analyze the transcript to distinguish between:
   - DOCTOR: Medical professional conducting the consultation
   - PATIENT: Person receiving medical care
   - Use context clues like medical terminology, questions asked, and professional language to identify speakers

2. **Content Analysis**: Extract and organize:
   - Chief complaint and presenting symptoms
   - Patient's medical history and current medications
   - Physical examination findings
   - Diagnosis and assessment
   - Treatment plan and recommendations
   - Follow-up instructions

3. **Medical Accuracy**: 
   - Use proper medical terminology
   - Maintain clinical precision
   - Include relevant vital signs if mentioned
   - Document any procedures or interventions discussed

4. **Template Adherence**:
   - Follow the doctor's specific template structure
   - Use the exact format and sections provided
   - Maintain professional medical documentation standards

5. **Completeness**:
   - Ensure all relevant information from the conversation is captured
   - Include patient demographics if mentioned
   - Document any referrals or specialist consultations discussed
   - Note any patient education provided

6. **Clarity and Organization**:
   - Write in clear, professional medical language
   - Organize information logically
   - Use bullet points or structured format as appropriate
   - Ensure the note is comprehensive yet concise

Please generate a complete consultation note that accurately reflects the medical consultation while following the doctor's template format.
`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for more consistent medical documentation
      max_tokens: 2000
    });
    
    console.log('AI consultation note generated successfully');
    return res.choices[0].message.content;
  } catch (error) {
    console.error('Error generating consultation note:', error);
    throw new Error('Failed to generate consultation note');
  }
}
