"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar } from "lucide-react"
import type { Todo } from "@/app/dashboard/page"

interface TodoListProps {
  todos: Todo[]
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  onToggleComplete: (todoId: string) => void
}

export function TodoList({ todos, onEdit, onDelete, onToggleComplete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Calendar className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
        <p className="text-gray-500">Get started by adding your first todo!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <Card key={todo.id} className={`transition-all ${todo.completed ? "opacity-75" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox checked={todo.completed} onCheckedChange={() => onToggleComplete(todo.id)} className="mt-1" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {todo.title}
                  </h3>
                  {todo.completed && (
                    <Badge variant="secondary" className="text-xs">
                      Completed
                    </Badge>
                  )}
                </div>

                {todo.description && (
                  <p className={`text-sm mb-3 ${todo.completed ? "line-through text-gray-400" : "text-gray-600"}`}>
                    {todo.description}
                  </p>
                )}

                <div className="text-xs text-gray-400">Created {new Date(todo.created_at).toLocaleDateString()}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(todo)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(todo)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
