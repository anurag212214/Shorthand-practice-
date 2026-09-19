"use strict";

/* =====================================================
   SHORTHAND PRACTICE PORTAL
   SCRIPT.JS — PART 1/5
   CORE DATA + STORAGE + NAVIGATION
===================================================== */


/* =====================================================
   STORAGE KEYS
===================================================== */

const STORAGE_KEYS = {
    matters: "shorthand_portal_matters",
    students: "shorthand_portal_students",
    results: "shorthand_portal_results",
    settings: "shorthand_portal_settings",
    session: "shorthand_portal_session"
};


/* =====================================================
   PRACTICE TYPES
===================================================== */

const PRACTICE_TYPES = {
    DICTATION: "dictation",
    TRANSCRIBE: "transcribe",
    TYPING: "typing"
};


/* =====================================================
   ADMIN ACCOUNT
===================================================== */

const ADMIN_ACCOUNT = {
    username: "admin",
    password: "admin123",
    name: "Administrator"
};


/* =====================================================
   DEFAULT PRACTICE MATTERS
===================================================== */

const DEFAULT_MATTERS = [
    {
        id: "M001",
        title: "Practice Dictation 01",
        type: PRACTICE_TYPES.DICTATION,
        wpm: 80,
        duration: 5,
        audioUrl: "",
        audioName: "",
        text: "",
        formatting: {
            fontSize: 18,
            bold: false,
            italic: false,
            underline: false,
            alignment: "left"
        },
        published: true,
        createdAt: Date.now()
    },

    {
        id: "M002",
        title: "Practice Transcription 01",
        type: PRACTICE_TYPES.TRANSCRIBE,
        wpm: 100,
        duration: 5,
        audioUrl: "",
        audioName: "",
        text:
            "This is a sample transcription practice matter. " +
            "Students should carefully listen to or read the assigned material " +
            "and type the complete matter as accurately as possible.",
        formatting: {
            fontSize: 18,
            bold: false,
            italic: false,
            underline: false,
            alignment: "left"
        },
        published: true,
        createdAt: Date.now()
    },

    {
        id: "M003",
        title: "English Typing Test 01",
        type: PRACTICE_TYPES.TYPING,
        wpm: 35,
        duration: 10,
        audioUrl: "",
        audioName: "",
        text:
            "Typing is an important skill that improves with regular practice. " +
            "Accuracy, speed and proper keyboard control are essential for " +
            "performing well in a professional typing test.",
        formatting: {
            fontSize: 18,
            bold: false,
            italic: false,
            underline: false,
            alignment: "left"
        },
        published: true,
        createdAt: Date.now()
    }
];


/* =====================================================
   DEFAULT STUDENT
===================================================== */

const DEFAULT_STUDENTS = [
    {
        id: "S001",
        name: "Demo Student",
        username: "student",
        password: "student123",
        status: "active",
        assignedMatterIds: ["M001", "M002", "M003"],
        createdAt: Date.now()
    }
];


/* =====================================================
   DEFAULT SETTINGS
===================================================== */

const DEFAULT_SETTINGS = {
    portalName: "Shorthand Practice Portal",
    defaultFontSize: 18,
    autoSaveResults: true
};


/* =====================================================
   APPLICATION STATE
===================================================== */

let matters = [];
let students = [];
let results = [];
let settings = {};

let currentUser = null;
let currentLoginType = "student";

let editingMatterId = null;
let editingStudentId = null;

let currentPractice = null;

let practiceTimer = null;
let practiceStartedAt = null;
let practiceRemainingSeconds = 0;
let practiceRunning = false;
let practiceSubmitted = false;

let currentAudioObjectUrl = null;


/* =====================================================
   STORAGE HELPERS
===================================================== */

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        const parsed = JSON.parse(value);

        return parsed;
    } catch (error) {
        console.error("Storage read error:", key, error);
        return fallback;
    }
}


function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Storage write error:", key, error);
        return false;
    }
}


/* =====================================================
   INITIALIZE DATA
===================================================== */

function initializeData() {

    matters = readStorage(
        STORAGE_KEYS.matters,
        DEFAULT_MATTERS
    );

    students = readStorage(
        STORAGE_KEYS.students,
        DEFAULT_STUDENTS
    );

    results = readStorage(
        STORAGE_KEYS.results,
        []
    );

    settings = readStorage(
        STORAGE_KEYS.settings,
        DEFAULT_SETTINGS
    );

    if (!Array.isArray(matters)) {
        matters = DEFAULT_MATTERS;
    }

    if (!Array.isArray(students)) {
        students = DEFAULT_STUDENTS;
    }

    if (!Array.isArray(results)) {
        results = [];
    }

    if (!settings || typeof settings !== "object") {
        settings = DEFAULT_SETTINGS;
    }

    writeStorage(STORAGE_KEYS.matters, matters);
    writeStorage(STORAGE_KEYS.students, students);
    writeStorage(STORAGE_KEYS.results, results);
    writeStorage(STORAGE_KEYS.settings, settings);
}


/* =====================================================
   SCREEN HELPERS
===================================================== */

function getScreen(id) {
    return document.getElementById(id);
}


function showScreen(id) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const target = getScreen(id);

    if (target) {
        target.classList.add("active");
    }
}


function hideElement(element) {
    if (element) {
        element.hidden = true;
    }
}


function showElement(element) {
    if (element) {
        element.hidden = false;
    }
}


/* =====================================================
   LOGIN TYPE
===================================================== */

function setLoginType(type) {

    currentLoginType =
        type === "admin"
            ? "admin"
            : "student";

    document
        .querySelectorAll(".login-tab")
        .forEach(tab => {

            const tabType = tab.dataset.loginType;

            tab.classList.toggle(
                "active",
                tabType === currentLoginType
            );
        });

    const usernameInput = getScreen("username");
    const passwordInput = getScreen("password");

    if (usernameInput) {
        usernameInput.value = "";
    }

    if (passwordInput) {
        passwordInput.value = "";
    }

    const loginError = getScreen("loginError");

    if (loginError) {
        loginError.textContent = "";
        loginError.hidden = true;
    }
}


/* =====================================================
   SESSION
===================================================== */

function saveSession(user) {

    if (!user) {
        localStorage.removeItem(STORAGE_KEYS.session);
        return;
    }

    writeStorage(STORAGE_KEYS.session, {
        type: user.type,
        id: user.id || null,
        username: user.username || "",
        name: user.name || ""
    });
}


function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
}


function restoreSession() {

    const session = readStorage(
        STORAGE_KEYS.session,
        null
    );

    if (!session || !session.type) {
        return false;
    }

    if (session.type === "admin") {

        currentUser = {
            type: "admin",
            username: ADMIN_ACCOUNT.username,
            name: ADMIN_ACCOUNT.name
        };

        showAdminScreen();
        return true;
    }

    if (session.type === "student") {

        const student = students.find(
            item => item.id === session.id
        );

        if (
            student &&
            student.status === "active"
        ) {
            currentUser = {
                type: "student",
                id: student.id,
                username: student.username,
                name: student.name
            };

            showStudentScreen();
            return true;
        }
    }

    clearSession();
    return false;
}


/* =====================================================
   ADMIN SCREEN
===================================================== */

function showAdminScreen() {

    showScreen("adminScreen");

    openAdminPage("dashboard");

    renderAdminDashboard();
}


/* =====================================================
   STUDENT SCREEN
===================================================== */

function showStudentScreen() {

    showScreen("studentScreen");

    renderStudentDashboard();
}


/* =====================================================
   ADMIN PAGE NAVIGATION
===================================================== */

function openAdminPage(page) {

    const pages = {
        dashboard: "adminDashboardPage",
        matters: "adminMattersPage",
        students: "adminStudentsPage",
        results: "adminResultsPage",
        settings: "adminSettingsPage"
    };

    Object.values(pages).forEach(id => {

        const element = getScreen(id);

        if (element) {
            element.classList.remove("active");
        }
    });

    const targetId = pages[page] || pages.dashboard;
    const target = getScreen(targetId);

    if (target) {
        target.classList.add("active");
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.adminPage === page
            );
        });

    const title = getScreen("adminPageTitle");

    const titles = {
        dashboard: "Dashboard",
        matters: "Practice Matters",
        students: "Students",
        results: "Results",
        settings: "Settings"
    };

    if (title) {
        title.textContent =
            titles[page] || "Dashboard";
    }
}


/* =====================================================
   ID GENERATOR
===================================================== */

function generateId(prefix) {

    const random =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    return `${prefix}-${random}`;
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   PRACTICE TYPE LABEL
===================================================== */

function getPracticeTypeLabel(type) {

    switch (type) {

        case PRACTICE_TYPES.DICTATION:
            return "🎧 Dictation";

        case PRACTICE_TYPES.TRANSCRIBE:
            return "📝 Transcribe";

        case PRACTICE_TYPES.TYPING:
            return "⌨️ Typing";

        default:
            return "Practice";
    }
}


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(totalSeconds) {

    const seconds = Math.max(
        0,
        Number(totalSeconds) || 0
    );

    const minutes =
        Math.floor(seconds / 60);

    const remaining =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remaining).padStart(2, "0")
    );
}


/* =====================================================
   NUMBER HELPERS
===================================================== */

