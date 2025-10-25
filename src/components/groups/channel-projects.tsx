"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Filter, LayoutGrid, ListChecks, PlusCircle } from "lucide-react"

interface Member {
  id: string
  name: string
  username: string
  avatar: string
}

type TaskStatus = "todo" | "inprogress" | "done"

interface Task {
  id: string
  title: string
  assigneeId?: string
  due?: string // YYYY-MM-DD
  status: TaskStatus
}

interface EventItem {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  description?: string
}

export function ChannelProjects({ members = [] }: { members?: Member[] }) {
  // Seed
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", title: "Prepare weekly update", assigneeId: members[0]?.id, due: isoDate(2), status: "todo" },
    {
      id: "t2",
      title: "Design review for new feature",
      assigneeId: members[2]?.id,
      due: isoDate(4),
      status: "inprogress",
    },
    { id: "t3", title: "QA checklist", assigneeId: members[3]?.id, due: isoDate(7), status: "done" },
  ])
  const [events, setEvents] = useState<EventItem[]>([
    { id: "e1", title: "Sprint Planning", date: isoDate(1), time: "10:00", description: "Plan next sprint tasks" },
    { id: "e2", title: "Design Crit", date: isoDate(3), time: "14:00", description: "Review design proposals" },
  ])

  // UI state
  const [newTask, setNewTask] = useState<{ title: string; assigneeId?: string; due?: string; status: TaskStatus }>({
    title: "",
    assigneeId: undefined,
    due: "",
    status: "todo",
  })
  const [newEvent, setNewEvent] = useState<{ title: string; date?: string; time?: string; description?: string }>({
    title: "",
    date: "",
    time: "",
    description: "",
  })
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all")
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"board" | "list">("board") // mobile defaults to list via CSS below

  const filteredTasks = useMemo(() => {
    const s = search.trim().toLowerCase()
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (!s) return true
      return t.title.toLowerCase().includes(s)
    })
  }, [tasks, statusFilter, search])

  const groupedTasks = useMemo(
    () => ({
      todo: filteredTasks.filter((t) => t.status === "todo"),
      inprogress: filteredTasks.filter((t) => t.status === "inprogress"),
      done: filteredTasks.filter((t) => t.status === "done"),
    }),
    [filteredTasks],
  )

  const addTask = () => {
    if (!newTask.title.trim()) return
    setTasks((prev) => [
      ...prev,
      {
        id: `t${prev.length + 1}`,
        title: newTask.title.trim(),
        assigneeId: newTask.assigneeId,
        due: newTask.due,
        status: newTask.status,
      },
    ])
    setNewTask({ title: "", assigneeId: undefined, due: "", status: "todo" })
  }

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return
    setEvents((prev) => [
      ...prev,
      {
        id: `e${prev.length + 1}`,
        title: newEvent.title.trim(),
        date: newEvent.date!,
        time: newEvent.time,
        description: newEvent.description,
      },
    ])
    setNewEvent({ title: "", date: "", time: "", description: "" })
  }

  const setTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  return (
    <div className="space-y-6">
      {/* Tasks */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Tasks
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  placeholder="Search tasks..."
                  className="bg-gray-100 border-none pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={statusFilter} onValueChange={(v: "all" | TaskStatus) => setStatusFilter(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="inprogress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden sm:flex gap-1">
                <Button
                  variant={view === "board" ? "default" : "outline"}
                  size="sm"
                  className={view === "board" ? "bg-black text-white hover:bg-gray-800" : "bg-transparent"}
                  onClick={() => setView("board")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  size="sm"
                  className={view === "list" ? "bg-black text-white hover:bg-gray-800" : "bg-transparent"}
                  onClick={() => setView("list")}
                >
                  <ListChecks className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Add Task */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-5 gap-2">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
              className="bg-gray-100 border-none sm:col-span-2"
            />
            <Select
              value={newTask.assigneeId || "unassigned"}
              onValueChange={(v) => setNewTask((t) => ({ ...t, assigneeId: v === "unassigned" ? undefined : v }))}
            >
              <SelectTrigger className="bg-transparent">
                <SelectValue placeholder="Assignee" />
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
            <Input
              type="date"
              value={newTask.due || ""}
              onChange={(e) => setNewTask((t) => ({ ...t, due: e.target.value }))}
              className="bg-transparent"
            />
            <Select value={newTask.status} onValueChange={(v: TaskStatus) => setNewTask((t) => ({ ...t, status: v }))}>
              <SelectTrigger className="bg-transparent">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To do</SelectItem>
                <SelectItem value="inprogress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button className="bg-black text-white hover:bg-gray-800" onClick={addTask}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mobile-first: List view always visible on <=sm; Board view visible on md+ or when explicitly chosen */}
          <div className={`${view === "list" ? "block" : "block sm:block md:hidden"}`}>
            <TaskListMobile tasks={filteredTasks} members={members} onStatusChange={setTaskStatus} />
          </div>

          <div className={`${view === "board" ? "block" : "hidden md:block"}`}>
            {/* Responsive Board: grid on md+, no overflow on small */}
            <div className="md:grid md:grid-cols-3 md:gap-3 -mx-3 px-3 md:mx-0 md:px-0">
              <TaskColumnBoard
                title="To do"
                tasks={groupedTasks.todo}
                members={members}
                onStatusChange={setTaskStatus}
              />
              <TaskColumnBoard
                title="In progress"
                tasks={groupedTasks.inprogress}
                members={members}
                onStatusChange={setTaskStatus}
              />
              <TaskColumnBoard
                title="Done"
                tasks={groupedTasks.done}
                members={members}
                onStatusChange={setTaskStatus}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent((ev) => ({ ...ev, title: e.target.value }))}
              className="bg-gray-100 border-none sm:col-span-2"
            />
            <Input
              type="date"
              value={newEvent.date || ""}
              onChange={(e) => setNewEvent((ev) => ({ ...ev, date: e.target.value }))}
              className="bg-transparent"
            />
            <Input
              type="time"
              value={newEvent.time || ""}
              onChange={(e) => setNewEvent((ev) => ({ ...ev, time: e.target.value }))}
              className="bg-transparent"
            />
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={newEvent.description || ""}
            onChange={(e) => setNewEvent((ev) => ({ ...ev, description: e.target.value }))}
            rows={2}
          />
          <div className="flex justify-end">
            <Button className="bg-black text-white hover:bg-gray-800" onClick={addEvent}>
              Add Event
            </Button>
          </div>

          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 border rounded-lg flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{ev.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {ev.date}
                    {ev.time ? ` • ${ev.time}` : ""}
                  </p>
                  {ev.description && <p className="text-sm mt-1">{ev.description}</p>}
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-xs text-muted-foreground">No events</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskListMobile({
  tasks,
  members,
  onStatusChange,
}: {
  tasks: Task[]
  members: Member[]
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const nameById = (id?: string) => members.find((m) => m.id === id)?.name || "Unassigned"
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <div key={t.id} className="p-3 border rounded-lg bg-white">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span>{nameById(t.assigneeId)}</span>
                {t.due && <span>• Due {new Date(t.due).toLocaleDateString()}</span>}
              </div>
            </div>
            <Select value={t.status} onValueChange={(v: TaskStatus) => onStatusChange(t.id, v)}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To do</SelectItem>
                <SelectItem value="inprogress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      {tasks.length === 0 && <p className="text-xs text-muted-foreground">No tasks</p>}
    </div>
  )
}

function TaskColumnBoard({
  title,
  tasks,
  members,
  onStatusChange,
}: {
  title: string
  tasks: Task[]
  members: Member[]
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const nameById = (id?: string) => members.find((m) => m.id === id)?.name || "Unassigned"
  return (
    <div className="border rounded-lg p-3 bg-white min-w-0">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">{title}</p>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="p-3 border rounded-lg">
            <p className="text-sm font-medium">{t.title}</p>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span>{nameById(t.assigneeId)}</span>
              {t.due && <span>• Due {new Date(t.due).toLocaleDateString()}</span>}
            </div>
            <div className="mt-2">
              <Select value={t.status} onValueChange={(v: TaskStatus) => onStatusChange(t.id, v)}>
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="inprogress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-xs text-muted-foreground">No tasks</p>}
      </div>
    </div>
  )
}

function isoDate(daysAhead: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().slice(0, 10)
}
