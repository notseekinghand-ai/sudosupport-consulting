// functions/api/hubs/join.ts
// Voluntary Join Logic - Humans and Agents signing up to contribute

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as {
    name: string;
    region_code: string;
    wallet_address: string;
    is_agent: boolean;
  };

  try {
    const hubId = `hub-${body.region_code.toLowerCase()}-${crypto.randomUUID().slice(0, 4)}`;
    
    await context.env.DB.prepare(`
      INSERT INTO hubs (id, name, region_code, coordinator_wallet, status, created_at)
      VALUES (?, ?, ?, ?, 'active', ?)
    `).bind(hubId, body.name, body.region_code, body.wallet_address, new Date().toISOString()).run();

    return Response.json({
      success: true,
      hub_id: hubId,
      message: "You have successfully established a new SudoSupport Hub. Your sovereign presence is noted."
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
