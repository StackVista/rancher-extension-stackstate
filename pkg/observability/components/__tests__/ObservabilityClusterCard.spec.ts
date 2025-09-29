import { test, expect } from "vitest";
import { mount } from "@vue/test-utils";

import ObservabilityClusterCard from "../ObservabilityClusterCard.vue";

const mountComponent = (mockStore: any) => {
  return mount(ObservabilityClusterCard, {
    props: {
      resource: {
        id: "ye-cluster-id",
        spec: {
          displayName: "ye-cluster",
        },
      },
    },
    global: {
      mocks: {
        $store: mockStore,
        $fetchState: { pending: false },
        t: (key: string) => `%${key}%`,
      },
    },
  });
};

test("initial state", () => {
  const mockStore = {};
  const wrapper = mountComponent(mockStore);

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain(
    "%observability.clusterCard.componentsHealth%",
  );
});

test("happy flow - installed & connected", async () => {
  const mockStore = {
    getters: {
      "management/schemaFor": () => ({
        attributes: {
          version: "v1",
        },
      }),
    },
    dispatch: (name: string, opts: any) => {
      switch (name) {
        case "management/findAll":
          return Promise.resolve([
            {
              metadata: {
                name: "suse-observability",
              },
              apiVersion: "observability.rancher.io/v1",
              spec: {
                url: "https://ye-observability.example.com",
                serviceToken: "ye-token",
              },
            },
          ]);
        case "management/request":
          return Promise.resolve({
            viewSnapshotResponse: {
              components: [
                {
                  state: {
                    healthState: "CRITICAL",
                  },
                },
              ],
            },
          });
      }
    },
  };
  const wrapper = mountComponent(mockStore);

  await (ObservabilityClusterCard as any).fetch.call(wrapper.vm);

  const critical = wrapper.find("[data-testid=obs-critical-count]");
  expect(critical.text()).toContain("1");

  const deviating = wrapper.find("[data-testid=obs-deviating-count]");
  expect(deviating.text()).toContain("0");
});

test("no schema yet", async () => {
  const mockStore = {
    getters: {
      "management/schemaFor": () => undefined,
    },
  };
  const wrapper = mountComponent(mockStore);

  await (ObservabilityClusterCard as any).fetch.call(wrapper.vm);

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain(
    "%observability.clusterCard.notConnectedPrepend%",
  );
});

test("no configuration yet", async () => {
  const mockStore = {
    getters: {
      "management/schemaFor": () => ({
        attributes: {
          version: "v1",
        },
      }),
    },
    dispatch: (name: string, opts: any) => {
      switch (name) {
        case "management/findAll":
          return Promise.resolve([]);
      }
    },
  };
  const wrapper = mountComponent(mockStore);

  await (ObservabilityClusterCard as any).fetch.call(wrapper.vm);

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain(
    "%observability.clusterCard.notConnectedPrepend%",
  );
});

test("configured, but cannot connect", async () => {
  const mockStore = {
    getters: {
      "management/schemaFor": () => ({
        attributes: {
          version: "v1",
        },
      }),
    },
    dispatch: (name: string, opts: any) => {
      switch (name) {
        case "management/findAll":
          return Promise.resolve([
            {
              metadata: {
                name: "suse-observability",
              },
              apiVersion: "observability.rancher.io/v1",
              spec: {
                url: "https://ye-observability.example.com",
                serviceToken: "ye-token",
              },
            },
          ]);
        case "management/request":
          return Promise.reject(Error("Cannot connect to SUSE Observability"));
      }
    },
  };
  const wrapper = mountComponent(mockStore);

  await (ObservabilityClusterCard as any).fetch.call(wrapper.vm);

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain(
    "%observability.clusterCard.notConnectedPrepend%",
  );
});

test("no component for cluster, agent is not deployed", async () => {
  const mockStore = {
    getters: {
      "management/schemaFor": () => ({
        attributes: {
          version: "v1",
        },
      }),
    },
    dispatch: (name: string, opts: any) => {
      switch (name) {
        case "management/findAll":
          return Promise.resolve([
            {
              metadata: {
                name: "suse-observability",
              },
              apiVersion: "observability.rancher.io/v1",
              spec: {
                url: "https://ye-observability.example.com",
                serviceToken: "ye-token",
              },
            },
          ]);
        case "management/request":
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject("no such cluster component");
        case "cluster/request":
          return Promise.resolve({ data: [] });
      }
    },
  };
  const wrapper = mountComponent(mockStore);

  await (ObservabilityClusterCard as any).fetch.call(wrapper.vm);

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain(
    "%observability.clusterCard.notObservedInstall%",
  );
});

test("no component for cluster, though agent is deployed", async () => {
  const mockStore = {
    getters: {
      "management/schemaFor": () => ({
        attributes: {
          version: "v1",
        },
      }),
    },
    dispatch: (name: string, opts: any) => {
      switch (name) {
        case "management/findAll":
          return Promise.resolve([
            {
              metadata: {
                name: "suse-observability",
              },
              apiVersion: "observability.rancher.io/v1",
              spec: {
                url: "https://ye-observability.example.com",
                serviceToken: "ye-token",
              },
            },
          ]);
        case "management/request":
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject("no such cluster component");
        case "cluster/request":
          return Promise.resolve({
            data: [
              {
                metadata: {
                  labels: {
                    "app.kubernetes.io/name": "suse-observability-agent",
                  },
                },
              },
            ],
          });
      }
    },
  };
  const wrapper = mountComponent(mockStore);

  await (ObservabilityClusterCard as any).fetch.call(wrapper.vm);

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain("%observability.clusterCard.noDataInstall%");
});
