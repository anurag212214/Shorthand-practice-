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
/* =====================================================
   PART 6 — PRACTICE ENGINE
===================================================== */

let practiceTimerInterval = null;
let practiceStartTime = null;
let practiceElapsedSeconds = 0;
let practicePaused = false;
let practiceFinished = false;
let practiceStarted = false;


/* =====================================================
   OPEN PRACTICE
===================================================== */

function startPractice(matterId) {

  const matters = getMatters();

  const matter = matters.find(m => m.id === matterId);

  if (!matter) {
    showToast("Practice not found", "error");
    return;
  }

  currentMatter = matter;

  practiceElapsedSeconds = 0;
  practicePaused = false;
  practiceFinished = false;
  practiceStarted = false;

  clearInterval(practiceTimerInterval);

  hideAllScreens();
  showScreen("practiceScreen");

  const title = document.getElementById("practiceTitle");

  if (title) {
    title.textContent = matter.title;
  }

  const typingArea =
    document.getElementById("typingArea");

  if (typingArea) {
    typingArea.value = "";
    typingArea.disabled = true;
    typingArea.placeholder =
      "Click Start Practice to begin typing...";
  }

  updatePracticeTimer();
  updateLiveStats();
  updateTypingStatus("ready");
  updateCharacterCount();

  const target =
    document.getElementById("practiceTarget");

  if (target) {
    target.innerHTML = `
      <div class="target-badge">
        Target: ${Number(matter.wpm) || 0} WPM
      </div>
    `;
  }

  const fontDisplay =
    document.getElementById("fontSizeDisplay");

  if (fontDisplay) {
    const settings =
      getStorage("shorthand_settings", {});

    fontDisplay.textContent =
      settings.defaultFontSize || 20;
  }
}


/* =====================================================
   START TYPING
===================================================== */

function beginPractice() {

  if (!currentMatter) {
    showToast("Please select a practice first", "error");
    return;
  }

  const typingArea =
    document.getElementById("typingArea");

  if (!typingArea) return;

  if (practiceStarted && practicePaused) {

    practicePaused = false;

    typingArea.disabled = false;

    typingArea.focus();

    updateTypingStatus("typing");

    startPracticeTimer();

    return;
  }

  if (practiceStarted) {
    typingArea.focus();
    return;
  }

  practiceStarted = true;
  practicePaused = false;
  practiceFinished = false;

  practiceStartTime = Date.now();

  typingArea.disabled = false;
  typingArea.placeholder =
    "Start typing your transcription here...";

  typingArea.focus();

  updateTypingStatus("typing");

  startPracticeTimer();
}


/* =====================================================
   TIMER
===================================================== */

function startPracticeTimer() {

  clearInterval(practiceTimerInterval);

  practiceTimerInterval =
    setInterval(() => {

      if (practicePaused || practiceFinished) {
        return;
      }

      practiceElapsedSeconds =
        Math.floor(
          (Date.now() - practiceStartTime) / 1000
        );

      updatePracticeTimer();
      updateLiveStats();

      checkPracticeDuration();

    }, 250);
}


function updatePracticeTimer() {

  const timer =
    document.getElementById("timer");

  if (!timer) return;

  const totalSeconds =
    practiceElapsedSeconds;

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  timer.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


/* =====================================================
   AUTO FINISH WHEN DURATION ENDS
===================================================== */

function checkPracticeDuration() {

  if (!currentMatter) return;

  const duration =
    Number(currentMatter.duration) || 0;

  if (
    duration > 0 &&
    practiceElapsedSeconds >= duration * 60
  ) {

    showToast(
      "Practice time completed",
      "success"
    );

    finishPractice();

  }
}


/* =====================================================
   LIVE TYPING STATS
===================================================== */

function updateLiveStats() {

  const typingArea =
    document.getElementById("typingArea");

  if (!typingArea) return;

  const text =
    typingArea.value.trim();

  const words =
    text
      ? text.split(/\s+/).filter(Boolean).length
      : 0;

  const minutes =
    practiceElapsedSeconds / 60;

  let wpm = 0;

  if (minutes > 0) {
    wpm =
      Math.round(words / minutes);
  }

  const liveWpm =
    document.getElementById("liveWpm");

  const liveWords =
    document.getElementById("liveWords");

  if (liveWpm) {
    liveWpm.textContent = wpm;
  }

  if (liveWords) {
    liveWords.textContent = words;
  }

  updateLiveErrors();
}


/* =====================================================
   CHARACTER COUNT
===================================================== */

function updateCharacterCount() {

  const typingArea =
    document.getElementById("typingArea");

  const characterCount =
    document.getElementById("characterCount");

  if (!typingArea || !characterCount) return;

  characterCount.textContent =
    `${typingArea.value.length} characters`;
}


/* =====================================================
   LIVE ERROR COUNT
===================================================== */

function updateLiveErrors() {

  const typingArea =
    document.getElementById("typingArea");

  const errorStatus =
    document.getElementById("liveErrorStatus");

  if (!typingArea || !errorStatus) return;

  /*
     Demo frontend checking:
     We compare the typed text with the original
     matter only while calculating errors.

     In the final Supabase version the original matter
     will stay server-side.
  */

  if (!currentMatter || !currentMatter.text) {

    errorStatus.textContent =
      "Errors: 0";

    return;
  }

  const typed =
    typingArea.value;

  const original =
    currentMatter.text;

  let errors = 0;

  const maxLength =
    Math.max(
      typed.length,
      Math.min(
        original.length,
        typed.length
      )
    );

  for (let i = 0; i < maxLength; i++) {

    if (
      typed[i] !== undefined &&
      typed[i] !== original[i]
    ) {
      errors++;
    }

  }

  if (typed.length > original.length) {
    errors +=
      typed.length - original.length;
  }

  errorStatus.textContent =
    `Errors: ${errors}`;
}


/* =====================================================
   TYPING EVENT
===================================================== */

function handleTypingInput() {

  if (!practiceStarted || practicePaused) {
    return;
  }

  updateLiveStats();
  updateCharacterCount();
  updateLiveErrors();

  updateTypingStatus("typing");

  if (
    currentMatter &&
    currentMatter.text &&
    document.getElementById("typingArea")?.value ===
      currentMatter.text
  ) {

    showToast(
      "Matter completed — you can finish now",
      "success"
    );

  }
}


/* =====================================================
   PAUSE / RESUME
===================================================== */

function pausePractice() {

  if (!practiceStarted || practiceFinished) {
    return;
  }

  practicePaused = true;

  clearInterval(practiceTimerInterval);

  const typingArea =
    document.getElementById("typingArea");

  if (typingArea) {
    typingArea.disabled = true;
  }

  updateTypingStatus("paused");

  showToast("Practice paused", "success");
}


function resumePractice() {

  if (!practiceStarted || practiceFinished) {
    return;
  }

  practicePaused = false;

  const typingArea =
    document.getElementById("typingArea");

  if (typingArea) {
    typingArea.disabled = false;
    typingArea.focus();
  }

  updateTypingStatus("typing");

  startPracticeTimer();
}


/* =====================================================
   RESET PRACTICE
===================================================== */

function resetPractice() {

  if (!currentMatter) return;

  const confirmed =
    practiceStarted
      ? confirm(
          "Reset this practice? Your current typing will be cleared."
        )
      : true;

  if (!confirmed) return;

  clearInterval(practiceTimerInterval);

  practiceElapsedSeconds = 0;
  practiceStartTime = null;
  practicePaused = false;
  practiceFinished = false;
  practiceStarted = false;

  const typingArea =
    document.getElementById("typingArea");

  if (typingArea) {

    typingArea.value = "";

    typingArea.disabled = true;

    typingArea.placeholder =
      "Click Start Practice to begin typing...";

  }

  updatePracticeTimer();
  updateLiveStats();
  updateCharacterCount();
  updateLiveErrors();
  updateTypingStatus("ready");

  showToast("Practice reset", "success");
}


/* =====================================================
   TYPING STATUS
===================================================== */

function updateTypingStatus(status) {

  const statusElement =
    document.getElementById("typingStatus");

  if (!statusElement) return;

  statusElement.className =
    "status-badge";

  if (status === "ready") {

    statusElement.textContent =
      "Ready";

    statusElement.classList.add(
      "status-ready"
    );

  }

  else if (status === "typing") {

    statusElement.textContent =
      "Typing";

    statusElement.classList.add(
      "status-typing"
    );

  }

  else if (status === "paused") {

    statusElement.textContent =
      "Paused";

    statusElement.classList.add(
      "status-paused"
    );

  }

  else if (status === "finished") {

    statusElement.textContent =
      "Finished";

    statusElement.classList.add(
      "status-finished"
    );

  }

}


/* =====================================================
   EXIT PRACTICE
===================================================== */

function exitPractice() {

  if (
    practiceStarted &&
    !practiceFinished
  ) {

    const confirmed =
      confirm(
        "Exit practice? Your current attempt will not be saved."
      );

    if (!confirmed) return;

  }

  clearInterval(practiceTimerInterval);

  currentMatter = null;

  hideAllScreens();

  if (currentUserType === "student") {

    showScreen("studentScreen");

    loadStudentDashboard();

  } else {

    showScreen("adminScreen");

  }

}


/* =====================================================
   FINISH PRACTICE
===================================================== */

function finishPractice() {

  if (!currentMatter) return;

  if (practiceFinished) return;

  const typingArea =
    document.getElementById("typingArea");

  if (!typingArea) return;

  if (!practiceStarted) {

    showToast(
      "Start the practice first",
      "error"
    );

    return;
  }

  const confirmed =
    confirm(
      "Finish this practice and view your result?"
    );

  if (!confirmed) return;

  practiceFinished = true;

  clearInterval(practiceTimerInterval);

  typingArea.disabled = true;

  updateTypingStatus("finished");

  calculatePracticeResult();
}


/* =====================================================
   CALCULATE RESULT
===================================================== */

function calculatePracticeResult() {

  const typingArea =
    document.getElementById("typingArea");

  if (!typingArea || !currentMatter) return;

  const typedText =
    typingArea.value;

  const originalText =
    currentMatter.text || "";

  const originalWords =
    originalText
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const typedWords =
    typedText
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  let correctWords = 0;
  let wrongWords = 0;
  let missingWords = 0;
  let extraWords = 0;

  const wordAnalysis = [];
  const mistakes = [];

  const maxWords =
    Math.max(
      originalWords.length,
      typedWords.length
    );

  for (let i = 0; i < maxWords; i++) {

    const originalWord =
      originalWords[i];

    const typedWord =
      typedWords[i];

    if (
      originalWord !== undefined &&
      typedWord !== undefined
    ) {

      if (
        originalWord.toLowerCase() ===
        typedWord.toLowerCase()
      ) {

        correctWords++;

        wordAnalysis.push({
          position: i + 1,
          expected: originalWord,
          typed: typedWord,
          status: "correct"
        });

      } else {

        wrongWords++;

        mistakes.push({
          position: i + 1,
          expected: originalWord,
          typed: typedWord
        });

        wordAnalysis.push({
          position: i + 1,
          expected: originalWord,
          typed: typedWord,
          status: "wrong"
        });

      }

    }

    else if (
      originalWord !== undefined &&
      typedWord === undefined
    ) {

      missingWords++;

      mistakes.push({
        position: i + 1,
        expected: originalWord,
        typed: "(missing)"
      });

      wordAnalysis.push({
        position: i + 1,
        expected: originalWord,
        typed: "(missing)",
        status: "missing"
      });

    }

    else if (
      originalWord === undefined &&
      typedWord !== undefined
    ) {

      extraWords++;

      mistakes.push({
        position: i + 1,
        expected: "(none)",
        typed: typedWord
      });

      wordAnalysis.push({
        position: i + 1,
        expected: "(none)",
        typed: typedWord,
        status: "extra"
      });

    }

  }

  const totalExpected =
    originalWords.length;

  const accuracy =
    totalExpected > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (correctWords / totalExpected) * 100
          )
        )
      : 0;

  const minutes =
    Math.max(
      practiceElapsedSeconds / 60,
      1 / 60
    );

  const wpm =
    Math.round(
      typedWords.length / minutes
    );

  const result = {

    id: generateId("R"),

    studentId:
      currentUser?.id ||
      currentUser?.studentId ||
      "unknown",

    matterId:
      currentMatter.id,

    matterTitle:
      currentMatter.title,

    date:
      new Date().toISOString(),

    timeSeconds:
      practiceElapsedSeconds,

    typedWords:
      typedWords.length,

    correctWords,
    wrongWords,
    missingWords,
    extraWords,

    accuracy:
      Number(accuracy.toFixed(2)),

    wpm,

    mistakes,

    wordAnalysis

  };

  savePracticeResult(result);

  showResultScreen(result);
}


