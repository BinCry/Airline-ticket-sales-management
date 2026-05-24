import { afterEach, describe, expect, it, vi } from "vitest";

import { getOpenWeatherApiKey } from "@/lib/server-env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("server-env", () => {
  it("uu tien bien moi truong OPENWEATHER_API_KEY", () => {
    vi.stubEnv("OPENWEATHER_API_KEY", "primary-key");
    vi.stubEnv("OPEN_WEATHER_API_KEY", "secondary-key");

    expect(getOpenWeatherApiKey()).toBe("primary-key");
  });

  it("dung bien moi truong thay the khi bien chinh khong co", () => {
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    vi.stubEnv("OPEN_WEATHER_API_KEY", "secondary-key");

    expect(getOpenWeatherApiKey()).toBe("secondary-key");
  });

  it("tra ve rong khi chua cau hinh khoa OpenWeather", () => {
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    vi.stubEnv("OPEN_WEATHER_API_KEY", "");

    expect(getOpenWeatherApiKey()).toBe("");
  });
});
