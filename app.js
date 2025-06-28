if (localStorage.getItem('version') != '1.2.1') {
    alert('v1.2.1\n-Feeziya added\n-Major patches\n-Code refactorization\n-Design update\n-Sidetabs updated\n-Mobile responsive\n-Translation issues fixed');
    localStorage.setItem('version', '1.2.1');
}

// DOM Elements
const sidebar = document.getElementById('sidebar');
const subjectTabs = document.getElementById('subjectTabs');
const contentArea = document.getElementById('contentArea');
const subjectTitle = document.getElementById('subjectTitle');
const topicTitle = document.getElementById('topicTitle');
const contentText = document.getElementById('contentText');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');
const checklistToggle = document.getElementById('checklistToggle');
const checklistPanel = document.getElementById('checklistPanel');
const closeChecklist = document.getElementById('closeChecklist');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const checklistContent = document.getElementById('checklistContent');
const mobileTabs = document.getElementById('mobileTabs');

// Translation Button
const translateBtn = document.createElement('button');
translateBtn.className = 'translate-btn';
translateBtn.innerHTML = '<i class="fas fa-language"></i> <span>English</span>';
translateBtn.style.position = 'fixed';
translateBtn.style.bottom = '20px';
translateBtn.style.right = '20px';
translateBtn.style.zIndex = '1000';
translateBtn.style.padding = '10px 15px';
translateBtn.style.backgroundColor = 'var(--primary-color)';
translateBtn.style.color = 'white';
translateBtn.style.border = 'none';
translateBtn.style.borderRadius = 'var(--border-radius)';
translateBtn.style.cursor = 'pointer';
translateBtn.style.boxShadow = 'var(--box-shadow)';
document.body.appendChild(translateBtn);

// Theme toggle button
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
themeToggle.style.position = 'fixed';
themeToggle.style.bottom = '70px';
themeToggle.style.right = '20px';
themeToggle.style.zIndex = '1000';
themeToggle.style.padding = '10px';
themeToggle.style.width = '40px';
themeToggle.style.height = '40px';
themeToggle.style.borderRadius = '50%';
themeToggle.style.backgroundColor = 'var(--primary-color)';
themeToggle.style.color = 'white';
themeToggle.style.border = 'none';
themeToggle.style.cursor = 'pointer';
themeToggle.style.boxShadow = 'var(--box-shadow)';
document.body.appendChild(themeToggle);

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('darkTheme', isDark);
});

// Check for saved theme preference
if (localStorage.getItem('darkTheme') === 'true') {
  document.body.classList.add('dark-theme');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// subject names
const subjectNames = {
    "Adab": {
        en: "Literature",
        ar: "الأدب"
    },
    "Feeziya": {
        en: "Physics",
        ar: "الفيزياء"
    }
};

// State
let currentSubject = null;
let currentTopicIndex = null;
let isTranslated = false;
const completionStatus = JSON.parse(localStorage.getItem('completionStatus')) || {};

// Initialize the app
function initApp() {
    renderSubjectTabs();
    loadFirstSubject();
    setupEventListeners();
    updateProgress();
    
    translateBtn.addEventListener('click', toggleTranslation);
}

// Render subject tabs in the sidebar
function renderSubjectTabs() {
    subjectTabs.innerHTML = '';
    
    Object.keys(data).forEach(subject => {
        const subjectTab = document.createElement('div');
        subjectTab.className = 'subject-tab';
        
        const subjectHeader = document.createElement('div');
        subjectHeader.className = 'subject-header';
        subjectHeader.innerHTML = `
            <span>${getDisplaySubjectName(subject)}</span>
            <i class="fas fa-chevron-down"></i>
        `;
        
        const topicContainer = document.createElement('div');
        topicContainer.className = 'topic-container';
        topicContainer.style.display = 'none';
        
        // Add topics if they exist
        if (data[subject] && data[subject].length > 0) {
            data[subject].forEach((topic, index) => {
                const topicTab = document.createElement('div');
                topicTab.className = 'topic-tab';
                topicTab.textContent = getDisplayTopicName(subject, index);
                topicTab.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadTopic(subject, index);
                });
                topicContainer.appendChild(topicTab);
            });
        }
        
        subjectHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = subjectTab.classList.contains('active');
            
            // Collapse all other subject tabs
            document.querySelectorAll('.subject-tab').forEach(tab => {
                if (tab !== subjectTab) {
                    tab.classList.remove('active');
                    tab.querySelector('.topic-container').style.display = 'none';
                    const chevron = tab.querySelector('.fa-chevron-down');
                    if (chevron) {
                        chevron.classList.remove('fa-chevron-up');
                    }
                }
            });
            
            // Toggle current subject
            subjectTab.classList.toggle('active', !wasActive);
            topicContainer.style.display = wasActive ? 'none' : 'block';
            const icon = subjectHeader.querySelector('i');
            icon.classList.toggle('fa-chevron-up', !wasActive);
            icon.classList.toggle('fa-chevron-down', wasActive);
        });
        
        subjectTab.appendChild(subjectHeader);
        subjectTab.appendChild(topicContainer);
        subjectTabs.appendChild(subjectTab);
    });
}

