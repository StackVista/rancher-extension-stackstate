import { ConnectionInfo } from "types/component";
import { ObservabilitySettings } from "./settings";
/**
 * Check whether the connection credentials are valid.
 * @param store The Vue Store
 * @param credentials The Credentials to validate.
 * @returns
 */
export enum ConnectionStatus {
  Connected = 0,
  InvalidToken,
  CrossOriginError,
}

export async function checkConnection(
  store: any,
  credentials: ConnectionInfo,
): Promise<ConnectionStatus> {
  const creds = token(credentials.serviceToken);

  try {
    const resp = await store.dispatch("management/request", {
      url: `${credentials.apiURL}/api/server/info`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: creds,
      },
      redirectUnauthorized: false,
    });

    if (resp._status !== 200) {
      return ConnectionStatus.InvalidToken;
    }

    return ConnectionStatus.Connected;
  } catch (e) {
    if (e instanceof Error) {
      return ConnectionStatus.CrossOriginError;
    } else {
      return ConnectionStatus.InvalidToken;
    }
  }
}

export enum ObservationStatus {
  Observed = 0,
  NotDeployed,
  ConnectionError,
}

export async function loadObservationStatus(
  store: any,
  clusterName: string,
  settings: ObservabilitySettings,
): Promise<ObservationStatus> {
  try {
    const clusterUrn = `urn:cluster:/kubernetes:${clusterName}`;
    await loadComponent(store, settings, clusterUrn);
    return ObservationStatus.Observed;
  } catch (e) {
    if (e instanceof Error) {
      return ObservationStatus.ConnectionError;
    } else {
      return ObservationStatus.NotDeployed;
    }
  }
}

export async function getSnapshot(
  store: any,
  stql: string,
  settings: ObservabilitySettings,
): Promise<any | void> {
  const suseObservabilityURL = settings.url;
  const serviceToken = settings.serviceToken;

  if (!suseObservabilityURL || !serviceToken) {
    return;
  }

  const httpToken = token(serviceToken);

  return await store.dispatch("management/request", {
    url: `${suseObservabilityURL}/api/snapshot`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: httpToken,
    },
    withCredentials: true,
    data: {
      query: stql,
      queryVersion: "1.0",
      metadata: {
        groupingEnabled: false,
        showIndirectRelations: false,
        minGroupSize: 10,
        groupedByLayer: false,
        groupedByDomain: false,
        groupedByRelation: false,
        autoGrouping: false,
        connectedComponents: false,
        neighboringComponents: false,
        showFullComponent: false,
      },
    },
  });
}

export function loadComponent(
  store: any,
  spec: ObservabilitySettings,
  identifier: string,
) {
  const creds = token(spec.serviceToken);

  return store.dispatch("management/request", {
    url: `${spec.url}/api/components?identifier=${encodeURIComponent(identifier)}`,
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: creds },
  });
}

function token(serviceToken: string): string {
  return `ApiKey ${serviceToken}`;
}
