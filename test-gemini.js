const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    // Note: The SDK might not have a public listModels on the genAI object directly 
    // depending on version, but we can try to probe.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
    console.log("Testando gemini-1.5-flash v1...");
    const result = await model.generateContent("Oi");
    console.log("Sucesso com gemini-1.5-flash v1!");
  } catch (err) {
    console.error("Erro com v1:", err.message);
    
    try {
      console.log("Testando gemini-pro...");
      const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
      const resultPro = await modelPro.generateContent("Oi");
      console.log("Sucesso com gemini-pro!");
    } catch (errPro) {
      console.error("Erro com gemini-pro:", errPro.message);
    }
  }
}

listModels();