// Helper functions for translation
/*function getDisplaySubjectName(subject) {
    return isTranslated ? (translation[subject] ? Object.keys(translation).find(key => key === subject) : subject) : subject;
}*/

function getDisplayTopicName(subject, index) {
    if (isTranslated && translation[subject] && translation[subject][index]) {
        return translation[subject][index].topic;
    }
    return data[subject][index].topic;
}

// Load the first subject by default
function loadFirstSubject() {
    const firstSubject = Object.keys(data)[0];
    if (firstSubject) {
        loadSubject(firstSubject);
    }
}

// Load a subject
function loadSubject(subject) {
    currentSubject = subject;

    subjectTitle.textContent = getDisplaySubjectName(subject);
    
    // Update active subject tab
    document.querySelectorAll('.subject-tab').forEach(tab => {
        const tabSubject = tab.querySelector('.subject-header span').textContent;
        tab.classList.toggle('active-tab', getOriginalSubjectName(tabSubject) === subject);
    });
    
    // Update content area
    subjectTitle.textContent = getDisplaySubjectName(subject);
    
    // Load the first topic of the subject if available
    if (data[subject] && data[subject].length > 0) {
        loadTopic(subject, 0);
    }
    
    // Update mobile tabs
    updateMobileTabs(subject);
}

// Get original subject name from display name
function getOriginalSubjectName(displayName) {
    if (isTranslated) {
        return Object.keys(data).find(key => {
            return translation[key] ? Object.keys(translation).find(tKey => tKey === key) === displayName : key === displayName;
        }) || displayName;
    }
    return displayName;
}

// Load a specific topic
function loadTopic(subject, topicIndex) {
    if (!data[subject] || !data[subject][topicIndex]) return;
    
    const topic = data[subject][topicIndex];
    currentTopicIndex = topicIndex;
    const topicId = `${subject}-${topicIndex}`;
    
    // Update active topic tab
    document.querySelectorAll('.topic-tab').forEach((tab, index) => {
        tab.classList.toggle('active', index === topicIndex);
    });
    
    // Update content area
    topicTitle.textContent = getDisplayTopicName(subject, topicIndex);
    
    // Get the appropriate content based on translation state
    const currentContent = isTranslated && translation[subject] && translation[subject][topicIndex] ? 
        translation[subject][topicIndex].content : 
        topic.content;
    

    contentText.innerHTML = formatContent(currentContent) || '<p>No content available for this topic.</p>';
    
    // Store original and translated content
    contentText.dataset.originalContent = formatContent(topic.content);
    contentText.dataset.translatedContent = translation[subject] && translation[subject][topicIndex] ? 
        formatContent(translation[subject][topicIndex].content) : 
        formatContent(topic.content);
    
    // Set content direction and alignment
    contentText.style.direction = isTranslated ? 'ltr' : 'rtl';
    contentText.style.textAlign = isTranslated ? 'left' : 'right';
    
    // Mark as visited
    if (!completionStatus[topicId]) {
        completionStatus[topicId] = { visited: true, completed: false };
        localStorage.setItem('completionStatus', JSON.stringify(completionStatus));
        updateProgress();
    }
    
    // Add fade-in animation
    contentText.classList.add('fade-in');
    setTimeout(() => contentText.classList.remove('fade-in'), 500);
    
    subjectTitle.textContent = getDisplaySubjectName(subject);
    currentSubject = subject;

    // Update mobile tabs
    updateMobileTabs(subject, topicIndex);
}

// Toggle between original and translated content
function toggleTranslation() {
    isTranslated = !isTranslated;
    
    // Update button text
    translateBtn.querySelector('span').textContent = isTranslated ? 'العربية' : 'English';
    
    // Re-render all UI elements with the correct language
    renderSubjectTabs();
    
    // Reload current topic if one is selected
    if (currentSubject !== null && currentTopicIndex !== null) {
        loadTopic(currentSubject, currentTopicIndex);
    }
    
    // Update checklist
    renderChecklist();
}

