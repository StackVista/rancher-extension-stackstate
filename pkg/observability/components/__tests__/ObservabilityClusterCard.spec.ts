import { beforeAll, afterAll, afterEach, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

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

export const restHandlers = [
  http.get("https://ye-observability.invalid.com/api/components", () =>
    HttpResponse.text("Unauthorized", { status: 401 }),
  ),
  http.post("https://ye-observability.invalid.com/api/snapshot", () =>
    HttpResponse.text("Unauthorized", { status: 401 }),
  ),
  http.get("https://ye-observability.example.com/api/components", () =>
    HttpResponse.json({}),
  ),
  http.post("https://ye-observability.example.com/api/snapshot", () =>
    HttpResponse.json({
      viewSnapshotResponse: {
        components: [
          {
            state: {
              healthState: "CRITICAL",
            },
          },
        ],
      },
    }),
  ),
  http.get("https://no-observability.example.com/api/components", () =>
    HttpResponse.text("Not found", { status: 404 }),
  ),
  http.post("https://no-observability.example.com/api/snapshot", () =>
    HttpResponse.json({
      viewSnapshotResponse: { components: [] },
    }),
  ),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());

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
                url: "https://ye-observability.invalid.com",
                serviceToken: "ye-token",
              },
            },
          ]);
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
                url: "https://no-observability.example.com",
                serviceToken: "ye-token",
              },
            },
          ]);
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
                url: "https://no-observability.example.com",
                serviceToken: "ye-token",
              },
            },
          ]);
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