function safeNumber(value, fallback = 0) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return number;
}


function clamp(value, min, max) {

    const number = safeNumber(value, min);

    return Math.min(
        max,
        Math.max(min, number)
    );
}


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;

function showToast(message) {

    const toast = getScreen("toast");
    const toastMessage = getScreen("toastMessage");

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    stopPracticeTimer();

    currentUser = null;
    currentPractice = null;

    clearSession();

    showScreen("loginScreen");

    const username = getScreen("username");
    const password = getScreen("password");
    const error = getScreen("loginError");

    if (username) {
        username.value = "";
    }

    if (password) {
        password.value = "";
    }

    if (error) {
        error.textContent = "";
        error.hidden = true;
    }

    setLoginType("student");
}


/* =====================================================
   STOP TIMER
===================================================== */

function stopPracticeTimer() {

    if (practiceTimer) {
        clearInterval(practiceTimer);
        practiceTimer = null;
    }

    practiceRunning = false;
}


/* =====================================================
   DOM INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeData();

    setupLoginTabs();
    setupLogoutButtons();
    setupAdminNavigation();

    applyPortalSettings();

    if (!restoreSession()) {
        showScreen("loginScreen");
    }
});


/* =====================================================
   LOGIN TAB EVENTS
===================================================== */

function setupLoginTabs() {

    document
        .querySelectorAll(".login-tab")
        .forEach(tab => {

            tab.addEventListener("click", () => {

                setLoginType(
                    tab.dataset.loginType
                );
            });
        });
}


/* =====================================================
   LOGOUT EVENTS
===================================================== */

function setupLogoutButtons() {

    const adminLogout =
        getScreen("adminLogout");

    const studentLogout =
        getScreen("studentLogout");

    const exitPractice =
        getScreen("exitPractice");

    if (adminLogout) {
        adminLogout.addEventListener(
            "click",
            logout
        );
    }

    if (studentLogout) {
        studentLogout.addEventListener(
            "click",
            logout
        );
    }

    if (exitPractice) {
        exitPractice.addEventListener(
            "click",
            () => {

                if (practiceRunning) {
                    showToast(
                        "Practice is running. Submit the test before exiting."
                    );
                    return;
                }

                currentPractice = null;
                showStudentScreen();
            }
        );
    }
}


/* =====================================================
   ADMIN NAVIGATION EVENTS
===================================================== */

function setupAdminNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener("click", () => {

                const page =
                    item.dataset.adminPage;

                if (!page) {
                    return;
                }

                openAdminPage(page);

                if (page === "dashboard") {
                    renderAdminDashboard();
                }

                if (page === "matters") {
                    renderMattersTable();
                }

                if (page === "students") {
                    renderStudentsTable();
                }

                if (page === "results") {
                    renderResultsTable();
                }

                if (page === "settings") {
                    loadSettingsForm();
                }
            });
        });
}


/* =====================================================
   APPLY PORTAL SETTINGS
===================================================== */

function applyPortalSettings() {

    const portalName =
        settings.portalName ||
        DEFAULT_SETTINGS.portalName;

    document.title = portalName;

    document
        .querySelectorAll("[data-portal-name]")
        .forEach(element => {
            element.textContent = portalName;
        });
}


/* =====================================================
   BASIC DATA FINDERS
===================================================== */

function findMatterById(id) {

    return matters.find(
        matter => matter.id === id
    ) || null;
}


function findStudentById(id) {

    return students.find(
        student => student.id === id
    ) || null;
}


/* =====================================================
   RESULT DATE
===================================================== */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   RESULT TIME
===================================================== */

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
      }
/* =====================================================
   SHORTHAND PRACTICE PORTAL
   SCRIPT.JS — PART 2/5
   LOGIN + DASHBOARDS + MATTER RENDERING
===================================================== */


/* =====================================================
   LOGIN
===================================================== */

function handleLogin(event) {

    event.preventDefault();

    const usernameInput = getScreen("username");
    const passwordInput = getScreen("password");
    const loginError = getScreen("loginError");

    if (!usernameInput || !passwordInput) {
        return;
    }

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;

    if (loginError) {
        loginError.textContent = "";
        loginError.hidden = true;
    }

    if (!username || !password) {

        if (loginError) {
            loginError.textContent =
                "Please enter username and password.";
            loginError.hidden = false;
        }

        return;
    }


    /* -------------------------------------------------
       ADMIN LOGIN
    ------------------------------------------------- */

    if (currentLoginType === "admin") {

        if (
            username === ADMIN_ACCOUNT.username &&
            password === ADMIN_ACCOUNT.password
        ) {

            currentUser = {
                type: "admin",
                username: ADMIN_ACCOUNT.username,
                name: ADMIN_ACCOUNT.name
            };

            saveSession(currentUser);

            showAdminScreen();

            return;
        }

        if (loginError) {
            loginError.textContent =
                "Invalid admin username or password.";
            loginError.hidden = false;
        }

        return;
    }


    /* -------------------------------------------------
       STUDENT LOGIN
    ------------------------------------------------- */

    const student = students.find(item =>
        item.username.toLowerCase() ===
            username.toLowerCase() &&
        item.password === password
    );

    if (!student) {

        if (loginError) {
            loginError.textContent =
                "Invalid student ID/username or password.";
            loginError.hidden = false;
        }

        return;
    }

    if (student.status !== "active") {

        if (loginError) {
            loginError.textContent =
                "Your student account is currently inactive.";
            loginError.hidden = false;
        }

        return;
    }

    currentUser = {
        type: "student",
        id: student.id,
        username: student.username,
        name: student.name
    };

    saveSession(currentUser);

    showStudentScreen();
}


/* =====================================================
   LOGIN FORM SETUP
===================================================== */

function setupLoginForm() {

    const form = getScreen("loginForm");

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        handleLogin
    );
}


/* =====================================================
   ADMIN DASHBOARD
===================================================== */

function renderAdminDashboard() {

    const statMatters =
        getScreen("statMatters");

    const statStudents =
        getScreen("statStudents");

    const statAttempts =
        getScreen("statAttempts");

    const statAccuracy =
        getScreen("statAccuracy");


    if (statMatters) {
        statMatters.textContent =
            matters.length;
    }

    if (statStudents) {
        statStudents.textContent =
            students.length;
    }

    if (statAttempts) {
        statAttempts.textContent =
            results.length;
    }


    let averageAccuracy = 0;

    if (results.length > 0) {

        const totalAccuracy =
            results.reduce(
                (sum, result) =>
                    sum +
                    safeNumber(
                        result.accuracy,
                        0
                    ),
                0
            );

        averageAccuracy =
            totalAccuracy / results.length;
    }

    if (statAccuracy) {
        statAccuracy.textContent =
            `${averageAccuracy.toFixed(1)}%`;
    }

    renderRecentMatters();
    renderRecentResults();
}


/* =====================================================
   RECENT MATTERS
===================================================== */

function renderRecentMatters() {

    const container =
        getScreen("recentMatters");

    if (!container) {
        return;
    }

    const recent =
        [...matters]
            .sort(
                (a, b) =>
                    safeNumber(b.createdAt) -
                    safeNumber(a.createdAt)
            )
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <div>No practice matters yet.</div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        recent.map(matter => {

            const typeClass =
                `type-${matter.type}`;

            return `
                <div class="recent-item">
                    <div class="recent-item-main">
                        <strong>
                            ${escapeHtml(matter.title)}
                        </strong>

                        <span class="type-badge ${typeClass}">
                            ${escapeHtml(
                                getPracticeTypeLabel(
                                    matter.type
                                )
                            )}
                        </span>
                    </div>

                    <div class="recent-item-meta">
                        ${safeNumber(matter.wpm)} WPM
                        ·
                        ${safeNumber(matter.duration)} min
                    </div>
                </div>
            `;
        }).join("");
}


/* =====================================================
   RECENT RESULTS
===================================================== */

function renderRecentResults() {

    const container =
        getScreen("recentResults");

    if (!container) {
        return;
    }

    const recent =
        [...results]
            .sort(
                (a, b) =>
                    safeNumber(b.submittedAt) -
                    safeNumber(a.submittedAt)
            )
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div>No results yet.</div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        recent.map(result => {

            const student =
                findStudentById(
                    result.studentId
                );

            const matter =
                findMatterById(
                    result.matterId
                );

            return `
                <div class="recent-item">
                    <div class="recent-item-main">
                        <strong>
                            ${escapeHtml(
                                student
                                    ? student.name
                                    : "Unknown Student"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                matter
                                    ? matter.title
                                    : "Unknown Matter"
                            )}
                        </span>
                    </div>

                    <div class="recent-item-meta">
                        ${safeNumber(result.wpm).toFixed(1)}
                        WPM
                        ·
                        ${safeNumber(result.accuracy).toFixed(1)}%
                    </div>
                </div>
            `;
        }).join("");
}


/* =====================================================
   STUDENT DASHBOARD
===================================================== */

