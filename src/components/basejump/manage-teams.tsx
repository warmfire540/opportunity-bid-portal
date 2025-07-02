import Link from "next/link";

import { createClient } from "@lib/supabase/server";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableRow, TableBody, TableCell } from "../ui/table";

type Team = {
  account_id: string;
  account_role: "owner" | "member";
  is_primary_owner: boolean;
  name: string;
  slug: string;
  personal_account: boolean;
  created_at: string;
  updated_at: string;
};

export default async function ManageTeams() {
  const supabaseClient = createClient();

  const { data } = await supabaseClient.rpc("get_accounts");

  const teams: Team[] = data?.filter((team: Team) => !team.personal_account) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        <CardDescription>These are the teams you belong to</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.account_id}>
                <TableCell>
                  <div className="flex gap-x-2">
                    {team.name}
                    <Badge variant={team.account_role === "owner" ? "default" : "outline"}>
                      {team.is_primary_owner ? "Primary Owner" : team.account_role}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/${team.slug}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
