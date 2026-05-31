import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers, updateUserRole, type UserDTO, type Role } from "@/lib/api/users";
import Pagination from "@/components/Pagination";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAllUsers(page)
      .then((data) => {
        setUsers(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  async function handleRoleChange(id: string, role: Role) {
    setUpdatingId(id);
    try {
      const updated = await updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Utilizadores</h1>
          <p className="text-gray-500 text-sm mt-1">Todos os utilizadores do sistema.</p>
        </div>
        <button
          onClick={() => navigate("/admin/users/new")}
          className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-700"
        >
          + Novo utilizador
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">A carregar…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum utilizador encontrado.</p>
      ) : (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phoneNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="DOCTOR">DOCTOR</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
