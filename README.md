# 2+1 Admin Panel

A modern, responsive admin panel built with Next.js for managing the 2+1 dating app platform. This admin panel provides comprehensive tools for user management, content moderation, and platform analytics.

## 🚀 Features

### User Management
- **All Members**: View, search, and filter all registered users
- **New Signups**: Review and approve new user registrations
- **Premium Members**: Manage premium subscriptions and memberships
- **Banned Users**: View and manage suspended/banned accounts

### Content Moderation
- **Profile Verifications**: Review and approve user verification requests with video preview
- **Reported Content**: Handle user reports and take moderation actions
- **Media Moderation**: Review and moderate uploaded content

### Community Features
- **Messenger Monitoring**: Monitor private messages and conversations
- **Live Chatrooms**: Manage public and private chat rooms
- **Groups**: Oversee user-created groups and communities
- **Events & Parties**: Manage dating events and social gatherings

### Analytics & Insights
- **User Statistics**: Track user engagement and platform growth
- **Engagement Metrics**: Monitor user interactions and activity
- **Revenue Reports**: View subscription and payment analytics

### System Settings
- **Payment Configuration**: Manage payment gateways and pricing
- **Email Templates**: Customize automated email communications
- **API Settings**: Configure API endpoints and integrations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Charts**: Recharts

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://46.202.189.73:88
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NODE_ENV=development
   ```

4. **Start the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to view the admin panel.

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Layout.jsx          # Main layout wrapper
│   │   └── Sidebar.jsx         # Navigation sidebar
│   ├── hooks/
│   │   ├── useUsers.js         # User management hooks
│   │   ├── useReports.js       # Content moderation hooks
│   │   └── useVerifications.js # Profile verification hooks
│   ├── lib/
│   │   ├── api.js             # API client and endpoints
│   │   ├── config.js          # App configuration
│   │   └── utils.js           # Utility functions
│   ├── pages/
│   │   ├── index.js           # Dashboard overview
│   │   ├── members.js         # All members page
│   │   ├── signups.js         # New signups page
│   │   ├── reports.js         # Reported content page
│   │   ├── banned.js          # Banned users page
│   │   └── verifications.js   # Profile verifications page
│   └── styles/
│       └── globals.css        # Global styles and CSS variables
├── components.json            # shadcn/ui configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json
```

## 🔗 API Integration

The admin panel integrates with the 2+1 Dating App Backend API. All API endpoints are configured in `src/lib/api.js` and organized by functionality:

### Available API Modules
- **Authentication API**: User login, signup, password reset
- **User Management API**: CRUD operations for users
- **Content Moderation API**: Report handling and content review
- **Profile Verification API**: Verification request management
- **Messaging API**: Message and conversation management
- **Chat Rooms API**: Chat room and live functionality
- **Groups API**: Community group management
- **Media API**: File upload and management

### API Configuration
The base API URL is configured in `src/lib/config.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://46.202.189.73:88',
  TIMEOUT: 10000,
};
```

## 🎨 UI Components

The admin panel uses shadcn/ui components for a consistent and modern design:

- **Button**: Various button styles and sizes
- **Card**: Content containers with headers and footers
- **Input**: Form input fields with validation
- **Badge**: Status indicators and labels
- **Table**: Data tables with sorting and pagination
- **Dialog**: Modal dialogs and confirmations

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- **Desktop**: Full-featured layout with sidebar navigation
- **Tablet**: Responsive grid layouts and collapsible sidebar
- **Mobile**: Touch-friendly interface with drawer navigation

## 🔒 Authentication

Authentication is handled through JWT tokens stored in localStorage:
- Login redirects to dashboard on success
- Automatic token refresh for expired sessions
- Logout clears stored tokens and redirects to login

## 📊 Data Management

### Custom Hooks
- **useUsers**: Manages user data, pagination, and actions
- **useReports**: Handles reported content and moderation
- **useVerifications**: Manages profile verification requests

### State Management
- React hooks for local component state
- Custom hooks for API data management
- Error handling and loading states

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Deploy to your hosting platform**
   - Vercel (recommended)
   - Netlify
   - AWS Amplify
   - Docker container

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXTAUTH_URL`: Frontend application URL
- `NEXTAUTH_SECRET`: Authentication secret key

### Tailwind Configuration
Customize colors, fonts, and spacing in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      // ... more colors
    }
  }
}
```

## 📈 Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component for optimized images
- **API Caching**: Request deduplication and caching
- **Lazy Loading**: Components loaded on demand

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **API Request Interceptors**: Automatic token attachment
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Client-side and server-side validation

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify backend server is running
   - Check network connectivity

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Verify JWT token format and expiration
   - Check API authentication endpoints

3. **Styling Issues**
   - Run `npm run build` to ensure Tailwind classes are compiled
   - Check for conflicting CSS classes
   - Verify shadcn/ui component imports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation for backend integration

---

**Built with ❤️ for the 2+1 Dating App Platform**