function renderStudentDashboard() {

    if (!currentUser || currentUser.type !== "student") {
        return;
    }

    const student =
        findStudentById(
            currentUser.id
        );

    if (!student) {
        logout();
        return;
    }


    const welcomeName =
        getScreen("studentWelcomeName");

    const displayName =
        getScreen("studentDisplayName");

    const displayId =
        getScreen("studentDisplayId");


    if (welcomeName) {
        welcomeName.textContent =
            student.name;
    }

    if (displayName) {
        displayName.textContent =
            student.name;
    }

    if (displayId) {
        displayId.textContent =
            student.username;
    }


    const studentResults =
        results.filter(
            result =>
                result.studentId === student.id
        );


    const completed =
        getScreen("studentCompleted");

    const averageWpm =
        getScreen("studentAverageWpm");

    const averageAccuracy =
        getScreen("studentAverageAccuracy");


    if (completed) {
        completed.textContent =
            studentResults.length;
    }


    let avgWpm = 0;
    let avgAccuracy = 0;


    if (studentResults.length > 0) {

        avgWpm =
            studentResults.reduce(
                (sum, result) =>
                    sum +
                    safeNumber(
                        result.wpm,
                        0
                    ),
                0
            ) /
            studentResults.length;

        avgAccuracy =
            studentResults.reduce(
                (sum, result) =>
                    sum +
                    safeNumber(
                        result.accuracy,
                        0
                    ),
                0
            ) /
            studentResults.length;
    }


    if (averageWpm) {
        averageWpm.textContent =
            avgWpm.toFixed(1);
    }

    if (averageAccuracy) {
        averageAccuracy.textContent =
            `${avgAccuracy.toFixed(1)}%`;
    }


    renderStudentMatterCards(student);
    renderStudentHistory(student);
}


/* =====================================================
   STUDENT ASSIGNED MATTERS
===================================================== */

function renderStudentMatterCards(student) {

    const container =
        getScreen("studentMatterCards");

    if (!container) {
        return;
    }


    const assignedIds =
        Array.isArray(
            student.assignedMatterIds
        )
            ? student.assignedMatterIds
            : [];


    const assignedMatters =
        matters.filter(matter =>
            assignedIds.includes(
                matter.id
            ) &&
            matter.published
        );


    if (assignedMatters.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <div>
                    No practice has been assigned yet.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        assignedMatters.map(matter => {

            const typeClass =
                `type-${matter.type}`;

            const icon =
                matter.type ===
                    PRACTICE_TYPES.DICTATION
                    ? "🎧"
                    : matter.type ===
                        PRACTICE_TYPES.TRANSCRIBE
                        ? "📝"
                        : "⌨️";


            return `
                <article
                    class="student-matter-card"
                    data-matter-id="${escapeHtml(
                        matter.id
                    )}"
                >

                    <div class="matter-card-icon">
                        ${icon}
                    </div>

                    <div class="matter-card-content">

                        <div class="matter-card-top">
                            <span class="type-badge ${typeClass}">
                                ${escapeHtml(
                                    getPracticeTypeLabel(
                                        matter.type
                                    )
                                )}
                            </span>
                        </div>

                        <h3>
                            ${escapeHtml(
                                matter.title
                            )}
                        </h3>

                        <div class="matter-card-meta">
                            <span>
                                ⚡ ${safeNumber(
                                    matter.wpm
                                )} WPM
                            </span>

                            <span>
                                ⏱ ${safeNumber(
                                    matter.duration
                                )} min
                            </span>
                        </div>

                        <button
                            type="button"
                            class="primary-button start-matter-button"
                            data-start-matter="${escapeHtml(
                                matter.id
                            )}"
                        >
                            Start Practice
                        </button>

                    </div>

                </article>
            `;
        }).join("");


    container
        .querySelectorAll(
            "[data-start-matter]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const matterId =
                        button.dataset.startMatter;

                    startPractice(
                        matterId
                    );
                }
            );
        });
}


/* =====================================================
   STUDENT HISTORY
===================================================== */

function renderStudentHistory(student) {

    const container =
        getScreen("studentHistory");

    if (!container) {
        return;
    }


    const studentResults =
        results
            .filter(
                result =>
                    result.studentId ===
                    student.id
            )
            .sort(
                (a, b) =>
                    safeNumber(b.submittedAt) -
                    safeNumber(a.submittedAt)
            )
            .slice(0, 10);


    if (studentResults.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📈</div>
                <div>
                    Your completed practice results will appear here.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        studentResults.map(result => {

            const matter =
                findMatterById(
                    result.matterId
                );

            return `
                <div class="history-item">

                    <div class="history-main">

                        <strong>
                            ${escapeHtml(
                                matter
                                    ? matter.title
                                    : "Practice"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                getPracticeTypeLabel(
                                    result.practiceType
                                )
                            )}
                        </span>

                    </div>

                    <div class="history-result">

                        <strong>
                            ${safeNumber(
                                result.wpm
                            ).toFixed(1)}
                            WPM
                        </strong>

                        <span>
                            ${safeNumber(
                                result.accuracy
                            ).toFixed(1)}%
                        </span>

                        <small>
                            ${formatDate(
                                result.submittedAt
                            )}
                        </small>

                    </div>

                </div>
            `;
        }).join("");
}


/* =====================================================
   MATTER TABLE ACTIONS
===================================================== */

function bindMatterTableActions() {

    document
        .querySelectorAll(
            "[data-edit-matter]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openMatterEditor(
                        button.dataset.editMatter
                    );
                }
            );
        });


    document
        .querySelectorAll(
            "[data-toggle-matter]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleMatterPublished(
                        button.dataset.toggleMatter
                    );
                }
            );
        });


    document
        .querySelectorAll(
            "[data-delete-matter]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteMatter(
                        button.dataset.deleteMatter
                    );
                }
            );
        });
}


/* =====================================================
   MATTER SEARCH
===================================================== */

function setupMatterSearch() {

    const search =
        getScreen("matterSearch");

    if (!search) {
        return;
    }

    search.addEventListener(
        "input",
        renderMattersTable
    );
}/* =====================================================
   SHORTHAND PRACTICE PORTAL
   SCRIPT.JS — PART 3/5
   MATTER + STUDENT MANAGEMENT + SETTINGS
===================================================== */


/* =====================================================
   MATTER EDITOR
===================================================== */

