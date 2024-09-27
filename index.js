// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

class Server {
    constructor() {
        this.app = express(); // Create an Express application
        this.port = process.env.PORT || 3000; // Set the server port
        this.users = [
          { username: 'user1', email: 'user1@example.com' },
          { username: 'user2', email: 'user2@example.com' }
        ]; // In-memory user store
        this.initializeMiddleware(); // Initialize middleware
        this.initializeRoutes(); // Set up routes
        this.startServer(); // Start the server
    }

    // Initialize middleware
    initializeMiddleware() {
        this.app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
        this.app.use(express.static('public')); // Serve static files from the public directory
        this.app.set('view engine', 'ejs'); // Set the template engine to EJS
        this.app.use(session({
            secret: 'secret-key', // Session secret for signing the session ID cookie
            resave: false,
            saveUninitialized: true
        }));
    }

    // Initialize routes
    initializeRoutes() {
        this.app.get('/', this.renderHome.bind(this)); // Home page route
        this.app.get('/login', this.renderLogin.bind(this)); // Login page route
        this.app.post('/login', this.handleLogin.bind(this)); // Handle login submissions
        this.app.get('/register', this.renderRegister.bind(this)); // Registration page route
        this.app.post('/register', this.handleRegistration.bind(this)); // Handle registration submissions
        this.app.get('/dashboard', this.renderDashboard.bind(this)); // Dashboard page route
        this.app.get('/profile', this.renderProfile.bind(this)); // Profile page route
        this.app.post('/profile', this.handleProfileUpdate.bind(this)); // Handle profile updates
        this.app.get('/api/users', this.getUsers.bind(this)); // API to get the list of users
        this.app.get('/api/users/search/:username', this.searchUsers.bind(this)); // API to search users by username
        this.app.delete('/api/users/:username', this.deleteUser.bind(this)); // API to delete a user by username
        this.app.get('/logout', this.handleLogout.bind(this)); // Logout route

        this.app.get('/view-users', (req, res) => {
          res.render('viewUsers', { users: this.users }); // Render users page
        });

        this.app.get('/edit-profile', (req, res) => {
            res.render('editProfile', { username: this.currentUser.username, email: this.currentUser.email });
        });

        this.app.post('/edit-profile', (req, res) => {
            const { username, email } = req.body;
            // Update user profile logic here
            this.currentUser.username = username;
            this.currentUser.email = email;
            res.redirect('/dashboard'); // Redirect to dashboard after update
        });
    }

    // Start the Express server
    startServer() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }

    // Render the home page
    renderHome(req, res) {
        res.render('home');
    }

    // Render the login page
    renderLogin(req, res) {
        res.render('login');
    }

    // Handle login submissions
    handleLogin(req, res) {
        const { username, password } = req.body; // Get username and password from request body
        const user = this.users.find(u => u.username === username && u.password === password); // Find user
        if (user) {
            req.session.user = user; // Save user to session
            res.redirect('/dashboard'); // Redirect to dashboard if login is successful
        } else {
            res.send('Invalid credentials! <a href="/login">Try again</a>'); // Send error message if login fails
        }
    }

    // Render the registration page
    renderRegister(req, res) {
        res.render('register');
    }

    // Handle registration submissions
    handleRegistration(req, res) {
        const { username, password } = req.body; // Get username and password from request body
        const existingUser = this.users.find(u => u.username === username); // Check if user already exists
        if (existingUser) {
            return res.send('Username already exists! <a href="/register">Try again</a>'); // Send error message if user exists
        }
        this.users.push({ username, password }); // Add new user to the in-memory store
        res.redirect('/login'); // Redirect to login after successful registration
    }

    // Render the dashboard page
    renderDashboard(req, res) {
        if (req.session.user) {
            res.render('dashboard', { user: req.session.user }); // Render dashboard if user is logged in
        } else {
            res.redirect('/login'); // Redirect to login if user is not logged in
        }
    }

    // Render the profile page
    renderProfile(req, res) {
        if (req.session.user) {
            res.render('profile', { user: req.session.user }); // Render profile if user is logged in
        } else {
            res.redirect('/login'); // Redirect to login if user is not logged in
        }
    }

    // Handle profile updates
    handleProfileUpdate(req, res) {
        if (req.session.user) {
            const { username } = req.body; // Get updated username from request body
            req.session.user.username = username; // Update username in session
            const userIndex = this.users.findIndex(u => u.username === req.session.user.username); // Find user index
            if (userIndex !== -1) {
                this.users[userIndex].username = username; // Update username in user list
            }
            res.redirect('/dashboard'); // Redirect to dashboard after updating profile
        } else {
            res.redirect('/login'); // Redirect to login if user is not logged in
        }
    }

    // API to get the list of existing users
    getUsers(req, res) {
        res.json(this.users); // Send the list of users as JSON response
    }

    // API to search users by username
    searchUsers(req, res) {
        const username = req.params.username.toLowerCase(); // Get the username parameter from the URL
        const foundUsers = this.users.filter(u => u.username.toLowerCase().includes(username)); // Search for matching users
        res.json(foundUsers); // Send the matching users as JSON response
    }

    // API to delete a user by username
    deleteUser(req, res) {
        const username = req.params.username; // Get the username parameter from the URL
        const userIndex = this.users.findIndex(u => u.username === username); // Find user index
        if (userIndex !== -1) {
            this.users.splice(userIndex, 1); // Remove user from the list
            res.status(200).json({ message: 'User deleted successfully' }); // Send success response
        } else {
            res.status(404).json({ message: 'User not found' }); // Send error response if user not found
        }
    }

    // Handle logout
    handleLogout(req, res) {
        req.session.destroy((err) => { // Destroy the session
            if (err) {
                return res.redirect('/dashboard'); // Redirect to dashboard if there was an error
            }
            res.redirect('/login'); // Redirect to login after successful logout
        });
    }
}

// Start the server
new Server(); // Create a new instance of the Server class