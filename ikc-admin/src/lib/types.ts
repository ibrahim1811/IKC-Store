export interface App {
  id: string;
  name: string;
  packageName: string;
  description: string;
  iconUrl: string;
  category: string;
  currentVersion: string;
  currentVersionCode: number;
  apkUrl: string;
  apkSize: number;
  screenshots: string[];
  changelog: string;
  status: 'draft' | 'published';
  downloads: number;
  publishedAt?: Date;
  updatedAt?: Date;
}

export interface AppVersion {
  id: string;
  versionName: string;
  versionCode: number;
  apkUrl: string;
  changelog: string;
  releasedAt?: Date;
}
