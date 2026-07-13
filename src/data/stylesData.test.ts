import { describe, it, expect } from "vitest";
import { STYLES_DATA } from "./stylesData";

describe("STYLES_DATA", () => {
  it("is a non-empty array of folders", () => {
    expect(Array.isArray(STYLES_DATA)).toBe(true);
    expect(STYLES_DATA.length).toBeGreaterThan(0);
  });

  it("every folder has required fields and at least one file", () => {
    for (const folder of STYLES_DATA) {
      expect(typeof folder.id).toBe("string");
      expect(folder.id.length).toBeGreaterThan(0);
      expect(typeof folder.title).toBe("string");
      expect(typeof folder.description).toBe("string");
      expect(typeof folder.coverImage).toBe("string");
      expect(Array.isArray(folder.files)).toBe(true);
      expect(folder.files.length).toBeGreaterThan(0);
    }
  });

  it("every file has id, name, image, and prompt", () => {
    for (const folder of STYLES_DATA) {
      for (const file of folder.files) {
        expect(typeof file.id).toBe("string");
        expect(file.id.length).toBeGreaterThan(0);
        expect(typeof file.name).toBe("string");
        expect(typeof file.image).toBe("string");
        expect(typeof file.prompt).toBe("string");
      }
    }
  });

  it("has unique folder ids and unique file ids within each folder", () => {
    const folderIds = STYLES_DATA.map((f) => f.id);
    expect(new Set(folderIds).size).toBe(folderIds.length);

    for (const folder of STYLES_DATA) {
      const fileIds = folder.files.map((f) => f.id);
      expect(new Set(fileIds).size).toBe(fileIds.length);
    }
  });

  it("all image and cover URLs are optimized Pexels links", () => {
    for (const folder of STYLES_DATA) {
      expect(folder.coverImage).toMatch(/^https:\/\/images\.pexels\.com\//);
      expect(folder.coverImage).toContain("auto=compress");
      for (const file of folder.files) {
        expect(file.image).toMatch(/^https:\/\/images\.pexels\.com\//);
        expect(file.image).toContain("w=800&h=1000&fit=crop");
      }
    }
  });
});
