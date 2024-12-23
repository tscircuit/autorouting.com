import type { Dataset } from "@/api/lib/db/schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ky } from "lib/ky"
import { useGlobalStore } from "@/hooks/use-global-store"
import { createUseDialog } from "./create-use-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export const DeleteDatasetDialog = ({
  dataset,
  open,
  onOpenChange,
}: {
  dataset: Dataset
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!session) return

    setIsDeleting(true)
    try {
      await ky
        .delete("datasets/delete", {
          json: {
            dataset_id: dataset.dataset_id,
          },
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })
        .json()

      await queryClient.invalidateQueries({
        queryKey: ["userDatasets"],
      })
      onOpenChange(false)
      toast({
        title: "Dataset deleted",
        description: `Successfully deleted ${dataset.dataset_name}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete dataset",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Dataset</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {dataset.dataset_name}? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Dataset"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useDeleteDatasetDialog = createUseDialog(DeleteDatasetDialog)
