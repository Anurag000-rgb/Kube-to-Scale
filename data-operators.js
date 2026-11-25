/* =========================================================================
   KUBERNETES OPERATORS TRACK ("OPERATOR" TAG)
   15 Interactive 2.5D Lessons (60 Steps), 10 Operator Drills, 6 Cheatsheets & Lab
   ========================================================================= */

// Add OPERATOR track tag onto core CRD/Operator lessons
['crds-schema', 'controllers-operators', 'level-triggered', 'leader-election'].forEach(id => {
  if (LESSONS[id] && !LESSONS[id].certs.includes('OPERATOR')) {
    LESSONS[id].certs.push('OPERATOR');
  }
});

// Expand Module 11 and add Modules 15 & 16 for full Operator curriculum
const m11 = MODULES.find(m => m.id === 'm11');
if (m11) {
  m11.title = 'Operators: Control Loops, CRDs & Runtime';
  if (!m11.certs.includes('OPERATOR')) m11.certs.push('OPERATOR');
  m11.lessons = [
    'crds-schema',
    'controllers-operators',
    'reconciliation-loop',
    'informers-workqueue',
    'crd-anatomy-gvk',
    'cr-lifecycle-subresources',
    'client-go-scratch',
    'controller-runtime-internals'
  ];
}

MODULES.push(
  {
    id: 'm15', code: '15', title: 'Operators: Kubebuilder, Patterns & Testing',
    color: '#D9F2C9', certs: ['OPERATOR', 'CNPE'],
    lessons: ['kubebuilder-scaffolding', 'reconciler-ownerrefs', 'finalizers-cleanup', 'webhooks-multiversion', 'envtest-concurrency']
  },
  {
    id: 'm16', code: '16', title: 'Operators: OLM v0/v1 & Day-2 Operations',
    color: '#D5E8FA', certs: ['OPERATOR', 'CNPE'],
    lessons: ['olm-classic-v0', 'olm-v1-architecture', 'production-ha-observability', 'upgrades-capability-model']
  }
);

