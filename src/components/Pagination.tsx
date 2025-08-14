type Props = {
  page: number;          // 0-based
  totalPages: number;
  onPage: (p: number) => void;
};

export default function Pagination({ page, totalPages, onPage }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded-lg border px-3 py-1 disabled:opacity-50"
        onClick={() => onPage(Math.max(0, page - 1))}
        disabled={page <= 0}
      >
        Anterior
      </button>
      <span className="text-sm text-gray-600">
        Página {page + 1} de {Math.max(1, totalPages)}
      </span>
      <button
        className="rounded-lg border px-3 py-1 disabled:opacity-50"
        onClick={() => onPage(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
      >
        Próxima
      </button>
    </div>
  );
}
