# Pharmacy Management System

A comprehensive pharmacy management system built with React, TypeScript, and Supabase.

## Setup Instructions

### 1. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Supabase Configuration

**Important**: To resolve signup issues, you need to configure your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. **Disable reCAPTCHA protection** (recommended for development):
   - Toggle off "Enable reCAPTCHA protection"
4. **Disable email confirmation** (optional for development):
   - Toggle off "Enable email confirmations"
5. **Configure allowed domains** (if needed):
   - Add `localhost:5173` to allowed origins

### 3. Installation

```bash
npm install
npm run dev
```

## Troubleshooting

### "captcha verification process failed" Error

This error occurs when reCAPTCHA is enabled in Supabase. To fix:

1. **Option 1 (Recommended for Development)**: Disable reCAPTCHA in Supabase Dashboard
2. **Option 2 (Production)**: Implement reCAPTCHA on the frontend

### Authentication Issues

- Ensure your `.env` file has the correct Supabase URL and anon key
- Check that your Supabase project is active and accessible
- Verify that email confirmation settings match your development needs

## Features

- User authentication and authorization
- Medicine inventory management
- Sales and purchase tracking
- Patient management
- Financial reporting
- Stock alerts and notifications

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite