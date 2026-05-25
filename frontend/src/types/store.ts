export interface AuthState {
    accessToken: string | null;
    user: any; // You can replace 'any' with a more specific type based on your user data structure
    loading: boolean;
    signUp: (
        username: string,
        password: string,
        email: string,
        firstName: string,
        lastName: string
    ) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchMe: () => Promise<void>;
}