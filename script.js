/* =====================================================
   SHORTHAND PRO
   JAVASCRIPT — PART 1
   APP DATA + BASIC NAVIGATION
===================================================== */

"use strict";

/* =====================================================
   DEMO DATA
===================================================== */

const DEFAULT_MATTERS = [
  {
    id: "M001",
    title: "Practice Matter 01",
    wpm: 80,
    duration: 5,
    text:
      "The ability to write quickly and accurately is an important skill for every shorthand student. Regular practice improves speed, confidence, concentration and accuracy."
  },
  {
    id: "M002",
    title: "Practice Matter 02",
    wpm: 100,
    duration: 5,
    text:
      "Success in shorthand depends upon regular practice and careful attention. A student should practise every day and gradually increase speed without losing accuracy."
  },
  {
    id: "M003",
    title: "Practice Matter 03",
    wpm: 120,
    duration: 5,
    text:
      "Good preparation and disciplined practice can make a significant difference in a student's performance. Speed should always be developed together with accuracy."
  }
];

const DEFAULT_STUDENTS = [
  {
    id: "S001",
    name: "Demo Student",
    username: "student",
    password: "student123",
    status: "active",
    assignedMatters: ["M001", "M002", "M003"]
  }
];

const DEFAULT_RESULTS = [];

/* =====================================================
   DEMO ADMIN
===================================================== */

const ADMIN_ACCOUNT = {
  username: "admin",
  password: "admin123",
  name: "Administrator"
};

/* =====================================================
   APP STATE
===================================================== */

let currentUser = null;
let currentUserType = null;
let currentMatter = null;
let editingMatterId = null;
let editingStudentId = null;

/* =====================================================
   LOCAL STORAGE HELPERS
===================================================== */

function getStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error("Storage read error:", error);
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage save error:", error);
  }
}

/* =====================================================
   INITIALIZE DEFAULT DATA
===================================================== */

function initializeData() {
  if (!localStorage.getItem("shorthand_matters")) {
    setStorage("shorthand_matters", DEFAULT_MATTERS);
  }

  if (!localStorage.getItem("shorthand_students")) {
    setStorage("shorthand_students", DEFAULT_STUDENTS);
  }

  if (!localStorage.getItem("shorthand_results")) {
    setStorage("shorthand_results", DEFAULT_RESULTS);
  }
}

/* =====================================================
   GET DATA
===================================================== */

function getMatters() {
  return getStorage("shorthand_matters", []);
}

function getStudents() {
  return getStorage("shorthand_students", []);
}

function getResults() {
  return getStorage("shorthand_results", []);
}

/* =====================================================
   SCREEN MANAGEMENT
===================================================== */

function hideAllScreens() {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(function(screen) {
    screen.classList.add("hidden");
  });
}

function showScreen(screenId) {
  hideAllScreens();

  const screen = document.getElementById(screenId);

  if (screen) {
    screen.classList.remove("hidden");
  }
}

/* =====================================================
   ADMIN PAGE MANAGEMENT
===================================================== */

function showAdminPage(pageName) {
  const pages = document.querySelectorAll("[data-admin-page]");

  pages.forEach(function(page) {
    page.classList.add("hidden");
  });

  const target = document.getElementById(
    "admin" +
    pageName.charAt(0).toUpperCase() +
    pageName.slice(1) +
    "Page"
  );

  if (target) {
    target.classList.remove("hidden");
  }

  document.querySelectorAll(".nav-item").forEach(function(item) {
    item.classList.remove("active");
  });

  const activeItem = document.querySelector(
    '[data-admin-page="' + pageName + '"]'
  );

  if (activeItem) {
    activeItem.classList.add("active");
  }

  const title = document.getElementById("adminPageTitle");

  if (title) {
    const titles = {
      dashboard: "Dashboard",
      matters: "Practice Matters",
      students: "Students",
      results: "Results",
      settings: "Settings"
    };

    title.textContent = titles[pageName] || "Dashboard";
  }
}

/* =====================================================
   LOGIN TYPE
===================================================== */

function setLoginType(type) {
  document.querySelectorAll(".login-tab").forEach(function(tab) {
    tab.classList.remove("active");
  });

  const selectedTab = document.querySelector(
    '[data-login-type="' + type + '"]'
  );

  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  currentUserType = type;

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (usernameInput) {
    usernameInput.value = "";
    usernameInput.placeholder =
      type === "admin" ? "Admin username" : "Student ID / username";
  }

  if (passwordInput) {
    passwordInput.value = "";
  }

  const error = document.getElementById("loginError");

  if (error) {
    error.textContent = "";
    error.classList.add("hidden");
  }
}

