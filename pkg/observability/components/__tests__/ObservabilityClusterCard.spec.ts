import { test, expect } from "vitest";
import { mount } from "@vue/test-utils";

import ObservabilityClusterCard from "../ObservabilityClusterCard.vue";

test("default state", () => {
  const mockStore = {};
  const wrapper = mount(ObservabilityClusterCard, {
    props: {
      resource: {
        id: "ye-cluster",
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

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain(
    "%observability.clusterCard.componentsHealth%",
  );
});

test("fetching details", async () => {
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
  const wrapper = mount(ObservabilityClusterCard, {
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

  await (ObservabilityClusterCard as any).fetch.call(wrapper.vm);

  const critical = wrapper.find("[data-testid=obs-critical-count]");
  expect(critical.text()).toContain("1");

  const deviating = wrapper.find("[data-testid=obs-deviating-count]");
  expect(deviating.text()).toContain("0");
});
