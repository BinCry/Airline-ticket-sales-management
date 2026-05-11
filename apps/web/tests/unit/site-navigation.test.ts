import { describe, expect, it } from "vitest";

import { buildMainNavigation } from "@/lib/site-navigation";

describe("site-navigation", () => {
  it("khong hien lien ket backoffice voi khach thuong", () => {
    expect(buildMainNavigation(["customer"]).some((item) => item.href === "/backoffice")).toBe(false);
  });

  it("hien lien ket backoffice voi nhan vien cham soc khach hang", () => {
    expect(buildMainNavigation(["customer_support"]).some((item) => item.href === "/backoffice")).toBe(true);
  });

  it("hien lien ket backoffice voi nhan vien van hanh", () => {
    expect(buildMainNavigation(["operations_staff"]).some((item) => item.href === "/backoffice")).toBe(true);
  });
});
