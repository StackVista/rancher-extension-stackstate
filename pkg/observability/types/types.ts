import RoleTemplate from '@shell/models/management.cattle.io.roletemplate';
import { MANAGEMENT } from '@shell/config/types';

export const OBSERVABILITY_PRODUCT_NAME = 'observability';
export const BLANK_CLUSTER = '_';

export const OBSERVABILITY_DASHBOARD = 'observability.rancher.io.dashboard';

export const OBSERVABILITY_CONFIGURATION_TYPE =
  'observability.rancher.io.configuration';

export const OBSERVABILITY_CLUSTERREPO = {
  type:     'catalog.cattle.io.clusterrepo',
  metadata:   { name: 'suse-observability' },
  spec:     {
    clientSecret: null,
    url:          'https://charts.rancher.com/server-charts/prime/suse-observability'
  }
};

export const OBSERVABILITY_CRD = {
  apiVersion: 'apiextensions.k8s.io/v1',
  kind:       'CustomResourceDefinition',
  metadata:   { name: 'configurations.observability.rancher.io' },
  spec:       {
    group:    'observability.rancher.io',
    versions: [
      {
        name:    'v1beta1',
        served:  true,
        storage: true,
        schema:  {
          openAPIV3Schema: {
            type:       'object',
            properties: {
              spec: {
                type:       'object',
                properties: {
                  url:          { type: 'string' },
                  serviceToken: { type: 'string' },
                  apiToken:     { type: 'string' },
                },
              },
            },
          },
        },
      },
    ],
    scope: 'Namespaced',
    names: {
      plural:   'configurations',
      singular: 'configuration',
      kind:     'Configuration',
      listKind: 'ConfigurationList',
    },
  },
};

export const OBSERVABILITY_OBSERVER_RULES = [
  {
    apiGroups: [
      'scope.observability.cattle.io'
    ],
    resources: [
      'views',
      'apitokens',
      'metrics',
      'systemnotifications',
      'topology',
      'traces',
      'settings',
      'stackpacks',
      'metricbindings'
    ],
    verbs: [
      'get'
    ]
  },
  {
    apiGroups: [
      'scope.observability.cattle.io'
    ],
    resources: [
      'visualizationsettings'
    ],
    verbs: [
      'update'
    ]
  },
  {
    apiGroups: [
      'scope.observability.cattle.io'
    ],
    resources: [
      'componentactions'
    ],
    verbs: [
      'execute'
    ]
  },
  {
    apiGroups: [
      'scope.observability.cattle.io'
    ],
    resources: [
      'favoriteviews'
    ],
    verbs: [
      'delete',
      'create'
    ]
  }
]
export const OBSERVABILITY_PROJECT_SCOPE_OBSERVER: RoleTemplate = {
  apiVersion: 'management.cattle.io/v3',
  builtin: false, // Ideally we set this as true to avoid getting updated
  context: 'project',
  description: 'Template for SUSE Observability Project Observer role',
  displayName: 'SUSE Observability Project Observer',
  external: false,
  hidden: false,
  kind: 'RoleTemplate',
  metadata: { name: 'suse-observability-project-observer' },
  rules: OBSERVABILITY_OBSERVER_RULES
};

export const OBSERVABILITY_CLUSTER_SCOPE_OBSERVER: RoleTemplate = {
  apiVersion: 'management.cattle.io/v3',
  builtin: false, // Ideally we set this as true to avoid getting updated
  context: 'cluster',
  description: 'Template for SUSE Observability Cluster Observer role',
  displayName: 'SUSE Observability Cluster Observer',
  external: false,
  hidden: false,
  kind: 'RoleTemplate',
  metadata: { name: 'suse-observability-cluster-observer' },
  rules: OBSERVABILITY_OBSERVER_RULES
};

export const ROLE_TEMPLATES = new Map<string, RoleTemplate>();
ROLE_TEMPLATES.set('suse-observability-project-observer', OBSERVABILITY_PROJECT_SCOPE_OBSERVER);
ROLE_TEMPLATES.set('suse-observability-cluster-observer', OBSERVABILITY_CLUSTER_SCOPE_OBSERVER);

export const HEALTH_STATE_TYPES = {
  UNKNOWN:       'UNKNOWN',
  CLEAR:         'CLEAR',
  DEVIATING:     'DEVIATING',
  CRITICAL:      'CRITICAL',
  NOT_MONITORED: 'NOT MONITORED',
};
