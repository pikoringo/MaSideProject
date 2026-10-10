const STORAGE_KEY = "mabestie.v2";
const SUPABASE_URL = "https://yxogvfsgfekipibthjxs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_DFh8lrv4AZtbwQLQkOCX-A_bIV7DVxS";
const PROCEDURE_LIST_ID = "japan-arrival";

const cloud = globalThis.supabase?.createClient
    ? globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

const PROFILE_META = {
    Rin: {
        avatar: "images/Mort.png",
        pet: "tiny_lemur",
        defaultTheme: "lilac"
    },
    Julius: {
        avatar: "images/KingJulian.png",
        pet: "royal_lemur",
        defaultTheme: "mono"
    }
};

const PET_META = {
    royal_lemur: {
        sprite: "images/pets/royal-lemur-atlas-v1.png",
        label: "Royal ring-tailed lemur"
    },
    tiny_lemur: {
        sprite: "images/pets/tiny-lemur-atlas-v1.png",
        label: "Tiny wide-eyed lemur"
    }
};

const PET_STATE_META = {
    idle: { row: 0, frameDuration: 220, stillFrame: 2 },
    hungry: { row: 1, frameDuration: 180, stillFrame: 3 },
    busy: { row: 2, frameDuration: 240, stillFrame: 2 },
    on_my_way: { row: 3, frameDuration: 140, stillFrame: 2 },
    sleepy: { row: 4, frameDuration: 260, stillFrame: 5 },
    need_a_hug: { row: 5, frameDuration: 220, stillFrame: 5 },
    happy: { row: 6, frameDuration: 130, stillFrame: 4 }
};

const STATUS_TO_PET_STATE = {
    "At work": "busy",
    Studying: "busy",
    "On my way": "on_my_way",
    Resting: "sleepy",
    "Need a hug": "need_a_hug"
};

const DEFAULT_NOTIFICATION_PREFERENCES = {
    statusUpdates: true,
    urgentErrands: true,
    assignedErrands: true,
    dueReminders: true,
    recurringReminders: true,
    errandCompleted: false,
    listAdditions: false
};

const LIST_CATEGORY_META = {
    movies: { label: "Movies", icon: "clapperboard" },
    places: { label: "Places to go", icon: "map-pin" },
    food: { label: "Food to eat", icon: "utensils" },
    wishlist: { label: "Wishlist", icon: "gift" }
};

const ERRAND_CATEGORY_META = {
    groceries: { label: "Groceries", icon: "shopping-basket" },
    pickup: { label: "Pickup & returns", icon: "package" },
    home: { label: "Home", icon: "house" },
    admin: { label: "Admin", icon: "calendar-days" }
};

const SCREEN_META = {
    home: { title: "Home", eyebrow: "Your shared space" },
    list: { title: "The List", eyebrow: "Saved together" },
    procedures: { title: "Japan procedures", eyebrow: "Arrival checklist" },
    survival: { title: "Survival guide", eyebrow: "Useful in Japan" },
    errands: { title: "Errands", eyebrow: "Shared responsibilities" },
    settings: { title: "Settings", eyebrow: "Your preferences" }
};

const PROCEDURES = [
    {
        id: "address",
        name: "Register your address",
        description: "Bring your residence card and passport to City Hall.",
        category: "Arrival & Registration",
        requires: [],
        details: "Maebashi City Hall. Ask to register your address and have it printed on the back of your residence card."
    },
    {
        id: "mynumber",
        name: "Apply for a MyNumber Card",
        description: "Apply after completing resident registration.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: "Bring the application documents received after registration and confirm the current photo requirements."
    },
    {
        id: "health-insurance",
        name: "Apply for student health insurance",
        description: "Bring student documents and proof of enrollment.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: "Complete the National Health Insurance procedure at City Hall and ask about any student-specific reduction."
    },
    {
        id: "pension",
        name: "Apply for the student pension exception",
        description: "Apply for the student special payment program.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: "Bring a student ID or enrollment certificate and ask for the gakusei nōfu tokurei application."
    },
    {
        id: "juminhyo",
        name: "Get a residence certificate",
        description: "Request a copy of your jūminhyō for school.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: "Request the version required by your school and confirm whether MyNumber details should be omitted."
    },
    {
        id: "phone",
        name: "Get a Japanese phone number",
        description: "Choose a SIM card or phone plan.",
        category: "Daily Setup",
        requires: [],
        details: "Compare plans and confirm identity, payment, and residence-card requirements before visiting a store."
    },
    {
        id: "bank",
        name: "Open a Japanese bank account",
        description: "Set up an account for payments and transfers.",
        category: "Daily Setup",
        requires: ["phone"],
        details: "Bring your residence card, Japanese phone number, address details, and any school documentation requested by the bank."
    },
    {
        id: "paypay",
        name: "Set up PayPay",
        description: "Create a mobile payment account.",
        category: "Daily Setup",
        requires: ["phone"],
        details: "Register with your Japanese phone number, then connect a supported payment method if desired."
    },
    {
        id: "credit-card",
        name: "Consider a credit card",
        description: "Compare EPOS, Rakuten, or another suitable card.",
        category: "Daily Setup",
        requires: ["bank"],
        details: "Review fees, eligibility, language support, and required account history before applying."
    },
    {
        id: "hanko",
        name: "Register a hanko if needed",
        description: "Optional for most everyday tasks.",
        category: "Daily Setup",
        requires: [],
        details: "Only purchase and register one if a school, bank, employer, or official procedure specifically requires it."
    }
];

function createInitialState() {
    const migratedUser = localStorage.getItem("currentUser");
    const procedureProgress = {};

    PROCEDURES.forEach((procedure) => {
        procedureProgress[procedure.id] = localStorage.getItem(procedure.id) === "true";
    });

    return {
        currentUser: PROFILE_META[migratedUser] ? migratedUser : null,
        themes: { Rin: "lilac", Julius: "mono" },
        pets: { Rin: "tiny_lemur", Julius: "royal_lemur" },
        statuses: {
            Rin: { value: "", petState: "idle", message: "", updatedAt: null },
            Julius: { value: "", petState: "idle", message: "", updatedAt: null }
        },
        listItems: [
            createSeedItem("Perfect Days", "movies", "Watch it on a quiet Friday night with convenience-store snacks.", "Rin"),
            createSeedItem("Kusatsu onsen", "places", "Take the early bus, walk around Yubatake, and find a cozy lunch.", "Julius"),
            createSeedItem("Make okonomiyaki", "food", "Try the Osaka-style recipe and buy bonito flakes.", "Rin"),
            createSeedItem("Matching travel mugs", "wishlist", "Find leak-proof mugs that fit both bike bottle holders.", "Julius")
        ],
        errands: [
            createSeedErrand("Milk, eggs, and rice", "groceries", "Julius", today(), "", ""),
            createSeedErrand("Return parcel at the konbini", "pickup", "Rin", "", "", "Bring the return QR code."),
            createSeedErrand("Take out burnable trash", "home", "both", "", "weekly", "Tuesday and Friday mornings.")
        ],
        procedureProgress,
        proceduresArchived: false,
        proceduresArchivedAt: null,
        notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES }
    };
}

