const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const analyzeTextTone = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: Text must be a non-empty string");
  }

  try {
    const analysisPrompt = `
      Analyze the following text and determine if it constitutes harassment.
      Rules:
      - General curse words are allowed
      - Personal attacks or targeting individuals is harassment
      - Threats or intimidation is harassment
      
      Text to analyze: "${text}"
      
      Return only a JSON object with:
      {
        "isHarassment": true/false,
        "reason": "brief explanation",
        "severity": "low/medium/high"
      }
    `.trim();

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const responseText = response.text().trim();

    // Clean up the response to ensure valid JSON
    const jsonStr = responseText.replace(/^```json\s*|\s*```$/g, "").trim();

    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON Parse Error:", jsonStr);
      throw new Error("Invalid JSON response from AI");
    }
  } catch (error) {
    console.error("Tone Analysis Error:", error.message);
    throw error;
  }
};

const isHarmfullContent = async (content) => {
  try {
    const analysis = await analyzeTextTone(content);
    return analysis;
  } catch (error) {
    // Log the error
    console.error(`Content moderation API error: ${error.message}`);

    if (error.message.includes("503") || error.message.includes("overloaded")) {
      // Fallback behavior when API is overloaded
      return {
        isHarassment: false,
        reason:
          "Content moderation service temporarily unavailable, content allowed with warning",
      };
    }

    // Default fallback
    return {
      isHarassment: false,
      reason: "Content moderation failed, proceeding with caution",
    };
  }
};

module.exports = isHarmfullContent;
