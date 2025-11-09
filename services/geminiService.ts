import { GoogleGenAI, Type } from "@google/genai";
import { ResearchResult, Source } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models;


// Helper to fetch and cache prompts to avoid module resolution issues.
const fetchPrompt = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch prompt from ${url}`);
    }
    return response.text();
};

// Fetch prompts when the module is loaded. They are cached as promises.
const prompts = {
    inquiryEngine: fetchPrompt('./prompts/inquiryEngine.txt'),
    plan: fetchPrompt('./prompts/generateResearchPlan.txt'),
    researchStep: fetchPrompt('./prompts/executeResearchStep.txt'),
    knowledgeReport: fetchPrompt('./prompts/generatePersonaKnowledgeBase.txt'),
};

export const authorResearchDirective = async (subject: string, notes: string): Promise<string> => {
    const inquiryEnginePromptTemplate = await prompts.inquiryEngine;
    const prompt = inquiryEnginePromptTemplate
        .replace('{{subject}}', subject)
        .replace('{{notes}}', notes || 'None');
    
    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.5,
            },
        });
        
        const rawText = response.text.trim();
        // Extract content from the first markdown code block
        const match = /```(?:\w*\n)?([\s\S]*?)```/.exec(rawText);
        return match ? match[1].trim() : rawText;

    } catch(e) {
        console.error("Error authoring research directive:", e);
        throw new Error("Failed to author a custom research directive. The model may have had an issue with the provided subject or notes.");
    }
};


export const generateResearchPlan = async (authoredDirective: string): Promise<string[]> => {
    const planPromptTemplate = await prompts.plan;
    const prompt = planPromptTemplate.replace('{{authoredDirective}}', authoredDirective);
    
    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText);
        return plan;
    } catch(e) {
        console.error("Error generating research plan:", e);
        throw new Error("Failed to generate a research plan. The model might be unable to process this topic.");
    }
};

export const executeResearchStep = async (mainTopic: string, subTopic: string, authoredDirective: string): Promise<{ summary: string; sources: Source[] }> => {
    const researchStepPromptTemplate = await prompts.researchStep;
    const prompt = researchStepPromptTemplate
        .replace('{{authoredDirective}}', authoredDirective)
        .replace('{{mainTopic}}', mainTopic)
        .replace('{{subTopic}}', subTopic);

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const summary = response.text.trim();

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: Source[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || '',
            }))
            .filter((source: Source) => source.uri && source.title);

        return { summary, sources };
    } catch (e) {
        console.error(`Error executing research for sub-topic "${subTopic}":`, e);
        throw new Error(`Failed to conduct research for "${subTopic}". The API may be temporarily unavailable.`);
    }
};

export const generateKnowledgeReport = async (topic: string, researchData: ResearchResult[]): Promise<string> => {
    const knowledgeReportPromptTemplate = await prompts.knowledgeReport;
    const formattedResearchData = researchData.map(result => `
### Task: ${result.task}
**Summary:**
${result.summary}
**Sources:**
${result.sources.map(s => `- [${s.title}](${s.uri})`).join('\n')}
    `).join('\n---\n');

    const prompt = knowledgeReportPromptTemplate
        .replace('{{topic}}', topic)
        .replace('{{researchData}}', formattedResearchData);

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.2,
                thinkingConfig: {
                    thinkingBudget: 16384,
                }
            },
        });

        return response.text.trim();
    } catch (e) {
        console.error("Error generating knowledge report:", e);
        throw new Error("Failed to synthesize the final knowledge report. The model encountered an issue during generation.");
    }
};