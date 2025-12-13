"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FolderIcon,
  SearchIcon,
  FilterIcon,
  VideoIcon,
  ImageIcon,
  FileIcon,
  DownloadIcon,
  TrashIcon,
  MoreVerticalIcon,
} from "lucide-react"
import { useState } from "react"

export default function LibraryPage() {
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock library items
  const libraryItems = [
    {
      id: 1,
      name: "Summer Campaign Video.mp4",
      type: "video",
      size: "45.2 MB",
      date: "2024-03-15",
      thumbnail: null,
    },
    {
      id: 2,
      name: "Product Shot 1.jpg",
      type: "image",
      size: "2.1 MB",
      date: "2024-03-14",
      thumbnail: null,
    },
    {
      id: 3,
      name: "Brand Assets.zip",
      type: "file",
      size: "128.5 MB",
      date: "2024-03-13",
      thumbnail: null,
    },
    {
      id: 4,
      name: "Intro Animation.mp4",
      type: "video",
      size: "15.8 MB",
      date: "2024-03-12",
      thumbnail: null,
    },
    {
      id: 5,
      name: "Logo Variations.png",
      type: "image",
      size: "1.5 MB",
      date: "2024-03-11",
      thumbnail: null,
    },
    {
      id: 6,
      name: "Social Media Post.jpg",
      type: "image",
      size: "3.2 MB",
      date: "2024-03-10",
      thumbnail: null,
    },
  ]

  const filteredItems = libraryItems.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <VideoIcon className="h-8 w-8 text-blue-500" />
      case "image":
        return <ImageIcon className="h-8 w-8 text-green-500" />
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight">Library</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your media assets and files
                  </p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 gap-2">
                    <div className="relative flex-1 max-w-sm">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search files..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[140px]">
                        <FilterIcon className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Files</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="file">Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </div>

                {/* File Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      className="group overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted flex items-center justify-center border-b relative">
                        {getIcon(item.type)}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary" className="h-8 w-8">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate mb-1">{item.name}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.size}</span>
                          <span>{item.date}</span>
                        </div>
                        <div className="flex gap-1 mt-3">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                            <DownloadIcon className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8">
                            <TrashIcon className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <FolderIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No files found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
