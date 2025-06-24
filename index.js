"use strict";


const STORAGE_KEY = "study_progress_adhab_app";

let state = {
    selectedSubject: null,
    selectedTopicIndex: 0,
    progress: {}, // { subject: { topicIndex: true/false } }
    checklistMode: false,
};

const sidebar = document.getElementById("sidebar");
const topicTabs = document.getElementById("topic-tabs");
const contentArea = document.getElementById("content-area");
const currentSubjectTitle = document.getElementById("current-subject");
const checklistTab = document.getElementById("checklist-tab");

// Initialize app
function init() {
    loadProgress();
    renderSubjectTabs();
    bindEvents();
    if (Object.keys(data).length > 0) {
        const firstSubject = Object.keys(data)[0];
        selectSubject(firstSubject);
    }
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            state.progress = JSON.parse(saved);
        } catch {
            state.progress = {};
        }
    }
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

// Render subject tabs
function renderSubjectTabs() {
    sidebar.innerHTML = "";
    Object.keys(data).forEach((subject) => {
        const tab = document.createElement("div");
        tab.className = "subject-tab";
        tab.textContent = subject;
        tab.dataset.subject = subject;
        tab.dataset.abbr = ""/*subject.length > 3 ? subject.slice(0, 3) + "…" : subject*/;

        // Add green marker if all topics are done
        if (isSubjectCompleted(subject)) {
            const marker = document.createElement("span");
            marker.className = "marker";
            tab.appendChild(marker);
        }

        if (state.selectedSubject === subject && !state.checklistMode) {
            tab.classList.add("active");
        }

        sidebar.appendChild(tab);
    });

    if (state.checklistMode) checklistTab.classList.add("active");
    else checklistTab.classList.remove("active");
}


// Render topic tabs for selected subject
function renderTopicTabs() {
    topicTabs.innerHTML = "";
    if (!state.selectedSubject || state.checklistMode) return;
    const topics = data[state.selectedSubject];
    topics.forEach((topicObj, i) => {
        const tab = document.createElement("div");
        tab.className = "topic-tab";
        tab.textContent = topicObj.topic;
        tab.dataset.topicIndex = i;

        // Add green marker if topic is done
        if (isTopicChecked(state.selectedSubject, i)) {
            const marker = document.createElement("span");
            marker.className = "marker";
            tab.appendChild(marker);
        }

        if (i === state.selectedTopicIndex) tab.classList.add("active");
        topicTabs.appendChild(tab);
    });
}


// Render content with fade animation
function renderContent() {
    if (state.checklistMode) {
        renderChecklistContent();
        return;
    }
    if (!state.selectedSubject) {
        contentArea.innerHTML = "<p>اختر مادة ثم موضوع لعرض المحتوى.</p>";
        return;
    }

    const topics = data[state.selectedSubject];
    if (!topics || topics.length === 0) {
        contentArea.innerHTML = "<p>لا يوجد محتوى لهذه المادة.</p>";
        return;
    }

    const topicObj = topics[state.selectedTopicIndex];
    if (!topicObj) {
        contentArea.innerHTML = "<p>الموضوع غير متوفر.</p>";
        return;
    }

    // Start fast fade + slide out
    contentArea.classList.remove("content-visible");
    contentArea.classList.add("content-animating");

    setTimeout(() => {
        contentArea.innerHTML = topicObj.content + checklistCheckboxHTML();
        bindCheckbox();

        // Force reflow to reset animation
        void contentArea.offsetWidth;

        contentArea.classList.remove("content-animating");
        contentArea.classList.add("content-visible");
    }, 150); // Matches transition time
}



// Checklist checkbox HTML below content
function checklistCheckboxHTML() {
    const checked = isTopicChecked(state.selectedSubject, state.selectedTopicIndex)
        ? "checked"
        : "";
    return `
    <div style="margin-top:1.5rem; display:flex; align-items:center; gap:12px; user-select:none;">
      <input type="checkbox" id="topic-done-checkbox" ${checked} />
      <label for="topic-done-checkbox" style="font-weight:700; color:#ff9f1c; cursor:pointer;">تم دراسة هذا الموضوع</label>
    </div>
  `;
}

// Bind single checkbox under content
function bindCheckbox() {
    const cb = document.getElementById("topic-done-checkbox");
    if (!cb) return;
    cb.addEventListener("change", (e) => {
        setTopicChecked(state.selectedSubject, state.selectedTopicIndex, e.target.checked);
    });
}

