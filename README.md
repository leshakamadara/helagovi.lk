
<div align="center">
  <img src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png" alt="Helagovi.lk Logo" width="200"/>
</div>

# 🛠️ Helagovi.lk Git Workflow

---

## Step A: Clone the Repository

```bash
git clone https://github.com/leshakamadara/helagovi.lk.git
cd helagovi.lk
```

---

## 🔄 Step B: Switch to `dev` Branch and Pull Latest Changes

```bash
git checkout dev
git pull origin dev
```

> 💡 **Note:** `dev` is the integration branch for all features. Always start from here.

---

## 🌿 Step C: Create Your Feature Branch

```bash
git checkout -b feature/order-management
```

> **Replace** `order-management` with your task name.
> **Convention:** `feature/<your-task-name>`

## Example Feature Branch Names

* `feature/order-management`
* `feature/product-listing`
* `feature/user-management`
* `feature/payment`

* **Local branch created first**
* **Push to GitHub** after you start committing changes



## ❓ Feature Branch Creation: Local vs Remote

* Feature branches are **created locally** on each team member’s machine.
* After creating locally, you **push them to GitHub** so others can see/review.
* **Example:** `git checkout -b feature/user-management` → local branch
  → `git push -u origin feature/user-management` → now branch exists remotely.

> **do not create feature branches directly on GitHub** - Standard workflow is local → push.


---

## 💻 Step D: Work Locally

### 1. Install Dependencies (if needed)

```bash
# Backend
cd backend
npm install
cd ..

# Frontend  
cd frontend
npm install
cd ..
```

> Each developer installs both **frontend and backend dependencies** to work locally.

### 2. Development Process

* Make changes in **frontend/** or **backend/** folders
* Test your feature locally
* Ensure everything works as expected

---

## 📝 Step E: Stage & Commit Changes

```bash
git add .
git commit -m "Add order management feature"
```

> ✨ **Tip:** Keep commit messages short and descriptive.

---

## 🚀 Step F: Push Feature Branch to GitHub

```bash
git push -u origin feature/order-management
```

* This creates the branch **on GitHub** after it was first created **locally**

---

## 🔍 Step G: Create Pull Request (PR)

### Process:

1. Go to your repository on GitHub
2. Click **"Compare & pull request"** for your branch
3. **Ensure the following settings:**

   * **Base branch:** `dev`
   * **Compare branch:** your feature branch (`feature/order-management`)
4. Add a clear title & description of your feature
5. Request review from at least **one team member**
6. Click **"Create Pull Request"** ✅

---

## ✅ Step H: Merge After Approval

* Once PR is **approved**, merge into `dev` branch
* **Optionally:** Delete the feature branch after successful merge

---

## 🔄 Step I: Keep Your Branch Updated

```bash
git checkout dev
git pull origin dev
git checkout feature/order-management
git rebase dev   # or git merge dev
```

> ⚠️ **Important:** Regularly update your branch to avoid merge conflicts

---

## Quick Reference Summary

| Branch Type  | Purpose                                                            |
| ------------ | ------------------------------------------------------------------ |
| `dev`        | Integration branch for all features                                |
| `feature/*`  | Individual feature development branches (local first, then pushed) |
| Pull Request | Merge path: Feature → Dev                                          |
| `main`       | Stable production branch (merge from dev after testing)            |

---

## 🎯 Quick Command Reference

| Action                    | Command                        |
| ------------------------- | ------------------------------ |
| Clone repo                | `git clone <repo-url>`         |
| Switch branch             | `git checkout <branch-name>`   |
| Create new branch (local) | `git checkout -b <new-branch>` |
| Stage changes             | `git add .`                    |
| Commit                    | `git commit -m "message"`      |
| Push feature branch       | `git push -u origin <branch>`  |
| Update branch             | `git pull origin <branch>`     |

---

✅ **Summary Notes**

1. **Clone repo → checkout dev → pull** to start fresh.
2. **Create feature branch locally** → work → push → PR → merge to dev.
3. **Dependencies:** Install **both frontend and backend** before starting.
4. **Never commit directly to main** — always work on feature branch first.
