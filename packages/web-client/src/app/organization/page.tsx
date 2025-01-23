"use client";
import { useAuthenticationGetMe } from "@/api/authentication/authentication";
import {
  useOrganizationsCreateBranchInvite,
  useOrganizationsGetBranchInvites,
  useOrganizationsGetBranchMembers,
  useOrganizationsModifyMemberAccess,
} from "@/api/organizations/organizations";
import { User } from "@/api/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CopyIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { toast, useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";

const copyToClipboard = async (text: any) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Link Copied!",
      description: "The link has been copied to your clipboard.",
    });
  } catch (err) {
    toast({
      title: "Copy Failed!",
      description: "The link could not be copied.",
    });
  }
};

type InviteDialogProps = {
  refetchInvites: () => void;
};

const InviteDialog: React.FC<InviteDialogProps> = ({ refetchInvites }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { mutateAsync: createInvite } = useOrganizationsCreateBranchInvite();

  let branchID = "";
  if (typeof window !== "undefined") {
    branchID = localStorage.getItem("branchID") ?? "";
  }

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: "Email is required",
        description: "Please enter an email to send an invite.",
      });
      return;
    }

    try {
      await createInvite({ branchId: branchID, data: { name, email } });
      toast({
        title: "Invite Sent",
        description: "The invite has been sent successfully.",
      });
      setEmail("");
      setName("");
      setIsOpen(false);
      refetchInvites();
    } catch (error) {
      console.error("Failed to send invite:", error);
      toast({
        title: "Failed to Send Invite",
        description: "An error occurred while sending the invite.",
      });
    }
  };

  return (
    <>
      <Toaster />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="submit"
            className="py-2 px-6 dark:bg-buttonBlue dark:text-white"
          >
            INVITE NEW MEMBER
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Enter the email of the person you want to invite to the branch.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button onClick={handleInvite} className="w-full">
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Organization = () => {
  let branchID = "";
  let organizationName = "";
  if (typeof window !== "undefined") {
    branchID = localStorage.getItem("branchID") ?? "";
    organizationName = localStorage.getItem("orgName") ?? "";
  }
  const {
    data,
    error,
    isError,
    isLoading,
    refetch: refetchMembers,
  } = useOrganizationsGetBranchMembers(branchID);
  const { data: invitesData, refetch: refetchInvites } =
    useOrganizationsGetBranchInvites(branchID);

  const invData = invitesData?.filter((invite) => invite.status === "pending");

  const { data: me } = useAuthenticationGetMe<User>();
  const isAdmin = me?.role === "admin";

  const { mutateAsync: modifyMemberAccess } =
    useOrganizationsModifyMemberAccess();

  const handleDeactivate = async (memberId: string, is_active: boolean) => {
    try {
      await modifyMemberAccess({
        branchId: branchID,
        memberId: memberId,
        data: { is_active },
      });
      if (is_active) {
        toast({
          title: "Member Activated",
          description: "The member has been activated successfully.",
        });
      } else {
        toast({
          title: "Member Deactivated",
          description: "The member has been deactivated successfully.",
        });
      }
      await refetchMembers();
    } catch (error) {
      console.error("Failed to deactivate member:", error);
      if (is_active) {
        toast({
          title: "Failed to Activate",
          description: "An error occurred while activating the member.",
        });
      } else {
        toast({
          title: "Failed to Deactivate",
          description: "An error occurred while deactivating the member.",
        });
      }
    }
  };

  const columns = [
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "remove", label: "" },
  ];

  const inviteColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "invited_by", label: "Invited By" },
  ];

  const getRegistrationLink = (member: any) => {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_DEV_REG_URL
        : process.env.NEXT_PUBLIC_PROD_REG_URL;
    return `${baseUrl}/register?invite_token=${member.token}&organization_name=${member.organization_name}&email=${member.email}&name=${member.name}`;
  };

  return (
    <>
      <main className="dark">
        <div className="grid min-h-screen">
          <div className="flex flex-col dark:bg-bgBlue relative">
            <div className="mt-5 ml-5 flex">
              <Card className="dark:bg-otherBlue w-9/12 p-0">
                <CardHeader>
                  <CardTitle className="flex flex-row justify-between items-center text-lg p-0">
                    Branch Members
                    {isAdmin && (
                      <InviteDialog refetchInvites={refetchInvites} />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data && data.length > 0 ? (
                    <Card className="dark:bg-otherBlue rounded-none">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="border-b border-gray-200">
                            <TableRow>
                              {columns.map((column) => (
                                <TableHead key={column.key}>
                                  {column.label}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.map((member) => (
                              <TableRow
                                key={member.id}
                                className="cursor-pointer"
                              >
                                {columns.map((column) => (
                                  <TableCell key={`${member.id}-${column.key}`}>
                                    {column.key === "full_name"
                                      ? member.full_name
                                      : column.key === "email"
                                        ? member.email
                                        : column.key === "role"
                                          ? member.role
                                          : null}
                                  </TableCell>
                                ))}

                                {isAdmin && me.id !== member.id && (
                                  <TableCell>
                                    <Button
                                      type="submit"
                                      className="dark:bg-red-500 dark:text-white"
                                      onClick={() =>
                                        handleDeactivate(
                                          member.id,
                                          !member.is_active
                                        )
                                      }
                                    >
                                      {member.is_active
                                        ? "DEACTIVATE"
                                        : "ACTIVATE"}
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <div>No members found</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {isAdmin && (
              <div className="mt-5 ml-5 flex">
                <Card className="dark:bg-otherBlue w-9/12 p-0">
                  <CardHeader>
                    <CardTitle className="flex flex-row justify-between items-center text-lg p-0">
                      Invited Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invData && invData.length > 0 ? (
                      <Card className="dark:bg-otherBlue rounded-none">
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader className="border-b border-gray-200">
                              <TableRow>
                                {inviteColumns.map((column) => (
                                  <TableHead key={column.key}>
                                    {column.label}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invData.map((member) => (
                                <TableRow
                                  key={member.id}
                                  className="cursor-pointer"
                                >
                                  {inviteColumns.map((column) => (
                                    <TableCell
                                      key={`${member.id}-${column.key}`}
                                    >
                                      {column.key === "name"
                                        ? member.name
                                        : column.key === "email"
                                          ? member.email
                                          : column.key === "status"
                                            ? member.status
                                            : column.key === "invited_by"
                                              ? member.invited_by
                                              : null}
                                    </TableCell>
                                  ))}
                                  <TableCell className="hidden md:table-cell">
                                    <>
                                      <Button
                                        className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle"
                                        onClick={() =>
                                          copyToClipboard(
                                            getRegistrationLink(member)
                                          )
                                        }
                                      >
                                        <CopyIcon />
                                      </Button>
                                    </>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ) : (
                      <div>No members found</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Organization;
