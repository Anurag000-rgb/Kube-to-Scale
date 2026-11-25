/* =========================================================================
   ADDITIONAL LESSONS PART 1:
   Static Pods, TLS PKI, Labels/Affinity, Taints, PriorityClass,
   Volumes & Plugins, CoreDNS, Ingress Controllers, Service Mesh,
   Policies (OPA/Kyverno/CEL), eBPF/CNI/Calico/Falco + Advanced Upgrades
   ========================================================================= */

Object.assign(LESSONS, {
  /* ---------------- MODULE 01 ADDITIONS ---------------- */
  'static-pods': {
    id: 'static-pods', moduleId: 'm1', certs: ['CKA'],
    title: 'Static Pods & Control Plane Bootstrapping',
    subtitle: 'How kubelet runs Pods directly from /etc/kubernetes/manifests without kube-apiserver or etcd, and how Mirror Pods work.',
    duration: '8 min', difficulty: 'Core',
    checklist: [
      'Understand how kubelet watches staticPodPath directly',
      'Explain Mirror Pods visible in kube-apiserver',
      'Bootstrap kube-apiserver, etcd & scheduler as Static Pods'
    ],
    steps: [
      {
        short: 'Manifest Watch', cat: 'ARCHITECTURE',
        title: 'Kubelet Watches /etc/kubernetes/manifests Directly',
        body: ['Regular Pods are scheduled by kube-scheduler via kube-apiserver. <strong>Static Pods</strong> are managed directly by <strong>kubelet</strong> on a specific node by watching local YAML files in <code>--pod-manifest-path</code> (usually <code>/etc/kubernetes/manifests</code>).', 'Drop a YAML there and kubelet starts it; delete the file and kubelet stops it—even if etcd and kube-apiserver are completely down!'],
        yamlTitle: 'CLI · Inspect & Create Static Pod',
        yaml: `grep staticPodPath /var/lib/kubelet/config.yaml\nkubectl run static-web --image=nginx --dry-run=client -o yaml > /etc/kubernetes/manifests/static-web.yaml`,
        tip: 'CKA Classic: `kubectl delete pod kube-apiserver-master` only deletes the Mirror Pod—kubelet immediately recreates it! You must move or edit the file in `/etc/kubernetes/manifests/` to change or remove a Static Pod.',
        metrics: [['MANAGER', 'kubelet Only'], ['API NEEDED', 'No ✓', 'green'], ['PATH', '/etc/.../manifests'], ['EXAM TRACK', 'CKA', 'purple']],
        trace: { title: 'STATIC POD LOOP', rows: [['staticPodPath', '/etc/kubernetes/manifests'], ['file added', 'etcd.yaml -> CRI start ✓'], ['kubectl delete', 'recreated by kubelet!']], banner: ['SELF-BOOTSTRAPPING WITHOUT API ✓', 'green'] },
        zones: [Z(75, 38, 430, 275, 'CONTROL PLANE NODE (LOCAL)', '#1E7E45')],
        nodes: [
          N('dir', 165, 175, 'cube', 'yellow', 'Manifests Dir', '/etc/.../manifests', null, 'Local YAML files watched by kubelet inotify/polling.'),
          N('kub', 395, 175, 'cube', 'mint', 'kubelet', 'direct CRI', ['✓ manages', 'green'], 'Starts static Pods directly without Scheduler.'),
          N('mir', 665, 175, 'hex', 'sky', 'API Mirror Pod', 'read-only view', ['mirror', 'purple'], 'Read-only shadow object created by kubelet for kubectl visibility.')
        ],
        edges: [E('dir', 'kub', 'req'), E('kub', 'mir', 'watch')]
      },
      {
        short: 'Control Plane Pods', cat: 'ARCHITECTURE',
        title: 'Why kubeadm Runs the Control Plane as Static Pods',
        body: ['Chicken-and-egg problem: how can Kubernetes schedule <code>kube-apiserver</code> and <code>etcd</code> as Pods before Kubernetes is running? <code>kubeadm init</code> drops their YAML manifests into <code>/etc/kubernetes/manifests/</code> so kubelet boots them automatically on startup!'],
        yamlTitle: 'CLI · Control Plane Static Pods',
        yaml: `ls -l /etc/kubernetes/manifests/\n# etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml`,
        tip: 'Editing `kube-apiserver.yaml` on disk triggers kubelet to restart the API server automatically. If you make a YAML typo, API server won’t boot—check `crictl ps -a` and `crictl logs`!',
        metrics: [['BOOTSTRAPPED', '4 Static Pods', 'green'], ['NAMING', '<name>-<nodename>'], ['TROUBLESHOOT', 'crictl logs'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'KUBEADM STATIC FLEET', rows: [['etcd-cp1', 'Static Pod ✓'], ['kube-apiserver-cp1', 'Static Pod ✓'], ['kube-scheduler-cp1', 'Static Pod ✓']], banner: ['CONTROL PLANE BOOTSTRAPPED ✓', 'green'] },
        zones: [Z(110, 38, 600, 275, 'NODE: CP-1 · /etc/kubernetes/manifests/', '#4A7BC7')],
        nodes: [
          N('kub', 210, 175, 'cube', 'mint', 'kubelet', 'boots CP stack', ['★ systemd', 'green'], 'Only component installed as OS systemd service.'),
          N('api', 455, 105, 'hex', 'sky', 'apiserver-cp1', 'Static Pod', null, 'Mirror Pod visible in kube-system.'),
          N('et', 455, 245, 'cyl', 'lavender', 'etcd-cp1', 'Static Pod', null, 'Restarts automatically on manifest edit.'),
          N('sc', 645, 175, 'cube', 'peach', 'sched + cm', 'Static Pods', null, 'Controller manager & scheduler static pods.')
        ],
        edges: [E('kub', 'api', 'ok'), E('kub', 'et', 'ok'), E('kub', 'sc', 'ok')]
      }
    ]
  },

  'tls-cluster-pki': {
    id: 'tls-cluster-pki', moduleId: 'm1', certs: ['CKA', 'CKS'],
    title: 'TLS & PKI Certificates in Kubernetes',
    subtitle: 'Full mTLS chain across kube-apiserver, etcd, front-proxy, and kubelets—plus certificate inspection, CSR approval, and renewal.',
    duration: '11 min', difficulty: 'Intermediate',
    checklist: [
      'Map the 3 Certificate Authorities (Cluster, etcd, Front-Proxy)',
      'Trace bidirectional mTLS between client, API server & kubelet',
      'Inspect expiration and renew certs via kubeadm certs'
    ],
    steps: [
      {
        short: '3 CAs Map', cat: 'SECURITY',
        title: 'The 3 Cluster Certificate Authorities (/etc/kubernetes/pki)',
        body: ['Every Kubernetes cluster uses mTLS everywhere, rooted in three separate CAs inside <code>/etc/kubernetes/pki/</code>: <strong>Kubernetes CA</strong> (<code>ca.crt</code> for API/kubelet/users), <strong>etcd CA</strong> (<code>etcd/ca.crt</code> for Raft peers & API-to-etcd), and <strong>Front-Proxy CA</strong> (for Aggregated Extension APIs like metrics-server).'],
        yamlTitle: 'CLI · Inspect PKI & Expiration Dates',
        yaml: `kubeadm certs check-expiration\nopenssl x509 -in /etc/kubernetes/pki/apiserver.crt -text -noout | grep -E "Subject:|DNS:|Not After"`,
        tip: 'CKA Tip: Check which CA signed a certificate or inspect SANs (`Subject Alternative Name`) with `openssl x509 -in <cert> -text -noout`.',
        metrics: [['MAIN CA', 'ca.crt (10yr)'], ['ETCD CA', 'etcd/ca.crt'], ['LEAF CERTS', '1-Year TTL', 'warn'], ['EXAM TRACK', 'CKA · CKS', 'red']],
        trace: { title: 'PKI HIERARCHY', rows: [['ca.crt', 'signs apiserver + kubelet'], ['etcd/ca.crt', 'isolates Raft peers ✓'], ['front-proxy-ca', 'extension APIs ✓']], banner: ['ZERO-TRUST MTLS ROOTED IN 3 CAS ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, '/etc/kubernetes/pki/ TRUST ROOTS', '#C93632')],
        nodes: [
          N('kca', 180, 108, 'shield', 'sky', 'Cluster CA', 'ca.crt / ca.key', ['10y root', 'green'], 'Signs apiserver, controller-manager, scheduler, and user certs.'),
          N('eca', 180, 248, 'shield', 'lavender', 'etcd CA', 'etcd/ca.crt', ['isolated', 'purple'], 'Separate trust root solely for etcd client & peer mTLS.'),
          N('api', 455, 175, 'hex', 'mint', 'kube-apiserver', 'apiserver.crt', ['SANs ✓', 'green'], 'Presents serving cert and verifies client cert CN/O.'),
          N('kub', 670, 175, 'cube', 'peach', 'kubelet :10250', 'auto-rotated', null, 'Uses client cert to pull Pods and serving cert for exec/logs.')
        ],
        edges: [E('kca', 'api', 'ok'), E('eca', 'api', 'watch'), E('api', 'kub', 'req')]
      },
      {
        short: 'mTLS & Renewal', cat: 'SECURITY',
        title: 'Bidirectional mTLS & Automated kubeadm Cert Renewal',
        body: ['In Kubernetes, both sides verify each other (<strong>mTLS</strong>): kubectl verifies <code>apiserver.crt</code> against <code>ca.crt</code>, while API server verifies kubectl’s cert CN/O. Leaf certs expire every 12 months—renew cleanly before expiry with <code>kubeadm certs renew all</code> (and restart control plane pods).'],
        yamlTitle: 'CLI · Renew Expiring Cluster Certs',
        yaml: `kubeadm certs renew all\n# Restart control-plane static pods so new certs load in memory`,
        tip: 'Kubelet client & serving certs auto-rotate automatically via the Kubelet Certificate Rotation controller when `rotateCertificates: true` is enabled.',
        metrics: [['HANDSHAKE', 'TLS 1.3 mTLS ✓', 'green'], ['RENEW CMD', 'kubeadm certs renew'], ['KUBELET', 'Auto-Rotates ✓', 'green'], ['EXAM TRACK', 'CKA · CKS', 'green']],
        trace: { title: 'CERT LIFECYCLE', rows: [['apiserver.crt', 'renewed (+365d) ✓'], ['kubelet.crt', 'auto-rotated via CSR ✓'], ['mTLS verify', 'bidirectional PASS ✓']], banner: ['ALL CLUSTER CERTS VALID & ROTATED ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'BIDIRECTIONAL MTLS & RENEWAL', '#1E7E45')],
        nodes: [
          N('cli', 195, 175, 'users', 'sky', 'kubectl / Client', 'CN=admin', null, 'Verifies server SANs and presents client cert.'),
          N('api', 415, 175, 'hex', 'mint', 'API Server :6443', 'mTLS verified', ['✓ 365d', 'green'], 'Reloads renewed certs cleanly.'),
          N('csr', 635, 175, 'cube', 'lavender', 'Kubelet CSR', 'auto-renewed', ['✓ rotated', 'green'], 'Worker certs renewed without manual touch.')
        ],
        edges: [E('cli', 'api', 'ok', { off: -8 }), E('api', 'cli', 'watch', { off: 8 }), E('csr', 'api', 'req')]
      }
    ]
  },

  /* ---------------- MODULE 03: SCHEDULING, AFFINITY & PRIORITY ---------------- */
  'labels-selectors-affinity': {
    id: 'labels-selectors-affinity', moduleId: 'm3', certs: ['CKA', 'CKAD'],
    title: 'Labels, Selectors, NodeSelector & Affinity',
    subtitle: 'Set-based vs equality label selectors, simple nodeSelector, hard/soft NodeAffinity, and PodAntiAffinity HA spreading.',
    duration: '10 min', difficulty: 'Core',
    checklist: [
      'Filter objects using equality (=, !=) and set-based (in, notin) selectors',
      'Pin Pods cleanly with nodeSelector vs flexible NodeAffinity',
      'Spread HA replicas across zones/nodes using PodAntiAffinity'
    ],
    steps: [
      {
        short: 'Labels & Selectors', cat: 'WORKLOAD',
        title: 'Labels & Selectors: The Glue Connecting Every K8s Object',
        body: ['<strong>Labels</strong> are arbitrary key-value pairs attached to Pods, Nodes, and Services (<code>env=prod, tier=api</code>). <strong>Selectors</strong> group objects using equality (<code>env=prod</code>) or set-based expressions (<code>env in (prod, staging)</code>).'],
        yamlTitle: 'CLI · Query & Label Nodes/Pods',
        yaml: `kubectl get pods -l 'env in (prod,staging),tier!=batch'\nkubectl label node worker-1 disktype=nvme`,
        tip: 'Services, Deployments, NetworkPolicies, and PodDisruptionBudgets ALL target Pods dynamically via Label Selectors—never hardcoded IPs!',
        metrics: [['EQUALITY', '=, ==, !='], ['SET-BASED', 'in, notin, exists'], ['USED BY', 'Svc, Deploy, NetPol'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'SELECTOR QUERY', rows: [['selector', 'app=api, env in (prod)'], ['matched', '3 Ready Pods ✓'], ['excluded', 'staging & batch pods']], banner: ['DYNAMIC LOOSE COUPLING ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'LABEL SELECTOR EVALUATION', '#1E7E45')],
        nodes: [
          N('svc', 145, 175, 'router', 'peach', 'Selector', 'app=api,env=prod', null, 'Matches target Pods dynamically.'),
          N('p1', 455, 108, 'cluster', 'mint', 'Prod API (3x)', 'app=api,env=prod', ['✓ matched', 'green'], 'Selected by Service & NetworkPolicy.'),
          N('p2', 455, 245, 'pod', 'gray', 'Staging Pod', 'app=api,env=stg', ['excluded', 'warn'], 'Ignored safely because env != prod.'),
          N('nd', 670, 175, 'cube', 'sky', 'Node Labels', 'disk=nvme', null, 'Nodes carry hardware & zone labels too.')
        ],
        edges: [E('svc', 'p1', 'ok'), E('svc', 'p2', 'err', { stop: 0.68 })]
      },
      {
        short: 'NodeSelector & Affinity', cat: 'WORKLOAD',
        title: 'NodeSelector vs Hard/Soft NodeAffinity Rules',
        body: ['<code>nodeSelector: { disktype: nvme }</code> is a simple exact-match filter. For richer logic (<code>In</code>, <code>Gt</code>, OR rules), use <strong>NodeAffinity</strong>: <code>requiredDuringSchedulingIgnoredDuringExecution</code> (hard gate) or <code>preferredDuringScheduling...</code> (weighted soft preference).'],
        yamlTitle: 'YAML · Hard + Soft NodeAffinity',
        yaml: `affinity:\n  nodeAffinity:\n    requiredDuringSchedulingIgnoredDuringExecution:\n      nodeSelectorTerms:\n      - matchExpressions: [{ key: topology.kubernetes.io/zone, operator: In, values: [us-east-1a, us-east-1b] }]`,
        tip: 'Notice `IgnoredDuringExecution`: if a node label changes AFTER the Pod is already running, Kubernetes will NOT evict the running Pod.',
        metrics: [['NODESELECTOR', 'Exact Key=Val'], ['REQUIRED', 'Hard Filter ✓', 'green'], ['PREFERRED', 'Weighted Score (1-100)'], ['EXAM TRACK', 'CKA · CKAD', 'purple']],
        trace: { title: 'AFFINITY SCORING', rows: [['required: zone', '1a or 1b PASS ✓'], ['preferred: nvme', '+80 score -> Node 2'], ['Node 3 (hdd)', '0 bonus score']], banner: ['SCHEDULER AFFINITY MATCHED ✓', 'green'] },
        zones: [Z(280, 38, 485, 275, 'SCHEDULER FILTER + SCORE', '#6E47B8')],
        nodes: [
          N('pod', 145, 175, 'pod', 'sky', 'DB Pod', 'req: zone, pref: nvme', null, 'Carries both hard and soft NodeAffinity rules.'),
          N('n1', 450, 108, 'cube', 'mint', 'Node 1 (1a+nvme)', 'score: 100', ['★ picked', 'green'], 'Satisfies required zone AND gets preferred nvme weight.'),
          N('n2', 450, 245, 'cube', 'yellow', 'Node 2 (1a+hdd)', 'score: 20', null, 'Feasible, but lower score than nvme node.'),
          N('n3', 670, 175, 'cube', 'gray', 'Node 3 (1c)', 'filtered out', ['✗ excluded', 'red'], 'Eliminated during Filter phase.', true)
        ],
        edges: [E('pod', 'n1', 'ok', { count: 3 }), E('pod', 'n2', 'watch', { count: 1 }), E('pod', 'n3', 'err', { stop: 0.65 })]
      },
      {
        short: 'PodAntiAffinity', cat: 'WORKLOAD',
        title: 'PodAntiAffinity & TopologySpread: Never Put All Eggs in 1 AZ',
        body: ['<strong>PodAntiAffinity</strong> inspects labels on <em>other Pods</em> already running on a Node/Zone—ensuring two replicas of <code>app=checkout</code> never land on the same Node or Availability Zone!', 'For even finer distribution across large fleets, pair with <code>topologySpreadConstraints</code> (<code>maxSkew: 1</code>).'],
        yamlTitle: 'YAML · HA Zone PodAntiAffinity',
        yaml: `podAntiAffinity:\n  requiredDuringSchedulingIgnoredDuringExecution:\n  - labelSelector: { matchLabels: { app: checkout } }\n    topologyKey: kubernetes.io/hostname`,
        tip: 'If you set `required` PodAntiAffinity with `topologyKey: hostname` on a 3-replica Deployment in a 2-node cluster, the 3rd Pod stays Pending!',
        metrics: [['TOPOLOGY KEY', 'hostname / zone'], ['HA SPREAD', '1 Pod / Node ✓', 'green'], ['SKEW', 'maxSkew: 1'], ['EXAM TRACK', 'CKA · CNPE', 'green']],
        trace: { title: 'HA ZONE SPREAD', rows: [['Pod-1 -> Zone A', 'Placed ✓'], ['Pod-2 -> Zone B', 'AntiAffinity spread ✓'], ['Pod-3 -> Zone C', 'AZ failure safe ✓']], banner: ['HIGH-AVAILABILITY SPREAD ENFORCED ✓', 'green'] },
        zones: [Z(65, 42, 210, 265, 'ZONE 1A', '#1E7E45'), Z(305, 42, 210, 265, 'ZONE 1B', '#1E7E45'), Z(545, 42, 210, 265, 'ZONE 1C', '#1E7E45')],
        nodes: [
          N('p1', 170, 175, 'pod', 'mint', 'checkout-1', 'Zone 1a', ['✓ AZ-a', 'green'], 'Placed in Zone 1a.'),
          N('p2', 410, 175, 'pod', 'mint', 'checkout-2', 'Zone 1b', ['✓ AZ-b', 'green'], 'Repelled from 1a by PodAntiAffinity.'),
          N('p3', 650, 175, 'pod', 'mint', 'checkout-3', 'Zone 1c', ['✓ AZ-c', 'green'], 'Cluster survives full AZ outage!')
        ],
        edges: [E('p1', 'p2', 'watch'), E('p2', 'p3', 'watch')]
      }
    ]
  },

  'taints-tolerations': {
    id: 'taints-tolerations', moduleId: 'm3', certs: ['CKA', 'CKAD', 'CKS'],
    title: 'Taints & Tolerations',
    subtitle: 'Repelling general Pods from dedicated GPU, Compliance, or Control Plane nodes with NoSchedule, PreferNoSchedule, and NoExecute.',
    duration: '8 min', difficulty: 'Core',
    checklist: [
      'Apply Taints to Nodes and matching Tolerations to Pods',
      'Distinguish NoSchedule, PreferNoSchedule & NoExecute',
      'Combine Taints + NodeAffinity for strict exclusive node pools'
    ],
    steps: [
      {
        short: 'Taint Effects', cat: 'WORKLOAD',
        title: 'NoSchedule vs PreferNoSchedule vs NoExecute Eviction',
        body: ['Nodes use <strong>Taints</strong> (<code>key=value:Effect</code>) to repel Pods that lack a matching <strong>Toleration</strong>: <code>NoSchedule</code> blocks new Pods, <code>PreferNoSchedule</code> is a soft avoidance, and <code>NoExecute</code> blocks new Pods AND immediately evicts existing non-tolerating Pods (after <code>tolerationSeconds</code>)!'],
        yamlTitle: 'CLI & YAML · Taint GPU Node + Toleration',
        yaml: `kubectl taint nodes gpu-1 sku=a100:NoSchedule\n# On Pod spec:\ntolerations:\n- { key: "sku", operator: "Equal", value: "a100", effect: "NoSchedule" }`,
        tip: 'CKA Trap: A Toleration lets a Pod schedule ON a tainted node, but does NOT forbid it from scheduling onto untainted normal nodes! Pair with NodeAffinity to pin strictly to the GPU pool.',
        metrics: [['NOSCHEDULE', 'Blocks New Pods'], ['PREFER', 'Soft Avoid'], ['NOEXECUTE', 'Evicts Running!', 'red'], ['EXAM TRACK', 'CKA · CKAD', 'warn']],
        trace: { title: 'TAINT EVALUATION', rows: [['gpu-1 taint', 'sku=a100:NoSchedule'], ['web-pod', 'no toleration -> REJECT ✕'], ['llm-pod', 'tolerates sku=a100 -> OK ✓']], banner: ['DEDICATED GPU POOL PROTECTED ✓', 'green'] },
        zones: [Z(325, 38, 435, 275, 'GPU NODE (TAINT: sku=a100:NoSchedule)', '#A8640C')],
        nodes: [
          N('web', 145, 108, 'pod', 'coral', 'Web Pod', 'no toleration', ['✗ repelled', 'red'], 'Cannot schedule onto expensive GPU node.'),
          N('llm', 145, 245, 'pod', 'mint', 'LLM Train Pod', 'tolerates sku=a100', ['✓ allowed', 'green'], 'Carries matching Toleration + NodeAffinity.'),
          N('sh', 445, 175, 'shield', 'yellow', 'Taint Gate', 'sku=a100', null, 'Scheduler checks Pod tolerations during Filter.'),
          N('gpu', 665, 175, 'cube', 'mint', 'gpu-node-1', 'A100 80GB', ['✓ dedicated', 'green'], 'Reserved exclusively for AI/ML workloads.')
        ],
        edges: [E('web', 'sh', 'err', { stop: 0.78 }), E('llm', 'sh', 'ok'), E('sh', 'gpu', 'ok')]
      },
      {
        short: 'NoExecute & Drain', cat: 'WORKLOAD',
        title: 'NoExecute & Automatic Node Pressure Taints',
        body: ['Kubernetes itself uses <code>NoExecute</code> taints during node failures (<code>node.kubernetes.io/unreachable:NoExecute</code>)! Adding <code>tolerationSeconds: 300</code> tells Kubernetes how long a Pod may stay on an unreachable node before eviction.'],
        yamlTitle: 'YAML · Built-in Unreachable Toleration',
        yaml: `tolerations:\n- key: "node.kubernetes.io/unreachable"\n  operator: "Exists"\n  effect: "NoExecute"\n  tolerationSeconds: 300`,
        tip: 'Control Plane nodes carry `node-role.kubernetes.io/control-plane:NoSchedule` by default—remove it (`kubectl taint nodes cp1 ...-`) only in single-node labs.',
        metrics: [['AUTO-TAINTS', 'unreachable / disk'], ['EVICTION', 'NoExecute', 'red'], ['TOLERATION SEC', '300s Grace'], ['EXAM TRACK', 'CKA', 'purple']],
        trace: { title: 'NOEXECUTE EVICTION', rows: [['taint added', 'maintenance=true:NoExecute'], ['running Pods', 'evicted immediately ✕'], ['DaemonSet', 'tolerates -> stays ✓']], banner: ['RUNNING PODS GRACEFULLY EVICTED ✓', 'warn'] },
        zones: [Z(285, 38, 480, 275, 'TAINT: MAINTENANCE=TRUE:NOEXECUTE', '#C93632')],
        nodes: [
          N('op', 145, 175, 'users', 'peach', 'kubectl taint', ':NoExecute', ['⚡ evict', 'warn'], 'Admin applies NoExecute taint to clear node.'),
          N('app', 445, 108, 'pod', 'coral', 'App Pod', 'no toleration', ['✗ evicted', 'red'], 'Immediately terminated and rescheduled elsewhere.', true),
          N('ds', 445, 245, 'pod', 'mint', 'CNI DaemonSet', 'tolerates All', ['✓ stays', 'green'], 'System DaemonSets carry Exists toleration.')
        ],
        edges: [E('op', 'app', 'err'), E('op', 'ds', 'ok')]
      }
    ]
  },

  'priority-preemption': {
    id: 'priority-preemption', moduleId: 'm3', certs: ['CKA', 'CKAD', 'CNPE'],
    title: 'PriorityClass & Preemption',
    subtitle: 'Guaranteeing scheduling order and evicting lower-priority batch jobs when cluster capacity is tight via PriorityClass.',
    duration: '7 min', difficulty: 'Intermediate',
    checklist: [
      'Rank workloads with PriorityClass integer values',
      'Preempt lower-priority Pods safely under resource pressure',
      'Protect system daemons with system-cluster-critical'
    ],
    steps: [
      {
        short: 'Queue & Preempt', cat: 'WORKLOAD',
        title: 'PriorityClass Orders Queue & Preempts Low-Priority Pods',
        body: ['When a cluster is 100% full, a high-priority <code>PriorityClass</code> Pod (e.g., <code>value: 1000000</code>) jumps to the front of the scheduler queue and <strong>preempts</strong> (evicts) lower-priority batch Pods to free CPU/RAM—respecting PodDisruptionBudgets best-effort!'],
        yamlTitle: 'YAML · Define & Assign PriorityClass',
        yaml: `apiVersion: scheduling.k8s.io/v1\nkind: PriorityClass\nmetadata: { name: prod-critical }\nvalue: 1000000\npreemptionPolicy: PreemptLowerPriority`,
        tip: 'Set `preemptionPolicy: Never` if you want a Pod to jump ahead in the Pending queue WITHOUT killing already-running Pods.',
        metrics: [['PROD CRIT', 'value: 1,000,000', 'green'], ['DEV BATCH', 'value: 100 (Evicted)', 'red'], ['SYSTEM', '2,000,000,000'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'SCHEDULER PREEMPTION', rows: [['node CPU', '100% full (dev-batch)'], ['prod-api', 'priority 1M -> Pending'], ['action', 'evict dev-batch -> bind ✓']], banner: ['CRITICAL WORKLOAD PREEMPTED ROOM ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'FULL NODE · PRIORITY PREEMPTION', '#E07B24')],
        nodes: [
          N('hi', 145, 175, 'pod', 'mint', 'prod-api', 'priority: 1M', ['★ critical', 'green'], 'Must run even if cluster is full.'),
          N('sc', 425, 175, 'cube', 'peach', 'Scheduler', 'picks victim', ['⚡ preempt', 'warn'], 'Evicts lowest-priority Pod to free CPU.'),
          N('lo', 665, 112, 'pod', 'gray', 'dev-batch', 'priority: 100', ['✗ evicted', 'red'], 'Gracefully terminated via SIGTERM.', true),
          N('ok', 665, 245, 'pod', 'mint', 'prod-api', 'Running ✓', ['✓ bound', 'green'], 'Scheduled cleanly onto freed capacity.')
        ],
        edges: [E('hi', 'sc', 'req'), E('sc', 'lo', 'err'), E('sc', 'ok', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 04 ADDITIONS ---------------- */
  'volumes-storage-plugins': {
    id: 'volumes-storage-plugins', moduleId: 'm4', certs: ['CKA', 'CKAD'],
    title: 'Container Storage, Volumes & Driver Plugins',
    subtitle: 'Ephemeral vs persistent volume types (emptyDir, hostPath, projected), and how Volume Driver Plugins (CSI sidecars) work.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Choose emptyDir (tmpfs/disk), hostPath, and projected volumes',
      'Avoid hostPath security risks in multi-tenant clusters',
      'Understand CSI sidecar plugins (provisioner, attacher, resizer, snapshotter)'
    ],
    steps: [
      {
        short: 'Volume Types', cat: 'STORAGE',
        title: 'emptyDir, hostPath & Projected Volumes Inside Pods',
        body: ['<strong>emptyDir</strong> lives as long as the Pod (great for scratch or sidecar file sharing; set <code>medium: Memory</code> for RAM-speed tmpfs). <strong>hostPath</strong> mounts raw node directories (avoid in apps—allows node escape!). <strong>projected</strong> combines Secrets, ConfigMaps, and ServiceAccount tokens into one clean directory.'],
        yamlTitle: 'YAML · RAM-Backed emptyDir + Projected Volume',
        yaml: `volumes:\n- name: cache\n  emptyDir: { medium: Memory, sizeLimit: 256Mi }\n- name: podinfo\n  downwardAPI: { items: [{ path: "labels", fieldRef: { fieldPath: metadata.labels } }] }`,
        tip: 'CKS Alert: Always set `sizeLimit` on `emptyDir`—otherwise a runaway log file fills the worker node disk and triggers kubelet DiskPressure eviction!',
        metrics: [['EMPTYDIR', 'Pod Lifetime'], ['HOSTPATH', 'Node Escape Risk', 'red'], ['PROJECTED', 'Unified Mount ✓', 'green'], ['EXAM TRACK', 'CKAD · CKS', 'purple']],
        trace: { title: 'POD VOLUME MOUNTS', rows: [['/cache', 'emptyDir (Memory 256Mi)'], ['/var/run/sa', 'projected bound JWT ✓'], ['hostPath', 'blocked by PSA ✓']], banner: ['SAFE EPHEMERAL STORAGE BOUND ✓', 'green'] },
        zones: [Z(105, 38, 610, 275, 'POD VOLUME PLUGIN INTERFACES', '#6E47B8')],
        nodes: [
          N('ed', 195, 110, 'cyl', 'sky', 'emptyDir', 'medium: Memory', null, 'Fast scratch RAM wiped when Pod deletes.'),
          N('pr', 195, 245, 'cyl', 'lavender', 'Projected Vol', 'SA + CM + Sec', ['✓ unified', 'green'], 'Combines multiple metadata sources in one mount.'),
          N('pod', 545, 175, 'pod', 'mint', 'App Pod', '/cache & /etc', ['✓ mounted', 'green'], 'Reads unified POSIX filesystem.')
        ],
        edges: [E('ed', 'pod', 'ok'), E('pr', 'pod', 'watch')]
      },
      {
        short: 'Volume Plugins', cat: 'STORAGE',
        title: 'CSI Volume Driver Plugins Replaced In-Tree Cloud Code',
        body: ['Older Kubernetes compiled AWS/Azure/GCP disk drivers directly inside kube-apiserver ("in-tree"), requiring a full K8s upgrade to fix a storage bug. Today, out-of-tree <strong>CSI Driver Plugins</strong> run as standard Pods with modular sidecars: <code>external-provisioner</code>, <code>external-attacher</code>, <code>external-resizer</code>, and <code>external-snapshotter</code>.'],
        tip: 'VolumeSnapshots (`VolumeSnapshot` + `VolumeSnapshotClass`) work through the CSI `external-snapshotter` plugin to create instant crash-consistent cloud snapshots.',
        metrics: [['LEGACY', 'In-Tree (Removed)'], ['MODERN', 'Out-of-Tree CSI ✓', 'green'], ['SNAPSHOTS', 'CSI Snapshotter'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'CSI PLUGIN SIDECARS', rows: [['provisioner', 'CreateVolume API ✓'], ['attacher', 'ControllerPublish ✓'], ['snapshotter', 'CreateSnapshot ✓']], banner: ['MODULAR CSI DRIVER ARCHITECTURE ✓', 'green'] },
        zones: [Z(250, 36, 515, 278, 'OUT-OF-TREE CSI CONTROLLER POD', '#6E47B8')],
        nodes: [
          N('api', 135, 175, 'hex', 'sky', 'API Server', 'PVC / Snap', null, 'Watches PVC & VolumeSnapshot CRs.'),
          N('pr', 425, 102, 'cube', 'lavender', 'csi-provisioner', 'CreateVolume', null, 'Watches PVCs and calls cloud disk API.'),
          N('at', 425, 248, 'cube', 'peach', 'csi-attacher', 'AttachVolume', null, 'Watches VolumeAttachments and attaches to VM.'),
          N('cld', 670, 175, 'cyl', 'mint', 'CSI Driver + Cloud', 'gRPC socket', ['✓ decoupled', 'green'], 'Vendor plugin upgraded independently from K8s.')
        ],
        edges: [E('api', 'pr', 'watch'), E('api', 'at', 'watch'), E('pr', 'cld', 'ok'), E('at', 'cld', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 05 ADDITIONS ---------------- */
  'coredns-nodelocal': {
    id: 'coredns-nodelocal', moduleId: 'm5', certs: ['CKA', 'CKS', 'CNPE'],
    title: 'CoreDNS & NodeLocal DNSCache',
    subtitle: 'How Pods resolve short names with ndots:5, Corefile plugin chains, conntrack UDP exhaustion, and NodeLocal DNSCache.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Trace Pod /etc/resolv.conf search domains & ndots:5',
      'Configure Corefile plugins (kubernetes, forward, cache)',
      'Fix DNS latency & conntrack races with NodeLocal DNSCache'
    ],
    steps: [
      {
        short: 'ndots:5 Trap', cat: 'NETWORKING',
        title: 'CoreDNS Resolution & The Famous ndots:5 Amplification Trap',
        body: ['Every Pod’s <code>/etc/resolv.conf</code> gets <code>nameserver 10.96.0.10</code> and <code>options ndots:5</code>. Any domain with fewer than 5 dots (like <code>api.stripe.com</code>!) tries 4 internal search suffixes (<code>.prod.svc.cluster.local</code>, <code>.svc.cluster.local</code>, etc.) BEFORE querying external DNS!'],
        yamlTitle: 'YAML · Reduce External DNS Queries with ndots:2',
        yaml: `dnsConfig:\n  options:\n  - name: ndots\n    value: "2"`,
        tip: 'App calling external APIs frequently? Either add a trailing dot (`api.stripe.com.`) or set `dnsConfig.options: [{name: ndots, value: "2"}]` to slash DNS traffic by 80%!',
        metrics: [['CLUSTER DNS', '10.96.0.10:53'], ['DEFAULT NDOTS', '5 (8 queries!)', 'warn'], ['TRAILING DOT', '1 Query ✓', 'green'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'RESOLV.CONF SEARCH', rows: [['query', 'api.stripe.com (2 dots)'], ['ndots:5', '4 NXDOMAIN -> external'], ['api.stripe.com.', '1 direct lookup ✓']], banner: ['FQDN TRAILING DOT SAVES 4X DNS ✓', 'warn'] },
        zones: [Z(285, 38, 480, 275, 'KUBE-SYSTEM · COREDNS', '#4A7BC7')],
        nodes: [
          N('pod', 145, 175, 'pod', 'sky', 'App Pod', 'ndots:5', null, 'Checks /etc/resolv.conf search list first.'),
          N('cd', 435, 175, 'cube', 'lavender', 'CoreDNS :53', 'Corefile', ['10.96.0.10', 'green'], 'Runs kubernetes, cache, loop, and forward plugins.'),
          N('in', 670, 108, 'router', 'mint', 'Cluster Svc', '*.svc.cluster', null, 'Answered directly from API Watch cache.'),
          N('up', 670, 245, 'users', 'peach', 'Upstream DNS', '/etc/resolv.conf', null, 'Forwards external domains (8.8.8.8 / VPC DNS).')
        ],
        edges: [E('pod', 'cd', 'req', { count: 3 }), E('cd', 'in', 'ok'), E('cd', 'up', 'watch')]
      },
      {
        short: 'NodeLocal Cache', cat: 'NETWORKING',
        title: 'NodeLocal DNSCache Eliminates Conntrack Races & Latency',
        body: ['At high QPS, routing UDP DNS across nodes through kube-proxy iptables fills Linux <code>conntrack</code> tables and causes random 5-second DNS timeouts! Running <strong>NodeLocal DNSCache</strong> as a DaemonSet on <code>169.254.20.10</code> caches DNS right on every Worker Node over TCP/IP!'],
        tip: 'NodeLocal DNSCache upgrades upstream misses to TCP connections to CoreDNS, completely eliminating Linux UDP conntrack race conditions.',
        metrics: [['DAEMONSET', '169.254.20.10', 'green'], ['CACHE HIT', '< 0.1 ms ✓', 'green'], ['CONNTRACK', 'Bypassed ✓', 'green'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'NODELOCAL DNSCACHE', rows: [['Pod -> local', '169.254.20.10 (0.08ms)'], ['cache miss', 'TCP -> CoreDNS ✓'], ['UDP timeouts', '0 / million ✓']], banner: ['LOCAL NODE DNS CACHE ACTIVE ✓', 'green'] },
        zones: [Z(70, 38, 420, 275, 'WORKER NODE (ZERO CROSS-NODE HOP)', '#1E7E45')],
        nodes: [
          N('pod', 165, 175, 'pod', 'sky', 'App Pod', '169.254.20.10', null, 'Queries link-local DNS agent on the exact same node.'),
          N('nl', 385, 175, 'cube', 'mint', 'NodeLocal DS', 'RAM DNS cache', ['✓ 0.08ms', 'green'], 'Serves cached records locally without conntrack.'),
          N('cd', 665, 175, 'cube', 'lavender', 'CoreDNS', 'TCP fallback', null, 'Only hit on cache miss over reliable TCP.')
        ],
        edges: [E('pod', 'nl', 'ok', { count: 3 }), E('nl', 'cd', 'watch', { count: 1 })]
      }
    ]
  },

  'ingress-controllers': {
    id: 'ingress-controllers', moduleId: 'm5', certs: ['CKA', 'CKAD', 'CKS'],
    title: 'Ingress Controllers Deep Dive',
    subtitle: 'How NGINX/Envoy Ingress Controllers watch Ingress + EndpointSlices, skip kube-proxy hops, and handle TLS + IngressClass.',
    duration: '9 min', difficulty: 'Core',
    checklist: [
      'Understand how Ingress Controllers bypass kube-proxy ClusterIP',
      'Configure multiple IngressClasses safely in one cluster',
      'Compare Prefix vs Exact vs ImplementationSpecific pathTypes'
    ],
    steps: [
      {
        short: 'Bypass Proxy', cat: 'NETWORKING',
        title: 'Ingress Controller Watches EndpointSlices & Connects Direct',
        body: ['An Ingress YAML does nothing until an <strong>Ingress Controller</strong> (ingress-nginx, Traefik, AWS ALB) watches it! Crucially, controllers like NGINX don’t even route through kube-proxy ClusterIP—they watch <strong>EndpointSlices</strong> directly and proxy straight to Pod IPs for sticky sessions & fast health checks!'],
        yamlTitle: 'YAML · Ingress With IngressClass & TLS',
        yaml: `spec:\n  ingressClassName: nginx-public\n  tls: [{ hosts: [api.acme.io], secretName: acme-tls }]\n  rules:\n  - host: api.acme.io\n    http:\n      paths: [{ path: /v1, pathType: Prefix, backend: { service: { name: api-svc, port: { number: 80 } } } }]`,
        tip: 'CKA Tip: If an Ingress stays stuck with empty `ADDRESS`, check if `ingressClassName` matches `kubectl get ingressclass` and whether the controller Pod is Running.',
        metrics: [['CLASS', 'ingressClassName'], ['TARGETING', 'Direct Pod IP ✓', 'green'], ['TLS SECRET', 'kube TLS Secret'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'INGRESS CONTROLLER', rows: [['watch', 'Ingress + EndpointSlices'], ['TLS Secret', 'acme-tls loaded ✓'], ['upstream', 'direct -> 10.244.x.y']], banner: ['DIRECT POD UPSTREAM ROUTING ✓', 'green'] },
        zones: [Z(260, 38, 505, 275, 'INGRESS CONTROLLER (WATCHES API)', '#E07B24')],
        nodes: [
          N('api', 140, 175, 'hex', 'sky', 'API Server', 'Ingress + Slices', null, 'Stores Ingress rules & Pod EndpointSlices.'),
          N('ic', 415, 175, 'router', 'peach', 'NGINX Ctrl', 'nginx.conf reload', ['✓ direct', 'green'], 'Builds upstream list straight from Pod IPs.'),
          N('p1', 665, 110, 'pod', 'mint', 'Pod 10.244.1.4', 'sticky OK', null, 'Receives L7 HTTP directly from Ingress Pod.'),
          N('p2', 665, 245, 'pod', 'mint', 'Pod 10.244.2.9', 'sticky OK', null, 'Zero extra kube-proxy hop.')
        ],
        edges: [E('api', 'ic', 'watch'), E('ic', 'p1', 'ok'), E('ic', 'p2', 'ok')]
      },
      {
        short: 'Classes & Paths', cat: 'NETWORKING',
        title: 'Multi-Controller IngressClass & Exact vs Prefix Matching',
        body: ['Clusters often run two Ingress Controllers—one public (<code>nginx-public</code>) and one internal VPN-only (<code>nginx-internal</code>)—selected via <code>ingressClassName</code>.', 'Use <code>pathType: Exact</code> for single endpoints (<code>/healthz</code>) and <code>Prefix</code> for route trees (<code>/api</code> matches <code>/api/v1</code>).'],
        tip: 'Always mark one default class via annotation `ingressclass.kubernetes.io/is-default-class: "true"` if teams omit `ingressClassName`.',
        metrics: [['PUBLIC', 'nginx-public'], ['INTERNAL', 'nginx-internal'], ['PATH TYPES', 'Exact / Prefix'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'DUAL INGRESS', rows: [['public class', 'Internet -> web-app'], ['internal class', 'VPN -> admin-ui ✓'], ['Exact /health', 'strict path match']], banner: ['PUBLIC & PRIVATE INGRESS ISOLATED ✓', 'green'] },
        zones: [Z(65, 42, 325, 265, 'PUBLIC EDGE', '#E07B24'), Z(425, 42, 330, 265, 'INTERNAL CORP VPN', '#6E47B8')],
        nodes: [
          N('pub', 228, 175, 'router', 'peach', 'nginx-public', 'Internet NLB', ['public', 'warn'], 'Serves public customer traffic.'),
          N('prv', 590, 175, 'router', 'lavender', 'nginx-internal', 'Private NLB', ['🔒 VPN only', 'green'], 'Exposes internal Grafana & ArgoCD safely.')
        ],
        edges: []
      }
    ]
  },

  'service-mesh-istio': {
    id: 'service-mesh-istio', moduleId: 'm5', certs: ['CKS', 'CNPE'],
    title: 'Service Mesh (Istio Sidecar & Ambient)',
    subtitle: 'Transparent zero-trust mTLS with SPIFFE identities, L7 retries/circuit breakers, and sidecarless Istio Ambient Mesh (ztunnel + Waypoint).',
    duration: '11 min', difficulty: 'Advanced',
    checklist: [
      'Enforce automatic Pod-to-Pod mTLS via SPIFFE IDs',
      'Apply L7 retries, timeouts & circuit breakers without code changes',
      'Compare Sidecar Envoy vs Sidecarless Ambient Mesh (ztunnel + Waypoint)'
    ],
    steps: [
      {
        short: 'mTLS & SPIFFE', cat: 'NETWORKING',
        title: 'Automatic Zero-Trust mTLS & SPIFFE Workload Identities',
        body: ['A <strong>Service Mesh</strong> (Istio / Linkerd) intercepts Pod traffic transparently, upgrading plain HTTP to <strong>strict mTLS</strong> automatically.', 'Every Pod receives a cryptographic <strong>SPIFFE ID</strong> (<code>spiffe://cluster.local/ns/prod/sa/checkout</code>) rotated automatically every 24h by <code>istiod</code>!'],
        yamlTitle: 'YAML · Enforce Strict Cluster-Wide mTLS',
        yaml: `apiVersion: security.istio.io/v1\nkind: PeerAuthentication\nmetadata: { name: default, namespace: istio-system }\nspec:\n  mtls: { mode: STRICT }`,
        tip: 'CKS / CNPE Tip: NetworkPolicies enforce L3/L4 (IPs & ports), while Service Mesh `AuthorizationPolicy` enforces L7 (HTTP method, path, JWT claims + SPIFFE identity)!',
        metrics: [['ENCRYPTION', 'Strict mTLS ✓', 'green'], ['IDENTITY', 'SPIFFE X.509'], ['APP CODE', '0 Changes ✓', 'green'], ['EXAM TRACK', 'CKS · CNPE', 'purple']],
        trace: { title: 'MESH MTLS TUNNEL', rows: [['src SPIFFE', 'ns/prod/sa/frontend'], ['dst SPIFFE', 'ns/prod/sa/orders'], ['PeerAuth', 'STRICT mTLS PASS ✓']], banner: ['CRYPTOGRAPHIC L7 MTLS ACTIVE ✓', 'green'] },
        zones: [Z(65, 38, 690, 275, 'ISTIO CONTROL & DATA PLANE (MTLS)', '#6E47B8')],
        nodes: [
          N('ist', 410, 82, 'hex', 'lavender', 'istiod CA', 'issues SPIFFE', ['✓ 24h certs', 'green'], 'Mesh control plane pushing xDS config & mTLS certs.'),
          N('fe', 190, 232, 'pod', 'sky', 'Frontend + Proxy', 'sa/frontend', null, 'Encrypts outbound HTTP into mTLS.'),
          N('or', 630, 232, 'pod', 'mint', 'Orders + Proxy', 'STRICT mTLS', ['🔒 verified', 'green'], 'Validates SPIFFE identity and L7 AuthorizationPolicy.')
        ],
        edges: [E('ist', 'fe', 'watch'), E('ist', 'or', 'watch'), E('fe', 'or', 'ok', { count: 3 })]
      },
      {
        short: 'Ambient Mesh', cat: 'NETWORKING',
        title: 'Istio Ambient Mode: Sidecarless L4 ztunnel + L7 Waypoint',
        body: ['Traditional meshes inject an Envoy sidecar into every Pod—burning GBs of RAM and breaking Jobs. <strong>Istio Ambient Mesh</strong> splits the dataplane cleanly: a lightweight Rust DaemonSet (<strong>ztunnel</strong>) handles L4 mTLS on each node, while optional shared <strong>Waypoint Envoy Pods</strong> handle L7 retries, canary, and JWT auth!'],
        tip: 'Ambient Mesh gives you full zero-trust mTLS with ~75% less memory overhead and zero application Pod restarts to enroll!',
        metrics: [['L4 LAYER', 'ztunnel (Rust DS)', 'green'], ['L7 LAYER', 'Waypoint Proxy'], ['RAM SAVINGS', '-75% vs Sidecar ✓', 'green'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'AMBIENT ARCHITECTURE', rows: [['Pod -> ztunnel', 'node-local L4 mTLS ✓'], ['Waypoint', 'L7 retries + canary'], ['Sidecars', '0 injected ✓']], banner: ['SIDECARLESS AMBIENT MESH ✓', 'green'] },
        zones: [Z(65, 38, 690, 275, 'ISTIO AMBIENT SIDECARLESS MESH', '#1E7E45')],
        nodes: [
          N('src', 155, 175, 'pod', 'sky', 'App Pod', '0 sidecars', null, 'Enrolled simply by labeling its Namespace.'),
          N('zt', 375, 175, 'router', 'mint', 'ztunnel (DS)', 'L4 mTLS HBONE', ['✓ Rust L4', 'green'], 'Shared per-node mTLS tunnel daemon.'),
          N('wp', 555, 108, 'cube', 'lavender', 'Waypoint', 'L7 Retry/Auth', null, 'Shared Envoy deployed only where L7 policy is needed.'),
          N('dst', 680, 235, 'pod', 'mint', 'Orders Pod', 'mTLS verified', ['✓ protected', 'green'], 'Zero sidecar memory tax.')
        ],
        edges: [E('src', 'zt', 'req'), E('zt', 'wp', 'watch'), E('wp', 'dst', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 06 ADDITIONS ---------------- */
  'policies-opa-kyverno-cel': {
    id: 'policies-opa-kyverno-cel', moduleId: 'm6', certs: ['CKS', 'CNPE'],
    title: 'Policies: OPA Gatekeeper, Kyverno & Native CEL',
    subtitle: 'Policy-as-Code at scale: comparing Rego (OPA Gatekeeper), YAML-native Kyverno (validate + mutate + generate), and built-in CEL.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Compare OPA Gatekeeper (Rego) vs Kyverno (YAML) vs CEL',
      'Auto-generate default NetworkPolicies/Secrets with Kyverno',
      'Audit existing cluster drift safely before enforcing Deny'
    ],
    steps: [
      {
        short: 'OPA vs Kyverno', cat: 'SECURITY',
        title: 'Choosing Your Policy Engine: CEL vs Kyverno vs OPA',
        body: ['<strong>Native CEL (ValidatingAdmissionPolicy)</strong> runs inside kube-apiserver with zero pods and sub-ms speed for simple validation. <strong>Kyverno</strong> writes policies in pure Kubernetes YAML and can also <em>Mutate</em> and <em>Generate</em> resources (e.g. auto-create NetworkPolicy in every new Namespace!). <strong>OPA Gatekeeper</strong> powers cross-platform Rego policies.'],
        yamlTitle: 'YAML · Kyverno Policy Requiring Owner Labels',
        yaml: `apiVersion: kyverno.io/v1\nkind: ClusterPolicy\nmetadata: { name: require-team-label }\nspec:\n  validationFailureAction: Enforce\n  rules:\n  - name: check-team\n    match: { any: [{ resources: { kinds: [Pod, Deployment] } }] }\n    validate: { message: "team label required", pattern: { metadata: { labels: { team: "?*" } } } }`,
        tip: 'Always start new policies in `Audit` mode (`validationFailureAction: Audit`) for a week to inspect PolicyReports before flipping to `Enforce`!',
        metrics: [['NATIVE CEL', 'Fastest Validate', 'green'], ['KYVERNO', 'YAML + Generate', 'purple'], ['OPA REGOS', 'Cross-Platform'], ['EXAM TRACK', 'CKS · CNPE', 'red']],
        trace: { title: 'POLICY ENGINES', rows: [['CEL', '0.3ms in-apiserver ✓'], ['Kyverno', 'auto-gen NetPol on NS'], ['Audit Mode', 'PolicyReport CRD ✓']], banner: ['GUARDRAILS ENFORCED AS CODE ✓', 'green'] },
        zones: [Z(265, 36, 500, 278, 'POLICY-AS-CODE ENFORCEMENT', '#6E47B8')],
        nodes: [
          N('ns', 140, 175, 'cube', 'sky', 'CREATE NS / Pod', 'team: payments', null, 'Incoming resource creation request.'),
          N('cel', 425, 102, 'shield', 'mint', 'Native CEL', 'in-process', ['0.3ms', 'green'], 'Instant validation with zero external hops.'),
          N('kyv', 425, 248, 'shield', 'lavender', 'Kyverno / OPA', 'gen + validate', ['+ NetPol', 'purple'], 'Generates default NetworkPolicy & ResourceQuota per new NS.'),
          N('ok', 670, 175, 'cluster', 'mint', 'Compliant NS', 'policy-verified', ['✓ safe', 'green'], 'Every tenant namespace starts secure by default.')
        ],
        edges: [E('ns', 'cel', 'ok'), E('ns', 'kyv', 'watch'), E('cel', 'ok', 'ok'), E('kyv', 'ok', 'ok')]
      }
    ]
  },

  'ebpf-cilium-calico-falco': {
    id: 'ebpf-cilium-calico-falco', moduleId: 'm6', certs: ['CKS', 'CNPE', 'CKA'],
    title: 'eBPF, CNI (Cilium & Calico) & Falco',
    subtitle: 'How CNI plugins wire Pod networking (BGP, VXLAN, WireGuard), why eBPF accelerates Cilium + Hubble, and Falco kernel syscall rules.',
    duration: '11 min', difficulty: 'Advanced',
    checklist: [
      'Compare Calico BGP/VXLAN/WireGuard vs Cilium eBPF datapaths',
      'Inspect L3/L4/L7 Pod flows with Cilium Hubble',
      'Write Falco eBPF rules to catch container breakouts in real time'
    ],
    steps: [
      {
        short: 'Calico vs Cilium', cat: 'NETWORKING',
        title: 'CNI Datapaths: Calico (BGP/eBPF) & Cilium (Pure eBPF)',
        body: ['Every Pod needs a <strong>CNI</strong> for IPAM and cross-node routing. <strong>Calico</strong> supports native non-overlay <strong>BGP</strong> routing, VXLAN overlays, WireGuard encryption, and an eBPF mode. <strong>Cilium</strong> runs natively in Linux <strong>eBPF</strong>, replacing iptables and adding L7 HTTP/gRPC-aware NetworkPolicies plus <strong>Hubble</strong> observability!'],
        yamlTitle: 'CLI · Cilium + Hubble Live Flow Check',
        yaml: `cilium status\nhubble observe --namespace prod --verdict DROPPED`,
        tip: 'CNPE / CKS Tip: Use `WireGuard` transparent encryption in Cilium or Calico to encrypt all Pod-to-Pod node traffic with zero app changes!',
        metrics: [['CALICO', 'BGP / VXLAN / eBPF'], ['CILIUM', 'Pure eBPF + Hubble', 'green'], ['ENCRYPTION', 'WireGuard ✓', 'green'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'EBPF KERNEL DATAPATH', rows: [['Pod -> veth', 'eBPF tc/XDP hook'], ['WireGuard', 'node-to-node encrypted ✓'], ['Hubble', 'HTTP GET /pay 200 OK']], banner: ['EBPF NETWORK + OBSERVABILITY ✓', 'green'] },
        zones: [Z(65, 38, 325, 275, 'NODE 1 (EBPF + WIREGUARD)', '#1E7E45'), Z(430, 38, 330, 275, 'NODE 2 (EBPF + HUBBLE)', '#6E47B8')],
        nodes: [
          N('p1', 165, 115, 'pod', 'sky', 'Pod A', '10.244.1.8', null, 'Sends HTTP request.'),
          N('eb1', 265, 240, 'router', 'mint', 'Cilium eBPF', 'XDP + WG', ['🔒 encrypted', 'green'], 'Encrypts & routes directly in kernel.'),
          N('eb2', 525, 240, 'router', 'lavender', 'Hubble + eBPF', 'L7 inspect', ['✓ observed', 'purple'], 'Exports L3/L4/L7 flow telemetry.'),
          N('p2', 645, 115, 'pod', 'mint', 'Pod B', '10.244.2.12', null, 'Receives authenticated flow.')
        ],
        edges: [E('p1', 'eb1', 'req'), E('eb1', 'eb2', 'watch', { count: 3 }), E('eb2', 'p2', 'ok')]
      },
      {
        short: 'Falco Rules', cat: 'SECURITY',
        title: 'Falco eBPF Runtime Rules: Catching Shells & Secret Reads',
        body: ['While CNI NetworkPolicies guard packets, <strong>Falco</strong> attaches an eBPF probe to Linux syscalls (<code>execve</code>, <code>openat</code>) via a DaemonSet—firing instant alerts when a container spawns an interactive shell, reads <code>/etc/shadow</code>, or writes under <code>/usr/bin</code>!'],
        yamlTitle: 'YAML · Custom Falco Runtime Rule',
        yaml: `- rule: Terminal shell in container\n  condition: spawned_process and container and proc.name in (bash, sh)\n  output: "Shell spawned in pod=%k8s.pod.name ns=%k8s.ns.name cmd=%proc.cmdline"\n  priority: WARNING`,
        tip: 'CKS Exam Classic: Know how to inspect `/etc/falco/falco_rules.local.yaml`, tune the `condition:`/`output:` fields, and inspect `journalctl -u falco`!',
        metrics: [['SENSOR', 'eBPF DaemonSet'], ['SYSCALLS', 'execve / openat'], ['DETECTION', '< 5 ms ✓', 'red'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'FALCO KERNEL ALERT', rows: [['syscall', 'execve(/bin/sh)'], ['pod', 'prod/web-7f9b'], ['priority', 'WARNING -> Slack/SIEM']], banner: ['RUNTIME SHELL DETECTED BY FALCO!', 'red'] },
        zones: [Z(75, 42, 675, 265, 'FALCO EBPF KERNEL TELEMETRY', '#C93632')],
        nodes: [
          N('sh', 180, 175, 'pod', 'coral', 'Pod Shell', 'execve("/bin/sh")', ['⚠ alert', 'red'], 'Suspicious interactive shell inside prod container.'),
          N('fl', 415, 175, 'shield', 'yellow', 'Falco eBPF', 'rule matched', ['⚡ WARNING', 'warn'], 'Kernel ring buffer evaluates Falco rules in user space.'),
          N('si', 645, 175, 'cube', 'lavender', 'Falcosidekick', 'SIEM / Kill', ['✓ logged', 'green'], 'Forwards alert to PagerDuty, Slack, or auto-quarantine.')
        ],
        edges: [E('sh', 'fl', 'err', { count: 3 }), E('fl', 'si', 'req')]
      }
    ]
  }
});

// Upgrade existing ingress-gateway & stateful-daemon-jobs with advanced steps
LESSONS['ingress-gateway'].steps.push({
  short: 'Mirror & gRPC', cat: 'NETWORKING',
  title: 'Advanced Gateway API: Traffic Mirroring & GRPCRoute',
  body: ['Need to stress-test <code>v2</code> with real production traffic without risking user responses? Add a <code>RequestMirror</code> filter on <strong>HTTPRoute</strong> to shadow a live async copy to <code>v2</code> while users still get <code>v1</code>!', 'Gateway API also includes first-class <strong>GRPCRoute</strong> (match by protobuf service/method), <strong>TLSRoute</strong> (SNI passthrough), and <strong>TCPRoute</strong>.'],
  yamlTitle: 'YAML · Shadow Traffic Mirroring',
  yaml: `filters:\n- type: RequestMirror\n  requestMirror: { backendRef: { name: svc-v2-shadow, port: 80 } }`,
  tip: 'Mirrored responses from the shadow backend are discarded silently—making RequestMirror 100% zero-risk for load and regression testing!',
  metrics: [['LIVE PROD', 'svc-v1 (100%)', 'green'], ['SHADOW', 'RequestMirror', 'purple'], ['EXTRA CRDS', 'GRPC / TLS / TCP'], ['EXAM TRACK', 'CNPE', 'purple']],
  trace: { title: 'GATEWAY MIRRORING', rows: [['user response', 'svc-v1 (200 OK)'], ['async shadow', 'svc-v2 (fire & forget)'], ['user impact', '0 ms added ✓']], banner: ['ZERO-RISK SHADOW MIRRORING ✓', 'green'] },
  zones: [Z(265, 36, 495, 278, 'ADVANCED GATEWAY API FILTERS', '#6E47B8')],
  nodes: [
    N('gw', 140, 175, 'router', 'peach', 'Gateway', 'L7 / gRPC', null, 'Supports HTTP, gRPC, TLS SNI, and TCP.'),
    N('hr', 385, 175, 'cube', 'lavender', 'HTTPRoute', 'RequestMirror', ['⇄ shadow', 'purple'], 'Duplicates live requests asynchronously.'),
    N('v1', 655, 108, 'cluster', 'mint', 'svc-v1 (Prod)', '100% responses', ['✓ live', 'green'], 'Returns real response to user.'),
    N('v2', 655, 245, 'pod', 'sky', 'svc-v2 (Shadow)', 'async copy', ['test load', 'warn'], 'Tested under real prod traffic silently.')
  ],
  edges: [E('gw', 'hr', 'req'), E('hr', 'v1', 'ok', { count: 3 }), E('hr', 'v2', 'watch', { count: 2 })]
});

LESSONS['stateful-daemon-jobs'].steps.push({
  short: 'Partition Canary', cat: 'WORKLOAD',
  title: 'Advanced StatefulSet: Safe Partition Canary Updates',
  body: ['Upgrading a 5-node StatefulSet database all at once is risky. Set <code>updateStrategy.rollingUpdate.partition: 3</code> so Kubernetes ONLY updates ordinals <code>>= 3</code> (<code>db-4, db-3</code>), holding <code>db-0..2</code> on the old version until you verify health and lower <code>partition: 0</code>!'],
  yamlTitle: 'YAML · StatefulSet Partition Canary',
  yaml: `updateStrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    partition: 3   # Only updates Pods >= ordinal 3`,
  tip: 'Setting `partition` equal to `replicas` pauses all StatefulSet image rollouts safely.',
  metrics: [['PARTITION', 'ordinal >= 3', 'purple'], ['DB-0..2', 'v1 Held Safe', 'green'], ['DB-3..4', 'v2 Canary', 'warn'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
  trace: { title: 'STATEFUL CANARY', rows: [['partition: 3', 'db-3, db-4 -> v2 ✓'], ['db-0, 1, 2', 'kept on stable v1'], ['promote', 'set partition: 0']], banner: ['CONTROLLED STATEFUL ROLLOUT ✓', 'green'] },
  zones: [Z(85, 42, 650, 265, 'STATEFULSET PARTITIONED ROLLOUT', '#6E47B8')],
  nodes: [
    N('d0', 195, 175, 'cluster', 'mint', 'db-0..2 (v1)', 'held safe', ['v1 stable', 'green'], 'Protected from update while partition=3.'),
    N('st', 415, 175, 'cube', 'lavender', 'Partition: 3', 'rollout gate', ['>= 3 only', 'purple'], 'Controls exactly which ordinals upgrade.'),
    N('d3', 635, 175, 'pod', 'peach', 'db-3 & 4 (v2)', 'canary test', ['v2 canary', 'warn'], 'Upgraded first in reverse order (4 -> 3).')
  ],
  edges: [E('st', 'd0', 'watch'), E('st', 'd3', 'req')]
});
