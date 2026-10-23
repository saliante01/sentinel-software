import { Injectable, computed, signal } from '@angular/core';
import { MOCK_ACTIVITY, MOCK_APPLICATIONS, MOCK_CREDENTIALS, MOCK_DEPENDENCIES, MOCK_INCIDENTS } from './mock-data';
import { AuthType, MonitoredApplication } from './models';

export interface CreateApplicationInput {
  name: string;
  url: string;
  environment: MonitoredApplication['environment'];
  authType: AuthType;
  credentialRef?: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class SentinelStore {
  readonly applications = signal([...MOCK_APPLICATIONS]);
  readonly incidents = signal([...MOCK_INCIDENTS]);
  readonly credentials = signal([...MOCK_CREDENTIALS]);
  readonly dependencies = signal([...MOCK_DEPENDENCIES]);
  readonly activity = signal([...MOCK_ACTIVITY]);

  readonly activeIncidents = computed(() => this.incidents().filter((item) => item.status !== 'resolved'));
  readonly healthyApplications = computed(() => this.applications().filter((item) => item.status === 'healthy'));

  applicationById(id: number): MonitoredApplication | undefined {
    return this.applications().find((application) => application.id === id);
  }

  addApplication(input: CreateApplicationInput): MonitoredApplication {
    const nextId = Math.max(...this.applications().map((item) => item.id)) + 1;
    const application: MonitoredApplication = {
      id: nextId,
      name: input.name,
      code: input.name.slice(0, 3).toUpperCase(),
      url: input.url,
      active: true,
      status: 'unknown',
      authType: input.authType,
      credentialRef: input.credentialRef,
      credentialConfigured: false,
      environment: input.environment,
      tags: input.tags,
      createdAt: new Date().toISOString(),
    };
    this.applications.update((applications) => [application, ...applications]);
    return application;
  }
}
