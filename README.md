Absolutely! I can convert the guide into a **ready-to-use `README.md`** format for your repo. Here’s a clean version you can paste directly into your repo:

````markdown
# 🛠 Helagovi.lk Git Workflow Guide

**Repo:** [https://github.com/leshakamadara/helagovi.lk](https://github.com/leshakamadara/helagovi.lk)  
**Team size:** 4  
**VSCode users** – all commands run in VSCode terminal.  

---

## Step A: Clone the repo
```bash
git clone https://github.com/leshakamadara/helagovi.lk.git
cd helagovi.lk
````

---

## Step B: Switch to `dev` branch and pull latest changes

```bash
git checkout dev
git pull origin dev
```

> 💡 `dev` is the integration branch for all features. Always start from here.

---

## Step C: Create your feature branch

```bash
git checkout -b feature/order-management
```

> Replace `order-management` with your task.
> Convention: `feature/<your-task-name>`

---

## Step D: Work locally

1. Install dependencies **if needed**:

   ```bash
   # Backend
   cd server
   npm install
   cd ..

   # Frontend
   cd client
   npm install
   cd ..
   ```
2. Make changes in **client/** or **server/** folders.
3. Test your feature locally.

---

## Step E: Stage & commit changes

```bash
git add .
git commit -m "Add order management feature"
```

> Keep commit messages short and descriptive.

---

## Step F: Push feature branch to GitHub

```bash
git push -u origin feature/order-management
```

---

## Step G: Create Pull Request (PR)

1. Go to your repo on GitHub.
2. Click **Compare & pull request** for your branch.
3. Ensure:

   * **Base branch:** `dev`
   * **Compare branch:** your feature branch (`feature/order-management`)
4. Add title & description of your feature.
5. Request review from at least **one team member**.
6. Click **Create Pull Request** ✅

---

## Step H: Merge after approval

* Once PR is approved, merge into **dev**.
* Optionally, delete the feature branch after merge.

---

## Step I: Keep your branch updated

```bash
git checkout dev
git pull origin dev
git checkout feature/order-management
git rebase dev   # or git merge dev
```

> Regularly update your branch to avoid conflicts.

---

## ✅ Summary for team

| Branch type  | Purpose                                                 |
| ------------ | ------------------------------------------------------- |
| `dev`        | Integration branch for all features                     |
| `feature/*`  | Each member works here                                  |
| Pull Request | Feature → Dev                                           |
| `main`       | Stable production branch (merge from dev after testing) |

**Example Feature Branch Names:**

* `feature/order-management`
* `feature/product-listing`
* `feature/user-management`
* `feature/payment-logistics`

```

---

If you want, I can **also add a small ASCII diagram or flowchart** showing `feature/* → dev → main` so it’s visually clearer for your team.  

Do you want me to add that?
```
