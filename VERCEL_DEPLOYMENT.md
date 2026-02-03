# Vercel Deployment Issues

If you are seeing a **404: NOT_FOUND** error regarding `Code: NOT_FOUND`, it typically means Vercel cannot find the deployed application or its entry point.

## 1. Verify Root Directory
Your project seems to be in the `igac-app` folder inside your repository.

**You must configure Vercel to look in the correct folder:**
1. Go to your Vercel Dashboard -> Project Settings -> **General**.
2. Look for **Root Directory**.
3. It should be set to `igac-app` (if that is the folder name in your git repo).
4. If it is currently `./` (root), Vercel is trying to build the parent folder, failing to find `package.json` at the root, and deploying nothing (or a 404).

## 2. Verify Build Command
Ensure the **Framework Preset** is set to **Next.js**.
- Build Command: `next build`
- Output Directory: `.next`

## 3. Deployment URL
After changing the Root Directory, you must **Redeploy** (go to Deployments -> Redeploy) for changes to take effect.

## 4. Assets & Images
We have renamed `public/past events` to `public/past-events` to avoid issues with spaces in URLs. The configuration file was updated automatically.
