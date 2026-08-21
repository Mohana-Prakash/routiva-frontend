import { httpClient } from "./client";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

export const categoriesApi = {
  list: () => httpClient.get<Category[]>("/categories").then((r) => r.data),

  create: (input: CreateCategoryInput) => httpClient.post<Category>("/categories", input).then((r) => r.data),

  update: (id: string, input: UpdateCategoryInput) => httpClient.patch<Category>(`/categories/${id}`, input).then((r) => r.data),

  remove: (id: string) => httpClient.delete<void>(`/categories/${id}`).then((r) => r.data),
};
