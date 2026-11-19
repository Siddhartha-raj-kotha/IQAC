import test from "node:test";
import assert from "node:assert/strict";

import {
  canFacultyEdit,
  canIqacAct,
  createSubmissionForFaculty,
  updateSubmission,
  getSubmissionByFacultyId,
  deleteSubmissionByFacultyId,
  changeUserPassword,
  getUserByCredentials,
} from "../src/lib/mockData.ts";

import {
  getResearchPaperCols,
  getPatentCols,
  getFellowshipCols,
  getOutRangeActivityCols,
} from "../src/lib/formColumns.ts";

import { t } from "../src/lib/translations.ts";

test("Workflow permissions: Faculty editing is locked during submission and unlocked when returned", () => {
  // 1. Draft allows editing
  assert.equal(canFacultyEdit("draft"), true, "Draft should allow editing");

  // 2. Submitted locks editing
  assert.equal(canFacultyEdit("submitted"), false, "Submitted should lock faculty editing");

  // 3. Returned by IQAC allows editing & corrections
  assert.equal(canFacultyEdit("returned_iqac"), true, "Returned by IQAC should allow editing");

  // 4. Accepted by IQAC locks editing permanently
  assert.equal(canFacultyEdit("accepted_iqac"), false, "Accepted by IQAC should lock faculty editing");

  // 5. IQAC can act directly on 'submitted' status (bypassing HOD and Principal)
  assert.equal(canIqacAct("submitted"), true, "IQAC should be able to act directly on submitted status");
  assert.equal(canIqacAct("draft"), false, "IQAC should not act on draft status");
  assert.equal(canIqacAct("accepted_iqac"), false, "IQAC should not act on accepted status");
});

test("Workflow cycle: Direct submission to IQAC, locking, return, edit, resubmit, and finalize", () => {
  const testUser = {
    id: `test_fac_${Date.now()}`,
    name: "Dr. Test Faculty",
    department: "Computer Science & Engineering",
  };

  // Step 1: Create initial submission (draft)
  const initialSub = createSubmissionForFaculty(testUser);
  assert.equal(initialSub.status, "draft");
  assert.equal(canFacultyEdit(initialSub.status), true);

  // Step 2: Faculty submits directly to IQAC
  const submitSuccess = updateSubmission(initialSub.id, {
    status: "submitted",
    submittedAt: new Date().toISOString(),
    profile: {
      name: testUser.name,
      department: testUser.department,
      highestQual: "Ph.D. in Computer Science",
      appointmentOrderEvidence: "appointment_order.pdf",
      panEvidence: "pan_card.pdf",
      aadharEvidence: "aadhaar_card.pdf",
      highestQualEvidence: "phd_degree.pdf",
      isResearchGuide: "Yes",
      researchGuideEvidence: "guide_recognition.pdf",
    },
  });
  assert.equal(submitSuccess, true);

  const submittedSub = getSubmissionByFacultyId(testUser.id);
  assert.ok(submittedSub);
  assert.equal(submittedSub.status, "submitted");
  assert.equal(canFacultyEdit(submittedSub.status), false, "Faculty must be locked after submission");

  // Step 3: Deleting/resetting while submitted must be blocked
  const deleteAttemptWhileLocked = deleteSubmissionByFacultyId(testUser.id);
  assert.equal(deleteAttemptWhileLocked, false, "Should not delete/reset locked submission");

  // Step 4: IQAC returns form with remarks for correction
  const returnSuccess = updateSubmission(submittedSub.id, {
    status: "returned_iqac",
    iqacRemarks: "Please provide valid DOI links and certificate copies.",
  });
  assert.equal(returnSuccess, true);

  const returnedSub = getSubmissionByFacultyId(testUser.id);
  assert.ok(returnedSub);
  assert.equal(returnedSub.status, "returned_iqac");
  assert.equal(returnedSub.iqacRemarks, "Please provide valid DOI links and certificate copies.");
  assert.equal(canFacultyEdit(returnedSub.status), true, "Faculty must be unlocked after IQAC returns the form");

  // Step 5: Faculty edits and resubmits to IQAC
  const resubmitSuccess = updateSubmission(returnedSub.id, {
    status: "submitted",
    profile: {
      ...returnedSub.profile,
      highestQual: "Ph.D. & Post-Doc",
    },
  });
  assert.equal(resubmitSuccess, true);

  const resubmittedSub = getSubmissionByFacultyId(testUser.id);
  assert.ok(resubmittedSub);
  assert.equal(resubmittedSub.status, "submitted");
  assert.equal(canFacultyEdit(resubmittedSub.status), false, "Faculty must be locked again after resubmission");

  // Step 6: IQAC accepts and finalizes submission
  const acceptSuccess = updateSubmission(resubmittedSub.id, {
    status: "accepted_iqac",
    iqacRemarks: "All corrections verified. Approved for AQAR 2024-25.",
  });
  assert.equal(acceptSuccess, true);

  const acceptedSub = getSubmissionByFacultyId(testUser.id);
  assert.ok(acceptedSub);
  assert.equal(acceptedSub.status, "accepted_iqac");
  assert.equal(canFacultyEdit(acceptedSub.status), false, "Accepted submission remains locked");
});

