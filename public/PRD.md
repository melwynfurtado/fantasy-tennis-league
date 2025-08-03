To build a nextjs app using postgres database that allows users to add participants and select teams according to below requirements, the following **core features and logic** should be included:

### **1. Participant & Team Management**

- **Add Participants:**  
  Users can register themselves or others as participants, specifying details like name and email address.

- **Create Teams:**  
  Each participant must create a team of **12 players**:
  - **6 men**
  - **6 women**

### **2. Team Selection Logic**

- **Seed Pool Selection:**  
  Each participant must pick **1 player from each of these four seed pools**:
  - 1–7
  - 8–15
  - 16–23
  - 24–32

- **Seeding Total Validation:**  
  The sum of the seed numbers for the 4 selected players must be **60 or over**. The app should automatically validate this before allowing the team to be finalized.

- **Additional Picks:**  
  - **1 non-seeded player** (not assigned a seed)
  - **1 player outside the top 4 seeds**
  - The seeding of these last two players does **not** count towards the 60+ total.

### **3. Scoring System**

- **Men’s Scoring:**
  - Win 3-0: **5 points** (progresses)
  - Win 3-1: **4 points** (progresses)
  - Win 3-2: **3 points** (progresses)
  - Lose 2-3: **2 points** (eliminated)
  - Lose 1-3: **1 point** (eliminated)
  - Lose 0-3: **0 points** (eliminated)

- **Women’s Scoring:**
  - Win 2-0: **5 points** (progresses)
  - Win 2-1: **3 points** (progresses)
  - Lose 1-2: **1 point** (eliminated)
  - Lose 0-2: **0 points** (eliminated)

- **Bonus Points:**
  - **Double points** per match if:
    - Non-seeded players after round 2
    - Seeded 24–32 after round 3
    - Seeded 16–23 after round 4
    - Seeded 8–15 in quarter-finals
    - All players after semi-finals

### **4. User Interface Features**

- **Player Pool Display:**  
  Show available players, their gender, and seeding. Allow filtering by seed pool and gender.

- **Team Building Validation:**  
  - Ensure gender split (6 men, 6 women)
  - Ensure only one player from each seed pool is selected
  - Validate seeding total (≥60)
  - Ensure correct selection of non-seeded and outside-top-4-seed players

- **Score Tracking:**  
  Allow users to enter match results per player and automatically calculate points (including bonus logic).

- **Leaderboard:**  
  Display participant rankings based on total team points.

### **5. Admin Features (Optional)**

- **Add/Edit Player Database:**  
  Admins can update the list of available players, their gender, and seeding.

- **Manage Participants:**
  Admins can add, edit or delete participants

- **Manage Tournament Rounds:**  
  Advance rounds and apply bonus point rules automatically.

### **6. Technical Implementation Notes**

- This app can be built as a **web app** or a **mobile app**.  
- For a simple version, a single developer can handle the core features if experienced[1][3][7].  
- For a more polished product, include roles like UI/UX designer, backend developer, and QA engineer[1][3][7].

### **Example Team Selection Flow**

1. **Add Participant**
2. **Select 6 men and 6 women**
3. **Pick 1 player from each seed pool (1–7, 8–15, 16–23, 24–32)**
4. **Ensure the sum of these four seed numbers is at least 60**
5. **Pick 1 non-seeded player**
6. **Pick 1 player outside the top 4 seeds**
7. **Submit team (app validates all constraints)**

This structure mirrors popular “build your team” apps in sports, which let users select squads under set rules and track performance[2]. The app logic ensures fairness and automates score calculation, making it easy for participants to engage and compete.

[1] https://www.addevice.io/blog/mobile-app-development-team
[2] https://www.easypromosapp.com/build-your-team/
[3] https://www.leanware.co/insights/mobile-application-development-team
[4] https://pickerwheel.com/tools/random-team-generator/
[5] https://thisisglance.com/learning-centre/what-to-look-for-when-hiring-a-local-app-development-team
[6] https://play.google.com/store/apps/details?id=com.tws99.PoolTeamGenerator&hl=en
[7] https://www.purrweb.com/blog/mobile-app-development-team/
[8] https://app-sorteos.com/en/apps/random-teams-generator
[9] https://vocal.media/writers/how-to-hire-the-right-app-and-software-development-team
[10] https://infrastructure.planninginspectorate.gov.uk/wp-content/ipc/uploads/projects/TR020002/TR020002-003749-Dr%20Philip%20Shotton%20-%20Response%20to%20Deadline%205.pdf