function createSeedItem(title, category, description, createdBy) {
    return {
        id: makeId(),
        title,
        category,
        description,
        createdBy,
        createdAt: new Date().toISOString()
    };
}

function createSeedErrand(title, category, assignee, dueDate, recurrence, notes) {
    return {
        id: makeId(),
        title,
        category,
        assignee,
        dueDate,
        recurrence,
        priority: "normal",
        notes,
        completed: false,
        createdAt: new Date().toISOString()
    };
}

function makeId() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function today() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function nextRecurringDueDate(dueDate, recurrence) {
    if (!dueDate || !recurrence) return "";
    const [year, month, day] = dueDate.split("-").map(Number);
    const next = new Date(year, month - 1, day);
    if (recurrence === "weekly") next.setDate(next.getDate() + 7);
    if (recurrence === "monthly") {
        const targetMonth = month;
        const targetYear = year + Math.floor(targetMonth / 12);
        const normalizedMonth = targetMonth % 12;
        const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
        next.setFullYear(targetYear, normalizedMonth, Math.min(day, lastDay));
    }
    const nextMonth = String(next.getMonth() + 1).padStart(2, "0");
    const nextDay = String(next.getDate()).padStart(2, "0");
    return `${next.getFullYear()}-${nextMonth}-${nextDay}`;
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!saved || typeof saved !== "object") {
            return createInitialState();
        }

        const initial = createInitialState();
        return {
            ...initial,
            ...saved,
            currentUser: PROFILE_META[saved.currentUser] ? saved.currentUser : initial.currentUser,
            themes: { ...initial.themes, ...saved.themes },
            pets: { ...initial.pets, ...saved.pets },
            statuses: { ...initial.statuses, ...saved.statuses },
            notificationPreferences: { ...initial.notificationPreferences, ...saved.notificationPreferences },
            listItems: Array.isArray(saved.listItems) ? saved.listItems : initial.listItems,
            errands: Array.isArray(saved.errands) ? saved.errands : initial.errands,
            procedureProgress: { ...initial.procedureProgress, ...saved.procedureProgress }
        };
    } catch (error) {
        console.warn("Could not load saved MaBestie state.", error);
        return createInitialState();
    }
}

let state = loadState();
let currentScreen = "home";
let listFilter = "all";
let errandFilter = "all";
let selectedStatus = "";
let selectedPetState = "idle";
let cloudRefreshTimer = null;
let cloudChannel = null;
let petAnimationFrame = null;
let authSession = null;
let notificationToastTimer = null;
let serviceWorkerRegistration = null;

const appShell = document.getElementById("app-shell");
const authGate = document.getElementById("auth-gate");
const profileGate = document.getElementById("profile-gate");
const app = document.getElementById("app");
const screenTitle = document.getElementById("screen-title");
const headerEyebrow = document.getElementById("header-eyebrow");
const headerAvatar = document.getElementById("header-avatar");
const syncStatus = document.getElementById("sync-status");

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setSyncStatus(label, status = "") {
    syncStatus.textContent = label;
    syncStatus.dataset.state = status;
}

function fromListRow(row) {
    return {
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description || "",
        createdBy: row.created_by,
        createdAt: row.created_at,
        createdByUserId: row.created_by_user_id || null,
        updatedAt: row.updated_at
    };
}

function toListRow(item) {
    return {
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description || "",
        created_by: item.createdBy || state.currentUser,
        created_at: item.createdAt || new Date().toISOString(),
        created_by_user_id: item.createdByUserId || authSession?.user?.id || null
    };
}

function fromErrandRow(row) {
    return {
        id: row.id,
        title: row.title,
        category: row.category,
        assignee: row.assignee,
        dueDate: row.due_date || "",
        recurrence: row.recurrence || "",
        priority: row.priority || "normal",
        notes: row.notes || "",
        completed: row.completed,
        createdBy: row.created_by,
        completedBy: row.completed_by,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        createdByUserId: row.created_by_user_id || null,
        updatedByUserId: row.updated_by_user_id || null,
        updatedAt: row.updated_at
    };
}

function toErrandRow(errand) {
    return {
        id: errand.id,
        title: errand.title,
        category: errand.category,
        assignee: errand.assignee || "unassigned",
        due_date: errand.dueDate || null,
        recurrence: errand.recurrence || "",
        priority: errand.priority || "normal",
        notes: errand.notes || "",
        completed: Boolean(errand.completed),
        created_by: errand.createdBy || state.currentUser,
        completed_by: errand.completed ? (errand.completedBy || state.currentUser) : null,
        completed_at: errand.completed ? (errand.completedAt || new Date().toISOString()) : null,
        created_at: errand.createdAt || new Date().toISOString(),
        created_by_user_id: errand.createdByUserId || authSession?.user?.id || null,
        updated_by_user_id: authSession?.user?.id || errand.updatedByUserId || null
    };
}

function fromNotificationPreferences(row) {
    return {
        statusUpdates: row?.status_updates ?? true,
        urgentErrands: row?.urgent_errands ?? true,
        assignedErrands: row?.assigned_errands ?? true,
        dueReminders: row?.due_reminders ?? true,
        recurringReminders: row?.recurring_reminders ?? true,
        errandCompleted: row?.errand_completed ?? false,
        listAdditions: row?.list_additions ?? false
    };
}

function toNotificationPreferencesRow() {
    return {
        user_id: authSession.user.id,
        status_updates: state.notificationPreferences.statusUpdates,
        urgent_errands: state.notificationPreferences.urgentErrands,
        assigned_errands: state.notificationPreferences.assignedErrands,
        due_reminders: state.notificationPreferences.dueReminders,
        recurring_reminders: state.notificationPreferences.recurringReminders,
        errand_completed: state.notificationPreferences.errandCompleted,
        list_additions: state.notificationPreferences.listAdditions
    };
}

