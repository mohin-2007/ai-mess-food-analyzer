const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function (req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("====================================");
    console.log(
      "ENV KEYS:",
      Object.keys(process.env).filter(key =>
        key.includes("GEMINI")
      )
    );
    console.log("API Key Loaded:", !!apiKey);
    console.log("Key starts with:", apiKey?.substring(0,5));
    console.log("====================================");

    if (!apiKey) {
      return res.status(500).json({
        error:
          "Gemini API key is not configured. Please check GEMINI_API_KEY."
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const { image } = body;

    if (!image) {
      return res.status(400).json({
        error: "Image is required."
      });
    }

    let base64Data = image;
    let mimeType = "image/jpeg";

    if (image.startsWith("data:")) {
      const parts = image.split(";base64,");

      if (parts.length === 2) {
        mimeType = parts[0].replace("data:", "");
        base64Data = parts[1];
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });
    const prompt = `
You are an expert nutritionist.

Analyze the uploaded food image.

Identify all visible food items.

Estimate:

- Calories
- Protein
- Carbohydrates
- Fat

Provide a health score out of 100.

Return ONLY valid JSON.

{
  "foodItems": [],
  "calories": "",
  "protein": "",
  "carbohydrates": "",
  "fat": "",
  "healthScore": "",
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };

    const result = await model.generateContent([
      prompt,
      imagePart
    ]);

    const responseText = result.response.text();

    console.log("===== GEMINI RESPONSE =====");
    console.log(responseText);
    console.log("===========================");

    if (!responseText) {
      throw new Error("Empty response from Gemini.");
    }

    let cleanedText = responseText.trim();

    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
    }

    let parsedData;

    try {
      parsedData = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error(
          "Could not find valid JSON in Gemini response."
        );
      }

      parsedData = JSON.parse(jsonMatch[0]);
    }

    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("====================================");
    console.error("Gemini serverless function error:");
    console.error(error);
    console.error("====================================");

    return res.status(500).json({
      error:
        error?.message ||
        "An unexpected error occurred during analysis."
    });
  }
};