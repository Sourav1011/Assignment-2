const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const TASKS_FILE = path.join(__dirname, 'tasks.json');
app.use(express.static('public'));


app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


if (!fs.existsSync(TASKS_FILE) || fs.readFileSync(TASKS_FILE, 'utf8').trim() === '') {
    fs.writeFileSync(TASKS_FILE, '[]', 'utf8');
}


const readTasks = () => {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8').trim();
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading tasks.json:', error);
        return [];
    }
};


const writeTasks = (tasks) => {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to tasks.json:', error);
    }
};

app.get('/', (req, res) => {
    res.redirect('/tasks');
});


app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.render('tasks', { tasks });
});


app.get('/task', (req, res) => {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === parseInt(req.query.id));
    if (task) {
        res.render('task', { task });
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});
app.get('/add-task', (req, res) => {
    res.render('add-task'); 
});


app.post('/add-task', (req, res) => {
    const tasks = readTasks();
    const description = req.body.description.trim();

    if (!description) {
        return res.status(400).json({ error: 'Task description cannot be empty' });
    }

    const newTask = {
        id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
        description
    };

    tasks.push(newTask);
    writeTasks(tasks);
    res.redirect('/tasks');
});


app.get('/delete-task', (req, res) => {
    let tasks = readTasks();
    const taskId = parseInt(req.query.id);
    tasks = tasks.filter(task => task.id !== taskId);
    writeTasks(tasks);
    res.redirect('/tasks');
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

