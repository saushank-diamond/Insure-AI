"use client";
import { useAuthenticationGetMe } from "@/api/authentication/authentication";
import { User } from "@/api/schemas/user";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const router = useRouter();
  const { data, error } = useAuthenticationGetMe<User>();

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("branchID");
    router.push("/login");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-borderBlue bg-gray-100/40 px-4 lg:h-[60px] lg:px-6 dark:bg-gray-800/40 dark:bg-otherBlue">
      <div className="w-full flex-1 dark:bg-otherBlue">
        <span className="text-xl dark:text-white">{title}</span>
      </div>
      <DropdownMenu>
        <Separator className="dark:bg-borderBlue" orientation="vertical" />
        <DropdownMenuTrigger asChild>
          <button className="relative flex items-center">
            <div className="flex flex-col mr-13">
              <span className="text-sm text-black dark:text-white">
                {data?.full_name}
              </span>
              <Badge className="h-6 w-32 justify-center">
                {String(data?.designation ?? data?.role).toUpperCase()}
              </Badge>
            </div>
            <Avatar className="ml-2">
              <AvatarImage src="/Avatar.png" />
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
