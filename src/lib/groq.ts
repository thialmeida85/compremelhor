/**
 * Integração com Groq para geração de conteúdo otimizado
 * Utiliza a IA Groq para criar descrições persuasivas de produtos
 */

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Gera uma descrição otimizada para um produto usando Groq
 * Transforma descrições técnicas em textos de vendas persuasivos
 */
export async function generateOptimizedDescription(
  productTitle: string,
  technicalDescription: string,
  brand?: string
): Promise<string> {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.warn("GROQ_API_KEY não configurada. Retornando descrição original.");
      return technicalDescription;
    }

    const prompt = `Você é um especialista em copywriting para e-commerce. Transforme a seguinte descrição técnica de produto em um texto persuasivo e focado em benefícios para o cliente. 

Produto: ${productTitle}
${brand ? `Marca: ${brand}` : ""}
Descrição Técnica: ${technicalDescription}

Requisitos:
- Máximo 200 palavras
- Foco em benefícios, não em características
- Tom amigável e conversacional
- Inclua um call-to-action implícito
- Use emojis relevantes (máximo 2)
- Português europeu

Responda apenas com o texto otimizado, sem explicações adicionais.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error("Erro ao chamar Groq API:", response.statusText);
      return technicalDescription;
    }

    const data = (await response.json()) as GroqResponse;
    return data.choices[0]?.message?.content || technicalDescription;
  } catch (error) {
    console.error("Erro ao gerar descrição com Groq:", error);
    return technicalDescription;
  }
}

/**
 * Gera um resumo curto (short description) para um produto
 */
export async function generateShortDescription(
  productTitle: string,
  technicalDescription: string
): Promise<string> {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return technicalDescription.substring(0, 100);
    }

    const prompt = `Crie um resumo muito curto (máximo 50 palavras) para este produto:
Título: ${productTitle}
Descrição: ${technicalDescription}

Responda apenas com o resumo, sem explicações.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      return technicalDescription.substring(0, 100);
    }

    const data = (await response.json()) as GroqResponse;
    return data.choices[0]?.message?.content || technicalDescription.substring(0, 100);
  } catch (error) {
    console.error("Erro ao gerar short description com Groq:", error);
    return technicalDescription.substring(0, 100);
  }
}

/**
 * Gera uma comparação entre dois produtos
 */
export async function generateProductComparison(
  product1Title: string,
  product1Description: string,
  product1Price: number,
  product2Title: string,
  product2Description: string,
  product2Price: number
): Promise<string> {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return "Comparação não disponível no momento.";
    }

    const prompt = `Compare estes dois produtos e recomende qual oferece melhor custo-benefício:

Produto 1: ${product1Title}
Descrição: ${product1Description}
Preço: R$ ${product1Price.toFixed(2)}

Produto 2: ${product2Title}
Descrição: ${product2Description}
Preço: R$ ${product2Price.toFixed(2)}

Forneça uma análise breve (máximo 150 palavras) destacando:
- Principais diferenças
- Qual oferece melhor valor
- Para qual tipo de utilizador cada um é mais adequado

Português europeu. Responda apenas com a análise.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      return "Comparação não disponível no momento.";
    }

    const data = (await response.json()) as GroqResponse;
    return data.choices[0]?.message?.content || "Comparação não disponível no momento.";
  } catch (error) {
    console.error("Erro ao gerar comparação com Groq:", error);
    return "Comparação não disponível no momento.";
  }
}
