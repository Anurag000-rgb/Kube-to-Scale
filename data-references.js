/* =========================================================================
   ENRICHED TOPIC & STEP DESCRIPTIONS + HIDDEN DOC REFERENCES & YOUTUBE LINKS
   ========================================================================= */

const yt = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const TOP_YT = {
  apiPerf: [
    'CNCF: Defusing K8s API Performance Minefield (34m)',
    'https://www.youtube.com/watch?v=SdLLOcNZN5E',
    'Walks through kube-apiserver watch cache sizing, protobuf serialization, list-watch memory spikes, and etcd storage bottlenecks at scale.'
  ],
  apiLifecycle: [
    'Learnk8s: K8s API Request Lifecycle & Server-Side Apply (1h)',
    'https://www.youtube.com/watch?v=VcHngMgOivo',
    'Traces an API write end-to-end from kubectl YAML through AuthN, AuthZ, admission chains, schema validation, and Server-Side Apply field ownership.'
  ],
  authzModes: [
    'VarJosh: Master K8s Authorization Modes & API Server (56m)',
    'https://www.youtube.com/watch?v=DkKc3RCW2BE',
    'Compares RBAC, Webhook, Node, and ABAC authorizers alongside verb-level SubjectAccessReview evaluation inside kube-apiserver.'
  ],
  celAdmission: [
    'Google: Goodbye Webhooks, Hello Native CEL Admission',
    'https://www.youtube.com/watch?v=tt4N1LaTZgo',
    'Demonstrates replacing latency-prone external validating webhooks with in-process ValidatingAdmissionPolicy CEL expressions.'
  ],
  etcdDeep: [
    'CNCF: Deep Dive into etcd — Raft, bbolt & Watch Memory (39m)',
    'https://www.youtube.com/watch?v=DrtdrdwDpZE',
    'Explains etcd Raft leader election, bbolt B+tree storage engine pages, MVCC revision compaction, and defragmentation best practices.'
  ],
  etcdConsensus: [
    'CNCF: Distributed Consensus in etcd & Kubernetes (37m)',
    'https://www.youtube.com/watch?v=n9VKAKwBj_0',
    'Visualizes Raft quorum math (N/2+1), split-vote avoidance, heartbeat timeouts, and how network partitions preserve linearizable reads.'
  ],
  etcdCore: [
    'ContainerDays: Into the Core of K8s — etcd Internals (34m)',
    'https://www.youtube.com/watch?v=YIBQrP1grPE',
    'Breaks down WAL fsync latency, BoltDB freelist contention, and why etcd storage quota alarms lock cluster writes.'
  ],
  etcdProd: [
    'CNCF: Operating etcd with etcdadm in Production (1h)',
    'https://www.youtube.com/watch?v=JcA2gTT5mS0',
    'Covers zero-downtime snapshot backup/restore, member replacement, TLS peer rotation, and periodic compaction in production clusters.'
  ],
  k8sArch: [
    'KodeKloud: etcd, Schedulers, Managers & Node Components (9m)',
    'https://www.youtube.com/watch?v=klxZke9qbvg',
    'Concise visual walkthrough of how kube-apiserver, scheduler, controller-manager, and node kubelet coordinate Pod scheduling.'
  ],
  k8s6min: [
    'ByteByteGo: Kubernetes Architecture Explained (6m, 2M views)',
    'https://www.youtube.com/watch?v=TlHvYWVUZyc',
    'High-level visual overview of Kubernetes control plane hubs, worker node agents, and declarative cluster state loops.'
  ],
  internals: [
    'USENIX LISA: K8s Internals for Builders & Operators (44m)',
    'https://www.youtube.com/watch?v=3KtEAa7_duA',
    'Deep systems look inside kubelet PodSync loops, CRI container spawning, control loops, and API watch streams.'
  ],
  eviction: [
    'JMMTechnology: Node Pressure Eviction in Kubernetes (12m)',
    'https://www.youtube.com/watch?v=ZIrS-khAXu4',
    'Details kubelet soft/hard eviction signals (memory.available, nodefs.available), eviction grace periods, and pressure taints.'
  ],
  qos: [
    'Anton Putra: Kubernetes Pod QoS Classes Explained (3m)',
    'https://www.youtube.com/watch?v=ka-HItczp2I',
    'Shows how requests vs limits assign Guaranteed, Burstable, and BestEffort classes and control OOM killer eviction ordering.'
  ],
  drain: [
    'Cordon and Drain Nodes Cleanly in Kubernetes (5m)',
    'https://www.youtube.com/watch?v=IHrFubX5WtU',
    'Hands-on walkthrough of cordoning scheduling, draining evicted Pods safely around DaemonSets, and uncordoning nodes.'
  ],
  podLife: [
    'Microsoft Dev: How Pods & Pod Lifecycle Work (8m)',
    'https://www.youtube.com/watch?v=wlYESb124xM',
    'Follows a Pod from Pending scheduling through init containers, ImagePull, startup/readiness/liveness probes, and graceful termination.'
  ],
  deployRs: [
    'Piyush: Deployments, Replication & ReplicaSets Deep Dive (35m)',
    'https://www.youtube.com/watch?v=oe2zjRb51F0',
    'Covers ReplicaSet selector ownership, self-healing Pod replacement, RollingUpdate surge/unavailable budgets, and revision rollbacks.'
  ],
  scaleAll: [
    'Anton Putra: HPA vs VPA vs KEDA vs CA vs Karpenter (15m)',
    'https://www.youtube.com/watch?v=hsJ2qtwoWZw',
    'Compares horizontal Pod scaling, vertical container right-sizing, event-driven KEDA queues, and fast node provisioning with Karpenter.'
  ],
  scaleTool: [
    'DevOps Toolkit: Scaling w/ HPA, VPA, KEDA & CA (26m)',
    'https://www.youtube.com/watch?v=HQY2jgSN6pA',
    'Live benchmarks illustrating when to combine HPA metric formulas, VPA sizing modes, and node autoscalers without thrashing.'
  ],
  hpaVpa: [
    'Piyush: Kubernetes Autoscaling — HPA vs VPA Deep Dive (25m)',
    'https://www.youtube.com/watch?v=afUL5jGoLx0',
    'Walks through the HPA desiredReplicas formula and VPA Recommender, Updater, and Admission Controller architecture.'
  ],
  net30: [
    'CNCF: Understanding Kubernetes Networking in 30 Min (33m)',
    'https://www.youtube.com/watch?v=Mj04QOqAaJ8',
    'Explains root vs Pod network namespaces, pause containers, CNI veth pairs, CoreDNS resolution, and kube-proxy Service routing.'
  ],
  ebpfProxy: [
    'CNCF / Cilium: Replacing kube-proxy & iptables w/ eBPF (35m)',
    'https://www.youtube.com/watch?v=bIRwSIwNHC0',
    'Demonstrates why iptables chains degrade at thousands of Services and how eBPF socket maps achieve O(1) packet forwarding.'
  ],
  gwApi: [
    'Cilium BGP + Gateway API Production Deep Dive (28m)',
    'https://www.youtube.com/watch?v=RR2UTJIOeNk',
    'Deploys GatewayClass, Gateway, and HTTPRoute with traffic splitting, header matching, and BGP load-balancer advertisement.'
  ],
  istioNana: [
    'TechWorld with Nana: Istio & Service Mesh (16m, 832k views)',
    'https://www.youtube.com/watch?v=16fgzklcF7Y',
    'Explains Envoy sidecar injection, automated mTLS certificates, traffic shifting, timeouts, and observability inside a service mesh.'
  ],
  meshCmp: [
    'CNCF: Sidecar-Less Service Mesh — Cilium vs Istio (37m)',
    'https://www.youtube.com/watch?v=91oylZSoYzM',
    'Evaluates per-Pod sidecar resource overhead against shared node L4 proxies and standalone L7 waypoints for zero-trust mTLS.'
  ],
  ambient: [
    'CNCF: Life of a Request in Istio Ambient Mesh (6m)',
    'https://www.youtube.com/watch?v=IVADUaLqJbE',
    'Traces TCP traffic through per-node ztunnel mTLS tunnels and optional Waypoint Envoy L7 policy enforcement.'
  ],
  falcoCks: [
    'Kubesimplify: Falco Runtime Security & CKS Scenarios (21m)',
    'https://www.youtube.com/watch?v=x_klpjAilMs',
    'Writes and triggers real eBPF Falco runtime rules detecting container shells, /etc secret reads, and unexpected outbound connections.'
  ],
  supply: [
    'CNCF: Supply Chain Security w/ Sigstore & Kyverno (25m)',
    'https://www.youtube.com/watch?v=gBJ169_il6k',
    'Implements keyless OCI image signing with Cosign, Rekor transparency logs, SBOM attestation, and Kyverno admission checks.'
  ],
  opaGate: [
    'Kubernetes Security: OPA Gatekeeper Deep Dive (36m)',
    'https://www.youtube.com/watch?v=ocSgbSCX34M',
    'Builds ConstraintTemplates and Rego policies blocking privileged containers, :latest tags, and non-compliant Pod manifests.'
  ],
  helmKust: [
    'CNCF: GitOps Manifests — Helm, Kustomize & Beyond (30m)',
    'https://www.youtube.com/watch?v=Tmiyf78sC24',
    'Compares Helm parameterized templating vs Kustomize base-and-overlay patches and modern declarative controller composition.'
  ],
  fluxTim: [
    'Techno Tim: Flux v2 GitOps Tutorial (12m, 107k views)',
    'https://www.youtube.com/watch?v=PFLimPh5-wo',
    'Sets up modular Flux Source, Kustomize, and Helm controllers continuously reconciling cluster state from Git.'
  ],
  argoProd: [
    'DevOps Toolkit: Argo CD Production GitOps (22m, 67k views)',
    'https://www.youtube.com/watch?v=vpWQeoaiRM4',
    'Covers 3-way Git-vs-cluster diffs, automated drift self-healing, AppProject guardrails, and Git-backed instant rollbacks.'
  ],
  opNana: [
    'TechWorld with Nana: Kubernetes Operators Explained (10m)',
    'https://www.youtube.com/watch?v=ha3LjlD6g7g',
    'Introduces why stateful software relies on CRDs and custom reconciliation loops encoding human DBA operational runbooks.'
  ],
  leader: [
    'CNCF: Kubernetes Leader Election for Fun & Profit (21m)',
    'https://www.youtube.com/watch?v=WslJyYb81w8',
    'Details Lease-based distributed locks, renew deadlines, self-fencing on expiration, and split-brain prevention in HA controllers.'
  ],
  opGo: [
    'Write a K8s Operator in Go w/ controller-runtime (47m)',
    'https://www.youtube.com/watch?v=sF2Z8IDshRA',
    'Walks through scaffolding CRDs, watching resources with SharedInformers, implementing Reconcile(), and updating Status.'
  ],
  tpIntro: [
    'CNCF: Telepresence Fast Local-to-Remote Dev (27m)',
    'https://www.youtube.com/watch?v=9eyHSjbZwR8',
    'Demonstrates bridging a local workstation into remote cluster DNS and services so developers iterate without slow Docker rebuilds.'
  ],
  tpTools: [
    'CNCF: Use Favorite Dev Tools w/ Telepresence (41m)',
    'https://www.youtube.com/watch?v=JyZfWMmeVlU',
    'Explains Traffic Manager, intercept agents, header-isolated traffic routing, and automatic env/volume syncing.'
  ],
  tpDebug: [
    'JetBrains: Debugging Kubernetes Pods w/ Telepresence (8m)',
    'https://www.youtube.com/watch?v=3khaEf7bmWI',
    'Routes live cluster traffic intercepts straight into local IDE breakpoints while accessing in-cluster databases seamlessly.'
  ],
  lfEbpfSec: [
    'Linux Foundation / CNCF: eBPF-Based Kubernetes Security',
    'https://www.youtube.com/watch?v=Ctyw54Gs81I',
    'Covers kernel eBPF syscall visibility, runtime policy enforcement, and preventing container escape paths in Kubernetes clusters.'
  ],
  vivekFinalizer: [
    'Vivek Singh: Kubernetes Finalizers Explained & Implemented',
    'https://www.youtube.com/watch?v=UYAQNFRaj30',
    'Explains how finalizers block immediate API deletion until external cleanup completes and walks through implementing finalizer logic in Go.'
  ],
  gvrCksList: [
    'Learn with GVR: CKS Complete Hands-On Security Playlist',
    'https://www.youtube.com/playlist?list=PLFkEchqXDZx6Bw3B2NRVc499j1TavjOvm',
    'Full CKS series covering kube-bench CIS benchmarks, Falco runtime alerting, SecurityContext hardening, and cluster setup security.'
  ],
  varjoshAuthn: [
    'Cloud With VarJosh: ServiceAccounts & Authentication (CKA)',
    yt('Cloud With VarJosh MASTER Kubernetes Service Accounts Authentication CKA'),
    'Walks through human vs ServiceAccount authentication, bound token scoping, and API authentication flows in Kubernetes.'
  ],
  varjoshEtcd: [
    'Cloud With VarJosh: Understanding etcd Trade-Offs',
    yt('Cloud With VarJosh Understanding etcd Trade-Offs Backbone of Kubernetes'),
    'Breaks down etcd quorum consistency guarantees, storage limits, and control plane trade-offs in production clusters.'
  ],
  varjoshTaints: [
    'Cloud With VarJosh: Taints, Tolerations vs Node Affinity',
    yt('Cloud With VarJosh Mastering Kubernetes Taints Tolerations Node Affinity CKA'),
    'Contrasts repulsion via Taints & Tolerations with attraction via NodeAffinity rules and demonstrates combined placement patterns.'
  ],
  varjoshPriority: [
    'Cloud With VarJosh: Pod Priority & Preemption in K8s',
    yt('Cloud With VarJosh Pod Priority PriorityClass Preemption Kubernetes CKA'),
    'Demonstrates scheduling queue prioritization and how high-priority PriorityClass Pods safely preempt lower-priority workloads.'
  ],
  varjoshDns: [
    'Cloud With VarJosh: How CoreDNS Works in Kubernetes',
    yt('Cloud With VarJosh How DNS Works in Kubernetes CoreDNS FQDNs CKA'),
    'Traces CoreDNS resolution paths, Pod resolv.conf search domains, and FQDN lookup behavior for ClusterIP and headless services.'
  ],
  varjoshTroubleshoot: [
    'Cloud With VarJosh: Control Plane Troubleshooting Guide',
    yt('Cloud With VarJosh Kubernetes Control Plane Troubleshooting Guide CKA'),
    'Systematic debugging of broken static Pods, misconfigured kube-apiserver flags, stalled schedulers, and etcd outages.'
  ],
  piyushPods: [
    'Tech Tutorials with Piyush: Pods & Imperative vs Declarative YAML',
    yt('Tech Tutorials with Piyush Pod In Kubernetes Explained YAML Tutorial'),
    'Covers Pod internals, container lifecycle inspection, declarative YAML manifests, and day-one Pod troubleshooting.'
  ],
  piyushStateful: [
    'Tech Tutorials with Piyush: Kubernetes StatefulSets & Databases',
    yt('Tech Tutorials with Piyush Kubernetes Statefulset Tutorial Databases Storage'),
    'Walks through ordered StatefulSet ordinals, headless DNS stability, and 1:1 PersistentVolumeClaim retention for databases.'
  ],
  piyushDaemonJob: [
    'Tech Tutorials with Piyush: DaemonSets, Jobs & CronJobs',
    yt('Tech Tutorials with Piyush Kubernetes Daemonset Job Cronjob Explained'),
    'Contrasts per-node DaemonSet agent scheduling against finite run-to-completion batch Jobs and recurring CronJobs.'
  ],
  piyushStorage: [
    'Tech Tutorials with Piyush: PV, PVC & StorageClasses Explained',
    yt('Tech Tutorials with Piyush Kubernetes Volumes PV PVC Storage Class'),
    'Explains PersistentVolumes, dynamic StorageClass claims, access modes, and reclaim policies end-to-end.'
  ],
  piyushIngressGw: [
    'Tech Tutorials with Piyush: Ingress vs Gateway API Tutorial',
    yt('Tech Tutorials with Piyush Kubernetes Gateway API Ingress vs Gateway API'),
    'Compares traditional NGINX Ingress routing rules with next-generation GatewayClass, Gateway, and HTTPRoute objects.'
  ],
  piyushNetPol: [
    'Tech Tutorials with Piyush: Kubernetes Network Policies Explained',
    yt('Tech Tutorials with Piyush Kubernetes Network Policies Explained Day 26'),
    'Hands-on ingress/egress YAML walkthrough isolating Pod-to-Pod traffic and verifying allowed/blocked paths.'
  ],
  kodeKubeadm: [
    'KodeKloud: Setup Kubernetes Cluster w/ kubeadm',
    yt('KodeKloud Setup Kubernetes kubeadm Absolute Beginners'),
    'Step-by-step demonstration of node preparation, kubeadm init bootstrapping, CNI networking, and worker node join workflows.'
  ],
  kodeHelm: [
    'KodeKloud: What is Helm? Charts & Release Concepts Explained',
    yt('KodeKloud What is Helm Concepts Explained Kubernetes'),
    'Visualizes Helm templates, values layering, chart repositories, and rollback release history inside Kubernetes.'
  ],
  kodeTaints: [
    'KodeKloud: Taints & Tolerations Visual Walkthrough',
    yt('KodeKloud Kubernetes Taints and Tolerations'),
    'Clearly explains NoSchedule, PreferNoSchedule, and NoExecute semantics using visual scheduling analogies.'
  ],
  vivekClientGo: [
    'Vivek Singh: Basics of client-go Kubernetes Part 1–4',
    yt('Vivek Singh Basics of client-go Kubernetes Informer Cache Queue'),
    'Deep Go walkthrough covering kubeconfig bootstrap, typed clientsets, SharedInformerFactory caches, and rate-limited workqueues.'
  ],
  vivekDynamic: [
    'Vivek Singh: Dynamic Client & Unstructured CR Handling',
    yt('Vivek Singh Kubernetes Dynamic Client Unstructured Custom Resources'),
    'Demonstrates reading and manipulating arbitrary CRDs at runtime without compile-time generated typed Go clientsets.'
  ],
  vivekWebhooks: [
    'Vivek Singh: Mutating & Validating Admission Webhooks in Go',
    yt('Vivek Singh Admission Controllers Mutating Validating Webhook Kubernetes'),
    'Builds custom HTTPS admission webhook servers in Go handling AdmissionReview requests cleanly.'
  ],
  vivekOperator: [
    'Vivek Singh: Writing & Packaging a Kubernetes Operator',
    yt('Vivek Singh Writing K8S Operator Kluster Informer CRD RBAC'),
    'Traces generating CRDs and clientsets, writing custom controllers, packaging operator containers, and configuring minimal RBAC.'
  ],
  ardanConcurrency: [
    'Ardan Labs: Go Concurrency, Context & Graceful SIGTERM Shutdown',
    yt('Ardan Labs Go Web Services Kubernetes Concurrency Graceful Shutdown Context'),
    'Bill Kennedy explains Go context cancellation trees, managing goroutines safely, and draining HTTP servers on SIGTERM.'
  ],
  fccOperator: [
    'freeCodeCamp: Build Kubernetes Operators w/ Go & Kubebuilder',
    yt('freeCodeCamp Build Your Own Kubernetes Operators Go Kubebuilder'),
    'Full hands-on course building custom controllers and Go operators with Kubebuilder, controller-runtime, and real cloud resources.'
  ],
  fccBeauCka: [
    'freeCodeCamp / Beau Carnes: Complete CKA Exam Course',
    yt('freeCodeCamp Beau Carnes Certified Kubernetes Administrator CKA'),
    'Structured Kubernetes cluster administration, scheduling, networking, TLS, and exam troubleshooting walkthrough.'
  ],
  killerCks: [
    'KillerShell: CKS Scenario Breakdowns (AppArmor, Seccomp & Upgrades)',
    yt('KillerShell CKS Question Breakdown AppArmor Seccomp Upgrade'),
    'Practical simulator walkthroughs solving real CKS AppArmor profile loading, syscall confinement, and cluster upgrade tasks.'
  ],
  cyberCks: [
    'CyberSecure86: CKS Hardening, Isolation & Exam Guide',
    yt('CyberSecure86 CKS Kubernetes Security Hardening Isolation'),
    'Covers high-weight CKS hardening domains, Cilium pod-to-pod encryption, sandboxing, and last-mile security checklists.'
  ],
  lfFundamentals: [
    'Linux Foundation & CNCF: Kubernetes & Containers Fundamentals',
    yt('Linux Foundation CNCF Kubernetes Containers Fundamentals cgroups'),
    'Official foundation training covering container Linux kernel namespaces, cgroups resource isolation, and cluster fundamentals.'
  ],
  kubesimplifyCks: [
    'Kubesimplify: CKS & Cloud-Native Deep Dives (@kubesimplify)',
    yt('Kubesimplify Kubernetes CKS Certification eBPF Gateway API Operators'),
    'Hands-on CNCF & CKS workshops covering eBPF networking, Gateway API routing, supply chain defense, and production operators.'
  ]
};

const MODULE_YT_DEFAULTS = {
  m1:  [TOP_YT.apiPerf, TOP_YT.apiLifecycle, TOP_YT.internals],
  m2:  [TOP_YT.podLife, TOP_YT.deployRs, TOP_YT.internals],
  m3:  [TOP_YT.k8sArch, TOP_YT.eviction, TOP_YT.qos],
  m4:  [TOP_YT.internals, TOP_YT.k8s6min],
  m5:  [TOP_YT.net30, TOP_YT.ebpfProxy, TOP_YT.gwApi],
  m6:  [TOP_YT.falcoCks, TOP_YT.lfEbpfSec, TOP_YT.gvrCksList, TOP_YT.supply],
  m7:  [TOP_YT.celAdmission, TOP_YT.opaGate, TOP_YT.supply],
  m8:  [TOP_YT.helmKust, TOP_YT.argoProd, TOP_YT.fluxTim],
  m9:  [TOP_YT.drain, TOP_YT.etcdProd, TOP_YT.internals],
  m10: [TOP_YT.internals, TOP_YT.apiPerf, TOP_YT.etcdProd],
  m11: [TOP_YT.opNana, TOP_YT.opGo, TOP_YT.vivekFinalizer],
  m12: [TOP_YT.apiPerf, TOP_YT.leader, TOP_YT.etcdConsensus],
  m13: [TOP_YT.scaleAll, TOP_YT.scaleTool, TOP_YT.hpaVpa],
  m14: [TOP_YT.tpIntro, TOP_YT.tpTools, TOP_YT.tpDebug],
  m15: [TOP_YT.opGo, TOP_YT.vivekFinalizer, TOP_YT.opNana],
  m16: [TOP_YT.opNana, TOP_YT.leader],
};

// Direct watch?v= / playlist?list= overrides ONLY (0 search queries here so topic queries come strictly 1-per-topic!)
const LESSON_YT_OVERRIDES = {
  'cp-request-flow': [TOP_YT.apiLifecycle, TOP_YT.apiPerf, TOP_YT.authzModes, TOP_YT.celAdmission],
  'etcd-raft-mvcc': [TOP_YT.etcdDeep, TOP_YT.etcdConsensus, TOP_YT.etcdCore, TOP_YT.etcdProd],
  'kubelet-cri-node': [TOP_YT.internals, TOP_YT.k8sArch],
  'node-lifecycle-conditions': [TOP_YT.eviction, TOP_YT.qos, TOP_YT.drain],
  'pod-lifecycle-stages': [TOP_YT.podLife, TOP_YT.qos, TOP_YT.internals],
  'pods-multicontainer': [TOP_YT.podLife, TOP_YT.net30, TOP_YT.internals],
  'namespaces-quotas': [TOP_YT.authzModes, TOP_YT.qos],
  'replicasets-deployments-deep': [TOP_YT.deployRs, TOP_YT.internals],
  'deployments-rollouts': [TOP_YT.deployRs, TOP_YT.argoProd],
  'stateful-daemon-jobs': [TOP_YT.deployRs, TOP_YT.internals],
  'configmaps-secrets': [TOP_YT.etcdProd, TOP_YT.internals],
  'pv-pvc-csi': [TOP_YT.internals, TOP_YT.k8s6min],
  'services-kubeproxy': [TOP_YT.net30, TOP_YT.ebpfProxy],
  'ingress-controllers': [TOP_YT.net30, TOP_YT.gwApi],
  'ingress-gateway': [TOP_YT.gwApi, TOP_YT.net30],
  'network-policies': [TOP_YT.net30, TOP_YT.lfEbpfSec, TOP_YT.ebpfProxy],
  'coredns-nodelocal': [TOP_YT.net30, TOP_YT.ebpfProxy],
  'service-mesh-istio': [TOP_YT.istioNana, TOP_YT.meshCmp, TOP_YT.ambient],
  'ebpf-cilium-calico-falco': [TOP_YT.ebpfProxy, TOP_YT.lfEbpfSec, TOP_YT.falcoCks],
  'policies-opa-kyverno-cel': [TOP_YT.celAdmission, TOP_YT.opaGate, TOP_YT.supply],
  'admission-webhooks': [TOP_YT.celAdmission, TOP_YT.opaGate, TOP_YT.apiLifecycle],
  'cks-cis-kubebench': [TOP_YT.gvrCksList, TOP_YT.etcdProd],
  'cks-os-hardening': [TOP_YT.gvrCksList, TOP_YT.falcoCks],
  'cks-imds-metadata': [TOP_YT.lfEbpfSec, TOP_YT.ebpfProxy],
  'cks-auditing-ciphers': [TOP_YT.gvrCksList, TOP_YT.apiLifecycle],
  'cks-seccomp-apparmor-tracee': [TOP_YT.lfEbpfSec, TOP_YT.gvrCksList, TOP_YT.falcoCks],
  'cks-runtimes-gvisor-kata': [TOP_YT.lfEbpfSec, TOP_YT.falcoCks],
  'cks-supply-chain': [TOP_YT.supply, TOP_YT.falcoCks],
  'gitops-argocd': [TOP_YT.argoProd, TOP_YT.helmKust],
  'helm-charts-advanced': [TOP_YT.helmKust, TOP_YT.argoProd],
  'kustomize-overlays-transformers': [TOP_YT.helmKust, TOP_YT.fluxTim],
  'gitops-appsets-flux': [TOP_YT.fluxTim, TOP_YT.argoProd],
  'leader-election': [TOP_YT.leader, TOP_YT.opNana],
  'hub-watch-cache': [TOP_YT.apiPerf, TOP_YT.etcdDeep],
  'hpa-deep-dive': [TOP_YT.scaleAll, TOP_YT.hpaVpa],
  'vpa-deep-dive': [TOP_YT.hpaVpa, TOP_YT.scaleTool],
  'autoscaling-karpenter': [TOP_YT.scaleAll, TOP_YT.scaleTool],
  'authn-serviceaccounts': [TOP_YT.authzModes, TOP_YT.apiLifecycle],
  'rbac-authz': [TOP_YT.authzModes, TOP_YT.apiLifecycle],
  'taints-tolerations': [TOP_YT.eviction, TOP_YT.k8sArch],
  'labels-selectors-affinity': [TOP_YT.k8sArch, TOP_YT.k8s6min],
  'priority-preemption': [TOP_YT.qos, TOP_YT.k8sArch],
  'static-pods': [TOP_YT.internals, TOP_YT.k8sArch],
  'tls-cluster-pki': [TOP_YT.authzModes, TOP_YT.etcdProd],
  'all-failure-modes': [TOP_YT.drain, TOP_YT.etcdProd],
  'cluster-maintenance': [TOP_YT.drain, TOP_YT.eviction],
  'managed-vs-selfmanaged': [TOP_YT.k8s6min, TOP_YT.internals],
  'topology-single-ha-multicluster': [TOP_YT.etcdConsensus, TOP_YT.etcdProd],
  'demo-kubeadm-eks-install': [TOP_YT.internals, TOP_YT.k8sArch],
  'demo-cluster-upgrade': [TOP_YT.drain, TOP_YT.etcdProd],
  'demo-add-user-kubeconfig': [TOP_YT.authzModes, TOP_YT.apiLifecycle],
  'client-go-scratch': [TOP_YT.opGo, TOP_YT.internals],
  'informers-workqueue': [TOP_YT.opGo, TOP_YT.apiPerf],
  'controllers-operators': [TOP_YT.opNana, TOP_YT.opGo, TOP_YT.vivekFinalizer],
  'finalizers-cleanup': [TOP_YT.vivekFinalizer, TOP_YT.opGo],
  'kubebuilder-scaffolding': [TOP_YT.opGo, TOP_YT.celAdmission],
  'reconciler-ownerrefs': [TOP_YT.opGo, TOP_YT.opNana],
  'webhooks-multiversion': [TOP_YT.celAdmission, TOP_YT.opGo],
  'envtest-concurrency': [TOP_YT.opGo, TOP_YT.apiLifecycle],
  'olm-classic-v0': [TOP_YT.opNana, TOP_YT.supply],
  'olm-v1-architecture': [TOP_YT.opNana, TOP_YT.argoProd],
  'production-ha-observability': [TOP_YT.leader, TOP_YT.opGo],
  'upgrades-capability-model': [TOP_YT.opNana, TOP_YT.argoProd]
};

