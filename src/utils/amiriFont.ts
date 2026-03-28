// Load a font that supports both Arabic and Latin characters
// Using Noto Naskh Arabic which has good coverage for both scripts

export const loadNotoArabicFont = async (): Promise<string> => {
  // Noto Naskh Arabic - supports Arabic + Latin characters
  const fontUrl = 'https://fonts.gstatic.com/s/notonaskharabic/v33/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc5krK0z9_Mnuw.ttf';
  
  try {
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('Failed to load Noto Naskh Arabic font:', error);
    throw error;
  }
};

// Fallback: Load Amiri font which also supports both scripts
export const loadAmiriFont = async (): Promise<string> => {
  const fontUrl = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf';
  
  try {
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('Failed to load Amiri font:', error);
    throw error;
  }
};

