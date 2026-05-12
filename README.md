# LinkNode

LinkNode is a lightweight URL shortener web application built with **HTML**, **CSS**, **JavaScript**, **Vercel Serverless Functions**, and **Firebase Firestore** as a NoSQL database.

This application allows users to shorten long URLs, manage created links, edit custom aliases, delete links, copy shortened URLs, and track basic click statistics.

## Overview

LinkNode uses **Firebase Firestore**, a cloud-based NoSQL database, to store shortened URL data. Each URL is saved as a document containing the original URL, short code, device ID, click count, and creation timestamp.

Instead of using a login system, LinkNode uses a browser-based `deviceId` stored in `localStorage`. This allows each browser or device to manage its own created links.

## Features

- Shorten long URLs
- Generate random short codes
- Edit custom aliases or back-halves
- Delete created short links
- Copy shortened links
- Redirect short links to the original URL
- Track click counts
- Manage links based on device ID
- Support dark/light theme
- Support English and Indonesian language

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Vercel Serverless Functions

### Database

- Firebase Firestore
- Firebase Admin SDK

### Deployment

- Vercel

## Project Structure

```txt
LinkNode/
├── api/
│   ├── s/
│   │   └── [code].js        # Redirect handler
│   ├── delete.js            # Delete short link API
│   ├── edit.js              # Edit alias API
│   ├── list.js              # Get user links API
│   └── shorten.js           # Create short link API
│
├── css/
│   ├── base.css             # Main styling
│   └── theme.css            # Theme styling
│
├── image/                   # Image assets
│
├── js/
│   ├── app.js               # Main frontend logic
│   ├── lang.js              # Language logic
│   └── theme.js             # Theme logic
│
├── lib/
│   └── firebase.js          # Firebase configuration
│
├── index.html               # Main page
├── package.json             # Dependencies
├── package-lock.json        # Lock file
├── vercel.json              # Vercel routing
└── README.md
```

## How It Works

1. The user enters a long URL in the input form.
2. The frontend sends the URL and `deviceId` to `/api/shorten`.
3. The backend generates a short code and stores the data in Firebase Firestore.
4. When someone opens the short link, the redirect API checks the code in Firestore.
5. If the code exists, the user is redirected to the original URL and the click count is updated.

Example Firestore document:

```js
{
  originalUrl: "https://example.com/very/long/url",
  code: "abc123",
  deviceId: "device_xxxxx",
  clicks: 0,
  createdAt: Timestamp
}
```

## API Endpoints

### Create Short Link

```http
POST /api/shorten
```

Creates a new shortened URL.

### Get User Links

```http
GET /api/list?deviceId=device_xxxxx
```

Gets all links created by a specific device.

### Edit Short Link Alias

```http
POST /api/edit
```

Updates the alias or back-half of an existing short link.

### Delete Short Link

```http
POST /api/delete
```

Deletes a short link owned by the current device.

### Redirect Short Link

```http
GET /:code
```

Redirects the short link to the original URL.

## Clone and Run Locally

Follow these steps to clone and run the project on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/rafikingakbar/LinkNode.git
```

### 2. Move to the Project Directory

```bash
cd LinkNode
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Install Vercel CLI

```bash
npm install -g vercel
```

### 5. Configure Environment Variables

Create Firebase Admin environment variables in your local Vercel environment or Vercel dashboard:

```env
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

### 6. Run the Project Locally

```bash
vercel dev
```

The application will run using Vercel's local development environment.

## Deployment

This project can be deployed directly to Vercel.

Basic deployment steps:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the Firebase environment variables in Vercel project settings.
4. Deploy the project.

## Author

Created by **Rafi King Akbar**.

GitHub: [rafikingakbar](https://github.com/rafikingakbar)
