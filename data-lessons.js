/* =========================================================================
   CURRICULUM: 8 MODULES, 23 LESSONS, 92 EXACT 2.5D WORKFLOWS
   ========================================================================= */

const Z = (x, y, w, h, label, color = '#6E685E') => ({ x, y, w, h, label, color });
const N = (id, x, y, shape, col, label, sub, badge = null, tip = '', offline = false) =>
  ({ id, x, y, shape, col, label, sub, badge, tip, offline });
const E = (from, to, kind = 'req', opts = {}) => ({ from, to, kind, ...opts });

const MODULES = [
  { id: 'm1',  code: '01', title: 'Cluster Architecture & PKI',          color: '#D5E8FA', certs: ['CKA', 'CKS', 'CNPE'], lessons: ['cp-request-flow', 'etcd-raft-mvcc', 'kubelet-cri-node', 'node-lifecycle-conditions', 'static-pods', 'tls-cluster-pki'] },
  { id: 'm2',  code: '02', title: 'Core Workloads & Resources',          color: '#D9F2C9', certs: ['CKAD', 'CKA'],        lessons: ['pod-lifecycle-stages', 'pods-multicontainer', 'namespaces-quotas', 'replicasets-deployments-deep', 'deployments-rollouts', 'stateful-daemon-jobs'] },
  { id: 'm3',  code: '03', title: 'Scheduling, Affinity & Priority',     color: '#FEF0BF', certs: ['CKA', 'CKAD', 'CKS'], lessons: ['labels-selectors-affinity', 'taints-tolerations', 'priority-preemption'] },
  { id: 'm4',  code: '04', title: 'Config, Storage & Volume Plugins',    color: '#E5DCFB', certs: ['CKA', 'CKAD', 'CKS'], lessons: ['configmaps-secrets', 'volumes-storage-plugins', 'pv-pvc-csi'] },
  { id: 'm5',  code: '05', title: 'Networking, DNS, Ingress & Mesh',     color: '#FCE1C2', certs: ['CKA', 'CKAD', 'CKS'], lessons: ['services-kubeproxy', 'coredns-nodelocal', 'ingress-controllers', 'ingress-gateway', 'service-mesh-istio', 'network-policies'] },
  { id: 'm6',  code: '06', title: 'Cluster, Node & Audit Security',      color: '#FAD6D4', certs: ['CKS', 'CKA'],         lessons: ['authn-serviceaccounts', 'rbac-authz', 'cks-cis-kubebench', 'cks-os-hardening', 'cks-auditing-ciphers', 'cks-imds-metadata'] },
  { id: 'm7',  code: '07', title: 'Policies, eBPF & Supply Chain',       color: '#FAD6D4', certs: ['CKS', 'CNPE'],        lessons: ['admission-webhooks', 'policies-opa-kyverno-cel', 'ebpf-cilium-calico-falco', 'cks-seccomp-apparmor-tracee', 'cks-runtimes-gvisor-kata', 'cks-supply-chain', 'pod-security-runtime'] },
  { id: 'm8',  code: '08', title: 'Helm, Kustomize & GitOps',            color: '#CCF0EA', certs: ['CKAD', 'CNPE'],       lessons: ['helm-charts-advanced', 'kustomize-overlays-transformers', 'gitops-argocd', 'gitops-appsets-flux'] },
  { id: 'm9',  code: '09', title: 'Cluster Maintenance & Failures',      color: '#FAD6D4', certs: ['CKA', 'CNPE'],        lessons: ['cluster-maintenance', 'all-failure-modes'] },
  { id: 'm10', code: '10', title: 'Topology & Setup Demos',              color: '#D5E8FA', certs: ['CKA', 'CKS', 'CNPE'], lessons: ['managed-vs-selfmanaged', 'topology-single-ha-multicluster', 'demo-kubeadm-eks-install', 'demo-cluster-upgrade', 'demo-add-user-kubeconfig'] },
  { id: 'm11', code: '11', title: 'Extensibility: CRDs & Operators',     color: '#E5DCFB', certs: ['CKA', 'CNPE'],        lessons: ['crds-schema', 'controllers-operators'] },
  { id: 'm12', code: '12', title: 'K8s System Design Patterns',          color: '#FEF0BF', certs: ['CNPE', 'CKA', 'CKS'], lessons: ['level-triggered', 'hub-watch-cache', 'leader-election'] },
  { id: 'm13', code: '13', title: 'Platform Scaling at Production',      color: '#CCF0EA', certs: ['CNPE', 'CKA'],        lessons: ['hpa-deep-dive', 'vpa-deep-dive', 'autoscaling-karpenter'] },
  { id: 'm14', code: '14', title: 'Local Dev & Debug: Telepresence',     color: '#D5E8FA', certs: ['CKAD', 'CNPE'],       lessons: ['telepresence-architecture-basics', 'telepresence-intercept-env-volumes', 'telepresence-docker-workflow'] }
];

