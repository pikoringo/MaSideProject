self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
    let payload = {};
    try {
        payload = event.data?.json() || {};
    } catch {
        payload = { title: "MaBestie", body: event.data?.text() || "You have an update." };
    }

    const title = payload.title || "MaBestie";
    const options = {
        body: payload.body || "You have an update.",
        icon: "images/MabestieApp.png",
        badge: "images/MabestieApp.png",
        tag: payload.tag || "mabestie-update",
        data: { url: payload.url || "./" }
    };

    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        const visibleWindows = windows.filter((client) => client.visibilityState === "visible");
        if (visibleWindows.length) {
            visibleWindows.forEach((client) => client.postMessage({
                type: "MABESTIE_NOTIFICATION",
                title,
                body: options.body,
                url: options.data.url
            }));
            return;
        }
        await self.registration.showNotification(title, options);
    })());
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data?.url || "./", self.location.origin).href;
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
        if (existing) {
            await existing.focus();
            if ("navigate" in existing) await existing.navigate(targetUrl);
            return;
        }
        await self.clients.openWindow(targetUrl);
    })());
});
