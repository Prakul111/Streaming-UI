import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (e: React.FormEvent) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  inputClassName?: string
  size?: "sm" | "md" | "lg"
  autoFocus?: boolean
  showSubmitButton?: boolean
  submitButtonText?: string
  onFocus?: () => void
  onBlur?: () => void
  inputRef?: React.Ref<HTMLInputElement>
  shortcutKey?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search...",
  className,
  inputClassName,
  size = "md",
  autoFocus = false,
  showSubmitButton = true,
  submitButtonText = "Search",
  onFocus,
  onBlur,
  inputRef,
  shortcutKey,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  const handleClear = () => {
    onChange("")
    onClear?.()
  }

  const sizeClasses = {
    sm: {
      input: "h-9 pl-9 text-xs",
      icon: "left-3 size-3.5",
      button: "px-3 py-1 text-xs",
      paddingRight: value ? "pr-20" : "pr-16",
    },
    md: {
      input: "h-10 sm:h-11 pl-10 sm:pl-10.5 text-xs sm:text-sm",
      icon: "left-3.5 size-4",
      button: "px-3.5 py-1.5 text-xs font-semibold",
      paddingRight: value ? "pr-24 sm:pr-26" : "pr-20 sm:pr-22",
    },
    lg: {
      input: "h-12 sm:h-13 pl-11 sm:pl-12 text-sm sm:text-base",
      icon: "left-4 size-4.5 sm:size-5",
      button: "px-4.5 py-2 text-xs sm:text-sm font-semibold",
      paddingRight: value ? "pr-28 sm:pr-32" : "pr-22 sm:pr-26",
    },
  }[size]

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex items-center w-full group", className)}
    >
      {/* Left Search Icon with Guaranteed z-10 Stacking */}
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none z-10 transition-colors group-focus-within:text-purple-400",
          sizeClasses.icon
        )}
      />

      {/* Main Search Input with Pill Contour and Glassmorphic Shimmer */}
      <input
        ref={inputRef}
        type="text"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-full border border-border/60 bg-muted/30 text-foreground placeholder:text-muted-foreground/60 shadow-inner backdrop-blur-md transition-all duration-200",
          "hover:border-border hover:bg-muted/40",
          "focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 focus:bg-muted/50",
          sizeClasses.input,
          shortcutKey && !value && !showSubmitButton ? "pr-12" : sizeClasses.paddingRight,
          inputClassName
        )}
      />

      {/* Right Cluster: Shortcut Badge / Clear Button + Submit Pill */}
      <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
        {shortcutKey && !value && (
          <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/60 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground select-none pointer-events-none">
            {shortcutKey}
          </kbd>
        )}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="size-3.5 sm:size-4" />
          </button>
        )}
        {showSubmitButton && (
          <button
            type="submit"
            className={cn(
              "cursor-pointer rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-sm shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-150 active:scale-95 shrink-0",
              sizeClasses.button
            )}
          >
            {submitButtonText}
          </button>
        )}
      </div>
    </form>
  )
}
