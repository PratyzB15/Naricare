import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { z } from "genkit"; // if using schemas

// Create the Genkit instance
const ai = genkit({
  plugins: [googleAI()],
});

// Define a simple flow
export const helloFlow = ai.defineFlow(
  {
    name: "helloFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await ai.generate({
      model: googleAI.model("gemini-2.5-flash"),
      prompt: `Hello, ${input}!`,
    });
    return text;
  }
);

// Call the flow
(async () => {
  const result = await helloFlow("Juhi");
  console.log(result); // should display the AI-generated greeting
})();
