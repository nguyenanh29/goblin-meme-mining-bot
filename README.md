# Goblin Box Automation 🎯

Automatic script for managing boxes on [goblin.meme](https://goblin.meme?referral_code=MP8AR5) using informal Javanese language. This script will automatically start boxes and open boxes that are ready.

## Main Features

- **Auto Start Box**: Automatically starts boxes that haven't started yet
- **Auto Open Box**: Automatically opens boxes that are ready
- **Daily Scheduler**: Runs automatically every day at 9 AM
- **Check Ready**: Checks for ready boxes every 4 hours
- **Logging**: Complete logs with file rotation
- **Cookie Authentication**: Uses session cookies from your browser

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```
### 2. Setup Cookie
1. Log in to [goblin.meme](https://goblin.meme?referral_code=79ECKR) using your browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Refresh the page or click an API request
5. Look for a request to `/api/box`
6. Copy all Cookies from the Request Headers
7. Paste them into the `.env` file

### 3. Edit the .env File
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your editor
nano .env
```

Fill in GOBLIN_COOKIE with the cookie from your browser:
```env
GOBLIN_COOKIE=referral=79ECKR; __Host-next-auth.csrf-token=...; __Secure-next-auth.session-token=...
```

### 4. Run the Script
The script runs automatically on Replit. If you want to run it manually:
```bash
node index.js
```

## Configuration

Edit the `.env` file to set:

- `AUTO_START=true/false` - Auto start new boxes
- `AUTO_OPEN=true/false` - Auto open ready boxes
- `DEBUG=true/false` - Debug mode
- `LOG_LEVEL=info/debug/warn/error` - Logging level

## Schedule

- **9 AM**: Full automation (start and open all boxes)
- **Every 4 Hours**: Checks for boxes that are ready to open
- **Real-time**: Logs all activities

## Log File

Logs are saved in `goblin-automation.log` with automatic rotation:
- Max size: 10MB per file
- Max files: 5 backup files
- Format: `[timestamp] [level] message`

## Troubleshooting

### Error 401 Unauthorized
- Cookie expired or incorrect
- Log in again to goblin.meme
- Copy a new cookie from your browser
- Update the `.env` file

### Box Can’t Be Started
- Check if the mission is completed
- Check if the box hasn’t been opened previously
- Check your internet connection

### Script Doesn’t Run
- Check if the `.env` file is correct
- Check if the cookie is still valid
- Restart the script: `node index.js`

## File Structure

```
├── index.js           # Main script
├── goblin-manager.js  # API manager
├── config.js          # Configuration
├── logger.js          # Logging system
├── .env              # Environment variables
├── .env.example      # Template environment
└── README.md         # This documentation
```

## Notes

- This script uses informal Javanese language by [Hokireceh](https://github.com/hokireceh)
- All important data is stored in `.env`
- Cookie must be updated when expired
- The script runs continuously, stop it using Ctrl+C



## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Feel free to use, modify, and distribute it for personal or commercial purposes — just include attribution.
