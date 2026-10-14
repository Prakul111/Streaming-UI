import { motion } from "motion/react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

export interface PremiumRibbonProps {
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export default function PremiumRibbon({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
}: PremiumRibbonProps) {
  const activePage = currentPage

  const handlePageChange = (page: number) => {
    onPageChange?.(Math.max(1, Math.min(totalPages, page)))
  }

  const renderPageButtons = () => {
    const buttons = []
    const maxVisible = 5

    let start = Math.max(1, activePage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      buttons.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(1)
            }}
            className="size-8 sm:size-10 rounded-lg sm:rounded-xl text-xs sm:text-sm p-0"
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (start > 2) {
        buttons.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis className="size-8 sm:size-10" />
          </PaginationItem>
        )
      }
    }

    for (let i = start; i <= end; i++) {
      const isActive = activePage === i
      buttons.push(
        <PaginationItem key={i} className="relative">
          <PaginationLink
            href="#"
            isActive={isActive}
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(i)
            }}
            className={cn(
              "size-8 sm:size-10 rounded-lg sm:rounded-xl border-0 text-xs sm:text-sm font-bold transition-all p-0",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {i}
          </PaginationLink>
          {isActive && (
            <motion.div
              layoutId="ribbon-active"
              className="absolute inset-x-1 sm:inset-x-1.5 bottom-0.5 h-0.5 rounded-full bg-primary"
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            />
          )}
        </PaginationItem>
      )
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        buttons.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis className="size-8 sm:size-10" />
          </PaginationItem>
        )
      }
      buttons.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(totalPages)
            }}
            className="size-8 sm:size-10 rounded-lg sm:rounded-xl text-xs sm:text-sm p-0"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return buttons
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 max-w-full overflow-hidden">
      <Pagination className="max-w-full">
        <PaginationContent className="flex flex-wrap sm:flex-nowrap justify-center max-w-full gap-0.5 sm:gap-1 rounded-2xl border bg-background/80 p-1 sm:p-2 shadow-sm">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(activePage - 1)
              }}
              text=""
              className="group flex size-8 sm:size-10 justify-center rounded-lg sm:rounded-xl p-0 hover:bg-muted"
            />
          </PaginationItem>

          <div className="mx-0.5 sm:mx-2 flex flex-wrap items-center justify-center gap-0.5 sm:gap-1.5">
            {renderPageButtons()}
          </div>

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(activePage + 1)
              }}
              text=""
              className="group flex size-8 sm:size-10 justify-center rounded-lg sm:rounded-xl p-0 hover:bg-muted"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="h-px w-full max-w-50 bg-linear-to-r from-transparent via-border to-transparent opacity-50" />

      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-70">
        <span
          className={activePage === 1 ? "text-primary transition-colors" : ""}
        >
          First
        </span>
        <div className="h-1 w-1 rounded-full bg-border" />
        <span
          className={
            activePage === totalPages ? "text-primary transition-colors" : ""
          }
        >
          Last
        </span>
      </div>
    </div>
  )
}
