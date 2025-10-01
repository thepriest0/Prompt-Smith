# Prompt Smith# React + TypeScript + Vite



A modern AI-powered prompt generation tool for creating professional illustration and image prompts.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 FeaturesCurrently, two official plugins are available:



- **AI-Powered Generation**: Uses GPT-4.1 Mini via GitHub Models for intelligent prompt creation- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh

- **Image Analysis**: Upload reference images with Google Vision API for style extraction- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Smart Tool Recommendations**: Suggests the best AI tools (free and paid) for your project

- **Color Palette Control**: Manual color selection with smart priority over image colors## React Compiler

- **Multiple Styles**: Support for various illustration styles (flat vector, isometric, 3D render, etc.)

- **Aspect Ratio Selection**: Common ratios for different use casesThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- **User Authentication**: Google OAuth integration for saving favorite prompts

## Expanding the ESLint configuration

## 🛠️ Tech Stack

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS

- **Backend**: Node.js + Express```js

- **Database**: Xata (serverless PostgreSQL)export default defineConfig([

- **AI Services**:   globalIgnores(['dist']),

  - GitHub Models (GPT-4.1 Mini)  {

  - Google Vision API (image analysis)    files: ['**/*.{ts,tsx}'],

- **Image Storage**: Cloudinary    extends: [

- **Deployment**: Render-ready      // Other configs...



## 🔧 Local Development      // Remove tseslint.configs.recommended and replace with this

      tseslint.configs.recommendedTypeChecked,

1. **Clone and install**:      // Alternatively, use this for stricter rules

   ```bash      tseslint.configs.strictTypeChecked,

   git clone <your-repo>      // Optionally, add this for stylistic rules

   cd prompt-smith      tseslint.configs.stylisticTypeChecked,

   npm install

   ```      // Other configs...

    ],

2. **Set up environment variables**:    languageOptions: {

   ```bash      parserOptions: {

   cp .env.example .env        project: ['./tsconfig.node.json', './tsconfig.app.json'],

   # Edit .env with your API keys        tsconfigRootDir: import.meta.dirname,

   ```      },

      // other options...

3. **Run development servers**:    },

   ```bash  },

   npm run dev:both])

   ``````



   This starts:You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

   - Frontend dev server: http://localhost:5173

   - Backend API server: http://localhost:3000```js

// eslint.config.js

## 🌐 Deploymentimport reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

Ready for Render deployment with:

- `render.yaml` configurationexport default defineConfig([

- Production build scripts  globalIgnores(['dist']),

- Environment variable templates  {

- CORS and security configurations    files: ['**/*.{ts,tsx}'],

    extends: [

## 📁 Project Structure      // Other configs...

      // Enable lint rules for React

```      reactX.configs['recommended-typescript'],

src/      // Enable lint rules for React DOM

├── components/          # React components      reactDom.configs.recommended,

├── services/           # API services (AI, image analysis)    ],

├── utils/              # Utility functions    languageOptions: {

└── contexts/           # React contexts      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

server/        tsconfigRootDir: import.meta.dirname,

├── routes/             # Express API routes      },

├── database-init.js    # Database setup      // other options...

└── server.js          # Main server file    },

```  },

])

## 🔑 Required Environment Variables```


See `.env.example` for the complete list of required environment variables including API keys for GitHub Models, Google Vision, Xata database, and Cloudinary.

## 📝 License

MIT License