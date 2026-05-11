import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  formatWeatherSummaryMock,
  getWeatherSnapshotMock,
  isWeatherQuestionMock
} = vi.hoisted(() => ({
  formatWeatherSummaryMock: vi.fn(),
  getWeatherSnapshotMock: vi.fn(),
  isWeatherQuestionMock: vi.fn()
}));

vi.mock("@/lib/chatbot-weather", () => ({
  buildWeatherPromptContext: vi.fn(),
  detectWeatherLocation: vi.fn(),
  formatWeatherSummary: formatWeatherSummaryMock,
  getWeatherSnapshot: getWeatherSnapshotMock,
  isWeatherQuestion: isWeatherQuestionMock
}));

vi.mock("@/lib/public-content", () => ({
  destinations: []
}));

vi.mock("@/lib/server-env", () => ({
  getGeminiApiKey: vi.fn(() => "gemini-test-key"),
  getGeminiModel: vi.fn(() => "gemini-2.5-flash")
}));

import { buildTravelReply } from "@/lib/chatbot-travel";

describe("chatbot-travel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getWeatherSnapshotMock.mockReset();
    isWeatherQuestionMock.mockReset();
    formatWeatherSummaryMock.mockReset();
  });

  it("tra thang du lieu thoi tiet da xac thuc ma khong goi Gemini", async () => {
    getWeatherSnapshotMock.mockResolvedValue({
      city: "Hà Nội",
      description: "mây cụm",
      feelsLikeC: 26,
      humidity: 75,
      observedAt: "21/03/2026 09:30",
      temperatureC: 24,
      windSpeed: 2.5
    });
    isWeatherQuestionMock.mockReturnValue(true);
    formatWeatherSummaryMock.mockReturnValue(
      "Thời tiết hiện tại tại Hà Nội: mây cụm, 24°C."
    );

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await buildTravelReply([
      {
        role: "user",
        content: "Thời tiết Hà Nội hôm nay thế nào?"
      }
    ]);

    expect(response.reply).toContain("Thời tiết hiện tại tại Hà Nội: mây cụm, 24°C.");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
