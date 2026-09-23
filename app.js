const SUPABASE_URL = "https://yxogvfsgfekipibthjxs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_DFh8lrv4AZtbwQLQkOCX-A_bIV7DVxS";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
console.log("Supabase connected:", supabaseClient);

const characterCards = document.querySelectorAll(".character-card");
const loginPage = document.getElementById("login-page");
const homePage = document.getElementById("home-page");

const savedUser = localStorage.getItem("currentUser");

if (savedUser) {
    loginPage.style.display = "none";
    homePage.style.display = "block";
}

characterCards.forEach((card) => {

    card.addEventListener("click", () => {

        const selectedCharacter =
            card.querySelector("strong").textContent;

        localStorage.setItem(
            "currentUser",
            selectedCharacter
        );

        loginPage.style.display = "none";
        homePage.style.display = "block";

    });

});

const homeTitle = document.getElementById("home-title");
const homeWelcome = document.getElementById("home-welcome");

if (savedUser === "Rin") {
    homeTitle.textContent = "Hello, creator!";
    homeWelcome.textContent = "What are we up to?";
}

if (savedUser === "Julius") {
    homeTitle.textContent = "Hello, my amazing boyfriend!";
    homeWelcome.textContent = "🌸 Welcome to Japan! 🌸";
}

const proceduresButton = document.getElementById("procedures-button");
const proceduresPage = document.getElementById("procedures-page");
const proceduresBackButton = document.getElementById("procedures-back-button");

const survivalButton = document.getElementById("survival-button");
const survivalPage = document.getElementById("survival-page");
const survivalBackButton = document.getElementById("survival-back-button");

const datesButton = document.getElementById("dates-button");
const datesPage = document.getElementById("dates-page");
const datesBackButton = document.getElementById("dates-back-button");

proceduresButton.addEventListener("click", () => {
    homePage.style.display = "none";
    proceduresPage.style.display = "block";
});


proceduresBackButton.addEventListener("click", () => {
    proceduresPage.style.display = "none";
    homePage.style.display = "block";
});

survivalButton.addEventListener("click", () => {
    homePage.style.display = "none";
    survivalPage.style.display = "block";
});

survivalBackButton.addEventListener("click", () => {
    survivalPage.style.display = "none";
    homePage.style.display = "block";
});

datesButton.addEventListener("click", () => {
    homePage.style.display = "none";
    datesPage.style.display = "block";
});

datesBackButton.addEventListener("click", () => {
    datesPage.style.display = "none";
    homePage.style.display = "block";
});

const tasks = [
    {
        id: "address",
        name: "Register your address",
        description: "Go to your city hall / ward office.",
        category: "Arrival & Registration",
        requires: [],
        details: {
            what: "Register your address with your local city hall or ward office.",
            where: "Maebashi City Hall",
            notes: "Get it printed on the back of your Residence Card."
        }
    },
    {
        id: "health-insurance",
        name: "Apply for National Health Insurance",
        description: "Apply at your city hall / ward office.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: {
            what: "Apply for student health insurance.",
            where: "Maebashi City Hall",
            notes: "Might need Student ID or proof of enrollment."
        }
    },
    {
        id: "pension",
        name: "Apply for Student National Pension Special Payment",
        description: "Apply for 学生納付特例. You may need a student ID or certificate of enrollment.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: {
            what: "Apply for Gakusei nōfu tokurei.",
            where: "Maebashi City Hall",
            notes: "Might need Student ID or proof of enrollment."
        }
    },
    {
        id: "mynumber",
        name: "Apply for a MyNumber Card",
        description: "Apply for your マイナンバーカード after your resident registration.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: {
            what: "Apply for MyNumber Card",
            where: "Maebashi City Hall",
            notes: "Costs around 1000jpy."
        }
    },
    {
        id: "juminhyo",
        name: "Get a Jūminhyō",
        description: "Get a copy of your 住民票 if your school requires it.",
        category: "Arrival & Registration",
        requires: ["address"],
        details: {
            what: "Get Certificate of Residence",
            where: "Maebashi City Hall",
            notes: "Can be printed from konbini with MyNumber Card. Otherwise, City Hall."
        }
    },
    {
        id: "phone",
        name: "Get a Japanese phone number",
        description: "Get a SIM card or phone plan.",
        category: "Daily Setup",
        requires: [],
        details: {
            what: "Get Japanese sim card",
            where: "DOCOMO - Keyaki Walk Maebashi",
            notes: "I recommend Ahamo. Ask DoCoMo about it, they will give normal sim card, then you apply for Ahamo online."
        }
    },
    {
        id: "bank",
        name: "Open a Japanese bank account",
        description: "Open a bank account for everyday payments and transfers.",
        category: "Daily Setup",
        requires: ["phone"],
        details: {
            what: "Open Japanese bank account",
            where: "Japan Post Office",
            notes: "Yuucho might be the easiest. Seven Bank is good but after 6months."
        }
    },
    {
        id: "paypay",
        name: "Set up PayPay",
        description: "Set up a mobile payment account for everyday purchases.",
        category: "Daily Setup",
        requires: ["phone"],
        details: {
            what: "Set up Paypay account.",
            where: "Online",
            notes: "Might also need bank account."
        }
    },
    {
        id: "credit-card",
        name: "Consider getting a credit card",
        description: "Consider EPOS, Rakuten, or another card that suits you.",
        category: "Daily Setup",
        requires: ["bank"],
        details: {
            what: "Apply for credit card",
            where: "Rakuten - Keyaki Walk",
            notes: "Sometimes Rakuten is available on the 2nd floor. Better to apply in person than online."
        }
    }
];