function openMatterEditor(matterId = null) {

    const editor =
        getScreen("matterEditor");

    const title =
        getScreen("matterEditorTitle");

    const form =
        getScreen("matterForm");

    const matterTitle =
        getScreen("matterTitle");

    const matterWpm =
        getScreen("matterWpm");

    const matterDuration =
        getScreen("matterDuration");

    const matterType =
        getScreen("matterType");

    const matterText =
        getScreen("matterText");

    const matterAudio =
        getScreen("matterAudio");

    const matterAudioName =
        getScreen("matterAudioName");

    const matterAudioGroup =
        getScreen("matterAudioGroup");

    const matterTextGroup =
        getScreen("matterTextGroup");

    const matterFormattingGroup =
        getScreen("matterFormattingGroup");


    if (!editor || !form) {
        return;
    }


    editingMatterId =
        matterId || null;


    if (editingMatterId) {

        const matter =
            findMatterById(
                editingMatterId
            );

        if (!matter) {
            showToast("Practice matter not found.");
            return;
        }


        if (title) {
            title.textContent =
                "Edit Practice Matter";
        }

        if (matterTitle) {
            matterTitle.value =
                matter.title || "";
        }

        if (matterType) {
            matterType.value =
                matter.type || PRACTICE_TYPES.TYPING;
        }

        if (matterWpm) {
            matterWpm.value =
                safeNumber(matter.wpm, 35);
        }

        if (matterDuration) {
            matterDuration.value =
                safeNumber(matter.duration, 10);
        }

        if (matterText) {
            matterText.value =
                matter.text || "";
        }

        if (matterAudio) {
            matterAudio.value = "";
        }

        if (matterAudioName) {
            matterAudioName.textContent =
                matter.audioName
                    ? `Current file: ${matter.audioName}`
                    : "No audio file selected.";
        }

        setMatterFormatting(
            matter.formatting
        );

    } else {

        if (title) {
            title.textContent =
                "Create New Practice Matter";
        }

        form.reset();

        if (matterType) {
            matterType.value =
                PRACTICE_TYPES.TYPING;
        }

        if (matterWpm) {
            matterWpm.value = 35;
        }

        if (matterDuration) {
            matterDuration.value = 10;
        }

        if (matterAudioName) {
            matterAudioName.textContent =
                "No audio file selected.";
        }

        setMatterFormatting({
            fontSize: 18,
            bold: false,
            italic: false,
            underline: false,
            alignment: "left"
        });
    }


    updateMatterEditorMode();

    editor.hidden = false;

    editor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =====================================================
   CLOSE MATTER EDITOR
===================================================== */

function closeMatterEditor() {

    const editor =
        getScreen("matterEditor");

    const form =
        getScreen("matterForm");

    editingMatterId = null;

    if (form) {
        form.reset();
    }

    if (editor) {
        editor.hidden = true;
    }

    updateMatterEditorMode();
}


/* =====================================================
   MATTER TYPE UI
===================================================== */

function updateMatterEditorMode() {

    const matterType =
        getScreen("matterType");

    if (!matterType) {
        return;
    }

    const type =
        matterType.value;


    const audioGroup =
        getScreen("matterAudioGroup");

    const textGroup =
        getScreen("matterTextGroup");

    const formattingGroup =
        getScreen("matterFormattingGroup");


    if (audioGroup) {
        audioGroup.hidden =
            type !== PRACTICE_TYPES.DICTATION;
    }


    if (textGroup) {
        textGroup.hidden =
            type === PRACTICE_TYPES.DICTATION;
    }


    if (formattingGroup) {
        formattingGroup.hidden =
            type !== PRACTICE_TYPES.TYPING;
    }
}


/* =====================================================
   AUDIO FILE NAME
===================================================== */

function setupAudioInput() {

    const audioInput =
        getScreen("matterAudio");

    const audioName =
        getScreen("matterAudioName");

    if (!audioInput) {
        return;
    }

    audioInput.addEventListener(
        "change",
        () => {

            const file =
                audioInput.files &&
                audioInput.files[0];

            if (!file) {

                if (audioName) {
                    audioName.textContent =
                        "No audio file selected.";
                }

                return;
            }


            if (!file.type.startsWith("audio/")) {

                audioInput.value = "";

                if (audioName) {
                    audioName.textContent =
                        "Please select a valid audio file.";
                }

                showToast(
                    "Please select an audio file."
                );

                return;
            }


            if (audioName) {
                audioName.textContent =
                    `${file.name} (${formatFileSize(
                        file.size
                    )})`;
            }
        }
    );
}


/* =====================================================
   FILE SIZE
===================================================== */

function formatFileSize(bytes) {

    const size =
        safeNumber(bytes, 0);

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(
        size /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}


/* =====================================================
   FORMATTING HELPERS
===================================================== */

function getFormattingFromForm() {

    const fontSize =
        getScreen("matterFontSize");

    const bold =
        getScreen("matterBold");

    const italic =
        getScreen("matterItalic");

    const underline =
        getScreen("matterUnderline");

    const alignment =
        getScreen("matterAlignment");


    return {
        fontSize: clamp(
            fontSize
                ? fontSize.value
                : 18,
            10,
            48
        ),

        bold:
            bold
                ? bold.checked
                : false,

        italic:
            italic
                ? italic.checked
                : false,

        underline:
            underline
                ? underline.checked
                : false,

        alignment:
            alignment
                ? alignment.value
                : "left"
    };
}


function setMatterFormatting(formatting = {}) {

    const fontSize =
        getScreen("matterFontSize");

    const bold =
        getScreen("matterBold");

    const italic =
        getScreen("matterItalic");

    const underline =
        getScreen("matterUnderline");

    const alignment =
        getScreen("matterAlignment");


    if (fontSize) {
        fontSize.value =
            clamp(
                formatting.fontSize || 18,
                10,
                48
            );
    }

    if (bold) {
        bold.checked =
            Boolean(formatting.bold);
    }

    if (italic) {
        italic.checked =
            Boolean(formatting.italic);
    }

    if (underline) {
        underline.checked =
            Boolean(formatting.underline);
    }

    if (alignment) {
        alignment.value =
            formatting.alignment || "left";
    }
}


/* =====================================================
   SAVE MATTER
===================================================== */

function saveMatter(event) {

    event.preventDefault();

    const titleInput =
        getScreen("matterTitle");

    const typeInput =
        getScreen("matterType");

    const wpmInput =
        getScreen("matterWpm");

    const durationInput =
        getScreen("matterDuration");

    const textInput =
        getScreen("matterText");

    const audioInput =
        getScreen("matterAudio");


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";

    const type =
        typeInput
            ? typeInput.value
            : PRACTICE_TYPES.TYPING;

    const wpm =
        clamp(
            wpmInput
                ? wpmInput.value
                : 35,
            1,
            300
        );

    const duration =
        clamp(
            durationInput
                ? durationInput.value
                : 10,
            1,
            180
        );

    const text =
        textInput
            ? textInput.value.trim()
            : "";


    if (!title) {
        showToast(
            "Please enter a practice title."
        );
        return;
    }


    if (
        type !== PRACTICE_TYPES.DICTATION &&
        !text
    ) {
        showToast(
            "Please enter the practice matter."
        );
        return;
    }


    if (
        type === PRACTICE_TYPES.DICTATION &&
        !editingMatterId &&
        (!audioInput ||
            !audioInput.files ||
            !audioInput.files[0])
    ) {
        showToast(
            "Please select an audio file for dictation."
        );
        return;
    }


    let matter;


    if (editingMatterId) {

        matter =
            findMatterById(
                editingMatterId
            );

        if (!matter) {
            showToast(
                "Practice matter not found."
            );
            return;
        }

    } else {

        matter = {
            id: generateId("M"),
            createdAt: Date.now(),
            published: false,
            audioUrl: "",
            audioName: "",
            formatting: {}
        };

        matters.push(matter);
    }


    matter.title = title;
    matter.type = type;
    matter.wpm = wpm;
    matter.duration = duration;
    matter.text = text;


    /* -------------------------------------------------
       FORMATTING
    ------------------------------------------------- */

    matter.formatting =
        type === PRACTICE_TYPES.TYPING
            ? getFormattingFromForm()
            : {
                fontSize: 18,
                bold: false,
                italic: false,
                underline: false,
                alignment: "left"
            };


    /* -------------------------------------------------
       AUDIO
    ------------------------------------------------- */

    if (
        type === PRACTICE_TYPES.DICTATION &&
        audioInput &&
        audioInput.files &&
        audioInput.files[0]
    ) {

        const file =
            audioInput.files[0];

        if (currentAudioObjectUrl) {
            URL.revokeObjectURL(
                currentAudioObjectUrl
            );
        }

        currentAudioObjectUrl =
            URL.createObjectURL(file);

        matter.audioUrl =
            currentAudioObjectUrl;

        matter.audioName =
            file.name;
    }


    writeStorage(
        STORAGE_KEYS.matters,
        matters
    );


    closeMatterEditor();

    renderMattersTable();
    renderAdminDashboard();

    showToast(
        editingMatterId
            ? "Practice matter updated."
            : "Practice matter created."
    );
}


/* =====================================================
   TOGGLE PUBLISH
===================================================== */

function toggleMatterPublished(matterId) {

    const matter =
        findMatterById(matterId);

    if (!matter) {
        return;
    }

    matter.published =
        !matter.published;

    writeStorage(
        STORAGE_KEYS.matters,
        matters
    );

    renderMattersTable();
    renderAdminDashboard();

    showToast(
        matter.published
            ? "Practice published."
            : "Practice moved to draft."
    );
}


/* =====================================================
   DELETE MATTER
===================================================== */

function deleteMatter(matterId) {

    const matter =
        findMatterById(matterId);

    if (!matter) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${matter.title}"?`
        );

    if (!confirmed) {
        return;
    }


    matters =
        matters.filter(
            item => item.id !== matterId
        );


    students.forEach(student => {

        if (
            Array.isArray(
                student.assignedMatterIds
            )
        ) {
            student.assignedMatterIds =
                student.assignedMatterIds.filter(
                    id => id !== matterId
                );
        }
    });


    writeStorage(
        STORAGE_KEYS.matters,
        matters
    );

    writeStorage(
        STORAGE_KEYS.students,
        students
    );


    renderMattersTable();
    renderAdminDashboard();

    showToast(
        "Practice matter deleted."
    );
}


/* =====================================================
   STUDENT TABLE
===================================================== */

function renderStudentsTable() {

    const table =
        getScreen("studentsTable");

    if (!table) {
        return;
    }


    const sorted =
        [...students].sort(
            (a, b) =>
                safeNumber(b.createdAt) -
                safeNumber(a.createdAt)
        );


    if (sorted.length === 0) {

        table.innerHTML = `
            <tbody>
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            No students found.
                        </div>
                    </td>
                </tr>
            </tbody>
        `;

        return;
    }


    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Assigned</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>

        <tbody>

            ${sorted.map(student => {

                const assignedCount =
                    Array.isArray(
                        student.assignedMatterIds
                    )
                        ? student.assignedMatterIds.length
                        : 0;

                const statusClass =
                    student.status === "active"
                        ? "status-active"
                        : "status-inactive";

                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    student.id
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                student.name
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                student.username
                            )}
                        </td>

                        <td>
                            ${assignedCount}
                        </td>

                        <td>
                            <span class="status-badge ${statusClass}">
                                ${escapeHtml(
                                    student.status
                                )}
                            </span>
                        </td>

                        <td>

                            <div class="table-actions">

                                <button
                                    type="button"
                                    class="table-action"
                                    data-edit-student="${escapeHtml(
                                        student.id
                                    )}"
                                    title="Edit"
                                >
                                    ✏️
                                </button>

                                <button
                                    type="button"
                                    class="table-action"
                                    data-toggle-student="${escapeHtml(
                                        student.id
                                    )}"
                                    title="Activate / Deactivate"
                                >
                                    ${student.status === "active"
                                        ? "🔒"
                                        : "🔓"}
                                </button>

                                <button
                                    type="button"
                                    class="table-action danger"
                                    data-delete-student="${escapeHtml(
                                        student.id
                                    )}"
                                    title="Delete"
                                >
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }).join("")}

        </tbody>
    `;


    bindStudentTableActions();
}


/* =====================================================
   STUDENT EDITOR
===================================================== */

function openStudentEditor(studentId = null) {

    const editor =
        getScreen("studentEditor");

    const title =
        getScreen("studentEditorTitle");

    const form =
        getScreen("studentForm");

    const nameInput =
        getScreen("studentName");

    const idInput =
        getScreen("studentId");

    const passwordInput =
        getScreen("studentPassword");

    const statusInput =
        getScreen("studentStatus");


    if (!editor || !form) {
        return;
    }


    editingStudentId =
        studentId || null;


    if (editingStudentId) {

        const student =
            findStudentById(
                editingStudentId
            );

        if (!student) {
            showToast("Student not found.");
            return;
        }


        if (title) {
            title.textContent =
                "Edit Student";
        }

        if (nameInput) {
            nameInput.value =
                student.name || "";
        }

        if (idInput) {
            idInput.value =
                student.username || "";
        }

        if (passwordInput) {
            passwordInput.value =
                student.password || "";
        }

        if (statusInput) {
            statusInput.value =
                student.status || "active";
        }

    } else {

        if (title) {
            title.textContent =
                "Create New Student";
        }

        form.reset();

        if (statusInput) {
            statusInput.value =
                "active";
        }
    }


    editor.hidden = false;

    editor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =====================================================
   CLOSE STUDENT EDITOR
===================================================== */

function closeStudentEditor() {

    const editor =
        getScreen("studentEditor");

    const form =
        getScreen("studentForm");

    editingStudentId = null;

    if (form) {
        form.reset();
    }

    if (editor) {
        editor.hidden = true;
    }
}


/* =====================================================
   SAVE STUDENT
===================================================== */

function saveStudent(event) {

    event.preventDefault();

    const nameInput =
        getScreen("studentName");

    const idInput =
        getScreen("studentId");

    const passwordInput =
        getScreen("studentPassword");

    const statusInput =
        getScreen("studentStatus");


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const username =
        idInput
            ? idInput.value.trim()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";

    const status =
        statusInput
            ? statusInput.value
            : "active";


    if (!name) {
        showToast(
            "Please enter student name."
        );
        return;
    }


    if (!username) {
        showToast(
            "Please enter Student ID / username."
        );
        return;
    }


    if (!password) {
        showToast(
            "Please enter a password."
        );
        return;
    }


    const duplicate =
        students.find(student =>
            student.username.toLowerCase() ===
                username.toLowerCase() &&
            student.id !== editingStudentId
        );


    if (duplicate) {
        showToast(
            "This Student ID / username is already in use."
        );
        return;
    }


    let student;


    if (editingStudentId) {

        student =
            findStudentById(
                editingStudentId
            );

        if (!student) {
            showToast("Student not found.");
            return;
        }

    } else {

        student = {
            id: generateId("S"),
            createdAt: Date.now(),
            assignedMatterIds: []
        };

        students.push(student);
    }


    student.name = name;
    student.username = username;
    student.password = password;
    student.status =
        status === "inactive"
            ? "inactive"
            : "active";


    writeStorage(
        STORAGE_KEYS.students,
        students
    );


    closeStudentEditor();

    renderStudentsTable();
    renderAdminDashboard();

    showToast(
        editingStudentId
            ? "Student updated."
            : "Student created."
    );
}/* =====================================================
   STUDENT TABLE ACTIONS
===================================================== */

function bindStudentTableActions() {

    document
        .querySelectorAll(
            "[data-edit-student]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openStudentEditor(
                        button.dataset.editStudent
                    );
                }
            );
        });


    document
        .querySelectorAll(
            "[data-toggle-student]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleStudentStatus(
                        button.dataset.toggleStudent
                    );
                }
            );
        });


    document
        .querySelectorAll(
            "[data-delete-student]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteStudent(
                        button.dataset.deleteStudent
                    );
                }
            );
        });
}


/* =====================================================
   TOGGLE STUDENT STATUS
===================================================== */

function toggleStudentStatus(studentId) {

    const student =
        findStudentById(studentId);

    if (!student) {
        return;
    }


    student.status =
        student.status === "active"
            ? "inactive"
            : "active";


    writeStorage(
        STORAGE_KEYS.students,
        students
    );


    renderStudentsTable();
    renderAdminDashboard();

    showToast(
        student.status === "active"
            ? "Student activated."
            : "Student deactivated."
    );
}


/* =====================================================
   DELETE STUDENT
===================================================== */

function deleteStudent(studentId) {

    const student =
        findStudentById(studentId);

    if (!student) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete student "${student.name}"?`
        );

    if (!confirmed) {
        return;
    }


    students =
        students.filter(
            item => item.id !== studentId
        );


    results =
        results.filter(
            result =>
                result.studentId !== studentId
        );


    writeStorage(
        STORAGE_KEYS.students,
        students
    );

    writeStorage(
        STORAGE_KEYS.results,
        results
    );


    renderStudentsTable();
    renderAdminDashboard();

    showToast(
        "Student deleted."
    );
}