/* =====================================================
   LOGOUT
===================================================== */

function logout() {
  currentUser = null;
  currentUserType = null;
  currentMatter = null;

  showScreen("loginScreen");

  setLoginType("student");
}

/* =====================================================
   TOAST
===================================================== */

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(function() {
    toast.classList.remove("show");
  }, 2500);
}

/* =====================================================
   INITIAL APP START
===================================================== */

document.addEventListener("DOMContentLoaded", function() {
  initializeData();

  showScreen("loginScreen");

  setLoginType("student");

  console.log("Shorthand Pro initialized.");
});
/* =====================================================
   LOGIN SYSTEM
===================================================== */

function handleLogin(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("loginError");

  const username = usernameInput
    ? usernameInput.value.trim()
    : "";

  const password = passwordInput
    ? passwordInput.value
    : "";

  if (!username || !password) {
    showLoginError("Username aur password dono enter karein.");
    return;
  }

  /* ===================================================
     ADMIN LOGIN
  =================================================== */

  if (currentUserType === "admin") {
    if (
      username === ADMIN_ACCOUNT.username &&
      password === ADMIN_ACCOUNT.password
    ) {
      currentUser = {
        type: "admin",
        username: ADMIN_ACCOUNT.username,
        name: ADMIN_ACCOUNT.name
      };

      if (errorBox) {
        errorBox.classList.add("hidden");
      }

      showScreen("adminScreen");
      showAdminPage("dashboard");
      loadAdminDashboard();

      showToast("Welcome, Administrator!");
      return;
    }

    showLoginError("Invalid admin username or password.");
    return;
  }

  /* ===================================================
     STUDENT LOGIN
  =================================================== */

  const students = getStudents();

  const student = students.find(function(item) {
    return (
      item.username === username &&
      item.password === password
    );
  });

  if (!student) {
    showLoginError("Invalid Student ID / username or password.");
    return;
  }

  if (student.status !== "active") {
    showLoginError(
      "Your student account is currently inactive."
    );
    return;
  }

  currentUser = {
    type: "student",
    id: student.id,
    username: student.username,
    name: student.name
  };

  if (errorBox) {
    errorBox.classList.add("hidden");
  }

  showScreen("studentScreen");

  loadStudentDashboard();

  showToast("Welcome, " + student.name + "!");
}

/* =====================================================
   LOGIN ERROR
===================================================== */

