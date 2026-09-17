"use strict";

/* =====================================================
   SHORTHAND + TYPING PRACTICE PORTAL
   CLEAN FINAL SCRIPT
   PART 1 — CORE FOUNDATION
===================================================== */


/* =====================================================
   1. APPLICATION CONSTANTS
===================================================== */

const STORAGE_KEYS = {
  matters: "shorthand_matters",
  students: "shorthand_students",
  results: "shorthand_results",
  settings: "shorthand_settings"
};

const PRACTICE_TYPES = {
  DICTATION: "dictation",
  TRANSCRIBE: "transcribe",
  TYPING: "typing"
};


/* =====================================================
   2. ADMIN ACCOUNT
===================================================== */

const ADMIN_ACCOUNT = {
  username: "admin",
  password: "admin123",
  name: "Administrator"
};


/* =====================================================
   3. DEFAULT MATTERS
===================================================== */

const DEFAULT_MATTERS = [
  {
    id: "M001",
    topic: "Practice Dictation 01",
    type: PRACTICE_TYPES.DICTATION,

    wpm: 80,
    duration: 5,

    audioUrl: "",
    text: "",

    published: true
  },

  {
    id: "M002",
    topic: "Practice Transcription 01",
    type: PRACTICE_TYPES.TRANSCRIBE,

    wpm: 100,
    duration: 5,

    audioUrl: "",

    text:
      "Success is the result of preparation, hard work and learning from experience. Every sincere effort helps us move forward and improve our performance.",

    published: true
  },

  {
    id: "M003",
    topic: "English Typing Test 01",
    type: PRACTICE_TYPES.TYPING,

    wpm: 35,
    duration: 10,

    audioUrl: "",

    text:
      "Typing is an important skill in modern office work. Regular practice improves speed, accuracy and confidence. A good typist maintains proper posture, concentrates on the text and avoids unnecessary mistakes.",

    formatting: {
      fontSize: 18,
      bold: false,
      italic: false,
      underline: false,
      alignment: "left"
    },

    published: true
  }
];


/* =====================================================
   4. DEFAULT STUDENT
===================================================== */

const DEFAULT_STUDENTS = [
  {
    id: "S001",

    name: "Demo Student",

    username: "student",

    password: "student123",

    status: "active",

    assignedMatters: [
      "M001",
      "M002",
      "M003"
    ]
  }
];


/* =====================================================
   5. DEFAULT RESULTS
===================================================== */

const DEFAULT_RESULTS = [];


/* =====================================================
   6. DEFAULT PORTAL SETTINGS
===================================================== */

const DEFAULT_SETTINGS = {

  portalName: "Shorthand Practice Portal",

  defaultFontSize: 20,

  autoSaveResults: true

};


/* =====================================================
   7. APPLICATION STATE
===================================================== */

let currentUser = null;

let currentUserType = null;

let currentMatter = null;

let currentPracticeType = null;


/* =====================================================
   8. EDITOR STATE
===================================================== */

let editingMatterId = null;

let editingStudentId = null;


/* =====================================================
   9. PRACTICE STATE
===================================================== */

let practiceTimerInterval = null;

let practiceStartTime = null;

let practiceElapsedSeconds = 0;

let practiceStarted = false;

let practiceFinished = false;

let currentPracticeResult = null;


/* =====================================================
   10. STORAGE FUNCTIONS
===================================================== */

function getStorage(key, fallback) {

  try {

    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);

  } catch (error) {

    console.error("Storage read error:", error);

    return fallback;
  }
}


function setStorage(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {

    console.error("Storage write error:", error);

    return false;
  }
}


/* =====================================================
   11. INITIALIZE STORAGE
===================================================== */

function initializeData() {

  if (!localStorage.getItem(STORAGE_KEYS.matters)) {

    setStorage(
      STORAGE_KEYS.matters,
      DEFAULT_MATTERS
    );
  }


  if (!localStorage.getItem(STORAGE_KEYS.students)) {

    setStorage(
      STORAGE_KEYS.students,
      DEFAULT_STUDENTS
    );
  }


  if (!localStorage.getItem(STORAGE_KEYS.results)) {

    setStorage(
      STORAGE_KEYS.results,
      DEFAULT_RESULTS
    );
  }


  if (!localStorage.getItem(STORAGE_KEYS.settings)) {

    setStorage(
      STORAGE_KEYS.settings,
      DEFAULT_SETTINGS
    );
  }
}


/* =====================================================
   12. DATA GETTERS
===================================================== */

function getMatters() {

  return getStorage(
    STORAGE_KEYS.matters,
    []
  );
}


function getStudents() {

  return getStorage(
    STORAGE_KEYS.students,
    []
  );
}


function getResults() {

  return getStorage(
    STORAGE_KEYS.results,
    []
  );
}


function getPortalSettings() {

  return getStorage(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS
  );
}


/* =====================================================
   13. DATA SAVERS
===================================================== */

function saveMatters(matters) {

  return setStorage(
    STORAGE_KEYS.matters,
    matters
  );
}


function saveStudents(students) {

  return setStorage(
    STORAGE_KEYS.students,
    students
  );
}


function saveResults(results) {

  return setStorage(
    STORAGE_KEYS.results,
    results
  );
}


function savePortalSettings(settings) {

  return setStorage(
    STORAGE_KEYS.settings,
    settings
  );
}


/* =====================================================
   14. SCREEN MANAGEMENT
===================================================== */

function hideAllScreens() {

  const screenIds = [
    "loginScreen",
    "adminScreen",
    "studentScreen",
    "practiceScreen",
    "resultScreen"
  ];


  screenIds.forEach(function (id) {

    const screen =
      document.getElementById(id);

    if (screen) {

      screen.classList.add("hidden");
    }

  });
}


function showScreen(screenId) {

  hideAllScreens();


  const screen =
    document.getElementById(screenId);


  if (!screen) {

    console.error(
      "Screen not found:",
      screenId
    );

    return;
  }


  screen.classList.remove("hidden");
}


/* =====================================================
   15. ADMIN PAGE MANAGEMENT
===================================================== */

function showAdminPage(pageName) {

  const pages = {

    dashboard: "adminDashboardPage",

    matters: "adminMattersPage",

    students: "adminStudentsPage",

    results: "adminResultsPage",

    settings: "adminSettingsPage"

  };


  Object.values(pages).forEach(
    function (pageId) {

      const page =
        document.getElementById(pageId);

      if (page) {

        page.classList.add("hidden");
      }

    }
  );


  const targetId =
    pages[pageName];


  if (targetId) {

    const target =
      document.getElementById(targetId);

    if (target) {

      target.classList.remove("hidden");
    }
  }


  /* Sidebar active state */

  document
    .querySelectorAll("[data-admin-page]")
    .forEach(function (item) {

      item.classList.remove("active");


      if (
        item.dataset.adminPage ===
        pageName
      ) {

        item.classList.add("active");
      }

    });


  /* Page title */

  const titles = {

    dashboard: "Dashboard",

    matters: "Practice Matters",

    students: "Students",

    results: "Results",

    settings: "Settings"

  };


  const title =
    document.getElementById(
      "adminPageTitle"
    );


  if (title) {

    title.textContent =
      titles[pageName] ||
      "Dashboard";
  }
}


/* =====================================================
   16. LOGIN TYPE
===================================================== */

function setLoginType(type) {

  currentUserType = type;


  document
    .querySelectorAll(".login-tab")
    .forEach(function (tab) {

      tab.classList.remove("active");


      if (
        tab.dataset.loginType ===
        type
      ) {

        tab.classList.add("active");
      }

    });


  const username =
    document.getElementById(
      "username"
    );

  const password =
    document.getElementById(
      "password"
    );


  if (username) {

    username.value = "";
  }


  if (password) {

    password.value = "";
  }


  const error =
    document.getElementById(
      "loginError"
    );


  if (error) {

    error.classList.add("hidden");

    error.textContent = "";
  }
}


/* =====================================================
   17. LOGOUT
===================================================== */

function logout() {

  stopPracticeTimer();


  currentUser = null;

  currentUserType = null;

  currentMatter = null;

  currentPracticeType = null;


  practiceStarted = false;

  practiceFinished = false;

  currentPracticeResult = null;


  showScreen("loginScreen");

  setLoginType("student");
}


/* =====================================================
   18. TIMER CLEANUP
===================================================== */

function stopPracticeTimer() {

  if (practiceTimerInterval) {

    clearInterval(
      practiceTimerInterval
    );

    practiceTimerInterval = null;
  }
}


/* =====================================================
   19. RESET PRACTICE STATE
===================================================== */

function clearPracticeRuntimeState() {

  stopPracticeTimer();


  practiceStartTime = null;

  practiceElapsedSeconds = 0;

  practiceStarted = false;

  practiceFinished = false;


  currentMatter = null;

  currentPracticeType = null;

  currentPracticeResult = null;
}


/* =====================================================
   20. UNIQUE ID
===================================================== */

function generateId(prefix) {

  return (
    prefix +
    Date.now().toString().slice(-7) +
    Math.floor(
      Math.random() * 100
    )
  );
}


/* =====================================================
   21. HTML ESCAPE
===================================================== */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";
  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}


/* =====================================================
   22. PRACTICE TYPE LABEL
===================================================== */

function getPracticeTypeLabel(type) {

  switch (type) {

    case PRACTICE_TYPES.DICTATION:

      return "🎧 Dictation";


    case PRACTICE_TYPES.TRANSCRIBE:

      return "⌨️ Transcribe";


    case PRACTICE_TYPES.TYPING:

      return "📝 Typing";


    default:

      return "Practice";
  }
}


/* =====================================================
   23. PRACTICE TYPE VALIDATION
===================================================== */

function isValidPracticeType(type) {

  return [

    PRACTICE_TYPES.DICTATION,

    PRACTICE_TYPES.TRANSCRIBE,

    PRACTICE_TYPES.TYPING

  ].includes(type);
}


/* =====================================================
   24. DOM READY
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeData();

    currentUserType = "student";

    setLoginType("student");

    console.log(
      "Portal foundation loaded successfully."
    );

  }
);
/* =====================================================
   PART 2 — LOGIN + DASHBOARD FOUNDATION
===================================================== */


/* =====================================================
   1. LOGIN ERROR
===================================================== */

function showLoginError(message) {

  const errorBox =
    document.getElementById("loginError");

  if (!errorBox) {
    return;
  }

  errorBox.textContent = message;

  errorBox.classList.remove("hidden");
}


/* =====================================================
   2. ADMIN DASHBOARD
===================================================== */

function loadAdminDashboard() {

  const matters = getMatters();

  const students = getStudents();

  const results = getResults();


  /* Stats */

  const statMatters =
    document.getElementById("statMatters");

  const statStudents =
    document.getElementById("statStudents");

  const statAttempts =
    document.getElementById("statAttempts");

  const statAccuracy =
    document.getElementById("statAccuracy");


  if (statMatters) {
    statMatters.textContent =
      matters.length;
  }


  if (statStudents) {

    statStudents.textContent =
      students.filter(
        function (student) {
          return student.status !== "inactive";
        }
      ).length;
  }


  if (statAttempts) {

    statAttempts.textContent =
      results.length;
  }


  if (statAccuracy) {

    if (!results.length) {

      statAccuracy.textContent =
        "0%";

    } else {

      const totalAccuracy =
        results.reduce(
          function (sum, result) {

            return sum +
              Number(
                result.accuracy || 0
              );

          },
          0
        );


      const average =
        totalAccuracy /
        results.length;


      statAccuracy.textContent =
        Math.round(average) + "%";
    }
  }


  renderRecentMatters();

  renderRecentResults();
}


/* =====================================================
   3. RECENT MATTERS
===================================================== */

