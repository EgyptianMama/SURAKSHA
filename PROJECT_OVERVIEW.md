# SURAKSHA: The Future of School Safety

SURAKSHA is an AI-powered, digital ecosystem designed to replace outdated, manual safety procedures with a modern, life-saving platform. This document outlines the current state of our demo and our vision for the final, comprehensive solution.

---

## 🚀 Part 1: Current Demo (Phase 1 - The Foundation)

Our current working prototype establishes a robust foundation for **preparedness and strategic planning**, primarily serving school administrators and teachers.

### 1. AI-Powered Strategic Planning
*   **Blueprint Analysis:** Uses GenAI (Gemini 2.5 Flash) to analyze school blueprints. When a teacher uploads a map and selects a hazard (like Fire or Earthquake), the AI instantly generates hazard-specific, step-by-step evacuation instructions from their specific location. It even includes browser-based **voice guidance** for hands-free assistance during a crisis.
*   **Geospatial Impact Tool:** A predictive tool that helps schools understand the broader situation. By inputting a location and incident type (e.g., Flood in Punjab), the AI predicts regional effects, identifies majorly affected places, and provides a status summary, allowing for better regional coordination.

### 2. Centralized Training & Preparedness
*   **Training Library:** A curated, role-based video library for emergency drills. Administrators can manage these videos, categorizing them into Natural Disasters, Medical Emergencies, or Security Threats, ensuring relevant training is always accessible.
*   **Disaster Simulation:** An interactive, AI-generated training module. It presents teachers with realistic, scenario-based questions about disaster response (e.g., "What is the first step when an earthquake starts in the library?"). The AI evaluates their choices and provides instant, educational feedback to build critical decision-making skills.

### 3. Emergency Communication
*   **Broadcast Alert System:** Allows administrators to send instant, app-wide "EMERGENCY ALERT" notifications. This is coupled with a real email alert system using **Nodemailer**, ensuring that critical information reaches everyone immediately through multiple channels.
*   **Role-Based Access:** The app features a robust permission system. Administrators have full control over video content and broadcasting, while Teachers and Students see dashboards tailored specifically to their needs.

---

## 🌟 Part 2: Future Roadmap (Phase 2 - The Interactive Ecosystem)

The final version of SURAKSHA will move from passive planning to **live, interactive engagement** for the entire school community.

### 1. Real-Time Accountability: The Digital Roster
*   **"I Am Safe" Button:** During an active crisis, every student's app will feature a prominent check-in button.
*   **Live Teacher View:** This is the game-changer. Teachers see a real-time class roster where names turn green as students check in. This transforms a chaotic headcount into a calm, digital process, allowing teachers to instantly identify who is missing and where they were last located.

### 2. Gamified Learning & AR Integration
*   **Safety Hero Pathway:** - "Duolingo-style" interactive learning journey. It uses bite-sized modules and streaks to make disaster education genuinely engaging for children, turning safety training into a fun, daily habit.


### 3. Proactive Community Vigilance
*   **Gemini Newspaper:** A personalized, in-app daily digest powered by GenAI. It provides hyper-local climate news and proactive alerts (e.g., "Heavy rain expected tomorrow, check your evacuation routes") to keep the community informed *before* a crisis hits.
*   **Proactive Hazard Reporting:** An intuitive tool allowing anyone to report a safety hazard (e.g., a blocked fire exit or a broken light) by taking a geo-tagged picture. These reports are instantly sent to the admin dashboard for resolution.

### 4. Data-Driven Improvement
*   **Weekly Suraksha Digest:** An automated, AI-powered report for administrators. It provides a "Preparedness Score," regional safety rankings, and specific, actionable insights (e.g., "9th grade is struggling with fire drills, suggest a targeted simulation"). This allows for systematic, continuous safety improvement.

---

## 🛠 Tech Stack
*   **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, ShadCN UI.
*   **Backend & Database:** Firebase (Firestore for data, Authentication for roles).
*   **AI Engine:** Genkit with Google Gemini 2.5 Flash for all analysis and simulation logic.
*   **Notifications:** Nodemailer for automated email alerts.

---

## 🎯 Our Vision
SURAKSHA transforms school safety from a passive checklist into a live, interactive ecosystem. By replacing chaos with clarity and fear with confidence, we are building a safer future for every student and teacher, one school at a time.