import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : `${selected.length} selected`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="max-h-64 overflow-auto">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <div
                key={option.value}
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100",
                  isSelected && "bg-blue-50"
                )}
                onClick={() => handleToggle(option.value)}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300",
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "opacity-50"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm">{option.label}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}