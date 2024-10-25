"use client";

import { Link } from "@/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MdSwapVert } from "react-icons/md";
import { Button } from "@/components/ui/button";

export type Client = {
  _id: string;
  email: string;
  settings: { timeZone: string };
  personalInfo: { phoneNumber: string; sex: string; country: string };
  firstName: { en: string; ar: string };
  lastName: { en: string; ar: string };
  createdAt: string;
};

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <MdSwapVert className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const email = row.original?.email;
      return (
        <Link href={`/admin/clients/${row.original._id}`}>
          <span className="underline text-primary">{email}</span>
        </Link>
      );
    },
  },
  {
    id: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Full Name
        <MdSwapVert className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => `${row.firstName?.en} ${row.lastName?.en}`, // Full name accessor
    cell: ({ row }) => {
      const firstName = row.original?.firstName?.en;
      const lastName = row.original?.lastName?.en;
      return `${firstName} ${lastName}`;
    },
    sortingFn: (rowA, rowB) => {
      const nameA =
        `${rowA.original.firstName?.en} ${rowA.original.lastName?.en}`.toLowerCase();
      const nameB =
        `${rowB.original.firstName?.en} ${rowB.original.lastName?.en}`.toLowerCase();
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "settings.timeZone",
    header: "Time Zone",
  },
  {
    accessorKey: "personalInfo.phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
];
