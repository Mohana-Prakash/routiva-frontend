export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  icon?: string | null;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string | null;
  color?: string;
  isActive?: boolean;
}