async function querySharedState() {
    const [profilesResult, listResult, procedureListResult, progressResult, errandsResult, preferencesResult] = await Promise.all([
        cloud.from("profiles").select("*"),
        cloud.from("list_items").select("*").order("created_at"),
        cloud.from("procedure_lists").select("*").eq("id", PROCEDURE_LIST_ID).single(),
        cloud.from("procedure_progress").select("*").eq("list_id", PROCEDURE_LIST_ID),
        cloud.from("errands").select("*").order("created_at"),
        cloud.from("notification_preferences").select("*").eq("user_id", authSession.user.id).maybeSingle()
    ]);
    const error = [profilesResult, listResult, procedureListResult, progressResult, errandsResult, preferencesResult]
        .find((result) => result.error)?.error;
    if (error) throw error;
    return {
        profiles: profilesResult.data,
        listItems: listResult.data,
        procedureList: procedureListResult.data,
        progress: progressResult.data,
        errands: errandsResult.data,
        notificationPreferences: preferencesResult.data
    };
}

async function initializeEmptyCollections(remote) {
    const writes = [];
    if (!remote.listItems.length && state.listItems.length) {
        writes.push(cloud.from("list_items").upsert(state.listItems.map(toListRow)));
    }
    if (!remote.errands.length && state.errands.length) {
        writes.push(cloud.from("errands").upsert(state.errands.map(toErrandRow)));
    }
    if (!remote.progress.length) {
        const completedRows = Object.entries(state.procedureProgress)
            .filter(([, completed]) => completed)
            .map(([taskId]) => ({ list_id: PROCEDURE_LIST_ID, task_id: taskId, completed: true, completed_by: state.currentUser }));
        if (completedRows.length) writes.push(cloud.from("procedure_progress").upsert(completedRows));
    }
    if (!remote.notificationPreferences && authSession) {
        writes.push(cloud.from("notification_preferences").upsert(toNotificationPreferencesRow()));
    }
    const results = await Promise.all(writes);
    const error = results.find((result) => result.error)?.error;
    if (error) throw error;
    return writes.length > 0;
}

function applySharedState(remote) {
    remote.profiles.forEach((profile) => {
        state.themes[profile.name] = profile.theme;
        state.pets[profile.name] = PET_META[profile.pet_id] ? profile.pet_id : PROFILE_META[profile.name].pet;
        state.statuses[profile.name] = {
            value: profile.status || "",
            petState: PET_STATE_META[profile.pet_state] ? profile.pet_state : petStateForStatus(profile.status),
            message: profile.status_message || "",
            updatedAt: profile.status_updated_at
        };
    });
    state.listItems = remote.listItems.map(fromListRow);
    state.errands = remote.errands.map(fromErrandRow);
    state.notificationPreferences = fromNotificationPreferences(remote.notificationPreferences);
    state.procedureProgress = Object.fromEntries(PROCEDURES.map((procedure) => [procedure.id, false]));
    remote.progress.forEach((row) => {
        if (Object.hasOwn(state.procedureProgress, row.task_id)) state.procedureProgress[row.task_id] = row.completed;
    });
    state.proceduresArchived = remote.procedureList.archived;
    state.proceduresArchivedAt = remote.procedureList.archived_at;
    saveState();
    if (state.currentUser) {
        renderAll();
        if (state.proceduresArchived && currentScreen === "procedures") navigate("home");
    }
}

async function refreshFromCloud() {
    if (!cloud) return;
    setSyncStatus("Syncing…");
    try {
        let remote = await querySharedState();
        const initialized = await initializeEmptyCollections(remote);
        if (initialized) remote = await querySharedState();
        applySharedState(remote);
        setSyncStatus("Shared & current", "synced");
    } catch (error) {
        setSyncStatus(error?.code === "PGRST205" ? "Setup needed" : "Local only", "pending");
        console.warn("MaBestie cloud sync is unavailable; using the local cache.", error);
    }
}

function scheduleCloudRefresh() {
    clearTimeout(cloudRefreshTimer);
    cloudRefreshTimer = setTimeout(refreshFromCloud, 250);
}

function subscribeToCloud() {
    if (!cloud || cloudChannel) return;
    cloudChannel = cloud.channel("mabestie-v2");
    ["profiles", "list_items", "procedure_lists", "procedure_progress", "errands"].forEach((table) => {
        cloudChannel.on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
            handleRealtimeNotification(table, payload);
            scheduleCloudRefresh();
        });
    });
    cloudChannel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setSyncStatus("Local only", "pending");
    });
}

async function writeToCloud(operation) {
    if (!cloud) return false;
    setSyncStatus("Saving…");
    try {
        const { error } = await operation;
        if (error) throw error;
        setSyncStatus("Shared & current", "synced");
        return true;
    } catch (error) {
        setSyncStatus("Changes pending", "pending");
        console.warn("The change is saved locally but has not reached Supabase.", error);
        return false;
    }
}

function syncProfile(profile) {
    if (!cloud) return Promise.resolve(false);
    const status = state.statuses[profile] || {};
    return writeToCloud(cloud.from("profiles").upsert({
        name: profile,
        theme: state.themes[profile] || PROFILE_META[profile].defaultTheme,
        pet_id: state.pets[profile] || PROFILE_META[profile].pet,
        pet_state: PET_STATE_META[status.petState] ? status.petState : petStateForStatus(status.value),
        status: status.value || "",
        status_message: status.message || "",
        status_updated_at: status.updatedAt || null,
        status_updated_by: authSession?.user?.id || null
    }));
}

function showNotificationToast(title, body) {
    const toast = document.getElementById("notification-toast");
    document.getElementById("notification-toast-title").textContent = title;
    document.getElementById("notification-toast-body").textContent = body;
    toast.hidden = false;
    clearTimeout(notificationToastTimer);
    notificationToastTimer = setTimeout(() => {
        toast.hidden = true;
    }, 5000);
    refreshIcons();
}

function isPartnerChange(record, actorField) {
    return Boolean(authSession?.user?.id && record?.[actorField] && record[actorField] !== authSession.user.id);
}

function handleRealtimeNotification(table, payload) {
    if (!authSession || document.hidden) return;
    const record = payload.new || {};

    if (table === "profiles" && payload.eventType === "UPDATE" && isPartnerChange(record, "status_updated_by")) {
        const previous = state.statuses[record.name] || {};
        const statusChanged = previous.value !== record.status || previous.message !== record.status_message || previous.petState !== record.pet_state;
        if (statusChanged && state.notificationPreferences.statusUpdates) {
            showNotificationToast(`${record.name} updated their status`, record.status_message || record.status || "New status");
        }
    }

    if (table === "list_items" && payload.eventType === "INSERT" && isPartnerChange(record, "created_by_user_id") && state.notificationPreferences.listAdditions) {
        showNotificationToast("New on The List", `${record.created_by || "Your partner"} added ${record.title}`);
    }

    if (table === "errands" && isPartnerChange(record, "updated_by_user_id")) {
        if (payload.eventType === "INSERT") {
            const urgent = record.priority === "urgent" && state.notificationPreferences.urgentErrands;
            const assigned = (record.assignee === state.currentUser || record.assignee === "both") && state.notificationPreferences.assignedErrands;
            if (urgent || assigned) showNotificationToast(urgent ? "Urgent errand" : "New assigned errand", record.title);
        } else if (payload.eventType === "UPDATE" && record.completed && !state.errands.find((errand) => errand.id === record.id)?.completed && state.notificationPreferences.errandCompleted) {
            showNotificationToast("Errand completed", record.title);
        }
    }
}