const taskList = document.getElementById("task-list");

let currentCategory = "";

tasks.forEach((task) => {

    if (task.category !== currentCategory) {
    currentCategory = task.category;

    const categoryTitle = document.createElement("h2");
    categoryTitle.className = "task-category";
    categoryTitle.textContent = currentCategory;

    taskList.appendChild(categoryTitle);

    if (currentCategory === "Daily Setup") {
        const dailyProgress = document.createElement("div");

        dailyProgress.className = "progress-section";

        dailyProgress.innerHTML = `
            <div class="progress-header">
                <strong>Daily Setup</strong>
                <span id="daily-progress-text">0 / 4</span>
            </div>

            <div class="progress-bar">
                <div id="daily-progress-fill"></div>
            </div>
        `;

        taskList.appendChild(dailyProgress);
    }
}

    const taskElement = document.createElement("div");

    taskElement.className = "task";

    taskElement.innerHTML = `
        <div class="task-main">
            <input type="checkbox" id="${task.id}-task">

            <label for="${task.id}-task">
                <strong>${task.name}</strong>
                <small>${task.description}</small>
            </label>

            <button class="task-expand" type="button">＋</button>
        </div>

        <div class="task-details">
            <p><strong>What:</strong> ${task.details.what}</p>
            <p><strong>Where:</strong> ${task.details.where}</p>
            <p><strong>Notes:</strong> ${task.details.notes}</p>
        </div>
    `;

    taskList.appendChild(taskElement);

    if (task.requires.length > 0) {
        const requirementsMet = task.requires.every((requiredTask) => {
            return localStorage.getItem(requiredTask) === "true";
        });

        if (!requirementsMet) {
            taskElement.classList.add("locked");
        }
    }

    const expandButton = taskElement.querySelector(".task-expand");
    const taskDetails = taskElement.querySelector(".task-details");

    expandButton.addEventListener("click", () => {
        if (taskDetails.style.display === "block") {
            taskDetails.style.display = "none";
            expandButton.textContent = "＋";
        } else {
            taskDetails.style.display = "block";
            expandButton.textContent = "−";
        }
    });

    const checkbox = document.getElementById(`${task.id}-task`);

    checkbox.addEventListener("change", async () => {

        localStorage.setItem(task.id, checkbox.checked);

        taskElement.classList.toggle(
            "completed",
            checkbox.checked
        );

        const currentUser = localStorage.getItem("currentUser");

        const { error } = await supabaseClient
            .from("task_progress")
            .upsert(
                {
                    task_id: task.id,
                    completed: checkbox.checked,
                    user_name: currentUser,
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: "task_id"
                }
            );

        if (error) {
            console.error("Could not save task progress:", error);
        }

        updateTaskLocks();
        updateArrivalProgress();
        updateDailyProgress();
    });

    const savedTask = localStorage.getItem(task.id);

    if (savedTask === "true") {
    checkbox.checked = true;
    taskElement.classList.add("completed");
    }
});


updateArrivalProgress();
updateDailyProgress();

function updateTaskLocks() {
    tasks.forEach((task) => {
        const taskElement = document
            .getElementById(`${task.id}-task`)
            .closest(".task");

        const checkbox = document.getElementById(`${task.id}-task`);

        if (task.requires.length === 0) {
            return;
        }

        const requirementsMet = task.requires.every((requiredTask) => {
            return localStorage.getItem(requiredTask) === "true";
        });

        if (requirementsMet) {
            taskElement.classList.remove("locked");
            checkbox.disabled = false;
        } else {
            taskElement.classList.add("locked");
            checkbox.disabled = true;
        }
    });
}

