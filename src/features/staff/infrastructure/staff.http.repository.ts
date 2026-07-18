import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type {
  StaffDraft,
  StaffMember,
  StaffPatch,
  StaffRole,
  StaffStatus,
} from "@/features/staff/domain/staff.entity";
import type { StaffRepository } from "@/features/staff/domain/staff.ports";

/**
 * HTTP implementation of {@link StaffRepository}.
 *
 * NOTE: the staff endpoints it calls are NOT YET IMPLEMENTED by the backend —
 * this repo documents the expected contract so that flipping `dataMode=live`
 * works the moment the backend ships them. Until then the mock repo is used.
 * See docs/backend-endpoints-missing.md.
 *
 * `restaurantId` is treated as the tenant slug in the URL (adjust to match the
 * backend's addressing when the endpoints land).
 */

interface StaffDto {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
}

function toStaff(dto: StaffDto): StaffMember {
  return { id: dto.id, email: dto.email, name: dto.name, role: dto.role, status: dto.status };
}

export class HttpStaffRepository implements StaffRepository {
  async list(restaurantId: string): Promise<StaffMember[]> {
    const dtos = await httpClient.get<StaffDto[]>(API_ENDPOINTS.restaurants.staff(restaurantId));
    return dtos.map(toStaff);
  }

  async create(restaurantId: string, draft: StaffDraft, token: string): Promise<StaffMember> {
    const dto = await httpClient.post<StaffDto>(
      API_ENDPOINTS.restaurants.staff(restaurantId),
      { email: draft.email, name: draft.name, role: draft.role, password: draft.password },
      { token },
    );
    return toStaff(dto);
  }

  async update(id: string, patch: StaffPatch, token: string): Promise<StaffMember> {
    const dto = await httpClient.patch<StaffDto>(API_ENDPOINTS.staff.byId(id), patch, { token });
    return toStaff(dto);
  }

  async remove(id: string, token: string): Promise<void> {
    await httpClient.delete<void>(API_ENDPOINTS.staff.byId(id), { token });
  }
}
