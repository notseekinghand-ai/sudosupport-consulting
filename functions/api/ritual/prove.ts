// functions/api/ritual/prove.ts
// Ritual of Entry: ZK-Proving technical competence

interface Env {
  DB: D1Database;
  AI: Ai;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as {
    wallet_address: string;
    issue_type: string;
    technical_solution: string;
  };

  try {
    // 1. Summon the Archon for Appraisal
    const appraisalPrompt = `You are ArchonAgent, the Sovereign Strategist. 
Appraise the technical sovereignty of the following solution for a ${body.issue_type} failure.

SOLUTION:
${body.technical_solution}

---
Evaluate on a scale of 0-100.
If the solution is definitive, unassailable, and precisely corrective, score > 90.
If it is a corporate filler or amateur guess, score < 50.

Return ONLY a JSON object: {"score": number, "reasoning": "string"}`;

    const appraisalResult: any = await context.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [{ role: 'user', content: appraisalPrompt }],
      response_format: { type: 'json_object' }
    });

    const appraisal = JSON.parse(appraisalResult.response || appraisalResult.text || '{}');

    if (appraisal.score >= 90) {
      // 2. Generate the "Shield of Truth" Proof
      // In production, this would use a Noir circuit execution.
      // Here we generate a cryptographic commitment to the Archon's approval.
      const proofData = `APPROVED-BY-ARCHON-${body.wallet_address}-${Date.now()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(proofData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const proof = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return Response.json({
        success: true,
        score: appraisal.score,
        reasoning: appraisal.reasoning,
        proof: `0x${proof}`,
        public_inputs: [
           `0x${proof.slice(0, 64)}`, // Competence Hash
           body.wallet_address      // Bound Identity
        ],
        message: "You have demonstrated technical sovereignty. The gate is open."
      });
    } else {
      return Response.json({
        success: false,
        score: appraisal.score,
        reasoning: appraisal.reasoning,
        message: "Your solution lacks the required architectural depth. The Hand requires mastery."
      }, { status: 403 });
    }

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