/* =====================================================
   SAVE RESULT
===================================================== */

function savePracticeResult(result) {

  const results =
    getResults();

  results.unshift(result);

  setStorage(
    "shorthand_results",
    results
  );

}


/* =====================================================
   RESULT SCREEN
===================================================== */

function showResultScreen(result) {

  hideAllScreens();

  showScreen("resultScreen");

  const subtitle =
    document.getElementById("resultSubtitle");

  if (subtitle) {
    subtitle.textContent =
      `${result.matterTitle} • ${formatResultTime(result.timeSeconds)}`;
  }

  const accuracy =
    document.getElementById("resultAccuracy");

  const wpm =
    document.getElementById("resultWpm");

  const time =
    document.getElementById("resultTime");

  const words =
    document.getElementById("resultWords");

  const mistakeCount =
    document.getElementById("mistakeCount");

  if (accuracy) {
    accuracy.textContent =
      `${result.accuracy}%`;
  }

  if (wpm) {
    wpm.textContent =
      result.wpm;
  }

  if (time) {
    time.textContent =
      formatResultTime(result.timeSeconds);
  }

  if (words) {
    words.textContent =
      result.typedWords;
  }

  if (mistakeCount) {
    mistakeCount.textContent =
      result.mistakes.length;
  }

  renderMistakes(result);
  renderWordAnalysis(result);
}


/* =====================================================
   RESULT TIME FORMAT
===================================================== */

function formatResultTime(seconds) {

  const total =
    Number(seconds) || 0;

  const minutes =
    Math.floor(total / 60);

  const remaining =
    total % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
}


/* =====================================================
   MISTAKES
===================================================== */

