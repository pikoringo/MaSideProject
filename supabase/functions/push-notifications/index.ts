import { createClient } from "npm:@supabase/supabase-js@2.76.1";
import * as webpush from "jsr:@negrel/webpush@0.5.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-cron-secret"
};

type Preferences = {
    status_updates?: boolean;
    urgent_errands?: boolean;
    assigned_errands?: boolean;
    due_reminders?: boolean;
    recurring_reminders?: boolean;
    errand_completed?: boolean;
    list_additions?: boolean;
};

type PushPayload = {
    title: string;
    body: string;
    tag: string;
    url: string;
};

function response(body: unknown, status = 200) {
    return Response.json(body, { status, headers: corsHeaders });
}

function base64Url(bytes: Uint8Array) {
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function createApplicationServer() {
    const exportedKeys = JSON.parse(Deno.env.get("VAPID_KEYS") || "null");
    const contactInformation = Deno.env.get("VAPID_CONTACT");
    if (!exportedKeys || !contactInformation) throw new Error("VAPID secrets are not configured");
    const vapidKeys = await webpush.importVapidKeys(exportedKeys);
    return webpush.ApplicationServer.new({ contactInformation, vapidKeys });
}

// Database types are not generated for this buildless project, so the admin client
// remains untyped at this boundary and response rows are narrowed by the queries below.
// deno-lint-ignore no-explicit-any
async function sendToMember(admin: any, userId: string, payload: PushPayload) {
    const { data: subscriptions, error } = await admin
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth_secret")
        .eq("user_id", userId);
    if (error) throw error;
    if (!subscriptions?.length) return 0;

    const server = await createApplicationServer();
    let delivered = 0;
    for (const subscription of subscriptions) {
        try {
            const subscriber = server.subscribe({
                endpoint: subscription.endpoint,
                keys: { p256dh: subscription.p256dh, auth: subscription.auth_secret }
            });
            await subscriber.pushTextMessage(JSON.stringify(payload), {
                ttl: 86400,
                urgency: webpush.Urgency.Normal,
                topic: payload.tag.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 32)
            });
            delivered += 1;
        } catch (error) {
            if (error instanceof webpush.PushMessageError && error.isGone()) {
                await admin.from("push_subscriptions").delete().eq("id", subscription.id);
            } else {
                console.error("Push delivery failed", error);
            }
        }
    }
    return delivered;
}

// deno-lint-ignore no-explicit-any
async function sendDueReminders(admin: any) {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
    const { data: errands, error: errandsError } = await admin
        .from("errands")
        .select("id, title, recurrence")
        .eq("completed", false)
        .eq("due_date", today);
    if (errandsError) throw errandsError;

    const { data: members, error: membersError } = await admin.from("app_members").select("user_id");
    if (membersError) throw membersError;
    let delivered = 0;

    for (const member of members || []) {
        const { data: preferences } = await admin
            .from("notification_preferences")
            .select("due_reminders, recurring_reminders")
            .eq("user_id", member.user_id)
            .maybeSingle();

        for (const errand of errands || []) {
            const enabled = errand.recurrence ? preferences?.recurring_reminders !== false : preferences?.due_reminders !== false;
            if (!enabled) continue;
            const eventKey = `due:${errand.id}:${today}`;
            const { data: claimed } = await admin
                .from("notification_deliveries")
                .upsert({ user_id: member.user_id, event_key: eventKey }, { onConflict: "user_id,event_key", ignoreDuplicates: true })
                .select("id")
                .maybeSingle();
            if (!claimed) continue;
            delivered += await sendToMember(admin, member.user_id, {
                title: errand.recurrence ? "Recurring errand due" : "Errand due today",
                body: errand.title,
                tag: eventKey,
                url: "./?screen=errands"
            });
        }
    }
    return delivered;
}

