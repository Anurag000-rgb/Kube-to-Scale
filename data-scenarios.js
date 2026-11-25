/* =========================================================================
   PRACTICE SCENARIO Q&A BANK (TECHNICAL + LAYMAN LANGUAGE + CLEAN YAML)
   ========================================================================= */

const PRACTICE_SCENARIO_BANK = [
  {
    id: 'sc-ha', cat: 'Architecture & HA', cert: 'CKA',
    title: 'Q1. Frequent Downtimes -> High Availability Architecture',
    scenario: 'Your firm is experiencing frequent application downtimes. How would you leverage Kubernetes to achieve high availability?',
    answer: 'Deploy stateless workloads using Deployments (multiple replicas across zones via PodAntiAffinity) and stateful workloads using StatefulSets (unique identity + persistent PVCs). Place a Kubernetes Service in front to load-balance across Ready Pods, and configure Liveness + Readiness probes so unhealthy Pods auto-restart and only healthy Pods receive traffic.',
    layman: 'Imagine a team of identical toy robots cleaning your room. If one robot breaks, the others keep working without interruption. Kubernetes keeps multiple copies (robots) running, checks their health automatically, spreads them across different rooms (zones) in case one loses power, and adds more robots when the room gets busier.',
    yaml: `apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: api-ha }\nspec:\n  replicas: 3\n  template:\n    spec:\n      affinity:\n        podAntiAffinity:\n          preferredDuringSchedulingIgnoredDuringExecution:\n          - weight: 100\n            podAffinityTerm:\n              labelSelector: { matchLabels: { app: api } }\n              topologyKey: topology.kubernetes.io/zone`
  },
  {
    id: 'sc-zdt', cat: 'Deployments & Scaling', cert: 'CKAD',
    title: 'Q2. Zero-Downtime Deployments (RollingUpdate, Helm & ArgoCD)',
    scenario: 'How can your company ensure zero-downtime deployments with Kubernetes? What strategies and tools would you use?',
    answer: 'Use the RollingUpdate strategy with `maxUnavailable: 0` and `maxSurge: 1` (or `25%`) alongside a `readinessProbe` (and `preStop: sleep 5`) so new Pods pass health checks before old Pods drain. For complex releases and instant audited rollbacks, pair with Helm (`--atomic`) or ArgoCD GitOps.',
    layman: 'Like upgrading old cash registers in a busy toy store one at a time: you set up and test a new register before closing an old one (`maxUnavailable: 0`), optionally add a temporary extra register (`maxSurge: 1`), and keep the old register handy in case you need to switch right back.',
    yaml: `strategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxUnavailable: 0\n    maxSurge: 1`
  },
  {
    id: 'sc-res', cat: 'Deployments & Scaling', cert: 'CKAD',
    title: 'Q3. Optimize Resource Utilization (Requests, Limits, HPA & VPA)',
    scenario: 'Your firm wants to optimize cluster resource utilization and stop noisy neighbors. How would you manage resources efficiently?',
    answer: 'Define `resources.requests` (guaranteed scheduling CPU/RAM) and `resources.limits` (hard ceiling preventing starvation) on every container. Use HPA to scale Pod replicas horizontally on CPU/RAM/custom metrics, and VPA (Vertical Pod Autoscaler) to right-size requests/limits from real usage monitored via Prometheus & Grafana.',
    layman: 'Like a smart school organizer sharing classroom supplies: every student gets a guaranteed starter kit (`requests`), nobody can hoard the whole closet (`limits`), extra classrooms open when more kids arrive (`HPA`), and kit sizes adjust automatically based on what students actually use (`VPA`).',
    yaml: `resources:\n  requests: { cpu: "250m", memory: "256Mi" }\n  limits:   { cpu: "500m", memory: "512Mi" }`
  },
  {
    id: 'sc-multicloud', cat: 'Architecture & HA', cert: 'CNPE',
    title: 'Q4. Managing Kubernetes Across Multiple Cloud Providers',
    scenario: 'Your firm has a multi-cloud strategy (AWS + GCP + Azure). How would you manage clusters consistently across providers?',
    answer: 'Use a centralized fleet control plane (Rancher, Google Anthos, or Azure Arc), provision identical cluster baselines via Infrastructure as Code (Terraform / Pulumi), deliver apps consistently with pull-based GitOps (ArgoCD / Flux), and unify cross-cluster service discovery & observability (Istio / Cilium ClusterMesh + Prometheus/Grafana).',
    layman: 'Like running coffee shops in different cities from one headquarters dashboard: Rancher/Anthos is your single screen, Terraform is the uniform store guidebook, GitOps CI/CD restocks every branch identically, Istio connects inter-shop supply messages, and Prometheus tracks sales everywhere.',
    yaml: `# Consistent multi-cluster GitOps via ArgoCD ApplicationSet\ngenerators:\n- clusters:\n    selector: { matchLabels: { env: prod } }`
  },
  {
    id: 'sc-secdata', cat: 'Security & Compliance', cert: 'CKS',
    title: 'Q5. Securing Sensitive Data, Secrets & Cluster Traffic',
    scenario: 'How can your company secure sensitive data (API keys, DB passwords, PII) in Kubernetes?',
    answer: 'Enforce least-privilege RBAC, store credentials in Kubernetes Secrets encrypted at rest in etcd (`EncryptionConfiguration` with KMS v2 / AES-CBC) or external HashiCorp Vault, enforce Default-Deny NetworkPolicies, enable encrypted cloud PVs, and log access via Kubernetes Audit Logging.',
    layman: 'Think of a guarded school: only authorized teachers have keys (`RBAC`), exam answers sit in a locked safe (`Secrets` encrypted in etcd), hallways restrict which classrooms can talk (`NetworkPolicies`), lockers are encrypted (`encrypted PVs`), and security cameras log every entry (`Audit Logging`).',
    yaml: `--encryption-provider-config=/etc/kubernetes/enc/enc.yaml\n# Rewrite existing secrets so they are encrypted at rest:\nkubectl get secrets -A -o json | kubectl replace -f -`
  },
  {
    id: 'sc-velero', cat: 'Storage & Backup', cert: 'CKA',
    title: 'Q6. Comprehensive Backup & Disaster Recovery With Velero',
    scenario: 'Your firm relies on stateful Kubernetes apps and needs reliable backups and fast disaster recovery. How would you design this?',
    answer: 'Deploy Velero backed by immutable cloud object storage (S3/GCS/Azure Blob) on scheduled intervals to capture both cluster manifests (YAML/CRDs) and CSI `VolumeSnapshot` disk backups. Automate periodic restore drills into a staging cluster and configure Prometheus alerts on Velero backup failures.',
    layman: 'Like taking nightly snapshots of a huge school project and storing them in Google Drive: Velero captures both the project outline (Kubernetes YAMLs) and attached notebooks (`VolumeSnapshot`), and you periodically test restoring into a spare binder (staging) to verify recovery works.',
    yaml: `velero schedule create nightly-prod \\\n  --schedule="0 2 * * *" \\\n  --include-namespaces prod \\\n  --snapshot-volumes=true`
  },
  {
    id: 'sc-perf', cat: 'Troubleshooting', cert: 'CKA',
    title: 'Q7. Systematic Performance Diagnosis (Metrics, Logs & Tracing)',
    scenario: 'Users report slow latency and timeouts in Kubernetes apps. How do you systematically diagnose and resolve the bottleneck?',
    answer: '1) Check `kubectl top nodes/pods` and Prometheus/Grafana dashboards for CPU throttling or memory pressure. 2) Aggregate logs via EFK/Loki. 3) Trace microservice hops with Jaeger/Zipkin (OpenTelemetry) to pinpoint slow spans. 4) Tune requests/limits, scale replicas/nodes, and benchmark with k6 or JMeter.',
    layman: 'Like fixing long coffee shop queues: install cameras (`Prometheus/Grafana`) to spot slow counters, review shift logs (`EFK/Loki`), check which barista is overloaded (`kubectl top`), follow a single customer order end-to-end (`Jaeger tracing`), then add counters or stress-test with rush-hour drills (`k6`).',
    yaml: `kubectl top pods -n prod --sort-by=cpu\nkubectl top nodes`
  },
  {
    id: 'sc-canary', cat: 'Deployments & Scaling', cert: 'CNPE',
    title: 'Q8. Canary Deployments With Istio / Gateway API & Argo Rollouts',
    scenario: 'How would you safely roll out a risky new version to a small slice of users before promoting to 100%?',
    answer: 'Deploy the canary alongside the stable version and shift 5%–10% of live traffic using Gateway API `HTTPRoute` weights or Istio `VirtualService`. Monitor 5xx/p99 latency via Argo Rollouts AnalysisTemplates to automatically promote toward 100% or abort and revert to stable instantly.',
    layman: 'Like putting a new book on one small featured shelf (5% of bookstore visitors) before replacing your whole inventory: if shoppers love it, expand the display gradually; if reviews drop, pull the small shelf immediately with minimal impact.',
    yaml: `apiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nspec:\n  rules:\n  - backendRefs:\n    - { name: app-v1, port: 80, weight: 95 }\n    - { name: app-v2, port: 80, weight: 5 }`
  },
  {
    id: 'sc-residency', cat: 'Security & Compliance', cert: 'CNPE',
    title: 'Q9. Complying With Strict Regional Data Residency Laws',
    scenario: 'Your firm must comply with strict data residency (GDPR/regional boundaries). How do you manage Kubernetes clusters & storage?',
    answer: 'Pin dedicated clusters inside compliant cloud regions/on-prem DCs, bind workloads to regional/zonal `StorageClass` tiers (and regional backup buckets), enforce cross-region egress `NetworkPolicies`, manage multi-region compliance policies via Fleet/GitOps, and run continuous compliance audits.',
    layman: 'Like running regional warehouses where local laws forbid shipping items across borders: each warehouse (`cluster`) sits inside the legal zone, uses region-locked storage rooms (`StorageClass`), enforces strict border gates (`NetworkPolicies`), and passes regular legal inspections.',
    yaml: `apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata: { name: eu-frankfurt-gp3 }\nprovisioner: ebs.csi.aws.com\nallowedTopologies:\n- matchLabelExpressions:\n  - { key: topology.kubernetes.io/zone, values: [eu-central-1a, eu-central-1b] }`
  },
  {
    id: 'sc-monolith', cat: 'Architecture & HA', cert: 'CNPE',
    title: 'Q10. Migrating a Monolith to Microservices on Kubernetes',
    scenario: 'How would you decompose a monolith into microservices on Kubernetes, migrate databases, and maintain reliability?',
    answer: 'Carve bounded service domains iteratively (Strangler Fig pattern), containerize each via multi-stage builds & CI/CD, deploy with Deployments/StatefulSets + Services, add a Service Mesh (Istio/Linkerd) for mTLS & retries, migrate data carefully via dual-write/CDC replication before cutover, and instrument Prometheus + OpenTelemetry.',
    layman: 'Like turning a single giant book room into a modern library with separate Fiction, Science, and Kids wings: build the new rooms (`clusters/namespaces`), move shelves gradually (`Strangler Fig`), add hallways (`Services`) and signposts (`Istio`), carefully copy card catalogs (`DB migration`), and monitor visitor flow.',
    yaml: `# Strangler Fig gradual path cutover via Ingress / HTTPRoute:\npaths:\n- { path: /api/orders, pathType: Prefix, backend: { service: { name: orders-ms, port: { number: 80 } } } }\n- { path: /, pathType: Prefix, backend: { service: { name: legacy-monolith, port: { number: 80 } } } }`
  },
  {
    id: 'sc-node-replace', cat: 'Troubleshooting', cert: 'CKA',
    title: 'Q11. Replacing an Unresponsive Worker Node Safely',
    scenario: 'One worker node becomes unresponsive and must be replaced without interrupting running applications. What steps do you take?',
    answer: 'Run `kubectl cordon <node>` (blocks new Pods), then `kubectl drain <node> --ignore-daemonsets --delete-emptydir-data` to gracefully evict Pods respecting PDBs onto healthy nodes. Decommission/replace the VM, then `kubectl uncordon <node>` when the replacement registers Ready.',
    layman: 'Close the checkout lane (`cordon`), guide remaining shoppers politely to other open lanes (`drain`), swap out the broken register, and reopen the lane (`uncordon`).',
    yaml: `kubectl cordon worker-2\nkubectl drain worker-2 --ignore-daemonsets --delete-emptydir-data\n# After replacement node joins Ready:\nkubectl uncordon worker-2`
  },
  {
    id: 'sc-stateful-retain', cat: 'Storage & Backup', cert: 'CKA',
    title: 'Q12. Retaining Persistent Data Across Rescheduling & Upgrades',
    scenario: 'How do you ensure stateful apps (Postgres/Kafka) never lose data when Pods reschedule or upgrade?',
    answer: 'Use a `StatefulSet` with `volumeClaimTemplates` backed by a `StorageClass` (`volumeBindingMode: WaitForFirstConsumer`, `reclaimPolicy: Retain`). Each ordinal (`db-0`, `db-1`) gets a sticky 1:1 PVC that re-attaches automatically even if its Pod moves to another node.',
    layman: 'Each worker gets their own labeled locker (`db-0` -> `pvc-db-0`) that follows them whenever they move to a different desk.',
    yaml: `volumeClaimTemplates:\n- metadata: { name: pgdata }\n  spec:\n    accessModes: ["ReadWriteOnce"]\n    storageClassName: gp3-retain\n    resources: { requests: { storage: 20Gi } }`
  },
  {
    id: 'sc-pending', cat: 'Troubleshooting', cert: 'CKA',
    title: 'Q13. Troubleshooting a Pod Stuck in Pending State',
    scenario: 'A Pod stays stuck in `Pending`. What are the root causes and exact triage commands?',
    answer: 'Run `kubectl describe pod <name>` and check Events: (1) `Insufficient cpu/memory` on nodes, (2) untolerated node Taint or NodeAffinity/PodAntiAffinity mismatch, (3) node `NotReady` / cordoned, or (4) unbound `PersistentVolumeClaim` (`WaitForFirstConsumer` / missing StorageClass).',
    layman: 'The Pod is waiting in the lobby because no room has enough space, the room has a "VIP Only" sign (`Taint`), or its reserved storage locker hasn’t arrived yet.',
    yaml: `kubectl describe pod <pod> -n prod | tail -n 15\nkubectl get nodes,pvc -n prod`
  },
  {
    id: 'sc-health-fail', cat: 'Troubleshooting', cert: 'CKAD',
    title: 'Q14. Debugging Pods Failing Readiness/Liveness Health Checks',
    scenario: 'A Deployment has multiple replicas failing health checks. How do you find and fix the root cause?',
    answer: 'Inspect `kubectl logs <pod> --previous` and `kubectl describe pod` Events. Verify probe `path`/`port` and `initialDelaySeconds` (use `startupProbe` for slow apps!), check `resources.limits` for OOMKill/CPU starvation, verify image tag, and inspect `kubectl rollout status/history`.',
    layman: 'Check why the worker failed the doctor’s checkup: maybe they were still waking up (`startupProbe` needed), the doctor knocked on the wrong door (`port/path`), or they ran out of energy (`OOMKilled`).',
    yaml: `startupProbe:\n  httpGet: { path: /healthz, port: 8080 }\n  failureThreshold: 30\n  periodSeconds: 5`
  },
  {
    id: 'sc-high-cpu', cat: 'Troubleshooting', cert: 'CKAD',
    title: 'Q15. Mitigating High CPU Usage on Cluster Workloads',
    scenario: 'Pods are spiking CPU and causing latency. How do you investigate and mitigate?',
    answer: 'Identify offenders via `kubectl top pods -A --sort-by=cpu`. Verify whether CPU limits are overly tight (causing CFS throttling), profile the app for hot loops, scale horizontally via HPA (`kubectl autoscale` / `kubectl scale`), and enforce namespace `ResourceQuota` so one workload cannot starve others.',
    layman: 'Spot which kitchen station is red-hot (`kubectl top`), give it more helpers (`HPA`), ensure its ceiling isn’t artificially choking it (`limits.cpu`), and cap max burners per team (`ResourceQuota`).',
    yaml: `kubectl top pods -n prod --sort-by=cpu\nkubectl autoscale deploy/api -n prod --cpu-percent=70 --min=3 --max=15`
  },
  {
    id: 'sc-blue-green', cat: 'Deployments & Scaling', cert: 'CKAD',
    title: 'Q16. Blue-Green Deployment With Instant Zero-Downtime Rollback',
    scenario: 'How do you implement Blue-Green deployments with instant one-step rollback?',
    answer: 'Run two complete Deployments (`app-blue` with `version=v1`, `app-green` with `version=v2`). Validate `app-green` via a preview Service, then patch the production Service selector (`version: v2`) or Ingress/HTTPRoute backend to flip 100% traffic atomically. Flip back to `v1` in 1 second if issues appear.',
    layman: 'Build an identical brand-new stage (`Green`) behind the curtain while audiences watch `Blue`. Once `Green` passes dress rehearsal, swing the spotlight instantly—and swing it right back to `Blue` if anything squeaks.',
    yaml: `# Flip prod Service selector atomically from blue -> green:\nkubectl patch svc app-prod -p '{"spec":{"selector":{"app":"myapp","slot":"green"}}}'`
  },
  {
    id: 'sc-custom-hpa', cat: 'Deployments & Scaling', cert: 'CNPE',
    title: 'Q17. Autoscaling Pods on Custom Metrics (Requests/Sec or Queue Depth)',
    scenario: 'CPU isn’t a good scaling signal for your app. How do you autoscale Pods on HTTP RPS or Kafka queue lag?',
    answer: 'Export app metrics (e.g. `http_requests_per_second`) to Prometheus, deploy `prometheus-adapter` (or KEDA) to expose them via Kubernetes `custom.metrics.k8s.io`, and configure an `autoscaling/v2` HPA targeting `type: Pods` with `averageValue`.',
    layman: 'Instead of adding cashiers only when their arms get tired (CPU), count the actual length of the checkout line (`RPS / Kafka lag`) and scale registers before delays happen.',
    yaml: `apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata: { name: api-rps-hpa }\nspec:\n  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }\n  minReplicas: 2\n  maxReplicas: 20\n  metrics:\n  - type: Pods\n    pods: { metric: { name: http_requests_per_sec }, target: { type: AverageValue, averageValue: "100" } }`
  },
  {
    id: 'sc-pdb-nodefail', cat: 'Architecture & HA', cert: 'CKA',
    title: 'Q18. Handling Node Failures & Protecting Availability With PDBs',
    scenario: 'How does Kubernetes recover Pods on failed nodes, and how do you protect critical services during drains?',
    answer: 'When kubelet misses Node Lease heartbeats for 40s, Node Controller marks it `NotReady` and taints it `NoExecute`—evicting and rescheduling Pods onto healthy nodes after toleration timeout (default 300s). Pair Deployments with `PodDisruptionBudget` (`minAvailable` / `maxUnavailable`) so voluntary drains never kill too many replicas at once.',
    layman: 'If a cashier disappears for 40s, the floor manager shifts orders to other registers, while a `PodDisruptionBudget` rule guarantees at least 2 cashiers always stay open during shift swaps.',
    yaml: `apiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata: { name: api-pdb }\nspec:\n  minAvailable: 2\n  selector: { matchLabels: { app: api } }`
  },
  {
    id: 'sc-multitier', cat: 'Security & Compliance', cert: 'CKS',
    title: 'Q19. Multi-Tier Application Isolation (Frontend -> Backend -> DB)',
    scenario: 'How do you isolate Frontend, Backend, and Database tiers cleanly in Kubernetes?',
    answer: 'Deploy each tier as separate Deployments/StatefulSets (optionally in separate Namespaces), apply Default-Deny `NetworkPolicies` in Backend and Database namespaces, and allow only `frontend -> backend:8080` and `backend -> database:5432` (never `frontend -> database`!).',
    layman: 'Give Front Desk, Kitchen, and Vault separate rooms with one-way badge doors: customers talk to Front Desk, Front Desk talks to Kitchen, and only Kitchen opens the pantry—never customers directly.',
    yaml: `apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: allow-backend-to-db, namespace: database }\nspec:\n  podSelector: { matchLabels: { tier: db } }\n  ingress:\n  - from: [{ namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: backend } } }]\n    ports: [{ protocol: TCP, port: 5432 }]`
  },
  {
    id: 'sc-multidomain-tls', cat: 'Networking & Mesh', cert: 'CKAD',
    title: 'Q20. Multi-Domain Ingress With Automated TLS (cert-manager)',
    scenario: 'How do you serve `app1.example.com` and `app2.example.com` over HTTPS with automated certificate renewal?',
    answer: 'Configure host-based routing rules inside an `Ingress` (or Gateway API `HTTPRoute`) referencing a `tls` Secret, and annotate it for `cert-manager` (`cert-manager.io/cluster-issuer: letsencrypt-prod`) so ACME challenges automatically provision and renew TLS certs before expiry.',
    layman: 'A smart reception desk routes visitors for Company A and Company B down different hallways through one front door, while `cert-manager` automatically renews the building’s security badges before they expire.',
    yaml: `apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: multi-domain\n  annotations: { cert-manager.io/cluster-issuer: letsencrypt-prod }\nspec:\n  ingressClassName: nginx\n  tls: [{ hosts: [app1.example.com, app2.example.com], secretName: multi-tls }]\n  rules:\n  - host: app1.example.com\n    http: { paths: [{ path: /, pathType: Prefix, backend: { service: { name: app1-svc, port: { number: 80 } } } }] }`
  },
  {
    id: 'sc-immutable', cat: 'Security & Compliance', cert: 'CKS',
    title: 'Q21. Enforcing Immutable Containers & Infrastructure',
    scenario: 'How do you guarantee containers are immutable at runtime and prevent configuration drift?',
    answer: '1) Pin container images by immutable `@sha256:` digest (never `:latest`). 2) Set `readOnlyRootFilesystem: true` and `allowPrivilegeEscalation: false` in `securityContext`. 3) Externalize config via ConfigMaps/Secrets. 4) Manage all YAML via GitOps (ArgoCD `selfHeal: true`) + Terraform.',
    layman: 'Freeze-dry the shipping container before sailing: nobody can repaint it mid-voyage (`readOnlyRootFilesystem`), every crate has an exact barcode (`@sha256`), and any unauthorized tweak is automatically reset from headquarters (`GitOps selfHeal`).',
    yaml: `containers:\n- name: app\n  image: ghcr.io/org/api@sha256:e3b0c44298fc1c149afbf4c8996fb924\n  securityContext:\n    readOnlyRootFilesystem: true\n    allowPrivilegeEscalation: false\n    runAsNonRoot: true`
  },
  {
    id: 'sc-efk-prom', cat: 'Troubleshooting', cert: 'CKA',
    title: 'Q22. Centralized Logging (EFK / Loki) & Alerting (Prometheus)',
    scenario: 'How do you centralize container logs (surviving Pod restarts) and alert on cluster incidents?',
    answer: 'Run FluentBit/Fluentd as a DaemonSet on every node to tail `/var/log/containers/*.log` and ship to Elasticsearch/Loki + Kibana/Grafana. Run Prometheus to scrape kube-apiserver, kubelet, etcd, and app `/metrics`, plus Alertmanager to route firing PromQL alerts (e.g., `KubePodCrashLooping`) to Slack/PagerDuty.',
    layman: 'Station a notebook collector (`FluentBit`) in every building (`DaemonSet`) so notes aren’t lost when a worker leaves, while Prometheus checks every gauge continuously and rings Alertmanager bells if memory or errors spike.',
    yaml: `groups:\n- name: k8s-alerts\n  rules:\n  - alert: HighMemoryPressure\n    expr: node_memory_MemAvailable_bytes < 500000000\n    for: 5m\n    labels: { severity: warning }`
  },
  {
    id: 'sc-cicd', cat: 'Deployments & Scaling', cert: 'CNPE',
    title: 'Q23. Modern CI/CD Integration (GitLab / Jenkins -> GitOps)',
    scenario: 'How should CI/CD pipelines (GitLab CI / Jenkins) safely build and deploy code to Kubernetes?',
    answer: 'Keep CI and CD separated cleanly: CI (GitLab CI / Jenkins) runs tests, scans images (Trivy), signs with Cosign, pushes to registry, and commits the new SHA digest to a GitOps repo—while in-cluster ArgoCD/Flux pulls and applies changes so external CI runners never hold production `cluster-admin` tokens!',
    layman: 'The factory (CI) builds, inspects, and stamps boxes, then drops the manifest slip in the delivery inbox (Git). The warehouse robot (ArgoCD) inside the cluster pulls approved boxes onto shelves without ever giving factory workers master keys.',
    yaml: `# GitLab CI -> update Kustomize image tag in GitOps repo\nbuild_and_promote:\n  stage: promote\n  script:\n    - trivy image --exit-code 1 $IMAGE_SHA\n    - kustomize edit set image api=$IMAGE_SHA && git commit -am "chore: bump api"`
  },
  {
    id: 'sc-multizone-pv', cat: 'Storage & Backup', cert: 'CKA',
    title: 'Q24. Ensuring Persistent Volumes Schedule in the Same AZ as Pods',
    scenario: 'In a multi-AZ cluster, how do you prevent Pods from failing due to cross-zone EBS/PD disk attachments?',
    answer: 'Configure `volumeBindingMode: WaitForFirstConsumer` on the `StorageClass`. Instead of provisioning a PV in an arbitrary AZ at PVC creation time, Kubernetes waits until `kube-scheduler` places the Pod onto a specific node/AZ and creates the disk in that exact Availability Zone.',
    layman: 'Don’t rent a storage locker in Manhattan before knowing whether your employee works in Brooklyn—wait until the desk is assigned (`WaitForFirstConsumer`), then rent the locker in the same building!',
    yaml: `apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata: { name: fast-az-aware }\nprovisioner: ebs.csi.aws.com\nvolumeBindingMode: WaitForFirstConsumer`
  }
];
