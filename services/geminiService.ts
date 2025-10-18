import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExamType, Question } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "The question text. For diagram-based questions, this MUST start with '[DIAGRAM] A detailed description of the diagram for an image generation AI. --- The actual question text.'",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of 4 possible answers.",
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: "The 0-based index of the correct answer in the 'options' array.",
      },
      section: {
        type: Type.STRING,
        description: "The subject section of the question: 'Physics', 'Chemistry', or 'Mathematics'.",
      },
    },
    required: ['question', 'options', 'correctAnswerIndex', 'section'],
  },
};

export const generateQuizQuestions = async (examType: ExamType): Promise<Question[]> => {
  const prompt = `
    You are an expert academic content creator specializing in Indian engineering entrance exams. 
    Generate a mock test for the ${examType} exam, strictly following these rules:
    1.  The test must have exactly 30 unique multiple-choice questions in total.
    2.  The questions must be divided into three sections: 'Physics', 'Chemistry', and 'Mathematics'.
    3.  Each section must contain exactly 10 questions.
    4.  In each section, include 2-3 questions that require a diagram or graph. For these, you MUST format the question string exactly as follows: "[DIAGRAM] A clear, detailed, self-contained description of the diagram for an AI image generator. --- The actual question text that refers to the diagram."
        Example: "[DIAGRAM] A simple DC circuit with a 12V battery connected in series to a 2 Ohm resistor and a 4 Ohm resistor. --- What is the total current flowing through the circuit?"
    5.  For any mathematical or chemical expressions, use standard keyboard notation for fractions (e.g., '1/2'), exponents (e.g., 'x^2' or '10^-3'), and subscripts (e.g., 'H_2O').
    6.  Ensure questions are distinct, not repetitive, and reflect the difficulty and style of the actual ${examType} exam.
    7.  For each question, provide four distinct options and the 0-based index of the correct answer.
    8.  Return the entire quiz as a single JSON array, with questions ordered by section (all Physics, then all Chemistry, then all Mathematics).
  `;

  try {
    // Stage 1: Generate the text content of the quiz
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.9,
      },
    });

    const jsonText = textResponse.text.trim();
    let questions = JSON.parse(jsonText) as Question[];
    
    // Validate the response structure
    if (!Array.isArray(questions) || questions.length === 0 || !questions[0].question || !questions[0].section) {
        throw new Error("Invalid JSON structure received from API.");
    }

    // Stage 2: Identify diagram-based questions and generate images for them
    const imageGenerationPromises = questions.map(async (q) => {
        if (q.question.startsWith('[DIAGRAM]')) {
            try {
                const parts = q.question.split(' --- ');
                if (parts.length < 2) throw new Error("Invalid diagram format");

                const diagramDescription = parts[0].replace('[DIAGRAM]', '').trim();
                q.question = parts.slice(1).join(' --- ').trim(); // Re-assign the clean question text

                const imageResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: `Generate a simple, clear, black and white line drawing suitable for a physics, chemistry, or mathematics exam question. The drawing should illustrate: ${diagramDescription}` }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                
                for (const part of imageResponse.candidates[0].content.parts) {
                    if (part.inlineData) {
                        q.diagramBase64 = part.inlineData.data;
                        break;
                    }
                }
            } catch (err) {
                console.error(`Failed to generate diagram for question: "${q.question}"`, err);
                // Fail gracefully, the question will just not have an image.
            }
        }
    });

    await Promise.all(imageGenerationPromises);
    
    // Sort to ensure questions are in the correct section order for the UI logic
    const sectionOrder = { 'Physics': 1, 'Chemistry': 2, 'Mathematics': 3 };
    questions.sort((a, b) => (sectionOrder[a.section] || 99) - (sectionOrder[b.section] || 99));

    return questions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz. The AI might be busy or an error occurred. Please try again.");
  }
};