export type TimeOfDay = 'noon' | 'sunset' | 'night' | 'sharav';

export interface ViewPreset {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface IsraeliPropsConfig {
  flags: boolean;
  solarHeaters: boolean; // דודי שמש
  airConditioners: boolean; // מזגנים
  hebrewSigns: boolean; // שלטים בעברית
  streetFurniture: boolean; // קורקינטים, ספסלים, תיבת דואר
  palmTrees: boolean; // דקלים וצמחייה ים-תיכונית
  nightLights: boolean; // תאורת ניאון וחלונות זוהרים
}

export interface CityHotspot {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  position: [number, number, number];
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
  icon: string;
  badge: string;
}
