# 🌍 GlobeTrotter

A modern, feature-rich travel planning application built with Next.js, designed to help users plan, organize, and share their travel adventures.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ecf8e?style=flat-square&logo=supabase)

## ✨ Features

### 🗺️ Trip Planning
- **Create & Manage Trips** - Plan your adventures with detailed itineraries
- **Interactive Calendar** - Visualize your trips on a beautiful calendar interface
- **Budget Tracking** - Keep track of expenses and stay within budget
- **Multi-Stop Itineraries** - Plan complex trips with multiple destinations

### 🎯 Smart Features
- **AI Recommendations** - Get personalized travel suggestions
- **Regional Discovery** - Explore destinations based on your location
- **Activity Search** - Find activities and attractions at your destination
- **Community Feed** - Share your trips and get inspired by others

### 👥 Social Features
- **Community Sharing** - Share your travel experiences with photos
- **Comments & Likes** - Engage with other travelers
- **User Profiles** - Showcase your travel history

### 💰 Budget Management
- **User Budget** - Set and track your overall travel budget
- **Trip Budgets** - Individual budget tracking for each trip
- **Expense Categories** - Organize spending by category

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Image Upload**: [Cloudinary](https://cloudinary.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database
- **Supabase** account (for authentication)
- **Cloudinary** account (for image uploads)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/OP-Prajwal/GlobeTrotter.git
cd globetrotter
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Optional: API Keys for external services
# Add any additional API keys here
```

### 4. Database Setup

Run Drizzle migrations to set up your database schema:

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# (Optional) Open Drizzle Studio to view your database
npx drizzle-kit studio
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
globetrotter/
├── app/                      # Next.js App Router pages
│   ├── actions/             # Server actions
│   ├── admin/               # Admin pages
│   ├── calendar/            # Calendar view
│   ├── community/           # Community feed
│   ├── create-trip/         # Trip creation
│   ├── dashboard/           # Main dashboard
│   ├── my-trips/            # User's trips
│   ├── profile/             # User profile
│   ├── recommend/           # Recommendations
│   ├── search/              # Search functionality
│   ├── trips/               # Trip details & budget
│   └── user-budget/         # Budget management
├── components/              # React components
│   ├── dashboard/           # Dashboard components
│   ├── profile/             # Profile components
│   └── shared/              # Shared components (AppHeader, etc.)
├── lib/                     # Utility libraries
│   ├── actions/             # Server-side actions
│   ├── api/                 # API utilities
│   ├── db/                  # Database configuration
│   └── supabase/            # Supabase client
├── public/                  # Static assets
└── scripts/                 # Utility scripts
```

## 🎨 Key Features Explained

### Glass UI Design
The application features a modern glassmorphism design with:
- Translucent backgrounds with backdrop blur
- Subtle borders and shadows
- Smooth animations and transitions
- Dark theme optimized for readability

### Hamburger Navigation
- Accessible from every page
- Smooth slide-out animation
- Quick access to all major features:
  - Dashboard
  - Calendar
  - My Trips
  - Create Trip
  - User Budget
  - Recommendations
  - Community
  - Search
  - Profile

### Real-time Features
- Live search with debouncing
- Real-time comment updates
- Instant UI feedback
- Optimistic updates

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Database
npx drizzle-kit generate   # Generate migrations
npx drizzle-kit push       # Push schema to database
npx drizzle-kit studio     # Open Drizzle Studio

# Linting
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud

Make sure to:
1. Set all environment variables
2. Configure PostgreSQL database
3. Set up Supabase authentication
4. Configure Cloudinary for image uploads

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Prajwal**
- GitHub: [@OP-Prajwal](https://github.com/OP-Prajwal)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for authentication
- Drizzle team for the excellent ORM
- All open-source contributors

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ by Prajwal
