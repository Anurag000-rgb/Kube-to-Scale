/* =========================================================================
   CORE WORKLOADS, POD LIFECYCLE, NODES, REPLICASETS, DEPLOYMENTS, HPA & VPA
   ========================================================================= */

Object.assign(LESSONS, {
  /* ---------------- MODULE 01: NODE ARCHITECTURE & CONDITIONS ---------------- */
  'node-lifecycle-conditions': {
    id: 'node-lifecycle-conditions', moduleId: 'm1', certs: ['CKA', 'CKAD', 'CNPE'],
    title: 'Node Architecture, Conditions & Eviction',
    subtitle: 'Node Capacity vs Allocatable reservations, five Node Conditions (Ready/Memory/Disk/PID/Network), QoS eviction order, and safe cordon/drain with PDBs.',
    duration: '12 min', difficulty: 'Core',
    checklist: [
      'Distinguish Node Capacity from kube-reserved & Allocatable',
      'Diagnose Ready, MemoryPressure, DiskPressure & PIDPressure',
      'Predict QoS eviction order (BestEffort -> Burstable -> Guaranteed)',
      'Evacuate nodes safely with cordon, drain & PodDisruptionBudgets'
    ],
    steps: [
      {
        short: 'Allocatable Math', cat: 'ARCHITECTURE',
        title: 'Node Capacity vs Allocatable (Protecting OS & Kubelet)',
        body: ['A Worker Node with <code>16 GiB RAM</code> never gives all 16 GiB to application Pods. Kubelet reserves budgets for the Linux kernel (<code>system-reserved</code>), Kubernetes daemons (<code>kube-reserved</code>), and an OOM safety buffer (<code>eviction-hard</code>).', 'Only the remaining <strong>Allocatable</strong> slice is advertised to <code>kube-scheduler</code>—preventing noisy Pods from freezing SSH or containerd!'],
        yamlTitle: 'CLI · Inspect Node Capacity vs Allocatable',
        yaml: `kubectl describe node worker-1 | grep -A10 "Capacity:"\n# Allocatable = Capacity - kube-reserved - system-reserved - eviction-hard`,
        tip: 'CKA Tip: Scheduling checks summed Pod `resources.requests` strictly against Node `Allocatable`, never raw `Capacity`.',
        metrics: [['RAW CAPACITY', '4 CPU / 16 Gi'], ['RESERVED + BUF', '400m / 1.6 Gi', 'warn'], ['ALLOCATABLE', '3.6 CPU / 14.4 Gi', 'green'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'NODE BUDGET SPLIT', rows: [['system+kube', '400m CPU · 1.2Gi RAM'], ['eviction-hard', '100Mi mem · 10% nodefs'], ['Allocatable', '3600m CPU · 14.4Gi ✓']], banner: ['KERNEL & KUBELET HEADROOM RESERVED ✓', 'green'] },
        zones: [Z(65, 36, 690, 278, 'WORKER NODE RAM · 16.0 GI TOTAL CAPACITY', '#4A7BC7')],
        nodes: [
          N('sys', 180, 112, 'cube', 'yellow', 'system-reserved', 'OS + systemd', ['pinned', 'warn'], 'Protects Linux kernel, sshd, and journald.'),
          N('kub', 180, 245, 'cube', 'peach', 'kube-reserved', 'kubelet + containerd', ['pinned', 'warn'], 'Protects kubelet, kube-proxy, and container runtime.'),
          N('buf', 415, 245, 'shield', 'coral', 'eviction-hard', '100Mi buffer', ['trigger line', 'red'], 'Crossing this threshold triggers kubelet Pod eviction.'),
          N('alc', 585, 130, 'cluster', 'mint', 'Allocatable Pool', '3.6 CPU · 14.4 Gi', ['★ Schedulable', 'green'], 'Advertised to kube-scheduler for application Pods.')
        ],
        edges: [E('sys', 'alc', 'watch'), E('kub', 'alc', 'watch'), E('buf', 'alc', 'req')]
      },
      {
        short: 'Node Conditions', cat: 'ARCHITECTURE',
        title: 'Five Node Conditions & Automatic Pressure Taints',
        body: ['Every Node reports five live boolean <strong>Conditions</strong>: <code>Ready</code> (kubelet healthy), <code>MemoryPressure</code>, <code>DiskPressure</code>, <code>PIDPressure</code> (too many processes/threads), and <code>NetworkUnavailable</code> (CNI unconfigured).', 'When memory or disk runs low, Kubernetes automatically taints the node with <code>node.kubernetes.io/memory-pressure:NoSchedule</code> so new Pods stop landing there!'],
        yamlTitle: 'CLI · Inspect Node Conditions & Auto-Taints',
        yaml: `kubectl get nodes -o custom-columns=NAME:.metadata.name,READY:.status.conditions[-1].status,TAINTS:.spec.taints\nkubectl describe node worker-2 | grep -A15 Conditions`,
        tip: 'DiskPressure can come from either node rootfs/imagefs running below 10% free OR container log/writable-layer bloat!',
        metrics: [['READY', 'True / Unknown'], ['MEM / DISK', 'Pressure Taints', 'warn'], ['PID PRESSURE', 'pid.available', 'warn'], ['EXAM TRACK', 'CKA', 'red']],
        trace: { title: 'CONDITION MATRIX', rows: [['MemoryPressure', 'free < 100Mi -> taint ✓'], ['DiskPressure', 'nodefs < 10% -> GC images'], ['NetworkUnavail', 'missing CNI plugin ✕']], banner: ['PRESSURE TAINT HALTS NEW SCHEDULING ✓', 'warn'] },
        zones: [Z(285, 36, 480, 278, 'NODE CONTROLLER CONDITION WATCH', '#A8640C')],
        nodes: [
          N('w2', 145, 175, 'cube', 'coral', 'worker-2', 'nodefs 93% full', ['⚠ DiskPressure', 'red'], 'Kubelet detects disk below evictionHard imagefs/nodefs limit.'),
          N('cnd', 425, 110, 'shield', 'yellow', 'Status Condition', 'DiskPressure=True', ['auto-taint', 'warn'], 'Node Controller adds disk-pressure:NoSchedule taint.'),
          N('gc', 425, 245, 'cube', 'peach', 'Image / Log GC', 'prunes unused imgs', ['↻ freeing', 'warn'], 'Kubelet garbage-collects dead containers and unused images.'),
          N('sch', 665, 175, 'hex', 'sky', 'Scheduler', 'skips worker-2', ['✓ rerouted', 'green'], 'New Pending Pods route cleanly to healthy nodes.')
        ],
        edges: [E('w2', 'cnd', 'err'), E('w2', 'gc', 'req'), E('cnd', 'sch', 'watch')]
      },
      {
        short: 'QoS Eviction', cat: 'ARCHITECTURE',
        title: 'Node-Pressure Eviction Priority: BestEffort -> Burstable -> Guaranteed',
        body: ['If GC isn’t fast enough during <code>MemoryPressure</code>, kubelet reclaims RAM by evicting Pods strictly by <strong>QoS Class</strong> before the Linux kernel OOM killer freezes the host:', '<strong>1. BestEffort</strong> (no requests/limits) goes first -> <strong>2. Burstable</strong> (requests < limits) -> <strong>3. Guaranteed</strong> (requests == limits on all containers) stays protected last!'],
        yamlTitle: 'CLI · Audit Pod QoS Classes on a Node',
        yaml: `kubectl get pods -A -o custom-columns=NAME:.metadata.name,QOS:.status.qosClass,NODE:.spec.nodeName`,
        tip: 'Note: System PriorityClasses (`system-node-critical` DaemonSets) protect core agents from eviction even if Burstable.',
        metrics: [['EVICT 1ST', 'BestEffort', 'red'], ['EVICT 2ND', 'Burstable (Over Req)', 'warn'], ['PROTECTED LAST', 'Guaranteed ✓', 'green'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'KUBELET EVICTION RANK', rows: [['BestEffort', '0 req -> evicted 1st ✕'], ['Burstable', 'above req -> evicted 2nd'], ['Guaranteed', 'req == limit -> safe ✓']], banner: ['CRITICAL GUARANTEED PODS PROTECTED ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'KUBELET PRESSURE EVICTION LADDER', '#C93632')],
        nodes: [
          N('be', 180, 175, 'pod', 'coral', 'BestEffort Pod', 'no req / no limit', ['✗ Evict 1st', 'red'], 'Zero guarantees—terminated immediately under pressure.', true),
          N('bu', 415, 175, 'pod', 'yellow', 'Burstable Pod', 'req < limit', ['⚠ Evict 2nd', 'warn'], 'Evicted next based on how far usage exceeds request.'),
          N('gu', 645, 175, 'pod', 'mint', 'Guaranteed Pod', 'req == limit', ['★ Keep Last', 'green'], 'All containers have equal CPU & memory requests/limits.')
        ],
        edges: [E('be', 'bu', 'err'), E('bu', 'gu', 'watch')]
      },
      {
        short: 'Cordon & Drain', cat: 'ARCHITECTURE',
        title: 'Safe Node Maintenance: Cordon, Drain & PodDisruptionBudget',
        body: ['Before kernel patching or replacing a node: <code>kubectl cordon</code> marks it <code>SchedulingDisabled</code> (new Pods stay away). Then <code>kubectl drain</code> uses the <strong>Eviction API</strong> to gracefully terminate existing Pods while respecting <strong>PodDisruptionBudgets (PDB)</strong>.', 'Unlike raw Pod deletion, <code>drain</code> pauses cleanly if evicting another Pod would breach <code>minAvailable</code>!'],
        yamlTitle: 'CLI · Safe Node Evacuation',
        yaml: `kubectl cordon worker-2\nkubectl drain worker-2 --ignore-daemonsets --delete-emptydir-data\n# After maintenance:\nkubectl uncordon worker-2`,
        tip: 'CKA Trap: `drain` refuses to run unless you pass `--ignore-daemonsets` (because DaemonSets cannot be moved off the node).',
        metrics: [['CORDON', 'SchedulingDisabled'], ['DRAIN', 'Eviction API', 'green'], ['PDB GUARD', 'minAvailable: 2', 'green'], ['EXAM TRACK', 'CKA', 'green']],
        trace: { title: 'NODE EVACUATION', rows: [['cordon w2', 'NoSchedule taint added'], ['drain w2', 'Evicts via PDB check ✓'], ['uncordon w2', 'rejoins scheduler pool']], banner: ['ZERO-DOWNTIME NODE DRAIN COMPLETE ✓', 'green'] },
        zones: [Z(65, 38, 345, 275, 'WORKER-2 (CORDONED + DRAINING)', '#A8640C'), Z(440, 38, 320, 275, 'WORKER-3 (HEALTHY POOL)', '#1E7E45')],
        nodes: [
          N('w2', 165, 112, 'cube', 'yellow', 'worker-2', 'SchedulingDisabled', ['⏸ cordoned', 'warn'], 'Blocks new Pods while draining.'),
          N('ds', 165, 245, 'pod', 'sky', 'DaemonSet', '--ignore-daemonsets', null, 'Host agents remain intact on worker-2.'),
          N('pdb', 410, 175, 'shield', 'lavender', 'Eviction + PDB', 'minAvailable OK', ['✓ guarded', 'green'], 'Ensures HA replica count never dips below PDB budget.'),
          N('w3', 640, 175, 'cluster', 'mint', 'Rescheduled Pods', '3/3 Ready ✓', ['✓ migrated', 'green'], 'Workload Pods safely restarted on worker-3.')
        ],
        edges: [E('w2', 'pdb', 'req'), E('pdb', 'w3', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 02: POD STAGES, PHASES & LIFECYCLE ---------------- */
  'pod-lifecycle-stages': {
    id: 'pod-lifecycle-stages', moduleId: 'm2', certs: ['CKAD', 'CKA', 'CKS'],
    title: 'Pod Stages, Phases & Complete Lifecycle',
    subtitle: 'All five Pod Phases (Pending -> Running -> Succeeded/Failed/Unknown), Container States (Waiting/Running/Terminated), Probes, Hooks, and Graceful Shutdown.',
    duration: '14 min', difficulty: 'Core',
    checklist: [
      'Track Pod Phases (Pending, Running, Succeeded, Failed, Unknown)',
      'Debug Container Waiting states (ImagePullBackOff, CrashLoopBackOff)',
      'Order initContainers, postStart, startup/readiness/liveness probes',
      'Trace preStop + SIGTERM + terminationGracePeriodSeconds'
    ],
    steps: [
      {
        short: '5 Pod Phases', cat: 'WORKLOAD',
        title: 'The 5 Pod Phases & 4 Status Conditions',
        body: ['Every Pod passes through high-level <strong>Phases</strong> (<code>.status.phase</code>): <strong>Pending</strong> (accepted by API, waiting for scheduler or image pull), <strong>Running</strong> (bound to a node, container started), and terminal <strong>Succeeded</strong> (Jobs exit 0) or <strong>Failed</strong> (non-zero exit). <strong>Unknown</strong> means kubelet lost contact with the control plane.', 'Meanwhile <code>.status.conditions</code> tracks fine-grained progress: <code>PodScheduled -> Initialized -> ContainersReady -> Ready</code>.'],
        yamlTitle: 'CLI · Inspect Pod Phase & All Conditions',
        yaml: `kubectl get pod api-7f9b -o jsonpath='{.status.phase}{"\\n"}{.status.conditions[*].type}{"\\n"}'\nkubectl describe pod api-7f9b | grep -A8 Conditions`,
        tip: 'A Pod is NOT deleted when it enters `Succeeded` or `Failed`—it stays in etcd (for `kubectl logs`) until deleted or TTL-cleaned.',
        metrics: [['START PHASE', 'Pending', 'warn'], ['ACTIVE PHASE', 'Running ✓', 'green'], ['TERMINAL', 'Succeeded / Failed'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'POD PHASE MACHINE', rows: [['Pending', 'Sched -> ImagePull -> Init'], ['Running', 'ContainersReady & Ready ✓'], ['Terminal', 'Succeeded (0) / Failed (>0)']], banner: ['POD REACHED RUNNING + READY ✓', 'green'] },
        zones: [Z(65, 36, 690, 278, 'KUBERNETES POD PHASE PROGRESSION', '#4A7BC7')],
        nodes: [
          N('pnd', 145, 175, 'pod', 'yellow', 'Pending', 'Schedule + Pull', ['1. init', 'warn'], 'Accepted in etcd; waiting on Scheduler, PVC, or container image pull.'),
          N('run', 400, 175, 'pod', 'mint', 'Running', 'Ready=True ✓', ['2. active', 'green'], 'Bound to node; containers running & passing readinessProbe.'),
          N('suc', 645, 108, 'pod', 'sky', 'Succeeded', 'Exit 0 (Jobs)', ['✓ exit 0', 'green'], 'All containers exited cleanly (Job/CronJob completion).'),
          N('fld', 645, 245, 'pod', 'coral', 'Failed / Unknown', 'Exit >0 / Lost', ['✗ err', 'red'], 'Failed: non-zero exit with restartPolicy Never. Unknown: lost node.', true)
        ],
        edges: [E('pnd', 'run', 'ok'), E('run', 'suc', 'ok'), E('run', 'fld', 'err')]
      },
      {
        short: 'Container States', cat: 'WORKLOAD',
        title: 'Container States: Waiting -> Running -> Terminated',
        body: ['Inside a Pod, each container reports one of three exact states: <strong>Waiting</strong> (pulling image, applying ConfigMap/Secret, or Init running), <strong>Running</strong>, or <strong>Terminated</strong> (with <code>exitCode</code> and <code>reason</code>).', 'Common Waiting traps: <code>ImagePullBackOff</code> (bad tag/secret), <code>CreateContainerConfigError</code> (missing ConfigMap/Secret key), and <code>CrashLoopBackOff</code> (exponential 10s -> 300s restart delay after repeated crashes).'],
        yamlTitle: 'CLI · Inspect Last Crash Exit Code',
        yaml: `kubectl get pod web -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'\nkubectl logs web --previous`,
        tip: 'Exit Code 137 = `SIGKILL` (usually `OOMKilled`); Exit Code 143 = `SIGTERM` (graceful shutdown); Exit Code 1/2 = app runtime error.',
        metrics: [['WAITING', 'ImagePull / ConfigErr', 'warn'], ['CRASH LOOP', '10s..300s BackOff', 'red'], ['LAST EXIT', '137 OOM / 143 TERM'], ['EXAM TRACK', 'CKA · CKAD', 'red']],
        trace: { title: 'CONTAINER STATE DEBUG', rows: [['ImagePullBackOff', 'check image tag + pullSecret'], ['CreateConfigErr', 'missing ConfigMap / Secret'], ['CrashLoopBackOff', 'run kubectl logs --previous']], banner: ['CHECK EVENTS + PREVIOUS LOGS ✓', 'warn'] },
        zones: [Z(70, 38, 685, 275, 'PER-CONTAINER STATE MACHINE', '#A8640C')],
        nodes: [
          N('wt', 175, 175, 'cube', 'yellow', 'Waiting', 'Pulling / ConfigErr', ['⏳ wait', 'warn'], 'Reason reveals ImagePullBackOff or missing Secret/ConfigMap.'),
          N('rn', 415, 175, 'pod', 'mint', 'Running', 'PID active', ['▶ live', 'green'], 'startedAt timestamp recorded; health probes running.'),
          N('tm', 655, 108, 'cube', 'coral', 'Terminated', 'exitCode: 1 / 137', ['✗ crashed', 'red'], 'Check reason (OOMKilled/Error) + `kubectl logs --previous`.'),
          N('cb', 655, 245, 'shield', 'gray', 'CrashLoopBackOff', 'wait 10s..5m', ['↻ retry', 'warn'], 'kubelet backs off exponentially if RestartPolicy=Always.')
        ],
        edges: [E('wt', 'rn', 'ok'), E('rn', 'tm', 'err'), E('tm', 'cb', 'watch'), E('cb', 'wt', 'req')]
      },
      {
        short: 'Hooks & 3 Probes', cat: 'WORKLOAD',
        title: 'Lifecycle Ordering: Init -> postStart -> Startup/Readiness/Liveness',
        body: ['1. <strong>initContainers</strong> run sequentially to exit 0.<br/>2. Main container starts concurrently with its <strong><code>postStart</code></strong> hook (container stays <code>Waiting</code> until postStart finishes).<br/>3. <strong><code>startupProbe</code></strong> protects slow-booting JVMs by suppressing liveness/readiness until boot finishes.<br/>4. <strong><code>readinessProbe</code></strong> gates Service EndpointSlice traffic, while <strong><code>livenessProbe</code></strong> restarts frozen containers!'],
        yamlTitle: 'YAML · Startup + Readiness + Liveness + postStart',
        yaml: `lifecycle:\n  postStart: { exec: { command: ["sh", "-c", "echo booted >> /tmp/hook"] } }\nstartupProbe: { httpGet: { path: /healthz, port: 8080 }, failureThreshold: 30, periodSeconds: 5 }\nreadinessProbe: { httpGet: { path: /readyz, port: 8080 }, periodSeconds: 5 }\nlivenessProbe: { httpGet: { path: /healthz, port: 8080 }, periodSeconds: 10 }`,
        tip: 'Golden Rule: Failing `readinessProbe` NEVER restarts a Pod—it only removes the Pod IP from Service endpoints cleanly!',
        metrics: [['STARTUP', 'Guards Slow Boot', 'green'], ['READINESS', 'Governs Traffic ✓', 'green'], ['LIVENESS', 'Restarts Hung PID', 'warn'], ['EXAM TRACK', 'CKAD · CKA', 'green']],
        trace: { title: 'PROBE & HOOK PIPELINE', rows: [['1. Init + postStart', 'boot hook complete ✓'], ['2. startupProbe', 'app warm -> unlocks others'], ['3. Ready + Live', 'EndpointSlice active ✓']], banner: ['ALL THREE PROBES COORDINATED ✓', 'green'] },
        zones: [Z(65, 36, 690, 278, 'CONTAINER BOOT & HEALTH TRIAD', '#1E7E45')],
        nodes: [
          N('in', 145, 175, 'cube', 'yellow', 'Init + postStart', 'boot setup', ['1. init', 'green'], 'Init finishes first, then postStart runs alongside ENTRYPOINT.'),
          N('sp', 385, 175, 'shield', 'peach', 'startupProbe', 'up to 150s', ['2. warm', 'warn'], 'Temporarily pauses liveness & readiness for slow apps.'),
          N('rp', 630, 108, 'router', 'mint', 'readinessProbe', 'controls LB IP', ['3. Traffic ✓', 'green'], 'Removes Pod IP from EndpointSlice on failure (no restart).'),
          N('lp', 630, 245, 'cube', 'sky', 'livenessProbe', 'restarts hung', ['4. Watchdog', 'purple'], 'Kills & restarts container if process deadlocks.')
        ],
        edges: [E('in', 'sp', 'ok'), E('sp', 'rp', 'ok'), E('sp', 'lp', 'watch')]
      },
      {
        short: 'Graceful Stop', cat: 'WORKLOAD',
        title: 'Termination Timeline: preStop -> SIGTERM -> Grace Period -> SIGKILL',
        body: ['On deletion, TWO parallel tracks begin at <code>t=0</code>: Control Plane removes the Pod from <strong>EndpointSlices</strong> (kube-proxy propagates iptables/eBPF in ~1–2s), while kubelet runs your <strong><code>preStop</code> hook</strong> (e.g., <code>sleep 5</code>) and THEN sends <strong><code>SIGTERM (143)</code></strong>.', 'If the app hasn’t exited when <code>terminationGracePeriodSeconds</code> (default <code>30s</code>) expires, kubelet sends hard <strong><code>SIGKILL (137)</code></strong>!'],
        yamlTitle: 'YAML · Zero-502 Graceful Shutdown Config',
        yaml: `spec:\n  terminationGracePeriodSeconds: 45\n  containers:\n  - name: api\n    lifecycle:\n      preStop: { exec: { command: ["sh", "-c", "sleep 5"] } }`,
        tip: 'Note: `preStop` time counts INSIDE `terminationGracePeriodSeconds`! If preStop sleeps 25s and grace is 30s, SIGTERM only gets 5s.',
        metrics: [['DEFAULT GRACE', '30s (Incl. preStop)'], ['PRESTOP SLEEP', '5s Drain ✓', 'green'], ['TERMINAL SIGNAL', 'SIGTERM -> SIGKILL'], ['EXAM TRACK', 'CKAD · CKA', 'purple']],
        trace: { title: 'SHUTDOWN TIMELINE', rows: [['t=0s', 'del EndpointSlice + preStop'], ['t=5s', 'SIGTERM -> drain in-flight'], ['t=30s max', 'SIGKILL if still alive']], banner: ['ZERO DROPPED REQUESTS ON STOP ✓', 'green'] },
        zones: [Z(65, 36, 690, 278, 'PARALLEL TERMINATING SEQUENCE', '#6E47B8')],
        nodes: [
          N('del', 140, 175, 'cube', 'peach', 'DELETE Pod', 't=0s Terminating', ['⚡ t=0s', 'warn'], 'Pod metadata.deletionTimestamp set; status becomes Terminating.'),
          N('es', 415, 105, 'router', 'mint', 'EndpointSlice Del', 'kube-proxy sync', ['~1-2s LB', 'green'], 'Removes Pod IP asynchronously across all nodes.'),
          N('ps', 415, 245, 'shield', 'lavender', 'preStop (sleep 5)', 'holds socket open', ['drain ✓', 'green'], 'Keeps app alive during kube-proxy propagation.'),
          N('tm', 665, 245, 'cube', 'sky', 'SIGTERM -> Stop', 'exit 0 (<30s)', ['✓ clean', 'green'], 'App closes connections cleanly before SIGKILL timer.')
        ],
        edges: [E('del', 'es', 'watch'), E('del', 'ps', 'req'), E('ps', 'tm', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 02: REPLICASETS & DEPLOYMENT STRATEGIES ---------------- */
  'replicasets-deployments-deep': {
    id: 'replicasets-deployments-deep', moduleId: 'm2', certs: ['CKAD', 'CKA'],
    title: 'ReplicaSets, Selectors & Deployment Strategies',
    subtitle: 'ReplicaSet reconciliation & matchExpressions, orphan Pod adoption & --cascade=orphan, Recreate vs RollingUpdate, and rollout pause/resume.',
    duration: '12 min', difficulty: 'Core',
    checklist: [
      'Understand ReplicaSet matchLabels & matchExpressions selectors',
      'Adopt standalone Pods or delete RS with --cascade=orphan',
      'Compare RollingUpdate vs Recreate & progressDeadlineSeconds',
      'Batch edits cleanly using kubectl rollout pause & resume'
    ],
    steps: [
      {
        short: 'RS Reconciliation', cat: 'WORKLOAD',
        title: 'ReplicaSet Control Loop: Keeping Desired Replicas Alive',
        body: ['A <strong>ReplicaSet</strong> continuously compares <code>spec.replicas</code> against live Pods matching <code>spec.selector</code> (<code>matchLabels</code> AND set-based <code>matchExpressions</code> like <code>In</code> / <code>NotIn</code>).', 'If a Pod crashes or its node fails, ReplicaSet Controller creates a fresh Pod from <code>spec.template</code> within milliseconds to maintain exact desired count.'],
        yamlTitle: 'YAML · Set-Based ReplicaSet Selector',
        yaml: `spec:\n  replicas: 3\n  selector:\n    matchLabels: { app: checkout }\n    matchExpressions:\n    - { key: env, operator: In, values: [prod, canary] }`,
        tip: 'Unlike old ReplicationControllers (equality-only), ReplicaSets support rich `matchExpressions` (`In`, `NotIn`, `Exists`, `DoesNotExist`).',
        metrics: [['CONTROLLER', 'ReplicaSet'], ['DESIRED', '3 Pods', 'green'], ['SELECTOR', 'Labels + Expr'], ['EXAM TRACK', 'CKA · CKAD', 'green']],
        trace: { title: 'REPLICASET LOOP', rows: [['watch Pods', '2 running (1 lost ✕)'], ['diff', '3 desired - 2 = +1'], ['create Pod', 'web-9k2f -> 3/3 ✓']], banner: ['SELF-HEALING RECONCILED TO 3/3 ✓', 'green'] },
        zones: [Z(280, 36, 485, 278, 'MATCHING PODS (app=checkout)', '#1E7E45')],
        nodes: [
          N('rs', 145, 175, 'cube', 'peach', 'ReplicaSet', 'replicas: 3', ['↻ 2 -> 3', 'warn'], 'Compares current matching Pods vs spec.replicas.'),
          N('p1', 425, 108, 'pod', 'mint', 'Pod A', 'ownerRef: rs', ['✓ Ready', 'green'], 'Healthy existing Pod.'),
          N('p2', 425, 245, 'pod', 'gray', 'Lost Pod', 'Node down', ['✗ deleted', 'red'], 'Node terminated; ReplicaSet schedules replacement.', true),
          N('p3', 665, 175, 'pod', 'mint', 'New Pod C', 'booting ✓', ['+ created', 'green'], 'Spawned automatically from RS spec.template.')
        ],
        edges: [E('rs', 'p1', 'watch'), E('p2', 'rs', 'err', { stop: 0.7 }), E('rs', 'p3', 'ok')]
      },
      {
        short: 'Orphan & Adopt', cat: 'WORKLOAD',
        title: 'Pod Adoption & Non-Destructive Deletion (--cascade=orphan)',
        body: ['<strong>Pod Adoption:</strong> If a standalone Pod (with no <code>ownerReferences</code>) has labels matching a ReplicaSet’s selector, the ReplicaSet adopts it immediately (and may terminate excess replicas)!', '<strong>Safe Deletion:</strong> Need to delete a ReplicaSet without taking down live traffic Pods? Pass <code>--cascade=orphan</code> so the Pods stay Running unowned!'],
        yamlTitle: 'CLI · Orphan Pods Without Downtime',
        yaml: `kubectl delete replicaset web-rs --cascade=orphan\n# Running Pods survive untouched without ownerReferences!`,
        tip: 'CKA Trap: Never reuse an app label on a standalone debug Pod in a namespace where a Deployment/RS already selects that label—or the RS will adopt and immediately delete it!',
        metrics: [['ADOPTION', 'No ownerRef + Match', 'warn'], ['ORPHAN FLAG', '--cascade=orphan', 'green'], ['POD IMPACT', '0 Pods Killed ✓', 'green'], ['EXAM TRACK', 'CKA · CKAD', 'purple']],
        trace: { title: 'ORPHAN CASCADE CONTROL', rows: [['default delete', 'Foreground -> kills Pods ✕'], ['--cascade=orphan', 'deletes RS only ✓'], ['live Pods', 'remain 100% online ✓']], banner: ['REPLICASET REMOVED · PODS SPARED ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'PODS SPARED BY --cascade=orphan', '#1E7E45')],
        nodes: [
          N('del', 145, 175, 'cube', 'yellow', 'delete rs', '--cascade=orphan', ['✎ detached', 'warn'], 'Deletes ReplicaSet metadata while preserving Pods.'),
          N('rs', 415, 112, 'cube', 'gray', 'ReplicaSet', 'Deleted', ['✗ gone', 'red'], 'Controller object removed cleanly.', true),
          N('p1', 645, 112, 'pod', 'mint', 'Orphan Pod 1', 'ownerRef: none', ['✓ Running', 'green'], 'Continues serving traffic normally.'),
          N('p2', 645, 245, 'pod', 'mint', 'Orphan Pod 2', 'ownerRef: none', ['✓ Running', 'green'], 'Can later be adopted by a new ReplicaSet.')
        ],
        edges: [E('del', 'rs', 'err'), E('rs', 'p1', 'watch', { stop: 0.55 }), E('rs', 'p2', 'watch', { stop: 0.55 })]
      },
      {
        short: 'Recreate Strategy', cat: 'WORKLOAD',
        title: 'Recreate vs RollingUpdate & progressDeadlineSeconds',
        body: ['Stateful singletons (e.g. legacy DBs holding an RWO lock or schema incompatible with v1+v2 running together) use <code>strategy.type: Recreate</code>: Kubernetes terminates <strong>all</strong> v1 Pods first before starting any v2 Pod.', 'Also set <code>progressDeadlineSeconds: 600</code> so stalled rollouts report <code>Progressing=False</code> (`TimedOut`) clearly to CI/CD alerts.'],
        yamlTitle: 'YAML · Recreate Strategy & Progress Deadline',
        yaml: `spec:\n  progressDeadlineSeconds: 300\n  strategy:\n    type: Recreate   # Stops ALL v1 Pods before creating v2 Pods`,
        tip: 'Even when a Deployment hits `progressDeadlineSeconds`, Kubernetes does NOT auto-rollback—your CI/CD or ArgoCD checks the failed condition and triggers `undo`.',
        metrics: [['STRATEGY', 'Recreate', 'warn'], ['V1 + V2 COEXIST', 'Never (0 Overlap)'], ['DEADLINE', 'progressDeadlineSec'], ['EXAM TRACK', 'CKAD · CKA', 'warn']],
        trace: { title: 'RECREATE SEQUENCE', rows: [['1. RS v1', 'scale 3 -> 0 (all stop)'], ['2. RWO Disk', 'released cleanly ✓'], ['3. RS v2', 'scale 0 -> 3 started ✓']], banner: ['CLEAN LOCK HANDOFF (SHORT OUTAGE)', 'warn'] },
        zones: [Z(75, 38, 680, 275, 'RECREATE STRATEGY (STRICT SEQUENTIAL SWAP)', '#A8640C')],
        nodes: [
          N('r1', 180, 175, 'cluster', 'gray', 'RS v1 (3 -> 0)', 'stopped first', ['1. drained', 'red'], 'Every v1 Pod terminates before v2 starts.', true),
          N('pv', 415, 175, 'cyl', 'lavender', 'RWO Disk / Lock', 'exclusively free', ['✓ free', 'green'], 'Prevents multi-writer corruption or schema mismatch.'),
          N('r2', 645, 175, 'cluster', 'mint', 'RS v2 (0 -> 3)', 'started after v1=0', ['2. booted', 'green'], 'Boots fresh Pods cleanly once v1 is completely gone.')
        ],
        edges: [E('r1', 'pv', 'err', { stop: 0.75 }), E('pv', 'r2', 'ok')]
      },
      {
        short: 'Pause & History', cat: 'WORKLOAD',
        title: 'Batch Multi-Step Edits With rollout pause & resume',
        body: ['Need to update a Deployment’s image AND memory limit AND env var together without triggering 3 separate noisy rollouts? Run <code>kubectl rollout pause deploy/web</code>, apply all edits, then run <code>kubectl rollout resume deploy/web</code> to launch <strong>one single clean ReplicaSet revision</strong>!', 'Control how many old RS revisions stay in etcd via <code>revisionHistoryLimit</code> (default <code>10</code>).'],
        yamlTitle: 'CLI · Pause, Batch Edits & Resume',
        yaml: `kubectl rollout pause deploy/web\nkubectl set image deploy/web app=app:v2.4\nkubectl set resources deploy/web -c=app --limits=memory=512Mi\nkubectl set env deploy/web FEATURE_X=true\nkubectl rollout resume deploy/web`,
        tip: 'Pausing a Deployment mid-RollingUpdate is also a classic CKAD way to inspect a canary Pod manually before rolling out the remaining replicas!',
        metrics: [['ACTION', 'pause -> edit -> resume'], ['NEW REVISIONS', '1 Clean RS ✓', 'green'], ['HISTORY LIMIT', '10 (Default)'], ['EXAM TRACK', 'CKAD', 'green']],
        trace: { title: 'BATCHED DEPLOY EDIT', rows: [['pause', 'controller skips sync'], ['3 edits', 'image + limits + env'], ['resume', '1 single RS v2 rollout ✓']], banner: ['THREE EDITS -> ONE CLEAN ROLLOUT ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'ROLLOUT PAUSE / RESUME WORKFLOW', '#4A7BC7')],
        nodes: [
          N('pa', 155, 175, 'shield', 'yellow', 'rollout pause', 'freeze updates', ['⏸ paused', 'warn'], 'Suspends ReplicaSet generation during batch edits.'),
          N('ed', 410, 175, 'cube', 'lavender', 'Batch Edits', 'image + mem + env', ['✎ 3 changes', 'purple'], 'All template changes accumulate on the Deployment.'),
          N('re', 660, 175, 'cluster', 'mint', 'rollout resume', '1x RS rollout', ['▶ synced ✓', 'green'], 'Executes a single atomic RollingUpdate to the final state.')
        ],
        edges: [E('pa', 'ed', 'watch'), E('ed', 're', 'ok')]
      }
    ]
  },

  /* ---------------- MODULE 13: HPA & VPA DEEP DIVES ---------------- */
  'hpa-deep-dive': {
    id: 'hpa-deep-dive', moduleId: 'm13', certs: ['CKA', 'CKAD', 'CNPE'],
    title: 'HPA v2 Architecture, Math & Scaling Policies',
    subtitle: 'Desired replica formula, 10% tolerance band, multi-metric max-wins evaluation, scaleDown stabilization windows, and custom/external queue metrics.',
    duration: '12 min', difficulty: 'Intermediate',
    checklist: [
      'Calculate desiredReplicas = ceil(cur * curVal / targetVal)',
      'Understand the 10% tolerance deadband & requests prerequisite',
      'Configure autoscaling/v2 behavior stabilizationWindowSeconds',
      'Scale on Prometheus RPS & queues via Custom Metrics API'
    ],
    steps: [
      {
        short: 'HPA Math', cat: 'PLATFORM',
        title: 'HPA Reconciliation Loop, Replica Formula & 10% Tolerance',
        body: ['Every <code>15s</code>, HorizontalPodAutoscaler Controller queries <code>metrics.k8s.io</code> and computes:<br/><code>desiredReplicas = ceil[currentReplicas * (currentMetricValue / desiredMetricValue)]</code>.', 'If ratio stays within <code>±10%</code> (0.90–1.10), HPA skips scaling to prevent oscillation. And remember: CPU/Memory percentages divide actual usage by Pod <code>resources.requests</code>!'],
        yamlTitle: 'CLI · Verify Metrics Server & HPA Math',
        yaml: `kubectl top pods -n prod\nkubectl get hpa api-hpa -n prod -o yaml\n# Example: 4 Pods at 90% CPU vs 50% target -> ceil(4 * 90 / 50) = 8 Pods`,
        tip: 'CKA Trap: Missing `resources.requests.cpu` on ANY container in the Pod causes HPA `TARGETS` to read `<unknown>/50%` and refuse to scale!',
        metrics: [['SYNC PERIOD', '15 sec'], ['TOLERANCE', '±10% Band ✓', 'green'], ['FORMULA', '4*(90/50) -> 8', 'warn'], ['EXAM TRACK', 'CKA · CKAD', 'purple']],
        trace: { title: 'HPA FORMULA TRACE', rows: [['current', '4 Pods @ 90% CPU'], ['target', '50% utilization'], ['ceil(4*1.8)', '8 desired Replicas ✓']], banner: ['CALCULATED 4 -> 8 REPLICAS ✓', 'green'] },
        zones: [Z(285, 36, 480, 278, 'HPA 15-SECOND CONTROL LOOP', '#4A7BC7')],
        nodes: [
          N('ms', 145, 175, 'cyl', 'sky', 'Metrics Server', 'metrics.k8s.io', null, 'Aggregates kubelet cAdvisor Pod CPU/RAM metrics.'),
          N('hp', 425, 110, 'cube', 'lavender', 'HPA Controller', 'ceil(4 * 90/50)', ['= 8 pods', 'warn'], 'Applies ±10% deadband and scale formula.'),
          N('dp', 425, 245, 'cube', 'mint', 'Deployment/scale', 'replicas -> 8', ['✓ scaled', 'green'], 'Patches `/scale` subresource of Deployment/StatefulSet.'),
          N('pd', 665, 175, 'cluster', 'mint', '8 App Pods', 'avg ~45% CPU', ['✓ stable', 'green'], 'Per-Pod CPU drops cleanly below 50% target.')
        ],
        edges: [E('ms', 'hp', 'req'), E('hp', 'dp', 'ok'), E('dp', 'pd', 'ok')]
      },
      {
        short: 'Stabilize & Rate', cat: 'PLATFORM',
        title: 'autoscaling/v2 Multi-Metrics & Stabilization Windows',
        body: ['With <code>autoscaling/v2</code>, HPA evaluates multiple metrics (CPU + Memory + HTTP RPS) simultaneously and picks the <strong>largest recommended replica count</strong>.', 'Use <code>spec.behavior</code> to react fast on spikes (<code>scaleUp</code>: 0s window) while preventing premature scale-in flushes (<code>scaleDown.stabilizationWindowSeconds: 300</code> or <code>30</code> in CKA drills)!'],
        yamlTitle: 'YAML · HPA v2 Behavior Stabilization Policy',
        yaml: `apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nspec:\n  minReplicas: 2\n  maxReplicas: 12\n  behavior:\n    scaleUp: { stabilizationWindowSeconds: 0 }\n    scaleDown:\n      stabilizationWindowSeconds: 30\n      policies: [{ type: Percent, value: 50, periodSeconds: 60 }]`,
        tip: 'CKA Tip: `kubectl autoscale` ignores `behavior` flags—generate YAML with `--dry-run=client -o yaml`, add `behavior:`, and apply!',
        metrics: [['SCALE UP', '0s Window (Fast)', 'green'], ['SCALE DOWN', '30s–300s Window'], ['RATE LIMIT', 'Max 50%/min'], ['EXAM TRACK', 'CKA · CNPE', 'purple']],
        trace: { title: 'STABILIZATION WINDOW', rows: [['CPU rec', '3 Pods'], ['RPS rec', '7 Pods -> MAX WINS ✓'], ['scaleDown', 'holds peak for 30s ✓']], banner: ['THRASHING PREVENTED BY STABILIZATION ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'AUTOSCALING/V2 MULTI-METRIC + STABILIZATION', '#6E47B8')],
        nodes: [
          N('m1', 165, 110, 'cube', 'sky', 'CPU Rec', '3 Pods', null, 'Resource CPU metric recommendation.'),
          N('m2', 165, 245, 'cube', 'peach', 'Custom RPS Rec', '7 Pods', ['★ Max Wins', 'warn'], 'HPA always selects the highest recommendation across metrics.'),
          N('bh', 435, 175, 'shield', 'lavender', 'Behavior Gate', 'scaleDown: 30s', ['✓ smoothed', 'green'], 'Tracks recent recommendations over stabilizationWindowSeconds.'),
          N('fl', 665, 175, 'cluster', 'mint', 'Scaled Fleet', '7 Pods steady', ['✓ no flap', 'green'], 'Zero scale-down oscillation during brief traffic dips.')
        ],
        edges: [E('m1', 'bh', 'watch'), E('m2', 'bh', 'req'), E('bh', 'fl', 'ok')]
      },
      {
        short: 'Custom & KEDA', cat: 'PLATFORM',
        title: 'Custom RPS & Event-Driven Scaling (Prometheus Adapter & KEDA)',
        body: ['CPU lags behind true request pressure on I/O-bound microservices. Expose Prometheus metrics (e.g. <code>http_requests_per_sec</code>) via <strong>prometheus-adapter</strong> on <code>custom.metrics.k8s.io</code> (`type: Pods`), OR deploy <strong>KEDA</strong>.', 'KEDA adds external event scalers (Kafka lag, SQS, Redis) AND unlocks <strong>scale-to-zero</strong> (<code>0 -> N</code>) whereas native HPA requires <code>minReplicas >= 1</code>!'],
        yamlTitle: 'YAML · HPA Custom Pods Metric (HTTP RPS)',
        yaml: `metrics:\n- type: Pods\n  pods:\n    metric: { name: http_requests_per_sec }\n    target: { type: AverageValue, averageValue: "100" }`,
        tip: 'Notice native HPA cannot scale to 0—KEDA steps in as `minReplicas: 0` activator and hands back to native HPA once replicas >= 1.',
        metrics: [['API GROUP', 'custom.metrics'], ['ADAPTER', 'Prom / KEDA', 'green'], ['SCALE TO ZERO', 'KEDA Only ✓', 'purple'], ['EXAM TRACK', 'CNPE · CKAD', 'purple']],
        trace: { title: 'CUSTOM / KEDA SCALE', rows: [['Kafka lag', '0 -> 5,000 msgs'], ['KEDA wake', '0 -> 1 Pod immediately'], ['HPA v2', '1 -> 12 Pods on RPS ✓']], banner: ['TRUE EVENT-DRIVEN ELASTICITY ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'CUSTOM METRICS & KEDA BRIDGE', '#1E7E45')],
        nodes: [
          N('pr', 165, 112, 'cyl', 'peach', 'Prometheus / Kafka', 'RPS / Lag', null, 'Captures application latency, HTTP RPS, or queue backlog.'),
          N('ad', 165, 245, 'cube', 'sky', 'prom-adapter / KEDA', 'custom.metrics', ['✓ bridge', 'green'], 'Exposes custom/external metrics APIs to Kubernetes.'),
          N('hp', 435, 175, 'hex', 'lavender', 'HPA v2 / KEDA', '0 -> 12 Pods', ['⚡ elastic', 'green'], 'Scales smoothly from 0 (KEDA) up to peak load.'),
          N('wk', 665, 175, 'cluster', 'mint', 'Workers', 'queue drained ✓', ['✓ SLO met', 'green'], 'Maintains target latency regardless of CPU profile.')
        ],
        edges: [E('pr', 'ad', 'watch'), E('ad', 'hp', 'req'), E('hp', 'wk', 'ok')]
      }
    ]
  },

  'vpa-deep-dive': {
    id: 'vpa-deep-dive', moduleId: 'm13', certs: ['CKAD', 'CNPE', 'CKA'],
    title: 'Vertical Pod Autoscaler (VPA) Architecture',
    subtitle: 'Three VPA components (Recommender, Updater, Admission), update modes (Off, Initial, Auto, InPlaceOrRecreate), and how to coexist safely with HPA.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Separate roles of VPA Recommender, Updater & Admission Webhook',
      'Audit waste safely using updateMode: "Off" first',
      'Compare Initial, Recreate/Auto & InPlaceOrRecreate resize modes',
      'Avoid CPU/Memory HPA + VPA conflict (Golden Coexistence Rule)'
    ],
    steps: [
      {
        short: '3 VPA Parts', cat: 'PLATFORM',
        title: 'How VPA Works: Recommender, Updater & Admission Controller',
        body: ['VPA right-sizes individual container CPU & memory <code>requests</code>/<code>limits</code> using three cooperating controllers:<br/>1. <strong>Recommender</strong> analyzes historical usage + OOM events and computes <code>lowerBound / target / upperBound</code>.<br/>2. <strong>Updater</strong> evicts out-of-range Pods when auto-resizing.<br/>3. <strong>Admission Controller</strong> mutates newly created Pods with the winning resource values!'],
        yamlTitle: 'CLI · Inspect VPA Target Recommendations',
        yaml: `kubectl get vpa api-vpa -n prod -o jsonpath='{.status.recommendation.containerRecommendations}'\n# Recommender calculates minAllowed -> target -> maxAllowed`,
        tip: 'VPA watches `OOMKilled` events too—when a container OOMs, Recommender bumps its memory recommendation immediately by a safety multiplier!',
        metrics: [['RECOMMENDER', 'Builds Usage Model', 'green'], ['UPDATER', 'Triggers Resize'], ['ADMISSION', 'Mutates New Pods', 'purple'], ['EXAM TRACK', 'CNPE · CKAD', 'purple']],
        trace: { title: 'VPA ARCHITECTURE', rows: [['API Pod uses', '42m CPU / 180Mi (req 2Gi!)'], ['Recommender', 'target: 60m / 256Mi ✓'], ['Admission', 'injects right-sized Pod']], banner: ['OVER-PROVISIONING COMPUTED ✓', 'green'] },
        zones: [Z(65, 36, 690, 278, 'VERTICAL POD AUTOSCALER TRIAD', '#6E47B8')],
        nodes: [
          N('rc', 165, 112, 'cube', 'lavender', 'Recommender', 'reads metrics + OOM', ['★ calculates', 'purple'], 'Computes target CPU & memory bounds continuously.'),
          N('up', 425, 112, 'cube', 'yellow', 'Updater', 'evicts if stale', ['↻ checks PDB', 'warn'], 'Respects PodDisruptionBudget before evicting out-of-band Pods.'),
          N('ad', 425, 245, 'shield', 'mint', 'Admission Hook', 'mutates requests', ['✎ patches', 'green'], 'Rewrites Pod CPU/RAM requests when ReplicaSet recreates it.'),
          N('pd', 665, 175, 'pod', 'mint', 'Right-Sized Pod', '60m / 256Mi ✓', ['✓ -85% waste', 'green'], 'Node packing density jumps dramatically.')
        ],
        edges: [E('rc', 'up', 'watch'), E('rc', 'ad', 'watch'), E('up', 'pd', 'req'), E('ad', 'pd', 'ok')]
      },
      {
        short: 'Update Modes', cat: 'PLATFORM',
        title: 'VPA Update Modes: Off -> Initial -> Auto vs InPlaceOrRecreate',
        body: ['<strong><code>Off</code></strong>: Zero Pod changes—pure recommendation auditing (always start here in prod!).<br/><strong><code>Initial</code></strong>: Applies recommendations ONLY at Pod creation (never evicts running Pods).<br/><strong><code>Recreate</code> / <code>Auto</code></strong>: Updater evicts pods to resize them.<br/><strong><code>InPlaceOrRecreate</code></strong> (modern K8s): Resizes CPU/RAM in-place on live Pods without restarting!'],
        yamlTitle: 'YAML · VPA Safe Recommendation Mode (Off)',
        yaml: `apiVersion: autoscaling.k8s.io/v1\nkind: VerticalPodAutoscaler\nmetadata: { name: api-vpa, namespace: prod }\nspec:\n  targetRef: { apiVersion: apps/v1, kind: Deployment, name: api }\n  updatePolicy:\n    updateMode: "Off"   # Audit first; switch to Initial or InPlaceOrRecreate`,
        tip: 'Never turn on `updateMode: Auto` on a 1-replica Deployment without a PDB, or Updater will cause a brief outage while recreating it!',
        metrics: [['OFF', 'Dry-Run Audit ✓', 'green'], ['INITIAL', 'Mutate on Boot Only'], ['INPLACE', 'Zero-Restart Resize', 'purple'], ['EXAM TRACK', 'CKAD · CNPE', 'green']],
        trace: { title: 'VPA UPDATE MODES', rows: [['Off', '0 evictions · status only'], ['Initial', 'patches new Pods only'], ['InPlaceOrRecreate', 'live cgroup resize ✓']], banner: ['START WITH OFF -> IN-PLACE RESIZE ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'PROGRESSIVE VPA ADOPTION LADDER', '#1E7E45')],
        nodes: [
          N('of', 155, 175, 'cube', 'sky', 'updateMode: Off', 'Recommendation audit', ['1. safest', 'green'], 'Zero disruption; gather 7 days of baseline stats.'),
          N('in', 415, 175, 'cube', 'yellow', 'Initial / Auto', 'On boot / evict+PDB', ['2. cautious', 'warn'], 'Respects PDBs when recreating pods with updated specs.'),
          N('ip', 660, 175, 'pod', 'mint', 'InPlaceOrRecreate', 'K8s 1.33+ Resize', ['3. 0 downtime', 'green'], 'Modifies container cgroups live without killing connections.')
        ],
        edges: [E('of', 'in', 'watch'), E('in', 'ip', 'ok')]
      },
      {
        short: 'HPA + VPA Rule', cat: 'PLATFORM',
        title: 'Golden Coexistence Rule: Pairing VPA With HPA Safely',
        body: ['<strong>Anti-Pattern:</strong> Never point BOTH VPA and HPA at CPU/Memory simultaneously! As VPA shrinks <code>requests.cpu</code>, utilization % artificially spikes, tricking HPA into scaling out—causing a runaway feedback loop.', '<strong>Solution:</strong> Run VPA (`controlledValues: RequestsOnly`) on CPU/Memory while HPA scales on <strong>HTTP RPS / Queue Lag</strong> (Custom/External Metrics)!'],
        yamlTitle: 'YAML · Safe VPA Config Alongside Custom-Metric HPA',
        yaml: `resourcePolicy:\n  containerPolicies:\n  - containerName: "*"\n    controlledValues: RequestsOnly  # Don't clash with HPA or limits\n    minAllowed: { cpu: 50m, memory: 64Mi }`,
        tip: 'CNPE Exam Classic: Horizontal scaling (HPA) reacts to traffic RPS/queues; Vertical sizing (VPA) eliminates idle per-Pod waste.',
        metrics: [['CPU + CPU CLASH', 'Tug-of-War Loop ✕', 'red'], ['VPA METRICS', 'CPU / RAM Requests', 'green'], ['HPA METRIC', 'HTTP RPS / Lag', 'purple'], ['EXAM TRACK', 'CNPE · CKA', 'purple']],
        trace: { title: 'HPA + VPA SEPARATION', rows: [['VPA owns', 'Pod CPU/RAM RequestsOnly'], ['HPA owns', 'Replicas via HTTP RPS'], ['Loop risk', 'ZERO conflict ✓']], banner: ['CLEAN TWO-AXIS ELASTICITY ACHIEVED ✓', 'green'] },
        zones: [Z(70, 38, 685, 275, 'ORTHOGONAL TWO-AXIS AUTOSCALING', '#1E7E45')],
        nodes: [
          N('vp', 180, 112, 'cube', 'lavender', 'VPA Controller', 'CPU / RAM size', ['✓ Y-Axis', 'green'], 'Right-sizes container resource requests cleanly.'),
          N('hp', 180, 245, 'cube', 'sky', 'HPA Controller', 'HTTP RPS replicas', ['✓ X-Axis', 'purple'], 'Scales Pod count cleanly on external/custom RPS.'),
          N('pd', 565, 175, 'cluster', 'mint', 'Production Fleet', 'Right Size × Count', ['✓ optimal $$', 'green'], 'Zero feedback oscillation; maximum bin-packing & SLO safety.')
        ],
        edges: [E('vp', 'pd', 'ok'), E('hp', 'pd', 'watch')]
      }
    ]
  }
});
