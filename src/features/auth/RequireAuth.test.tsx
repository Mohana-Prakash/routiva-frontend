import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequireAuth, RedirectIfAuthenticated } from "./RequireAuth";

const replace = vi.fn();
let mockStatus: "loading" | "authenticated" | "unauthenticated" = "loading";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard",
}));

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ status: mockStatus, user: null }),
}));

describe("RequireAuth", () => {
  it("shows a loading state and does not redirect while session restoration is pending", () => {
    mockStatus = "loading";
    replace.mockClear();
    render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /login when unauthenticated", () => {
    mockStatus = "unauthenticated";
    replace.mockClear();
    render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("/login"));
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children once authenticated", () => {
    mockStatus = "authenticated";
    replace.mockClear();
    render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("RedirectIfAuthenticated", () => {
  it("redirects an authenticated user away from an auth screen", () => {
    mockStatus = "authenticated";
    replace.mockClear();
    render(
      <RedirectIfAuthenticated>
        <div>Login form</div>
      </RedirectIfAuthenticated>,
    );
    expect(replace).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
  });

  it("renders the auth screen for a signed-out visitor", () => {
    mockStatus = "unauthenticated";
    replace.mockClear();
    render(
      <RedirectIfAuthenticated>
        <div>Login form</div>
      </RedirectIfAuthenticated>,
    );
    expect(screen.getByText("Login form")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