function showLoginError(message) {
  const errorBox = document.getElementById("loginError");

  if (!errorBox) {
    return;
  }

  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

function loadAdminDashboard() {
  const matters = getMatters();
  const students = getStudents();
  const results = getResults();

  const statMatters = document.getElementById("statMatters");
  const statStudents = document.getElementById("statStudents");
  const statAttempts = document.getElementById("statAttempts");
  const statAccuracy = document.getElementById("statAccuracy");

  if (statMatters) {
    statMatters.textContent = matters.length;
  }

  if (statStudents) {
    statStudents.textContent = students.length;
  }

  if (statAttempts) {
    statAttempts.textContent = results.length;
  }

  let averageAccuracy = 0;

  if (results.length > 0) {
    const totalAccuracy = results.reduce(function(total, result) {
      return total + Number(result.accuracy || 0);
    }, 0);

    averageAccuracy = Math.round(
      totalAccuracy / results.length
    );
  }

  if (statAccuracy) {
    statAccuracy.textContent = averageAccuracy + "%";
  }

  renderRecentMatters(matters);
  renderRecentResults(results);
}

/* =====================================================
   RECENT MATTERS
===================================================== */

function renderRecentMatters(matters) {
  const container = document.getElementById("recentMatters");

  if (!container) {
    return;
  }

  if (!matters.length) {
    container.innerHTML =
      '<div class="empty-state">No practice matters yet.</div>';
    return;
  }

  const recent = matters.slice(-5).reverse();

  container.innerHTML = recent.map(function(matter) {
    return `
      <div class="list-item">
        <div>
          <strong>${escapeHtml(matter.title)}</strong>
          <span>${matter.wpm} WPM • ${matter.duration} min</span>
        </div>
        <span class="badge success">Ready</span>
      </div>
    `;
  }).join("");
}

/* =====================================================
   RECENT RESULTS
===================================================== */

function renderRecentResults(results) {
  const container = document.getElementById("recentResults");

  if (!container) {
    return;
  }

  if (!results.length) {
    container.innerHTML =
      '<div class="empty-state">No attempts recorded yet.</div>';
    return;
  }

  const recent = results.slice(-5).reverse();

  container.innerHTML = recent.map(function(result) {
    return `
      <div class="list-item">
        <div>
          <strong>${escapeHtml(result.studentName || "Student")}</strong>
          <span>${escapeHtml(result.matterTitle || "Practice")}</span>
        </div>
        <span class="badge success">
          ${Math.round(Number(result.accuracy || 0))}%
        </span>
      </div>
    `;
  }).join("");
}

/* =====================================================
   STUDENT DASHBOARD
===================================================== */

function loadStudentDashboard() {
  if (!currentUser || currentUser.type !== "student") {
    return;
  }

  const students = getStudents();

  const student = students.find(function(item) {
    return item.id === currentUser.id;
  });

  if (!student) {
    logout();
    return;
  }

  const nameElement = document.getElementById(
    "studentDisplayName"
  );

  const idElement = document.getElementById(
    "studentDisplayId"
  );

  if (nameElement) {
    nameElement.textContent = student.name;
  }

  if (idElement) {
    idElement.textContent = student.id;
  }

  const results = getResults().filter(function(result) {
    return result.studentId === student.id;
  });

  const completed = document.getElementById(
    "studentCompleted"
  );

  const averageWpm = document.getElementById(
    "studentAverageWpm"
  );

  const averageAccuracy = document.getElementById(
    "studentAverageAccuracy"
  );

  if (completed) {
    completed.textContent = results.length;
  }

  let avgWpm = 0;
  let avgAccuracy = 0;

  if (results.length) {
    avgWpm =
      results.reduce(function(total, result) {
        return total + Number(result.wpm || 0);
      }, 0) / results.length;

    avgAccuracy =
      results.reduce(function(total, result) {
        return total + Number(result.accuracy || 0);
      }, 0) / results.length;
  }

  if (averageWpm) {
    averageWpm.textContent = Math.round(avgWpm);
  }

  if (averageAccuracy) {
    averageAccuracy.textContent =
      Math.round(avgAccuracy) + "%";
  }

  renderStudentMatters(student);
  renderStudentHistory(results);
}

/* =====================================================
   STUDENT MATTERS
===================================================== */

function renderStudentMatters(student) {
  const container = document.getElementById(
    "studentMatterCards"
  );

  if (!container) {
    return;
  }

  const matters = getMatters();

  const assignedIds = Array.isArray(student.assignedMatters)
    ? student.assignedMatters
    : [];

  const assignedMatters = matters.filter(function(matter) {
    return assignedIds.includes(matter.id);
  });

  if (!assignedMatters.length) {
    container.innerHTML =
      '<div class="empty-state">No practice assigned yet.</div>';
    return;
  }

  container.innerHTML = assignedMatters.map(function(matter) {
    return `
      <div class="practice-card">
        <h3>${escapeHtml(matter.title)}</h3>

        <p>
          Practice this matter and improve your
          shorthand speed and accuracy.
        </p>

        <div class="practice-card-meta">
          <span>${matter.wpm} WPM</span>
          <span>${matter.duration} min</span>
        </div>

        <button
          class="primary-button"
          onclick="startPractice('${matter.id}')"
        >
          Start Practice
        </button>
      </div>
    `;
  }).join("");
}

/* =====================================================
   STUDENT HISTORY
===================================================== */

function renderStudentHistory(results) {
  const container = document.getElementById(
    "studentHistory"
  );

  if (!container) {
    return;
  }

  if (!results.length) {
    container.innerHTML =
      '<div class="empty-state">No practice history yet.</div>';
    return;
  }

  const recent = results.slice(-8).reverse();

  container.innerHTML = recent.map(function(result) {
    return `
      <div class="history-item">
        <div>
          <strong>${escapeHtml(result.matterTitle || "Practice")}</strong>
          <span>
            ${result.wpm || 0} WPM •
            ${Math.round(Number(result.accuracy || 0))}% accuracy
          </span>
        </div>

        <span>
          ${result.mistakes || 0} mistakes
        </span>
      </div>
    `;
  }).join("");
}

/* =====================================================
   HTML SAFETY HELPER
===================================================== */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
    }
/* =====================================================
   ADMIN NAVIGATION
===================================================== */

