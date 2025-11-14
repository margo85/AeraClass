// Add a task
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.innerHTML = `
        <span onclick="toggleComplete(this)">${taskText}</span>
        <button class="delete-btn" onclick="deleteItem(this)">Delete</button>
    `;
    taskList.appendChild(li);
    input.value = '';
}
// Add an assignment
function addAssignment() {
    const assignmentInput = document.getElementById('assignmentInput');
    const dueDateInput = document.getElementById('dueDate');
    
    const assignmentText = assignmentInput.value.trim();
    const dueDate = dueDateInput.value;
    
    if (assignmentText === '' || dueDate === '') {
        alert('Please enter both assignment name and due date!');
        return;
    }
    const assignmentList = document.getElementById('assignmentList');
    const li = document.createElement('li');
    
    li.innerHTML = `
        <span><strong>${assignmentText}</strong> - Due: ${dueDate}</span>
        <button class="delete-btn" onclick="deleteItem(this)">Delete</button>
    `;
    assignmentList.appendChild(li);
    assignmentInput.value = '';
    dueDateInput.value = '';
}
// Toggle task completion
function toggleComplete(element) {
    element.classList.toggle('completed');
}

// Delete an item
function deleteItem(button) {
    const li = button.parentElement;
    li.remove();
}