/* =====================================================
   SETTINGS
===================================================== */

function loadSettingsForm() {

    const portalName =
        getScreen("portalName");

    const defaultFontSize =
        getScreen("defaultFontSize");

    const autoSaveResults =
        getScreen("autoSaveResults");


    if (portalName) {
        portalName.value =
            settings.portalName ||
            DEFAULT_SETTINGS.portalName;
    }

    if (defaultFontSize) {
        defaultFontSize.value =
            clamp(
                settings.defaultFontSize ||
                    DEFAULT_SETTINGS.defaultFontSize,
                10,
                48
            );
    }

    if (autoSaveResults) {
        autoSaveResults.checked =
            settings.autoSaveResults !== false;
    }
}


/* =====================================================
   SAVE SETTINGS
===================================================== */

function saveSettings(event) {

    if (event) {
        event.preventDefault();
    }


    const portalName =
        getScreen("portalName");

    const defaultFontSize =
        getScreen("defaultFontSize");

    const autoSaveResults =
        getScreen("autoSaveResults");


    const newPortalName =
        portalName
            ? portalName.value.trim()
            : DEFAULT_SETTINGS.portalName;


    if (!newPortalName) {
        showToast(
            "Please enter a portal name."
        );
        return;
    }


    settings = {
        portalName: newPortalName,

        defaultFontSize:
            clamp(
                defaultFontSize
                    ? defaultFontSize.value
                    : 18,
                10,
                48
            ),

        autoSaveResults:
            autoSaveResults
                ? autoSaveResults.checked
                : true
    };


    writeStorage(
        STORAGE_KEYS.settings,
        settings
    );


    applyPortalSettings();

    showToast(
        "Settings saved successfully."
    );
}/* =====================================================
   SHORTHAND PRACTICE PORTAL
   SCRIPT.JS — PART 4/5
   PRACTICE ENGINE + TIMER + TYPING / TRANSCRIBE / DICTATION
===================================================== */


/* =====================================================
   START PRACTICE
===================================================== */

function startPractice(matterId) {

    const matter =
        findMatterById(matterId);

    if (!matter) {
        showToast(
            "Practice matter not found."
        );
        return;
    }


    if (!matter.published) {
        showToast(
            "This practice is not currently available."
        );
        return;
    }


    if (
        !currentUser ||
        currentUser.type !== "student"
    ) {
        showToast(
            "Please login as a student first."
        );
        return;
    }


    const student =
        findStudentById(
            currentUser.id
        );

    if (!student) {
        logout();
        return;
    }


    if (
        !Array.isArray(
            student.assignedMatterIds
        ) ||
        !student.assignedMatterIds.includes(
            matter.id
        )
    ) {
        showToast(
            "This practice is not assigned to you."
        );
        return;
    }


    stopPracticeTimer();


    currentPractice = {
        matterId: matter.id,
        studentId: student.id,
        type: matter.type,
        title: matter.title,
        wpm: safeNumber(
            matter.wpm,
            35
        ),
        duration: safeNumber(
            matter.duration,
            10
        ),
        text: matter.text || "",
        audioUrl: matter.audioUrl || "",
        audioName: matter.audioName || "",
        formatting:
            matter.formatting || {}
    };


    practiceStartedAt = null;
    practiceRemainingSeconds =
        currentPractice.duration * 60;

    practiceRunning = false;
    practiceSubmitted = false;


    preparePracticeScreen();

    showScreen("practiceScreen");
}


/* =====================================================
   PREPARE PRACTICE SCREEN
===================================================== */

