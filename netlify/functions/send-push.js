const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
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

  try {
    const { user_id, title, body, url } = JSON.parse(event.body);

    if (!user_id || !title || !body) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    // Get the user's push subscription
    const { data: subscriptionData, error } = await supabase
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
      // 410 = subscription expired or unsubscribed — delete it so we don't retry
      if (pushErr.statusCode === 410) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user_id);
        return { statusCode: 410, body: 'Subscription expired and removed' };
      }
      throw pushErr; // rethrow anything else (e.g. 401 bad VAPID keys)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Push error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};