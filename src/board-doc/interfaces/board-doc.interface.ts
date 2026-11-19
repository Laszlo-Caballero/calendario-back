export interface BoardDocResponse {
  boardDocId: number;
  title: string;
  subtitle: string | null;
  content: string;
  todosId: number;
  createdAt: Date;
  updatedAt: Date;
}
