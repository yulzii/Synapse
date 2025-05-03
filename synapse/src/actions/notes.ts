"use server";

import { getUser } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { prisma } from "@/db/prisma";
import {
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from "@google/generative-ai";
import { gemini } from "@/gemini";

export const updateNoteAction = async (noteId: string, content: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to update a note");

    await prisma.note.update({
      where: { id: noteId },
      data: { content },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const createNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to create a note");

    await prisma.note.create({
      data: {
        title: "Untitled Note",
        id: noteId,
        authorId: user.id,
        content: "",
      },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to delete a note");

    await prisma.note.delete({
      where: {
        id: noteId,
        authorId: user.id,
      },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const askAIAboutNotesAction = async (
  newQuestions: string[],
  responses: string[],
) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in to ask AI questions");

  if (!gemini)
    return "Google Generative AI client is not initialized. Please check your API key.";

  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { content: true, createdAt: true, updatedAt: true },
  });

  if (notes.length === 0) {
    return "You don't have any notes yet.";
  }
  // Optional: Configure generation parameters (adjust as needed)
  const generationConfig = {
    temperature: 0.7, // Controls randomness (0=deterministic, 1=max random)
    topK: 1, // Consider the top K most likely words
    topP: 1, // Consider words comprising the top P probability mass
    maxOutputTokens: 2048, // Maximum length of the response
  };

  // Optional: Configure safety settings (adjust thresholds as needed)
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const formattedNotes = notes
    .map((note) =>
      `
      Text: ${note.content || "Note is empty."}
      Created at: ${note.createdAt.toISOString()}
      Last updated: ${note.updatedAt.toISOString()}
      `.trim(),
    )
    .join("\n---\n");

  const systemInstruction = {
    role: "system",
    parts: [
      {
        text: `
           You are a helpful assistant that answers questions about a user's notes and any general information.
        if the user refers to their notes when asking their question, look through the user's notes provided below and incorporate it into your answer. You are allowed to give general information past their notes when requested.
        Make sure that your answers are not too verbose and you speak succinctly.

        --- START CRITICAL FORMATTING RULES ---
        Your response should be clean, valid HTML suitable for direct insertion into a web page using dangerouslySetInnerHTML.
        - Use appropriate semantic HTML tags: <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, <br>.
        - **CODE BLOCKS:** When providing code examples, you MUST wrap them in a <pre> tag containing a <code> tag. Like this: <pre><code>print('Hello World!')</code></pre>.
        - **CODE ESCAPING:** Ensure any special HTML characters (like <, >, &) *within* the code inside the <code> tag are properly escaped (e.g., use < for <, > for >, & for &).
        - Do NOT wrap the entire response in a single <p> tag unless it genuinely is a single paragraph.
        - Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags. Only provide the content fragment unless the user requests a code block.
        - Ensure the code is safe to send to this program and display to the user such that it is free of any malware or viruses.
        - Do NOT use inline styles, CSS classes, or JavaScript.
        - **ABSOLUTELY DO NOT** wrap your response in Markdown code fences like \`\`\`html or \`\`\` unless Markdown is requested by the user.
        - The entire string you output MUST start with an HTML tag (like <p>) and end with a closing HTML tag (like </p>). There should be NO other text before the first tag or after the last tag.
        --- END CRITICAL FORMATTING RULES ---

        Example of a **GOOD** response format:
        <p>This is the first paragraph.</p><ul><li>List item 1</li><li>List item 2</li></ul>

        Example of a **BAD** response format (because of the fences):
        \`\`\`html
        <p>This is bad.</p>
        \`\`\`

        This response will be rendered in JSX like this, verify your output is valid:
        <div dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />

        --- START USER NOTES ---
        ${formattedNotes}
        --- END USER NOTES ---
        `,
      },
    ],
  };

  const geminiHistory: Content[] = []; // Type Content[] from the SDK
  for (let i = 0; i < responses.length; i++) {
    // Add previous user question
    geminiHistory.push({ role: "user", parts: [{ text: newQuestions[i] }] });
    // Add previous assistant/model response
    if (responses.length > i) {
      geminiHistory.push({ role: "model", parts: [{ text: responses[i] }] });
    }
  }

  // 3. Get the latest user question (the one we need an answer for)
  const latestQuestion = newQuestions[newQuestions.length - 1];
  if (!latestQuestion) {
    // Should not happen if the function is called correctly, but good to check
    return "<p>No question provided to ask the AI.</p>";
  }

  // 4. Select the Gemini Model
  const model = gemini.getGenerativeModel({
    model: "gemini-1.5-flash-latest", // Recommended free, fast model
    systemInstruction, // Pass the system instructions
    generationConfig,
    safetySettings,
  });
  // return completion.choices[0].message.content || "A problem has occurred";
  try {
    // 5. Start a chat session OR generate content directly
    // Using generateContent is simpler if you send the full history each time
    const result = await model.generateContent({
      // Pass the conversation history leading up to the latest question
      contents: [
        ...geminiHistory,
        { role: "user", parts: [{ text: latestQuestion }] },
      ],
    });

    // 6. Extract the response text
    const aiResponse = result.response;
    const text = aiResponse.text(); // Gets the combined text from response parts

    // Provide a fallback if the response is empty for some reason
    return (
      text ||
      "<p>The AI assistant didn't provide a response. Please try again.</p>"
    );
  } catch (error) {
    return "A problem has occurred";
  }
};
