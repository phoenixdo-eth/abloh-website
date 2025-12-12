"use client"

import * as React from "react"
import {
  BarChartIcon,
  BookmarkIcon,
  CalendarIcon,
  FileTextIcon,
  HelpCircleIcon,
  ImageIcon,
  InstagramIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  Share2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "User",
    email: "user@abloh.studio",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: UsersIcon,
    },
  ],
  navClouds: [
    {
      title: "Social Media",
      icon: Share2Icon,
      isActive: true,
      url: "/dashboard/social-media",
      items: [
        {
          title: "Instagram Scraper",
          url: "/dashboard/instagram",
        },
        {
          title: "TikTok Scraper",
          url: "/dashboard/tiktok",
        },
      ],
    },
    {
      title: "Content",
      icon: VideoIcon,
      url: "#",
      items: [
        {
          title: "Content Calendar",
          url: "/dashboard/calendar",
        },
        {
          title: "AI Generator",
          url: "/dashboard/ai-generator",
        },
      ],
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "/dashboard/settings",
    //   icon: SettingsIcon,
    // },
    // {
    //   title: "Get Help",
    //   url: "#",
    //   icon: HelpCircleIcon,
    // },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: SearchIcon,
    // },
  ],
  creation: [
    {
      name: "AI Generator",
      url: "/dashboard/ai-generator",
      icon: SparklesIcon,
    },
    {
      name: "Generations",
      url: "/dashboard/generations",
      icon: ImageIcon,
    },
    {
      name: "Social Media",
      url: "/dashboard/social-media",
      icon: Share2Icon,
    },
  ],
  inspiration: [
    {
      name: "Instagram",
      url: "/dashboard/instagram",
      icon: InstagramIcon,
    },
    {
      name: "TikTok",
      url: "/dashboard/tiktok",
      icon: VideoIcon,
    },
    {
      name: "Saved",
      url: "/dashboard/saved",
      icon: BookmarkIcon,
    },
  ],
  tracking: [
    {
      name: "Calendar",
      url: "/dashboard/calendar",
      icon: CalendarIcon,
    },
    {
      name: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <rect x="0" y="0" width="8" height="24" fill="red"/>
                  <rect x="8" y="0" width="8" height="24" fill="blue"/>
                  <rect x="16" y="0" width="8" height="24" fill="green"/>
                </svg>
                <span className="text-base font-semibold">ABLOH</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.inspiration} label="Research" />
        <NavDocuments items={data.creation} label="Create" />
        <NavDocuments items={data.tracking} label="Track" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