// Format content based on its structure
function formatContent(content) {
    if (!content) return '';
    
    let formattedContent = '';
    const qPrefix = isTranslated ? 'Q:' : 'س:';
    
    if (Array.isArray(content)) {
        content.forEach(item => {
            if (item.question && item.answer) {
                formattedContent += `
                    <div class="question"><strong>${qPrefix}</strong> ${item.question}</div>
                    <div class="answer">${item.answer}</div>
                `;
            }
        });
    } else if (typeof content === 'object' && content.question && content.answer) {
        formattedContent = `
            <div class="question"><strong>${qPrefix}</strong> ${content.question}</div>
            <div class="answer">${content.answer}</div>
        `;
    } else if (typeof content === 'string') {
        formattedContent = content;
    }
    
    return formattedContent;
}

// Update mobile tabs
function updateMobileTabs(subject, activeIndex = 0) {
    mobileTabs.innerHTML = '';
    
    if (!data[subject]) return;
    
    data[subject].forEach((topic, index) => {
        const tab = document.createElement('div');
        tab.className = `mobile-tab ${index === activeIndex ? 'active' : ''}`;
        tab.textContent = getDisplayTopicName(subject, index);
        tab.addEventListener('click', () => loadTopic(subject, index));
        mobileTabs.appendChild(tab);
    });
}

// Update progress bar and checklist
function updateProgress() {
    const allTopics = getAllTopics();
    const totalTopics = allTopics.length;
    const completedTopics = allTopics.filter(topic => completionStatus[topic]?.completed).length;
    const visitedTopics = allTopics.filter(topic => completionStatus[topic]?.visited).length;
    
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const visitedPercentage = totalTopics > 0 ? Math.round((visitedTopics / totalTopics) * 100) : 0;
    
    progressFill.style.width = `${completionPercentage}%`;
    progressText.textContent = isTranslated ? 
        `${completionPercentage}% completed (${visitedPercentage}% visited)` :
        `${completionPercentage}% مكتمل (${visitedPercentage}% تمت زيارتها)`;
    
    renderChecklist();
}

// Get all topics across all subjects
function getAllTopics() {
    let topics = [];
    Object.keys(data).forEach(subject => {
        if (data[subject]) {
            data[subject].forEach((_, index) => {
                topics.push(`${subject}-${index}`);
            });
        }
    });
    return topics;
}

// Render the checklist
function renderChecklist() {
    checklistContent.innerHTML = '';
    
    Object.keys(data).forEach(subject => {
        if (!data[subject]) return;
        
        const subjectChecklist = document.createElement('div');
        subjectChecklist.className = 'subject-checklist active';
        
        const subjectTitle = document.createElement('div');
        subjectTitle.className = 'subject-checklist-title';
        subjectTitle.innerHTML = `
            <span>${getDisplaySubjectName(subject)}</span>
            <i class="fas fa-chevron-down"></i>
        `;
        
        const topicList = document.createElement('div');
        topicList.className = 'topic-checklist';
        
        data[subject].forEach((topic, index) => {
            const topicId = `${subject}-${index}`;
            const isCompleted = completionStatus[topicId]?.completed || false;
            
            const checklistItem = document.createElement('div');
            checklistItem.className = `checklist-item ${isCompleted ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `check-${topicId}`;
            checkbox.checked = isCompleted;
            checkbox.addEventListener('change', (e) => {
                if (!completionStatus[topicId]) {
                    completionStatus[topicId] = { visited: true, completed: e.target.checked };
                } else {
                    completionStatus[topicId].completed = e.target.checked;
                }
                localStorage.setItem('completionStatus', JSON.stringify(completionStatus));
                checklistItem.classList.toggle('completed', e.target.checked);
                updateProgress();
            });
            
            const label = document.createElement('label');
            label.htmlFor = `check-${topicId}`;
            label.textContent = getDisplayTopicName(subject, index);
            
            checklistItem.appendChild(checkbox);
            checklistItem.appendChild(label);
            topicList.appendChild(checklistItem);
        });
        
        subjectTitle.addEventListener('click', () => {
            subjectChecklist.classList.toggle('active');
            subjectTitle.classList.toggle('collapsed');
        });
        
        subjectChecklist.appendChild(subjectTitle);
        subjectChecklist.appendChild(topicList);
        checklistContent.appendChild(subjectChecklist);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Menu toggle for mobile
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    // Overlay click to close sidebar
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Checklist toggle
    checklistToggle.addEventListener('click', () => {
        checklistPanel.classList.add('active');
        overlay.classList.add('active');
    });
    
    closeChecklist.addEventListener('click', () => {
        checklistPanel.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    overlay.addEventListener('click', () => {
        checklistPanel.classList.remove('active');
        overlay.classList.remove('active');
    });
}


function getDisplaySubjectName(subject) {
    return subjectNames[subject] 
        ? (isTranslated ? subjectNames[subject].en : subjectNames[subject].ar)
        : subject;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);