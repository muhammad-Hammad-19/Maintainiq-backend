// services/aiProvider.service.js

import ai from "../lib/gemini.js";

const ALLOWED_CATEGORIES = [
  "Electrical",
  "Mechanical",
  "Structural",
  "Plumbing",
  "Safety-Critical",
  "Other",
];

export const classifyReport = async (reportText, assetContext) => {
  try {
    const prompt = `
You are a maintenance issue classification assistant. Analyze the fault report and return ONLY a valid JSON object — no extra text, no markdown, no explanation.

Asset Information:
- Name: ${assetContext?.name || "Unknown"}
- Category: ${assetContext?.category || "Unknown"}
- Critical Asset: ${assetContext?.isCritical ? "Yes" : "No"}

Fault Report:
"${reportText}"

Return JSON in EXACTLY this structure:
{
  "category": one of [${ALLOWED_CATEGORIES.join(", ")}],
  "priority": a number from 1 (low) to 5 (critical),
  "summary": a short, clear, technician-facing summary of the issue (max 2 sentences),
  "suggestedCause": a brief probable root cause (max 1 sentence)
}
`;

    const result = await ai.generateContent(prompt);
    const responseText = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error("AI returned invalid JSON format");
    }

    // Fallback/safety defaults — agar AI koi field miss kar de
    return {
      category: ALLOWED_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : "Other",
      priority:
        typeof parsed.priority === "number" &&
        parsed.priority >= 1 &&
        parsed.priority <= 5
          ? parsed.priority
          : 3,
      summary: parsed.summary || "No summary generated.",
      suggestedCause: parsed.suggestedCause || "Cause could not be determined.",
    };
  } catch (error) {
    // Agar AI call hi fail ho jaye, error throw karo — BullMQ retry karega
    throw new Error(`AI classification failed: ${error.message}`);
  }
};