function refreshIcons() {
    if (globalThis.lucide) {
        globalThis.lucide.createIcons({ attrs: { "stroke-width": 1.75 } });
    }
}

function icon(name) {
    const element = document.createElement("i");
    element.dataset.lucide = name;
    element.setAttribute("aria-hidden", "true");
    return element;
}

function selectProfile(profile) {
    if (!PROFILE_META[profile]) {
        return;
    }

    state.currentUser = profile;
    saveState();
    enterApp();
}

function enterApp() {
    if (!authSession) {
        authGate.hidden = false;
        profileGate.hidden = true;
        app.hidden = true;
        refreshIcons();
        return;
    }

    authGate.hidden = true;
    if (!state.currentUser) {
        profileGate.hidden = false;
        app.hidden = true;
        refreshIcons();
        return;
    }

    profileGate.hidden = true;
    app.hidden = false;
    applyTheme();
    renderAll();
    const requestedScreen = new URLSearchParams(window.location.search).get("screen");
    navigate(SCREEN_META[requestedScreen] ? requestedScreen : "home");
    if (requestedScreen) window.history.replaceState({}, "", window.location.pathname);
}

function applyTheme() {
    const profile = state.currentUser;
    const fallback = PROFILE_META[profile]?.defaultTheme || "mono";
    const theme = state.themes[profile] || fallback;
    appShell.dataset.profileTheme = theme;
    headerAvatar.src = PROFILE_META[profile].avatar;
    headerAvatar.alt = `${profile}'s avatar`;
}

function navigate(screen) {
    if (screen === "procedures" && state.proceduresArchived) {
        screen = "settings";
    }

    currentScreen = screen;
    document.querySelectorAll("[data-screen]").forEach((section) => {
        section.hidden = section.dataset.screen !== screen;
    });
    document.querySelectorAll("[data-nav-screen]").forEach((button) => {
        button.setAttribute("aria-selected", String(button.dataset.navScreen === screen));
    });

    const meta = SCREEN_META[screen];
    screenTitle.textContent = meta.title;
    headerEyebrow.textContent = meta.eyebrow;
    document.getElementById("app-content").scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
    refreshIcons();
}

function renderAll() {
    applyTheme();
    renderHome();
    renderList();
    renderProcedures();
    renderErrands();
    renderSettings();
    renderNavigation();
    refreshIcons();
}

function partnerFor(profile) {
    return profile === "Rin" ? "Julius" : "Rin";
}

function petStateForStatus(status) {
    return STATUS_TO_PET_STATE[status] || "idle";
}

function setPetFrame(element, frame) {
    const row = Number(element.dataset.petRow || 0);
    const image = element.querySelector("img");
    image.style.setProperty("--pet-x", `${frame * (-100 / 6)}%`);
    image.style.setProperty("--pet-y", `${row * (-100 / 7)}%`);
}

function configurePetSprite(element, profile, stateKey = "idle", petId = state.pets[profile] || PROFILE_META[profile]?.pet || "tiny_lemur") {
    const pet = PET_META[petId];
    const safeStateKey = PET_STATE_META[stateKey] ? stateKey : "idle";
    const animation = PET_STATE_META[safeStateKey];
    const image = element.querySelector("img");

    image.src = pet.sprite;
    element.dataset.pet = petId;
    element.dataset.petState = safeStateKey;
    element.dataset.petRow = animation.row;
    element.dataset.frameDuration = animation.frameDuration;
    element.dataset.stillFrame = animation.stillFrame;
    element.setAttribute("title", `${profile}'s ${pet.label}: ${safeStateKey.replaceAll("_", " ")}`);
    setPetFrame(element, motionPreference.matches ? animation.stillFrame : 0);
}

function animatePets(timestamp) {
    if (!document.hidden && !app.hidden && !motionPreference.matches) {
        document.querySelectorAll("[data-pet-sprite]").forEach((element) => {
            const duration = Number(element.dataset.frameDuration || 200);
            setPetFrame(element, Math.floor(timestamp / duration) % 6);
        });
    }
    petAnimationFrame = requestAnimationFrame(animatePets);
}

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function refreshPetMotionPreference() {
    document.querySelectorAll("[data-pet-sprite]").forEach((element) => {
        setPetFrame(element, motionPreference.matches ? Number(element.dataset.stillFrame || 0) : 0);
    });
}

function renderHome() {
    const partner = partnerFor(state.currentUser);
    const status = state.statuses[partner] || { value: "", message: "", updatedAt: null };
    configurePetSprite(document.getElementById("partner-pet"), partner, status.petState || petStateForStatus(status.value));
    document.getElementById("partner-status-name").textContent = `${partner} · status`;
    document.getElementById("partner-status-text").textContent = status.value || "No status yet";
    document.getElementById("partner-status-time").textContent = status.updatedAt
        ? `${status.message ? `“${status.message}” · ` : ""}${formatRelativeTime(status.updatedAt)}`
        : "Tap to set yours";

    const openErrands = state.errands.filter((errand) => !errand.completed).length;
    const completedProcedures = completedProcedureCount();
    document.getElementById("home-list-count").textContent = `${state.listItems.length} saved ${state.listItems.length === 1 ? "thing" : "things"}`;
    document.getElementById("home-errand-count").textContent = `${openErrands} open`;
    document.getElementById("home-procedure-count").textContent = `${completedProcedures} of ${PROCEDURES.length} complete`;
    document.getElementById("home-procedures-card").hidden = state.proceduresArchived;
}

function formatRelativeTime(isoString) {
    const elapsed = Math.max(0, Date.now() - new Date(isoString).getTime());
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
}

