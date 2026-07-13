/**
 * The tenant theme contract now lives in `shared` (it's shared by the public
 * menu renderer too). Re-exported here so existing theme-builder imports keep
 * working and the feature's domain surface is stable.
 */
export * from "@/shared/theme/tenant-config";