updateTaskLocks();

function updateArrivalProgress() {
    const arrivalTasks = tasks.filter(
        (task) => task.category === "Arrival & Registration"
    );

    let completedCount = 0;

    arrivalTasks.forEach((task) => {
        const checkbox = document.getElementById(`${task.id}-task`);

        if (checkbox && checkbox.checked) {
            completedCount++;
        }
    });

    const totalCount = arrivalTasks.length;

    const progressText =
        document.getElementById("arrival-progress-text");

    const progressFill =
        document.getElementById("arrival-progress-fill");

    if (!progressText || !progressFill) {
        console.log("Arrival progress elements not found yet.");
        return;
    }

    progressText.textContent =
        `${completedCount} / ${totalCount}`;

    progressFill.style.width =
        `${(completedCount / totalCount) * 100}%`;
}

function updateDailyProgress() {
    const dailyTasks = tasks.filter(
        (task) => task.category === "Daily Setup"
    );

    let completedCount = 0;

    dailyTasks.forEach((task) => {
        const checkbox = document.getElementById(`${task.id}-task`);

        if (checkbox && checkbox.checked) {
            completedCount++;
        }
    });

    const totalCount = dailyTasks.length;

    const progressText =
        document.getElementById("daily-progress-text");

    const progressFill =
        document.getElementById("daily-progress-fill");

    if (!progressText || !progressFill) {
        console.log("Daily progress elements not found yet.");
        return;
    }

    progressText.textContent =
        `${completedCount} / ${totalCount}`;

    progressFill.style.width =
        `${(completedCount / totalCount) * 100}%`;
}

async function loadTaskProgress() {
    const { data, error } = await supabaseClient
        .from("task_progress")
        .select("task_id, completed");

    if (error) {
        console.error("Could not load task progress:", error);
        return;
    }

    data.forEach((savedTask) => {
        const checkbox = document.getElementById(
            `${savedTask.task_id}-task`
        );

        if (!checkbox) {
            return;
        }

        checkbox.checked = savedTask.completed;

        const taskElement = checkbox.closest(".task");

        taskElement.classList.toggle(
            "completed",
            savedTask.completed
        );
    });

    updateTaskLocks();
    updateArrivalProgress();
    updateDailyProgress();
}

loadTaskProgress();

const survivalTitles = document.querySelectorAll(".survival-title");

survivalTitles.forEach((title) => {
    title.addEventListener("click", () => {
        const content = title.nextElementSibling;

        if (content.style.display === "block") {
            content.style.display = "none";
            title.querySelector("span").textContent = "＋";
        } else {
            content.style.display = "block";
            title.querySelector("span").textContent = "－";
        }
    });
});

const dateIdeaInput = document.getElementById("date-idea-input");
const addDateButton = document.getElementById("add-date-button");
const dateIdeaList = document.getElementById("date-idea-list");

async function loadDateIdeas() {
    const { data, error } = await supabaseClient
        .from("date_ideas")
        .select("id, idea, created_by, created_at")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Could not load date ideas:", error);
        return;
    }

    displayDateIdeas(data);
}

function displayDateIdeas(dateIdeas) {
    dateIdeaList.innerHTML = "";

    dateIdeas.forEach((dateIdea) => {
        const ideaElement = document.createElement("div");

        ideaElement.className = "date-idea";

        ideaElement.innerHTML = `
            <span>💕 ${dateIdea.idea}</span>
            <button onclick="deleteDateIdea(${dateIdea.id})">❌</button>
        `;

        dateIdeaList.appendChild(ideaElement);
    });
}

addDateButton.addEventListener("click", async () => {
    const idea = dateIdeaInput.value.trim();

    if (idea === "") {
        return;
    }

    const currentUser = localStorage.getItem("currentUser");

    const { error } = await supabaseClient
        .from("date_ideas")
        .insert({
            idea: idea,
            created_by: currentUser
        });

    if (error) {
        console.error("Could not save date idea:", error);
        return;
    }

    dateIdeaInput.value = "";

    loadDateIdeas();
});

async function deleteDateIdea(id) {
    const { error } = await supabaseClient
        .from("date_ideas")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Could not delete date idea:", error);
        return;
    }

    loadDateIdeas();
}

loadDateIdeas();

    