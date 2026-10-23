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
 * HTTP implementation of {@link StaffRepository} against the live backend staff
 * endpoints (`GET|POST /restaurants/{slug}/staff`, `PATCH|DELETE /staff/{id}`) —
 * verified live. `restaurantId` is the tenant **slug** in the URL; `POST` needs
 * no `slug` in the body (the backend derives it from the path). `PATCH` accepts
 * a partial body (only sent fields change). See docs/api-endpoints-reference.md.
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
