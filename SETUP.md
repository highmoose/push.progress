# Push Progress - Installation & Setup Instructions

## Prerequisites

- Node.js 18+ installed
- MySQL database (IONOS or any MySQL server)
- Access to database credentials

## Step 1: Install Dependencies

Run the following command to install all required packages:

```bash
npm install mysql2 @visx/group @visx/scale @visx/shape @visx/axis @visx/grid @visx/curve @visx/responsive
```

## Step 2: Database Setup

1. Log into your IONOS (or other) MySQL phpMyAdmin
2. Open the SQL tab
3. Copy the entire contents of `database/schema.sql`
4. Paste and execute the SQL commands
5. Verify that the following tables were created:
   - users
   - exercises
   - user_exercises
   - exercise_records

## Step 3: Configure Database Connection

1. Open `.env.local` in the project root
2. Update with your actual database credentials:

```env
DB_HOST=your-actual-database-host.ionos.com
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=push_progress
DB_PORT=3306
```

**Important:** Make sure `.env.local` is in your `.gitignore` file!

## Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Step 5: First Login

Use one of these credentials:

- **Username:** Adam, **Password:** Letmein123
- **Username:** Cory, **Password:** Cory123

## Project Structure

```
push-progress/
├── src/
│   ├── app/
│   │   ├── api/              # Next.js API routes
│   │   │   ├── auth/
│   │   │   ├── exercises/
│   │   │   ├── records/
│   │   │   ├── comparison/
│   │   │   └── user-exercises/
│   │   ├── home/             # Main app page
│   │   ├── page.js           # Login page
│   │   └── layout.js         # Root layout
│   ├── components/           # React components
│   │   ├── ExerciseDrawer.js
│   │   ├── ComparisonDrawer.js
│   │   ├── AddExerciseModal.js
│   │   └── LineChart.js
│   ├── hooks/                # API hooks
│   │   ├── useAuth.js
│   │   ├── useExercises.js
│   │   ├── useRecords.js
│   │   └── useComparison.js
│   └── lib/                  # Utilities
│       ├── db.js             # Database connection
│       └── constants.js      # App constants
└── database/
    └── schema.sql            # Database schema
```

## Features Implemented

### User Features

- ✅ Login system (Adam & Cory)
- ✅ Personalized exercise lists
- ✅ Exercise tracking (weight & reps)
- ✅ Progress visualization with charts
- ✅ User comparison mode

### Exercise Management

- ✅ Create exercises (shared between users)
- ✅ Add/remove exercises from personal list
- ✅ Filter by muscle group or exercise type
- ✅ Soft delete exercises

### Tracking & Analytics

- ✅ Record weight and reps with dates
- ✅ VISX charts for progress visualization
- ✅ Date filters (All time, 30 days, 3 months, 1 year)
- ✅ Compare progress with other user
- ✅ Muscle group average comparison

## Design System

The app follows a **dark futuristic design**:

- Background: `#0a0a0a`, `#1a1a1a`
- Borders: `#2a2a2a`
- Fonts: **Roboto** (body), **Tektur** (UI elements)
- Accent: Blue (`#3b82f6`) for primary user, Orange (`#f97316`) for comparison

## Troubleshooting

### Database connection fails

- Verify `.env.local` credentials
- Check if database exists
- Ensure MySQL is running
- Verify firewall allows connection

### Charts not displaying

- Check browser console for errors
- Verify `@visx` packages are installed
- Ensure data is being returned from API

### Login not working

- Verify users table has data
- Check browser console for API errors
- Ensure `/api/auth/login` route is working

## Next Steps

To continue development, reference the **Design System Prompt**:

```
Follow this design system for all pages:

THEME: Dark minimalist with futuristic aesthetic
- Background: #0a0a0a (primary), #1a1a1a (secondary/elevated surfaces)
- Borders: #2a2a2a (default), #444 (hover/active states)
- Text: white (primary), gray-400 (secondary), gray-500/600 (tertiary)

TYPOGRAPHY:
- Primary font: Roboto (body text, paragraphs, general content)
- UI/Accent font: Tektur (inputs, buttons, headings, interactive elements)

COMPONENTS:
- Buttons: Rounded borders (rounded-md), subtle backgrounds, border-based states
- Inputs: Transparent backgrounds, #2a2a2a borders, minimal styling
- Cards/Sections: Gradient backgrounds (from-[#1a1a1a] via-[#0f0f0f] to-[#0a0a0a])

MOBILE-FIRST: Optimize for mobile screens, vertical layouts
```

## Support

For issues or questions, check:

1. Browser console for errors
2. Network tab for failed API calls
3. Database for missing data
4. `.env.local` configuration
