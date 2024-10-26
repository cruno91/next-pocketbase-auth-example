'use client'

import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type ContentEntry = {
  id: string;
  title: string;
  description: string;
  created: string;
  updated: string;
};

type ContentDashboardProps = {
  initialContent: ContentEntry[];
  token: string;
};

export default function ContentDashboard({ initialContent, token }: ContentDashboardProps) {
  const [contentEntries, setContentEntries] = useState<ContentEntry[]>(initialContent);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentEntry | null>(null);
  const [clientRendered, setClientRendered] = useState(false);

  useEffect(() => {
    setClientRendered(true);
  }, []);

  const handleCreateContent = async () => {
    setIsCreatingContent(true);

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });

      if (response.ok) {
        const newContent = await response.json();
        setContentEntries((prevEntries) => [...prevEntries, newContent]);
        setNewTitle("");
        setNewDescription("");
      } else {
        throw new Error('Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
    } finally {
      setIsCreatingContent(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;

    try {
      const response = await fetch(`/api/example-content?id=${contentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setContentEntries(contentEntries.filter((entry) => entry.id !== contentToDelete.id));
      } else {
        throw new Error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      setContentToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-5">
        <h2 className="text-lg font-semibold mb-2">Add New Content</h2>
        <div className="flex flex-col gap-2">
          <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Textarea placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <Button onClick={handleCreateContent} disabled={isCreatingContent || !newTitle || !newDescription}>
            {isCreatingContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Content'}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your Content</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contentEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.title}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{clientRendered ? (entry.created ? new Date(entry.created).toLocaleString() : '') : ' ...'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setContentToDelete(entry)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!contentToDelete} onOpenChange={() => setContentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the content &#34;{contentToDelete?.title}&#34;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContentToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteContent}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
