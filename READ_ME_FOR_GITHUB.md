# GitHub Setup Instructions

Your project files are ready in this folder. To push this to GitHub, follow these steps:

1.  **Open a terminal in this folder** (Right-click > Open in Terminal).
2.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for hyperslump"
    ```
3.  **create a new repository on GitHub** (https://github.com/new).
4.  **Link and Push**:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/hyperslump.git
    git branch -M main
    git push -u origin main
    ```

## Important Notes
-   `.env.local` contains your API keys. It is ignored by git (via `.gitignore`) so your secrets won't be public.
-   `node_modules` is ignored. You or Vercel will run `npm install` to get dependencies.
