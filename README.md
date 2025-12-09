# 🧾 Invoice SaaS — Next.js Invoice Management App

Live Demo 👉 https://invoice-two-liard.vercel.app/

A SaaS application for managing invoices, built with **Next.js**, **Prisma**, **PostgreSQL**, and **Clerk** for secure authentication.  
The app allows users to create, edit, list, and export invoices as PDF, with a clean UI powered by **TailwindCSS + DaisyUI**.

---

## 🚀 Features

- 🔐 **Authentication & Authorization** using Clerk  
- 📄 **Create, read, update, and delete invoices**  
- 🧮 Add invoice lines (description, quantity, price)  
- 💰 Automatic totals & VAT calculation  
- 📦 PDF export using **html2canvas-pro** + **jsPDF**  
- 🎨 Beautiful UI with **TailwindCSS** & **DaisyUI**  
- 💾 Database backed by **Prisma + PostgreSQL (Neon)**  
- ⚙️ Backend logic implemented using **Next.js Server Actions**  
- 🧱 Fully deployed on **Vercel**

---

## 🛠️ Tech Stack

### **Frontend**
- Next.js 16
- React 19
- TailwindCSS 4
- DaisyUI
- Lucide React Icons

### **Backend**
- Next.js server actions
- Prisma ORM
- PostgreSQL (Neon Serverless)

### **Tools**
- Clerk Authentication
- html2canvas-pro (for DOM capture)
- jsPDF (for PDF generation)
- canvas-confetti (success animations)

---

## 📦 Installation & Setup

Clone the project:

```bash
git clone https://github.com/anouar4070/invoice.git
cd invoice
npm install
npm rundev
