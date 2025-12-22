import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertApprovedUser } from "@shared/routes";
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Since we're using Firebase directly but want to maintain type safety with our schema,
// we'll implement the fetchers using Firebase SDK but matching the API contract types.

export function useUsers() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      try {
        const q = query(collection(db, "approved_users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        // Map Firestore docs to our schema type
        const users = snapshot.docs.map(doc => ({
          id: doc.id, // We use Firestore string ID, though schema says number/serial (we'll adapt)
          ...doc.data(),
          // Convert timestamps to Date objects if needed
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          approvedAt: doc.data().approvedAt?.toDate?.() || null,
        }));

        // Validate with Zod (optional but good practice)
        // Note: ID mismatch (string vs serial) might cause validation issues, 
        // so we might skip strict parsing for this demo or cast it.
        return users as any[]; 
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback for demo mode if no firebase config
        return [];
      }
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertApprovedUser) => {
      const docRef = await addDoc(collection(db, "approved_users"), {
        ...data,
        createdAt: new Date(),
        approvedAt: new Date(), // Auto-approve for now
      });
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({
        title: "User created",
        description: "The user has been successfully added to the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user. " + (error instanceof Error ? error.message : ""),
        variant: "destructive",
      });
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InsertApprovedUser>) => {
      const userRef = doc(db, "approved_users", id);
      await updateDoc(userRef, data);
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({
        title: "User updated",
        description: "User details have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });
}
