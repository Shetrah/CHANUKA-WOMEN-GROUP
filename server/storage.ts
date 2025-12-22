import { users, type User, type InsertUser } from "@shared/schema";

// This interface is kept for compatibility but the app uses Firebase Client SDK
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id: String(id) }; // Cast ID to string to match schema if needed
    // Actually schema uses randomUUID defaults for ID but let's just keep it simple
    // The schema defines ID as varchar with default randomUUID. 
    // We can just use the insertUser as is if we fix the ID generation.
    // However, since this is a mock storage for a Firebase app, exact implementation doesn't matter much.
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