function renderList() {
    const container = document.getElementById("list-items");
    container.replaceChildren();
    const visible = state.listItems.filter((item) => listFilter === "all" || item.category === listFilter);

    visible.forEach((item) => {
        const meta = LIST_CATEGORY_META[item.category] || LIST_CATEGORY_META.places;
        const button = document.createElement("button");
        button.className = "list-item";
        button.type = "button";
        button.addEventListener("click", () => openListDialog(item.id));

        const leading = document.createElement("span");
        leading.className = "item-leading";
        leading.appendChild(icon(meta.icon));

        const copy = document.createElement("span");
        copy.className = "item-copy";
        const title = document.createElement("strong");
        title.textContent = item.title;
        const detail = document.createElement("small");
        detail.textContent = `${meta.label} · ${item.createdBy || "Shared"}`;
        copy.append(title, detail);

        button.append(leading, copy, icon("chevron-right"));
        container.appendChild(button);
    });

    document.getElementById("list-visible-count").textContent = `${visible.length} ${visible.length === 1 ? "item" : "items"}`;
    document.getElementById("list-section-title").textContent = listFilter === "all" ? "Everything" : LIST_CATEGORY_META[listFilter].label;
    document.getElementById("list-empty").hidden = visible.length !== 0;

    document.querySelectorAll("[data-list-filter]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.listFilter === listFilter));
    });
    refreshIcons();
}

function openListDialog(id = "") {
    const item = state.listItems.find((candidate) => candidate.id === id);
    document.getElementById("list-item-id").value = item?.id || "";
    document.getElementById("list-item-category").value = item?.category || "places";
    document.getElementById("list-item-title").value = item?.title || "";
    document.getElementById("list-item-description").value = item?.description || "";
    document.getElementById("list-dialog-title").textContent = item ? "Edit item" : "Add an item";
    document.getElementById("delete-list-item-button").hidden = !item;
    document.getElementById("list-item-dialog").showModal();
    document.getElementById("list-item-title").focus();
}

function saveListItem() {
    const id = document.getElementById("list-item-id").value;
    const title = document.getElementById("list-item-title").value.trim();
    if (!title) return;

    const existing = state.listItems.find((item) => item.id === id);
    const isNew = !existing;
    const values = {
        title,
        category: document.getElementById("list-item-category").value,
        description: document.getElementById("list-item-description").value.trim()
    };

    let savedItem;
    if (existing) {
        Object.assign(existing, values, { updatedAt: new Date().toISOString() });
        savedItem = existing;
    } else {
        savedItem = {
            id: makeId(),
            ...values,
            createdBy: state.currentUser,
            createdByUserId: authSession?.user?.id || null,
            createdAt: new Date().toISOString()
        };
        state.listItems.push(savedItem);
    }

    saveState();
    document.getElementById("list-item-dialog").close();
    renderAll();
    if (cloud) {
        writeToCloud(cloud.from("list_items").upsert(toListRow(savedItem))).then((saved) => {
            if (saved && isNew) requestPartnerNotification("list_added", savedItem.id);
        });
    }
}

function deleteListItem() {
    const id = document.getElementById("list-item-id").value;
    state.listItems = state.listItems.filter((item) => item.id !== id);
    saveState();
    document.getElementById("list-item-dialog").close();
    renderAll();
    if (cloud) writeToCloud(cloud.from("list_items").delete().eq("id", id));
}

function renderProcedures() {
    const container = document.getElementById("procedure-groups");
    container.replaceChildren();
    const categories = [...new Set(PROCEDURES.map((procedure) => procedure.category))];

    categories.forEach((category) => {
        const section = document.createElement("section");
        section.className = "procedure-group";
        const heading = document.createElement("div");
        heading.className = "section-heading";
        const title = document.createElement("h2");
        title.textContent = category;
        heading.appendChild(title);
        section.appendChild(heading);

        const list = document.createElement("div");
        list.className = "procedure-list";
        PROCEDURES.filter((procedure) => procedure.category === category).forEach((procedure) => {
            list.appendChild(createProcedureElement(procedure));
        });
        section.appendChild(list);
        container.appendChild(section);
    });

    const completed = completedProcedureCount();
    const total = PROCEDURES.length;
    document.getElementById("procedure-progress-text").textContent = `${completed} / ${total}`;
    document.getElementById("procedure-progress").setAttribute("aria-valuenow", String(completed));
    document.getElementById("procedure-progress-fill").style.width = `${(completed / total) * 100}%`;
    document.getElementById("procedure-progress-note").textContent = completed === total
        ? "Everything is complete. This chapter is ready to archive."
        : "Complete each step to unlock archiving.";
    document.getElementById("archive-procedures-button").disabled = completed !== total;
    refreshIcons();
}

function createProcedureElement(procedure) {
    const completed = Boolean(state.procedureProgress[procedure.id]);
    const unlocked = procedure.requires.every((requirement) => state.procedureProgress[requirement]);
    const item = document.createElement("article");
    item.className = "procedure-item";
    item.classList.toggle("is-complete", completed);
    item.classList.toggle("is-locked", !unlocked);

    const main = document.createElement("div");
    main.className = "procedure-main";
    const checkbox = document.createElement("input");
    checkbox.className = "procedure-check";
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.disabled = !unlocked;
    checkbox.setAttribute("aria-label", `Mark ${procedure.name} complete`);
    checkbox.addEventListener("change", () => {
        state.procedureProgress[procedure.id] = checkbox.checked;
        saveState();
        renderAll();
        if (cloud) writeToCloud(cloud.from("procedure_progress").upsert({
            list_id: PROCEDURE_LIST_ID,
            task_id: procedure.id,
            completed: checkbox.checked,
            completed_by: checkbox.checked ? state.currentUser : null
        }));
    });

    const copy = document.createElement("span");
    copy.className = "procedure-copy";
    const title = document.createElement("strong");
    title.textContent = procedure.name;
    const description = document.createElement("small");
    description.textContent = unlocked ? procedure.description : "Complete the required earlier step first.";
    copy.append(title, description);

    const toggle = document.createElement("button");
    toggle.className = "icon-button procedure-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", `Show details for ${procedure.name}`);
    toggle.setAttribute("aria-expanded", "false");
    toggle.appendChild(icon("chevron-right"));

    const details = document.createElement("div");
    details.className = "procedure-details";
    details.hidden = true;
    const detailText = document.createElement("p");
    detailText.textContent = procedure.details;
    details.appendChild(detailText);
    toggle.addEventListener("click", () => {
        details.hidden = !details.hidden;
        toggle.setAttribute("aria-expanded", String(!details.hidden));
    });

    main.append(checkbox, copy, toggle);
    item.append(main, details);
    return item;
}

function completedProcedureCount() {
    return PROCEDURES.filter((procedure) => state.procedureProgress[procedure.id]).length;
}

