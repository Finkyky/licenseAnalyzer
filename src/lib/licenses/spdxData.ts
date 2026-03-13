import { getLicenseBySpdx, searchLicenses as dbSearchLicenses, getAllLicenses as dbGetAllLicenses } from '@/lib/db';

export function getSpdxLicense(spdxId: string) {
  return getLicenseBySpdx(spdxId);
}

export function searchSpdxLicenses(query: string) {
  return dbSearchLicenses(query);
}

export function getAllSpdxLicenses() {
  return dbGetAllLicenses();
}
