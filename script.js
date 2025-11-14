// Request notification permission when page loads
window.addEventListener('load', () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Load saved data
    loadTasks();
    loadAssignments();
    checkReminders();
    
    // Check reminders every minute
    setInterval(checkReminders, 60000);
});

// Load tasks from storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span onclick="toggleComplete(this)" class="${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Load assignments from storage
function loadAssignments() {
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const assignmentList = document.getElementById('assignmentList');
    assignmentList.innerHTML = '';
    
    assignments.forEach((assignment, index) => {
        const li = document.createElement('li');
        let reminderText = assignment.reminderTime ? ` 🔔 ${assignment.reminderTime}` : '';
        
        li.innerHTML = `
            <span><strong>${assignment.name}</strong> - Due: ${assignment.dueDate}${reminderText}</span>
            <button class="delete-btn" onclick="deleteAssignment(${index})">Delete</button>
        `;
        assignmentList.appendChild(li);
    });
}

// Add a task
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    // Get existing tasks
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push({ text: taskText, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    input.value = '';
    loadTasks();
}

// Delete a task
function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Add an assignment with notification reminder
function addAssignment() {
    const assignmentInput = document.getElementById('assignmentInput');
    const dueDateInput = document.getElementById('dueDate');
    const reminderTimeInput = document.getElementById('reminderTime');
    
    const assignmentText = assignmentInput.value.trim();
    const dueDate = dueDateInput.value;
    const reminderTime = reminderTimeInput.value;
    
    if (assignmentText === '' || dueDate === '') {
        alert('Please enter both assignment name and due date!');
        return;
    }
    
    // Get existing assignments
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    
    const newAssignment = {
        name: assignmentText,
        dueDate: dueDate,
        reminderTime: reminderTime || null,
        notified: false,
        id: Date.now()
    };
    
    assignments.push(newAssignment);
    localStorage.setItem('assignments', JSON.stringify(assignments));
    
    if (reminderTime) {
        const reminderDateTime = new Date(`${dueDate}T${reminderTime}`);
        alert(`✅ Assignment added!\n\nReminder set for ${reminderDateTime.toLocaleString()}\n\nYou'll get a notification when you have this page open around that time!`);
    }
    
    assignmentInput.value = '';
    dueDateInput.value = '';
    reminderTimeInput.value = '';
    loadAssignments();
}

// Delete an assignment
function deleteAssignment(index) {
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    assignments.splice(index, 1);
    localStorage.setItem('assignments', JSON.stringify(assignments));
    loadAssignments();
}

// Check for reminders that should fire
function checkReminders() {
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const now = new Date();
    let updated = false;
    
    assignments.forEach(assignment => {
        if (assignment.reminderTime && !assignment.notified) {
            const reminderDateTime = new Date(`${assignment.dueDate}T${assignment.reminderTime}`);
            const timeDiff = reminderDateTime - now;
            
            // If reminder time is within the last minute or upcoming minute
            if (timeDiff <= 60000 && timeDiff >= -60000) {
                sendNotification(assignment);
                assignment.notified = true;
                updated = true;
            }
        }
    });
    
    if (updated) {
        localStorage.setItem('assignments', JSON.stringify(assignments));
    }
}

// Send a notification
function sendNotification(assignment) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('📚 Assignment Reminder!', {
            body: `Don't forget: ${assignment.name} is due on ${assignment.dueDate}!`,
            requireInteraction: true,
            icon: '📚'
        });
        
        playNotificationSound();
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
    }
}

// Play a simple beep sound
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Could not play sound:', e);
    }
}

// Toggle task completion
function toggleComplete(element) {
    element.classList.toggle('completed');
    
    // Save the updated completion status
    const taskList = document.getElementById('taskList');
    const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        const span = li.querySelector('span');
        tasks.push({
            text: span.textContent,
            completed: span.classList.contains('completed')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Delete an item (generic - kept for backwards compatibility)
function deleteItem(button) {
    const li = button.parentElement;
    li.remove();
}