function archiveProcedures() {
    if (completedProcedureCount() !== PROCEDURES.length) return;
    state.proceduresArchived = true;
    state.proceduresArchivedAt = new Date().toISOString();
    saveState();
    document.getElementById("archive-dialog").close();
    renderAll();
    navigate("settings");
    if (cloud) writeToCloud(cloud.from("procedure_lists").update({
        archived: true,
        archived_at: state.proceduresArchivedAt
    }).eq("id", PROCEDURE_LIST_ID));
}

function restoreProcedures() {
    state.proceduresArchived = false;
    state.proceduresArchivedAt = null;
    saveState();
    renderAll();
    navigate("procedures");
    if (cloud) writeToCloud(cloud.from("procedure_lists").update({ archived: false, archived_at: null }).eq("id", PROCEDURE_LIST_ID));
}

function renderErrands() {
    const container = document.getElementById("errand-items");
    container.replaceChildren();
    const openErrands = state.errands.filter((errand) => !errand.completed);
    const visible = state.errands.filter((errand) => errandFilter === "all" || errand.category === errandFilter);
    visible.sort((a, b) => Number(a.completed) - Number(b.completed));

    visible.forEach((errand) => {
        const meta = ERRAND_CATEGORY_META[errand.category] || ERRAND_CATEGORY_META.admin;
        const row = document.createElement("div");
        row.className = "errand-item";
        row.classList.toggle("is-complete", errand.completed);

        const check = document.createElement("button");
        check.className = "errand-check";
        check.type = "button";
        check.setAttribute("aria-label", `${errand.completed ? "Reopen" : "Complete"} ${errand.title}`);
        if (errand.completed) check.appendChild(icon("check"));
        check.addEventListener("click", () => {
            errand.completed = !errand.completed;
            errand.completedBy = errand.completed ? state.currentUser : null;
            errand.completedAt = errand.completed ? new Date().toISOString() : null;
            errand.updatedByUserId = authSession?.user?.id || null;
            let nextErrand = null;
            if (errand.completed && errand.recurrence && errand.dueDate) {
                nextErrand = {
                    ...errand,
                    id: makeId(),
                    dueDate: nextRecurringDueDate(errand.dueDate, errand.recurrence),
                    completed: false,
                    completedBy: null,
                    completedAt: null,
                    createdBy: state.currentUser,
                    createdByUserId: authSession?.user?.id || null,
                    updatedByUserId: authSession?.user?.id || null,
                    createdAt: new Date().toISOString()
                };
                state.errands.push(nextErrand);
            }
            saveState();
            renderAll();
            if (cloud) {
                const rows = [toErrandRow(errand)];
                if (nextErrand) rows.push(toErrandRow(nextErrand));
                writeToCloud(cloud.from("errands").upsert(rows)).then((saved) => {
                    if (saved && errand.completed) requestPartnerNotification("errand_completed", errand.id);
                });
            }
        });

        const copyButton = document.createElement("button");
        copyButton.className = "item-copy errand-copy-button";
        copyButton.type = "button";
        const title = document.createElement("strong");
        title.textContent = errand.title;
        const detail = document.createElement("small");
        detail.textContent = formatErrandDetail(errand, meta.label);
        copyButton.append(title, detail);
        copyButton.addEventListener("click", () => openErrandDialog(errand.id));

        const categoryIcon = document.createElement("span");
        categoryIcon.className = "item-leading";
        categoryIcon.appendChild(icon(meta.icon));
        categoryIcon.setAttribute("aria-label", meta.label);
        categoryIcon.addEventListener("click", () => openErrandDialog(errand.id));

        row.append(check, copyButton, categoryIcon);
        container.appendChild(row);
    });

    document.getElementById("errands-open-count").textContent = String(openErrands.length);
    document.getElementById("errands-due-count").textContent = String(openErrands.filter((errand) => errand.dueDate === today()).length);
    document.getElementById("errands-recurring-count").textContent = String(openErrands.filter((errand) => errand.recurrence).length);
    document.getElementById("errands-empty").hidden = visible.length !== 0;
    document.querySelectorAll("[data-errand-filter]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.errandFilter === errandFilter));
    });
    refreshIcons();
}

function formatErrandDetail(errand, categoryLabel) {
    const parts = [categoryLabel];
    if (errand.priority === "urgent") parts.unshift("Urgent");
    if (errand.assignee && errand.assignee !== "unassigned") {
        parts.push(errand.assignee === "both" ? "Both" : errand.assignee);
    }
    if (errand.dueDate) parts.push(errand.dueDate === today() ? "Today" : errand.dueDate);
    if (errand.recurrence) parts.push(errand.recurrence === "weekly" ? "Weekly" : "Monthly");
    return parts.join(" · ");
}

function openErrandDialog(id = "") {
    const errand = state.errands.find((candidate) => candidate.id === id);
    document.getElementById("errand-id").value = errand?.id || "";
    document.getElementById("errand-title").value = errand?.title || "";
    document.getElementById("errand-category").value = errand?.category || "groceries";
    document.getElementById("errand-assignee").value = errand?.assignee || state.currentUser;
    document.getElementById("errand-due-date").value = errand?.dueDate || "";
    document.getElementById("errand-recurrence").value = errand?.recurrence || "";
    document.getElementById("errand-urgent").checked = errand?.priority === "urgent";
    document.getElementById("errand-notes").value = errand?.notes || "";
    document.getElementById("errand-dialog-title").textContent = errand ? "Edit errand" : "Add an errand";
    document.getElementById("delete-errand-button").hidden = !errand;
    document.getElementById("errand-dialog").showModal();
    document.getElementById("errand-title").focus();
}

function saveErrand() {
    const id = document.getElementById("errand-id").value;
    const title = document.getElementById("errand-title").value.trim();
    if (!title) return;

    const existing = state.errands.find((errand) => errand.id === id);
    const isNew = !existing;
    const dueDateInput = document.getElementById("errand-due-date");
    const recurrence = document.getElementById("errand-recurrence").value;
    dueDateInput.setCustomValidity(recurrence && !dueDateInput.value ? "Choose a due date for a recurring errand." : "");
    if (!dueDateInput.reportValidity()) return;
    const values = {
        title,
        category: document.getElementById("errand-category").value,
        assignee: document.getElementById("errand-assignee").value,
        dueDate: dueDateInput.value,
        recurrence,
        priority: document.getElementById("errand-urgent").checked ? "urgent" : "normal",
        notes: document.getElementById("errand-notes").value.trim()
    };

    let savedErrand;
    if (existing) {
        Object.assign(existing, values, { updatedAt: new Date().toISOString() });
        existing.updatedByUserId = authSession?.user?.id || null;
        savedErrand = existing;
    } else {
        savedErrand = {
            id: makeId(),
            ...values,
            completed: false,
            createdBy: state.currentUser,
            createdByUserId: authSession?.user?.id || null,
            updatedByUserId: authSession?.user?.id || null,
            createdAt: new Date().toISOString()
        };
        state.errands.push(savedErrand);
    }

    saveState();
    document.getElementById("errand-dialog").close();
    renderAll();
    if (cloud) {
        writeToCloud(cloud.from("errands").upsert(toErrandRow(savedErrand))).then((saved) => {
            if (saved && isNew) requestPartnerNotification("errand_added", savedErrand.id);
        });
    }
}

