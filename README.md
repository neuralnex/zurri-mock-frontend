# Zurri Mock Frontend

A React TypeScript frontend application for the Zurri AI Agents Marketplace API.

## Features

- 🔐 User authentication (Login/Register)
- 🏪 Agent marketplace browsing
- 💬 Chat interface with agents
- 💰 Wallet management and funding
- 📊 User dashboard
- 🎨 Modern, responsive UI

## API Server

This frontend connects to the Zurri API server hosted at:
**https://nexusbert-zurri.hf.space/api**

## Deployment

### Vercel Deployment

This frontend is configured for Vercel deployment with:
- `vercel.json` - Configured for SPA routing (all routes serve `index.html`)
- Automatic builds on push to main branch

### Environment Variables

If deploying to Vercel, set these in Vercel dashboard:
- Not required for frontend (API URL is hardcoded in `src/config/api.ts`)

### Backend Configuration

**Important**: When deploying the frontend separately (e.g., on Vercel), make sure to set the `FRONTEND_URL` environment variable in your backend:

```env
FRONTEND_URL=https://zurri-mock-frontend.vercel.app
```

This ensures payment callbacks redirect to the correct frontend URL.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd zurri-mock-frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── config/
│   └── api.ts              # API configuration and endpoints
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── services/
│   ├── api.ts              # Axios instance and interceptors
│   ├── authService.ts      # Authentication service
│   ├── agentService.ts     # Agent service
│   ├── chatService.ts      # Chat service
│   └── walletService.ts    # Wallet service
├── components/
│   └── ProtectedRoute.tsx  # Route protection component
├── pages/
│   ├── Home.tsx            # Marketplace homepage
│   ├── Login.tsx           # Login page
│   ├── Register.tsx        # Registration page
│   ├── AgentDetail.tsx     # Agent details page
│   ├── Chat.tsx            # Chat interface
│   ├── Wallet.tsx         # Wallet management
│   └── Dashboard.tsx       # User dashboard
├── App.tsx                  # Main app component with routing
└── main.tsx                 # Entry point
```

## API Integration

The frontend uses the following API endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Agents
- `GET /api/agents` - List all approved agents
- `GET /api/agents/:id` - Get agent details
- `GET /api/agents/my/list` - Get user's agents (creators)
- `POST /api/agents` - Create new agent (creators)
- `PUT /api/agents/:id` - Update agent (creators)
- `DELETE /api/agents/:id` - Delete agent (creators)

### Chat
- `POST /api/chat/:id/message` - Send message to agent
- `GET /api/chat/:id/history` - Get chat history

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/fund` - Fund wallet via Paystack
- `GET /api/wallet/verify/:reference` - Verify transaction
- `GET /api/wallet/transactions` - Get transaction history

## Troubleshooting

### 404 Errors on Refresh

If you get 404 errors when refreshing pages on Vercel, make sure:
1. `vercel.json` is present in the root directory
2. The file contains the rewrite rule for SPA routing
3. Redeploy after adding `vercel.json`

### Payment Callback Issues

If payment callbacks don't redirect correctly:
1. Check that `FRONTEND_URL` is set in backend environment variables
2. Ensure `FRONTEND_URL` points to your Vercel deployment URL
3. Verify Paystack callback URL is set to: `https://nexusbert-zurri.hf.space/api/wallet/callback`
