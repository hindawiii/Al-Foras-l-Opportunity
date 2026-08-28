# Al-Foras: Opportunities

Build a high-fidelity, full-stack mobile application concept named "Al-Foras" (الفرص) using JavaScript (React Native/Expo) with 100% Arabic Language support (RTL).

1. IDENTITY & UI THEME:

- Style: Professional & Luxurious.

- Colors: Deep Black background with Matte Gold (#B8860B) accents.

- Language: Full Arabic interface (Standard Arabic).

2. AUTHENTICATION & LOGIN:

- Features: Email/Password login, Signup, and Social Login (Facebook/Google).

- Password Box: Include a "Small Eye" icon to toggle password visibility.

- Logic: Include "Forgot Password" flow and professional Arabic validation messages.

3. ONBOARDING & INITIAL GUIDE:

- Add a 3-slide tutorial on first launch explaining: Smart Cards for Scholarships, Global News/Currency Hub, and AI-Powered Matching.

4. MAIN NAVIGATION (4 SECTIONS):

- Section 1 (المنح والفرص): Swipeable "Flash Cards" (Right to Save, Left to Ignore). Features "Verified" blue badges and "Manual Review" badges.

- Section 2 (الأخبار والمركز الاقتصادي): Categorized feed (Global, Local, Sports, Economy, Weather) with a data-saver mode (Text-only toggle).

- Section 3 (طلباتي): To track saved and applied scholarships.

- Section 4 (الملف الشخصي): Manage skills, education, and personal info.

5. TOP BAR & SETTINGS (Top Right Icon):

- Settings Menu Content:

  * Dark Mode Toggle (الوضع الليلي).

  * Account Settings (إعدادات الحساب).

  * Privacy (الخصوصية).

  * About App (حول التطبيق).

  * Clear Cache (مسح الملفات المؤقتة): Show toast "تم مسح الملفات المؤقتة بنجاح" when clicked.

  * Logout (تسجيل الخروج): Red styled button with confirmation popup.

6. SPECIAL TOOLS:

- Floating Currency Converter: Draggable floating button with a permanent label "حاسبة العملات والذهب الحية".

- Currencies: USD, EUR, SAR, AED, QTR, SDG, EGP, DZD, MAD.

- AI Logic: Simulate an AI notification that links global news to potential scholarship opportunities.

7. TECHNICAL REQUIREMENTS:

- Use JavaScript for all logic.

- Backend: Integration with Supabase for Auth and Real-time data.

- UI: Use Framer Motion for smooth transitions, Bottom Sheets for details, and RTL layout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/76ab8e07-94ef-4ac8-ad84-42ef7754a239).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
