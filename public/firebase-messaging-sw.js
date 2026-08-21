importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDSvzjWkcM9LzOBQPNsm82oREAZbYqSCLU",
    authDomain: "lucky-charm-sweep.firebaseapp.com",
    projectId: "lucky-charm-sweep",
    storageBucket: "lucky-charm-sweep.firebasestorage.app",
    messagingSenderId: "988486859123",
    appId: "1:988486859123:web:2bcdc2ed6679383d362d06",
    measurementId: "G-Q7WS348D6D"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 🔔 Handle background messages
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/logo192.png',
        data: {
            url: payload.data?.url || 'https://www.luckycharmsweep.com'
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🖱️ Handle notification click
self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.');
    event.notification.close();

    const targetUrl = event.notification.data?.url || 'https://www.luckycharmsweep.com';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
