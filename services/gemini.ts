
import { GoogleGenAI, Type } from "@google/genai";
import { PLCLogicResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generatePLCLogic(prompt: string): Promise<PLCLogicResponse> {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    You are an expert M221 PLC Programmer. Generate logic strictly following Schneider Electric .smbp XML standards.
    
    CRITICAL RULES:
    1. Every logic segment must be a 'Rung'.
    2. Rungs must contain both 'LadderElements' (for visual grid) and 'InstructionLines' (for IL code).
    3. Grid is 11 columns (0-10). Coils MUST be at column 10.
    4. Use ElementTypes: NormalContact, NegatedContact, Coil, Line, Timer.
    5. Connection types: 'Left, Right', 'Left', 'Down, Left, Right', 'Up, Left', 'None'.
    6. Always include a 'System Ready' rung (Pattern 1) as the first rung.
    7. Use addressing like %I0.0, %Q0.0, %M0, %TM0.
    
    Output must be a JSON that can be transformed into a valid .smbp XML.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          variables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                address: { type: Type.STRING },
                symbol: { type: Type.STRING },
                type: { type: Type.STRING },
                comment: { type: Type.STRING }
              },
              required: ["address", "symbol", "type"]
            }
          },
          rungs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                comment: { type: Type.STRING },
                elements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: "NormalContact, Coil, Line, etc." },
                      descriptor: { type: Type.STRING },
                      symbol: { type: Type.STRING },
                      row: { type: Type.INTEGER },
                      column: { type: Type.INTEGER },
                      connection: { type: Type.STRING }
                    }
                  }
                },
                instructionLines: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          },
          instructionList: { type: Type.STRING },
          ladderLogicSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["description", "variables", "rungs", "instructionList", "ladderLogicSteps"]
      }
    }
  });

  return JSON.parse(response.text.trim());
}
