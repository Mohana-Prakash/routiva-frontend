import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/types/api";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    replace.mockClear();
    vi.mocked(authApi.login).mockReset();
    vi.mocked(authApi.me).mockReset();
  });

  it("shows field-level validation errors instead of submitting when empty", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("redirects to the dashboard on successful login", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      user: { id: "u1", name: "Jane", email: "jane@example.com", timezone: "UTC", status: "ACTIVE", createdAt: "", updatedAt: "", lastLoginAt: null },
    });
    vi.mocked(authApi.me).mockResolvedValue({
      id: "u1",
      name: "Jane",
      email: "jane@example.com",
      timezone: "UTC",
      status: "ACTIVE",
      createdAt: "",
      updatedAt: "",
      lastLoginAt: null,
    });
    const user = userEvent.setup();
    renderWithQueryClient(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an inline password error on invalid credentials instead of a generic toast", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError({ code: "INVALID_CREDENTIALS", message: "bad", status: 401 }));
    const user = userEvent.setup();
    renderWithQueryClient(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Incorrect email or password.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
