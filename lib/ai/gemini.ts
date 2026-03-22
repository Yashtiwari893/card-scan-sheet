import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractBusinessCardDetails(imageBuffer: Buffer, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a specialist in OCR and business card parsing. 
Extract the following information from this business card image in JSON format:
{
  "name": "string",
  "company": "string",
  "jobTitle": "string",
  "email": "string",
  "phone": "string",
  "website": "string",
  "address": "string",
  "linkedin": "string",
  "rawText": "full text extracted"
}
If a field is not found, leave it as an empty string. Return ONLY the JSON object.`;

  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType,
      },
    },
    prompt,
  ]);

  const response = await result.response;
  const text = response.text();
  
  try {
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Parse Error:", text);
    throw new Error("Failed to parse AI response. Make sure the output is pure JSON.");
  }
}