test("Research Papers Table: UGC list removed and Impact Factor added as last column", () => {
  const colsEn = getResearchPaperCols("en");
  const colsTe = getResearchPaperCols("te");

  // Verify UGC list is removed
  assert.equal(colsEn.some(col => col.key === "ugcNotified"), false, "UGC list column must be removed");
  assert.equal(colsTe.some(col => col.key === "ugcNotified"), false, "UGC list column must be removed");

  // Verify Impact Factor exists
  const ifColEn = colsEn.find(col => col.key === "impactFactor");
  assert.ok(ifColEn, "Impact Factor column must exist");
  assert.equal(ifColEn.header, "Impact Factor");

  const ifColTe = colsTe.find(col => col.key === "impactFactor");
  assert.ok(ifColTe, "Impact Factor column must exist in Telugu");
  assert.equal(ifColTe.header, "ఇంపాక్ట్ ఫ్యాక్టర్");

  // Verify Impact Factor is the last column in the table definitions
  const lastColEn = colsEn[colsEn.length - 1];
  assert.equal(lastColEn.key, "impactFactor", "Impact Factor must be the last column in research papers table");
  const lastColTe = colsTe[colsTe.length - 1];
  assert.equal(lastColTe.key, "impactFactor", "Impact Factor must be the last column in Telugu research papers table");
});

test("Patents Table: Patent URL field is present", () => {
  const colsEn = getPatentCols("en");
  const colsTe = getPatentCols("te");

  const patentUrlEn = colsEn.find(col => col.key === "patentUrl");
  assert.ok(patentUrlEn, "Patent URL column must exist in patents table");
  assert.equal(patentUrlEn.header, "Patent URL");

  const patentUrlTe = colsTe.find(col => col.key === "patentUrl");
  assert.ok(patentUrlTe, "Patent URL column must exist in Telugu patents table");
  assert.equal(patentUrlTe.header, "పేటెంట్ లింక్");
});

test("Fellowships Table: Type text field is present", () => {
  const colsEn = getFellowshipCols("en");
  const colsTe = getFellowshipCols("te");

  const typeColEn = colsEn.find(col => col.key === "type");
  assert.ok(typeColEn, "Type column must exist in fellowships table");
  assert.equal(typeColEn.type, "text", "Type must be a text field");
  assert.equal(typeColEn.header, "Type");

  const typeColTe = colsTe.find(col => col.key === "type");
  assert.ok(typeColTe, "Type column must exist in Telugu fellowships table");
  assert.equal(typeColTe.header, "రకం");
});

