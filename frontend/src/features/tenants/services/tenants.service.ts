import { apiClient } from '@/lib/api-client';
import {
  CreateTenantPayload,
  DestroyTenantResponse,
  Tenant,
  TenantStatusResponse,
} from '../types/tenant.types';

export const tenantsService = {
  async getTenants(filters?: {
    search?: string;
    status?: string;
    plan?: string;
    environment?: string;
  }): Promise<Tenant[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.plan) params.append('plan', filters.plan);
    if (filters?.environment) params.append('environment', filters.environment);

    const query = params.toString();
    const endpoint = query ? `/tenants?${query}` : '/tenants';
    return apiClient<Tenant[]>(endpoint);
  },

  async getTenant(id: string): Promise<Tenant> {
    return apiClient<Tenant>(`/tenants/${id}`);
  },

  async getTenantStatus(id: string): Promise<TenantStatusResponse> {
    return apiClient<TenantStatusResponse>(`/tenants/${id}/status`);
  },

  async createTenant(data: CreateTenantPayload): Promise<Tenant> {
    return apiClient<Tenant>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async suspendTenant(id: string): Promise<Tenant> {
    return apiClient<Tenant>(`/tenants/${id}/suspend`, {
      method: 'PATCH',
    });
  },

  async resumeTenant(id: string): Promise<Tenant> {
    return apiClient<Tenant>(`/tenants/${id}/resume`, {
      method: 'PATCH',
    });
  },

  async deleteTenant(id: string): Promise<DestroyTenantResponse> {
    return apiClient<DestroyTenantResponse>(`/tenants/${id}`, {
      method: 'DELETE',
    });
  },
};
