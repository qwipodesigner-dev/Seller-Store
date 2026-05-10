import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "./ui/utils";
import type { CatalogSku } from "../lib/sku-catalog";

/**
 * Search-as-you-type SKU picker for the Offers & Schemes editor
 * (and any other surface that needs a SKU selector with autocomplete
 * + filtering).
 *
 * Behaviour:
 *   - Click the trigger → popover opens with the filtered SKU list
 *     visible by default (no need to type to see options).
 *   - Type in the search box to narrow by SKU code, name, brand, or
 *     category. Cmdk's built-in fuzzy match handles the matching;
 *     we just feed it the searchable string per item.
 *   - Items are filtered upstream — see `skus` prop. The expected
 *     shape: drop Inactive SKUs and SKUs already mapped to a scheme
 *     before passing them in. The combobox itself doesn't know what
 *     "active" means; it just renders what it's given.
 *   - Selecting an item closes the popover and fires onChange with
 *     the chosen skuCode.
 *
 * Uses the project's existing Popover + Command primitives, so it
 * picks up Tailwind dark-mode + theming for free.
 */

interface Props {
  skus: CatalogSku[];
  /** Currently selected skuCode (empty string = nothing chosen). */
  value: string;
  onChange: (skuCode: string) => void;
  placeholder?: string;
  /** Optional message rendered when the filtered list is empty. */
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function SkuComboBox({
  skus,
  value,
  onChange,
  placeholder = "Search SKU by code, name, brand…",
  emptyMessage = "No matching SKU found.",
  className,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => skus.find((s) => s.skuCode === value),
    [skus, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Search className="h-4 w-4 shrink-0 opacity-60" />
            <span className="truncate">
              {selected ? (
                <>
                  <span className="font-mono text-xs">
                    {selected.skuCode}
                  </span>{" "}
                  — {selected.skuName}
                </>
              ) : (
                placeholder
              )}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
      >
        <Command
          // Custom filter — surface SKUs that match by code, name,
          // brand or category. Cmdk's default filter would only
          // search the value-string; this lets the user type
          // "freedom" or "edible" and still see relevant matches.
          filter={(value, search) => {
            if (!search) return 1;
            return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-72">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {skus.map((s) => {
                // Searchable string — cmdk filters against this.
                const searchable = `${s.skuCode} ${s.skuName} ${s.brand} ${s.category}`;
                const isSel = s.skuCode === value;
                return (
                  <CommandItem
                    key={s.skuCode}
                    value={searchable}
                    onSelect={() => {
                      onChange(s.skuCode);
                      setOpen(false);
                    }}
                    className="flex items-start gap-2"
                  >
                    <Check
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0",
                        isSel ? "opacity-100 text-blue-600" : "opacity-0",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-700">
                          {s.skuCode}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {s.skuName}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {s.brand} · {s.category} · MRP ₹{s.mrp} · SP ₹
                        {s.sellingPrice}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
