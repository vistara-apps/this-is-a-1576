// In a real application, this would integrate with OpenAI or another sentiment analysis API
// For demo purposes, we'll use a simple approach with fallback to mock analysis

export async function analyzeSentiment(text) {
  // Check if we can use OpenAI API
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    try {
      const { OpenAI } = await import('openai')
      
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
      })

      const response = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis expert. Analyze the sentiment of the given text and respond with only one word: 'positive', 'negative', or 'neutral'."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 1,
        temperature: 0
      })

      const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim()
      return ['positive', 'negative', 'neutral'].includes(sentiment) ? sentiment : 'neutral'
    } catch (error) {
      console.warn('OpenAI API failed, using fallback sentiment analysis:', error)
    }
  }

  // Fallback: Simple keyword-based sentiment analysis
  return performSimpleSentimentAnalysis(text)
}

function performSimpleSentimentAnalysis(text) {
  const positiveWords = [
    'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'positive', 
    'love', 'like', 'best', 'awesome', 'brilliant', 'perfect', 'outstanding',
    'impressive', 'remarkable', 'breakthrough', 'success', 'innovation'
  ]
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'negative', 
    'disappointing', 'failure', 'problem', 'issue', 'concern', 'worry',
    'decline', 'drop', 'crisis', 'threat', 'risk', 'danger'
  ]

  const words = text.toLowerCase().split(/\W+/)
  
  let positiveScore = 0
  let negativeScore = 0
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++
    if (negativeWords.includes(word)) negativeScore++
  })
  
  if (positiveScore > negativeScore) return 'positive'
  if (negativeScore > positiveScore) return 'negative'
  return 'neutral'
}