// Set topic checked state and save
function setTopicChecked(subject, topicIndex, checked) {
    if (!state.progress[subject]) state.progress[subject] = {};
    state.progress[subject][topicIndex] = checked;
    saveProgress();
    renderSubjectTabs();  // Refresh markers
    renderTopicTabs();    // Refresh topic markers
}


// Check if topic is checked
function isTopicChecked(subject, topicIndex) {
    return !!(state.progress[subject] && state.progress[subject][topicIndex]);
}

function isSubjectCompleted(subject) {
    const topics = data[subject];
    if (!topics) return false;

    return topics.every((_, i) => isTopicChecked(subject, i));
}


// Bind events to sidebar and topic tabs
function bindEvents() {
    // Subject tabs click
    sidebar.addEventListener("click", (e) => {
        if (!e.target.classList.contains("subject-tab")) return;

        const subject = e.target.dataset.subject;
        if (subject === state.selectedSubject) return; // same subject
        selectSubject(subject);
    });

    // Topic tabs click
    topicTabs.addEventListener("click", (e) => {
        if (!e.target.classList.contains("topic-tab")) return;
        if (state.checklistMode) return;

        const idx = Number(e.target.dataset.topicIndex);
        if (idx === state.selectedTopicIndex) return;
        selectTopic(idx);
    });

    // Checklist tab click
    checklistTab.addEventListener("click", () => {
        if (state.checklistMode) return;
        activateChecklistMode();
    });
}


// Select subject
function selectSubject(subject) {
    state.selectedSubject = subject;
    state.selectedTopicIndex = 0;
    state.checklistMode = false;

    renderSubjectTabs();
    renderTopicTabs();
    currentSubjectTitle.textContent = subject;
    renderContent();

    checklistTab.classList.remove("active");

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');  // <-- remove overlay here
    }
}



// Select topic
function selectTopic(topicIndex) {
    state.selectedTopicIndex = topicIndex;
    renderTopicTabs();
    renderContent();
}

// Activate checklist mode
function activateChecklistMode() {
    state.checklistMode = true;
    currentSubjectTitle.textContent = "قائمة التحقق من الدراسة";
    renderSubjectTabs();
    topicTabs.innerHTML = "";
    checklistTab.classList.add("active");
    renderChecklistContent();
}

// Render checklist content with collapsible subjects
function renderChecklistContent() {
    let html = `<h2>قائمة التحقق من كل المواضيع</h2>`;
    html += `<div id="checklist-container">`;

    for (const subject in data) {
        const topics = data[subject];
        html += `
      <div class="checklist-subject" data-subject="${subject}">
        <button type="button" aria-expanded="false" aria-controls="list-${subject}">${subject} ▼</button>
        <ul id="list-${subject}" role="region" hidden>
    `;

        topics.forEach((topicObj, i) => {
            const checked = isTopicChecked(subject, i) ? "checked" : "";
            html += `
        <li>
          <input type="checkbox" id="chk-${subject}-${i}" data-subject="${subject}" data-topic-index="${i}" ${checked} />
          <label for="chk-${subject}-${i}">${topicObj.topic}</label>
        </li>
      `;
        });

        html += `</ul></div>`;
    }

    html += "</div>";
    contentArea.innerHTML = html;

    // Bind checklist checkboxes
    const checkboxes = contentArea.querySelectorAll(
        "#checklist-container input[type=checkbox]"
    );
    checkboxes.forEach((cb) => {
        cb.addEventListener("change", (e) => {
            const target = e.target;
            const subject = target.dataset.subject;
            const topicIndex = Number(target.dataset.topicIndex);
            setTopicChecked(subject, topicIndex, target.checked);
        });
    });

    // Bind collapsible subjects
    const subjects = contentArea.querySelectorAll(".checklist-subject > button");
    subjects.forEach((btn) => {
        btn.addEventListener("click", () => {
            const parent = btn.parentElement;
            const list = parent.querySelector("ul");
            const expanded = btn.getAttribute("aria-expanded") === "true";
            if (expanded) {
                btn.setAttribute("aria-expanded", "false");
                list.hidden = true;
                parent.classList.remove("expanded");
            } else {
                btn.setAttribute("aria-expanded", "true");
                list.hidden = false;
                parent.classList.add("expanded");
            }
        });
    });
}

// Sidebar toggle
const menuToggle = document.getElementById("menu-toggle");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
});


overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
});


// Initialize app
init();