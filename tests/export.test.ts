import test from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";

import {
  getAllSubmissions,
  getSubmissionByFacultyId,
} from "../src/lib/mockData.ts";

import {
  getFacultyFormSections,
  generateFacultyFormAoA,
  generateAllFacultyAoA,
  exportFacultyToExcel,
  exportAllFacultyToExcel,
  exportFacultyToCsv,
  exportAllFacultyToCsv,
  generateFacultyPdfDoc,
  generateAllFacultyPdfDoc,
  escapeCsvCell,
} from "../src/lib/exportUtils.ts";

test("CSV Escaping: Commas, quotes, and newlines remain inside a single cell", () => {
  // Plain string without comma
  assert.equal(escapeCsvCell("Kakatiya University"), "Kakatiya University");

  // String containing comma must be wrapped in double quotes
  const commaText = "National Conference on AI, ML, and Data Science, Hyderabad";
  assert.equal(escapeCsvCell(commaText), `"${commaText}"`);

  // String containing quotes and comma
  const quoteText = 'Workshop on "Deep Learning, LLMs", KU';
  assert.equal(escapeCsvCell(quoteText), '"Workshop on ""Deep Learning, LLMs"", KU"');

  // Null and undefined return empty string
  assert.equal(escapeCsvCell(null), "");
  assert.equal(escapeCsvCell(undefined), "");
});

test("Excel AoA and Export: Populated values and commas in all required fields", () => {
  // Get faculty submission with rich data containing commas
  const sub = getSubmissionByFacultyId("f1");
  assert.ok(sub, "f1 submission should exist");

  const sections = getFacultyFormSections(sub);
  const sectionMap = new Map(sections.map(s => [s.name, s]));

  // Verify requested fields are present as sections
  const requiredFields = [
    "Seminars/Conferences/Workshops Participated",
    "Seminars/Conferences/Workshops Organized",
    "Govt./Non-Govt. Funded Research Projects",
    "Research/Innovation Awards",
    "E-Content Developed",
    "Out Range Activity",
    "Any Other Information",
  ];

  requiredFields.forEach(fieldName => {
    assert.ok(sectionMap.has(fieldName), `Section "${fieldName}" must be present in form sections`);
    const sec = sectionMap.get(fieldName)!;
    assert.ok(sec.rows.length > 0, `Section "${fieldName}" must contain populated rows for fac1`);
  });

  // 1. Seminars/Conferences/Workshops Participated: Verify comma in title/organizer
  const participatedSec = sectionMap.get("Seminars/Conferences/Workshops Participated")!;
  const partRow = participatedSec.rows[0];
  // Column 1 is Title, Column 2 is Organizer
  assert.ok(String(partRow[1]).includes(","), "Participated seminar title must contain a comma");
  assert.ok(String(partRow[2]).includes(","), "Participated seminar organizer must contain a comma");

  // 2. Seminars/Conferences/Workshops Organized: Verify comma in title/organizer
  const organizedSec = sectionMap.get("Seminars/Conferences/Workshops Organized")!;
  const orgRow = organizedSec.rows[0];
  assert.ok(String(orgRow[1]).includes(","), "Organized seminar title must contain a comma");

  // 3. Govt./Non-Govt. Funded Research Projects: Verify comma in title/agency
  const projectsSec = sectionMap.get("Govt./Non-Govt. Funded Research Projects")!;
  const projRow = projectsSec.rows[0];
  assert.ok(String(projRow[1]).includes(","), "Funded research project title must contain a comma");
  assert.ok(String(projRow[2]).includes(","), "Funded project funding agency must contain a comma");

  // 4. Research/Innovation Awards: Verify comma in award name/awarding body
  const researchAwardsSec = sectionMap.get("Research/Innovation Awards")!;
  const resAwardRow = researchAwardsSec.rows[0];
  assert.ok(String(resAwardRow[1]).includes(","), "Research award name must contain a comma");

  // 5. E-Content Developed: Verify comma in title/platform
  const econtentSec = sectionMap.get("E-Content Developed")!;
  const ecRow = econtentSec.rows[0];
  assert.ok(String(ecRow[1]).includes(","), "E-content title must contain a comma");

  // 6. Any Other Information: Verify comma in description
  const otherInfoSec = sectionMap.get("Any Other Information")!;
  const otherRow = otherInfoSec.rows[0];
  assert.ok(String(otherRow[1]).includes(","), "Other information description must contain a comma");

  // Test generateFacultyFormAoA 2D array representation
  const aoa = generateFacultyFormAoA(sub);
  assert.ok(aoa.length > 20, "AoA should have more than 20 rows");

  // Verify that cells in AoA maintain commas without being split into multiple array elements
  let foundParticipatedComma = false;
  let foundProjectComma = false;
  let foundEContentComma = false;

  aoa.forEach(row => {
    row.forEach(cell => {
      const cellStr = String(cell);
      if (cellStr.includes("National Seminar on Pure Mathematics, Analysis, and Applications")) {
        foundParticipatedComma = true;
      }
      if (cellStr.includes("Nonlinear Dynamics, Chaos, and Control in Complex Systems")) {
        foundProjectComma = true;
      }
      if (cellStr.includes("Calculus for Beginners, Modules 1, 2, and 3")) {
        foundEContentComma = true;
      }
    });
  });

  assert.ok(foundParticipatedComma, "Cell with comma in Participated seminar should be intact in single cell");
  assert.ok(foundProjectComma, "Cell with comma in Funded Projects should be intact in single cell");
  assert.ok(foundEContentComma, "Cell with comma in E-Content should be intact in single cell");

  // Verify exportFacultyToExcel generates a valid SheetJS workbook
  const wb = exportFacultyToExcel(sub);
  assert.ok(wb.SheetNames.includes("Faculty_Form"), "Workbook must have 'Faculty_Form' sheet");
  const sheet = wb.Sheets["Faculty_Form"];
  assert.ok(sheet, "Faculty_Form sheet must exist");

  // Verify cell values in sheet are stored directly
  const jsonSheet = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });
  assert.ok(jsonSheet.length > 0, "Sheet should convert to rows");
});

