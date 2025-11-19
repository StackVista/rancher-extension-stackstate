import { ConnectionInfo } from "types/component";
import { ObservabilitySettings } from "./settings";

export class FetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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
  Unconfigured,
}

export async function checkConnection(
  credentials: ConnectionInfo,
): Promise<ConnectionStatus> {
  const creds = token(credentials.serviceToken);

  try {
    const resp = await fetch(`${credentials.apiURL}/api/server/info`, {
      credentials: "omit",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: creds,
      },
    });
    if (resp.ok) {
      return ConnectionStatus.Connected;
    } else {
      return ConnectionStatus.InvalidToken;
    }
  } catch (e) {
    if (e instanceof FetchError) {
      return ConnectionStatus.InvalidToken;
    } else {
      return ConnectionStatus.CrossOriginError;
    }
  }
}

export enum ObservationStatus {
  Observed = 0,
  NotDeployed,
  ConnectionError,
}

export async function loadObservationStatus(
  clusterName: string,
  settings: ObservabilitySettings,
): Promise<ObservationStatus> {
  try {
    const clusterUrn = `urn:cluster:/kubernetes:${clusterName}`;
    await loadComponent(settings, clusterUrn);
    return ObservationStatus.Observed;
  } catch (e) {
    if (e instanceof FetchError) {
      const err = e as FetchError;
      if (err.status === 404) {
        return ObservationStatus.NotDeployed;
      }
    }
    return ObservationStatus.ConnectionError;
  }
}

export async function getSnapshot(
  stql: string,
  settings: ObservabilitySettings,
): Promise<any | void> {
  const suseObservabilityURL = settings.url;
  const serviceToken = settings.serviceToken;

  if (!suseObservabilityURL || !serviceToken) {
    return;
  }

  const httpToken = token(serviceToken);

  const resp = await fetch(`${suseObservabilityURL}/api/snapshot`, {
    method: "POST",
    credentials: "omit",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: httpToken,
    },
    body: JSON.stringify({
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
    }),
  });
  if (resp.ok) {
    return await resp.json();
  } else {
    throw new FetchError(await resp.text(), resp.status);
  }
}

export async function loadComponent(
  spec: ObservabilitySettings,
  identifier: string,
) {
  if (!spec) {
    throw new FetchError(
      "Extension not configured",
      ConnectionStatus.Unconfigured,
    );
  }
  const creds = token(spec.serviceToken);
  const resp = await fetch(
    `${spec.url}/api/components?identifier=${encodeURIComponent(identifier)}`,
    {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json", Authorization: creds },
    },
  );
  if (resp.ok) {
    return await resp.json();
  } else {
    throw new FetchError(await resp.text(), resp.status);
  }
}

function token(serviceToken: string): string {
  return `ApiKey ${serviceToken}`;
}
