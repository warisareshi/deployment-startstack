import * as React from "react";
import { ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ActiveOrganization } from "@/types/auth";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

function LoadingState() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="animate-pulse">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
            <Loader2 className="size-4 animate-spin" />
          </div>
          <div className="grid flex-1 gap-1">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function WorkspaceSwitcher({
  activeOrganization,
}: {
  activeOrganization: ActiveOrganization;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { data: organizations } = authClient.useListOrganizations();
  const router = useRouter();
  const { open } = useSidebar();

  async function setActiveOrganization(organizationId: string) {
    try {
      setIsLoading(true);
      await authClient.organization.setActive({ organizationId });
      router.refresh();
    } catch (error) {
      console.error("Failed to set active organization:", error);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    if (!activeOrganization && organizations?.length) {
      setActiveOrganization(organizations[0].id);
    }
  }, [activeOrganization, organizations]);

  if (!activeOrganization || !organizations) {
    return <LoadingState />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className={cn(open ? "border border-input" : "")}
          >
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isLoading}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border bg-muted">
                {activeOrganization?.logo ? (
                  <Image
                    src={activeOrganization.logo}
                    alt={activeOrganization.name}
                    width={32}
                    height={32}
                    className="size-4 object-contain"
                  />
                ) : (
                  (activeOrganization?.name?.slice(0, 1).toUpperCase() ?? "-")
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrganization?.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {isLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "Basic"
                  )}
                </span>
              </div>
              <ChevronsUpDown className="size-1` ml-auto mr-1" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg py-2"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="gap-2 rounded-full p-2"
                onSelect={() => setActiveOrganization(org.id)}
              >
                <div className="flex size-6 items-center justify-center rounded-full border bg-background !text-sm">
                  {org.logo ? (
                    <Image
                      src={org.logo}
                      alt={org.name}
                      width={16}
                      height={16}
                      className="size-4 object-contain"
                    />
                  ) : (
                    org.name?.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="font-medium">{org.name}</div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className="gap-2 rounded-full p-2"
              onClick={() => router.push("/signup/create-workspace")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}