import type { ColumnDef } from "@/components/DynamicTable";
import type { Lang } from "@/lib/translations";

export function getResearchPaperCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "title", header: e ? "Title of Paper" : "పత్రం పేరు", type: "text", width: "200px", required: true },
    { key: "journal", header: e ? "Journal Name" : "జర్నల్ పేరు", type: "text", width: "160px", required: true },
    { key: "issn", header: "ISSN", type: "text", placeholder: "0000-0000", width: "100px" },
    { key: "volume", header: e ? "Vol/Issue" : "వాల్యూమ్", type: "text", width: "90px" },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", placeholder: "2024", width: "70px" },
    { key: "authors", header: e ? "Author(s)" : "రచయిత(లు)", type: "text", width: "140px" },
    { key: "doi", header: "DOI / URL", type: "text", width: "130px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
    { key: "impactFactor", header: e ? "Impact Factor" : "ఇంపాక్ట్ ఫ్యాక్టర్", type: "text", placeholder: "e.g. 3.5", width: "110px" },
  ];
}

export function getBooksCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "type", header: e ? "Type" : "రకం", type: "select", options: ["Book", "Book Chapter", "Conference Proceeding"], width: "140px", required: true },
    { key: "title", header: e ? "Title" : "పేరు", type: "text", width: "180px", required: true },
    { key: "authors", header: e ? "Author(s)" : "రచయిత(లు)", type: "text", width: "140px" },
    { key: "publisher", header: e ? "Publisher" : "ప్రచురణకర్త", type: "text", width: "140px" },
    { key: "isbn", header: "ISBN", type: "text", width: "110px" },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", width: "70px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getFdpCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "title", header: e ? "Programme Title" : "కార్యక్రమం పేరు", type: "text", width: "180px", required: true },
    { key: "organizer", header: e ? "Organizer" : "నిర్వహించిన సంస్థ", type: "text", width: "160px" },
    { key: "dateFrom", header: e ? "From" : "నుండి", type: "date", width: "110px" },
    { key: "dateTo", header: e ? "To" : "వరకు", type: "date", width: "110px" },
    { key: "duration", header: e ? "Days" : "రోజులు", type: "number", width: "60px" },
    { key: "mode", header: e ? "Mode" : "మోడ్", type: "select", options: ["Online", "Offline", "Hybrid"], width: "90px" },
    { key: "sponsoredBy", header: e ? "Sponsored By" : "సహకారం", type: "text", width: "120px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getPatentCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "title", header: e ? "Patent Title" : "పేటెంట్ పేరు", type: "text", width: "180px", required: true },
    { key: "patentNumber", header: e ? "Patent No." : "పేటెంట్ నంబర్", type: "text", width: "130px" },
    { key: "patentStatus", header: e ? "Status" : "స్థితి", type: "select", options: ["Published", "Awarded", "Filed"], width: "100px" },
    { key: "patentUrl", header: e ? "Patent URL" : "పేటెంట్ లింక్", type: "text", placeholder: "https://...", width: "140px" },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", width: "70px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getSeminarCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "title", header: e ? "Title" : "పేరు", type: "text", width: "190px", required: true },
    { key: "organizer", header: e ? "Organizer" : "నిర్వహించిన సంస్థ", type: "text", width: "150px" },
    { key: "dateFrom", header: e ? "From" : "నుండి", type: "date", width: "110px" },
    { key: "dateTo", header: e ? "To" : "వరకు", type: "date", width: "110px" },
    { key: "level", header: e ? "Level" : "స్థాయి", type: "select", options: ["National", "International", "State", "University"], width: "110px" },
    { key: "role", header: e ? "Role" : "పాత్ర", type: "text", width: "130px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getFellowshipCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "name", header: e ? "Fellowship Name" : "ఫెలోషిప్ పేరు", type: "text", width: "180px", required: true },
    { key: "type", header: e ? "Type" : "రకం", type: "text", placeholder: e ? "e.g. National / International" : "ఉదా. జాతీయ / అంతర్జాతీయ", width: "140px" },
    { key: "body", header: e ? "Awarding Body" : "అవార్డు ఇచ్చిన సంస్థ", type: "text", width: "160px" },
    { key: "amount", header: e ? "Amount (₹)" : "మొత్తం (₹)", type: "number", width: "100px" },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", width: "70px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getProjectCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "title", header: e ? "Project Title" : "ప్రాజెక్ట్ పేరు", type: "text", width: "190px", required: true },
    { key: "agency", header: e ? "Funding Agency" : "నిధుల సంస్థ", type: "text", width: "150px" },
    { key: "type", header: e ? "Type" : "రకం", type: "select", options: ["Government", "Non-Government"], width: "120px" },
    { key: "amount", header: e ? "Amount (₹)" : "మొత్తం (₹)", type: "number", width: "110px" },
    { key: "duration", header: e ? "Duration (Yrs)" : "వ్యవధి (సం.)", type: "number", width: "90px" },
    { key: "projectStatus", header: e ? "Status" : "స్థితి", type: "select", options: ["Ongoing", "Completed"], width: "100px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getAwardCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "name", header: e ? "Award / Recognition" : "అవార్డ్ / గుర్తింపు", type: "text", width: "190px", required: true },
    { key: "body", header: e ? "Awarding Body" : "అవార్డు ఇచ్చిన సంస్థ", type: "text", width: "160px" },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", width: "70px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getEcontentCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "title", header: e ? "Title of E-Content" : "ఈ-కంటెంట్ పేరు", type: "text", width: "190px", required: true },
    { key: "platform", header: e ? "Platform / LMS" : "ప్లాట్‌ఫామ్", type: "text", width: "130px" },
    { key: "url", header: "URL / Link", type: "text", width: "160px" },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", width: "70px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getOutRangeActivityCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "description", header: e ? "Description / Activity" : "వివరణ / కార్యకలాపం", type: "textarea", width: "280px", required: true },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", width: "70px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}

export function getOtherCols(lang: Lang): ColumnDef[] {
  const e = lang === "en";
  return [
    { key: "description", header: e ? "Description / Activity" : "వివరణ / కార్యకలాపం", type: "textarea", width: "280px", required: true },
    { key: "year", header: e ? "Year" : "సంవత్సరం", type: "text", width: "70px" },
    { key: "evidence", header: e ? "Evidence" : "సాక్ష్యం", type: "file", width: "140px" },
  ];
}
