import { jsPDF } from "jspdf";
import { ProfileExtras } from "./profileExtras";

export interface CvExportData {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  education?: string;
  degree?: string;
  university?: string;
  major?: string;
  gpa?: string;
  skills?: string[];
  detailedSkills?: { name: string; level: number; category: string }[];
  experienceYears?: string;
  links?: { type: string; url: string }[];
  atsScore?: number;
  aiSummary?: string;
}

/**
 * Generates and downloads a modern, clean, ATS-compliant CV in PDF format.
 */
export const exportCvToPdf = (data: CvExportData, lang: "ar" | "en" = "ar"): boolean => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const isEn = lang === "en";
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    let y = margin;

    // Header background banner (Luxury gold/dark slate accent)
    doc.setFillColor(20, 24, 20);
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setFillColor(184, 134, 11);
    doc.rect(0, 42, pageWidth, 2, "F");

    // Name & Title
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const name = data.fullName || (isEn ? "Candidate Profile" : "الملف الشخصي للمرشح");
    doc.text(name, margin, 18);

    // Contact info strip
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");

    const contactParts: string[] = [];
    if (data.email) contactParts.push(`Email: ${data.email}`);
    if (data.phone) contactParts.push(`Phone: ${data.phone}`);
    if (data.location) contactParts.push(`Location: ${data.location}`);

    doc.text(contactParts.join("  |  "), margin, 27);

    if (data.links && data.links.length > 0) {
      const linksStr = data.links.slice(0, 3).map(l => l.url.replace(/^https?:\/\//, "")).join("  |  ");
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8.5);
      doc.text(linksStr, margin, 35);
    }

    y = 54;

    const addSectionHeader = (title: string) => {
      if (y > 260) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(184, 134, 11);
      doc.text(title.toUpperCase(), margin, y);
      doc.setDrawColor(200, 160, 40);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
    };

    // 1. Executive / AI Professional Summary
    const summaryText = data.aiSummary || data.bio || (isEn ? "Motivated candidate seeking competitive scholarship and international career opportunities with demonstrated excellence and continuous learning." : "مرشح متميز يسعى لاقتناص الفرص الأكاديمية والمهنية الدولية مع شغف بالتطور والبحث العلمي.");
    addSectionHeader(isEn ? "Professional Summary" : "Professional Summary / النبذة المهنية");
    const splitBio = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
    doc.text(splitBio, margin, y);
    y += splitBio.length * 5 + 4;

    // 2. Education
    addSectionHeader(isEn ? "Education & Academic Background" : "Education / الخلفية الأكاديمية");
    if (data.university || data.major || data.degree) {
      doc.setFont("helvetica", "bold");
      const degMajor = [data.degree, data.major].filter(Boolean).join(" in ");
      doc.text(degMajor || "Academic Degree", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      if (data.university) {
        doc.text(`Institution: ${data.university}`, margin, y);
        y += 5;
      }
      if (data.gpa) {
        doc.text(`GPA / Cumulative Grade: ${data.gpa}`, margin, y);
        y += 5;
      }
    }
    if (data.education && data.education !== data.university) {
      const splitEdu = doc.splitTextToSize(data.education, pageWidth - margin * 2);
      doc.text(splitEdu, margin, y);
      y += splitEdu.length * 5 + 4;
    } else {
      y += 3;
    }

    // 3. Skills & Proficiencies
    const allSkills = [
      ...(data.detailedSkills?.map(s => s.name) ?? []),
      ...(data.skills ?? []),
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    if (allSkills.length > 0) {
      addSectionHeader(isEn ? "Key Skills & Competencies" : "Key Skills / المهارات والكفاءات");
      const skillsChunks = [];
      for (let i = 0; i < allSkills.length; i += 3) {
        skillsChunks.push(allSkills.slice(i, i + 3).map(s => `• ${s}`).join("     "));
      }
      skillsChunks.forEach(line => {
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 3;
    }

    // 4. Experience / Practical Background
    if (data.experienceYears && data.experienceYears !== "none") {
      addSectionHeader(isEn ? "Professional Experience" : "Experience / الخبرة العملية");
      doc.text(`Total Relevant Experience: ${data.experienceYears} years`, margin, y);
      y += 6;
      doc.text("• Demonstrated project execution, collaboration, and continuous skill refinement in competitive environments.", margin, y);
      y += 8;
    }

    // 5. ATS & Quality Certification footer badge
    if (data.atsScore) {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
      y += 4;
      doc.setFillColor(245, 245, 240);
      doc.setDrawColor(212, 175, 55);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 80, 30);
      doc.text(`ATS Readiness Score: ${data.atsScore}/100  —  Optimized for Global Opportunities`, margin + 4, y + 9);
    }

    // Download PDF
    const filename = `${name.replace(/\s+/g, "_")}_Optimized_CV.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error("PDF generation failed:", err);
    return false;
  }
};
