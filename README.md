# 🤖 Automatic Cult Play booking

This script automates the booking of Cult play classes using JavaScript and configuration stored in a `config.js` file.

## 🚀 Features

- Auto-login to Cult.play using session credentials
- Book preferred class at a specific center and time
- Supports configuration for device and app environment emulation
- Works for iOS simulation with encrypted device credentials

## 🛠 Prerequisites

- Node.js >= 14.x
- Cult.play account with an active subscription
- Web login access to Cult.play (for retrieving most necessary tokens and cookies)



## ⚙️ Configuration: `config.js`

Create a `config.js` file in the root directory with the following structure:

> **Note:** This file includes sensitive data and **must not be shared or committed** to version control. Add `config.js` to your `.gitignore`.

### Example: `config.js`

```javascript
module.exports = {
  st: "CFAPP:<your-session-token>",
  at: "CFAPP:<your-access-token>",
  osName: "ios",
  Cookie: "deviceId=s%3A<encoded-device-id>.xxxxxxxx",
  deviceId: "<your-device-id>",
  encryptedDeviceId: "<your-encrypted-device-id>",
  clientVersion: "11.13",
  appsource: "flutter",
  microappversion: "4.0.0",
  deviceModel: "iPhone",
  deviceBrand: "apple",
  "Accept-Language": "en-IN,en;q=0.9",
  timezone: "IST",
  "x-tenant-id": "curefit",
  lat: "<your-latitude>",
  lon: "<your-longitude>",
  preferred_center: 1106,  // Replace with your preferred center ID
  main_app_url: "www.cult.fit"
};

```

## Installation Steps
1. Clone the repository
2. Install dependencies
3. Create a configuration file
     - Create a file named config.js in the root directory.
     - Use the sample structure above and fill in your credentials.
5. Run the script
``
npm run start
``
