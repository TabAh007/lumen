// Analysis service — the differentiator. Takes normalized posts and asks Claude
// to extract interests and pro/anti stances, each with quoted evidence and a
// confidence score. Uses structured outputs so the schema is enforced by the
// API, not by fragile parsing. Always returns evidence + confidence, never a
// bare verdict (a threat-intel requirement).

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

let _client;
function client() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
    // Extra retries so transient overloads (429/529) are handled silently.
    _client = new Anthropic({ maxRetries: 5 });
  }
  return _client;
}

// Enforced response shape. Every stance carries evidence quotes + a confidence
// score; the model is instructed to ground each claim in the actual posts.
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: {
      type: 'string',
      description: 'A neutral 2-3 sentence overview of who this account appears to be and what they post about.',
    },
    interests: {
      type: 'array',
      description: 'Topic areas the person engages with, strongest first.',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          topic: { type: 'string' },
          strength: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['topic', 'strength'],
      },
    },
    stances: {
      type: 'array',
      description: 'Pro/anti positions inferred from the content. Omit anything not supported by an actual quote.',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          claim: { type: 'string', description: 'The subject, e.g. "climate action", "a political party".' },
          direction: { type: 'string', enum: ['pro', 'anti', 'mixed', 'unclear'] },
          confidence: {
            type: 'number',
            description: 'Confidence from 0 to 1 that this stance is real and correctly classified.',
          },
          reasoning: { type: 'string', description: 'Brief justification, noting any sarcasm/quote/reshare caveats.' },
          evidence: {
            type: 'array',
            description: 'Direct quotes from the posts that support this stance.',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                quote: { type: 'string', description: 'A verbatim excerpt from a post.' },
                postUrl: { type: 'string', description: 'URL of the source post, or empty string if unknown.' },
              },
              required: ['quote', 'postUrl'],
            },
          },
        },
        required: ['claim', 'direction', 'confidence', 'reasoning', 'evidence'],
      },
    },
  },
  required: ['summary', 'interests', 'stances'],
};

const SYSTEM = `You are an OSINT analyst supporting a security/threat-intelligence team. You analyze ONLY the public social media content provided and infer the account holder's interests and pro/anti stances.

Rules:
- Ground every stance in at least one verbatim quote from the supplied posts. If you cannot quote it, do not claim it.
- Stance detection is error-prone: sarcasm, quoted/reshared content, and jokes can invert apparent meaning. When the signal is weak or ambiguous, use direction "unclear" or "mixed" and a low confidence.
- Confidence reflects how sure you are the stance is real AND correctly classified (1 = explicit and repeated; 0.3 = a single ambiguous hint).
- Be neutral and factual. Do not speculate about protected characteristics, and do not invent context beyond the posts.
- Prefer fewer, well-supported findings over many weak ones.`;

function buildUserContent({ handle, profile, posts }) {
  const lines = [];
  lines.push(`Handle: ${handle}`);
  if (profile) {
    if (profile.displayName) lines.push(`Display name: ${profile.displayName}`);
    if (profile.bio) lines.push(`Bio: ${profile.bio}`);
  }
  lines.push('', 'Posts:');
  posts.forEach((p, i) => {
    const text = (p.text || '').trim();
    if (!text) return;
    lines.push(`[${i + 1}] (${p.url || 'no-url'}) ${text}`);
  });
  lines.push('', 'Analyze the interests and pro/anti stances of this account based only on the content above.');
  return lines.join('\n');
}

async function analyze({ handle, profile = null, posts }) {
  if (!posts || posts.length === 0) {
    return { handle, summary: '', interests: [], stances: [], note: 'No content to analyze.' };
  }

  let response;
  try {
    response = await client().messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      thinking: { type: 'adaptive' },
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: buildUserContent({ handle, profile, posts }) }],
    });
  } catch (err) {
    // Map transient/over-capacity errors to a clean, user-friendly message.
    if (err.status === 529 || err.status === 429 || err.status >= 500) {
      const e = new Error('The analysis engine is busy right now. Please try again in a few seconds.');
      e.status = 503;
      throw e;
    }
    throw err;
  }

  if (response.stop_reason === 'refusal') {
    const err = new Error('Analysis was declined by the safety system for this content.');
    err.status = 422;
    throw err;
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  const parsed = JSON.parse(textBlock.text);
  return { handle, model: MODEL, ...parsed };
}

module.exports = { analyze };
