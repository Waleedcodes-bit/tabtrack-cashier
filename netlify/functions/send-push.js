const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

// Service-role client — bypasses RLS, used only server-side
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

webpush.setVapidDetails(
  'mailto:hello@navoq.co.za',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // ── Auth check ─────────────────────────────────────────────────────────────
  // Caller must send their Supabase session token as: Authorization: Bearer <token>
  const authHeader = event.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // Verify the token is a valid Supabase session (not expired, not forged)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // ── Rate limit: max 1 push per user per 60 seconds ─────────────────────────
  const { data: subData } = await supabaseAdmin
    .from('push_subscriptions')
    .select('subscription, last_push_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (subData?.last_push_at) {
    const secondsSinceLast = (Date.now() - new Date(subData.last_push_at).getTime()) / 1000;
    if (secondsSinceLast < 60) {
      return { statusCode: 429, body: 'Too Many Requests' };
    }
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let parsed;
  try {
    parsed = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { user_id, title, body, url } = parsed;

  if (!user_id || !title || !body) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  // Caller can only send pushes to themselves OR to their own customers
  // (owner sending to a customer they own is allowed; cross-owner is not)
  const isSelf = user_id === user.id;

  // Check caller is an owner and user_id belongs to one of their customers
  let isOwnedCustomer = false;
  if (!isSelf) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'owner') {
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('auth_user_id', user_id)
        .eq('owner_id', user.id)
        .maybeSingle();
      isOwnedCustomer = !!customer;
    }
  }

  if (!isSelf && !isOwnedCustomer) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  // ── Get target push subscription ───────────────────────────────────────────
  const { data: subscriptionData, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', user_id)
    .single();

  if (error || !subscriptionData) {
    return { statusCode: 404, body: 'No subscription found for user' };
  }

  const payload = JSON.stringify({
    title,
    body,
    url: url || '/',
    icon: '/logo192.png',
    badge: '/logo192.png',
  });

  try {
    await webpush.sendNotification(subscriptionData.subscription, payload);
  } catch (pushErr) {
    if (pushErr.statusCode === 410) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user_id);
      return { statusCode: 410, body: 'Subscription expired and removed' };
    }
    throw pushErr;
  }

  // Update last_push_at for rate limiting
  await supabaseAdmin
    .from('push_subscriptions')
    .update({ last_push_at: new Date().toISOString() })
    .eq('user_id', user_id);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
