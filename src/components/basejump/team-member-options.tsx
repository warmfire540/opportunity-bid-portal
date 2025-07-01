"use client";

import type { GetAccountMembersResponse } from "@usebasejump/shared";
import { Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from "@components/ui/dialog";
import { removeTeamMember as removeTeamMemberAction } from "@lib/actions/members";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SubmitButton } from "../ui/submit-button";

import DeleteTeamMemberForm from "./delete-team-member-form";
import EditTeamMemberRoleForm from "./edit-team-member-role-form";

type Props = {
  accountId: string;
  teamMember: GetAccountMembersResponse[0];
  isPrimaryOwner: boolean;
};

export default function TeamMemberOptions({ teamMember, accountId, isPrimaryOwner }: Props) {
  const [updateTeamRole, toggleUpdateTeamRole] = useState(false);
  const [removeTeamMember, toggleRemoveTeamMember] = useState(false);

  useEffect(() => {
    if (updateTeamRole) {
      toggleUpdateTeamRole(false);
    }
  }, [teamMember.account_role]);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => toggleUpdateTeamRole(true)}>
            Change role
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toggleRemoveTeamMember(true)} className="text-red-600">
            Remove member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={updateTeamRole} onOpenChange={toggleUpdateTeamRole}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update team member role</DialogTitle>
            <DialogDescription>Update a member's role in your team</DialogDescription>
          </DialogHeader>
          <EditTeamMemberRoleForm
            teamMember={teamMember}
            accountId={accountId}
            isPrimaryOwner={isPrimaryOwner}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={removeTeamMember} onOpenChange={toggleRemoveTeamMember}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove team member</DialogTitle>
            <DialogDescription>Remove this user from the team</DialogDescription>
          </DialogHeader>
          <DeleteTeamMemberForm teamMember={teamMember} accountId={accountId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