const LESSONS = {
  /* ======================== MODULE 01 ======================== */
  'cp-request-flow': {
    id: 'cp-request-flow', moduleId: 'm1', certs: ['CKA', 'CNPE'],
    title: 'Control Plane & Request Flow',
    subtitle: 'Follow a single kubectl apply from HTTPS POST through AuthN/AuthZ, Admission, etcd Raft commit, Scheduler, and Kubelet.',
    duration: '12 min', difficulty: 'Core',
    checklist: [
      'Trace a kubectl HTTPS POST to kube-apiserver',
      'Distinguish AuthN (401) from RBAC AuthZ (403)',
      'Order Mutating, Schema & Validating Admission',
      'See etcd Raft commit & Watch event fan-out',
      'Follow Scheduler binding to Kubelet Pod start'
    ],
    steps: [
      {
        short: 'kubectl POST', cat: 'ARCHITECTURE',
        title: '1. Client Sends Declarative YAML to kube-apiserver',
        body: ['When you run <code>kubectl apply -f pod.yaml</code>, kubectl loads your kubeconfig (TLS client cert or OIDC token) and sends an HTTPS <code>POST /api/v1/namespaces/prod/pods</code> to <strong>kube-apiserver</strong>.', 'Every component in Kubernetes—humans, controllers, kubelets—communicates exclusively through this stateless REST + Watch hub.'],
        yamlTitle: 'CLI · Verbose Request Trace',
        yaml: `kubectl apply -f pod.yaml --dry-run=server -v=8\n# Sends: POST /api/v1/namespaces/prod/pods HTTP/2`,
        tip: 'CKA Tip: Inspect your exact API server endpoint and client certs using `kubectl config view --minify`.',
        metrics: [['COMPONENT', 'kube-apiserver'], ['PATTERN', 'Single Hub'], ['FAILURE MODE', 'TLS / 503 LB'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'API REQUEST FLOW', rows: [['POST', '/api/v1/ns/prod/pods'], ['TLS 1.3', 'mTLS handshake ✓'], ['handler', 'kube-apiserver:6443']], banner: ['REQUEST ENTERED API HUB ✓', 'green'] },
        zones: [Z(285, 34, 485, 285, 'CONTROL PLANE', '#4A7BC7')],
        nodes: [
          N('cli', 145, 175, 'users', 'sky', 'kubectl CLI', 'POST pod.yaml', ['POST', 'warn'], 'Sends declarative JSON/YAML over HTTPS using ~/.kube/config.'),
          N('api', 435, 175, 'hex', 'mint', 'kube-apiserver', 'REST Hub :6443', ['✓ active', 'green'], 'Stateless front door for all cluster mutations and Watch streams.'),
          N('et', 670, 105, 'cyl', 'lavender', 'etcd', 'waiting write', null, 'Distributed Raft KV store backing all Kubernetes state.'),
          N('sc', 670, 248, 'cube', 'peach', 'Scheduler', 'watching API', null, 'Watches for Pods with spec.nodeName == "".')
        ],
        edges: [E('cli', 'api', 'req', { count: 3 }), E('api', 'et', 'watch', { count: 1 }), E('api', 'sc', 'watch', { count: 1 })]
      },
      {
        short: 'AuthN & AuthZ', cat: 'ARCHITECTURE',
        title: '2. Authentication (Who?) & RBAC Authorization (Allowed?)',
        body: ['<strong>AuthN</strong> verifies cryptographic identity (X.509 cert CN/O, OIDC JWT, or ServiceAccount token). Unknown identities fail fast with <code>401 Unauthorized</code>.', '<strong>AuthZ</strong> checks RBAC Roles & RoleBindings to confirm the identity holds verb <code>create</code> on <code>pods</code> in namespace <code>prod</code> (otherwise <code>403 Forbidden</code>).'],
        yamlTitle: 'CLI · RBAC Impersonation Check',
        yaml: `kubectl auth can-i create pods -n prod --as=alice\nkubectl auth can-i create pods -n prod --as=alice --as-group=devs`,
        tip: 'Test permissions before debugging deployments: `kubectl auth can-i create pods -n prod --as=alice`.',
        metrics: [['COMPONENT', 'AuthN + RBAC'], ['PATTERN', 'Default-Deny'], ['FAILURE MODE', '401 / 403'], ['EXAM TRACK', 'CKA · CKS', 'red']],
        trace: { title: 'AUTHN & AUTHZ', rows: [['AuthN', 'CN=alice, O=devs ✓'], ['RBAC', 'create pods in prod ✓'], ['latency', '1.4 ms']], banner: ['IDENTITY & VERB AUTHORIZED ✓', 'green'] },
        zones: [Z(235, 38, 535, 276, 'KUBE-APISERVER SECURITY GATES', '#C93632')],
        nodes: [
          N('cli', 120, 175, 'users', 'sky', 'User: alice', 'x509 client cert', null, 'Authenticated developer presenting signed client certificate.'),
          N('an', 345, 175, 'shield', 'sky', 'AuthN Gate', 'x509 / OIDC', ['✓ 200 id', 'green'], 'Verifies signature and extracts username + groups.'),
          N('az', 555, 175, 'shield', 'mint', 'RBAC AuthZ', 'Role: dev-edit', ['✓ allowed', 'green'], 'Matches (verbs, apiGroups, resources) via RoleBindings.'),
          N('ad', 715, 175, 'cube', 'lavender', 'Admission', 'next stage', null, 'Policy & mutation chain runs only after AuthZ passes.')
        ],
        edges: [E('cli', 'an', 'req'), E('an', 'az', 'ok'), E('az', 'ad', 'ok')]
      },
      {
        short: 'Admission Chain', cat: 'ARCHITECTURE',
        title: '3. Mutating -> Schema -> Validating Admission',
        body: ['Before persisting to etcd, mutating requests pass through <strong>Mutating Admission</strong> (injecting sidecars, default ServiceAccount, LimitRange defaults), then <strong>OpenAPI Schema Validation</strong>.', 'Finally, <strong>Validating Admission</strong> (Pod Security Admission, CEL policies, OPA/Kyverno) approves or rejects the final object.'],
        yamlTitle: 'CLI · Inspect Admission Webhooks',
        yaml: `kubectl get mutatingwebhookconfigurations\nkubectl get validatingwebhookconfigurations,validatingadmissionpolicies`,
        tip: 'Mutating always runs before Validating so injected sidecars cannot bypass security policies.',
        metrics: [['COMPONENT', 'Admission Chain'], ['PATTERN', 'Interceptor Pipe'], ['FAILURE MODE', 'Webhook Timeout'], ['EXAM TRACK', 'CKS · CNPE', 'red']],
        trace: { title: 'ADMISSION PIPELINE', rows: [['1. Mutate', '+ LimitRange defaults'], ['2. Schema', 'OpenAPI v3 valid ✓'], ['3. Validate', 'PSA Restricted PASS ✓']], banner: ['OBJECT MUTATED & VALIDATED ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'ADMISSION CONTROLLER PIPELINE', '#6E47B8')],
        nodes: [
          N('mut', 180, 175, 'cube', 'peach', 'Mutating', 'JSON Patch', ['✎ mutated', 'warn'], 'Injects defaults, sidecars, and ServiceAccount token mounts.'),
          N('sch', 410, 175, 'cube', 'sky', 'Schema Check', 'OpenAPI v3', ['✓ typed', 'green'], 'Ensures YAML fields and types match API version spec.'),
          N('val', 640, 175, 'shield', 'mint', 'Validating', 'PSA + CEL', ['✓ admitted', 'green'], 'Enforces cluster guardrails before writing to etcd.')
        ],
        edges: [E('mut', 'sch', 'req'), E('sch', 'val', 'ok')]
      },
      {
        short: 'etcd Raft Commit', cat: 'ARCHITECTURE',
        title: '4. etcd Raft Quorum Commit & Watch Fan-Out',
        body: ['kube-apiserver writes the validated Pod (with <code>nodeName: ""</code>) to <strong>etcd</strong>. The etcd Leader replicates the entry to a Raft majority (<code>2/3</code>) and assigns a monotonic <code>resourceVersion</code>.', 'API Server replies <code>201 Created</code> to kubectl and pushes an <code>ADDED</code> Watch event from its in-memory Watch Cache to kube-scheduler!'],
        yamlTitle: 'CLI · Inspect etcd Keys & Quorum',
        yaml: `ETCDCTL_API=3 etcdctl endpoint status --write-out=table\nETCDCTL_API=3 etcdctl get /registry/pods/prod --prefix --keys-only`,
        tip: 'Only kube-apiserver writes to etcd; Scheduler and Kubelets learn of the new Pod purely via HTTP/2 Watch streams.',
        metrics: [['COMPONENT', 'etcd + Watch'], ['PATTERN', 'Raft + Pub/Sub'], ['FAILURE MODE', 'Quorum Loss'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'ETCD COMMIT & WATCH', rows: [['write', '/registry/pods/prod/web'], ['Raft ack', '2 / 3 members (4ms)'], ['Watch push', 'ADDED rv=48201 -> sched']], banner: ['DURABLY COMMITTED IN ETCD ✓', 'purple'] },
        zones: [Z(280, 34, 490, 285, 'PERSISTENCE & EVENT FAN-OUT', '#6E47B8')],
        nodes: [
          N('api', 150, 175, 'hex', 'sky', 'API Server', '201 Created', ['✓ rv=48201', 'green'], 'Commits protobuf payload to etcd and updates Watch Cache.'),
          N('et', 420, 115, 'cyl', 'lavender', 'etcd Leader', 'Raft 2/3 ack', ['★ leader', 'green'], 'Persists Pod spec durably across cluster quorum.'),
          N('f1', 665, 115, 'cyl', 'mint', 'etcd Follower', 'WAL synced', ['✓ ack', 'green'], 'Replicates Raft log for HA fault tolerance.'),
          N('sc', 420, 252, 'cube', 'peach', 'kube-scheduler', 'Watch ADDED', ['↻ waking', 'warn'], 'Receives Watch event for unscheduled Pod immediately.')
        ],
        edges: [E('api', 'et', 'req'), E('et', 'f1', 'watch'), E('api', 'sc', 'watch')]
      },
      {
        short: 'Sched & Kubelet', cat: 'ARCHITECTURE',
        title: '5. Scheduler Binds Node -> Kubelet Starts Container',
        body: ['<strong>kube-scheduler</strong> filters and scores nodes, then posts a <code>Binding</code> setting <code>spec.nodeName: worker-2</code> via API Server.', '<strong>kubelet</strong> on <code>worker-2</code> receives the Watch event, invokes <strong>containerd (CRI)</strong> + <strong>CNI</strong> to start the Pod, and patches status to <code>Running</code>!'],
        yamlTitle: 'CLI · Trace Binding & CRI',
        yaml: `kubectl describe pod web -n prod | grep -A6 Events\ncrictl ps --name web`,
        tip: 'Scheduler never calls Kubelet directly! All coordination happens asynchronously through API Server state updates.',
        metrics: [['COMPONENT', 'Sched + Kubelet'], ['PATTERN', 'Choreography'], ['FAILURE MODE', 'Pending / ImagePull'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'POD STARTUP COMPLETE', rows: [['Scheduler', 'bind -> worker-2 (score 94)'], ['Kubelet', 'CRI pull + CNI 10.244.2.8'], ['Status', 'Phase: Running (Ready ✓)']], banner: ['POD RUNNING ON WORKER-2 ✓', 'green'] },
        zones: [Z(65, 38, 360, 275, 'CONTROL PLANE', '#4A7BC7'), Z(455, 38, 315, 275, 'WORKER NODE 2', '#1E7E45')],
        nodes: [
          N('sc', 155, 115, 'cube', 'peach', 'Scheduler', 'Filter -> Score', ['✓ bound', 'green'], 'Picks worker-2 based on CPU/RAM and topology spread.'),
          N('api', 325, 195, 'hex', 'sky', 'API Server', 'nodeName=w2', null, 'Records Binding in etcd and notifies worker-2 kubelet.'),
          N('kub', 555, 125, 'cube', 'mint', 'kubelet', 'CRI + CNI', ['↻ syncing', 'warn'], 'Reconciles local containers to match bound PodSpec.'),
          N('pod', 675, 245, 'pod', 'mint', 'web Pod', '10.244.2.8', ['✓ Running', 'green'], 'Healthy container passing ReadinessProbe.')
        ],
        edges: [E('sc', 'api', 'req'), E('api', 'kub', 'watch'), E('kub', 'pod', 'ok')]
      }
    ]
  },

  'etcd-raft-mvcc': {
    id: 'etcd-raft-mvcc', moduleId: 'm1', certs: ['CKA', 'CNPE'],
    title: 'etcd, Raft & MVCC',
    subtitle: 'Why Kubernetes needs odd-sized quorums, how Raft replicates logs, MVCC resourceVersion history, and lock-free OCC.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Calculate Raft quorum floor(N/2)+1 for 3 or 5 nodes',
      'Trace two-phase Raft log append & commit across members',
      'Understand MVCC revision numbers & Watch history',
      'Prevent lost updates via 409 Conflict (OCC)'
    ],
    steps: [
      {
        short: 'Quorum & Leader', cat: 'ARCHITECTURE',
        title: 'Raft Quorum: Why 3 or 5 Nodes (Never 2 or 4)',
        body: ['etcd uses the <strong>Raft</strong> consensus algorithm requiring a strict majority <code>floor(N/2) + 1</code> to elect a leader and commit writes.', 'A 3-node cluster tolerates 1 failure (quorum=2). A 2-node cluster ALSO needs 2 nodes—so losing 1 freezes the cluster completely!'],
        yamlTitle: 'CLI · Check Cluster Quorum',
        yaml: `etcdctl member list --write-out=table\netcdctl endpoint health --cluster`,
        tip: 'CKA Tip: Never run 2 etcd nodes—it actually has WORSE availability than 1 node because either node failing breaks quorum!',
        metrics: [['COMPONENT', 'etcd Raft'], ['QUORUM (3N)', '2 of 3 ✓', 'green'], ['FAULT TOL.', '1 Node Loss'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'RAFT QUORUM MATH', rows: [['3 nodes', 'quorum 2 (lose 1 OK)'], ['5 nodes', 'quorum 3 (lose 2 OK)'], ['2 nodes', 'quorum 2 (0 tolerance!)']], banner: ['ALWAYS USE ODD ETCD COUNTS ✓', 'green'] },
        zones: [Z(110, 36, 600, 278, '3-NODE ETCD QUORUM (SURVIVES 1 FAILURE)', '#6E47B8')],
        nodes: [
          N('e0', 250, 175, 'cyl', 'lavender', 'etcd-0', 'Raft Leader', ['★ leader', 'green'], 'Handles all client writes and sends heartbeats.'),
          N('e1', 540, 105, 'cyl', 'mint', 'etcd-1', 'Follower (up)', ['✓ vote', 'green'], 'Forms majority quorum (2/3) with etcd-0.'),
          N('e2', 540, 248, 'cyl', 'gray', 'etcd-2', 'OFFLINE', ['✗ down', 'red'], 'Lost node—cluster remains 100% writable.', true)
        ],
        edges: [E('e0', 'e1', 'ok'), E('e0', 'e2', 'err', { stop: 0.72 })]
      },
      {
        short: 'Log Replication', cat: 'ARCHITECTURE',
        title: 'AppendEntries: Durable fsync Before Returning 201',
        body: ['Every Kubernetes write goes to the etcd Leader, which appends it to its local WAL (disk fsync) and sends <code>AppendEntries</code> RPCs to Followers.', 'Once Followers fsync and acknowledge, the Leader commits the entry to BoltDB and returns success to kube-apiserver.'],
        yamlTitle: 'CLI · Benchmark Disk Fsync Latency',
        yaml: `fio --rw=write --ioengine=sync --fdatasync=1 \\\n  --directory=/var/lib/etcd --size=22m --bs=2300 --name=etcd_fsync`,
        tip: 'Slow etcd disk I/O (high fsync latency > 10ms) causes missed leader heartbeats and cluster-wide timeouts. Always use dedicated NVMe SSDs!',
        metrics: [['COMPONENT', 'WAL + BoltDB'], ['PATTERN', 'Replicated Log'], ['FAILURE MODE', 'Slow Disk fsync'], ['EXAM TRACK', 'CKA', 'purple']],
        trace: { title: 'APPENDENTRIES RPC', rows: [['1. leader WAL', 'fsync 1.8 ms'], ['2. followers', 'replicate + fsync'], ['3. commit', 'apply to BoltDB ✓']], banner: ['MAJORITY DISK FSYNC COMMITTED ✓', 'green'] },
        zones: [Z(285, 36, 485, 278, 'RAFT REPLICATED LOG', '#6E47B8')],
        nodes: [
          N('api', 145, 175, 'hex', 'sky', 'API Server', 'PUT /deploy', null, 'Sends serialized protobuf write to etcd leader.'),
          N('e0', 415, 175, 'cyl', 'lavender', 'etcd-0', 'WAL fsync', ['★ leader', 'green'], 'Appends log index #904 and replicates.'),
          N('e1', 665, 105, 'cyl', 'mint', 'etcd-1', 'fsync #904', ['✓ ack', 'green'], 'Acknowledges durable write.'),
          N('e2', 665, 248, 'cyl', 'mint', 'etcd-2', 'fsync #904', ['✓ ack', 'green'], 'Acknowledges durable write.')
        ],
        edges: [E('api', 'e0', 'req'), E('e0', 'e1', 'watch'), E('e0', 'e2', 'watch')]
      },
      {
        short: 'MVCC & rv', cat: 'ARCHITECTURE',
        title: 'MVCC Revisions Power Kubernetes resourceVersion',
        body: ['etcd is a <strong>Multi-Version Concurrency Control (MVCC)</strong> store. Updating a Pod never overwrites old bytes in-place; it appends a new revision (<code>rev=42 -> 43</code>).', 'Kubernetes exposes this global revision as <code>metadata.resourceVersion</code>, allowing Watch clients to stream exact historical deltas from any point before compaction.'],
        yamlTitle: 'CLI · Compact & Defragment etcd',
        yaml: `rev=$(etcdctl endpoint status --write-out=json | jq '.[0].Status.header.revision')\netcdctl compact $rev && etcdctl defrag --cluster`,
        tip: 'If a client tries to watch a resourceVersion older than etcd’s compaction window, API Server returns `410 Gone` and the client performs a fresh LIST.',
        metrics: [['COMPONENT', 'etcd MVCC'], ['PATTERN', 'Immutable Revs'], ['FAILURE MODE', '410 Gone Compact'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'MVCC TIMELINE', rows: [['rev=41', 'replicas: 2 (retained)'], ['rev=42', 'replicas: 3 (current)'], ['watch?rv=41', 'streams delta -> 42 ✓']], banner: ['TIME-TRAVEL WATCH HISTORY ✓', 'purple'] },
        zones: [Z(75, 42, 675, 268, 'ETCD MVCC KEY-REVISION TREE', '#6E47B8')],
        nodes: [
          N('r1', 180, 175, 'cyl', 'gray', 'rev = 41', 'replicas: 2', null, 'Previous immutable revision kept until periodic compaction.'),
          N('r2', 410, 175, 'cyl', 'lavender', 'rev = 42', 'replicas: 3', ['★ latest', 'green'], 'Current revision returned on GET and Watch.'),
          N('w', 645, 175, 'cube', 'mint', 'Watcher', 'streams rv=41+', ['✓ synced', 'green'], 'Catches up cleanly without missing intermediate states.')
        ],
        edges: [E('r1', 'r2', 'req'), E('r2', 'w', 'watch')]
      },
      {
        short: 'Optimistic Lock', cat: 'ARCHITECTURE',
        title: 'Optimistic Concurrency Control (409 Conflict)',
        body: ['Instead of holding slow distributed locks, Kubernetes attaches <code>resourceVersion</code> to every PUT. etcd performs an atomic compare-and-swap.', 'If Controller A and B both read <code>rv=42</code>, A updates to <code>rv=43</code> and B receives <strong>409 Conflict</strong>—forcing B to reload <code>rv=43</code> and retry without clobbering A’s edit!'],
        tip: 'CKA/CNPE Tip: When scripting updates, prefer `kubectl patch` or Server-Side Apply over read-modify-write loops to minimize 409 conflicts.',
        metrics: [['COMPONENT', 'CAS Transaction'], ['PATTERN', 'Lock-Free OCC'], ['FAILURE MODE', '409 Conflict'], ['EXAM TRACK', 'CNPE', 'warn']],
        trace: { title: 'ATOMIC CAS CHECK', rows: [['Ctrl A (rv=42)', '200 OK -> rv=43 ✓'], ['Ctrl B (rv=42)', '409 Conflict ✕'], ['Ctrl B action', 're-read rv=43 & retry']], banner: ['ZERO LOST UPDATES · LOCK-FREE ✓', 'warn'] },
        zones: [Z(320, 38, 445, 275, 'COMPARE-AND-SWAP IN ETCD', '#A8640C')],
        nodes: [
          N('ca', 145, 108, 'cube', 'mint', 'Controller A', 'PUT rv=42', ['✓ 200 OK', 'green'], 'Commits first and bumps revision to 43.'),
          N('cb', 145, 248, 'cube', 'coral', 'Controller B', 'PUT rv=42 stale', ['✗ 409', 'red'], 'Rejected atomically; safely retries with latest state.'),
          N('api', 445, 175, 'hex', 'sky', 'API Server', 'CAS rv==42?', null, 'Forwards conditional transaction to etcd.'),
          N('et', 665, 175, 'cyl', 'lavender', 'etcd', 'now rv=43', ['✓ atomic', 'green'], 'Guarantees linearizable compare-and-swap.')
        ],
        edges: [E('ca', 'api', 'ok'), E('cb', 'api', 'err', { stop: 0.78 }), E('api', 'et', 'watch')]
      }
    ]
  },

  'kubelet-cri-node': {
    id: 'kubelet-cri-node', moduleId: 'm1', certs: ['CKA', 'CNPE'],
    title: 'Kubelet, CRI & Node Internals',
    subtitle: 'How kubelet watches bound Pods, calls containerd over CRI gRPC, enforces cgroups & probes, and renews Node Leases.',
    duration: '10 min', difficulty: 'Core',
    checklist: [
      'Watch kubelet sync bound PodSpecs & Static Pods',
      'Trace CRI RunPodSandbox -> Pause Container + CNI',
      'Enforce CPU/Memory cgroups and kubelet health probes',
      'Understand Node Leases (10s heartbeat) & Node eviction'
    ],
    steps: [
      {
        short: 'PodSpec Sync', cat: 'ARCHITECTURE',
        title: 'Kubelet Watches Bound Pods & Local Static Manifests',
        body: ['<strong>kubelet</strong> runs as a Linux systemd daemon on every node. It watches kube-apiserver for Pods with <code>spec.nodeName == thisNode</code> AND monitors local <code>/etc/kubernetes/manifests/</code> for Static Pods.', 'Its internal <code>syncLoop</code> continuously drives local containers to match desired PodSpecs.'],
        yamlTitle: 'CLI · Node & Static Pod Diagnostics',
        yaml: `systemctl status kubelet\njournalctl -u kubelet -n 50 --no-pager\nls /etc/kubernetes/manifests/`,
        tip: 'CKA Exam Classic: Control plane components (apiserver, etcd, scheduler) are launched as Static Pods by kubelet itself—debug with `journalctl -u kubelet`!',
        metrics: [['COMPONENT', 'kubelet'], ['PATTERN', 'Node Reconciler'], ['FAILURE MODE', 'Node NotReady'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'KUBELET SYNC LOOP', rows: [['API Watch', 'fieldSelector=nodeName'], ['Static Dir', '/etc/kubernetes/manifests'], ['Sync Status', '12 Pods converged ✓']], banner: ['NODE RECONCILER ACTIVE ✓', 'green'] },
        zones: [Z(285, 36, 485, 278, 'WORKER NODE 1', '#1E7E45')],
        nodes: [
          N('api', 145, 118, 'hex', 'sky', 'API Server', 'Bound Pods', null, 'Streams PodSpecs assigned to worker-1.'),
          N('st', 145, 245, 'cube', 'yellow', 'Static Dir', '/etc/.../manifests', null, 'Local YAML files watched directly by kubelet.'),
          N('kub', 445, 175, 'cube', 'mint', 'kubelet', 'syncLoop()', ['✓ Ready', 'green'], 'Primary node agent managing container lifecycle.'),
          N('cri', 670, 175, 'cube', 'peach', 'containerd', 'CRI gRPC', null, 'Container runtime executing OCI images.')
        ],
        edges: [E('api', 'kub', 'watch'), E('st', 'kub', 'req'), E('kub', 'cri', 'ok')]
      },
      {
        short: 'CRI & Pause', cat: 'ARCHITECTURE',
        title: 'CRI gRPC: Pause Container Sandbox & CNI Network Wiring',
        body: ['Kubelet talks to <strong>containerd</strong> over a local Unix socket using the standard <strong>CRI (Container Runtime Interface)</strong>.', 'First, containerd spawns a tiny <code>pause</code> container to hold the Linux Network/IPC namespaces, calls the <strong>CNI plugin</strong> for a Pod IP, then pulls and launches your app containers inside that sandbox.'],
        yamlTitle: 'CLI · Direct CRI Inspection',
        yaml: `crictl pods\ncrictl ps -a\ncrictl inspectp <sandbox-id> | jq '.status.network'`,
        tip: 'Inspect runtime containers directly during CKA troubleshooting when apiserver is down using `crictl ps` and `crictl logs`!',
        metrics: [['COMPONENT', 'containerd / CRI'], ['PATTERN', 'Plugin Interface'], ['FAILURE MODE', 'CNI IP Exhaust'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'CRI SANDBOX FLOW', rows: [['1. CRI', 'RunPodSandbox(pause)'], ['2. CNI', 'attach veth0 10.244.1.9'], ['3. CRI', 'PullImage + StartContainer']], banner: ['SANDBOX & POD IP READY ✓', 'green'] },
        zones: [Z(70, 38, 690, 275, 'CRI + CNI POD BOOTSTRAP', '#E07B24')],
        nodes: [
          N('kub', 165, 175, 'cube', 'mint', 'kubelet', 'CRI gRPC', null, 'Drives containerd via /run/containerd/containerd.sock.'),
          N('cri', 395, 110, 'cube', 'peach', 'containerd', 'runc + OCI', ['✓ pulled', 'green'], 'Creates Linux namespaces and starts container process.'),
          N('cni', 395, 245, 'router', 'sky', 'CNI Plugin', 'Cilium / Calico', ['10.244.1.9', 'green'], 'Configures Pod IP and routing rules.'),
          N('pod', 655, 175, 'pod', 'mint', 'Pod Sandbox', 'pause + app', ['✓ Running', 'green'], 'Isolated Pod running with active network interface.')
        ],
        edges: [E('kub', 'cri', 'req'), E('kub', 'cni', 'watch'), E('cri', 'pod', 'ok'), E('cni', 'pod', 'ok')]
      },
      {
        short: 'Cgroups & Probes', cat: 'ARCHITECTURE',
        title: 'Linux cgroups v2 Limits & Kubelet Health Probes',
        body: ['containerd writes Pod <code>requests</code> and <code>limits</code> into Linux <strong>cgroups v2</strong>: exceeding CPU throttles cleanly, while exceeding Memory triggers an instant kernel <code>OOMKilled (Exit 137)</code>.', 'Kubelet independently runs <code>startupProbe</code>, <code>readinessProbe</code> (controls Service traffic), and <code>livenessProbe</code> (restarts deadlocked containers).'],
        yamlTitle: 'YAML · Startup, Readiness & Liveness Probes',
        yaml: `readinessProbe:\n  httpGet: { path: /readyz, port: 8080 }\n  periodSeconds: 5\nlivenessProbe:\n  httpGet: { path: /healthz, port: 8080 }\n  initialDelaySeconds: 15`,
        tip: 'Never point a LivenessProbe at a downstream database—a 5-second DB hiccup will make kubelet restart your entire app fleet!',
        metrics: [['COMPONENT', 'cgroups v2'], ['PATTERN', 'Kernel Isolation'], ['FAILURE MODE', 'OOM Exit 137'], ['EXAM TRACK', 'CKAD · CKA', 'warn']],
        trace: { title: 'CGROUPS & PROBES', rows: [['CPU limit', 'throttled (CFS quota)'], ['Mem limit', 'OOMKilled -> exit 137'], ['Probes', 'Ready ✓ · Live ✓']], banner: ['RESOURCES & HEALTH ENFORCED ✓', 'green'] },
        zones: [Z(280, 38, 490, 275, 'LINUX KERNEL & PROBE LOOP', '#1E7E45')],
        nodes: [
          N('kub', 145, 175, 'cube', 'mint', 'kubelet', 'HTTP /readyz', null, 'Polls container endpoints on probe interval.'),
          N('cg', 435, 115, 'shield', 'yellow', 'cgroups v2', '500m / 512Mi', ['✓ enforced', 'green'], 'Kernel resource accounting and memory cap.'),
          N('pod', 435, 245, 'pod', 'sky', 'App Container', '200 OK', ['✓ healthy', 'green'], 'Responds to readiness & liveness probes.'),
          N('es', 670, 175, 'cube', 'lavender', 'EndpointSlice', 'IP active', ['✓ in LB', 'green'], 'Pod IP receives Service traffic only when Ready.')
        ],
        edges: [E('kub', 'pod', 'req'), E('cg', 'pod', 'watch'), E('pod', 'es', 'ok')]
      },
      {
        short: 'Node Leases', cat: 'ARCHITECTURE',
        title: 'Lightweight Node Leases & Automatic Pod Eviction',
        body: ['Rather than sending giant full-Node status JSON every 10 seconds, kubelet renews a tiny <strong>Lease</strong> object in <code>kube-node-lease</code> every 10s.', 'If a node goes silent for 40s (<code>node-monitor-grace-period</code>), Node Controller marks it <code>NotReady</code> and adds a <code>NoExecute</code> taint to reschedule its Pods elsewhere!'],
        yamlTitle: 'CLI · Inspect Node Leases',
        yaml: `kubectl get leases -n kube-node-lease\nkubectl describe node worker-2 | grep -A8 Conditions`,
        tip: 'Separating Node Leases from Node Status objects slashed etcd write amplification by >80% on 5,000-node clusters.',
        metrics: [['COMPONENT', 'Node Lease'], ['PATTERN', 'Heartbeat Lease'], ['FAILURE MODE', '40s NotReady'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'NODE HEARTBEAT', rows: [['renew', 'every 10s (tiny Lease)'], ['grace', '40s -> status Unknown'], ['evict', 'toleration 300s -> move']], banner: ['FAST LOW-OVERHEAD HEARTBEAT ✓', 'green'] },
        zones: [Z(65, 38, 340, 275, 'WORKER NODES', '#1E7E45'), Z(435, 38, 335, 275, 'CONTROL PLANE', '#4A7BC7')],
        nodes: [
          N('w1', 210, 115, 'cube', 'mint', 'Node 1 kubelet', 'renew 10s', ['✓ Ready', 'green'], 'Renews lease smoothly every 10 seconds.'),
          N('w2', 210, 245, 'cube', 'gray', 'Node 2 kubelet', 'silent >40s', ['✗ NotReady', 'red'], 'Crashed node triggers NoExecute taint & Pod eviction.', true),
          N('ls', 540, 175, 'cyl', 'lavender', 'Lease API', 'kube-node-lease', ['↻ check', 'warn'], 'Lightweight coordination.k8s.io/v1 Lease objects.'),
          N('nc', 695, 175, 'cube', 'peach', 'Node Ctrl', 'taints w2', null, 'Evicts Pods from failed nodes after tolerationSeconds.')
        ],
        edges: [E('w1', 'ls', 'ok'), E('w2', 'ls', 'err', { stop: 0.68 }), E('ls', 'nc', 'watch')]
      }
    ]
  },

  /* ======================== MODULE 02 ======================== */
  'pods-multicontainer': {
    id: 'pods-multicontainer', moduleId: 'm2', certs: ['CKAD', 'CKA'],
    title: 'Pods & Multi-Container Patterns',
    subtitle: 'Shared Pod sandbox, Init Containers, Native Sidecars, Ambassador/Adapter proxies, and zero-502 Graceful Termination.',
    duration: '12 min', difficulty: 'Beginner',
    checklist: [
      'Share localhost & volumes across containers in 1 Pod',
      'Run ordered setup tasks with Init Containers',
      'Use Native Sidecars (restartPolicy: Always) cleanly',
      'Apply Ambassador & Adapter helper patterns',
      'Prevent 502s with preStop + SIGTERM termination'
    ],
    steps: [
      {
        short: 'Shared Net/IPC', cat: 'WORKLOAD',
        title: 'Shared Network, IPC & Volumes Inside One Pod',
        body: ['A Pod is a tightly coupled co-scheduled unit. All containers inside it share the same <strong>Pod IP</strong>, <code>localhost</code> network stack, IPC namespace, and mounted <code>emptyDir</code> volumes.', 'Because they share one network namespace, two containers in the same Pod cannot bind the same TCP port.'],
        tip: 'CKAD Tip: Only put multiple containers in one Pod when they must scale 1-to-1 and share localhost or local disk.',
        metrics: [['COMPONENT', 'Pod Sandbox'], ['PATTERN', 'Co-Located Host'], ['FAILURE MODE', 'Port Conflict'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'POD NAMESPACES', rows: [['Network', 'shared eth0 10.244.2.5'], ['Volume', 'shared emptyDir /logs'], ['PID/FS', 'isolated per container']], banner: ['SHARED LOGICAL HOST ACTIVE ✓', 'green'] },
        zones: [Z(115, 38, 590, 275, 'POD · 10.244.2.5 (SHARED NET + VOLUMES)', '#1E7E45')],
        nodes: [
          N('p', 235, 175, 'cube', 'lavender', 'pause:3.9', 'holds eth0', ['★ sandbox', 'green'], 'Preserves Pod network namespace across container restarts.'),
          N('a', 465, 112, 'pod', 'sky', 'App (:8080)', 'writes /logs', null, 'Main application server.'),
          N('v', 625, 175, 'cyl', 'yellow', 'emptyDir', '/var/log/app', null, 'Shared ephemeral memory/disk volume inside Pod.'),
          N('s', 465, 245, 'pod', 'mint', 'Agent (:9090)', 'reads /logs', null, 'Helper sharing localhost and emptyDir.')
        ],
        edges: [E('p', 'a', 'watch'), E('p', 's', 'watch'), E('a', 'v', 'req'), E('v', 's', 'ok')]
      },
      {
        short: 'Init Containers', cat: 'WORKLOAD',
        title: 'Init Containers: Sequential Setup Before App Starts',
        body: ['<strong>Init Containers</strong> run strictly one-by-one to completion (exit 0) before any main app container starts.', 'Use them for DB schema migrations, fetching Vault secrets, or waiting for an upstream Service to become reachable.'],
        yamlTitle: 'YAML · Wait-for-DB Init Container',
        yaml: `initContainers:\n- name: wait-db\n  image: busybox:1.36\n  command: ['sh', '-c', 'until nc -z postgres 5432; do sleep 2; done']`,
        tip: 'If an Init Container fails, kubelet restarts it until it succeeds—preventing your main app from crash-looping prematurely.',
        metrics: [['COMPONENT', 'initContainers'], ['PATTERN', 'Ordered Setup'], ['FAILURE MODE', 'Init:CrashLoop'], ['EXAM TRACK', 'CKAD', 'green']],
        trace: { title: 'INIT SEQUENCE', rows: [['1. init-wait', 'DB reachable -> exit 0'], ['2. init-mig', 'schema v4 -> exit 0'], ['3. main-app', 'container started ✓']], banner: ['ALL INITS PASSED -> APP LIVE ✓', 'green'] },
        zones: [Z(70, 42, 685, 265, 'SEQUENTIAL POD STARTUP', '#4A7BC7')],
        nodes: [
          N('i1', 175, 175, 'cube', 'yellow', 'init-wait-db', 'exit 0 ✓', ['1. done', 'green'], 'Blocks until postgres-svc resolves and accepts TCP.'),
          N('i2', 410, 175, 'cube', 'peach', 'init-migrate', 'exit 0 ✓', ['2. done', 'green'], 'Applies SQL migrations safely before app boots.'),
          N('app', 645, 175, 'pod', 'mint', 'Main App', 'Running :8080', ['3. live', 'green'], 'Starts only after every Init Container succeeds.')
        ],
        edges: [E('i1', 'i2', 'ok'), E('i2', 'app', 'ok')]
      },
      {
        short: 'Sidecar Pattern', cat: 'WORKLOAD',
        title: 'Native Sidecars (K8s 1.29+): Ordered Boot & Clean Job Exit',
        body: ['A <strong>Sidecar</strong> extends the main app (Envoy mTLS proxy, FluentBit log shipper) without changing app code.', 'By declaring a sidecar inside <code>initContainers</code> with <code>restartPolicy: Always</code>, Kubernetes starts it <em>before</em> the app, keeps it alive, and terminates it cleanly <em>after</em> a Job finishes!'],
        yamlTitle: 'YAML · Native Sidecar (K8s 1.29+)',
        yaml: `initContainers:\n- name: envoy-proxy\n  image: envoyproxy/envoy:v1.31\n  restartPolicy: Always`,
        tip: 'CKAD Exam Bonus: Native Sidecars permanently fix the classic problem where a mesh sidecar kept a finished batch Job stuck in Running forever.',
        metrics: [['COMPONENT', 'Native Sidecar'], ['PATTERN', 'Extender Proxy'], ['FAILURE MODE', 'Legacy Job Hang'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'NATIVE SIDECAR', rows: [['envoy-proxy', 'restartPolicy: Always'], ['startup', 'envoy Ready -> app'], ['shutdown', 'app exit -> envoy stop']], banner: ['NATIVE SIDECAR LIFECYCLE ✓', 'green'] },
        zones: [Z(110, 40, 600, 270, 'POD WITH NATIVE SIDECAR', '#6E47B8')],
        nodes: [
          N('sc', 250, 175, 'router', 'lavender', 'Envoy Sidecar', 'restart: Always', ['1. Ready', 'green'], 'Starts first to provide mTLS networking before app boots.'),
          N('app', 555, 175, 'pod', 'mint', 'App / Job', 'uses 127.0.0.1', ['2. Active', 'green'], 'Communicates over localhost through Envoy proxy.')
        ],
        edges: [E('sc', 'app', 'ok', { off: -10 }), E('app', 'sc', 'req', { off: 10 })]
      },
      {
        short: 'Ambass & Adapt', cat: 'WORKLOAD',
        title: 'Ambassador (Outbound Proxy) & Adapter (Output Normalizer)',
        body: ['An <strong>Ambassador</strong> container proxies outbound calls (e.g., Cloud SQL Proxy handling IAM auth & shard routing so the app just dials <code>localhost:5432</code>).', 'An <strong>Adapter</strong> transforms legacy app logs/metrics into a unified standard format (e.g., Prometheus <code>/metrics</code>).'],
        tip: 'Remember the 3 helper patterns for CKAD: Sidecar (adds capability), Ambassador (simplifies outbound network), Adapter (standardizes output).',
        metrics: [['COMPONENT', 'Helper Proxies'], ['PATTERN', 'Ambass / Adapt'], ['FAILURE MODE', 'Localhost Loop'], ['EXAM TRACK', 'CKAD', 'green']],
        trace: { title: 'HELPER CONTAINERS', rows: [['Ambassador', 'localhost:5432 -> Cloud DB'], ['Adapter', 'legacy log -> Prom JSON'], ['App code', '0 changes needed ✓']], banner: ['CLEAN SEPARATION OF CONCERNS ✓', 'green'] },
        zones: [Z(75, 38, 430, 275, 'APP POD', '#1E7E45')],
        nodes: [
          N('app', 175, 175, 'pod', 'sky', 'Legacy App', 'localhost only', null, 'Simple app unaware of cloud IAM or Prometheus schema.'),
          N('amb', 390, 108, 'router', 'peach', 'Ambassador', 'Cloud SQL Proxy', ['outbound', 'warn'], 'Handles TLS & IAM auth to external database.'),
          N('adp', 390, 245, 'cube', 'lavender', 'Adapter', 'Prom Exporter', ['normalize', 'green'], 'Converts proprietary stats to Prometheus format.'),
          N('db', 665, 108, 'cyl', 'mint', 'Cloud DB', 'IAM mTLS', null, 'External managed database.'),
          N('pr', 665, 245, 'cube', 'teal', 'Prometheus', 'scrapes :9100', null, 'Cluster metrics server.')
        ],
        edges: [E('app', 'amb', 'req'), E('amb', 'db', 'ok'), E('app', 'adp', 'watch'), E('pr', 'adp', 'ok')]
      },
      {
        short: 'Graceful Exit', cat: 'WORKLOAD',
        title: 'Zero-502 Termination: Parallel Endpoint Drain + preStop',
        body: ['When a Pod is deleted, two things fire <strong>in parallel</strong>: EndpointSlices remove its IP across nodes, AND kubelet begins container termination.', 'Adding a <code>preStop: sleep 5</code> hook lets in-flight traffic drain while kube-proxy updates every node, before <code>SIGTERM</code> cleanly stops the app!'],
        yamlTitle: 'YAML · Zero-502 preStop Hook',
        yaml: `lifecycle:\n  preStop:\n    exec: { command: ["/bin/sh", "-c", "sleep 5"] }`,
        tip: 'If a process ignores SIGTERM past `terminationGracePeriodSeconds` (default 30s), kubelet forcefully terminates it with SIGKILL.',
        metrics: [['COMPONENT', 'preStop + SIGTERM'], ['PATTERN', 'Graceful Drain'], ['FAILURE MODE', 'Deploy 502s'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'TERMINATION TIMELINE', rows: [['t=0s', 'Terminating + preStop'], ['t=1.2s', 'kube-proxy drops IP ✓'], ['t=5s', 'SIGTERM -> exit 0 ✓']], banner: ['ZERO DROPPED REQUESTS (0 502s) ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'PARALLEL ENDPOINT REMOVAL & SHUTDOWN', '#1E7E45')],
        nodes: [
          N('del', 165, 175, 'hex', 'sky', 'DELETE Pod', 'Terminating', null, 'Sets deletionTimestamp and fires parallel notifications.'),
          N('kp', 435, 108, 'router', 'peach', 'kube-proxy', 'removes IP (1s)', ['✓ drained', 'green'], 'Stops routing new requests to the terminating Pod.'),
          N('ps', 435, 245, 'pod', 'mint', 'preStop (5s)', 'then SIGTERM', ['✓ 0 502s', 'green'], 'Waits safely so stray packets finish cleanly.'),
          N('ex', 670, 175, 'cube', 'gray', 'Clean Exit', 'exit code 0', null, 'Pod removed cleanly from cluster.')
        ],
        edges: [E('del', 'kp', 'watch'), E('del', 'ps', 'req'), E('ps', 'ex', 'ok')]
      }
    ]
  },

  'namespaces-quotas': {
    id: 'namespaces-quotas', moduleId: 'm2', certs: ['CKAD', 'CKA', 'CKS'],
    title: 'Namespaces, Quotas & LimitRanges',
    subtitle: 'Multi-tenant isolation boundaries, aggregate ResourceQuotas preventing noisy neighbors, and LimitRange safety defaults.',
    duration: '7 min', difficulty: 'Beginner',
    checklist: [
      'Isolate teams, RBAC & DNS with Namespaces',
      'Cap aggregate tenant CPU/RAM with ResourceQuota',
      'Inject automatic per-Pod defaults with LimitRange'
    ],
    steps: [
      {
        short: 'NS Isolation', cat: 'WORKLOAD',
        title: 'Namespaces: Logical Partitioning for Teams & DNS',
        body: ['<strong>Namespaces</strong> partition a physical cluster into virtual sub-clusters for RBAC, ResourceQuotas, NetworkPolicies, and DNS scoping (<code>api.prod.svc</code> vs <code>api.dev.svc</code>).', 'Note: Cluster-scoped objects like Nodes, PVs, StorageClasses, and CRDs live outside Namespaces.'],
        yamlTitle: 'CLI · Namespaced vs Cluster-Scoped',
        yaml: `kubectl api-resources --namespaced=true\nkubectl api-resources --namespaced=false`,
        tip: 'Check which resources are namespaced vs cluster-scoped anytime using `kubectl api-resources --namespaced=false`.',
        metrics: [['COMPONENT', 'Namespace'], ['PATTERN', 'Soft Tenancy'], ['FAILURE MODE', 'Cross-NS Leak'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'NAMESPACE SCOPING', rows: [['ns: prod', 'api.prod.svc.cluster.local'], ['ns: staging', 'api.staging.svc'], ['cluster', 'Nodes · PVs · CRDs']], banner: ['CLEAN TEAM BOUNDARIES ✓', 'green'] },
        zones: [Z(65, 42, 325, 265, 'NS: PROD', '#1E7E45'), Z(425, 42, 330, 265, 'NS: STAGING', '#4A7BC7')],
        nodes: [
          N('p1', 228, 175, 'cluster', 'mint', 'Prod Workloads', 'strict RBAC + PSA', ['✓ prod', 'green'], 'Isolated production namespace with strict guardrails.'),
          N('s1', 590, 175, 'cluster', 'sky', 'Staging Pods', 'dev RBAC', ['staging', 'warn'], 'Separate DNS and quota budget for testing.')
        ],
        edges: []
      },
      {
        short: 'ResourceQuotas', cat: 'WORKLOAD',
        title: 'ResourceQuota Caps Aggregate CPU, Memory & Object Counts',
        body: ['A <strong>ResourceQuota</strong> sets hard ceilings for a Namespace (e.g., max <code>4 CPU</code>, <code>8Gi RAM</code>, <code>20 Pods</code>).', 'When a team hits its quota, kube-apiserver immediately rejects additional Pods with <code>403 Forbidden (exceeded quota)</code>—protecting other tenants!'],
        yamlTitle: 'YAML · Namespace ResourceQuota',
        yaml: `apiVersion: v1\nkind: ResourceQuota\nmetadata: { name: staging-quota, namespace: staging }\nspec:\n  hard: { requests.cpu: "4", limits.memory: 8Gi, pods: "20" }`,
        tip: 'CKA Trap: Once a CPU/Memory ResourceQuota exists in a Namespace, EVERY Pod created there MUST specify requests/limits or it will be rejected!',
        metrics: [['COMPONENT', 'ResourceQuota'], ['CPU USED', '4.0 / 4.0', 'red'], ['EXTRA POD', '403 Blocked', 'red'], ['EXAM TRACK', 'CKA · CKAD', 'warn']],
        trace: { title: 'QUOTA ADMISSION', rows: [['ns: staging', '4.0 / 4.0 CPU used'], ['new Pod +1CPU', '403 exceeded quota ✕'], ['prod ns', '100% protected ✓']], banner: ['NOISY NEIGHBOR BLOCKED ✓', 'red'] },
        zones: [Z(330, 38, 435, 275, 'NS: STAGING · QUOTA 4.0 CPU MAX', '#C93632')],
        nodes: [
          N('np', 150, 175, 'pod', 'coral', 'Extra Pod', '+1.0 CPU', ['✗ 403 Quota', 'red'], 'Rejected at Admission before reaching Scheduler.'),
          N('qg', 435, 175, 'shield', 'yellow', 'Quota Gate', '4.0 / 4.0 full', ['✗ full', 'red'], 'Enforces hard aggregate budget for the Namespace.'),
          N('ex', 660, 175, 'cluster', 'sky', 'Active Pods', '4.0 CPU', null, 'Existing workloads remain unaffected.')
        ],
        edges: [E('np', 'qg', 'err', { stop: 0.85 })]
      },
      {
        short: 'LimitRanges', cat: 'WORKLOAD',
        title: 'LimitRange Auto-Injects Safe Per-Container Defaults',
        body: ['Pair ResourceQuotas with a <strong>LimitRange</strong>! Its Mutating Admission controller automatically injects <code>defaultRequest</code> and <code>default</code> limits onto any Pod that omits them—and enforces min/max container sizes.'],
        yamlTitle: 'YAML · LimitRange Default Injection',
        yaml: `apiVersion: v1\nkind: LimitRange\nmetadata: { name: defaults, namespace: staging }\nspec:\n  limits:\n  - type: Container\n    default: { cpu: 500m, memory: 512Mi }\n    defaultRequest: { cpu: 200m, memory: 256Mi }`,
        tip: 'LimitRange acts on individual containers/Pods; ResourceQuota acts on the sum across the entire Namespace.',
        metrics: [['COMPONENT', 'LimitRange'], ['DEFAULT REQ', '200m / 256Mi', 'green'], ['MAX CAP', '2 CPU / 2Gi'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'LIMITRANGE MUTATION', rows: [['incoming Pod', 'no limits specified'], ['LimitRange', 'inject 200m / 256Mi ✓'], ['Quota check', '2.2 / 4.0 CPU -> OK ✓']], banner: ['SAFE DEFAULTS AUTO-INJECTED ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'NS: STAGING · LIMITRANGE + QUOTA', '#1E7E45')],
        nodes: [
          N('p', 145, 175, 'pod', 'sky', 'Bare Pod', 'no limits set', null, 'Developer omitted resources block.'),
          N('lr', 425, 175, 'cube', 'peach', 'LimitRange', '+200m/256Mi', ['✎ mutated', 'warn'], 'Mutates Pod spec with safe default requests & limits.'),
          N('ok', 665, 175, 'pod', 'mint', 'Admitted Pod', 'bounded ✓', ['✓ scheduled', 'green'], 'Passes ResourceQuota and schedules cleanly.')
        ],
        edges: [E('p', 'lr', 'req'), E('lr', 'ok', 'ok')]
      }
    ]
  },

  'deployments-rollouts': {
    id: 'deployments-rollouts', moduleId: 'm2', certs: ['CKAD', 'CKA'],
    title: 'Deployments & Rollout Strategies',
    subtitle: 'Deployment -> ReplicaSet -> Pod ownership, zero-downtime RollingUpdate math, instant rollback, and canary splits.',
    duration: '10 min', difficulty: 'Core',
    checklist: [
      'Trace Deployment -> ReplicaSet -> Pod ownership',
      'Tune maxSurge & maxUnavailable for zero downtime',
      'Roll back broken releases instantly with rollout undo',
      'Run progressive Canary traffic splits safely'
    ],
    steps: [
      {
        short: 'RS Ownership', cat: 'WORKLOAD',
        title: 'Deployment -> ReplicaSet -> Pod Ownership Chain',
        body: ['A <strong>Deployment</strong> manages release history by owning <strong>ReplicaSets</strong>, and each ReplicaSet maintains the exact desired count of stateless <strong>Pods</strong>.', 'Every Pod carries an <code>ownerReferences</code> pointer so garbage collection and self-healing work seamlessly.'],
        tip: 'Never edit a ReplicaSet directly—Deployment will immediately reconcile it back or create drift.',
        metrics: [['COMPONENT', 'Deployment'], ['REPLICAS', '3 / 3 Ready', 'green'], ['PATTERN', 'Controller Chain'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'OWNERSHIP CHAIN', rows: [['Deployment', 'web (image: v1)'], ['ReplicaSet', 'web-7c9f (3/3)'], ['Self-Heal', 'active ✓']], banner: ['STATELESS FLEET CONVERGED ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'DEPLOYMENT OWNERSHIP GRAPH', '#1E7E45')],
        nodes: [
          N('d', 180, 175, 'cube', 'lavender', 'Deployment', 'replicas: 3 · v1', ['✓ synced', 'green'], 'Declarative rollout manager for stateless apps.'),
          N('rs', 410, 175, 'cube', 'peach', 'ReplicaSet v1', 'ownerRef: web', null, 'Maintains exact Pod count matching selector.'),
          N('p', 640, 175, 'cluster', 'mint', 'v1 Pods (3x)', '3/3 Ready', ['✓ healthy', 'green'], 'Interchangeable stateless application replicas.')
        ],
        edges: [E('d', 'rs', 'watch'), E('rs', 'p', 'ok')]
      },
      {
        short: 'RollingUpdate', cat: 'WORKLOAD',
        title: 'RollingUpdate: maxSurge & maxUnavailable Zero Downtime',
        body: ['Updating to <code>v2</code> spawns a new <strong>ReplicaSet v2</strong>. With <code>maxSurge: 1</code> and <code>maxUnavailable: 0</code>, Kubernetes boots a Ready v2 Pod <em>before</em> terminating any v1 Pod.', 'If v2 fails its <code>readinessProbe</code>, rollout halts automatically while 100% of v1 capacity stays online!'],
        yamlTitle: 'YAML · Zero-Downtime Strategy',
        yaml: `strategy:\n  type: RollingUpdate\n  rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }`,
        tip: 'CKAD Tip: Monitor rollouts live with `kubectl rollout status deploy/web` and pause mid-way with `kubectl rollout pause`.',
        metrics: [['MAX SURGE', '+1 Pod', 'green'], ['MAX UNAVAIL', '0 Pods ✓', 'green'], ['RS v1 -> v2', '3 -> 2 / 0 -> 1'], ['EXAM TRACK', 'CKAD', 'green']],
        trace: { title: 'ROLLING UPDATE', rows: [['RS v2', 'surge +1 -> Ready ✓'], ['RS v1', 'scale down 3 -> 2'], ['Capacity', 'always >= 100% ✓']], banner: ['ZERO-DOWNTIME SURGE ACTIVE ✓', 'green'] },
        zones: [Z(305, 36, 460, 278, 'SIDE-BY-SIDE REPLICASETS', '#6E47B8')],
        nodes: [
          N('d', 150, 175, 'cube', 'lavender', 'Deployment', 'image -> v2', ['↻ rolling', 'warn'], 'Orchestrates gradual shift from v1 to v2.'),
          N('r1', 425, 110, 'cube', 'sky', 'RS v1', 'draining (2)', null, 'Old ReplicaSet scales down only after v2 is Ready.'),
          N('r2', 425, 245, 'cube', 'mint', 'RS v2 (New)', 'surging (+1)', ['+ maxSurge', 'green'], 'New ReplicaSet boots v2 Pods.'),
          N('p2', 665, 245, 'pod', 'mint', 'v2 Pod', '/readyz 200', ['✓ Ready', 'green'], 'Joins Service endpoints cleanly.')
        ],
        edges: [E('d', 'r1', 'watch'), E('d', 'r2', 'ok'), E('r2', 'p2', 'ok')]
      },
      {
        short: 'Rollback', cat: 'WORKLOAD',
        title: 'Instant Rollback Using Archived ReplicaSets',
        body: ['Deployment keeps old ReplicaSets scaled to <code>0</code> (controlled by <code>revisionHistoryLimit: 10</code>).', 'If v2 exhibits elevated 5xx errors in production, <code>kubectl rollout undo deploy/web</code> flips traffic right back to archived RS v1 in seconds!'],
        yamlTitle: 'CLI · Rollout History & Undo',
        yaml: `kubectl rollout history deploy/web\nkubectl rollout undo deploy/web --to-revision=1`,
        tip: 'Use `--to-revision=N` to jump back to any specific historical revision shown in `kubectl rollout history`.',
        metrics: [['ACTION', 'rollout undo'], ['RS v2', 'Scaled -> 0', 'red'], ['RS v1', 'Restored -> 3', 'green'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'INSTANT ROLLBACK', rows: [['command', 'kubectl rollout undo'], ['RS v2 (bad)', '3 -> 0 terminated'], ['RS v1 (good)', '0 -> 3 restored (6s)']], banner: ['ROLLED BACK TO STABLE V1 ✓', 'green'] },
        zones: [Z(305, 36, 460, 278, 'REVISION RECOVERY', '#1E7E45')],
        nodes: [
          N('d', 150, 175, 'cube', 'mint', 'rollout undo', '-> rev 1', ['↶ undo', 'warn'], 'Reverts Deployment template to archived v1 spec.'),
          N('r1', 435, 110, 'cube', 'mint', 'RS v1 (Restored)', 'replicas: 3', ['✓ active', 'green'], 'Proven revision restored immediately.'),
          N('r2', 435, 245, 'cube', 'gray', 'RS v2 (Buggy)', 'replicas: 0', ['✗ drained', 'red'], 'Faulty release scaled down safely.', true),
          N('p1', 665, 110, 'cluster', 'mint', 'v1 Pods (3x)', 'serving 100%', ['✓ healthy', 'green'], 'Error rate drops immediately back to 0%.')
        ],
        edges: [E('d', 'r1', 'ok'), E('d', 'r2', 'err', { stop: 0.72 }), E('r1', 'p1', 'ok')]
      },
      {
        short: 'Canary Split', cat: 'WORKLOAD',
        title: 'Canary Releases: Small Blast-Radius Traffic Slice',
        body: ['Run a 1-replica <strong>Canary Deployment</strong> sharing the same Service label (<code>app: web</code>) alongside 9 stable replicas to expose only <strong>10%</strong> of users—or use Gateway API / Argo Rollouts for exact 1%–5% weighted splits with automated metric analysis.'],
        tip: 'Canarying limits blast radius: verify p99 latency & error budgets on 5% of real traffic before promoting to 100%.',
        metrics: [['STABLE V1', '90% Traffic', 'green'], ['CANARY V2', '10% Traffic', 'purple'], ['BLAST RADIUS', 'Minimized ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'CANARY EXPOSURE', rows: [['stable (9 pods)', '90% live traffic ✓'], ['canary (1 pod)', '10% monitored slice'], ['p99 / 5xx', 'within SLO -> promote']], banner: ['PROGRESSIVE CANARY HEALTHY ✓', 'green'] },
        zones: [Z(300, 36, 465, 278, 'CANARY TRAFFIC SPLIT', '#1E7E45')],
        nodes: [
          N('svc', 150, 175, 'router', 'peach', 'web-svc / GW', '90 / 10 split', null, 'Routes requests across stable and canary backends.'),
          N('v1', 535, 108, 'cluster', 'mint', 'Stable v1 (9x)', '90% traffic', ['90%', 'green'], 'Proven production replicas.'),
          N('v2', 535, 245, 'pod', 'sky', 'Canary v2 (1x)', '10% traffic', ['10%', 'warn'], 'Monitored release candidate.')
        ],
        edges: [E('svc', 'v1', 'ok', { count: 3 }), E('svc', 'v2', 'watch', { count: 1 })]
      }
    ]
  },

  'stateful-daemon-jobs': {
    id: 'stateful-daemon-jobs', moduleId: 'm2', certs: ['CKAD', 'CKA'],
    title: 'StatefulSets, DaemonSets & Jobs',
    subtitle: 'Ordered sticky Pods & Headless DNS, per-Pod PVCs, node-wide DaemonSets, and finite Jobs/CronJobs.',
    duration: '10 min', difficulty: 'Core',
    checklist: [
      'Assign deterministic ordinals (db-0, db-1) via StatefulSet',
      'Bind dedicated sticky PVCs with volumeClaimTemplates',
      'Schedule 1 agent per node automatically via DaemonSet',
      'Run finite & scheduled tasks cleanly with Jobs/CronJobs'
    ],
    steps: [
      {
        short: 'Sticky Identity', cat: 'WORKLOAD',
        title: 'StatefulSet: Ordered Ordinals & Headless DNS',
        body: ['Distributed databases (Postgres, Kafka, etcd) need stable network identity. A <strong>StatefulSet</strong> boots Pods strictly in order (<code>db-0 -> db-1 -> db-2</code>).', 'Paired with a <strong>Headless Service</strong> (<code>clusterIP: None</code>), every Pod gets a permanent DNS record: <code>db-0.db-headless.prod.svc</code>.'],
        tip: 'Scale-down happens in reverse order (db-2 -> db-1 -> db-0) so primaries never drop while replicas are still syncing.',
        metrics: [['COMPONENT', 'StatefulSet'], ['DNS NAMES', 'db-0.db-svc', 'green'], ['ORDER', '0 -> 1 -> 2'], ['EXAM TRACK', 'CKA · CKAD', 'purple']],
        trace: { title: 'STATEFUL ORDINALS', rows: [['db-0', 'Ready -> starts db-1'], ['DNS', 'db-0.db.prod.svc'], ['replication', 'db-0 -> db-1 ✓']], banner: ['STABLE PET IDENTITY ACTIVE ✓', 'green'] },
        zones: [Z(285, 36, 480, 278, 'STATEFULSET + HEADLESS SERVICE', '#6E47B8')],
        nodes: [
          N('hl', 145, 175, 'router', 'lavender', 'Headless Svc', 'clusterIP: None', null, 'Returns individual Pod A/AAAA records directly.'),
          N('d0', 425, 112, 'pod', 'mint', 'db-0', 'Primary · #0', ['★ leader', 'green'], 'Ordinal 0 always boots first.'),
          N('d1', 425, 245, 'pod', 'sky', 'db-1', 'Replica · #1', ['✓ sync', 'green'], 'Ordinal 1 boots only after db-0 is Ready.'),
          N('d2', 665, 245, 'pod', 'sky', 'db-2', 'Replica · #2', ['✓ sync', 'green'], 'Ordinal 2 joins replication quorum.')
        ],
        edges: [E('hl', 'd0', 'req'), E('hl', 'd1', 'req'), E('d0', 'd1', 'ok'), E('d1', 'd2', 'ok')]
      },
      {
        short: 'Sticky PVCs', cat: 'WORKLOAD',
        title: 'volumeClaimTemplates: Dedicated 1:1 Persistent Storage',
        body: ['Each StatefulSet Pod gets its own dynamically provisioned PVC (<code>data-db-0</code>, <code>data-db-1</code>).', 'If <code>db-0</code> crashes and reschedules onto another Worker Node, Kubernetes re-attaches the exact same <code>data-db-0</code> disk to it!'],
        tip: 'Deleting a StatefulSet intentionally leaves PVCs intact by default to prevent accidental production database wipes.',
        metrics: [['COMPONENT', 'ClaimTemplates'], ['STORAGE', '1:1 Per Pod', 'green'], ['ON RESCHEDULE', 'Re-Attaches ✓', 'green'], ['EXAM TRACK', 'CKA', 'purple']],
        trace: { title: 'PER-POD PVC MAP', rows: [['db-0 <->', 'pvc/data-db-0 (50Gi)'], ['db-1 <->', 'pvc/data-db-1 (50Gi)'], ['delete STS', 'PVCs retained safely ✓']], banner: ['DEDICATED STICKY DISKS BOUND ✓', 'green'] },
        zones: [Z(110, 38, 600, 275, '1:1 STICKY POD-TO-PVC BINDING', '#6E47B8')],
        nodes: [
          N('d0', 260, 110, 'pod', 'mint', 'db-0', 'Primary', ['★ #0', 'green'], 'Always mounts data-db-0.'),
          N('v0', 260, 245, 'cyl', 'lavender', 'data-db-0', '50Gi SSD', ['✓ Bound', 'green'], 'Dedicated cloud block volume for db-0.'),
          N('d1', 555, 110, 'pod', 'sky', 'db-1', 'Replica', ['#1', 'green'], 'Always mounts data-db-1.'),
          N('v1', 555, 245, 'cyl', 'lavender', 'data-db-1', '50Gi SSD', ['✓ Bound', 'green'], 'Dedicated cloud block volume for db-1.')
        ],
        edges: [E('d0', 'v0', 'watch'), E('d1', 'v1', 'watch'), E('d0', 'd1', 'ok')]
      },
      {
        short: 'DaemonSet', cat: 'WORKLOAD',
        title: 'DaemonSet: Automatically One Agent Pod Per Node',
        body: ['Use a <strong>DaemonSet</strong> for cluster-wide node agents: Cilium/Calico CNI, FluentBit log collectors, Prometheus node-exporter, or Falco eBPF.', 'Whenever autoscaling adds a new Worker Node, DaemonSet schedules an agent onto it automatically!'],
        tip: 'DaemonSet Pods ignore unschedulable node cordons and often carry tolerations to run on Control Plane nodes too.',
        metrics: [['COMPONENT', 'DaemonSet'], ['COVERAGE', '1 Pod / Node', 'green'], ['NEW NODE', 'Auto-Placed ✓', 'green'], ['EXAM TRACK', 'CKA · CKS', 'green']],
        trace: { title: 'DAEMONSET COVERAGE', rows: [['node-1', 'agent Running ✓'], ['node-2', 'agent Running ✓'], ['node-3 (new)', '+ agent auto-added ✓']], banner: ['100% FLEET AGENT COVERAGE ✓', 'green'] },
        zones: [Z(65, 155, 210, 150, 'NODE 1', '#1E7E45'), Z(305, 155, 210, 150, 'NODE 2', '#1E7E45'), Z(545, 155, 210, 150, 'NODE 3 (NEW)', '#6E47B8')],
        nodes: [
          N('ds', 410, 82, 'cube', 'lavender', 'DaemonSet', 'fluentbit / falco', ['↻ sync', 'green'], 'Reconciles one Pod onto every matching node.'),
          N('n1', 170, 232, 'pod', 'mint', 'Agent', 'Node 1', null, 'Collects Node 1 logs & eBPF telemetry.'),
          N('n2', 410, 232, 'pod', 'mint', 'Agent', 'Node 2', null, 'Collects Node 2 logs & eBPF telemetry.'),
          N('n3', 650, 232, 'pod', 'mint', 'Agent', 'Node 3', ['+ auto', 'green'], 'Automatically placed when Node 3 joined.')
        ],
        edges: [E('ds', 'n1', 'watch'), E('ds', 'n2', 'watch'), E('ds', 'n3', 'ok')]
      },
      {
        short: 'Jobs & CronJobs', cat: 'WORKLOAD',
        title: 'Jobs & CronJobs: Finite Run-to-Completion Batch Tasks',
        body: ['A <strong>Job</strong> runs Pods until <code>completions</code> exit with code <code>0</code> (retrying failures up to <code>backoffLimit</code>) and does not restart finished Pods.', 'A <strong>CronJob</strong> spawns Jobs on a cron schedule (e.g. <code>0 2 * * *</code> nightly backups).'],
        yamlTitle: 'YAML · CronJob Concurrency Guard',
        yaml: `spec:\n  schedule: "0 2 * * *"\n  concurrencyPolicy: Forbid\n  jobTemplate:\n    spec: { completions: 3, parallelism: 2, ttlSecondsAfterFinished: 3600 }`,
        tip: 'CKAD Tip: Always configure `restartPolicy: Never` or `OnFailure` (never `Always`), plus `ttlSecondsAfterFinished` to auto-clean completed Job Pods.',
        metrics: [['COMPONENT', 'Job / CronJob'], ['COMPLETIONS', '3 / 3 Exit 0', 'green'], ['CONCURRENCY', 'Forbid'], ['EXAM TRACK', 'CKAD', 'green']],
        trace: { title: 'BATCH EXECUTION', rows: [['CronJob', '02:00 UTC triggered'], ['Job', 'parallelism: 2 · 3/3 OK'], ['TTL GC', 'cleanup after 3600s']], banner: ['BATCH JOB SUCCEEDED (EXIT 0) ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'SCHEDULED BATCH PIPELINE', '#E07B24')],
        nodes: [
          N('cj', 180, 175, 'cube', 'peach', 'CronJob', '0 2 * * *', ['⏱ trigger', 'warn'], 'Spawns a Job object on schedule.'),
          N('j', 410, 175, 'cube', 'sky', 'Job', 'completions: 3', null, 'Tracks successful Pod completions and backoff retries.'),
          N('p', 640, 175, 'cluster', 'mint', 'Worker Pods', 'Completed (0)', ['✓ exit 0', 'green'], 'Finished batch containers cleaned up via TTL.')
        ],
        edges: [E('cj', 'j', 'req'), E('j', 'p', 'ok')]
      }
    ]
  },

  /* ======================== MODULE 03 ======================== */
  'configmaps-secrets': {
    id: 'configmaps-secrets', moduleId: 'm4', certs: ['CKA', 'CKAD', 'CKS'],
    title: 'ConfigMaps, Secrets & Encryption',
    subtitle: 'Decoupling config from container images, env vs volume hot-reloading, and encrypting etcd Secrets at rest with KMS v2.',
    duration: '8 min', difficulty: 'Core',
    checklist: [
      'Inject ConfigMaps & Secrets via Env Vars vs Projected Volumes',
      'Trigger zero-restart config updates with volume mounts',
      'Encrypt Kubernetes Secrets in etcd via EncryptionConfiguration'
    ],
    steps: [
      {
        short: 'Env vs Volumes', cat: 'STORAGE',
        title: 'Decoupled Config: Env Vars vs Projected tmpfs Volumes',
        body: ['Keep container images 100% portable across environments by injecting settings via <strong>ConfigMaps</strong> and sensitive credentials via <strong>Secrets</strong>.', 'Mount Secrets as <strong>tmpfs RAM volumes</strong> (never written to node disk) rather than Env Vars, which can accidentally leak in crash dumps or <code>/proc</code> logs.'],
        tip: 'CKS Tip: Base64 encoding in Secrets is NOT encryption! Always protect Secrets with RBAC, tmpfs mounts, and etcd encryption.',
        metrics: [['COMPONENT', 'ConfigMap/Secret'], ['SECRET MOUNT', 'tmpfs (RAM)', 'green'], ['FAILURE MODE', 'Env Log Leak'], ['EXAM TRACK', 'CKAD · CKS', 'purple']],
        trace: { title: 'CONFIG INJECTION', rows: [['ConfigMap', '/etc/app/app.yaml'], ['Secret', 'tmpfs /run/secrets'], ['Disk Write', '0 bytes (RAM only) ✓']], banner: ['PORTABLE IMMUTABLE IMAGES ✓', 'green'] },
        zones: [Z(100, 38, 625, 275, 'RUNTIME CONFIGURATION INJECTION', '#4A7BC7')],
        nodes: [
          N('cm', 210, 112, 'cyl', 'sky', 'ConfigMap', 'app.yaml', null, 'Plaintext non-sensitive runtime settings.'),
          N('sec', 210, 245, 'cyl', 'lavender', 'Secret', 'DB creds (tmpfs)', ['🔒 RAM', 'green'], 'Mounted in-memory as tmpfs volume inside Pod.'),
          N('pod', 575, 175, 'pod', 'mint', 'App Pod', 'immutable image', ['✓ configured', 'green'], 'Runs identical OCI image across dev/staging/prod.')
        ],
        edges: [E('cm', 'pod', 'req'), E('sec', 'pod', 'watch')]
      },
      {
        short: 'Hot Reload', cat: 'STORAGE',
        title: 'Automatic Volume Hot-Reload vs Immutable ConfigMaps',
        body: ['When you update a ConfigMap mounted as a <strong>Volume</strong> (without <code>subPath</code>), kubelet atomically swaps the symlink inside running Pods within ~60s—zero Pod restart needed!', 'By contrast, Env Vars and <code>subPath</code> mounts never auto-refresh until the Pod restarts.'],
        tip: 'Set `immutable: true` on large production ConfigMaps to stop kubelet watches and protect apps from accidental live mutations.',
        metrics: [['VOLUME MOUNT', 'Auto-Sync ~60s', 'green'], ['ENV / SUBPATH', 'Restart Needed', 'warn'], ['IMMUTABLE', '0 Watch Load'], ['EXAM TRACK', 'CKAD', 'green']],
        trace: { title: 'KUBELET SYNC', rows: [['edit ConfigMap', 'logLevel: debug'], ['volume mount', 'atomic symlink swap ✓'], ['env var', 'stale until rollout']], banner: ['VOLUME CONFIG HOT-RELOADED ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'WORKER NODE · KUBELET VOLUME SYNC', '#1E7E45')],
        nodes: [
          N('cm', 145, 175, 'cyl', 'sky', 'ConfigMap v2', 'updated in API', null, 'Updated configuration key-value pair.'),
          N('kub', 425, 175, 'cube', 'mint', 'kubelet', 'atomic symlink', ['↻ ~60s', 'warn'], 'Periodically syncs mounted ConfigMap volumes.'),
          N('pod', 665, 175, 'pod', 'mint', 'App Pod', 'reloads config', ['✓ zero-restart', 'green'], 'Reads updated file without container restart.')
        ],
        edges: [E('cm', 'kub', 'watch'), E('kub', 'pod', 'ok')]
      },
      {
        short: 'etcd Encryption', cat: 'SECURITY',
        title: 'Encrypting Secrets at Rest in etcd (KMS v2 / AES-CBC)',
        body: ['By default, etcd stores Secrets in <strong>plaintext</strong>! Enabling <code>--encryption-provider-config</code> on kube-apiserver encrypts every Secret using an external <strong>KMS v2</strong> provider (or AES-CBC/Secretbox key) before writing to etcd.'],
        yamlTitle: 'CLI · Rewrite Secrets to Encrypt',
        yaml: `kubectl get secrets -A -o json | kubectl replace -f -`,
        tip: 'CKS Exam Classic: After enabling EncryptionConfiguration, existing Secrets stay plaintext until you rewrite them: `kubectl get secrets -A -o json | kubectl replace -f -`.',
        metrics: [['COMPONENT', 'KMS v2 Provider'], ['AT REST', 'AES-GCM Cipher', 'green'], ['ETCD SNAPSHOT', 'Protected ✓', 'green'], ['EXAM TRACK', 'CKS · CKA', 'red']],
        trace: { title: 'ENCRYPTION AT REST', rows: [['provider', 'kms v2 (envelope DEK)'], ['etcd value', 'k8s:enc:kms:v2:...'], ['plaintext', '0 secrets exposed ✓']], banner: ['ETCD SECRETS ENCRYPTED AT REST ✓', 'green'] },
        zones: [Z(265, 38, 500, 275, 'CONTROL PLANE ENCRYPTION BOUNDARY', '#C93632')],
        nodes: [
          N('sec', 140, 175, 'cyl', 'coral', 'Plain Secret', 'db-password', null, 'Submitted over TLS to kube-apiserver.'),
          N('api', 395, 175, 'hex', 'mint', 'API + KMS v2', 'envelope encrypt', ['🔒 encrypted', 'green'], 'Encrypts Secret with DEK wrapped by cloud KMS/HSM.'),
          N('et', 660, 175, 'cyl', 'lavender', 'etcd Disk', 'ciphertext only', ['✓ safe', 'green'], 'Even stolen etcd backups cannot read Secrets.')
        ],
        edges: [E('sec', 'api', 'req'), E('api', 'et', 'ok')]
      }
    ]
  },

  'pv-pvc-csi': {
    id: 'pv-pvc-csi', moduleId: 'm3', certs: ['CKA', 'CKAD'],
    title: 'PV, PVC, StorageClass & CSI',
    subtitle: 'Dynamic CSI provisioning, WaitForFirstConsumer topology binding, AccessModes (RWO vs RWX), and Reclaim & live expansion.',
    duration: '10 min', difficulty: 'Core',
    checklist: [
      'Provision disks dynamically with StorageClass & PVC',
      'Trace CSI Controller (Attach) & Node (Mount) plugins',
      'Choose ReadWriteOnce (RWO) vs ReadWriteMany (RWX)',
      'Protect production disks with Retain & online expansion'
    ],
    steps: [
      {
        short: 'Dynamic SC', cat: 'STORAGE',
        title: 'Dynamic Provisioning: PVC -> StorageClass -> Cloud Disk',
        body: ['Instead of admins manually pre-creating static PVs, developers create a <strong>PVC</strong> naming a <strong>StorageClass</strong> (e.g. <code>gp3-encrypted</code>).', 'The CSI provisioner calls the Cloud API to create a real volume, auto-generates a matching <strong>PV</strong>, and binds them 1-to-1!'],
        yamlTitle: 'YAML · Topology-Aware StorageClass',
        yaml: `apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata: { name: gp3-ssd }\nprovisioner: ebs.csi.aws.com\nvolumeBindingMode: WaitForFirstConsumer\nallowVolumeExpansion: true`,
        tip: 'Always set `volumeBindingMode: WaitForFirstConsumer` in multi-AZ clusters so the disk is created in the same AZ where the Pod schedules!',
        metrics: [['COMPONENT', 'StorageClass'], ['BIND MODE', 'WaitConsumer', 'green'], ['STATUS', 'Bound ✓', 'green'], ['EXAM TRACK', 'CKA · CKAD', 'purple']],
        trace: { title: 'DYNAMIC PROVISION', rows: [['PVC', '50Gi · gp3-ssd'], ['CSI API', 'CreateVolume(zone-b)'], ['Binding', 'PV <-> PVC Bound ✓']], banner: ['CLOUD SSD PROVISIONED & BOUND ✓', 'green'] },
        zones: [Z(60, 42, 700, 265, 'DYNAMIC CSI PROVISIONING CHAIN', '#6E47B8')],
        nodes: [
          N('pvc', 150, 175, 'cube', 'peach', 'PVC', '50Gi · gp3', null, 'Namespace-scoped storage claim.'),
          N('sc', 330, 175, 'cube', 'yellow', 'StorageClass', 'WaitConsumer', null, 'Defines CSI driver, IOPS, and AZ-aware binding.'),
          N('csi', 510, 175, 'cube', 'sky', 'CSI Driver', 'Cloud API', ['↻ creating', 'warn'], 'Provisions real cloud block/file storage.'),
          N('pv', 680, 175, 'cyl', 'mint', 'PV + SSD', '50Gi Bound', ['✓ Bound', 'green'], 'Cluster-scoped PersistentVolume bound to PVC.')
        ],
        edges: [E('pvc', 'sc', 'req'), E('sc', 'csi', 'watch'), E('csi', 'pv', 'ok')]
      },
      {
        short: 'CSI Flow', cat: 'STORAGE',
        title: 'CSI Split Architecture: Controller (Attach) vs Node (Mount)',
        body: ['Every modern storage plugin uses <strong>CSI (Container Storage Interface)</strong> split into two parts: a Control Plane <strong>CSI Controller</strong> attaches the disk to the Worker VM.', 'Then the <strong>CSI Node DaemonSet</strong> formats the filesystem (ext4/xfs) and bind-mounts it into the Pod’s container path.'],
        tip: 'Debug stuck `ContainerCreating` mounts by inspecting `VolumeAttachment` objects (`kubectl get volumeattachments`).',
        metrics: [['COMPONENT', 'CSI Controller/Node'], ['ATTACH', 'Cloud VM Device'], ['MOUNT', 'ext4 -> Pod dir', 'green'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'CSI ATTACH + MOUNT', rows: [['1. Controller', 'AttachVolume -> worker-2'], ['2. Node CSI', 'mkfs.ext4 + Stage'], ['3. kubelet', 'bind-mount /var/lib/db ✓']], banner: ['VOLUME ATTACHED & MOUNTED ✓', 'green'] },
        zones: [Z(65, 38, 325, 275, 'CONTROL PLANE CSI', '#6E47B8'), Z(420, 38, 345, 275, 'WORKER NODE 2', '#1E7E45')],
        nodes: [
          N('cc', 225, 175, 'cube', 'lavender', 'CSI Controller', 'AttachVolume', ['1. attach', 'warn'], 'Calls cloud API to attach disk to Node 2 VM.'),
          N('cn', 520, 115, 'cube', 'sky', 'CSI Node DS', 'format & mount', ['2. mount', 'green'], 'DaemonSet running on Node 2 mounting block device.'),
          N('pod', 665, 235, 'pod', 'mint', 'DB Pod', '/var/lib/data', ['✓ mounted', 'green'], 'Reads/writes durable persistent storage.')
        ],
        edges: [E('cc', 'cn', 'req'), E('cn', 'pod', 'ok')]
      },
      {
        short: 'RWO vs RWX', cat: 'STORAGE',
        title: 'Access Modes: ReadWriteOnce (Block) vs ReadWriteMany (File)',
        body: ['<strong>ReadWriteOnce (RWO)</strong> attaches a fast block SSD (EBS/PD) to a single Worker Node at a time—best for databases.', '<strong>ReadWriteMany (RWX)</strong> mounts shared network storage (EFS/NFS/CephFS) across Pods on multiple nodes simultaneously!'],
        tip: 'CKA Trap: Scaling a Deployment with an RWO PVC to 2 replicas across 2 nodes causes a Multi-Attach Error on the second Pod.',
        metrics: [['RWO (BLOCK)', '1 Node / Fast'], ['RWX (FILE)', 'Multi-Node ✓', 'green'], ['RWO-POD', 'Single Pod Only'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'ACCESS MODES', rows: [['RWO (EBS/PD)', 'Node 1 exclusive'], ['RWX (EFS/NFS)', 'Node 1 + Node 2 ✓'], ['Multi-Attach', 'avoided cleanly']], banner: ['RIGHT STORAGE FOR WORKLOAD ✓', 'green'] },
        zones: [Z(65, 42, 325, 265, 'RWO · SINGLE-NODE BLOCK', '#6E47B8'), Z(425, 42, 330, 265, 'RWX · MULTI-NODE SHARED', '#1E7E45')],
        nodes: [
          N('p1', 160, 175, 'pod', 'sky', 'DB Pod', 'Node 1', null, 'Exclusive block storage consumer.'),
          N('v1', 310, 175, 'cyl', 'lavender', 'RWO SSD', '1 node max', null, 'Low-latency block device.'),
          N('p2', 520, 175, 'cluster', 'mint', 'Web Pods', 'Node 1 & 2', null, 'Multiple Pods reading/writing shared uploads.'),
          N('v2', 680, 175, 'cyl', 'peach', 'RWX EFS', 'shared FS', ['✓ shared', 'green'], 'Concurrent multi-node file system.')
        ],
        edges: [E('p1', 'v1', 'watch'), E('p2', 'v2', 'ok')]
      },
      {
        short: 'Retain & Expand', cat: 'STORAGE',
        title: 'ReclaimPolicy: Retain & Online Volume Expansion',
        body: ['Set <code>reclaimPolicy: Retain</code> on production StorageClasses so accidentally deleting a PVC marks the PV <code>Released</code> instead of wiping your cloud SSD!', 'With <code>allowVolumeExpansion: true</code>, simply edit PVC size from <code>50Gi -> 100Gi</code> and CSI expands the disk live with zero downtime!'],
        tip: 'Live resize requires editing the PVC spec (not the PV); the CSI driver handles both cloud disk expansion and filesystem resize.',
        metrics: [['RECLAIM', 'Retain (Safe)', 'green'], ['EXPANSION', '50Gi -> 100Gi', 'green'], ['DOWNTIME', '0 sec ✓', 'green'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'LIFECYCLE SAFETY', rows: [['reclaimPolicy', 'Retain (blocks wipe) ✓'], ['PVC edit', '50Gi -> 100Gi live'], ['resize2fs', 'expanded online ✓']], banner: ['DATA SAFE & EXPANDED ONLINE ✓', 'green'] },
        zones: [Z(85, 42, 650, 265, 'DATA PROTECTION & LIVE RESIZE', '#1E7E45')],
        nodes: [
          N('pvc', 195, 175, 'cube', 'peach', 'PVC Resize', '50Gi -> 100Gi', ['+50Gi', 'warn'], 'User patches PVC storage request upward.'),
          N('pv', 425, 175, 'cyl', 'mint', 'PV (Retain)', 'protected', ['✓ Retain', 'green'], 'Survives accidental PVC deletion intact.'),
          N('dsk', 645, 175, 'cyl', 'lavender', 'Cloud SSD', '100Gi online', ['✓ resized', 'green'], 'Expanded live without restarting database Pod.')
        ],
        edges: [E('pvc', 'pv', 'req'), E('pv', 'dsk', 'ok')]
      }
    ]
  },

  /* ======================== MODULE 04 ======================== */
  'services-kubeproxy': {
    id: 'services-kubeproxy', moduleId: 'm4', certs: ['CKA', 'CKAD', 'CKS'],
    title: 'Services, EndpointSlices & kube-proxy',
    subtitle: 'Stable Virtual IPs, CoreDNS service discovery, ClusterIP/NodePort/LB, EndpointSlices, and iptables vs IPVS vs eBPF.',
    duration: '12 min', difficulty: 'Core',
    checklist: [
      'Hide ephemeral Pod IP churn behind a stable Service',
      'Resolve Service names via CoreDNS to ClusterIP VIP',
      'Compare ClusterIP, NodePort & Cloud LoadBalancer',
      'Scale backends efficiently with EndpointSlices',
      'Contrast kube-proxy iptables/IPVS with Cilium eBPF'
    ],
    steps: [
      {
        short: 'Pod Churn', cat: 'NETWORKING',
        title: 'The Problem: Ephemeral Pod IPs Change on Every Restart',
        body: ['Pods are mortal—when a node fails or a rollout runs, old Pod IP <code>10.244.1.5</code> vanishes and a replacement boots at <code>10.244.3.19</code>.', 'Hardcoding Pod IPs breaks clients immediately; we need a permanent virtual abstraction.'],
        tip: 'Never point apps directly at Pod IPs—always address workloads through a Kubernetes Service DNS name.',
        metrics: [['COMPONENT', 'Pod Network'], ['OLD POD IP', '.1.5 (Dead)', 'red'], ['NEW POD IP', '.3.19 (New)', 'warn'], ['EXAM TRACK', 'CKA · CKAD', 'warn']],
        trace: { title: 'DIRECT IP FAILURE', rows: [['client -> .1.5', 'ECONNREFUSED ✕'], ['new Pod IP', '10.244.3.19 unknown'], ['solution', 'ClusterIP Service']], banner: ['EPHEMERAL POD IPS BREAK CLIENTS', 'red'] },
        zones: [Z(325, 38, 435, 275, 'POD CHURN WITHOUT SERVICE', '#C93632')],
        nodes: [
          N('fe', 145, 175, 'pod', 'sky', 'Frontend', 'hardcoded .1.5', null, 'Breaks whenever backend Pod reschedules.'),
          N('old', 465, 112, 'pod', 'gray', 'Old Pod', '10.244.1.5', ['✗ dead', 'red'], 'Terminated during node drain or crash.', true),
          N('nw', 645, 245, 'pod', 'mint', 'New Pod', '10.244.3.19', ['unreached', 'warn'], 'Healthy replacement, but client doesn’t know its IP.')
        ],
        edges: [E('fe', 'old', 'err', { stop: 0.85 })]
      },
      {
        short: 'ClusterIP & DNS', cat: 'NETWORKING',
        title: 'ClusterIP Virtual IP & CoreDNS Discovery',
        body: ['A <strong>ClusterIP Service</strong> allocates a permanent Virtual IP (<code>10.96.15.20</code>) and registers <code>api-svc.prod.svc.cluster.local</code> in <strong>CoreDNS</strong>.', 'Frontend resolves the DNS name once and sends traffic to the stable VIP, which load-balances across all Ready Pods matching <code>app: api</code>.'],
        yamlTitle: 'CLI · Verify CoreDNS Service Resolution',
        yaml: `kubectl run tmp --rm -it --image=busybox -- \\\n  nslookup api-svc.prod.svc.cluster.local`,
        tip: 'Within the same Namespace you can simply dial `http://api-svc`; across Namespaces use `http://api-svc.prod.svc`.',
        metrics: [['COMPONENT', 'CoreDNS + VIP'], ['CLUSTER IP', '10.96.15.20', 'green'], ['DNS LATENCY', '0.4 ms ✓', 'green'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'SERVICE DISCOVERY', rows: [['CoreDNS', 'api-svc -> 10.96.15.20'], ['selector', 'app=api (3 Ready)'], ['LB mode', 'round-robin ✓']], banner: ['STABLE VIP & DNS RESOLVED ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'INTERNAL SERVICE MESHING', '#1E7E45')],
        nodes: [
          N('fe', 145, 175, 'pod', 'sky', 'Frontend', 'GET api-svc', null, 'Resolves Service FQDN via CoreDNS.'),
          N('dns', 415, 102, 'cube', 'lavender', 'CoreDNS', 'UDP 53', ['0.4ms', 'green'], 'Returns ClusterIP 10.96.15.20.'),
          N('svc', 415, 238, 'router', 'peach', 'api-svc VIP', '10.96.15.20', ['✓ stable', 'green'], 'Virtual IP backed by dynamic Pods.'),
          N('p', 665, 238, 'cluster', 'mint', 'API Pods (3x)', 'Ready ✓', null, 'Live healthy backend replicas.')
        ],
        edges: [E('fe', 'dns', 'watch'), E('fe', 'svc', 'req'), E('svc', 'p', 'ok')]
      },
      {
        short: 'NodePort & LB', cat: 'NETWORKING',
        title: 'External Exposure: NodePort & Cloud LoadBalancer',
        body: ['<strong>NodePort</strong> opens a static port (<code>30000–32767</code>) on every Worker Node forwarding into the ClusterIP.', '<strong>LoadBalancer</strong> asks the Cloud Controller Manager to provision an external Cloud NLB targeting those NodePorts. Set <code>externalTrafficPolicy: Local</code> to preserve real client source IPs!'],
        tip: 'Every LoadBalancer Service automatically builds on top of a NodePort, which builds on top of a ClusterIP.',
        metrics: [['COMPONENT', 'LB -> NodePort'], ['SOURCE IP', 'Policy: Local ✓', 'green'], ['PORT RANGE', '30000-32767'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'EXTERNAL INGRESS', rows: [['Cloud NLB', '203.0.113.10:443'], ['NodePort', ':30443 (Local policy)'], ['Pod', 'sees real client IP ✓']], banner: ['EXTERNAL TRAFFIC ROUTED ✓', 'green'] },
        zones: [Z(290, 38, 475, 275, 'KUBERNETES CLUSTER EDGE', '#E07B24')],
        nodes: [
          N('u', 135, 175, 'users', 'sky', 'Internet', 'HTTPS :443', null, 'External clients hitting public DNS.'),
          N('lb', 375, 175, 'router', 'peach', 'Cloud NLB', 'LoadBalancer', ['public IP', 'green'], 'External L4 load balancer.'),
          N('np', 540, 175, 'cube', 'yellow', 'NodePort', ':30443 Local', null, 'Avoids cross-node SNAT hop with Local policy.'),
          N('p', 690, 175, 'cluster', 'mint', 'App Pods', ':8080', ['✓ 200 OK', 'green'], 'Serves external requests.')
        ],
        edges: [E('u', 'lb', 'req'), E('lb', 'np', 'req'), E('np', 'p', 'ok')]
      },
      {
        short: 'EndpointSlices', cat: 'NETWORKING',
        title: 'EndpointSlices Scale Service Discovery to 10,000+ Pods',
        body: ['Legacy <code>Endpoints</code> crammed all Pod IPs into one giant object—updating 1 Pod forced every node to re-download the entire list!', '<strong>EndpointSlices</strong> shard backends into compact chunks (max 100 Ready IPs each) and track topology hints for same-zone routing.'],
        yamlTitle: 'CLI · Inspect EndpointSlices',
        yaml: `kubectl get endpointslices -n prod -l kubernetes.io/service-name=api-svc -o wide`,
        tip: 'CKA Debugging #1: If a Service times out, run `kubectl get endpointslices -l kubernetes.io/service-name=<svc>`—if empty, your label selector or readinessProbe is broken!',
        metrics: [['COMPONENT', 'EndpointSlice'], ['MAX / SLICE', '100 Pod IPs', 'green'], ['TOPOLOGY', 'Zone-Aware ✓', 'green'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'SLICE UPDATES', rows: [['Slice #1', '100 Ready IPs (unchanged)'], ['Slice #2', '+1 new Pod IP synced'], ['network saved', '98% smaller Watch ✓']], banner: ['SHARDED O(1) ENDPOINT SYNC ✓', 'purple'] },
        zones: [Z(270, 38, 495, 275, 'ENDPOINTSLICE CONTROLLER FAN-OUT', '#6E47B8')],
        nodes: [
          N('ec', 145, 175, 'cube', 'lavender', 'Slice Ctrl', 'watches Pods', null, 'Maintains compact EndpointSlice chunks.'),
          N('s1', 420, 112, 'cube', 'mint', 'Slice #1', '100 IPs', ['unchanged', 'green'], 'Not re-transmitted when Slice #2 changes.'),
          N('s2', 420, 245, 'cube', 'peach', 'Slice #2', '12 IPs (+1)', ['↻ delta', 'warn'], 'Only this tiny slice pushes to kube-proxy.'),
          N('kp', 670, 175, 'router', 'sky', 'Node Proxies', 'all workers', ['✓ synced', 'green'], 'Program kernel forwarding rules instantly.')
        ],
        edges: [E('ec', 's1', 'watch', { count: 1 }), E('ec', 's2', 'req'), E('s2', 'kp', 'ok')]
      },
      {
        short: 'iptables / eBPF', cat: 'NETWORKING',
        title: 'Dataplane Evolution: iptables vs IPVS vs Cilium eBPF',
        body: ['Classic <strong>iptables</strong> evaluates rules sequentially—O(N) overhead degrades past ~2,000 Services. <strong>IPVS</strong> upgrades this to O(1) kernel hash tables.', '<strong>Cilium eBPF</strong> eliminates kube-proxy altogether, rewriting ClusterIP -> Pod IP right inside the Linux socket <code>connect()</code> hook in O(1)!'],
        tip: 'eBPF skips netfilter & conntrack chains, delivering lower p99 latency and built-in L3/L4/L7 Hubble observability.',
        metrics: [['IPTABLES', 'O(N) Linear', 'warn'], ['IPVS', 'O(1) Hash'], ['CILIUM EBPF', 'O(1) Socket ✓', 'green'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'KERNEL DATAPATH', rows: [['connect()', '10.96.15.20:80'], ['eBPF map', 'O(1) -> 10.244.2.9'], ['iptables', 'completely bypassed ✓']], banner: ['WIRE-SPEED EBPF ROUTING ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'NODE KERNEL PACKET TRANSLATION', '#1E7E45')],
        nodes: [
          N('app', 195, 175, 'pod', 'sky', 'App Socket', '10.96.15.20', null, 'Sends TCP packet to virtual ClusterIP.'),
          N('eb', 415, 175, 'router', 'mint', 'Cilium eBPF', 'O(1) BPF Map', ['✓ O(1) fast', 'green'], 'Translates VIP directly at socket connect().'),
          N('dst', 635, 175, 'pod', 'peach', 'Target Pod', '10.244.2.9', null, 'Receives packet with zero netfilter overhead.')
        ],
        edges: [E('app', 'eb', 'req'), E('eb', 'dst', 'ok', { count: 3 })]
      }
    ]
  },

  'ingress-gateway': {
    id: 'ingress-gateway', moduleId: 'm4', certs: ['CKA', 'CKAD'],
    title: 'Ingress & Gateway API',
    subtitle: 'Single-IP L7 HTTP/TLS Ingress, GatewayClass -> Gateway -> HTTPRoute role separation, and native Canary routing.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Route multiple hosts & paths through 1 LB via Ingress',
      'Model Infrastructure vs Platform roles with Gateway API',
      'Delegate app routing cleanly via HTTPRoute',
      'Split traffic by headers & weights without annotations'
    ],
    steps: [
      {
        short: 'L7 Ingress', cat: 'NETWORKING',
        title: 'L7 Ingress: Host, Path & TLS Routing on 1 Edge IP',
        body: ['Instead of paying for a Cloud LoadBalancer per microservice, one <strong>Ingress Controller</strong> (NGINX/Envoy) terminates HTTPS TLS and routes by Hostname and Path (<code>/api</code> vs <code>/web</code>) to internal ClusterIP Services.'],
        tip: 'CKAD Tip: Always verify `ingressClassName` matches the installed IngressClass and set `pathType: Prefix` or `Exact`.',
        metrics: [['COMPONENT', 'Ingress Ctrl'], ['EDGE LB', '1 Shared IP', 'green'], ['TLS', 'Terminated ✓', 'green'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'L7 INGRESS ROUTER', rows: [['app.io/api', '-> api-svc:8080 ✓'], ['app.io/web', '-> web-svc:80 ✓'], ['TLS cert', 'Secret/app-tls']], banner: ['SINGLE EDGE L7 ROUTING ✓', 'green'] },
        zones: [Z(265, 38, 495, 275, 'INGRESS CONTROLLER ROUTING', '#E07B24')],
        nodes: [
          N('u', 140, 175, 'users', 'sky', 'HTTPS Users', 'app.io/api', null, 'External HTTP/2 & TLS clients.'),
          N('ing', 390, 175, 'router', 'peach', 'Ingress Ctrl', 'TLS + Path', ['✓ L7', 'green'], 'Terminates TLS and matches Ingress rules.'),
          N('s1', 655, 108, 'pod', 'mint', 'api-svc', '/api/*', null, 'Internal ClusterIP Service for API.'),
          N('s2', 655, 245, 'pod', 'lavender', 'web-svc', '/web/*', null, 'Internal ClusterIP Service for Web UI.')
        ],
        edges: [E('u', 'ing', 'req'), E('ing', 's1', 'ok'), E('ing', 's2', 'watch')]
      },
      {
        short: 'Gateway & Class', cat: 'NETWORKING',
        title: 'Gateway API: GatewayClass (Infra) & Gateway (Platform)',
        body: ['<strong>Gateway API</strong> is the official successor to Ingress, eliminating vendor annotation soup.', 'Infrastructure providers define a <strong>GatewayClass</strong> (Envoy/Cilium/Cloud), while Platform engineers own the <strong>Gateway</strong> (edge IPs, ports, TLS certificates, allowed route namespaces).'],
        tip: 'Separating Gateway from HTTPRoute lets Platform teams lock down TLS certs while App teams self-serve routing safely.',
        metrics: [['INFRA', 'GatewayClass'], ['PLATFORM', 'Gateway :443', 'green'], ['ANNOTATIONS', 'Zero Needed ✓', 'green'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'GATEWAY EDGE', rows: [['GatewayClass', 'envoy-gateway'], ['Gateway', 'prod-edge :443 TLS'], ['allowedNS', 'selector: env=prod']], banner: ['PLATFORM-OWNED EDGE GATEWAY ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'GATEWAY API INFRASTRUCTURE TIER', '#6E47B8')],
        nodes: [
          N('gc', 195, 175, 'cube', 'yellow', 'GatewayClass', 'Infra Provider', null, 'Identifies the controller implementing the Gateway.'),
          N('gw', 455, 175, 'router', 'peach', 'Gateway', 'Platform · TLS', ['🔒 :443', 'green'], 'Owns edge listeners, certificates, and namespace allowlists.'),
          N('hr', 670, 175, 'cube', 'lavender', 'HTTPRoutes', 'attached ✓', null, 'App-owned routing rules bound via parentRefs.')
        ],
        edges: [E('gc', 'gw', 'watch'), E('gw', 'hr', 'ok')]
      },
      {
        short: 'HTTPRoute Roles', cat: 'NETWORKING',
        title: 'HTTPRoute & ReferenceGrant Cross-Namespace Security',
        body: ['App teams attach <strong>HTTPRoute</strong> objects to a shared Gateway via <code>parentRefs</code>.', 'To prevent namespace A from hijacking a Service in namespace B, cross-namespace backend references are denied by default unless namespace B creates an explicit opt-in <strong>ReferenceGrant</strong>!'],
        tip: 'CKA Tip: If an HTTPRoute shows `ResolvedRefs: False`, check for a missing `ReferenceGrant` in the target Service’s namespace.',
        metrics: [['APP TEAM', 'HTTPRoute'], ['CROSS-NS', 'ReferenceGrant', 'green'], ['HIJACK RISK', 'Blocked ✓', 'green'], ['EXAM TRACK', 'CKA · CKS', 'green']],
        trace: { title: 'ROLE SEPARATION', rows: [['ns: edge', 'HTTPRoute -> payments'], ['ns: payments', 'ReferenceGrant OK ✓'], ['status', 'Accepted + Resolved']], banner: ['EXPLICIT CROSS-NS OPT-IN ✓', 'green'] },
        zones: [Z(65, 42, 305, 265, 'NS: EDGE', '#E07B24'), Z(415, 42, 345, 265, 'NS: PAYMENTS (OPT-IN)', '#1E7E45')],
        nodes: [
          N('hr', 215, 175, 'cube', 'peach', 'HTTPRoute', 'parent: prod-gw', null, 'App routing rule targeting another Namespace.'),
          N('rg', 510, 175, 'shield', 'lavender', 'ReferenceGrant', 'allows edge', ['✓ granted', 'green'], 'Owned by payments NS to authorize cross-NS routing.'),
          N('sv', 680, 175, 'pod', 'mint', 'pay-svc', ':8080', null, 'Protected payments Service.')
        ],
        edges: [E('hr', 'rg', 'req'), E('rg', 'sv', 'ok')]
      },
      {
        short: 'Header & Weight', cat: 'NETWORKING',
        title: 'Native Weighted Canary & Header-Based Routing',
        body: ['Gateway API natively supports weighted traffic splitting (<code>90% v1 / 10% v2</code>), header matching (<code>X-Beta: true -> v2</code>), and request mirroring—all portable across Envoy, Cilium, NGINX, and AWS/GCP controllers!'],
        yamlTitle: 'YAML · HTTPRoute 90/10 Canary Split',
        yaml: `backendRefs:\n- { name: svc-v1, port: 80, weight: 90 }\n- { name: svc-v2, port: 80, weight: 10 }`,
        tip: 'Zero external service mesh required for progressive canary splits when using Gateway API HTTPRoutes.',
        metrics: [['STABLE V1', 'weight: 90', 'green'], ['CANARY V2', 'weight: 10', 'purple'], ['HEADER RULE', 'X-Beta -> v2'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'HTTPROUTE SPLIT', rows: [['default', '90% v1 / 10% v2'], ['X-Beta: true', '100% -> svc-v2 ✓'], ['vendor lock', '0% (standard API)']], banner: ['NATIVE CANARY & HEADER SPLIT ✓', 'green'] },
        zones: [Z(265, 36, 495, 278, 'HTTPROUTE TRAFFIC SPLITTING', '#1E7E45')],
        nodes: [
          N('gw', 140, 175, 'router', 'peach', 'Gateway', 'TLS :443', null, 'Edge listener forwarding decrypted HTTP.'),
          N('hr', 385, 175, 'cube', 'lavender', 'HTTPRoute', 'weight + header', ['90/10', 'green'], 'Evaluates header matches and weighted splits.'),
          N('v1', 655, 108, 'cluster', 'mint', 'svc-v1', '90% stable', ['90%', 'green'], 'Production stable release.'),
          N('v2', 655, 245, 'pod', 'sky', 'svc-v2', '10% + X-Beta', ['10%', 'warn'], 'Canary release receiving beta testers.')
        ],
        edges: [E('gw', 'hr', 'req'), E('hr', 'v1', 'ok', { count: 3 }), E('hr', 'v2', 'watch', { count: 1 })]
      }
    ]
  },

  'network-policies': {
    id: 'network-policies', moduleId: 'm4', certs: ['CKA', 'CKAD', 'CKS'],
    title: 'NetworkPolicies & Zero-Trust',
    subtitle: 'Locking down Kubernetes’ default flat network with Default-Deny, Pod/Namespace label allowlists, and CoreDNS Egress.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Recognize lateral movement risk in default flat networks',
      'Apply Default-Deny Ingress & Egress per Namespace',
      'Write precise AND vs OR Pod/Namespace selectors',
      'Always allow CoreDNS UDP/TCP 53 in Egress policies'
    ],
    steps: [
      {
        short: 'Flat Network', cat: 'NETWORKING',
        title: 'Default Flat Network: Any Pod Can Reach Any Pod',
        body: ['By default, Kubernetes permits all Pod-to-Pod traffic across every Namespace. A compromised <code>dev</code> Pod can scan ports and connect straight into your production database!'],
        tip: 'CKS Tip: NetworkPolicies are enforced by the CNI (Cilium, Calico). Basic Flannel ignores NetworkPolicies silently!',
        metrics: [['NETPOLS', '0 Active', 'red'], ['ROGUE -> DB', 'OPEN ⚠', 'red'], ['ISOLATION', 'None', 'warn'], ['EXAM TRACK', 'CKS · CKA', 'red']],
        trace: { title: 'NETPOL PACKET TRACE', rows: [['fe -> api:8080', 'ALLOW'], ['rogue -> db:5432', 'ALLOW ⚠ (unrestricted)'], ['CNI firewall', 'inactive']], banner: ['LATERAL MOVEMENT UNBLOCKED ⚠', 'warn'] },
        zones: [Z(340, 38, 420, 275, 'NS: PROD (UNPROTECTED)', '#A8640C')],
        nodes: [
          N('fe', 145, 108, 'pod', 'sky', 'Frontend', 'app=frontend', null, 'Legitimate caller.'),
          N('rg', 145, 245, 'pod', 'coral', 'Rogue Pod', 'ns: dev', ['⚠ attacker', 'red'], 'Compromised dev pod scanning prod DB.'),
          N('api', 475, 108, 'pod', 'mint', 'Backend API', ':8080', null, 'Production API.'),
          N('db', 650, 232, 'cyl', 'lavender', 'Prod DB', ':5432', ['⚠ exposed', 'red'], 'Directly reachable from every namespace.')
        ],
        edges: [E('fe', 'api', 'ok'), E('rg', 'db', 'req', { count: 3 })]
      },
      {
        short: 'Default Deny', cat: 'SECURITY',
        title: 'Default-Deny Policy Seals the Namespace Perimeter',
        body: ['Creating a NetworkPolicy with <code>podSelector: {}</code> and <code>policyTypes: [Ingress, Egress]</code> (with no allow rules) tells the CNI to drop all unlisted packets for every Pod in that Namespace.'],
        yamlTitle: 'YAML · Default-Deny Ingress & Egress',
        yaml: `apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: default-deny-all, namespace: prod }\nspec:\n  podSelector: {}\n  policyTypes: [Ingress, Egress]`,
        tip: 'NetworkPolicies are strictly additive (allowlist-only): once ANY policy selects a Pod, everything not explicitly allowed is dropped.',
        metrics: [['POLICY', 'Default-Deny', 'green'], ['ROGUE -> DB', 'DROPPED ✓', 'green'], ['ENFORCER', 'Cilium / Calico'], ['EXAM TRACK', 'CKS · CKA', 'red']],
        trace: { title: 'CNI EBPF DROP LOG', rows: [['podSelector', '{} (all prod pods)'], ['rogue -> db', 'DROP ✕'], ['fe -> api', 'DROP (await allow)']], banner: ['PERIMETER SEALED (DENY-ALL)', 'warn'] },
        zones: [Z(340, 38, 420, 275, 'NS: PROD · DEFAULT-DENY ACTIVE', '#C93632')],
        nodes: [
          N('fe', 145, 108, 'pod', 'sky', 'Frontend', 'app=frontend', null, 'Blocked until allowlist added.'),
          N('rg', 145, 245, 'pod', 'coral', 'Rogue Pod', 'ns: dev', ['✗ blocked', 'red'], 'Dropped at CNI perimeter.'),
          N('api', 480, 108, 'shield', 'mint', 'Backend API', 'isolated', ['🔒 deny-all', 'red'], 'Locked down by default-deny.'),
          N('db', 650, 232, 'cyl', 'lavender', 'Prod DB', 'isolated', ['✓ safe', 'green'], 'Protected from lateral movement.')
        ],
        edges: [E('fe', 'api', 'err', { stop: 0.56 }), E('rg', 'db', 'err', { stop: 0.38 })]
      },
      {
        short: 'Label Selectors', cat: 'SECURITY',
        title: 'Allow Precise Paths & Watch the AND vs OR YAML Trap',
        body: ['We whitelist <code>frontend -> api:8080</code> and <code>api -> db:5432</code> using Pod & Namespace labels. Legitimate traffic flows green while Rogue Pod stays blocked red!', '<strong>Exam Trap:</strong> Under <code>from:</code>, putting <code>namespaceSelector</code> and <code>podSelector</code> under ONE dash means <strong>AND</strong>; adding a second dash turns it into a wide-open <strong>OR</strong>!'],
        tip: 'NetworkPolicies are stateful: allowing Ingress automatically allows the TCP return packets without needing a matching Egress rule.',
        metrics: [['FE -> API:8080', 'ALLOW ✓', 'green'], ['API -> DB:5432', 'ALLOW ✓', 'green'], ['ROGUE -> DB', 'DROP ✕', 'green'], ['EXAM TRACK', 'CKS · CKA', 'green']],
        trace: { title: 'ZERO-TRUST ALLOWLIST', rows: [['fe -> api:8080', 'ALLOW ✓ (1-dash AND)'], ['api -> db:5432', 'ALLOW ✓'], ['rogue -> db', 'DROP ✕']], banner: ['MICRO-SEGMENTATION ACTIVE ✓', 'green'] },
        zones: [Z(340, 38, 420, 275, 'NS: PROD · ZERO-TRUST ALLOWLIST', '#1E7E45')],
        nodes: [
          N('fe', 145, 108, 'pod', 'sky', 'Frontend', 'app=frontend', ['✓ allowed', 'green'], 'Matches backend Ingress podSelector.'),
          N('rg', 145, 245, 'pod', 'coral', 'Rogue Pod', 'ns: dev', ['✗ blocked', 'red'], 'Dropped by CNI eBPF filter.'),
          N('api', 480, 108, 'pod', 'mint', 'Backend API', ':8080 open', null, 'Accepts only Frontend on TCP 8080.'),
          N('db', 650, 232, 'cyl', 'lavender', 'Prod DB', ':5432 API only', null, 'Accepts only Backend API on TCP 5432.')
        ],
        edges: [E('fe', 'api', 'ok', { count: 3 }), E('api', 'db', 'ok'), E('rg', 'db', 'err', { stop: 0.38 })]
      },
      {
        short: 'DNS Egress', cat: 'SECURITY',
        title: 'The #1 Egress Outage: Always Allow CoreDNS (UDP/TCP 53)',
        body: ['Locking down <strong>Egress</strong> stops reverse shells and data exfiltration—but it also blocks outbound DNS lookups unless you explicitly allow UDP & TCP port <code>53</code> to <code>kube-system</code> (CoreDNS)!'],
        yamlTitle: 'YAML · CoreDNS Egress Allow Rule',
        yaml: `egress:\n- to: [{ namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: kube-system } } }]\n  ports: [{ protocol: UDP, port: 53 }, { protocol: TCP, port: 53 }]`,
        tip: 'Include BOTH `protocol: UDP` and `protocol: TCP` on port 53 so both standard and large DNS responses succeed.',
        metrics: [['DNS :53', 'ALLOW ✓', 'green'], ['DB :5432', 'ALLOW ✓', 'green'], ['EXFIL :443', 'DROP ✕', 'green'], ['EXAM TRACK', 'CKS · CKA', 'green']],
        trace: { title: 'EGRESS FIREWALL', rows: [['-> CoreDNS :53', 'ALLOW (UDP+TCP) ✓'], ['-> Prod DB :5432', 'ALLOW ✓'], ['-> evil.ip :443', 'DROP (exfil blocked)']], banner: ['DNS OPEN · EXFIL BLOCKED ✓', 'green'] },
        zones: [Z(70, 38, 470, 275, 'CLUSTER EGRESS FIREWALL', '#1E7E45')],
        nodes: [
          N('api', 180, 175, 'pod', 'sky', 'Backend API', 'Egress locked', null, 'Only allowed to reach CoreDNS and Prod DB.'),
          N('dns', 430, 105, 'cube', 'lavender', 'CoreDNS', 'UDP/TCP 53', ['✓ :53', 'green'], 'Required for Service and external DNS resolution.'),
          N('db', 430, 245, 'cyl', 'mint', 'Prod DB', 'TCP 5432', ['✓ :5432', 'green'], 'Explicitly whitelisted database egress.'),
          N('ext', 680, 175, 'pod', 'coral', 'Evil C2 IP', 'exfil blocked', ['✗ blocked', 'red'], 'Unauthorized outbound traffic dropped.', true)
        ],
        edges: [E('api', 'dns', 'ok'), E('api', 'db', 'ok'), E('api', 'ext', 'err', { stop: 0.65 })]
      }
    ]
  },

  /* ======================== MODULE 05 ======================== */
  'authn-serviceaccounts': {
    id: 'authn-serviceaccounts', moduleId: 'm5', certs: ['CKS', 'CKA', 'CNPE'],
    title: 'AuthN & ServiceAccounts',
    subtitle: 'Human X.509/OIDC authentication, workload ServiceAccounts, bound projected JWTs, and automount hardening.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Distinguish human (x509/OIDC) vs workload (SA) AuthN',
      'Create dedicated ServiceAccounts per workload',
      'Use time-bound, audience-bound projected JWT tokens',
      'Disable automountServiceAccountToken when API unused'
    ],
    steps: [
      {
        short: 'X.509 & OIDC', cat: 'SECURITY',
        title: 'Human Authentication: X.509 Client Certs & OIDC SSO',
        body: ['Kubernetes has no internal <code>User</code> database. Human operators prove identity via signed <strong>X.509 certificates</strong> (<code>CN=user, O=group</code>) or enterprise <strong>OIDC JWTs</strong> (Okta/Entra/Dex).', 'Invalid or expired tokens are rejected immediately with <code>401 Unauthorized</code>.'],
        tip: 'Never share the cluster-admin kubeconfig! Use OIDC short-lived tokens so offboarded employees lose cluster access immediately.',
        metrics: [['HUMANS', 'OIDC / X.509'], ['BAD TOKEN', '401 Unauth', 'red'], ['USER DB', 'External Only'], ['EXAM TRACK', 'CKS · CKA', 'red']],
        trace: { title: 'AUTHN VERIFICATION', rows: [['OIDC JWT', 'sig + exp verified ✓'], ['claims', 'user=sre, grp=ops'], ['next stage', 'RBAC AuthZ']], banner: ['HUMAN IDENTITY VERIFIED ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'API SERVER AUTHENTICATORS', '#4A7BC7')],
        nodes: [
          N('u', 145, 175, 'users', 'sky', 'SRE / Dev', 'OIDC / x509', null, 'Presents signed token or client certificate.'),
          N('an', 435, 175, 'shield', 'mint', 'AuthN Gate', 'JWKS / CA verify', ['✓ verified', 'green'], 'Extracts username & groups; 401 if invalid.'),
          N('az', 670, 175, 'cube', 'lavender', 'RBAC AuthZ', 'next stage', null, 'Checks permissions for extracted identity.')
        ],
        edges: [E('u', 'an', 'req'), E('an', 'az', 'ok')]
      },
      {
        short: 'SA Identity', cat: 'SECURITY',
        title: 'ServiceAccounts: Dedicated Workload Identities',
        body: ['Pods authenticate to kube-apiserver (and cloud IAM via Workload Identity / IRSA) using a namespace-scoped <strong>ServiceAccount</strong>.', 'Always create one dedicated ServiceAccount per application—never attach Roles to the namespace’s <code>default</code> ServiceAccount!'],
        tip: 'CKS Tip: Audit the `default` ServiceAccount in every namespace to verify zero RoleBindings point to it.',
        metrics: [['COMPONENT', 'ServiceAccount'], ['SCOPE', 'Namespaced'], ['DEFAULT SA', 'Zero Roles ✓', 'green'], ['EXAM TRACK', 'CKS · CKA', 'green']],
        trace: { title: 'WORKLOAD IDENTITY', rows: [['sa', 'prod/metrics-sa'], ['default sa', '0 permissions ✓'], ['cloud IAM', 'federated OIDC ✓']], banner: ['LEAST-PRIVILEGE WORKLOAD ID ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'NS: PROD · DEDICATED SERVICEACCOUNT', '#1E7E45')],
        nodes: [
          N('sa', 235, 175, 'shield', 'lavender', 'metrics-sa', 'dedicated SA', ['✓ isolated', 'green'], 'Dedicated ServiceAccount bound only to metrics-pod.'),
          N('p', 575, 175, 'pod', 'mint', 'Metrics Pod', 'sa: metrics-sa', null, 'Runs with scoped identity instead of default SA.')
        ],
        edges: [E('sa', 'p', 'ok')]
      },
      {
        short: 'Bound JWTs', cat: 'SECURITY',
        title: 'Projected Bound Tokens: 1h TTL & Auto-Rotated',
        body: ['Modern Kubernetes uses the <strong>TokenRequest API</strong> to project short-lived (1 hour), Pod-UID-bound JWTs into <code>/var/run/secrets/kubernetes.io/serviceaccount/token</code>.', 'Kubelet refreshes the token before expiry, and deleting the Pod instantly invalidates the JWT—unlike legacy never-expiring Secret tokens!'],
        yamlTitle: 'CLI · Create Bound SA Token',
        yaml: `kubectl create token metrics-sa -n prod --duration=1h`,
        tip: 'If a legacy token leaks, it stays valid forever; a projected bound token expires automatically and dies with its Pod.',
        metrics: [['TOKEN TYPE', 'Bound JWT ✓', 'green'], ['TTL', '1h Rotated', 'green'], ['POD BOUND', 'UID Linked ✓', 'green'], ['EXAM TRACK', 'CKS · CNPE', 'purple']],
        trace: { title: 'TOKENREQUEST API', rows: [['aud', 'https://kubernetes.default'], ['ttl', '3600s (auto-rotated)'], ['pod deletion', 'JWT instantly invalid ✓']], banner: ['SHORT-LIVED BOUND JWT ACTIVE ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'PROJECTED SERVICEACCOUNT TOKEN', '#6E47B8')],
        nodes: [
          N('api', 180, 175, 'hex', 'sky', 'TokenRequest', 'signs 1h JWT', null, 'Issues audience- and Pod-bound JWT.'),
          N('kub', 415, 175, 'cube', 'lavender', 'kubelet', 'rotates at 80%', ['↻ rotate', 'green'], 'Refreshes projected volume seamlessly.'),
          N('pod', 645, 175, 'pod', 'mint', 'Workload Pod', '/var/run/.../token', ['✓ bound', 'green'], 'Uses fresh short-lived Bearer token.')
        ],
        edges: [E('api', 'kub', 'watch'), E('kub', 'pod', 'ok')]
      },
      {
        short: 'Automount Off', cat: 'SECURITY',
        title: 'Hardening: automountServiceAccountToken: false',
        body: ['90% of application Pods never call the Kubernetes API. Setting <code>automountServiceAccountToken: false</code> on the ServiceAccount (or Pod) prevents any token file from being mounted—stopping API pivoting even after container RCE!'],
        yamlTitle: 'YAML · Disable SA Token Automount',
        yaml: `apiVersion: v1\nkind: ServiceAccount\nmetadata: { name: web-sa, namespace: prod }\nautomountServiceAccountToken: false`,
        tip: 'CKS Exam Favorite: Disable automounting on the ServiceAccount so every Pod using it inherits zero-token protection automatically.',
        metrics: [['AUTOMOUNT', 'false ✓', 'green'], ['TOKEN FILE', 'Absent ✓', 'green'], ['API PIVOT', 'Impossible ✓', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'ZERO-TOKEN HARDENING', rows: [['automountToken', 'false ✓'], ['/var/run/secrets', 'not mounted'], ['attacker RCE', 'no API credentials ✓']], banner: ['ZERO CREDENTIAL SURFACE ✓', 'green'] },
        zones: [Z(105, 42, 610, 265, 'HARDENED APP POD (NO API TOKEN)', '#1E7E45')],
        nodes: [
          N('p', 250, 175, 'pod', 'mint', 'Web App Pod', 'automount: false', ['✓ no token', 'green'], 'Contains zero Kubernetes credentials on disk.'),
          N('api', 565, 175, 'hex', 'lavender', 'kube-apiserver', 'unreachable', ['🔒 safe', 'green'], 'Compromised app cannot pivot to cluster API.')
        ],
        edges: [E('p', 'api', 'err', { stop: 0.55 })]
      }
    ]
  },

  'rbac-authz': {
    id: 'rbac-authz', moduleId: 'm5', certs: ['CKS', 'CKA', 'CNPE'],
    title: 'RBAC Authorization',
    subtitle: 'Additive Verbs & API Groups, Role vs ClusterRole, scoping ClusterRoles to 1 Namespace with RoleBinding, and least-privilege auditing.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Combine apiGroups, resources & verbs in RBAC rules',
      'Distinguish Role vs ClusterRole boundaries',
      'Scope a reusable ClusterRole to 1 Namespace via RoleBinding',
      'Audit dangerous escalation verbs (bind, escalate, create pods)'
    ],
    steps: [
      {
        short: 'Verbs & Groups', cat: 'SECURITY',
        title: 'RBAC Anatomy: (apiGroups, resources, verbs)',
        body: ['RBAC rules are strictly additive (default-deny). Every rule grants specific <strong>verbs</strong> (<code>get, list, watch, create</code>) on <strong>resources</strong> inside an <strong>apiGroup</strong> (<code>""</code> for core Pods/Secrets, <code>"apps"</code> for Deployments).'],
        tip: 'CKA Tip: Don’t guess apiGroups—check them instantly with `kubectl api-resources` (core group is always `""`).',
        metrics: [['MODEL', 'Default-Deny'], ['CORE GROUP', 'apiGroups: [""]'], ['APPS GROUP', 'Deployments'], ['EXAM TRACK', 'CKA · CKS', 'red']],
        trace: { title: 'RBAC RULE MATCH', rows: [['GET /pods', 'verb:get grp:"" -> 200 ✓'], ['GET /secrets', 'no match -> 403 ✕'], ['deny rules', 'none (additive only)']], banner: ['EXPLICIT ALLOWLIST ONLY ✓', 'green'] },
        zones: [Z(305, 38, 460, 275, 'RBAC AUTHORIZER', '#1E7E45')],
        nodes: [
          N('p', 145, 175, 'pod', 'sky', 'metrics-sa', 'Bearer JWT', null, 'Authorized strictly for pods get/list.'),
          N('ok', 535, 108, 'cube', 'mint', 'GET /pods', '200 OK', ['✓ 200 OK', 'green'], 'Matches Role rule cleanly.'),
          N('no', 535, 245, 'cyl', 'coral', 'GET /secrets', '403 Forbidden', ['✗ 403', 'red'], 'Blocked by default-deny RBAC.')
        ],
        edges: [E('p', 'ok', 'ok'), E('p', 'no', 'err', { stop: 0.78 })]
      },
      {
        short: 'Role vs CR', cat: 'SECURITY',
        title: 'Role (1 Namespace) vs ClusterRole (Cluster-Wide)',
        body: ['A <strong>Role</strong> lives in a single Namespace and controls namespaced resources. A <strong>ClusterRole</strong> is cluster-scoped and can control cluster-wide resources (Nodes, PVs) OR act as a reusable template across Namespaces.'],
        tip: 'Only use ClusterRoleBinding when access genuinely must span EVERY namespace (including kube-system!).',
        metrics: [['ROLE', '1 Namespace', 'green'], ['CLUSTERROLE', 'Cluster / Template'], ['CRB SCOPE', 'All Namespaces', 'warn'], ['EXAM TRACK', 'CKA · CKS', 'warn']],
        trace: { title: 'SCOPE COMPARISON', rows: [['Role + RB', 'ns: prod only ✓'], ['CR + CRB', 'ALL namespaces + Nodes'], ['blast radius', 'prefer RoleBinding']], banner: ['KEEP BINDINGS NARROW ✓', 'green'] },
        zones: [Z(65, 42, 325, 265, 'ROLE + ROLEBINDING (1 NS)', '#1E7E45'), Z(425, 42, 330, 265, 'CLUSTERROLE + CRB (ALL NS)', '#A8640C')],
        nodes: [
          N('r', 228, 175, 'shield', 'mint', 'Role + RB', 'ns: prod only', ['✓ scoped', 'green'], 'Least-privilege namespace boundary.'),
          N('cr', 590, 175, 'shield', 'peach', 'CR + CRB', 'cluster-wide', ['⚠ global', 'warn'], 'Grants access across every namespace including kube-system.')
        ],
        edges: []
      },
      {
        short: 'CR + RB Pattern', cat: 'SECURITY',
        title: 'Pro Pattern: Bind a Reusable ClusterRole via RoleBinding',
        body: ['Instead of duplicating 50 identical <code>pod-reader</code> Roles across 50 Namespaces, define ONE <strong>ClusterRole</strong> (like built-in <code>view</code>) and attach it using a <strong>RoleBinding</strong> inside <code>ns: team-a</code>.', 'The RoleBinding strictly constrains permissions to <code>team-a</code> ONLY!'],
        yamlTitle: 'CLI · Scope ClusterRole to 1 Namespace',
        yaml: `kubectl create rolebinding dev-view \\\n  --clusterrole=view --user=alice -n team-a`,
        tip: 'CKA/CKS Trap: Binding a ClusterRole with a RoleBinding grants access ONLY in the RoleBinding’s namespace—never cluster-wide!',
        metrics: [['TEMPLATE', 'ClusterRole: view'], ['BINDING', 'RoleBinding', 'green'], ['ACCESS', 'team-a ONLY ✓', 'green'], ['EXAM TRACK', 'CKA · CKS', 'green']],
        trace: { title: 'SCOPED TEMPLATE', rows: [['ClusterRole', 'view (reusable)'], ['RoleBinding', 'ns: team-a'], ['ns: prod', '403 Forbidden ✓']], banner: ['REUSABLE & STRICTLY SCOPED ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'CLUSTERROLE SCOPED BY ROLEBINDING', '#1E7E45')],
        nodes: [
          N('s', 175, 175, 'users', 'sky', 'Dev Alice', 'Subject', null, 'Needs read-only access in team-a only.'),
          N('rb', 410, 175, 'cube', 'peach', 'RoleBinding', 'in ns: team-a', ['✓ 1 NS cap', 'green'], 'Constrains the referenced ClusterRole to team-a.'),
          N('cr', 645, 175, 'shield', 'lavender', 'ClusterRole', 'view', null, 'DRY reusable rule template.')
        ],
        edges: [E('s', 'rb', 'ok'), E('rb', 'cr', 'watch')]
      },
      {
        short: 'Privilege Audit', cat: 'SECURITY',
        title: 'Least-Privilege Audit: Stopping Silent Escalation Paths',
        body: ['Avoid wildcards (<code>*</code>) and watch for hidden privilege escalations: granting <code>create pods</code> lets an attacker launch a privileged hostPath Pod; granting <code>secrets: list</code> dumps every credential in the Namespace!'],
        yamlTitle: 'CLI · Audit Effective Permissions',
        yaml: `kubectl auth can-i --list \\\n  --as=system:serviceaccount:prod:app-sa -n prod`,
        tip: 'Use `kubectl auth can-i --list --as=system:serviceaccount:prod:app-sa -n prod` to audit exact effective permissions.',
        metrics: [['WILDCARDS', 'Banned ✓', 'green'], ['SECRETS LIST', 'Denied ✓', 'green'], ['ESCALATE VERB', 'Blocked ✓', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'RBAC AUDIT CHECK', rows: [['resources: ["*"]', 'FLAGGED & removed ✓'], ['secrets: get', 'restricted by resourceName'], ['can-i --list', 'verified minimal ✓']], banner: ['NO ESCALATION PATHS FOUND ✓', 'green'] },
        zones: [Z(105, 40, 610, 270, 'LEAST-PRIVILEGE RBAC AUDIT', '#C93632')],
        nodes: [
          N('bad', 240, 175, 'cube', 'coral', 'Wildcard Rule', 'verbs: ["*"]', ['✗ removed', 'red'], 'Overly broad rule allowing total namespace takeover.', true),
          N('gd', 575, 175, 'shield', 'mint', 'Scoped Rule', 'configmaps: get', ['✓ audited', 'green'], 'Minimal permissions verified with kubectl auth can-i.')
        ],
        edges: [E('bad', 'gd', 'ok')]
      }
    ]
  },

  'admission-webhooks': {
    id: 'admission-webhooks', moduleId: 'm5', certs: ['CKS', 'CKA', 'CNPE'],
    title: 'Admission Controllers & Webhooks',
    subtitle: 'Pipeline ordering, Mutating Webhooks, OpenAPI schema validation, Validating Webhooks, and native in-process CEL policies.',
    duration: '12 min', difficulty: 'Intermediate',
    checklist: [
      'Place Admission between AuthZ and etcd persistence',
      'Mutate objects transparently with MutatingAdmissionWebhook',
      'Validate schema structure after all mutations complete',
      'Enforce custom rules with ValidatingAdmissionWebhook',
      'Run zero-latency in-process ValidatingAdmissionPolicy (CEL)'
    ],
    steps: [
      {
        short: 'Pipeline Order', cat: 'SECURITY',
        title: 'Where Admission Fits: Between AuthZ and etcd',
        body: ['Read requests (GET/LIST/WATCH) bypass Admission. Every mutating request (CREATE/UPDATE/DELETE) runs: <strong>AuthN -> AuthZ -> Mutating -> Schema -> Validating -> etcd</strong>.'],
        tip: 'Compiled-in admission plugins (like NamespaceLifecycle, LimitRanger, PodSecurity) run alongside dynamic Webhooks and CEL policies.',
        metrics: [['STAGE', 'Post-AuthZ'], ['ORDER', 'Mut -> Sch -> Val'], ['READ CALLS', 'Bypassed'], ['EXAM TRACK', 'CKS · CNPE', 'purple']],
        trace: { title: 'ADMISSION POSITION', rows: [['1. AuthN/Z', 'who & verbs ✓'], ['2. Mutating', 'patch payload'], ['3. Validating', 'approve -> etcd ✓']], banner: ['LAST GATE BEFORE ETCD ✓', 'green'] },
        zones: [Z(55, 42, 710, 265, 'KUBE-APISERVER WRITE PIPELINE', '#6E47B8')],
        nodes: [
          N('az', 145, 175, 'shield', 'sky', 'AuthN/Z', '401 / 403', null, 'Identity and RBAC checks.'),
          N('mu', 325, 175, 'cube', 'peach', 'Mutating', 'JSON Patch', null, 'Modifies object defaults/sidecars.'),
          N('va', 505, 175, 'shield', 'mint', 'Validating', 'Allow / Deny', ['✓ gate', 'green'], 'Enforces security & compliance.'),
          N('et', 680, 175, 'cyl', 'lavender', 'etcd', 'persist ✓', null, 'Stores admitted state.')
        ],
        edges: [E('az', 'mu', 'req'), E('mu', 'va', 'ok'), E('va', 'et', 'watch')]
      },
      {
        short: 'Mutating Hook', cat: 'SECURITY',
        title: 'MutatingAdmissionWebhook: Sidecar & Defaults Injection',
        body: ['API Server posts an HTTPS <code>AdmissionReview</code> to a <strong>Mutating Webhook</strong> (Istio, Vault Agent, Kyverno), which responds with a base64 JSON Patch injecting sidecars or security fields on the fly.'],
        tip: 'Mutating webhooks may be re-invoked if an earlier mutation changed fields matching another webhook’s `reinvocationPolicy: IfNeeded`.',
        metrics: [['COMPONENT', 'Mutating Hook'], ['PAYLOAD', 'JSON Patch'], ['RESULT', '+ Sidecar', 'green'], ['EXAM TRACK', 'CKS · CNPE', 'warn']],
        trace: { title: 'MUTATING CALLOUT', rows: [['input', 'Pod (1 container)'], ['webhook', '+ envoy-proxy patch'], ['next', 'OpenAPI schema check']], banner: ['POD TRANSPARENTLY MUTATED ✓', 'green'] },
        zones: [Z(245, 36, 515, 278, 'MUTATING WEBHOOK CALLOUT', '#E07B24')],
        nodes: [
          N('in', 135, 175, 'pod', 'sky', 'Pod YAML', '1 container', null, 'Clean developer manifest.'),
          N('api', 355, 175, 'hex', 'sky', 'API Server', 'mTLS callout', null, 'Invokes webhook with AdmissionReview.'),
          N('mw', 525, 102, 'cube', 'peach', 'Mutating Hook', '+envoy patch', ['✎ mutated', 'warn'], 'Returns JSON Patch adding sidecar.'),
          N('out', 665, 238, 'pod', 'mint', 'Patched Pod', 'app + envoy', ['2 ctrs', 'green'], 'Moves to Schema & Validating phase.')
        ],
        edges: [E('in', 'api', 'req'), E('api', 'mw', 'req', { off: -6 }), E('mw', 'api', 'ok', { off: 6 }), E('api', 'out', 'ok')]
      },
      {
        short: 'OpenAPI Schema', cat: 'SECURITY',
        title: 'OpenAPI v3 Schema Validation Runs After Mutation',
        body: ['Immediately after Mutating Admission finishes, kube-apiserver validates the mutated object against its <strong>OpenAPI v3 Schema</strong>—catching typos, wrong data types, or malformed webhook patches before Validating policies run.'],
        tip: 'Use `kubectl apply --dry-run=server` to run the full server-side Admission + Schema pipeline without persisting to etcd!',
        metrics: [['COMPONENT', 'Schema Check'], ['RUNS AFTER', 'Mutating ✓', 'green'], ['CATCHES', 'Type / Patch Bugs'], ['EXAM TRACK', 'CKA · CNPE', 'green']],
        trace: { title: 'SCHEMA VALIDATION', rows: [['spec.replicas', 'integer >= 0 ✓'], ['webhook patch', 'valid container spec ✓'], ['next', 'Validating phase']], banner: ['OBJECT SCHEMA VERIFIED ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'POST-MUTATION SCHEMA GUARD', '#4A7BC7')],
        nodes: [
          N('m', 200, 175, 'pod', 'peach', 'Mutated Obj', 'patched JSON', null, 'Output from Mutating Admission.'),
          N('s', 420, 175, 'shield', 'sky', 'OpenAPI v3', 'strict types', ['✓ valid', 'green'], 'Verifies structural & type compliance.'),
          N('v', 635, 175, 'shield', 'mint', 'Validating', 'policy check', null, 'Evaluates business & security rules.')
        ],
        edges: [E('m', 's', 'req'), E('s', 'v', 'ok')]
      },
      {
        short: 'Validating Hook', cat: 'SECURITY',
        title: 'ValidatingAdmissionWebhook: Block :latest & Unsigned Images',
        body: ['<strong>Validating Webhooks</strong> (OPA Gatekeeper, Kyverno, ImagePolicyWebhook) inspect the final object in parallel and reject violations—such as unsigned images or <code>:latest</code> tags—before anything reaches etcd.', 'Always exclude <code>kube-system</code> when using <code>failurePolicy: Fail</code> to prevent self-healing deadlocks!'],
        tip: 'CKS Tip: ImagePolicyWebhook checks image signatures/digests externally (e.g. Cosign) and blocks unverified images with `allowed: false`.',
        metrics: [['IMAGE', 'api:latest ✕', 'red'], ['DECISION', '403 DENIED', 'red'], ['ETCD', 'Untouched ✓', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'VALIDATING GATE', rows: [['policy', 'require-signed-digest'], ['image', 'api:latest ✕'], ['result', 'allowed: false (403)']], banner: ['POLICY VIOLATION REJECTED', 'red'] },
        zones: [Z(245, 36, 515, 278, 'VALIDATING WEBHOOK ENFORCEMENT', '#C93632')],
        nodes: [
          N('bad', 135, 175, 'pod', 'coral', 'Pod :latest', 'unsigned', ['✗ denied', 'red'], 'Uses mutable :latest image tag.'),
          N('api', 355, 175, 'hex', 'sky', 'API Server', 'calls webhook', null, 'Aborts write on allowed=false.'),
          N('vw', 525, 102, 'shield', 'coral', 'OPA / Kyverno', 'allowed: false', ['✗ DENY', 'red'], 'Rejects non-compliant manifest.'),
          N('et', 665, 238, 'cyl', 'gray', 'etcd', 'untouched', null, 'Protected from bad config.', true)
        ],
        edges: [E('bad', 'api', 'req'), E('api', 'vw', 'req', { off: -6 }), E('vw', 'api', 'err', { off: 6 })]
      },
      {
        short: 'Native CEL', cat: 'SECURITY',
        title: 'ValidatingAdmissionPolicy (CEL): Fast In-Process Policies',
        body: ['GA in Kubernetes 1.30+, <strong>ValidatingAdmissionPolicy</strong> evaluates <strong>CEL</strong> expressions directly inside kube-apiserver—zero external webhook Pods, zero TLS cert rotation, sub-millisecond latency, and zero deadlock risk!'],
        yamlTitle: 'YAML · Native CEL ValidatingAdmissionPolicy',
        yaml: `validations:\n- expression: "object.spec.containers.all(c, !c.image.endsWith(':latest'))"\n  message: "Mutable :latest tags are forbidden"`,
        tip: 'CNPE / CKS Gold: Pair `ValidatingAdmissionPolicy` with `ValidatingAdmissionPolicyBinding` (`validationActions: [Deny, Audit]`) for native policy-as-code.',
        metrics: [['EXECUTION', 'In-Process ✓', 'green'], ['LATENCY', '0.3 ms ✓', 'green'], ['EXTRA PODS', '0 Needed'], ['EXAM TRACK', 'CKS · CNPE', 'purple']],
        trace: { title: 'IN-PROCESS CEL', rows: [['expr', '!image.endsWith(":latest")'], ['network hops', '0 (native API)'], ['eval time', '0.3 ms -> ALLOW ✓']], banner: ['NATIVE CEL POLICY ADMITTED ✓', 'green'] },
        zones: [Z(255, 42, 505, 265, 'IN-PROCESS CEL ENGINE (NO WEBHOOK)', '#1E7E45')],
        nodes: [
          N('p', 140, 175, 'pod', 'sky', 'Signed Pod', '@sha256:9f..', null, 'Immutable signed image digest.'),
          N('api', 410, 175, 'hex', 'mint', 'API + CEL', 'in-process eval', ['✓ 0.3ms CEL', 'green'], 'Evaluates CEL expression directly in memory.'),
          N('et', 660, 175, 'cyl', 'lavender', 'etcd', 'committed ✓', null, 'Stored cleanly with minimal latency.')
        ],
        edges: [E('p', 'api', 'ok'), E('api', 'et', 'watch')]
      }
    ]
  },

  'pod-security-runtime': {
    id: 'pod-security-runtime', moduleId: 'm5', certs: ['CKS', 'CKA', 'CNPE'],
    title: 'Pod Security & Runtime Hardening',
    subtitle: 'Pod Security Standards (Privileged/Baseline/Restricted), PSA Namespace labels, SecurityContext, Seccomp/AppArmor, and eBPF runtime defense + SBOM.',
    duration: '12 min', difficulty: 'Intermediate',
    checklist: [
      'Compare Privileged, Baseline & Restricted standards',
      'Roll out PSA safely with warn + audit before enforce',
      'Harden SecurityContext (non-root, drop ALL, RO rootfs)',
      'Restrict kernel syscalls with Seccomp & AppArmor',
      'Detect runtime breakouts with eBPF & verify SBOMs'
    ],
    steps: [
      {
        short: 'PSS Tiers', cat: 'SECURITY',
        title: 'Pod Security Standards: Privileged, Baseline, Restricted',
        body: ['Kubernetes defines three built-in security profiles: <strong>Privileged</strong> (unrestricted, system agents only), <strong>Baseline</strong> (prevents hostPath, hostNetwork, privileged escapes), and <strong>Restricted</strong> (production best practice: non-root, drop ALL caps, seccomp).'],
        tip: 'Pod Security Admission (PSA) completely replaced deprecated PodSecurityPolicy (PSP) with zero external controllers to maintain.',
        metrics: [['PRIVILEGED', 'System Only', 'red'], ['BASELINE', 'No Escapes', 'warn'], ['RESTRICTED', 'Prod Standard', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'PSS SPECTRUM', rows: [['Privileged', 'CNI / CSI only'], ['Baseline', 'blocks host escapes'], ['Restricted', 'non-root + seccomp ✓']], banner: ['BUILT-IN SECURITY TIERS ✓', 'green'] },
        zones: [Z(65, 42, 690, 265, 'POD SECURITY STANDARDS SPECTRUM', '#6E47B8')],
        nodes: [
          N('p1', 180, 175, 'cube', 'coral', 'Privileged', 'unrestricted', ['⚠ system', 'red'], 'Reserve strictly for trusted system daemons.'),
          N('p2', 410, 175, 'shield', 'yellow', 'Baseline', 'no hostPath', ['minimal', 'warn'], 'Prevents known privilege escalations.'),
          N('p3', 640, 175, 'shield', 'mint', 'Restricted', 'non-root+seccomp', ['★ prod std', 'green'], 'Hardened production standard.')
        ],
        edges: [E('p1', 'p2', 'req'), E('p2', 'p3', 'ok')]
      },
      {
        short: 'PSA Modes', cat: 'SECURITY',
        title: 'Namespace PSA Labels: Enforce, Audit & Warn Safely',
        body: ['Activate PSA with simple Namespace labels: <code>pod-security.kubernetes.io/enforce: restricted</code>.', 'Roll out safely without breaking teams by setting <code>warn: restricted</code> and <code>audit: restricted</code> first so developers see kubectl warnings before you flip <code>enforce</code>!'],
        yamlTitle: 'CLI · Enable PSA Restricted Labels',
        yaml: `kubectl label ns prod \\\n  pod-security.kubernetes.io/enforce=restricted \\\n  pod-security.kubernetes.io/warn=restricted`,
        tip: 'CKS Tip: PSA checks Pods—if a Deployment violates `enforce: restricted`, the Deployment object succeeds, but its ReplicaSet Pods are rejected!',
        metrics: [['ENFORCE', 'Blocks Bad Pods', 'red'], ['WARN', 'kubectl Notice', 'warn'], ['AUDIT', 'SIEM Log ✓', 'green'], ['EXAM TRACK', 'CKS · CKA', 'red']],
        trace: { title: 'PSA ADMISSION', rows: [['label enforce', 'restricted'], ['root Pod', '403 DENIED ✕'], ['audit + warn', 'logged to SIEM ✓']], banner: ['ROOT POD BLOCKED BY PSA ✓', 'red'] },
        zones: [Z(325, 38, 435, 275, 'NS: PROD (enforce: restricted)', '#C93632')],
        nodes: [
          N('rp', 145, 175, 'pod', 'coral', 'Root Pod', 'UID 0 · priv', ['✗ blocked', 'red'], 'Rejected immediately by PSA Restricted gate.'),
          N('psa', 445, 175, 'shield', 'lavender', 'PSA Controller', 'enforce: restricted', ['🔒 strict', 'green'], 'Built-in Kubernetes admission controller.'),
          N('nd', 665, 175, 'cube', 'mint', 'Worker Node', 'protected', null, 'Never executes unhardened containers.')
        ],
        edges: [E('rp', 'psa', 'err', { stop: 0.84 })]
      },
      {
        short: 'SecurityContext', cat: 'SECURITY',
        title: 'Hardened SecurityContext: Non-Root, ReadOnly & Drop ALL',
        body: ['A Restricted-compliant Pod sets: <code>runAsNonRoot: true</code>, <code>allowPrivilegeEscalation: false</code>, <code>readOnlyRootFilesystem: true</code>, and <code>capabilities.drop: ["ALL"]</code>.'],
        yamlTitle: 'YAML · PSA Restricted SecurityContext',
        yaml: `securityContext:\n  runAsNonRoot: true\n  allowPrivilegeEscalation: false\n  readOnlyRootFilesystem: true\n  seccompProfile: { type: RuntimeDefault }\n  capabilities: { drop: ["ALL"] }`,
        tip: 'CKS Tip: If your app needs a scratch folder when `readOnlyRootFilesystem: true`, mount a small `emptyDir` at `/tmp`!',
        metrics: [['USER', 'UID 10001 ✓', 'green'], ['ROOT FS', 'Read-Only ✓', 'green'], ['CAPABILITIES', 'Drop ALL ✓', 'green'], ['EXAM TRACK', 'CKS · CKAD', 'green']],
        trace: { title: 'HARDENED POD PASS', rows: [['runAsNonRoot', 'true (UID 10001) ✓'], ['readOnlyRootFS', 'true (+ /tmp emptyDir)'], ['capabilities', 'drop: ["ALL"] ✓']], banner: ['RESTRICTED POD ADMITTED ✓', 'green'] },
        zones: [Z(325, 38, 435, 275, 'NS: PROD (enforce: restricted)', '#1E7E45')],
        nodes: [
          N('hp', 145, 175, 'pod', 'mint', 'Hardened Pod', 'UID 10001 · RO', ['✓ clean', 'green'], 'Zero root privileges and immutable root filesystem.'),
          N('psa', 445, 175, 'shield', 'mint', 'PSA Gate', 'Restricted PASS', ['✓ PASS', 'green'], 'Satisfies every Pod Security Restricted rule.'),
          N('nd', 665, 175, 'cube', 'sky', 'Worker Node', 'sandboxed', null, 'Runs safely with minimal attack surface.')
        ],
        edges: [E('hp', 'psa', 'ok'), E('psa', 'nd', 'ok')]
      },
      {
        short: 'Seccomp/AppArmor', cat: 'SECURITY',
        title: 'Kernel Syscall Sandboxing: Seccomp & AppArmor',
        body: ['Containers share the host Linux kernel! Enabling <strong>Seccomp</strong> (<code>type: RuntimeDefault</code>) blocks 40+ dangerous syscalls (<code>ptrace</code>, <code>mount</code>, <code>kexec</code>), while <strong>AppArmor</strong> restricts file paths and network access.'],
        tip: 'For untrusted multi-tenant code, pair Seccomp with a sandboxed RuntimeClass like gVisor or Kata Containers.',
        metrics: [['SECCOMP', 'RuntimeDefault', 'green'], ['BLOCKED', '44+ Syscalls', 'green'], ['APPARMOR', 'Profile Active'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'KERNEL SYSCALL FILTER', rows: [['read / socket', 'ALLOW ✓'], ['mount / ptrace', 'EPERM BLOCKED ✕'], ['isolation', 'kernel hardened ✓']], banner: ['ESCAPE SYSCALLS BLOCKED ✓', 'green'] },
        zones: [Z(275, 38, 485, 275, 'LINUX KERNEL SYSCALL BOUNDARY', '#6E47B8')],
        nodes: [
          N('c', 145, 175, 'pod', 'sky', 'Container', 'syscalls', null, 'Application process invoking Linux kernel.'),
          N('sc', 405, 175, 'shield', 'lavender', 'Seccomp BPF', 'RuntimeDefault', ['✓ filter', 'green'], 'Blocks unsafe kernel syscalls at minimal overhead.'),
          N('ok', 655, 108, 'cube', 'mint', 'Safe Calls', 'read · write', null, 'Normal app operations run at full speed.'),
          N('no', 655, 245, 'cube', 'coral', 'mount / ptrace', 'EPERM Denied', ['✗ blocked', 'red'], 'Container breakout vectors blocked.', true)
        ],
        edges: [E('c', 'sc', 'req'), E('sc', 'ok', 'ok'), E('sc', 'no', 'err', { stop: 0.78 })]
      },
      {
        short: 'eBPF & SBOM', cat: 'SECURITY',
        title: 'Runtime eBPF Threat Detection (Falco) & Supply Chain SBOM',
        body: ['Before deploy, scan images with <strong>Trivy</strong>, generate an <strong>SBOM</strong> (SPDX/CycloneDX), and verify <strong>Cosign</strong> signatures.', 'At runtime, <strong>Falco / Tetragon eBPF</strong> watches live kernel syscalls on every node—alerting or killing a Pod in milliseconds if someone spawns <code>/bin/sh</code> or reads <code>/etc/shadow</code>!'],
        tip: 'CKS Defense-in-Depth: Supply Chain (SBOM + Cosign) prevents bad images; PSA/Seccomp shrinks blast radius; Falco eBPF catches live intrusions!',
        metrics: [['SUPPLY CHAIN', 'Cosign + SBOM', 'green'], ['RUNTIME', 'Falco eBPF', 'green'], ['ALERT TIME', '< 10 ms', 'warn'], ['EXAM TRACK', 'CKS · CNPE', 'red']],
        trace: { title: 'FALCO EBPF SENSOR', rows: [['CI gate', 'Trivy + SBOM + Cosign ✓'], ['runtime', 'cat /etc/shadow DETECTED'], ['action', 'SIEM alert + kill Pod']], banner: ['RUNTIME INTRUSION CAUGHT ✓', 'red'] },
        zones: [Z(70, 38, 690, 275, 'RUNTIME EBPF DETECTION & RESPONSE', '#C93632')],
        nodes: [
          N('p', 175, 175, 'pod', 'coral', 'Compromised Pod', 'cat /etc/shadow', ['⚠ anomaly', 'red'], 'Unexpected shell or sensitive file read.'),
          N('eb', 415, 175, 'shield', 'yellow', 'Falco eBPF', 'kernel probe', ['⚡ detected', 'warn'], 'Inspects every container syscall via eBPF.'),
          N('al', 650, 175, 'cube', 'lavender', 'SIEM / Kill', 'auto-isolate', ['✓ contained', 'green'], 'Alerts SOC and triggers Pod isolation.')
        ],
        edges: [E('p', 'eb', 'err', { count: 3 }), E('eb', 'al', 'req')]
      }
    ]
  },

  /* ======================== MODULE 06 ======================== */
  'crds-schema': {
    id: 'crds-schema', moduleId: 'm6', certs: ['CKA', 'CNPE'],
    title: 'CustomResourceDefinitions (CRDs)',
    subtitle: 'Extending kube-apiserver at runtime with CRDs, OpenAPI v3 + CEL validation, /status & /scale subresources, and version conversion.',
    duration: '9 min', difficulty: 'Intermediate',
    checklist: [
      'Extend Kubernetes REST & Watch APIs without recompiling',
      'Enforce strict OpenAPI v3 + CEL schema validation',
      'Separate spec from observed state via /status & /scale',
      'Upgrade CRD schemas cleanly with Conversion Webhooks'
    ],
    steps: [
      {
        short: 'Extend API', cat: 'EXTENSIBILITY',
        title: 'CRDs Turn kube-apiserver Into a Platform Control Plane',
        body: ['Applying a <strong>CustomResourceDefinition (CRD)</strong> (e.g., <code>PostgresCluster</code>) dynamically mounts <code>/apis/db.io/v1/postgresclusters</code> in kube-apiserver.', 'You immediately get etcd storage, RBAC, Watch streams, and <code>kubectl get pg</code> for free!'],
        tip: 'A CRD alone stores declarative data in etcd—pairing it with a Custom Controller makes it an active Operator.',
        metrics: [['NEW KIND', 'PostgresCluster', 'green'], ['ETCD + RBAC', 'Built-in ✓', 'green'], ['RECOMPILE', 'Zero ✓', 'green'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'CRD REGISTRATION', rows: [['apply', 'crd/postgresclusters.db.io'], ['mounted', '/apis/db.io/v1/...'], ['kubectl', 'get pgclusters ✓']], banner: ['API EXTENDED DYNAMICALLY ✓', 'green'] },
        zones: [Z(265, 42, 495, 265, 'DYNAMIC KUBE-APISERVER', '#6E47B8')],
        nodes: [
          N('crd', 145, 175, 'cube', 'lavender', 'CRD YAML', 'db.io/v1', null, 'Defines group, version, kind, and shortNames.'),
          N('api', 410, 175, 'hex', 'sky', 'kube-apiserver', 'new REST route', ['+ /apis/db.io', 'green'], 'Serves CRUD & Watch for the new Kind immediately.'),
          N('et', 660, 175, 'cyl', 'mint', 'etcd', 'persists CRs', null, 'Stores Custom Resources alongside native Pods.')
        ],
        edges: [E('crd', 'api', 'req'), E('api', 'et', 'watch')]
      },
      {
        short: 'OpenAPI + CEL', cat: 'EXTENSIBILITY',
        title: 'OpenAPI v3 Schema & X-Kubernetes-Validations (CEL)',
        body: ['Structural <strong>OpenAPI v3 schemas</strong> enforce required fields, types, and ranges right inside kube-apiserver—pruning unknown fields automatically.', 'Embedded <strong>CEL rules</strong> validate cross-field invariants (e.g., <code>self.replicas >= 3 || self.tier != "prod"</code>) without writing a webhook!'],
        yamlTitle: 'YAML · Inline CRD CEL Validation',
        yaml: `x-kubernetes-validations:\n- rule: "self.tier != 'prod' || self.replicas >= 3"\n  message: "Prod PostgresCluster requires >= 3 replicas"`,
        tip: 'CNPE Tip: Add `additionalPrinterColumns` to your CRD so `kubectl get pg` shows Health, Primary, and Storage columns cleanly.',
        metrics: [['SCHEMA', 'OpenAPI v3', 'green'], ['CROSS-FIELD', 'Inline CEL ✓', 'green'], ['INVALID CR', '422 Rejected', 'red'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'CRD VALIDATION', rows: [['replicas: 1', 'tier: prod -> CEL ✕'], ['replicas: 3', 'tier: prod -> PASS ✓'], ['webhook', '0 needed ✓']], banner: ['SELF-VALIDATING API SCHEMA ✓', 'green'] },
        zones: [Z(270, 38, 490, 275, 'CRD STRUCTURAL + CEL VALIDATION', '#1E7E45')],
        nodes: [
          N('cr', 140, 175, 'cube', 'peach', 'CR Manifest', 'tier: prod, rep: 3', null, 'Developer self-service database request.'),
          N('sc', 415, 175, 'shield', 'lavender', 'OpenAPI + CEL', 'inline rules', ['✓ valid', 'green'], 'Validates types and cross-field constraints in-process.'),
          N('et', 665, 175, 'cyl', 'mint', 'etcd', 'CR stored ✓', null, 'Clean typed object persisted.')
        ],
        edges: [E('cr', 'sc', 'req'), E('sc', 'et', 'ok')]
      },
      {
        short: 'Status & Scale', cat: 'EXTENSIBILITY',
        title: 'Subresources: /status Isolation & Native HPA /scale',
        body: ['Enabling the <code>/status</code> subresource separates human-owned <code>spec</code> from controller-owned <code>status</code>—preventing RBAC overlap and write races.', 'Enabling <code>/scale</code> lets Kubernetes’ built-in <strong>HPA</strong> and <code>kubectl scale</code> autoscale your Custom Resource natively!'],
        tip: 'Always enable `subresources.status: {}` on production CRDs so controllers update status without bumping `metadata.generation`!',
        metrics: [['/STATUS', 'Controller Only', 'green'], ['/SCALE', 'Native HPA ✓', 'green'], ['GENERATION', 'Clean Spec Diff'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'CRD SUBRESOURCES', rows: [['PUT /spec', 'user updates desired'], ['PUT /status', 'operator writes Ready'], ['HPA -> /scale', 'native autoscaling ✓']], banner: ['SPEC & STATUS CLEANLY SPLIT ✓', 'green'] },
        zones: [Z(285, 38, 475, 275, 'CR SUBRESOURCE ENDPOINTS', '#6E47B8')],
        nodes: [
          N('u', 145, 108, 'users', 'sky', 'Developer', 'edits /spec', null, 'Declares desired database size.'),
          N('op', 145, 245, 'cube', 'mint', 'Operator', 'writes /status', null, 'Reports observed health and primary pod.'),
          N('cr', 455, 175, 'hex', 'lavender', 'Postgres CR', '/spec & /status', ['✓ split', 'green'], 'Separate RBAC and optimistic concurrency boundaries.'),
          N('hpa', 670, 175, 'cube', 'peach', 'HPA', 'calls /scale', ['✓ native', 'green'], 'Autoscales CR seamlessly.')
        ],
        edges: [E('u', 'cr', 'req'), E('op', 'cr', 'ok'), E('hpa', 'cr', 'watch')]
      },
      {
        short: 'Versioning', cat: 'EXTENSIBILITY',
        title: 'API Evolution: Multi-Version CRDs & Conversion Webhooks',
        body: ['CRDs support serving multiple API versions simultaneously (<code>v1alpha1</code>, <code>v1beta1</code>, <code>v1</code>) while storing ONE canonical <code>storage: true</code> version in etcd.', 'A <strong>Conversion Webhook</strong> translates fields seamlessly on the fly so older clients never break during upgrades!'],
        tip: 'Never remove an old stored version from a CRD until all existing etcd objects have been migrated to the new storage version.',
        metrics: [['SERVED', 'v1alpha1 + v1'], ['STORED', 'v1 Canonical', 'green'], ['UPGRADES', 'Zero Break ✓', 'green'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'VERSION CONVERSION', rows: [['client A', 'GET v1alpha1 -> converted'], ['client B', 'GET v1 -> direct'], ['etcd storage', 'always canonical v1 ✓']], banner: ['BACKWARD-COMPATIBLE EVOLUTION ✓', 'green'] },
        zones: [Z(280, 38, 480, 275, 'MULTI-VERSION CRD SERVING', '#6E47B8')],
        nodes: [
          N('c1', 140, 108, 'users', 'yellow', 'Legacy CLI', 'v1alpha1', null, 'Still speaks older API schema.'),
          N('c2', 140, 245, 'users', 'mint', 'New CLI', 'v1', null, 'Uses stable v1 schema.'),
          N('cw', 435, 175, 'cube', 'lavender', 'Conversion Hook', 'v1alpha1 <-> v1', ['⇄ convert', 'warn'], 'Losslessly translates schema fields.'),
          N('et', 665, 175, 'cyl', 'mint', 'etcd (v1)', 'storage: true', ['✓ v1', 'green'], 'Single canonical storage version.')
        ],
        edges: [E('c1', 'cw', 'req'), E('c2', 'cw', 'ok'), E('cw', 'et', 'watch')]
      }
    ]
  },

  'controllers-operators': {
    id: 'controllers-operators', moduleId: 'm6', certs: ['CKA', 'CNPE'],
    title: 'Controllers, Informers & Operators',
    subtitle: 'SharedIndexInformer local cache, RateLimiting WorkQueue, Reconcile() loop, OwnerReferences GC, and Self-Service Operators.',
    duration: '12 min', difficulty: 'Advanced',
    checklist: [
      'Read from local SharedInformer cache with 0 API QPS',
      'Deduplicate & retry keys cleanly via WorkQueue',
      'Drive Desired vs Actual state in Reconcile()',
      'Automate cascading cleanup with OwnerRefs & Finalizers',
      'Package domain SRE runbooks as an Operator'
    ],
    steps: [
      {
        short: 'SharedInformer', cat: 'EXTENSIBILITY',
        title: 'List-Watch & SharedIndexInformer Local RAM Cache',
        body: ['Custom controllers never poll API Server! A <strong>SharedIndexInformer</strong> opens ONE List-Watch stream, stores objects in a local in-memory <strong>Indexer Cache</strong>, and invokes registered EventHandlers.', 'Reads during reconciliation hit local RAM in microseconds—zero load on kube-apiserver!'],
        tip: 'Never mutate objects retrieved directly from the Informer cache—always call `.DeepCopy()` first to avoid corrupting shared memory!',
        metrics: [['WATCH CONNS', '1 Shared ✓', 'green'], ['CACHE READ', '< 0.01 ms RAM', 'green'], ['API QPS', 'Minimal ✓', 'green'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'CLIENT-GO INFORMER', rows: [['Reflector', '1 LIST + HTTP/2 WATCH'], ['DeltaFIFO', 'updates local Indexer'], ['Lister', 'O(1) RAM reads ✓']], banner: ['LOCAL INFORMER CACHE SYNCED ✓', 'purple'] },
        zones: [Z(265, 38, 495, 275, 'OPERATOR POD · SHAREDINDEXINFORMER', '#4A7BC7')],
        nodes: [
          N('api', 140, 175, 'hex', 'sky', 'API Server', '1 Watch stream', null, 'Streams object deltas over HTTP/2.'),
          N('inf', 395, 175, 'cube', 'lavender', 'Informer', 'Reflector+FIFO', ['↻ sync', 'purple'], 'Maintains thread-safe local cache.'),
          N('cch', 655, 175, 'cyl', 'mint', 'Local Cache', 'O(1) RAM', ['✓ 0 QPS', 'green'], 'Instant local reads for Reconcile().')
        ],
        edges: [E('api', 'inf', 'watch'), E('inf', 'cch', 'ok')]
      },
      {
        short: 'WorkQueue', cat: 'EXTENSIBILITY',
        title: 'RateLimiting WorkQueue: Key Deduplication & Backoff',
        body: ['EventHandlers enqueue only the object key (<code>"prod/pg-1"</code>) into a <strong>WorkQueue</strong>—not the full JSON.', 'If 15 rapid changes hit <code>prod/pg-1</code>, WorkQueue coalesces them into <strong>1</strong> reconciliation, and requeues transient errors with exponential backoff!'],
        tip: 'Queueing keys (not events) forces Reconcile() to always read the latest state—naturally guaranteeing level-triggered behavior.',
        metrics: [['DEDUP', '15 -> 1 Run ✓', 'green'], ['RETRIES', 'Exp. Backoff'], ['CONCURRENCY', 'Worker Pool'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'WORKQUEUE ENGINE', rows: [['enqueued', '"prod/pg-1" (coalesced)'], ['worker #2', 'Reconcile("prod/pg-1")'], ['on err', 'requeue 10ms -> 20ms']], banner: ['COALESCED & BACKOFF-SAFE ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'RATE-LIMITING WORKQUEUE', '#E07B24')],
        nodes: [
          N('inf', 180, 175, 'cube', 'lavender', 'Informer', 'enqueues key', null, 'Pushes "namespace/name" string only.'),
          N('wq', 410, 175, 'cube', 'peach', 'WorkQueue', 'dedup + backoff', ['15 -> 1', 'green'], 'Prevents concurrent workers colliding on same key.'),
          N('rec', 645, 175, 'hex', 'mint', 'Reconcile()', 'worker pool', null, 'Reads latest state and reconciles.')
        ],
        edges: [E('inf', 'wq', 'watch'), E('wq', 'rec', 'ok')]
      },
      {
        short: 'Reconcile Loop', cat: 'EXTENSIBILITY',
        title: 'Reconcile(): Expanding 1 Custom Resource Into a Full Stack',
        body: ['Inside <code>Reconcile()</code>, the Operator compares desired CR spec against observed cluster state and stamps out a <strong>StatefulSet</strong>, <strong>Primary/Replica Services</strong>, and <strong>TLS Secrets</strong>—continuously healing any manual drift!'],
        yamlTitle: 'Go · Controller-Runtime Reconcile',
        yaml: `func (r *PgReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {\n  // Read from Informer cache -> diff StatefulSet/Svc -> Update /status\n}`,
        tip: 'Keep Reconcile() idempotent: running it once or 100 times must yield the exact same cluster resources.',
        metrics: [['INPUT', '1 CR (15 lines)'], ['MANAGES', 'STS + Svc + Sec', 'green'], ['DRIFT HEAL', 'Continuous ✓', 'green'], ['EXAM TRACK', 'CNPE · CKA', 'green']],
        trace: { title: 'RECONCILE EXPANSION', rows: [['desired', 'PostgresCluster (3 nodes)'], ['created', 'StatefulSet + Services'], ['status', 'Phase: Ready (pg-0) ✓']], banner: ['FULL HA STACK RECONCILED ✓', 'green'] },
        zones: [Z(365, 34, 400, 282, 'OPERATOR-MANAGED RESOURCES', '#1E7E45')],
        nodes: [
          N('op', 175, 175, 'hex', 'mint', 'PG Operator', 'Reconcile()', ['↻ active', 'green'], 'Drives native K8s primitives to match CR spec.'),
          N('sts', 565, 92, 'cluster', 'sky', 'StatefulSet', 'pg-0, pg-1, pg-2', null, 'Managed database replicas.'),
          N('svc', 565, 180, 'router', 'peach', 'Services', 'pg-rw & pg-ro', null, 'Routes writes strictly to active Primary.'),
          N('sec', 565, 268, 'cyl', 'lavender', 'TLS Secrets', 'auto-rotated', null, 'Managed certificates & credentials.')
        ],
        edges: [E('op', 'sts', 'ok'), E('op', 'svc', 'req'), E('op', 'sec', 'watch')]
      },
      {
        short: 'OwnerRefs & GC', cat: 'EXTENSIBILITY',
        title: 'Cascading Cleanup: OwnerReferences & External Finalizers',
        body: ['Stamping <code>metadata.ownerReferences</code> on child StatefulSets/Services lets Kubernetes’ built-in <strong>Garbage Collector</strong> delete every child automatically when the parent CR is deleted.', 'For external resources (S3 buckets, DNS records), add a <strong>Finalizer</strong>—pausing CR deletion until the Operator finishes external cleanup!'],
        tip: 'Stuck in `Terminating` forever? A Finalizer’s controller is probably down—fix the controller or clean the external resource before removing the finalizer.',
        metrics: [['IN-CLUSTER', 'OwnerRefs GC', 'green'], ['EXTERNAL', 'Finalizer Hook', 'green'], ['ORPHANS', 'Zero ✓', 'green'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'CLEAN DELETION', rows: [['DELETE CR', 'deletionTimestamp set'], ['Finalizer', 'delete S3 backup -> remove'], ['K8s GC', 'cascade delete STS/Svc ✓']], banner: ['ZERO ORPHANED RESOURCES ✓', 'green'] },
        zones: [Z(70, 38, 690, 275, 'SAFE DELETION & GARBAGE COLLECTION', '#6E47B8')],
        nodes: [
          N('cr', 175, 175, 'cube', 'coral', 'DELETE CR', 'Finalizer lock', ['⏳ draining', 'warn'], 'Waits until external S3 cleanup finishes.'),
          N('fin', 435, 108, 'cube', 'peach', 'Operator Hook', 'cleans S3/DNS', ['✓ cleaned', 'green'], 'Removes finalizer once external resource is deleted.'),
          N('gc', 435, 245, 'cube', 'lavender', 'K8s GC', 'OwnerRefs', ['✓ cascade', 'green'], 'Deletes owned StatefulSet, Services, and Secrets.'),
          N('dn', 665, 175, 'cube', 'mint', '0 Orphans', 'clean exit', ['✓ done', 'green'], 'Cluster and cloud account completely clean.')
        ],
        edges: [E('cr', 'fin', 'req'), E('cr', 'gc', 'watch'), E('fin', 'dn', 'ok'), E('gc', 'dn', 'ok')]
      },
      {
        short: 'Self-Service', cat: 'EXTENSIBILITY',
        title: 'The Operator Pattern: Codifying SRE Day-2 Runbooks',
        body: ['An <strong>Operator</strong> (like CloudNativePG, Crossplane, Prometheus Operator) encodes human SRE expertise in code: automated minor upgrades, WAL backups, and 3 AM primary failover!', 'Platform teams expose golden self-service APIs so product devs request compliant databases in 10 lines of YAML.'],
        tip: 'CNPE Core Concept: Operators + CRDs turn Kubernetes into a universal Internal Developer Platform (IDP) control plane.',
        metrics: [['DAY-2 OPS', 'Auto Failover', 'green'], ['RTO', '14 sec ✓', 'green'], ['DEV UX', '10-Line YAML', 'green'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'DAY-2 AUTO FAILOVER', rows: [['pg-0', 'FAILED -> fenced ✕'], ['Operator', 'promote pg-1 (14s) ✓'], ['pg-rw Svc', 'points -> pg-1 ✓']], banner: ['AUTOMATED SRE DAY-2 FAILOVER ✓', 'green'] },
        zones: [Z(310, 36, 455, 278, 'AUTOMATED OPERATOR FAILOVER', '#1E7E45')],
        nodes: [
          N('op', 155, 175, 'hex', 'mint', 'PG Operator', 'SRE in code', ['⚡ failover', 'warn'], 'Detects dead primary and promotes healthiest replica.'),
          N('p0', 460, 108, 'cyl', 'gray', 'pg-0 (old)', 'OFFLINE', ['✗ down', 'red'], 'Fenced automatically to prevent split-brain.', true),
          N('p1', 460, 245, 'cyl', 'mint', 'pg-1 (NEW)', 'role=primary', ['★ promoted', 'green'], 'Promoted cleanly with zero manual intervention.'),
          N('sv', 670, 245, 'router', 'peach', 'pg-rw Svc', '-> pg-1', null, 'Re-targets live write traffic.')
        ],
        edges: [E('op', 'p0', 'err', { stop: 0.72 }), E('op', 'p1', 'ok', { count: 3 }), E('p1', 'sv', 'ok')]
      }
    ]
  },

  /* ======================== MODULE 07 ======================== */
  'level-triggered': {
    id: 'level-triggered', moduleId: 'm7', certs: ['CNPE', 'CKA'],
    title: 'Level-Triggered Reconciliation',
    subtitle: 'Why Kubernetes uses level-triggered state comparison instead of fragile edge-triggered scripts—and how it self-heals missed events.',
    duration: '8 min', difficulty: 'Advanced',
    checklist: [
      'Contrast fragile edge-triggered scripts vs level-triggered loops',
      'Recover cleanly from missed events or controller restarts',
      'Drive Desired vs Observed state idempotently to convergence'
    ],
    steps: [
      {
        short: 'Edge vs Level', cat: 'SYSTEM DESIGN',
        title: 'Edge-Triggered Breaks When One Event Drops',
        body: ['An <strong>edge-triggered</strong> system reacts only to state transitions ("Pod died -> spawn +1"). If a webhook drops or the controller restarts during a network blip, the system stays permanently drifted!', '<strong>Level-triggered</strong> controllers always compare the full <em>Desired State</em> against the full <em>Actual State</em>.'],
        tip: 'System Design Pattern: Edge-triggered = "react to what just happened". Level-triggered = "inspect the world right now and fix any diff".',
        metrics: [['EDGE MODEL', 'Drops = Drift', 'red'], ['LEVEL MODEL', 'Self-Healing ✓', 'green'], ['IDEMPOTENT', 'Required ✓', 'green'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'EDGE FAILURE', rows: [['event: PodDied', 'dropped during restart ✕'], ['edge script', 'stuck at 2/3 forever'], ['level loop', 'checks state -> heals ✓']], banner: ['EDGE-TRIGGERED DRIFTS ON LOSS', 'red'] },
        zones: [Z(65, 42, 325, 265, 'EDGE-TRIGGERED (FRAGILE)', '#C93632'), Z(425, 42, 330, 265, 'LEVEL-TRIGGERED (K8S)', '#1E7E45')],
        nodes: [
          N('e1', 155, 175, 'cube', 'coral', 'Missed Event', 'packet lost', ['✗ lost', 'red'], 'Dropped event leaves system permanently short.'),
          N('e2', 310, 175, 'cluster', 'gray', '2 / 3 Pods', 'drifted', ['✗ stuck', 'red'], 'Never recovers without manual intervention.', true),
          N('l1', 515, 175, 'hex', 'mint', 'Level Ctrl', 'diff(3 vs 2)', ['↻ checks', 'green'], 'Compares desired=3 against live=2 regardless of missed events.'),
          N('l2', 680, 175, 'cluster', 'mint', '3 / 3 Pods', 'converged', ['✓ healed', 'green'], 'Automatically converges back to desired count.')
        ],
        edges: [E('e1', 'e2', 'err', { stop: 0.72 }), E('l1', 'l2', 'ok', { count: 3 })]
      },
      {
        short: 'Resync & Self-Heal', cat: 'SYSTEM DESIGN',
        title: 'Periodic Resync & Watch Reconnect Guarantee Convergence',
        body: ['Even if a Kubernetes controller crashes for 2 minutes while 50 changes occur, upon restart its Informer lists the latest world snapshot and reconciles every diff in a single pass.', 'Combined with periodic resync intervals, transient cloud API failures automatically self-heal.'],
        tip: 'In Kubernetes, Watch events are merely an optimization to wake up a level-triggered loop faster—correctness never depends on catching every event!',
        metrics: [['RECOVERY', 'Automatic ✓', 'green'], ['MISSED EVENTS', 'Tolerated ✓', 'green'], ['CONSISTENCY', 'Eventual'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'CRASH RECOVERY', rows: [['ctrl restart', 'missed 50 events'], ['fresh LIST', 'reads full actual state'], ['reconcile', 'all diffs fixed ✓']], banner: ['SURVIVES CONTROLLER RESTARTS ✓', 'green'] },
        zones: [Z(85, 38, 650, 275, 'CONTINUOUS DESIRED vs ACTUAL LOOP', '#1E7E45')],
        nodes: [
          N('des', 200, 110, 'cyl', 'lavender', 'Desired (etcd)', 'replicas: 3', null, 'Declarative spec persisted in etcd.'),
          N('obs', 200, 245, 'cluster', 'peach', 'Observed Live', '2 Running', ['diff = -1', 'warn'], 'Current cluster reality.'),
          N('ctl', 465, 175, 'hex', 'mint', 'Reconciler', 'Idempotent loop', ['↻ +1 Pod', 'green'], 'Computes delta and applies corrective action.'),
          N('ok', 665, 175, 'cluster', 'mint', 'Converged', '3 / 3 Ready', ['✓ match', 'green'], 'Desired == Observed.')
        ],
        edges: [E('des', 'ctl', 'watch'), E('obs', 'ctl', 'req'), E('ctl', 'ok', 'ok')]
      },
      {
        short: 'Declarative API', cat: 'SYSTEM DESIGN',
        title: 'Declarative Intent Beats Imperative Scripts at Scale',
        body: ['Imperative scripts encode <em>how</em> to step from A to B and break halfway through partial failures. Declarative Kubernetes specs state <em>what</em> the end state must look like, letting independent controllers drive reality there safely.'],
        tip: 'Always prefer `kubectl apply` (declarative) or GitOps over imperative one-off mutations in production.',
        metrics: [['API STYLE', 'Declarative ✓', 'green'], ['PARTIAL FAIL', 'Auto-Resumed', 'green'], ['AUDITABILITY', '100% Diffable'], ['EXAM TRACK', 'CNPE · CKA', 'green']],
        trace: { title: 'DECLARATIVE LOOP', rows: [['spec', 'what (never how)'], ['status', 'observed reality'], ['controllers', 'converge independently']], banner: ['RESILIENT SELF-HEALING DESIGN ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'DECLARATIVE INTENT ARCHITECTURE', '#6E47B8')],
        nodes: [
          N('y', 195, 175, 'cube', 'sky', 'Intent YAML', 'spec: desired', null, 'Single source of desired truth.'),
          N('a', 415, 175, 'hex', 'lavender', 'API + etcd', 'stores spec', ['✓ versioned', 'green'], 'Central state store decoupling actors.'),
          N('c', 635, 175, 'cube', 'mint', 'Controllers', 'converge loop', ['✓ steady', 'green'], 'Autonomous loops continuously reconcile reality.')
        ],
        edges: [E('y', 'a', 'req'), E('a', 'c', 'watch', { off: -8 }), E('c', 'a', 'ok', { off: 8 })]
      }
    ]
  },

  'hub-watch-cache': {
    id: 'hub-watch-cache', moduleId: 'm12', certs: ['CNPE', 'CKA', 'CKS'],
    title: 'Hub-and-Spoke & Watch Cache',
    subtitle: 'Why every component talks only to kube-apiserver, how the in-memory Watch Cache protects etcd, and API Priority & Fairness.',
    duration: '9 min', difficulty: 'Advanced',
    checklist: [
      'Decouple controllers via Hub-and-Spoke choreography',
      'Shield etcd from 5,000 Watchers using API Watch Cache',
      'Prevent overload with Watch Bookmarks & APF queues'
    ],
    steps: [
      {
        short: 'Hub & Spoke', cat: 'SYSTEM DESIGN',
        title: 'Hub-and-Spoke: Zero Direct Component-to-Component RPCs',
        body: ['Scheduler never calls Kubelet; Deployment Controller never calls Scheduler. Every component is a spoke talking ONLY to the central <strong>kube-apiserver</strong> hub.', 'This eliminates N² mesh coupling and lets you swap Schedulers, CNIs, or custom Operators without touching core code!'],
        tip: 'Because every mutation passes through one hub, AuthN, RBAC, Audit Logging, and Admission Policies apply uniformly to humans AND system daemons.',
        metrics: [['TOPOLOGY', 'Hub & Spoke', 'green'], ['COUPLING', 'O(N) vs O(N²)', 'green'], ['ETCD CLIENTS', 'API Server Only'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'CHOREOGRAPHY HUB', rows: [['Scheduler -> API', 'writes Binding'], ['Kubelet <- API', 'watches Binding'], ['Direct RPCs', '0 (fully decoupled) ✓']], banner: ['ZERO MESH COUPLING AT SCALE ✓', 'green'] },
        zones: [Z(75, 36, 675, 278, 'HUB-AND-SPOKE CONTROL PLANE CHOREOGRAPHY', '#4A7BC7')],
        nodes: [
          N('sc', 175, 102, 'cube', 'peach', 'Scheduler', 'spoke #1', null, 'Watches unbound Pods; writes nodeName.'),
          N('cm', 175, 248, 'cube', 'yellow', 'Ctrl Manager', 'spoke #2', null, 'Runs Deployment/RS/Node controllers.'),
          N('api', 415, 175, 'hex', 'mint', 'kube-apiserver', 'Central Hub', ['★ single hub', 'green'], 'Sole gateway to etcd with uniform AuthN/Z & Audit.'),
          N('kub', 655, 102, 'cube', 'sky', 'Kubelets', 'spoke #3', null, 'Watch assigned Pods on each worker node.'),
          N('et', 655, 248, 'cyl', 'lavender', 'etcd', 'private store', null, 'Never exposed directly to worker nodes.')
        ],
        edges: [E('sc', 'api', 'watch'), E('cm', 'api', 'watch'), E('api', 'kub', 'watch'), E('api', 'et', 'req')]
      },
      {
        short: 'Watch Cache', cat: 'SYSTEM DESIGN',
        title: 'In-Memory Watch Cache Shields etcd From 5,000 Nodes',
        body: ['If 5,000 Kubelets and 200 Operators all watched etcd directly, etcd would melt under fan-out CPU load.', 'Instead, <strong>kube-apiserver</strong> maintains ONE Watch stream per resource to etcd and serves thousands of client Watches from its fast <strong>in-memory ring buffer Watch Cache</strong>!'],
        tip: 'Setting `resourceVersion="0"` on LIST calls reads directly from the API Server Watch Cache instead of hitting etcd quorum!',
        metrics: [['ETCD WATCHES', '1 / Resource ✓', 'green'], ['FAN-OUT', 'API RAM Cache', 'green'], ['SCALE', '5,000+ Nodes'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'WATCH FAN-OUT', rows: [['etcd -> API', '1 stream per kind ✓'], ['API -> cluster', '5,000 HTTP/2 streams'], ['etcd CPU', 'protected (< 15%) ✓']], banner: ['1:N IN-MEMORY FAN-OUT ACTIVE ✓', 'purple'] },
        zones: [Z(260, 36, 505, 278, 'WATCH CACHE RING BUFFER FAN-OUT', '#6E47B8')],
        nodes: [
          N('et', 140, 175, 'cyl', 'lavender', 'etcd', '1 stream', ['✓ low load', 'green'], 'Streams each change once to kube-apiserver.'),
          N('api', 405, 175, 'hex', 'mint', 'Watch Cache', 'RAM ring buf', ['1 -> 5,000', 'green'], 'Broadcasts deltas concurrently to thousands of watchers.'),
          N('w1', 665, 92, 'cube', 'sky', 'Kubelets (5k)', 'HTTP/2 Watch', null, 'Worker nodes receiving real-time deltas.'),
          N('w2', 665, 180, 'cube', 'peach', 'kube-proxy', 'EndpointSlices', null, 'Network proxies syncing service backends.'),
          N('w3', 665, 268, 'cube', 'lavender', 'Operators', 'Informers', null, 'Custom controllers watching CRDs.')
        ],
        edges: [E('et', 'api', 'watch', { count: 1 }), E('api', 'w1', 'ok'), E('api', 'w2', 'ok'), E('api', 'w3', 'watch')]
      },
      {
        short: 'APF & Bookmarks', cat: 'SYSTEM DESIGN',
        title: 'API Priority & Fairness (APF) & Watch Bookmarks',
        body: ['What if a buggy Operator fires 10,000 LIST calls/sec? <strong>API Priority & Fairness (APF)</strong> isolates traffic into FlowSchemas and PriorityLevels—throttling the noisy client (<code>429</code>) while reserving guaranteed lanes for <code>system-leader-election</code> and Node Leases!', '<strong>Watch Bookmarks</strong> periodically advance clients’ <code>resourceVersion</code> so reconnects avoid costly full re-LISTs.'],
        yamlTitle: 'CLI · Inspect APF Priority Queues',
        yaml: `kubectl get prioritylevelconfigurations,flowschemas`,
        tip: 'Inspect APF queues on a live cluster with `kubectl get prioritylevelconfigurations` and `kubectl get flowschemas`.',
        metrics: [['APF ISOLATION', 'Fair Queues ✓', 'green'], ['NOISY CLIENT', '429 Throttled', 'warn'], ['NODE LEASES', 'Protected ✓', 'green'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'APF FLOW CONTROL', rows: [['system-node', 'exempt lane -> 200 ✓'], ['buggy-app', 'workload lane -> 429'], ['bookmarks', 'rv kept fresh ✓']], banner: ['CONTROL PLANE PROTECTED BY APF ✓', 'green'] },
        zones: [Z(285, 36, 480, 278, 'API PRIORITY & FAIRNESS (APF)', '#1E7E45')],
        nodes: [
          N('sys', 145, 108, 'cube', 'mint', 'Node Leases', 'high priority', ['✓ exempt', 'green'], 'Critical cluster heartbeats never starve.'),
          N('bad', 145, 245, 'cube', 'coral', 'Buggy Client', '10k LIST/s', ['⚠ 429 cap', 'red'], 'Throttled inside its own fair-queuing bucket.'),
          N('apf', 450, 175, 'shield', 'yellow', 'APF Queues', 'FlowSchemas', ['✓ fair', 'green'], 'Prevents thundering herds from crashing kube-apiserver.'),
          N('api', 670, 175, 'hex', 'sky', 'API Server', 'healthy p99', null, 'Control plane stays responsive under storm.')
        ],
        edges: [E('sys', 'apf', 'ok'), E('bad', 'apf', 'err', { stop: 0.78 }), E('apf', 'api', 'ok')]
      }
    ]
  },

  'leader-election': {
    id: 'leader-election', moduleId: 'm7', certs: ['CNPE', 'CKA'],
    title: 'HA Leader Election & Fencing',
    subtitle: 'Preventing split-brain across replicated controllers using Kubernetes Lease objects, TTL renewal, and rapid failover.',
    duration: '7 min', difficulty: 'Advanced',
    checklist: [
      'Run Active/Standby controller replicas safely without races',
      'Renew Lease holderIdentity & renewTime via OCC',
      'Fail over cleanly on TTL expiry without split-brain'
    ],
    steps: [
      {
        short: 'Lease Lock', cat: 'SYSTEM DESIGN',
        title: 'Active-Standby Replicas Compete for One Lease Object',
        body: ['For High Availability, you run 3 replicas of <code>kube-controller-manager</code> or a custom Operator—but if all 3 scaled the same Deployment simultaneously, they would fight and create duplicate Pods!', 'All replicas race to claim a single <strong>Lease</strong> object in etcd using atomic Optimistic Concurrency. Exactly ONE becomes the active <strong>Leader</strong>.'],
        yamlTitle: 'CLI · Inspect Control Plane Leader Leases',
        yaml: `kubectl get leases -n kube-system`,
        tip: 'Never run >1 replica of a custom Operator without enabling `--leader-elect=true`!',
        metrics: [['PATTERN', 'Active-Standby'], ['LOCK OBJECT', 'Lease (etcd)'], ['ACTIVE LEADERS', 'Exactly 1 ✓', 'green'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'LEASE ACQUISITION', rows: [['Lease', 'kube-scheduler'], ['holderIdentity', 'sched-0 (CAS win ✓)'], ['sched-1, 2', 'hot standby']], banner: ['SINGLE ACTIVE LEADER ELECTED ✓', 'green'] },
        zones: [Z(70, 38, 690, 275, 'HA CONTROLLER LEASE ELECTION', '#6E47B8')],
        nodes: [
          N('c0', 180, 105, 'cube', 'mint', 'Ctrl-0', 'ACTIVE LEADER', ['★ leader', 'green'], 'Holds Lease lock and runs reconciliation loops.'),
          N('c1', 180, 248, 'cube', 'gray', 'Ctrl-1 & 2', 'hot standby', ['standby', 'warn'], 'Idle replicas watching Lease expiry.'),
          N('ls', 450, 175, 'cyl', 'lavender', 'Lease Object', 'holder: Ctrl-0', ['TTL 15s', 'green'], 'coordination.k8s.io/v1 Lease persisted in etcd.'),
          N('cl', 670, 175, 'cluster', 'sky', 'Cluster State', '0 race bugs', null, 'Clean single-writer reconciliation.')
        ],
        edges: [E('c0', 'ls', 'ok'), E('c1', 'ls', 'watch', { count: 1 }), E('ls', 'cl', 'ok')]
      },
      {
        short: 'Heartbeat Renew', cat: 'SYSTEM DESIGN',
        title: 'Periodic Lease Renewal Every 2s Before 15s LeaseDuration',
        body: ['While healthy, <code>Ctrl-0</code> updates <code>renewTime</code> on the Lease every <code>retryPeriod (2s)</code>. Standby replicas watch the Lease and stay passive as long as <code>renewTime</code> stays within <code>leaseDuration (15s)</code>.'],
        tip: 'Keep `renewDeadline` (e.g. 10s) strictly shorter than `leaseDuration` (15s) so a partitioned leader voluntarily steps down and exits before another replica takes over!',
        metrics: [['LEASE TTL', '15 sec'], ['RENEW PERIOD', '2 sec ✓', 'green'], ['DEADLINE', '10 sec'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'LEASE HEARTBEAT', rows: [['Ctrl-0 renew', 'every 2s -> 200 OK ✓'], ['renewDeadline', '10s self-stepdown'], ['standby watch', 'passive (0 writes)']], banner: ['LEADER HEARTBEAT HEALTHY ✓', 'green'] },
        zones: [Z(105, 42, 610, 265, 'STEADY-STATE LEASE RENEWAL', '#1E7E45')],
        nodes: [
          N('c0', 225, 175, 'cube', 'mint', 'Leader Ctrl-0', 'renew every 2s', ['✓ active', 'green'], 'Continuously extends Lease timestamp.'),
          N('ls', 565, 175, 'cyl', 'lavender', 'Lease (etcd)', 'renewTime=now', ['✓ valid', 'green'], 'Updated atomically via kube-apiserver.')
        ],
        edges: [E('c0', 'ls', 'ok', { off: -8 }), E('ls', 'c0', 'watch', { off: 8 })]
      },
      {
        short: 'Failover & Fence', cat: 'SYSTEM DESIGN',
        title: 'Leader Crash -> TTL Expires -> Standby Takes Over Cleanly',
        body: ['If <code>Ctrl-0</code> crashes (or freezes past its 10s <code>renewDeadline</code> and self-terminates), the 15s TTL expires. <code>Ctrl-1</code> wins the atomic Lease swap and resumes all cluster reconciliation within seconds—zero split-brain!'],
        tip: 'Self-fencing (exiting the process on failed renew) is essential in distributed systems so a GC-paused old leader cannot wake up and write stale changes.',
        metrics: [['OLD LEADER', 'Fenced / Down', 'red'], ['NEW LEADER', 'Ctrl-1 Active ✓', 'green'], ['FAILOVER RTO', '~15 sec ✓', 'green'], ['EXAM TRACK', 'CNPE · CKA', 'green']],
        trace: { title: 'LEADER FAILOVER', rows: [['Ctrl-0', 'crashed -> TTL expired'], ['Ctrl-1 CAS', 'holderIdentity=Ctrl-1 ✓'], ['split-brain', 'prevented (fenced) ✓']], banner: ['HA LEADER FAILOVER COMPLETE ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'AUTOMATIC LEADER FAILOVER', '#1E7E45')],
        nodes: [
          N('c0', 185, 105, 'cube', 'gray', 'Ctrl-0', 'OFFLINE', ['✗ down', 'red'], 'Crashed or self-fenced on missed renew.', true),
          N('c1', 185, 248, 'cube', 'mint', 'Ctrl-1', 'NEW LEADER', ['★ promoted', 'green'], 'Claimed expired Lease atomically via CAS.'),
          N('ls', 465, 175, 'cyl', 'lavender', 'Lease Object', 'holder: Ctrl-1', ['✓ swapped', 'green'], 'New holderIdentity committed in etcd.'),
          N('cl', 675, 175, 'cluster', 'mint', 'Workloads', 'reconciling ✓', null, 'Zero interruption to running Pods.')
        ],
        edges: [E('c0', 'ls', 'err', { stop: 0.65 }), E('c1', 'ls', 'ok', { count: 3 }), E('ls', 'cl', 'ok')]
      }
    ]
  },

  /* ======================== MODULE 08 ======================== */
  'gitops-argocd': {
    id: 'gitops-argocd', moduleId: 'm8', certs: ['CNPE', 'CKA'],
    title: 'GitOps & ArgoCD Reconciliation',
    subtitle: 'Pull-based continuous delivery, live Git-vs-Cluster diffing, automatic drift self-healing, and audited Git rollback.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Separate CI artifact builds from Pull-based CD sync',
      'Detect live cluster drift via ArgoCD 3-way diff',
      'Auto-revert manual kubectl hotfixes with selfHeal',
      'Roll back broken deployments cleanly via git revert'
    ],
    steps: [
      {
        short: 'Git Push', cat: 'PLATFORM',
        title: 'Git as Single Source of Truth (Zero Prod Credentials in CI)',
        body: ['Engineers merge declarative Helm/Kustomize manifests into Git. CI builds & signs the OCI image and updates the image digest in the GitOps repo—<strong>CI never holds production kubeconfig credentials!</strong>'],
        tip: 'CNPE Best Practice: Pull-based GitOps shrinks your blast radius dramatically because production cluster credentials never leave the cluster.',
        metrics: [['DEPLOY MODEL', 'Pull GitOps ✓', 'green'], ['CI PROD CREDS', 'Zero ✓', 'green'], ['AUDIT TRAIL', '100% Git'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'GITOPS COMMIT', rows: [['PR #418', 'api:v2.0@sha256 (2 ✓)'], ['CI pipeline', 'build + Cosign sign ✓'], ['ArgoCD', 'webhook received']], banner: ['DESIRED STATE COMMITTED IN GIT ✓', 'green'] },
        zones: [Z(360, 38, 405, 275, 'PROD CLUSTER (PULL-BASED)', '#1E7E45')],
        nodes: [
          N('dev', 115, 175, 'users', 'sky', 'Engineer', 'PR -> main', null, 'Commits declarative Kubernetes manifests.'),
          N('git', 265, 175, 'cyl', 'lavender', 'GitOps Repo', 'sha: a94f2c', ['★ truth', 'green'], 'Audited, signed declarative cluster configuration.'),
          N('arg', 485, 175, 'hex', 'mint', 'ArgoCD', 'pulls from Git', ['✓ Synced', 'green'], 'In-cluster controller reconciling Git to Kubernetes.'),
          N('pod', 675, 175, 'cluster', 'sky', 'Prod Pods', 'v1.9 -> v2.0', null, 'Target workloads reconciled continuously.')
        ],
        edges: [E('dev', 'git', 'req'), E('git', 'arg', 'watch'), E('arg', 'pod', 'ok')]
      },
      {
        short: 'OutOfSync Diff', cat: 'PLATFORM',
        title: 'Continuous 3-Way Diff Detects OutOfSync Immediately',
        body: ['ArgoCD computes a live diff between <strong>Git HEAD (v2.0)</strong> and <strong>Cluster etcd (v1.9)</strong>. Seeing the mismatch, it marks the Application <code>OutOfSync</code> and triggers automated rollout sync.'],
        tip: 'Use ArgoCD Sync Waves (`argocd.argoproj.io/sync-wave: "-1"`) to run PreSync DB migration Jobs before new app Pods start.',
        metrics: [['SYNC STATUS', 'OutOfSync', 'warn'], ['GIT DESIRED', 'api:v2.0'], ['LIVE STATE', 'api:v1.9'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'ARGOCD DIFF ENGINE', rows: [['Git HEAD', 'image: api:v2.0'], ['Live etcd', 'image: api:v1.9'], ['Action', 'auto-sync triggered']], banner: ['DRIFT DIFF DETECTED -> SYNCING', 'warn'] },
        zones: [Z(310, 38, 455, 275, 'KUBERNETES CLUSTER (PROD)', '#A8640C')],
        nodes: [
          N('git', 155, 175, 'cyl', 'lavender', 'Git Repo', 'desired: v2.0', ['v2.0', 'purple'], 'Updated desired manifest.'),
          N('arg', 435, 175, 'hex', 'yellow', 'ArgoCD', 'OutOfSync ⚠', ['↻ syncing', 'warn'], 'Applies manifests to kube-apiserver.'),
          N('api', 665, 175, 'cluster', 'mint', 'App Pods', 'rolling -> v2', ['✓ Ready', 'green'], 'Zero-downtime update to v2.0.')
        ],
        edges: [E('git', 'arg', 'watch'), E('arg', 'api', 'req', { count: 3 })]
      },
      {
        short: 'Self-Heal Drift', cat: 'PLATFORM',
        title: 'selfHeal: true Reverts Unauthorized Manual kubectl Edits',
        body: ['If someone runs <code>kubectl scale --replicas=1</code> directly in prod, ArgoCD spots the live divergence within seconds and automatically restores <code>replicas: 3</code> from Git—keeping prod 100% reproducible!'],
        yamlTitle: 'YAML · ArgoCD Automated Self-Heal',
        yaml: `syncPolicy:\n  automated:\n    prune: true\n    selfHeal: true`,
        tip: 'Combine `selfHeal: true` with `prune: true` so deleted Git files also clean up obsolete Kubernetes objects automatically.',
        metrics: [['MANUAL EDIT', 'scale=1 ⚠', 'red'], ['SELF-HEAL', 'Reverted -> 3', 'green'], ['HEAL TIME', '4.1 sec ✓', 'green'], ['EXAM TRACK', 'CNPE', 'green']],
        trace: { title: 'SELF-HEAL EVENT', rows: [['drift', 'manual kubectl scale=1'], ['ArgoCD', 'selfHeal: true active'], ['result', 'restored 3 replicas ✓']], banner: ['DRIFT ELIMINATED AUTOMATICALLY ✓', 'green'] },
        zones: [Z(310, 38, 455, 275, 'SELF-HEALING PROD CLUSTER', '#1E7E45')],
        nodes: [
          N('git', 150, 108, 'cyl', 'lavender', 'Git Repo', 'replicas: 3', null, 'Authoritative desired state.'),
          N('man', 150, 245, 'users', 'coral', 'Manual Edit', 'scale=1 drift', ['✗ reverted', 'red'], 'Out-of-band edit immediately undone.'),
          N('arg', 435, 175, 'hex', 'mint', 'ArgoCD', 'selfHeal: true', ['⚡ healing', 'green'], 'Enforces Git state over live mutations.'),
          N('pod', 665, 175, 'cluster', 'mint', 'Prod Pods', '3/3 Protected', ['✓ 3 pods', 'green'], 'Capacity protected automatically.')
        ],
        edges: [E('git', 'arg', 'watch'), E('man', 'pod', 'err', { stop: 0.45 }), E('arg', 'pod', 'ok', { count: 3 })]
      },
      {
        short: 'Git Revert', cat: 'PLATFORM',
        title: 'Audited Zero-Panic Rollback With git revert HEAD',
        body: ['If v2.1 introduces a regression, don’t edit prod YAML manually. Run <code>git revert HEAD</code>—ArgoCD detects the forward commit pointing back to v2.0 and heals the entire cluster with full Git audit history!'],
        tip: 'Never click UI rollback while Auto-Sync is ON—ArgoCD will immediately re-sync forward to Git HEAD. Always revert in Git!',
        metrics: [['ACTION', 'git revert HEAD'], ['MTTR', '16 sec ✓', 'green'], ['LIVE STATE', 'v2.0 Restored', 'green'], ['EXAM TRACK', 'CNPE', 'green']],
        trace: { title: 'GITOPS ROLLBACK', rows: [['git revert', 'HEAD -> v2.0 commit'], ['ArgoCD', 'auto-sync v2.0 (12s)'], ['5xx rate', '0.00% restored ✓']], banner: ['AUDITED ROLLBACK COMPLETE ✓', 'green'] },
        zones: [Z(310, 38, 455, 275, 'CLUSTER RECOVERED TO V2.0', '#1E7E45')],
        nodes: [
          N('git', 155, 175, 'cyl', 'mint', 'Git Revert', 'restores v2.0', ['↶ revert', 'green'], 'Clean forward commit restoring v2.0.'),
          N('arg', 435, 175, 'hex', 'mint', 'ArgoCD', 'Synced v2.0', ['✓ synced', 'green'], 'Reconciles fleet smoothly back to v2.0.'),
          N('pod', 665, 175, 'cluster', 'mint', 'v2.0 Pods', '3/3 Healthy', ['✓ 0% err', 'green'], 'Service fully recovered.')
        ],
        edges: [E('git', 'arg', 'ok'), E('arg', 'pod', 'ok', { count: 3 })]
      }
    ]
  },

  'autoscaling-karpenter': {
    id: 'autoscaling-karpenter', moduleId: 'm8', certs: ['CNPE', 'CKA'],
    title: 'HPA, KEDA & Karpenter Scaling',
    subtitle: 'Two-tier Kubernetes elasticity: HPA/KEDA scales Pods on traffic/queues while Karpenter provisions right-sized Spot VMs and consolidates idle spend.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Scale Pod replicas dynamically with HPA & KEDA',
      'Watch unschedulable Pending Pods trigger Karpenter',
      'Provision right-sized Spot nodes directly in ~35s',
      'Cut cloud bills via automatic Karpenter consolidation'
    ],
    steps: [
      {
        short: 'HPA & KEDA', cat: 'PLATFORM',
        title: 'Tier 1: HPA & KEDA Scale Pods on CPU or Queue Depth',
        body: ['When traffic spikes 10x, <strong>HPA</strong> (CPU/Memory) or <strong>KEDA</strong> (Kafka lag, SQS depth, HTTP RPS—even scaling to zero!) increases Deployment replicas from <code>2 -> 6</code>.', 'Remember: HPA relies strictly on Pod <code>resources.requests</code> to calculate utilization percentage!'],
        yamlTitle: 'CLI · Configure HorizontalPodAutoscaler',
        yaml: `kubectl autoscale deploy api --cpu-percent=70 --min=2 --max=20`,
        tip: 'Always set accurate CPU requests—without `resources.requests.cpu`, HPA cannot compute utilization and shows `<unknown>/70%`.',
        metrics: [['TIER 1', 'HPA / KEDA'], ['REPLICAS', '2 -> 6 Pods', 'warn'], ['NODE A CPU', '96% Full', 'red'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'HPA SCALE OUT', rows: [['avg CPU', '96% (> 70% target)'], ['HPA action', 'scale 2 -> 6 replicas'], ['Node A', 'capacity exhausted ⚠']], banner: ['PODS SCALED -> NEED COMPUTE', 'warn'] },
        zones: [Z(285, 38, 480, 275, 'NODE A (100% ALLOCATED)', '#A8640C')],
        nodes: [
          N('tr', 140, 175, 'users', 'peach', '10x Traffic', '4,500 req/s', ['⚡ spike', 'warn'], 'Sudden workload surge.'),
          N('hpa', 415, 108, 'cube', 'lavender', 'HPA / KEDA', '2 -> 6 Pods', ['+4 pods', 'warn'], 'Scales Deployment replicas immediately.'),
          N('n1', 415, 245, 'cluster', 'peach', 'Node A Pods', '3 Running', ['96% CPU', 'red'], 'Node A has zero remaining allocatable CPU.'),
          N('pn', 665, 245, 'pod', 'gray', 'Pending Pods', '3 Unschedulable', ['⏳ Pending', 'warn'], 'Waiting on Karpenter for a new VM.')
        ],
        edges: [E('tr', 'n1', 'req', { count: 3 }), E('hpa', 'n1', 'watch'), E('hpa', 'pn', 'req')]
      },
      {
        short: 'Karpenter Node', cat: 'PLATFORM',
        title: 'Tier 2: Karpenter Launches Right-Sized Spot Node in ~35s',
        body: ['Seeing 3 <code>Pending</code> Pods, <strong>Karpenter</strong> inspects their exact CPU/RAM/AZ/GPU requirements, bypasses slow Auto Scaling Groups, and launches an optimal <strong>Spot VM</strong> directly via Cloud Fleet API in ~35 seconds!'],
        tip: 'Unlike Cluster Autoscaler (fixed node groups), Karpenter picks the exact cheapest instance SKU that fits the Pending Pods.',
        metrics: [['TIER 2', 'Karpenter', 'green'], ['BOOT TIME', '~35 sec ✓', 'green'], ['INSTANCE', 'c7i.xlarge Spot'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'KARPENTER PROVISION', rows: [['pending', '3 Pods (3 CPU, 6Gi)'], ['SKU picked', 'c7i.xlarge (Spot -68%)'], ['bound', 'all 6 Pods Running ✓']], banner: ['SPOT NODE READY IN 35 SEC ✓', 'green'] },
        zones: [Z(270, 38, 225, 275, 'NODE A (ON-DEMAND)', '#1E7E45'), Z(520, 38, 245, 275, 'NODE B (KARPENTER SPOT)', '#6E47B8')],
        nodes: [
          N('kp', 140, 175, 'hex', 'mint', 'Karpenter', 'NodePool', ['⚡ 35s boot', 'green'], 'Provisions just-in-time Spot compute.'),
          N('na', 382, 175, 'cluster', 'sky', 'Node A Pods', '48% CPU', ['✓ calm', 'green'], 'Latency restored to baseline.'),
          N('nb', 642, 175, 'cluster', 'mint', 'Node B Pods', '3 Bound ✓', ['✓ -68% cost', 'green'], 'New Spot node absorbing burst load.')
        ],
        edges: [E('kp', 'nb', 'ok', { count: 3 }), E('na', 'nb', 'watch', { count: 1 })]
      },
      {
        short: 'Consolidation', cat: 'PLATFORM',
        title: 'FinOps Consolidation: Gracefully Drain & Delete Idle Nodes',
        body: ['When traffic subsides and HPA scales back to 2 Pods, Karpenter detects underutilized nodes, respects <strong>PodDisruptionBudgets (PDB)</strong>, gracefully drains Pods onto Node A, and terminates Node B—slashing idle cloud waste automatically!'],
        tip: 'Always pair Karpenter consolidation with PodDisruptionBudgets (`minAvailable: 1` or `50%`) so voluntary drains never cause downtime.',
        metrics: [['ACTIVE PODS', '2 / 2 Ready', 'green'], ['NODES', '2 -> 1 Packed', 'green'], ['SAVINGS', '-50% Spend ✓', 'green'], ['EXAM TRACK', 'CNPE', 'green']],
        trace: { title: 'AUTO CONSOLIDATION', rows: [['HPA down', '6 -> 2 Pods'], ['PDB check', 'minAvailable=1 OK ✓'], ['Node B', 'drained & terminated ✓']], banner: ['CLOUD BILL AUTO-OPTIMIZED ✓', 'green'] },
        zones: [Z(265, 42, 235, 265, 'NODE A (BIN-PACKED)', '#1E7E45'), Z(530, 42, 230, 265, 'NODE B (TERMINATED)', '#767168')],
        nodes: [
          N('kp', 140, 175, 'hex', 'mint', 'Karpenter', 'Consolidation', ['✓ PDB safe', 'green'], 'Continuously bin-packs and shrinks compute spend.'),
          N('na', 382, 175, 'cluster', 'mint', 'Node A (2x)', '34% CPU', ['✓ packed', 'green'], 'Serving baseline load smoothly.'),
          N('nb', 645, 175, 'cube', 'gray', 'Node B Spot', 'terminated', ['✓ saved $$', 'green'], 'Gracefully drained with 0 dropped requests.', true)
        ],
        edges: [E('kp', 'nb', 'watch'), E('nb', 'na', 'ok')]
      }
    ]
  }
};
