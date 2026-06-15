import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-12 mb-8">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:text-indigo-600 hover:border-indigo-600/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:text-indigo-600 hover:border-indigo-600/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 mx-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-10 min-w-[40px] px-3 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
              currentPage === page
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'border border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:border-indigo-600/30 hover:text-indigo-600'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:text-indigo-600 hover:border-indigo-600/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:text-indigo-600 hover:border-indigo-600/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
