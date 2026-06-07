import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

// Convert VAPID public key to Uint8Array (required by browser API)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Register service worker and subscribe to push
export async function subscribeToPush(userId) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    // If not subscribed, create new subscription
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Save subscription to Supabase
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

    console.log('Push subscription saved successfully');
    return true;
  } catch (err) {
    console.error('subscribeToPush error:', err);
    return false;
  }
}

// Send a push notification to a specific user via Netlify function
export async function sendPushNotification({ userId, title, body, url }) {
  try {
    const response = await fetch('/.netlify/functions/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

// Unsubscribe from push notifications
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