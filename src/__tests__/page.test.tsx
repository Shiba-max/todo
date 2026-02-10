import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("TODOリストが表示される", () => {
    render(<Home />);

    expect(screen.getByText("TODO リスト")).toBeInTheDocument();
  });

  it("main要素が存在する", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("入力フィールドが表示される", () => {
    render(<Home />);

    expect(
      screen.getByPlaceholderText("新しいTODOを入力...")
    ).toBeInTheDocument();
  });
});
