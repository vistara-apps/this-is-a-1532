# DeployGenie 🚀

**Effortless App Deployment for Developers, Anywhere.**

DeployGenie is a comprehensive web application that simplifies the deployment process for developers, enabling one-click deployments and automated environment setup for web applications across multiple cloud providers.

![DeployGenie Dashboard](https://via.placeholder.com/800x400/1f2937/10b981?text=DeployGenie+Dashboard)

## ✨ Features

### 🔧 Core Features
- **Simplified Server Setup** - Automated infrastructure provisioning and OS configuration
- **Automated Environment Configuration** - Smart project analysis and dependency management
- **One-Click Deployments** - Complete deployment pipeline with a single click
- **Automated Rollbacks & Health Checks** - Continuous monitoring with automatic recovery

### 🏗️ Technical Capabilities
- **Multi-Framework Support** - React, Next.js, Vue.js, Node.js, Python
- **Multi-Cloud Deployment** - Vercel, Netlify, AWS, Google Cloud, DigitalOcean
- **Container Support** - Docker containerization for complex applications
- **Real-time Monitoring** - Health checks, metrics, and performance tracking
- **GitHub Integration** - OAuth authentication and repository management

### 💳 Business Features
- **Subscription Management** - Tiered plans with Stripe integration
- **Usage Analytics** - Detailed deployment and usage statistics
- **Team Collaboration** - Multi-user support with role-based access
- **Billing & Invoicing** - Automated billing with invoice management

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library
- **React Hot Toast** - Elegant toast notifications
- **React Hook Form** - Performant forms with easy validation

### Backend Integration
- **RESTful API** - Comprehensive API service layer
- **GitHub API** - Repository management and OAuth
- **Stripe API** - Payment processing and subscriptions
- **Docker API** - Container registry operations
- **Cloud Provider APIs** - Multi-cloud deployment support

### State Management
- **React Context** - Global state management
- **Custom Hooks** - Reusable stateful logic
- **Error Boundaries** - Graceful error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vistara-apps/this-is-a-1532.git
cd this-is-a-1532
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_github_client_id

# Stripe (for billing)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Feature Flags
VITE_ENABLE_MONITORING=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_BILLING=true
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── ui/              # Reusable UI components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Projects.jsx     # Project management
│   ├── Deployments.jsx  # Deployment history
│   └── Settings.jsx     # User settings
├── contexts/            # React contexts
│   ├── AppContext.jsx   # Application state
│   └── AuthContext.jsx  # Authentication state
├── services/            # API and business logic
│   ├── api.js          # API service layer
│   ├── billingService.js # Stripe integration
│   ├── healthMonitor.js  # Health monitoring
│   └── deploymentPipeline.js # Deployment automation
├── utils/               # Utility functions
│   ├── errorHandler.js  # Error handling system
│   └── cn.js           # Class name utilities
└── App.jsx             # Main application component
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL | Yes |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth client ID | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | For billing |
| `VITE_ENABLE_MONITORING` | Enable health monitoring | No |
| `VITE_ENABLE_ANALYTICS` | Enable analytics features | No |
| `VITE_ENABLE_BILLING` | Enable billing features | No |

### Supported Frameworks

| Framework | Build Command | Start Command | Port |
|-----------|---------------|---------------|------|
| React | `npm run build` | `npm start` | 3000 |
| Next.js | `npm run build` | `npm start` | 3000 |
| Vue.js | `npm run build` | `npm run serve` | 8080 |
| Node.js | `npm install` | `npm start` | 3000 |
| Python | `pip install -r requirements.txt` | `python app.py` | 5000 |

### Cloud Providers

| Provider | Type | Supported Frameworks |
|----------|------|---------------------|
| Vercel | Serverless | React, Next.js, Vue.js |
| Netlify | Static | React, Vue.js |
| AWS | Container | All frameworks |
| Google Cloud | Container | All frameworks |
| DigitalOcean | Container | All frameworks |

## 📊 Subscription Plans

### Free Tier
- 3 projects
- 5 deployments/day
- 50 deployments/month
- 1GB storage
- Community support

### Pro ($29/month)
- 25 projects
- 50 deployments/day
- 1,000 deployments/month
- 50GB storage
- Email support
- Advanced monitoring
- Analytics

### Enterprise ($99/month)
- Unlimited projects
- Unlimited deployments
- 500GB storage
- 24/7 priority support
- SLA guarantee
- Advanced features

## 🔐 Security Features

- **OAuth Authentication** - Secure GitHub integration
- **Error Boundaries** - Graceful error handling
- **Input Validation** - Comprehensive form validation
- **Secret Management** - Secure environment variable handling
- **HTTPS Enforcement** - Secure communication
- **Rate Limiting** - API abuse prevention

## 🚀 Deployment Pipeline

### Automated Stages
1. **Initialization** - Project validation and setup
2. **Repository Cloning** - Source code retrieval
3. **Project Analysis** - Framework detection and configuration
4. **Dependency Installation** - Package management
5. **Testing** - Automated test execution (optional)
6. **Building** - Application compilation
7. **Containerization** - Docker image creation (if needed)
8. **Registry Push** - Container registry upload
9. **Cloud Deployment** - Provider-specific deployment
10. **Health Checks** - Application monitoring and validation

### Health Monitoring
- Real-time health checks
- Performance metrics collection
- Automated rollback on failures
- Alert notifications
- Historical data tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user

### Project Management
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Deployment Operations
- `POST /api/deployments` - Create deployment
- `GET /api/deployments` - List deployments
- `GET /api/deployments/:id/logs` - Get deployment logs
- `POST /api/projects/:id/rollback` - Rollback deployment

### Billing & Subscriptions
- `GET /api/billing/subscription` - Get subscription
- `POST /api/billing/subscription` - Create subscription
- `GET /api/billing/invoices` - List invoices
- `POST /api/billing/payment-methods` - Add payment method

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version (18+ required)
- Clear node_modules and reinstall dependencies
- Verify environment variables are set correctly

**Authentication Issues**
- Verify GitHub OAuth app configuration
- Check redirect URLs match exactly
- Ensure environment variables are properly set

**Deployment Failures**
- Check cloud provider credentials
- Verify project configuration
- Review deployment logs for specific errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [Stripe](https://stripe.com/) - Payment processing
- [GitHub API](https://docs.github.com/en/rest) - Repository integration

## 📞 Support

- 📧 Email: support@deploygenie.com
- 📚 Documentation: https://docs.deploygenie.com
- 🐛 Issues: [GitHub Issues](https://github.com/vistara-apps/this-is-a-1532/issues)
- 💬 Discord: [Join our community](https://discord.gg/deploygenie)

---

**Made with ❤️ by the DeployGenie team**
