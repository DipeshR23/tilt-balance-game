# Tilt Balance - Mobile Game

A simple, addictive tilt balance game that works on both mobile and desktop devices. Keep the pink ball on the circular platform for as long as possible!

## Features

- 🎮 **Dual Controls**: Tilt your phone for motion controls or drag/touch for manual control
- 📱 **Mobile Optimized**: Works perfectly on mobile devices with touch controls
- 🎯 **Physics-Based**: Realistic ball physics with gravity and friction
- 💨 **Wind Effects**: Random wind gusts add challenge
- 📊 **Score Tracking**: Tracks your best time and current session
- 🔄 **PWA Ready**: Can be installed as a Progressive Web App
- 📤 **Share & Export**: Share your scores and export game screenshots
- 🌐 **Offline Play**: Works completely offline once loaded

## How to Play

1. **Mobile**: Tilt your phone to control the ball, or touch and drag on the screen
2. **Desktop**: Use mouse to drag, or arrow keys to control the ball
3. Keep the pink ball inside the circular platform as long as possible
4. Near the edge, you'll feel vibration (on mobile) and see wind effects
5. Try to beat your best time!

## Running Locally

### Method 1: Simple HTTP Server (Recommended)

1. Open your terminal/command prompt
2. Navigate to the project folder
3. Run one of these commands:

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (if you have it installed):**
```bash
npx serve .
```

**PHP (if you have it installed):**
```bash
php -S localhost:8000
```

4. Open your browser and go to `http://localhost:8000`

### Method 2: Direct File Opening

⚠️ **Note**: Some features (like motion controls) may not work when opening the file directly due to browser security restrictions.

1. Simply open `index.html` in your web browser

## Mobile Setup

### For Motion Controls (iOS/Android):

1. Open the game in your mobile browser
2. Click "Enable Motion" when prompted
3. Allow motion permissions when requested
4. Tilt your device to control the ball!

### For Touch Controls:

1. Open the game in your mobile browser
2. Start the game
3. Touch and drag on the screen to control the ball

## Browser Compatibility

- ✅ Chrome (Android/iOS/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Android/Desktop)
- ✅ Edge (Windows/Android)
- ✅ Samsung Internet

## Technical Details

- **Pure JavaScript**: No external dependencies
- **Canvas-based**: Smooth 60fps rendering
- **Responsive Design**: Adapts to any screen size
- **Service Worker**: Enables offline functionality
- **Local Storage**: Saves your best scores

## Troubleshooting

### Motion Controls Not Working?
- Make sure you've granted motion permissions
- Try refreshing the page
- Some browsers require HTTPS for motion controls

### Game Not Loading?
- Make sure you're running a local server (not opening file directly)
- Check browser console for any error messages
- Try a different browser

### Touch Controls Not Responsive?
- Make sure you're touching within the circular game area
- Try refreshing the page
- Check if your browser supports touch events

## Customization

You can easily customize the game by editing:
- `style.css` - Colors, layout, and visual effects
- `script.js` - Game physics, difficulty, and features
- `manifest.json` - PWA settings and app metadata

## License

This project is open source and available under the MIT License.

---

**Enjoy playing Tilt Balance!** 🎮



git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/DipeshR23/tilt-balance-game.git
git push -u origin main