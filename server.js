// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Sample users (in-memory store)
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Routes
// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

// Routes
// Login route
app.get('/', (req, res) => {
    res.render('home');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user; // Save user to session
        res.redirect('/dashboard');
    } else {
        res.send('Invalid credentials! <a href="/login">Try again</a>');
    }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

// Registration route
app.get('/register', (req, res) => {
  res.render('register');
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.redirect('/dashboard');
      }
      res.redirect('/login');
  });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  // Check if the username already exists
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
      return res.send('Username already exists! <a href="/register">Try again</a>');
  }
  // Add new user
  users.push({ username, password });
  res.redirect('/login');
});

// Profile route
app.get('/profile', (req, res) => {
  if (req.session.user) {
      res.render('profile', { user: req.session.user });
  } else {
      res.redirect('/login');
  }
});

// Update profile route
app.post('/profile', (req, res) => {
  if (req.session.user) {
      const { username } = req.body;
      req.session.user.username = username; // Update username in session
      const userIndex = users.findIndex(u => u.username === req.session.user.username);
      if (userIndex !== -1) {
          users[userIndex].username = username; // Update username in user list
      }
      res.redirect('/dashboard');
  } else {
      res.redirect('/login');
  }
});

// API to search users by username
app.get('/api/users/search/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  const foundUsers = users.filter(u => u.username.toLowerCase().includes(username));
  res.json(foundUsers);
});

// API to delete a user by username (for demonstration purposes)
app.delete('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const userIndex = users.findIndex(u => u.username === username);
  if (userIndex !== -1) {
      users.splice(userIndex, 1);
      res.status(200).json({ message: 'User deleted successfully' });
  } else {
      res.status(404).json({ message: 'User not found' });
  }
});

// API to get the list of existing users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});