const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({ unit: 'pt', format: 'letter' });
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 36;
const contentWidth = pageWidth - margin * 2;
let y = 40;

const lineGap = 12;

const addTitle = (text) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(text, margin, y);
  y += 24;
};

const addHeading = (text) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(text, margin, y);
  y += 14;
};

const addParagraph = (text) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(text, contentWidth);
  lines.forEach((line) => {
    doc.text(line, margin, y);
    y += lineGap;
  });
  y += 4;
};

const addBullets = (items) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const bulletIndent = 12;
  const textWidth = contentWidth - bulletIndent;
  items.forEach((item) => {
    const lines = doc.splitTextToSize(item, textWidth);
    lines.forEach((line, idx) => {
      const x = margin + (idx === 0 ? 0 : bulletIndent);
      const prefix = idx === 0 ? '- ' : '  ';
      doc.text(prefix + line, x, y);
      y += lineGap;
    });
  });
  y += 4;
};

addTitle('ClassForge App Summary');

addHeading('What It Is');
addParagraph('ClassForge is an innovation management and idea submission platform for academic settings. It lets students submit ideas and enables teachers and admins to review, organize, and track them.');

addHeading("Who It's For");
addParagraph('Primary persona: students submitting innovation ideas for review, collaboration, and feedback.');

addHeading('What It Does');
addBullets([
  'Role-based portals for students, teachers, and admins with protected routes.',
  'Idea submission with tags, domain, optional images, and contributor tracking.',
  'Review workflow with status updates, comments, and approvals.',
  'Idea merging with merge history tracking.',
  'Groups with invitations and real-time chat, including file attachments.',
  'Notifications delivered in-app and in real time via Socket.io.',
  'AI insights and similarity checks for submitted ideas (Anthropic optional).'
]);

addHeading('How It Works (Repo Evidence)');
addBullets([
  'Frontend: React + Vite SPA with React Router, Auth/Theme/Toast contexts, axios API client, and socket.io-client for real-time events.',
  'Backend: Node/Express REST API under /api/*, JWT auth middleware, multer uploads, and Socket.io server for notifications and chat.',
  'Data: MongoDB via Mongoose models (User, Idea, Group, Message, Notification, MergeHistory, OTP).',
  'Services: email delivery via Nodemailer; AI insights via Anthropic SDK with a mock fallback; similarity scoring for idea matching.'
]);

addHeading('How To Run (Minimal)');
addBullets([
  'Install dependencies: run npm install in the repo root, backend, and frontend.',
  'Configure backend env vars (backend/.env exists): MONGODB_URI, JWT_SECRET, FRONTEND_URL, EMAIL_*; optional ANTHROPIC_API_KEY.',
  'Start both apps from root: npm run dev (backend on 5001, frontend on 5173).'
]);

// Ensure content fits on one page
if (y > pageHeight - margin) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Content overflow: adjust layout to fit one page.', margin, pageHeight - margin);
}

const outputPath = path.resolve('output/pdf/classforge-app-summary.pdf');
const pdfData = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfData));
console.log(outputPath);