function renderMistakes(result) {

  const container =
    document.getElementById("mistakesList");

  if (!container) return;

  if (!result.mistakes.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>No mistakes</h3>
        <p>Excellent transcription!</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    result.mistakes.map(mistake => `
      <div class="mistake-item">

        <div class="mistake-position">
          ${mistake.position}
        </div>

        <div class="mistake-content">

          <div>
            <span class="mistake-label">
              Expected
            </span>

            <strong>
              ${escapeHtml(mistake.expected)}
            </strong>
          </div>

          <div>
            <span class="mistake-label">
              Typed
            </span>

            <strong>
              ${escapeHtml(mistake.typed)}
            </strong>
          </div>

        </div>

      </div>
    `).join("");
}


/* =====================================================
   WORD ANALYSIS
===================================================== */

function renderWordAnalysis(result) {

  const container =
    document.getElementById("wordAnalysis");

  if (!container) return;

  if (!result.wordAnalysis.length) {

    container.innerHTML =
      `<p>No word analysis available.</p>`;

    return;
  }

  container.innerHTML = `
    <div class="analysis-list">

      ${result.wordAnalysis.map(item => {

        let statusLabel = "Correct";

        if (item.status === "wrong") {
          statusLabel = "Wrong";
        }

        if (item.status === "missing") {
          statusLabel = "Missing";
        }

        if (item.status === "extra") {
          statusLabel = "Extra";
        }

        return `
          <div class="analysis-row">

            <span class="analysis-number">
              ${item.position}
            </span>

            <span class="analysis-expected">
              ${escapeHtml(item.expected)}
            </span>

            <span class="analysis-typed">
              ${escapeHtml(item.typed)}
            </span>

            <span class="analysis-status">
              ${statusLabel}
            </span>

          </div>
        `;

      }).join("")}

    </div>
  `;
}


/* =====================================================
   PRACTICE BUTTON EVENTS
===================================================== */

function setupPracticeEvents() {

  document
    .getElementById("startPractice")
    ?.addEventListener(
      "click",
      beginPractice
    );


  document
    .getElementById("resetPractice")
    ?.addEventListener(
      "click",
      resetPractice
    );


  document
    .getElementById("finishPractice")
    ?.addEventListener(
      "click",
      finishPractice
    );


  document
    .getElementById("exitPractice")
    ?.addEventListener(
      "click",
      exitPractice
    );


  const typingArea =
    document.getElementById("typingArea");

  if (typingArea) {

    typingArea.addEventListener(
      "input",
      handleTypingInput
    );

  }

}


/* =====================================================
   STUDENT PRACTICE CARD CLICK
===================================================== */

function setupStudentPracticeButtons() {

  document.addEventListener("click", event => {

    const button =
      event.target.closest(
        "[data-practice-id]"
      );

     if (!button) return;

    const matterId =
      button.dataset.practiceId;

    if (matterId) {
      startPractice(matterId);
    }

  });

}


/* =====================================================
   RESULT BUTTONS
===================================================== */

function setupResultEvents() {

  document
    .getElementById("backToDashboard")
    ?.addEventListener(
      "click",
      () => {

        hideAllScreens();

        showScreen("studentScreen");

        loadStudentDashboard();

      }
    );


  document
    .getElementById("practiceAgain")
    ?.addEventListener(
      "click",
      () => {

        if (currentMatter) {
          startPractice(
            currentMatter.id
          );
        }

      }
    );

}


/* =====================================================
   INITIALIZE PRACTICE EVENTS
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupPracticeEvents();

    setupStudentPracticeButtons();

    setupResultEvents();

  }
);
/* =====================================================
   PART 7 — EXAM STYLE PRACTICE FLOW
   No Pause • No Reset • Submit / Auto Submit
===================================================== */


/* =====================================================
   STUDENT PRACTICE CARDS
===================================================== */

function renderStudentMatters() {

  const container =
    document.getElementById("studentMatterCards");

  if (!container || !currentUser) return;

  const matters = getMatters();

  const assignedIds =
    currentUser.assignedMatters || [];

  const assignedMatters =
    matters.filter(matter =>
      assignedIds.includes(matter.id)
    );

  if (!assignedMatters.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No practice assigned</h3>
        <p>Your administrator has not assigned any practice yet.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    assignedMatters.map(matter => `

      <div class="practice-card">

        <div class="practice-card-top">

          <div class="practice-card-icon">
            📝
          </div>

          <span class="badge">
            ${Number(matter.wpm) || 0} WPM
          </span>

        </div>

        <h3>
          ${escapeHtml(matter.title)}
        </h3>

        <div class="practice-card-meta">

          <span>
            ⏱️ ${Number(matter.duration) || 0} min
          </span>

          <span>
            🎯 ${Number(matter.wpm) || 0} WPM
          </span>

        </div>

        <button
          type="button"
          class="primary-button practice-start-button"
          data-practice-id="${escapeHtml(matter.id)}">

          Start Practice

        </button>

      </div>

    `).join("");
}


/* =====================================================
   EXAM-STYLE START
===================================================== */

function beginPractice() {

  if (!currentMatter) {
    showToast(
      "Please select a practice first",
      "error"
    );
    return;
  }

  const typingArea =
    document.getElementById("typingArea");

  if (!typingArea) return;

  if (practiceStarted) {
    return;
  }

  practiceStarted = true;
  practicePaused = false;
  practiceFinished = false;

  practiceStartTime = Date.now();
  practiceElapsedSeconds = 0;

  typingArea.disabled = false;

  typingArea.placeholder =
    "Start typing your transcription here...";

  typingArea.focus();

  updateTypingStatus("typing");

  startPracticeTimer();

  updatePracticeControls();

  showToast(
    "Practice started. Timer is running.",
    "success"
  );
}


/* =====================================================
   TIMER — CONTINUOUS
===================================================== */

function startPracticeTimer() {

  clearInterval(practiceTimerInterval);

  practiceTimerInterval =
    setInterval(() => {

      if (
        practiceFinished ||
        !practiceStarted
      ) {
        return;
      }

      practiceElapsedSeconds =
        Math.floor(
          (Date.now() - practiceStartTime) / 1000
        );

      updatePracticeTimer();
      updateLiveStats();
      updateCharacterCount();
      updateLiveErrors();

      checkPracticeDuration();

    }, 250);
}


/* =====================================================
   DISABLE PAUSE / RESET
===================================================== */

function pausePractice() {

  showToast(
    "Pause is not available during practice.",
    "error"
  );

}


function resumePractice() {

  showToast(
    "Pause is not available during practice.",
    "error"
  );

}


function resetPractice() {

  showToast(
    "Reset is not available during practice.",
    "error"
  );

}


/* =====================================================
   PRACTICE CONTROLS
===================================================== */

function updatePracticeControls() {

  const startButton =
    document.getElementById("startPractice");

  const resetButton =
    document.getElementById("resetPractice");

  const finishButton =
    document.getElementById("finishPractice");

  if (startButton) {

    startButton.style.display =
      "none";

  }

  if (resetButton) {

    resetButton.style.display =
      "none";

  }

  if (finishButton) {

    finishButton.style.display =
      "inline-flex";

    finishButton.textContent =
      "Submit Practice";

  }

}


/* =====================================================
   AUTO SUBMIT
===================================================== */

function checkPracticeDuration() {

  if (!currentMatter) return;

  const duration =
    Number(currentMatter.duration) || 0;

  if (
    duration > 0 &&
    practiceElapsedSeconds >=
      duration * 60
  ) {

    showToast(
      "Time is over. Submitting practice...",
      "success"
    );

    autoSubmitPractice();

  }

}


/* =====================================================
   AUTO SUBMIT FUNCTION
===================================================== */

function autoSubmitPractice() {

  if (practiceFinished) {
    return;
  }

  practiceFinished = true;

  clearInterval(
    practiceTimerInterval
  );

  const typingArea =
    document.getElementById("typingArea");

  if (typingArea) {
    typingArea.disabled = true;
  }

  updateTypingStatus("finished");

  calculatePracticeResult();

}


/* =====================================================
   MANUAL SUBMIT
===================================================== */

function finishPractice() {

  if (!currentMatter) return;

  if (!practiceStarted) {

    showToast(
      "Start the practice first.",
      "error"
    );

    return;
  }

  if (practiceFinished) {
    return;
  }

  const confirmed =
    confirm(
      "Submit your practice now?"
    );

  if (!confirmed) {
    return;
  }

  practiceFinished = true;

  clearInterval(
    practiceTimerInterval
  );

  const typingArea =
    document.getElementById("typingArea");

  if (typingArea) {
    typingArea.disabled = true;
  }

  updateTypingStatus("finished");

  calculatePracticeResult();

}


/* =====================================================
   PREVENT PASTE
===================================================== */

function preventPracticePaste() {

  const typingArea =
    document.getElementById("typingArea");

  if (!typingArea) return;

  typingArea.addEventListener(
    "paste",
    event => {

      event.preventDefault();

      showToast(
        "Paste is disabled during practice.",
        "error"
      );

    }
  );

}


/* =====================================================
   PREVENT DRAG & DROP TEXT
===================================================== */

function preventPracticeDrop() {

  const typingArea =
    document.getElementById("typingArea");

  if (!typingArea) return;

  typingArea.addEventListener(
    "drop",
    event => {

      event.preventDefault();

      showToast(
        "Text drop is disabled during practice.",
        "error"
      );

    }
  );

}


/* =====================================================
   PRACTICE SCREEN SECURITY HELPERS
===================================================== */

function setupPracticeRestrictions() {

  preventPracticePaste();

  preventPracticeDrop();

}


/* =====================================================
   PRACTICE EVENT INITIALIZATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupPracticeRestrictions();

    updatePracticeControls();

  }
);
/* =====================================================
   PART 8 — HIDDEN MATTER + CLEAN PRACTICE SCREEN
===================================================== */


/* =====================================================
   START PRACTICE — HIDE ORIGINAL MATTER
===================================================== */

function startPractice(matterId) {

  const matters = getMatters();

  const matter =
    matters.find(m => m.id === matterId);

  if (!matter) {
    showToast(
      "Practice not found",
      "error"
    );
    return;
  }

  currentMatter = matter;

  /* Reset attempt state */

  practiceElapsedSeconds = 0;
  practiceStartTime = null;
  practicePaused = false;
  practiceFinished = false;
  practiceStarted = false;

  clearInterval(
    practiceTimerInterval
  );


  /* Open practice screen */

  hideAllScreens();

  showScreen(
    "practiceScreen"
  );


  /* Practice title */

  const title =
    document.getElementById(
      "practiceTitle"
    );

  if (title) {

    title.textContent =
      matter.title;

  }


  /* =================================================
     IMPORTANT:
     ORIGINAL MATTER IS NEVER SHOWN HERE
  ================================================= */

  const target =
    document.getElementById(
      "practiceTarget"
    );

  if (target) {

    target.innerHTML = `
      <div class="target-badge">
        Target: ${Number(matter.wpm) || 0} WPM
      </div>
    `;

  }


  /* Clear typing area */

  const typingArea =
    document.getElementById(
      "typingArea"
    );

  if (typingArea) {

    typingArea.value = "";

    typingArea.disabled = true;

    typingArea.placeholder =
      "Click Start Practice to begin typing...";

  }


  /* Reset statistics */

  const timer =
    document.getElementById(
      "timer"
    );

  const liveWpm =
    document.getElementById(
      "liveWpm"
    );

  const liveWords =
    document.getElementById(
      "liveWords"
    );

  if (timer) {
    timer.textContent =
      "00:00";
  }

  if (liveWpm) {
    liveWpm.textContent =
      "0";
  }

  if (liveWords) {
    liveWords.textContent =
      "0";
  }


  /* Error status */

  const errorStatus =
    document.getElementById(
      "liveErrorStatus"
    );

  if (errorStatus) {

    errorStatus.textContent =
      "Errors: 0";

  }


  /* Character count */

  updateCharacterCount();


  /* Status */

  updateTypingStatus(
    "ready"
  );


  /* Font size */

  const fontDisplay =
    document.getElementById(
      "fontSizeDisplay"
    );

  const settings =
    getStorage(
      "shorthand_settings",
      {}
    );

  const fontSize =
    Number(
      settings.defaultFontSize
    ) || 20;

  if (fontDisplay) {

    fontDisplay.textContent =
      fontSize;

  }

  if (typingArea) {

    typingArea.style.fontSize =
      `${fontSize}px`;

  }


  /* Practice buttons */

  updatePracticeControls();

}


/* =====================================================
   HIDE ANY ORIGINAL MATTER TEXT
===================================================== */

function removeOriginalMatterFromPractice() {

  const target =
    document.getElementById(
      "practiceTarget"
    );

  if (!target) return;

  /*
     Only target information is displayed.
     Matter text is deliberately NOT inserted.
  */

  target.innerHTML = `
    <div class="target-badge">
      Target: ${
        currentMatter
          ? Number(currentMatter.wpm) || 0
          : 0
      } WPM
    </div>
  `;

}


/* =====================================================
   OVERRIDE LIVE ERROR DISPLAY
===================================================== */

function updateLiveErrors() {

  const typingArea =
    document.getElementById(
      "typingArea"
    );

  const errorStatus =
    document.getElementById(
      "liveErrorStatus"
    );

  if (!typingArea || !errorStatus) {
    return;
  }

  /*
     During practice the exact error count can be
     calculated internally, but the original matter
     itself is never displayed to the student.
  */

  if (
    !currentMatter ||
    !currentMatter.text
  ) {

    errorStatus.textContent =
      "Errors: 0";

    return;

  }


  const typed =
    typingArea.value || "";

  const original =
    currentMatter.text || "";

  let errors = 0;

  const compareLength =
    Math.min(
      typed.length,
      original.length
    );


  for (
    let i = 0;
    i < compareLength;
    i++
  ) {

    if (
      typed[i].toLowerCase() !==
      original[i].toLowerCase()
    ) {

      errors++;

    }

  }


  if (
    typed.length >
    original.length
  ) {

    errors +=
      typed.length -
      original.length;

  }


  errorStatus.textContent =
    `Errors: ${errors}`;

}


/* =====================================================
   EXTRA PRACTICE PROTECTION
===================================================== */

function setupPracticeProtection() {

  const typingArea =
    document.getElementById(
      "typingArea"
    );

  if (!typingArea) {
    return;
  }


  /* Disable autocomplete */

  typingArea.setAttribute(
    "autocomplete",
    "off"
  );


  /* Disable spellcheck */

  typingArea.setAttribute(
    "spellcheck",
    "false"
  );


  /* Disable autocorrect */

  typingArea.setAttribute(
    "autocorrect",
    "off"
  );


  /* Disable text suggestions */

  typingArea.setAttribute(
    "autocapitalize",
    "off"
  );


  /* Prevent paste */

  typingArea.addEventListener(
    "paste",
    event => {

      event.preventDefault();

      showToast(
        "Paste is disabled during practice.",
        "error"
      );

    }
  );


  /* Prevent drop */

  typingArea.addEventListener(
    "drop",
    event => {

      event.preventDefault();

    }
  );

}


/* =====================================================
   RESULT BACK TO DASHBOARD
===================================================== */

function returnToStudentDashboard() {

  clearInterval(
    practiceTimerInterval
  );

  currentMatter = null;

  practiceStarted = false;
  practiceFinished = false;
  practicePaused = false;

  hideAllScreens();

  showScreen(
    "studentScreen"
  );

  loadStudentDashboard();

}


/* =====================================================
   PRACTICE INITIALIZATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupPracticeProtection();

    removeOriginalMatterFromPractice();

  }
);
/* =====================================================
   PART 9 — ACCURATE RESULT & MISTAKE ANALYSIS
===================================================== */


/* =====================================================
   NORMALIZE WORD
===================================================== */

function normalizePracticeWord(word) {

  return String(word || "")
    .trim()
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/\s+/g, " ");

}


/* =====================================================
   SPLIT MATTER INTO WORDS
===================================================== */

function getPracticeWords(text) {

  if (!text) {
    return [];
  }

  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

}


/* =====================================================
   CALCULATE PRACTICE RESULT
===================================================== */

function calculatePracticeResult() {

  const typingArea =
    document.getElementById(
      "typingArea"
    );

  if (!typingArea || !currentMatter) {
    return;
  }


  const typedText =
    typingArea.value || "";

  const originalText =
    currentMatter.text || "";


  const originalWords =
    getPracticeWords(
      originalText
    );

  const typedWords =
    getPracticeWords(
      typedText
    );


  let correctWords = 0;
  let wrongWords = 0;
  let missingWords = 0;
  let extraWords = 0;


  const mistakes = [];
  const wordAnalysis = [];


  const totalPositions =
    Math.max(
      originalWords.length,
      typedWords.length
    );


  /* =================================================
     WORD-BY-WORD COMPARISON
  ================================================= */

  for (
    let i = 0;
    i < totalPositions;
    i++
  ) {

    const expected =
      originalWords[i];

    const typed =
      typedWords[i];


    /* ---------- CORRECT ---------- */

    if (
      expected !== undefined &&
      typed !== undefined &&
      normalizePracticeWord(expected) ===
        normalizePracticeWord(typed)
    ) {

      correctWords++;

      wordAnalysis.push({

        position:
          i + 1,

        expected,

        typed,

        status:
          "correct"

      });

      continue;
    }


    /* ---------- WRONG ---------- */

    if (
      expected !== undefined &&
      typed !== undefined
    ) {

      wrongWords++;

      mistakes.push({

        position:
          i + 1,

        expected,

        typed,

        type:
          "wrong"

      });

      wordAnalysis.push({

        position:
          i + 1,

        expected,

        typed,

        status:
          "wrong"

      });

      continue;
    }


    /* ---------- MISSING ---------- */

    if (
      expected !== undefined &&
      typed === undefined
    ) {

      missingWords++;

      mistakes.push({

        position:
          i + 1,

        expected,

        typed:
          "(missing)",

        type:
          "missing"

      });

      wordAnalysis.push({

        position:
          i + 1,

        expected,

        typed:
          "(missing)",

        status:
          "missing"

      });

      continue;
    }


    /* ---------- EXTRA ---------- */

    if (
      expected === undefined &&
      typed !== undefined
    ) {

      extraWords++;

      mistakes.push({

        position:
          i + 1,

        expected:
          "(none)",

        typed,

        type:
          "extra"

      });

      wordAnalysis.push({

        position:
          i + 1,

        expected:
          "(none)",

        typed,

        status:
          "extra"

      });

    }

  }


  /* =================================================
     ACCURACY
  ================================================= */

  let accuracy = 0;

  if (
    originalWords.length > 0
  ) {

    accuracy =
      (
        correctWords /
        originalWords.length
      ) * 100;

  }

  accuracy =
    Math.max(
      0,
      Math.min(
        100,
        accuracy
      )
    );


  /* =================================================
     WPM
  ================================================= */

  const minutes =
    Math.max(
      practiceElapsedSeconds / 60,
      1 / 60
    );


  const wpm =
    Math.round(
      typedWords.length /
      minutes
    );


  /* =================================================
     CHARACTER STATS
  ================================================= */

  const typedCharacters =
    typedText.length;

  const originalCharacters =
    originalText.length;


  /* =================================================
     RESULT OBJECT
  ================================================= */

  const result = {

    id:
      generateId("R"),

    studentId:
      currentUser?.id ||
      currentUser?.studentId ||
      "unknown",

    matterId:
      currentMatter.id,

    matterTitle:
      currentMatter.title,

    date:
      new Date().toISOString(),

    timeSeconds:
      practiceElapsedSeconds,

    targetWpm:
      Number(
        currentMatter.wpm
      ) || 0,

    typedWords:
      typedWords.length,

    totalWords:
      originalWords.length,

    correctWords,

    wrongWords,

    missingWords,

    extraWords,

    accuracy:
      Number(
        accuracy.toFixed(2)
      ),

    wpm,

    typedCharacters,

    originalCharacters,

    mistakes,

    wordAnalysis

  };


  /* =================================================
     SAVE RESULT ONLY ONCE
  ================================================= */

  savePracticeResultOnce(
    result
  );


  /* =================================================
     SHOW RESULT
  ================================================= */

  showResultScreen(
    result
  );

}


/* =====================================================
   SAVE RESULT WITHOUT DUPLICATION
===================================================== */

function savePracticeResultOnce(result) {

  const results =
    getResults();


  const alreadySaved =
    results.some(
      item =>
        item.id === result.id
    );


  if (
    alreadySaved
  ) {
    return;
  }


  results.unshift(
    result
  );


  setStorage(
    "shorthand_results",
    results
  );

}


/* =====================================================
   RESULT SCREEN
===================================================== */

function showResultScreen(result) {

  hideAllScreens();

  showScreen(
    "resultScreen"
  );


  /* ---------- SUBTITLE ---------- */

  const subtitle =
    document.getElementById(
      "resultSubtitle"
    );

  if (subtitle) {

    subtitle.textContent =
      `${result.matterTitle} • ${formatResultTime(
        result.timeSeconds
      )}`;

  }


  /* ---------- MAIN SCORES ---------- */

  const accuracy =
    document.getElementById(
      "resultAccuracy"
    );

  const wpm =
    document.getElementById(
      "resultWpm"
    );

  const time =
    document.getElementById(
      "resultTime"
    );

  const words =
    document.getElementById(
      "resultWords"
    );


  if (accuracy) {

    accuracy.textContent =
      `${result.accuracy}%`;

  }


  if (wpm) {

    wpm.textContent =
      result.wpm;

  }


  if (time) {

    time.textContent =
      formatResultTime(
        result.timeSeconds
      );

  }


  if (words) {

    words.textContent =
      result.typedWords;

  }


  /* ---------- MISTAKE COUNT ---------- */

  const mistakeCount =
    document.getElementById(
      "mistakeCount"
    );

  if (mistakeCount) {

    mistakeCount.textContent =
      result.mistakes.length;

  }


  /* ---------- RENDER ---------- */

  renderMistakes(
    result
  );

  renderWordAnalysis(
    result
  );

}


/* =====================================================
   MISTAKE ANALYSIS
===================================================== */

function renderMistakes(result) {

  const container =
    document.getElementById(
      "mistakesList"
    );

  if (!container) {
    return;
  }


  if (
    !result.mistakes ||
    !result.mistakes.length
  ) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          🎯
        </div>

        <h3>
          Perfect transcription
        </h3>

        <p>
          No mistakes were detected.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    result.mistakes
      .map(
        mistake => `

          <div class="mistake-item">

            <div class="mistake-position">
              ${mistake.position}
            </div>

            <div class="mistake-content">

              <div>
                <span class="mistake-label">
                  Expected
                </span>

                <strong>
                  ${escapeHtml(
                    mistake.expected
                  )}
                </strong>
              </div>

              <div>
                <span class="mistake-label">
                  Typed
                </span>

                <strong>
                  ${escapeHtml(
                    mistake.typed
                  )}
                </strong>
              </div>

              <div>
                <span class="mistake-label">
                  Type
                </span>

                <strong>
                  ${escapeHtml(
                    mistake.type
                  )}
                </strong>
              </div>

            </div>

          </div>

        `
      )
      .join("");

}


/* =====================================================
   WORD ANALYSIS
===================================================== */

function renderWordAnalysis(result) {

  const container =
    document.getElementById(
      "wordAnalysis"
    );

  if (!container) {
    return;
  }


  if (
    !result.wordAnalysis ||
    !result.wordAnalysis.length
  ) {

    container.innerHTML =
      "<p>No word analysis available.</p>";

    return;

  }


  container.innerHTML = `

    <div class="analysis-list">

      ${result.wordAnalysis
        .map(item => {

          let statusLabel =
            "Correct";


          if (
            item.status ===
            "wrong"
          ) {

            statusLabel =
              "Wrong";

          }


          if (
            item.status ===
            "missing"
          ) {

            statusLabel =
              "Missing";

          }


          if (
            item.status ===
            "extra"
          ) {

            statusLabel =
              "Extra";

          }


          return `

            <div class="analysis-row">

              <span class="analysis-number">
                ${item.position}
              </span>

              <span class="analysis-expected">
                ${escapeHtml(
                  item.expected
                )}
              </span>

              <span class="analysis-typed">
                ${escapeHtml(
                  item.typed
                )}
              </span>

              <span class="analysis-status">
                ${statusLabel}
              </span>

            </div>

          `;

        })
        .join("")}

    </div>

  `;

}


/* =====================================================
   FORMAT RESULT TIME
===================================================== */

function formatResultTime(seconds) {

  const total =
    Math.max(
      0,
      Number(seconds) || 0
    );


  const minutes =
    Math.floor(
      total / 60
    );


  const remaining =
    total % 60;


  return `${String(
    minutes
  ).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;

}


/* =====================================================
   STUDENT DASHBOARD RESULT SUMMARY
===================================================== */

function calculateStudentStats(
  studentId
) {

  const results =
    getResults().filter(
      result =>
        result.studentId ===
        studentId
    );


  if (!results.length) {

    return {

      completed:
        0,

      averageWpm:
        0,

      averageAccuracy:
        0

    };

  }


  const totalWpm =
    results.reduce(
      (sum, result) =>
        sum +
        (Number(result.wpm) || 0),
      0
    );


  const totalAccuracy =
    results.reduce(
      (sum, result) =>
        sum +
        (Number(result.accuracy) || 0),
      0
    );


  return {

    completed:
      results.length,

    averageWpm:
      Math.round(
        totalWpm /
        results.length
      ),

    averageAccuracy:
      Number(
        (
          totalAccuracy /
          results.length
        ).toFixed(2)
      )

  };

}
/* =====================================================
   PART 10 — RESULTS + HISTORY CONNECTION
===================================================== */

function getResultMatter(result) {
  const matters = getMatters();
  return matters.find(m => m.id === result.matterId) || null;
}

function getResultStudent(result) {
  const students = getStudents();
  return students.find(s => s.id === result.studentId) || null;
}


/* =====================================================
   ADMIN DASHBOARD — REAL RESULT STATS
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
    statStudents.textContent = students.filter(s => s.active !== false).length;
  }

  if (statAttempts) {
    statAttempts.textContent = results.length;
  }

  if (statAccuracy) {
    if (results.length) {
      const avgAccuracy =
        results.reduce((sum, r) => sum + Number(r.accuracy || 0), 0) /
        results.length;

      statAccuracy.textContent = avgAccuracy.toFixed(1) + "%";
    } else {
      statAccuracy.textContent = "0%";
    }
  }

  renderRecentMatters();
  renderRecentResults();
}


/* =====================================================
   RECENT MATTERS
===================================================== */

function renderRecentMatters() {
  const container = document.getElementById("recentMatters");
  if (!container) return;

  const matters = getMatters().slice(0, 5);

  if (!matters.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No practice matters available.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matters.map(matter => `
    <div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">
          ${escapeHtml(matter.title || "Untitled Matter")}
        </div>

        <div class="list-item-meta">
          ${Number(matter.wpm || 0)} WPM
          • ${Number(matter.duration || 0)} min
        </div>
      </div>

      <span class="status-badge active">
        ${escapeHtml(matter.id)}
      </span>
    </div>
  `).join("");
}


/* =====================================================
   RECENT RESULTS
===================================================== */

function renderRecentResults() {
  const container = document.getElementById("recentResults");
  if (!container) return;

  const results = [...getResults()]
    .sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })
    .slice(0, 5);

  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>No practice attempts yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(result => {
    const student = getResultStudent(result);
    const matter = getResultMatter(result);

    return `
      <div class="list-item">
        <div class="list-item-main">
          <div class="list-item-title">
            ${escapeHtml(student?.name || "Unknown Student")}
          </div>

          <div class="list-item-meta">
            ${escapeHtml(matter?.title || "Practice")}
            • ${Number(result.wpm || 0)} WPM
          </div>
        </div>

        <span class="status-badge ${
          Number(result.accuracy || 0) >= 90 ? "active" : "pending"
        }">
          ${Number(result.accuracy || 0).toFixed(1)}%
        </span>
      </div>
    `;
  }).join("");
}


/* =====================================================
   STUDENT DASHBOARD — REAL STATS
===================================================== */

function loadStudentDashboard() {
  if (!currentUser) return;

  const student = getStudents().find(s => s.id === currentUser.id);

  if (student) {
    currentUser = student;
  }

  const stats = calculateStudentStats(currentUser.id);

  const nameEl = document.getElementById("studentDisplayName");
  const idEl = document.getElementById("studentDisplayId");
  const completedEl = document.getElementById("studentCompleted");
  const wpmEl = document.getElementById("studentAverageWpm");
  const accuracyEl = document.getElementById("studentAverageAccuracy");

  if (nameEl) {
    nameEl.textContent = currentUser.name || "Student";
  }

  if (idEl) {
    idEl.textContent = currentUser.id || "";
  }

  if (completedEl) {
    completedEl.textContent = stats.completed;
  }

  if (wpmEl) {
    wpmEl.textContent = stats.averageWpm;
  }

  if (accuracyEl) {
    accuracyEl.textContent = stats.averageAccuracy + "%";
  }

  renderStudentMatters();
  renderStudentHistory();
}


/* =====================================================
   STUDENT HISTORY — REAL ATTEMPTS
===================================================== */

function renderStudentHistory() {
  const container = document.getElementById("studentHistory");
  if (!container || !currentUser) return;

  const results = getResults()
    .filter(result => result.studentId === currentUser.id)
    .sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>No practice history yet.</p>
        <span>Complete your first practice to see your results here.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(result => {
    const matter = getResultMatter(result);

    const date = result.createdAt
      ? new Date(result.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "—";

    return `
      <div class="history-item">
        <div class="history-main">
          <div class="history-title">
            ${escapeHtml(matter?.title || "Practice Matter")}
          </div>

          <div class="history-meta">
            ${date}
          </div>
        </div>

        <div class="history-stats">
          <span>
            <strong>${Number(result.wpm || 0)}</strong>
            WPM
          </span>

          <span>
            <strong>${Number(result.accuracy || 0).toFixed(1)}%</strong>
            Accuracy
          </span>

          <span>
            <strong>${Number(result.mistakes?.length || 0)}</strong>
            Mistakes
          </span>
        </div>
      </div>
    `;
  }).join("");
}


/* =====================================================
   ADMIN RESULTS TABLE
===================================================== */

function renderResultsTable() {
  const table = document.getElementById("resultsTable");
  if (!table) return;

  const results = [...getResults()]
    .sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  if (!results.length) {
    table.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>No results available yet.</p>
      </div>
    `;
    return;
  }

  table.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Practice</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>Mistakes</th>
            <th>Time</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          ${results.map(result => {
            const student = getResultStudent(result);
            const matter = getResultMatter(result);

            const date = result.createdAt
              ? new Date(result.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "—";

            return `
              <tr>
                <td>
                  <strong>
                    ${escapeHtml(student?.name || "Unknown")}
                  </strong>
                  <br>
                  <small>
                    ${escapeHtml(student?.id || "—")}
                  </small>
                </td>

                <td>
                  ${escapeHtml(matter?.title || "Practice")}
                </td>

                <td>
                  <strong>${Number(result.wpm || 0)}</strong>
                </td>

                <td>
                  <span class="status-badge ${
                    Number(result.accuracy || 0) >= 90
                      ? "active"
                      : "pending"
                  }">
                    ${Number(result.accuracy || 0).toFixed(1)}%
                  </span>
                </td>

                <td>
                  ${Number(result.mistakes?.length || 0)}
                </td>

                <td>
                  ${formatResultTime(result.timeSeconds || 0)}
                </td>

                <td>
                  ${date}
                </td>

                <td>
                  <button
                    class="table-action-button"
                    onclick="viewAdminResult('${result.id}')"
                  >
                    View
                  </button>
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
   ADMIN RESULT DETAILS
===================================================== */

function viewAdminResult(resultId) {
  const result = getResults().find(r => r.id === resultId);

  if (!result) {
    showToast("Result not found.", "error");
    return;
  }

  const student = getResultStudent(result);
  const matter = getResultMatter(result);

  let modal = document.getElementById("adminResultModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "adminResultModal";
    modal.className = "modal-overlay";

    document.body.appendChild(modal);
  }

  const mistakes = result.mistakes || [];

  modal.innerHTML = `
    <div class="modal-card" style="max-width:850px;">
      <div class="modal-header">
        <div>
          <h3>Practice Result</h3>
          <p style="margin:4px 0 0;color:#6b7280;">
            ${escapeHtml(student?.name || "Unknown Student")}
          </p>
        </div>

        <button
          type="button"
          class="icon-button"
          onclick="closeAdminResultModal()"
        >
          ✕
        </button>
      </div>

      <div class="result-summary" style="margin-top:20px;">
        <div class="result-main-score">
          <span class="result-score-label">Accuracy</span>
          <strong>${Number(result.accuracy || 0).toFixed(1)}%</strong>
        </div>

        <div class="result-metrics">
          <div class="result-metric">
            <span>WPM</span>
            <strong>${Number(result.wpm || 0)}</strong>
          </div>

          <div class="result-metric">
            <span>Time</span>
            <strong>${formatResultTime(result.timeSeconds || 0)}</strong>
          </div>

          <div class="result-metric">
            <span>Words</span>
            <strong>${Number(result.totalWords || 0)}</strong>
          </div>

          <div class="result-metric">
            <span>Mistakes</span>
            <strong>${mistakes.length}</strong>
          </div>
        </div>
      </div>

      <div style="margin-top:24px;">
        <h4>
          ${escapeHtml(matter?.title || "Practice Matter")}
        </h4>

        ${
          mistakes.length
            ? `
              <div style="margin-top:14px;">
                ${mistakes.map((mistake, index) => `
                  <div class="mistake-item">
                    <div class="mistake-number">
                      ${index + 1}
                    </div>

                    <div class="mistake-content">
                      <strong>
                        ${escapeHtml(mistake.type || "Mistake")}
                      </strong>

                      <div class="mistake-text">
                        Expected:
                        <span class="expected-word">
                          ${escapeHtml(mistake.expected || "—")}
                        </span>

                        &nbsp; | &nbsp;

                        Typed:
                        <span class="typed-word">
                          ${escapeHtml(mistake.typed || "—")}
                        </span>
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            `
            : `
              <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <p>Perfect transcription</p>
              </div>
            `
        }
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="secondary-button"
          onclick="closeAdminResultModal()"
        >
          Close
        </button>
      </div>
    </div>
  `;

  modal.classList.add("show");
}

function closeAdminResultModal() {
  const modal = document.getElementById("adminResultModal");

  if (modal) {
    modal.classList.remove("show");
  }
}


/* =====================================================
   RESULTS PAGE AUTO LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  renderResultsTable();

  document.querySelectorAll('[data-admin-page="results"]')
    .forEach(button => {
      button.addEventListener("click", function () {
        setTimeout(function () {
          renderResultsTable();
        }, 50);
      });
    });

});


/* =====================================================
   REFRESH DASHBOARD AFTER RESULT
===================================================== */

function refreshStudentAfterResult() {
  if (
    currentUserType === "student" &&
    currentUser &&
    document.getElementById("studentScreen")
  ) {
    loadStudentDashboard();
  }

  if (currentUserType === "admin") {
    loadAdminDashboard();
    renderResultsTable();
  }
                   }
/* =====================================================
   PART 11 — SUBMIT → RESULT → DASHBOARD FLOW
===================================================== */

/* -----------------------------------------------------
   FINAL RESULT SAVE + DASHBOARD REFRESH
----------------------------------------------------- */

function completePracticeAndShowResult() {
  if (!currentMatter || !currentUser) {
    showToast("Practice session not found.", "error");
    return;
  }

  if (practiceFinished) return;

  practiceFinished = true;
  practiceStarted = false;

  if (practiceTimerInterval) {
    clearInterval(practiceTimerInterval);
    practiceTimerInterval = null;
  }

  const result = calculatePracticeResult();

  if (!result) {
    showToast("Unable to calculate result.", "error");
    return;
  }

  savePracticeResultOnce(result);

  currentPracticeResult = result;

  showResultScreen(result);
}


/* -----------------------------------------------------
   RESULT STATE
----------------------------------------------------- */

let currentPracticeResult = null;


/* -----------------------------------------------------
   SAFE SUBMIT
----------------------------------------------------- */

function submitPracticeSafely() {

  if (!practiceStarted && !practiceFinished) {
    showToast("Start the practice first.", "error");
    return;
  }

  if (practiceFinished) {
    return;
  }

  completePracticeAndShowResult();
}


/* -----------------------------------------------------
   OVERRIDE FINISH PRACTICE
----------------------------------------------------- */

function finishPractice() {
  submitPracticeSafely();
}


/* -----------------------------------------------------
   OVERRIDE AUTO SUBMIT
----------------------------------------------------- */

function autoSubmitPractice() {

  if (practiceFinished) return;

  showToast("Time is over. Practice submitted.", "success");

  completePracticeAndShowResult();
}


/* -----------------------------------------------------
   RESULT SCREEN
----------------------------------------------------- */

function showResultScreen(result) {

  if (!result) {
    result = currentPracticeResult;
  }

  if (!result) {
    showToast("Result not available.", "error");
    return;
  }

  currentPracticeResult = result;

  hideAllScreens();

  const resultScreen = document.getElementById("resultScreen");

  if (!resultScreen) {
    showToast("Result screen not found.", "error");
    return;
  }

  resultScreen.classList.add("active");

  const matter = getResultMatter(result);

  const subtitle = document.getElementById("resultSubtitle");

  if (subtitle) {
    subtitle.textContent =
      (matter?.title || "Practice Matter") +
      " • " +
      (result.targetWpm || matter?.wpm || 0) +
      " WPM";
  }

  const accuracy = document.getElementById("resultAccuracy");
  const wpm = document.getElementById("resultWpm");
  const time = document.getElementById("resultTime");
  const words = document.getElementById("resultWords");
  const mistakeCount = document.getElementById("mistakeCount");

  if (accuracy) {
    accuracy.textContent =
      Number(result.accuracy || 0).toFixed(1) + "%";
  }

  if (wpm) {
    wpm.textContent = Number(result.wpm || 0);
  }

  if (time) {
    time.textContent =
      formatResultTime(result.timeSeconds || 0);
  }

  if (words) {
    words.textContent =
      Number(result.totalWords || 0);
  }

  if (mistakeCount) {
    mistakeCount.textContent =
      Number(result.mistakes?.length || 0);
  }

  renderMistakes(result);
  renderWordAnalysis(result);
}


/* -----------------------------------------------------
   BACK TO STUDENT DASHBOARD
----------------------------------------------------- */

function returnToStudentDashboard() {

  if (!currentUser) {
    logout();
    return;
  }

  currentPracticeResult = null;

  hideAllScreens();

  const studentScreen =
    document.getElementById("studentScreen");

  if (studentScreen) {
    studentScreen.classList.add("active");
  }

  loadStudentDashboard();
}


/* -----------------------------------------------------
   PRACTICE AGAIN
----------------------------------------------------- */

function practiceAgain() {

  if (!currentMatter) {
    showToast("Practice matter not found.", "error");
    return;
  }

  currentPracticeResult = null;

  startPractice(currentMatter.id);
}


/* -----------------------------------------------------
   RESULT BUTTON EVENTS
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function () {

  const backButton =
    document.getElementById("backToDashboard");

  if (backButton) {
    backButton.addEventListener("click", function () {
      returnToStudentDashboard();
    });
  }

  const againButton =
    document.getElementById("practiceAgain");

  if (againButton) {
    againButton.addEventListener("click", function () {
      practiceAgain();
    });
  }

});


/* -----------------------------------------------------
   SAVE RESULT — EXTRA SAFETY
----------------------------------------------------- */

function savePracticeResultOnce(result) {

  if (!result) return;

  const existingResults = getResults();

  const resultId = result.id;

  if (
    resultId &&
    existingResults.some(r => r.id === resultId)
  ) {
    return;
  }

  const newResults = [
    ...existingResults,
    {
      ...result,
      createdAt:
        result.createdAt ||
        new Date().toISOString()
    }
  ];

  setStorage("shorthand_results", newResults);
}


/* -----------------------------------------------------
   STUDENT STATS AFTER RESULT
----------------------------------------------------- */

function updateStudentDashboardStats() {

  if (!currentUser) return;

  const stats =
    calculateStudentStats(currentUser.id);

  const completed =
    document.getElementById("studentCompleted");

  const avgWpm =
    document.getElementById("studentAverageWpm");

  const avgAccuracy =
    document.getElementById("studentAverageAccuracy");

  if (completed) {
    completed.textContent = stats.completed;
  }

  if (avgWpm) {
    avgWpm.textContent = stats.averageWpm;
  }

  if (avgAccuracy) {
    avgAccuracy.textContent =
      stats.averageAccuracy + "%";
  }
}


/* -----------------------------------------------------
   ADMIN STATS AFTER RESULT
----------------------------------------------------- */

function updateAdminDashboardStats() {

  const results = getResults();

  const attempts =
    document.getElementById("statAttempts");

  const accuracy =
    document.getElementById("statAccuracy");

  if (attempts) {
    attempts.textContent = results.length;
  }

  if (accuracy) {

    if (!results.length) {
      accuracy.textContent = "0%";
      return;
    }

    const totalAccuracy =
      results.reduce(
        (sum, result) =>
          sum + Number(result.accuracy || 0),
        0
      );

    accuracy.textContent =
      (totalAccuracy / results.length).toFixed(1) +
      "%";
  }
}


/* -----------------------------------------------------
   REFRESH ALL RESULT DATA
----------------------------------------------------- */

function refreshAllResultData() {

  updateStudentDashboardStats();
  updateAdminDashboardStats();

  renderStudentHistory();
  renderRecentResults();
  renderResultsTable();
}


/* -----------------------------------------------------
   CLOSE RESULT MODAL BY CLICKING OUTSIDE
----------------------------------------------------- */

document.addEventListener("click", function (event) {

  const modal =
    document.getElementById("adminResultModal");

  if (
    modal &&
    event.target === modal
  ) {
    closeAdminResultModal();
  }

});


/* -----------------------------------------------------
   ESC KEY — ONLY FOR MODALS
----------------------------------------------------- */

document.addEventListener("keydown", function (event) {

  if (event.key !== "Escape") return;

  const modal =
    document.getElementById("adminResultModal");

  if (
    modal &&
    modal.classList.contains("show")
  ) {
    closeAdminResultModal();
  }

});


/* =====================================================
   PART 11 COMPLETE
===================================================== */
/* =====================================================
   PART 12 — ADMIN RESULTS SEARCH + FILTER
===================================================== */

let adminResultSearch = "";
let adminResultAccuracyFilter = "all";


/* =====================================================
   RESULTS PAGE HEADER
===================================================== */

function setupAdminResultsTools() {

  const container =
    document.getElementById("resultsTable");

  if (!container) return;

  const oldTools =
    document.getElementById("adminResultsTools");

  if (oldTools) {
    oldTools.remove();
  }

  const tools = document.createElement("div");

  tools.id = "adminResultsTools";

  tools.style.cssText = `
    display:flex;
    gap:12px;
    flex-wrap:wrap;
    margin-bottom:18px;
    align-items:center;
  `;

  tools.innerHTML = `
    <input
      type="text"
      id="adminResultSearch"
      placeholder="Search student or practice..."
      value="${escapeHtml(adminResultSearch)}"
      style="
        flex:1;
        min-width:220px;
        padding:11px 14px;
        border:1px solid #d1d5db;
        border-radius:10px;
        outline:none;
      "
    >

    <select
      id="adminResultAccuracy"
      style="
        padding:11px 14px;
        border:1px solid #d1d5db;
        border-radius:10px;
        background:white;
        outline:none;
      "
    >
      <option value="all">All Accuracy</option>
      <option value="90">90% and above</option>
      <option value="80">80% and above</option>
      <option value="70">70% and above</option>
      <option value="below70">Below 70%</option>
    </select>
  `;

  container.parentNode.insertBefore(tools, container);

  const search =
    document.getElementById("adminResultSearch");

  const accuracy =
    document.getElementById("adminResultAccuracy");

  if (accuracy) {
    accuracy.value = adminResultAccuracyFilter;
  }

  if (search) {
    search.addEventListener("input", function () {

      adminResultSearch =
        this.value.trim().toLowerCase();

      renderFilteredAdminResults();
    });
  }

  if (accuracy) {
    accuracy.addEventListener("change", function () {

      adminResultAccuracyFilter =
        this.value;

      renderFilteredAdminResults();
    });
  }
}


/* =====================================================
   FILTERED RESULTS
===================================================== */

function renderFilteredAdminResults() {

  const container =
    document.getElementById("resultsTable");

  if (!container) return;

  const allResults =
    [...getResults()].sort((a, b) => {
      return new Date(b.createdAt || 0) -
             new Date(a.createdAt || 0);
    });

  const filteredResults =
    allResults.filter(result => {

      const student =
        getResultStudent(result);

      const matter =
        getResultMatter(result);

      const searchText = `
        ${student?.name || ""}
        ${student?.id || ""}
        ${matter?.title || ""}
        ${matter?.id || ""}
      `.toLowerCase();

      const matchesSearch =
        !adminResultSearch ||
        searchText.includes(adminResultSearch);

      const acc =
        Number(result.accuracy || 0);

      let matchesAccuracy = true;

      if (adminResultAccuracyFilter === "90") {
        matchesAccuracy = acc >= 90;
      }

      if (adminResultAccuracyFilter === "80") {
        matchesAccuracy = acc >= 80;
      }

      if (adminResultAccuracyFilter === "70") {
        matchesAccuracy = acc >= 70;
      }

      if (adminResultAccuracyFilter === "below70") {
        matchesAccuracy = acc < 70;
      }

      return matchesSearch && matchesAccuracy;
    });


  if (!filteredResults.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>

        <p>No matching results found.</p>

        <span>
          Try another student, practice or accuracy filter.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML = `
    <div style="overflow-x:auto;">

      <table class="data-table">

        <thead>
          <tr>
            <th>Student</th>
            <th>Practice</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>Mistakes</th>
            <th>Time</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          ${filteredResults.map(result => {

            const student =
              getResultStudent(result);

            const matter =
              getResultMatter(result);

            const date =
              result.createdAt
                ? new Date(result.createdAt)
                    .toLocaleString("en-IN", {
                      day:"2-digit",
                      month:"short",
                      year:"numeric",
                      hour:"2-digit",
                      minute:"2-digit"
                    })
                : "—";

            const accuracy =
              Number(result.accuracy || 0);

            return `
              <tr>

                <td>
                  <strong>
                    ${escapeHtml(
                      student?.name ||
                      "Unknown Student"
                    )}
                  </strong>

                  <br>

                  <small>
                    ${escapeHtml(
                      student?.id || "—"
                    )}
                  </small>
                </td>


                <td>
                  ${escapeHtml(
                    matter?.title ||
                    "Practice Matter"
                  )}
                </td>


                <td>
                  <strong>
                    ${Number(result.wpm || 0)}
                  </strong>
                </td>


                <td>

                  <span class="status-badge ${
                    accuracy >= 90
                      ? "active"
                      : accuracy >= 70
                        ? "pending"
                        : "inactive"
                  }">

                    ${accuracy.toFixed(1)}%

                  </span>

                </td>


                <td>
                  ${Number(
                    result.mistakes?.length || 0
                  )}
                </td>


                <td>
                  ${formatResultTime(
                    result.timeSeconds || 0
                  )}
                </td>


                <td>
                  ${date}
                </td>


                <td>

                  <button
                    class="table-action-button"
                    onclick="
                      viewAdminResult('${result.id}')
                    "
                  >
                    View
                  </button>

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
   OVERRIDE RESULTS TABLE
===================================================== */

function renderResultsTable() {

  setupAdminResultsTools();

  renderFilteredAdminResults();
}


/* =====================================================
   RESULT PAGE NAVIGATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    document
      .querySelectorAll(
        '[data-admin-page="results"]'
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          function () {

            setTimeout(
              function () {
                renderResultsTable();
              },
              100
            );

          }
        );

      });

  }
);


/* =====================================================
   REFRESH FILTERED RESULTS
===================================================== */

function refreshAdminResults() {

  renderResultsTable();

}


/* =====================================================
   RESET RESULT FILTER
===================================================== */

function resetAdminResultFilters() {

  adminResultSearch = "";

  adminResultAccuracyFilter = "all";

  const search =
    document.getElementById(
      "adminResultSearch"
    );

  const accuracy =
    document.getElementById(
      "adminResultAccuracy"
    );

  if (search) {
    search.value = "";
  }

  if (accuracy) {
    accuracy.value = "all";
  }

  renderFilteredAdminResults();

}


/* =====================================================
   PART 12 COMPLETE
===================================================== */
/* =====================================================
   PART 13 — TESTING + STABILITY CHECK
===================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------
     BASIC APP HEALTH CHECK
  --------------------------------------------------- */

  function runPortalHealthCheck() {

    const checks = {
      loginScreen: !!document.getElementById("loginScreen"),
      adminScreen: !!document.getElementById("adminScreen"),
      studentScreen: !!document.getElementById("studentScreen"),
      practiceScreen: !!document.getElementById("practiceScreen"),
      resultScreen: !!document.getElementById("resultScreen"),
      loginForm: !!document.getElementById("loginForm"),
      practiceTypingArea: !!document.getElementById("typingArea"),
      resultTable: !!document.getElementById("resultsTable")
    };

    const failed = Object.keys(checks)
      .filter(key => !checks[key]);

    if (failed.length) {
      console.warn(
        "Portal health check: missing elements:",
        failed
      );
    } else {
      console.log(
        "✅ Portal health check passed."
      );
    }

    return failed.length === 0;
  }


  /* ---------------------------------------------------
     STORAGE CHECK
  --------------------------------------------------- */

  function checkPortalStorage() {

    try {

      const matters = getMatters();
      const students = getStudents();
      const results = getResults();

      console.log(
        "📦 Storage check:",
        {
          matters: matters.length,
          students: students.length,
          results: results.length
        }
      );

      return true;

    } catch (error) {

      console.error(
        "❌ Storage check failed:",
        error
      );

      return false;
    }
  }


  /* ---------------------------------------------------
     DATA VALIDATION
  --------------------------------------------------- */

  function validatePortalData() {

    const matters = getMatters();
    const students = getStudents();
    const results = getResults();

    let problems = 0;


    matters.forEach(matter => {

      if (!matter.id) {
        console.warn(
          "Matter without ID:",
          matter
        );
        problems++;
      }

      if (!matter.title) {
        console.warn(
          "Matter without title:",
          matter
        );
        problems++;
      }

    });


    students.forEach(student => {

      if (!student.id) {
        console.warn(
          "Student without ID:",
          student
        );
        problems++;
      }

      if (!student.username) {
        console.warn(
          "Student without username:",
          student
        );
        problems++;
      }

    });


    results.forEach(result => {

      if (!result.id) {
        console.warn(
          "Result without ID:",
          result
        );
        problems++;
      }

      if (!result.studentId) {
        console.warn(
          "Result without student ID:",
          result
        );
        problems++;
      }

      if (!result.matterId) {
        console.warn(
          "Result without matter ID:",
          result
        );
        problems++;
      }

    });


    if (!problems) {

      console.log(
        "✅ Data validation passed."
      );

    } else {

      console.warn(
        "⚠️ Data validation found",
        problems,
        "problem(s)."
      );

    }

    return problems === 0;
  }


  /* ---------------------------------------------------
     PRACTICE STATE RESET
  --------------------------------------------------- */

  function clearPracticeRuntimeState() {

    if (
      typeof practiceTimerInterval !==
      "undefined" &&
      practiceTimerInterval
    ) {

      clearInterval(
        practiceTimerInterval
      );

      practiceTimerInterval = null;
    }

    if (
      typeof practiceFinished !==
      "undefined"
    ) {
      practiceFinished = false;
    }

    if (
      typeof practiceStarted !==
      "undefined"
    ) {
      practiceStarted = false;
    }

    if (
      typeof practiceElapsedSeconds !==
      "undefined"
    ) {
      practiceElapsedSeconds = 0;
    }

    if (
      typeof practiceStartTime !==
      "undefined"
    ) {
      practiceStartTime = null;
    }

  }


  /* ---------------------------------------------------
     GLOBAL ERROR MONITOR
  --------------------------------------------------- */

  window.addEventListener(
    "error",
    function (event) {

      console.error(
        "❌ Portal JavaScript error:",
        event.error || event.message
      );

    }
  );


  /* ---------------------------------------------------
     UNHANDLED PROMISE MONITOR
  --------------------------------------------------- */

  window.addEventListener(
    "unhandledrejection",
    function (event) {

      console.error(
        "❌ Unhandled portal error:",
        event.reason
      );

    }
  );


  /* ---------------------------------------------------
     TEST COMMANDS
  --------------------------------------------------- */

  window.portalTest = {

    health: function () {
      return runPortalHealthCheck();
    },

    storage: function () {
      return checkPortalStorage();
    },

    data: function () {
      return validatePortalData();
    },

    all: function () {

      console.log(
        "================================"
      );

      console.log(
        "SHORTHAND PORTAL TEST"
      );

      console.log(
        "================================"
      );

      const health =
        runPortalHealthCheck();

      const storage =
        checkPortalStorage();

      const data =
        validatePortalData();

      console.log(
        "--------------------------------"
      );

      console.log(
        "Health:",
        health ? "PASS" : "FAIL"
      );

      console.log(
        "Storage:",
        storage ? "PASS" : "FAIL"
      );

      console.log(
        "Data:",
        data ? "PASS" : "CHECK"
      );

      console.log(
        "================================"
      );

      return {
        health,
        storage,
        data
      };
    },

    clearPracticeState:
      function () {

        clearPracticeRuntimeState();

        console.log(
          "✅ Practice runtime state cleared."
        );

      }

  };


  /* ---------------------------------------------------
     START TEST AFTER PAGE LOAD
  --------------------------------------------------- */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      setTimeout(
        function () {

          runPortalHealthCheck();
          checkPortalStorage();
          validatePortalData();

        },
        500
      );

    }
  );

})();

/* =====================================================
   PART 13 COMPLETE
===================================================== */
