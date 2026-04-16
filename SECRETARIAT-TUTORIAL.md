# 🏆 IGAC Secretariat: Operations Hub & Scanner Guide

Welcome to the International Global Affairs Council (IGAC) Secretariat Portal. This guide explains how to use the high-performance scanning and management system for our MUN events.

---

## 📱 PART 1: The Delegation Scanner
The scanner is the "ground control" for registration and committee attendance. It is designed to be fast, responsive, and provide clear feedback in noisy environments.

### 🟢 Scanning a Delegate
1. **Point the Camera:** Align the delegate's unique QR code (found in their email) within the scanner frame.
2. **Delegate Found:** The system will immediately identify the delegate and show their **Name, Country, and Committee** on a blue review screen.
3. **Action Required:** You must manually tap **[AUTHORIZE ENTRY]** or **[AUTHORIZE EXIT]** to record the scan. This prevents accidental single-taps.

### 🔊 Feedback & Colors (What they mean)
The screen will flash a specific color to signal the result:
*   **GREEN SCREEN (Access Granted):** Success! The delegate is registered and marked present for the session.
*   **BLUE/CYAN SCREEN (Campus Ambassador):** Success! Identifies a Campus Ambassador or VIP.
*   **ROSE/RED SCREEN (Exit Recorded):** Success! The delegate has been marked as "Exited" from the venue/room.
*   **BRIGHT RED SCREEN (Scan Rejected):** Warning! This person has **ALREADY BEEN SCANNED** for this session. Do not let them pass twice.

### ⚙️ Scanner Modes
*   **Entry vs Exit:** Use the toggle at the top to switch between "IN" and "OUT" modes. 
    *   **Anti-Misclick Protection:** Switching modes will now trigger a **Confirmation Prompt**. Always verify you are in the correct mode before starting a scanning session.
*   **Live History:** Scroll to the bottom of the scanner to see your **Recent Session Activity**. This shows your last 10 scans so you can double-check if a name was correctly recorded.

---

## 📊 PART 2: The Command Center (CRM)
The CRM is the "brain" of the operation, intended for lead organizers and the Secretariat heads.

### 1. The Command Center Tab
*   **Check-in Velocity:** A live chart showing exactly how many delegates are arriving per hour. If the bars are high, registration needs more staff.
*   **Live Stats:** Real-time counters for "Registrations", "In Committees", and "Exited Venue".
*   **Global Override:** The "Force Sync" button allows the head admin to change the Conference Day (Day 1, 2, or 3) for **every scanner in the building** instantly.

### 2. The Delegate Registry
*   **Searching:** Use the search bar to find anyone by Name, Email, or Committee.
*   **Profile Editing:** If a delegate's name is spelled wrong or they changed committees, tap **Edit Profile** on the scanner or in the registry to update it instantly.
*   **Master Export (API):** Found in the Registry tab. This button downloads a complete spreadsheet of everyone in the system, including exactly when they arrived and who scanned them.

---

## 🛡️ PART 3: Security & Sensitivity
*   **Master Password (`subaru5889@`):** Required to login to the CRM or authorize profile edits on a scanner.
*   **Financial Key (`osayeed5889@`):** Required to view a delegate's **Transaction ID**. This is only for the Finance Head to verify payments on-the-fly.

---

### 💡 Quick Troubleshooting
*   **Camera Not Opening?** Ensure you are using an **HTTPS** connection. Modern phones block camera access on non-secure connections.
*   **Network Blip?** If the scanner shows a "Network Error," don't panic. The **Recent Session Activity** at the bottom will show if the last person was actually recorded. If not, scan them again.
