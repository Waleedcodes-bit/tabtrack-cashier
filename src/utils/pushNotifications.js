import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export async function subscribeToPush(userId) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { user_id: userId, subscription: subscription.toJSON() },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Failed to save subscription:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('subscribeToPush error:', err);
    return false;
  }
}

export async function sendPushNotification({ userId, title, body, url }) {
  try {
    // Get the current session token to authenticate the request
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session — cannot send push');
      return false;
    }

    const response = await fetch('/.netlify/functions/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ user_id: userId, title, body, url }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Push send failed:', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('sendPushNotification error:', err);
    return false;
  }
}

export async function unsubscribeFromPush(userId) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    return true;
  } catch (err) {
    console.error('unsubscribeFromPush error:', err);
    return false;
  }
}
