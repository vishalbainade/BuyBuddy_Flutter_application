const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const Conversation = require('../models/conversationModel');
require('dotenv').config();

const llm = new ChatOpenAI({
  temperature: 0.7,
  model: 'gpt-3.5-turbo',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const fashionPrompt = PromptTemplate.fromTemplate(`
You are BuyBuddy, a smart and friendly AI fashion expert who helps people shop for clothes, get styling tips, and answer fashion-related questions.

Your job is to respond ONLY to questions related to:
- Clothes
- Fashion
- Styling
- Outfit suggestions
- Product choices on the site
- Occasion-based attire

If a user asks something unrelated (e.g., technology, weather, politics), politely say:
"I'm BuyBuddy, your fashion shopping assistant. I specialize in clothing and style-related advice. Please ask me something about fashion!"

Here is the conversation so far:
{chatHistory}

User just asked:
{userInput}

BuyBuddy's Response:
`);

const chain = RunnableSequence.from([fashionPrompt, llm]);

const getChatHistory = async (req, res) => {
  try {
    const conversations = await Conversation.findByUserId(req.user.userId);
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chat history', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  try {
    // Save user message
    await Conversation.create(userId, 'user', message);

    // Get previous conversation history
    const previousConvo = await Conversation.findByUserId(userId);
    const chatHistory = previousConvo.map(conv => `${conv.role === 'user' ? 'User' : 'BuyBuddy'}: ${conv.message}`).join('\n');

    // Call LangChain
    const response = await chain.invoke({ chatHistory, userInput: message });
    const botResponse = response.content;

    // Save bot response
    await Conversation.create(userId, 'AI', botResponse);

    res.status(200).json({ role: 'AI', message: botResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error processing message', error: error.message });
  }
};

module.exports = { getChatHistory, sendMessage };