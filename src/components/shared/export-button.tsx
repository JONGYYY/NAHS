"use client";

import { Download } from "lucide-react";
import { toCSV } from "@/lib/csv";
import { Button, type ButtonProps } from "@/components/ui/button";

export function ExportButton({
  filename,
  headers,
  rows,
  label = "Export CSV",
  variant = "outline",
  size = "sm",
}: {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  function download() {
    const csv = toCSV(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant={variant} size={size} onClick={download} disabled={rows.length === 0}>
      <Download className="size-4" /> {label}
    </Button>
  );
}
