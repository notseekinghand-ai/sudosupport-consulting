// functions/api/hubs/route.ts
// Lead Routing Logic - Connects worldwide users to local hubs

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as {
    inquiry_type: string;
    description: string;
  };

  // 1. Get User Location from Cloudflare Headers
  const country = (context.request as any).cf?.country || 'Unknown';
  const region = (context.request as any).cf?.regionCode || 'Unknown';
  const locationCode = `${country}-${region}`;

  try {
    // 2. Find nearest active Hub
    // Strategy: Search for matching region, fallback to matching country, fallback to global
    let hub = await context.env.DB.prepare(`
      SELECT * FROM hubs 
      WHERE region_code = ? AND status = 'active'
    `).bind(locationCode).first() as any;

    if (!hub) {
      hub = await context.env.DB.prepare(`
        SELECT * FROM hubs 
        WHERE region_code LIKE ? AND status = 'active'
      `).bind(`${country}-%`).first() as any;
    }

    // 3. Log the Lead
    const leadId = crypto.randomUUID().slice(0, 8);
    await context.env.DB.prepare(`
      INSERT INTO lead_routing (id, user_location, target_hub_id, inquiry_type, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `).bind(leadId, locationCode, hub?.id || 'GLOBAL', body.inquiry_type, new Date().toISOString()).run();

    return Response.json({
      success: true,
      lead_id: leadId,
      assigned_hub: hub?.name || 'SudoSupport Global',
      location_detected: locationCode,
      message: hub 
        ? `You have been routed to your local ${hub.name} Hub.` 
        : "No local hub found for your region. You have been routed to the Global Sovereign Hub."
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