function renderRecentMatters() {

  const container =
    document.getElementById(
      "recentMatters"
    );


  if (!container) {
    return;
  }


  const matters =
    getMatters()
      .slice()
      .reverse()
      .slice(0, 5);


  if (!matters.length) {

    container.innerHTML =
      '<div class="empty-state">No practice matters available.</div>';

    return;
  }


  container.innerHTML =
    matters.map(
      function (matter) {

        return `
          <div class="recent-item">

            <div>
              <strong>
                ${escapeHtml(
                  matter.topic ||
                  matter.title ||
                  "Untitled Matter"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  getPracticeTypeLabel(
                    matter.type
                  )
                )}
              </small>
            </div>

            <span class="status-badge">
              ${matter.published
                ? "Published"
                : "Draft"}
            </span>

          </div>
        `;
      }
    ).join("");
}


/* =====================================================
   4. RECENT RESULTS
===================================================== */

function renderRecentResults() {

  const container =
    document.getElementById(
      "recentResults"
    );


  if (!container) {
    return;
  }


  const results =
    getResults()
      .slice()
      .reverse()
      .slice(0, 5);


  if (!results.length) {

    container.innerHTML =
      '<div class="empty-state">No results yet.</div>';

    return;
  }


  container.innerHTML =
    results.map(
      function (result) {

        const student =
          getStudents().find(
            function (item) {

              return (
                item.id ===
                result.studentId
              );
            }
          );


        return `
          <div class="recent-item">

            <div>

              <strong>
                ${escapeHtml(
                  student
                    ? student.name
                    : "Student"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  result.matterTopic ||
                  "Practice"
                )}
              </small>

            </div>

            <span class="status-badge">
              ${Math.round(
                Number(
                  result.accuracy || 0
                )
              )}% Accuracy
            </span>

          </div>
        `;
      }
    ).join("");
}


/* =====================================================
   5. STUDENT DASHBOARD
===================================================== */

function loadStudentDashboard() {

  if (
    !currentUser ||
    currentUserType !== "student"
  ) {
    return;
  }


  const students =
    getStudents();


  const student =
    students.find(
      function (item) {

        return (
          item.id ===
          currentUser.id
        );
      }
    );


  if (!student) {
    return;
  }


  const name =
    document.getElementById(
      "studentDisplayName"
    );


  const id =
    document.getElementById(
      "studentDisplayId"
    );


  if (name) {
    name.textContent =
      student.name;
  }


  if (id) {
    id.textContent =
      student.id;
  }


  renderStudentStats();

  renderStudentMatters();

  renderStudentHistory();
}


/* =====================================================
   6. STUDENT STATS
===================================================== */

function renderStudentStats() {

  if (!currentUser) {
    return;
  }


  const results =
    getResults().filter(
      function (result) {

        return (
          result.studentId ===
          currentUser.id
        );
      }
    );


  const completed =
    document.getElementById(
      "studentCompleted"
    );


  const averageWpm =
    document.getElementById(
      "studentAverageWpm"
    );


  const averageAccuracy =
    document.getElementById(
      "studentAverageAccuracy"
    );


  if (completed) {

    completed.textContent =
      results.length;
  }


  if (!results.length) {

    if (averageWpm) {
      averageWpm.textContent =
        "0";
    }

    if (averageAccuracy) {
      averageAccuracy.textContent =
        "0%";
    }

    return;
  }


  const wpmTotal =
    results.reduce(
      function (sum, result) {

        return sum +
          Number(
            result.wpm || 0
          );

      },
      0
    );


  const accuracyTotal =
    results.reduce(
      function (sum, result) {

        return sum +
          Number(
            result.accuracy || 0
          );

      },
      0
    );


  if (averageWpm) {

    averageWpm.textContent =
      Math.round(
        wpmTotal /
        results.length
      );
  }


  if (averageAccuracy) {

    averageAccuracy.textContent =
      Math.round(
        accuracyTotal /
        results.length
      ) + "%";
  }
}


/* =====================================================
   7. STUDENT MATTER CARDS
===================================================== */

function renderStudentMatters() {

  const container =
    document.getElementById(
      "studentMatterCards"
    );


  if (!container) {
    return;
  }


  if (!currentUser) {
    return;
  }


  const student =
    getStudents().find(
      function (item) {

        return (
          item.id ===
          currentUser.id
        );
      }
    );


  if (!student) {

    container.innerHTML =
      '<div class="empty-state">Student account not found.</div>';

    return;
  }


  const assignedIds =
    student.assignedMatters || [];


  const matters =
    getMatters().filter(
      function (matter) {

        return (
          assignedIds.includes(
            matter.id
          ) &&
          matter.published !== false
        );
      }
    );


  if (!matters.length) {

    container.innerHTML =
      '<div class="empty-state">No practice assigned yet.</div>';

    return;
  }


  container.innerHTML =
    matters.map(
      function (matter) {

        const type =
          matter.type ||
          PRACTICE_TYPES.TRANSCRIBE;


        return `
          <div class="student-matter-card">

            <div class="matter-card-top">

              <span class="matter-type">
                ${getPracticeTypeLabel(type)}
              </span>

              <span class="matter-wpm">
                ${Number(
                  matter.wpm || 0
                )} WPM
              </span>

            </div>


            <h3>
              ${escapeHtml(
                matter.topic ||
                matter.title ||
                "Untitled Matter"
              )}
            </h3>


            <p>
              Duration:
              ${Number(
                matter.duration || 0
              )} minutes
            </p>


            <button
              type="button"
              class="primary-button"
              onclick="startPractice('${matter.id}')"
            >
              Start Practice
            </button>

          </div>
        `;
      }
    ).join("");
}


/* =====================================================
   8. STUDENT HISTORY
===================================================== */

function renderStudentHistory() {

  const container =
    document.getElementById(
      "studentHistory"
    );


  if (!container) {
    return;
  }


  if (!currentUser) {
    return;
  }


  const results =
    getResults()
      .filter(
        function (result) {

          return (
            result.studentId ===
            currentUser.id
          );
        }
      )
      .slice()
      .reverse()
      .slice(0, 10);


  if (!results.length) {

    container.innerHTML =
      '<div class="empty-state">No practice history yet.</div>';

    return;
  }


  container.innerHTML =
    results.map(
      function (result) {

        return `
          <div class="history-item">

            <div>

              <strong>
                ${escapeHtml(
                  result.matterTopic ||
                  "Practice"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  getPracticeTypeLabel(
                    result.practiceType ||
                    PRACTICE_TYPES.TRANSCRIBE
                  )
                )}
              </small>

            </div>


            <div class="history-score">

              <strong>
                ${Math.round(
                  Number(
                    result.accuracy || 0
                  )
                )}%
              </strong>

              <small>
                ${Math.round(
                  Number(
                    result.wpm || 0
                  )
                )} WPM
              </small>

            </div>

          </div>
        `;
      }
    ).join("");
}


/* =====================================================
   9. LOGIN SYSTEM
===================================================== */

function handleLogin(event) {

  event.preventDefault();


  const usernameInput =
    document.getElementById(
      "username"
    );


  const passwordInput =
    document.getElementById(
      "password"
    );


  if (!usernameInput || !passwordInput) {
    return;
  }


  const username =
    usernameInput.value.trim();


  const password =
    passwordInput.value;


  if (!username || !password) {

    showLoginError(
      "Please enter username and password."
    );

    return;
  }


  /* ---------------------------------------------------
     ADMIN LOGIN
  --------------------------------------------------- */

  if (
    currentUserType === "admin"
  ) {

    if (
      username ===
        ADMIN_ACCOUNT.username &&
      password ===
        ADMIN_ACCOUNT.password
    ) {

      currentUser = {

        type: "admin",

        username:
          ADMIN_ACCOUNT.username,

        name:
          ADMIN_ACCOUNT.name

      };


      const error =
        document.getElementById(
          "loginError"
        );


      if (error) {
        error.classList.add("hidden");
      }


      showScreen("adminScreen");

      showAdminPage("dashboard");

      loadAdminDashboard();

      showToast(
        "Welcome, Administrator!"
      );

      return;
    }


    showLoginError(
      "Invalid admin username or password."
    );

    return;
  }


  /* ---------------------------------------------------
     STUDENT LOGIN
  --------------------------------------------------- */

  const students =
    getStudents();


  const student =
    students.find(
      function (item) {

        return (
          item.username ===
            username &&
          item.password ===
            password
        );
      }
    );


  if (!student) {

    showLoginError(
      "Invalid username or password."
    );

    return;
  }


  if (
    student.status ===
    "inactive"
  ) {

    showLoginError(
      "Your student account is inactive."
    );

    return;
  }


  currentUser = {

    type: "student",

    id: student.id,

    username:
      student.username,

    name:
      student.name

  };


  const error =
    document.getElementById(
      "loginError"
    );


  if (error) {
    error.classList.add("hidden");
  }


  showScreen("studentScreen");

  loadStudentDashboard();

  showToast(
    "Welcome, " +
    student.name +
    "!"
  );
}


/* =====================================================
   10. LOGIN EVENTS
===================================================== */

function setupLoginEvents() {

  document
    .querySelectorAll(".login-tab")
    .forEach(function (tab) {

      tab.addEventListener(
        "click",
        function () {

          setLoginType(
            tab.dataset.loginType
          );

        }
      );

    });


  const loginForm =
    document.getElementById(
      "loginForm"
    );


  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      handleLogin
    );

  }
}


/* =====================================================
   11. LOGOUT EVENTS
===================================================== */

function setupLogoutEvents() {

  const adminLogout =
    document.getElementById(
      "adminLogout"
    );


  const studentLogout =
    document.getElementById(
      "studentLogout"
    );


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
}


/* =====================================================
   12. ADMIN NAVIGATION EVENTS
===================================================== */

function setupAdminNavigation() {

  document
    .querySelectorAll("[data-admin-page]")
    .forEach(function (item) {

      item.addEventListener(
        "click",
        function () {

          const page =
            item.dataset.adminPage;

          if (page) {

            showAdminPage(page);
          }

        }
      );

    });
}


/* =====================================================
   13. PART 2 INITIALIZATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    setupLoginEvents();

    setupLogoutEvents();

    setupAdminNavigation();

  }
);/* =====================================================
   PART 3 — ADMIN PRACTICE MATTERS MANAGEMENT
===================================================== */

function getMatterTypeLabel(type) {
    const labels = {
        dictation: "🎧 Dictation",
        transcribe: "⌨️ Transcribe",
        typing: "📝 Typing"
    };

    return labels[type] || "Practice";
}

function getMatterById(id) {
    return getMatters().find(matter => matter.id === id);
}

