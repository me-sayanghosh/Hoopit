const key = process.env.GEMINI_API_KEY || 'AIzaSyDHJA6B5ORxukql8_gE2T1ChZThSVqBNZw';

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(data.models.map(m => m.name).join('\n'));
  } catch (e) {
    console.error(e);
  }
}
listModels();