function preparePracticeScreen() {

    if (!currentPractice) {
        return;
    }


    const practiceTitle =
        getScreen("practiceTitle");

    const practiceTypeLabel =
        getScreen("practiceTypeLabel");

    const timer =
        getScreen("timer");

    const liveWpm =
        getScreen("liveWpm");

    const liveWords =
        getScreen("liveWords");

    const typingStatus =
        getScreen("typingStatus");

    const typingArea =
        getScreen("typingArea");

    const practiceTarget =
        getScreen("practiceTarget");

    const dictationAudioArea =
        getScreen("dictationAudioArea");

    const typingReferenceArea =
        getScreen("typingReferenceArea");

    const transcribeInstruction =
        getScreen("transcribeInstruction");

    const dictationAudio =
        getScreen("dictationAudio");

    const typingReference =
        getScreen("typingReference");

    const liveErrorStatus =
        getScreen("liveErrorStatus");

    const characterCount =
        getScreen("characterCount");

    const practiceModeHint =
        getScreen("practiceModeHint");

    const startButton =
        getScreen("startPractice");

    const finishButton =
        getScreen("finishPractice");

    const resetButton =
        getScreen("resetPractice");


    if (practiceTitle) {
        practiceTitle.textContent =
            currentPractice.title;
    }

    if (practiceTypeLabel) {
        practiceTypeLabel.textContent =
            getPracticeTypeLabel(
                currentPractice.type
            );
    }

    if (timer) {
        timer.textContent =
            formatTime(
                practiceRemainingSeconds
            );
    }

    if (liveWpm) {
        liveWpm.textContent = "—";
    }

    if (liveWords) {
        liveWords.textContent = "—";
    }

    if (typingStatus) {
        typingStatus.textContent =
            "Ready";
        typingStatus.className =
            "status-ready";
    }

    if (liveErrorStatus) {
        liveErrorStatus.textContent = "";
    }

    if (characterCount) {
        characterCount.textContent =
            "0 characters";
    }


    if (typingArea) {
        typingArea.value = "";
        typingArea.disabled = true;
    }


    if (startButton) {
        startButton.disabled = false;
        startButton.hidden = false;
    }

    if (finishButton) {
        finishButton.disabled = true;
        finishButton.hidden = false;
    }

    if (resetButton) {
        resetButton.hidden = true;
    }


    /* -------------------------------------------------
       DEFAULT VISIBILITY
    ------------------------------------------------- */

    if (dictationAudioArea) {
        dictationAudioArea.hidden = true;
    }

    if (typingReferenceArea) {
        typingReferenceArea.hidden = true;
    }

    if (transcribeInstruction) {
        transcribeInstruction.hidden = true;
    }

    if (practiceTarget) {
        practiceTarget.hidden = true;
        practiceTarget.textContent = "";
    }


    /* -------------------------------------------------
       DICTATION
    ------------------------------------------------- */

    if (
        currentPractice.type ===
        PRACTICE_TYPES.DICTATION
    ) {

        if (dictationAudioArea) {
            dictationAudioArea.hidden = false;
        }

        if (dictationAudio) {

            dictationAudio.pause();

            dictationAudio.currentTime = 0;

            if (currentPractice.audioUrl) {
                dictationAudio.src =
                    currentPractice.audioUrl;
            } else {
                dictationAudio.removeAttribute(
                    "src"
                );
            }

            dictationAudio.load();
        }

        if (practiceModeHint) {
            practiceModeHint.textContent =
                "Listen to the dictation and type the complete matter below.";
        }
    }


    /* -------------------------------------------------
       TRANSCRIBE
    ------------------------------------------------- */

    if (
        currentPractice.type ===
        PRACTICE_TYPES.TRANSCRIBE
    ) {

        if (transcribeInstruction) {
            transcribeInstruction.hidden = false;
            transcribeInstruction.textContent =
                "Type the complete transcription matter below. The original matter is hidden during the test.";
        }

        if (practiceModeHint) {
            practiceModeHint.textContent =
                "Type the matter from your shorthand/transcription source.";
        }
    }


    /* -------------------------------------------------
       TYPING
    ------------------------------------------------- */

    if (
        currentPractice.type ===
        PRACTICE_TYPES.TYPING
    ) {

        if (typingReferenceArea) {
            typingReferenceArea.hidden = false;
        }

        if (typingReference) {

            typingReference.textContent =
                currentPractice.text;

            applyReferenceFormatting(
                typingReference,
                currentPractice.formatting
            );
        }

        if (practiceModeHint) {
            practiceModeHint.textContent =
                "Type the matter shown above as accurately as possible.";
        }
    }


    /* -------------------------------------------------
       PRACTICE TARGET
    ------------------------------------------------- */

    if (
        currentPractice.type !==
        PRACTICE_TYPES.TYPING
    ) {

        if (practiceTarget) {
            practiceTarget.hidden = true;
            practiceTarget.textContent = "";
        }
    }


    updatePracticeToolbar();
    hideLivePerformance();
}


/* =====================================================
   APPLY REFERENCE FORMATTING
===================================================== */

function applyReferenceFormatting(
    element,
    formatting = {}
) {

    if (!element) {
        return;
    }


    const fontSize =
        clamp(
            formatting.fontSize || 18,
            10,
            48
        );


    element.style.fontSize =
        `${fontSize}px`;

    element.style.fontWeight =
        formatting.bold
            ? "700"
            : "400";

    element.style.fontStyle =
        formatting.italic
            ? "italic"
            : "normal";

    element.style.textDecoration =
        formatting.underline
            ? "underline"
            : "none";

    element.style.textAlign =
        formatting.alignment || "left";
}


/* =====================================================
   START TEST
===================================================== */

function beginPractice() {

    if (
        !currentPractice ||
        practiceRunning ||
        practiceSubmitted
    ) {
        return;
    }


    const typingArea =
        getScreen("typingArea");

    const startButton =
        getScreen("startPractice");

    const finishButton =
        getScreen("finishPractice");

    const typingStatus =
        getScreen("typingStatus");


    practiceStartedAt =
        Date.now();

    practiceRemainingSeconds =
        currentPractice.duration * 60;

    practiceRunning = true;
    practiceSubmitted = false;


    if (typingArea) {
        typingArea.disabled = false;
        typingArea.focus();
    }

    if (startButton) {
        startButton.disabled = true;
        startButton.hidden = true;
    }

    if (finishButton) {
        finishButton.disabled = false;
        finishButton.hidden = false;
    }

    if (typingStatus) {
        typingStatus.textContent =
            "Running";
        typingStatus.className =
            "status-running";
    }


    startPracticeTimer();
}


/* =====================================================
   PRACTICE TIMER
===================================================== */

function startPracticeTimer() {

    stopPracticeTimer();

    practiceRunning = true;


    updatePracticeTimer();


    practiceTimer =
        setInterval(
            () => {

                if (!practiceRunning) {
                    return;
                }

                practiceRemainingSeconds--;

                updatePracticeTimer();


                if (
                    practiceRemainingSeconds <= 0
                ) {

                    practiceRemainingSeconds = 0;

                    updatePracticeTimer();

                    stopPracticeTimer();

                    showToast(
                        "Time is over. Your test has been submitted."
                    );

                    finishPractice();
                }

            },
            1000
        );
}


/* =====================================================
   UPDATE TIMER
===================================================== */

function updatePracticeTimer() {

    const timer =
        getScreen("timer");

    if (timer) {
        timer.textContent =
            formatTime(
                practiceRemainingSeconds
            );
    }
}


/* =====================================================
   PRACTICE INPUT
===================================================== */

function handlePracticeInput() {

    if (
        !currentPractice ||
        practiceSubmitted
    ) {
        return;
    }


    if (!practiceRunning) {
        return;
    }


    const typingArea =
        getScreen("typingArea");

    if (!typingArea) {
        return;
    }


    updateCharacterCount();

    /*
       Intentionally do NOT show:
       - live WPM
       - live word count
       - live mistakes
       - live accuracy

       These are shown only after submission.
    */
}


/* =====================================================
   CHARACTER COUNT
===================================================== */

function updateCharacterCount() {

    const typingArea =
        getScreen("typingArea");

    const characterCount =
        getScreen("characterCount");

    if (!typingArea || !characterCount) {
        return;
    }


    const count =
        typingArea.value.length;


    characterCount.textContent =
        `${count} character${count === 1 ? "" : "s"}`;
}


/* =====================================================
   HIDE LIVE PERFORMANCE
===================================================== */

function hideLivePerformance() {

    const liveWpm =
        getScreen("liveWpm");

    const liveWords =
        getScreen("liveWords");

    const liveErrorStatus =
        getScreen("liveErrorStatus");


    if (liveWpm) {
        liveWpm.textContent = "—";
    }

    if (liveWords) {
        liveWords.textContent = "—";
    }

    if (liveErrorStatus) {
        liveErrorStatus.textContent = "";
    }
}


/* =====================================================
   RESET PRACTICE BEFORE START
===================================================== */

function resetPracticeBeforeStart() {

    if (
        practiceRunning ||
        practiceSubmitted
    ) {
        return;
    }

    preparePracticeScreen();
}


/* =====================================================
   FINISH PRACTICE
===================================================== */

function finishPractice() {

    if (
        !currentPractice ||
        practiceSubmitted
    ) {
        return;
    }


    const typingArea =
        getScreen("typingArea");


    if (!typingArea) {
        return;
    }


    if (!practiceStartedAt) {

        showToast(
            "Please start the test first."
        );

        return;
    }


    practiceSubmitted = true;

    stopPracticeTimer();


    const typedText =
        typingArea.value || "";


    const elapsedSeconds =
        Math.max(
            1,
            Math.round(
                (
                    Date.now() -
                    practiceStartedAt
                ) / 1000
            )
        );


    const actualElapsedSeconds =
        Math.min(
            elapsedSeconds,
            currentPractice.duration * 60
        );


    typingArea.disabled = true;


    const finishButton =
        getScreen("finishPractice");

    const startButton =
        getScreen("startPractice");

    const typingStatus =
        getScreen("typingStatus");


    if (finishButton) {
        finishButton.disabled = true;
    }

    if (startButton) {
        startButton.hidden = true;
    }

    if (typingStatus) {
        typingStatus.textContent =
            "Submitted";
        typingStatus.className =
            "status-complete";
    }


    const analysis =
        analyzePractice(
            currentPractice,
            typedText,
            actualElapsedSeconds
        );


    const result = {
        id: generateId("R"),
        studentId: currentPractice.studentId,
        matterId: currentPractice.matterId,
        practiceType: currentPractice.type,
        title: currentPractice.title,
        wpm: analysis.wpm,
        accuracy: analysis.accuracy,
        timeSeconds: actualElapsedSeconds,
        typedWords: analysis.typedWords,
        correctWords: analysis.correctWords,
        mistakeCount: analysis.mistakeCount,
        missingWords: analysis.missingWords,
        extraWords: analysis.extraWords,
        submittedAt: Date.now()
    };


    results.push(result);

    writeStorage(
        STORAGE_KEYS.results,
        results
    );


    showResultScreen(
        result,
        analysis
    );
}


