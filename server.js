const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve index.html at the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const dictionary = {
  a: ['apple', 'application', 'amazing', 'automobile', 'architect', 'android', 'azure', 'awesome', 'algorithm', 'artificial', 'analogy', 'academic', 'achievement', 'apartment', 'adventure'],
  b: ['banana', 'beautiful', 'business', 'basketball', 'bicycle', 'battery', 'butterfly', 'building', 'birthday', 'browser', 'brilliant', 'benefit', 'balance', 'background', 'brother'],
  c: ['computer', 'creative', 'coffee', 'chocolate', 'customer', 'container', 'country', 'conversation', 'cinema', 'celebration', 'challenge', 'captain', 'character', 'collection', 'content'],
  d: ['developer', 'digital', 'document', 'database', 'dictionary', 'desktop', 'destination', 'discount', 'delivery', 'diamond', 'decision', 'daughter', 'director', 'discover', 'difference'],
  e: ['example', 'elephant', 'engineer', 'evolution', 'evening', 'education', 'equipment', 'exercise', 'experience', 'employee', 'experiment', 'electricity', 'environment', 'essential', 'emergency'],
  f: ['function', 'football', 'framework', 'festival', 'fantastic', 'favorite', 'factory', 'furniture', 'foundation', 'feature', 'fraction', 'freedom', 'friendship', 'framework', 'family'],
  g: ['google', 'guitar', 'government', 'graphic', 'generation', 'gravity', 'gesture', 'galaxy', 'gathering', 'gradient', 'generous', 'guidance', 'gallery', 'guarantee', 'global'],
  h: ['hello', 'happy', 'highway', 'hospital', 'holiday', 'husband', 'history', 'heritage', 'hardware', 'highlight', 'harmony', 'humanity', 'healthy', 'horizon', 'humidity'],
  i: ['internet', 'information', 'important', 'innovation', 'intelligence', 'identity', 'interface', 'imagine', 'interest', 'invitation', 'impressive', 'influence', 'investment', 'initiative', 'industry'],
  j: ['javascript', 'journey', 'justice', 'jacket', 'jungle', 'jewelry', 'journal', 'junction', 'january', 'journalist', 'judgment', 'jubilee', 'juvenile', 'jealous', 'joyful'],
  k: ['keyboard', 'knowledge', 'kitchen', 'kingdom', 'kangaroo', 'kindness', 'keeper', 'kettle', 'karate', 'knitting', 'kilogram', 'keynote', 'kinetic', 'kaleidoscope', 'kiosk'],
  l: ['language', 'laptop', 'learning', 'library', 'lightning', 'landscape', 'liberty', 'lesson', 'lifestyle', 'location', 'leadership', 'literature', 'lifetime', 'laboratory', 'legendary'],
  m: ['machine', 'mobile', 'mountain', 'message', 'memory', 'midnight', 'magazine', 'musician', 'marketing', 'material', 'medicine', 'motivation', 'management', 'momentum', 'magnificent'],
  n: ['network', 'natural', 'navigate', 'notebook', 'nature', 'nutrition', 'neighbor', 'narrative', 'northern', 'nomination', 'national', 'negotiation', 'notification', 'neutral', 'november'],
  o: ['online', 'orange', 'operation', 'objective', 'original', 'official', 'orchestra', 'optimize', 'organize', 'ordinary', 'opinion', 'obstacle', 'occasion', 'otherwise', 'outcome'],
  p: ['product', 'program', 'perfect', 'package', 'password', 'parallel', 'pattern', 'platform', 'positive', 'potential', 'possible', 'psychology', 'production', 'professional', 'performance'],
  q: ['question', 'quality', 'quantity', 'quantum', 'quarter', 'quotation', 'qualified', 'quickest', 'quietly', 'quintessential', 'quizzical', 'quandary', 'quorum', 'quarrel', 'quadratic'],
  r: ['react', 'research', 'rainbow', 'restaurant', 'revolution', 'realistic', 'reasonable', 'relative', 'relationship', 'reference', 'responsible', 'reputation', 'remarkable', 'recognize', 'reflection'],
  s: ['software', 'solution', 'student', 'security', 'strategy', 'scientist', 'specific', 'standard', 'selection', 'signature', 'situation', 'structure', 'sensation', 'significant', 'satisfaction'],
  t: ['technology', 'telephone', 'tutorial', 'tomorrow', 'teacher', 'tradition', 'template', 'together', 'thousand', 'technique', 'tropical', 'treatment', 'transfer', 'treasure', 'transformation'],
  u: ['universe', 'ultimate', 'understand', 'umbrella', 'university', 'unexpected', 'unlimited', 'useful', 'unusual', 'universal', 'unfortunate', 'underwear', 'undertake', 'upgrade', 'upwards'],
  v: ['virtual', 'vehicle', 'version', 'valuable', 'vocabulary', 'vertical', 'verified', 'violation', 'visitor', 'volunteer', 'velocity', 'variable', 'victory', 'venture', 'variation'],
  w: ['website', 'welcome', 'windows', 'weather', 'wonderful', 'warrior', 'wireless', 'workshop', 'weekend', 'waterfall', 'weakness', 'watching', 'whatever', 'whispering', 'wavelength'],
  x: ['xylophone', 'xenon', 'xerox', 'xavier', 'xenial', 'xanadu', 'xebec', 'xenophobia', 'xylem', 'xeric', 'xenograft', 'xanthic', 'xenolith', 'xerography', 'xiphoid'],
  y: ['yellow', 'yourself', 'youtube', 'yesterday', 'yearbook', 'yogurt', 'younger', 'yearning', 'yielding', 'youthful', 'yearlong', 'yorkshire', 'yardstick', 'yawning', 'youngster'],
  z: ['zombie', 'zealous', 'zigzag', 'zoology', 'zenith', 'zodiac', 'zephyr', 'zucchini', 'zero', 'zestful', 'zeppelin', 'zealot', 'zooming', 'zipper', 'zircon']
};

// More efficient suggestion function
function getSuggestions(prefix) {
  if (!prefix || prefix.length === 0) return [];
  
  // Convert to lowercase for case-insensitive matching
  prefix = prefix.toLowerCase();
  const firstChar = prefix.charAt(0);
  
  // If we have words starting with this character, filter them
  if (dictionary[firstChar]) {
    return dictionary[firstChar].filter(word => 
      word.startsWith(prefix)
    ).slice(0, 10); // Limit to 10 suggestions for better performance
  }
  
  return [];
}

app.post('/autocomplete', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  // Get the last word from the text
  const words = text.split(/\s+/);
  const prefix = words[words.length - 1];
  
  const suggestions = getSuggestions(prefix);
  res.json({ suggestions });
});

// Alternative endpoint that fetches from an external dictionary API
app.post('/autocomplete-api', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  try {
    // Get the last word from the text
    const words = text.split(/\s+/);
    const prefix = words[words.length - 1];
    
    // Use local dictionary first
    const localSuggestions = getSuggestions(prefix);
    
    // If we have local suggestions, return them
    if (localSuggestions.length > 0) {
      return res.json({ suggestions: localSuggestions });
    }
    
    // Otherwise, use the DataMuse API as a fallback
    const response = await fetch(`https://api.datamuse.com/sug?s=${prefix}`);
    const data = await response.json();
    
    // Extract word from each result
    const suggestions = data.map(item => item.word).slice(0, 10);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching from API:', error);
    
    // Fallback to local dictionary if API fails
    const words = text.split(/\s+/);
    const prefix = words[words.length - 1];
    const suggestions = getSuggestions(prefix);
    
    res.json({ suggestions });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});
