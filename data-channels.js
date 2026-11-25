/* =========================================================================
   CURATED YOUTUBE CHANNELS & RESOURCE HUB DATA
   ========================================================================= */

const CURATED_YOUTUBE_CHANNELS = [
  {
    id: 'kubesimplify',
    name: 'Kubesimplify',
    handle: '@kubesimplify',
    url: 'https://www.youtube.com/@kubesimplify',
    certs: ['CKS', 'CKA', 'CNPE', 'OPERATOR'],
    specialty: 'eBPF, Falco CKS, Gateway API & Cloud-Native Workshops',
    summary: 'Founded by Saiyam Pathak — hands-on cloud-native deep dives covering Kubernetes CKS runtime defense, Falco rules, Cilium eBPF, Gateway API, and production operators.',
    featured: [
      TOP_YT.falcoCks,
      ['Kubesimplify CKS & Cloud-Native Deep Dives', yt('Kubesimplify Kubernetes CKS Certification eBPF Gateway API Operators'), 'Workshops on CKS security scenarios, eBPF networking, Gateway API traffic management, and Kubernetes operators.']
    ],
    relatedLessons: ['ebpf-cilium-calico-falco', 'cks-seccomp-apparmor-tracee', 'olm-v1-architecture', 'ingress-gateway']
  },
  {
    id: 'varjosh',
    name: 'Cloud With VarJosh',
    handle: '@CloudWithVarjosh',
    url: 'https://www.youtube.com/@CloudWithVarjosh',
    certs: ['CKA', 'CKS'],
    specialty: 'API Server, AuthZ/RBAC, Scheduling, etcd & CoreDNS',
    summary: 'Structured CKA & cluster internals series by Varun Joshi breaking down kube-apiserver authorization modes, etcd trade-offs, Taints/Affinity, CoreDNS, and live cluster troubleshooting.',
    featured: [
      TOP_YT.authzModes,
      ['Understanding etcd Trade-Offs & CKA Troubleshooting', yt('Cloud With VarJosh Understanding etcd Trade-Offs Control Plane Troubleshooting CKA'), 'Walks through etcd consensus limits, CoreDNS FQDN lookups, Taints vs Affinity, and broken control plane diagnosis.']
    ],
    relatedLessons: ['cp-request-flow', 'rbac-authz', 'etcd-raft-mvcc', 'coredns-nodelocal', 'taints-tolerations', 'all-failure-modes']
  },
  {
    id: 'killershell',
    name: 'KillerShell',
    handle: '@killershell',
    url: 'https://www.youtube.com/@killershell',
    certs: ['CKS', 'CKA', 'CKAD'],
    specialty: 'Exam Simulator Walkthroughs, AppArmor, Seccomp & Upgrades',
    summary: 'Created by Kim Wuestkamp (author of the killer.sh CKA/CKS/CKAD simulators) — crisp tactical problem-solving for CKS runtime hardening, AppArmor profiles, kube-bench, and kubeadm upgrades.',
    featured: [
      ['KillerShell CKS Exam Simulations & Kernel Hardening', yt('KillerShell CKS Question Breakdown AppArmor Seccomp Upgrade'), 'Step-by-step walkthroughs solving killer.sh AppArmor, custom seccomp, auditing, and cluster upgrade challenges.']
    ],
    relatedLessons: ['cks-seccomp-apparmor-tracee', 'cks-auditing-ciphers', 'cks-os-hardening', 'demo-cluster-upgrade']
  },
  {
    id: 'learnwithgvr',
    name: 'Learn with GVR',
    handle: '@learnwithgvr',
    url: 'https://www.youtube.com/@learnwithgvr',
    certs: ['CKS', 'CKA'],
    specialty: 'OPA Gatekeeper, Falco Alerting & CKS Security Playlist',
    summary: 'Hosted by Ramana Gali — focused CKS exam preparation playlist featuring hands-on labs with OPA Gatekeeper Rego constraints, Falco eBPF alerts, SecurityContext, and kube-bench CIS remediations.',
    featured: [
      TOP_YT.opaGate,
      TOP_YT.gvrCksList
    ],
    relatedLessons: ['policies-opa-kyverno-cel', 'admission-webhooks', 'cks-cis-kubebench', 'pod-security-runtime']
  },
  {
    id: 'cybersecure86',
    name: 'CyberSecure86',
    handle: '@CyberSecure86',
    url: 'https://www.youtube.com/@CyberSecure86',
    certs: ['CKS'],
    specialty: 'CKS Cluster Hardening, Sandboxing & Supply Chain',
    summary: 'Dedicated CKS certification and Kubernetes defensive security channel covering CIS benchmarks, microservice mTLS/Cilium isolation, IMDS SSRF mitigation, and gVisor/Kata runtime isolation.',
    featured: [
      ['CyberSecure86 CKS Hardening & Microservices Isolation', yt('CyberSecure86 CKS Kubernetes Security Hardening Isolation'), 'Covers high-weight CKS security domains, pod-to-pod isolation, kube-bench fixes, and pre-exam hardening checklists.']
    ],
    relatedLessons: ['cks-cis-kubebench', 'cks-imds-metadata', 'cks-runtimes-gvisor-kata', 'cks-supply-chain']
  },
  {
    id: 'viveksinghggits',
    name: 'Vivek Singh',
    handle: '@viveksinghggits',
    url: 'https://www.youtube.com/@viveksinghggits',
    certs: ['OPERATOR', 'CNPE'],
    specialty: 'client-go, Informers, Finalizers, Webhooks & Go Operators',
    summary: 'One of the clearest Go-on-Kubernetes engineering channels on YouTube — multi-part code walkthroughs covering client-go, Dynamic Clients, SharedInformerFactory, WorkQueues, Finalizers, and writing Operators from scratch.',
    featured: [
      TOP_YT.vivekFinalizer,
      ['Basics of client-go & Writing K8s Operators in Go', yt('Vivek Singh client-go kubernetes dynamic client informer workqueue'), 'Covers kubeconfig rest.Config, Informer caches, RateLimiting WorkQueues, custom Admission Webhooks, and Operator packaging.']
    ],
    relatedLessons: ['client-go-scratch', 'informers-workqueue', 'finalizers-cleanup', 'webhooks-multiversion', 'controllers-operators']
  },
  {
    id: 'ardanlabs',
    name: 'Ardan Labs',
    handle: '@ardanlabs',
    url: 'https://www.youtube.com/@ardanlabs',
    certs: ['OPERATOR', 'CKAD', 'CNPE'],
    specialty: 'Ultimate Go, Goroutine Concurrency & Graceful SIGTERM Services',
    summary: 'Taught by Bill Kennedy — production Go systems engineering focused on context.Context cancellation propagation, bounded goroutine concurrency, HTTP load shedding, and Kubernetes graceful service shutdown.',
    featured: [
      ['Go Web Services w/ Kubernetes: Concurrency & Shutdown', yt('Ardan Labs Go Web Services Kubernetes Concurrency Graceful Shutdown Context'), 'Explains parent-child context trees, preventing goroutine leaks in controllers/services, and clean SIGTERM request draining.']
    ],
    relatedLessons: ['pods-multicontainer', 'client-go-scratch', 'envtest-concurrency', 'controller-runtime-internals']
  },
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp.org',
    handle: '@freecodecamp',
    url: 'https://www.youtube.com/@freecodecamp',
    certs: ['CKA', 'CKAD', 'OPERATOR', 'CNPE'],
    specialty: 'Full-Length Kubernetes, CKA & Kubebuilder Go Operator Courses',
    summary: 'Long-form zero-to-production courses covering Certified Kubernetes Administrator (CKA) cluster operations and building real Go Kubernetes Operators with Kubebuilder and controller-runtime.',
    featured: [
      ['Build Kubernetes Operators w/ Go & Kubebuilder (Full Course)', yt('freeCodeCamp Build Your Own Kubernetes Operators Go Kubebuilder'), 'End-to-end project building custom CRDs, reconcilers, and external cloud controllers cleanly in Go.']
    ],
    relatedLessons: ['kubebuilder-scaffolding', 'controllers-operators', 'rbac-authz', 'all-failure-modes']
  },
  {
    id: 'cncf',
    name: 'CNCF [Cloud Native Computing Foundation]',
    handle: '@cncf',
    url: 'https://www.youtube.com/@cncf',
    certs: ['CNPE', 'CKA', 'CKS', 'OPERATOR'],
    specialty: 'KubeCon + CloudNativeCon Deep Dives (etcd, API, Cilium, GitOps, OLM)',
    summary: 'Home of official KubeCon + CloudNativeCon engineering sessions directly from Kubernetes SIG maintainers covering API performance, etcd Raft internals, eBPF, Istio Ambient, Sigstore, Leader Election, and Telepresence.',
    featured: [
      TOP_YT.apiPerf,
      TOP_YT.etcdDeep,
      TOP_YT.ebpfProxy,
      TOP_YT.leader
    ],
    relatedLessons: ['cp-request-flow', 'hub-watch-cache', 'etcd-raft-mvcc', 'leader-election', 'service-mesh-istio', 'telepresence-architecture-basics']
  },
  {
    id: 'linuxfoundation',
    name: 'The Linux Foundation',
    handle: '@LinuxfoundationOrg',
    url: 'https://www.youtube.com/@LinuxfoundationOrg',
    certs: ['CKA', 'CKS', 'CKAD'],
    specialty: 'Official Certification Prep, cgroups, Namespaces & eBPF Security',
    summary: 'Official Linux Foundation training webinars and container/kernel fundamentals covering Linux namespaces, cgroups v2 isolation, CKA/CKS certification guidance, and eBPF-powered Kubernetes security.',
    featured: [
      TOP_YT.lfEbpfSec,
      ['Linux Foundation & CNCF: Kubernetes & Containers Fundamentals', yt('Linux Foundation CNCF Kubernetes Containers Fundamentals cgroups'), 'Foundational training on container primitives, cgroups resource limits, and Kubernetes architecture.']
    ],
    relatedLessons: ['kubelet-cri-node', 'node-lifecycle-conditions', 'ebpf-cilium-calico-falco', 'cks-seccomp-apparmor-tracee']
  },
  {
    id: 'piyush',
    name: 'Tech Tutorials with Piyush',
    handle: '@TechTutorialswithPiyush',
    url: 'https://www.youtube.com/@TechTutorialswithPiyush',
    certs: ['CKA', 'CKAD'],
    specialty: '40-Day CKA Series, Workloads, Storage, HPA/VPA & Gateway API',
    summary: 'Practical, visual hands-on walkthroughs covering Pods, ReplicaSets & Deployments, StatefulSets, DaemonSets, Jobs/CronJobs, PV/PVC/StorageClasses, HPA vs VPA, Ingress/Gateway API, and NetworkPolicies.',
    featured: [
      TOP_YT.deployRs,
      TOP_YT.hpaVpa,
      ['40-Day CKA Series: StatefulSets, Storage & NetworkPolicies', yt('Tech Tutorials with Piyush kubernetes statefulset daemonset PV PVC Gateway API'), 'Hands-on YAML tutorials for core Kubernetes workloads, sticky database storage, and east-west traffic isolation.']
    ],
    relatedLessons: ['pods-multicontainer', 'pod-lifecycle-stages', 'replicasets-deployments-deep', 'stateful-daemon-jobs', 'pv-pvc-csi', 'hpa-deep-dive', 'vpa-deep-dive', 'ingress-gateway', 'network-policies']
  },
  {
    id: 'beau',
    name: 'Beau Carnes',
    handle: '@beau',
    url: 'https://www.youtube.com/@beau',
    certs: ['CKA', 'CKAD'],
    specialty: 'Developer Deep Dives, CKA Prep & Cloud-Native Tooling',
    summary: 'Developer educator behind many popular freeCodeCamp & cloud-native full courses — clear structured walkthroughs of Kubernetes cluster administration, RBAC concepts, containers, and DevOps fundamentals.',
    featured: [
      ['Beau Carnes / freeCodeCamp: CKA Exam Prep & RBAC', yt('freeCodeCamp Beau Carnes Certified Kubernetes Administrator CKA'), 'Structured developer walkthrough of Kubernetes control plane concepts, RBAC least privilege, and CKA troubleshooting.']
    ],
    relatedLessons: ['rbac-authz', 'demo-kubeadm-eks-install', 'all-failure-modes']
  },
  {
    id: 'kodekloud',
    name: 'KodeKloud',
    handle: '@KodeKloud',
    url: 'https://www.youtube.com/@KodeKloud',
    certs: ['CKA', 'CKAD', 'CKS', 'CNPE'],
    specialty: 'Visual Architecture, kubeadm Setup, Taints/Affinity & Helm',
    summary: 'Renowned visual Kubernetes tutorials by Mumshad Mannambeth covering control-plane component interactions, kubeadm cluster bootstrapping and upgrades, Taints & Tolerations, and Helm chart workflows.',
    featured: [
      TOP_YT.k8sArch,
      ['KodeKloud: kubeadm Setup, Taints & Helm Visual Series', yt('KodeKloud kubernetes setup kubeadm Taints Tolerations What is Helm'), 'Clear animated explanations of cluster scheduling rules, kubeadm init/join steps, and Helm chart packaging.']
    ],
    relatedLessons: ['kubelet-cri-node', 'taints-tolerations', 'helm-charts-advanced', 'demo-kubeadm-eks-install', 'demo-cluster-upgrade']
  }
];
