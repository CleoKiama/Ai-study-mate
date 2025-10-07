# AI Study Mate

An AI-powered study companion that transforms your documents into interactive learning experiences. Upload PDFs and other study materials to generate personalized quizzes and summaries using advanced AI models.

## Features

- **User Authentication** - Secure sign up/login with Better Auth
- **Document Management** - Upload, store, and manage study documents via Llama Cloud
- **AI Quiz Generation** - Create custom quizzes from your documents using Google Gemini and LlamaIndex
- **Document Summaries** - AI-generated summaries of uploaded content (coming soon)
- **Progress Tracking** - Monitor your study performance and quiz scores
- **Responsive UI** - Modern interface built with shadcn/ui components

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Llama Cloud account and API key
- Google Gemini API key

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-study-mate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**

   Create a `.env.` file in the root directory:

   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/database"

   # AI Services
   LLAMA_API_KEY="your-llama-cloud-api-key"
   GEMINI_API_KEY="your-google-gemini-api-key"

   # Optional: Better Auth URL (defaults to http://localhost:3000)
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**

   Push the database schema to your PostgreSQL instance:

   ```bash
   npx drizzle-kit push
   ```

5. **Configure Llama Cloud**

   Update `utils/llama.cloud.server.ts` with your Llama Cloud organization and project details:

   ```typescript
   export const llamaCloudConfig = {
     name: "your-project-name",
     projectName: "your-project",
     organizationId: "your-organization-id",
     apiKey: env.LLAMA_API_KEY,
   };
   ```

## Development

Run the development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Usage

1. **Authentication**
   - Sign up at `/signup`
   - Login at `/login`

2. **Upload Documents**
   - Navigate to `/dashboard/upload`
   - Upload PDF files and study materials
   - View and manage uploaded documents

3. **Generate Quizzes**
   - Go to `/dashboard/quizzes`
   - Select documents to base quizzes on
   - Customize topic, difficulty, and question count
   - Take AI-generated quizzes

4. **View Summaries**
   - Access `/dashboard/summaries` (feature in development)
   - Review AI-generated document summaries

## Configuration Notes

- Update Llama Cloud project settings in `utils/llama.cloud.server.ts`
- Environment variables are validated in `utils/env.server.ts`
- Database schema is defined in `db/schema.ts` and `db/auth-schema.ts`

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **AI/ML**: LlamaIndex, Llama Cloud, Google Gemini
- **UI**: Tailwind CSS + Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Validation**: Zod
- **Type Safety**: TypeScript with strict mode