function renderMattersTable(searchTerm = "") {
    const table = document.getElementById("mattersTable");
    if (!table) return;

    const matters = getMatters();

    const filtered = matters.filter(matter => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) return true;

        return (
            matter.title.toLowerCase().includes(search) ||
            matter.id.toLowerCase().includes(search) ||
            getMatterTypeLabel(matter.type).toLowerCase().includes(search)
        );
    });

    if (!filtered.length) {
        table.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📄</div>
                <h3>No practices found</h3>
                <p>Create a new practice matter to get started.</p>
            </div>
        `;
        return;
    }

    table.innerHTML = `
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Practice</th>
                        <th>Type</th>
                        <th>WPM</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    ${filtered.map(matter => `
                        <tr>
                            <td>
                                <div class="table-primary">
                                    ${escapeHtml(matter.title)}
                                </div>
                                <div class="table-secondary">
                                    ${escapeHtml(matter.id)}
                                </div>
                            </td>

                            <td>
                                <span class="badge badge-info">
                                    ${getMatterTypeLabel(matter.type)}
                                </span>
                            </td>

                            <td>
                                ${Number(matter.wpm) || 0}
                            </td>

                            <td>
                                ${Number(matter.duration) || 0} min
                            </td>

                            <td>
                                ${
                                    matter.published
                                        ? `<span class="badge badge-success">Published</span>`
                                        : `<span class="badge badge-warning">Draft</span>`
                                }
                            </td>

                            <td>
                                <div class="table-actions">

                                    <button
                                        class="icon-button"
                                        type="button"
                                        title="Edit"
                                        onclick="editMatter('${matter.id}')">
                                        ✏️
                                    </button>

                                    <button
                                        class="icon-button"
                                        type="button"
                                        title="${matter.published ? "Unpublish" : "Publish"}"
                                        onclick="toggleMatterPublished('${matter.id}')">
                                        ${matter.published ? "⏸️" : "▶️"}
                                    </button>

                                    <button
                                        class="icon-button danger"
                                        type="button"
                                        title="Delete"
                                        onclick="deleteMatter('${matter.id}')">
                                        🗑️
                                    </button>

                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}


/* -----------------------------------------------------
   OPEN NEW MATTER EDITOR
----------------------------------------------------- */

function openNewMatterEditor() {
    const editor = document.getElementById("matterEditor");
    const title = document.getElementById("matterEditorTitle");
    const form = document.getElementById("matterForm");

    if (!editor || !form) return;

    editingMatterId = null;

    if (title) {
        title.textContent = "Create Practice Matter";
    }

    form.reset();

    const wpm = document.getElementById("matterWpm");
    const duration = document.getElementById("matterDuration");
    const text = document.getElementById("matterText");

    if (wpm) wpm.value = 35;
    if (duration) duration.value = 10;
    if (text) text.value = "";

    editor.classList.remove("hidden");

    editor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* -----------------------------------------------------
   CLOSE MATTER EDITOR
----------------------------------------------------- */

function closeMatterEditor() {
    const editor = document.getElementById("matterEditor");

    if (!editor) return;

    editor.classList.add("hidden");

    editingMatterId = null;
}


/* -----------------------------------------------------
   EDIT MATTER
----------------------------------------------------- */

function editMatter(id) {
    const matter = getMatterById(id);

    if (!matter) {
        showToast("Practice matter not found.", "error");
        return;
    }

    const editor = document.getElementById("matterEditor");
    const title = document.getElementById("matterEditorTitle");

    const matterTitle = document.getElementById("matterTitle");
    const matterWpm = document.getElementById("matterWpm");
    const matterDuration = document.getElementById("matterDuration");
    const matterText = document.getElementById("matterText");

    editingMatterId = id;

    if (title) {
        title.textContent = "Edit Practice Matter";
    }

    if (matterTitle) {
        matterTitle.value = matter.title || "";
    }

    if (matterWpm) {
        matterWpm.value = matter.wpm || 35;
    }

    if (matterDuration) {
        matterDuration.value = matter.duration || 10;
    }

    if (matterText) {
        matterText.value = matter.text || "";
    }

    if (editor) {
        editor.classList.remove("hidden");

        editor.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* -----------------------------------------------------
   SAVE MATTER
----------------------------------------------------- */

function saveMatter(event) {
    event.preventDefault();

    const titleInput = document.getElementById("matterTitle");
    const wpmInput = document.getElementById("matterWpm");
    const durationInput = document.getElementById("matterDuration");
    const textInput = document.getElementById("matterText");

    if (!titleInput || !wpmInput || !durationInput || !textInput) {
        showToast("Matter form could not be loaded.", "error");
        return;
    }

    const title = titleInput.value.trim();
    const wpm = Number(wpmInput.value);
    const duration = Number(durationInput.value);
    const text = textInput.value.trim();

    if (!title) {
        showToast("Please enter a practice title.", "error");
        titleInput.focus();
        return;
    }

    if (!wpm || wpm <= 0) {
        showToast("Please enter a valid WPM.", "error");
        wpmInput.focus();
        return;
    }

    if (!duration || duration <= 0) {
        showToast("Please enter a valid duration.", "error");
        durationInput.focus();
        return;
    }

    if (!text) {
        showToast("Please enter the practice matter.", "error");
        textInput.focus();
        return;
    }

    const matters = getMatters();

    if (editingMatterId) {

        const index = matters.findIndex(
            matter => matter.id === editingMatterId
        );

        if (index === -1) {
            showToast("Practice matter not found.", "error");
            return;
        }

        matters[index] = {
            ...matters[index],
            title,
            wpm,
            duration,
            text,
            updatedAt: new Date().toISOString()
        };

        setMatters(matters);

        showToast("Practice matter updated successfully.", "success");

    } else {

        const newMatter = {
            id: generateId("M"),
            title,
            type: PRACTICE_TYPES.TYPING,
            wpm,
            duration,
            audioUrl: "",
            text,
            formatting: {
                fontSize: 18,
                bold: false,
                italic: false,
                underline: false,
                alignment: "left"
            },
            published: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        matters.unshift(newMatter);

        setMatters(matters);

        showToast("Practice matter created successfully.", "success");
    }

    closeMatterEditor();

    renderMattersTable(
        document.getElementById("matterSearch")?.value || ""
    );

    loadAdminDashboard();
}


/* -----------------------------------------------------
   DELETE MATTER
----------------------------------------------------- */

function deleteMatter(id) {
    const matter = getMatterById(id);

    if (!matter) {
        showToast("Practice matter not found.", "error");
        return;
    }

    const confirmed = confirm(
        `Delete "${matter.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    const matters = getMatters().filter(
        item => item.id !== id
    );

    setMatters(matters);

    /* Remove this matter from student assignments */
    const students = getStudents();

    const updatedStudents = students.map(student => ({
        ...student,
        assignedMatterIds: Array.isArray(student.assignedMatterIds)
            ? student.assignedMatterIds.filter(
                matterId => matterId !== id
            )
            : []
    }));

    setStudents(updatedStudents);

    renderMattersTable(
        document.getElementById("matterSearch")?.value || ""
    );

    loadAdminDashboard();

    showToast("Practice matter deleted.", "success");
}


/* -----------------------------------------------------
   PUBLISH / UNPUBLISH MATTER
----------------------------------------------------- */

function toggleMatterPublished(id) {
    const matters = getMatters();

    const index = matters.findIndex(
        matter => matter.id === id
    );

    if (index === -1) {
        showToast("Practice matter not found.", "error");
        return;
    }

    matters[index].published = !matters[index].published;
    matters[index].updatedAt = new Date().toISOString();

    setMatters(matters);

    renderMattersTable(
        document.getElementById("matterSearch")?.value || ""
    );

    loadAdminDashboard();

    showToast(
        matters[index].published
            ? "Practice published."
            : "Practice moved to draft.",
        "success"
    );
}


/* -----------------------------------------------------
   MATTER SEARCH
----------------------------------------------------- */

function setupMatterSearch() {
    const searchInput = document.getElementById("matterSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        renderMattersTable(searchInput.value);
    });
}


/* -----------------------------------------------------
   MATTER PAGE EVENTS
----------------------------------------------------- */

function setupMatterEvents() {

    const newMatterButton =
        document.getElementById("newMatterButton");

    const closeMatterButton =
        document.getElementById("closeMatterEditor");

    const cancelMatterButton =
        document.getElementById("cancelMatter");

    const matterForm =
        document.getElementById("matterForm");

    if (newMatterButton) {
        newMatterButton.addEventListener(
            "click",
            openNewMatterEditor
        );
    }

    if (closeMatterButton) {
        closeMatterButton.addEventListener(
            "click",
            closeMatterEditor
        );
    }

    if (cancelMatterButton) {
        cancelMatterButton.addEventListener(
            "click",
            closeMatterEditor
        );
    }

    if (matterForm) {
        matterForm.addEventListener(
            "submit",
            saveMatter
        );
    }

    setupMatterSearch();
}


/* -----------------------------------------------------
   LOAD MATTERS PAGE
----------------------------------------------------- */

function loadMattersPage() {

    const editor = document.getElementById("matterEditor");

    if (editor) {
        editor.classList.add("hidden");
    }

    editingMatterId = null;

    renderMattersTable(
        document.getElementById("matterSearch")?.value || ""
    );
}


/* -----------------------------------------------------
   EXTEND ADMIN NAVIGATION
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    setupMatterEvents();

    document
        .querySelectorAll("[data-admin-page]")
        .forEach(item => {

            item.addEventListener("click", () => {

                const page =
                    item.getAttribute("data-admin-page");

                if (page === "matters") {
                    loadMattersPage();
                }

            });

        });

});/* =====================================================
   PART 4 — ADMIN STUDENTS MANAGEMENT
===================================================== */

function getStudentById(id) {
    return getStudents().find(student => student.id === id);
}


/* -----------------------------------------------------
   RENDER STUDENTS TABLE
----------------------------------------------------- */

