
import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse, Content, Part, FunctionResponsePart } from "@google/genai";
import { toolMapping } from './toolService';
import { type Message, type ToolResultContent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

const tools: FunctionDeclaration[] = [
    {
        name: "search_products",
        description: "Search for products in the catalog.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "The search query, e.g., 'running shoes', 'headphones'." },
                category: { type: Type.STRING, description: "Optional product category to filter by." },
                max_results: { type: Type.INTEGER, description: "Maximum number of results to return." }
            },
            required: ["query"]
        }
    },
    {
        name: "get_order_status",
        description: "Retrieve the status of a customer's order.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                order_id: { type: Type.STRING, description: "The ID of the order to check." }
            },
            required: ["order_id"]
        }
    },
    {
        name: "add_to_cart",
        description: "Add a product to the customer's shopping cart.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                product_id: { type: Type.STRING, description: "The ID of the product to add." },
                quantity: { type: Type.INTEGER, description: "The number of items to add. Defaults to 1." }
            },
            required: ["product_id"]
        }
    },
    {
        name: "get_cart_contents",
        description: "Get the contents of the customer's shopping cart.",
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: "apply_discount_code",
        description: "Apply a discount code to the customer's cart.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The discount code to apply." }
            },
            required: ["code"]
        }
    },
     {
        name: "get_product_recommendations",
        description: "Get personalized product recommendations for the customer.",
        parameters: { type: Type.OBJECT, properties: {} }
    },
];

const convertMessagesToHistory = (messages: Message[]): Content[] => {
    return messages.map(msg => {
        let parts: Part[] = [];
        if (msg.text) {
            parts.push({ text: msg.text });
        }
        if (msg.toolCalls) {
            parts.push(...msg.toolCalls.map(tc => ({ functionCall: tc })));
        }
        if (msg.toolResult) {
             const functionResponse: FunctionResponsePart = {
                functionResponse: {
                    name: msg.toolResult.name,
                    response: {
                        name: msg.toolResult.name,
                        content: msg.toolResult.result
                    }
                }
            };
            parts.push(functionResponse);
        }

        return { role: msg.role, parts };
    }).filter(content => content.parts.length > 0);
};

export async function runChat(history: Message[], newMessage: string): Promise<Message[]> {
    const newMessages: Message[] = [];
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: newMessage };
    newMessages.push(userMessage);
    
    const fullHistory = [...history, userMessage];
    const contents = convertMessagesToHistory(fullHistory);

    try {
        let response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents,
            tools: [{ functionDeclarations: tools }],
            systemInstruction: "You are ShopBot, a helpful and friendly AI shopping assistant. You can search products, check orders, manage carts, apply discounts and suggest items. Be concise and helpful."
        });

        while(response.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
            const functionCalls = response.candidates[0].content.parts.map(p => p.functionCall).filter(Boolean);

            if (!functionCalls || functionCalls.length === 0) break;
            
            newMessages.push({
                id: Date.now().toString(),
                role: 'model',
                toolCalls: functionCalls
            });

            const toolResponseParts: FunctionResponsePart[] = [];
            const toolResultMessages: Message[] = [];
            
            for (const call of functionCalls) {
                if(call.name in toolMapping){
                    const toolFn = toolMapping[call.name];
                    const result = await toolFn(call.args);

                    toolResponseParts.push({
                        functionResponse: {
                            name: call.name,
                            response: { name: call.name, content: result }
                        }
                    });

                    toolResultMessages.push({
                        id: `${Date.now()}-${call.name}`,
                        role: 'tool',
                        toolResult: { name: call.name, result: result as ToolResultContent }
                    });
                }
            }

            newMessages.push(...toolResultMessages);

            const intermediateHistory = [...fullHistory, ...newMessages];

            response = await ai.models.generateContent({
                model,
                contents: convertMessagesToHistory(intermediateHistory),
                tools: [{ functionDeclarations: tools }]
            });
        }
        
        if (response.text) {
            newMessages.push({
                id: Date.now().toString(),
                role: 'model',
                text: response.text
            });
        }
        
        return newMessages;

    } catch (error) {
        console.error("Error running chat with Gemini:", error);
        return [{
            id: Date.now().toString(),
            role: 'model',
            text: "I'm sorry, I encountered an error. Please try again."
        }];
    }
}