export default {
    async fetch(request: Request) {
        if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
        if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (!supabaseUrl || !serviceRoleKey || !anonKey) return response({ error: "Server configuration is incomplete" }, 503);
        const admin = createClient(supabaseUrl, serviceRoleKey);
        const input = await request.json().catch(() => ({}));

        if (input.action === "send_due_reminders") {
            if (!Deno.env.get("CRON_SECRET") || request.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
                return response({ error: "Unauthorized" }, 401);
            }
            return response({ delivered: await sendDueReminders(admin) });
        }

        const authorization = request.headers.get("Authorization") || "";
        const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
        const { data: { user }, error: userError } = await userClient.auth.getUser();
        if (userError || !user) return response({ error: "Unauthorized" }, 401);
        const { data: membership } = await admin.from("app_members").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!membership) return response({ error: "Not a MaBestie member" }, 403);

        const server = await createApplicationServer();
        if (input.action === "config") {
            return response({ publicKey: base64Url(await server.getVapidPublicKeyRaw()) });
        }

        const { data: recipients, error: recipientError } = await admin
            .from("app_members")
            .select("user_id")
            .neq("user_id", user.id);
        if (recipientError) throw recipientError;

        let payload: PushPayload | null = null;
        let preference: keyof Preferences | null = null;

        if (input.action === "status_updated") {
            const { data: profile } = await admin.from("profiles").select("name, status, status_message, status_updated_by").eq("name", input.recordId).single();
            if (!profile || profile.status_updated_by !== user.id) return response({ error: "Status update not found" }, 404);
            preference = "status_updates";
            payload = { title: `${profile.name} updated their status`, body: profile.status_message || profile.status || "New status", tag: `status-${profile.name}`, url: "./?screen=home" };
        }

        if (input.action === "list_added") {
            const { data: item } = await admin.from("list_items").select("id, title, created_by, created_by_user_id").eq("id", input.recordId).single();
            if (!item || item.created_by_user_id !== user.id) return response({ error: "List item not found" }, 404);
            preference = "list_additions";
            payload = { title: "New on The List", body: `${item.created_by || input.actorProfile || "Your partner"} added ${item.title}`, tag: `list-${item.id}`, url: "./?screen=list" };
        }

        if (input.action === "errand_added" || input.action === "errand_completed") {
            const { data: errand } = await admin.from("errands").select("id, title, assignee, priority, completed, created_by, created_by_user_id, updated_by_user_id").eq("id", input.recordId).single();
            const actorMatches = input.action === "errand_added" ? errand?.created_by_user_id === user.id : errand?.updated_by_user_id === user.id;
            if (!errand || !actorMatches) return response({ error: "Errand not found" }, 404);
            if (input.action === "errand_completed") {
                if (!errand.completed) return response({ error: "Errand is not complete" }, 400);
                preference = "errand_completed";
                payload = { title: "Errand completed", body: errand.title, tag: `done-${errand.id}`, url: "./?screen=errands" };
            } else {
                payload = { title: errand.priority === "urgent" ? "Urgent errand" : "New assigned errand", body: errand.title, tag: `errand-${errand.id}`, url: "./?screen=errands" };
            }
        }

        if (!payload) return response({ error: "Unknown action" }, 400);

        let delivered = 0;
        for (const recipient of recipients || []) {
            const { data: preferences } = await admin.from("notification_preferences").select("*").eq("user_id", recipient.user_id).maybeSingle();
            let enabled = preference ? preferences?.[preference] ?? (preference !== "list_additions" && preference !== "errand_completed") : false;
            if (input.action === "errand_added") {
                const { data: errand } = await admin.from("errands").select("assignee, priority").eq("id", input.recordId).single();
                const urgentEnabled = errand?.priority === "urgent" && preferences?.urgent_errands !== false;
                const assignedToPartner = errand?.assignee === "both" || (errand?.assignee && errand.assignee !== "unassigned" && errand.assignee !== input.actorProfile);
                const assignedEnabled = assignedToPartner && preferences?.assigned_errands !== false;
                enabled = urgentEnabled || assignedEnabled;
            }
            if (enabled) delivered += await sendToMember(admin, recipient.user_id, payload);
        }
        return response({ delivered });
    }
};
