const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuration
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = 'your-secret-key-change-this';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Data storage (in production, use a database)
let users = [];
let keywords = [];
let greetings = [];
let settings = {
    defaultReply: {
        enabled: false,
        message: "Sorry, I didn't understand your message. Please try again or contact support."
    }
};

// Load data from files
function loadData() {
    try {
        if (fs.existsSync('data/users.json')) {
            users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
        }
        if (fs.existsSync('data/keywords.json')) {
            keywords = JSON.parse(fs.readFileSync('data/keywords.json', 'utf8'));
        }
        if (fs.existsSync('data/greetings.json')) {
            greetings = JSON.parse(fs.readFileSync('data/greetings.json', 'utf8'));
        }
        if (fs.existsSync('data/settings.json')) {
            settings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to files
function saveData() {
    try {
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data');
        }
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        fs.writeFileSync('data/keywords.json', JSON.stringify(keywords, null, 2));
        fs.writeFileSync('data/greetings.json', JSON.stringify(greetings, null, 2));
        fs.writeFileSync('data/settings.json', JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Initialize data
loadData();

// Create default admin user if none exists
if (users.length === 0) {
    const defaultAdmin = {
        id: 1,
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin'
    };
    users.push(defaultAdmin);
    saveData();
}

// WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

let qrCodeData = '';
let isReady = false;

// WhatsApp Events
client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error generating QR code:', err);
            return;
        }
        qrCodeData = url;
        io.emit('qr', url);
    });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isReady = true;
    io.emit('ready');
});

client.on('authenticated', () => {
    console.log('WhatsApp Client authenticated');
    io.emit('authenticated');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
    io.emit('auth_failure', msg);
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp Client disconnected:', reason);
    isReady = false;
    io.emit('disconnected', reason);
});

// Handle incoming messages
client.on('message', async (message) => {
    if (message.from === 'status@broadcast') return;
    
    const messageBody = message.body.toLowerCase();
    const fromNumber = message.from;
    
    // Check for greetings
    for (const greeting of greetings) {
        if (greeting.active && greeting.keywords.some(keyword => 
            messageBody.includes(keyword.toLowerCase())
        )) {
            await message.reply(greeting.response);
            return;
        }
    }
    
    // Check for keyword triggers
    for (const keyword of keywords) {
        if (keyword.active && messageBody.includes(keyword.trigger.toLowerCase())) {
            await message.reply(keyword.response);
            return;
        }
    }
    
    // Send default reply if no keywords matched and default reply is enabled
    if (settings.defaultReply.enabled && settings.defaultReply.message) {
        await message.reply(settings.defaultReply.message);
    }
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid credentials' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { 
        user: req.session.user,
        isReady,
        qrCodeData
    });
});

app.get('/keywords', requireAuth, (req, res) => {
    res.render('keywords', { 
        user: req.session.user,
        keywords
    });
});

app.get('/greetings', requireAuth, (req, res) => {
    res.render('greetings', { 
        user: req.session.user,
        greetings
    });
});

app.get('/settings', requireAuth, (req, res) => {
    res.render('settings', { 
        user: req.session.user,
        settings
    });
});

// API Routes
app.get('/api/keywords', requireAuth, (req, res) => {
    res.json(keywords);
});

app.post('/api/keywords', requireAuth, (req, res) => {
    const { trigger, response } = req.body;
    const newKeyword = {
        id: Date.now(),
        trigger,
        response,
        active: true,
        createdAt: new Date().toISOString()
    };
    keywords.push(newKeyword);
    saveData();
    res.json(newKeyword);
});

app.put('/api/keywords/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { trigger, response, active } = req.body;
    
    const keywordIndex = keywords.findIndex(k => k.id == id);
    if (keywordIndex !== -1) {
        keywords[keywordIndex] = {
            ...keywords[keywordIndex],
            trigger,
            response,
            active
        };
        saveData();
        res.json(keywords[keywordIndex]);
    } else {
        res.status(404).json({ error: 'Keyword not found' });
    }
});

app.delete('/api/keywords/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const keywordIndex = keywords.findIndex(k => k.id == id);
    if (keywordIndex !== -1) {
        keywords.splice(keywordIndex, 1);
        saveData();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Keyword not found' });
    }
});

// Greetings API
app.get('/api/greetings', requireAuth, (req, res) => {
    res.json(greetings);
});

app.post('/api/greetings', requireAuth, (req, res) => {
    const { keywords: greetingKeywords, response } = req.body;
    const newGreeting = {
        id: Date.now(),
        keywords: greetingKeywords,
        response,
        active: true,
        createdAt: new Date().toISOString()
    };
    greetings.push(newGreeting);
    saveData();
    res.json(newGreeting);
});

app.put('/api/greetings/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { keywords: greetingKeywords, response, active } = req.body;
    
    const greetingIndex = greetings.findIndex(g => g.id == id);
    if (greetingIndex !== -1) {
        greetings[greetingIndex] = {
            ...greetings[greetingIndex],
            keywords: greetingKeywords,
            response,
            active
        };
        saveData();
        res.json(greetings[greetingIndex]);
    } else {
        res.status(404).json({ error: 'Greeting not found' });
    }
});

app.delete('/api/greetings/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const greetingIndex = greetings.findIndex(g => g.id == id);
    if (greetingIndex !== -1) {
        greetings.splice(greetingIndex, 1);
        saveData();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Greeting not found' });
    }
});

// Settings API
app.get('/api/settings', requireAuth, (req, res) => {
    res.json(settings);
});

app.put('/api/settings', requireAuth, (req, res) => {
    const { defaultReply } = req.body;
    
    if (defaultReply) {
        settings.defaultReply = {
            enabled: defaultReply.enabled || false,
            message: defaultReply.message || settings.defaultReply.message
        };
        saveData();
    }
    
    res.json(settings);
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected');
    
    // Send current status
    socket.emit('status', {
        isReady,
        qrCodeData
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Initialize WhatsApp Client
client.initialize();

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}`);
    console.log('Default login: admin / admin123');
});