test("Form Step ordering: Extension Activities Awards immediately follows Research Awards", async () => {
  // Read faculty form page source to verify steps ordering
  const fs = await import("node:fs");
  const path = await import("node:path");
  const filePath = path.resolve("src/app/faculty/form/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  // Ensure Awards (Research) is followed by Awards (Extension)
  const awardsRIndex = content.indexOf('{ key: "awardsR"');
  const awardsEIndex = content.indexOf('{ key: "awardsE"');
  const econtentIndex = content.indexOf('{ key: "econtent"');

  assert.ok(awardsRIndex !== -1, "awardsR step must exist");
  assert.ok(awardsEIndex !== -1, "awardsE step must exist");
  assert.ok(econtentIndex !== -1, "econtent step must exist");

  assert.ok(awardsRIndex < awardsEIndex, "Awards for Research must come before Extension Activities Awards");
  assert.ok(awardsEIndex < econtentIndex, "Extension Activities Awards must come before E-Content");

  // Ensure title contains "Awards / Recognition for Extension Activities"
  assert.ok(
    content.includes("Awards / Recognition for Extension Activities"),
    "Page title must be 'Awards / Recognition for Extension Activities'"
  );
});

test("Profile evidence fields and Higher Qualification text input in form page", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const filePath = path.resolve("src/app/faculty/form/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  // Check evidence uploads for Aadhaar, PAN, highest qualification, appointment order, research guide
  assert.ok(content.includes("appointmentOrderEvidence"), "Must have appointment order evidence");
  assert.ok(content.includes("panEvidence"), "Must have PAN evidence");
  assert.ok(content.includes("aadharEvidence"), "Must have Aadhaar evidence");
  assert.ok(content.includes("highestQualEvidence"), "Must have highest qualification certificate evidence");
  assert.ok(content.includes("researchGuideEvidence"), "Must have research guide certificate evidence");

  // Check Higher Qualification is a text field, not dropdown
  assert.ok(
    content.includes('value={profile.highestQual || ""}') && content.includes('placeholder='),
    "Higher Qualification must be a text input"
  );
  assert.ok(
    content.includes('label={e ? "Higher Qualification" : "అత్యధిక అర్హత"}'),
    "Higher Qualification label must be present"
  );
});

test("Translations: All new and updated keys exist in both English and Telugu", () => {
  assert.equal(t("submitForm", "en"), "Submit to IQAC");
  assert.equal(t("submitForm", "te"), "IQAC సమీక్ష కోసం సమర్పించు");

  assert.equal(t("resubmitForm", "en"), "Resubmit to IQAC");
  assert.equal(t("resubmitForm", "te"), "IQAC కి మళ్ళీ సమర్పించు");

  assert.equal(t("patentUrl", "en"), "Patent URL");
  assert.equal(t("patentUrl", "te"), "పేటెంట్ లింక్");

  assert.equal(t("impactFactor", "en"), "Impact Factor");
  assert.equal(t("impactFactor", "te"), "ఇంపాక్ట్ ఫ్యాక్టర్");

  assert.equal(t("highestQual", "en"), "Higher Qualification");
  assert.equal(t("highestQual", "te"), "అత్యధిక అర్హత");

  assert.equal(t("outRangeActivity", "en"), "Out Range Activity");
  assert.equal(t("outRangeActivity", "te"), "అవుట్ రేంజ్ కార్యాచరణ");
});

test("Out Range Activity Section: Column definitions and step ordering before other activity section", async () => {
  const colsEn = getOutRangeActivityCols("en");
  const colsTe = getOutRangeActivityCols("te");

  // Check column definitions: Description / Activity, Year, Evidence
  assert.equal(colsEn.length, 3, "Out Range Activity should have 3 columns");
  assert.equal(colsEn[0].key, "description");
  assert.equal(colsEn[0].header, "Description / Activity");
  assert.equal(colsEn[1].key, "year");
  assert.equal(colsEn[1].header, "Year");
  assert.equal(colsEn[2].key, "evidence");
  assert.equal(colsEn[2].header, "Evidence");

  assert.equal(colsTe[0].header, "వివరణ / కార్యకలాపం");
  assert.equal(colsTe[1].header, "సంవత్సరం");
  assert.equal(colsTe[2].header, "సాక్ష్యం");

  // Verify form steps order in faculty form page: outRange is directly before other
  const fs = await import("node:fs");
  const path = await import("node:path");
  const filePath = path.resolve("src/app/faculty/form/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  const outRangeIndex = content.indexOf('{ key: "outRange"');
  const otherIndex = content.indexOf('{ key: "other"');
  const reviewIndex = content.indexOf('{ key: "review"');

  assert.ok(outRangeIndex !== -1, "outRange step must exist");
  assert.ok(otherIndex !== -1, "other step must exist");
  assert.ok(reviewIndex !== -1, "review step must exist");

  assert.ok(outRangeIndex < otherIndex, "Out Range Activity must precede Other Information / Activity");
  assert.ok(otherIndex < reviewIndex, "Other Information must precede Final Review");
});

test("Authenticated Password Change: Validation, incorrect current password rejection, and successful update across roles", () => {
  // Test Faculty (f1)
  const faculty = getUserByCredentials("ramesh@ku.ac.in", "faculty123");
  assert.ok(faculty, "Faculty user f1 should exist");

  // 1. Incorrect current password rejected
  const badAuth = changeUserPassword(faculty.id, "wrongpassword", "newsecret123");
  assert.equal(badAuth.success, false);
  assert.equal(badAuth.error, "Current password is incorrect.");

  // 2. Too short password rejected (<6 chars)
  const shortPass = changeUserPassword(faculty.id, "faculty123", "123");
  assert.equal(shortPass.success, false);
  assert.equal(shortPass.error, "New password must be at least 6 characters.");

  // 3. Same as current password rejected
  const samePass = changeUserPassword(faculty.id, "faculty123", "faculty123");
  assert.equal(samePass.success, false);
  assert.equal(samePass.error, "New password must be different from current password.");

  // 4. Successful authenticated password change
  const successChange = changeUserPassword(faculty.id, "faculty123", "ramesh2025!");
  assert.equal(successChange.success, true);

  // 5. Verify new password authenticates and old password fails
  const reAuthNew = getUserByCredentials("ramesh@ku.ac.in", "ramesh2025!");
  assert.ok(reAuthNew, "User should authenticate with new password");
  assert.equal(reAuthNew.password, "ramesh2025!");

  const reAuthOld = getUserByCredentials("ramesh@ku.ac.in", "faculty123");
  assert.equal(reAuthOld, null, "Old password must no longer authenticate");

  // Reset password back for other tests
  changeUserPassword(faculty.id, "ramesh2025!", "faculty123");

  // Test HOD (h1)
  const hod = getUserByCredentials("hod.math@ku.ac.in", "hod123");
  assert.ok(hod);
  const hodChange = changeUserPassword(hod.id, "hod123", "hodSecure999");
  assert.equal(hodChange.success, true);
  assert.ok(getUserByCredentials("hod.math@ku.ac.in", "hodSecure999"));
  changeUserPassword(hod.id, "hodSecure999", "hod123");

  // Test Principal (p1)
  const principal = getUserByCredentials("principal@ku.ac.in", "principal123");
  assert.ok(principal);
  const princChange = changeUserPassword(principal.id, "principal123", "principalNewPass");
  assert.equal(princChange.success, true);
  assert.ok(getUserByCredentials("principal@ku.ac.in", "principalNewPass"));
  changeUserPassword(principal.id, "principalNewPass", "principal123");

  // Test Admin (a1)
  const admin = getUserByCredentials("iqac@ku.ac.in", "admin123");
  assert.ok(admin);
  const adminChange = changeUserPassword(admin.id, "admin123", "adminSecure456");
  assert.equal(adminChange.success, true);
  assert.ok(getUserByCredentials("iqac@ku.ac.in", "adminSecure456"));
  changeUserPassword(admin.id, "adminSecure456", "admin123");
});
