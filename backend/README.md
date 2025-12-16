# Club Membership Backend (Clean)

## Setup

1. Copy `.env.example` to `.env` and update values:
   - `MONGO_URI`
   - `SESSION_SECRET`
   - `CLIENT_ORIGIN`

2. Install dependencies:
   ```bash
   npm install
   ```

3. Seed the mini clubs (optional but recommended):
   ```bash
   npm run seed:clubs
   ```
   
   This will create the following mini clubs in your database:
   - 🏡 Cozy and Lifestyle Club
   - 📚 Academic Club
   - 🎨 Creative and Fun Club
   - 🤝 Social and Community Club
   - 💻 Tech and Skill Club

4. Start the development server:
