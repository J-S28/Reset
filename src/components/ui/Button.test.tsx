import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a native button and fires onClick", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Start Your Reset</Button>);

    const button = screen.getByRole("button", { name: "Start Your Reset" });
    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a link (not a button) when given an href", () => {
    render(<Button href="/onboarding">Start Your Reset</Button>);
    const link = screen.getByRole("link", { name: "Start Your Reset" });
    expect(link).toHaveAttribute("href", "/onboarding");
  });

  it("is keyboard accessible (a real <button> element, not a div)", () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole("button", { name: "Continue" }).tagName).toBe("BUTTON");
  });
});
