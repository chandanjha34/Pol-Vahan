# 🚗 DeVahan – Decentralized Vehicle Intelligence Network

A decentralized ecosystem for **vehicle identity, data integrity, and AI-powered lifecycle management**, built on **Polygon's fast L2 infrastructure**.

**Status:** Production Ready ✅ | **Version:** 1.0

---

## 📋 Table of Contents

1. Quick Start
2. Architecture Overview
3. Features
4. API Documentation
5. Project Structure
6. Setup Instructions
7. How to Use
8. AI Model Training
9. Polygon Integration
10. Troubleshooting
11. Future Roadmap
12. Contributing
13. License

---

## 🚀 Quick Start

### 1️⃣ Prerequisites

* Node.js v20+
* npm v10+
* EVM Wallet with $Pol tokens

### 2️⃣ Installation

```bash
https://github.com/chandanjha34/Pol-Vahan.git
cd Pol-Vahan

cd Backend
npm install

cd Frontend
npm install

cd Contract
npm install


```

### 3️⃣ Environment Setup

Create a `.env` file:

# Backend Folder

PORT=3000
RPC_URL=https://evmrpc-testnet.0g.ai/
INDEXER_RPC=https://indexer-storage-turbo.0g.ai
MONGO_URI=mongodb+srv://your_MongoDB_URI
JWT_SECRET = JWT_secret
PRIVATE_KEY = Your_Private_Key
NODE_ENV=development


# Contract Folder

PRIVATE_KEY = Your_Private_Key

```

### 4️⃣ Start the App

```bash

cd Backend
npm run dev

cd Frontend
npm run dev


```

---

## 🏗️ Architecture Overview

### System Diagram

```
Client (React + Vite)
   │
   ▼
Backend (Express + Node.js)

```

### Data Flow

1. Starts with Dealer, dealer mints NFT with all the vehicle details into the buyer's wallet by uploading metadata on IPFS storage
2. Service centers will upload service records by binding it with vehicle id(making hash of service record's json and then upload same on IPFS and then hash on backend)
3. Then owners can see their vehicles and service records ledger from their dashboard.
4. They can also check resale value of their vehicles
5. Then owners can enquire about someone's vehicle just by typing its vehicle id in VahanSarthi.
---

## 🧩 Technology Stack

| Layer      | Technology         | Purpose                            |
| ---------- | ------------------ | ---------------------------------- |
| Frontend   | React + Tailwind   | UI/UX for vehicle dashboard        |
| Backend    | Node.js + Express  | REST APIs                          |
| Blockchain | Polygon Testnet, EVM| On-chain activities and validation|
| AI         | 0G Compute Network | Decentralized inference & training |
| Storage    | IPFS Storage       | Vehicle records & verification     |
| DB         | MongoDB            | Off-chain cache and indexing       |

---

## ⚙️ Features

### ✅ Core (Implemented)

* Vehicle NFT minting
* Service record storage via IPFS
* AI-based maintenance predictions
* Dealer & service provider registration
* Data verification via Merkle proofs
* Basic dashboard for vehicle health

### 🔮 Upcoming (Q1 2026)

* Smart INFTs (intelligent evolving NFTs)
* Predictive repair scheduling
* Vehicle resale verification
* Cross-chain interoperability
* Insurance & finance modules

---