function deleteErrand() {
    const id = document.getElementById("errand-id").value;
    state.errands = state.errands.filter((errand) => errand.id !== id);
    saveState();
    document.getElementById("errand-dialog").close();
    renderAll();
    if (cloud) writeToCloud(cloud.from("errands").delete().eq("id", id));
}

function supportsSystemNotifications() {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function decodeApplicationServerKey(value) {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function registerNotificationServiceWorker() {
    if (!supportsSystemNotifications()) return null;
    if (!serviceWorkerRegistration) {
        serviceWorkerRegistration = await navigator.serviceWorker.register("sw.js");
    }
    return serviceWorkerRegistration;
}

async function currentPushSubscription() {
    const registration = await registerNotificationServiceWorker();
    return registration ? registration.pushManager.getSubscription() : null;
}

async function renderNotificationControls() {
    const copy = document.getElementById("notification-support-copy");
    const button = document.getElementById("notification-permission-button");
    document.querySelectorAll("[data-notification-preference]").forEach((input) => {
        input.checked = Boolean(state.notificationPreferences[input.dataset.notificationPreference]);
    });

    if (!supportsSystemNotifications()) {
        copy.textContent = "System notifications are unavailable here. In-app alerts still work.";
        button.innerHTML = '<i data-lucide="bell-off" aria-hidden="true"></i>System notifications unavailable';
        button.disabled = true;
        refreshIcons();
        return;
    }

    if (Notification.permission === "denied") {
        copy.textContent = "Notifications are blocked in this device's settings. In-app alerts still work.";
        button.innerHTML = '<i data-lucide="bell-off" aria-hidden="true"></i>Notifications blocked';
        button.disabled = true;
        refreshIcons();
        return;
    }

    const subscription = await currentPushSubscription();
    button.disabled = false;
    if (subscription) {
        copy.textContent = "System notifications are enabled on this device.";
        button.innerHTML = '<i data-lucide="bell-off" aria-hidden="true"></i>Disable on this device';
        button.dataset.action = "disable";
    } else {
        const installedOnIos = !/iPad|iPhone|iPod/.test(navigator.userAgent) || window.matchMedia("(display-mode: standalone)").matches;
        copy.textContent = installedOnIos ? "Enable alerts even when MaBestie is closed." : "On iPhone, add MaBestie to the Home Screen first.";
        button.innerHTML = '<i data-lucide="bell-ring" aria-hidden="true"></i>Enable notifications';
        button.dataset.action = "enable";
    }
    refreshIcons();
}

async function enableSystemNotifications() {
    const copy = document.getElementById("notification-support-copy");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        await renderNotificationControls();
        return;
    }

    const { data, error } = await cloud.functions.invoke("push-notifications", { body: { action: "config" } });
    if (error || !data?.publicKey) {
        copy.textContent = "Notification delivery still needs server setup. In-app alerts are active.";
        return;
    }

    const registration = await registerNotificationServiceWorker();
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeApplicationServerKey(data.publicKey)
    });
    const serialized = subscription.toJSON();
    const { error: saveError } = await cloud.from("push_subscriptions").upsert({
        user_id: authSession.user.id,
        endpoint: serialized.endpoint,
        p256dh: serialized.keys.p256dh,
        auth_secret: serialized.keys.auth
    }, { onConflict: "endpoint" });
    if (saveError) throw saveError;
    await renderNotificationControls();
}

async function disableSystemNotifications() {
    const subscription = await currentPushSubscription();
    if (subscription) {
        await cloud.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        await subscription.unsubscribe();
    }
    await renderNotificationControls();
}

async function saveNotificationPreferences() {
    saveState();
    if (!cloud || !authSession) return;
    await writeToCloud(cloud.from("notification_preferences").upsert(toNotificationPreferencesRow()));
}

async function requestPartnerNotification(action, recordId, extra = {}) {
    if (!cloud || !authSession) return;
    const { error } = await cloud.functions.invoke("push-notifications", {
        body: { action, recordId, actorProfile: state.currentUser, ...extra }
    });
    if (error) console.warn("The change synced, but its push notification could not be sent.", error);
}

function renderSettings() {
    document.getElementById("account-email").textContent = authSession?.user?.email || "Signed in securely.";
    document.querySelectorAll("[data-settings-profile]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.settingsProfile === state.currentUser));
    });
    const activeTheme = state.themes[state.currentUser] || PROFILE_META[state.currentUser].defaultTheme;
    document.querySelectorAll("[data-theme-option]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.themeOption === activeTheme));
    });
    const activePet = state.pets[state.currentUser] || PROFILE_META[state.currentUser].pet;
    document.querySelectorAll("[data-pet-option]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.petOption === activePet));
    });
    configurePetSprite(document.getElementById("settings-royal-pet"), state.currentUser, "idle", "royal_lemur");
    configurePetSprite(document.getElementById("settings-tiny-pet"), state.currentUser, "idle", "tiny_lemur");

    document.getElementById("archive-empty-message").hidden = state.proceduresArchived;
    document.getElementById("archived-procedures-item").hidden = !state.proceduresArchived;
    if (state.proceduresArchivedAt) {
        document.getElementById("archive-date").textContent = `Archived ${new Date(state.proceduresArchivedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`;
    }
    renderNotificationControls().catch((error) => {
        document.getElementById("notification-support-copy").textContent = "In-app alerts are active. System notification status is unavailable.";
        console.warn("Could not read the device notification subscription.", error);
    });
}

function renderNavigation() {
    document.getElementById("procedures-nav-button").hidden = state.proceduresArchived;
}

function openStatusDialog() {
    const status = state.statuses[state.currentUser] || { value: "", message: "" };
    selectedStatus = status.value;
    selectedPetState = PET_STATE_META[status.petState] ? status.petState : petStateForStatus(selectedStatus);
    configurePetSprite(document.getElementById("status-pet-preview"), state.currentUser, selectedPetState);
    document.getElementById("status-message").value = status.message || "";
    document.querySelectorAll("[data-status]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.status === selectedStatus));
    });
    document.querySelectorAll("[data-pet-state]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.petState === selectedPetState));
    });
    document.getElementById("status-dialog").showModal();
}

