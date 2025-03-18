export interface FileItem {
    name: string;
    type: string;
    dateCreated: string;
    size?: string;
    path?: string;
  }
  
  export type ViewMode = 'grid' | 'list';