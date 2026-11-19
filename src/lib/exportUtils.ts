import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import type { Submission } from "./mockData";

export interface ExportSection {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Proper CSV cell escaping ensuring commas, quotes, and newlines
 * remain inside the single cell and do not split across columns.
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Returns structured sections for a faculty submission covering all fields:
 * - Basic Profile
 * - Research Papers (with Impact Factor)
 * - Books & Chapters
 * - FDP Attended
 * - Patents (with Patent URL)
 * - Seminars/Conferences/Workshops Participated
 * - Seminars/Conferences/Workshops Organized
 * - National / International Fellowships (with Type)
 * - Govt./Non-Govt. Funded Research Projects
 * - Research/Innovation Awards
 * - Awards / Recognition for Extension Activities
 * - E-Content Developed
 * - Any Other Information
 */
export function getFacultyFormSections(sub: Submission): ExportSection[] {
  const prof = sub.profile || {};

  const profileRows: (string | number)[][] = [
    ["Teacher Name", prof.name || sub.facultyName || ""],
    ["Designation", prof.designation || ""],
    ["Department", sub.department || prof.department || ""],
    ["Date of Appointment", prof.dateOfAppointment || ""],
    ["Appointment Order Document", prof.appointmentOrderEvidence || ""],
    ["Years of Experience", prof.experience ? `${prof.experience} yrs` : ""],
    ["Mobile Number", prof.mobile || ""],
    ["Email ID", prof.email || ""],
    ["PAN Number", prof.pan || ""],
    ["PAN Card Document", prof.panEvidence || ""],
    ["AADHAR Number", prof.aadhar || ""],
    ["Aadhaar Card Document", prof.aadharEvidence || ""],
    ["Social Status / Sub-caste", prof.socialStatus || ""],
    ["Date of Birth", prof.dob || ""],
    ["Higher Qualification", prof.highestQual || ""],
    ["Highest Qualification Certificate", prof.highestQualEvidence || ""],
    ["Date of Awarding PhD", prof.phdDate || ""],
    ["Recognized as Research Guide?", prof.isResearchGuide || ""],
    ["Date of Recognition as Guide", prof.researchGuideDate || ""],
    ["Research Guide Certificate", prof.researchGuideEvidence || ""],
  ];

  return [
    {
      name: "Basic Profile",
      headers: ["Field", "Value"],
      rows: profileRows,
    },
    {
      name: "Research Papers",
      headers: ["#", "Title of Paper", "Journal Name", "ISSN", "Vol/Issue", "Year", "Author(s)", "DOI / URL", "Evidence", "Impact Factor"],
      rows: (sub.researchPapers || []).map((r, i) => [
        i + 1,
        String(r.title || ""),
        String(r.journal || ""),
        String(r.issn || ""),
        String(r.volume || ""),
        String(r.year || ""),
        String(r.authors || ""),
        String(r.doi || ""),
        String(r.evidence || ""),
        String(r.impactFactor || ""),
      ]),
    },
    {
      name: "Books & Chapters",
      headers: ["#", "Type", "Title", "Author(s)", "Publisher", "ISBN", "Year", "Evidence"],
      rows: (sub.booksChapters || []).map((r, i) => [
        i + 1,
        String(r.type || ""),
        String(r.title || ""),
        String(r.authors || ""),
        String(r.publisher || ""),
        String(r.isbn || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "FDP Attended",
      headers: ["#", "Programme Title", "Organizer", "From Date", "To Date", "Duration (Days)", "Mode", "Sponsored By", "Evidence"],
      rows: (sub.fdpAttended || []).map((r, i) => [
        i + 1,
        String(r.title || ""),
        String(r.organizer || ""),
        String(r.dateFrom || ""),
        String(r.dateTo || ""),
        String(r.duration || ""),
        String(r.mode || ""),
        String(r.sponsoredBy || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Patents",
      headers: ["#", "Patent Title", "Patent Number", "Status", "Patent URL", "Year", "Evidence"],
      rows: (sub.patents || []).map((r, i) => [
        i + 1,
        String(r.title || ""),
        String(r.patentNumber || ""),
        String(r.patentStatus || ""),
        String(r.patentUrl || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Seminars/Conferences/Workshops Participated",
      headers: ["#", "Title", "Organizer", "From Date", "To Date", "Level", "Role", "Evidence"],
      rows: (sub.seminarsParticipated || []).map((r, i) => [
        i + 1,
        String(r.title || ""),
        String(r.organizer || ""),
        String(r.dateFrom || ""),
        String(r.dateTo || ""),
        String(r.level || ""),
        String(r.role || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Seminars/Conferences/Workshops Organized",
      headers: ["#", "Title", "Organizer", "From Date", "To Date", "Level", "Role", "Evidence"],
      rows: (sub.seminarsOrganized || []).map((r, i) => [
        i + 1,
        String(r.title || ""),
        String(r.organizer || ""),
        String(r.dateFrom || ""),
        String(r.dateTo || ""),
        String(r.level || ""),
        String(r.role || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "National / International Fellowships",
      headers: ["#", "Fellowship Name", "Type", "Awarding Body", "Amount (₹)", "Year", "Evidence"],
      rows: (sub.fellowships || []).map((r, i) => [
        i + 1,
        String(r.name || ""),
        String(r.type || ""),
        String(r.body || ""),
        String(r.amount || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Govt./Non-Govt. Funded Research Projects",
      headers: ["#", "Project Title", "Funding Agency", "Type", "Amount (₹)", "Duration (Yrs)", "Status", "Evidence"],
      rows: (sub.fundedProjects || []).map((r, i) => [
        i + 1,
        String(r.title || ""),
        String(r.agency || ""),
        String(r.type || ""),
        String(r.amount || ""),
        String(r.duration || ""),
        String(r.projectStatus || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Research/Innovation Awards",
      headers: ["#", "Award / Recognition", "Awarding Body", "Year", "Evidence"],
      rows: (sub.awardsResearch || []).map((r, i) => [
        i + 1,
        String(r.name || ""),
        String(r.body || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Awards / Recognition for Extension Activities",
      headers: ["#", "Award / Recognition", "Awarding Body", "Year", "Evidence"],
      rows: (sub.awardsExtension || []).map((r, i) => [
        i + 1,
        String(r.name || ""),
        String(r.body || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "E-Content Developed",
      headers: ["#", "Title of E-Content", "Platform / LMS", "URL / Link", "Year", "Evidence"],
      rows: (sub.econtent || []).map((r, i) => [
        i + 1,
        String(r.title || ""),
        String(r.platform || ""),
        String(r.url || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Out Range Activity",
      headers: ["#", "Description / Activity", "Year", "Evidence"],
      rows: (sub.outRangeActivity || []).map((r, i) => [
        i + 1,
        String(r.description || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
    {
      name: "Any Other Information",
      headers: ["#", "Description / Activity", "Year", "Evidence"],
      rows: (sub.otherInfo || []).map((r, i) => [
        i + 1,
        String(r.description || ""),
        String(r.year || ""),
        String(r.evidence || ""),
      ]),
    },
  ];
}

/**
 * Generates a 2D Array-of-Arrays (AoA) for a single faculty submission.
 * Each cell is kept as a distinct cell without comma-splitting.
 */
export function generateFacultyFormAoA(sub: Submission): (string | number)[][] {
  const sections = getFacultyFormSections(sub);
  const rows: (string | number)[][] = [];

  rows.push(["KAKATIYA UNIVERSITY, WARANGAL - IQAC AQAR 2024-25"]);
  rows.push(["FACULTY SUBMISSION FORM"]);
  rows.push(["Faculty Name:", sub.facultyName, "Department:", sub.department]);
  rows.push(["Academic Year:", sub.academicYear, "Status:", sub.status.toUpperCase(), "Last Updated:", sub.lastUpdated]);
  rows.push([]);

  sections.forEach(sec => {
    rows.push([`=== ${sec.name.toUpperCase()} ===`]);
    rows.push(sec.headers);
    if (sec.rows.length === 0) {
      rows.push(["No entries reported"]);
    } else {
      sec.rows.forEach(r => rows.push(r));
    }
    rows.push([]);
  });

  return rows;
}

/**
 * Combines all faculty forms into ONE single worksheet 2D array.
 */
export function generateAllFacultyAoA(submissions: Submission[]): (string | number)[][] {
  const rows: (string | number)[][] = [];

  rows.push(["KAKATIYA UNIVERSITY, WARANGAL - INTERNAL QUALITY ASSURANCE CELL (IQAC)"]);
  rows.push(["AQAR 2024-25 - ALL FACULTY SUBMISSIONS CONSOLIDATED WORKSHEET"]);
  rows.push(["Total Faculty Submissions:", submissions.length, "Generated:", new Date().toISOString().split("T")[0]]);
  rows.push([]);

  submissions.forEach((sub, idx) => {
    rows.push(["===================================================================================================="]);
    rows.push([
      `FACULTY FORM ${idx + 1} OF ${submissions.length}: ${sub.facultyName.toUpperCase()} - ${sub.department.toUpperCase()} [STATUS: ${sub.status.toUpperCase()}]`,
    ]);
    rows.push(["===================================================================================================="]);
    rows.push(["Faculty Name:", sub.facultyName, "Department:", sub.department, "Status:", sub.status]);
    rows.push(["Academic Year:", sub.academicYear, "Last Updated:", sub.lastUpdated, "Submitted At:", sub.submittedAt || "N/A"]);
    rows.push([]);

    const sections = getFacultyFormSections(sub);
    sections.forEach(sec => {
      rows.push([`[ ${sec.name.toUpperCase()} ]`]);
      rows.push(sec.headers);
      if (sec.rows.length === 0) {
        rows.push(["No entries reported"]);
      } else {
        sec.rows.forEach(r => rows.push(r));
      }
      rows.push([]);
    });

    rows.push([]);
  });

  return rows;
}

/**
 * Exports an individual faculty form to an Excel (.xlsx) file.
 */
export function exportFacultyToExcel(sub: Submission): XLSX.WorkBook {
  const aoa = generateFacultyFormAoA(sub);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Set default column widths for readability
  ws["!cols"] = [{ wch: 6 }, { wch: 35 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, "Faculty_Form");

  if (typeof window !== "undefined") {
    const filename = `${sub.facultyName.replace(/\s+/g, "_")}_AQAR_2024-25.xlsx`;
    XLSX.writeFile(wb, filename);
  }
  return wb;
}

/**
 * Exports all faculty forms combined in ONE Excel (.xlsx) worksheet.
 */
export function exportAllFacultyToExcel(submissions: Submission[]): XLSX.WorkBook {
  const aoa = generateAllFacultyAoA(submissions);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = [{ wch: 6 }, { wch: 38 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, "All_Faculty_Forms");

  if (typeof window !== "undefined") {
    XLSX.writeFile(wb, "IQAC_AQAR_2024-25_All_Faculty_Forms.xlsx");
  }
  return wb;
}

/**
 * Exports a single faculty form as CSV, with proper cell escaping.
 */
export function exportFacultyToCsv(sub: Submission): string {
  const aoa = generateFacultyFormAoA(sub);
  const csv = aoa.map(row => row.map(escapeCsvCell).join(",")).join("\n");

  if (typeof window !== "undefined") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sub.facultyName.replace(/\s+/g, "_")}_AQAR_2024-25.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return csv;
}

/**
 * Exports all faculty forms as CSV, with proper cell escaping.
 */
export function exportAllFacultyToCsv(submissions: Submission[]): string {
  const aoa = generateAllFacultyAoA(submissions);
  const csv = aoa.map(row => row.map(escapeCsvCell).join(",")).join("\n");

  if (typeof window !== "undefined") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "IQAC_AQAR_2024-25_All_Faculty_Summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return csv;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF GENERATION UTILITIES (jsPDF)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Draws a single faculty form into a jsPDF document.
 */
export function buildFacultyPdf(doc: jsPDF, sub: Submission, formNumber?: number, totalForms?: number): void {
  const pageWidth = doc.internal.pageSize.getWidth(); // ~595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // ~841.89 pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // ~515 pt
  let y = 40;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawRunningHeader();
    }
  }

  function drawRunningHeader() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 145);
    doc.text(`Kakatiya University IQAC AQAR 2024-25 | Faculty: ${sub.facultyName}`, margin, y - 10);
    doc.setDrawColor(210, 215, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, y - 6, margin + contentWidth, y - 6);
  }

  // Cover / Header Banner for the form
  if (formNumber !== undefined && totalForms !== undefined) {
    doc.setFillColor(0, 33, 71); // Kakatiya Navy
    doc.rect(margin, y, contentWidth, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`FACULTY FORM ${formNumber} OF ${totalForms}: ${sub.facultyName.toUpperCase()}`, margin + 8, y + 16);
    y += 32;
  }

  // University Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0, 33, 71); // Navy
  doc.text("KAKATIYA UNIVERSITY, WARANGAL", margin, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(60, 70, 85);
  doc.text("Internal Quality Assurance Cell (IQAC)", margin, y);
  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 110, 125);
  doc.text("Annual Quality Assurance Report (AQAR) 2024-25 — Faculty Data Sheet", margin, y);
  y += 12;

  // Gold accent line
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(2);
  doc.line(margin, y, margin + contentWidth, y);
  y += 14;

  // Summary Card
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(margin, y, contentWidth, 48, 4, 4, "F");
  doc.setDrawColor(205, 218, 235);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 48, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 33, 71);
  doc.text(sub.facultyName, margin + 10, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 95);
  const roleText = `${sub.profile?.designation || "Faculty"} — Department of ${sub.department}`;
  doc.text(roleText, margin + 10, y + 32);

  const statusText = `Status: ${sub.status.toUpperCase()} | Academic Year: 2024-25`;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 50);
  doc.text(statusText, margin + contentWidth - 10, y + 18, { align: "right" });

  const updatedText = `Last Updated: ${sub.lastUpdated || "N/A"}`;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 110, 125);
  doc.text(updatedText, margin + contentWidth - 10, y + 32, { align: "right" });

  y += 60;

  // Render Sections
  const sections = getFacultyFormSections(sub);

  sections.forEach(sec => {
    checkPageBreak(50);

    // Section header title bar
    doc.setFillColor(232, 240, 250);
    doc.rect(margin, y, contentWidth, 18, "F");
    doc.setDrawColor(180, 205, 235);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 18, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 33, 71);
    doc.text(sec.name.toUpperCase(), margin + 6, y + 12);
    y += 22;

    if (sec.name === "Basic Profile") {
      // 2-column layout for profile
      const colW = contentWidth / 2;
      for (let i = 0; i < sec.rows.length; i += 2) {
        checkPageBreak(16);
        const item1 = sec.rows[i];
        const item2 = sec.rows[i + 1];

        // Left col
        if (item1) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(90, 100, 115);
          doc.text(`${item1[0]}:`, margin + 4, y);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(20, 25, 35);
          const valStr = doc.splitTextToSize(String(item1[1] || "—"), colW - 100);
          doc.text(valStr, margin + 100, y);
        }

        // Right col
        if (item2) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(90, 100, 115);
          doc.text(`${item2[0]}:`, margin + colW + 4, y);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(20, 25, 35);
          const valStr2 = doc.splitTextToSize(String(item2[1] || "—"), colW - 100);
          doc.text(valStr2, margin + colW + 100, y);
        }

        y += 14;
      }
      y += 8;
    } else {
      // Render as a table
      if (sec.rows.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(140, 145, 155);
        doc.text("No entries reported.", margin + 6, y);
        y += 14;
      } else {
        // Table Columns width allocation
        const numCols = sec.headers.length;
        const colWidths: number[] = [];
        if (sec.headers[0] === "#") {
          colWidths.push(20);
          const remainingW = contentWidth - 20;
          const otherCols = numCols - 1;
          for (let c = 1; c < numCols; c++) {
            colWidths.push(remainingW / otherCols);
          }
        } else {
          for (let c = 0; c < numCols; c++) {
            colWidths.push(contentWidth / numCols);
          }
        }

        function drawTableHeader() {
          doc.setFillColor(240, 243, 248);
          doc.rect(margin, y, contentWidth, 14, "F");
          doc.setDrawColor(210, 218, 230);
          doc.setLineWidth(0.5);
          doc.rect(margin, y, contentWidth, 14, "S");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(40, 50, 65);

          let curX = margin;
          for (let c = 0; c < numCols; c++) {
            const hText = doc.splitTextToSize(sec.headers[c], colWidths[c] - 4);
            doc.text(hText[0] || "", curX + 2, y + 10);
            curX += colWidths[c];
          }
          y += 14;
        }

        drawTableHeader();

        // Render Data Rows
        sec.rows.forEach((row, rowIdx) => {
          // Pre-split text for each cell
          const cellLines = row.map((cell, cIdx) => {
            const str = String(cell ?? "");
            return doc.splitTextToSize(str, (colWidths[cIdx] || 40) - 4);
          });
          const maxLines = Math.max(1, ...cellLines.map(l => l.length));
          const rowH = Math.max(14, maxLines * 8.5 + 4);

          if (y + rowH > pageHeight - margin) {
            doc.addPage();
            y = margin;
            drawRunningHeader();
            drawTableHeader();
          }

          // Row background (zebra stripe)
          if (rowIdx % 2 === 1) {
            doc.setFillColor(250, 252, 254);
            doc.rect(margin, y, contentWidth, rowH, "F");
          }
          doc.setDrawColor(230, 235, 242);
          doc.setLineWidth(0.3);
          doc.rect(margin, y, contentWidth, rowH, "S");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(30, 35, 45);

          let cellX = margin;
          for (let c = 0; c < numCols; c++) {
            const lines = cellLines[c] || [];
            lines.forEach((line: string, lIdx: number) => {
              doc.text(line, cellX + 2, y + 8 + lIdx * 8.5);
            });
            cellX += colWidths[c];
          }
          y += rowH;
        });

        y += 8;
      }
    }
  });
}

/**
 * Generates an individual faculty form jsPDF instance.
 */
export function generateFacultyPdfDoc(sub: Submission): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  buildFacultyPdf(doc, sub);
  return doc;
}

/**
 * Downloads an individual faculty form as a PDF.
 */
export function exportFacultyToPdf(sub: Submission): jsPDF {
  const doc = generateFacultyPdfDoc(sub);
  if (typeof window !== "undefined") {
    const filename = `${sub.facultyName.replace(/\s+/g, "_")}_AQAR_2024-25.pdf`;
    doc.save(filename);
  }
  return doc;
}

/**
 * Generates a combined jsPDF document containing ALL faculty forms,
 * with each faculty form clearly separated starting on a new page.
 */
export function generateAllFacultyPdfDoc(submissions: Submission[]): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  submissions.forEach((sub, idx) => {
    if (idx > 0) {
      doc.addPage();
    }
    buildFacultyPdf(doc, sub, idx + 1, submissions.length);
  });

  return doc;
}

/**
 * Downloads all faculty forms combined into one PDF.
 */
export function exportAllFacultyToPdf(submissions: Submission[]): jsPDF {
  const doc = generateAllFacultyPdfDoc(submissions);
  if (typeof window !== "undefined") {
    doc.save("IQAC_AQAR_2024-25_All_Faculty_Forms.pdf");
  }
  return doc;
}
