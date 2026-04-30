# GutCheck - Node.js Installation Instructions

## Install Node.js on macOS

You have several options to install Node.js:

### Option 1: Using Homebrew (Recommended)

1. **Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install Node.js**:
```bash
brew install node
```

3. **Verify installation**:
```bash
node --version
npm --version
```

### Option 2: Using Official Installer

1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer package (.pkg file)
4. Follow the installation wizard
5. Verify installation in terminal:
```bash
node --version
npm --version
```

### Option 3: Using nvm (Node Version Manager)

1. **Install nvm**:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

2. **Restart your terminal or run**:
```bash
source ~/.bash_profile
```

3. **Install Node.js**:
```bash
nvm install --lts
nvm use --lts
```

4. **Verify installation**:
```bash
node --version
npm --version
```

## After Installing Node.js

Once Node.js is installed, return to this directory and let me know. I'll then:

1. Create the complete Next.js project structure
2. Set up all dependencies
3. Configure Prisma with SQLite
4. Build all the features
5. Create seed data
6. Provide a demo walkthrough

## Quick Start (After Node.js is Installed)

You'll be able to run:
```bash
npm install
npm run seed
npm run dev
```

Then open http://localhost:3000 in your browser.

---

**Let me know once Node.js is installed and I'll continue building the GutCheck MVP!**