import * as React from "react"
import {
  LayoutDashboardIcon,
  Package,
  Sprout,
  TrendingUp,
  Users,
  ShoppingCart,
  Settings,
  HelpCircle,
  Bell,
  User,
  Plus,
  Truck
} from "lucide-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

const data = {
  user: {
    name: "Farmer",
    email: "farmer@helagovi.lk",
    avatar: "/avatars/farmer.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/farmer-dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "My Products",
      url: "/my-products",
      icon: Package,
    },
    {
      title: "Add Product",
      url: "/create-product",
      icon: Plus,
    },
    {
      title: "Orders",
      url: "/farmer-orders",
      icon: Truck,
    },
    {
      title: "Analytics",
      url: "#",
      icon: TrendingUp,
    },
  ],
  navFarming: [
    {
      title: "Crop Management",
      icon: Sprout,
      isActive: false,
      url: "#",
      items: [
        {
          title: "Current Crops",
          url: "#",
        },
        {
          title: "Planting Schedule",
          url: "#",
        },
        {
          title: "Harvest Planning",
          url: "#",
        },
      ],
    },
    {
      title: "Sales & Marketing",
      icon: TrendingUp,
      url: "#",
      items: [
        {
          title: "Market Prices",
          url: "#",
        },
        {
          title: "Buyer Network",
          url: "#",
        },
        {
          title: "Promotions",
          url: "#",
        },
      ],
    },
    {
      title: "Customer Relations",
      icon: Users,
      url: "#",
      items: [
        {
          title: "Customer List",
          url: "#",
        },
        {
          title: "Reviews & Feedback",
          url: "#",
        },
        {
          title: "Communication",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Profile Settings",
      url: "/profile",
      icon: User,
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle,
    },
  ],
  tools: [
    {
      name: "Weather Forecast",
      url: "#",
      icon: Sprout,
    },
    {
      name: "Market Insights",
      url: "#",
      icon: TrendingUp,
    },
    {
      name: "Farming Tips",
      url: "#",
      icon: HelpCircle,
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/farmer-dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-sidebar-primary-foreground">
                  <Sprout className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Helagovi.lk</span>
                  <span className="truncate text-xs">Agricultural Marketplace</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.tools} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
