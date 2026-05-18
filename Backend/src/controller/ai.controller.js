import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from '../utils/httpError.js';
import wrapasync from '../utils/errorHandeler.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateSuggestion = wrapasync(async (req, res) => {
    const { url, field } = req.body;

    if (!url) {
        throw new AppError('Destination URL is required to generate suggestions.', 400);
    }

    if (!process.env.GEMINI_API_KEY) {
        throw new AppError('AI services are not configured on the server.', 500);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let prompt = `Analyze this URL or the concept it represents: ${url}\n\n`;
    
    if (field === 'alias') {
        prompt += 'Generate a short, catchy, and URL-friendly slug/alias (max 15 characters, lowercase, no spaces, only hyphens if needed). Respond ONLY with the alias text, nothing else.';
    } else if (field === 'tags') {
        prompt += 'Generate 2 to 3 relevant tags/categories separated by commas (e.g. tech, tool, ai). Respond ONLY with the comma-separated text, nothing else.';
    } else if (field === 'comments') {
        prompt += 'Generate a short, helpful internal comment explaining what this link might be used for (max 1 sentence). Respond ONLY with the comment text, nothing else.';
    } else if (field === 'title') {
        prompt += 'Generate a concise, engaging meta title for this link (max 50 characters). Respond ONLY with the title text, nothing else.';
    } else if (field === 'description') {
        prompt += 'Generate a short, descriptive meta summary for this link (1 sentence). Respond ONLY with the description text, nothing else.';
    } else {
        throw new AppError('Invalid field for generation.', 400);
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/^["']|["']$/g, '');

        res.status(200).json({ suggestion: text });
    } catch (error) {
        console.error('AI Generation Error:', error);
        if (error.message && error.message.includes('429')) {
            throw new AppError('AI rate limit exceeded (max 5 requests per minute). Please wait a few seconds and try again.', 429);
        }
        throw new AppError(error.message || 'Failed to generate AI suggestion.', 500);
    }
});
