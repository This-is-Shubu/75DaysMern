// Sample data for our tasks. In a real app, this would come from a database.
const tasksData = [
    {
        id: 1,
        title: "Research content ideas",
        list: null,
        subtasks: [],
        dueDate: null,
        description: "Brainstorm new topics for the blog.",
        tags: []
    },
    {
        id: 2,
        title: "Create a database of guest authors",
        list: null,
        subtasks: [],
        dueDate: null,
        description: "Compile a list of potential guest writers and their contact info.",
        tags: []
    },
    {
        id: 3,
        title: "Renew driver's license",
        list: "Personal",
        subtasks: ["Gather required documents", "Schedule an appointment"],
        dueDate: "2022-11-05",
        description: "Check the expiration date and renew my driver's license online or at the DMV.",
        tags: ["Tag 1"]
    },
    {
        id: 4,
        title: "Consult accountant",
        list: "List 1",
        subtasks: ["Prepare tax documents", "Schedule call with accountant"],
        dueDate: null,
        description: "Discuss quarterly finances and tax planning.",
        tags: []
    },
    {
        id: 5,
        title: "Print business card",
        list: null,
        subtasks: [],
        dueDate: null,
        description: "Order new business cards with updated contact information.",
        tags: []
    }
];

// Get all necessary elements from the DOM
const tasksListContainer = document.querySelector('.tasks-list');
const rightPanel = document.querySelector('.right-panel');

// Function to render the task list from the data
const renderTasks = () => {
    // Clear the current task list (except for the "Add New Task" item)
    const addtaskItem = document.querySelector('.add-task-item');
    tasksListContainer.innerHTML = '';
    tasksListContainer.appendChild(addtaskItem);

    tasksData.forEach(task => {
        // Create the HTML for each task item
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        if (task.id === 3) { // Hard-coding the active task for now
            taskItem.classList.add('active-task');
        }
        taskItem.dataset.id = task.id; // Store the task's ID

        taskItem.innerHTML = `
            ${task.title}
            <div class="task-meta">
                ${task.dueDate ? `<span>Due: ${task.dueDate}</span>` : ''}
                ${task.list ? `<span class="tag ${task.list.toLowerCase()}-tag">${task.list}</span>` : ''}
                ${task.subtasks.length > 0 ? `<span>${task.subtasks.length} Subtasks</span>` : ''}
            </div>
        `;
        tasksListContainer.appendChild(taskItem);
    });
};

// Function to populate the right panel with selected task data
const populateRightPanel = (taskId) => {
    const task = tasksData.find(t => t.id == taskId);

    if (task) {
        document.getElementById('task-title').textContent = task.title;
        // In a real application, you would populate all other fields here
        // For now, let's just update the title
    }
};

// Add event listener to the task list container
tasksListContainer.addEventListener('click', (event) => {
    const taskItem = event.target.closest('.task-item');

    if (taskItem && !taskItem.classList.contains('add-task-item')) {
        // Remove 'active' class from all tasks
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('active-task');
        });

        // Add 'active' class to the clicked task
        taskItem.classList.add('active-task');

        // Populate the right panel with the clicked task's data
        populateRightPanel(taskItem.dataset.id);
    }
});

// Initial render
renderTasks();
// Populate the panel for the initial active task
populateRightPanel(3);