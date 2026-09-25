import { describe, expect, it, vi } from "vitest";
import { AgentStatus, loadAgentStatus } from "../rancher";

const clusterId = "c-test";
const secretUrl = `/k8s/clusters/${clusterId}/v1/secrets/agent-namespace/agent-config`;

function agentConfigMap(clusterName: unknown = "configmap-cluster") {
  return {
    metadata: {
      name: "custom-release-cluster-name",
      labels: { "app.kubernetes.io/component": "suse-observability-agent" },
    },
    data: { STS_CLUSTER_NAME: clusterName },
  };
}

function agentDeployment(variableName = "STS_CLUSTER_NAME") {
  return {
    metadata: {
      namespace: "agent-namespace",
      labels: { "app.kubernetes.io/name": "suse-observability-agent" },
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              env: [
                {
                  name: variableName,
                  valueFrom: {
                    secretKeyRef: {
                      name: "agent-config",
                      key: "STS_CLUSTER_NAME",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    },
  };
}

function createStore(
  configMaps: unknown[] = [],
  deployments: unknown[] = [agentDeployment()],
) {
  return {
    dispatch: vi
      .fn()
      .mockResolvedValueOnce({ data: configMaps })
      .mockResolvedValueOnce({ data: deployments })
      .mockResolvedValue({
        data: {
          STS_CLUSTER_NAME: btoa("secret-cluster"),
          STS_API_KEY: btoa("unused-api-key"),
        },
      }),
  };
}

describe("loadAgentStatus", () => {
  it("prefers the ConfigMap and does not request deployments or Secrets", async () => {
    const store = createStore([agentConfigMap()]);

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
      clusterName: "configmap-cluster",
    });
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  it.each(["STS_CLUSTER_NAME", "K8S_CLUSTER_NAME"])(
    "resolves %s from its deployment's Secret reference",
    async (variableName) => {
      const store = createStore([], [agentDeployment(variableName)]);

      expect(await loadAgentStatus(store, clusterId)).toEqual({
        status: AgentStatus.Installed,
        clusterName: "secret-cluster",
      });
      expect(store.dispatch).toHaveBeenCalledTimes(3);
      expect(store.dispatch).toHaveBeenNthCalledWith(3, "cluster/request", {
        url: secretUrl,
      });
    },
  );

  it.each([undefined, "", " ", 42])(
    "falls back when the matching ConfigMap has no usable name (%s)",
    async (clusterName) => {
      const store = createStore([
        { ...agentConfigMap(), data: { STS_CLUSTER_NAME: clusterName } },
      ]);

      expect(await loadAgentStatus(store, clusterId)).toEqual({
        status: AgentStatus.Installed,
        clusterName: "secret-cluster",
      });
    },
  );

  it("tries the Secret when ConfigMap access fails", async () => {
    const store = createStore();
    store.dispatch
      .mockReset()
      .mockRejectedValueOnce(new Error("Forbidden"))
      .mockResolvedValueOnce({ data: [agentDeployment()] })
      .mockResolvedValueOnce({
        data: { STS_CLUSTER_NAME: btoa("secret-cluster") },
      });

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
      clusterName: "secret-cluster",
    });
  });

  it("uses the referenced key instead of assuming STS_CLUSTER_NAME", async () => {
    const deployment = agentDeployment();
    deployment.spec.template.spec.containers[0].env[0].valueFrom.secretKeyRef.key =
      "cluster-name";
    const store = createStore([], [deployment]);
    store.dispatch.mockResolvedValue({
      data: { "cluster-name": btoa("custom-key-cluster") },
    });

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
      clusterName: "custom-key-cluster",
    });
  });

  it.each([new Error("Forbidden"), new Error("Not found")])(
    "keeps the display-name fallback when the Secret cannot be read (%s)",
    async (error) => {
      const store = createStore();
      store.dispatch.mockRejectedValue(error);

      expect(await loadAgentStatus(store, clusterId)).toEqual({
        status: AgentStatus.Installed,
      });
    },
  );

  it.each([undefined, "", "not base64!", btoa(" "), 42])(
    "ignores missing or invalid Secret data (%s)",
    async (encodedName) => {
      const store = createStore();
      store.dispatch.mockResolvedValue({
        data: { STS_CLUSTER_NAME: encodedName },
      });

      expect(await loadAgentStatus(store, clusterId)).toEqual({
        status: AgentStatus.Installed,
      });
    },
  );

  it("does not inspect API-key Secrets or unrelated deployments", async () => {
    const unrelatedDeployment = agentDeployment();
    unrelatedDeployment.metadata.labels["app.kubernetes.io/name"] = "other-app";
    const store = createStore(
      [],
      [agentDeployment("STS_API_KEY"), unrelatedDeployment],
    );

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
    });
    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });

  it.each([
    { name: "STS_CLUSTER_NAME", value: "literal-cluster" },
    {
      name: "STS_CLUSTER_NAME",
      valueFrom: { secretKeyRef: { name: "agent-config" } },
    },
    {
      name: "STS_CLUSTER_NAME",
      valueFrom: { secretKeyRef: { key: "STS_CLUSTER_NAME" } },
    },
  ])(
    "ignores entries without a complete Secret reference (%j)",
    async (env) => {
      const deployment = {
        ...agentDeployment(),
        spec: { template: { spec: { containers: [{ env: [env] }] } } },
      };
      const store = createStore([], [deployment]);

      expect(await loadAgentStatus(store, clusterId)).toEqual({
        status: AgentStatus.Installed,
      });
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    },
  );

  it("tries another reference after a failed Secret lookup", async () => {
    const secondDeployment = agentDeployment();
    secondDeployment.metadata.namespace = "another-namespace";
    const store = createStore([], [agentDeployment(), secondDeployment]);
    store.dispatch.mockRejectedValueOnce(new Error("Forbidden"));

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
      clusterName: "secret-cluster",
    });
    expect(store.dispatch).toHaveBeenNthCalledWith(4, "cluster/request", {
      url: `/k8s/clusters/${clusterId}/v1/secrets/another-namespace/agent-config`,
    });
  });

  it("does not retry the same unavailable Secret reference", async () => {
    const store = createStore([], [agentDeployment(), agentDeployment()]);
    store.dispatch.mockRejectedValue(new Error("Forbidden"));

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
    });
    expect(store.dispatch).toHaveBeenCalledTimes(3);
  });

  it("reports no installation when there are no agent resources", async () => {
    const store = createStore([], []);

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.NotInstalled,
    });
    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });

  it("preserves a ConfigMap lookup error when no deployment proves installation", async () => {
    const store = {
      dispatch: vi
        .fn()
        .mockRejectedValueOnce(new Error("Forbidden"))
        .mockResolvedValueOnce({ data: [] }),
    };

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.ConnectionError,
    });
    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });

  it("preserves a known deployment when ConfigMap and Secret access fail", async () => {
    const store = {
      dispatch: vi
        .fn()
        .mockRejectedValueOnce(new Error("Forbidden"))
        .mockResolvedValueOnce({ data: [agentDeployment()] })
        .mockRejectedValueOnce(new Error("Forbidden")),
    };

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
    });
    expect(store.dispatch).toHaveBeenCalledTimes(3);
  });

  it("preserves installation detection from a ConfigMap without a name", async () => {
    const store = createStore([agentConfigMap("")], []);

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
    });
  });

  it("preserves a known installation when deployment access fails", async () => {
    const store = {
      dispatch: vi
        .fn()
        .mockResolvedValueOnce({ data: [agentConfigMap("")] })
        .mockRejectedValue(new Error("Forbidden")),
    };

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.Installed,
    });
  });

  it("reports connection errors when neither resource lookup succeeds", async () => {
    const store = {
      dispatch: vi.fn().mockRejectedValue(new Error("Unavailable")),
    };

    expect(await loadAgentStatus(store, clusterId)).toEqual({
      status: AgentStatus.ConnectionError,
    });
  });
});
