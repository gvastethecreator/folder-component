export interface StyleFile {
  id: string;
  name: string;
  image: string;
  prompt: string;
  description: string;
  details: {
    artist?: string;
    lighting?: string;
    medium?: string;
    camera?: string;
    aspectRatio?: string;
  };
}

export interface FolderData {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  themeColor: string; // e.g. "from-cyan-500 to-blue-600"
  badgeColor: string; // e.g. "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  files: StyleFile[];
}

export interface SpringSettings {
  stiffness: number;
  damping: number;
  mass: number;
}
