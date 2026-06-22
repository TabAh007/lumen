// Analysis service — the differentiator. Takes normalized posts and asks an LLM
// to extract interests and pro/anti stances, each with quoted evidence and a
// confidence score. Phase 3 wires the real LLM call + strict JSON schema.

async function analyze({ handle, posts }) {
  // TODO (Phase 3): send posts to the LLM, enforce the evidence+confidence schema.
  return {
    handle,
    stub: true,
    summary: '',
    interests: [
      // { topic, strength }
    ],
    stances: [
      // { claim, direction: 'pro'|'anti', confidence: 0-1, evidence: [{ quote, postUrl }] }
    ],
  };
}

module.exports = { analyze };