/* =====================================================
   ANALYZE PRACTICE
===================================================== */

function analyzePractice(
    practice,
    typedText,
    elapsedSeconds
) {

    const referenceText =
        practice.text || "";


    const referenceWords =
        tokenizeWords(
            referenceText
        );

    const typedWords =
        tokenizeWords(
            typedText
        );


    const comparison =
        compareWords(
            referenceWords,
            typedWords
        );


    const typedWordCount =
        typedWords.length;

    const correctWords =
        comparison.correctWords;

    const mistakeCount =
        comparison.mistakeCount;

    const missingWords =
        comparison.missingWords;

    const extraWords =
        comparison.extraWords;


    const accuracy =
        referenceWords.length === 0
            ? 0
            : (
                correctWords /
                referenceWords.length
            ) * 100;


    const minutes =
        Math.max(
            elapsedSeconds / 60,
            1 / 60
        );


    const wpm =
        typedWordCount /
        minutes;


    return {
        referenceWords,
        typedWords,
        typedWordCount,
        correctWords,
        mistakeCount,
        missingWords,
        extraWords,
        accuracy: clamp(
            accuracy,
            0,
            100
        ),
        wpm: Math.max(
            0,
            wpm
        ),
        elapsedSeconds
    };
}


/* =====================================================
   TOKENIZE WORDS
===================================================== */

function tokenizeWords(text) {

    if (!text) {
        return [];
    }

    return String(text)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}


/* =====================================================
   COMPARE WORDS
===================================================== */

function compareWords(
    referenceWords,
    typedWords
) {

    const maxLength =
        Math.max(
            referenceWords.length,
            typedWords.length
        );


    let correctWords = 0;
    let mistakeCount = 0;

    const missingWords = [];
    const extraWords = [];

    const wordDetails = [];


    for (
        let i = 0;
        i < maxLength;
        i++
    ) {

        const reference =
            referenceWords[i];

        const typed =
            typedWords[i];


        if (
            reference !== undefined &&
            typed !== undefined
        ) {

            const isCorrect =
                normalizeWord(reference) ===
                normalizeWord(typed);


            if (isCorrect) {
                correctWords++;
            } else {
                mistakeCount++;

                wordDetails.push({
                    index: i + 1,
                    expected: reference,
                    typed: typed,
                    status: "incorrect"
                });
            }

            continue;
        }


        if (
            reference !== undefined &&
            typed === undefined
        ) {

            mistakeCount++;

            missingWords.push(reference);

            wordDetails.push({
                index: i + 1,
                expected: reference,
                typed: "",
                status: "missing"
            });

            continue;
        }


        if (
            reference === undefined &&
            typed !== undefined
        ) {

            mistakeCount++;

            extraWords.push(typed);

            wordDetails.push({
                index: i + 1,
                expected: "",
                typed: typed,
                status: "extra"
            });
        }
    }


    return {
        correctWords,
        mistakeCount,
        missingWords,
        extraWords,
        wordDetails
    };
}


/* =====================================================
   NORMALIZE WORD
===================================================== */

function normalizeWord(word) {

    return String(word || "")
        .toLowerCase()
        .replace(/[“”‘’]/g, "")
        .replace(/^[.,!?;:()[\]{}"'`]+/, "")
        .replace(/[.,!?;:()[\]{}"'`]+$/, "");
}


/* =====================================================
   TYPING TOOLBAR
===================================================== */

function updatePracticeToolbar() {

    const decrease =
        getScreen("fontDecrease");

    const increase =
        getScreen("fontIncrease");

    const display =
        getScreen("fontSizeDisplay");


    if (!display) {
        return;
    }


    let size =
        safeNumber(
            display.dataset.size,
            settings.defaultFontSize || 18
        );


    size = clamp(
        size,
        12,
        32
    );


    display.textContent =
        `${size}px`;

    display.dataset.size =
        String(size);


    if (decrease) {
        decrease.disabled =
            size <= 12;
    }

    if (increase) {
        increase.disabled =
            size >= 32;
    }
}


/* =====================================================
   CHANGE PRACTICE FONT SIZE
===================================================== */

function changePracticeFontSize(delta) {

    const display =
        getScreen("fontSizeDisplay");

    const typingArea =
        getScreen("typingArea");


    if (!display || !typingArea) {
        return;
    }


    let size =
        safeNumber(
            display.dataset.size,
            settings.defaultFontSize || 18
        );


    size = clamp(
        size + delta,
        12,
        32
    );


    display.dataset.size =
        String(size);

    display.textContent =
        `${size}px`;

    typingArea.style.fontSize =
        `${size}px`;


    updatePracticeToolbar();
}/* =========================================================
   SCRIPT.JS — PART 5/5
   Results + Toolbar + Event Wiring + Final Initialization
========================================================= */


/* =========================================================
   RESULT SCREEN
========================================================= */

function showResultScreen(result) {
  stopPracticeTimer();

  currentPractice = null;
  practiceRunning = false;
  practiceSubmitted = true;

  const resultSubtitle = document.getElementById("resultSubtitle");
  const resultAccuracy = document.getElementById("resultAccuracy");
  const resultWpm = document.getElementById("resultWpm");
  const resultTime = document.getElementById("resultTime");
  const resultWords = document.getElementById("resultWords");
  const mistakeCount = document.getElementById("mistakeCount");
  const mistakesList = document.getElementById("mistakesList");
  const wordAnalysis = document.getElementById("wordAnalysis");

  if (resultSubtitle) {
    resultSubtitle.textContent =
      `${result.title} • ${getPracticeTypeLabel(result.type)}`;
  }

  if (resultAccuracy) {
    resultAccuracy.textContent = `${safeNumber(result.accuracy, 0).toFixed(1)}%`;
  }

  if (resultWpm) {
    resultWpm.textContent = `${safeNumber(result.wpm, 0).toFixed(0)}`;
  }

  if (resultTime) {
    resultTime.textContent = formatTime(result.timeSeconds || 0);
  }

  if (resultWords) {
    resultWords.textContent = `${safeNumber(result.correctWords, 0)}`;
  }

  if (mistakeCount) {
    mistakeCount.textContent = `${safeNumber(result.mistakes, 0)}`;
  }

  if (mistakesList) {
    renderMistakes(result.mistakeDetails || []);
  }

  if (wordAnalysis) {
    renderWordAnalysis(result);
  }

  showScreen("resultScreen");
}


/* =========================================================
   MISTAKE DETAILS
========================================================= */

function renderMistakes(mistakes) {
  const container = document.getElementById("mistakesList");
  if (!container) return;

  if (!Array.isArray(mistakes) || mistakes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No mistakes found</strong>
        <span>Excellent work. No word-level mistakes were detected.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = mistakes
    .slice(0, 100)
    .map((mistake, index) => {
      const expected = escapeHtml(mistake.expected || "—");
      const actual = escapeHtml(mistake.actual || "—");
      const type = escapeHtml(mistake.type || "Mistake");

      return `
        <div class="mistake-item">
          <div class="mistake-number">${index + 1}</div>
          <div class="mistake-content">
            <strong>${type}</strong>
            <span>
              Expected:
              <b>${expected}</b>
              &nbsp;•&nbsp;
              Typed:
              <b>${actual}</b>
            </span>
          </div>
        </div>
      `;
    })
    .join("");
}


/* =========================================================
   WORD-BY-WORD ANALYSIS
========================================================= */

function renderWordAnalysis(result) {
  const container = document.getElementById("wordAnalysis");
  if (!container) return;

  const analysis = Array.isArray(result.wordAnalysis)
    ? result.wordAnalysis
    : [];

  if (analysis.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No word analysis available</strong>
        <span>There is not enough reference text for detailed comparison.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = analysis
    .slice(0, 250)
    .map(item => {
      const word = escapeHtml(item.actual || item.expected || "");
      const expected = escapeHtml(item.expected || "");
      const status = item.status || "correct";

      let className = "word-correct";
      let label = "Correct";

      if (status === "missing") {
        className = "word-missing";
        label = "Missing";
      } else if (status === "extra") {
        className = "word-extra";
        label = "Extra";
      } else if (status === "wrong") {
        className = "word-wrong";
        label = "Wrong";
      }

      return `
        <span
          class="analysis-word ${className}"
          title="${label}${expected ? ` • Expected: ${expected}` : ""}"
        >
          ${word || "—"}
        </span>
      `;
    })
    .join(" ");
}


/* =========================================================
   SAVE RESULT
========================================================= */

function savePracticeResult(result) {
  if (!result || !currentUser) return;

  const resultRecord = {
    ...result,
    id: generateId("R"),
    studentId: currentUser.id,
    studentName: currentUser.name,
    createdAt: new Date().toISOString()
  };

  results.unshift(resultRecord);

  if (results.length > 5000) {
    results = results.slice(0, 5000);
  }

  writeStorage(STORAGE_KEYS.results, results);

  return resultRecord;
}


/* =========================================================
   PRACTICE AGAIN
========================================================= */

function practiceAgain() {
  if (!currentUser) return;

  const result = results[0];

  if (!result) {
    showStudentScreen();
    return;
  }

  const matter = findMatterById(result.matterId);

  if (!matter) {
    showToast("Practice matter no longer exists.", "error");
    showStudentScreen();
    return;
  }

  currentPractice = matter;
  practiceSubmitted = false;

  preparePracticeScreen(matter);
  showScreen("practiceScreen");
}


/* =========================================================
   BACK TO DASHBOARD
========================================================= */

function backToDashboard() {
  stopPracticeTimer();

  if (currentUser?.role === "admin") {
    showAdminScreen();
  } else {
    showStudentScreen();
  }
}


/* =========================================================
   PRACTICE TOOLBAR
========================================================= */

function setupPracticeToolbar() {
  const buttons = document.querySelectorAll(
    ".practice-toolbar [data-format]"
  );

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const format = button.dataset.format;
      applyTypingFormat(format);
    });
  });

  const decrease = document.getElementById("fontDecrease");
  const increase = document.getElementById("fontIncrease");

  if (decrease) {
    decrease.addEventListener("click", () => {
      changePracticeFontSize(-1);
    });
  }

  if (increase) {
    increase.addEventListener("click", () => {
      changePracticeFontSize(1);
    });
  }
}


/* =========================================================
   APPLY TYPING FORMAT
========================================================= */

function applyTypingFormat(format) {
  const typingArea = document.getElementById("typingArea");
  if (!typingArea) return;

  if (format === "bold") {
    typingArea.focus();
    document.execCommand("bold", false);
  }

  if (format === "italic") {
    typingArea.focus();
    document.execCommand("italic", false);
  }

  if (format === "underline") {
    typingArea.focus();
    document.execCommand("underline", false);
  }

  if (format === "align-left") {
    typingArea.style.textAlign = "left";
  }

  if (format === "align-center") {
    typingArea.style.textAlign = "center";
  }

  if (format === "align-right") {
    typingArea.style.textAlign = "right";
  }

  if (format === "align-justify") {
    typingArea.style.textAlign = "justify";
  }

  updatePracticeToolbar();
}


/* =========================================================
   UPDATE TOOLBAR ACTIVE STATES
========================================================= */

function updatePracticeToolbar() {
  const typingArea = document.getElementById("typingArea");
  if (!typingArea) return;

  const buttons = document.querySelectorAll(
    ".practice-toolbar [data-format]"
  );

  buttons.forEach(button => {
    const format = button.dataset.format;

    let active = false;

    if (format === "bold") {
      active = document.queryCommandState("bold");
    }

    if (format === "italic") {
      active = document.queryCommandState("italic");
    }

    if (format === "underline") {
      active = document.queryCommandState("underline");
    }

    if (format === "align-left") {
      active = typingArea.style.textAlign === "left";
    }

    if (format === "align-center") {
      active = typingArea.style.textAlign === "center";
    }

    if (format === "align-right") {
      active = typingArea.style.textAlign === "right";
    }

    if (format === "align-justify") {
      active = typingArea.style.textAlign === "justify";
    }

    button.classList.toggle("active", active);
  });
}


/* =========================================================
   TYPING AREA SELECTION / TOOLBAR UPDATE
========================================================= */

function setupTypingAreaFormatting() {
  const typingArea = document.getElementById("typingArea");
  if (!typingArea) return;

  ["keyup", "mouseup", "focus", "input"].forEach(eventName => {
    typingArea.addEventListener(eventName, () => {
      updatePracticeToolbar();
    });
  });
}


/* =========================================================
   MATTER FORM EVENTS
========================================================= */

function setupMatterEvents() {
  const newButton = document.getElementById("newMatterButton");
  const closeButton = document.getElementById("closeMatterEditor");
  const cancelButton = document.getElementById("cancelMatter");
  const form = document.getElementById("matterForm");
  const typeSelect = document.getElementById("matterType");
  const audioInput = document.getElementById("matterAudio");

  if (newButton) {
    newButton.addEventListener("click", () => {
      openMatterEditor();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeMatterEditor();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      closeMatterEditor();
    });
  }

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      saveMatter();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      updateMatterEditorMode();
    });
  }

  if (audioInput) {
    audioInput.addEventListener("change", event => {
      setupAudioInput(event);
    });
  }
}


