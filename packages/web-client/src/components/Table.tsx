import React from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Status } from "@/components/ui/status";
import { Card, CardContent } from "./ui/card";
import { ArrowRightIcon } from "./ui/icons";
import { useRouter } from "next/navigation";

interface ProductsTableProps {
  products: Suspect[];
  columns: TableColumn[];
  searchQuery: string;
}

interface Suspect {
  id: string;
  name: string;
  status: string;
  meetingDate: string;
  known: string;
  createdAt: string;
  state: string;
  agent: string;
}

interface TableColumn {
  key: string;
  label: string;
  show?: boolean;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  columns,
  searchQuery,
}) => {
  const router = useRouter();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <Card className="dark:bg-otherBlue">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b border-gray-200">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={
                    column.show === false ? "hidden md:table-cell" : ""
                  }
                >
                  {column.label === "Image" ? (
                    <span className="sr-only">Image</span>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow
                key={product.id}
                className=""
                onClick={() => router.push(`/funnel/suspect/${product.id}`)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${product.id}-${column.key}`}
                    className={
                      column.show === false ? "hidden md:table-cell" : ""
                    }
                  >
                    {column.key === "name" ? (
                      <div className="flex flex-row items-start">
                        <Image
                          alt="Product image"
                          className="aspect-square rounded-md object-cover mr-4"
                          height="40"
                          src={"/Avatar.png"}
                          width="40"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="font-medium">ID: {product.id}</span>
                        </div>
                      </div>
                    ) : column.key === "status" ? (
                      <Status
                        variant={
                          product.status === "Yet to Contact"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {product.status}
                      </Status>
                    ) : column.key === "meetingDate" ? (
                      product.meetingDate
                    ) : column.key === "agent" ? (
                      product.agent
                    ) : column.key === "known" ? (
                      <div className="">{product.known}</div>
                    ) : column.key === "created_at" ? (
                      product.createdAt
                    ) : column.key === "profile" ? (
                      <Link href="/funnel/suspect">
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
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
