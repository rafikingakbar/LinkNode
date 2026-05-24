<div align="center">

#  LinkNode

**A lightweight URL shortener — shorten, manage, and track your links.**

![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

</div>

---

## Overview

LinkNode is a URL shortener built with vanilla HTML/CSS/JS on the frontend and Vercel Serverless Functions on the backend. It uses **Firebase Firestore** as a NoSQL database to store link data.

No login required — LinkNode identifies each user via a `deviceId` stored in `localStorage`, so every browser manages its own links independently.

---

## Features

- Shorten long URLs with a generated or custom alias
- Edit and delete your created links
- Copy shortened links in one click
- Track click counts per link
- Dark / light theme toggle
- English and Indonesian language support

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Vercel Serverless Functions |
| Database | Firebase Firestore, Firebase Admin SDK |
| Deployment | Vercel |

---

## Project Structure

```txt
LinkNode/
├── api/
│   ├── s/[code].js       # Redirect handler
│   ├── shorten.js        # Create short link
│   ├── list.js           # Get user links
│   ├── edit.js           # Edit alias
│   └── delete.js         # Delete link
│
├── css/
│   ├── base.css          # Main styling
│   └── theme.css         # Theme styling
│
├── js/
│   ├── app.js            # Main frontend logic
│   ├── lang.js           # Language logic
│   └── theme.js          # Theme logic
│
├── lib/
│   └── firebase.js       # Firebase config
│
├── image/                # Assets
├── index.html
├── vercel.json
└── package.json
```

---

## How It Works

1. User submits a long URL via the input form
2. Frontend sends the URL + `deviceId` to `/api/shorten`
3. Backend generates a short code and stores it in Firestore
4. When the short link is visited, the redirect API resolves the code and updates the click count

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

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/shorten` | Create a new short link |
| `GET` | `/api/list?deviceId=xxx` | Get all links by device |
| `POST` | `/api/edit` | Update link alias |
| `POST` | `/api/delete` | Delete a link |
| `GET` | `/:code` | Redirect to original URL |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rafikingakbar/LinkNode.git
cd LinkNode
```

### 2. Install dependencies

```bash
npm install
npm install -g vercel
```

### 3. Set up environment variables

Create the following variables in your Vercel dashboard or local Vercel environment:

```env
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

### 4. Run locally

```bash
vercel dev
```

---

## Deployment

1. Push the project to GitHub
2. Import the repository into [Vercel](https://vercel.com)
3. Add the Firebase environment variables in project settings
4. Deploy

---

## Author

**Rafi King Akbar**
[github.com/rafikingakbar](https://github.com/rafikingakbar)
