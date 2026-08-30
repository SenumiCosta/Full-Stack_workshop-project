import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

vi.mock("../api/apiClient", () => ({
  default: {
    post: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
});

describe("Login Page", () => {
  it("renders the login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("SyncBoard")).toBeInTheDocument();

    expect(
      screen.getByText("Sign in to collaborate")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email Address")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Sign In" })
    ).toBeInTheDocument();
  });

  it("renders the Sign Up link", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: "Sign Up" })
    ).toBeInTheDocument();
  });
});