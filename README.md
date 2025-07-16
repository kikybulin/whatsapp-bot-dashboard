# WhatsApp Bot Dashboard

A complete WhatsApp bot web application with a modern dashboard for managing keyword triggers and auto-reply functionality.

## Features

- 🤖 **WhatsApp Bot Integration** - Uses whatsapp-web.js for seamless WhatsApp integration
- 🎨 **Modern Dashboard** - Beautiful UI built with Tailwind CSS
- 🔐 **Authentication System** - Secure login/logout functionality
- 🔑 **Keyword Management** - Add, edit, and delete keyword triggers
- 👋 **Greetings Management** - Manage greeting responses for common greetings
- � **Default Reply** - Configure default response for unmatched messages
- �📱 **QR Code Scanner** - Easy WhatsApp connection via QR code
- 🔄 **Real-time Updates** - Live status updates using Socket.IO
- 📊 **Dashboard Analytics** - Monitor active keywords and greetings
- ⚙️ **Settings Management** - Configure bot behavior and responses
- 🛡️ **Session Management** - Secure user sessions

## Installation

1. **Clone or download the project**
   ```bash
   cd c:\laragon\www\wa-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the dashboard**
   - Open your browser and go to `http://localhost:3000`
   - Default login credentials:
     - Username: `admin`
     - Password: `admin123`

## Usage

### 1. Connect WhatsApp

1. Log in to the dashboard
2. You'll see a QR code on the dashboard
3. Open WhatsApp on your phone
4. Go to Settings > Linked Devices > Link a Device
5. Scan the QR code
6. Your bot is now connected!

### 2. Manage Keywords

1. Go to the **Keywords** section
2. Add new keywords that trigger auto-replies
3. Set the trigger word and response message
4. Keywords are case-insensitive and will match partial text

### 3. Manage Greetings

1. Go to the **Greetings** section
2. Add greeting keywords (like "hello", "hi", "hey")
3. Set the greeting response message
4. You can add multiple greeting keywords separated by commas

### 4. Configure Settings

1. Go to the **Settings** section
2. Enable/disable default reply for unmatched messages
3. Set a custom default response message
4. The bot will send this message when no keywords or greetings match

### 5. Monitor Activity

- The dashboard shows real-time connection status
- View the number of active keywords and greetings
- Monitor bot activity and responses

## File Structure

```
wa-bot/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── views/                 # EJS templates
│   ├── login.ejs         # Login page
│   ├── dashboard.ejs     # Main dashboard
│   ├── keywords.ejs      # Keywords management
│   ├── greetings.ejs     # Greetings management
│   └── settings.ejs      # Settings configuration
├── public/               # Static files
│   └── styles.css        # Custom CSS styles
└── data/                 # Data storage (auto-created)
    ├── users.json        # User accounts
    ├── keywords.json     # Keyword triggers
    ├── greetings.json    # Greeting responses
    └── settings.json     # Bot settings
```

## API Endpoints

### Authentication
- `POST /login` - User login
- `GET /logout` - User logout

### Keywords
- `GET /api/keywords` - Get all keywords
- `POST /api/keywords` - Add new keyword
- `PUT /api/keywords/:id` - Update keyword
- `DELETE /api/keywords/:id` - Delete keyword

### Greetings
- `GET /api/greetings` - Get all greetings
- `POST /api/greetings` - Add new greeting
- `PUT /api/greetings/:id` - Update greeting
- `DELETE /api/greetings/:id` - Delete greeting

### Settings
- `GET /api/settings` - Get bot settings
- `PUT /api/settings` - Update bot settings

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Session secret key

### Default Admin User
- Username: `admin`
- Password: `admin123`
- **Change these credentials after first login!**

## How It Works

1. **WhatsApp Connection**: Uses `whatsapp-web.js` to connect to WhatsApp Web
2. **Message Processing**: Listens for incoming messages and processes them
3. **Priority Order**: 
   - First checks for greeting keywords
   - Then checks for keyword triggers
   - Finally sends default reply if enabled and no matches found
4. **Auto-Reply**: Sends appropriate responses based on matches or default message
5. **Dashboard**: Provides a web interface for managing bot settings

## Technologies Used

- **Backend**: Node.js, Express.js
- **WhatsApp**: whatsapp-web.js
- **Frontend**: EJS templates, Tailwind CSS
- **Real-time**: Socket.IO
- **Authentication**: Express-session, bcryptjs
- **QR Code**: qrcode library

## Security Features

- Session-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- CSRF protection
- Input validation

## Production Deployment

For production deployment:

1. Set environment variables:
   ```bash
   NODE_ENV=production
   SESSION_SECRET=your-secure-secret-key
   PORT=3000
   ```

2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name whatsapp-bot
   ```

3. Set up a reverse proxy with Nginx
4. Use a proper database instead of JSON files
5. Implement proper logging and monitoring

**For detailed deployment instructions to various platforms (Heroku, Railway, Render, etc.), see [DEPLOYMENT.md](DEPLOYMENT.md)**

## Troubleshooting

### Common Issues

1. **QR Code not showing**: Restart the application
2. **WhatsApp disconnected**: Check your internet connection and re-scan QR code
3. **Keywords not working**: Ensure keywords are active and properly configured
4. **Can't login**: Use default credentials: admin/admin123

### Logs

Check the console output for detailed error messages and connection status.

## License

MIT License - feel free to use and modify for your needs.

## Support

For support and updates, check the project repository or contact the developer.
