// 3D Background Logic
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('three-container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 1);
pointLight1.position.set(20, 20, 20);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
pointLight2.position.set(-20, -20, -20);
scene.add(pointLight2);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('https://threejs.org/examples/textures/earth_atmos_2048.jpg');

const sphereMaterial = new THREE.MeshStandardMaterial({
  map: texture,
  metalness: 0.7,
  roughness: 0.1,
});

const spheres = [];
for (let i = 0; i < 5; i++) {
  const geometry = new THREE.SphereGeometry(1.5, 32, 32);
  const sphere = new THREE.Mesh(geometry, sphereMaterial);
  sphere.position.set(Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 10 - 5);
  spheres.push(sphere);
  scene.add(sphere);
}

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 2000;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 50;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.05 });
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

function animate() {
  requestAnimationFrame(animate);

  spheres.forEach(sphere => {
    sphere.rotation.y += 0.005;
    sphere.rotation.x += 0.002;
  });

  particles.rotation.y += 0.001;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Task Manager Logic
const taskItems = document.getElementById('task-items');
const addTaskButton = document.getElementById('add-task');
const newTaskInput = document.getElementById('new-task');
const taskDateInput = document.getElementById('task-date');
const taskDescriptionInput = document.getElementById('task-description');
const searchTaskInput = document.getElementById('search-task');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = '') {
  taskItems.innerHTML = '';
  const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(filter.toLowerCase()));
  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement('li');
    taskItem.classList.toggle('completed', task.completed);

    const taskText = document.createElement('span');
    taskText.innerHTML = `
      <strong>${task.text}</strong> (${task.date || 'No Date'})
      <p>${task.description || 'No Description'}</p>
    `;

    const actions = document.createElement('div');
    actions.classList.add('task-actions');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => editTask(index);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTask(index);

    const completeButton = document.createElement('button');
    completeButton.textContent = task.completed ? 'Undo' : 'Complete';
    completeButton.onclick = () => toggleComplete(index);

    actions.append(editButton, deleteButton, completeButton);
    taskItem.append(taskText, actions);
    taskItems.appendChild(taskItem);
  });
}

function addTask() {
  const text = newTaskInput.value.trim();
  const date = taskDateInput.value;
  const description = taskDescriptionInput.value.trim();
  if (text) {
    tasks.push({ text, date, description, completed: false });
    saveTasks();
    renderTasks();
    newTaskInput.value = '';
    taskDateInput.value = '';
    taskDescriptionInput.value = '';
  }
}

function editTask(index) {
  const newText = prompt('Edit task:', tasks[index].text);
  if (newText) {
    tasks[index].text = newText;
    tasks[index].description = prompt('Edit description:', tasks[index].description);
    saveTasks();
    renderTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Event listeners
addTaskButton.addEventListener('click', addTask);
searchTaskInput.addEventListener('input', (e) => renderTasks(e.target.value));
window.addEventListener('DOMContentLoaded', () => renderTasks(searchTaskInput.value));
document.addEventListener('DOMContentLoaded', () => {
  const taskList = document.getElementById('task-items');
  const addTaskButton = document.getElementById('add-task');
  const clearStorageButton = document.getElementById('clear-storage');

  // Load tasks from local storage
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToDOM(task));
  }

  // Add task to DOM
  function addTaskToDOM(task) {
    const taskItem = document.createElement('li');
    taskItem.textContent = `${task.title} (${task.date}) - ${task.description}`;
    taskList.appendChild(taskItem);
  }

  // Add task
  addTaskButton.addEventListener('click', () => {
    const title = document.getElementById('new-task').value;
    const date = document.getElementById('task-date').value;
    const description = document.getElementById('task-description').value;
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;

    const task = { title, date, description, priority, category };

    addTaskToDOM(task);

    // Save to local storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  });

  // Clear local storage and tasks from DOM
  clearStorageButton.addEventListener('click', () => {
    localStorage.removeItem('tasks');
    taskList.innerHTML = ''; // Clear all tasks from the UI
    alert('All tasks have been cleared!');
  });

  // Initialize
  loadTasks();
});
