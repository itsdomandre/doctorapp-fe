export const USER_MOCK = {
  id: "user-1",
  fullName: "Ana Silva",
  email: "ana@exemplo.com",
  role: "USER" as const,
  status: "ACTIVE",
};

export const ADMIN_MOCK = {
  id: "admin-1",
  fullName: "Dr. Carlos Costa",
  email: "admin@exemplo.com",
  role: "ADMIN" as const,
  status: "ACTIVE",
};

export const EMPTY_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
};