Object.assign(LESSONS, {
  'reconciliation-loop': {
    id: 'reconciliation-loop', moduleId: 'm11', certs: ['OPERATOR', 'CNPE', 'CKA'],
    title: 'Reconciliation Loop',
    subtitle: 'Why Kubernetes controllers are level-triggered thermostats: Observe -> Diff -> Act idempotently until Desired matches Actual.',
    duration: '8 min', difficulty: 'Core',
    checklist: [
      'Distinguish level-triggered vs edge-triggered systems',
      'Run the Observe -> Diff -> Act reconciliation cycle',
      'Write idempotent handlers that survive retries',
      'Report observed truth cleanly via Status subresources'
    ],
    steps: [
      {
        short: 'Level vs Edge', cat: 'CONCEPT',
        title: 'Level-Triggered Loops Self-Heal Missed Events',
        body: ['An <strong>edge-triggered</strong> script reacts only to an event ("Pod died -> start 1"). If a webhook drops or the controller restarts, the cluster drifts forever.', 'A <strong>level-triggered</strong> controller continuously compares the full <em>Desired State</em> against the full <em>Actual State</em>—so missed events automatically heal on the next pass.'],
        tip: 'Think of a thermostat: it does not count how many times a door opened—it simply checks current temperature vs target temperature.',
        metrics: [['RECONCILE MODE', 'Level-Triggered', 'green'], ['MISSED EVENT', 'Auto-Healed ✓', 'green'], ['API CALLS/SEC', '1.2 req/s'], ['STATE', 'Converging', 'purple']],
        trace: { title: 'RECONCILE TRACE', rows: [['desired (spec)', 'replicas: 3'], ['actual (live)', 'replicas: 2 (drift)'], ['decision', 'create +1 Pod ✓']], banner: ['LEVEL-TRIGGERED HEALS DRIFT ✓', 'green'] },
        zones: [Z(65, 42, 315, 265, 'EDGE-TRIGGERED (DRIFTS)', '#C93632'), Z(425, 42, 330, 265, 'LEVEL-TRIGGERED (K8S)', '#1E7E45')],
        nodes: [
          N('e1', 155, 175, 'stack', 'coral', 'Dropped Event', 'packet lost', ['error/drift', 'red'], 'Edge handler missed the Pod delete notification.'),
          N('e2', 305, 175, 'cube', 'gray', '2 / 3 Pods', 'stuck drifted', ['stale', 'red'], 'Remains permanently degraded without manual fix.', true),
          N('l1', 515, 175, 'cube', 'mint', 'Controller', 'diff(3 vs 2)', ['reconciling', 'green'], 'Compares full desired vs actual state on wake-up.'),
          N('l2', 680, 175, 'stack', 'mint', '3 / 3 Pods', 'converged', ['synced', 'green'], 'Cluster matches spec cleanly.')
        ],
        edges: [E('e1', 'e2', 'err', { stop: 0.72 }), E('l1', 'l2', 'act', { count: 3 })]
      },
      {
        short: 'Observe & Diff', cat: 'CONCEPT',
        title: 'Observe Desired Spec & Actual Cluster Reality',
        body: ['Every reconciliation starts by fetching the <strong>Desired State</strong> (your Custom Resource <code>spec</code>) and querying <strong>Actual State</strong> (child Deployments, Services, or external cloud APIs).', 'Subtracting Actual from Desired yields the minimal corrective delta needed right now.'],
        code: { title: 'Go — Observe & Diff', lang: 'go', body: `// 1. Fetch desired CR\nvar app v1alpha1.WebApp\nif err := r.Get(ctx, req.NamespacedName, &app); err != nil {\n    return ctrl.Result{}, client.IgnoreNotFound(err)\n}\n// 2. Observe child Deployment and compute diff` },
        tip: 'Always wrap `r.Get()` errors with `client.IgnoreNotFound(err)`—a deleted CR should not trigger infinite error requeues!',
        metrics: [['READ SOURCE', 'Local Cache', 'green'], ['CACHE HIT', '99.8%', 'green'], ['DIFF RESULT', '+1 Deployment', 'warn'], ['API CALLS/SEC', '0 (cached)', 'green']],
        trace: { title: 'OBSERVE -> DIFF', rows: [['GET WebApp/shop', 'replicas: 3 (cache)'], ['GET Deploy/shop', 'NotFound (actual=0)'], ['delta', 'create Deployment']], banner: ['DELTA COMPUTED FROM CACHE ✓', 'purple'] },
        zones: [Z(280, 38, 485, 275, 'CONTROLLER OBSERVATION CYCLE', '#4A7BC7')],
        nodes: [
          N('cr', 145, 108, 'stack', 'lavender', 'WebApp CR', 'spec: 3 pods', ['watching', 'purple'], 'Declarative desired intent stored in etcd.'),
          N('ch', 145, 248, 'cyl', 'sky', 'Informer Cache', 'actual: 0', ['cached', 'purple'], 'In-memory mirror of live cluster resources.'),
          N('ctl', 445, 175, 'cube', 'yellow', 'Reconciler', 'Diff(3 - 0)', ['reconciling', 'warn'], 'Computes exact delta without direct polling.'),
          N('api', 670, 175, 'cube', 'mint', 'API Server', 'ready to act', null, 'Receives idempotent write operations.')
        ],
        edges: [E('cr', 'ctl', 'watch'), E('ch', 'ctl', 'watch'), E('ctl', 'api', 'act')]
      },
      {
        short: 'Idempotent Act', cat: 'PATTERN',
        title: 'Act Idempotently: Safe to Execute 1 or 100 Times',
        body: ['Controllers crash, restart, and retry! Your <strong>Act</strong> step must be strictly <strong>idempotent</strong>: calling <code>Reconcile()</code> twice in a row must never create duplicate resources or fail on <code>AlreadyExists</code>.', 'Instead of blind <code>Create()</code>, use create-or-update or Server-Side Apply.'],
        tip: 'Make every side effect (including external AWS/DB calls) idempotent by keying external objects with the CR UID or deterministic names.',
        metrics: [['IDEMPOTENT', '100% Safe ✓', 'green'], ['RETRY RESULT', 'No-Op (0 dup)', 'green'], ['WRITE MODE', 'CreateOrUpdate'], ['SAFETY', 'Crash-Safe ✓', 'green']],
        trace: { title: 'IDEMPOTENT ACTION', rows: [['pass #1', 'CREATE deploy/shop -> 201'], ['pass #2 (retry)', 'MATCHES -> no-op ✓'], ['duplicates', '0 created']], banner: ['IDEMPOTENT CONVERGENCE ✓', 'green'] },
        zones: [Z(275, 38, 490, 275, 'IDEMPOTENT ACTUATION', '#1E7E45')],
        nodes: [
          N('ctl', 145, 175, 'cube', 'yellow', 'Reconciler', 'Run #1 & #2', ['reconciling', 'warn'], 'Invoked repeatedly without breaking cluster state.'),
          N('api', 425, 175, 'cube', 'sky', 'API Server', 'CreateOrUpdate', ['idempotent', 'green'], 'Applies patch only when actual diverges from desired.'),
          N('dep', 670, 175, 'stack', 'mint', 'Deployment', '3/3 Ready', ['synced', 'green'], 'Exactly one managed Deployment exists.')
        ],
        edges: [E('ctl', 'api', 'act', { count: 3 }), E('api', 'dep', 'ok')]
      },
      {
        short: 'Status Convergence', cat: 'CONCEPT',
        title: 'Close the Loop: Update Status & Return Empty Result',
        body: ['Once child resources converge, the controller updates <code>CR.status</code> (e.g., <code>readyReplicas: 3</code>, <code>Ready=True</code>) and returns <code>ctrl.Result{}, nil</code>.', 'The controller then goes completely idle—consuming <strong>0% CPU</strong> until the next Watch event arrives!'],
        tip: 'Never write to `spec` inside your Reconciler; users own `spec`, controllers own `status`.',
        metrics: [['STATUS', 'Ready=True', 'green'], ['CPU IDLE', '0.0% ✓', 'green'], ['REQUEUE', 'None (Idle)'], ['STATE', 'Converged ✓', 'green']],
        trace: { title: 'LOOP CONVERGED', rows: [['status.ready', '3 / 3'], ['condition', 'Available=True ✓'], ['return', 'Result{}, nil (sleep)']], banner: ['DESIRED == ACTUAL · SYNCED ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'CONVERGED STEADY STATE', '#1E7E45')],
        nodes: [
          N('ctl', 210, 175, 'cube', 'mint', 'Reconciler', 'Result{}, nil', ['idle', 'green'], 'Sleeps until Watch cache delivers next change.'),
          N('api', 430, 175, 'cube', 'sky', 'API Server', 'PATCH /status', null, 'Persists observed status without changing spec generation.'),
          N('cr', 635, 175, 'stack', 'lavender', 'WebApp CR', 'Ready=True', ['synced', 'green'], 'Users see live health in kubectl get webapp.')
        ],
        edges: [E('ctl', 'api', 'ok'), E('api', 'cr', 'ok')]
      }
    ]
  },

  'informers-workqueue': {
    id: 'informers-workqueue', moduleId: 'm11', certs: ['OPERATOR', 'CNPE'],
    title: 'Informers & WorkQueue',
    subtitle: 'Inside client-go’s event plumbing: Reflector List-Watch, DeltaFIFO queue, SharedInformer Cache, and Rate-Limited WorkQueue.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Stream object deltas via Reflector List-Watch',
      'Buffer & deduplicate mutations in DeltaFIFO',
      'Read O(1) indexed objects from SharedInformer Cache',
      'Enqueue keys with exponential backoff in WorkQueue'
    ],
    steps: [
      {
        short: 'Reflector', cat: 'GO CODE',
        title: 'Reflector: 1 Initial LIST Followed by HTTP/2 WATCH',
        body: ['Polling kube-apiserver every second destroys etcd. Instead, <strong>Reflector</strong> executes ONE <code>LIST</code> to get a baseline snapshot and <code>resourceVersion</code>, then holds an open HTTP/2 <code>WATCH</code> stream for real-time Added/Modified/Deleted deltas.'],
        tip: 'If the network drops or etcd compacts past the last resourceVersion (`410 Gone`), Reflector automatically re-LISTs and resyncs.',
        metrics: [['POLLING QPS', '0 req/s ✓', 'green'], ['WATCH STREAM', '1 HTTP/2 Conn'], ['RESYNC', 'Auto on 410'], ['STATE', 'Streaming', 'purple']],
        trace: { title: 'REFLECTOR STREAM', rows: [['1. LIST', '42 CRs (rv=8910)'], ['2. WATCH', '?resourceVersion=8910'], ['3. push', 'MODIFIED -> DeltaFIFO']], banner: ['ZERO-POLLING WATCH ACTIVE ✓', 'purple'] },
        zones: [Z(285, 38, 480, 275, 'CLIENT-GO INFORMER PIPELINE', '#6E47B8')],
        nodes: [
          N('api', 145, 175, 'cube', 'sky', 'API Server', 'rv=8910+', null, 'Streams protobuf deltas from its in-memory Watch Cache.'),
          N('ref', 425, 175, 'cube', 'lavender', 'Reflector', 'List + Watch', ['watching', 'purple'], 'Pumps raw watch events into DeltaFIFO.'),
          N('df', 665, 175, 'stack', 'yellow', 'DeltaFIFO', 'event buffer', null, 'Deduplicated FIFO queue of object deltas.')
        ],
        edges: [E('api', 'ref', 'watch', { count: 3 }), E('ref', 'df', 'act')]
      },
      {
        short: 'DeltaFIFO', cat: 'GO CODE',
        title: 'DeltaFIFO Merges Bursts Before Updating Local Cache',
        body: ['<strong>DeltaFIFO</strong> sits between Reflector and your Informer. It groups rapid changes to the same object key (<code>prod/db-1</code>) in order, pops them sequentially, updates the local <strong>Indexer Cache</strong> first, and then fires EventHandlers.'],
        tip: 'Updating the Indexer BEFORE invoking EventHandlers guarantees your Reconciler always sees the latest object in cache.',
        metrics: [['QUEUE TYPE', 'FIFO + Dedup'], ['BURST MERGE', '10 -> 1 Pop', 'green'], ['ORDERING', 'Per-Key FIFO'], ['STATE', 'Buffering', 'warn']],
        trace: { title: 'DELTAFIFO POP', rows: [['input', 'ADD + 4x MOD (prod/db-1)'], ['1. Indexer', 'store latest rv=8915 ✓'], ['2. Handler', 'fire OnUpdate(old, new)']], banner: ['CACHE UPDATED BEFORE HANDLER ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'DELTAFIFO -> INDEXER -> HANDLERS', '#A8640C')],
        nodes: [
          N('df', 180, 175, 'stack', 'yellow', 'DeltaFIFO', 'key: prod/db-1', ['coalescing', 'warn'], 'Prevents slow consumers from blocking Watch reads.'),
          N('idx', 435, 108, 'cyl', 'sky', 'Indexer Cache', 'RAM O(1) map', ['cached', 'purple'], 'Thread-safe local store with secondary indexes.'),
          N('eh', 435, 245, 'cube', 'lavender', 'EventHandlers', 'Add/Upd/Del', null, 'Lightweight callbacks that push keys to WorkQueue.'),
          N('wq', 665, 245, 'stack', 'mint', 'WorkQueue', 'enqueues key', null, 'Rate-limited queue feeding worker goroutines.')
        ],
        edges: [E('df', 'idx', 'ok'), E('df', 'eh', 'watch'), E('eh', 'wq', 'act')]
      },
      {
        short: 'SharedInformer', cat: 'PATTERN',
        title: 'SharedInformer: One Cache Shared Across Many Controllers',
        body: ['If 5 controllers in the same binary all watch Pods, a <strong>SharedInformerFactory</strong> opens just <strong>1 Watch connection</strong> and keeps <strong>1 RAM cache</strong>—cutting memory and API Server load by 80%!'],
        tip: 'CRITICAL GO RULE: Because the cache is shared across goroutines, NEVER mutate a cached object in-place—always call `obj.DeepCopy()` first!',
        metrics: [['WATCH CONNS', '1 Shared ✓', 'green'], ['RAM FOOTPRINT', '-80% Saved', 'green'], ['READ LATENCY', '< 10 µs RAM', 'green'], ['RULE', 'DeepCopy()!']],
        trace: { title: 'SHARED CACHE', rows: [['Pod Watch', '1 stream -> 1 Indexer'], ['Consumers', '3 controllers reading'], ['Mutate rule', 'obj.DeepCopy() required!']], banner: ['1 WATCH SERVES ALL CONTROLLERS ✓', 'green'] },
        zones: [Z(265, 36, 495, 278, 'SHAREDINFORMER FACTORY', '#4A7BC7')],
        nodes: [
          N('api', 140, 175, 'cube', 'sky', 'API Server', '1 Watch only', null, 'Sends each Pod delta exactly once.'),
          N('sh', 405, 175, 'cyl', 'mint', 'Shared Cache', 'Read-Only RAM', ['cached', 'green'], 'Shared Indexer serving O(1) reads.'),
          N('c1', 665, 102, 'cube', 'lavender', 'Ctrl A', 'DeepCopy()', null, 'Reconciles Deployments.'),
          N('c2', 665, 248, 'cube', 'yellow', 'Ctrl B', 'DeepCopy()', null, 'Reconciles Services / Metrics.')
        ],
        edges: [E('api', 'sh', 'watch', { count: 1 }), E('sh', 'c1', 'ok'), E('sh', 'c2', 'ok')]
      },
      {
        short: 'WorkQueue', cat: 'GO CODE',
        title: 'Rate-Limited WorkQueue: Keys Only + Exponential Backoff',
        body: ['EventHandlers enqueue only the string key (<code>"prod/db-1"</code>). WorkQueue guarantees <strong>at most one worker goroutine</strong> processes a given key at a time (no per-object races!) and retries errors with exponential backoff (<code>5ms -> 10ms -> 20ms...</code>).'],
        code: { title: 'Go — WorkQueue Backoff', lang: 'go', body: `key, shutdown := c.queue.Get()\ndefer c.queue.Done(key)\nif err := c.reconcile(key); err != nil {\n    c.queue.AddRateLimited(key) // 5ms, 10ms, 20ms...\n} else {\n    c.queue.Forget(key) // reset backoff on success\n}` },
        tip: 'Always call `queue.Forget(key)` after a successful reconcile, or future unrelated errors on that key will start at a huge backoff delay!',
        metrics: [['KEY CONCURRENCY', '1 / Key ✓', 'green'], ['BACKOFF', '5ms -> 1000s', 'warn'], ['DEDUP', 'Dirty Set ✓', 'green'], ['STATE', 'Protected', 'green']],
        trace: { title: 'RATE-LIMIT QUEUE', rows: [['pop key', '"prod/db-1" -> worker #1'], ['transient err', 'AddRateLimited (40ms)'], ['retry OK', 'Forget(key) + Done() ✓']], banner: ['ZERO RACES · SAFE BACKOFF ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'WORKQUEUE + WORKER POOL', '#1E7E45')],
        nodes: [
          N('wq', 185, 175, 'stack', 'yellow', 'WorkQueue', 'dirty + processing', ['deduped', 'warn'], 'Tracks dirty keys and currently processing keys.'),
          N('w1', 445, 110, 'cube', 'mint', 'Worker #1', 'prod/db-1', ['reconciling', 'green'], 'Processes key cleanly and calls Forget().'),
          N('w2', 445, 245, 'cube', 'coral', 'Worker #2', 'err -> retry', ['backoff 40ms', 'red'], 'Requeues transient API error with backoff.'),
          N('ok', 670, 175, 'cube', 'sky', 'API Server', 'healthy QPS', null, 'Protected from tight infinite retry loops.')
        ],
        edges: [E('wq', 'w1', 'ok'), E('wq', 'w2', 'err'), E('w2', 'wq', 'err', { off: 16 }), E('w1', 'ok', 'act')]
      }
    ]
  },

  'crd-anatomy-gvk': {
    id: 'crd-anatomy-gvk', moduleId: 'm11', certs: ['OPERATOR', 'CNPE', 'CKA'],
    title: 'CRD Anatomy & GVK',
    subtitle: 'Extending Kubernetes’ REST & Watch API dynamically with Group/Version/Kind, Structural OpenAPI v3 Schemas, and Scope.',
    duration: '8 min', difficulty: 'Core',
    checklist: [
      'Distinguish GVK (Go type) vs GVR (HTTP REST path)',
      'Enforce Structural OpenAPI v3 schemas & field pruning',
      'Choose Namespaced vs Cluster-scoped CRDs intentionally',
      'Customize kubectl UX with shortNames & printColumns'
    ],
    steps: [
      {
        short: 'GVK vs GVR', cat: 'CONCEPT',
        title: 'GVK (Schema Type) vs GVR (REST URL Endpoint)',
        body: ['Every Kubernetes object is identified by its <strong>GVK</strong>: <code>Group</code> (<code>db.acme.io</code>), <code>Version</code> (<code>v1</code>), and <code>Kind</code> (<code>PostgresCluster</code>).', 'API Server maps GVK to a plural <strong>GVR</strong> (<code>Resource: postgresclusters</code>) mounted at <code>/apis/db.acme.io/v1/namespaces/{ns}/postgresclusters</code>!'],
        tip: 'Think of GVK as the Go struct/YAML header (`apiVersion` + `kind`), and GVR as the HTTP route used by RBAC and dynamic clients.',
        metrics: [['GVK', 'db.acme.io/v1/PG'], ['GVR', 'postgresclusters'], ['REST ROUTE', '/apis/db.acme.io', 'green'], ['ETCD', 'Native ✓', 'green']],
        trace: { title: 'API REGISTRATION', rows: [['CRD applied', 'postgresclusters.db.acme.io'], ['GVK -> GVR', 'PostgresCluster -> plural'], ['kubectl', 'get pgclusters works ✓']], banner: ['DYNAMIC REST + WATCH MOUNTED ✓', 'green'] },
        zones: [Z(270, 38, 495, 275, 'KUBE-APISERVER DYNAMIC REGISTRY', '#6E47B8')],
        nodes: [
          N('crd', 145, 175, 'hex', 'lavender', 'CRD YAML', 'GVK + GVR', ['applied', 'purple'], 'Registers new custom type without recompiling Kubernetes.'),
          N('api', 425, 175, 'cube', 'sky', 'API Server', '/apis/db.acme.io', ['serving', 'green'], 'Exposes CRUD, RBAC, and Watch automatically.'),
          N('et', 670, 175, 'cyl', 'mint', 'etcd', '/registry/db.acme', null, 'Persists Custom Resources alongside native Pods.')
        ],
        edges: [E('crd', 'api', 'act'), E('api', 'et', 'watch')]
      },
      {
        short: 'Structural Schema', cat: 'PATTERN',
        title: 'OpenAPI v3 Structural Schema & Unknown Field Pruning',
        body: ['Since <code>apiextensions.k8s.io/v1</code>, every CRD MUST define a <strong>Structural OpenAPI v3 Schema</strong> specifying exact types, defaults, enums, and min/max bounds.', 'API Server automatically <strong>prunes unknown fields</strong> (like typos such as <code>repliacs: 3</code>) before writing to etcd—preventing silent bugs!'],
        code: { title: 'YAML — Structural Schema', lang: 'yaml', body: `openAPIV3Schema:\n  type: object\n  properties:\n    spec:\n      type: object\n      required: [replicas, version]\n      properties:\n        replicas: { type: integer, minimum: 1, maximum: 9 }` },
        tip: 'Always include `required` fields and numeric bounds in your CRD schema so bad manifests fail instantly at `kubectl apply`, never 30s later inside your Go loop.',
        metrics: [['SCHEMA', 'OpenAPI v3', 'green'], ['PRUNING', 'Auto Enabled ✓', 'green'], ['INVALID SPEC', '422 Rejected', 'red'], ['WEBHOOKS', '0 Needed']],
        trace: { title: 'SCHEMA VALIDATION', rows: [['replicas: 0', 'min=1 FAILED (422) ✕'], ['typo field', 'pruned cleanly ✓'], ['replicas: 3', 'OpenAPI v3 PASS ✓']], banner: ['INVALID CR BLOCKED AT API GATE ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'IN-PROCESS OPENAPI V3 GATE', '#1E7E45')],
        nodes: [
          N('bad', 145, 110, 'stack', 'coral', 'Bad CR', 'replicas: 0', ['422 error', 'red'], 'Fails OpenAPI minimum: 1 validation immediately.'),
          N('gd', 145, 245, 'stack', 'mint', 'Valid CR', 'replicas: 3', ['valid', 'green'], 'Satisfies structural schema rules.'),
          N('sh', 445, 175, 'shield', 'lavender', 'OpenAPI v3', 'Strict + Prune', ['enforcing', 'purple'], 'Validates every CR synchronously inside API Server.'),
          N('et', 670, 175, 'cyl', 'sky', 'etcd', 'clean CR only', null, 'Never polluted with malformed custom resources.')
        ],
        edges: [E('bad', 'sh', 'err', { stop: 0.78 }), E('gd', 'sh', 'ok'), E('sh', 'et', 'ok')]
      },
      {
        short: 'CRD Scope', cat: 'CONCEPT',
        title: 'Scope Design: Namespaced vs Cluster-Scoped CRDs',
        body: ['Set <code>scope: Namespaced</code> (95% of operators) so teams get multi-tenant RBAC isolation, ResourceQuotas, and namespace cleanup.', 'Reserve <code>scope: Cluster</code> for truly cluster-wide infrastructure primitives like <code>ClusterIssuer</code>, <code>NodePool</code>, or <code>ClusterCatalog</code>.'],
        tip: 'A Cluster-scoped CR cannot have a Namespaced ownerReference! Keep parent/child scopes aligned so Garbage Collection works cleanly.',
        metrics: [['DEFAULT', 'Namespaced ✓', 'green'], ['MULTI-TENANT', 'RBAC Scoped', 'green'], ['CLUSTER SCOPE', 'Infra Only'], ['GC SAFETY', 'Aligned ✓', 'green']],
        trace: { title: 'SCOPE BOUNDARIES', rows: [['PostgresCluster', 'scope: Namespaced ✓'], ['NodePool', 'scope: Cluster'], ['RBAC', 'RoleBinding per team']], banner: ['TENANT ISOLATION PRESERVED ✓', 'green'] },
        zones: [Z(65, 42, 325, 265, 'NAMESPACED CRD (TEAM-SCOPED)', '#1E7E45'), Z(425, 42, 330, 265, 'CLUSTER-SCOPED CRD (PLATFORM)', '#6E47B8')],
        nodes: [
          N('ns', 228, 175, 'stack', 'mint', 'ns: payments', 'PostgresCluster', ['RBAC isolated', 'green'], 'Developers manage only their own namespace CRs.'),
          N('cl', 590, 175, 'hex', 'lavender', 'Cluster Scope', 'NodePool / Class', ['platform admin', 'purple'], 'Shared across all namespaces by platform admins.')
        ],
        edges: []
      },
      {
        short: 'kubectl UX', cat: 'KUBEBUILDER',
        title: 'First-Class UX: shortNames, Categories & PrinterColumns',
        body: ['Without <code>additionalPrinterColumns</code>, <code>kubectl get pg</code> prints only <code>NAME</code> and <code>AGE</code>.', 'Adding printer columns, <code>shortNames: [pg]</code>, and <code>categories: [all]</code> makes your CRD feel indistinguishable from built-in Kubernetes Deployments!'],
        tip: 'JSONPath expressions like `.status.phase` and `.status.primaryPod` surface live operator health directly in `kubectl get`.',
        metrics: [['SHORTNAME', 'kubectl get pg', 'green'], ['COLUMNS', 'Phase / Ready'], ['UX SCORE', 'Native Feel ✓', 'green'], ['BOILERPLATE', 'Marker Driven']],
        trace: { title: 'KUBECTL GET PG', rows: [['NAME', 'shop-db'], ['REPLICAS / READY', '3 / 3'], ['PHASE / AGE', 'Healthy / 4d ✓']], banner: ['NATIVE KUBECTL EXPERIENCE ✓', 'green'] },
        zones: [Z(85, 42, 650, 265, 'CUSTOM KUBECTL PRESENTATION', '#4A7BC7')],
        nodes: [
          N('cli', 195, 175, 'cube', 'sky', 'kubectl get pg', 'shortName: pg', null, 'Fast operator-friendly command alias.'),
          N('crd', 425, 175, 'hex', 'lavender', 'PrinterColumns', 'JSONPath', ['formatting', 'purple'], 'Maps .status fields into clean table columns.'),
          N('out', 640, 175, 'stack', 'mint', 'Rich Table', 'Ready · Primary', ['synced', 'green'], 'Instant operational visibility for engineers.')
        ],
        edges: [E('cli', 'crd', 'act'), E('crd', 'out', 'ok')]
      }
    ]
  },

  'cr-lifecycle-subresources': {
    id: 'cr-lifecycle-subresources', moduleId: 'm11', certs: ['OPERATOR', 'CNPE', 'CKA'],
    title: 'CR Lifecycle & Subresources',
    subtitle: 'Clean Spec vs Status separation, /status and /scale subresources, observedGeneration tracking, and standard meta Conditions.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Enable /status so status updates never bump generation',
      'Track spec convergence accurately with observedGeneration',
      'Expose standard Kubernetes Conditions (Available/Degraded)',
      'Unlock native HPA & kubectl scale via /scale subresource'
    ],
    steps: [
      {
        short: 'Spec vs Status', cat: 'PATTERN',
        title: 'The /status Subresource Splits Ownership & Protects Generation',
        body: ['When <code>subresources.status: {}</code> is enabled on a CRD, writing to the main endpoint ignores <code>status</code>, and writing to <code>/status</code> ignores <code>spec</code>.', 'Crucially, patching <code>/status</code> does NOT increment <code>metadata.generation</code>—preventing infinite reconcile loops!'],
        code: { title: 'Go — Update Status Safely', lang: 'go', body: `// Always write status via r.Status().Update() or Patch()\napp.Status.ReadyReplicas = deploy.Status.ReadyReplicas\nif err := r.Status().Update(ctx, &app); err != nil {\n    return ctrl.Result{}, err\n}` },
        tip: 'If you forget `r.Status().Update()` and call `r.Update()` when `/status` is enabled, your status changes are silently dropped!',
        metrics: [['/STATUS', 'Enabled ✓', 'green'], ['GEN BUMP', 'Spec Only ✓', 'green'], ['RBAC SPLIT', 'User vs Ctrl'], ['RACE RISK', 'Eliminated ✓', 'green']],
        trace: { title: 'SUBRESOURCE SPLIT', rows: [['User PUT /cr', 'updates spec (gen 4->5)'], ['Ctrl PATCH /status', 'updates status (gen=5)'], ['Loop storm', 'prevented ✓']], banner: ['CLEAN SPEC / STATUS BOUNDARY ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'CR SUBRESOURCE ENDPOINTS', '#6E47B8')],
        nodes: [
          N('usr', 145, 108, 'cube', 'sky', 'User / GitOps', 'PUT /spec', ['gen -> 5', 'purple'], 'Declares desired configuration.'),
          N('op', 145, 248, 'cube', 'yellow', 'Operator', 'PATCH /status', ['gen stays 5', 'green'], 'Reports observed reality only.'),
          N('cr', 450, 175, 'hex', 'lavender', 'WebApp CR', '/spec & /status', ['isolated', 'purple'], 'Separate HTTP endpoints & RBAC verbs.'),
          N('et', 670, 175, 'cyl', 'mint', 'etcd', 'clean history', null, 'Zero lost writes between user and controller.')
        ],
        edges: [E('usr', 'cr', 'act'), E('op', 'cr', 'ok'), E('cr', 'et', 'watch')]
      },
      {
        short: 'observedGen', cat: 'PATTERN',
        title: 'observedGeneration Proves Status Isn’t Stale',
        body: ['Right after a user changes <code>spec.replicas: 3 -> 5</code>, <code>metadata.generation</code> jumps to <code>5</code> while <code>status.observedGeneration</code> is still <code>4</code>.', 'Wait tools (<code>kubectl wait</code>, ArgoCD) know reconciliation is in progress until <code>observedGeneration == generation</code>!'],
        tip: 'Always copy `cr.Status.ObservedGeneration = cr.Generation` right before committing your status update.',
        metrics: [['METADATA.GEN', '5 (New Spec)'], ['OBSERVED.GEN', '5 (Matched ✓)', 'green'], ['ARGOCD SYNC', 'Healthy ✓', 'green'], ['STALE READS', 'Detectable ✓', 'green']],
        trace: { title: 'GENERATION MATCH', rows: [['t=0s spec edit', 'gen=5, observedGen=4'], ['t=3s reconcile', 'scaled to 5 pods'], ['t=4s /status', 'observedGen=5 == gen ✓']], banner: ['GENERATION CONVERGED (5 == 5) ✓', 'green'] },
        zones: [Z(85, 42, 650, 265, 'OBSERVED GENERATION HANDSHAKE', '#1E7E45')],
        nodes: [
          N('sp', 195, 175, 'stack', 'sky', 'Spec v5', 'generation: 5', null, 'Bumped automatically by API Server on spec change.'),
          N('rc', 425, 175, 'cube', 'yellow', 'Reconciler', 'applies v5', ['reconciling', 'warn'], 'Reconciles cluster and stamps observedGeneration=5.'),
          N('st', 640, 175, 'shield', 'mint', 'Status Ready', 'observedGen: 5', ['synced', 'green'], 'GitOps & CLI know v5 is fully applied.')
        ],
        edges: [E('sp', 'rc', 'watch'), E('rc', 'st', 'ok')]
      },
      {
        short: 'Conditions', cat: 'PATTERN',
        title: 'Standard metav1.Condition Over Simple Phase Strings',
        body: ['A single string like <code>phase: Error</code> hides too much context. Kubernetes conventions favor a list of typed <strong>Conditions</strong>: <code>Available</code>, <code>Progressing</code>, and <code>Degraded</code>, each with <code>status</code>, <code>reason</code>, <code>message</code>, and <code>lastTransitionTime</code>.'],
        code: { title: 'Go — meta.SetStatusCondition', lang: 'go', body: `meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{\n    Type:               "Available",\n    Status:             metav1.ConditionTrue,\n    ObservedGeneration: app.Generation,\n    Reason:             "ReconcileSucceeded",\n    Message:            "All 3 replicas are ready",\n})` },
        tip: 'Using `apimachinery/pkg/api/meta.SetStatusCondition()` handles transition timestamps and deduplication cleanly.',
        metrics: [['AVAILABLE', 'True ✓', 'green'], ['PROGRESSING', 'False'], ['DEGRADED', 'False ✓', 'green'], ['KUBECTL WAIT', 'Supported ✓', 'green']],
        trace: { title: 'STATUS CONDITIONS', rows: [['Available', 'True (All 3 ready)'], ['Progressing', 'False (Converged)'], ['Degraded', 'False (0 errors)']], banner: ['RICH STRUCTURED HEALTH ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'STANDARD KUBERNETES CONDITIONS', '#1E7E45')],
        nodes: [
          N('rc', 180, 175, 'cube', 'yellow', 'Reconciler', 'SetCondition()', null, 'Updates orthogonal health signals.'),
          N('c1', 435, 108, 'shield', 'mint', 'Available=True', '3/3 Ready', ['healthy', 'green'], 'Primary readiness condition.'),
          N('c2', 435, 245, 'shield', 'sky', 'Degraded=False', '0 errors', null, 'Surfaces transient or persistent failures clearly.'),
          N('wt', 665, 175, 'cube', 'lavender', 'kubectl wait', '--for=condition', ['native', 'purple'], 'CI/CD pipelines wait deterministically on Conditions.')
        ],
        edges: [E('rc', 'c1', 'ok'), E('rc', 'c2', 'ok'), E('c1', 'wt', 'watch')]
      },
      {
        short: '/scale Subresource', cat: 'KUBEBUILDER',
        title: 'Unlock Native HPA & kubectl scale With /scale',
        body: ['Declaring <code>subresources.scale</code> maps <code>specReplicasPath</code> and <code>statusReplicasPath</code> on your CRD.', 'Instantly, <code>kubectl scale pg/shop --replicas=5</code> AND Kubernetes’ built-in <strong>HorizontalPodAutoscaler (HPA)</strong> can autoscale your Custom Resource with zero extra controller code!'],
        tip: 'Include `labelSelectorPath` in your `/scale` subresource so HPA knows which Pods to scrape CPU/memory metrics from.',
        metrics: [['/SCALE', 'Enabled ✓', 'green'], ['HPA SUPPORT', 'Native ✓', 'green'], ['KUBECTL SCALE', 'Works ✓', 'green'], ['EXTRA CODE', '0 Lines']],
        trace: { title: 'NATIVE /SCALE API', rows: [['HPA CPU', '84% > 70% target'], ['PATCH /scale', 'spec.replicas: 3 -> 5'], ['Operator', 'scales cluster to 5 ✓']], banner: ['NATIVE HPA AUTOSCALING ENABLED ✓', 'green'] },
        zones: [Z(270, 38, 495, 275, 'CRD /SCALE INTEGRATION', '#4A7BC7')],
        nodes: [
          N('hpa', 145, 175, 'cube', 'yellow', 'Native HPA', 'CPU 84% -> 5', ['scaling', 'warn'], 'Standard Kubernetes HPA targeting your Custom Resource.'),
          N('cr', 425, 175, 'hex', 'lavender', 'WebApp /scale', 'replicas: 3->5', ['patched', 'purple'], 'Maps /scale cleanly onto .spec.replicas.'),
          N('op', 670, 175, 'cube', 'mint', 'Operator', 'spawns +2 pods', ['synced', 'green'], 'Reconciles the updated replica count automatically.')
        ],
        edges: [E('hpa', 'cr', 'act'), E('cr', 'op', 'watch')]
      }
    ]
  },

  'client-go-scratch': {
    id: 'client-go-scratch', moduleId: 'm11', certs: ['OPERATOR', 'CNPE'],
    title: 'client-go From Scratch',
    subtitle: 'How low-level Go controllers are wired: REST config, Typed vs Dynamic clients, SharedInformerFactory, EventHandlers, and worker loops.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Connect in-cluster or locally via rest.Config',
      'Compare Typed Clientsets vs Dynamic Unstructured clients',
      'Wire SharedInformerFactory & EventHandlers cleanly',
      'Run graceful shutdown worker goroutines with Context'
    ],
    steps: [
      {
        short: 'Config & Clients', cat: 'GO CODE',
        title: 'Bootstrapping rest.Config: InCluster vs Local Kubeconfig',
        body: ['A Go controller starts by building a <code>*rest.Config</code>: inside a Pod it reads the projected ServiceAccount token + CA cert via <code>rest.InClusterConfig()</code>; on your laptop it loads <code>~/.kube/config</code>.', 'From that config, you instantiate a <strong>Clientset</strong> with tuned QPS/Burst rate limits.'],
        code: { title: 'Go — rest.Config Setup', lang: 'go', body: `cfg, err := rest.InClusterConfig()\nif err != nil {\n    cfg, err = clientcmd.BuildConfigFromFlags("", kubeconfig)\n}\nclientset, _ := kubernetes.NewForConfig(cfg)` },
        tip: 'Default client-go rate limits are low (QPS=5, Burst=10). Raise `cfg.QPS` and `cfg.Burst` carefully for large multi-thousand-CR operators.',
        metrics: [['AUTH MODE', 'InCluster SA'], ['DEFAULT QPS', '5 req/s'], ['TRANSPORT', 'HTTP/2 + Proto'], ['CLIENT', 'Typed Clientset']],
        trace: { title: 'CLIENT BOOTSTRAP', rows: [['SA token', '/var/run/.../token ✓'], ['TLS CA', 'ca.crt verified ✓'], ['clientset', 'ready for List-Watch']], banner: ['GO CLIENT CONNECTED TO API ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'GO CONTROLLER STARTUP', '#A8640C')],
        nodes: [
          N('cfg', 180, 175, 'shield', 'yellow', 'rest.Config', 'SA JWT / kubeconfig', null, 'Loads API endpoint, TLS CA, and Bearer credentials.'),
          N('cs', 415, 175, 'cube', 'sky', 'Clientset', 'QPS / Burst', ['initialized', 'purple'], 'Strongly-typed Go client for Kubernetes APIs.'),
          N('api', 645, 175, 'cube', 'mint', 'API Server', ':6443 HTTPS', ['connected', 'green'], 'Control plane hub.')
        ],
        edges: [E('cfg', 'cs', 'act'), E('cs', 'api', 'ok')]
      },
      {
        short: 'Typed vs Dynamic', cat: 'GO CODE',
        title: 'Typed Clientset vs Dynamic Unstructured Client',
        body: ['A <strong>Typed Clientset</strong> gives compile-time safety (<code>appsv1.Deployment</code>) and fast protobuf decoding, while a <strong>Dynamic Client</strong> works with arbitrary CRDs at runtime using <code>unstructured.Unstructured</code> maps (<code>map[string]any</code>).', 'Tools like ArgoCD, Kyverno, and garbage collectors rely on Dynamic Clients because they manage unknown CRDs!'],
        tip: 'Use Typed clients for known CRDs/core types; reach for Dynamic clients only when building generic cluster-wide platform tools.',
        metrics: [['TYPED', 'Compile-Safe ✓', 'green'], ['DYNAMIC', 'Any GVR Live', 'purple'], ['DECODING', 'Protobuf / JSON'], ['USE CASE', 'App vs Platform']],
        trace: { title: 'CLIENT COMPARISON', rows: [['Typed', 'deploy.Spec.Replicas'], ['Dynamic', 'unstructured.NestedInt64'], ['Runtime CRD', 'Dynamic needs 0 codegen']], banner: ['CHOOSE TYPED OR DYNAMIC ✓', 'purple'] },
        zones: [Z(65, 42, 325, 265, 'TYPED CLIENTSET (APP OPS)', '#1E7E45'), Z(425, 42, 330, 265, 'DYNAMIC CLIENT (GENERIC)', '#6E47B8')],
        nodes: [
          N('ty', 228, 175, 'cube', 'mint', 'Typed Client', '*appsv1.Deployment', ['compile-safe', 'green'], 'Fast, strongly-typed Go structs.'),
          N('dy', 590, 175, 'hex', 'lavender', 'Dynamic Client', 'Unstructured Map', ['any GVR', 'purple'], 'Handles arbitrary CRDs discovered at runtime.')
        ],
        edges: []
      },
      {
        short: 'Wire Informer', cat: 'GO CODE',
        title: 'Wiring SharedInformerFactory + EventHandlers + WorkQueue',
        body: ['To build a raw <code>client-go</code> controller, you create a <code>SharedInformerFactory</code>, register <code>AddFunc/UpdateFunc/DeleteFunc</code> callbacks pushing keys into a <code>workqueue.RateLimitingInterface</code>, start the factory, and wait for <code>cache.WaitForCacheSync</code>!'],
        code: { title: 'Go — Wire Informer & Sync', lang: 'go', body: `informer.AddEventHandler(cache.ResourceEventHandlerFuncs{\n    AddFunc:    func(obj any) { c.enqueue(obj) },\n    UpdateFunc: func(_, newObj any) { c.enqueue(newObj) },\n})\nfactory.Start(ctx.Done())\ncache.WaitForCacheSync(ctx.Done(), informer.HasSynced)` },
        tip: 'Always block on `WaitForCacheSync` before starting workers—otherwise early Reconciles read an empty cache and accidentally recreate existing objects!',
        metrics: [['CACHE SYNC', 'WaitForSync ✓', 'green'], ['HANDLERS', 'Add / Upd / Del'], ['WORKERS', 'Blocked Until Sync'], ['BOILERPLATE', '~180 Lines Go', 'warn']],
        trace: { title: 'INFORMER WIRING', rows: [['factory.Start', 'opens Watch streams'], ['WaitForSync', 'cache populated ✓'], ['handlers', 'enqueue -> WorkQueue']], banner: ['CACHE WARM · READY FOR WORKERS ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'RAW CLIENT-GO WIRING', '#4A7BC7')],
        nodes: [
          N('fac', 175, 175, 'cyl', 'sky', 'InformerFactory', 'Start(ctx)', ['syncing', 'purple'], 'Starts Reflectors and warms local caches.'),
          N('eh', 415, 175, 'cube', 'lavender', 'EventHandlers', 'key -> queue', ['watching', 'purple'], 'Converts object pointers into namespace/name keys.'),
          N('wq', 650, 175, 'stack', 'yellow', 'WorkQueue', 'ready for pop', null, 'Holds deduplicated keys for workers.')
        ],
        edges: [E('fac', 'eh', 'watch'), E('eh', 'wq', 'act')]
      },
      {
        short: 'Worker Loop', cat: 'GO CODE',
        title: 'Worker Goroutines & Graceful Shutdown via context.Context',
        body: ['You spawn N worker goroutines calling <code>queue.Get()</code> -> <code>syncHandler(key)</code> -> <code>queue.Done(key)</code>.', 'When Kubernetes sends <code>SIGTERM</code>, cancelling <code>ctx</code> triggers <code>queue.ShutDown()</code> so in-flight reconciles finish cleanly before the Pod exits!'],
        tip: 'Raw `client-go` teaches you every gear under the hood—and shows why `controller-runtime` & Kubebuilder save hundreds of lines of repetitive plumbing.',
        metrics: [['WORKERS', 'N Goroutines'], ['SHUTDOWN', 'Graceful SIGTERM', 'green'], ['IN-FLIGHT', 'Drained Cleanly ✓', 'green'], ['NEXT STEP', 'controller-runtime']],
        trace: { title: 'WORKER LIFECYCLE', rows: [['goroutine #1..4', 'pop -> syncHandler()'], ['SIGTERM', 'ctx.Done() -> ShutDown'], ['exit code', '0 (clean drain) ✓']], banner: ['GRACEFUL WORKER LOOP ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'CONCURRENT WORKER POOL', '#1E7E45')],
        nodes: [
          N('wq', 180, 175, 'stack', 'yellow', 'WorkQueue', 'Get() / Done()', null, 'Dispatches one key per goroutine.'),
          N('wk', 420, 175, 'cube', 'mint', 'Worker Pool', '4 Goroutines', ['reconciling', 'green'], 'Executes idempotent syncHandler(key).'),
          N('ctx', 650, 175, 'shield', 'sky', 'ctx.Done()', 'SIGTERM drain', ['graceful', 'purple'], 'Ensures zero half-finished reconciles on exit.')
        ],
        edges: [E('wq', 'wk', 'act', { count: 3 }), E('ctx', 'wk', 'watch')]
      }
    ]
  },

  'controller-runtime-internals': {
    id: 'controller-runtime-internals', moduleId: 'm11', certs: ['OPERATOR', 'CNPE'],
    title: 'controller-runtime Internals',
    subtitle: 'The engine powering Kubebuilder & Operator SDK: Manager, Split Client (cached reads + direct writes), Predicates, and Reconcile().',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Share Cache, Scheme & Leader Election via ctrl.Manager',
      'Understand Split Client: Cached Reads vs Direct Writes',
      'Filter noisy Watch events early with Predicates',
      'Control exact requeue timing with Reconcile return values'
    ],
    steps: [
      {
        short: 'Manager Hub', cat: 'GO CODE',
        title: 'ctrl.Manager Orchestrates Cache, Scheme, Webhooks & Healthz',
        body: ['<strong>ctrl.Manager</strong> is the central runtime container in your Operator Pod. It owns ONE shared Informer Cache, ONE <code>runtime.Scheme</code> (mapping Go structs <-> GVKs), Leader Election, Prometheus <code>/metrics</code>, and <code>/healthz</code> probes.', 'Multiple Reconcilers register with the same Manager cleanly.'],
        tip: 'Never forget to register your CRD types with `scheme` in `init()`—otherwise `client.Get()` fails with `no kind is registered for the type`!',
        metrics: [['MANAGER', '1 Shared Core', 'green'], ['PROBES', '/healthz + /readyz'], ['METRICS', ':8080 /metrics'], ['BOILERPLATE', '-80% Go Code ✓', 'green']],
        trace: { title: 'MANAGER STARTUP', rows: [['Scheme', 'core + apps + db.acme.io'], ['Cache', 'shared Informers started'], ['Reconcilers', '2 controllers registered ✓']], banner: ['CONTROLLER-RUNTIME READY ✓', 'green'] },
        zones: [Z(75, 36, 675, 278, 'OPERATOR POD · CTRL.MANAGER', '#4A7BC7')],
        nodes: [
          N('mg', 215, 175, 'cube', 'sky', 'ctrl.Manager', 'Scheme + Probes', ['running', 'green'], 'Coordinates lifecycle of caches, controllers, and webhooks.'),
          N('ch', 455, 108, 'cyl', 'lavender', 'Shared Cache', 'Informers', ['cached', 'purple'], 'Single Informer cache shared across all controllers.'),
          N('rc', 455, 245, 'cube', 'mint', 'Reconcilers', 'Ctrl A + Ctrl B', ['watching', 'green'], 'Your business logic implementing Reconcile().'),
          N('wh', 665, 175, 'shield', 'yellow', 'Webhook Svr', ':9443 TLS', null, 'Optional admission & conversion server.')
        ],
        edges: [E('mg', 'ch', 'watch'), E('mg', 'rc', 'act'), E('mg', 'wh', 'ok')]
      },
      {
        short: 'Split Client', cat: 'PATTERN',
        title: 'The Split Client: Fast Cached Reads, Direct API Writes',
        body: ['The magic (and #1 gotcha!) of <code>controller-runtime</code> is its <strong>Split Client</strong>:', 'All <code>Get()</code> and <code>List()</code> calls read locally from the <strong>Informer Cache</strong> (0 API load), while <code>Create()</code>, <code>Update()</code>, <code>Patch()</code>, and <code>Delete()</code> go directly to <strong>kube-apiserver</strong>!'],
        tip: 'GOTCHA: Right after calling `r.Create(ctx, pod)`, an immediate `r.Get()` in the same Reconcile may return NotFound for a few milliseconds until the Watch event updates local cache!',
        metrics: [['GET / LIST', 'Local RAM Cache', 'green'], ['CREATE / PATCH', 'Direct API Server', 'warn'], ['CACHE LAG', '~2-10 ms Watch'], ['API SAVINGS', '95%+ QPS ✓', 'green']],
        trace: { title: 'SPLIT CLIENT ROUTING', rows: [['r.Get(WebApp)', '-> Local Cache (0.01ms) ✓'], ['r.Patch(Deploy)', '-> API Server (5ms) ✓'], ['Watch echo', 'updates Cache async']], banner: ['CACHED READS · DIRECT WRITES ✓', 'purple'] },
        zones: [Z(285, 36, 480, 278, 'SPLIT CLIENT ARCHITECTURE', '#6E47B8')],
        nodes: [
          N('rc', 145, 175, 'cube', 'yellow', 'Reconciler', 'r.Get / r.Patch', ['reconciling', 'warn'], 'Calls unified client.Client interface.'),
          N('ch', 445, 108, 'cyl', 'mint', 'Local Cache', 'Get() & List()', ['0 API QPS', 'green'], 'Serves reads instantaneously from RAM.'),
          N('api', 665, 175, 'cube', 'sky', 'API Server', 'Create/Patch', ['direct write', 'purple'], 'Persists mutations to etcd and streams Watch back.'),
          N('sc', 445, 248, 'cube', 'lavender', 'Direct Writer', 'bypass cache', null, 'Routes all write verbs directly over HTTPS.')
        ],
        edges: [E('rc', 'ch', 'ok'), E('rc', 'sc', 'act'), E('sc', 'api', 'act'), E('api', 'ch', 'watch')]
      },
      {
        short: 'Predicates', cat: 'GO CODE',
        title: 'Predicates Filter Noisy Watch Events Before WorkQueue',
        body: ['By default, ANY update—including your own <code>/status</code> update or periodic relist—enqueues a reconcile!', 'Attaching <code>predicate.GenerationChangedPredicate{}</code> drops status-only updates BEFORE they ever enter WorkQueue, stopping reconcile storms cold!'],
        code: { title: 'Go — GenerationChangedPredicate', lang: 'go', body: `ctrl.NewControllerManagedBy(mgr).\n    For(&v1alpha1.WebApp{}, builder.WithPredicates(\n        predicate.GenerationChangedPredicate{},\n    )).\n    Owns(&appsv1.Deployment{}).\n    Complete(r)` },
        tip: 'Beware: `GenerationChangedPredicate` also filters annotation/label-only edits! Use `predicate.Or(GenerationChangedPredicate{}, AnnotationChangedPredicate{})` if you watch annotations.',
        metrics: [['STATUS NOISE', '100% Dropped ✓', 'green'], ['SPEC EDITS', 'Passed -> Queue', 'green'], ['RECONCILE STORM', 'Prevented ✓', 'green'], ['CPU SAVED', '-90% Load', 'green']],
        trace: { title: 'PREDICATE FILTER', rows: [['status update', 'gen unchanged -> DROP ✕'], ['spec edit', 'gen 4->5 -> ENQUEUE ✓'], ['WorkQueue', 'clean signal only']], banner: ['STATUS STORM FILTERED OUT ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'PREDICATE GATE BEFORE WORKQUEUE', '#1E7E45')],
        nodes: [
          N('st', 145, 108, 'stack', 'coral', 'Status Edit', 'gen: 5 -> 5', ['dropped', 'red'], 'Filtered out immediately by Predicate.'),
          N('sp', 145, 245, 'stack', 'mint', 'Spec Edit', 'gen: 5 -> 6', ['passed', 'green'], 'Enqueued cleanly for reconciliation.'),
          N('pr', 440, 175, 'shield', 'lavender', 'Predicate', 'GenChanged', ['filtering', 'purple'], 'Evaluates old vs new object before WorkQueue.'),
          N('wq', 670, 175, 'stack', 'mint', 'WorkQueue', 'spec edits only', null, 'Receives only meaningful changes.')
        ],
        edges: [E('st', 'pr', 'err', { stop: 0.78 }), E('sp', 'pr', 'ok'), E('pr', 'wq', 'act')]
      },
      {
        short: 'Return Matrix', cat: 'GO CODE',
        title: 'Controlling Requeue Behavior With (ctrl.Result, error)',
        body: ['Your <code>Reconcile()</code> return tuple controls WorkQueue scheduling with precision:', '<code>Result{}, nil</code> = done; <code>Result{}, err</code> = exponential backoff retry; <code>Result{RequeueAfter: 30*time.Second}, nil</code> = scheduled poll (great for waiting on external cloud provisioning!).'],
        tip: 'Never sleep (`time.Sleep`) inside `Reconcile()`—it blocks your worker goroutine! Always return `Result{RequeueAfter: ...}, nil` instead.',
        metrics: [['RESULT{}, NIL', 'Done (Idle)', 'green'], ['NON-NIL ERR', 'Exp. Backoff', 'red'], ['REQUEUEAFTER', 'Timed Poll', 'warn'], ['TIME.SLEEP', 'Anti-Pattern ✕', 'red']],
        trace: { title: 'RECONCILE RETURN', rows: [['err != nil', 'backoff 5ms->10ms->20ms'], ['RequeueAfter: 30s', 'timer -> WorkQueue'], ['Result{}, nil', 'Forget(key) & idle ✓']], banner: ['CLEAN NON-BLOCKING SCHEDULING ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'RECONCILE() RETURN DISPATCH', '#A8640C')],
        nodes: [
          N('rc', 180, 175, 'cube', 'yellow', 'Reconcile()', 'returns (Res, err)', null, 'Decides exact next step without blocking workers.'),
          N('ok', 580, 88, 'shield', 'mint', 'Result{}, nil', 'Forget & Idle', ['done', 'green'], 'Success—no requeue needed.'),
          N('tm', 580, 178, 'cube', 'yellow', 'RequeueAfter', '30s timer', ['timed', 'warn'], 'Polls external AWS/DB state cleanly.'),
          N('er', 580, 268, 'stack', 'coral', 'return err', 'Exp. Backoff', ['retry', 'red'], 'Retries transient failure safely.')
        ],
        edges: [E('rc', 'ok', 'ok'), E('rc', 'tm', 'act'), E('rc', 'er', 'err')]
      }
    ]
  },

  'kubebuilder-scaffolding': {
    id: 'kubebuilder-scaffolding', moduleId: 'm15', certs: ['OPERATOR', 'CNPE'],
    title: 'Scaffolding & Codegen',
    subtitle: 'Go from zero to a production Go operator skeleton using kubebuilder CLI, +kubebuilder markers, controller-gen, and Makefile targets.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Scaffold project & API with kubebuilder init / create api',
      'Declare RBAC, validation & printColumns via Go markers',
      'Generate CRD YAML & DeepCopy code via controller-gen',
      'Iterate rapidly using make manifests, install & run'
    ],
    steps: [
      {
        short: 'init & create api', cat: 'KUBEBUILDER',
        title: 'Scaffolding a Go Operator in Two CLI Commands',
        body: ['<code>kubebuilder init --domain acme.io</code> creates the Go module, <code>cmd/main.go</code> Manager, Dockerfile, and Kustomize deployment manifests.', '<code>kubebuilder create api --group apps --version v1alpha1 --kind WebApp</code> generates <code>api/v1alpha1/webapp_types.go</code> and <code>internal/controller/webapp_controller.go</code>!'],
        code: { title: 'CLI — Scaffold Operator', lang: 'bash', body: `kubebuilder init --domain acme.io --repo github.com/acme/webapp-op\nkubebuilder create api --group apps --version v1alpha1 --kind WebApp \\\n  --resource --controller` },
        tip: 'Never hand-write 400 lines of CRD OpenAPI YAML! Edit the Go structs in `*_types.go` and let Kubebuilder generate the exact YAML.',
        metrics: [['INIT TIME', '< 5 sec ✓', 'green'], ['API TYPES', 'webapp_types.go'], ['CONTROLLER', 'webapp_ctrl.go'], ['DEPLOY', 'config/ Kustomize']],
        trace: { title: 'KUBEBUILDER SCAFFOLD', rows: [['cmd/main.go', 'Manager + probes ✓'], ['api/v1alpha1/', 'WebApp Go structs ✓'], ['internal/ctrl/', 'Reconcile skeleton ✓']], banner: ['OPERATOR REPO SCAFFOLDED ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'GENERATED GO PROJECT TREE', '#1E7E45')],
        nodes: [
          N('kb', 145, 175, 'cube', 'mint', 'kubebuilder', 'init + create api', ['CLI', 'green'], 'Standard Kubernetes SIG-API-Machinery SDK.'),
          N('ty', 435, 108, 'stack', 'lavender', 'api/v1alpha1/', 'WebAppSpec/Status', null, 'Go struct definitions + kubebuilder markers.'),
          N('ct', 435, 245, 'cube', 'yellow', 'controller/', 'Reconcile() stub', null, 'Reconciler + envtest test suite.'),
          N('mn', 665, 175, 'cube', 'sky', 'cmd/main.go', 'ctrl.Manager', ['ready', 'purple'], 'Wires scheme, metrics, probes & leader election.')
        ],
        edges: [E('kb', 'ty', 'act'), E('kb', 'ct', 'act'), E('ty', 'mn', 'ok'), E('ct', 'mn', 'ok')]
      },
      {
        short: 'Go Markers', cat: 'KUBEBUILDER',
        title: '+kubebuilder Comment Markers Drive YAML & RBAC',
        body: ['Special Go comments (<code>// +kubebuilder:...</code>) directly above your structs and Reconcile method act as single-source-of-truth annotations.', 'They declare OpenAPI validation bounds, CEL rules, <code>/status</code> subresources, printer columns, and exact least-privilege RBAC ClusterRoles!'],
        code: { title: 'Go — Essential Markers', lang: 'go', body: `// +kubebuilder:subresource:status\n// +kubebuilder:printcolumn:name="Ready",type=integer,JSONPath=".status.ready"\n// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update\ntype WebAppSpec struct {\n    // +kubebuilder:validation:Minimum=1\n    Replicas int32 \`json:"replicas"\`\n}` },
        tip: 'Keep `+kubebuilder:rbac` comments right above `Reconcile()` so code reviewers immediately spot any new permission an operator requests!',
        metrics: [['MARKERS', 'Single Source ✓', 'green'], ['RBAC SYNC', 'Auto-Generated', 'green'], ['VALIDATION', 'Compile -> YAML'], ['DRIFT RISK', 'Zero ✓', 'green']],
        trace: { title: 'MARKER EXTRACTION', rows: [[':validation:Min=1', '-> CRD OpenAPI v3'], [':subresource:status', '-> CRD /status'], [':rbac:deployments', '-> config/rbac/role.yaml']], banner: ['GO CODE DRIVES ALL MANIFESTS ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'GO MARKER ANNOTATIONS', '#6E47B8')],
        nodes: [
          N('go', 180, 175, 'cube', 'yellow', 'Go Structs', '+kubebuilder:...', ['annotated', 'warn'], 'Types + markers live side-by-side in Go.'),
          N('mk', 435, 175, 'shield', 'lavender', 'Marker Parser', 'AST inspection', ['parsing', 'purple'], 'Reads Go AST comments deterministically.'),
          N('out', 660, 175, 'hex', 'mint', 'CRD + RBAC', 'Zero hand-YAML', ['synced', 'green'], 'Always 100% consistent with Go types.')
        ],
        edges: [E('go', 'mk', 'act'), E('mk', 'out', 'ok')]
      },
      {
        short: 'controller-gen', cat: 'KUBEBUILDER',
        title: 'controller-gen: Generating DeepCopy, CRDs & RBAC YAML',
        body: ['Running <code>make generate</code> invokes <strong>controller-gen</strong> to write <code>zz_generated.deepcopy.go</code> (implementing <code>runtime.Object</code> safely).', 'Running <code>make manifests</code> outputs production CRD YAML, RBAC ClusterRoles, and Webhook configs into <code>config/</code>!'],
        tip: 'Add a CI check running `make manifests generate && git diff --exit-code` so PRs never merge with stale CRD YAML!',
        metrics: [['MAKE GENERATE', 'zz_deepcopy.go'], ['MAKE MANIFESTS', 'CRDs + RBAC', 'green'], ['CI GUARD', 'git diff check'], ['TOOL', 'controller-gen']],
        trace: { title: 'CONTROLLER-GEN', rows: [['make generate', 'zz_generated.deepcopy.go ✓'], ['make manifests', 'config/crd/bases/*.yaml ✓'], ['config/rbac', 'role.yaml updated ✓']], banner: ['CODEGEN & MANIFESTS FRESH ✓', 'green'] },
        zones: [Z(285, 36, 480, 278, 'CONTROLLER-GEN OUTPUTS', '#1E7E45')],
        nodes: [
          N('cg', 145, 175, 'cube', 'mint', 'controller-gen', 'make manifests', ['generating', 'green'], 'Parses Go packages and emits artifacts.'),
          N('dc', 440, 105, 'stack', 'yellow', 'zz_deepcopy.go', 'runtime.Object', null, 'Safe deep-copy helpers for Informer cache.'),
          N('cr', 440, 248, 'hex', 'lavender', 'config/crd/', 'OpenAPI v3 YAML', ['valid', 'purple'], 'Ready-to-apply CustomResourceDefinition.'),
          N('rb', 670, 175, 'shield', 'sky', 'config/rbac/', 'ClusterRole', ['scoped', 'purple'], 'Least-privilege RBAC for your operator SA.')
        ],
        edges: [E('cg', 'dc', 'act'), E('cg', 'cr', 'act'), E('cg', 'rb', 'ok')]
      },
      {
        short: 'Dev Inner Loop', cat: 'KUBEBUILDER',
        title: 'Fast Local Inner Loop: make install && make run',
        body: ['You don’t need to build Docker images on every line change! Run <code>make install</code> to register CRDs into a local Kind cluster, then <code>make run</code> to execute your Go controller right on your laptop with instant breakpoints and logs!', 'When ready for staging/prod, run <code>make docker-build docker-push deploy</code>.'],
        tip: 'Pair `make run` with `kind create cluster` for sub-2-second Go edit-compile-reconcile cycles!',
        metrics: [['LOCAL LOOP', 'make run (~2s)', 'green'], ['CLUSTER', 'Kind / k3d'], ['DEBUGGER', 'Delve Breakpoints'], ['PROD DEPLOY', 'make deploy']],
        trace: { title: 'DEV INNER LOOP', rows: [['make install', 'CRDs applied to Kind ✓'], ['make run', 'go run cmd/main.go ✓'], ['kubectl apply', 'live breakpoint hit!']], banner: ['2-SECOND OPERATOR DEV LOOP ✓', 'green'] },
        zones: [Z(65, 42, 300, 265, 'LAPTOP (MAKE RUN)', '#A8640C'), Z(410, 42, 345, 265, 'KIND CLUSTER', '#4A7BC7')],
        nodes: [
          N('lp', 215, 175, 'cube', 'yellow', 'go run main.go', 'local IDE debug', ['reconciling', 'warn'], 'Connects via ~/.kube/config directly to Kind.'),
          N('api', 505, 175, 'cube', 'sky', 'Kind API Svr', 'CRDs installed', null, 'Streams Watch events to your local process.'),
          N('pd', 680, 175, 'stack', 'mint', 'Child Pods', 'created live', ['synced', 'green'], 'Managed cleanly in Kind.')
        ],
        edges: [E('api', 'lp', 'watch', { off: -8 }), E('lp', 'api', 'act', { off: 8 }), E('api', 'pd', 'ok')]
      }
    ]
  },

  'reconciler-ownerrefs': {
    id: 'reconciler-ownerrefs', moduleId: 'm15', certs: ['OPERATOR', 'CNPE', 'CKA'],
    title: 'Reconciler & OwnerRefs',
    subtitle: 'Managing child resources idiomatically with CreateOrUpdate, SetControllerReference, .Owns() watches, and cascading Garbage Collection.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Mutate child objects idempotently with CreateOrUpdate',
      'Stamp ownerReferences via SetControllerReference',
      'Auto-heal drifted child objects via .Owns() watches',
      'Trigger zero-code cascading cleanup via K8s GC'
    ],
    steps: [
      {
        short: 'CreateOrUpdate', cat: 'GO CODE',
        title: 'controllerutil.CreateOrUpdate: Clean Idempotent Child Sync',
        body: ['Instead of writing verbose <code>if NotFound { Create } else if diff { Update }</code> blocks, use <code>controllerutil.CreateOrUpdate(ctx, r.Client, deploy, mutateFn)</code>.', 'It fetches the existing child, runs your mutate callback in memory, and sends an API write ONLY if something actually changed!'],
        code: { title: 'Go — CreateOrUpdate Pattern', lang: 'go', body: `deploy := &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: app.Name, Namespace: app.Namespace}}\n_, err := controllerutil.CreateOrUpdate(ctx, r.Client, deploy, func() error {\n    deploy.Spec.Replicas = &app.Spec.Replicas\n    return controllerutil.SetControllerReference(&app, deploy, r.Scheme)\n})` },
        tip: 'Never overwrite the entire `deploy.Spec` blindly inside `mutateFn`—mutate only the fields your operator owns so Kubernetes defaults (like ClusterIP or ServiceAccount) stay intact!',
        metrics: [['WRITE OPS', 'Only On Diff ✓', 'green'], ['BOILERPLATE', 'Minimal Go'], ['PATCH SAFETY', 'Preserves Defaults'], ['STATE', 'Idempotent ✓', 'green']],
        trace: { title: 'CREATEORUPDATE', rows: [['1. Fetch', 'deploy/shop (cache)'], ['2. Mutate', 'replicas=3, image=v2'], ['3. Result', 'OperationResultUpdated ✓']], banner: ['CLEAN IDEMPOTENT CHILD SYNC ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'IDEMPOTENT CHILD RECONCILIATION', '#1E7E45')],
        nodes: [
          N('rc', 180, 175, 'cube', 'yellow', 'Reconciler', 'CreateOrUpdate()', ['reconciling', 'warn'], 'Runs mutateFn to assert desired child fields.'),
          N('api', 420, 175, 'cube', 'sky', 'API Server', 'diff check', null, 'Writes only when actual fields differ from desired.'),
          N('dp', 645, 175, 'stack', 'mint', 'Deployment', 'v2 · 3 replicas', ['synced', 'green'], 'Managed child resource.')
        ],
        edges: [E('rc', 'api', 'act'), E('api', 'dp', 'ok')]
      },
      {
        short: 'OwnerReferences', cat: 'PATTERN',
        title: 'SetControllerReference Stamps Parent-Child Ownership',
        body: ['Calling <code>controllerutil.SetControllerReference(&amp;app, deploy, r.Scheme)</code> injects an <code>ownerReferences</code> entry containing the parent CR’s <code>UID</code> and <code>controller: true</code> into the child Deployment’s metadata.', 'This single link unlocks BOTH automatic drift healing and cascading Garbage Collection!'],
        tip: 'Every resource can have at most ONE `controller: true` ownerReference—preventing two different operators from fighting over the same Deployment.',
        metrics: [['OWNER UID', 'CR.metadata.uid'], ['CONTROLLER', 'true (Unique ✓)', 'green'], ['BLOCK DELETE', 'true'], ['UNLOCKS', '.Owns() + GC']],
        trace: { title: 'OWNERREFERENCE METADATA', rows: [['kind / name', 'WebApp / shop'], ['uid', '7f9e-41c2-...'], ['controller', 'true ✓']], banner: ['PARENT-CHILD LINK STAMPED ✓', 'purple'] },
        zones: [Z(105, 42, 610, 265, 'OWNERSHIP GRAPH IN ETCD', '#6E47B8')],
        nodes: [
          N('cr', 235, 175, 'hex', 'lavender', 'WebApp: shop', 'UID: 7f9e', ['parent', 'purple'], 'Top-level Custom Resource.'),
          N('dp', 575, 112, 'stack', 'mint', 'Deployment', 'owner: 7f9e', ['owned ✓', 'green'], 'Carries controller ownerReference to WebApp.'),
          N('sv', 575, 245, 'cube', 'sky', 'Service', 'owner: 7f9e', ['owned ✓', 'green'], 'Also owned by WebApp for unified lifecycle.')
        ],
        edges: [E('cr', 'dp', 'watch'), E('cr', 'sv', 'watch')]
      },
      {
        short: '.Owns() Healing', cat: 'KUBEBUILDER',
        title: '.Owns() Watches Child Drift & Re-Enqueues the Parent CR',
        body: ['Adding <code>.Owns(&amp;appsv1.Deployment{})</code> in <code>SetupWithManager</code> tells controller-runtime: "Watch all Deployments; if one is manually scaled or deleted, look up its <code>ownerReference</code> and enqueue its parent <code>WebApp</code>!"', 'Your Reconciler wakes up automatically and heals the child Deployment back to spec!'],
        tip: 'Need to watch an UNOWNED resource (like a shared ConfigMap)? Use `.Watches(&corev1.ConfigMap{}, handler.EnqueueRequestsFromMapFunc(...))`!',
        metrics: [['MANUAL DRIFT', 'kubectl delete dp', 'red'], ['.OWNS() WATCH', 'Enqueues Parent', 'purple'], ['AUTO-HEAL', '< 2 sec ✓', 'green'], ['EXTRA CODE', '1 Line (.Owns)']],
        trace: { title: '.OWNS() SELF-HEAL', rows: [['event', 'DELETE deploy/shop (drift)'], ['ownerRef map', 'enqueue WebApp/shop'], ['Reconcile', 'recreated deploy/shop ✓']], banner: ['CHILD DRIFT SELF-HEALED ✓', 'green'] },
        zones: [Z(70, 38, 690, 275, 'AUTOMATIC CHILD DRIFT HEALING', '#1E7E45')],
        nodes: [
          N('dp', 175, 175, 'stack', 'coral', 'Drifted Deploy', 'deleted / scaled', ['error/drift', 'red'], 'Someone manually mutated the child Deployment.'),
          N('ow', 425, 110, 'shield', 'lavender', '.Owns() Mapper', 'reads ownerRef', ['watching', 'purple'], 'Translates child event into parent CR reconcile key.'),
          N('rc', 655, 175, 'cube', 'mint', 'Reconciler', 'heals child', ['reconciling', 'green'], 'Restores Deployment back to CR spec immediately.')
        ],
        edges: [E('dp', 'ow', 'watch'), E('ow', 'rc', 'watch'), E('rc', 'dp', 'act', { off: 26 })]
      },
      {
        short: 'Cascading GC', cat: 'PATTERN',
        title: 'Zero-Code Cleanup: Kubernetes Garbage Collector Cascades Delete',
        body: ['When a user runs <code>kubectl delete webapp shop</code>, your Operator does NOT need to manually delete owned Deployments or Services.', 'Kubernetes’ built-in <strong>Garbage Collector</strong> walks the <code>ownerReferences</code> tree and cleanly deletes every in-cluster child automatically!'],
        tip: 'OwnerReferences only clean up IN-CLUSTER Kubernetes objects. For external AWS RDS / S3 / DNS cleanup, you need Finalizers.',
        metrics: [['DELETE CODE', '0 Lines Needed ✓', 'green'], ['IN-CLUSTER', 'Auto-Cascaded', 'green'], ['ORPHANS', '0 Left Behind', 'green'], ['EXTERNAL CLOUD', 'Needs Finalizer']],
        trace: { title: 'GARBAGE COLLECTOR', rows: [['DELETE', 'WebApp/shop'], ['K8s GC', 'found 2 owned children'], ['cascade', 'Deploy + Service deleted ✓']], banner: ['IN-CLUSTER CLEANUP AUTOMATIC ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'KUBERNETES CASCADING GARBAGE COLLECTION', '#6E47B8')],
        nodes: [
          N('cr', 180, 175, 'hex', 'coral', 'DELETE WebApp', 'UID: 7f9e', ['deleting', 'red'], 'User deletes parent CR.'),
          N('gc', 425, 175, 'cube', 'lavender', 'K8s GC Ctrl', 'walks ownerRefs', ['cascading', 'purple'], 'Built-in kube-controller-manager garbage collector.'),
          N('ch', 650, 175, 'stack', 'gray', 'Deploy + Svc', 'deleted cleanly', ['0 orphans', 'green'], 'Removed automatically by K8s GC.', true)
        ],
        edges: [E('cr', 'gc', 'watch'), E('gc', 'ch', 'err')]
      }
    ]
  },

  'finalizers-cleanup': {
    id: 'finalizers-cleanup', moduleId: 'm15', certs: ['OPERATOR', 'CNPE'],
    title: 'Finalizers & External Cleanup',
    subtitle: 'Preventing orphaned AWS RDS databases, S3 buckets, and DNS records using Finalizer guards and DeletionTimestamp lifecycles.',
    duration: '9 min', difficulty: 'Advanced',
    checklist: [
      'Stamp a domain-qualified Finalizer on CR creation',
      'Intercept deletes via metadata.deletionTimestamp',
      'Tear down external cloud/DB resources idempotently',
      'Remove Finalizer cleanly so etcd finishes deletion'
    ],
    steps: [
      {
        short: 'Orphan Problem', cat: 'PATTERN',
        title: 'Why OwnerRefs Can’t Delete External Cloud Resources',
        body: ['Suppose your Operator provisions a real <strong>AWS RDS</strong> database when a CR is created. If a user deletes the CR without a Finalizer, etcd immediately deletes the CR—your Operator misses the delete or loses the DB ID, leaving an expensive <strong>orphaned cloud DB</strong> billing forever!'],
        tip: 'Any time an Operator mutates state outside Kubernetes (cloud APIs, DNS, Vault, SaaS), a Finalizer is mandatory.',
        metrics: [['CR IN ETCD', 'Gone Instantly', 'red'], ['AWS RDS', 'ORPHANED $$ ⚠', 'red'], ['K8S GC', 'Cannot Reach AWS'], ['FIX', 'Add Finalizer']],
        trace: { title: 'ORPHANED RESOURCE BUG', rows: [['kubectl delete', 'CR wiped from etcd'], ['Operator', 'no DB ID left to clean'], ['AWS bill', 'RDS running forever ⚠']], banner: ['EXTERNAL CLOUD DB ORPHANED ⚠', 'red'] },
        zones: [Z(65, 42, 315, 265, 'KUBERNETES CLUSTER', '#C93632'), Z(430, 42, 325, 265, 'EXTERNAL CLOUD (AWS)', '#A8640C')],
        nodes: [
          N('cr', 220, 175, 'hex', 'gray', 'Deleted CR', 'gone from etcd', ['deleted', 'red'], 'Removed immediately without Finalizer.', true),
          N('db', 595, 175, 'cloud', 'coral', 'AWS RDS DB', 'ORPHANED $$$', ['error/drift', 'red'], 'Still running in AWS with no Kubernetes owner!')
        ],
        edges: [E('cr', 'db', 'err', { stop: 0.62 })]
      },
      {
        short: 'Add Finalizer', cat: 'GO CODE',
        title: 'Step 1: Register Finalizer Before Provisioning External Infra',
        body: ['Before creating the AWS RDS instance, your Reconciler appends a domain-qualified string like <code>db.acme.io/finalizer</code> to <code>metadata.finalizers</code> and updates the CR.', 'From this moment on, Kubernetes guarantees etcd will NEVER drop the CR until your Operator removes that string!'],
        code: { title: 'Go — Register Finalizer', lang: 'go', body: `const fin = "db.acme.io/finalizer"\nif app.DeletionTimestamp.IsZero() && !controllerutil.ContainsFinalizer(&app, fin) {\n    controllerutil.AddFinalizer(&app, fin)\n    return ctrl.Result{}, r.Update(ctx, &app)\n}` },
        tip: 'Always register the Finalizer BEFORE calling the external cloud Create API so a crash mid-provision cannot leak an orphan.',
        metrics: [['FINALIZER', 'db.acme.io/fin', 'green'], ['ETCD LOCK', 'Protected ✓', 'green'], ['AWS RDS', 'Provisioned'], ['LEAK RISK', 'Zero ✓', 'green']],
        trace: { title: 'FINALIZER ARMED', rows: [['1. AddFinalizer', 'db.acme.io/finalizer ✓'], ['2. AWS API', 'CreateDBInstance() ✓'], ['status', 'RDS Ready (guarded)']], banner: ['FINALIZER GUARD ARMED ✓', 'green'] },
        zones: [Z(65, 38, 420, 275, 'KUBERNETES CLUSTER', '#1E7E45'), Z(515, 38, 250, 275, 'AWS CLOUD', '#4A7BC7')],
        nodes: [
          N('cr', 170, 175, 'shield', 'lavender', 'DB CR', 'finalizer locked', ['finalizer locked', 'purple'], 'Protected against sudden deletion in etcd.'),
          N('op', 375, 175, 'cube', 'mint', 'Operator', 'AddFinalizer()', ['reconciling', 'green'], 'Creates RDS only after finalizer persists.'),
          N('db', 640, 175, 'cloud', 'sky', 'AWS RDS', 'pg-prod-01', ['synced', 'green'], 'Tracked safely by CR status.')
        ],
        edges: [E('cr', 'op', 'watch'), E('op', 'db', 'act')]
      },
      {
        short: 'DeletionTimestamp', cat: 'PATTERN',
        title: 'Step 2: kubectl delete Sets DeletionTimestamp (Pauses Delete)',
        body: ['When a user runs <code>kubectl delete db shop-db</code>, API Server sees the non-empty <code>finalizers</code> list. Instead of erasing the object, it sets <code>metadata.deletionTimestamp = now</code> and keeps the CR in <strong>Terminating</strong> state.', 'This triggers a normal Watch Update event waking your Reconciler!'],
        tip: 'Notice that Finalizer cleanup happens on an UPDATE event (setting DeletionTimestamp), NOT a Delete event!',
        metrics: [['CR PHASE', 'Terminating', 'warn'], ['ETCD', 'Locked (Safe ✓)', 'green'], ['EVENT TYPE', 'Update -> Wake'], ['AWS TEARDOWN', 'In Progress', 'warn']],
        trace: { title: 'GRACEFUL TEARDOWN', rows: [['kubectl delete', 'sets deletionTimestamp'], ['Reconcile()', '!DeletionTimestamp.IsZero()'], ['AWS API', 'DeleteDBInstance(pg-01)']], banner: ['EXTERNAL DB TEARDOWN RUNNING', 'warn'] },
        zones: [Z(65, 38, 420, 275, 'TERMINATING (FINALIZER HELD)', '#A8640C'), Z(515, 38, 250, 275, 'AWS CLOUD', '#C93632')],
        nodes: [
          N('cr', 170, 175, 'shield', 'yellow', 'Terminating CR', 'delTS != nil', ['finalizer locked', 'warn'], 'Held safely in etcd until cleanup succeeds.'),
          N('op', 375, 175, 'cube', 'yellow', 'Operator', 'cleanupExternal()', ['reconciling', 'warn'], 'Calls AWS DeleteDBInstance idempotently.'),
          N('db', 640, 175, 'cloud', 'coral', 'AWS RDS', 'deleting...', ['tearing down', 'red'], 'External database shutting down cleanly.')
        ],
        edges: [E('cr', 'op', 'watch'), E('op', 'db', 'err')]
      },
      {
        short: 'Unlock & Delete', cat: 'GO CODE',
        title: 'Step 3: Remove Finalizer Once AWS Confirms Deletion',
        body: ['Once AWS confirms the DB is deleted (or returns <code>NotFound</code>—idempotency!), the Reconciler calls <code>controllerutil.RemoveFinalizer</code> and updates the CR.', 'Seeing an empty finalizers list with a non-zero <code>deletionTimestamp</code>, API Server immediately removes the CR from etcd—<strong>0 orphans</strong>!'],
        code: { title: 'Go — Cleanup & Unlock', lang: 'go', body: `if !app.DeletionTimestamp.IsZero() {\n    if err := r.deleteExternalDB(ctx, &app); err != nil {\n        return ctrl.Result{}, err // keep finalizer & retry!\n    }\n    controllerutil.RemoveFinalizer(&app, fin)\n    return ctrl.Result{}, r.Update(ctx, &app)\n}` },
        tip: 'If the Operator Pod is down while a CR has a Finalizer, the CR stays stuck in `Terminating`—fix the Operator first before ever manually stripping finalizers!',
        metrics: [['AWS RDS', 'Deleted ✓', 'green'], ['FINALIZER', 'Removed ✓', 'green'], ['CR IN ETCD', 'Removed ✓', 'green'], ['ORPHANS', '0 ($0 Waste)', 'green']],
        trace: { title: 'CLEAN TEARDOWN DONE', rows: [['AWS DeleteDB', '200 OK (gone) ✓'], ['RemoveFinalizer', 'finalizers: [] ✓'], ['etcd', 'CR deleted cleanly ✓']], banner: ['ZERO ORPHANS · CLEAN EXIT ✓', 'green'] },
        zones: [Z(65, 38, 420, 275, 'FINALIZER UNLOCKED', '#1E7E45'), Z(515, 38, 250, 275, 'AWS CLOUD', '#6E685E')],
        nodes: [
          N('op', 195, 175, 'cube', 'mint', 'Operator', 'RemoveFinalizer()', ['synced', 'green'], 'Unlocks CR only after external teardown completes.'),
          N('cr', 405, 175, 'hex', 'gray', 'CR Removed', 'etcd purged ✓', ['cleaned', 'green'], 'Cleanly garbage collected from etcd.', true),
          N('db', 640, 175, 'cloud', 'gray', 'AWS RDS', 'terminated ✓', ['0 orphans', 'green'], 'Zero lingering cloud spend.', true)
        ],
        edges: [E('op', 'cr', 'ok')]
      }
    ]
  },

  'webhooks-multiversion': {
    id: 'webhooks-multiversion', moduleId: 'm15', certs: ['OPERATOR', 'CNPE', 'CKS'],
    title: 'Webhooks & Multi-Version CRDs',
    subtitle: 'Enforcing invariants at Admission with Mutating & Validating Webhooks, inline CEL rules, and lossless multi-version Conversion Webhooks.',
    duration: '10 min', difficulty: 'Advanced',
    checklist: [
      'Default CR fields via Mutating Admission Webhooks',
      'Reject invalid transitions with Validating Webhooks',
      'Replace simple webhooks with zero-hop inline CEL rules',
      'Evolve v1alpha1 -> v1 safely via Conversion Webhooks'
    ],
    steps: [
      {
        short: 'Mutating Hook', cat: 'PATTERN',
        title: 'Mutating Webhook: Dynamic Defaults & Immutability Prep',
        body: ['Generated via <code>kubebuilder create webhook --defaulting</code>, a <strong>Mutating Webhook</strong> intercepts CR creation over TLS (<code>:9443</code>) and computes dynamic defaults (like assigning default storage classes or backup windows) before validation runs.'],
        tip: 'Use cert-manager to automate Webhook TLS certificate rotation—expired webhook certs will block every CR write in your cluster!',
        metrics: [['ENDPOINT', ':9443 mTLS'], ['STAGE', 'Pre-Validation'], ['ACTION', 'JSON Patch ✓', 'green'], ['CERT MGMT', 'cert-manager']],
        trace: { title: 'MUTATING WEBHOOK', rows: [['CR input', 'storageClass: ""'], ['Default()', 'injects "gp3-enc" ✓'], ['next stage', 'Validating Webhook']], banner: ['DYNAMIC DEFAULTS INJECTED ✓', 'green'] },
        zones: [Z(265, 36, 500, 278, 'ADMISSION WEBHOOK PIPELINE', '#A8640C')],
        nodes: [
          N('cr', 140, 175, 'stack', 'sky', 'New CR', 'minimal YAML', null, 'User omits optional operational defaults.'),
          N('api', 385, 175, 'cube', 'sky', 'API Server', 'AdmissionReview', null, 'Calls operator webhook server over TLS.'),
          N('mw', 565, 105, 'shield', 'yellow', 'Mutating Hook', 'Default()', ['mutated', 'warn'], 'Patches sensible defaults cleanly.'),
          N('et', 675, 245, 'cyl', 'mint', 'Next: Validate', 'patched CR', null, 'Validated object moves forward.')
        ],
        edges: [E('cr', 'api', 'act'), E('api', 'mw', 'act', { off: -6 }), E('mw', 'api', 'ok', { off: 6 }), E('api', 'et', 'ok')]
      },
      {
        short: 'Validating Hook', cat: 'GO CODE',
        title: 'Validating Webhook: Cross-Object & Immutable Field Checks',
        body: ['A <strong>Validating Webhook</strong> implements <code>ValidateCreate</code>, <code>ValidateUpdate</code>, and <code>ValidateDelete</code> in Go.', 'Compare <code>oldObj</code> vs <code>newObj</code> to block dangerous updates like shrinking a database PVC or changing an immutable storage engine!'],
        code: { title: 'Go — ValidateUpdate Immutability', lang: 'go', body: `func (v *WebAppValidator) ValidateUpdate(ctx context.Context, oldObj, newObj runtime.Object) (admission.Warnings, error) {\n    if oldApp.Spec.Engine != newApp.Spec.Engine {\n        return nil, field.Forbidden(field.NewPath("spec", "engine"), "engine is immutable")\n    }\n    return nil, nil\n}` },
        tip: 'Always return structured `field.ErrorList` errors so `kubectl` highlights the exact YAML path that failed validation.',
        metrics: [['CHECK', 'oldObj vs newObj'], ['SHRINK DISK', '403 Blocked ✓', 'green'], ['WARNINGS', 'Soft Deprecations'], ['SAFETY', 'Pre-etcd ✓', 'green']],
        trace: { title: 'VALIDATING WEBHOOK', rows: [['old.engine', 'postgres-16'], ['new.engine', 'mysql-8 (FORBIDDEN)'], ['response', 'allowed: false (403)']], banner: ['UNSAFE UPDATE BLOCKED PRE-ETCD ✓', 'red'] },
        zones: [Z(265, 36, 500, 278, 'VALIDATING ADMISSION GUARD', '#C93632')],
        nodes: [
          N('up', 140, 175, 'stack', 'coral', 'Unsafe Patch', 'change engine', ['rejected', 'red'], 'Would corrupt live database if allowed.'),
          N('api', 385, 175, 'cube', 'sky', 'API Server', 'ValidateUpdate', null, 'Aborts write on webhook denial.'),
          N('vw', 575, 105, 'shield', 'coral', 'Validating Hook', 'allowed: false', ['blocked', 'red'], 'Rejects immutable field change cleanly.'),
          N('et', 675, 245, 'cyl', 'gray', 'etcd', 'untouched ✓', null, 'Protected from destructive mutation.', true)
        ],
        edges: [E('up', 'api', 'err'), E('api', 'vw', 'act', { off: -6 }), E('vw', 'api', 'err', { off: 6 })]
      },
      {
        short: 'Inline CEL Rules', cat: 'KUBEBUILDER',
        title: 'Zero-Webhook Validation: Inline CRD CEL Expressions',
        body: ['Modern Kubernetes supports <strong>CEL transition rules</strong> directly inside CRD OpenAPI schemas via <code>+kubebuilder:validation:XValidation</code>!', 'You can enforce immutability (<code>self == oldSelf</code>) and cross-field math right inside kube-apiserver with <strong>0.2ms latency, zero TLS certs, and zero webhook Pods</strong>!'],
        code: { title: 'Go — Inline CEL Immutability Marker', lang: 'go', body: `// +kubebuilder:validation:XValidation:rule="self == oldSelf",message="engine is immutable"\nEngine string \`json:"engine"\`\n// +kubebuilder:validation:XValidation:rule="self.tier != 'prod' || self.replicas >= 3"\nSpec WebAppSpec \`json:"spec"\`` },
        tip: 'Prefer inline CRD CEL rules for 90% of validations; reserve Go Validating Webhooks only when you need external lookups (e.g., querying another Secret or cloud API).',
        metrics: [['LATENCY', '0.2 ms In-Proc', 'green'], ['TLS CERTS', '0 Needed ✓', 'green'], ['TRANSITIONS', 'self == oldSelf', 'purple'], ['DEADLOCK RISK', 'Zero ✓', 'green']],
        trace: { title: 'IN-PROCESS CEL', rows: [['rule', 'self == oldSelf'], ['network hops', '0 (in kube-apiserver)'], ['result', 'evaluated in 0.2ms ✓']], banner: ['FAST ZERO-WEBHOOK VALIDATION ✓', 'green'] },
        zones: [Z(260, 42, 500, 265, 'IN-PROCESS CEL ENGINE', '#1E7E45')],
        nodes: [
          N('cr', 140, 175, 'stack', 'sky', 'CR Patch', 'tier: prod, rep: 3', null, 'Validated directly inside API Server.'),
          N('api', 415, 175, 'shield', 'mint', 'API + CEL', '0.2ms inline', ['CEL pass', 'green'], 'Zero external webhook network call.'),
          N('et', 665, 175, 'cyl', 'lavender', 'etcd', 'committed ✓', null, 'Fast, reliable persistence.')
        ],
        edges: [E('cr', 'api', 'ok'), E('api', 'et', 'watch')]
      },
      {
        short: 'Multi-Version Hub', cat: 'PATTERN',
        title: 'Multi-Version CRDs: Hub-and-Spoke Conversion Webhooks',
        body: ['When graduating <code>v1alpha1 -> v1beta1 -> v1</code>, mark ONE canonical version as <code>storage: true</code> (the <strong>Hub</strong>).', 'Older versions (<strong>Spokes</strong>) implement <code>ConvertTo(hub)</code> and <code>ConvertFrom(hub)</code> via a <strong>Conversion Webhook</strong> so legacy YAML keeps working seamlessly while etcd stores canonical <code>v1</code>!'],
        tip: 'Never drop an old version from a CRD until you have migrated all existing etcd objects to the new storage version (e.g., via Storage Version Migrator).',
        metrics: [['STORAGE HUB', 'v1 Canonical', 'green'], ['SPOKE SERVED', 'v1alpha1 -> v1', 'purple'], ['UPGRADE BREAK', '0% ✓', 'green'], ['CONVERSION', 'Lossless']],
        trace: { title: 'CONVERSION WEBHOOK', rows: [['client A', 'GET v1alpha1 -> converted'], ['client B', 'GET v1 -> direct'], ['etcd storage', 'always canonical v1 ✓']], banner: ['ZERO-BREAK API EVOLUTION ✓', 'green'] },
        zones: [Z(275, 38, 490, 275, 'HUB-AND-SPOKE CRD CONVERSION', '#6E47B8')],
        nodes: [
          N('v0', 140, 108, 'stack', 'yellow', 'v1alpha1 CLI', 'Spoke API', null, 'Legacy team manifests still applying v1alpha1.'),
          N('v1', 140, 245, 'stack', 'mint', 'v1 CLI', 'Hub API', null, 'Modern manifests using stable v1.'),
          N('cw', 435, 175, 'shield', 'lavender', 'Conversion Hook', 'Spoke <-> Hub', ['converting', 'purple'], 'Translates renamed or restructured fields losslessly.'),
          N('et', 670, 175, 'cyl', 'mint', 'etcd (v1)', 'storage: true', ['hub v1', 'green'], 'Single canonical version on disk.')
        ],
        edges: [E('v0', 'cw', 'act'), E('v1', 'cw', 'ok'), E('cw', 'et', 'watch')]
      }
    ]
  },

  'envtest-concurrency': {
    id: 'envtest-concurrency', moduleId: 'm15', certs: ['OPERATOR', 'CNPE'],
    title: 'envtest & Concurrency',
    subtitle: 'Testing against real apiserver + etcd with envtest, scaling throughput with MaxConcurrentReconciles, Field Indexes, and Server-Side Apply.',
    duration: '9 min', difficulty: 'Advanced',
    checklist: [
      'Run real apiserver + etcd integration tests with envtest',
      'Recognize what envtest lacks (no kubelet, no K8s GC)',
      'Speed up lookups & throughput with Field Indexes + Workers',
      'Eliminate 409 Conflicts with Server-Side Apply (SSA)'
    ],
    steps: [
      {
        short: 'envtest Suite', cat: 'GO CODE',
        title: 'envtest: Real kube-apiserver + etcd in ~2 Seconds Locally',
        body: ['Mocking the Kubernetes API misses real OpenAPI schemas, CEL rules, RBAC, and Watch semantics. <strong>envtest</strong> spins up real local <code>kube-apiserver</code> and <code>etcd</code> binaries inside <code>go test</code>—no Docker or Kind cluster required!'],
        code: { title: 'Go — envtest Bootstrap', lang: 'go', body: `testEnv := &envtest.Environment{\n    CRDDirectoryPaths: []string{filepath.Join("..", "config", "crd", "bases")},\n}\ncfg, err := testEnv.Start() // starts real etcd + kube-apiserver!\ndefer testEnv.Stop()` },
        tip: 'CRITICAL GOTCHA: envtest runs ONLY apiserver + etcd—there is NO kubelet, NO Scheduler, and NO Garbage Collector! Test OwnerRefs by asserting metadata, not waiting for GC deletion.',
        metrics: [['BOOT TIME', '~2.1 sec ✓', 'green'], ['REAL ETCD/API', 'Yes ✓', 'green'], ['KUBELET / GC', 'None (Gotcha!)', 'warn'], ['CI SPEED', '10x Faster']],
        trace: { title: 'GO TEST (ENVTEST)', rows: [['etcd + apiserver', 'started on 127.0.0.1 ✓'], ['CRD + Webhook', 'loaded from config/ ✓'], ['Eventually()', 'status Ready=True PASS']], banner: ['REAL API TESTS WITHOUT DOCKER ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'GO TEST PROCESS + ENVTEST BINARIES', '#4A7BC7')],
        nodes: [
          N('gt', 180, 175, 'cube', 'yellow', 'go test', 'Ginkgo/Testify', ['testing', 'warn'], 'Runs Reconciler & asserts cluster state via Eventually().'),
          N('api', 425, 175, 'cube', 'sky', 'envtest API', 'real apiserver', ['local :port', 'purple'], 'Enforces real OpenAPI schemas, CEL, and webhooks.'),
          N('et', 655, 175, 'cyl', 'lavender', 'envtest etcd', 'in-tempdir', ['ephemeral', 'purple'], 'Torn down cleanly at test end.')
        ],
        edges: [E('gt', 'api', 'act'), E('api', 'et', 'watch')]
      },
      {
        short: 'Concurrency', cat: 'OPS',
        title: 'Scaling Throughput With MaxConcurrentReconciles',
        body: ['By default, a controller-runtime Reconciler runs with <code>MaxConcurrentReconciles: 1</code> (single-threaded). If your operator talks to slow external cloud APIs across 500 CRs, set <code>MaxConcurrentReconciles: 8</code>!', 'WorkQueue still ensures two goroutines NEVER reconcile the exact same CR key concurrently.'],
        tip: 'Only increase `MaxConcurrentReconciles` after ensuring any shared in-memory maps inside your Reconciler struct are protected with a `sync.Mutex`!',
        metrics: [['WORKERS', '1 -> 8 Parallel', 'green'], ['SAME-KEY LOCK', 'Guaranteed ✓', 'green'], ['THROUGHPUT', '8x Faster ✓', 'green'], ['THREAD SAFETY', 'Mutex Shared State']],
        trace: { title: 'CONCURRENT WORKERS', rows: [['Worker 1..8', '8 distinct CR keys'], ['Same key race', 'impossible (WorkQueue)'], ['500 CRs sync', '8s instead of 64s ✓']], banner: ['SAFE PARALLEL RECONCILIATION ✓', 'green'] },
        zones: [Z(285, 36, 480, 278, 'PARALLEL WORKER POOL (N=8)', '#1E7E45')],
        nodes: [
          N('wq', 145, 175, 'stack', 'yellow', 'WorkQueue', '500 CR keys', ['dispatching', 'warn'], 'Hands distinct keys to idle worker goroutines.'),
          N('w1', 440, 105, 'cube', 'mint', 'Workers 1-4', 'db-1 .. db-4', ['reconciling', 'green'], 'Parallel safe execution.'),
          N('w2', 440, 248, 'cube', 'mint', 'Workers 5-8', 'db-5 .. db-8', ['reconciling', 'green'], 'No cross-key blocking.'),
          N('cl', 670, 175, 'cloud', 'sky', 'Cloud / API', 'high throughput', null, 'Handles concurrent provisioning cleanly.')
        ],
        edges: [E('wq', 'w1', 'act'), E('wq', 'w2', 'act'), E('w1', 'cl', 'ok'), E('w2', 'cl', 'ok')]
      },
      {
        short: 'Field Indexes', cat: 'GO CODE',
        title: 'O(1) Cache Lookups With mgr.GetFieldIndexer()',
        body: ['Need to find every CR referencing a changed <code>Secret</code>? Scanning all 5,000 CRs in a loop is O(N) CPU waste.', 'Register a <strong>Field Index</strong> on your Informer Cache (e.g. <code>.spec.secretRef</code>) and run <code>r.List(ctx, &amp;list, client.MatchingFields{...})</code> in instant O(1) RAM time!'],
        tip: 'Field Indexes also enable memory-efficient cache scoping (Cache.ByObject filters) so your operator never caches irrelevant Pods from other namespaces.',
        metrics: [['LOOKUP TIME', 'O(1) Hash ✓', 'green'], ['SCAN AVOIDED', '5,000 -> 2 CRs', 'green'], ['RAM INDEX', 'Local Informer'], ['API QPS', '0 req/s ✓', 'green']],
        trace: { title: 'FIELD INDEX QUERY', rows: [['Secret updated', 'tls-cert-01'], ['IndexField', '.spec.secretRef==tls-01'], ['matched CRs', '2 of 5,000 (0.02ms) ✓']], banner: ['O(1) INDEXED CACHE LOOKUP ✓', 'purple'] },
        zones: [Z(75, 42, 675, 265, 'INFORMER SECONDARY FIELD INDEX', '#6E47B8')],
        nodes: [
          N('sc', 180, 175, 'cyl', 'yellow', 'Secret Changed', 'tls-cert-01', ['watching', 'warn'], 'Triggering watch event on unowned Secret.'),
          N('ix', 425, 175, 'cyl', 'lavender', 'Field Index', 'O(1) map lookup', ['indexed', 'purple'], 'Instant reverse lookup from Secret -> CRs.'),
          N('wq', 650, 175, 'stack', 'mint', 'Enqueue 2 CRs', 'precise wake-up', ['synced', 'green'], 'Only affected CRs reconcile.')
        ],
        edges: [E('sc', 'ix', 'watch'), E('ix', 'wq', 'ok')]
      },
      {
        short: 'Server-Side Apply', cat: 'PATTERN',
        title: 'Server-Side Apply (SSA): Field Ownership & Zero 409 Races',
        body: ['With classic <code>Update()</code>, if HPA modifies <code>replicas</code> while your Operator updates <code>image</code>, one clobbers the other or hits <code>409 Conflict</code>!', '<strong>Server-Side Apply</strong> tracks <code>managedFields</code> per field manager—letting HPA own <code>replicas</code> while your Operator cleanly patches ONLY <code>image</code> with zero read-modify-write conflicts!'],
        tip: 'Always pass a distinct `client.FieldOwner("webapp-operator")` and apply minimal ApplyConfiguration structs containing ONLY the fields your controller owns.',
        metrics: [['409 CONFLICTS', 'Eliminated ✓', 'green'], ['FIELD OWNER', 'managedFields'], ['HPA CO-EXIST', 'Zero Clobber ✓', 'green'], ['ROUND TRIPS', '1 PATCH Only']],
        trace: { title: 'SERVER-SIDE APPLY', rows: [['HPA owns', '.spec.replicas (5)'], ['Operator owns', '.spec.template.image'], ['API merge', 'atomic field merge ✓']], banner: ['CONFLICT-FREE FIELD OWNERSHIP ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'MANAGEDFIELDS ATOMIC MERGE', '#1E7E45')],
        nodes: [
          N('op', 145, 108, 'cube', 'mint', 'Operator SSA', 'owns: image', ['PATCH SSA', 'green'], 'Sends only image field with FieldOwner.'),
          N('hp', 145, 245, 'cube', 'yellow', 'HPA SSA', 'owns: replicas', ['PATCH SSA', 'warn'], 'Sends only replicas field cleanly.'),
          N('api', 445, 175, 'shield', 'sky', 'API SSA Merge', 'managedFields', ['0 conflicts', 'green'], 'Merges disjoint fields atomically server-side.'),
          N('dp', 670, 175, 'stack', 'lavender', 'Deployment', 'v2 + 5 pods', ['synced', 'green'], 'Both intents preserved cleanly.')
        ],
        edges: [E('op', 'api', 'ok'), E('hp', 'api', 'act'), E('api', 'dp', 'ok')]
      }
    ]
  },

  'olm-classic-v0': {
    id: 'olm-classic-v0', moduleId: 'm16', certs: ['OPERATOR', 'CNPE'],
    title: 'OLM Classic (v0) Packaging',
    subtitle: 'How OLM v0 packages, discovers, and upgrades operators: Operator Bundles, CatalogSource, Subscription, CSV, and InstallPlan.',
    duration: '9 min', difficulty: 'Intermediate',
    checklist: [
      'Package CRDs, RBAC & Deployment into an OCI Bundle',
      'Serve version upgrade graphs via CatalogSource & FBC',
      'Track update channels with Subscriptions & InstallPlans',
      'Understand ClusterServiceVersion (CSV) & v0 limitations'
    ],
    steps: [
      {
        short: 'OCI Bundle', cat: 'OLM',
        title: 'Operator Bundle: Packaging CRDs, CSV & RBAC as an OCI Image',
        body: ['In <strong>OLM v0</strong>, an operator is packaged as a scratch OCI container image called an <strong>Operator Bundle</strong> containing its CRDs, metadata annotations, and a <strong>ClusterServiceVersion (CSV)</strong> describing the Deployment, RBAC, and owned GVKs.'],
        tip: 'Use `operator-sdk generate bundle` to build your OLM bundle directly from your Kubebuilder `config/` directory.',
        metrics: [['ARTIFACT', 'OCI Bundle Img'], ['MANIFESTS', 'CRD + CSV'], ['CATALOG', 'File-Based (FBC)'], ['MODEL', 'OLM Classic v0']],
        trace: { title: 'BUNDLE PACKAGING', rows: [['manifests/', 'CRDs + CSV YAML'], ['metadata/', 'channels: stable, fast'], ['OCI push', 'registry.io/op-bundle:v1']], banner: ['OPERATOR PACKAGED AS OCI BUNDLE ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'OLM v0 PACKAGING PIPELINE', '#4A7BC7')],
        nodes: [
          N('cf', 180, 175, 'stack', 'yellow', 'CRDs + RBAC', 'config/ manifests', null, 'Generated by Kubebuilder / controller-gen.'),
          N('bd', 420, 175, 'hex', 'lavender', 'OCI Bundle', 'CSV + CRDs', ['packaged', 'purple'], 'Immutable bundle image pushed to OCI registry.'),
          N('ct', 650, 175, 'cyl', 'sky', 'Catalog FBC', 'upgrade graph', ['indexed', 'purple'], 'File-Based Catalog describing v1 -> v2 edges.')
        ],
        edges: [E('cf', 'bd', 'act'), E('bd', 'ct', 'ok')]
      },
      {
        short: 'Catalog & Sub', cat: 'OLM',
        title: 'CatalogSource & Subscription: Subscribing to Release Channels',
        body: ['A <strong>CatalogSource</strong> runs an index Pod serving your operator catalog over gRPC (like an app store).', 'Cluster admins create a <strong>Subscription</strong> (e.g., <code>channel: stable</code>) so OLM continuously checks for newer versions along the upgrade graph!'],
        tip: 'Set `installPlanApproval: Manual` on production Subscriptions if you want change-window approval before OLM upgrades an operator.',
        metrics: [['CATALOGSOURCE', 'gRPC Index Pod'], ['CHANNEL', 'stable / fast'], ['APPROVAL', 'Auto / Manual'], ['DISCOVERY', 'Continuous']],
        trace: { title: 'OLM SUBSCRIPTION', rows: [['CatalogSource', 'operatorhubio-catalog ✓'], ['Subscription', 'postgres-op (stable)'], ['found update', 'v1.1 -> v1.2 available']], banner: ['UPGRADE DISCOVERED IN CATALOG ✓', 'purple'] },
        zones: [Z(70, 38, 690, 275, 'OLM v0 DISCOVERY & SUBSCRIPTION', '#6E47B8')],
        nodes: [
          N('cs', 175, 175, 'cyl', 'sky', 'CatalogSource', 'gRPC index', ['serving', 'purple'], 'Exposes available operator packages & channels.'),
          N('sub', 425, 175, 'stack', 'lavender', 'Subscription', 'channel: stable', ['watching', 'purple'], 'Expresses intent to keep operator updated.'),
          N('olm', 655, 175, 'cube', 'mint', 'OLM Resolver', 'computes graph', ['resolving', 'green'], 'Resolves GVK dependencies and upgrade steps.')
        ],
        edges: [E('cs', 'sub', 'watch'), E('sub', 'olm', 'act')]
      },
      {
        short: 'InstallPlan & CSV', cat: 'OLM',
        title: 'InstallPlan Applies CRDs & CSV Spawns the Operator Pod',
        body: ['OLM generates an <strong>InstallPlan</strong> listing every exact CRD, RBAC Role, and <strong>ClusterServiceVersion (CSV)</strong> to apply.', 'Once approved, OLM stamps the CSV into the target namespace, creates the Operator Deployment, and wires webhook certificates!'],
        tip: 'Debugging OLM v0? Always walk the chain in order: `CatalogSource -> Subscription -> InstallPlan -> CSV -> Deployment`!',
        metrics: [['INSTALLPLAN', 'Approved ✓', 'green'], ['CSV PHASE', 'Succeeded ✓', 'green'], ['OPERATOR POD', 'Running', 'green'], ['WEBHOOK TLS', 'OLM Managed']],
        trace: { title: 'OLM v0 INSTALL', rows: [['InstallPlan', 'apply 2 CRDs + RBAC ✓'], ['CSV v1.2', 'Phase: Succeeded ✓'], ['Operator Pod', '1/1 Ready']], banner: ['OPERATOR DEPLOYED BY OLM v0 ✓', 'green'] },
        zones: [Z(65, 42, 695, 265, 'INSTALLPLAN -> CSV -> OPERATOR', '#1E7E45')],
        nodes: [
          N('ip', 170, 175, 'shield', 'yellow', 'InstallPlan', 'Approved', ['applying', 'warn'], 'Ordered transaction of manifests to install.'),
          N('csv', 415, 175, 'hex', 'lavender', 'CSV v1.2', 'Succeeded', ['installed', 'green'], 'Runtime representation of the installed operator.'),
          N('op', 660, 175, 'cube', 'mint', 'Operator Pod', '1/1 Ready', ['running', 'green'], 'Live operator reconciling user CRs.')
        ],
        edges: [E('ip', 'csv', 'act'), E('csv', 'op', 'ok')]
      },
      {
        short: 'v0 Pain Points', cat: 'OLM',
        title: 'Why OLM v0 Hit Scaling Limits (Motivating OLM v1)',
        body: ['In large clusters, OLM v0’s <strong>OperatorGroups</strong> (multi-namespace copying of CSVs), heavyweight gRPC CatalogSource Pods, implicit automatic dependency installs, and lack of clean rollbacks created operational friction—leading to a ground-up redesign: <strong>OLM v1</strong>!'],
        tip: 'OLM v0 works well in OpenShift today, while OLM v1 brings a leaner, GitOps-friendly, least-privilege architecture for modern Kubernetes.',
        metrics: [['CSV COPIES', 'High Etcd Load', 'red'], ['CATALOG PODS', 'Heavy gRPC', 'warn'], ['ROLLBACKS', 'Not Supported', 'red'], ['NEXT GEN', 'OLM v1 ->', 'green']],
        trace: { title: 'OLM v0 CHALLENGES', rows: [['OperatorGroup', 'copies CSVs per NS ⚠'], ['Dependency', 'implicit auto-installs'], ['Rollback', 'manual uninstall needed']], banner: ['MOTIVATION FOR OLM V1 REDESIGN', 'warn'] },
        zones: [Z(95, 42, 630, 265, 'OLM v0 ARCHITECTURAL FRICTION', '#A8640C')],
        nodes: [
          N('og', 200, 175, 'stack', 'coral', 'OperatorGroups', 'CSV fan-out', ['noisy', 'red'], 'Multi-namespace CSV copying bloats etcd.'),
          N('gp', 425, 175, 'cube', 'yellow', 'gRPC Catalog', 'per-catalog Pod', ['heavy', 'warn'], 'Running index Pods consumes constant cluster RAM.'),
          N('v1', 640, 175, 'shield', 'mint', 'OLM v1 Fix', 'Lean & Declarative', ['modern ✓', 'green'], 'Replaces complex APIs with ClusterCatalog + ClusterExtension.')
        ],
        edges: [E('og', 'v1', 'err'), E('gp', 'v1', 'act')]
      }
    ]
  },

  'olm-v1-architecture': {
    id: 'olm-v1-architecture', moduleId: 'm16', certs: ['OPERATOR', 'CNPE'],
    title: 'OLM v1 Architecture',
    subtitle: 'Next-generation declarative operator management: catalogd/ClusterCatalog, operator-controller/ClusterExtension, Single Ownership, Least-Privilege SA & Rollbacks.',
    duration: '10 min', difficulty: 'Advanced',
    checklist: [
      'Serve cached catalogs via catalogd & ClusterCatalog',
      'Install declaratively using ClusterExtension & semver ranges',
      'Enforce Least-Privilege install ServiceAccounts & Single Ownership',
      'Execute safe declarative upgrades & instant rollbacks'
    ],
    steps: [
      {
        short: 'catalogd', cat: 'OLM',
        title: 'catalogd & ClusterCatalog: Fast Local HTTP Catalog Caching',
        body: ['<strong>OLM v1</strong> eliminates heavy per-catalog gRPC Pods! Instead, <strong>catalogd</strong> unpacks OCI File-Based Catalogs (FBC) declared by a <strong>ClusterCatalog</strong> CR and serves metadata cleanly over a single lightweight local HTTP cache.'],
        tip: 'Because ClusterCatalog is declarative and unpacks immutable OCI images, air-gapped & GitOps catalog mirroring becomes trivial.',
        metrics: [['CATALOG PODS', '0 Per Catalog ✓', 'green'], ['ENGINE', 'catalogd HTTP', 'green'], ['FORMAT', 'OCI FBC'], ['RESOURCE COST', '-75% RAM ✓', 'green']],
        trace: { title: 'CATALOGD UNPACK', rows: [['ClusterCatalog', 'operatorhubio (OCI)'], ['catalogd', 'unpacked & cached locally'], ['HTTP endpoint', 'ready for solver ✓']], banner: ['LIGHTWEIGHT CATALOGD CACHE ✓', 'green'] },
        zones: [Z(275, 38, 490, 275, 'OLM v1 CATALOG LAYER (CATALOGD)', '#4A7BC7')],
        nodes: [
          N('oci', 145, 175, 'hex', 'lavender', 'OCI Registry', 'FBC catalog img', null, 'Standard OCI image storing package upgrade graph.'),
          N('cat', 425, 175, 'cyl', 'sky', 'catalogd', 'ClusterCatalog', ['cached', 'purple'], 'Unpacks and serves catalog metadata over HTTP.'),
          N('oc', 670, 175, 'cube', 'mint', 'operator-ctrl', 'semver solver', null, 'Queries catalogd to resolve exact target version.')
        ],
        edges: [E('oci', 'cat', 'watch'), E('cat', 'oc', 'ok')]
      },
      {
        short: 'ClusterExtension', cat: 'OLM',
        title: 'ClusterExtension: One Declarative Resource Replaces Sub/IP/CSV',
        body: ['Forget juggling Subscriptions, OperatorGroups, InstallPlans, and CSVs! In OLM v1, a single <strong>ClusterExtension</strong> specifies the package name, version range (<code>>=1.2.0 <2.0.0</code>), and an explicit <strong>install ServiceAccount</strong>.'],
        code: { title: 'YAML — OLM v1 ClusterExtension', lang: 'yaml', body: `apiVersion: olm.operatorframework.io/v1\nkind: ClusterExtension\nmetadata: { name: postgres-operator }\nspec:\n  namespace: postgres-system\n  serviceAccount: { name: postgres-installer-sa }\n  source:\n    sourceType: Catalog\n    catalog:\n      packageName: cloudnative-pg\n      version: ">=1.24.0 <1.26.0"` },
        tip: 'ClusterExtension works seamlessly with ArgoCD/Flux—just pin `version: "1.24.2"` in Git for deterministic GitOps rollouts!',
        metrics: [['API COUNT', '1 CR Only ✓', 'green'], ['VERSIONING', 'Semver Range'], ['GITOPS READY', '100% ✓', 'green'], ['SOLVER', 'Built-in']],
        trace: { title: 'CLUSTEREXTENSION', rows: [['package', 'cloudnative-pg'], ['version constraint', '>=1.24.0 <1.26.0'], ['resolved', 'v1.25.1 bundle ✓']], banner: ['SINGLE DECLARATIVE INSTALL CR ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'OPERATOR-CONTROLLER RECONCILIATION', '#1E7E45')],
        nodes: [
          N('ce', 180, 175, 'hex', 'lavender', 'ClusterExtension', 'semver >=1.24', ['watching', 'purple'], 'Single declarative API replacing Sub + IP + CSV.'),
          N('oc', 425, 175, 'cube', 'mint', 'operator-ctrl', 'resolves v1.25.1', ['reconciling', 'green'], 'Pulls bundle and reconciles via Helm/Boxcutter.'),
          N('op', 655, 175, 'cube', 'sky', 'CNPG Operator', 'v1.25.1 Ready', ['synced', 'green'], 'Cleanly installed and continuously reconciled.')
        ],
        edges: [E('ce', 'oc', 'watch'), E('oc', 'op', 'act')]
      },
      {
        short: 'Least-Priv SA', cat: 'OPS',
        title: 'Least-Privilege Installer SA & Strict Single Ownership',
        body: ['OLM v0 ran with god-like <code>cluster-admin</code> privileges. <strong>OLM v1</strong> impersonates the explicit <code>spec.serviceAccount</code> you grant—so a compromised bundle CANNOT escalate beyond its scoped RBAC!', 'OLM v1 also enforces <strong>Single Ownership</strong>: one ClusterExtension per cluster per package/CRD, eliminating namespace conflicts.'],
        tip: 'If a new operator release suddenly requests unexpected `secrets: list` RBAC, OLM v1 blocks the upgrade cleanly because the installer SA lacks permission!',
        metrics: [['PRIVILEGE', 'Scoped SA Only', 'green'], ['CLUSTER-ADMIN', 'Eliminated ✓', 'green'], ['OWNERSHIP', 'Single / Cluster', 'green'], ['ESCALATION', 'Blocked ✓', 'green']],
        trace: { title: 'OLM v1 SECURITY', rows: [['impersonate', 'sa/postgres-installer'], ['RBAC check', 'matches granted Roles ✓'], ['CRD conflict', 'Single Ownership OK ✓']], banner: ['LEAST-PRIVILEGE INSTALL GUARD ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'IMPERSONATED INSTALL BOUNDARY', '#C93632')],
        nodes: [
          N('bd', 145, 175, 'hex', 'yellow', 'Bundle v1.26', 'requests RBAC', null, 'New operator release manifests.'),
          N('sa', 435, 175, 'shield', 'mint', 'Installer SA', 'Scoped RBAC', ['enforcing', 'green'], 'operator-controller impersonates this narrow SA.'),
          N('api', 670, 175, 'cube', 'sky', 'API Server', 'verifies RBAC', ['protected', 'purple'], 'Blocks any unauthorized privilege escalation.')
        ],
        edges: [E('bd', 'sa', 'act'), E('sa', 'api', 'ok')]
      },
      {
        short: 'Safe Rollbacks', cat: 'OLM',
        title: 'Declarative Rollbacks & Drift Reconciliation',
        body: ['Unlike OLM v0, <strong>OLM v1</strong> continuously reconciles installed manifests against the active bundle (auto-healing accidental edits to operator Deployments) and supports clean version pinning & rollbacks when schema compatibility holds!'],
        tip: 'Always check CRD schema compatibility before rolling back an operator version—never drop a CRD stored version still referenced in etcd.',
        metrics: [['DRIFT HEAL', 'Continuous ✓', 'green'], ['ROLLBACKS', 'Supported ✓', 'green'], ['UPGRADE EDGE', 'Validated'], ['STATUS', 'Conditions ✓', 'green']],
        trace: { title: 'OLM v1 LIFECYCLE', rows: [['drift check', 'Operator Deploy synced ✓'], ['version pin', '1.25.1 -> 1.24.2 (safe)'], ['condition', 'Installed=True ✓']], banner: ['DECLARATIVE DRIFT & ROLLBACK ✓', 'green'] },
        zones: [Z(85, 42, 650, 265, 'CONTINUOUS EXTENSION RECONCILIATION', '#1E7E45')],
        nodes: [
          N('git', 195, 175, 'cyl', 'lavender', 'GitOps / Pin', 'v1.24.2', null, 'Declarative version controlled in Git.'),
          N('oc', 425, 175, 'cube', 'mint', 'operator-ctrl', 'reconciles bundle', ['synced', 'green'], 'Continuously enforces bundle manifests.'),
          N('op', 640, 175, 'cube', 'sky', 'Operator', 'healed & pinned', ['healthy', 'green'], 'Zero configuration drift in production.')
        ],
        edges: [E('git', 'oc', 'watch'), E('oc', 'op', 'ok')]
      }
    ]
  },

  'production-ha-observability': {
    id: 'production-ha-observability', moduleId: 'm16', certs: ['OPERATOR', 'CNPE', 'CKS'],
    title: 'Production HA & Observability',
    subtitle: 'Running operators reliably in production: Lease-based Leader Election, Prometheus workqueue metrics, structured logging, and RBAC hardening.',
    duration: '9 min', difficulty: 'Advanced',
    checklist: [
      'Run 2-3 HA replicas safely using Lease Leader Election',
      'Alert on workqueue depth & reconcile error rate via Prometheus',
      'Emit structured JSON logs correlated by CR name & namespace',
      'Harden operator Pods with minimal RBAC & non-root PSS'
    ],
    steps: [
      {
        short: 'Leader Election', cat: 'OPS',
        title: 'HA Leader Election Leases: Zero Split-Brain Failover',
        body: ['Run <code>replicas: 2</code> of your Operator with <code>--leader-elect=true</code>. Both Pods race for a single <strong>Lease</strong> object; only the active <strong>Leader</strong> runs Reconciles while the Standby watches the Lease.', 'If the Leader OOMs, Standby claims the Lease in ~15s and resumes seamlessly—zero duplicate writes!'],
        tip: 'Set `LeaderElectionReleaseOnCancel: true` on `ctrl.Options` so graceful rolling updates hand off leadership in < 1 second instead of waiting 15s for Lease expiry!',
        metrics: [['REPLICAS', '2 HA Pods'], ['ACTIVE LEADERS', 'Exactly 1 ✓', 'green'], ['FAILOVER RTO', '~15s (<1s roll)', 'green'], ['SPLIT-BRAIN', 'Impossible ✓', 'green']],
        trace: { title: 'LEADER LEASE', rows: [['Pod-0', 'OOMKilled -> Lease expired'], ['Pod-1', 'CAS acquired Lease ✓'], ['split-brain', '0 concurrent writers']], banner: ['HA LEADER PROMOTED CLEANLY ✓', 'green'] },
        zones: [Z(70, 38, 690, 275, 'ACTIVE-STANDBY OPERATOR HA', '#1E7E45')],
        nodes: [
          N('p0', 180, 108, 'cube', 'gray', 'Operator-0', 'OOMKilled', ['offline', 'red'], 'Previous leader terminated cleanly.', true),
          N('p1', 180, 245, 'cube', 'mint', 'Operator-1', 'NEW LEADER', ['promoted', 'green'], 'Standby acquired Lease and took over immediately.'),
          N('ls', 455, 175, 'cyl', 'lavender', 'Lease Object', 'holder: Op-1', ['leader', 'purple'], 'coordination.k8s.io/v1 Lease in etcd.'),
          N('cr', 670, 175, 'stack', 'sky', 'Prod CRs', 'reconciling ✓', null, 'Zero interruption to running workloads.')
        ],
        edges: [E('p0', 'ls', 'err', { stop: 0.65 }), E('p1', 'ls', 'ok', { count: 3 }), E('ls', 'cr', 'act')]
      },
      {
        short: 'Prom Metrics', cat: 'OPS',
        title: 'Golden Operator Metrics Exposed Automatically on :8080',
        body: ['<code>controller-runtime</code> exports vital Prometheus metrics out of the box:', 'Watch <code>workqueue_depth</code> (backlog growing?), <code>controller_runtime_reconcile_errors_total</code> (error storm?), and <code>controller_runtime_reconcile_time_seconds</code> (slow external API calls?).'],
        code: { title: 'PromQL — Operator Health Alert', lang: 'promql', body: `# Page if reconcile error rate > 5% for 5 minutes\nsum(rate(controller_runtime_reconcile_errors_total[5m]))\n  / sum(rate(controller_runtime_reconcile_total[5m])) > 0.05` },
        tip: 'Register custom domain metrics (e.g., `webapp_backup_last_success_timestamp`) into `metrics.Registry` so SREs monitor business SLIs, not just Go runtime health.',
        metrics: [['WORKQUEUE', 'depth: 0 ✓', 'green'], ['RECONCILE P99', '48 ms', 'green'], ['ERROR RATE', '0.00%', 'green'], ['ENDPOINT', ':8443 TLS']],
        trace: { title: 'PROMETHEUS SCRAPE', rows: [['workqueue_depth', '0 (no backlog) ✓'], ['reconcile_errors', '0 / 5m ✓'], ['p99 duration', '48 ms']], banner: ['OPERATOR SLIs GREEN ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'OPERATOR OBSERVABILITY PIPELINE', '#6E47B8')],
        nodes: [
          N('op', 180, 175, 'cube', 'mint', 'Operator', ':8443 /metrics', null, 'Exposes workqueue, client-go, and custom metrics.'),
          N('pr', 425, 175, 'cyl', 'lavender', 'Prometheus', 'ServiceMonitor', ['scraping', 'purple'], 'Scrapes metrics every 15s via TLS.'),
          N('al', 650, 175, 'shield', 'sky', 'Grafana / Alert', 'SLO Dashboards', ['healthy', 'green'], 'Alerts SREs on queue backlog or reconcile errors.')
        ],
        edges: [E('op', 'pr', 'watch'), E('pr', 'al', 'ok')]
      },
      {
        short: 'Structured Logs', cat: 'GO CODE',
        title: 'Structured JSON Logs & Kubernetes Events',
        body: ['Use <code>log := logf.FromContext(ctx)</code> (Zap JSON logger) so every log line automatically carries <code>controller</code>, <code>namespace</code>, and <code>name</code>.', 'Also emit user-visible <code>r.Recorder.Event()</code> events so developers see operator actions directly in <code>kubectl describe cr</code>!'],
        tip: 'Log routine "already synced" passes at debug level (`log.V(1).Info(...)`) so production log volume stays affordable.',
        metrics: [['LOG FORMAT', 'Zap JSON ✓', 'green'], ['CORRELATION', 'CR + ReconcileID'], ['USER EVENTS', 'kubectl describe'], ['NOISE LEVEL', 'V(1) Debug']],
        trace: { title: 'STRUCTURED TELEMETRY', rows: [['Zap JSON', '{"cr":"shop","dur":"12ms"}'], ['EventRecorder', 'Normal Scaled 3->5'], ['kubectl desc', 'visible to devs ✓']], banner: ['DEV + SRE VISIBILITY ALIGNED ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'LOGS + K8S EVENTS', '#4A7BC7')],
        nodes: [
          N('op', 145, 175, 'cube', 'yellow', 'Reconciler', 'log + Recorder', null, 'Emits both structured JSON logs and K8s Events.'),
          N('lg', 465, 108, 'cyl', 'lavender', 'Loki / SIEM', 'Zap JSON logs', ['indexed', 'purple'], 'Fast structured querying by reconcileID.'),
          N('ev', 465, 245, 'stack', 'mint', 'K8s Events', 'kubectl describe', ['dev UX ✓', 'green'], 'Developers debug CRs without needing operator logs.')
        ],
        edges: [E('op', 'lg', 'watch'), E('op', 'ev', 'ok')]
      },
      {
        short: 'RBAC & Security', cat: 'OPS',
        title: 'Hardening the Operator Pod: Least-Privilege RBAC & Non-Root',
        body: ['Operators are high-value targets because they hold cluster write permissions! Run the Operator image as <strong>distroless non-root</strong> (<code>UID 65532</code>, <code>readOnlyRootFilesystem: true</code>, drop ALL caps), restrict ClusterRole verbs strictly, and scope cache namespaces where possible.'],
        tip: 'Never grant `secrets: ["*"]` cluster-wide unless truly required—scope Secret access to specific namespaces or resourceNames.',
        metrics: [['POD USER', 'Non-Root 65532', 'green'], ['ROOT FS', 'Read-Only ✓', 'green'], ['RBAC', 'Least Privilege', 'green'], ['PSS PROFILE', 'Restricted ✓', 'green']],
        trace: { title: 'SECURITY POSTURE', rows: [['runAsNonRoot', 'true (distroless) ✓'], ['RBAC audit', '0 wildcard * verbs ✓'], ['NetworkPolicy', 'egress :6443 only ✓']], banner: ['HARDENED PRODUCTION OPERATOR ✓', 'green'] },
        zones: [Z(100, 42, 620, 265, 'HARDENED OPERATOR SANDBOX', '#1E7E45')],
        nodes: [
          N('sh', 225, 175, 'shield', 'mint', 'Restricted PSS', 'Non-root · RO', ['locked', 'green'], 'Minimal container attack surface.'),
          N('op', 430, 175, 'cube', 'sky', 'Operator Pod', 'distroless Go', null, 'Single static binary with zero shell.'),
          N('rb', 625, 175, 'shield', 'lavender', 'Scoped RBAC', 'No * wildcards', ['audited', 'purple'], 'Only exact API groups and verbs needed.')
        ],
        edges: [E('sh', 'op', 'ok'), E('op', 'rb', 'watch')]
      }
    ]
  },

  'upgrades-capability-model': {
    id: 'upgrades-capability-model', moduleId: 'm16', certs: ['OPERATOR', 'CNPE'],
    title: 'Upgrades & Capability Model',
    subtitle: 'Graduating from Level 1 Install to Level 5 Auto-Pilot, zero-downtime CRD upgrades, version skew safety, and GitOps operator fleets.',
    duration: '9 min', difficulty: 'Advanced',
    checklist: [
      'Map features across the 5-Level Operator Capability Model',
      'Upgrade CRDs & operators safely with expand-and-contract',
      'Handle Kubernetes & CR version skew without breaking CRs',
      'Manage multi-cluster operators declaratively with ArgoCD'
    ],
    steps: [
      {
        short: '5-Level Model', cat: 'OPS',
        title: 'The 5-Level Operator Capability Maturity Model',
        body: ['Operators mature across 5 levels: <strong>L1 Basic Install</strong>, <strong>L2 Seamless Upgrades</strong>, <strong>L3 Full Lifecycle</strong> (backups/failover), <strong>L4 Deep Insights</strong> (metrics/alerts), and <strong>L5 Auto-Pilot</strong> (horizontal/vertical auto-tuning & anomaly healing).'],
        tip: 'Don’t over-engineer Level 5 on Day 1! Ship a rock-solid Level 2/3 operator first—most production value comes from safe upgrades and automated backups.',
        metrics: [['L1 - L2', 'Install & Upgrade'], ['L3 LIFECYCLE', 'Backup / Failover', 'green'], ['L4 INSIGHTS', 'Metrics & SLOs'], ['L5 AUTO-PILOT', 'Self-Tuning', 'purple']],
        trace: { title: 'MATURITY LADDER', rows: [['L1-L2', 'Deploy + safe upgrades'], ['L3-L4', 'Backups + Prom alerts'], ['L5', 'Auto-scaling + healing']], banner: ['ITERATIVE OPERATOR MATURITY ✓', 'purple'] },
        zones: [Z(65, 42, 690, 265, 'OPERATOR CAPABILITY LEVELS (1 -> 5)', '#6E47B8')],
        nodes: [
          N('l1', 165, 175, 'cube', 'sky', 'L1-L2 Core', 'Install/Upgrade', null, 'Helm/Go provisioning and minor upgrades.'),
          N('l3', 410, 175, 'cube', 'mint', 'L3-L4 Ops', 'Backup+Metrics', ['prod target', 'green'], 'Automated Day-2 failover, restore & Prom alerts.'),
          N('l5', 655, 175, 'hex', 'lavender', 'L5 Auto-Pilot', 'Self-Tuning', ['autonomous', 'purple'], 'Auto-scales, heals anomalies, tunes config.')
        ],
        edges: [E('l1', 'l3', 'act'), E('l3', 'l5', 'ok')]
      },
      {
        short: 'Safe CRD Upgrade', cat: 'PATTERN',
        title: 'Expand-and-Contract: Zero-Downtime CRD Schema Upgrades',
        body: ['Breaking existing CRs during an upgrade causes instant production outages! Follow <strong>Expand-and-Contract</strong>: (1) Apply additive CRD fields first, (2) Roll out the new Operator binary reading old+new fields, (3) Migrate stored objects, and (4) Remove old fields in a future release!'],
        tip: 'NEVER delete a CRD (`kubectl delete crd`) during an upgrade—deleting a CRD immediately CASCADE-DELETES every Custom Resource of that kind in the entire cluster!',
        metrics: [['ORDER', 'CRD -> Operator', 'green'], ['DELETE CRD?', 'NEVER! ⚠', 'red'], ['SCHEMA CHANGE', 'Additive First ✓', 'green'], ['DOWNTIME', '0 sec', 'green']],
        trace: { title: 'SAFE UPGRADE SEQUENCE', rows: [['1. Apply CRD', 'additive optional field ✓'], ['2. Roll Operator', 'reads old + new cleanly'], ['3. Existing CRs', '100% intact (0 errors)']], banner: ['ZERO-DOWNTIME CRD UPGRADE ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'EXPAND-AND-CONTRACT UPGRADE FLOW', '#1E7E45')],
        nodes: [
          N('s1', 180, 175, 'hex', 'lavender', '1. Expand CRD', 'additive schema', ['safe', 'purple'], 'Apply backward-compatible CRD update first.'),
          N('s2', 415, 175, 'cube', 'mint', '2. Roll Op v2', 'dual-read', ['upgrading', 'green'], 'New operator supports both v1 and v2 fields.'),
          N('s3', 650, 175, 'stack', 'sky', '3. Live CRs', 'zero outage', ['synced', 'green'], 'Existing workloads continue running undisturbed.')
        ],
        edges: [E('s1', 's2', 'act'), E('s2', 's3', 'ok')]
      },
      {
        short: 'Version Skew', cat: 'OPS',
        title: 'Managing Pause Annotations & Version Skew Across Fleet',
        body: ['When upgrading an operator managing 200 production databases, you don’t want all 200 DBs restarting simultaneously!', 'Support a <code>reconcile.acme.io/paused: "true"</code> annotation or progressive rollout waves so SREs upgrade canary CRs first, verify health, then unpause the rest.'],
        tip: 'Also decouple the Operator version from the managed Workload version (`spec.imageVersion`) so upgrading your Operator binary never forces an unplanned database restart!',
        metrics: [['OP vs APP', 'Decoupled ✓', 'green'], ['PAUSE FLAG', 'Annotation Guard'], ['BLAST RADIUS', 'Canary CR First', 'green'], ['SKEW', 'Safe Rollout']],
        trace: { title: 'WAVE UPGRADE', rows: [['Op binary', 'v2.0 deployed (0 DB restarts)'], ['Canary CR', 'spec.version -> 16.4 ✓'], ['Prod CRs', 'rolled in safe waves']], banner: ['DECOUPLED FLEET UPGRADES ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'PROGRESSIVE CR UPGRADE WAVES', '#4A7BC7')],
        nodes: [
          N('op', 145, 175, 'cube', 'mint', 'Operator v2', 'decoupled engine', ['upgraded', 'green'], 'Upgrading controller does not auto-restart DBs.'),
          N('cn', 440, 108, 'stack', 'mint', 'Canary CR', 'v16.4 verified', ['promoted', 'green'], 'Upgraded and validated first.'),
          N('pr', 440, 245, 'shield', 'yellow', 'Prod CRs', 'paused / wave 2', ['guarded', 'warn'], 'Waiting for canary green signal.'),
          N('ok', 670, 175, 'stack', 'sky', 'Fleet Health', '100% SLA', null, 'Zero simultaneous fleet restarts.')
        ],
        edges: [E('op', 'cn', 'ok'), E('op', 'pr', 'watch'), E('cn', 'ok', 'ok')]
      },
      {
        short: 'GitOps Fleet', cat: 'OPS',
        title: 'Managing Operators at Multi-Cluster Scale With GitOps',
        body: ['In production, pair <strong>ArgoCD / Flux</strong> with <strong>OLM v1 ClusterExtensions</strong> (or Helm + Sync Waves): Sync Wave <code>-1</code> applies CRDs safely (with <code>ServerSideApply=true</code> to avoid annotation size limits), Wave <code>0</code> deploys the Operator, and Wave <code>1</code> syncs tenant CRs!'],
        tip: 'Always enable `ServerSideApply=true` in ArgoCD for large CRDs—client-side `last-applied-configuration` annotations crash on CRDs exceeding 256KB!',
        metrics: [['SYNC WAVE -1', 'CRDs (SSA ✓)', 'green'], ['SYNC WAVE 0', 'Operator + OLM'], ['SYNC WAVE 1', 'Tenant CRs', 'green'], ['256KB BUG', 'Avoided (SSA)', 'green']],
        trace: { title: 'ARGOCD SYNC WAVES', rows: [['Wave -1', 'CRDs (ServerSideApply) ✓'], ['Wave 0', 'Operator Healthy ✓'], ['Wave +1', 'Tenant CRs reconciled ✓']], banner: ['MULTI-CLUSTER GITOPS FLEET ✓', 'green'] },
        zones: [Z(265, 36, 500, 278, 'ARGOCD ORDERED SYNC WAVES', '#1E7E45')],
        nodes: [
          N('git', 140, 175, 'cyl', 'lavender', 'GitOps Repo', 'ArgoCD Waves', ['source', 'purple'], 'Single source of truth across all clusters.'),
          N('w1', 395, 105, 'hex', 'yellow', 'Wave -1: CRDs', 'SSA=true', ['1. applied', 'warn'], 'Avoids 256KB annotation limit cleanly.'),
          N('w2', 395, 248, 'cube', 'mint', 'Wave 0: Op', 'OLM / Helm', ['2. Ready', 'green'], 'Waits for Operator Deployment + Webhook Ready.'),
          N('w3', 665, 175, 'stack', 'sky', 'Wave 1: CRs', 'Tenant Apps', ['3. synced', 'green'], 'Applies CRs only once CRDs & Webhooks are live.')
        ],
        edges: [E('git', 'w1', 'act'), E('git', 'w2', 'watch'), E('w1', 'w3', 'ok'), E('w2', 'w3', 'ok')]
      }
    ]
  }
});

// 10 Realistic Operator Practice Drills (tagged OPERATOR)
PRACTICE_SCENARIOS.push(
  {
    cert: 'OPERATOR',
    title: 'Infinite Reconcile Storm Eating 100% CPU',
    snippet: `func (r *AppReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {\n    // ... ensures Deployment exists ...\n    app.Status.LastChecked = metav1.Now()\n    return ctrl.Result{}, r.Status().Update(ctx, &app)\n}\n// SetupWithManager: ctrl.NewControllerManagedBy(mgr).For(&v1.App{}).Complete(r)`,
    question: 'Every time your Operator updates `app.Status.LastChecked`, `Reconcile()` immediately fires again in a tight loop, burning 100% CPU and hammering kube-apiserver. What is the clean fix?',
    options: [
      'Add `time.Sleep(10 * time.Second)` at the top of `Reconcile()`.',
      'Remove volatile timestamps from Status AND attach `predicate.GenerationChangedPredicate{}` so status-only updates do not re-enqueue the CR.',
      'Disable the `/status` subresource on the CRD.',
      'Increase `MaxConcurrentReconciles` to 50 to drain the storm faster.'
    ],
    correct: 1,
    explanation: 'Writing a changing timestamp to `/status` emits a Watch Modified event every pass. Because no Predicate filters out status-only updates, controller-runtime immediately re-enqueues the CR. Drop volatile timestamps and use `GenerationChangedPredicate`.',
    fix: `ctrl.NewControllerManagedBy(mgr).\n  For(&v1.App{}, builder.WithPredicates(predicate.GenerationChangedPredicate{})).\n  Owns(&appsv1.Deployment{}).\n  Complete(r)`
  },
  {
    cert: 'OPERATOR',
    title: 'Custom Resource Stuck in Terminating Forever',
    snippet: `$ kubectl delete postgrescluster shop-db -n prod\npostgrescluster.db.acme.io "shop-db" deleted (hanging...)\n\n$ kubectl get postgrescluster shop-db -o jsonpath='{.metadata.finalizers}'\n["db.acme.io/finalizer"]`,
    question: 'The CR has been stuck in `Terminating` for 20 minutes after `kubectl delete`, and you notice the Operator Deployment was scaled to 0 replicas earlier. Why is etcd refusing to delete the CR?',
    options: [
      'Kubernetes waits 24 hours before garbage collecting CRDs.',
      'An active Finalizer (`db.acme.io/finalizer`) blocks deletion until the Operator runs external cleanup and removes the finalizer string; scale the Operator back up so it completes cleanup cleanly.',
      'The CR is missing an `ownerReference` to the Namespace.',
      'etcd has lost Raft quorum.'
    ],
    correct: 1,
    explanation: 'As long as `metadata.finalizers` is non-empty, API Server keeps the CR in `Terminating` state. Bring the Operator back online so it tears down the external resource and removes the finalizer—only patch finalizers out manually after verifying external cloud cleanup.',
    fix: `# Preferred: restore Operator Pod so cleanup runs cleanly\nkubectl scale deploy/postgres-operator -n system --replicas=1`
  },
  {
    cert: 'OPERATOR',
    title: 'Split Client Stale Read Race Condition',
    snippet: `// Inside a single Reconcile() pass:\n_ = r.Create(ctx, newJob)\nvar check batchv1.Job\nerr := r.Get(ctx, key, &check) // returns NotFound intermittently!`,
    question: 'Right after `r.Create(ctx, newJob)` succeeds (201 Created), an immediate `r.Get()` on the very next line intermittently fails with `NotFound`! Why?',
    options: [
      'kube-apiserver drops 10% of Job creations silently.',
      'controller-runtime uses a Split Client: `Create()` writes directly to API Server, while `Get()` reads from the local Informer Cache, which may lag by a few milliseconds until the Watch event arrives.',
      'Jobs cannot be fetched via `r.Get()`.',
      'The ServiceAccount lacks `get` permission on Jobs.'
    ],
    correct: 1,
    explanation: 'The Split Client reads from local RAM cache and writes directly to kube-apiserver. Never immediately re-read an object you just created in the same Reconcile—use the mutated `newJob` struct in memory or let the Watch event trigger the next pass.',
    fix: `// Rely on newJob returned by Create() or return Result{}, nil and let .Owns(&batchv1.Job{}) trigger next Reconcile.`
  },
  {
    cert: 'OPERATOR',
    title: 'CRD Rejected With "must be a structural schema"',
    snippet: `$ kubectl apply -f config/crd/bases/apps.acme.io_webapps.yaml\nThe CustomResourceDefinition "webapps.apps.acme.io" is invalid:\nspec.validation.openAPIV3Schema.properties[spec].properties[config]:\n  Required value: must not be empty for specified object fields`,
    question: 'Why did Kubernetes reject this `apiextensions.k8s.io/v1` CRD manifest when applying it?',
    options: [
      'CRDs in v1 require a Structural OpenAPI v3 schema: every `type: object` must declare its `properties` (or explicitly opt into `x-kubernetes-preserve-unknown-fields: true` / `additionalProperties`).',
      'CRDs cannot contain nested objects under `spec`.',
      'OpenAPI v3 schemas are only allowed on Cluster-scoped CRDs.',
      'You must delete all Pods before applying a CRD.'
    ],
    correct: 0,
    explanation: 'v1 CRDs strictly enforce Structural Schemas to support pruning, defaults, and Server-Side Apply. Untyped `map[string]any` fields fail unless typed with `additionalProperties` or `apiextensionsv1.JSON`.',
    fix: `// In Go struct, use typed structs or apiextensionsv1.JSON:\n// +kubebuilder:pruning:PreserveUnknownFields\nConfig apiextensionsv1.JSON \`json:"config,omitempty"\``
  },
  {
    cert: 'OPERATOR',
    title: 'OLM v1 ClusterExtension Blocked With RBAC Error',
    snippet: `$ kubectl describe clusterextension postgres-op\nConditions:\n  Type: Progressing  Status: True\n  Message: serviceaccount "postgres-installer-sa" is forbidden:\n    cannot create resource "clusterroles" in API group "rbac.authorization.k8s.io"`,
    question: 'In OLM v1, why did installing `ClusterExtension/postgres-op` fail with a Forbidden error even though OLM v1 itself is installed cleanly?',
    options: [
      'OLM v1 is broken and requires reinstalling catalogd.',
      'OLM v1 enforces Least-Privilege by impersonating the explicit `spec.serviceAccount` you provide—you must grant `postgres-installer-sa` the exact permissions required to install the operator bundle.',
      'ClusterExtensions can only install into the `default` namespace.',
      'OLM v1 requires an OLM v0 OperatorGroup to grant RBAC.'
    ],
    correct: 1,
    explanation: 'Unlike OLM v0’s cluster-admin installer, OLM v1 never escalates privileges beyond the explicitly configured installer ServiceAccount. Grant the exact needed RBAC to `postgres-installer-sa`.',
    fix: `kubectl create clusterrolebinding pg-installer-bind --clusterrole=pg-installer-role --serviceaccount=postgres-system:postgres-installer-sa`
  },
  {
    cert: 'OPERATOR',
    title: 'Duplicate Workloads Spawned After Scaling Operator to 2 Replicas',
    snippet: `$ kubectl scale deploy/billing-operator -n ops --replicas=2\n# Logs show BOTH Pod-0 and Pod-1 calling Stripe/AWS APIs for the same CR simultaneously!`,
    question: 'You scaled your Operator to 2 replicas for High Availability, and now both Pods reconcile the same CRs at the same time causing duplicate cloud resources! What was missed?',
    options: [
      'Kubernetes Operators can never run more than 1 replica.',
      'Leader Election (`--leader-elect=true` / `LeaderElection: true` in `ctrl.Options`) was not enabled, so both Pods act as active leaders without acquiring a Lease lock.',
      'WorkQueue only works with 1 replica.',
      'The Deployment needs `strategy: Recreate`.'
    ],
    correct: 1,
    explanation: 'Running >1 replica of a Kubernetes controller requires Lease-based Leader Election so exactly ONE Pod reconciles while standby Pods wait passively for Lease failover.',
    fix: `mgr, err := ctrl.NewManager(cfg, ctrl.Options{\n  LeaderElection:                true,\n  LeaderElectionID:              "billing-op.acme.io",\n  LeaderElectionReleaseOnCancel: true,\n})`
  },
  {
    cert: 'OPERATOR',
    title: 'envtest Test Hangs Waiting for Owned Deployment to Be Deleted',
    snippet: `// Inside envtest integration test:\nExpect(k8sClient.Delete(ctx, webapp)).To(Succeed())\nEventually(func() bool {\n    return apierrors.IsNotFound(k8sClient.Get(ctx, deployKey, &deploy))\n}).Should(BeTrue()) // ALWAYS TIMES OUT!`,
    question: 'Your `SetControllerReference` works perfectly in Kind and production, yet this `envtest` test always times out waiting for the child Deployment to disappear after deleting the parent CR. Why?',
    options: [
      '`SetControllerReference` has a bug in Go tests.',
      'envtest runs ONLY `kube-apiserver` and `etcd`—it does NOT run `kube-controller-manager` (no Garbage Collector) or `kubelet`. Assert `deploy.OwnerReferences` instead of waiting for GC deletion!',
      'You must call `k8sClient.Status().Delete()`.',
      'envtest disables etcd writes after the first test.'
    ],
    correct: 1,
    explanation: 'Because envtest omits kube-controller-manager, cascading Garbage Collection never executes during envtest. Verify that your controller stamped the right `OwnerReferences` on the child object instead.',
    fix: `Expect(deploy.OwnerReferences).To(ContainElement(SatisfyAll(\n  HaveField("Kind", "WebApp"),\n  HaveField("UID", webapp.UID),\n)))`
  },
  {
    cert: 'OPERATOR',
    title: 'Intermittent Data Race & Corrupted Labels Across Controllers',
    snippet: `// Using raw SharedInformer Lister:\npod, _ := podLister.Pods("prod").Get("api-0")\npod.Labels["inspected"] = "true" // BUG!\nclientset.CoreV1().Pods("prod").Update(ctx, pod, metav1.UpdateOptions{})`,
    question: 'Why does mutating `pod.Labels` directly on an object returned by a `SharedInformer` Lister cause mysterious bugs and Go race detector panics?',
    options: [
      'Kubernetes Pod labels are immutable after creation.',
      'SharedInformer hands back a pointer directly into the shared in-memory Indexer cache! Mutating it corrupts cached state for all controllers—always call `pod.DeepCopy()` first.',
      'Listers only return deleted Pods.',
      'You cannot update labels from Go.'
    ],
    correct: 1,
    explanation: 'Informer caches return read-only pointers shared across goroutines. Always copy with `podCopy := pod.DeepCopy()` before modifying any field.',
    fix: `podCopy := pod.DeepCopy()\npodCopy.Labels["inspected"] = "true"\nclientset.CoreV1().Pods("prod").Update(ctx, podCopy, metav1.UpdateOptions{})`
  },
  {
    cert: 'OPERATOR',
    title: 'r.Status().Update() Fails With 403 Forbidden After Enabling /status',
    snippet: `// Added // +kubebuilder:subresource:status to WebApp\n// Reconcile() now fails:\nwebapps.apps.acme.io "shop" is forbidden:\n  User "system:serviceaccount:ops:webapp-op" cannot update resource "webapps/status"`,
    question: 'Your Operator already has `update` permission on `webapps`, yet `r.Status().Update()` fails with 403 after enabling the `/status` subresource. Why?',
    options: [
      'Kubernetes RBAC treats `/status` as a separate subresource (`webapps/status`); add a `+kubebuilder:rbac` marker for `resources=webapps/status` and regenerate manifests.',
      'Only `cluster-admin` can write to CR status.',
      'You must call `r.Update()` instead of `r.Status().Update()`.',
      'Subresources require a Validating Webhook.'
    ],
    correct: 0,
    explanation: 'Enabling `/status` splits API access into `webapps` and `webapps/status` so users can edit specs without forging status, and controllers need explicit RBAC on `webapps/status`.',
    fix: `// +kubebuilder:rbac:groups=apps.acme.io,resources=webapps/status,verbs=get;update;patch`
  },
  {
    cert: 'OPERATOR',
    title: 'ArgoCD Fails Applying a Large Kubebuilder CRD (> 256KB)',
    snippet: `Error from server (Invalid): CustomResourceDefinition.apiextensions.k8s.io "bigcrds.db.acme.io" is invalid:\nmetadata.annotations: Too long: must have at most 262144 bytes`,
    question: 'Your Kubebuilder CRD grew past 256KB due to rich OpenAPI v3 descriptions and CEL rules, and now `kubectl apply` / ArgoCD fails with `metadata.annotations: Too long`. What is the production fix?',
    options: [
      'Delete all OpenAPI validation schemas from the CRD.',
      'Enable Server-Side Apply (`kubectl apply --server-side` or ArgoCD `syncOptions: [ServerSideApply=true]`), which eliminates the giant `last-applied-configuration` client annotation.',
      'Split the CRD into two separate etcd clusters.',
      'Compress the YAML with gzip before committing to Git.'
    ],
    correct: 1,
    explanation: 'Classic client-side `kubectl apply` copies the entire YAML manifest into the `kubectl.kubernetes.io/last-applied-configuration` annotation (capped at 256KB). Server-Side Apply tracks field ownership server-side without that annotation.',
    fix: `# ArgoCD Application spec:\nsyncPolicy:\n  syncOptions:\n    - ServerSideApply=true`
  }
);

// 6 Operator Cheatsheets (tagged OPERATOR + CNPE)
CHEATSHEETS.push(
  {
    title: 'Kubebuilder CLI Workflow', certs: ['OPERATOR', 'CNPE'],
    code: `# 1. Initialize Go module & Operator project\nkubebuilder init --domain acme.io --repo github.com/acme/webapp-op\n\n# 2. Scaffold CRD Go types + Reconciler + envtest\nkubebuilder create api --group apps --version v1alpha1 --kind WebApp \\\n  --resource --controller\n\n# 3. Scaffold Defaulting, Validating & Conversion Webhooks\nkubebuilder create webhook --group apps --version v1alpha1 --kind WebApp \\\n  --defaulting --programmatic-validation --conversion\n\n# 4. Generate DeepCopy, CRDs, RBAC & run locally against Kind\nmake manifests generate\nmake install && make run\n\n# 5. Build, push & deploy to production cluster\nmake docker-build docker-push IMG=ghcr.io/acme/webapp-op:v1.0.0\nmake deploy IMG=ghcr.io/acme/webapp-op:v1.0.0`
  },
  {
    title: 'Essential Kubebuilder Markers', certs: ['OPERATOR', 'CNPE'],
    code: `// CRD subresources, printer columns & storage hub\n// +kubebuilder:object:root=true\n// +kubebuilder:subresource:status\n// +kubebuilder:subresource:scale:specpath=.spec.replicas,statuspath=.status.replicas\n// +kubebuilder:storageversion\n// +kubebuilder:resource:shortName=wa,categories=all\n// +kubebuilder:printcolumn:name="Ready",type=integer,JSONPath=".status.ready"\n\n// OpenAPI v3 & Inline CEL validation (zero webhook!)\n// +kubebuilder:validation:Minimum=1\n// +kubebuilder:validation:Maximum=20\n// +kubebuilder:validation:XValidation:rule="self == oldSelf",message="immutable"\n\n// Scoped RBAC generated into config/rbac/role.yaml\n// +kubebuilder:rbac:groups=apps.acme.io,resources=webapps,verbs=get;list;watch;update\n// +kubebuilder:rbac:groups=apps.acme.io,resources=webapps/status,verbs=get;update;patch\n// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch`
  },
  {
    title: 'Go controller-runtime Reconcile() & Finalizer Skeleton', certs: ['OPERATOR', 'CNPE'],
    code: `const appFinalizer = "apps.acme.io/finalizer"\n\nfunc (r *WebAppReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {\n    log := logf.FromContext(ctx)\n    var app v1alpha1.WebApp\n    if err := r.Get(ctx, req.NamespacedName, &app); err != nil {\n        return ctrl.Result{}, client.IgnoreNotFound(err)\n    }\n    // 1. Handle Deletion + External Cleanup\n    if !app.DeletionTimestamp.IsZero() {\n        if controllerutil.ContainsFinalizer(&app, appFinalizer) {\n            if err := r.deleteExternalResources(ctx, &app); err != nil {\n                return ctrl.Result{}, err // keep finalizer & retry\n            }\n            controllerutil.RemoveFinalizer(&app, appFinalizer)\n            return ctrl.Result{}, r.Update(ctx, &app)\n        }\n        return ctrl.Result{}, nil\n    }\n    // 2. Ensure Finalizer is registered\n    if !controllerutil.ContainsFinalizer(&app, appFinalizer) {\n        controllerutil.AddFinalizer(&app, appFinalizer)\n        return ctrl.Result{}, r.Update(ctx, &app)\n    }\n    // 3. Reconcile child resources + Update /status\n    log.V(1).Info("reconciling WebApp", "generation", app.Generation)\n    return ctrl.Result{}, r.reconcileOwnedAndStatus(ctx, &app)\n}`
  },
  {
    title: 'Reconcile Return Value Matrix', certs: ['OPERATOR', 'CNPE'],
    isTable: true,
    headers: ['Return Statement', 'WorkQueue Behavior', 'When to Use'],
    rows: [
      ['ctrl.Result{}, nil', 'Forget(key) · Idle until next Watch', 'Reconciliation succeeded & converged.'],
      ['ctrl.Result{}, err', 'Requeue w/ Exponential Backoff', 'Transient API/network/409 error; logs error.'],
      ['ctrl.Result{RequeueAfter: 30*time.Second}, nil', 'Scheduled delayed requeue (no error)', 'Polling external AWS/DB state cleanly.'],
      ['ctrl.Result{Requeue: true}, nil', 'Immediate rate-limited requeue', 'Rare: prefer Watch or RequeueAfter instead.'],
      ['client.IgnoreNotFound(err)', 'Treats deleted CR as nil (done)', 'Always wrap initial r.Get(ctx, req, &cr).']
    ],
    code: `// Standard controller-runtime Reconcile return patterns:\nreturn ctrl.Result{}, nil                          // Done & idle\nreturn ctrl.Result{}, err                          // Exponential backoff retry\nreturn ctrl.Result{RequeueAfter: 30*time.Second}, nil // Scheduled non-blocking poll\nreturn ctrl.Result{}, client.IgnoreNotFound(err)   // Clean exit if CR deleted`
  },
  {
    title: 'OLM v1 ClusterCatalog & ClusterExtension YAML', certs: ['OPERATOR', 'CNPE'],
    code: `# 1. Register OCI File-Based Catalog (served by catalogd)\napiVersion: olm.operatorframework.io/v1\nkind: ClusterCatalog\nmetadata: { name: operatorhubio }\nspec:\n  source:\n    type: Image\n    image:\n      ref: quay.io/operatorhubio/catalog:latest\n      pollIntervalMinutes: 60\n---\n# 2. Install Operator declaratively with Least-Privilege SA\napiVersion: olm.operatorframework.io/v1\nkind: ClusterExtension\nmetadata: { name: cloudnative-pg }\nspec:\n  namespace: cnpg-system\n  serviceAccount:\n    name: cnpg-installer-sa # Must hold scoped RBAC!\n  source:\n    sourceType: Catalog\n    catalog:\n      packageName: cloudnative-pg\n      version: ">=1.24.0 <1.26.0"`
  },
  {
    title: 'envtest Setup & Operator Maturity Model (Levels 1–5)', certs: ['OPERATOR', 'CNPE'],
    isTable: true,
    headers: ['Level / Stage', 'Capability Focus', 'Key Implementation Pattern'],
    rows: [
      ['L1 Basic Install', 'Automated provisioning', 'CRDs + CreateOrUpdate + OwnerRefs'],
      ['L2 Seamless Upgrades', 'Patch & minor upgrades', 'Expand-and-contract CRDs + Conversion Hook'],
      ['L3 Full Lifecycle', 'Backup, restore, failover', 'Finalizers + StatefulSet + Day-2 Reconcilers'],
      ['L4 Deep Insights', 'Metrics, alerts, log trace', 'Prometheus /metrics + Conditions + Events'],
      ['L5 Auto-Pilot', 'Auto-scaling & healing', '/scale HPA + Anomaly remediation + SSA'],
      ['envtest Gotcha', 'Local apiserver + etcd', 'No kubelet/GC: assert OwnerRefs & Status!']
    ],
    code: `// envtest local integration test setup:\ntestEnv := &envtest.Environment{\n  CRDDirectoryPaths: []string{filepath.Join("..", "config", "crd", "bases")},\n}\ncfg, err := testEnv.Start()\ndefer testEnv.Stop()`
  }
);

// 8 Operator Lab Guardrails for Design Lab -> Operator Architecture Lab mode
const OP_LAB_GUARDRAILS = [
  { key: 'splitCache', name: 'SharedInformer Cache (Split Client)', sub: 'Cached RAM reads · 0 polling QPS',  api: 30, rec: 5,  cln: 0,  ha: 10 },
  { key: 'predicate',  name: 'GenerationChanged Predicate',         sub: 'Drops status-only loop storms',     api: 25, rec: 25, cln: 0,  ha: 5  },
  { key: 'statusSub',  name: '/status Subresource Separation',      sub: 'Isolates spec vs status + gen',     api: 15, rec: 20, cln: 0,  ha: 5  },
  { key: 'ownerRefs',  name: 'OwnerReferences (Cascading GC)',      sub: '.Owns() drift heal + K8s GC',       api: 0,  rec: 15, cln: 35, ha: 5  },
  { key: 'finalizers', name: 'Finalizers for External Cleanup',     sub: 'Tears down AWS RDS/S3 cleanly',     api: 0,  rec: 5,  cln: 45, ha: 5  },
  { key: 'celWebhook', name: 'CEL Validation & Webhooks',           sub: 'Blocks invalid CRs pre-etcd',       api: 10, rec: 15, cln: 15, ha: 5  },
  { key: 'backoff',    name: 'Exponential Backoff WorkQueue',       sub: 'Dedup + rate-limited retries',      api: 20, rec: 15, cln: 5,  ha: 15 },
  { key: 'leaderHA',   name: 'Leader Election Lease (HA)',          sub: '2x Replicas · 0 split-brain',       api: 0,  rec: 0,  cln: 0,  ha: 50 }
];

// Map Operator guardrails onto the Design Lab gauge schema (sec/rel/plat)
// and append them to LAB_FEATURES so they render as toggles and feed the
// existing 3 gauges. Mapping (per design §2 mapping table):
//   sec  = rec + cln   (reconcile + cleanup correctness -> Security)
//   rel  = ha  + api   (availability + API-load reduction -> Reliability)
//   plat = fixed per-guardrail maturity weight (literal below)
// New keys are absent from state.lab, so they default off (undefined/falsy)
// and contribute 0 to every gauge until toggled. Guarded so a load-order
// change or double-load cannot throw or duplicate entries.
(function () {
  if (typeof LAB_FEATURES === 'undefined' || !Array.isArray(LAB_FEATURES)) return;
  if (typeof OP_LAB_GUARDRAILS === 'undefined' || !Array.isArray(OP_LAB_GUARDRAILS)) return;

  var OP_LAB_PLAT = {
    splitCache: 10,
    predicate:  10,
    statusSub:  10,
    ownerRefs:  15,
    finalizers: 15,
    celWebhook: 10,
    backoff:    10,
    leaderHA:   20
  };

  OP_LAB_GUARDRAILS.forEach(function (g) {
    // Guard against double-merge: skip if this key is already present.
    if (LAB_FEATURES.some(function (f) { return f.key === g.key; })) return;
    LAB_FEATURES.push({
      key:  g.key,
      name: g.name,
      sub:  g.sub,
      sec:  g.rec + g.cln,
      rel:  g.ha + g.api,
      plat: OP_LAB_PLAT[g.key]
    });
  });
})();
