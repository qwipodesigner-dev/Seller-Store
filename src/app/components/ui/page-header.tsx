import { ReactNode } from "react";

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 truncate">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
      </div>
    </div>
  );
}