function renderStudentsTable(searchTerm = "") {

    const table = document.getElementById("studentsTable");

    if (!table) return;

    const students = getStudents();

    const search = searchTerm.toLowerCase().trim();

    const filtered = students.filter(student => {

        if (!search) return true;

        return (
            (student.name || "").toLowerCase().includes(search) ||
            (student.username || "").toLowerCase().includes(search) ||
            (student.id || "").toLowerCase().includes(search)
        );
    });

    if (!filtered.length) {

        table.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👨‍🎓</div>
                <h3>No students found</h3>
                <p>Create a student account to get started.</p>
            </div>
        `;

        return;
    }

    table.innerHTML = `
        <div class="table-wrapper">
            <table>

                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Student ID</th>
                        <th>Username</th>
                        <th>Practices</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    ${filtered.map(student => {

                        const assigned =
                            Array.isArray(student.assignedMatterIds)
                                ? student.assignedMatterIds.length
                                : 0;

                        return `
                            <tr>

                                <td>
                                    <div class="table-primary">
                                        ${escapeHtml(student.name || "Unnamed")}
                                    </div>
                                </td>

                                <td>
                                    <div class="table-secondary">
                                        ${escapeHtml(student.id || "")}
                                    </div>
                                </td>

                                <td>
                                    ${escapeHtml(student.username || "")}
                                </td>

                                <td>
                                    <span class="badge badge-info">
                                        ${assigned}
                                    </span>
                                </td>

                                <td>
                                    ${
                                        student.active
                                            ? `<span class="badge badge-success">Active</span>`
                                            : `<span class="badge badge-warning">Inactive</span>`
                                    }
                                </td>

                                <td>

                                    <div class="table-actions">

                                        <button
                                            class="icon-button"
                                            type="button"
                                            title="Edit Student"
                                            onclick="editStudent('${student.id}')">
                                            ✏️
                                        </button>

                                        <button
                                            class="icon-button"
                                            type="button"
                                            title="${student.active ? "Deactivate" : "Activate"}"
                                            onclick="toggleStudentStatus('${student.id}')">
                                            ${student.active ? "⏸️" : "▶️"}
                                        </button>

                                        <button
                                            class="icon-button danger"
                                            type="button"
                                            title="Delete Student"
                                            onclick="deleteStudent('${student.id}')">
                                            🗑️
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        `;

                    }).join("")}

                </tbody>

            </table>
        </div>
    `;
}


/* -----------------------------------------------------
   OPEN NEW STUDENT EDITOR
----------------------------------------------------- */

function openNewStudentEditor() {

    const editor =
        document.getElementById("studentEditor");

    const title =
        document.getElementById("studentEditorTitle");

    const form =
        document.getElementById("studentForm");

    if (!editor || !form) return;

    editingStudentId = null;

    if (title) {
        title.textContent = "Create Student";
    }

    form.reset();

    const status =
        document.getElementById("studentStatus");

    if (status) {
        status.value = "active";
    }

    editor.classList.remove("hidden");

    editor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* -----------------------------------------------------
   CLOSE STUDENT EDITOR
----------------------------------------------------- */

function closeStudentEditor() {

    const editor =
        document.getElementById("studentEditor");

    if (!editor) return;

    editor.classList.add("hidden");

    editingStudentId = null;
}


/* -----------------------------------------------------
   EDIT STUDENT
----------------------------------------------------- */

function editStudent(id) {

    const student = getStudentById(id);

    if (!student) {
        showToast("Student not found.", "error");
        return;
    }

    const editor =
        document.getElementById("studentEditor");

    const title =
        document.getElementById("studentEditorTitle");

    const name =
        document.getElementById("studentName");

    const studentId =
        document.getElementById("studentId");

    const password =
        document.getElementById("studentPassword");

    const status =
        document.getElementById("studentStatus");

    editingStudentId = id;

    if (title) {
        title.textContent = "Edit Student";
    }

    if (name) {
        name.value = student.name || "";
    }

    if (studentId) {
        studentId.value = student.id || "";
        studentId.disabled = true;
    }

    if (password) {
        password.value = student.password || "";
    }

    if (status) {
        status.value = student.active
            ? "active"
            : "inactive";
    }

    if (editor) {

        editor.classList.remove("hidden");

        editor.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
}


/* -----------------------------------------------------
   SAVE STUDENT
----------------------------------------------------- */

function saveStudent(event) {

    event.preventDefault();

    const nameInput =
        document.getElementById("studentName");

    const idInput =
        document.getElementById("studentId");

    const passwordInput =
        document.getElementById("studentPassword");

    const statusInput =
        document.getElementById("studentStatus");

    if (
        !nameInput ||
        !idInput ||
        !passwordInput ||
        !statusInput
    ) {
        showToast(
            "Student form could not be loaded.",
            "error"
        );

        return;
    }

    const name =
        nameInput.value.trim();

    const studentId =
        idInput.value.trim();

    const password =
        passwordInput.value.trim();

    const status =
        statusInput.value;

    if (!name) {

        showToast(
            "Please enter student name.",
            "error"
        );

        nameInput.focus();

        return;
    }

    if (!studentId) {

        showToast(
            "Please enter student ID.",
            "error"
        );

        idInput.focus();

        return;
    }

    if (!password) {

        showToast(
            "Please enter password.",
            "error"
        );

        passwordInput.focus();

        return;
    }

    const students = getStudents();

    /* -------------------------------------------------
       EDIT EXISTING STUDENT
    ------------------------------------------------- */

    if (editingStudentId) {

        const index =
            students.findIndex(
                student =>
                    student.id === editingStudentId
            );

        if (index === -1) {

            showToast(
                "Student not found.",
                "error"
            );

            return;
        }

        students[index] = {
            ...students[index],

            name,

            password,

            active:
                status === "active",

            updatedAt:
                new Date().toISOString()
        };

        setStudents(students);

        showToast(
            "Student updated successfully.",
            "success"
        );

    }

    /* -------------------------------------------------
       CREATE NEW STUDENT
    ------------------------------------------------- */

    else {

        const duplicateId =
            students.some(
                student =>
                    student.id.toLowerCase() ===
                    studentId.toLowerCase()
            );

        if (duplicateId) {

            showToast(
                "This Student ID already exists.",
                "error"
            );

            idInput.focus();

            return;
        }

        const duplicateUsername =
            students.some(
                student =>
                    student.username.toLowerCase() ===
                    studentId.toLowerCase()
            );

        const newStudent = {

            id: studentId,

            name,

            username:
                duplicateUsername
                    ? `${studentId}_${Date.now()}`
                    : studentId,

            password,

            active:
                status === "active",

            assignedMatterIds: [],

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        students.unshift(newStudent);

        setStudents(students);

        showToast(
            "Student created successfully.",
            "success"
        );
    }

    /* Re-enable Student ID field */
    idInput.disabled = false;

    closeStudentEditor();

    renderStudentsTable(
        document.getElementById("studentSearch")?.value || ""
    );

    loadAdminDashboard();
}


/* -----------------------------------------------------
   DELETE STUDENT
----------------------------------------------------- */

function deleteStudent(id) {

    const student =
        getStudentById(id);

    if (!student) {

        showToast(
            "Student not found.",
            "error"
        );

        return;
    }

    const confirmed =
        confirm(
            `Delete "${student.name}"?\n\nThis action cannot be undone.`
        );

    if (!confirmed) return;

    const students =
        getStudents().filter(
            item =>
                item.id !== id
        );

    setStudents(students);

    renderStudentsTable(
        document.getElementById("studentSearch")?.value || ""
    );

    loadAdminDashboard();

    showToast(
        "Student deleted.",
        "success"
    );
}


/* -----------------------------------------------------
   ACTIVATE / DEACTIVATE STUDENT
----------------------------------------------------- */

function toggleStudentStatus(id) {

    const students =
        getStudents();

    const index =
        students.findIndex(
            student =>
                student.id === id
        );

    if (index === -1) {

        showToast(
            "Student not found.",
            "error"
        );

        return;
    }

    students[index].active =
        !students[index].active;

    students[index].updatedAt =
        new Date().toISOString();

    setStudents(students);

    renderStudentsTable(
        document.getElementById("studentSearch")?.value || ""
    );

    loadAdminDashboard();

    showToast(
        students[index].active
            ? "Student activated."
            : "Student deactivated.",
        "success"
    );
}


/* -----------------------------------------------------
   STUDENT SEARCH
----------------------------------------------------- */

function setupStudentSearch() {

    const searchInput =
        document.getElementById("studentSearch");

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        () => {

            renderStudentsTable(
                searchInput.value
            );

        }
    );
}


/* -----------------------------------------------------
   STUDENT PAGE EVENTS
----------------------------------------------------- */

function setupStudentManagementEvents() {

    const newStudentButton =
        document.getElementById("newStudentButton");

    const closeStudentButton =
        document.getElementById("closeStudentEditor");

    const cancelStudentButton =
        document.getElementById("cancelStudent");

    const studentForm =
        document.getElementById("studentForm");

    if (newStudentButton) {

        newStudentButton.addEventListener(
            "click",
            openNewStudentEditor
        );

    }

    if (closeStudentButton) {

        closeStudentButton.addEventListener(
            "click",
            closeStudentEditor
        );

    }

    if (cancelStudentButton) {

        cancelStudentButton.addEventListener(
            "click",
            closeStudentEditor
        );

    }

    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            saveStudent
        );

    }

    setupStudentSearch();
}


/* -----------------------------------------------------
   LOAD STUDENTS PAGE
----------------------------------------------------- */

function loadStudentsPage() {

    const editor =
        document.getElementById("studentEditor");

    if (editor) {
        editor.classList.add("hidden");
    }

    editingStudentId = null;

    const studentId =
        document.getElementById("studentId");

    if (studentId) {
        studentId.disabled = false;
    }

    renderStudentsTable(
        document.getElementById("studentSearch")?.value || ""
    );
}


/* -----------------------------------------------------
   CONNECT STUDENTS PAGE WITH ADMIN NAVIGATION
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    setupStudentManagementEvents();

    document
        .querySelectorAll("[data-admin-page]")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const page =
                        item.getAttribute(
                            "data-admin-page"
                        );

                    if (page === "students") {
                        loadStudentsPage();
                    }

                }
            );

        });

});/* =====================================================
   PART 5 — PRACTICE ENGINE CORE
===================================================== */

function getAssignedMattersForStudent(student) {

    if (!student) return [];

    const assignedIds =
        Array.isArray(student.assignedMatterIds)
            ? student.assignedMatterIds
            : [];

    return getMatters().filter(matter =>
        assignedIds.includes(matter.id) &&
        matter.published !== false
    );
}


/* -----------------------------------------------------
   START PRACTICE
----------------------------------------------------- */

function startPractice(matterId) {

    const matter = getMatterById(matterId);

    if (!matter) {
        showToast("Practice matter not found.", "error");
        return;
    }

    if (!matter.published) {
        showToast("This practice is not published.", "error");
        return;
    }

    if (
        currentUserType !== "student" ||
        !currentUser
    ) {
        showToast("Please login as a student.", "error");
        return;
    }

    const assigned =
        Array.isArray(currentUser.assignedMatterIds) &&
        currentUser.assignedMatterIds.includes(matter.id);

    if (!assigned) {
        showToast(
            "This practice has not been assigned to you.",
            "error"
        );
        return;
    }

    /* Stop any previous timer */
    stopPracticeTimer();

    currentMatter = matter;
    currentPracticeType =
        isValidPracticeType(matter.type)
            ? matter.type
            : PRACTICE_TYPES.TYPING;

    practiceStarted = false;
    practiceFinished = false;
    practiceStartTime = null;
    practiceElapsedSeconds = 0;
    currentPracticeResult = null;

    showScreen("practiceScreen");

    preparePracticeScreen();

    setPracticeStatus("ready");
}


/* -----------------------------------------------------
   PREPARE PRACTICE SCREEN
----------------------------------------------------- */

function preparePracticeScreen() {

    if (!currentMatter) return;

    const title =
        document.getElementById("practiceTitle");

    const timer =
        document.getElementById("timer");

    const liveWpm =
        document.getElementById("liveWpm");

    const liveWords =
        document.getElementById("liveWords");

    const status =
        document.getElementById("typingStatus");

    const errorStatus =
        document.getElementById("liveErrorStatus");

    const characterCount =
        document.getElementById("characterCount");

    const typingArea =
        document.getElementById("typingArea");

    const target =
        document.getElementById("practiceTarget");

    if (title) {
        title.textContent =
            currentMatter.title || "Practice";
    }

    if (timer) {
        timer.textContent =
            formatPracticeTime(
                Number(currentMatter.duration || 10) * 60
            );
    }

    if (liveWpm) {
        liveWpm.textContent = "—";
    }

    if (liveWords) {
        liveWords.textContent = "0";
    }

    if (status) {
        status.textContent = "Ready";
        status.className = "status-ready";
    }

    if (errorStatus) {
        errorStatus.textContent = "0 mistakes";
    }

    if (characterCount) {
        characterCount.textContent = "0 characters";
    }

    if (typingArea) {

        typingArea.value = "";

        typingArea.disabled = false;

        typingArea.placeholder =
            getPracticePlaceholder();

    }

    /*
     * During Transcribe mode the original matter
     * must NOT be displayed to the student.
     *
     * Typing mode will display the matter.
     */

    if (target) {

        if (
            currentPracticeType ===
            PRACTICE_TYPES.TYPING
        ) {

            target.innerHTML = `
                <div class="target-badge">
                    📝 Reference Matter
                </div>

                <div class="practice-reference-text">
                    ${escapeHtml(
                        currentMatter.text || ""
                    )}
                </div>
            `;

        } else if (
            currentPracticeType ===
            PRACTICE_TYPES.DICTATION
        ) {

            target.innerHTML = `
                <div class="target-badge">
                    🎧 Dictation
                </div>

                <div class="practice-mode-message">
                    <strong>Listen carefully and type.</strong>
                    <span>The original matter is hidden during practice.</span>
                </div>
            `;

        } else {

            target.innerHTML = `
                <div class="target-badge">
                    ⌨️ Transcription
                </div>

                <div class="practice-mode-message">
                    <strong>Type the matter from your source.</strong>
                    <span>The original matter is hidden during practice.</span>
                </div>
            `;
        }
    }

    updatePracticeModeUI();

    updateCharacterCount();
}


/* -----------------------------------------------------
   PRACTICE PLACEHOLDER
----------------------------------------------------- */

function getPracticePlaceholder() {

    if (
        currentPracticeType ===
        PRACTICE_TYPES.DICTATION
    ) {
        return "Start typing what you hear...";
    }

    if (
        currentPracticeType ===
        PRACTICE_TYPES.TRANSCRIBE
    ) {
        return "Start your transcription here...";
    }

    return "Start typing here...";
}


/* -----------------------------------------------------
   MODE UI
----------------------------------------------------- */

function updatePracticeModeUI() {

    const practiceScreen =
        document.getElementById("practiceScreen");

    if (!practiceScreen) return;

    practiceScreen.dataset.practiceType =
        currentPracticeType || "";
}


/* -----------------------------------------------------
   PRACTICE STATUS
----------------------------------------------------- */

function setPracticeStatus(status) {

    const element =
        document.getElementById("typingStatus");

    if (!element) return;

    const statusMap = {

        ready: {
            text: "Ready",
            className: "status-ready"
        },

        running: {
            text: "In Progress",
            className: "status-running"
        },

        finished: {
            text: "Submitted",
            className: "status-finished"
        }
    };

    const config =
        statusMap[status] ||
        statusMap.ready;

    element.textContent =
        config.text;

    element.className =
        config.className;
}


/* -----------------------------------------------------
   FORMAT TIME
----------------------------------------------------- */

function formatPracticeTime(totalSeconds) {

    const seconds =
        Math.max(
            0,
            Math.floor(Number(totalSeconds) || 0)
        );

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}


/* -----------------------------------------------------
   START TIMER
----------------------------------------------------- */

function startPracticeTimer() {

    stopPracticeTimer();

    if (!currentMatter) return;

    practiceStartTime =
        Date.now();

    practiceStarted = true;
    practiceFinished = false;

    setPracticeStatus("running");

    practiceTimerInterval =
        setInterval(() => {

            if (practiceFinished) {
                stopPracticeTimer();
                return;
            }

            practiceElapsedSeconds =
                Math.floor(
                    (
                        Date.now() -
                        practiceStartTime
                    ) / 1000
                );

            updatePracticeTimerDisplay();

            const durationSeconds =
                Number(currentMatter.duration || 10) *
                60;

            if (
                practiceElapsedSeconds >=
                durationSeconds
            ) {

                practiceElapsedSeconds =
                    durationSeconds;

                updatePracticeTimerDisplay();

                stopPracticeTimer();

                autoSubmitPractice();
            }

        }, 250);
}


/* -----------------------------------------------------
   UPDATE TIMER DISPLAY
----------------------------------------------------- */

function updatePracticeTimerDisplay() {

    const timer =
        document.getElementById("timer");

    if (!timer) return;

    const durationSeconds =
        Number(currentMatter?.duration || 10) * 60;

    const remaining =
        Math.max(
            0,
            durationSeconds -
            practiceElapsedSeconds
        );

    timer.textContent =
        formatPracticeTime(remaining);
}


/* -----------------------------------------------------
   PRACTICE INPUT
----------------------------------------------------- */

function handlePracticeInput() {

    if (!currentMatter) return;

    if (practiceFinished) return;

    /*
     * First keystroke starts the timer.
     * There is deliberately NO pause button
     * and NO reset during the running test.
     */

    if (!practiceStarted) {
        startPracticeTimer();
    }

    updateCharacterCount();

    updateLiveWordCount();

    updateLiveErrorCount();
}


/* -----------------------------------------------------
   CHARACTER COUNT
----------------------------------------------------- */

function updateCharacterCount() {

    const typingArea =
        document.getElementById("typingArea");

    const counter =
        document.getElementById("characterCount");

    if (!typingArea || !counter) return;

    const count =
        typingArea.value.length;

    counter.textContent =
        `${count} character${count === 1 ? "" : "s"}`;
}


/* -----------------------------------------------------
   WORD COUNT
----------------------------------------------------- */

function getTypedWords() {

    const typingArea =
        document.getElementById("typingArea");

    if (!typingArea) return [];

    return typingArea.value
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}


function updateLiveWordCount() {

    const element =
        document.getElementById("liveWords");

    if (!element) return;

    element.textContent =
        String(getTypedWords().length);
}


/* -----------------------------------------------------
   LIVE ERROR COUNT
   (Only a basic indicator for now.
    Detailed analysis comes after submit.)
----------------------------------------------------- */

function updateLiveErrorCount() {

    const element =
        document.getElementById("liveErrorStatus");

    if (!element) return;

    /*
     * During the actual test we don't expose
     * detailed mistakes to the student.
     * This is intentionally kept minimal.
     */

    element.textContent = "Analysis after submit";
}


/* -----------------------------------------------------
   PRACTICE EVENT SETUP
----------------------------------------------------- */

function setupPracticeEvents() {

    const typingArea =
        document.getElementById("typingArea");

    const finishButton =
        document.getElementById("finishPractice");

    const startButton =
        document.getElementById("startPractice");

    const resetButton =
        document.getElementById("resetPractice");

    const exitButton =
        document.getElementById("exitPractice");


    /* ---------------------------------------------
       TYPING INPUT
    --------------------------------------------- */

    if (typingArea) {

        typingArea.addEventListener(
            "input",
            handlePracticeInput
        );

        /*
         * Prevent browser autocomplete/spell UI
         * from interfering with practice.
         */

        typingArea.setAttribute(
            "autocomplete",
            "off"
        );

        typingArea.setAttribute(
            "autocorrect",
            "off"
        );

        typingArea.setAttribute(
            "autocapitalize",
            "off"
        );

        typingArea.setAttribute(
            "spellcheck",
            "false"
        );
    }


    /* ---------------------------------------------
       START BUTTON
    --------------------------------------------- */

    if (startButton) {

        startButton.addEventListener(
            "click",
            () => {

                if (
                    !currentMatter ||
                    practiceFinished
                ) return;

                if (!practiceStarted) {

                    if (typingArea) {
                        typingArea.focus();
                    }

                    startPracticeTimer();
                }

            }
        );
    }


    /* ---------------------------------------------
       SUBMIT BUTTON
    --------------------------------------------- */

    if (finishButton) {

        finishButton.addEventListener(
            "click",
            () => {

                if (practiceFinished) return;

                if (!practiceStarted) {

                    showToast(
                        "Start the practice first.",
                        "error"
                    );

                    return;
                }

                submitPractice();
            }
        );
    }


    /* ---------------------------------------------
       RESET BUTTON
       
       IMPORTANT:
       Reset is disabled during the actual test.
       --------------------------------------------- */

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                if (practiceStarted) {

                    showToast(
                        "Reset is not available during a test.",
                        "error"
                    );

                    return;
                }

                preparePracticeScreen();

            }
        );
    }


    /* ---------------------------------------------
       EXIT
       --------------------------------------------- */

    if (exitButton) {

        exitButton.addEventListener(
            "click",
            () => {

                if (practiceStarted && !practiceFinished) {

                    const leave =
                        confirm(
                            "The practice is still running.\n\nAre you sure you want to leave?"
                        );

                    if (!leave) return;

                }

                stopPracticeTimer();

                clearPracticeRuntimeState();

                if (currentUserType === "student") {
                    showScreen("studentScreen");
                    loadStudentDashboard();
                } else {
                    showScreen("loginScreen");
                }

            }
        );
    }
}


/* -----------------------------------------------------
   AUTO SUBMIT
----------------------------------------------------- */

function autoSubmitPractice() {

    if (practiceFinished) return;

    showToast(
        "Time is over. Your practice has been submitted.",
        "success"
    );

    submitPractice();
}


/* -----------------------------------------------------
   SUBMIT PRACTICE
----------------------------------------------------- */

function submitPractice() {

    if (!currentMatter) return;

    if (practiceFinished) return;

    practiceFinished = true;

    stopPracticeTimer();

    const typingArea =
        document.getElementById("typingArea");

    if (typingArea) {
        typingArea.disabled = true;
    }

    setPracticeStatus("finished");

    /*
     * Actual comparison/result calculation will be
     * added in the next practice-analysis section.
     */

    const typedText =
        typingArea
            ? typingArea.value
            : "";

    currentPracticeResult = {

        matterId:
            currentMatter.id,

        matterTitle:
            currentMatter.title,

        practiceType:
            currentPracticeType,

        typedText,

        elapsedSeconds:
            practiceElapsedSeconds,

        submittedAt:
            new Date().toISOString()
    };

    /*
     * Part 6 will calculate:
     * - WPM
     * - Accuracy
     * - Correct words
     * - Mistakes
     * - Missing words
     * - Extra words
     * - Detailed analysis
     */

    showToast(
        "Practice submitted. Calculating result...",
        "success"
    );

    setTimeout(() => {

        showScreen("resultScreen");

        prepareBasicResultScreen();

    }, 350);
}


/* -----------------------------------------------------
   BASIC RESULT SCREEN
----------------------------------------------------- */

function prepareBasicResultScreen() {

    const subtitle =
        document.getElementById("resultSubtitle");

    const resultTime =
        document.getElementById("resultTime");

    const resultWords =
        document.getElementById("resultWords");

    const resultWpm =
        document.getElementById("resultWpm");

    const resultAccuracy =
        document.getElementById("resultAccuracy");

    const mistakeCount =
        document.getElementById("mistakeCount");

    if (subtitle) {

        subtitle.textContent =
            `${currentMatter?.title || "Practice"} • ${
                getPracticeTypeLabel(
                    currentPracticeType
                )
            }`;
    }

    if (resultTime) {

        resultTime.textContent =
            formatPracticeTime(
                practiceElapsedSeconds
            );
    }

    if (resultWords) {

        resultWords.textContent =
            String(
                getTypedWords().length
            );
    }

    if (resultWpm) {
        resultWpm.textContent = "—";
    }

    if (resultAccuracy) {
        resultAccuracy.textContent = "—";
    }

    if (mistakeCount) {
        mistakeCount.textContent = "—";
    }

    const mistakesList =
        document.getElementById("mistakesList");

    const wordAnalysis =
        document.getElementById("wordAnalysis");

    if (mistakesList) {

        mistakesList.innerHTML = `
            <div class="empty-state">
                <p>Detailed analysis will appear here.</p>
            </div>
        `;
    }

    if (wordAnalysis) {

        wordAnalysis.innerHTML = `
            <div class="empty-state">
                <p>Calculating practice analysis...</p>
            </div>
        `;
    }
}


/* -----------------------------------------------------
   CONNECT PRACTICE EVENTS
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    setupPracticeEvents();

});/* =====================================================
   PART 6 — RESULT ANALYSIS ENGINE
===================================================== */


/* -----------------------------------------------------
   NORMALIZE TEXT
----------------------------------------------------- */

function normalizePracticeText(text) {

    return String(text || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim();
}


/* -----------------------------------------------------
   GET WORDS
----------------------------------------------------- */

function getWordsFromText(text) {

    const normalized =
        normalizePracticeText(text);

    if (!normalized) return [];

    return normalized
        .split(/\s+/)
        .filter(Boolean);
}


/* -----------------------------------------------------
   WORD COMPARISON
----------------------------------------------------- */

function comparePracticeWords(originalText, typedText) {

    const originalWords =
        getWordsFromText(originalText);

    const typedWords =
        getWordsFromText(typedText);

    const maxLength =
        Math.max(
            originalWords.length,
            typedWords.length
        );

    let correctWords = 0;
    let mistakes = 0;
    let missingWords = [];
    let extraWords = [];

    const comparison = [];

    for (let i = 0; i < maxLength; i++) {

        const original =
            originalWords[i];

        const typed =
            typedWords[i];

        /* Both words exist */
        if (
            original !== undefined &&
            typed !== undefined
        ) {

            if (
                original.toLowerCase() ===
                typed.toLowerCase()
            ) {

                correctWords++;

                comparison.push({
                    position: i + 1,
                    original,
                    typed,
                    status: "correct"
                });

            } else {

                mistakes++;

                comparison.push({
                    position: i + 1,
                    original,
                    typed,
                    status: "mistake"
                });
            }

        }

        /* Original exists but student missed it */
        else if (
            original !== undefined &&
            typed === undefined
        ) {

            missingWords.push(original);

            comparison.push({
                position: i + 1,
                original,
                typed: "",
                status: "missing"
            });
        }

        /* Student typed an extra word */
        else if (
            original === undefined &&
            typed !== undefined
        ) {

            extraWords.push(typed);

            comparison.push({
                position: i + 1,
                original: "",
                typed,
                status: "extra"
            });
        }
    }

    return {
        originalWords,
        typedWords,
        correctWords,
        mistakes,
        missingWords,
        extraWords,
        comparison
    };
}


/* -----------------------------------------------------
   CHARACTER ANALYSIS
----------------------------------------------------- */

function calculateCharacterAccuracy(
    originalText,
    typedText
) {

    const original =
        normalizePracticeText(originalText);

    const typed =
        normalizePracticeText(typedText);

    if (!original.length) {
        return 0;
    }

    const maxLength =
        Math.max(
            original.length,
            typed.length
        );

    let correctCharacters = 0;

    for (let i = 0; i < maxLength; i++) {

        if (
            original[i] !== undefined &&
            typed[i] !== undefined &&
            original[i].toLowerCase() ===
            typed[i].toLowerCase()
        ) {

            correctCharacters++;
        }
    }

    return Math.min(
        100,
        Math.max(
            0,
            (correctCharacters / original.length) * 100
        )
    );
}


/* -----------------------------------------------------
   CALCULATE WPM
----------------------------------------------------- */

function calculateWPM(
    typedText,
    elapsedSeconds
) {

    const words =
        getWordsFromText(typedText).length;

    const minutes =
        Number(elapsedSeconds) / 60;

    if (
        words <= 0 ||
        minutes <= 0
    ) {
        return 0;
    }

    return Math.round(
        words / minutes
    );
}


/* -----------------------------------------------------
   CALCULATE WORD ACCURACY
----------------------------------------------------- */

function calculateWordAccuracy(
    correctWords,
    typedWords
) {

    if (!typedWords) return 0;

    return Math.min(
        100,
        Math.max(
            0,
            (correctWords / typedWords) * 100
        )
    );
}


/* -----------------------------------------------------
   COMPLETE PRACTICE ANALYSIS
----------------------------------------------------- */

function analyzePracticeResult() {

    if (!currentMatter) {
        return null;
    }

    const typingArea =
        document.getElementById("typingArea");

    const typedText =
        typingArea
            ? typingArea.value
            : (
                currentPracticeResult?.typedText ||
                ""
            );

    const originalText =
        currentMatter.text || "";

    const comparison =
        comparePracticeWords(
            originalText,
            typedText
        );

    const typedWordCount =
        comparison.typedWords.length;

    const originalWordCount =
        comparison.originalWords.length;

    const wpm =
        calculateWPM(
            typedText,
            practiceElapsedSeconds
        );

    const wordAccuracy =
        calculateWordAccuracy(
            comparison.correctWords,
            typedWordCount
        );

    const characterAccuracy =
        calculateCharacterAccuracy(
            originalText,
            typedText
        );

    /*
     * Final accuracy uses word accuracy.
     * Character accuracy is also retained
     * for detailed reporting.
     */

    const accuracy =
        Number(
            wordAccuracy.toFixed(2)
        );

    return {

        matterId:
            currentMatter.id,

        matterTitle:
            currentMatter.title,

        practiceType:
            currentPracticeType,

        originalWordCount,

        typedWordCount,

        correctWords:
            comparison.correctWords,

        mistakes:
            comparison.mistakes,

        missingWords:
            comparison.missingWords,

        extraWords:
            comparison.extraWords,

        wpm,

        accuracy,

        wordAccuracy:
            Number(
                wordAccuracy.toFixed(2)
            ),

        characterAccuracy:
            Number(
                characterAccuracy.toFixed(2)
            ),

        elapsedSeconds:
            practiceElapsedSeconds,

        elapsedTime:
            formatPracticeTime(
                practiceElapsedSeconds
            ),

        typedText,

        comparison:
            comparison.comparison,

        submittedAt:
            new Date().toISOString()
    };
}


/* -----------------------------------------------------
   SAVE RESULT
----------------------------------------------------- */

function savePracticeResult(result) {

    if (!result) return;

    const results =
        getResults();

    const savedResult = {

        id:
            generateId("R"),

        ...result,

        studentId:
            currentUser?.id || "",

        studentName:
            currentUser?.name || "",

        studentUsername:
            currentUser?.username || ""
    };

    results.unshift(savedResult);

    setResults(results);

    return savedResult;
}


/* -----------------------------------------------------
   FORMAT PERCENTAGE
----------------------------------------------------- */

function formatPercentage(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "0%";
    }

    return `${number.toFixed(1)}%`;
}


/* -----------------------------------------------------
   RENDER RESULT SUMMARY
----------------------------------------------------- */

function renderResultSummary(result) {

    if (!result) return;

    const resultAccuracy =
        document.getElementById("resultAccuracy");

    const resultWpm =
        document.getElementById("resultWpm");

    const resultTime =
        document.getElementById("resultTime");

    const resultWords =
        document.getElementById("resultWords");

    const mistakeCount =
        document.getElementById("mistakeCount");

    if (resultAccuracy) {

        resultAccuracy.textContent =
            formatPercentage(
                result.accuracy
            );
    }

    if (resultWpm) {

        resultWpm.textContent =
            `${result.wpm}`;
    }

    if (resultTime) {

        resultTime.textContent =
            result.elapsedTime;
    }

    if (resultWords) {

        resultWords.textContent =
            `${result.typedWordCount}`;
    }

    if (mistakeCount) {

        mistakeCount.textContent =
            `${result.mistakes}`;
    }
}


/* -----------------------------------------------------
   RENDER MISTAKES
----------------------------------------------------- */

function renderMistakesList(result) {

    const container =
        document.getElementById("mistakesList");

    if (!container || !result) return;

    const mistakes =
        result.comparison.filter(
            item =>
                item.status === "mistake"
        );

    if (!mistakes.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✓</div>
                <h3>No word mistakes</h3>
                <p>All typed words matched the reference.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="analysis-list">

            ${mistakes.map(item => `
                <div class="analysis-row">

                    <div>
                        <span class="analysis-label">
                            Word ${item.position}
                        </span>
                    </div>

                    <div>
                        <span class="analysis-original">
                            ${escapeHtml(item.original)}
                        </span>
                    </div>

                    <div>
                        <span class="analysis-typed">
                            ${escapeHtml(item.typed)}
                        </span>
                    </div>

                </div>
            `).join("")}

        </div>
    `;
}


/* -----------------------------------------------------
   RENDER WORD ANALYSIS
----------------------------------------------------- */

function renderWordAnalysis(result) {

    const container =
        document.getElementById("wordAnalysis");

    if (!container || !result) return;

    const missing =
        result.missingWords || [];

    const extra =
        result.extraWords || [];

    container.innerHTML = `

        <div class="analysis-summary-grid">

            <div class="analysis-summary-item">
                <span class="analysis-number">
                    ${result.correctWords}
                </span>
                <span class="analysis-text">
                    Correct Words
                </span>
            </div>

            <div class="analysis-summary-item">
                <span class="analysis-number">
                    ${result.mistakes}
                </span>
                <span class="analysis-text">
                    Mistakes
                </span>
            </div>

            <div class="analysis-summary-item">
                <span class="analysis-number">
                    ${missing.length}
                </span>
                <span class="analysis-text">
                    Missing Words
                </span>
            </div>

            <div class="analysis-summary-item">
                <span class="analysis-number">
                    ${extra.length}
                </span>
                <span class="analysis-text">
                    Extra Words
                </span>
            </div>

        </div>

        <div class="word-analysis-details">

            <div class="analysis-detail-section">

                <h4>Missing Words</h4>

                ${
                    missing.length
                        ? `
                            <div class="word-chip-list">
                                ${missing.map(word => `
                                    <span class="word-chip missing">
                                        ${escapeHtml(word)}
                                    </span>
                                `).join("")}
                            </div>
                          `
                        : `
                            <p class="analysis-empty">
                                No missing words.
                            </p>
                          `
                }

            </div>


            <div class="analysis-detail-section">

                <h4>Extra Words</h4>

                ${
                    extra.length
                        ? `
                            <div class="word-chip-list">
                                ${extra.map(word => `
                                    <span class="word-chip extra">
                                        ${escapeHtml(word)}
                                    </span>
                                `).join("")}
                            </div>
                          `
                        : `
                            <p class="analysis-empty">
                                No extra words.
                            </p>
                          `
                }

            </div>


            <div class="analysis-detail-section">

                <h4>Character Accuracy</h4>

                <p class="analysis-stat-line">
                    ${formatPercentage(
                        result.characterAccuracy
                    )}
                </p>

            </div>

        </div>
    `;
}


/* -----------------------------------------------------
   COMPLETE RESULT SCREEN
----------------------------------------------------- */

function renderCompleteResult(result) {

    if (!result) return;

    currentPracticeResult =
        result;

    renderResultSummary(result);

    renderMistakesList(result);

    renderWordAnalysis(result);

    const subtitle =
        document.getElementById("resultSubtitle");

    if (subtitle) {

        subtitle.textContent =
            `${result.matterTitle} • ${
                getPracticeTypeLabel(
                    result.practiceType
                )
            }`;
    }
}


/* -----------------------------------------------------
   REPLACE SUBMIT FUNCTION
----------------------------------------------------- */

function completeAndSavePractice() {

    if (!currentMatter) return null;

    const analysis =
        analyzePracticeResult();

    if (!analysis) {

        showToast(
            "Unable to calculate result.",
            "error"
        );

        return null;
    }

    const saved =
        savePracticeResult(analysis);

    return saved;
}


/* -----------------------------------------------------
   UPDATED SUBMIT HANDLER
----------------------------------------------------- */

function submitPracticeWithAnalysis() {

    if (!currentMatter) return;

    if (practiceFinished) return;

    practiceFinished = true;

    stopPracticeTimer();

    const typingArea =
        document.getElementById("typingArea");

    if (typingArea) {
        typingArea.disabled = true;
    }

    setPracticeStatus("finished");

    const result =
        completeAndSavePractice();

    if (!result) return;

    showScreen("resultScreen");

    renderCompleteResult(result);

    if (currentUserType === "student") {
        loadStudentDashboard();
    }

    showToast(
        "Practice submitted successfully.",
        "success"
    );
}


/* -----------------------------------------------------
   UPDATED AUTO SUBMIT
----------------------------------------------------- */

function autoSubmitPracticeWithAnalysis() {

    if (practiceFinished) return;

    submitPracticeWithAnalysis();
}


/* -----------------------------------------------------
   OVERRIDE OLD SUBMIT/AUTO-SUBMIT FUNCTIONS
----------------------------------------------------- */

submitPractice =
    submitPracticeWithAnalysis;

autoSubmitPractice =
    autoSubmitPracticeWithAnalysis;


/* -----------------------------------------------------
   RESULT SCREEN BUTTONS
----------------------------------------------------- */

function setupResultEvents() {

    const backButton =
        document.getElementById("backToDashboard");

    const againButton =
        document.getElementById("practiceAgain");

    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                stopPracticeTimer();

                clearPracticeRuntimeState();

                if (currentUserType === "student") {

                    showScreen("studentScreen");

                    loadStudentDashboard();

                } else {

                    showScreen("loginScreen");
                }

            }
        );
    }


    if (againButton) {

        againButton.addEventListener(
            "click",
            () => {

                if (!currentMatter) return;

                const matterId =
                    currentMatter.id;

                clearPracticeRuntimeState();

                startPractice(matterId);

            }
        );
    }
}


