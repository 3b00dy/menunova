/** Restaurant (tenant) domain entity. */
export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  /** Brand color used to theme the public menu. */
  brandColor?: string;
}
