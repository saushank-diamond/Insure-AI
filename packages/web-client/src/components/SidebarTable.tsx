import { Status } from "@/components/ui/status";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ArrowRightIcon } from "./ui/icons";
import { Suspect } from "./SuspectSidebar";

interface TableColumn {
  key: string;
  label: string;
  show?: boolean;
}

interface ProductsTableProps {
  products: Suspect[];
  columns: TableColumn[];
  onSelectSuspect: (suspect: Suspect) => void;
}

const SidebarTable: React.FC<ProductsTableProps> = ({
  products,
  columns,
  onSelectSuspect,
}) => {
  return (
    <Table className="mt-3">
      <TableBody>
        {products.map((product) => (
          <TableRow
            className="p-0"
            key={product.name}
            onClick={() => onSelectSuspect(product)}
          >
            {columns.map((column) => (
              <TableCell key={`${product.name}-${column.key}`} className="p-1">
                {column.key === "name" ? (
                  <div className="flex flex-row items-center mb-2.5">
                    <Image
                      alt="Product image"
                      className="aspect-square rounded-md object-cover mr-2"
                      height="40"
                      src="/Avatar.png"
                      width="40"
                    />
                    <div className="flex flex-col p-0">
                      <span className="font-medium text-gray-200">
                        {product.name}
                      </span>
                      <Status
                        className="text-xs whitespace-nowrap"
                        variant={
                          product.status === "Yet to Contact"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {product.status}
                      </Status>
                    </div>
                  </div>
                ) : column.key === "profile" ? (
                  <Link href="#">
                    <button className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle">
                      <ArrowRightIcon />
                    </button>
                  </Link>
                ) : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SidebarTable;