/* -----------------------------------------------------
   RESULT EVENTS
----------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupResultEvents();

    }
);/* =====================================================
   PART 7 — DICTATION / TRANSCRIBE / TYPING MODES
===================================================== */


/* -----------------------------------------------------
   PRACTICE MODE CONFIGURATION
----------------------------------------------------- */

function configurePracticeMode() {

    if (!currentMatter) return;

    const type =
        currentPracticeType;

    const target =
        document.getElementById("practiceTarget");

    const typingArea =
        document.getElementById("typingArea");

    const liveWpm =
        document.getElementById("liveWpm");

    const liveWords =
        document.getElementById("liveWords");

    const liveErrorStatus =
        document.getElementById("liveErrorStatus");

    /* -------------------------------------------------
       Hide performance information during test
       ------------------------------------------------- */

    if (liveWpm) {
        liveWpm.textContent = "—";
    }

    if (liveErrorStatus) {
        liveErrorStatus.textContent = "";
    }

    /*
     * Word count is kept neutral during the test.
     * Detailed performance appears after submit.
     */
    if (liveWords) {
        liveWords.textContent = "—";
    }


    /* -------------------------------------------------
       DICTATION
       ------------------------------------------------- */

    if (type === PRACTICE_TYPES.DICTATION) {

        if (target) {

            target.innerHTML = `
                <div class="target-badge">
                    🎧 Dictation
                </div>

                <div class="practice-mode-message">

                    <strong>
                        Listen to the audio and type.
                    </strong>

                    <span>
                        The original matter is hidden
                        during the practice.
                    </span>

                    <div
                        id="dictationAudioContainer"
                        class="dictation-audio-container">
                    </div>

                </div>
            `;
        }

        renderDictationAudio();

        if (typingArea) {

            typingArea.placeholder =
                "Start typing what you hear...";

        }

        return;
    }


    /* -------------------------------------------------
       TRANSCRIBE
       ------------------------------------------------- */

    if (type === PRACTICE_TYPES.TRANSCRIBE) {

        if (target) {

            target.innerHTML = `
                <div class="target-badge">
                    ⌨️ Transcribe
                </div>

                <div class="practice-mode-message">

                    <strong>
                        Type the complete transcription.
                    </strong>

                    <span>
                        The original matter is hidden
                        during the practice.
                    </span>

                </div>
            `;
        }

        if (typingArea) {

            typingArea.placeholder =
                "Start your transcription here...";

        }

        return;
    }


    /* -------------------------------------------------
       TYPING
       ------------------------------------------------- */

    if (type === PRACTICE_TYPES.TYPING) {

        if (target) {

            target.innerHTML = `
                <div class="target-badge">
                    📝 Typing Matter
                </div>

                <div
                    id="typingReference"
                    class="practice-reference-text">
                </div>
            `;

            renderTypingReference();
        }

        if (typingArea) {

            typingArea.placeholder =
                "Start typing the matter here...";

        }

        setupTypingToolbar();

        return;
    }
}


