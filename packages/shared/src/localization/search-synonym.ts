const SYNONYMS: Record<string, string> = {
  "colour": "color",
  "kurta": "kurti",
  "television": "tv",
  "air conditioner": "ac",
  "mobiles": "mobile",
  "phones": "phone",
  "devices": "device",
};

const TYPOS: Record<string, string> = {
  "mobail": "mobile",
  "fone": "phone",
  "phn": "phone",
  "telivision": "tv",
};

const HINGLISH: Record<string, string> = {
  "lal": "red",
  "sasta": "cheap",
  "badiya": "best",
  "ghar": "home",
  "kapde": "clothing",
  "juta": "shoes",
  "sundar": "beautiful",
  "nila": "blue",
  "peela": "yellow",
};

export function preProcessSearchQuery(query: string): string {
  if (!query) return "";

  const words = query.toLowerCase().trim().split(/\s+/);
  const processedWords = words.map(word => {
    // 1. Check Typos
    if (TYPOS[word]) return TYPOS[word];
    
    // 2. Check Hinglish
    if (HINGLISH[word]) return HINGLISH[word];
    
    // 3. Check Synonyms
    if (SYNONYMS[word]) return SYNONYMS[word];

    // 4. Normalize plural endings simple rules
    if (word.endsWith("s") && word.length > 3) {
      const singular = word.slice(0, -1);
      if (SYNONYMS[singular]) return SYNONYMS[singular];
      return singular;
    }

    return word;
  });

  return processedWords.join(" ");
}