const LESSON_REFS = {
  'cp-request-flow': {
    topicDesc: 'Every cluster mutation passes synchronously through kube-apiserver’s authentication, authorization, and admission gates before etcd commits it and controllers react asynchronously.',
    refs: [
      ['Kubernetes API Server Overview', 'https://kubernetes.io/docs/concepts/overview/components/#kube-apiserver'],
      ['API Access Control Pipeline', 'https://kubernetes.io/docs/concepts/security/controlling-access/']
    ],
    videos: [
      ["freeCodeCamp / CNCF: K8s API Request Flow & Control Plane", yt("CNCF freeCodeCamp kubernetes control plane apiserver request lifecycle"), "Traces kubectl writes through AuthN, RBAC AuthZ, mutating/validating admission, etcd commit, and scheduler/kubelet loops."]
    ],
    steps: [
      'kubectl resolves the active context server URL, attaches TLS or bearer credentials, and serializes your manifest into versioned JSON or Protobuf over HTTPS.',
      'Authentication establishes identity cleanly while Authorization checks verbs, API groups, and namespaces—keeping least-privilege enforcement fast and stateless.',
      'Running mutating hooks before validating hooks guarantees every default or injected sidecar is inspected against policy before reaching persistence.',
      'Once etcd persists the serialized object across Raft quorum, kube-apiserver pushes Watch events to all subscribed controllers and kubelets.',
      'kube-scheduler binds Pod.spec.nodeName separately from kubelet startup so scheduling and runtime container creation scale independently.'
    ]
  },
  'etcd-raft-mvcc': {
    topicDesc: 'etcd provides linearizable metadata storage using Raft majority quorum and MVCC revisions so watches never miss state transitions under concurrent updates.',
    refs: [
      ['Operating etcd Clusters for Kubernetes', 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/'],
      ['etcd Official Architecture Docs', 'https://etcd.io/docs/latest/learning/api/']
    ],
    videos: [
      ["Cloud With VarJosh: Understanding etcd Trade-Offs & Raft MVCC", yt("Cloud With VarJosh kubernetes etcd trade-offs raft MVCC quorum"), "Breaks down Raft quorum sizing, WAL fsync durability, MVCC resourceVersion revisions, and optimistic concurrency."]
    ],
    steps: [
      'Odd cluster sizes maximize fault tolerance per node because Raft quorum requires strictly more than half the configured voting members.',
      'Sequential fsync latency on etcd’s WAL disk directly bounds API write throughput and heartbeat stability across control-plane peers.',
      'Monotonic MVCC revisions allow informers to reconnect and resume incremental watches without full-cluster list scans unless compacted.',
      'Optimistic concurrency control shifts retry responsibility to clients via resourceVersion checks, preventing distributed write locks.'
    ]
  },
  'kubelet-cri-node': {
    topicDesc: 'kubelet bridges desired API state and Linux host execution by driving containerd over CRI gRPC, enforcing cgroups v2 budgets, and maintaining node Leases.',
    refs: [
      ['kubelet Component Reference', 'https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/'],
      ['Container Runtime Interface (CRI)', 'https://kubernetes.io/docs/concepts/architecture/cri/']
    ],
    videos: [
      ["Linux Foundation & CNCF: Kubelet, CRI & cgroups v2 Internals", yt("Linux Foundation CNCF kubelet CRI containerd cgroups v2 pod sandbox"), "Explains kubelet PLEG sync loops, CRI containerd pause sandboxes, Linux namespaces, and cgroups v2 limits."]
    ],
    steps: [
      'kubelet reconciles PodSpecs from both kube-apiserver watches and local static manifest files into a single Pod lifecycle loop.',
      'The pause sandbox holds Linux network and IPC namespaces open even if application containers crash and restart inside the Pod.',
      'cgroups enforce CPU bandwidth throttling cleanly while exceeding memory triggers immediate kernel SIGKILL (Exit 137) to protect the host.',
      'Moving heartbeats to compact Lease objects reduces etcd write load while preserving fast NotReady failure detection.'
    ]
  },
  'node-lifecycle-conditions': {
    topicDesc: 'Understanding Node Allocatable headroom, Pressure Conditions, QoS eviction ordering, and PDB-aware node draining keeps production clusters stable under failure.',
    refs: [
      ['Nodes Architecture & Conditions', 'https://kubernetes.io/docs/concepts/architecture/nodes/'],
      ['Node-Pressure Eviction', 'https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/']
    ],
    videos: [
      ["Kubernetes Node Allocatable, Conditions, QoS & Drain Walkthrough", yt("KodeKloud Cloud With VarJosh kubernetes node pressure QoS eviction drain PDB"), "Covers Capacity vs Allocatable reservations, pressure conditions, QoS eviction ordering, and PDB-safe drains."]
    ],
    steps: [
      'Reserving system and kubelet CPU/memory guarantees host SSH and CRI daemons remain responsive even when workloads saturate user space.',
      'Node Conditions translate disk, memory, PID, and network health directly into scheduler taints before workloads degrade further.',
      'Setting requests equal to limits yields Guaranteed QoS, placing critical services last in kubelet’s node-pressure eviction queue.',
      'Unlike raw pod deletion, kubectl drain routes through the Eviction API so PodDisruptionBudgets protect live availability during upgrades.'
    ]
  },
  'static-pods': {
    topicDesc: 'Static Pods allow kubelet to bootstrap and self-heal control-plane daemons directly from host disk manifests before an API server even exists.',
    refs: [
      ['Create Static Pods', 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/']
    ],
    videos: [
      ["Static Pods & Mirror Pods in kubeadm", yt("Kubernetes static pods /etc/kubernetes/manifests CKA"), "Focused walkthrough on Static Pods & Mirror Pods in kubeadm — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Because kubelet owns static manifests locally, editing /etc/kubernetes/manifests triggers an in-place container restart without kubectl.',
      'kubeadm bootstraps kube-apiserver, controller-manager, scheduler, and etcd as Static Pods to break circular cluster dependencies.'
    ]
  },
  'tls-cluster-pki': {
    topicDesc: 'Kubernetes relies on three distinct Certificate Authorities and short-lived X.509 client/server certs to establish zero-trust mTLS between every cluster binary.',
    refs: [
      ['PKI Certificates and Requirements', 'https://kubernetes.io/docs/setup/best-practices/certificates/'],
      ['Certificate Management with kubeadm', 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/']
    ],
    videos: [
      ["Kubernetes TLS & PKI Certificates Demystified", yt("Kubernetes PKI certificates kubeadm CA CKA"), "Focused walkthrough on Kubernetes TLS & PKI Certificates Demystified — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Separating cluster, etcd, and front-proxy CAs isolates trust boundaries so aggregating metrics extensions cannot forge core identities.',
      'Proactive kubeadm cert check-expiration checks and kubelet rotateCertificates prevent sudden cluster-wide 1-year certificate outages.'
    ]
  },
  'pod-lifecycle-stages': {
    topicDesc: 'Every Pod advances through well-defined Phases and Container States controlled by Init hooks, three distinct Probes, and a parallel termination timer.',
    refs: [
      ['Pod Lifecycle Documentation', 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/'],
      ['Configure Liveness, Readiness and Startup Probes', 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/']
    ],
    videos: [
      ["Tech Tutorials with Piyush: Pod Phases, Probes & Graceful Stop", yt("Tech Tutorials with Piyush kubernetes pod lifecycle probes preStop SIGTERM"), "Connects the 5 Pod phases, Waiting/Terminated states, Startup/Readiness/Liveness probes, and zero-502 termination."]
    ],
    steps: [
      'Pod Phases summarize overall progress while four granular Conditions pinpoint whether scheduling, init, or readiness stalled.',
      'Checking containerStatuses.lastState.terminated immediately separates OOMKilled (137), app errors (1), and clean SIGTERM (143).',
      'startupProbe shields slow warmups, readinessProbe gates Service traffic, and livenessProbe restarts deadlocked processes.',
      'Because kube-proxy updates and SIGTERM run concurrently, a short preStop sleep absorbs in-flight traffic for zero-502 rollouts.'
    ]
  },
  'pods-multicontainer': {
    topicDesc: 'Co-located containers share one network IP, localhost loopback, and ephemeral volumes—enabling Sidecar, Ambassador, and Adapter patterns without altering app binaries.',
    refs: [
      ['Init Containers & Sidecar Containers', 'https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/'],
      ['Multi-Container Pod Design Patterns', 'https://kubernetes.io/blog/2015/06/the-distributed-system-toolkit-patterns/']
    ],
    videos: [
      ["Tech Tutorials with Piyush: Pods, Init, Sidecar & Shutdown", yt("Tech Tutorials with Piyush kubernetes pods init containers sidecar preStop"), "Covers Pod shared namespaces, sequential init containers, native sidecars, ambassador/adapter patterns, and graceful termination."]
    ],
    steps: [
      'Shared localhost sockets and emptyDir mounts let tightly coupled helpers communicate at memory speed inside the same Pod.',
      'Init containers enforce strict sequential preconditions—never starting the main app until dependencies pass health checks.',
      'Native Sidecars (initContainers with restartPolicy: Always) start before the app and terminate cleanly after Jobs exit 0.',
      'Ambassador abstracts external routing/TLS while Adapter standardizes logs/metrics without changing legacy app code.',
      'Handling SIGTERM properly inside containers prevents abrupt SIGKILL cuts after terminationGracePeriodSeconds expires.'
    ]
  },
  'namespaces-quotas': {
    topicDesc: 'Namespaces partition cluster teams logically, while ResourceQuotas and LimitRanges prevent noisy neighbors from exhausting shared compute budgets.',
    refs: [
      ['Namespaces & ResourceQuotas', 'https://kubernetes.io/docs/concepts/policy/resource-quotas/'],
      ['Limit Ranges Documentation', 'https://kubernetes.io/docs/concepts/policy/limit-range/']
    ],
    videos: [
      ["Kubernetes Namespaces, ResourceQuotas & LimitRanges", yt("Kubernetes ResourceQuota LimitRange namespaces CKA"), "Focused walkthrough on Kubernetes Namespaces, ResourceQuotas & LimitRanges — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Namespaces scope Pods, Services, and Secrets cleanly while Nodes, PVs, and ClusterRoles operate at global cluster scope.',
      'ResourceQuotas reject over-budget API writes at Admission time—requiring every Pod in that namespace to declare requests/limits.',
      'LimitRanges pair with quotas by injecting safe default container sizes automatically whenever a developer omits resources.'
    ]
  },
  'replicasets-deployments-deep': {
    topicDesc: 'ReplicaSets maintain target Pod counts via label selectors and ownerReferences, while Deployments orchestrate Recreate/RollingUpdate swaps and batched revisions.',
    refs: [
      ['ReplicaSet Documentation', 'https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/'],
      ['Deployments & Strategies', 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/']
    ],
    videos: [
      ["ReplicaSets, Orphan Adoption, Deployment Strategies & Pause", yt("Tech Tutorials with Piyush kubernetes ReplicaSet orphan deployment pause rollback"), "Walks through ReplicaSet reconciliation, --cascade=orphan debugging, Recreate vs RollingUpdate, and rollout pause/resume."]
    ],
    steps: [
      'Set-based matchExpressions give ReplicaSets expressive label matching while watching live Pod health every reconciliation pass.',
      'Always double-check selectors before reusing labels in a shared namespace, and pass --cascade=orphan to keep live Pods untouched.',
      'Choose Recreate only when exclusive disk locks or breaking schema changes forbid old and new versions from coexisting.',
      'Pausing a Deployment accumulates multiple spec changes cleanly so resuming produces one cohesive rollout revision.'
    ]
  },
  'deployments-rollouts': {
    topicDesc: 'Deployments turn risky release swaps into declarative ReplicaSet transitions backed by maxSurge buffers, automated history retention, and instant undo.',
    refs: [
      ['Updating & Rolling Back a Deployment', 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment']
    ],
    videos: [
      ["Kubernetes Deployments, Rollouts & Canaries", yt("Kubernetes Deployment maxSurge maxUnavailable rollback canary"), "Focused walkthrough on Kubernetes Deployments, Rollouts & Canaries — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Deployments manage version history through immutable ReplicaSets rather than mutating running Pod specs directly.',
      'Pairing maxSurge: 1 with maxUnavailable: 0 maintains >=100% healthy serving capacity throughout an entire rollout.',
      'Scaling old ReplicaSets down to zero preserves instant local rollback snapshots via kubectl rollout undo.',
      'Canary splits validate p99 latency and error budgets on a small slice of real traffic before full promotion.'
    ]
  },
  'stateful-daemon-jobs': {
    topicDesc: 'StatefulSets provide sticky ordinals and persistent disks, DaemonSets guarantee per-node agents, and Jobs/CronJobs run finite batch tasks reliably.',
    refs: [
      ['StatefulSets Documentation', 'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/'],
      ['DaemonSets, Jobs & CronJobs', 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/']
    ],
    videos: [
      ["Tech Tutorials with Piyush: StatefulSets, DaemonSets & Jobs", yt("Tech Tutorials with Piyush kubernetes statefulset daemonset job cronjob"), "Walks through StatefulSet ordinals and headless DNS, sticky PVCs, per-node DaemonSets, and batch Jobs/CronJobs."]
    ],
    steps: [
      'Deterministic ordinal names plus Headless Service DNS records let quorum peers locate db-0 and db-1 stably.',
      'volumeClaimTemplates bind each Pod ordinal to its own cloud block volume that follows it across node reschedules.',
      'DaemonSets bypass manual scheduling so newly autoscaled worker nodes automatically receive CNI, log, and eBPF agents.',
      'Setting concurrencyPolicy: Forbid and ttlSecondsAfterFinished keeps recurring CronJobs predictable and etcd clean.',
      'StatefulSet updateStrategy partition flags enable safe ordinal-by-ordinal canary upgrades starting from highest ordinal down.'
    ]
  },
  'labels-selectors-affinity': {
    topicDesc: 'Labels decouple workload identity from infrastructure placement—powering Services, ReplicaSets, nodeSelector constraints, and multi-zone PodAntiAffinity.',
    refs: [
      ['Assigning Pods to Nodes (NodeAffinity)', 'https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/']
    ],
    videos: [
      ["Cloud With VarJosh: Labels, NodeAffinity & PodAntiAffinity", yt("Cloud With VarJosh kubernetes nodeSelector nodeAffinity podAntiAffinity topology"), "Demonstrates equality/set selectors, hard vs soft NodeAffinity, and multi-AZ TopologySpreadConstraints."]
    ],
    steps: [
      'Key-value labels allow orthogonal groupings by app, tier, and version across controllers and network policies.',
      'nodeAffinity extends simple nodeSelector matching with In, NotIn, Gt/Lt, and soft preferred weights.',
      'PodAntiAffinity across topology.kubernetes.io/zone prevents single-zone outages from taking down all replicas.'
    ]
  },
  'taints-tolerations': {
    topicDesc: 'Taints repel workloads from specialized hardware or tainted nodes while Tolerations selectively admit matching Pods—enforcing strict pool boundaries.',
    refs: [
      ['Taints and Tolerations Docs', 'https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/']
    ],
    videos: [
      ["KodeKloud & VarJosh: Taints, Tolerations & Eviction Timing", yt("KodeKloud Cloud With VarJosh kubernetes taints tolerations NoExecute"), "Visualizes NoSchedule, PreferNoSchedule, and NoExecute eviction mechanics alongside automatic node pressure taints."]
    ],
    steps: [
      'Remember that tolerations permit scheduling onto tainted nodes but require nodeAffinity to keep Pods off regular nodes.',
      'NoExecute taints evict already-running Pods after optional tolerationSeconds—powering automatic node failure recovery.'
    ]
  },
  'priority-preemption': {
    topicDesc: 'PriorityClasses order the scheduler queue during resource contention and preempt lower-priority batch Pods cleanly to unblock critical production services.',
    refs: [
      ['Pod Priority and Preemption', 'https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/']
    ],
    videos: [
      ["Cloud With VarJosh: Pod PriorityClass & Preemption", yt("Cloud With VarJosh kubernetes PriorityClass preemption scheduling"), "Explains scheduler priority queues and safe preemption of low-priority workloads under cluster pressure."]
    ],
    steps: [
      'Reserve values >= 1,000,000,000 for Kubernetes system-critical daemons and pick lower integers for custom app tiers.'
    ]
  },
  'configmaps-secrets': {
    topicDesc: 'Decouple runtime configuration and sensitive credentials from container images using ConfigMaps, immutable Secrets, and etcd encryption at rest.',
    refs: [
      ['ConfigMaps & Secrets Docs', 'https://kubernetes.io/docs/concepts/configuration/secret/'],
      ['Encrypting Confidential Data at Rest', 'https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/']
    ],
    videos: [
      ["Kubernetes ConfigMaps, Secrets & etcd Encryption", yt("Kubernetes Secrets encryption at rest etcd ConfigMap"), "Explains etcd distributed consensus, MVCC revisions, snapshots, and production tuning."]
    ],
    steps: [
      'Volume mounts keep secrets off container process environment tables and support atomic updates when directory-mounted.',
      'Avoiding subPath preserves kubelet’s ..data symlink swaps while immutable: true freezes critical production config.',
      'Always rewrite existing Secrets after enabling EncryptionConfiguration because encryption applies strictly on new API writes.'
    ]
  },
  'volumes-storage-plugins': {
    topicDesc: 'Containers are ephemeral by default; Kubernetes volumes bridge shared Pod storage, projected SA tokens, and out-of-tree CSI driver plugins cleanly.',
    refs: [
      ['Kubernetes Storage Volumes', 'https://kubernetes.io/docs/concepts/storage/volumes/'],
      ['Container Storage Interface (CSI)', 'https://kubernetes.io/blog/2019/01/15/container-storage-interface-ga/']
    ],
    videos: [
      ["Kubernetes Volumes & CSI Driver Architecture", yt("Kubernetes CSI volume plugins emptyDir projected"), "Walks through dynamic PVC provisioning, CSI controller/node separation, and Retain policies."]
    ],
    steps: [
      'emptyDir supports Pod-local scratch and IPC sharing while projected volumes bundle bound ServiceAccount JWTs securely.',
      'Out-of-tree CSI sidecars decoupled vendor block/file drivers from core Kubernetes release cycles completely.'
    ]
  },
  'pv-pvc-csi': {
    topicDesc: 'StorageClasses and CSI provisioners automate durable cloud disk creation while WaitForFirstConsumer guarantees zone alignment and PVC expansion prevents downtime.',
    refs: [
      ['Persistent Volumes & StorageClasses', 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/']
    ],
    videos: [
      ["Tech Tutorials with Piyush: PV, PVC, StorageClass & CSI", yt("Tech Tutorials with Piyush kubernetes volumes PV PVC StorageClass CSI"), "Explains dynamic StorageClass WaitForFirstConsumer provisioning, CSI attach/mount flow, and Retain recovery."]
    ],
    steps: [
      'Dynamic provisioning pairs StorageClass templates with WaitForFirstConsumer so disks land in the same AZ as their Pod.',
      'Controller and Node CSI plugins handle Provision, Attach, Stage, and Mount cleanly across cloud and bare-metal clusters.',
      'AccessModes enforce single-node exclusivity (RWO) vs shared cluster filesystem access (RWX) per workload architecture.',
      'Retain policies protect stateful data from accidental PVC deletion while allowVolumeExpansion supports online disk growth.'
    ]
  },
  'services-kubeproxy': {
    topicDesc: 'Services give ephemeral Pods stable ClusterIP DNS identities backed by scalable EndpointSlices and kernel iptables/IPVS or Cilium eBPF datapaths.',
    refs: [
      ['Service & EndpointSlices Docs', 'https://kubernetes.io/docs/concepts/services-networking/service/']
    ],
    videos: [
      ["Cloud With VarJosh: Services, EndpointSlices & kube-proxy", yt("Cloud With VarJosh kubernetes services ClusterIP NodePort EndpointSlices"), "Traces ephemeral Pod IPs to stable ClusterIPs, NodePort/LoadBalancer traffic, EndpointSlices, and iptables vs eBPF."]
    ],
    steps: [
      'Because Pod IPs churn across restarts and autoscaling, Services abstract endpoints behind a permanent virtual IP.',
      'CoreDNS resolves service names to stable ClusterIPs reachable identically from every Pod across all worker nodes.',
      'NodePort reserves host ports while LoadBalancer integrates external cloud L4 listeners directly to healthy nodes.',
      'EndpointSlices shard large endpoint lists into 100-IP chunks—eliminating control-plane bottlenecks at thousands of Pods.',
      'eBPF/IPVS hash lookups maintain O(1) packet forwarding performance where linear iptables chains slow down.'
    ]
  },
  'coredns-nodelocal': {
    topicDesc: 'CoreDNS handles cluster-internal service discovery while NodeLocal DNSCache eliminates conntrack UDP races and ndots:5 external lookup amplification.',
    refs: [
      ['DNS for Services and Pods', 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/'],
      ['Using NodeLocal DNSCache', 'https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/']
    ],
    videos: [
      ["Cloud With VarJosh: CoreDNS, ndots:5 & NodeLocal DNSCache", yt("Cloud With VarJosh kubernetes CoreDNS ndots 5 NodeLocal DNSCache"), "Traces CoreDNS lookup chains, the ndots:5 query amplification trap, and NodeLocal DNSCache conntrack mitigation."]
    ],
    steps: [
      'Lowering ndots or terminating external domains with a dot skips four unnecessary search-suffix queries per connection.',
      'NodeLocal DNSCache answers cached lookups locally over TCP/link-local IPs without saturating CoreDNS or UDP conntrack.'
    ]
  },
  'ingress-controllers': {
    topicDesc: 'Ingress Controllers consolidate HTTP/HTTPS host/path routing, TLS termination, and rewrite rules into a single scalable L7 edge fleet.',
    refs: [
      ['Ingress Controllers Docs', 'https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/']
    ],
    videos: [
      ["Kubernetes Ingress Controllers Explained", yt("Kubernetes Ingress controller NGINX pathType CKA"), "Focused walkthrough on Kubernetes Ingress Controllers Explained — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Sharing one L7 LoadBalancer across dozens of Ingress rules eliminates per-service cloud LB fees and SSL sprawl.',
      'IngressClass separates multi-tenant NGINX/Envoy instances while Exact vs Prefix pathTypes enforce deterministic routing.'
    ]
  },
  'ingress-gateway': {
    topicDesc: 'Gateway API succeeds legacy Ingress with role-oriented GatewayClass, Gateway, and HTTPRoute CRDs—enabling native header matching, weighted splits, and mirroring.',
    refs: [
      ['Kubernetes Gateway API Docs', 'https://gateway-api.sigs.k8s.io/']
    ],
    videos: [
      ["Tech Tutorials with Piyush: Ingress vs Gateway API Tutorial", yt("Tech Tutorials with Piyush kubernetes Ingress vs Gateway API HTTPRoute"), "Compares traditional Ingress controllers against GatewayClass, Gateway, ReferenceGrant, and weighted HTTPRoutes."]
    ],
    steps: [
      'Standard Ingress relies on vendor annotations for timeouts, rewrites, and traffic splitting across controllers.',
      'Gateway API separates infrastructure Gateway ownership from application developer HTTPRoute definitions cleanly.',
      'Role separation prevents app teams from modifying shared TLS listeners while letting them ship route updates independently.',
      'Weighted backends and header predicates power native canary rollouts and A/B experiments without controller-specific hacks.',
      'Traffic mirroring shadows live production requests safely to staging targets without impacting client latency.'
    ]
  },
  'service-mesh-istio': {
    topicDesc: 'Service Meshes bring zero-trust SPIFFE mTLS, L7 retries, and telemetry across microservices—with Istio Ambient Mode cutting sidecar memory overhead dramatically.',
    refs: [
      ['Istio Ambient Mesh Architecture', 'https://istio.io/latest/docs/ambient/architecture/']
    ],
    videos: [
      ["Istio Sidecar vs Ambient Mesh Explained", yt("KubeCon Istio Ambient Mesh ztunnel waypoint"), "Focused walkthrough on Istio Sidecar vs Ambient Mesh Explained — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Automated SPIFFE X.509 rotation encrypts East-West Pod traffic transparently without embedding TLS logic inside apps.',
      'Ambient Mode splits L4 per-node ztunnel encryption from shared L7 Waypoint proxies for huge RAM savings.'
    ]
  },
  'network-policies': {
    topicDesc: 'Kubernetes Pods allow all traffic by default; NetworkPolicies implement zero-trust micro-segmentation across namespaces, Pod labels, and DNS egress.',
    refs: [
      ['Network Policies Documentation', 'https://kubernetes.io/docs/concepts/services-networking/network-policies/']
    ],
    videos: [
      ["Tech Tutorials with Piyush: NetworkPolicies & Zero-Trust", yt("Tech Tutorials with Piyush kubernetes network policies default deny DNS egress"), "Hands-on ingress/egress YAML isolation covering default-deny perimeters, AND/OR selector traps, and CoreDNS egress."]
    ],
    steps: [
      'Without a matching NetworkPolicy, any compromised Pod can scan databases across every namespace freely.',
      'Start every production namespace with default-deny Ingress + Egress policies, then open only explicit service flows.',
      'Remember YAML list semantics: a single array element combines selectors with AND while separate dashes mean OR.',
      'Always permit UDP/TCP port 53 to CoreDNS whenever Egress rules are enabled or service name resolution breaks.'
    ]
  },
  'authn-serviceaccounts': {
    topicDesc: 'Workload identity relies on short-lived, audience-bound ServiceAccount tokens (TokenRequest API) rather than static, unbounded legacy Secret tokens.',
    refs: [
      ['Service Accounts & TokenRequest', 'https://kubernetes.io/docs/concepts/security/service-accounts/']
    ],
    videos: [
      ["Cloud With VarJosh: ServiceAccounts & Authentication (CKA)", yt("Cloud With VarJosh kubernetes ServiceAccounts OIDC bound tokens authn"), "Explains X.509/OIDC human auth, scoped ServiceAccounts, bound projected JWT rotation, and disabling automount."]
    ],
    steps: [
      'Human users authenticate via client certs or external OIDC while workloads receive scoped ServiceAccounts.',
      'Dedicated per-app ServiceAccounts prevent compromised frontends from inheriting cluster-admin privileges.',
      'Projected TokenRequest tokens auto-rotate every hour and bind strictly to the Pod lifecycle and intended audience.',
      'Disabling automountServiceAccountToken blocks unneeded API tokens on Pods that never talk to Kubernetes.'
    ]
  },
  'rbac-authz': {
    topicDesc: 'RBAC pairs Roles and ClusterRoles with Bindings using deny-by-default least-privilege rules across API groups, verbs, and specific resourceNames.',
    refs: [
      ['Using RBAC Authorization', 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/']
    ],
    videos: [
      ["freeCodeCamp / Beau Carnes: Kubernetes RBAC & Least Privilege", yt("freeCodeCamp Beau Carnes kubernetes RBAC Role ClusterRole RoleBinding"), "Breaks down Role vs ClusterRole scoping, ClusterRole+RoleBinding reuse, and auditing escalation paths."]
    ],
    steps: [
      'Verifying exact permissions with kubectl auth can-i --as=... catches subtle misconfigurations before rollout.',
      'Role scopes to a single namespace; ClusterRole spans cluster-wide objects or reusable read-only templates.',
      'Binding a ClusterRole with a namespaced RoleBinding reuses cluster templates safely inside a single namespace.',
      'Never grant wildcard verbs or unrestricted Secrets access—always audit RBAC bindings regularly for escalation vectors.'
    ]
  },
  'cks-cis-kubebench': {
    topicDesc: 'Automated CIS Benchmark scanning with kube-bench identifies exposed insecure ports, weak kubelet auth, and loose PKI file permissions across cluster nodes.',
    refs: [
      ['CIS Kubernetes Benchmark Docs', 'https://www.cisecurity.org/benchmark/kubernetes'],
      ['Aqua Security kube-bench', 'https://github.com/aquasecurity/kube-bench']
    ],
    videos: [
      ["CyberSecure86 & KillerShell: kube-bench & CIS Hardening", yt("CyberSecure86 KillerShell kubernetes kube-bench CIS benchmark CKS"), "Walks through running kube-bench targets on control plane/etcd/nodes and fixing CKS flag and permission findings."]
    ],
    steps: [
      'Run targeted master, etcd, and node checks with kube-bench and fix Static Pod flags directly under /etc/kubernetes/manifests.',
      'Restrict private keys to 0600, lock down etcd data dirs to 0700, and enforce kubelet Webhook authorization.'
    ]
  },
  'cks-os-hardening': {
    topicDesc: 'Cluster security depends on minimal Linux hosts: closing unnecessary TCP ports, blacklisting risky kernel modules, enforcing UFW, and hardening SSH and Docker.',
    refs: [
      ['Securing a Cluster Best Practices', 'https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/']
    ],
    videos: [
      ["KillerShell: CKS OS Hardening (SSH, UFW, Ports & Modules)", yt("KillerShell CyberSecure86 CKS OS hardening SSH UFW kernel modules"), "Covers attack surface minimization: open socket audits, SSH lock-down, UFW rules, and disabling unused modules."]
    ],
    steps: [
      'Auditing listening sockets via ss -tulnp and unloading obscure kernel network protocols shrinks root escalation paths.',
      'Always allow SSH/API/Kubelet firewall ports before enabling UFW and keep Docker daemon bound strictly to root socket.'
    ]
  },
  'cks-auditing-ciphers': {
    topicDesc: 'Kubernetes API Audit Policies capture who changed what without leaking Secret payloads, while modern TLS cipher restrictions block weak crypto suites.',
    refs: [
      ['Kubernetes Auditing Documentation', 'https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/']
    ],
    videos: [
      ["KillerShell: Kubernetes Audit Policy & Control Plane Ciphers", yt("KillerShell kubernetes audit policy levels secrets CKS"), "Configures AuditPolicy stages/levels (None for Secrets, Metadata/RequestResponse for workloads) cleanly."]
    ],
    steps: [
      'Order audit policy rules from most specific to broadest—logging Secrets strictly at Metadata level so credentials stay redacted.'
    ]
  },
  'cks-imds-metadata': {
    topicDesc: 'Cloud instance metadata endpoints (169.254.169.254) expose node IAM tokens unless blocked by Egress NetworkPolicies and IMDSv2 hop limits.',
    refs: [
      ['Restricting Cloud Metadata Access', 'https://kubernetes.io/docs/concepts/services-networking/network-policies/']
    ],
    videos: [
      ["CyberSecure86 & Kubesimplify: Blocking Cloud IMDS SSRF", yt("CyberSecure86 Kubesimplify kubernetes block IMDS 169.254.169.254 CKS"), "Shows NetworkPolicy ipBlock rules protecting node cloud credentials from compromised Pod SSRF probes."]
    ],
    steps: [
      'Using ipBlock except: [169.254.169.254/32] preserves general internet egress while blackholing cloud metadata SSRF.'
    ]
  },
  'admission-webhooks': {
    topicDesc: 'Admission controllers govern API writes via Mutating hooks, OpenAPI schema checks, Validating webhooks, and ultra-fast in-process CEL policies.',
    refs: [
      ['Dynamic Admission Control', 'https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/'],
      ['ValidatingAdmissionPolicy (CEL)', 'https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/']
    ],
    videos: [
      ["Kubernetes Admission Webhooks & CEL Policies", yt("Kubernetes Mutating Validating Admission Webhook CEL"), "Focused walkthrough on Kubernetes Admission Webhooks & CEL Policies — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'API writes run MutatingAdmission first so Validating webhooks inspect the final mutated manifest.',
      'Mutating webhooks inject Envoy sidecars, labels, or default security settings transparently via JSON Patch.',
      'OpenAPI v3 structural schemas reject malformed custom fields before reaching etcd.',
      'External validating webhooks enforce custom organizational rules and image trust checks with fail-closed options.',
      'ValidatingAdmissionPolicy runs CEL expressions directly inside kube-apiserver at sub-millisecond latency without extra webhook Pods.'
    ]
  },
  'policies-opa-kyverno-cel': {
    topicDesc: 'Compare Rego-based OPA Gatekeeper, Kubernetes-native YAML Kyverno, and built-in ValidatingAdmissionPolicy CEL for cluster policy-as-code.',
    refs: [
      ['Kyverno Official Docs', 'https://kyverno.io/docs/'],
      ['OPA Gatekeeper Docs', 'https://open-policy-agent.github.io/gatekeeper/website/docs/']
    ],
    videos: [
      ["OPA Gatekeeper vs Kyverno vs Kubernetes CEL", yt("OPA Gatekeeper vs Kyverno vs ValidatingAdmissionPolicy CEL"), "Focused walkthrough on OPA Gatekeeper vs Kyverno vs Kubernetes CEL — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Match policy engines to team workflows: CEL for zero-infra rules, Kyverno for YAML mutation/generation, OPA for cross-stack Rego.'
    ]
  },
  'ebpf-cilium-calico-falco': {
    topicDesc: 'eBPF attaches verified telemetry and L3–L7 enforcement hooks straight inside the Linux kernel—powering Cilium CNI, Hubble observability, and Falco intrusion alerts.',
    refs: [
      ['Cilium eBPF Architecture', 'https://docs.cilium.io/en/stable/overview/intro/'],
      ['Falco Runtime Security Docs', 'https://falco.org/docs/']
    ],
    videos: [
      ["KubeCon: eBPF, Cilium CNI & Falco Security", yt("KubeCon Cilium eBPF Hubble Falco Kubernetes"), "Demonstrates real-time eBPF kernel threat detection and CKS runtime security rules."]
    ],
    steps: [
      'Cilium replaces kube-proxy iptables chains with kernel eBPF socket maps and adds L7 identity-aware NetworkPolicies.',
      'Falco watches syscalls in real time to flag unexpected container shells, shadow reads, or outbound crypto miners instantly.'
    ]
  },
  'cks-seccomp-apparmor-tracee': {
    topicDesc: 'Kernel sandboxing shrinks container blast radius via Seccomp syscall allowlists, AppArmor mandatory file profiles, read-only root filesystems, and Tracee profiling.',
    refs: [
      ['Restrict a Container’s Syscalls with seccomp', 'https://kubernetes.io/docs/tutorials/security/seccomp/'],
      ['AppArmor in Kubernetes', 'https://kubernetes.io/docs/tutorials/security/apparmor/']
    ],
    videos: [
      ["KillerShell: CKS Seccomp, AppArmor & Tracee Syscall Defense", yt("KillerShell CKS AppArmor seccomp profile tracee runtime immutability"), "Walks through loading AppArmor profiles, capturing minimal syscalls with Tracee, and enforcing custom seccomp rules."]
    ],
    steps: [
      'Remember localhostProfile paths are strictly relative to /var/lib/kubelet/seccomp/ on worker nodes.',
      'Combining AppArmor profiles with readOnlyRootFilesystem: true prevents attackers from dropping binaries on disk.'
    ]
  },
  'cks-runtimes-gvisor-kata': {
    topicDesc: 'RuntimeClasses swap default shared-kernel runc containers for user-space gVisor kernels or lightweight Kata MicroVMs when running untrusted multi-tenant code.',
    refs: [
      ['Runtime Class Documentation', 'https://kubernetes.io/docs/concepts/containers/runtime-class/']
    ],
    videos: [
      ["CyberSecure86 & Kubesimplify: Sandboxed Runtimes (gVisor & Kata)", yt("CyberSecure86 Kubesimplify kubernetes RuntimeClass gVisor Kata Containers CKS"), "Contrasts shared runc kernels with user-space gVisor (runsc) syscall interception and Kata hardware microVMs."]
    ],
    steps: [
      'Defining a RuntimeClass registers the handler name, while Pod.spec.runtimeClassName activates gVisor or Kata isolation per workload.'
    ]
  },
  'cks-supply-chain': {
    topicDesc: 'Secure containers before deployment by shrinking distroless bases, generating SPDX/CycloneDX SBOMs, scanning CVEs with Trivy, and blocking unsigned images.',
    refs: [
      ['Trivy Vulnerability Scanner', 'https://trivy.dev/latest/'],
      ['ImagePolicyWebhook Admission', 'https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#imagepolicywebhook']
    ],
    videos: [
      ["Kubernetes Supply Chain: SBOM, Trivy & Cosign", yt("Kubernetes SBOM Trivy Cosign ImagePolicyWebhook CKS"), "Focused walkthrough on SBOM, Trivy & Cosign — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Minimal distroless images remove shells and package managers so scanners report dramatically fewer CVEs.',
      'Fail-closed ImagePolicyWebhook (defaultAllow: false) ensures unscanned images never enter production if scanners go offline.'
    ]
  },
  'pod-security-runtime': {
    topicDesc: 'Defense-in-depth runtime hardening combines Pod Security Admission (Privileged/Baseline/Restricted) with drop-ALL capabilities, non-root UIDs, and Seccomp.',
    refs: [
      ['Pod Security Standards & Admission', 'https://kubernetes.io/docs/concepts/security/pod-security-standards/']
    ],
    videos: [
      ["Pod Security Admission (PSA) & SecurityContext", yt("Kubernetes Pod Security Admission Restricted SecurityContext"), "Focused walkthrough on Pod Security Admission (PSA) & SecurityContext — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Pod Security Standards provide three clear tiers so legacy system tools and untrusted app namespaces stay cleanly separated.',
      'Using warn and audit labels first safely uncovers legacy policy violations before flipping enforce=restricted.',
      'Always set runAsNonRoot: true, allowPrivilegeEscalation: false, and drop: ["ALL"] capabilities on application containers.',
      'RuntimeDefault Seccomp filters dozens of hazardous syscalls without needing custom kernel profile maintenance.',
      'Pairing admission enforcement with Falco/Tracee runtime detection ensures bad images are blocked early and breaches are caught live.'
    ]
  },
  'helm-charts-advanced': {
    topicDesc: 'Helm packages versioned Kubernetes releases with Go templates, layered values overrides, pre-upgrade DB hooks, and single-command atomic rollbacks.',
    refs: [
      ['Helm Official Documentation', 'https://helm.sh/docs/']
    ],
    videos: [
      ["KodeKloud: Helm Charts, Values, Lifecycle Hooks & Rollbacks", yt("KodeKloud kubernetes Helm charts values hooks rollback"), "Explains chart template structures, values precedence, pre-upgrade DB migration hooks, and release rollbacks."]
    ],
    steps: [
      'Explicit --set / -f precedence plus helm template --debug catches rendered YAML bugs long before hitting production clusters.',
      'Pre-upgrade hooks run schema migration Jobs cleanly and rollback automatically when paired with helm upgrade --atomic.'
    ]
  },
  'kustomize-overlays-transformers': {
    topicDesc: 'Kustomize customizes template-free base YAML cleanly across dev, staging, and prod overlays using Strategic Merge/JSON patches and hashed generators.',
    refs: [
      ['Kustomize Declarative Management', 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/']
    ],
    videos: [
      ["Kustomize Base, Overlays, Patches & Generators", yt("Kubernetes Kustomize overlays patches configMapGenerator"), "Focused walkthrough on Kustomize Base, Overlays, Patches & Generators — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Keeping shared Deployment structure in base/ avoids copy-paste YAML drift between staging and prod overlays.',
      'configMapGenerator appends immutable content hashes so edits automatically trigger clean Deployment RollingUpdates.'
    ]
  },
  'gitops-argocd': {
    topicDesc: 'Pull-based GitOps removes cluster credentials from CI servers by having ArgoCD continuously reconcile Git HEAD against live cluster state.',
    refs: [
      ['Argo CD Official Documentation', 'https://argo-cd.readthedocs.io/en/stable/']
    ],
    videos: [
      ["GitOps & ArgoCD Architecture Explained", yt("ArgoCD GitOps Kubernetes pull based architecture"), "Focused walkthrough on GitOps & ArgoCD Architecture Explained — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Separating CI image builds from Pull-based CD agents keeps production kubeconfigs securely inside the cluster boundary.',
      'Live 3-way diffing surfaces manual configuration drift immediately as OutOfSync before environments diverge.',
      'Enabling selfHeal: true plus prune: true automatically reverts unauthorized kubectl edits back to audited Git state.',
      'Rolling back via git revert preserves Auto-Sync alignment and full commit audit history without UI-vs-Git fights.'
    ]
  },
  'gitops-appsets-flux': {
    topicDesc: 'Scale GitOps across fleets with ArgoCD ApplicationSets, ordered Sync Waves, and Flux v2 modular Source/Kustomize/Helm controllers.',
    refs: [
      ['ArgoCD ApplicationSet Docs', 'https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/'],
      ['Flux CD Official Docs', 'https://fluxcd.io/flux/']
    ],
    videos: [
      ["ArgoCD ApplicationSets vs Flux v2 Fleet GitOps", yt("ArgoCD ApplicationSet sync waves Flux v2 Kubernetes"), "Focused walkthrough on ArgoCD ApplicationSets vs Flux v2 Fleet GitOps — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'ApplicationSets generate multi-cluster apps dynamically from Git directories or cluster labels while Sync Waves order migrations cleanly.'
    ]
  },
  'cluster-maintenance': {
    topicDesc: 'Zero-downtime cluster upgrades rely on strict version skew rules, orderly cordon/drain execution, PDB protection, and etcd snapshots.',
    refs: [
      ['Safely Drain a Node', 'https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/']
    ],
    videos: [
      ["Kubernetes Cordon, Drain & Cluster Maintenance", yt("Kubernetes cordon drain uncordon PDB CKA"), "Walks through node cordoning, PDB-safe Pod eviction drains, and clean node upgrades."]
    ],
    steps: [
      'Checking PodDisruptionBudgets and etcd snapshots before draining nodes guarantees high availability during OS and K8s patching.'
    ]
  },
  'all-failure-modes': {
    topicDesc: 'Master systematic root-cause triage for Kubernetes failures across scheduling Pending errors, CrashLoop/OOM 137 kills, and broken Control Plane nodes.',
    refs: [
      ['Troubleshooting Clusters & Apps', 'https://kubernetes.io/docs/tasks/debug/debug-application/']
    ],
    videos: [
      ["Cloud With VarJosh & freeCodeCamp: Cluster Failure Triage (CKA)", yt("Cloud With VarJosh freeCodeCamp kubernetes troubleshoot Pending CrashLoopBackOff OOMKilled"), "Systematic triage for Pending, ImagePullBackOff, CrashLoopBackOff, OOMKilled (137), Node NotReady, and etcd outages."]
    ],
    steps: [
      'Events sorted by timestamp immediately distinguish insufficient CPU, PVC binding failures, and missing image pull secrets.',
      'Checking exit codes (137 OOM vs 143 SIGTERM) and EndpointSlices catches silent traffic blackholes in seconds.',
      'When kube-apiserver itself is down, ssh directly to control-plane nodes and inspect /etc/kubernetes/manifests plus crictl logs.'
    ]
  },
  'managed-vs-selfmanaged': {
    topicDesc: 'Compare self-managed kubeadm control planes against cloud-managed EKS, AKS, and GKE planes across upgrade ownership, cost, and compliance.',
    refs: [
      ['Production Environment Setup Options', 'https://kubernetes.io/docs/setup/production-environment/']
    ],
    videos: [
      ["kubeadm vs EKS/GKE/AKS Architecture", yt("Kubernetes kubeadm self managed vs EKS AKS GKE"), "Focused walkthrough on kubeadm vs EKS/GKE/AKS Architecture — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Managed control planes offload etcd HA, quorum backups, and CP upgrades while letting platform teams focus on workloads and CNI.'
    ]
  },
  'topology-single-ha-multicluster': {
    topicDesc: 'Scale Kubernetes reliability from single-master labs to 3-node VIP HA control planes and region-spanning multi-cluster fleets.',
    refs: [
      ['Options for Highly Available Topology', 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/']
    ],
    videos: [
      ["HA Multi-Master Kubernetes & Multi-Cluster Design", yt("Kubernetes HA control plane stacked external etcd multi-cluster"), "Explains etcd distributed consensus, MVCC revisions, snapshots, and production tuning."]
    ],
    steps: [
      'Production HA control planes front three kube-apiserver instances with a VIP/LoadBalancer and 3-member Raft etcd quorum.',
      'Multi-cluster topologies isolate regional blast radii and satisfy strict GDPR/data-residency laws.'
    ]
  },
  'demo-kubeadm-eks-install': {
    topicDesc: 'Walk end-to-end through Linux prerequisites, kubeadm init/join control-plane setup, CNI installation, and declarative managed EKS/GKE creation.',
    refs: [
      ['Creating a cluster with kubeadm', 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/']
    ],
    videos: [
      ["KodeKloud: Setup Kubernetes w/ kubeadm vs Managed EKS/GKE", yt("KodeKloud kubernetes setup kubeadm init join CNI EKS"), "Steps through Linux containerd prerequisites, kubeadm init/join, CNI installation, and managed EKS/GKE comparison."]
    ],
    steps: [
      'Disabling swap and enabling ip_forward + br_netfilter prevents kubelet startup failures during host bootstrap.',
      'Running kubeadm init outputs the exact hashed discovery join token while installing Calico/Cilium brings CoreDNS Ready.',
      'Declarative Terraform or eksctl specs provision VPC subnets, managed control plane endpoints, and IRSA cleanly.'
    ]
  },
  'demo-cluster-upgrade': {
    topicDesc: 'Upgrade self-managed kubeadm clusters safely by adhering to minor-version skew order: kubeadm -> control plane -> drained kubelet/kubectl workers.',
    refs: [
      ['Upgrading kubeadm clusters', 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/']
    ],
    videos: [
      ["KillerShell & KodeKloud: Zero-Downtime Cluster Upgrades", yt("KillerShell KodeKloud kubernetes kubeadm upgrade control plane worker drain"), "Demonstrates version skew verification, kubeadm upgrade apply, and rolling node drains across workers."]
    ],
    steps: [
      'Backing up etcd before running kubeadm upgrade plan ensures fast disaster recovery if a control-plane component stalls.',
      'Upgrading kubeadm first and running upgrade apply on CP-1 before upgrade node on peers preserves Raft health.',
      'Draining each worker sequentially before upgrading kubelet and uncordoning prevents user-facing capacity drops.'
    ]
  },
  'demo-add-user-kubeconfig': {
    topicDesc: 'Onboard developers securely without sharing cluster-admin credentials by signing Kubernetes CSRs and scoping least-privilege RoleBindings.',
    refs: [
      ['Manage TLS Certificates in a Cluster (CSR)', 'https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/']
    ],
    videos: [
      ["Adding a User via CSR & kubeconfig in Kubernetes", yt("Kubernetes CertificateSigningRequest create user kubeconfig RBAC CKA"), "Focused walkthrough on Adding a User via CSR & kubeconfig in Kubernetes — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Ensure the CSR uses signerName kubernetes.io/kube-apiserver-client and matches RBAC RoleBinding subjects on CN/O.',
      'Assembling dedicated contexts via kubectl config set-credentials + set-context locks each developer cleanly to their namespace.'
    ]
  },
  'crds-schema': {
    topicDesc: 'CustomResourceDefinitions extend Kubernetes APIs natively with OpenAPI schemas, CEL immutability rules, status subresources, and version webhooks.',
    refs: [
      ['Extend Kubernetes API with CRDs', 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/']
    ],
    videos: [
      ["Kubernetes CRDs, OpenAPI Schemas & Subresources", yt("Kubernetes CRD OpenAPI validation status subresource"), "Focused walkthrough on Kubernetes CRDs, OpenAPI Schemas & Subresources — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'CRDs automatically gain full kubectl CRUD, RBAC permissions, and Watch APIs as first-class Kubernetes citizens.',
      'Inline CEL x-kubernetes-validations enforce cross-field constraints directly without running extra webhook servers.',
      'Enabling status and scale subresources protects user-authored spec fields and integrates custom resources with HPA.',
      'Conversion webhooks bridge multiple CRD API versions cleanly while transitioning stored resources in etcd.'
    ]
  },
  'controllers-operators': {
    topicDesc: 'Operators encode human SRE playbooks into self-healing SharedInformer + WorkQueue reconciliation loops driven by ownerReferences.',
    refs: [
      ['Kubernetes Operator Pattern', 'https://kubernetes.io/docs/concepts/extend-kubernetes/operator/']
    ],
    videos: [
      ["Vivek Singh & freeCodeCamp: Writing Kubernetes Operators in Go", yt("Vivek Singh freeCodeCamp writing kubernetes operator custom controller CRD RBAC"), "Covers level-triggered Reconcile() design, OwnerReferences, Finalizers, and packaging production operators."]
    ],
    steps: [
      'SharedInformers cache cluster state locally and push only lightweight object keys onto the controller WorkQueue.',
      'WorkQueue rate-limiting and deduplication ensure rapid Pod updates coalesce cleanly without overloading kube-apiserver.',
      'Idempotent Reconcile() functions read current state, compute diff against desired spec, and emit only necessary changes.',
      'Attaching ownerReferences triggers Kubernetes garbage collection automatically whenever a parent CustomResource is deleted.',
      'Operators transform complex stateful provisioning into declarative self-service YAML for application teams.'
    ]
  },
  'level-triggered': {
    topicDesc: 'Level-triggered reconciliation heals missed events and transient outages automatically by evaluating desired vs live state on every periodic resync.',
    refs: [
      ['Controllers Architecture Docs', 'https://kubernetes.io/docs/concepts/architecture/controller/']
    ],
    videos: [
      ["Edge-Triggered vs Level-Triggered Control Loops", yt("Kubernetes level triggered vs edge triggered controller reconciliation"), "Focused walkthrough on Edge-Triggered vs Level-Triggered Control Loops — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Whereas pure edge-triggered queues lose state if a webhook drops, level-triggered controllers observe live reality cleanly.',
      'Periodic informer resync guarantees stale drift self-heals automatically even after prolonged network partitions.',
      'Separating declarative Spec from controller-owned Status avoids infinite reconciliation loops.'
    ]
  },
  'hub-watch-cache': {
    topicDesc: 'Kubernetes’ hub-and-spoke watch cache and API Priority & Fairness (APF) protect etcd from thousands of concurrent controllers.',
    refs: [
      ['API Priority and Fairness', 'https://kubernetes.io/docs/concepts/cluster-administration/flow-control/']
    ],
    videos: [
      ["kube-apiserver Watch Cache & API Priority Fairness", yt("Kubernetes API Priority and Fairness APF watch cache"), "Focused walkthrough on kube-apiserver Watch Cache & API Priority Fairness — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Routing all controllers exclusively through kube-apiserver keeps etcd clean, uniform, and independently scalable.',
      'API server’s in-memory Watch Cache fans out thousands of read watches without touching etcd disk storage.',
      'FlowSchemas and PriorityLevelConfigurations isolate critical node leases from noisy batch LIST floods.'
    ]
  },
  'leader-election': {
    topicDesc: 'Controller high availability uses active/standby Kubernetes Lease locks and self-fencing deadlines to prevent split-brain mutations.',
    refs: [
      ['Coordinated Leader Election / Leases', 'https://kubernetes.io/docs/concepts/architecture/leases/']
    ],
    videos: [
      ["Kubernetes Leader Election & Leases Explained", yt("Kubernetes controller leader election Lease split brain"), "Focused walkthrough on Kubernetes Leader Election & Leases Explained — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Atomic compare-and-swap Lease claims allow only one active controller replica to mutate cluster objects at a time.',
      'Short retryPeriod renewals combined with renewDeadline < leaseDuration guarantee healthy leadership continuity.',
      'Self-fencing on missed renewals prevents paused/partitioned old leaders from waking up and corrupting state.'
    ]
  },
  'hpa-deep-dive': {
    topicDesc: 'HorizontalPodAutoscaler scales replica counts elastically using resource/custom metrics math, ±10% hysteresis deadbands, and v2 behavior stabilization.',
    refs: [
      ['Horizontal Pod Autoscaling Docs', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'],
      ['HPA Walkthrough & Behavior Config', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/']
    ],
    videos: [
      ["HPA v2 Math, Stabilization Windows, Custom Metrics & KEDA", yt("Tech Tutorials with Piyush kubernetes HPA v2 formula stabilization custom metrics KEDA"), "Breaks down HPA desiredReplicas math, 10% tolerance, stabilization windows, Prometheus Adapter, and KEDA."]
    ],
    steps: [
      'Always verify Pod resources.requests exist and inspect kubectl top pods before debugging stuck HPA targets.',
      'Stabilization windows keep scale-down smooth across temporary traffic dips while rate-limiting rapid replica removal.',
      'KEDA unlocks queue-lag triggers and true 0 -> 1 activation where native HPA requires minReplicas >= 1.'
    ]
  },
  'vpa-deep-dive': {
    topicDesc: 'Vertical Pod Autoscaler eliminates CPU/RAM over-provisioning via Recommender, Updater, and Admission controllers—and pairs safely with RPS-based HPA.',
    refs: [
      ['Vertical Pod Autoscaler Docs', 'https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler']
    ],
    videos: [
      ["Kubernetes VPA Explained (Recommender, Updater & Modes)", yt("Kubernetes Vertical Pod Autoscaler VPA Recommender Updater HPA"), "Covers Kubernetes HPA formulas, stabilization windows, VPA sizing, and event-driven KEDA scaling."]
    ],
    steps: [
      'VPA builds historical percentile models and accounts for OOMKilled signals automatically when recommending container bounds.',
      'Always start production rollouts with updateMode: "Off" to review sizing impact before enabling Auto or InPlaceOrRecreate.',
      'Avoid CPU-vs-CPU clashes by delegating resource sizing to VPA RequestsOnly while HPA scales replicas on custom RPS/queues.'
    ]
  },
  'autoscaling-karpenter': {
    topicDesc: 'Combine HPA/KEDA Pod autoscaling with Karpenter node provisioning and FinOps consolidation for sub-minute Spot elastic compute.',
    refs: [
      ['Karpenter Official Documentation', 'https://karpenter.sh/docs/']
    ],
    videos: [
      ["Karpenter vs Cluster Autoscaler & Spot Consolidation", yt("KubeCon Karpenter Kubernetes node autoscaling Spot consolidation"), "Focused walkthrough on Karpenter vs Cluster Autoscaler & Spot Consolidation — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'HPA expands Pod demand first; when cluster CPU fills up, unschedulable Pending Pods signal node-level scalers.',
      'Karpenter skips rigid node groups and provisions exact right-sized Spot SKUs directly from cloud fleet APIs in ~35s.',
      'Automatic consolidation respects PodDisruptionBudgets while draining and terminating idle VMs safely.'
    ]
  },
  'telepresence-architecture-basics': {
    topicDesc: 'Telepresence connects local laptop IDEs directly to remote Kubernetes Services, CoreDNS, and namespaces via Traffic Manager and Traffic Agent.',
    refs: [
      ['Telepresence Official Architecture Docs', 'https://www.telepresence.io/docs/reference/architecture/']
    ],
    videos: [
      ["Telepresence for Kubernetes Quickstart & Demo", yt("Telepresence Kubernetes local development intercept demo"), "Demonstrates intercepting remote cluster services directly to local dev processes and IDEs."]
    ],
    steps: [
      'Running dependencies remotely while debugging one microservice locally slashes laptop RAM drain and build delays.',
      'Traffic Manager bridges cluster Services and CoreDNS over an encrypted tunnel straight to your local daemon.',
      'telepresence connect lets local curl and tests resolve internal .svc.cluster.local hosts seamlessly.'
    ]
  },
  'telepresence-intercept-env-volumes': {
    topicDesc: 'Header-based Telepresence intercepts route only your test requests to localhost while exporting cluster ConfigMaps, Secrets, and mounted volumes safely.',
    refs: [
      ['Telepresence Intercepts & Env/Volumes', 'https://www.telepresence.io/docs/howtos/intercepts/']
    ],
    videos: [
      ["Personal Header Intercepts & Volumes in Telepresence", yt("Telepresence personal intercept http-header env-file mount"), "Demonstrates intercepting remote cluster services directly to local dev processes and IDEs."]
    ],
    steps: [
      'Header-filtered intercepts share staging environments safely with teammates without hijacking all Service traffic.',
      'Exporting remote container env vars into a local .env keeps cloud DB credentials and ConfigMaps synced effortlessly.',
      'SSHFS volume mounts expose remote Secret TLS files and PVCs locally without copying sensitive artifacts manually.'
    ]
  },
  'telepresence-docker-workflow': {
    topicDesc: 'Combine Telepresence --docker-run with containerized builds for identical Linux paths, zero host toolchain clutter, and instant cluster debugging.',
    refs: [
      ['Telepresence with Docker Containers', 'https://www.telepresence.io/docs/howtos/intercepts/#docker-run']
    ],
    videos: [
      ["Telepresence --docker-run Container Workflow", yt("Telepresence docker-run Kubernetes local dev"), "Demonstrates intercepting remote cluster services directly to local dev processes and IDEs."]
    ],
    steps: [
      '--docker-run eliminates macOS path-translation headaches by mounting remote Kubernetes volumes directly at their Linux paths.'
    ]
  },
  'reconciliation-loop': {
    topicDesc: 'The level-triggered Observe→Diff→Act control loop continuously reconciles observed cluster state toward desired state rather than reacting to one-off events.',
    refs: [
      ['Kubernetes Docs: Controllers', 'https://kubernetes.io/docs/concepts/architecture/controller/'],
      ['Kubernetes Docs: Operator Pattern', 'https://kubernetes.io/docs/concepts/extend-kubernetes/operator/']
    ],
    videos: [
      TOP_YT.opNana,
      ["Reconciliation Loop: Level-Triggered Controllers", yt("kubernetes reconciliation loop level triggered controller"), "Focused walkthrough on Level-Triggered Controllers — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Because watches only trigger workqueue wakeups, computing desired-minus-actual every pass heals missed deletes or controller restarts automatically.',
      'Reading cached CR specs and child state locally prevents thundering-herd polling against kube-apiserver and etcd.',
      'Every side effect (including external cloud API calls) should check current state or use deterministic keys so retries never duplicate infrastructure.',
      'Writing observed state back solely to /status without mutating .spec keeps user intent cleanly separated from runtime reality.'
    ]
  },
  'informers-workqueue': {
    topicDesc: 'client-go caching plumbing — Reflector, DeltaFIFO, SharedInformer, and rate-limited WorkQueue — that feeds controllers deduplicated, locally cached events.',
    refs: [
      ['pkg.go.dev: client-go tools/cache', 'https://pkg.go.dev/k8s.io/client-go/tools/cache'],
      ['kubernetes/sample-controller', 'https://github.com/kubernetes/sample-controller']
    ],
    videos: [
      TOP_YT.opGo,
      ["Vivek Singh: Reflector, DeltaFIFO, SharedInformer & WorkQueue", yt("Vivek Singh kubernetes informer cache queue client-go part 4"), "Explains how Reflector LIST+WATCH feeds DeltaFIFO and rate-limited key-only WorkQueues cleanly in Go."]
    ],
    steps: [
      'Reflector executes one baseline LIST with resourceVersion before opening a long-lived HTTP/2 WATCH stream, falling back gracefully on 410 Gone compaction.',
      'Updating the thread-safe Indexer before invoking EventHandlers ensures Reconcile() always sees the newest object state immediately.',
      'Sharing one SharedInformerFactory across multiple controllers cuts API server watch connections and RAM footprints dramatically.',
      'Enqueuing keys cleanly via WorkQueue prevents two workers from racing on the same object while backing off persistent failures.'
    ]
  },
  'crd-anatomy-gvk': {
    topicDesc: 'Anatomy of CustomResourceDefinitions — Group/Version/Kind and GVR mapping, structural OpenAPI v3 schemas, and namespaced vs cluster scope.',
    refs: [
      ['Kubernetes Docs: Custom Resources', 'https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/'],
      ['Kubernetes Docs: CustomResourceDefinitions', 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/']
    ],
    videos: [
      TOP_YT.opNana,
      ["CRD GVK & Structural OpenAPI Schema", yt("kubernetes CRD GVK structural schema openapi"), "Focused walkthrough on CRD GVK & Structural OpenAPI Schema — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Remember GVK maps cleanly onto Go structs (`apiVersion` + `kind`), whereas GVR powers plural REST endpoints and RBAC rules.',
      'Structural OpenAPI v3 schemas prune typos and enforce required bounds synchronously inside kube-apiserver before persistence.',
      'Keep Namespaced CRDs aligned with Namespaced child owners so Garbage Collection never fails across scopes.',
      'Adding `shortNames` and `additionalPrinterColumns` lets platform users inspect CR health immediately with `kubectl get`.'
    ]
  },
  'cr-lifecycle-subresources': {
    topicDesc: 'Custom resource lifecycle via spec/status separation, the /status and /scale subresources, observedGeneration tracking, and standardized status conditions.',
    refs: [
      ['Kubernetes Docs: Status Subresource', 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#status-subresource'],
      ['Kubernetes Docs: API Concepts', 'https://kubernetes.io/docs/reference/using-api/api-concepts/']
    ],
    videos: [
      TOP_YT.opNana,
      ["CRD Status/Scale Subresources & Conditions", yt("kubernetes CRD status scale subresource conditions"), "Focused walkthrough on CRD Status/Scale Subresources & Conditions — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Always write status fields with `r.Status().Update()`—calling `r.Update()` silently drops status edits when `/status` is enabled.',
      'Stamp `status.observedGeneration = cr.Generation` once reconciliation succeeds so GitOps tools know your status isn’t lagging behind spec.',
      'Prefer structured `metav1.Condition` arrays (`Available`, `Progressing`, `Degraded`) over a single Phase string for `kubectl wait` compatibility.',
      'Exposing `/scale` enables native `kubectl scale` and standard Kubernetes HPA autoscaling with zero extra scaling code.'
    ]
  },
  'client-go-scratch': {
    topicDesc: 'Low-level controller wiring with client-go — building a rest.Config, typed vs dynamic clients, informer factories, and running worker goroutines by hand.',
    refs: [
      ['pkg.go.dev: client-go', 'https://pkg.go.dev/k8s.io/client-go'],
      ['kubernetes/sample-controller', 'https://github.com/kubernetes/sample-controller']
    ],
    videos: [
      TOP_YT.opGo,
      ["Vivek Singh: client-go Scratch, Dynamic Client & WorkQueue", yt("Vivek Singh client-go kubernetes dynamic client informer workqueue"), "Hands-on Go walkthrough bootstrapping rest.Config, typed/unstructured clients, SharedInformers, and context shutdown."]
    ],
    steps: [
      'Raise `cfg.QPS` and `cfg.Burst` intentionally when scaling custom controllers across thousands of objects.',
      'Choose Typed clientsets for compile-time CRD safety and reach for Dynamic `Unstructured` clients only for generic cluster-wide tooling.',
      'Always call `cache.WaitForCacheSync` before starting workers so initial reconciles never observe an empty cache.',
      'Propagating `ctx.Done()` into `queue.ShutDown()` lets active goroutines drain cleanly during Pod rolling updates.'
    ]
  },
  'controller-runtime-internals': {
    topicDesc: 'controller-runtime internals — the Manager, the split (cache-backed) client, event predicates, and the Reconcile() request/result contract.',
    refs: [
      ['pkg.go.dev: controller-runtime', 'https://pkg.go.dev/sigs.k8s.io/controller-runtime'],
      ['Kubebuilder Book: Architecture', 'https://book.kubebuilder.io/architecture']
    ],
    videos: [
      TOP_YT.opGo,
      ["controller-runtime Manager, Split Client & Predicates", yt("controller-runtime manager split client predicates"), "Focused walkthrough on controller-runtime Manager, Split Client & Predicates — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Register every core and custom API scheme cleanly on `ctrl.Manager` so `/healthz`, metrics, and leader election start together.',
      'Account for Split Client Watch lag—never re-read a freshly created object in the same `Reconcile()` pass assuming cache visibility.',
      'Attach `GenerationChangedPredicate` early to filter out self-triggered `/status` updates before they ever enter WorkQueue.',
      'Use `Result{RequeueAfter: ...}` instead of `time.Sleep` so worker goroutines remain free to serve other keys.'
    ]
  },
  'kubebuilder-scaffolding': {
    topicDesc: 'Scaffolding a Go operator with the kubebuilder CLI — project/API/webhook generation, kubebuilder markers, controller-gen manifest generation, and the generated Makefile targets.',
    refs: [
      ['Kubebuilder Book: Quick Start', 'https://book.kubebuilder.io/quick-start'],
      ['Kubebuilder Book: Markers Reference', 'https://book.kubebuilder.io/reference/markers']
    ],
    videos: [
      TOP_YT.opGo,
      ["freeCodeCamp & Vivek Singh: Kubebuilder Operators Full Course", yt("freeCodeCamp kubebuilder operator scaffolding markers controller-gen"), "Scaffolds APIs/controllers in two CLI commands, drives CRD/RBAC via markers, and iterates rapidly with make run."]
    ],
    steps: [
      'Keep Go struct types in `api/v1alpha1/` as your single source of truth and avoid hand-editing generated CRD YAML.',
      'Document RBAC permissions directly with `+kubebuilder:rbac` markers above `Reconcile()` for transparent security reviews.',
      'Run `make manifests generate` in CI with `git diff --exit-code` so generated DeepCopy code and CRDs never drift out of sync.',
      'Combine `make install` with `make run` against Kind for rapid sub-2-second local debugging with IDE breakpoints.'
    ]
  },
  'reconciler-ownerrefs': {
    topicDesc: 'Managing child resources from a reconciler — CreateOrUpdate, SetControllerReference for owner references, .Owns() watches, and cascading garbage collection of owned objects.',
    refs: [
      ['Kubernetes Docs: Garbage Collection', 'https://kubernetes.io/docs/concepts/architecture/garbage-collection/'],
      ['Kubebuilder Book: Implementing a Controller', 'https://book.kubebuilder.io/cronjob-tutorial/controller-implementation']
    ],
    videos: [
      TOP_YT.opGo,
      ["OwnerReferences, .Owns() & Cascading GC", yt("kubebuilder ownerreferences owns garbage collection"), "Demonstrates Kubebuilder Go operator scaffolding, CRD markers, and reconciliation workflows."]
    ],
    steps: [
      'Inside `CreateOrUpdate`, mutate only fields your operator owns so cluster-injected defaults stay untouched.',
      'Use `SetControllerReference` (`controller: true`) cleanly so Kubernetes prevents conflicting controllers from claiming the same child.',
      'Declare `.Owns()` watches in `SetupWithManager` to automatically re-reconcile parent CRs whenever child Deployments drift.',
      'Let Kubernetes’ built-in Garbage Collector cascade in-cluster child deletions automatically—reserving Finalizers strictly for external infra.'
    ]
  },
  'finalizers-cleanup': {
    topicDesc: 'Using finalizers and the deletionTimestamp to run external cloud cleanup before an object is removed, and releasing the finalizer so the API server can complete deletion.',
    refs: [
      ['Kubernetes Docs: Finalizers', 'https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/'],
      ['Kubebuilder Book: Using Finalizers', 'https://book.kubebuilder.io/reference/using-finalizers']
    ],
    videos: [
      TOP_YT.opGo,
      ["Finalizers & deletionTimestamp External Cleanup", yt("kubernetes finalizers controller external cleanup"), "Focused walkthrough on Finalizers & deletionTimestamp External Cleanup — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Any operator provisioning external AWS RDS, S3, DNS, or SaaS resources needs Finalizers because K8s GC stops at the cluster boundary.',
      'Always persist the Finalizer BEFORE invoking external Create APIs so an immediate delete never leaks cloud resources.',
      'Deleting a CR with Finalizers triggers an Update event setting `deletionTimestamp`, holding the object in `Terminating` safely.',
      'Handle external `NotFound` errors as success inside cleanup so removing the Finalizer stays 100% idempotent on retries.'
    ]
  },
  'webhooks-multiversion': {
    topicDesc: 'Admission webhooks and multi-version CRDs — mutating and validating admission control, CEL validation, and conversion webhooks that translate between stored CRD versions.',
    refs: [
      ['Kubernetes Docs: Dynamic Admission Control', 'https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/'],
      ['Kubernetes Docs: CRD Versioning & Conversion', 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/']
    ],
    videos: [
      TOP_YT.opGo,
      ["Vivek Singh: Mutating/Validating Webhooks & CRD Conversion", yt("Vivek Singh kubernetes mutating validating admission webhook CRD conversion"), "Builds custom Go admission webhook servers, CEL validation rules, and multi-version hub conversion webhooks."]
    ],
    steps: [
      'Automate webhook TLS rotation with cert-manager so expired webhook certs never lock out all CR writes.',
      'Return structured `field.ErrorList` responses from `ValidateUpdate` so `kubectl` pinpoints the exact invalid YAML field.',
      'Adopt inline CEL `XValidation` rules (`self == oldSelf`) wherever possible to enforce immutability with zero webhook Pods.',
      'Design one canonical Hub storage version and migrate stored etcd objects cleanly before deprecating legacy spoke APIs.'
    ]
  },
  'envtest-concurrency': {
    topicDesc: 'Controller-runtime integration testing with envtest plus concurrency controls — MaxConcurrentReconciles, field indexes for fast lookups, and server-side apply for conflict-free writes.',
    refs: [
      ['Kubebuilder Book: Writing Tests (envtest)', 'https://book.kubebuilder.io/cronjob-tutorial/writing-tests'],
      ['Kubernetes Docs: Server-Side Apply', 'https://kubernetes.io/docs/reference/using-api/server-side-apply/']
    ],
    videos: [
      TOP_YT.opGo,
      ["Ardan Labs & Kubebuilder: envtest, Go Concurrency & SSA", yt("Ardan Labs Kubebuilder envtest MaxConcurrentReconciles Go concurrency Server-Side Apply"), "Covers 2-second local apiserver envtest suites, goroutine concurrency limits, cache field indexes, and SSA writes."]
    ],
    steps: [
      'Remember envtest excludes kubelet and kube-controller-manager—assert stamped OwnerReferences rather than waiting for GC cleanup.',
      'Protect any shared in-memory maps with a mutex before raising `MaxConcurrentReconciles` beyond `1`.',
      'Register Informer Field Indexes for unowned ConfigMap/Secret lookups to eliminate slow O(N) namespace scans.',
      'Use Server-Side Apply with an explicit `FieldOwner` so Operator image updates never collide with HPA `replicas` patches.'
    ]
  },
  'olm-classic-v0': {
    topicDesc: 'OLM v0 packaging and distribution — operator bundles, the CatalogSource serving bundle images, Subscriptions that track a channel, the ClusterServiceVersion (CSV), and InstallPlans that apply an install or upgrade.',
    refs: [
      ['Operator Lifecycle Manager (OLM)', 'https://olm.operatorframework.io/'],
      ['Operator Framework: Operator Capabilities', 'https://operatorframework.io/operator-capabilities/']
    ],
    videos: [
      TOP_YT.opNana,
      ["OLM Bundles, CSV & Subscription Explained", yt("operator lifecycle manager OLM bundle CSV subscription"), "Covers Operator Lifecycle Manager packaging, catalog channels, and declarative Day-2 upgrades."]
    ],
    steps: [
      'Build scratch OCI bundle images via `operator-sdk generate bundle` directly from Kubebuilder `config/` manifests.',
      'Choose `installPlanApproval: Manual` in production Subscriptions so operator upgrades wait for change-control approval.',
      'Trace stuck installs cleanly down the chain: `CatalogSource -> Subscription -> InstallPlan -> CSV -> Deployment`.',
      'Understanding OLM v0 CSV fan-out and lack of rollbacks explains why OLM v1 was architected cleanly from scratch.'
    ]
  },
  'olm-v1-architecture': {
    topicDesc: 'OLM v1 declarative operator management — catalogd serving ClusterCatalogs and operator-controller reconciling ClusterExtensions, with single-owner installs and least-privilege service accounts replacing the v0 Subscription/CSV model.',
    refs: [
      ['Operator Lifecycle Manager (OLM v1)', 'https://olm.operatorframework.io/'],
      ['operator-framework/operator-controller', 'https://github.com/operator-framework/operator-controller']
    ],
    videos: [
      TOP_YT.opNana,
      ["Kubesimplify & CNCF: OLM v1 catalogd & ClusterExtension", yt("Kubesimplify CNCF OLM v1 catalogd ClusterExtension operator-controller"), "Covers replacing v0 Subscriptions/CSVs with fast HTTP catalogd feeds and declarative ClusterExtension rollouts."]
    ],
    steps: [
      'Using `catalogd` HTTP caching replaces heavy per-catalog gRPC index Pods and simplifies air-gapped registry mirroring.',
      'Pin explicit semver bounds in `ClusterExtension` manifests so GitOps tools manage deterministic operator rollouts cleanly.',
      'Impersonating a narrow installer ServiceAccount ensures compromised bundles can never escalate to cluster-admin.',
      'Continuous drift reconciliation heals accidental manual edits while preserving clean declarative version rollbacks.'
    ]
  },
  'production-ha-observability': {
    topicDesc: 'Running operators in production — Lease-based leader election for active/standby high availability, Prometheus metrics, structured logging, and RBAC hardening for the controller service account.',
    refs: [
      ['Kubernetes Docs: Leases', 'https://kubernetes.io/docs/concepts/architecture/leases/'],
      ['Kubebuilder Book: Metrics', 'https://book.kubebuilder.io/reference/metrics'],
      ['Operator Framework: Operator Capabilities', 'https://operatorframework.io/operator-capabilities/']
    ],
    videos: [
      TOP_YT.leader,
      ["Operator HA: Leader Election & Prometheus Metrics", yt("kubernetes operator leader election prometheus metrics HA"), "Focused walkthrough on Leader Election & Prometheus Metrics — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Enable `LeaderElectionReleaseOnCancel: true` so planned Pod rollouts hand over the Lease in under 1 second.',
      'Alert on sustained `workqueue_depth` and `reconcile_errors_total` spikes alongside custom domain business SLIs.',
      'Pair structured Zap JSON logs (`V(1)` for noisy steady-state passes) with `EventRecorder` notices visible in `kubectl describe`.',
      'Run the operator binary inside a non-root distroless image with `readOnlyRootFilesystem: true` and minimal namespace RBAC.'
    ]
  },
  'upgrades-capability-model': {
    topicDesc: 'The operator capability maturity model (levels L1–L5) together with zero-downtime CRD version upgrades via conversion and GitOps-managed operator fleets.',
    refs: [
      ['Operator Framework: Operator Capabilities', 'https://operatorframework.io/operator-capabilities/'],
      ['Kubernetes Docs: CRD Versioning', 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/']
    ],
    videos: [
      TOP_YT.opNana,
      ["Capability Levels, Zero-Downtime CRD Upgrades & GitOps", yt("operator capability model zero downtime CRD upgrade gitops"), "Focused walkthrough on Capability Levels, Zero-Downtime CRD Upgrades & GitOps — architecture, YAML mechanics, and production debugging."]
    ],
    steps: [
      'Target rock-solid Level 2 upgrades and Level 3 backups/failover before investing in Level 5 auto-pilot heuristics.',
      'Never run `kubectl delete crd` during upgrades—always add new optional schema fields first, then roll the operator.',
      'Decouple operator binary versions from managed DB versions (`spec.imageVersion`) and support pause annotations for waves.',
      'Enable `ServerSideApply=true` in ArgoCD sync options so CRDs exceeding 256KB never fail annotation length limits.'
    ]
  }
};

const STEP_VIDEOS = {
  'cp-request-flow': [
    [TOP_YT.apiLifecycle, ["KubeCon: Anatomy of a kubectl apply Request", yt("kubectl apply server-side apply field management kubernetes"), "Breaks down kubeconfig client serialization, strategic vs Server-Side Apply PATCH calls, and HTTP/2 transport to kube-apiserver."]],
    [TOP_YT.authzModes, ["Kubernetes RBAC & OIDC Token Verification Flow", yt("kubernetes OIDC authentication SubjectAccessReview RBAC"), "Walks through X.509/OIDC token extraction, impersonation headers, and how kube-apiserver evaluates RBAC rules before admission."]],
    [TOP_YT.celAdmission, ["Admission Webhooks vs ValidatingAdmissionPolicy Order", yt("kubernetes mutating validating admission controller webhook order"), "Traces sequential mutating hooks, OpenAPI v3 schema validation, and parallel validating hooks/CEL before persistence."]],
    [TOP_YT.etcdDeep, ["etcd Raft Commit & Informer Watch Notification Fan-Out", yt("etcd Raft commit watch fanout kube-apiserver resourceVersion"), "Shows how etcd persists an MVCC revision via Raft quorum and pushes Bookmark/ADDED events to waiting Informers."]],
    [TOP_YT.k8sArch, ["Scheduler Filter/Score & Kubelet Pod Binding Loop", yt("kube-scheduler filtering scoring bind kubelet syncPod"), "Follows Unscheduled Pod discovery, Node scoring plugins, /binding subresource creation, and kubelet container launch."]]
  ],
  'etcd-raft-mvcc': [
    [TOP_YT.etcdConsensus, ["Raft Quorum Math: Why Odd Cluster Sizes Matter", yt("etcd Raft quorum 3 vs 5 nodes split brain fault tolerance"), "Demonstrates (N/2)+1 majority math, why 4 nodes share the same failure tolerance as 3, and leader election timeouts."]],
    [TOP_YT.etcdCore, TOP_YT.varjoshEtcd],
    [TOP_YT.etcdDeep, ["etcd MVCC Revisions, Compaction & Defragmentation", yt("etcd MVCC key revision history compaction defrag"), "Visualizes append-only B+tree revisions, how Kubernetes resourceVersion maps to mod_revision, and reclaiming free pages."]],
    [TOP_YT.apiLifecycle, ["Optimistic Concurrency & 409 Conflict Retry Handling", yt("kubernetes resourceVersion optimistic concurrency 409 conflict"), "Explains compare-and-swap writes using metadata.resourceVersion to prevent concurrent controllers from clobbering updates."]]
  ],
  'kubelet-cri-node': [
    [TOP_YT.internals, ["Kubelet PLEG & SyncLoop Reconciling PodSpecs", yt("kubelet PodLifecycleEventGenerator PLEG syncPod architecture"), "Traces how PLEG polls CRI container runtime events and feeds desired-vs-actual diffs into kubelet SyncLoop."]],
    [TOP_YT.net30, TOP_YT.lfFundamentals],
    [TOP_YT.qos, ["Linux cgroups v2 CPU/Memory Limits & Kubelet Probes", yt("kubernetes cgroups v2 memory.high cpu.max startup liveness probe"), "Connects container resource requests/limits to cgroups v2 kernel files and kubelet exec/http/tcp health probe checks."]],
    [TOP_YT.eviction, ["Node Lease Heartbeats vs Heavy NodeStatus Payloads", yt("kubernetes coordination.k8s.io Lease node heartbeat eviction"), "Explains why lightweight 10s Lease updates decouple health heartbeats from full NodeStatus reporting every 5 minutes."]]
  ],
  'pods-multicontainer': [
    [TOP_YT.piyushPods, TOP_YT.net30],
    [TOP_YT.podLife, ["Init Containers: Sequential Pre-Flight Gatekeeping", yt("kubernetes initContainers sequential startup migration wait-for-service"), "Shows blocking init execution order, per-init restart rules, and resource peak calculation across init vs app containers."]],
    [["KubeCon: Kubernetes Native Sidecars (restartPolicy: Always)", yt("kubernetes native sidecar containers KEP-753 Job exit"), "Explains how K8s 1.29+ native sidecars start before app containers and terminate cleanly after Job containers finish."]],
    [["Ambassador & Adapter Multi-Container Patterns Explained", yt("kubernetes ambassador adapter multi container pattern examples"), "Contrasts Ambassador outbound proxy decoupling (cloud SQL/Vault) with Adapter log/metric schema normalization."]],
    [["Kubernetes Graceful Shutdown: preStop + Endpoint Drain", yt("kubernetes graceful termination SIGTERM preStop endpointSlice race condition"), "Details the parallel race between kube-proxy iptables updates and SIGTERM, solved cleanly with preStop sleep hooks."]]
  ],
  'namespaces-quotas': [
    [["Multi-Tenant Namespaces, CoreDNS Search & Virtual Isolation", yt("kubernetes namespaces virtual cluster isolation CoreDNS search path"), "Explains namespace-scoped vs cluster-scoped API groups and FQDN service DNS (<svc>.<ns>.svc.cluster.local)."], TOP_YT.authzModes],
    [["Enforcing ResourceQuota Limits on CPU, Memory & Object Counts", yt("kubernetes ResourceQuota compute storage object count quota"), "Demonstrates admission rejection when namespaces omit requests/limits or exceed aggregate CPU/PVC budgets."]],
    [["LimitRange Auto-Injection: Safe Defaults & Min/Max Bounds", yt("kubernetes LimitRange defaultRequest default max min ratio"), "Shows how LimitRange mutating admission stamps default CPU/memory onto underspecified Pods before Quota checks run."], TOP_YT.qos]
  ],
  'deployments-rollouts': [
    [TOP_YT.deployRs, ["Deployment -> ReplicaSet -> Pod OwnerReferences Tree", yt("kubernetes deployment replicaset pod-template-hash ownerReferences"), "Visualizes how editing podSpec triggers a new ReplicaSet with a distinct pod-template-hash while keeping history."]],
    [["Mastering maxSurge & maxUnavailable in RollingUpdate", yt("kubernetes rolling update maxSurge maxUnavailable zero downtime formula"), "Calculates exact extra capacity and minimum availability budgets across percentage vs integer rollout settings."], TOP_YT.podLife],
    [["Deployment Revision History & Instant Rollback Mechanics", yt("kubernetes kubectl rollout history undo revisionHistoryLimit"), "Shows how scaling down old ReplicaSets enables instant rollbacks without rebuilding container images."]],
    [["Traffic-Weighted Canary Releases: Standard vs Argo Rollouts", yt("kubernetes canary deployment traffic split nginx ingress argo rollouts"), "Compares coarse replica-count canary splits against fine-grained 5% header/weight routing via Rollouts & Gateway API."], TOP_YT.gwApi]
  ],
  'stateful-daemon-jobs': [
    [TOP_YT.piyushStateful],
    [["volumeClaimTemplates: 1:1 Sticky PVC Persistence on Reschedule", yt("kubernetes StatefulSet volumeClaimTemplates PVC reattach pod restart"), "Traces how rescheduling pod-1 reattaches its original ReadWriteOnce PersistentVolume instead of wiping data."], TOP_YT.internals],
    [TOP_YT.piyushDaemonJob, TOP_YT.eviction],
    [["Jobs & CronJobs: backoffLimit, completions & concurrencyPolicy", yt("kubernetes Job CronJob completions parallelism backoffLimit Forbid"), "Contrasts parallel queue Jobs, Indexed completion mode, and CronJob Allow/Forbid/Replace overlap policies."]],
    [["Advanced StatefulSet Updates: OnDelete & Partition Canaries", yt("kubernetes StatefulSet updateStrategy RollingUpdate partition canary"), "Shows updating only ordinals >= partition N (e.g., testing pod-3 on canary v2 while pods 0-2 remain on v1)."], TOP_YT.deployRs]
  ],
  'configmaps-secrets': [
    [["ConfigMaps & Secrets: Env Vars vs tmpfs Projected Volumes", yt("kubernetes ConfigMap Secret environment variable vs volume mount"), "Contrasts static startup env var injection with in-memory tmpfs volume mounts for multi-key config files."]],
    [["Kubelet ConfigMap Sync Delay & Immutable Performance Boost", yt("kubernetes ConfigMap volume hot reload immutable subPath trap"), "Explains why subPath mounts never auto-update, kubelet syncPeriod timing, and why immutable: true reduces API watches."]],
    [["Encrypting Kubernetes Secrets at Rest with etcd KMS v2", yt("kubernetes EncryptionConfiguration KMS v2 aescbc etcd encryption at rest"), "Explains why base64 Secrets remain plaintext in etcd unless Envelope Encryption via KMS v2 provider is enabled."], TOP_YT.etcdProd]
  ],
  'pv-pvc-csi': [
    [["Dynamic PVC Provisioning & WaitForFirstConsumer Topology", yt("kubernetes StorageClass WaitForFirstConsumer PVC AZ scheduling trap"), "Solves multi-AZ Pod scheduling deadlocks where EBS volumes provisioned eagerly land in the wrong availability zone."]],
    [["CSI Split Architecture: Controller (Attach) vs Node (Mount)", yt("kubernetes Container Storage Interface CSI external-provisioner kubelet plugin"), "Traces sidecar CSI external-provisioner/attacher cloud API calls separately from node DaemonSet bind mounts."], TOP_YT.internals],
    [["Access Modes Deep Dive: RWO, RWX, ROX & ReadWriteOncePod", yt("kubernetes AccessModes ReadWriteOnce ReadWriteMany ReadWriteOncePod"), "Contrasts block storage single-node attach (RWO/RWOP) against NFS/EFS/CephFS shared file mounts (RWX)."]],
    [["Preventing Data Loss: Retain Policy & Online PVC Expansion", yt("kubernetes ReclaimPolicy Retain Delete allowVolumeExpansion PVC resize"), "Shows migrating PV reclaimPolicy from Delete to Retain and live resizing underlying filesystems without restarts."]]
  ],
  'services-kubeproxy': [
    [TOP_YT.net30, ["Why Ephemeral Pod IPs Break Hardcoded Service Connections", yt("kubernetes why services exist ephemeral pod IP lifecycle"), "Illustrates Pod replacement churn during rollouts and why stable ClusterIP abstraction is mandatory."]],
    [["ClusterIP Virtual VIP Routing & CoreDNS Service Lookup", yt("kubernetes ClusterIP CoreDNS srv record search path lookup"), "Traces DNS lookup to headless vs ClusterIP VIPs and packet DNAT translation before leaving the source node."], TOP_YT.k8sArch],
    [["NodePort & Cloud LoadBalancer External Traffic Flow", yt("kubernetes NodePort LoadBalancer externalTrafficPolicy Local cluster"), "Explains dual-hop NAT latency vs externalTrafficPolicy: Local preserving real client source IPs."]],
    [["Scaling Services to 10,000+ Pods Using EndpointSlices", yt("kubernetes EndpointSlices vs Endpoints scaling kube-proxy"), "Demonstrates how sharding endpoints into 100-address slices cuts control-plane watch bandwidth by orders of magnitude."], TOP_YT.apiPerf],
    [TOP_YT.ebpfProxy, ["iptables vs IPVS vs eBPF Service Dataplane Benchmarks", yt("kubernetes iptables vs IPVS vs Cilium eBPF service latency benchmarks"), "Compares sequential O(N) iptables netfilter traversals against IPVS hash tables and O(1) eBPF cgroup socket hooks."]]
  ],
  'ingress-gateway': [
    [TOP_YT.piyushIngressGw, TOP_YT.net30],
    [TOP_YT.gwApi, ["Gateway API Role Split: Infrastructure vs Platform vs App", yt("kubernetes Gateway API GatewayClass Gateway HTTPRoute role oriented"), "Explains why Kubernetes created Gateway API to replace annotation-heavy Ingress with RBAC-separated resources."]],
    [["Cross-Namespace Security with Gateway API ReferenceGrant", yt("kubernetes Gateway API ReferenceGrant cross namespace HTTPRoute"), "Prevents accidental cross-namespace BackendRef or TLS Secret leaks via explicit allow-listed ReferenceGrants."]],
    [["Native Weighted Canary Splits & Header Routing in HTTPRoute", yt("kubernetes Gateway API HTTPRoute weighted traffic splitting header matching"), "Demonstrates vendor-neutral 90/10 canary percentages and header-based dark launches inside standard YAML."], TOP_YT.argoProd],
    [["Gateway API Advanced Flows: Request Mirroring & GRPCRoute", yt("kubernetes Gateway API RequestMirrorFilter GRPCRoute Traffic Splitting"), "Walks through shadow traffic mirroring for production validation and native protobuf method routing with GRPCRoute."]]
  ],
  'network-policies': [
    [TOP_YT.net30, TOP_YT.piyushNetPol],
    [["Sealing Namespace Perimeters With Default-Deny NetworkPolicy", yt("kubernetes NetworkPolicy default deny ingress egress YAML"), "Writes podSelector: {} ingress+egress isolation policies without locking out health checks accidentally."], TOP_YT.ebpfProxy],
    [["Label Selectors & The Infamous AND vs OR YAML Dash Trap", yt("kubernetes NetworkPolicy ingress from AND vs OR hyphen yaml trap"), "Highlights the classic YAML bug where omitting vs adding a dash changes AND into OR across namespaceSelector & podSelector."]],
    [["Preventing Outages: Allowing CoreDNS Egress (UDP/TCP 53)", yt("kubernetes NetworkPolicy egress allow CoreDNS kube-dns port 53"), "Explains why applying egress deny breaks every hostname lookup and shows exact kube-system CoreDNS allow rules."]]
  ],
  'authn-serviceaccounts': [
    [["Human Authentication: X.509 Client Certs & OIDC SSO", yt("kubernetes authentication X.509 client cert OIDC kubelogin API server"), "Traces TLS client CN/O extraction and short-lived OIDC ID tokens validated against external identity providers."], TOP_YT.authzModes],
    [TOP_YT.varjoshAuthn],
    [["Projected Bound ServiceAccount Tokens (TokenRequest API v1.24+)", yt("kubernetes bound serviceaccount token TokenRequest expirationSeconds rotation"), "Replaces non-expiring Secret tokens with time-bound, audience-scoped JWTs automatically rotated by kubelet."], TOP_YT.apiLifecycle],
    [["Hardening Pod Specs: automountServiceAccountToken: false", yt("kubernetes automountServiceAccountToken false security hardening"), "Stops API token projection into pods that never talk to kube-apiserver, cutting lateral movement after RCE."], TOP_YT.falcoCks]
  ],
  'rbac-authz': [
    [TOP_YT.authzModes, ["Deconstructing RBAC Rules: apiGroups, resources & verbs", yt("kubernetes RBAC apiGroups resources verbs resourceNames anatomy"), "Explains empty core \"\" apiGroup vs apps/batch, subresources like pods/exec, and nonResourceURLs."]],
    [["Role vs ClusterRole: Scoping Namespace vs Cluster Objects", yt("kubernetes Role vs ClusterRole namespace scoped cluster scoped RBAC"), "Maps when namespace isolation applies vs when Nodes, PVs, and CRDs require ClusterRole permissions."]],
    [["The Reusable Pattern: ClusterRole + Namespaced RoleBinding", yt("kubernetes ClusterRole with RoleBinding multi namespace pattern"), "Demonstrates defining shared reader/editor ClusterRoles once while bounding blast radius to one namespace via RoleBinding."], TOP_YT.internals],
    [["Stopping Silent RBAC Escalation (escalate, bind, pods/exec)", yt("kubernetes RBAC privilege escalation paths create pods secrets escalate"), "Identifies dangerous verbs (secrets get, pods create, impersonate, bind) audited heavily in CKS environments."], TOP_YT.opaGate]
  ],
  'admission-webhooks': [
    [TOP_YT.apiLifecycle, ["Exact Admission Pipeline Order Before etcd Commit", yt("kubernetes api request admission controller order mutating validating"), "Maps where webhooks and built-in controllers sit between AuthZ and etcd JSON/protobuf serialization."]],
    [["MutatingAdmissionWebhook: Sidecar Injection & JSONPatch", yt("kubernetes MutatingAdmissionWebhook JSONPatch sidecar injection loop"), "Traces how mutating webhooks return base64 JSONPatch diffs and why re-invocation runs when objects change."]],
    [["OpenAPI v3 Schema Validation & Structural Pruning", yt("kubernetes OpenAPI v3 schema validation structural pruning after mutation"), "Explains why structural validation runs AFTER mutating webhooks so mutated fields cannot smuggle invalid data."], TOP_YT.apiPerf],
    [TOP_YT.opaGate, ["ValidatingAdmissionWebhook: Blocking :latest & Unsigned Images", yt("kubernetes ValidatingAdmissionWebhook block latest tag admissionReview"), "Inspects AdmissionReview request/response payloads rejecting unsafe PodSpecs before storage."]],
    [TOP_YT.celAdmission, ["ValidatingAdmissionPolicy (CEL): Fast In-Process Policies", yt("kubernetes ValidatingAdmissionPolicy CEL matchConstraints paramKind"), "Benchmarks in-process CEL evaluation against external HTTPS webhooks, removing network tail latency and SPOFs."]]
  ],
  'pod-security-runtime': [
    [["Pod Security Standards (PSS): Privileged, Baseline & Restricted", yt("kubernetes Pod Security Standards Privileged Baseline Restricted requirements"), "Compares exact container restrictions across the 3 OSS tiers (capabilities, root UID, seccomp, hostPath)."], TOP_YT.opaGate],
    [["Pod Security Admission (PSA) Enforce, Audit & Warn Labels", yt("kubernetes Pod Security Admission namespace labels enforce warn audit"), "Shows safely phasing Restricted policies in via warn/audit mode before flipping enforce=restricted."]],
    [["Hardened Container SecurityContext: Non-Root & ReadOnlyRootFS", yt("kubernetes securityContext runAsNonRoot readOnlyRootFilesystem drop ALL"), "Demonstrates pairing runAsNonRoot, allowPrivilegeEscalation: false, capabilities drop ALL, and emptyDir caches."], TOP_YT.qos],
    [["Kernel Syscall Sandboxing: RuntimeDefault Seccomp & AppArmor", yt("kubernetes seccompProfile RuntimeDefault AppArmor localhost profile"), "Explains blocking 44+ high-risk Linux syscalls via seccomp while confining file paths with AppArmor."]],
    [TOP_YT.falcoCks, TOP_YT.supply]
  ],
  'crds-schema': [
    [TOP_YT.opNana, ["Extending kube-apiserver Cleanly With CustomResourceDefinitions", yt("kubernetes CustomResourceDefinition CRD extend API server"), "Explains how registering a CRD dynamically generates versioned REST endpoints backed directly by etcd."]],
    [["OpenAPI v3 Structural Schemas & x-kubernetes-validations CEL", yt("kubernetes CRD OpenAPI v3 structural schema x-kubernetes-validations CEL"), "Builds self-validating CRD fields with transition rules (self >= oldSelf) completely inside the schema."], TOP_YT.celAdmission],
    [["Designing /status & /scale Subresources on CRDs", yt("kubernetes CRD subresources status scale observedGeneration HPA"), "Demonstrates isolating status writes for RBAC safety and unlocking native kubectl scale + HPA targeting."]],
    [["API Evolution: Multi-Version CRDs & Conversion Webhooks", yt("kubernetes CRD versioning storage true served conversion webhook"), "Explains migrating v1alpha1 -> v1 cleanly using a single storage hub version and stateless conversion webhooks."], TOP_YT.opGo]
  ],
  'controllers-operators': [
    [TOP_YT.vivekClientGo, TOP_YT.apiPerf],
    [TOP_YT.fccOperator, TOP_YT.opGo],
    [TOP_YT.opNana, ["Writing Idempotent Reconcile() Loops for Multi-Resource Stacks", yt("kubernetes controller reconcile loop desired vs actual state idempotent"), "Traces expanding 1 Custom Resource into coordinated Deployments, Services, Secrets, and status conditions."]],
    [TOP_YT.vivekFinalizer, ["Handling Cross-Namespace Cleanup Without OwnerReferences", yt("kubernetes cross namespace ownerReference prohibited finalizer pattern"), "Solves the Kubernetes restriction banning cross-namespace OwnerReferences cleanly with controller finalizers."]],
    [TOP_YT.vivekOperator, TOP_YT.leader]
  ],
  'level-triggered': [
    [["Edge-Triggered vs Level-Triggered Control Loops Explained", yt("level triggered vs edge triggered reconciliation kubernetes controllers tim hockin"), "Explains why reacting purely to event deltas corrupts state on dropped watches while level-triggered loops always recover."], TOP_YT.internals],
    [["Watch Reconnects (410 Gone) & Periodic Resync Safety Net", yt("kubernetes informer resyncPeriod watch 410 Gone relist recovery"), "Traces automatic HTTP/2 watch stream recovery, bookmark resumption, and periodic local cache resync sweeps."], TOP_YT.apiPerf],
    [["Declarative Intent vs Fragile Imperative Deployment Scripts", yt("declarative vs imperative infrastructure kubernetes reconciliation scale"), "Shows why declarative desired-state manifests eliminate partial-failure drift compared to sequential CI scripts."], TOP_YT.argoProd]
  ],
  'hub-watch-cache': [
    [TOP_YT.k8s6min, ["Hub-and-Spoke Topology: Zero Component-to-Component RPCs", yt("kubernetes hub and spoke architecture kube-apiserver central gateway"), "Explains why kubelet, scheduler, and controllers never talk directly—coordinating exclusively via kube-apiserver."]],
    [TOP_YT.apiPerf, ["Inside kube-apiserver Cacher: Protecting etcd Watch Fan-Out", yt("kube-apiserver cacher watch cache B-tree memory etcd protection"), "Walks through the in-memory ring-buffer cacher serving thousands of client watches from a single etcd watch stream."]],
    [["API Priority & Fairness (APF) & Watch Bookmarks at Scale", yt("kubernetes API Priority and Fairness APF FlowSchema PriorityLevelConfiguration"), "Demonstrates queuing and isolating noisy CI/controller clients from starving system node leases and leader elections."], TOP_YT.etcdDeep]
  ],
  'leader-election': [
    [TOP_YT.leader, ["Distributed Coordination With coordination.k8s.io/v1 Lease Objects", yt("kubernetes Lease resource leader election active standby controllers"), "Explains how standby replicas observe holderIdentity and acquireTime updates on a shared API Lease object."]],
    [["Tuning LeaseDuration, RenewDeadline & RetryPeriod Safely", yt("kubernetes leader election leaseDuration renewDeadline retryPeriod tuning"), "Calculates clock-skew safe timers (15s lease / 10s renew / 2s retry) to avoid premature leadership flaps."], TOP_YT.etcdConsensus],
    [["Failover Fencing: Why Controllers Must Exit Cleanly on Lost Lease", yt("kubernetes leader election split brain self fencing LeaderCallbacks OnStoppedLeading"), "Shows invoking os.Exit(1) inside OnStoppedLeading so a partitioned controller never writes stale mutations."], TOP_YT.opGo]
  ],
  'gitops-argocd': [
    [TOP_YT.argoProd, ["Pull-Based GitOps: Zero Prod Kubeconfigs Inside CI Pipelines", yt("gitops pull vs push deployment argocd security CI pipeline"), "Contrasts pushing credentials into GitHub Actions vs pulling signed manifests from inside the cluster perimeter."]],
    [["Argo CD Application Controller: Continuous 3-Way Live Diffing", yt("argocd 3-way diff application controller repo-server OutOfSync"), "Explains how Argo CD compares Git HEAD, last-applied state, and live cluster manifests to flag drift immediately."], TOP_YT.helmKust],
    [["Automated Self-Heal & Prune Policies in Production Argo CD", yt("argocd syncPolicy automated prune selfHeal resource exclusion"), "Demonstrates reverting manual kubectl edits in seconds while protecting dynamically mutated HPA replica counts."]],
    [["Audited Zero-Panic Rollbacks with git revert HEAD", yt("argocd gitops rollback git revert history audit trail"), "Walks through rolling back broken releases atomically via Git history so cluster state stays synchronized with code."], TOP_YT.fluxTim]
  ],
  'autoscaling-karpenter': [
    [TOP_YT.scaleAll, ["Tier 1 Pod Autoscaling: Combining HPA CPU + KEDA Queue Depth", yt("kubernetes KEDA ScaledObject HPA queue lag autoscaling"), "Contrasts CPU-bound HPA scaling with KEDA event scalers activating 0->N replicas directly on Kafka/SQS backlog."]],
    [TOP_YT.scaleTool, ["Tier 2 Karpenter Node Provisioning: Bin-Packing in ~35 Seconds", yt("AWS EKS Karpenter NodePool EC2NodeClass vs Cluster Autoscaler"), "Demonstrates Karpenter bypassing slow Auto Scaling Groups to launch exact instance shapes matching pending Pods."]],
    [["Karpenter Consolidation: Multi-Node Replacement & FinOps Savings", yt("Karpenter consolidation policy WhenEmptyOrUnderutilized PDB disruption"), "Shows live node bin-packing, replacing underutilized instances with smaller ones while honoring PodDisruptionBudgets."], TOP_YT.drain]
  ],
  'static-pods': [
    [["Bootstrapping Kubelet Static Manifests From /etc/kubernetes/manifests", yt("kubernetes static pods kubelet podManifestPath mirror pod"), "Traces how kubelet spawns YAML files from disk directly and registers read-only mirror Pods in kube-apiserver."], TOP_YT.internals],
    [["The Chicken-and-Egg Control Plane Boot Solution in kubeadm", yt("kubeadm static pods control plane bootstrap apiserver etcd"), "Explains how kubeadm brings up etcd and kube-apiserver before any Scheduler or Controller Manager exists."], TOP_YT.k8sArch]
  ],
  'tls-cluster-pki': [
    [["Mapping the 3 Kubernetes CAs in /etc/kubernetes/pki", yt("kubernetes PKI certificates etcd ca front-proxy-ca cluster architecture"), "Differentiates ca.crt (cluster), etcd/ca.crt (database peers), and front-proxy-ca.crt (extension aggregation)."], TOP_YT.authzModes],
    [["Automated Rotation With kubeadm certs & Kubelet TLS Bootstrap", yt("kubeadm certs check-expiration renew all kubelet TLS bootstrapping"), "Walks through inspecting expiry dates, rotating control plane certs zero-downtime, and kubelet CSR auto-renewal."], TOP_YT.etcdProd]
  ],
  'labels-selectors-affinity': [
    [["Labels, Selectors & Set-Based Queries Connecting K8s Objects", yt("kubernetes labels selectors equality set based matchExpressions"), "Shows how Services, Deployments, and NetworkPolicies decouple identity from Pod names via label queries."], TOP_YT.k8s6min],
    [["NodeSelector vs Required/Preferred NodeAffinity Placement Rules", yt("kubernetes nodeSelector vs nodeAffinity requiredDuringScheduling preferredDuringScheduling"), "Explains hard scheduling blocks vs weighted soft preferences across GPU, architecture, and NVMe node labels."], TOP_YT.k8sArch],
    [["PodAntiAffinity & TopologySpreadConstraints Multi-AZ HA", yt("kubernetes podAntiAffinity topologySpreadConstraints maxSkew doNotSchedule"), "Prevents rack/zone correlated outages by bounding replica skew across topology.kubernetes.io/zone keys."], TOP_YT.deployRs]
  ],
  'taints-tolerations': [
    [TOP_YT.kodeTaints],
    [TOP_YT.varjoshTaints, TOP_YT.eviction]
  ],
  'priority-preemption': [
    [TOP_YT.varjoshPriority, TOP_YT.qos]
  ],
  'volumes-storage-plugins': [
    [["Pod Volume Types: emptyDir, hostPath & Projected Secrets", yt("kubernetes volumes emptyDir medium Memory hostPath security risks"), "Compares ephemeral shared Pod scratch space, Memory-backed tmpfs, and dangerous hostPath mounts."], TOP_YT.podLife],
    [TOP_YT.piyushStorage, TOP_YT.internals]
  ],
  'coredns-nodelocal': [
    [TOP_YT.varjoshDns, TOP_YT.net30],
    [["Fixing UDP Conntrack Races With NodeLocal DNSCache", yt("kubernetes NodeLocal DNSCache conntrack race condition TCP upgrade"), "Explains how local host-network caching eliminates Linux conntrack table exhaustion and tail-latency DNS timeouts."], TOP_YT.ebpfProxy]
  ],
  'ingress-controllers': [
    [TOP_YT.piyushIngressGw, TOP_YT.net30],
    [["Multi-Controller Isolation Using IngressClass & Exact vs Prefix", yt("kubernetes IngressClass multiple ingress controllers Exact Prefix matching"), "Configures public vs internal IngressClasses alongside deterministic path precedence matching."], TOP_YT.gwApi]
  ],
  'service-mesh-istio': [
    [TOP_YT.istioNana, ["SPIFFE Workload Identities & mTLS Secret Discovery (SDS)", yt("istio mTLS SPIFFE ID SDS certificate rotation Envoy"), "Explains how istiod issues short-lived X.509 SPIFFE certs directly to Envoy over UNIX domain sockets."]],
    [TOP_YT.ambient, TOP_YT.meshCmp]
  ],
  'policies-opa-kyverno-cel': [
    [TOP_YT.opaGate, TOP_YT.celAdmission]
  ],
  'ebpf-cilium-calico-falco': [
    [TOP_YT.ebpfProxy, TOP_YT.lfEbpfSec],
    [TOP_YT.falcoCks, TOP_YT.cyberCks]
  ],
  'node-lifecycle-conditions': [
    [["Calculating Node Allocatable = Capacity - Reserved - Eviction", yt("kubernetes node allocatable vs capacity kube-reserved system-reserved"), "Prevents kernel OOM freezes by explicitly budgeting OS daemons and kubelet overhead before scheduling Pods."], TOP_YT.k8sArch],
    [TOP_YT.eviction, ["Understanding Ready, MemoryPressure, DiskPressure & PIDPressure", yt("kubernetes node conditions MemoryPressure DiskPressure PIDPressure"), "Maps threshold triggers inside kubelet housekeeping loops to scheduler-blocking node conditions."]],
    [TOP_YT.qos, ["cgroup v2 Eviction Order: BestEffort -> Burstable -> Guaranteed", yt("kubernetes node pressure eviction priority QoS oom_score_adj"), "Traces how kubelet reclaims node RAM by scoring actual memory consumption against requests across QoS tiers."]],
    [TOP_YT.drain, ["Safe Maintenance Workflow: Cordon, Drain, PDB & Uncordon", yt("kubernetes kubectl drain PDB PodDisruptionBudget safe node reboot"), "Demonstrates respecting voluntary disruption budgets while ignoring DaemonSets cleanly during upgrades."]]
  ],
  'pod-lifecycle-stages': [
    [TOP_YT.podLife, ["Mapping All 5 Pod Phases & 4 Readiness Conditions", yt("kubernetes pod phases Pending Running Succeeded Failed Unknown conditions"), "Distinguishes high-level Pod phases from granular PodScheduled, Initialized, ContainersReady, and Ready conditions."]],
    [["Inside Container States: Waiting, Running & ExitCode Triage", yt("kubernetes container states Waiting CrashLoopBackOff Terminated exit code"), "Walks through ImagePullBackOff, CreateContainerConfigError, and OOMKilled (137) inside pod.status.containerStatuses."], TOP_YT.qos],
    [["Lifecycle Probes & Hooks: Init -> postStart -> Startup/Ready/Live", yt("kubernetes startupProbe readinessProbe livenessProbe postStart ordering"), "Shows preventing slow-starting JVM/Go apps from premature kills using startupProbe while separating traffic readiness."]],
    [["Zero-502 Termination: preStop Hook, SIGTERM & EndpointSync", yt("kubernetes preStop hook SIGTERM endpointSlice graceful shutdown"), "Walks through parallel endpoint removal + preStop delay + graceful HTTP draining inside terminationGracePeriodSeconds."], TOP_YT.drain]
  ],
  'replicasets-deployments-deep': [
    [TOP_YT.deployRs, ["Inside the ReplicaSet Controller: Desired vs Actual Reconciliation", yt("kubernetes ReplicaSet controller loop scale up down labels"), "Shows how ReplicaSet continuously diffs spec.replicas against matching Running/Terminating Pods in its namespace."]],
    [["Orphan Adoption & Non-Destructive Deletion (--cascade=orphan)", yt("kubernetes kubectl delete replicaset cascade orphan pod adoption"), "Demonstrates detaching a live Pod for forensic debugging by editing labels or removing a ReplicaSet with --cascade=orphan."], TOP_YT.internals],
    [["Recreate vs RollingUpdate & progressDeadlineSeconds Failures", yt("kubernetes deployment strategy Recreate vs RollingUpdate progressDeadlineSeconds"), "Clarifies when RWO volumes mandate Recreate downtime and how progressDeadlineSeconds detects stuck rollouts."], TOP_YT.podLife],
    [["Batching Multiple Edits Safely Using rollout pause & resume", yt("kubernetes kubectl rollout pause resume batch updates history"), "Prevents wasteful intermediate rollouts by pausing a Deployment across sequential image, env, and limit updates."], TOP_YT.argoProd]
  ],
  'hpa-deep-dive': [
    [TOP_YT.hpaVpa, ["Dissecting the HPA Formula & 10% Tolerance Deadband", yt("kubernetes HPA formula desiredReplicas tolerance 0.1 calculation"), "Works through ceil(currentReplicas * currentMetric / desiredMetric) and why changes <10% intentionally stay flat."]],
    [["Taming Replica Thrashing With autoscaling/v2 StabilizationWindows", yt("kubernetes HPA v2 behavior scaleDown stabilizationWindowSeconds selectPolicy"), "Configures rapid scale-up bursts alongside 5-minute scale-down stabilization windows and percentage rate caps."], TOP_YT.scaleTool],
    [TOP_YT.scaleAll, ["Custom RPS & Kafka Queue Autoscaling (Prometheus Adapter & KEDA)", yt("kubernetes HPA custom metrics Prometheus Adapter vs KEDA ScaledObject"), "Compares custom metrics API pipelines against KEDA direct external-scaler activation from zero replicas."]]
  ],
  'vpa-deep-dive': [
    [TOP_YT.hpaVpa, ["VPA Tri-Component Architecture: Recommender, Updater & Admission", yt("kubernetes VerticalPodAutoscaler Recommender Updater Admission Controller"), "Traces historical OOM/CPU quantile aggregation in Recommender, evictions in Updater, and MutatingWebhook injection."]],
    [TOP_YT.scaleTool, ["VPA Modes: Off -> Initial -> Auto vs K8s InPlacePodVerticalScaling", yt("kubernetes VPA updateMode Off Initial Auto InPlaceOrRecreate resize"), "Compares risk-free recommendation sizing (Off) with live non-disruptive CPU/memory container resize (InPlace)."]],
    [TOP_YT.scaleAll, ["Golden Rule: Never Target the Same Metric With Both HPA & VPA", yt("kubernetes combine HPA and VPA CPU memory conflict best practice"), "Explains why CPU fighting CPU creates oscillation and how pairing VPA(Memory) + HPA(Custom RPS) eliminates it."]]
  ],
  'helm-charts-advanced': [
    [TOP_YT.helmKust, TOP_YT.kodeHelm],
    [["Helm Hooks & Validation: pre-upgrade DB Migrations & helm test", yt("kubernetes Helm hooks pre-upgrade post-install hook-weight helm test"), "Implements deterministic schema migration Jobs ordered by hook-weight with automatic hook-delete-policy cleanup."], TOP_YT.argoProd]
  ],
  'kustomize-overlays-transformers': [
    [TOP_YT.helmKust, ["Template-Free Kustomize: Common Base + Dev/Prod Overlays", yt("kubernetes Kustomize base overlays kubectl apply -k architecture"), "Demonstrates clean inheritance across environments without fragile Helm bracket conditionals."]],
    [["StrategicMerge vs JSON6902 Patches & Immutable Hash Generators", yt("kubernetes Kustomize strategicMergePatch patchesJson6902 configMapGenerator"), "Shows deleting/editing list items via JSON6902 and triggering automatic Pod rollouts via configMapGenerator hashes."], TOP_YT.fluxTim]
  ],
  'gitops-appsets-flux': [
    [TOP_YT.fluxTim, TOP_YT.argoProd]
  ],
  'cluster-maintenance': [
    [TOP_YT.drain, ["Operating Safely Around PodDisruptionBudgets During Node Drain", yt("kubernetes PodDisruptionBudget minAvailable maxUnavailable node drain"), "Explains how PDBs block unsafe voluntary evictions during upgrades while allowing single-replica overrides cautiously."]]
  ],
  'all-failure-modes': [
    [TOP_YT.podLife, TOP_YT.fccBeauCka],
    [TOP_YT.qos, ["CrashLoopBackOff vs OOMKilled (Exit 137) Forensics", yt("kubernetes debug CrashLoopBackOff OOMKilled exit code 137 logs --previous"), "Uses kubectl logs --previous, dmesg OOM traces, and terminationMessage inspection to isolate crashes vs memory kills."]],
    [TOP_YT.varjoshTroubleshoot, TOP_YT.etcdProd]
  ],
  'managed-vs-selfmanaged': [
    [TOP_YT.k8s6min, ["Shared Responsibility Matrix: EKS/GKE/AKS vs kubeadm", yt("managed kubernetes EKS GKE AKS vs self managed kubeadm comparison"), "Contrasts cloud-managed SLA control planes against customer-owned worker patches, CNI ops, and etcd backups."]]
  ],
  'topology-single-ha-multicluster': [
    [TOP_YT.etcdConsensus, ["Single-Master SPOF vs Stacked & External Multi-Master HA", yt("kubernetes high availability topology stacked etcd vs external etcd"), "Compares single-node blast radius against 3-master stacked etcd and decoupled external 5-node etcd topologies."]],
    [["Multi-Cluster Fleet Design: Blast Radius, Cells & Global Failover", yt("kubernetes multi cluster architecture blast radius federation gateway"), "Reviews active-active cluster cells, GitOps fleet rollout waves, and DNS/GSLB failover across regions."], TOP_YT.argoProd]
  ],
  'demo-kubeadm-eks-install': [
    [TOP_YT.internals, TOP_YT.lfFundamentals],
    [TOP_YT.kodeKubeadm],
    [["Creating Production Managed Clusters With eksctl & Terraform", yt("AWS EKS cluster creation eksctl terraform managed node groups"), "Demonstrates provisioning VPC subnets, IAM roles, OIDC providers, and managed node groups cleanly."], TOP_YT.scaleAll]
  ],
  'demo-cluster-upgrade': [
    [["Kubernetes Version Skew Policy & Pre-Flight kubeadm upgrade plan", yt("KodeKloud KillerShell kubernetes version skew kubeadm upgrade plan"), "Verifies control-plane-first (+1 minor) skew constraints and deprecated API checks before upgrading."], TOP_YT.k8sArch],
    [TOP_YT.killerCks, TOP_YT.etcdProd],
    [TOP_YT.drain, ["Rolling Worker Node Upgrades: Cordon -> Drain -> Upgrade -> Uncordon", yt("kubeadm upgrade worker node cordon drain apt upgrade uncordon"), "Demonstrates draining workloads node-by-node while preserving service availability via ReplicaSets and PDBs."]]
  ],
  'demo-add-user-kubeconfig': [
    [["Generating X.509 Keys, CSRs & Approving Certificates in K8s", yt("kubernetes create user X.509 CSR CertificateSigningRequest approve"), "Demonstrates openssl private key + CSR creation, base64 encoding into a K8s CSR manifest, and certificate issuance."], TOP_YT.authzModes],
    [["Building Multi-Context kubeconfig Files & Binding User RBAC", yt("kubectl config set-credentials set-context kubeconfig user RBAC"), "Binds client keys/certs into ~/.kube/config contexts and grants least-privilege namespace access via RoleBinding."], TOP_YT.apiLifecycle]
  ],
  'telepresence-architecture-basics': [
    [TOP_YT.tpIntro, ["Solving the Slow Docker-Build-Push-Deploy Inner Dev Loop", yt("kubernetes local development slow docker rebuild inner loop telepresence"), "Measures time lost per code tweak in remote clusters vs instant local process iteration with Telepresence."]],
    [TOP_YT.tpTools, ["Telepresence Architecture: Local Daemon VIF, Traffic Manager & Agent", yt("telepresence architecture root daemon VIF traffic manager sidecar agent"), "Maps TUN virtual network routing on your laptop alongside in-cluster Traffic Manager proxy orchestration."]],
    [TOP_YT.tpDebug, ["Demo: telepresence helm install & connect Into Remote DNS", yt("telepresence helm install connect curl cluster service demo"), "Connects directly to internal <svc>.<ns> cluster hostnames and verifies live connectivity from the local terminal."]]
  ],
  'telepresence-intercept-env-volumes': [
    [TOP_YT.tpTools, ["Global vs Personal Header-Isolated Service Intercepts", yt("telepresence intercept global vs personal header isolation x-telepresence-intercept-id"), "Demonstrates routing only HTTP requests matching your personal header to localhost without disrupting teammates."]],
    [TOP_YT.tpDebug, ["Syncing Cluster ConfigMaps & Secrets Into Local --env-file", yt("telepresence intercept --env-file env-json kubernetes secrets local"), "Captures exact remote Pod environment variables cleanly so local processes match cluster configuration."]],
    [TOP_YT.tpIntro, ["Mounting Remote Kubernetes PersistentVolumes Locally (--mount)", yt("telepresence intercept --mount local macFUSE remote volumes"), "Exposes remote Pod mounted TLS certs, configs, and PV files onto a local directory path transparently."]]
  ],
  'telepresence-docker-workflow': [
    [TOP_YT.tpDebug, ["Sandboxed Local Dev With telepresence intercept --docker-run", yt("telepresence intercept --docker-run network container workflow"), "Combines Telepresence intercepts with isolated Docker runtime containers, preventing host OS port/filesystem pollution."]]
  ],
  'cks-cis-kubebench': [
    [TOP_YT.gvrCksList, ["Auditing Control Plane, etcd & Kubelet With kube-bench CIS Profiles", yt("Learn with GVR kube-bench CIS Kubernetes benchmark audit master node"), "Runs Aqua kube-bench targets across master, etcd, and node profiles to pinpoint failing CIS security checks."]],
    [TOP_YT.cyberCks]
  ],
  'cks-os-hardening': [
    [["Attack Surface Reduction: Removing Unused Packages, Ports & Modules", yt("CKS OS hardening open ports ss systemctl disable kernel modules"), "Uses ss/lsof, systemctl cleanup, and modprobe blacklists to strip unnecessary network listeners and kernel modules."], TOP_YT.falcoCks],
    [TOP_YT.killerCks, TOP_YT.internals]
  ],
  'cks-imds-metadata': [
    [["Blocking SSRF Attacks on Cloud Instance Metadata (169.254.169.254)", yt("Kubesimplify CyberSecure86 kubernetes block IMDS 169.254.169.254 CKS"), "Demonstrates enforcing egress NetworkPolicy ipBlock rules so compromised Pods cannot steal node IAM credentials."], TOP_YT.lfEbpfSec]
  ],
  'cks-auditing-ciphers': [
    [["Writing Kubernetes Audit Policies Without Leaking Sensitive Payloads", yt("KillerShell Kubesimplify kubernetes audit policy CKS secrets"), "Configures rule stages and levels (None for Secrets/health, Metadata/RequestResponse for ConfigMaps & Pods)."], TOP_YT.apiLifecycle]
  ],
  'cks-seccomp-apparmor-tracee': [
    [TOP_YT.lfEbpfSec, ["Profiling & Enforcing Custom Localhost Seccomp Syscall Profiles", yt("Learn with GVR KillerShell CKS custom seccomp profile localhost json"), "Captures minimal required syscalls with Tracee and loads custom JSON seccomp rules via /var/lib/kubelet/seccomp."]],
    [TOP_YT.killerCks, TOP_YT.gvrCksList]
  ],
  'cks-runtimes-gvisor-kata': [
    [TOP_YT.cyberCks]
  ],
  'cks-supply-chain': [
    [TOP_YT.supply, ["Scanning Images w/ Trivy & Generating SPDX/CycloneDX SBOMs", yt("Trivy vulnerability scan SBOM SPDX CycloneDX distroless container CKS"), "Strips shells via distroless bases, exports verifiable SBOM manifests, and blocks CRITICAL CVEs in CI."]],
    [TOP_YT.opaGate, ["Static YAML Linting (KubeLinter/kubesec) & ImagePolicyWebhook", yt("KubeLinter kubesec static scan ImagePolicyWebhook kubernetes CKS"), "Catches insecure YAML manifests pre-merge and configures apiserver ImagePolicyWebhook signature verification."]]
  ],
  'reconciliation-loop': [
    [["Why Level-Triggered Reconciliation Outperforms Event Callbacks", yt("kubernetes reconciliation loop level-triggered state machine operator"), "Explains handling out-of-order events and missed notifications cleanly by always inspecting full current state."], TOP_YT.opNana],
    [["The Observe & Diff Phase: Cached Informer Reads Without API Storms", yt("operator controller Reconcile observe diff cached informer client"), "Shows querying local SharedInformer caches to build an exact snapshot of child Deployments and Services."], TOP_YT.apiPerf],
    [TOP_YT.opGo, ["Writing Idempotent Mutations Safe for 1 or 100 Re-Runs", yt("kubernetes controller idempotent createOrUpdate reconcile loop"), "Ensures repeated Reconcile() executions converge cleanly toward desired state with zero duplicate resource errors."]],
    [["Closing the Loop: Updating .status Conditions & Result Return Codes", yt("kubernetes operator update status subresource RequeueAfter result"), "Demonstrates updating Status conditions before returning empty Result{} vs RequeueAfter backoff schedules."], TOP_YT.leader]
  ],
  'informers-workqueue': [
    [["Inside Reflector: Initial LIST + HTTP/2 Streamed WATCH Checkpoints", yt("client-go Reflector ListAndWatch resourceVersion 410 Gone"), "Follows initial List caching, bookmarking latest resourceVersion, and automatic relist recovery after watch expiry."], TOP_YT.apiPerf],
    [TOP_YT.vivekClientGo, TOP_YT.internals],
    [["Sharing One RAM Cache Across Many Controllers (SharedInformer)", yt("client-go SharedInformerFactory multi controller shared watch cache"), "Demonstrates fanning out a single API watch connection across independent controller EventHandlers with zero extra load."], TOP_YT.opGo],
    [["RateLimiting WorkQueue: Key-Only Processing & Exponential Backoff", yt("client-go workqueue RateLimitingInterface exponential backoff Forget Done"), "Explains why queues store \"ns/name\" keys instead of stale structs so workers always reconcile the freshest object version."], TOP_YT.leader]
  ],
  'crd-anatomy-gvk': [
    [["Decoding GVK (Go Type Identity) vs GVR (API REST Path)", yt("kubernetes GVK GroupVersionKind vs GVR GroupVersionResource RESTMapping"), "Maps schema.GroupVersionKind onto pluralized URL segments via RESTMapper discovery lookups."], TOP_YT.apiLifecycle],
    [["OpenAPI v3 Structural Schemas & Automatic Unknown Field Pruning", yt("kubernetes CRD structural schema preserve-unknown-fields pruning"), "Shows why Kubernetes rejects ambiguous types and automatically drops undeclared fields before etcd storage."], TOP_YT.celAdmission],
    [["Architecting Namespaced vs Cluster-Scoped Platform CRDs", yt("kubernetes CRD scope Namespaced vs Cluster scoped multi tenant design"), "Compares tenant-owned application CRDs against cluster infrastructure resources like StorageClass or ClusterPolicy."], TOP_YT.opNana],
    [["Polishing CRD CLI UX: shortNames, Categories & PrinterColumns", yt("kubernetes CRD shortNames categories additionalPrinterColumns kubectl UX"), "Makes custom resources feel native in kubectl get, kubectl get all, and table output views."], TOP_YT.opGo]
  ],
  'cr-lifecycle-subresources': [
    [["Splitting Spec vs Status Ownership With the /status Subresource", yt("kubernetes CRD status subresource spec generation isolation RBAC"), "Prevents infinite reconcile loops where controller status writes would otherwise bump metadata.generation."], TOP_YT.opGo],
    [["Preventing Stale UI Reads Using observedGeneration Tracking", yt("kubernetes observedGeneration status generation sync check"), "Explains why comparing observedGeneration == generation proves a controller has finished evaluating the latest Spec."], TOP_YT.opNana],
    [["Standardizing Multi-Signal Health With metav1.Condition Slices", yt("kubernetes metav1.Condition Ready Degraded Progressing status best practices"), "Replaces naive string phases with independent, time-stamped Condition types compatible with kstatus & Argo CD."], TOP_YT.argoProd],
    [["Enabling Native kubectl scale & HPA Targeting With /scale Subresource", yt("kubernetes CRD scale subresource specReplicasPath statusReplicasPath HPA"), "Maps custom replica fields so standard HPA controllers and kubectl scale work out of the box without custom code."], TOP_YT.scaleAll]
  ],
  'client-go-scratch': [
    [["Bootstrapping rest.Config: InCluster ServiceAccount vs Local Kubeconfig", yt("client-go rest.InClusterConfig clientcmd BuildConfigFromFlags"), "Handles seamless binary execution both inside development terminals (~/.kube/config) and production Pods."]],
    [TOP_YT.vivekDynamic, TOP_YT.internals],
    [["Wiring SharedInformerFactory, EventHandlers & Rate-Limited Queues", yt("client-go NewSharedInformerFactory ResourceEventHandlerFunc AddFunc UpdateFunc"), "Builds a raw Go controller from scratch without controller-runtime abstractions to understand every moving part."], TOP_YT.opGo],
    [TOP_YT.ardanConcurrency, TOP_YT.leader]
  ],
  'controller-runtime-internals': [
    [["ctrl.Manager: Orchestrating Shared Caches, Schemes & Healthz Endpoints", yt("controller-runtime ctrl.Manager Scheme Cache Healthz Readyz"), "Traces how Manager wires signal contexts, metrics servers, leader locks, and shared informers on startup."], TOP_YT.opGo],
    [["The Split Client: Ultra-Fast Cached Reads vs Direct API Server Writes", yt("controller-runtime split client cached reader direct writer cache lag"), "Explains read-after-write cache lag awareness when reading via Informer RAM cache vs writing straight to kube-apiserver."], TOP_YT.apiPerf],
    [["Filtering Noisy Status/Watch Events With Predicates Before Enqueue", yt("controller-runtime predicate GenerationChangedPredicate watch event filtering"), "Uses GenerationChangedPredicate and custom filters so harmless status updates never trigger redundant Reconcile() calls."], TOP_YT.internals],
    [["Controlling WorkQueue Backoff & Timers With (ctrl.Result, error)", yt("controller-runtime ctrl.Result Requeue RequeueAfter error matrix"), "Clarifies exact queue outcomes across returning nil, RequeueAfter(d), Requeue: true, or non-nil errors."], TOP_YT.opNana]
  ],
  'kubebuilder-scaffolding': [
    [TOP_YT.fccOperator, TOP_YT.opGo],
    [["Driving RBAC & OpenAPI Rules Directly From +kubebuilder Comments", yt("kubebuilder markers validation rbac subresource printcolumn"), "Uses declarative Go source comments to keep CRD validation schemas and ClusterRole RBAC synchronized automatically."], TOP_YT.celAdmission],
    [TOP_YT.vivekOperator, TOP_YT.helmKust],
    [["Fast Local Developer Inner Loop: make install && make run", yt("kubebuilder make install make run local operator against kind cluster"), "Runs your uncompiled operator process locally against kind/minikube with instant breakpoint debugging."], TOP_YT.tpDebug]
  ],
  'reconciler-ownerrefs': [
    [TOP_YT.opGo, ["Idempotent Child Sync Using controllerutil.CreateOrUpdate", yt("controller-runtime controllerutil CreateOrUpdate mutateFn operator"), "Demonstrates CreateOrUpdate reading existing children, mutating only desired fields cleanly, and avoiding no-op updates."]],
    [["Parent-Child Garbage Collection Metadata via SetControllerReference", yt("controllerutil SetControllerReference OwnerReference garbage collection Go"), "Stamps controller=true Ownership metadata onto generated Deployments/Services automatically in Go."], TOP_YT.internals],
    [["Instant Drift Self-Healing via .Owns() Secondary Informer Watches", yt("controller-runtime Builder Owns child resource drift healing Reconcile"), "Enqueues the parent Custom Resource immediately whenever anyone manually deletes or alters an owned child Deployment."], TOP_YT.argoProd],
    [["Zero-Code Cascading Cleanup via Kubernetes Garbage Collector", yt("kubernetes garbage collector foreground vs background cascading delete ownerRef"), "Follows K8s async GC sweeping child resources once the parent CR is deleted cleanly."], TOP_YT.deployRs]
  ],
  'finalizers-cleanup': [
    [TOP_YT.vivekFinalizer, ["Why OwnerReferences Cannot Clean Up External AWS/SaaS Resources", yt("kubernetes ownerReferences external resources limitation finalizer needed"), "Explains why K8s GC only tracks API objects and leaves external RDS databases or DNS records orphaned without hooks."]],
    [["Step 1: Registering Finalizers Safely Before External Provisioning", yt("controllerutil AddFinalizer ContainsFinalizer Go operator pattern"), "Adds the custom domain finalizer string BEFORE provisioning external infra to eliminate crash-window resource leaks."], TOP_YT.opGo],
    [["Step 2: Handling DeletionTimestamp Pauses During kubectl delete", yt("kubernetes DeletionTimestamp Zero check finalizer cleanup Terminating"), "Explains how kube-apiserver sets DeletionTimestamp and enters Terminating state rather than erasing etcd state immediately."], TOP_YT.etcdCore],
    [["Step 3: Idempotent Cloud Teardown & Unlocking Finalizer Removal", yt("controllerutil RemoveFinalizer external teardown retry Terminating fix"), "Verifies external resources return 404/Deleted idempotently before stripping the finalizer to complete etcd removal."], TOP_YT.leader]
  ],
  'webhooks-multiversion': [
    [TOP_YT.vivekWebhooks],
    [["Validator Hooks: Immutable Fields & Cross-Object Business Logic", yt("kubebuilder ValidatingWebhook ValidateUpdate immutable oldObj newObj"), "Uses ValidateCreate/ValidateUpdate callbacks to enforce state transitions and immutable fields referencing old objects."], TOP_YT.opaGate],
    [TOP_YT.celAdmission, ["Replacing Go Validation Webhooks With Inline CRD CEL Rules", yt("kubebuilder +kubebuilder:validation:XValidation CEL transition rule"), "Attaches zero-ops CEL expressions right onto Go struct fields so kube-apiserver validates without external pods."]],
    [["Multi-Version CRDs: Designing Hub-and-Spoke Conversion Webhooks", yt("kubebuilder multiversion CRD conversion webhook Hub Convertible"), "Implements ConvertTo/ConvertFrom against a canonical Hub version so v1alpha1 and v1beta1 clients coexist cleanly."], TOP_YT.apiPerf]
  ],
  'envtest-concurrency': [
    [["envtest Fast Integration Testing: Real kube-apiserver + etcd in ~2s", yt("kubebuilder envtest Ginkgo integration test real apiserver local"), "Boots real control plane binaries locally in tests to catch CRD schema, webhook, and finalizer bugs missed by fakes."], TOP_YT.opGo],
    [TOP_YT.ardanConcurrency, TOP_YT.leader],
    [["O(1) Secondary Lookups Using mgr.GetFieldIndexer() Cache Indexes", yt("controller-runtime GetFieldIndexer MatchingFields operator performance"), "Replaces O(N) full-list scans inside Reconcile() with fast hash-indexed in-memory lookups on spec fields."], TOP_YT.apiPerf],
    [TOP_YT.apiLifecycle, ["Server-Side Apply (SSA) Inside Operators: Zero 409 Races", yt("controller-runtime Server-Side Apply client.Apply ForceOwnership Go"), "Eliminates read-modify-write 409 Conflict loops by declaring exact field ownership slices with Server-Side Apply."]]
  ],
  'olm-classic-v0': [
    [["Operator Bundle Images: Packaging CRDs, CSVs & RBAC Into OCI Registries", yt("OLM v0 operator-sdk bundle Dockerfile manifests metadata CSV"), "Inspects bundle directories packaging ClusterServiceVersions, manifests, and channel annotations into immutable OCI images."], TOP_YT.supply],
    [["CatalogSource & Subscription: Subscribing to Channel Updates", yt("OLM CatalogSource Subscription InstallPlan automatic vs manual upgrade"), "Explains how CatalogSources index bundles over gRPC while Subscriptions trigger channel resolution."], TOP_YT.opNana],
    [["InstallPlan & CSV Deployment Lifecycle in OLM v0", yt("OLM InstallPlan ClusterServiceVersion operator deployment lifecycle"), "Traces how approved InstallPlans unpack manifests and spawn the operator Pod managed by the CSV."], TOP_YT.helmKust],
    [["Why OLM v0 Hit Scaling Limits (Motivating Declarative OLM v1)", yt("OLM v0 limitations vs OLM v1 ClusterExtension catalogd motivation"), "Analyzes v0 dependency-resolver complexity, CSV bloat, and cross-namespace RBAC pitfalls solved by OLM v1."], TOP_YT.argoProd]
  ],
  'olm-v1-architecture': [
    [["OLM v1 catalogd & ClusterCatalog: Fast Local HTTP Catalog Caching", yt("OLM v1 catalogd ClusterCatalog architecture HTTP cache"), "Explains replacing heavy per-catalog gRPC index Pods with lightweight file-based catalogd HTTP endpoints."], TOP_YT.apiPerf],
    [["ClusterExtension: One Declarative Resource Replacing Sub/IP/CSV", yt("OLM v1 ClusterExtension operator-controller declarative management"), "Shows pinning exact semver ranges in a single GitOps-friendly ClusterExtension CR resolved atomically by rukpak."], TOP_YT.argoProd],
    [["Least-Privilege Installer ServiceAccounts & Single Ownership", yt("OLM v1 ClusterExtension installer ServiceAccount single ownership RBAC"), "Demonstrates RBAC impersonation ensuring compromised bundles can never escalate past scoped installer permissions."], TOP_YT.authzModes],
    [["Deterministic Rollbacks & Continuous Bundle Drift Reconciliation", yt("OLM v1 ClusterExtension rollback drift reconciliation GitOps"), "Contrasts one-way OLM v0 updates against continuous drift healing and clean version pin rollbacks in v1."], TOP_YT.fluxTim]
  ],
  'production-ha-observability': [
    [TOP_YT.leader, ["Enabling LeaderElectionReleaseOnCancel for <1s Graceful Failover", yt("controller-runtime LeaderElectionReleaseOnCancel fast failover HA"), "Shows releasing Lease locks on SIGTERM so planned Deployment upgrades transfer leadership instantly without waiting 15s."]],
    [["Instrumenting Golden Operator Metrics (workqueue_depth & Errors)", yt("kubebuilder prometheus metrics workqueue_depth controller_runtime_reconcile_total"), "Exposes controller-runtime default workqueue, latency histograms, and custom domain Prometheus counters on :8080."], TOP_YT.scaleAll],
    [["Correlating Structured Zap JSON Logs With Kubernetes EventRecorder", yt("controller-runtime Zap structured logging EventRecorder kubectl describe"), "Separates high-cardinality debug V(1) logs from user-facing EventRecorder warnings inside kubectl describe."], TOP_YT.internals],
    [["Hardening Operator Pods: Distroless Non-Root & ReadOnlyRootFS", yt("kubebuilder operator distroless non-root readOnlyRootFilesystem RBAC"), "Ships minimal distroless static Go binaries dropping all capabilities under narrow namespace-scoped RBAC."], TOP_YT.falcoCks]
  ],
  'upgrades-capability-model': [
    [TOP_YT.opNana, ["Operator Capability Maturity Model: Levels 1 Through 5", yt("Kubernetes Operator Capability Model Basic Install to Auto Pilot"), "Breaks down Basic Install (L1), Seamless Upgrades (L2), Full Lifecycle (L3), Deep Insights (L4), and Auto Pilot (L5)."]],
    [["Expand-and-Contract Pattern for Zero-Downtime CRD Schema Upgrades", yt("kubernetes zero downtime CRD upgrade expand contract never kubectl delete crd"), "Prevents catastrophic Custom Resource wipes by introducing additive optional fields before deprecating old versions."], TOP_YT.deployRs],
    [["Decoupling Operator Version From Managed DB Version & Pause Annotations", yt("kubernetes operator version skew pause annotation rollout wave"), "Supports pause flags and independent spec.imageVersion pins so operator patches never force unexpected DB restarts."], TOP_YT.opGo],
    [TOP_YT.argoProd, ["Multi-Cluster Operator Fleet Upgrades With Argo CD ServerSideApply=true", yt("argocd ServerSideApply=true CRD 256KB annotation limit gitops"), "Avoids client-side kubectl last-applied-configuration 256KB annotation explosions when syncing huge CRD fleets."]]
  ]
};