/* -----------------------------------------------------
   DICTATION AUDIO
----------------------------------------------------- */

function renderDictationAudio() {

    const container =
        document.getElementById(
            "dictationAudioContainer"
        );

    if (!container) return;

    const audioUrl =
        currentMatter?.audioUrl || "";

    if (!audioUrl) {

        container.innerHTML = `
            <div class="audio-unavailable">
                🎧 Audio is not available for
                this practice.
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <audio
            id="dictationAudio"
            class="dictation-audio"
            controls
            preload="metadata">
            <source
                src="${escapeHtml(audioUrl)}">
            Your browser does not support audio.
        </audio>
    `;

    const audio =
        document.getElementById(
            "dictationAudio"
        );

    if (audio) {

        /*
         * Audio playback does NOT start the timer.
         * The timer starts when the student begins typing.
         */
        audio.addEventListener(
            "play",
            () => {

                if (!practiceStarted) {

                    setPracticeStatus("ready");

                }

            }
        );
    }
}


/* -----------------------------------------------------
   RENDER TYPING REFERENCE
----------------------------------------------------- */

function renderTypingReference() {

    const reference =
        document.getElementById(
            "typingReference"
        );

    if (!reference || !currentMatter) return;

    const formatting =
        currentMatter.formatting || {};

    const fontSize =
        Number(formatting.fontSize) || 18;

    const alignment =
        formatting.alignment || "left";

    const bold =
        Boolean(formatting.bold);

    const italic =
        Boolean(formatting.italic);

    const underline =
        Boolean(formatting.underline);

    reference.style.fontSize =
        `${fontSize}px`;

    reference.style.textAlign =
        alignment;

    reference.style.fontWeight =
        bold ? "700" : "400";

    reference.style.fontStyle =
        italic ? "italic" : "normal";

    reference.style.textDecoration =
        underline ? "underline" : "none";

    reference.textContent =
        currentMatter.text || "";
}


/* -----------------------------------------------------
   TYPING TOOLBAR
----------------------------------------------------- */

function setupTypingToolbar() {

    const decrease =
        document.getElementById(
            "fontDecrease"
        );

    const increase =
        document.getElementById(
            "fontIncrease"
        );

    const fontDisplay =
        document.getElementById(
            "fontSizeDisplay"
        );

    if (decrease) {

        decrease.onclick = () => {

            if (!currentMatter) return;

            const formatting =
                currentMatter.formatting ||
                {};

            let size =
                Number(formatting.fontSize) || 18;

            size =
                Math.max(
                    10,
                    size - 1
                );

            currentMatter.formatting = {
                ...formatting,
                fontSize: size
            };

            if (fontDisplay) {
                fontDisplay.textContent =
                    `${size}px`;
            }

            renderTypingReference();
        };
    }


    if (increase) {

        increase.onclick = () => {

            if (!currentMatter) return;

            const formatting =
                currentMatter.formatting ||
                {};

            let size =
                Number(formatting.fontSize) || 18;

            size =
                Math.min(
                    48,
                    size + 1
                );

            currentMatter.formatting = {
                ...formatting,
                fontSize: size
            };

            if (fontDisplay) {
                fontDisplay.textContent =
                    `${size}px`;
            }

            renderTypingReference();
        };
    }


    /*
     * Support toolbar buttons if they are
     * added to the HTML.
     *
     * Expected data-format values:
     * bold
     * italic
     * underline
     * left
     * center
     * right
     * justify
     */

    document
        .querySelectorAll(
            "[data-format]"
        )
        .forEach(button => {

            button.onclick = () => {

                if (!currentMatter) return;

                const command =
                    button.getAttribute(
                        "data-format"
                    );

                applyTypingFormatting(
                    command
                );
            };

        });


    updateTypingFontDisplay();
}


/* -----------------------------------------------------
   APPLY TYPING FORMATTING
----------------------------------------------------- */

function applyTypingFormatting(command) {

    if (!currentMatter) return;

    const oldFormatting =
        currentMatter.formatting || {

            fontSize: 18,

            bold: false,

            italic: false,

            underline: false,

            alignment: "left"
        };


    const formatting = {
        ...oldFormatting
    };


    if (command === "bold") {

        formatting.bold =
            !Boolean(formatting.bold);
    }


    if (command === "italic") {

        formatting.italic =
            !Boolean(formatting.italic);
    }


    if (command === "underline") {

        formatting.underline =
            !Boolean(formatting.underline);
    }


    if (
        command === "left" ||
        command === "center" ||
        command === "right" ||
        command === "justify"
    ) {

        formatting.alignment =
            command;
    }


    currentMatter.formatting =
        formatting;

    renderTypingReference();

    updateTypingToolbarState();
}


/* -----------------------------------------------------
   UPDATE TOOLBAR BUTTON STATE
----------------------------------------------------- */

function updateTypingToolbarState() {

    if (!currentMatter) return;

    const formatting =
        currentMatter.formatting || {};

    document
        .querySelectorAll(
            "[data-format]"
        )
        .forEach(button => {

            const command =
                button.getAttribute(
                    "data-format"
                );

            let active = false;

            if (
                command === "bold"
            ) {
                active =
                    Boolean(formatting.bold);
            }

            if (
                command === "italic"
            ) {
                active =
                    Boolean(formatting.italic);
            }

            if (
                command === "underline"
            ) {
                active =
                    Boolean(formatting.underline);
            }

            if (
                command ===
                formatting.alignment
            ) {
                active = true;
            }

            button.classList.toggle(
                "active",
                active
            );

        });
}


/* -----------------------------------------------------
   FONT DISPLAY
----------------------------------------------------- */

function updateTypingFontDisplay() {

    const display =
        document.getElementById(
            "fontSizeDisplay"
        );

    if (!display || !currentMatter) return;

    const formatting =
        currentMatter.formatting || {};

    const size =
        Number(formatting.fontSize) || 18;

    display.textContent =
        `${size}px`;

    updateTypingToolbarState();
}


/* -----------------------------------------------------
   RECONFIGURE PRACTICE SCREEN
----------------------------------------------------- */

function refreshPracticeMode() {

    if (!currentMatter) return;

    currentPracticeType =
        isValidPracticeType(
            currentMatter.type
        )
            ? currentMatter.type
            : PRACTICE_TYPES.TYPING;

    configurePracticeMode();

    updatePracticeModeUI();
}


/* -----------------------------------------------------
   UPDATE PRACTICE SCREEN PREPARATION
----------------------------------------------------- */

const originalPreparePracticeScreen =
    preparePracticeScreen;

preparePracticeScreen = function () {

    originalPreparePracticeScreen();

    refreshPracticeMode();

    /*
     * Typing mode gets the reference matter.
     * Dictation and Transcribe keep it hidden.
     */

    if (
        currentPracticeType ===
        PRACTICE_TYPES.TYPING
    ) {

        updateTypingFontDisplay();

    }
};


/* -----------------------------------------------------
   TYPING AREA FORMATTING
----------------------------------------------------- */

function applyTypingAreaFormatting() {

    const typingArea =
        document.getElementById(
            "typingArea"
        );

    if (!typingArea || !currentMatter) return;

    const formatting =
        currentMatter.formatting || {};

    const fontSize =
        Number(formatting.fontSize) || 18;

    typingArea.style.fontSize =
        `${fontSize}px`;

    typingArea.style.fontWeight =
        formatting.bold
            ? "700"
            : "400";

    typingArea.style.fontStyle =
        formatting.italic
            ? "italic"
            : "normal";

    typingArea.style.textDecoration =
        formatting.underline
            ? "underline"
            : "none";

    typingArea.style.textAlign =
        formatting.alignment || "left";
}


/* -----------------------------------------------------
   CONNECT FORMATTING WITH TYPING AREA
----------------------------------------------------- */

function refreshTypingAreaFormatting() {

    if (
        currentPracticeType !==
        PRACTICE_TYPES.TYPING
    ) {
        return;
    }

    applyTypingAreaFormatting();
}


/* -----------------------------------------------------
   UPDATE TOOLBAR AFTER PRACTICE START
----------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Keep toolbar state synchronized.
         */

        document
            .querySelectorAll(
                "[data-format]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        setTimeout(
                            () => {

                                refreshTypingAreaFormatting();

                            },
                            0
                        );

                    }
                );

            });

    }
);