function saveStatus() {
    if (!selectedStatus) return;
    state.statuses[state.currentUser] = {
        value: selectedStatus,
        petState: selectedPetState,
        message: document.getElementById("status-message").value.trim(),
        updatedAt: new Date().toISOString()
    };
    saveState();
    document.getElementById("status-dialog").close();
    renderAll();
    syncProfile(state.currentUser).then((saved) => {
        if (saved) requestPartnerNotification("status_updated", state.currentUser);
    });
}

document.querySelectorAll("[data-select-profile]").forEach((button) => {
    button.addEventListener("click", () => selectProfile(button.dataset.selectProfile));
});

document.querySelectorAll("[data-open-screen]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.openScreen));
});

document.querySelectorAll("[data-nav-screen]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.navScreen));
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => document.getElementById(button.dataset.closeDialog).close());
});

document.querySelectorAll("[data-list-filter]").forEach((button) => {
    button.addEventListener("click", () => {
        listFilter = button.dataset.listFilter;
        renderList();
    });
});

document.querySelectorAll("[data-errand-filter]").forEach((button) => {
    button.addEventListener("click", () => {
        errandFilter = button.dataset.errandFilter;
        renderErrands();
    });
});

document.querySelectorAll("[data-settings-profile]").forEach((button) => {
    button.addEventListener("click", () => {
        state.currentUser = button.dataset.settingsProfile;
        saveState();
        renderAll();
        navigate("settings");
    });
});

document.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
        state.themes[state.currentUser] = button.dataset.themeOption;
        saveState();
        renderAll();
        syncProfile(state.currentUser);
    });
});

document.querySelectorAll("[data-pet-option]").forEach((button) => {
    button.addEventListener("click", () => {
        state.pets[state.currentUser] = button.dataset.petOption;
        saveState();
        renderAll();
        syncProfile(state.currentUser);
    });
});

document.querySelectorAll("[data-notification-preference]").forEach((input) => {
    input.addEventListener("change", () => {
        state.notificationPreferences[input.dataset.notificationPreference] = input.checked;
        saveNotificationPreferences();
    });
});

document.getElementById("notification-permission-button").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
        if (button.dataset.action === "disable") {
            await disableSystemNotifications();
        } else {
            await enableSystemNotifications();
        }
    } catch (error) {
        button.disabled = false;
        document.getElementById("notification-support-copy").textContent = "System notifications could not be changed. In-app alerts still work.";
        console.warn("Could not update system notifications.", error);
    }
});

document.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
        selectedStatus = button.dataset.status;
        selectedPetState = petStateForStatus(selectedStatus);
        configurePetSprite(document.getElementById("status-pet-preview"), state.currentUser, selectedPetState);
        document.querySelectorAll("[data-status]").forEach((option) => {
            option.setAttribute("aria-pressed", String(option === button));
        });
        document.querySelectorAll("[data-pet-state]").forEach((option) => {
            option.setAttribute("aria-pressed", String(option.dataset.petState === selectedPetState));
        });
    });
});

document.querySelectorAll("[data-pet-state]").forEach((button) => {
    button.addEventListener("click", () => {
        selectedPetState = button.dataset.petState;
        configurePetSprite(document.getElementById("status-pet-preview"), state.currentUser, selectedPetState);
        document.querySelectorAll("[data-pet-state]").forEach((option) => {
            option.setAttribute("aria-pressed", String(option === button));
        });
    });
});

document.getElementById("add-list-item-button").addEventListener("click", () => openListDialog());
document.getElementById("list-item-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveListItem();
});
document.getElementById("delete-list-item-button").addEventListener("click", deleteListItem);

document.getElementById("add-errand-button").addEventListener("click", () => openErrandDialog());
document.getElementById("errand-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveErrand();
});
document.getElementById("delete-errand-button").addEventListener("click", deleteErrand);

document.getElementById("partner-status-card").addEventListener("click", openStatusDialog);
document.getElementById("status-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveStatus();
});

document.getElementById("archive-procedures-button").addEventListener("click", () => {
    document.getElementById("archive-dialog").showModal();
});
document.getElementById("confirm-archive-button").addEventListener("click", archiveProcedures);
document.getElementById("restore-procedures-button").addEventListener("click", restoreProcedures);

document.getElementById("forget-profile-button").addEventListener("click", () => {
    state.currentUser = null;
    saveState();
    enterApp();
});

document.getElementById("auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!cloud) return;
    const email = document.getElementById("auth-email").value.trim();
    const passwordInput = document.getElementById("auth-password");
    const button = document.getElementById("auth-submit-button");
    const message = document.getElementById("auth-message");
    button.disabled = true;
    message.dataset.state = "";
    message.textContent = "Signing in…";
    const { error } = await cloud.auth.signInWithPassword({ email, password: passwordInput.value });
    button.disabled = false;
    if (error) {
        message.dataset.state = "error";
        message.textContent = "Sign-in failed. Check your email, password, and connection.";
        return;
    }
    passwordInput.value = "";
    message.textContent = "Signed in.";
});

document.getElementById("sign-out-button").addEventListener("click", async () => {
    if (!cloud) return;
    if (supportsSystemNotifications()) {
        try {
            await disableSystemNotifications();
        } catch (error) {
            console.warn("The local push subscription could not be removed before sign-out.", error);
        }
    }
    await cloud.auth.signOut();
});

document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });
});

motionPreference.addEventListener("change", refreshPetMotionPreference);
petAnimationFrame = requestAnimationFrame(animatePets);
async function initializeApp() {
    if (!cloud) {
        document.getElementById("auth-message").dataset.state = "error";
        document.getElementById("auth-message").textContent = "Sign-in is temporarily unavailable.";
        enterApp();
        return;
    }

    const { data } = await cloud.auth.getSession();
    authSession = data.session;
    enterApp();
    if (authSession) {
        registerNotificationServiceWorker().catch((error) => console.warn("The notification service worker is unavailable.", error));
        await refreshFromCloud();
        subscribeToCloud();
    }

    cloud.auth.onAuthStateChange((event, session) => {
        authSession = session;
        if (!session) {
            if (cloudChannel) cloud.removeChannel(cloudChannel);
            cloudChannel = null;
            setSyncStatus("Signed out");
        }
        enterApp();
        if (session && event === "SIGNED_IN") {
            registerNotificationServiceWorker().catch((error) => console.warn("The notification service worker is unavailable.", error));
            refreshFromCloud();
            subscribeToCloud();
        }
    });
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "MABESTIE_NOTIFICATION") {
            showNotificationToast(event.data.title || "MaBestie", event.data.body || "You have an update.");
        }
    });
}

initializeApp();