test("Consolidated All Faculty Excel: All forms combined in one worksheet", () => {
  const allSubs = getAllSubmissions();
  assert.ok(allSubs.length >= 2, "There should be multiple faculty submissions");

  const combinedAoA = generateAllFacultyAoA(allSubs);
  assert.ok(combinedAoA.length > 50, "Combined AoA should have comprehensive consolidated data");

  // Check header of consolidated worksheet
  assert.equal(combinedAoA[0][0], "KAKATIYA UNIVERSITY, WARANGAL - INTERNAL QUALITY ASSURANCE CELL (IQAC)");
  assert.equal(combinedAoA[1][0], "AQAR 2024-25 - ALL FACULTY SUBMISSIONS CONSOLIDATED WORKSHEET");

  // Verify each faculty form is demarcated
  allSubs.forEach((sub, idx) => {
    const expectedFacultyBanner = `FACULTY FORM ${idx + 1} OF ${allSubs.length}: ${sub.facultyName.toUpperCase()} - ${sub.department.toUpperCase()} [STATUS: ${sub.status.toUpperCase()}]`;
    const foundBanner = combinedAoA.some(row => row[0] === expectedFacultyBanner);
    assert.ok(foundBanner, `Banner for faculty ${sub.facultyName} must be present in consolidated worksheet`);
  });

  // Verify workbook generation with single worksheet
  const wb = exportAllFacultyToExcel(allSubs);
  assert.equal(wb.SheetNames.length, 1, "Consolidated workbook must have exactly 1 worksheet");
  assert.equal(wb.SheetNames[0], "All_Faculty_Forms", "Worksheet name should be 'All_Faculty_Forms'");

  const sheet = wb.Sheets["All_Faculty_Forms"];
  assert.ok(sheet, "Sheet All_Faculty_Forms must exist");
  assert.ok(sheet["!ref"], "Sheet reference range must be defined");
});

test("CSV Export: Proper CSV generation with RFC 4180 escaping", () => {
  const sub = getSubmissionByFacultyId("f1")!;
  const csvStr = exportFacultyToCsv(sub);

  assert.ok(csvStr.includes("KAKATIYA UNIVERSITY, WARANGAL"), "CSV should have university header");
  assert.ok(csvStr.includes('"National Seminar on Pure Mathematics, Analysis, and Applications"'),
    "CSV must quote fields containing commas");

  const allSubs = getAllSubmissions();
  const summaryCsv = exportAllFacultyToCsv(allSubs);
  assert.ok(summaryCsv.includes("Faculty Name"), "Summary CSV should include header row");
  allSubs.forEach(s => {
    assert.ok(summaryCsv.includes(s.facultyName), `Summary CSV must include ${s.facultyName}`);
  });
});

test("PDF Export: Individual faculty form as PDF", () => {
  const sub = getSubmissionByFacultyId("f1")!;
  const doc = generateFacultyPdfDoc(sub);

  assert.ok(doc, "PDF document instance should be generated");
  const pageCount = doc.getNumberOfPages();
  assert.ok(pageCount >= 1, `Individual form PDF should have at least 1 page (actual: ${pageCount})`);

  // Verify PDF output generates non-empty array buffer
  const arrayBuffer = doc.output("arraybuffer");
  assert.ok(arrayBuffer.byteLength > 1000, `PDF arraybuffer should be larger than 1KB (actual: ${arrayBuffer.byteLength} bytes)`);
});

test("PDF Export: All faculty forms combined into one PDF with clear separation", () => {
  const allSubs = getAllSubmissions();
  const singleSub = allSubs[0];

  const singleDoc = generateFacultyPdfDoc(singleSub);
  const singlePageCount = singleDoc.getNumberOfPages();

  const combinedDoc = generateAllFacultyPdfDoc(allSubs);
  const combinedPageCount = combinedDoc.getNumberOfPages();

  assert.ok(
    combinedPageCount >= singlePageCount + (allSubs.length - 1),
    `Combined PDF should contain pages for all faculty forms (single: ${singlePageCount}, combined: ${combinedPageCount}, total faculties: ${allSubs.length})`
  );

  const arrayBuffer = combinedDoc.output("arraybuffer");
  assert.ok(
    arrayBuffer.byteLength > singleDoc.output("arraybuffer").byteLength,
    "Combined PDF buffer size should exceed single faculty PDF size"
  );
});
