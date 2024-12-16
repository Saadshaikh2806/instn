const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Gemini API configuration
const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

// Routes
app.get('/', (req, res) => {
  res.send('Real-Time Website Builder API is running');
});

app.post('/api/generate-website', async (req, res) => {
  console.log('Received generate-website request:', req.body);
  const { description } = req.body;

  if (!description) {
    console.log('Bad request: Description is missing');
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    console.log('Calling Gemini API...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig, safetySettings });

    const prompt = `Create original HTML and CSS code for a website based on this description: ${description}. 
    The HTML and CSS should be unique and not copied from existing sources. 
    Return the HTML and CSS separately, enclosed in code blocks. Be creative and avoid direct recitation of existing content.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini API response:', text);

    // Extract HTML and CSS from the response
    const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
    const cssMatch = text.match(/```css\n([\s\S]*?)\n```/);

    const htmlCode = htmlMatch ? htmlMatch[1] : '';
    const cssCode = cssMatch ? cssMatch[1] : '';

    if (!htmlCode || !cssCode) {
      throw new Error('Failed to extract HTML or CSS from the generated content');
    }

    res.json({ html: htmlCode, css: cssCode });
  } catch (error) {
    console.error('Error generating website:', error);
    res.status(500).json({ error: 'Failed to generate website', details: error.message });
  }
});

app.post('/api/modify-website', async (req, res) => {
  console.log('Received modify-website request:', req.body);
  const { modificationDescription, currentHtml, currentCss } = req.body;

  if (!modificationDescription || !currentHtml || !currentCss) {
    console.log('Bad request: Missing required fields');
    return res.status(400).json({ error: 'Modification description, current HTML, and current CSS are required' });
  }

  try {
    console.log('Calling Gemini API for modification...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig, safetySettings });

    const prompt = `
Modify the following HTML and CSS based on this description: ${modificationDescription}

Current HTML:
\`\`\`html
${currentHtml}
\`\`\`

Current CSS:
\`\`\`css
${currentCss}
\`\`\`

Please update the HTML and CSS based on the modification description. Return the complete updated HTML and CSS separately, enclosed in code blocks. Be creative and avoid direct recitation of existing content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini API response:', text);

    // Extract updated HTML and CSS from the response
    const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
    const cssMatch = text.match(/```css\n([\s\S]*?)\n```/);

    const htmlCode = htmlMatch ? htmlMatch[1] : '';
    const cssCode = cssMatch ? cssMatch[1] : '';

    if (!htmlCode || !cssCode) {
      throw new Error('Failed to extract updated HTML or CSS from the generated content');
    }

    res.json({ html: htmlCode, css: cssCode });
  } catch (error) {
    console.error('Error modifying website:', error);
    res.status(500).json({ error: 'Failed to modify website', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;