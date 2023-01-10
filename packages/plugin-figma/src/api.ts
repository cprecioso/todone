export interface Comment {
  id: string;
  resolved_at?: string;
}

export interface CommentsResponse {
  comments?: Comment[];
}
