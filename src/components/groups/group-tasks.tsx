"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Calendar, ListChecks, User2 } from "lucide-react"

export type Member = {
  id: string
  name: string
  username?: string
  avatar?: string
}

type TaskStatus = "todo" | "inprogress" | "done"
type TaskPriority = "low" | "medium" | "high"

type Task = {
  id: string
  title: string
  status: TaskStatus
  assigneeId?: string
  due?: string // ISO date
  priority?: TaskPriority
}

function newId() {
  return Math.random().toString(36).slice(2, 10)
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; variant: "secondary" | "outline" | "default" }> = {
    todo: { label: "To do", variant: "outline" },
    inprogress: { label: "In progress", variant: "secondary" },
    done: { label: "Done", variant: "default" },
  }
  const v = map[status]
  return <Badge variant={v.variant}>{v.label}</Badge>
}

function TaskCard({
  task,
  members,
  onChange,
}: {
  task: Task
  members: Member[]
  onChange: (next: Task) => void
}) {
  return (
    <div className="rounded-lg border p-3 sm:p-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{task.title || "Untitled task"}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StatusBadge status={task.status} />
            {task.priority && <Badge variant="outline">Priority: {task.priority}</Badge>}
            {task.due && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{task.due}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={task.status} onValueChange={(v: TaskStatus) => onChange({ ...task, status: v })}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To do</SelectItem>
              <SelectItem value="inprogress">In progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Assignee</Label>
          <Select
            value={task.assigneeId ?? "unassigned"}
            onValueChange={(v: string) => onChange({ ...task, assigneeId: v || undefined })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4" />
                  <span>Unassigned</span>
                </div>
              </SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Due date</Label>
          <Input
            type="date"
            className="h-9"
            value={task.due ?? ""}
            onChange={(e) => onChange({ ...task, due: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  )
}

function Column({
  title,
  tasks,
  members,
  onUpdate,
}: {
  title: string
  tasks: Task[]
  members: Member[]
  onUpdate: (t: Task) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} members={members} onChange={onUpdate} />
        ))}
        {tasks.length === 0 && (
          <div className="text-xs text-muted-foreground border rounded-lg p-3">No tasks here.</div>
        )}
      </div>
    </div>
  )
}

export function GroupTasks({
  open,
  onOpenChange,
  groupName,
  members,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  members: Member[]
}) {
  const [search, setSearch] = useState("")
  const [quickTitle, setQuickTitle] = useState("")
  const [quickAssignee, setQuickAssignee] = useState<string>("unassigned")
  const [quickStatus, setQuickStatus] = useState<TaskStatus>("todo")
  const [tasks, setTasks] = useState<Task[]>([
    { id: newId(), title: "Design hero section", status: "todo", priority: "medium" },
    {
      id: newId(),
      title: "Implement auth context",
      status: "inprogress",
      assigneeId: members[1]?.id,
      priority: "high",
    },
    { id: newId(), title: "QA mobile nav", status: "done", due: "2025-10-05" },
    { id: newId(), title: "Write onboarding docs", status: "todo" },
  ])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tasks
    return tasks.filter((t) => t.title.toLowerCase().includes(q))
  }, [tasks, search])

  const by = useMemo(() => {
    return {
      todo: filtered.filter((t) => t.status === "todo"),
      inprogress: filtered.filter((t) => t.status === "inprogress"),
      done: filtered.filter((t) => t.status === "done"),
    }
  }, [filtered])

  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inprogress: tasks.filter((t) => t.status === "inprogress").length,
    done: tasks.filter((t) => t.status === "done").length,
    all: tasks.length,
  }

  const addTask = () => {
    const title = quickTitle.trim()
    if (!title) return
    setTasks((prev) => [{ id: newId(), title, status: quickStatus, assigneeId: quickAssignee || undefined }, ...prev])
    setQuickTitle("")
    setQuickAssignee("unassigned")
    setQuickStatus("todo")
  }

  const updateTask = (next: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === next.id ? next : t)))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Tasks — {groupName}
          </SheetTitle>
        </SheetHeader>

        {/* Controls */}
        <div className="p-3 sm:p-4 border-b space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <Label htmlFor="task-title" className="text-xs">
                Quick add
              </Label>
              <Input
                id="task-title"
                placeholder="e.g. Fix mobile sidebar overflow"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="bg-gray-100 border-none"
              />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={quickStatus} onValueChange={(v: TaskStatus) => setQuickStatus(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="inprogress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Assignee</Label>
              <Select value={quickAssignee} onValueChange={setQuickAssignee}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={addTask}>
                Add task
              </Button>
            </div>
          </div>

          <div className="relative">
            <Label htmlFor="task-search" className="sr-only">
              Search tasks
            </Label>
            <Input
              id="task-search"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-100 border-none"
            />
          </div>
        </div>

        {/* Tabs + Lists */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Tabs defaultValue="todo" className="flex h-full flex-col">
            <div className="px-3 sm:px-4 py-2 border-b">
              <TabsList className="bg-transparent p-0 h-auto gap-2 overflow-x-auto">
                <TabsTrigger
                  value="todo"
                  className="rounded-none px-2 py-1 data-[state=active]:border-b-2 data-[state=active]:border-black"
                >
                  To do ({counts.todo})
                </TabsTrigger>
                <TabsTrigger
                  value="inprogress"
                  className="rounded-none px-2 py-1 data-[state=active]:border-b-2 data-[state=active]:border-black"
                >
                  In progress ({counts.inprogress})
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="rounded-none px-2 py-1 data-[state=active]:border-b-2 data-[state=active]:border-black"
                >
                  Done ({counts.done})
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-none px-2 py-1 data-[state=active]:border-b-2 data-[state=active]:border-black whitespace-nowrap"
                >
                  All ({counts.all})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="todo" className="flex-1 overflow-y-auto p-3 sm:p-4">
              <Column title="To do" tasks={by.todo} members={members} onUpdate={updateTask} />
            </TabsContent>
            <TabsContent value="inprogress" className="flex-1 overflow-y-auto p-3 sm:p-4">
              <Column title="In progress" tasks={by.inprogress} members={members} onUpdate={updateTask} />
            </TabsContent>
            <TabsContent value="done" className="flex-1 overflow-y-auto p-3 sm:p-4">
              <Column title="Done" tasks={by.done} members={members} onUpdate={updateTask} />
            </TabsContent>

            {/* All: vertical arrangement of the three sections */}
            <TabsContent value="all" className="flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="space-y-6">
                <Column title="To do" tasks={by.todo} members={members} onUpdate={updateTask} />
                <Separator />
                <Column title="In progress" tasks={by.inprogress} members={members} onUpdate={updateTask} />
                <Separator />
                <Column title="Done" tasks={by.done} members={members} onUpdate={updateTask} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