function setupAdminNavigation() {
  document.querySelectorAll(".nav-item").forEach(function(item) {
    item.addEventListener("click", function() {
      const page = item.getAttribute("data-admin-page");

      if (!page) {
        return;
      }

      showAdminPage(page);

      if (page === "dashboard") {
        loadAdminDashboard();
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
    });
  });
}

/* =====================================================
   MATTER EDITOR
===================================================== */

function openMatterEditor(matterId) {
  const editor = document.getElementById("matterEditor");
  const title = document.getElementById("matterEditorTitle");

  const matterTitle = document.getElementById("matterTitle");
  const matterWpm = document.getElementById("matterWpm");
  const matterDuration = document.getElementById("matterDuration");
  const matterText = document.getElementById("matterText");

  editingMatterId = matterId || null;

  if (matterId) {
    const matter = getMatters().find(function(item) {
      return item.id === matterId;
    });

    if (!matter) {
      return;
    }

    if (title) {
      title.textContent = "Edit Practice Matter";
    }

    if (matterTitle) {
      matterTitle.value = matter.title;
    }

    if (matterWpm) {
      matterWpm.value = matter.wpm;
    }

    if (matterDuration) {
      matterDuration.value = matter.duration;
    }

    if (matterText) {
      matterText.value = matter.text;
    }
  } else {
    if (title) {
      title.textContent = "Create Practice Matter";
    }

    if (matterTitle) {
      matterTitle.value = "";
    }

    if (matterWpm) {
      matterWpm.value = 80;
    }

    if (matterDuration) {
      matterDuration.value = 5;
    }

    if (matterText) {
      matterText.value = "";
    }
  }

  if (editor) {
    editor.classList.remove("hidden");
  }
}

/* =====================================================
   CLOSE MATTER EDITOR
===================================================== */

function closeMatterEditor() {
  const editor = document.getElementById("matterEditor");

  editingMatterId = null;

  if (editor) {
    editor.classList.add("hidden");
  }
}

/* =====================================================
   SAVE MATTER
===================================================== */

function saveMatter(event) {
  event.preventDefault();

  const titleInput = document.getElementById("matterTitle");
  const wpmInput = document.getElementById("matterWpm");
  const durationInput = document.getElementById("matterDuration");
  const textInput = document.getElementById("matterText");

  const title = titleInput
    ? titleInput.value.trim()
    : "";

  const wpm = wpmInput
    ? Number(wpmInput.value)
    : 0;

  const duration = durationInput
    ? Number(durationInput.value)
    : 0;

  const text = textInput
    ? textInput.value.trim()
    : "";

  if (!title) {
    showToast("Practice title required.");
    return;
  }

  if (!wpm || wpm < 1) {
    showToast("Valid WPM enter karein.");
    return;
  }

  if (!duration || duration < 1) {
    showToast("Valid duration enter karein.");
    return;
  }

  if (!text) {
    showToast("Practice matter enter karein.");
    return;
  }

  const matters = getMatters();

  if (editingMatterId) {
    const index = matters.findIndex(function(item) {
      return item.id === editingMatterId;
    });

    if (index !== -1) {
      matters[index] = {
        ...matters[index],
        title: title,
        wpm: wpm,
        duration: duration,
        text: text
      };
    }

    showToast("Practice matter updated.");
  } else {
    const newMatter = {
      id: generateId("M"),
      title: title,
      wpm: wpm,
      duration: duration,
      text: text
    };

    matters.push(newMatter);

    showToast("Practice matter created.");
  }

  setStorage("shorthand_matters", matters);

  closeMatterEditor();
  renderMattersTable();
  loadAdminDashboard();
}

/* =====================================================
   DELETE MATTER
===================================================== */

function deleteMatter(matterId) {
  const matters = getMatters();

  const matter = matters.find(function(item) {
    return item.id === matterId;
  });

  if (!matter) {
    return;
  }

  const confirmed = confirm(
    'Delete "' + matter.title + '"?'
  );

  if (!confirmed) {
    return;
  }

  const updatedMatters = matters.filter(function(item) {
    return item.id !== matterId;
  });

  setStorage("shorthand_matters", updatedMatters);

  /* Remove this matter from student assignments too */
  const students = getStudents();

  students.forEach(function(student) {
    if (Array.isArray(student.assignedMatters)) {
      student.assignedMatters =
        student.assignedMatters.filter(function(id) {
          return id !== matterId;
        });
    }
  });

  setStorage("shorthand_students", students);

  renderMattersTable();
  loadAdminDashboard();

  showToast("Practice matter deleted.");
}

/* =====================================================
   MATTERS TABLE
===================================================== */

function renderMattersTable(searchTerm) {
  const table = document.getElementById("mattersTable");

  if (!table) {
    return;
  }

  let matters = getMatters();

  const search = String(searchTerm || "")
    .trim()
    .toLowerCase();

  if (search) {
    matters = matters.filter(function(matter) {
      return (
        matter.title.toLowerCase().includes(search) ||
        matter.id.toLowerCase().includes(search)
      );
    });
  }

  if (!matters.length) {
    table.innerHTML = `
      <div class="empty-state">
        No practice matters found.
      </div>
    `;
    return;
  }

  table.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Practice</th>
            <th>WPM</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${matters.map(function(matter) {
            return `
              <tr>
                <td>${escapeHtml(matter.id)}</td>

                <td>
                  <strong>
                    ${escapeHtml(matter.title)}
                  </strong>
                </td>

                <td>${matter.wpm}</td>

                <td>${matter.duration} min</td>

                <td>
                  <div class="table-actions">

                    <button
                      class="table-action edit"
                      onclick="openMatterEditor('${matter.id}')"
                    >
                      Edit
                    </button>

                    <button
                      class="table-action delete"
                      onclick="deleteMatter('${matter.id}')"
                    >
                      Delete
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

/* =====================================================
   ID GENERATOR
===================================================== */

function generateId(prefix) {
  return (
    prefix +
    Date.now().toString(36).toUpperCase()
  );
}

/* =====================================================
   SEARCH MATTERS
===================================================== */

function setupMatterSearch() {
  const search = document.getElementById("matterSearch");

  if (!search) {
    return;
  }

  search.addEventListener("input", function() {
    renderMattersTable(search.value);
  });
}
/* =====================================================
   STUDENT MANAGEMENT
===================================================== */

function openStudentEditor(studentId) {
  const editor = document.getElementById("studentEditor");
  const title = document.getElementById("studentEditorTitle");

  const nameInput = document.getElementById("studentName");
  const idInput = document.getElementById("studentId");
  const passwordInput = document.getElementById("studentPassword");
  const statusInput = document.getElementById("studentStatus");

  editingStudentId = studentId || null;

  if (studentId) {
    const student = getStudents().find(function(item) {
      return item.id === studentId;
    });

    if (!student) {
      return;
    }

    if (title) {
      title.textContent = "Edit Student";
    }

    if (nameInput) {
      nameInput.value = student.name;
    }

    if (idInput) {
      idInput.value = student.username;
    }

    if (passwordInput) {
      passwordInput.value = student.password;
    }

    if (statusInput) {
      statusInput.value = student.status;
    }
  } else {
    if (title) {
      title.textContent = "Create Student";
    }

    if (nameInput) {
      nameInput.value = "";
    }

    if (idInput) {
      idInput.value = "";
    }

    if (passwordInput) {
      passwordInput.value = "";
    }

    if (statusInput) {
      statusInput.value = "active";
    }
  }

  if (editor) {
    editor.classList.remove("hidden");
  }
}

/* =====================================================
   CLOSE STUDENT EDITOR
===================================================== */

function closeStudentEditor() {
  const editor = document.getElementById("studentEditor");

  editingStudentId = null;

  if (editor) {
    editor.classList.add("hidden");
  }
}

/* =====================================================
   SAVE STUDENT
===================================================== */

function saveStudent(event) {
  event.preventDefault();

  const nameInput = document.getElementById("studentName");
  const idInput = document.getElementById("studentId");
  const passwordInput = document.getElementById("studentPassword");
  const statusInput = document.getElementById("studentStatus");

  const name = nameInput
    ? nameInput.value.trim()
    : "";

  const username = idInput
    ? idInput.value.trim()
    : "";

  const password = passwordInput
    ? passwordInput.value
    : "";

  const status = statusInput
    ? statusInput.value
    : "active";

  if (!name) {
    showToast("Student name required.");
    return;
  }

  if (!username) {
    showToast("Student ID / username required.");
    return;
  }

  if (!password) {
    showToast("Password required.");
    return;
  }

  const students = getStudents();

  /* Prevent duplicate username */
  const duplicate = students.find(function(student) {
    return (
      student.username.toLowerCase() === username.toLowerCase() &&
      student.id !== editingStudentId
    );
  });

  if (duplicate) {
    showToast("This Student ID / username already exists.");
    return;
  }

  if (editingStudentId) {
    const index = students.findIndex(function(student) {
      return student.id === editingStudentId;
    });

    if (index !== -1) {
      students[index] = {
        ...students[index],
        name: name,
        username: username,
        password: password,
        status: status
      };
    }

    showToast("Student updated.");
  } else {
    students.push({
      id: generateId("S"),
      name: name,
      username: username,
      password: password,
      status: status,
      assignedMatters: []
    });

    showToast("Student created.");
  }

  setStorage("shorthand_students", students);

  closeStudentEditor();
  renderStudentsTable();
  loadAdminDashboard();
}

/* =====================================================
   DELETE STUDENT
===================================================== */

function deleteStudent(studentId) {
  const students = getStudents();

  const student = students.find(function(item) {
    return item.id === studentId;
  });

  if (!student) {
    return;
  }

  const confirmed = confirm(
    'Delete student "' + student.name + '"?'
  );

  if (!confirmed) {
    return;
  }

  const updatedStudents = students.filter(function(item) {
    return item.id !== studentId;
  });

  setStorage("shorthand_students", updatedStudents);

  /* Also remove this student's results */
  const results = getResults().filter(function(result) {
    return result.studentId !== studentId;
  });

  setStorage("shorthand_results", results);

  renderStudentsTable();
  loadAdminDashboard();

  showToast("Student deleted.");
}

/* =====================================================
   TOGGLE STUDENT STATUS
===================================================== */

function toggleStudentStatus(studentId) {
  const students = getStudents();

  const student = students.find(function(item) {
    return item.id === studentId;
  });

  if (!student) {
    return;
  }

  student.status =
    student.status === "active"
      ? "inactive"
      : "active";

  setStorage("shorthand_students", students);

  renderStudentsTable();

  showToast(
    student.status === "active"
      ? "Student activated."
      : "Student deactivated."
  );
}

/* =====================================================
   STUDENT TABLE
===================================================== */

function renderStudentsTable() {
  const table = document.getElementById("studentsTable");

  if (!table) {
    return;
  }

  const students = getStudents();

  if (!students.length) {
    table.innerHTML = `
      <div class="empty-state">
        No students found.
      </div>
    `;
    return;
  }

  table.innerHTML = `
    <div class="table-wrapper">

      <table class="data-table">

        <thead>
          <tr>
            <th>Student</th>
            <th>ID</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          ${students.map(function(student) {

            const assignedCount =
              Array.isArray(student.assignedMatters)
                ? student.assignedMatters.length
                : 0;

            const statusClass =
              student.status === "active"
                ? "success"
                : "danger";

            return `
              <tr>

                <td>
                  <strong>
                    ${escapeHtml(student.name)}
                  </strong>
                </td>

                <td>
                  ${escapeHtml(student.username)}
                </td>

                <td>
                  <span class="badge ${statusClass}">
                    ${student.status}
                  </span>
                </td>

                <td>
                  ${assignedCount} practice
                </td>

                <td>
                  <div class="table-actions">

                    <button
                      class="table-action edit"
                      onclick="openStudentEditor('${student.id}')"
                    >
                      Edit
                    </button>

                    <button
                      class="table-action"
                      onclick="toggleStudentStatus('${student.id}')"
                    >
                      ${student.status === "active"
                        ? "Disable"
                        : "Activate"}
                    </button>

                    <button
                      class="table-action delete"
                      onclick="deleteStudent('${student.id}')"
                    >
                      Delete
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
/* =====================================================
   PART 5 — ASSIGNMENTS + APP EVENT WIRING
===================================================== */

function openAssignmentManager(studentId) {
  const students = getStudents();
  const matters = getMatters();

  const student = students.find(s => s.id === studentId);

  if (!student) {
    showToast("Student not found", "error");
    return;
  }

  const assigned = student.assignedMatters || [];

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "assignmentModal";

  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>Assign Practices</h3>
          <p style="margin:4px 0 0;color:#64748b;font-size:13px;">
            ${escapeHtml(student.name)} (${escapeHtml(student.id)})
          </p>
        </div>

        <button type="button"
                class="close-button"
                id="closeAssignmentModal">
          ×
        </button>
      </div>

      <div style="padding:20px;max-height:55vh;overflow-y:auto;">
        ${
          matters.length
            ? matters.map(matter => `
                <label style="
                  display:flex;
                  align-items:center;
                  gap:12px;
                  padding:14px;
                  margin-bottom:10px;
                  border:1px solid #e2e8f0;
                  border-radius:12px;
                  cursor:pointer;
                  background:#fff;
                ">
                  <input
                    type="checkbox"
                    class="assignment-checkbox"
                    value="${escapeHtml(matter.id)}"
                    ${assigned.includes(matter.id) ? "checked" : ""}
                    style="width:18px;height:18px;"
                  >

                  <div style="flex:1;">
                    <strong style="display:block;">
                      ${escapeHtml(matter.title)}
                    </strong>

                    <span style="
                      display:block;
                      margin-top:4px;
                      color:#64748b;
                      font-size:12px;
                    ">
                      ${escapeHtml(matter.id)}
                      • ${Number(matter.wpm) || 0} WPM
                      • ${Number(matter.duration) || 0} min
                    </span>
                  </div>
                </label>
              `).join("")
            : `
              <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No practices available</h3>
                <p>Create a practice matter first.</p>
              </div>
            `
        }
      </div>

      <div class="form-actions">
        <button type="button"
                class="secondary-button"
                id="cancelAssignment">
          Cancel
        </button>

        <button type="button"
                class="primary-button"
                id="saveAssignment">
          Save Assignments
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  function closeAssignmentManager() {
    const modal = document.getElementById("assignmentModal");
    if (modal) {
      modal.remove();
    }
  }

  document
    .getElementById("closeAssignmentModal")
    ?.addEventListener("click", closeAssignmentManager);

  document
    .getElementById("cancelAssignment")
    ?.addEventListener("click", closeAssignmentManager);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeAssignmentManager();
    }
  });

  document
    .getElementById("saveAssignment")
    ?.addEventListener("click", () => {

      const selected = Array.from(
        document.querySelectorAll(".assignment-checkbox:checked")
      ).map(input => input.value);

      const updatedStudents = getStudents();

      const index = updatedStudents.findIndex(
        s => s.id === studentId
      );

      if (index === -1) {
        showToast("Student not found", "error");
        return;
      }

      updatedStudents[index].assignedMatters = selected;

      setStorage("shorthand_students", updatedStudents);

      closeAssignmentManager();

      renderStudentsTable();

      showToast(
        `${selected.length} practice(s) assigned successfully`,
        "success"
      );
    });
}


/* =====================================================
   STUDENT TABLE — WITH ASSIGN BUTTON
===================================================== */

function renderStudentsTable() {

  const table = document.getElementById("studentsTable");

  if (!table) return;

  const students = getStudents();

  if (!students.length) {
    table.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👨‍🎓</div>
        <h3>No students yet</h3>
        <p>Create your first student account.</p>
      </div>
    `;
    return;
  }

  table.innerHTML = students.map(student => {

    const assignedCount =
      (student.assignedMatters || []).length;

    const statusClass =
      student.status === "active"
        ? "badge-success"
        : "badge-danger";

    const statusText =
      student.status === "active"
        ? "Active"
        : "Inactive";

    return `
      <div class="table-row">

        <div class="student-cell">
          <div class="table-avatar">
            ${escapeHtml(
              (student.name || "S").charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <strong>
              ${escapeHtml(student.name)}
            </strong>

            <span>
              ${escapeHtml(student.id)}
            </span>
          </div>
        </div>

        <div>
          ${escapeHtml(student.username)}
        </div>

        <div>
          <span class="badge">
            ${assignedCount} assigned
          </span>
        </div>

        <div>
          <span class="badge ${statusClass}">
            ${statusText}
          </span>
        </div>

        <div class="table-actions">

          <button
            type="button"
            class="icon-button"
            title="Assign practices"
            data-action="assign"
            data-id="${escapeHtml(student.id)}">
            📚
          </button>

          <button
            type="button"
            class="icon-button"
            title="Edit student"
            data-action="edit"
            data-id="${escapeHtml(student.id)}">
            ✏️
          </button>

          <button
            type="button"
            class="icon-button"
            title="${student.status === "active" ? "Deactivate" : "Activate"}"
            data-action="toggle"
            data-id="${escapeHtml(student.id)}">
            ${student.status === "active" ? "⏸️" : "▶️"}
          </button>

          <button
            type="button"
            class="icon-button danger"
            title="Delete student"
            data-action="delete"
            data-id="${escapeHtml(student.id)}">
            🗑️
          </button>

        </div>

      </div>
    `;
  }).join("");

  table.querySelectorAll("[data-action]").forEach(button => {

    button.addEventListener("click", () => {

      const action = button.dataset.action;
      const studentId = button.dataset.id;

      if (action === "assign") {
        openAssignmentManager(studentId);
      }

      if (action === "edit") {
        openStudentEditor(studentId);
      }

      if (action === "toggle") {
        toggleStudentStatus(studentId);
      }

      if (action === "delete") {
        deleteStudent(studentId);
      }

    });

  });
}


/* =====================================================
   APPLICATION EVENT WIRING
===================================================== */

function setupAppEvents() {

  /* ---------- LOGIN ---------- */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }


  /* ---------- LOGIN TABS ---------- */

  document.querySelectorAll(".login-tab").forEach(tab => {

    tab.addEventListener("click", () => {

      const loginType =
        tab.dataset.loginType || "student";

      setLoginType(loginType);

    });

  });


  /* ---------- ADMIN LOGOUT ---------- */

  document
    .getElementById("adminLogout")
    ?.addEventListener("click", logout);


  /* ---------- STUDENT LOGOUT ---------- */

  document
    .getElementById("studentLogout")
    ?.addEventListener("click", logout);


  /* ---------- ADMIN NAVIGATION ---------- */

  setupAdminNavigation();


  /* ---------- NEW MATTER ---------- */

  document
    .getElementById("newMatterButton")
    ?.addEventListener("click", () => {
      openMatterEditor();
    });


  /* ---------- CLOSE MATTER EDITOR ---------- */

  document
    .getElementById("closeMatterEditor")
    ?.addEventListener("click", closeMatterEditor);


  document
    .getElementById("cancelMatter")
    ?.addEventListener("click", closeMatterEditor);


  /* ---------- MATTER FORM ---------- */

  document
    .getElementById("matterForm")
    ?.addEventListener("submit", saveMatter);


  /* ---------- MATTER SEARCH ---------- */

  setupMatterSearch();


  /* ---------- NEW STUDENT ---------- */

  document
    .getElementById("newStudentButton")
    ?.addEventListener("click", () => {
      openStudentEditor();
    });


  /* ---------- CLOSE STUDENT EDITOR ---------- */

  document
    .getElementById("closeStudentEditor")
    ?.addEventListener("click", closeStudentEditor);


  document
    .getElementById("cancelStudent")
    ?.addEventListener("click", closeStudentEditor);


  /* ---------- STUDENT FORM ---------- */

  document
    .getElementById("studentForm")
    ?.addEventListener("submit", saveStudent);


  /* ---------- SAVE SETTINGS ---------- */

  document
    .getElementById("saveSettings")
    ?.addEventListener("click", savePortalSettings);


  /* ---------- FONT SIZE ---------- */

  document
    .getElementById("fontDecrease")
    ?.addEventListener("click", () => {

      const display =
        document.getElementById("fontSizeDisplay");

      if (!display) return;

      let size =
        parseInt(display.textContent) || 20;

      size = Math.max(14, size - 1);

      display.textContent = size;

      const typingArea =
        document.getElementById("typingArea");

      if (typingArea) {
        typingArea.style.fontSize = `${size}px`;
      }

    });


  document
    .getElementById("fontIncrease")
    ?.addEventListener("click", () => {

      const display =
        document.getElementById("fontSizeDisplay");

      if (!display) return;

      let size =
        parseInt(display.textContent) || 20;

      size = Math.min(40, size + 1);

      display.textContent = size;

      const typingArea =
        document.getElementById("typingArea");

      if (typingArea) {
        typingArea.style.fontSize = `${size}px`;
      }

    });

}


/* =====================================================
   SETTINGS SAVE
===================================================== */

function savePortalSettings() {

  const portalName =
    document.getElementById("portalName")?.value ||
    "Shorthand Practice Portal";

  const defaultFontSize =
    parseInt(
      document.getElementById("defaultFontSize")?.value
    ) || 20;

  const autoSave =
    document.getElementById("autoSaveResults")?.checked ??
    true;

  setStorage("shorthand_settings", {
    portalName,
    defaultFontSize,
    autoSaveResults: autoSave
  });

  showToast("Settings saved successfully", "success");
}


/* =====================================================
   LOAD SAVED SETTINGS
===================================================== */

function loadPortalSettings() {

  const settings =
    getStorage("shorthand_settings", null);

  if (!settings) return;

  const portalName =
    document.getElementById("portalName");

  const defaultFontSize =
    document.getElementById("defaultFontSize");

  const autoSave =
    document.getElementById("autoSaveResults");

  if (portalName) {
    portalName.value =
      settings.portalName ||
      "Shorthand Practice Portal";
  }

  if (defaultFontSize) {
    defaultFontSize.value =
      settings.defaultFontSize || 20;
  }

  if (autoSave) {
    autoSave.checked =
      settings.autoSaveResults !== false;
  }
}


/* =====================================================
   START APP EVENTS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  setupAppEvents();

  loadPortalSettings();

  renderStudentsTable();

  renderMattersTable();

});
