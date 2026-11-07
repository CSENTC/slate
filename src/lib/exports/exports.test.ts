import { describe, it, expect } from "vitest";

describe("Phase 5: Export Modules Smoke Test", () => {
  it("verifies export modules are importable", async () => {
    const pdfExport = await import("./pdf-export");
    const excelExport = await import("./excel-export");
    const icalExport = await import("./ical-export");

    expect(typeof pdfExport.exportTimetablePDF).toBe("function");
    expect(typeof excelExport.exportTimetableExcel).toBe("function");
    expect(typeof icalExport.exportTimetableIcsZip).toBe("function");
  });
});

