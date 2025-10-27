import { ReactNode } from "react";

export interface UserContextType {
  user: any;
  login: (data: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const UserProvider: ({ children }: { children: ReactNode }) => JSX.Element;
export const useUser: () => UserContextType;
