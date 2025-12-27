const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log("STARTING DEBUG-AI TEST");

const API_KEY = 'AIzaSyCLgZg0MDTDSVWvCv05hSEP5RQzf6D8EOs';
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
    const models = ["gemini-1.5-flash", "gemini-pro"];
    
    for (const modelName of models) {
        console.log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`SUCCESS with ${modelName}! Response:`, (await result.response).text());
            return;
        } catch (error) {
            console.error(`FAILED ${modelName}:`, error.message);
        }
    }
    console.log("ALL MODELS FAILED.");
}

test();
