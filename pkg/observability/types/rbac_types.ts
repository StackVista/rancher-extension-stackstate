const SCOPE_API_GROUP = 'scope.observability.cattle.io';
const INSTANCE_API_GROUP = 'instance.observability.cattle.io';

function createObserverRules(agiGroup: String) {
  return [
    {
      apiGroups: [agiGroup],
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
      apiGroups: [agiGroup],
      resources: [
        'visualizationsettings'
      ],
      verbs: [
        'update'
      ]
    },
    {
      apiGroups: [agiGroup],
      resources: [
        'componentactions'
      ],
      verbs: [
        'execute'
      ]
    },
    {
      apiGroups: [agiGroup],
      resources: [
        'favoriteviews'
      ],
      verbs: [
        'delete',
        'create'
      ]
    }
  ];
}

function createAdminRules(apiGroup: String) {
  return [
    {
      apiGroups: [apiGroup],
      resources: [
        'views',
        'ingestionapikeys',
        'permissions',
        'servicetokens',
        'settings',
        'stackpackconfigurations',
        'monitors',
        'notifications',
        'dashboards'
      ],
      verbs: [
        'create',
        'update',
        'get',
        'delete'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'settings'
      ],
      verbs: [
        'unlock'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'stackpacks'
      ],
      verbs: [
        'create',
        'get'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'agents',
        'apitokens',
        'metrics',
        'metricbindings',
        'syncdata',
        'systemnotifications',
        'topology',
        'topicmessages',
        'traces'
      ],
      verbs: [
        'get'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'syncdata',
        'visualizationsettings'
      ],
      verbs: [
        'update'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'componentactions',
        'monitors',
        'restrictedscripts'
      ],
      verbs: [
        'execute'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'favoriteviews',
        'favoritedashboards'
      ],
      verbs: [
        'create'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'favoriteviews',
        'syncdata',
        'favoritedashboards'
      ],
      verbs: [
        'delete'
      ]
    }
  ];
}

function createTroubleshooterRules(apiGroup: string) {
  return [
    {
      apiGroups: [apiGroup],
      resources: [
        'views',
        'monitors',
        'notifications',
        'stackpackconfigurations',
        'dashboards'
      ],
      verbs: [
        'create',
        'update',
        'get',
        'delete'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'agents',
        'apitokens',
        'metrics',
        'metricbindings',
        'settings',
        'stackpacks',
        'systemnotifications',
        'topology',
        'traces'
      ],
      verbs: [
        'get'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'visualizationsettings'
      ],
      verbs: [
        'update'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'componentactions',
        'monitors'
      ],
      verbs: [
        'execute'
      ]
    },
    {
      apiGroups: [apiGroup],
      resources: [
        'favoriteviews',
        'favoritedashboards'
      ],
      verbs: [
        'delete',
        'create'
      ]
    }
  ];
}

function createRoleTemplate(name: string, displayName: string, context: string, rules: Array<Object>) {
  return {
    apiVersion:  'management.cattle.io/v3',
    builtin:     false, // Ideally we set this as true to avoid getting updated
    context:     context,
    description: `Template for ${displayName} role`,
    displayName: displayName,
    external:    false,
    hidden:      false,
    kind:        'RoleTemplate',
    metadata:    { name: name, labels: { 'observability.cattle.io': 'rbac', 'rbac.observability.cattle.io/version': '1' } },
    rules:       rules
  };
}

const OBSERVABILITY_PROJECT_SCOPE_OBSERVER_NAME = 'suse-observability-project-observer';
const OBSERVABILITY_PROJECT_SCOPE_OBSERVER = createRoleTemplate(
  OBSERVABILITY_PROJECT_SCOPE_OBSERVER_NAME, 'SUSE Observability Project Observer', 'project', createObserverRules(SCOPE_API_GROUP));

const OBSERVABILITY_CLUSTER_SCOPE_OBSERVER_NAME = 'suse-observability-cluster-observer';
const OBSERVABILITY_CLUSTER_SCOPE_OBSERVER = createRoleTemplate(
  OBSERVABILITY_CLUSTER_SCOPE_OBSERVER_NAME, 'SUSE Observability Cluster Observer', 'cluster', createObserverRules(SCOPE_API_GROUP));

const OBSERVABILITY_INSTANCE_OBSERVER_NAME = 'suse-observability-instance-observer';
const OBSERVABILITY_INSTANCE_OBSERVER = createRoleTemplate(
  OBSERVABILITY_INSTANCE_OBSERVER_NAME, 'SUSE Observability Instance Observer', 'project', createObserverRules(INSTANCE_API_GROUP));

const OBSERVABILITY_INSTANCE_ADMIN_NAME = 'suse-observability-instance-admin';
const OBSERVABILITY_INSTANCE_ADMIN = createRoleTemplate(
  OBSERVABILITY_INSTANCE_ADMIN_NAME, 'SUSE Observability Instance Admin', 'project', createAdminRules(INSTANCE_API_GROUP));

const OBSERVABILITY_INSTANCE_TROUBLESHOOTER_NAME = 'suse-observability-instance-troubleshooter';
const OBSERVABILITY_INSTANCE_TROUBLESHOOTER = createRoleTemplate(
  OBSERVABILITY_INSTANCE_TROUBLESHOOTER_NAME, 'SUSE Observability Instance Troubleshooter', 'project', createTroubleshooterRules(INSTANCE_API_GROUP));

export const ROLE_TEMPLATES = new Map<string, Object>();
ROLE_TEMPLATES.set(OBSERVABILITY_PROJECT_SCOPE_OBSERVER_NAME, OBSERVABILITY_PROJECT_SCOPE_OBSERVER);
ROLE_TEMPLATES.set(OBSERVABILITY_CLUSTER_SCOPE_OBSERVER_NAME, OBSERVABILITY_CLUSTER_SCOPE_OBSERVER);
ROLE_TEMPLATES.set(OBSERVABILITY_INSTANCE_OBSERVER_NAME, OBSERVABILITY_INSTANCE_OBSERVER);
ROLE_TEMPLATES.set(OBSERVABILITY_INSTANCE_ADMIN_NAME, OBSERVABILITY_INSTANCE_ADMIN);
ROLE_TEMPLATES.set(OBSERVABILITY_INSTANCE_TROUBLESHOOTER_NAME, OBSERVABILITY_INSTANCE_TROUBLESHOOTER);
