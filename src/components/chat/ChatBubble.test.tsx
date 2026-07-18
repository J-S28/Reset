import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatBubble, TypingIndicator } from "./ChatBubble";

describe("ChatBubble", () => {
  it("renders the message text", () => {
    render(<ChatBubble message={{ role: "user", text: "How has today been?" }} />);
    expect(screen.getByText("How has today been?")).toBeInTheDocument();
  });

  it("right-aligns user messages and left-aligns RESET's replies", () => {
    const { container: userContainer } = render(
      <ChatBubble message={{ role: "user", text: "Hi" }} />,
    );
    expect(userContainer.firstElementChild).toHaveClass("justify-end");

    const { container: modelContainer } = render(
      <ChatBubble message={{ role: "model", text: "Hi there" }} />,
    );
    expect(modelContainer.firstElementChild).toHaveClass("justify-start");
  });
});

describe("TypingIndicator", () => {
  it("announces itself to assistive tech via aria-label", () => {
    render(<TypingIndicator />);
    expect(screen.getByLabelText("RESET is typing")).toBeInTheDocument();
  });
});
