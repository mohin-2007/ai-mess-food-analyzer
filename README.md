# AI-Powered Mess Food Nutrition Analyzer

A modern, full-stack web application designed to analyze mess or cafeteria food plates using the **Google Gemini 1.5 Flash Vision API**. By simply uploading an image of a meal, students and professionals can instantly estimate calorie counts, evaluate macronutrients, review health indexes, obtain dietitian suggestions, calculate BMI, estimate daily TDEE targets, and generate PDF reports. All previous analysis results are kept locally in your browser using secure history logging.

## Key Features
- **AI Vision Analysis**: Snap a picture of a thali or plate to automatically detect multiple food items.
- **Macronutrient Approximations**: Instant estimations for Calories, Proteins, Carbohydrates, and Fats.
- **Health Index Ring**: Circular visualization indicating the meal's balanced index value (Highly Nutritious, Moderately Balanced, or Nutritionally Deficient).
- **Dietary Advisory**: Direct recommendations outlining structural nutritional strengths, weaknesses, and improvement steps.
- **Personal Health Trackers**: Integrated Metric/Imperial BMI and Daily Caloric Requirement calculators.
- **PDF Report Downloads**: Download beautiful, printable, clean summaries of your meal dashboard.
- **Persistent Logs**: Keep history locally in the browser securely. Resizes image canvas before storing to safeguard LocalStorage quotas.
- **Responsive Layout**: Designed for mobile and desktop screens using modern CSS properties, animations, and dark/light modes.
- **Safe for Public Repos**: The Gemini API key is securely loaded in Node.js serverless functions, keeping client code safe.

---

## File Tree
```
ai_mess_food_analyzer/
├── api/
│   └── analyze.js       # Vercel Serverless NodeJS handler (Integrates Gemini Vision)
├── .gitignore           # Excludes local caches, environment variables, node_modules
├── index.html           # Main semantic HTML dashboard and page sections
├── style.css            # Custom CSS properties, animations, and dark mode theme
├── script.js           # Client-side routing, canvas resizing, DOM renderers, and pdf generators
├── vercel.json          # Serverless routing configuration
├── package.json         # Node.js manifest and dependencies (@google/generative-ai)
└── README.md            # Setup guidelines, deployment scripts, and testing manual
```

---

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher) installed locally.
- [Vercel CLI](https://vercel.com/docs/cli) installed (for local backend function execution). You can install it globally using:
  ```bash
  npm install -g vercel
  ```
- A **Google Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/)).

### Local Installation
1. Clone this repository or open the folder in your terminal.
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Environment Variable Setup

To keep the application safe for public GitHub repositories, **never** hardcode the Gemini API key in frontend files. It must be provided as an environment variable to the backend runtime.

### Local Environment Configuration
1. In the project root folder, create a file called `.env` (or `.env.local`):
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
2. Save the file. (The `.gitignore` configuration will prevent this file from being committed).

---

## Vercel Deployment Instructions

This project is configured as a zero-config deployment for **Vercel** serverless environments.

### Option 1: Deploying via Vercel CLI (Recommended)
1. Run the local development server to test:
   ```bash
   vercel dev
   ```
   *Note: This command spins up a local instance of Vercel Serverless Functions on `http://localhost:3000` and automatically loads your local `.env` variables.*
2. Deploy a preview build to Vercel:
   ```bash
   vercel
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Deploying via Vercel Web Dashboard
1. Push your project to a public or private GitHub repository.
2. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
3. Import your repository.
4. Expand the **Environment Variables** accordion and add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `[Your Gemini API Key]`
5. Click **Deploy**. Vercel will automatically configure the routing rules and serverless directories.

---

## Testing Instructions

### 1. Verification of the Serverless Function
- Start your server locally using:
  ```bash
  vercel dev
  ```
- Make a manual `POST` request to `http://localhost:3000/api/analyze` using a tool like Postman or Curl, passing a sample Base64 image in the body:
  ```json
  {
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
  ```
- Verify the response has a `200 OK` status and returns a JSON payload matching the target nutrition schema.

### 2. Functional Frontend Test
- Open `http://localhost:3000` (or double-click `index.html` if testing calculator/style utilities without the API backend).
- **Theme check**: Click the floating Moon/Sun icon in the top right to verify that CSS variables successfully switch colors for all cards.
- **Upload test**: Drag any food photo (JPEG/PNG) into the drop zone or browse a file. Verify that a preview displays immediately and the "Analyze Nutrition" button activates.
- **Analysis test**: Click "Analyze Nutrition". Verify the loading overlay displays rotating status messages. When analysis finishes, confirm that:
  - Detected foods populate as badges.
  - Macronutrients load into the sliders.
  - Strengths, weaknesses, and suggestions appear under the dashboard.
- **Calculators test**:
  - Open the **BMI Calculator**. Toggle units between Metric/Imperial, key in test parameters, and verify the score badge and vertical indicator pointer move correctly.
  - Open the **Daily Calorie Calculator**. Enter weight/height stats, change target fitness goals, and confirm the suggested calorie value and macro splits adapt.
- **History test**: Click "Save Report" on a completed analysis. Confirm a record is added to the history table. Test clicking the "Eye" icon to restore findings and the "Trash" icon to delete them.
- **PDF download test**: Click "PDF Report" on the results card. Confirm that your browser prompts a download for a clean, single-page printable PDF containing the dashboard content.
