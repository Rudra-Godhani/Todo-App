"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { Todo } from "@/app/dashboard/page"

interface DeleteTodoModalProps {
  todo: Todo
  onConfirm: () => void
  onClose: () => void
}

export function DeleteTodoModal({ todo, onConfirm, onClose }: DeleteTodoModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Todo
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this todo? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900 mb-1">{todo.title}</h4>
          {todo.description && <p className="text-sm text-gray-600">{todo.description}</p>}
        </div>

        <div className="flex gap-2">
          <Button variant="destructive" onClick={onConfirm}>
            Delete Todo
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
