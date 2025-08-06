// Get all the necessary HTML elements
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

// Function to save tasks to local storage
const saveTasks = () => {
    // Get all the list items (tasks)
    const tasks = taskList.querySelectorAll('li');
    // Map them to an array of text content
    const tasksArray = Array.from(tasks).map(task => task.firstChild.textContent);
    // Save the array as a JSON string in local storage
    localStorage.setItem('tasks', JSON.stringify(tasksArray));
};

// Function to load tasks from local storage
const loadTasks = () => {
    // Get the tasks from local storage
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    // If there are tasks, loop through them and add them to the list
    if (tasks) {
        tasks.forEach(taskText => {
            createTaskElement(taskText);
        });
    }
};

// Function to create a new task element and append it to the list
const createTaskElement = (taskText) => {
    // Create a new list item
    const listItem = document.createElement('li');
    // Create a text node for the task
    const taskTextNode = document.createTextNode(taskText);
    // Append the text to the list item
    listItem.appendChild(taskTextNode);

    // Create a delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    // Add a click event listener to the delete button
    deleteButton.addEventListener('click', () => {
        // Remove the parent list item when the button is clicked
        taskList.removeChild(listItem);
        // Save the updated list to local storage
        saveTasks();
    });

    // Append the delete button to the list item
    listItem.appendChild(deleteButton);
    // Append the new list item to the main task list
    taskList.appendChild(listItem);
};

// Function to add a new task
const addTask = () => {
    // Get the value from the input field and trim whitespace
    const taskText = taskInput.value.trim();
    // Check if the input is not empty
    if (taskText !== '') {
        // Create the task element
        createTaskElement(taskText);
        // Clear the input field
        taskInput.value = '';
        // Save the updated list to local storage
        saveTasks();
    }
};

// Add a click event listener to the "Add" button
addButton.addEventListener('click', addTask);

// Add a keypress event listener to the input field
// This lets us add a task by pressing the "Enter" key
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Load tasks from local storage when the page first loads
loadTasks();