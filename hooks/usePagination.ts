import { useState, useCallback } from 'react'

interface UsePaginationProps {
  initialPage?: number
  initialPageSize?: number
  totalPages?: number
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  totalPages = 1,
}: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToPage = useCallback((pageNum: number) => {
    setPage(Math.max(1, Math.min(pageNum, totalPages)))
  }, [totalPages])

  const reset = useCallback(() => {
    setPage(initialPage)
  }, [initialPage])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    reset,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}


