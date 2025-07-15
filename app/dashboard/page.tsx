"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Plus } from "lucide-react"
import { TodoList } from "@/components/todo-list"
import { AddTodoForm } from "@/components/add-todo-form"
import { EditTodoModal } from "@/components/edit-todo-modal"
import { DeleteTodoModal } from "@/components/delete-todo-modal"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  user_id: string
  created_at: string
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  // Fetch todos for the authenticated user
  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setTodos(data || [])
      }
    } catch (err) {
      setError("Failed to fetch todos")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
      } else {
        router.push("/auth/login")
      }
    } catch (err) {
      setError("Failed to logout")
    }
  }

  const handleAddTodo = async (newTodo: Omit<Todo, "id" | "user_id" | "created_at">) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            title: newTodo.title,
            description: newTodo.description,
            completed: newTodo.completed,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        setError(error.message)
      } else {
        setTodos((prev) => [data, ...prev])
        setShowAddForm(false)
      }
    } catch (err) {
      setError("Failed to add todo")
    }
  }

  const handleUpdateTodo = async (updatedTodo: Todo) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({
          title: updatedTodo.title,
          description: updatedTodo.description,
          completed: updatedTodo.completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedTodo.id)
        .eq("user_id", user?.id)

      if (error) {
        setError(error.message)
      } else {
        setTodos((prev) => prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)))
        setEditingTodo(null)
      }
    } catch (err) {
      setError("Failed to update todo")
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", todoId).eq("user_id", user?.id)

      if (error) {
        setError(error.message)
      } else {
        setTodos((prev) => prev.filter((todo) => todo.id !== todoId))
        setDeletingTodo(null)
      }
    } catch (err) {
      setError("Failed to delete todo")
    }
  }

  const handleToggleComplete = async (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId)
    if (!todo) return

    try {
      const { error } = await supabase
        .from("todos")
        .update({
          completed: !todo.completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", todoId)
        .eq("user_id", user?.id)

      if (error) {
        setError(error.message)
      } else {
        setTodos((prev) => prev.map((todo) => (todo.id === todoId ? { ...todo, completed: !todo.completed } : todo)))
      }
    } catch (err) {
      setError("Failed to update todo")
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Todo Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Todo Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Todo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddForm ? (
                  <AddTodoForm onSubmit={handleAddTodo} onCancel={() => setShowAddForm(false)} />
                ) : (
                  <Button onClick={() => setShowAddForm(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Todo
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Todo List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Todos ({todos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your todos...</p>
                  </div>
                ) : (
                  <TodoList
                    todos={todos}
                    onEdit={setEditingTodo}
                    onDelete={setDeletingTodo}
                    onToggleComplete={handleToggleComplete}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modals */}
      {editingTodo && (
        <EditTodoModal todo={editingTodo} onSave={handleUpdateTodo} onClose={() => setEditingTodo(null)} />
      )}

      {deletingTodo && (
        <DeleteTodoModal
          todo={deletingTodo}
          onConfirm={() => handleDeleteTodo(deletingTodo.id)}
          onClose={() => setDeletingTodo(null)}
        />
      )}
    </div>
  )
}