/* -----------------------------------------------------
   PREVENT PERFORMANCE DATA DURING TEST
----------------------------------------------------- */

function hideLivePerformance() {

    const liveWpm =
        document.getElementById(
            "liveWpm"
        );

    const liveWords =
        document.getElementById(
            "liveWords"
        );

    const liveError =
        document.getElementById(
            "liveErrorStatus"
        );

    if (liveWpm) {
        liveWpm.textContent = "—";
    }

    if (liveWords) {
        liveWords.textContent = "—";
    }

    if (liveError) {
        liveError.textContent = "";
    }
}


/* -----------------------------------------------------
   RUN MODE SETUP WHEN PRACTICE STARTS
----------------------------------------------------- */

const originalStartPractice =
    startPractice;

startPractice = function (matterId) {

    originalStartPractice(matterId);

    hideLivePerformance();

    refreshPracticeMode();

    refreshTypingAreaFormatting();
};


/* -----------------------------------------------------
   KEEP PERFORMANCE HIDDEN ON EVERY INPUT
----------------------------------------------------- */

const originalHandlePracticeInput =
    handlePracticeInput;

handlePracticeInput = function () {

    originalHandlePracticeInput();

    hideLivePerformance();

    refreshTypingAreaFormatting();
};


/* -----------------------------------------------------
   TYPING MODE — REFERENCE MUST NEVER ENTER
   STUDENT'S TYPING BOX AUTOMATICALLY
----------------------------------------------------- */

function ensureTypingBoxStartsEmpty() {

    const typingArea =
        document.getElementById(
            "typingArea"
        );

    if (!typingArea) return;

    if (
        currentPracticeType ===
        PRACTICE_TYPES.TYPING
    ) {

        /*
         * Student must type independently.
         * The reference stays separate.
         */

        if (!practiceStarted) {
            typingArea.value = "";
        }
    }
}


/* -----------------------------------------------------
   FINAL MODE INITIALIZATION
----------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ensureTypingBoxStartsEmpty();

    }
);/* =====================================================
   PART 8 — ADMIN MATTER TYPE + MODE MANAGEMENT
===================================================== */


/* -----------------------------------------------------
   GET MATTER TYPE FROM FORM
----------------------------------------------------- */

function getMatterTypeFromForm() {

    const typeInput =
        document.getElementById("matterType");

    if (!typeInput) {
        return PRACTICE_TYPES.TYPING;
    }

    const type =
        typeInput.value;

    return isValidPracticeType(type)
        ? type
        : PRACTICE_TYPES.TYPING;
}


