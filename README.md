# FitTracker App

FitTracker is a personal fitness companion designed to help you track your workouts, set goals, and achieve your fitness dreams.

## Features

- **User Authentication**: Secure sign-up and login with Supabase.
- **Dashboard**: Overview of your fitness stats, recent activity, and quick actions.
- **Workout Tracking**: Log detailed workouts including type, duration, intensity, calories burned, equipment, and notes.
- **Workout History**: Comprehensive table of all your workouts with filtering and search capabilities.
- **Fitness Goals**: Set and track progress towards various fitness goals (weekly workouts, monthly duration, etc.).
- **Calendar View**: Visualize your planned and completed workouts on a calendar.
- **User Profile**: Manage personal information, preferences (units, theme), and security settings.
- **Responsive Navigation**: Seamless navigation across all pages on different devices.
- **Supabase Integration**: Backend powered by Supabase for database and authentication.
- **Data Export**: Export your workout history to CSV.

## Project Structure

The project follows a modular structure with all application code residing in the `src/` directory.

\`\`\`
.
├── public/
├── src/
│   ├── app/                  # Next.js App Router pages and layouts
│   │   ├── (auth)/           # Authentication routes (login, signup)
│   │   ├── about/
│   │   ├── calendar/
│   │   ├── dashboard/
│   │   ├── goals/
│   │   ├── history/
│   │   ├── profile/
│   │   ├── workouts/
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/           # Reusable React components
│   │   ├── forms/            # Form-specific components
│   │   ├── layout/           # Layout-specific components (navigation, auth-wrapper)
│   │   └── ui/               # Shadcn UI components
│   ├── contexts/             # React Contexts (e.g., AuthContext)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Utility functions, Supabase client, etc.
│   ├── migrations/           # SQL migration files for Supabase schema
│   └── types/                # TypeScript type definitions
├── .env.example
├── components.json           # Shadcn UI configuration
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or Yarn
- A Supabase project

### Installation

1.  **Clone the repository:**
    \`\`\`bash
    git clone <repository-url>
    cd FitTracker
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

3.  **Set up Supabase:**
    - Create a new Supabase project at [supabase.com](https://supabase.com/).
    - Go to "Project Settings" -> "API" to find your `Project URL` and `anon public` key.
    - Go to "Project Settings" -> "API Keys" to find your `service_role` key.
    - Create a `.env.local` file in the root of your project and add your Supabase credentials:
      \`\`\`
      NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
      \`\`\`

4.  **Run Supabase Migrations:**
    - Navigate to the `src/migrations` folder.
    - Execute the SQL files in order (001 to 006) in your Supabase SQL Editor. This will set up your database schema, RLS policies, and triggers.

5.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Feel free to open issues or submit pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).
