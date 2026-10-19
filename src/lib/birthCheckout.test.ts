import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { beginBirthCheckout, checkoutDestination } from "./birthCheckout";
import { trackInitiateCheckout } from "./metaPixel";

vi.mock("./metaPixel", () => ({ trackInitiateCheckout: vi.fn() }));

describe("birth checkout attribution and event delivery", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.mocked(trackInitiateCheckout).mockReset(); });
  afterEach(() => vi.useRealTimers());

  it("emits checkout before navigating and gives the pixel 150ms", () => {
    const navigate = vi.fn();
    beginBirthCheckout("https://pay.hotmart.com/D108067220C?checkoutMode=10", navigate);
    expect(trackInitiateCheckout).toHaveBeenCalledWith(4);
    vi.advanceTimersByTime(149);
    expect(navigate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("still opens checkout when an analytics script throws", () => {
    vi.mocked(trackInitiateCheckout).mockImplementation(() => { throw new Error("blocked"); });
    const navigate = vi.fn();
    beginBirthCheckout("https://pay.hotmart.com/D108067220C?checkoutMode=10", navigate);
    vi.advanceTimersByTime(150);
    expect(navigate).toHaveBeenCalledWith("https://pay.hotmart.com/D108067220C?checkoutMode=10");
  });

  it("retains attribution already appended by UTMify and carries ad parameters", () => {
    const result = new URL(checkoutDestination("https://pay.hotmart.com/D108067220C?checkoutMode=10&sck=utmify-id", "?utm_campaign=madres&fbclid=ad-id&sck=other&irrelevant=ignore"));
    expect(result.searchParams.get("sck")).toBe("utmify-id");
    expect(result.searchParams.get("utm_campaign")).toBe("madres");
    expect(result.searchParams.get("fbclid")).toBe("ad-id");
    expect(result.searchParams.has("irrelevant")).toBe(false);
    expect(result.searchParams.get("checkoutMode")).toBe("10");
  });
});