/* =========================================================
   STUDENT FORM EVENTS
========================================================= */

function setupStudentEvents() {
  const newButton = document.getElementById("newStudentButton");
  const closeButton = document.getElementById("closeStudentEditor");
  const cancelButton = document.getElementById("cancelStudent");
  const form = document.getElementById("studentForm");

  if (newButton) {
    newButton.addEventListener("click", () => {
      openStudentEditor();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeStudentEditor();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      closeStudentEditor();
    });
  }

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      saveStudent();
    });
  }
}


/* =========================================================
   SETTINGS EVENTS
========================================================= */

function setupSettingsEvents() {
  const form = document.getElementById("settingsForm");

  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    saveSettings();
  });
}


/* =========================================================
   PRACTICE EVENTS
========================================================= */

function setupPracticeEvents() {
  const startButton = document.getElementById("startPractice");
  const finishButton = document.getElementById("finishPractice");
  const resetButton = document.getElementById("resetPractice");
  const typingArea = document.getElementById("typingArea");
  const exitButton = document.getElementById("exitPractice");

  if (startButton) {
    startButton.addEventListener("click", () => {
      beginPractice();
    });
  }

  if (finishButton) {
    finishButton.addEventListener("click", () => {
      finishPractice(false);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetPracticeBeforeStart();
    });
  }

  if (typingArea) {
    typingArea.addEventListener("input", event => {
      handlePracticeInput(event);
    });
  }

  if (exitButton) {
    exitButton.addEventListener("click", () => {
      stopPracticeTimer();

      if (confirm("Exit this practice? Your current attempt will not be saved.")) {
        showStudentScreen();
      }
    });
  }
}


/* =========================================================
   RESULT EVENTS
========================================================= */

function setupResultEvents() {
  const backButton = document.getElementById("backToDashboard");
  const againButton = document.getElementById("practiceAgain");

  if (backButton) {
    backButton.addEventListener("click", () => {
      backToDashboard();
    });
  }

  if (againButton) {
    againButton.addEventListener("click", () => {
      practiceAgain();
    });
  }
}


/* =========================================================
   DASHBOARD MATTER CARD EVENTS
========================================================= */

function setupStudentMatterCardEvents() {
  const container = document.getElementById("studentMatterCards");

  if (!container) return;

  container.addEventListener("click", event => {
    const button = event.target.closest("[data-practice-id]");

    if (!button) return;

    const matterId = button.dataset.practiceId;
    const matter = findMatterById(matterId);

    if (!matter) {
      showToast("Practice not found.", "error");
      return;
    }

    if (!matter.published) {
      showToast("This practice is not published.", "error");
      return;
    }

    currentPractice = matter;
    practiceSubmitted = false;

    preparePracticeScreen(matter);
    showScreen("practiceScreen");
  });
}


/* =========================================================
   INITIAL APPLICATION EVENT SETUP
========================================================= */

function setupApplicationEvents() {
  setupLoginForm();
  setupMatterSearch();

  setupMatterEvents();
  setupStudentEvents();
  setupSettingsEvents();

  setupPracticeEvents();
  setupPracticeToolbar();
  setupTypingAreaFormatting();
  setupResultEvents();

  setupStudentMatterCardEvents();

  setupAudioInput();
}


/* =========================================================
   INITIAL UI REFRESH
========================================================= */

function refreshCurrentUI() {
  if (!currentUser) return;

  if (currentUser.role === "admin") {
    renderAdminDashboard();
    renderMattersTable();
    renderStudentsTable();
    loadSettingsForm();
  } else {
    renderStudentDashboard();
  }
}


/* =========================================================
   FINAL DOM READY HOOK
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupApplicationEvents();
  refreshCurrentUI();
});


/* =========================================================
   WINDOW SAFETY
========================================================= */

window.addEventListener("beforeunload", () => {
  stopPracticeTimer();

  if (currentAudioObjectUrl) {
    try {
      URL.revokeObjectURL(currentAudioObjectUrl);
    } catch (error) {
      console.warn("Audio URL cleanup failed.", error);
    }

    currentAudioObjectUrl = null;
  }
});


/* =========================================================
   DEBUG HELPERS
   Safe for demo/development only
========================================================= */

window.ShorthandPortal = {
  get matters() {
    return matters;
  },

  get students() {
    return students;
  },

  get results() {
    return results;
  },

  get currentUser() {
    return currentUser;
  },

  refresh() {
    refreshCurrentUI();
  }
};
