import { httpClient } from "./client";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

export const categoriesApi = {
  /**
   * Includes inactive (deactivated) categories, not just active ones — the
   * management screen (features/categories/components/CategoryList.tsx) needs
   * to show and let the user reactivate deactivated categories, otherwise a
   * deactivated one becomes permanently unreachable from the UI while still
   * blocking creation of a new category with the same name server-side.
   * `includeInactive` is a best-guess query param name pending the backend's
   * published contract for this filter — confirm/adjust against the real API.
   */
  list: () => httpClient.get<Category[]>("/categories", { params: { includeInactive: true } }).then((r) => r.data),

  create: (input: CreateCategoryInput) => httpClient.post<Category>("/categories", input).then((r) => r.data),

  update: (id: string, input: UpdateCategoryInput) => httpClient.patch<Category>(`/categories/${id}`, input).then((r) => r.data),
};