/* -----------------------------------------------------
   UPDATE MATTER EDITOR UI
----------------------------------------------------- */

function updateMatterEditorMode() {

    const type =
        getMatterTypeFromForm();

    const textField =
        document.getElementById("matterText");

    const textLabel =
        document.getElementById("matterTextLabel");

    const audioField =
        document.getElementById("matterAudio");

    const audioGroup =
        document.getElementById("matterAudioGroup");

    const textGroup =
        document.getElementById("matterTextGroup");

    const formattingGroup =
        document.getElementById(
            "matterFormattingGroup"
        );

    /* -------------------------------------------------
       Hide everything first
       ------------------------------------------------- */

    if (audioGroup) {
        audioGroup.classList.add("hidden");
    }

    if (textGroup) {
        textGroup.classList.remove("hidden");
    }

    if (formattingGroup) {
        formattingGroup.classList.add("hidden");
    }


    /* -------------------------------------------------
       DICTATION
       ------------------------------------------------- */

    if (
        type ===
        PRACTICE_TYPES.DICTATION
    ) {

        if (audioGroup) {
            audioGroup.classList.remove("hidden");
        }

        if (textGroup) {
            textGroup.classList.add("hidden");
        }

        if (audioField) {
            audioField.required = true;
        }

        return;
    }


    /* -------------------------------------------------
       TRANSCRIBE
       ------------------------------------------------- */

    if (
        type ===
        PRACTICE_TYPES.TRANSCRIBE
    ) {

        if (textGroup) {
            textGroup.classList.remove("hidden");
        }

        if (textLabel) {
            textLabel.textContent =
                "Original Matter";
        }

        if (textField) {
            textField.placeholder =
                "Enter the original transcription matter. Students will not see this during practice.";
        }

        if (formattingGroup) {
            formattingGroup.classList.add("hidden");
        }

        if (audioField) {
            audioField.required = false;
        }

        return;
    }


    /* -------------------------------------------------
       TYPING
       ------------------------------------------------- */

    if (
        type ===
        PRACTICE_TYPES.TYPING
    ) {

        if (textGroup) {
            textGroup.classList.remove("hidden");
        }

        if (textLabel) {
            textLabel.textContent =
                "Typing Matter";
        }

        if (textField) {
            textField.placeholder =
                "Enter the matter students will see while typing.";
        }

        if (formattingGroup) {
            formattingGroup.classList.remove("hidden");
        }

        if (audioField) {
            audioField.required = false;
        }
    }
}


/* -----------------------------------------------------
   READ TYPING FORMATTING
----------------------------------------------------- */

function getMatterFormattingFromForm() {

    const fontSizeInput =
        document.getElementById(
            "matterFontSize"
        );

    const boldInput =
        document.getElementById(
            "matterBold"
        );

    const italicInput =
        document.getElementById(
            "matterItalic"
        );

    const underlineInput =
        document.getElementById(
            "matterUnderline"
        );

    const alignmentInput =
        document.getElementById(
            "matterAlignment"
        );

    return {

        fontSize:
            Number(
                fontSizeInput?.value || 18
            ),

        bold:
            Boolean(
                boldInput?.checked
            ),

        italic:
            Boolean(
                italicInput?.checked
            ),

        underline:
            Boolean(
                underlineInput?.checked
            ),

        alignment:
            alignmentInput?.value ||
            "left"
    };
}


/* -----------------------------------------------------
   UPDATE FORM WITH MATTER DATA
----------------------------------------------------- */

function populateMatterEditor(matter) {

    if (!matter) return;

    const typeInput =
        document.getElementById(
            "matterType"
        );

    const titleInput =
        document.getElementById(
            "matterTitle"
        );

    const wpmInput =
        document.getElementById(
            "matterWpm"
        );

    const durationInput =
        document.getElementById(
            "matterDuration"
        );

    const textInput =
        document.getElementById(
            "matterText"
        );

    const fontSizeInput =
        document.getElementById(
            "matterFontSize"
        );

    const boldInput =
        document.getElementById(
            "matterBold"
        );

    const italicInput =
        document.getElementById(
            "matterItalic"
        );

    const underlineInput =
        document.getElementById(
            "matterUnderline"
        );

    const alignmentInput =
        document.getElementById(
            "matterAlignment"
        );


    if (typeInput) {
        typeInput.value =
            isValidPracticeType(matter.type)
                ? matter.type
                : PRACTICE_TYPES.TYPING;
    }

    if (titleInput) {
        titleInput.value =
            matter.title || "";
    }

    if (wpmInput) {
        wpmInput.value =
            matter.wpm || 35;
    }

    if (durationInput) {
        durationInput.value =
            matter.duration || 10;
    }

    if (textInput) {
        textInput.value =
            matter.text || "";
    }


    const formatting =
        matter.formatting || {};


    if (fontSizeInput) {
        fontSizeInput.value =
            formatting.fontSize || 18;
    }

    if (boldInput) {
        boldInput.checked =
            Boolean(formatting.bold);
    }

    if (italicInput) {
        italicInput.checked =
            Boolean(formatting.italic);
    }

    if (underlineInput) {
        underlineInput.checked =
            Boolean(formatting.underline);
    }

    if (alignmentInput) {
        alignmentInput.value =
            formatting.alignment || "left";
    }

    updateMatterEditorMode();
}


/* -----------------------------------------------------
   EXTEND NEW MATTER EDITOR
----------------------------------------------------- */

const previousOpenNewMatterEditor =
    openNewMatterEditor;

openNewMatterEditor = function () {

    previousOpenNewMatterEditor();

    const typeInput =
        document.getElementById(
            "matterType"
        );

    const fontSizeInput =
        document.getElementById(
            "matterFontSize"
        );

    const boldInput =
        document.getElementById(
            "matterBold"
        );

    const italicInput =
        document.getElementById(
            "matterItalic"
        );

    const underlineInput =
        document.getElementById(
            "matterUnderline"
        );

    const alignmentInput =
        document.getElementById(
            "matterAlignment"
        );

    if (typeInput) {
        typeInput.value =
            PRACTICE_TYPES.TYPING;
    }

    if (fontSizeInput) {
        fontSizeInput.value = 18;
    }

    if (boldInput) {
        boldInput.checked = false;
    }

    if (italicInput) {
        italicInput.checked = false;
    }

    if (underlineInput) {
        underlineInput.checked = false;
    }

    if (alignmentInput) {
        alignmentInput.value = "left";
    }

    updateMatterEditorMode();
};


/* -----------------------------------------------------
   EXTEND EDIT MATTER
----------------------------------------------------- */

const previousEditMatter =
    editMatter;

editMatter = function (id) {

    previousEditMatter(id);

    const matter =
        getMatterById(id);

    if (!matter) return;

    populateMatterEditor(matter);
};


/* -----------------------------------------------------
   UPDATE SAVE MATTER
----------------------------------------------------- */

const previousSaveMatter =
    saveMatter;

saveMatter = function (event) {

    event.preventDefault();

    const titleInput =
        document.getElementById(
            "matterTitle"
        );

    const wpmInput =
        document.getElementById(
            "matterWpm"
        );

    const durationInput =
        document.getElementById(
            "matterDuration"
        );

    const textInput =
        document.getElementById(
            "matterText"
        );

    const audioInput =
        document.getElementById(
            "matterAudio"
        );

    if (
        !titleInput ||
        !wpmInput ||
        !durationInput
    ) {

        showToast(
            "Matter form could not be loaded.",
            "error"
        );

        return;
    }

    const title =
        titleInput.value.trim();

    const wpm =
        Number(wpmInput.value);

    const duration =
        Number(durationInput.value);

    const type =
        getMatterTypeFromForm();

    const text =
        textInput
            ? textInput.value.trim()
            : "";

    const formatting =
        getMatterFormattingFromForm();

    const audioUrl =
        audioInput?.dataset.audioUrl ||
        "";


    /* -------------------------------------------------
       VALIDATION
       ------------------------------------------------- */

    if (!title) {

        showToast(
            "Please enter a practice title.",
            "error"
        );

        titleInput.focus();

        return;
    }

    if (
        !Number.isFinite(wpm) ||
        wpm <= 0
    ) {

        showToast(
            "Please enter a valid WPM.",
            "error"
        );

        wpmInput.focus();

        return;
    }

    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        showToast(
            "Please enter a valid duration.",
            "error"
        );

        durationInput.focus();

        return;
    }


    /* -------------------------------------------------
       DICTATION VALIDATION
       ------------------------------------------------- */

    if (
        type ===
        PRACTICE_TYPES.DICTATION
    ) {

        if (!audioUrl) {

            showToast(
                "Please add the dictation audio.",
                "error"
            );

            if (audioInput) {
                audioInput.focus();
            }

            return;
        }
    }


    /* -------------------------------------------------
       TEXT VALIDATION
       ------------------------------------------------- */

    if (
        (
            type ===
            PRACTICE_TYPES.TRANSCRIBE
        ||
            type ===
            PRACTICE_TYPES.TYPING
        )
        &&
        !text
    ) {

        showToast(
            "Please enter the practice matter.",
            "error"
        );

        if (textInput) {
            textInput.focus();
        }

        return;
    }


    const matters =
        getMatters();


    /* -------------------------------------------------
       UPDATE EXISTING MATTER
       ------------------------------------------------- */

    if (editingMatterId) {

        const index =
            matters.findIndex(
                matter =>
                    matter.id ===
                    editingMatterId
            );

        if (index === -1) {

            showToast(
                "Practice matter not found.",
                "error"
            );

            return;
        }

        matters[index] = {

            ...matters[index],

            title,

            type,

            wpm,

            duration,

            text:
                type === PRACTICE_TYPES.DICTATION
                    ? (
                        matters[index].text || ""
                    )
                    : text,

            audioUrl,

            formatting,

            updatedAt:
                new Date().toISOString()
        };

        setMatters(matters);

        showToast(
            "Practice matter updated successfully.",
            "success"
        );

    }

    /* -------------------------------------------------
       CREATE NEW MATTER
       ------------------------------------------------- */

    else {

        const newMatter = {

            id:
                generateId("M"),

            title,

            type,

            wpm,

            duration,

            audioUrl,

            text:
                type === PRACTICE_TYPES.DICTATION
                    ? ""
                    : text,

            formatting,

            published: true,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        matters.unshift(
            newMatter
        );

        setMatters(matters);

        showToast(
            "Practice matter created successfully.",
            "success"
        );
    }


    closeMatterEditor();

    renderMattersTable(
        document.getElementById(
            "matterSearch"
        )?.value || ""
    );

    loadAdminDashboard();
};


/* -----------------------------------------------------
   MATTER TYPE CHANGE EVENT
----------------------------------------------------- */

function setupMatterTypeEvents() {

    const typeInput =
        document.getElementById(
            "matterType"
        );

    if (!typeInput) return;

    typeInput.addEventListener(
        "change",
        updateMatterEditorMode
    );

    updateMatterEditorMode();
}


/* -----------------------------------------------------
   AUDIO FILE HANDLING
----------------------------------------------------- */

function setupMatterAudioInput() {

    const audioInput =
        document.getElementById(
            "matterAudio"
        );

    if (!audioInput) return;

    audioInput.addEventListener(
        "change",
        () => {

            const file =
                audioInput.files?.[0];

            if (!file) return;

            /*
             * For the current demo this creates a
             * temporary browser URL.
             *
             * Production version will use
             * Supabase Storage so audio persists
             * securely.
             */

            const objectUrl =
                URL.createObjectURL(file);

            audioInput.dataset.audioUrl =
                objectUrl;

            const audioName =
                document.getElementById(
                    "matterAudioName"
                );

            if (audioName) {

                audioName.textContent =
                    file.name;
            }

            showToast(
                "Audio selected successfully.",
                "success"
            );
        }
    );
}


/* -----------------------------------------------------
   EXTEND MATTER EVENTS
----------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupMatterTypeEvents();

        setupMatterAudioInput();

    }
);
