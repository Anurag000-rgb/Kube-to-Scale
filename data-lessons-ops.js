/* =========================================================================
   ADDITIONAL LESSONS PART 2:
   Helm Charts, Kustomize Overlays & Transformers, Advanced GitOps,
   Cluster Maintenance, All Failure Modes, Managed vs Self-Managed,
   Single/Multi-Master/Multi-Cluster, Demos (kubeadm/EKS, Upgrade, Add User)
   ========================================================================= */

Object.assign(LESSONS, {
  /* ---------------- MODULE 07: HELM, KUSTOMIZE & GITOPS ---------------- */
  'helm-charts-advanced': {
    id: 'helm-charts-advanced', moduleId: 'm7', certs: ['CKAD', 'CNPE'],
    title: 'Exploring Helm: Charts, Hooks & Rollbacks',
    subtitle: 'Go templates + values.yaml layering, OCI registries, Helm lifecycle hooks (pre-upgrade/test), and atomic releases.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Render Chart templates cleanly with layered values.yaml',
      'Run DB migrations via Helm pre-upgrade hooks',
      'Upgrade & roll back safely with --atomic & helm history'
    ],
    steps: [
      {
        short: 'Charts & Values', cat: 'PLATFORM',
        title: 'Helm Charts: Templates + Layered values.yaml + Release State',
        body: ['<strong>Helm</strong> packages multi-resource Kubernetes apps into reusable <strong>Charts</strong> (<code>templates/</code> + <code>_helpers.tpl</code>) parameterized by <code>values.yaml</code>.', 'When you install/upgrade, Helm stores compressed release revisions in cluster Secrets—enabling instant <code>helm rollback</code>!'],
        yamlTitle: 'CLI · Preview, Install & Atomic Upgrade',
        yaml: `helm template my-api oci://ghcr.io/org/charts/api -f prod-values.yaml\nhelm upgrade --install my-api ./chart -n prod -f prod-values.yaml --atomic --timeout 3m`,
        tip: 'CKAD Tip: Always run `helm template` or `helm upgrade --dry-run` before deploying, and use `--atomic` in CI so failed upgrades auto-rollback!',
        metrics: [['PACKAGING', 'OCI Helm Chart'], ['SECRETS', 'sh.helm.release.v1'], ['SAFE FLAG', '--atomic ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'HELM RELEASE ENGINE', rows: [['values.yaml', '+ prod-values.yaml'], ['rendered', 'Deploy + Svc + HPA'], ['revision 4', 'deployed (--atomic) ✓']], banner: ['PARAMETERIZED CHART DEPLOYED ✓', 'green'] },
        zones: [Z(275, 38, 490, 275, 'HELM RENDER & RELEASE PIPELINE', '#6E47B8')],
        nodes: [
          N('val', 145, 110, 'cube', 'yellow', 'values-prod.yaml', 'overrides', null, 'Environment-specific replicas, image tag, and ingress host.'),
          N('tpl', 145, 245, 'cube', 'sky', 'Chart Templates', '_helpers.tpl', null, 'Go template YAML blueprints.'),
          N('hlm', 425, 175, 'hex', 'lavender', 'Helm Engine', 'render + diff', ['✓ rev 4', 'green'], 'Compares manifest diff and tracks release Secret.'),
          N('k8s', 665, 175, 'cluster', 'mint', 'K8s Resources', 'Deploy+Svc+Ing', ['✓ atomic', 'green'], 'Auto-rolls back if Pods fail readiness within timeout.')
        ],
        edges: [E('val', 'hlm', 'req'), E('tpl', 'hlm', 'watch'), E('hlm', 'k8s', 'ok')]
      },
      {
        short: 'Hooks & Tests', cat: 'PLATFORM',
        title: 'Helm Lifecycle Hooks: pre-upgrade Jobs & helm test',
        body: ['Annotate a Job with <code>"helm.sh/hook": pre-upgrade</code> and <code>hook-delete-policy: before-hook-creation</code> to run database schema migrations automatically <em>before</em> new Deployment Pods start!', 'Add <code>"helm.sh/hook": test</code> Pods to run smoke tests via <code>helm test my-api</code>.'],
        tip: 'Helm `pre-install`/`pre-upgrade` hooks block the rest of the chart upgrade until the hook Job exits 0.',
        metrics: [['PRE-UPGRADE', 'DB Migrate Job', 'warn'], ['WEIGHT ORDER', 'hook-weight: "-5"'], ['SMOKE TEST', 'helm test ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'HELM HOOK ORDER', rows: [['1. pre-upgrade', 'schema-mig Job -> exit 0'], ['2. rollout', 'Deployment v2 Ready ✓'], ['3. helm test', 'smoke check PASS ✓']], banner: ['HOOKED RELEASE VERIFIED ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'HELM UPGRADE HOOK TIMELINE', '#1E7E45')],
        nodes: [
          N('pre', 180, 175, 'cube', 'peach', 'pre-upgrade Job', 'DB migrate', ['1. exit 0', 'green'], 'Runs schema migration before app rolls out.'),
          N('rel', 415, 175, 'cluster', 'mint', 'App Release', 'v2 Ready', ['2. Ready', 'green'], 'Applied only after pre-upgrade hook succeeds.'),
          N('tst', 645, 175, 'shield', 'sky', 'helm test Pod', 'curl /healthz', ['3. PASS', 'green'], 'Verifies end-to-end health post-upgrade.')
        ],
        edges: [E('pre', 'rel', 'ok'), E('rel', 'tst', 'ok')]
      }
    ]
  },

  'kustomize-overlays-transformers': {
    id: 'kustomize-overlays-transformers', moduleId: 'm7', certs: ['CKAD', 'CNPE'],
    title: 'Kustomize: Overlays, Patches & Transformers',
    subtitle: 'Template-free Kubernetes customization with base/overlays, StrategicMerge vs JSON6902 patches, Transformers, and ConfigMap hash Generators.',
    duration: '11 min', difficulty: 'Intermediate',
    checklist: [
      'Layer base + dev/prod overlays without duplicating YAML',
      'Write StrategicMergePatches & JSON 6902 array patches',
      'Apply images, namePrefix, commonLabels & configMapGenerator'
    ],
    steps: [
      {
        short: 'Base & Overlays', cat: 'PLATFORM',
        title: 'Template-Free Base + Environment Overlays (kubectl -k)',
        body: ['Unlike Helm, <strong>Kustomize</strong> uses zero templating syntax (<code>{{ }}</code>) and is built straight into <code>kubectl apply -k</code>! You keep clean valid YAML in <code>base/</code> and apply environment-specific tweaks in <code>overlays/dev</code> and <code>overlays/prod</code>.'],
        yamlTitle: 'YAML · overlays/prod/kustomization.yaml',
        yaml: `resources:\n- ../../base\nnamePrefix: prod-\nnamespace: prod\ncommonLabels: { env: production }\nimages:\n- name: ghcr.io/org/api\n  newTag: v2.4.1`,
        tip: 'Kustomize built-in Transformers (`namePrefix`, `namespace`, `commonLabels`, `images`) automatically update references across Services, Deployments, and RBAC!',
        metrics: [['BUILT INTO', 'kubectl apply -k', 'green'], ['TEMPLATES', 'Zero (Pure YAML)', 'green'], ['TRANSFORMERS', 'images / labels'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'KUSTOMIZE OVERLAY', rows: [['base/', 'Deployment + Service'], ['+ prod overlay', 'ns:prod, prefix:prod-'], ['kubectl -k', 'pure YAML output ✓']], banner: ['TEMPLATE-FREE OVERLAYS BUILT ✓', 'green'] },
        zones: [Z(265, 36, 500, 278, 'KUSTOMIZE BUILD PIPELINE', '#1E7E45')],
        nodes: [
          N('bas', 140, 175, 'cube', 'sky', 'base/', 'valid K8s YAML', null, 'Shared baseline Deployment & Service manifests.'),
          N('ovd', 415, 105, 'cube', 'yellow', 'overlays/dev', 'replicas: 1', null, 'Lightweight dev override.'),
          N('ovp', 415, 245, 'cube', 'mint', 'overlays/prod', 'replicas: 5 + TLS', ['★ prod', 'green'], 'Applies prod prefix, tags, and HPA patches.'),
          N('out', 665, 245, 'cluster', 'lavender', 'Rendered YAML', 'kubectl apply -k', ['✓ pure', 'green'], 'Clean deterministic manifests ready for ArgoCD/Flux.')
        ],
        edges: [E('bas', 'ovd', 'watch'), E('bas', 'ovp', 'req'), E('ovp', 'out', 'ok')]
      },
      {
        short: 'Patches & Generators', cat: 'PLATFORM',
        title: 'StrategicMerge vs JSON6902 Patches & Hash Generators',
        body: ['Use <strong>StrategicMergePatch</strong> for partial YAML overlays (bumping replicas/CPU) and <strong>JSON 6902 patches</strong> (<code>op: replace/add/remove, path: /spec/rules/0/...</code>) to surgically edit specific array indices.', '<code>configMapGenerator</code> appends a content hash suffix (<code>app-cfg-8b7d9k</code>) so changing config automatically triggers a zero-downtime Deployment rollout!'],
        yamlTitle: 'YAML · JSON6902 Patch + configMapGenerator',
        yaml: `patches:\n- target: { kind: Deployment, name: api }\n  patch: |-\n    - op: replace\n      path: /spec/replicas\n      value: 6\nconfigMapGenerator:\n- name: app-cfg\n  literals: ["LOG_LEVEL=warn"]`,
        tip: 'ConfigMapGenerator’s content hash suffix solves Kubernetes’ classic problem where editing a ConfigMap didn’t restart env-var Pods!',
        metrics: [['STRATEGIC', 'YAML Partial Merge'], ['JSON 6902', 'Exact Array Index', 'purple'], ['GENERATOR', 'Auto Content Hash ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'green']],
        trace: { title: 'PATCH & HASH GEN', rows: [['JSON6902', 'replace /spec/replicas->6'], ['configMapGen', 'app-cfg-9f4c2a ✓'], ['Deployment', 'auto-rolls on cfg edit ✓']], banner: ['IMMUTABLE HASH ROLLOUT TRIGGERED ✓', 'green'] },
        zones: [Z(85, 38, 650, 275, 'KUSTOMIZE PATCHES & HASH GENERATORS', '#6E47B8')],
        nodes: [
          N('pt', 195, 110, 'cube', 'peach', 'JSON6902 Patch', 'op: replace', null, 'Targets exact JSON path inside arrays.'),
          N('cg', 195, 245, 'cyl', 'lavender', 'configMapGen', 'app-cfg-9f4c2a', ['hash suffix', 'purple'], 'Generates immutable hashed ConfigMap & updates Deployment ref.'),
          N('dp', 565, 175, 'cluster', 'mint', 'Deployment', 'auto-rolls v2 ✓', ['✓ synced', 'green'], 'RollingUpdate fires automatically whenever config changes.')
        ],
        edges: [E('pt', 'dp', 'req'), E('cg', 'dp', 'ok')]
      }
    ]
  },

  'gitops-appsets-flux': {
    id: 'gitops-appsets-flux', moduleId: 'm7', certs: ['CNPE'],
    title: 'Advanced GitOps: ApplicationSets, Waves & Flux',
    subtitle: 'Scaling GitOps across 50 clusters with ArgoCD ApplicationSets, Sync Waves/Hooks, and FluxCD Kustomization + HelmRelease controllers.',
    duration: '10 min', difficulty: 'Advanced',
    checklist: [
      'Generate multi-cluster deployments via ArgoCD ApplicationSets',
      'Order migrations & smoke checks with Sync Waves & Hooks',
      'Compare ArgoCD UI-driven vs FluxCD Kubernetes-native controllers'
    ],
    steps: [
      {
        short: 'AppSets & Waves', cat: 'PLATFORM',
        title: 'ArgoCD ApplicationSets & Ordered Sync Waves',
        body: ['Managing 100 ArgoCD Applications by hand doesn’t scale. An <strong>ApplicationSet</strong> uses Generators (<code>Cluster</code>, <code>Git Directory</code>, <code>Matrix</code>) to stamp out Applications across dozens of clusters automatically!', 'Use <code>argocd.argoproj.io/sync-wave</code> annotations (<code>-1</code> CRDs -> <code>0</code> PreSync DB Migration -> <code>1</code> App -> <code>2</code> PostSync Smoke Test) to sequence complex rollouts.'],
        yamlTitle: 'YAML · ApplicationSet Cluster Generator',
        yaml: `generators:\n- clusters:\n    selector: { matchLabels: { env: prod } }\ntemplate:\n  spec:\n    source: { repoURL: https://git.acme.io/platform, path: 'apps/{{name}}' }`,
        tip: 'Sync Wave hooks (`PreSync`, `Sync`, `PostSync`, `SyncFail`) give you full CI-like orchestration declaratively inside GitOps!',
        metrics: [['APPSETS', '1 -> 50 Clusters', 'green'], ['WAVES', '-1 -> 0 -> 1 -> 2'], ['FLUX V2', 'Source+Kust+Helm'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'MULTI-CLUSTER GITOPS', rows: [['Wave -1', 'CRDs + Namespace ✓'], ['Wave 0', 'PreSync DB migrate ✓'], ['Wave 1', 'App synced -> 50 clusters']], banner: ['50-CLUSTER GITOPS ORCHESTRATED ✓', 'green'] },
        zones: [Z(265, 36, 500, 278, 'ARGOCD APPLICATIONSET + FLUX V2', '#6E47B8')],
        nodes: [
          N('as', 140, 175, 'hex', 'lavender', 'ApplicationSet', 'Matrix Generator', ['1 -> 50', 'purple'], 'Generates cluster-specific ArgoCD Apps from Git.'),
          N('w0', 415, 105, 'cube', 'peach', 'Wave -1 / 0', 'CRDs + PreSync', ['1. first', 'warn'], 'Runs migrations before app workloads sync.'),
          N('c1', 665, 105, 'cluster', 'mint', 'US-East Prod', 'Synced ✓', ['✓ wave 1', 'green'], 'Synced cleanly via pull controller.'),
          N('c2', 665, 245, 'cluster', 'mint', 'EU-West Prod', 'Synced ✓', ['✓ wave 1', 'green'], 'Identical declarative state across regions.')
        ],
        edges: [E('as', 'w0', 'req'), E('w0', 'c1', 'ok'), E('w0', 'c2', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 08: CLUSTER MAINTENANCE & FAILURE MODES ---------------- */
  'cluster-maintenance': {
    id: 'cluster-maintenance', moduleId: 'm8', certs: ['CKA', 'CNPE'],
    title: 'Cluster Maintenance: Cordon, Drain & PDBs',
    subtitle: 'Safe OS patching & node replacement: cordon vs drain, PodDisruptionBudgets (PDBs), DaemonSet handling, and uncordon.',
    duration: '8 min', difficulty: 'Core',
    checklist: [
      'Stop new scheduling with kubectl cordon',
      'Evict workloads gracefully respecting PDBs with kubectl drain',
      'Return patched nodes cleanly to service with kubectl uncordon'
    ],
    steps: [
      {
        short: 'Cordon & Drain', cat: 'ARCHITECTURE',
        title: 'Safe Node Maintenance: Cordon -> Drain (Respects PDB) -> Uncordon',
        body: ['Before rebooting a Worker Node for kernel patches: run <code>kubectl cordon worker-2</code> (marks <code>SchedulingDisabled</code>). Then run <code>kubectl drain worker-2 --ignore-daemonsets --delete-emptydir-data</code> to trigger the Eviction API—respecting <strong>PodDisruptionBudgets (PDBs)</strong> so your app never drops below <code>minAvailable</code>!'],
        yamlTitle: 'CLI · Safe Node Drain Workflow',
        yaml: `kubectl cordon worker-2\nkubectl drain worker-2 --ignore-daemonsets --delete-emptydir-data\n# Patch OS / reboot worker-2, then:\nkubectl uncordon worker-2`,
        tip: 'CKA Tip: `kubectl drain` automatically cordons the node too—and if a standalone Pod (not owned by a Deployment/RS) blocks drain, `--force` warns you before deleting it permanently!',
        metrics: [['CORDON', 'No New Pods'], ['DRAIN', 'Eviction + PDB ✓', 'green'], ['DAEMONSETS', '--ignore-daemonsets'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'NODE MAINTENANCE', rows: [['worker-2', 'SchedulingDisabled'], ['Eviction API', 'PDB minAvailable=2 OK ✓'], ['uncordon', 'Ready after reboot ✓']], banner: ['ZERO-DOWNTIME NODE PATCHING ✓', 'green'] },
        zones: [Z(65, 38, 330, 275, 'WORKER-2 (DRAINING)', '#A8640C'), Z(430, 38, 330, 275, 'WORKER-3 (ABSORBS PODS)', '#1E7E45')],
        nodes: [
          N('w2', 165, 115, 'cube', 'yellow', 'worker-2', 'SchedulingDisabled', ['cordoned', 'warn'], 'Marked unschedulable before OS patching.'),
          N('pd', 285, 240, 'shield', 'lavender', 'PDB Guard', 'minAvailable: 2', ['✓ safe', 'green'], 'Ensures healthy replicas start elsewhere before eviction.'),
          N('w3', 600, 175, 'cluster', 'mint', 'worker-3', 'Pods Migrated', ['✓ Running', 'green'], 'ReplicaSet launches replacement Pods here.')
        ],
        edges: [E('w2', 'pd', 'req'), E('pd', 'w3', 'ok', { count: 3 })]
      }
    ]
  },

  'all-failure-modes': {
    id: 'all-failure-modes', moduleId: 'm8', certs: ['CKA', 'CKAD', 'CNPE'],
    title: 'All Kubernetes Failure Modes & Triage Lab',
    subtitle: 'Master every exam & production failure state: Pending, ImagePullBackOff, CreateContainerConfigError, CrashLoopBackOff, OOMKilled (137), Evicted, NotReady, and Quorum Loss.',
    duration: '14 min', difficulty: 'Intermediate',
    checklist: [
      'Diagnose Scheduling Pending vs Runtime ImagePull/ConfigError',
      'Separate App Crash (CrashLoopBackOff) from Memory OOM (Exit 137)',
      'Triage Node Evictions (DiskPressure) & Control Plane Outages'
    ],
    steps: [
      {
        short: 'Sched & Pull Fails', cat: 'WORKLOAD',
        title: 'Pre-Start Failures: Pending, ImagePullBackOff & ConfigError',
        body: ['<strong>Pending</strong>: Scheduler couldn’t place Pod (<code>Insufficient cpu</code>, <code>untolerated taint</code>, <code>unbound PVC</code>) -> check <code>kubectl describe pod</code> Events. <strong>ImagePullBackOff</strong>: wrong tag, private registry without <code>imagePullSecret</code>, or DNS fail. <strong>CreateContainerConfigError</strong>: missing referenced ConfigMap or Secret!'],
        yamlTitle: 'CLI · Fast Pre-Start Triage',
        yaml: `kubectl describe pod <name> | tail -n 15\nkubectl get events --sort-by='.lastTimestamp'`,
        tip: 'Rule of thumb: Never check `kubectl logs` for `Pending`, `ImagePullBackOff`, or `CreateContainerConfigError`—the container hasn’t started yet! Always use `kubectl describe pod`.',
        metrics: [['PENDING', 'Scheduler Filter'], ['IMAGEPULL', 'Tag / Registry Auth'], ['CONFIG ERR', 'Missing CM / Secret'], ['EXAM TRACK', 'CKA · CKAD', 'warn']],
        trace: { title: 'PRE-START MATRIX', rows: [['Pending', 'describe pod -> CPU/Taint'], ['ImagePull', 'check tag + pullSecret'], ['ConfigErr', 'create missing Secret']], banner: ['CHECK DESCRIBE EVENTS FIRST ✓', 'warn'] },
        zones: [Z(65, 38, 690, 275, 'PRE-START FAILURE TAXONOMY', '#A8640C')],
        nodes: [
          N('pn', 175, 175, 'pod', 'yellow', 'Pending', '0/3 nodes fit', ['Scheduler', 'warn'], 'CPU/RAM exhausted, PVC unbound, or untolerated taint.'),
          N('ip', 415, 175, 'pod', 'coral', 'ImagePullBackOff', '401 / 404 image', ['CRI Pull', 'red'], 'Typo in image tag or missing imagePullSecrets.'),
          N('cc', 650, 175, 'pod', 'peach', 'ConfigError', 'missing Secret', ['kubelet', 'red'], 'Referenced ConfigMap or Secret key does not exist.')
        ],
        edges: [E('pn', 'ip', 'watch'), E('ip', 'cc', 'watch')]
      },
      {
        short: 'Crash & OOM 137', cat: 'WORKLOAD',
        title: 'Runtime Crashes: CrashLoopBackOff vs OOMKilled (Exit 137)',
        body: ['<strong>CrashLoopBackOff</strong>: container starts, exits non-zero (app panic, bad command, failing LivenessProbe), and kubelet backs off (10s -> 20s -> 40s -> 5m). Always inspect <code>kubectl logs --previous</code>! <strong>OOMKilled (Exit Code 137)</strong>: Linux kernel cgroup killed the process for exceeding <code>resources.limits.memory</code>.'],
        yamlTitle: 'CLI · Inspect Previous Crash & Exit Code',
        yaml: `kubectl logs <pod> --previous\nkubectl get pod <pod> -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'`,
        tip: 'Exit Code `137` = `128 + 9 (SIGKILL)` usually OOMKilled; `143` = `128 + 15 (SIGTERM)` graceful shutdown; `1` = application exception.',
        metrics: [['EXIT 137', 'OOMKilled (RAM)', 'red'], ['EXIT 1', 'App Crash / Bug', 'warn'], ['INSPECT', 'logs --previous'], ['EXAM TRACK', 'CKAD · CKA', 'red']],
        trace: { title: 'CRASH TRIAGE', rows: [['Exit 137', 'raise limits.memory ✓'], ['Exit 1', 'read logs --previous'], ['Liveness fail', 'increase initialDelay']], banner: ['ROOT CAUSE ISOLATED IN LOGS ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'RUNTIME TERMINATION & BACKOFF', '#C93632')],
        nodes: [
          N('cr', 190, 175, 'pod', 'coral', 'CrashLoopBackOff', 'exit 1 · 5m cap', ['logs --prev', 'red'], 'App exits on startup or fails LivenessProbe.'),
          N('oo', 425, 175, 'shield', 'coral', 'OOMKilled (137)', 'SIGKILL cgroup', ['mem > limit', 'red'], 'Exceeded container memory limit -> kernel OOM kill.'),
          N('ev', 645, 175, 'cube', 'gray', 'Pod Evicted', 'Node Disk/Mem', ['DiskPressure', 'warn'], 'Node ran out of rootfs/ephemeral storage.', true)
        ],
        edges: [E('cr', 'oo', 'err'), E('oo', 'ev', 'err')]
      },
      {
        short: 'Node & CP Fails', cat: 'ARCHITECTURE',
        title: 'Infrastructure Outages: Node NotReady & Control Plane Quorum',
        body: ['<strong>Node NotReady</strong>: kubelet daemon stopped, expired node cert, or containerd dead -> SSH in and run <code>systemctl status kubelet containerd</code> + <code>journalctl -u kubelet</code>. <strong>API Unreachable / Control Plane Outage</strong>: check static pod logs with <code>crictl ps -a</code>, verify etcd disk space (<code>NOSPACE</code> alarm) and quorum!'],
        yamlTitle: 'CLI · Infrastructure Recovery Commands',
        yaml: `ssh worker-2 "systemctl restart kubelet"\ncrictl ps -a | grep -E "etcd|apiserver"\netcdctl alarm list && etcdctl endpoint status --write-out=table`,
        tip: 'Always remember: when `kubectl` itself hangs or refuses connections, log directly onto the control plane node and use `crictl` + `journalctl`!',
        metrics: [['NOTREADY', 'Check kubelet svc'], ['API DOWN', 'Use crictl logs', 'red'], ['ETCD NOSPACE', 'compact + defrag'], ['EXAM TRACK', 'CKA', 'red']],
        trace: { title: 'INFRASTRUCTURE TRIAGE', rows: [['worker NotReady', 'systemctl start kubelet ✓'], ['apiserver dead', 'crictl logs + manifest'], ['etcd NOSPACE', 'defrag + alarm disarm']], banner: ['FULL-STACK FAILURE PLAYBOOK ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'INFRASTRUCTURE & CONTROL PLANE RECOVERY', '#6E47B8')],
        nodes: [
          N('nr', 180, 175, 'cube', 'coral', 'Node NotReady', 'kubelet dead', ['✗ 40s lease', 'red'], 'Fix systemd kubelet/containerd or node disk.'),
          N('ap', 415, 175, 'hex', 'peach', 'API Down', 'manifest typo?', ['crictl logs', 'warn'], 'Debug static Pod manifests in /etc/kubernetes/manifests.'),
          N('et', 645, 175, 'cyl', 'lavender', 'etcd Quorum/Full', 'NOSPACE alarm', ['defrag ✓', 'purple'], 'Compact, defragment, or restore snapshot.')
        ],
        edges: [E('nr', 'ap', 'watch'), E('ap', 'et', 'req')]
      }
    ]
  },

  /* ---------------- MODULE 09: TOPOLOGY & SETUP DEMOS ---------------- */
  'managed-vs-selfmanaged': {
    id: 'managed-vs-selfmanaged', moduleId: 'm9', certs: ['CKA', 'CNPE'],
    title: 'Managed K8s (EKS/AKS/GKE) vs Self-Managed (kubeadm)',
    subtitle: 'Shared Responsibility Matrix: control plane SLA, etcd ops, IAM integration, cost, and when to choose kubeadm vs Cloud Managed.',
    duration: '9 min', difficulty: 'Beginner',
    checklist: [
      'Compare Control Plane & etcd ownership (Cloud vs Self)',
      'Evaluate EKS, AKS & GKE managed features (Autopilot, IRSA)',
      'Know when kubeadm / bare-metal self-managed makes sense'
    ],
    steps: [
      {
        short: 'Responsibility Split', cat: 'ARCHITECTURE',
        title: 'Cloud Managed (EKS/AKS/GKE) vs Self-Managed (kubeadm)',
        body: ['With <strong>kubeadm</strong>, YOU manage everything: 3+ control-plane VMs, etcd backups, Raft upgrades, TLS rotation, and LB failover. With <strong>EKS / AKS / GKE</strong>, the cloud provider runs HA etcd & API Server across 3 AZs behind a managed SLA—while you focus on Worker Nodes (or serverless Fargate/Autopilot), Security, and Workloads!'],
        tip: 'Self-managed Kubernetes (kubeadm / Talos / Rancher) shines on bare-metal GPUs, air-gapped edge factories, and strict sovereign on-prem datacenters.',
        metrics: [['MANAGED CP', 'Cloud SLA (99.95%)', 'green'], ['ETCD OPS', 'Zero on EKS/GKE ✓', 'green'], ['SELF-MANAGED', 'Full Kernel/API Ctrl'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'OWNERSHIP COMPARISON', rows: [['EKS / AKS / GKE', 'Cloud owns CP + etcd ✓'], ['kubeadm', 'You own CP + etcd + PKI'], ['Shared', 'RBAC, NetPol, Upgrades']], banner: ['CHOOSE MANAGED FOR SPEED; KUBEADM FOR EDGE ✓', 'green'] },
        zones: [Z(65, 38, 325, 275, 'SELF-MANAGED (KUBEADM)', '#A8640C'), Z(425, 38, 330, 275, 'CLOUD MANAGED (EKS / AKS / GKE)', '#1E7E45')],
        nodes: [
          N('sm', 228, 175, 'cluster', 'peach', 'Full Stack Ops', 'CP + etcd + Workers', ['you manage all', 'warn'], 'Full flag control (feature-gates, custom KMS), higher ops burden.'),
          N('mg', 590, 175, 'hex', 'mint', 'Cloud CP SLA', 'Managed etcd+API', ['✓ cloud HA', 'green'], 'Cloud runs HA masters across 3 AZs + IAM OIDC federation.')
        ],
        edges: []
      }
    ]
  },

  'topology-single-ha-multicluster': {
    id: 'topology-single-ha-multicluster', moduleId: 'm9', certs: ['CKA', 'CNPE'],
    title: 'Single-Master, Multi-Master (HA) & Multi-Cluster',
    subtitle: 'Comparing Single Control Plane (SPOF), Stacked vs External etcd HA Multi-Master, and Multi-Cluster Federation / Fleet topologies.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Identify SPOF risks in Single-Master dev clusters',
      'Compare Stacked etcd vs External etcd HA Multi-Master',
      'Design Multi-Cluster fleets for blast-radius & geo-resilience'
    ],
    steps: [
      {
        short: 'Single vs HA Master', cat: 'ARCHITECTURE',
        title: 'Single Master (SPOF) vs Stacked/External Multi-Master HA',
        body: ['A <strong>Single-Master</strong> cluster dies completely if 1 VM fails (dev only). Production runs <strong>Multi-Master HA</strong> (3 Control Plane nodes behind a TCP :6443 LB): <strong>Stacked etcd</strong> co-locates etcd on the 3 masters (simpler), while <strong>External etcd</strong> isolates etcd onto 3 dedicated NVMe nodes (maximum isolation).'],
        tip: 'Remember: running 3 Control Plane nodes uses Active/Active for `kube-apiserver`, Active/Standby Leader Election for `scheduler`/`controller-manager`, and Raft Quorum for `etcd`!',
        metrics: [['SINGLE MASTER', '1 SPOF (Dev Only)', 'red'], ['STACKED HA', '3 Masters + etcd ✓', 'green'], ['EXTERNAL HA', '3 CP + 3 etcd'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'HA CONTROL PLANE', rows: [['VIP :6443 LB', '3x API (Active/Active)'], ['Controllers', '1 Leader + 2 Standby'], ['etcd Raft', '3-node quorum ✓']], banner: ['ZERO SINGLE POINT OF FAILURE ✓', 'green'] },
        zones: [Z(65, 38, 220, 275, 'SINGLE MASTER (SPOF)', '#C93632'), Z(315, 38, 450, 275, 'MULTI-MASTER HA (STACKED RAFT)', '#1E7E45')],
        nodes: [
          N('sm', 175, 175, 'hex', 'coral', '1 Master', 'SPOF risk', ['⚠ dev only', 'red'], 'Losing this node freezes scheduling and API.'),
          N('lb', 405, 175, 'router', 'sky', 'CP LoadBalancer', ':6443 VIP', null, 'Distributes kubectl/kubelet across healthy API servers.'),
          N('m1', 630, 105, 'hex', 'mint', 'CP1 + etcd1', 'Leader', ['★ HA', 'green'], 'Active/Active API + Raft member.'),
          N('m2', 630, 245, 'hex', 'mint', 'CP2 & 3 + etcd', 'Quorum 3/3', ['✓ HA', 'green'], 'Survives losing any 1 master node.')
        ],
        edges: [E('lb', 'm1', 'ok'), E('lb', 'm2', 'ok'), E('m1', 'm2', 'watch')]
      },
      {
        short: 'Multi-Cluster', cat: 'PLATFORM',
        title: 'Multi-Cluster Fleet: Blast-Radius Isolation & Global Failover',
        body: ['Even a huge 5,000-node HA cluster shares ONE control plane blast radius (bad CRD/webhook upgrade affects everyone!). Mature platforms run <strong>Multi-Cluster fleets</strong> per region/env—connected by Global DNS/Anycast, ArgoCD Hub, and Cluster API (CAPI) or Cilium ClusterMesh!'],
        tip: 'CNPE Principle: Prefer multiple medium-sized clusters over one giant mega-cluster for safer Kubernetes upgrades and strict blast-radius isolation.',
        metrics: [['BLAST RADIUS', 'Per-Region/Env ✓', 'green'], ['PROVISIONER', 'Cluster API / TF'], ['MESH / SYNC', 'ClusterMesh / Argo'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'MULTI-CLUSTER FLEET', rows: [['Global Edge', 'GeoDNS -> US / EU'], ['Mgmt Cluster', 'ArgoCD + ClusterAPI'], ['Upgrades', 'blue-green cluster ✓']], banner: ['REGIONAL BLAST-RADIUS ISOLATION ✓', 'green'] },
        zones: [Z(70, 38, 690, 275, 'MULTI-CLUSTER GLOBAL FLEET', '#6E47B8')],
        nodes: [
          N('hub', 180, 175, 'hex', 'lavender', 'Mgmt Hub', 'ArgoCD + CAPI', ['★ fleet', 'purple'], 'Provisions & reconciles regional workload clusters.'),
          N('us', 445, 108, 'cluster', 'mint', 'us-east-prod', 'v1.31 ✓', ['✓ healthy', 'green'], 'Isolated US production cluster.'),
          N('eu', 445, 245, 'cluster', 'mint', 'eu-west-prod', 'v1.31 ✓', ['✓ healthy', 'green'], 'Isolated EU GDPR production cluster.'),
          N('gl', 665, 175, 'router', 'sky', 'Global DNS', 'Geo Anycast', null, 'Routes users to nearest healthy cluster.')
        ],
        edges: [E('hub', 'us', 'watch'), E('hub', 'eu', 'watch'), E('gl', 'us', 'ok'), E('gl', 'eu', 'ok')]
      }
    ]
  },

  'demo-kubeadm-eks-install': {
    id: 'demo-kubeadm-eks-install', moduleId: 'm9', certs: ['CKA', 'CNPE'],
    title: 'Demo: Installing kubeadm vs Managed Cluster (EKS/AKS/GKE)',
    subtitle: 'Interactive hands-on walkthrough: OS prep + containerd + kubeadm init + CNI + join vs creating a managed EKS/GKE/AKS cluster.',
    duration: '12 min', difficulty: 'Core',
    checklist: [
      'Prep Linux nodes (swap off, br_netfilter, containerd systemd cgroups)',
      'Initialize Control Plane with kubeadm init, CNI & kubeadm join',
      'Provision Managed EKS / GKE / AKS via declarative CLI / IaC'
    ],
    steps: [
      {
        short: '1. OS & Runtime', cat: 'ARCHITECTURE',
        title: 'Demo Step 1: Node OS Prep, containerd & K8s Packages',
        body: ['On every Linux node before running <code>kubeadm</code>: disable swap (<code>swapoff -a</code>), load kernel modules (<code>overlay</code>, <code>br_netfilter</code>), enable IP forwarding (<code>net.ipv4.ip_forward=1</code>), configure <code>containerd</code> with <code>SystemdCgroup = true</code>, and install <code>kubelet</code>, <code>kubeadm</code>, <code>kubectl</code>.'],
        yamlTitle: 'Bash Demo · Prepare Node & containerd',
        yaml: `sudo swapoff -a\nsudo modprobe overlay br_netfilter\ncontainerd config default | sed 's/SystemdCgroup = false/SystemdCgroup = true/' | sudo tee /etc/containerd/config.toml\nsudo systemctl restart containerd kubelet`,
        tip: 'Forgetting `SystemdCgroup = true` in containerd while kubelet uses `systemd` is the #1 cause of flaky kubeadm clusters crashing under load!',
        metrics: [['SWAP', 'Disabled ✓', 'green'], ['CGROUP DRIVER', 'systemd Match ✓', 'green'], ['KERNEL', 'br_netfilter = 1'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'DEMO: NODE PREP', rows: [['swapoff', '0B swap ✓'], ['sysctl', 'ip_forward=1 ✓'], ['containerd', 'SystemdCgroup=true ✓']], banner: ['LINUX NODE READY FOR KUBEADM ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'DEMO: BARE VM -> KUBERNETES NODE PREP', '#4A7BC7')],
        nodes: [
          N('os', 195, 175, 'cube', 'yellow', 'Ubuntu / RHEL', 'swapoff + sysctl', ['1. prepped', 'green'], 'Kernel bridge & IP forwarding enabled.'),
          N('ct', 420, 175, 'cube', 'peach', 'containerd', 'SystemdCgroup', ['2. CRI OK', 'green'], 'OCI runtime configured matching kubelet cgroup driver.'),
          N('kb', 640, 175, 'cube', 'mint', 'kubeadm+kubelet', 'v1.31 installed', ['3. ready', 'green'], 'Binaries pinned with apt-mark hold.')
        ],
        edges: [E('os', 'ct', 'req'), E('ct', 'kb', 'ok')]
      },
      {
        short: '2. kubeadm init+join', cat: 'ARCHITECTURE',
        title: 'Demo Step 2: kubeadm init -> Copy kubeconfig -> CNI -> join',
        body: ['Run <code>kubeadm init --pod-network-cidr=10.244.0.0/16</code> on Control Plane 1, copy <code>/etc/kubernetes/admin.conf</code> to <code>~/.kube/config</code>, install a <strong>CNI plugin</strong> (Cilium/Calico) so Nodes transition from <code>NotReady</code> -> <code>Ready</code>, then run the printed <code>kubeadm join</code> token on Workers!'],
        yamlTitle: 'Bash Demo · Init Control Plane & Join Worker',
        yaml: `sudo kubeadm init --pod-network-cidr=10.244.0.0/16\nmkdir -p $HOME/.kube && sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config\nkubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml\n# On Worker-1:\nsudo kubeadm join 10.0.0.10:6443 --token <tok> --discovery-token-ca-cert-hash sha256:<hash>`,
        tip: 'Bootstrap tokens expire after 24 hours—generate a fresh join command anytime with `kubeadm token create --print-join-command`.',
        metrics: [['INIT CMD', 'kubeadm init'], ['POD CIDR', '10.244.0.0/16'], ['JOIN TOKEN', '24h Bootstrap'], ['EXAM TRACK', 'CKA', 'purple']],
        trace: { title: 'DEMO: CLUSTER JOINED', rows: [['cp-1', 'kubeadm init + Calico ✓'], ['worker-1', 'kubeadm join TLS ✓'], ['kubectl nodes', '2/2 Ready ✓']], banner: ['SELF-MANAGED CLUSTER ONLINE ✓', 'green'] },
        zones: [Z(65, 38, 345, 275, 'CP-1 (KUBEADM INIT)', '#6E47B8'), Z(440, 38, 320, 275, 'WORKER-1 (KUBEADM JOIN)', '#1E7E45')],
        nodes: [
          N('cp', 175, 112, 'hex', 'lavender', 'cp-1 (init)', ':6443 + etcd', ['✓ Ready', 'green'], 'Control plane initialized and CNI installed.'),
          N('cn', 295, 240, 'router', 'sky', 'Calico / Cilium', '10.244.0.0/16', null, 'Required before any node becomes Ready.'),
          N('wk', 600, 175, 'cube', 'mint', 'worker-1 (join)', 'CA hash verified', ['✓ Ready', 'green'], 'Joined securely via bootstrap token + CA hash.')
        ],
        edges: [E('cp', 'cn', 'ok'), E('wk', 'cp', 'req')]
      },
      {
        short: '3. Managed EKS/GKE', cat: 'PLATFORM',
        title: 'Demo Step 3: Creating a Managed Cluster (EKS / GKE / AKS)',
        body: ['Compare that to Cloud Managed provisioning: a single declarative command (or Terraform module) creates the VPC, multi-AZ HA Control Plane, KMS encryption, OIDC provider for IRSA, and Managed Node Groups—then <code>update-kubeconfig</code> connects your terminal in seconds!'],
        yamlTitle: 'Bash Demo · Create EKS / GKE / AKS Cluster',
        yaml: `# AWS EKS:\neksctl create cluster --name prod --region us-east-1 --nodes 3 --managed\naws eks update-kubeconfig --name prod --region us-east-1\n# GCP GKE / Azure AKS:\ngcloud container clusters create-auto prod --region us-central1\naz aks create -g rg-prod -n aks-prod --node-count 3 --enable-managed-identity`,
        tip: 'Always enable OIDC / Workload Identity when creating managed clusters so Pods obtain temporary cloud IAM creds without static keys.',
        metrics: [['EKS / GKE / AKS', '1-Cmd / Terraform', 'green'], ['HA CP + ETCD', 'Auto-Managed ✓', 'green'], ['IAM / OIDC', 'Federated ✓', 'green'], ['EXAM TRACK', 'CNPE', 'purple']],
        trace: { title: 'DEMO: MANAGED CREATE', rows: [['Cloud API', 'HA CP in 3 AZs ✓'], ['NodePool', '3x Managed Workers ✓'], ['kubeconfig', 'OIDC auth ready ✓']], banner: ['MANAGED CLOUD CLUSTER LIVE ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'MANAGED CLOUD CONTROL PLANE + NODES', '#1E7E45')],
        nodes: [
          N('iac', 145, 175, 'cube', 'sky', 'eksctl / TF', 'declarative', null, 'Provisions VPC, IAM OIDC, and cluster.'),
          N('cp', 435, 108, 'hex', 'mint', 'Managed CP', '3-AZ SLA', ['✓ auto-HA', 'green'], 'Fully managed etcd, API server, and upgrades.'),
          N('ng', 665, 240, 'cluster', 'mint', 'Managed Nodes', 'IAM + Autoscaled', ['✓ Ready', 'green'], 'Worker pool connected via cloud IAM.')
        ],
        edges: [E('iac', 'cp', 'req'), E('cp', 'ng', 'ok')]
      }
    ]
  },

  'demo-cluster-upgrade': {
    id: 'demo-cluster-upgrade', moduleId: 'm9', certs: ['CKA'],
    title: 'Demo: Upgrading a Kubernetes Cluster (Zero-Downtime)',
    subtitle: 'Version skew policy, kubeadm upgrade plan & apply on Control Plane, and rolling cordon/drain/upgrade/uncordon across Workers.',
    duration: '11 min', difficulty: 'Intermediate',
    checklist: [
      'Respect Kubernetes version skew (upgrade 1 minor version at a time)',
      'Upgrade Primary & Secondary Control Plane nodes via kubeadm',
      'Drain, upgrade kubeadm + kubelet, and uncordon each Worker'
    ],
    steps: [
      {
        short: '1. Skew & Plan', cat: 'ARCHITECTURE',
        title: 'Demo Step 1: Version Skew Policy & kubeadm upgrade plan',
        body: ['Kubernetes allows upgrading only <strong>1 minor version at a time</strong> (<code>1.30 -> 1.31</code>, never <code>1.29 -> 1.31</code>), and <code>kube-apiserver</code> must always stay >= <code>kubelet</code>/<code>scheduler</code>/<code>controller-manager</code>.', 'Always take an <strong>etcd snapshot backup</strong> first, then run <code>kubeadm upgrade plan</code>!'],
        yamlTitle: 'Bash Demo · Pre-Upgrade Backup & Plan',
        yaml: `ETCDCTL_API=3 etcdctl snapshot save /root/pre-upgrade-etcd.db ...\napt-mark unhold kubeadm && apt-get update && apt-get install -y kubeadm=1.31.2-*\nkubeadm upgrade plan`,
        tip: 'CKA Exam Guarantee: A cluster upgrade question is nearly guaranteed on the CKA! Never skip upgrading `kubeadm` first before running `kubeadm upgrade apply`.',
        metrics: [['SKEW RULE', '1 Minor Step Max'], ['FIRST STEP', 'etcd Snapshot ✓', 'green'], ['CHECK CMD', 'kubeadm upgrade plan'], ['EXAM TRACK', 'CKA', 'purple']],
        trace: { title: 'DEMO: UPGRADE PLAN', rows: [['etcd backup', 'saved safely ✓'], ['current -> target', 'v1.30.4 -> v1.31.2'], ['skew check', 'API >= kubelet OK ✓']], banner: ['UPGRADE PLAN VERIFIED SAFE ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'PRE-FLIGHT CHECKS & VERSION SKEW', '#6E47B8')],
        nodes: [
          N('bk', 180, 175, 'cyl', 'lavender', 'etcd Snapshot', 'pre-upgrade.db', ['1. backup', 'green'], 'Safety net before touching control plane.'),
          N('pl', 415, 175, 'cube', 'sky', 'kubeadm 1.31', 'upgrade plan', ['2. verified', 'green'], 'Checks API deprecations and component target versions.'),
          N('cp', 645, 175, 'hex', 'mint', 'Control Plane', 'ready to apply', null, 'Upgraded before any worker node.')
        ],
        edges: [E('bk', 'pl', 'ok'), E('pl', 'cp', 'req')]
      },
      {
        short: '2. Upgrade CP', cat: 'ARCHITECTURE',
        title: 'Demo Step 2: Upgrade Control Plane (apply -> kubelet/kubectl)',
        body: ['Drain CP-1, run <code>kubeadm upgrade apply v1.31.2</code> (upgrades static pod manifests & CoreDNS), then upgrade <code>kubelet</code> + <code>kubectl</code> packages, reload systemd, and uncordon CP-1. Secondary HA masters run <code>kubeadm upgrade node</code> instead of <code>apply</code>!'],
        yamlTitle: 'Bash Demo · Control Plane Upgrade',
        yaml: `kubectl drain cp-1 --ignore-daemonsets\nsudo kubeadm upgrade apply v1.31.2\nsudo apt-get install -y kubelet=1.31.2-* kubectl=1.31.2-*\nsudo systemctl daemon-reload && sudo systemctl restart kubelet\nkubectl uncordon cp-1`,
        tip: 'On CP-1 run `kubeadm upgrade apply v1.31.x`; on additional CP nodes and all Workers run `kubeadm upgrade node`!',
        metrics: [['CP-1 CMD', 'upgrade apply'], ['CP-2 / WK CMD', 'upgrade node'], ['STATIC PODS', 'Auto-Rolled ✓', 'green'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'DEMO: CP UPGRADED', rows: [['kube-apiserver', 'v1.30.4 -> v1.31.2 ✓'], ['kubelet (cp-1)', 'restarted -> v1.31.2 ✓'], ['cp-1 status', 'Ready (uncordoned) ✓']], banner: ['CONTROL PLANE AT V1.31.2 ✓', 'green'] },
        zones: [Z(255, 38, 505, 275, 'CP-1 UPGRADED TO V1.31.2', '#1E7E45')],
        nodes: [
          N('ap', 140, 175, 'cube', 'peach', 'kubeadm apply', 'v1.31.2', null, 'Rewrites /etc/kubernetes/manifests/*.yaml.'),
          N('cp', 425, 175, 'hex', 'mint', 'API + etcd + CoreDNS', 'v1.31.2 ✓', ['✓ upgraded', 'green'], 'Control plane running latest minor version.'),
          N('kb', 665, 175, 'cube', 'mint', 'cp-1 kubelet', 'v1.31.2 Ready', ['✓ uncordoned', 'green'], 'Node package upgraded and uncordoned.')
        ],
        edges: [E('ap', 'cp', 'ok'), E('cp', 'kb', 'ok')]
      },
      {
        short: '3. Roll Workers', cat: 'ARCHITECTURE',
        title: 'Demo Step 3: Drain -> Upgrade -> Uncordon Workers One-by-One',
        body: ['Upgrade Workers sequentially with zero app downtime: <code>kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data</code>, SSH to <code>worker-1</code>, install <code>kubeadm</code>, run <code>kubeadm upgrade node</code>, install <code>kubelet</code>, restart kubelet, and <code>kubectl uncordon worker-1</code>!'],
        yamlTitle: 'Bash Demo · Worker Node Upgrade Loop',
        yaml: `kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data\n# On worker-1:\nsudo apt-get install -y kubeadm=1.31.2-* && sudo kubeadm upgrade node\nsudo apt-get install -y kubelet=1.31.2-* && sudo systemctl restart kubelet\nkubectl uncordon worker-1`,
        tip: 'Verify all nodes report the new version cleanly with `kubectl get nodes` before moving to the next worker!',
        metrics: [['WORKERS', '1-by-1 Rolling', 'green'], ['APP DOWNTIME', '0 sec ✓', 'green'], ['FINAL CHECK', 'kubectl get nodes'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'DEMO: FLEET UPGRADED', rows: [['worker-1', 'drained -> v1.31.2 ✓'], ['worker-2', 'drained -> v1.31.2 ✓'], ['cluster', '100% v1.31.2 Ready ✓']], banner: ['ZERO-DOWNTIME UPGRADE COMPLETE ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'ROLLING WORKER UPGRADE', '#1E7E45')],
        nodes: [
          N('cp', 180, 175, 'hex', 'mint', 'CP-1', 'v1.31.2', ['✓ ready', 'green'], 'Already upgraded.'),
          N('w1', 420, 175, 'cluster', 'mint', 'worker-1', 'v1.31.2', ['✓ uncordoned', 'green'], 'Upgraded cleanly while worker-2 served traffic.'),
          N('w2', 645, 175, 'cluster', 'sky', 'worker-2', 'v1.31.2', ['✓ Ready', 'green'], 'Cluster upgrade 100% complete.')
        ],
        edges: [E('cp', 'w1', 'ok'), E('w1', 'w2', 'ok')]
      }
    ]
  },

  'demo-add-user-kubeconfig': {
    id: 'demo-add-user-kubeconfig', moduleId: 'm9', certs: ['CKA', 'CKS'],
    title: 'Demo: Adding a User (CSR) & Building kubeconfig',
    subtitle: 'Hands-on workflow: generate RSA key + CSR (CN=dev, O=eng), sign via Kubernetes CertificateSigningRequest, configure kubeconfig contexts, and bind RBAC.',
    duration: '10 min', difficulty: 'Core',
    checklist: [
      'Generate private key & CSR with CN=username and O=groups',
      'Submit & approve CertificateSigningRequest via kubectl',
      'Build a scoped kubeconfig with set-credentials & set-context'
    ],
    steps: [
      {
        short: '1. Key & CSR', cat: 'SECURITY',
        title: 'Demo Step 1: Generate Private Key + X.509 CSR & Approve in K8s',
        body: ['Kubernetes uses X.509 subject fields for AuthN: <code>/CN=jane</code> sets username <code>jane</code>, and <code>/O=devs</code> sets group <code>devs</code>. Submit the base64 CSR as a <strong>CertificateSigningRequest</strong> resource, approve it with <code>kubectl certificate approve</code>, and extract the signed cert!'],
        yamlTitle: 'Bash Demo · Create & Sign User Cert via CSR API',
        yaml: `openssl genrsa -out jane.key 2048\nopenssl req -new -key jane.key -out jane.csr -subj "/CN=jane/O=devs"\n# Submit CSR YAML with signerName: kubernetes.io/kube-apiserver-client\nkubectl certificate approve jane-csr\nkubectl get csr jane-csr -o jsonpath='{.status.certificate}' | base64 -d > jane.crt`,
        tip: 'CKA Tip: `signerName` MUST be `kubernetes.io/kube-apiserver-client` and `usages` MUST include `client auth` when creating a user CSR!',
        metrics: [['CN FIELD', 'Username (jane)'], ['O FIELD', 'Group (devs)'], ['SIGNER', 'kube-apiserver-client'], ['EXAM TRACK', 'CKA · CKS', 'red']],
        trace: { title: 'DEMO: CSR SIGNING', rows: [['openssl', 'CN=jane, O=devs'], ['CSR API', 'Approved -> Signed ✓'], ['output', 'jane.crt (client auth)']], banner: ['USER CLIENT CERT SIGNED BY CA ✓', 'green'] },
        zones: [Z(265, 38, 500, 275, 'KUBERNETES CSR SIGNING WORKFLOW', '#6E47B8')],
        nodes: [
          N('os', 140, 175, 'cube', 'yellow', 'OpenSSL', 'jane.key + .csr', null, 'Generates 2048-bit RSA key and CSR locally.'),
          N('csr', 415, 175, 'shield', 'lavender', 'CSR API', 'approve jane-csr', ['✓ Approved', 'green'], 'Control plane CA signs jane.crt.'),
          N('crt', 665, 175, 'users', 'mint', 'jane.crt', 'CN=jane, O=devs', ['✓ signed', 'green'], 'Extracted X.509 credential ready for kubeconfig.')
        ],
        edges: [E('os', 'csr', 'req'), E('csr', 'crt', 'ok')]
      },
      {
        short: '2. kubeconfig & RBAC', cat: 'SECURITY',
        title: 'Demo Step 2: Configure kubeconfig Context & Grant RBAC Role',
        body: ['A <code>kubeconfig</code> binds 3 sections: <strong>clusters</strong> (API endpoint + <code>ca.crt</code>), <strong>users</strong> (<code>jane.crt</code> + <code>jane.key</code>), and <strong>contexts</strong> (pairing cluster + user + default namespace). Finally, bind a least-privilege <code>RoleBinding</code> so Jane isn’t blocked with <code>403 Forbidden</code>!'],
        yamlTitle: 'Bash Demo · Build kubeconfig & Test Access',
        yaml: `kubectl config set-credentials jane --client-certificate=jane.crt --client-key=jane.key --embed-certs=true\nkubectl config set-context jane-prod --cluster=kubernetes --user=jane --namespace=prod\nkubectl create rolebinding jane-view --clusterrole=view --user=jane -n prod\nkubectl --context=jane-prod get pods`,
        tip: 'Always pass `--embed-certs=true` when distributing kubeconfig files so users don’t break when moving paths!',
        metrics: [['SECTIONS', 'Cluster/User/Ctx'], ['EMBED CERTS', 'true ✓', 'green'], ['AUTHZ', 'RoleBinding view ✓', 'green'], ['EXAM TRACK', 'CKA · CKS', 'green']],
        trace: { title: 'DEMO: KUBECONFIG LIVE', rows: [['context', 'jane-prod (ns: prod)'], ['RBAC', 'RoleBinding view ✓'], ['get pods', '200 OK (scoped) ✓']], banner: ['USER ONBOARDED WITH LEAST-PRIVILEGE ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'KUBECONFIG + RBAC ONBOARDING', '#1E7E45')],
        nodes: [
          N('kc', 180, 175, 'cube', 'sky', 'kubeconfig', 'jane-prod ctx', ['✓ embedded', 'green'], 'Pairs cluster CA, jane.crt, and default namespace prod.'),
          N('api', 415, 175, 'hex', 'mint', 'API Server', 'AuthN: jane', ['✓ 200 OK', 'green'], 'Verifies signature + evaluates RoleBinding.'),
          N('rb', 645, 175, 'shield', 'lavender', 'ns: prod Pods', 'view only', ['✓ scoped', 'green'], 'Jane can inspect prod pods without cluster-admin.')
        ],
        edges: [E('kc', 'api', 'req'), E('api', 'rb', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 14: TELEPRESENCE FOR KUBERNETES ---------------- */
  'telepresence-architecture-basics': {
    id: 'telepresence-architecture-basics', moduleId: 'm14', certs: ['CKAD', 'CNPE'],
    title: 'Telepresence: Why, Architecture & Connect Demo',
    subtitle: 'Eliminate slow Docker build-push-deploy loops by connecting your laptop directly to cluster Services via Traffic Manager & TUN VIF.',
    duration: '10 min', difficulty: 'Beginner',
    checklist: [
      'Contrast slow remote build-push-rollout vs Telepresence inner loop',
      'Trace Laptop Daemon (VIF) <-> Traffic Manager <-> Traffic Agent',
      'Install Traffic Manager and curl cluster Services directly via DNS'
    ],
    steps: [
      {
        short: 'Why Telepresence', cat: 'PLATFORM',
        title: 'Why Telepresence: Fixing the Slow Kubernetes Inner Dev Loop',
        body: ['Developing microservices against remote Kubernetes normally means waiting 3–5 minutes per 1-line edit: <code>code -> docker build -> push -> helm upgrade -> Pod pull</code>. Running everything on your laptop breaks when you need 20 heavy dependencies (Kafka, Postgres, Vault).', '<strong>Telepresence</strong> bridges your laptop straight into the remote cluster network so you edit and debug locally in milliseconds!'],
        tip: 'Telepresence lets your single local service talk to real remote cluster dependencies (DBs, queues, internal APIs) with zero port-forwarding spaghetti.',
        metrics: [['OLD LOOP', '3-5 min / edit', 'red'], ['TELEPRESENCE', '< 1 sec IDE ✓', 'green'], ['HEAVY DEPS', 'Stay in Cluster'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'DEV INNER LOOP', rows: [['docker build+push', 'skipped (0s) ✓'], ['IDE breakpoint', 'instant local debug'], ['remote Kafka/DB', 'reachable directly ✓']], banner: ['10X FASTER KUBERNETES DEV LOOP ✓', 'green'] },
        zones: [Z(65, 38, 325, 275, 'TRADITIONAL SLOW LOOP', '#C93632'), Z(425, 38, 330, 275, 'TELEPRESENCE FAST LOOP', '#1E7E45')],
        nodes: [
          N('old', 228, 175, 'cube', 'coral', 'Build -> Push -> Wait', '4 min / change', ['✗ slow', 'red'], 'Rebuilding & pushing images for every minor bugfix.'),
          N('tp', 590, 175, 'pod', 'mint', 'Local IDE + Remote', 'hot-reload 0.5s', ['✓ instant', 'green'], 'Local process runs directly inside cluster network.')
        ],
        edges: []
      },
      {
        short: 'Architecture', cat: 'PLATFORM',
        title: 'How Telepresence Works: Daemon VIF, Traffic Manager & Agent',
        body: ['Telepresence has 3 moving parts: (1) A local <strong>User/Root Daemon</strong> creating a virtual network interface (<code>TUN/VIF</code>) + DNS interceptor on your laptop; (2) An in-cluster <strong>Traffic Manager</strong> Pod in <code>ambassador</code> namespace; and (3) A lightweight <strong>Traffic Agent</strong> sidecar injected into intercepted Pods!'],
        tip: 'Traffic Manager automatically injects the `traffic-agent` sidecar the first time you intercept a Deployment—no manual YAML edits required.',
        metrics: [['LAPTOP', 'TUN VIF + DNS'], ['CLUSTER HUB', 'Traffic Manager'], ['POD SIDECAR', 'Traffic Agent ✓', 'green'], ['EXAM TRACK', 'CNPE · CKAD', 'purple']],
        trace: { title: 'TELEPRESENCE TUNNEL', rows: [['Laptop VIF', 'routes 10.96.0.0/12 + *.svc'], ['Traffic Manager', 'ambassador ns tunnel'], ['Traffic Agent', 'intercepts target Pod ✓']], banner: ['BIDIRECTIONAL L3/L7 TUNNEL UP ✓', 'green'] },
        zones: [Z(65, 38, 220, 275, 'DEVELOPER LAPTOP', '#4A7BC7'), Z(320, 38, 445, 275, 'REMOTE KUBERNETES CLUSTER', '#6E47B8')],
        nodes: [
          N('lap', 175, 175, 'users', 'sky', 'Laptop Daemon', 'TUN VIF + DNS', ['✓ connected', 'green'], 'Routes *.svc.cluster.local and Pod CIDRs over tunnel.'),
          N('tm', 435, 175, 'hex', 'lavender', 'Traffic Manager', 'ambassador ns', ['★ relay', 'purple'], 'Coordinates tunnels, intercepts, and agent injection.'),
          N('ta', 665, 110, 'pod', 'mint', 'Target + Agent', 'traffic-agent', null, 'Sidecar forwarding intercepted traffic back to laptop.'),
          N('db', 665, 245, 'cyl', 'peach', 'Cluster DB/Svc', 'postgres.prod', null, 'Directly reachable from laptop via DNS.')
        ],
        edges: [E('lap', 'tm', 'watch', { off: -6 }), E('tm', 'lap', 'ok', { off: 6 }), E('tm', 'ta', 'req'), E('tm', 'db', 'ok')]
      },
      {
        short: 'Demo: Connect', cat: 'PLATFORM',
        title: 'Demo: Install Traffic Manager & telepresence connect',
        body: ['Install the cluster-side Traffic Manager once via Helm (<code>telepresence helm install</code>), then run <code>telepresence connect</code> on your laptop. Instantly curl internal Kubernetes Services (<code>curl http://orders.prod.svc:8080/health</code>) straight from your terminal!'],
        yamlTitle: 'Bash Demo · Install & Connect Telepresence',
        yaml: `telepresence helm install\ntelepresence connect --namespace prod\ntelepresence status\ncurl http://orders.prod.svc.cluster.local:8080/health`,
        tip: 'Passing `--namespace prod` lets you resolve short single-word service names like `http://orders:8080` directly from your laptop!',
        metrics: [['INSTALL', 'telepresence helm'], ['CONNECT', 'telepresence connect', 'green'], ['DNS ACCESS', '*.prod.svc ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'green']],
        trace: { title: 'DEMO: CONNECT', rows: [['Traffic Mgr', 'Running in ambassador ✓'], ['Laptop DNS', 'orders.prod.svc -> 10.96.x'], ['curl test', '200 OK from laptop ✓']], banner: ['LAPTOP JOINED CLUSTER DNS & CIDR ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'CONNECTED CLUSTER NETWORK', '#1E7E45')],
        nodes: [
          N('cli', 145, 175, 'users', 'sky', 'Laptop Terminal', 'curl http://orders', ['connect ✓', 'green'], 'Resolves cluster Service names natively.'),
          N('tm', 435, 175, 'hex', 'mint', 'Traffic Manager', 'tunnels traffic', null, 'Bridges laptop requests into cluster VPC.'),
          N('svc', 665, 175, 'pod', 'mint', 'orders-svc', '200 OK', ['✓ reachable', 'green'], 'Internal ClusterIP Service answered directly.')
        ],
        edges: [E('cli', 'tm', 'req'), E('tm', 'svc', 'ok')]
      }
    ]
  },

  'telepresence-intercept-env-volumes': {
    id: 'telepresence-intercept-env-volumes', moduleId: 'm14', certs: ['CKAD', 'CNPE'],
    title: 'Telepresence: Intercepts, Env Files & Remote Volumes',
    subtitle: 'Demo: Route live cluster Service requests to your local IDE (global or header-scoped), pull ConfigMap/Secret env files, and mount remote volumes.',
    duration: '12 min', difficulty: 'Intermediate',
    checklist: [
      'Intercept Service traffic to localhost with telepresence intercept',
      'Isolate shared staging clusters using personal header intercepts',
      'Export Pod ConfigMaps/Secrets via --env-file & mount volumes locally'
    ],
    steps: [
      {
        short: 'Intercept Demo', cat: 'PLATFORM',
        title: 'Demo: Telepresence Intercept (Global & Header-Based Isolation)',
        body: ['Run <code>telepresence intercept orders --port 8080:80</code> to reroute traffic hitting the remote <code>orders</code> Service straight to your IDE debugger on <code>localhost:8080</code>!', 'On shared team clusters, add <code>--http-header=x-dev=alice</code> so ONLY your test requests route to your laptop while teammates still hit the remote Pod!'],
        yamlTitle: 'Bash Demo · Global & Personal Intercept',
        yaml: `# Global intercept (reroutes all traffic to localhost:8080):\ntelepresence intercept orders --port 8080:80\n# Personal header intercept (safe on shared dev cluster!):\ntelepresence intercept orders --port 8080:80 --http-header=x-dev=alice\ntelepresence leave orders`,
        tip: 'Always clean up with `telepresence leave <service>` (or `telepresence quit`) when finished so cluster traffic returns to normal.',
        metrics: [['INTERCEPT', 'Cluster -> Localhost'], ['LOCAL PORT', ':8080 IDE Debug', 'green'], ['TEAM SAFE', '--http-header ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'DEMO: INTERCEPT', rows: [['x-dev: alice', '-> Laptop :8080 (IDE) ✓'], ['other users', '-> Remote Pod v1 ✓'], ['breakpoint', 'hit live in VS Code!']], banner: ['LIVE CLUSTER TRAFFIC -> LOCAL IDE ✓', 'green'] },
        zones: [Z(285, 36, 480, 278, 'CLUSTER: SHARED STAGING', '#6E47B8')],
        nodes: [
          N('ing', 145, 175, 'router', 'peach', 'Ingress / Caller', 'x-dev: alice', null, 'Sends live HTTP request into cluster.'),
          N('ta', 435, 175, 'shield', 'lavender', 'Traffic Agent', 'header router', ['⚡ intercept', 'warn'], 'Routes matching header to laptop; normal traffic stays in Pod.'),
          N('rm', 665, 108, 'pod', 'sky', 'Remote Pod', 'normal users', ['✓ unaffected', 'green'], 'Teammates keep testing uninterrupted.'),
          N('ide', 665, 245, 'users', 'mint', 'Your Laptop IDE', 'localhost:8080', ['★ debugging', 'green'], 'Step-through debug live cluster requests locally.')
        ],
        edges: [E('ing', 'ta', 'req'), E('ta', 'rm', 'ok'), E('ta', 'ide', 'watch', { count: 3 })]
      },
      {
        short: 'Demo: Env File', cat: 'PLATFORM',
        title: 'Demo: Sync Pod ConfigMaps & Secrets Into Local --env-file',
        body: ['Your local app crashes if it lacks the remote Pod’s ConfigMap/Secret environment variables (<code>DB_URL</code>, <code>JWT_SECRET</code>). Passing <code>--env-file ./orders.env</code> automatically extracts every env var from the remote Pod into a local file ready for your IDE or Docker!'],
        yamlTitle: 'Bash Demo · Extract Remote Pod Env Vars',
        yaml: `telepresence intercept orders --port 8080:80 --env-file ./orders.env\nset -a && source ./orders.env && set +a\ngo run ./cmd/orders   # Now has all K8s ConfigMap + Secret env vars!`,
        tip: 'Never commit generated `.env` files to Git—they contain real Kubernetes Secret values pulled from the cluster!',
        metrics: [['FLAG', '--env-file .env'], ['SYNCS', 'ConfigMaps + Secrets', 'green'], ['APP SETUP', 'Zero Manual Copy ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'green']],
        trace: { title: 'DEMO: ENV FILE', rows: [['Pod envFrom', 'app-cfg + db-secret'], ['generated', './orders.env (18 vars)'], ['local app', 'connected to cluster DB ✓']], banner: ['CLUSTER ENV VARS EXPORTED TO .ENV ✓', 'green'] },
        zones: [Z(75, 42, 675, 265, 'REMOTE POD ENV -> LOCAL WORKSTATION', '#4A7BC7')],
        nodes: [
          N('cm', 180, 175, 'cyl', 'lavender', 'Pod Env + Sec', 'DB_URL, API_KEY', null, 'Remote ConfigMaps and Secrets attached to target Pod.'),
          N('tp', 415, 175, 'cube', 'sky', 'Traffic Agent', '--env-file', ['✎ exported', 'green'], 'Reads remote container env and writes orders.env.'),
          N('loc', 645, 175, 'users', 'mint', 'Local Process', 'source orders.env', ['✓ booted', 'green'], 'Runs locally with exact cluster configuration.')
        ],
        edges: [E('cm', 'tp', 'watch'), E('tp', 'loc', 'ok')]
      },
      {
        short: 'Demo: Volumes', cat: 'PLATFORM',
        title: 'Demo: Mount Remote Kubernetes Volumes Locally (--mount)',
        body: ['What if your app reads TLS certs or config files from <code>/etc/certs</code> or a PVC mounted inside the Pod? Pass <code>--mount=/tmp/k8s-vols</code> (or <code>--mount=true</code>) and Telepresence mounts the remote Pod’s volumes straight onto your laptop filesystem via SSHFS!'],
        yamlTitle: 'Bash Demo · Mount Remote Pod Volumes Locally',
        yaml: `telepresence intercept orders --port 8080:80 --mount=/tmp/orders-vols\nls /tmp/orders-vols/etc/certs/tls.crt\n# Remote Kubernetes Secret/ConfigMap/PVC files readable locally!`,
        tip: 'Read `TELEPRESENCE_ROOT` inside `--env-file` to see the exact local directory prefix where remote volume paths are mounted.',
        metrics: [['FLAG', '--mount=/tmp/vols'], ['TRANSPORT', 'SSHFS Tunnel', 'green'], ['MOUNTS', 'Secrets/CMs/PVCs ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'DEMO: REMOTE VOLUMES', rows: [['remote path', '/etc/certs/tls.crt'], ['local path', '/tmp/vols/etc/certs/tls.crt'], ['read test', '200 OK (SSHFS) ✓']], banner: ['REMOTE CLUSTER VOLUMES MOUNTED ✓', 'green'] },
        zones: [Z(95, 42, 630, 265, 'SSHFS REMOTE VOLUME MOUNT', '#6E47B8')],
        nodes: [
          N('pv', 195, 175, 'cyl', 'lavender', 'Cluster Vol', '/etc/certs + PVC', null, 'Mounted inside remote intercepted Pod.'),
          N('fs', 415, 175, 'router', 'peach', 'SSHFS Bridge', '--mount=/tmp/vols', ['⇄ mounted', 'green'], 'Streams file reads/writes transparently over Telepresence tunnel.'),
          N('app', 635, 175, 'users', 'mint', 'Local App', 'reads /tmp/vols', ['✓ synced', 'green'], 'Reads live cluster Secrets & config files locally.')
        ],
        edges: [E('pv', 'fs', 'watch'), E('fs', 'app', 'ok')]
      }
    ]
  },

  'telepresence-docker-workflow': {
    id: 'telepresence-docker-workflow', moduleId: 'm14', certs: ['CKAD', 'CNPE'],
    title: 'Demo: Telepresence With Docker Containers',
    subtitle: 'Run intercepted local services cleanly inside Docker containers (--docker-run) with isolated networking, auto-injected env vars, and volume mounts.',
    duration: '9 min', difficulty: 'Intermediate',
    checklist: [
      'Avoid host OS dependency conflicts with --docker-run',
      'Share cluster DNS, env vars & volumes inside a local container',
      'Run multi-service local Docker Compose flows against remote K8s'
    ],
    steps: [
      {
        short: 'Docker Mode', cat: 'PLATFORM',
        title: 'Demo: telepresence intercept --docker-run (Clean Local Sandbox)',
        body: ['Installing Node 18, Python 3.12, and Go toolchains directly on your laptop gets messy—and macOS volume paths like <code>/var/run/secrets</code> are read-only! Using <code>--docker-run</code> launches your local container connected to Telepresence’s Docker network, automatically injecting <code>--env-file</code> and mounting all remote volumes at their exact Linux container paths!'],
        yamlTitle: 'Bash Demo · Intercept Directly Into Local Docker Container',
        yaml: `telepresence connect --docker\ntelepresence intercept orders --port 8080:80 --docker-run -- \\\n  --rm -v $(pwd):/src orders-dev:local`,
        tip: 'With `--docker-run`, your local container sees `/var/run/secrets/kubernetes.io/serviceaccount` and `/etc/certs` at their EXACT production Linux paths—zero macOS path rewriting needed!',
        metrics: [['FLAG', '--docker-run ✓', 'green'], ['VOL PATHS', 'Exact Linux Paths ✓', 'green'], ['HOST POLLUTION', 'Zero ✓', 'green'], ['EXAM TRACK', 'CKAD · CNPE', 'purple']],
        trace: { title: 'DEMO: DOCKER INTERCEPT', rows: [['connect', '--docker network bridge ✓'], ['env + vols', 'auto-mounted at /etc/...'], ['container', 'live cluster traffic -> IDE']], banner: ['CONTAINERIZED LOCAL K8S DEV READY ✓', 'green'] },
        zones: [Z(65, 38, 345, 275, 'LAPTOP DOCKER ENGINE', '#4A7BC7'), Z(440, 38, 320, 275, 'REMOTE KUBERNETES', '#1E7E45')],
        nodes: [
          N('dk', 175, 112, 'pod', 'sky', 'Local Container', '--docker-run', ['✓ isolated', 'green'], 'Runs exact Linux container with hot-reloaded source bind mount.'),
          N('nt', 295, 240, 'router', 'lavender', 'tp-net Bridge', 'auto env + vols', null, 'Mounts remote volumes & cluster DNS inside container.'),
          N('cl', 600, 175, 'hex', 'mint', 'Cluster Traffic Mgr', 'intercepts orders', ['✓ live', 'green'], 'Routes intercepted Pod requests straight into local Docker.')
        ],
        edges: [E('cl', 'nt', 'watch', { off: -6 }), E('nt', 'cl', 'req', { off: 6 }), E('nt', 'dk', 'ok')]
      }
    ]
  }
});

// Ensure every lesson's moduleId always stays in sync with MODULES
MODULES.forEach(m => {
  m.lessons.forEach(id => {
    if (LESSONS[id]) LESSONS[id].moduleId = m.id;
  });
});
