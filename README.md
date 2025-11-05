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
│   ├── Wallet.tsx          # Wallet management
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

### Agents
- `GET /api/agents` - List agents
- `GET /api/agents/:id` - Get agent details
- `GET /api/agents/my/list` - Get my agents

### Chat
- `POST /api/chat/:id/message` - Send message
- `GET /api/chat/:id/history` - Get chat history

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/fund` - Fund wallet
- `GET /api/wallet/transactions` - Get transactions

## Environment Variables

The API base URL is configured in `src/config/api.ts`. To change it, modify:

```typescript
export const API_BASE_URL = 'https://nexusbert-zurri.hf.space/api';
```

## Features in Development

- [ ] Creator dashboard
- [ ] Admin dashboard
- [ ] Agent creation/editing
- [ ] Password reset flow
- [ ] Transaction history pagination
- [ ] Agent search and filtering enhancements

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

## License

MIT
