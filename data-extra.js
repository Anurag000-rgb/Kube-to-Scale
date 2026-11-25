/* =========================================================================
   PRACTICE SCENARIOS (43 DRILLS), CHEATSHEETS (13 CARDS) & DESIGN LAB
   ========================================================================= */

const PRACTICE_SCENARIOS = [
  {
    cert: 'CKA', title: 'Service Returns Connection Timeout Despite Running Pods',
    snippet: `$ kubectl get pods -n prod --show-labels\nNAME        READY   STATUS    LABELS\napi-7f9b    1/1     Running   app=payments-v2\n\n$ kubectl get svc api-svc -n prod -o yaml\nspec:\n  selector: { app: payments }\n  ports: [{ port: 80, targetPort: 8080 }]`,
    question: 'Clients calling http://api-svc.prod.svc time out, and `kubectl get endpointslices -l kubernetes.io/service-name=api-svc` shows 0 endpoints. What is the root cause?',
    options: [
      'CoreDNS is down in kube-system.',
      'The Service selector (`app: payments`) does not match the Pod label (`app: payments-v2`), leaving EndpointSlices empty.',
      'ClusterIP Services require NodePort to route inside the cluster.',
      'kube-proxy iptables cannot map port 80 to targetPort 8080.'
    ],
    correct: 1,
    explanation: 'A Service populates EndpointSlices strictly by matching `spec.selector` against Ready Pod labels. Because the Pods carry `app=payments-v2` instead of `app=payments`, zero endpoints exist.',
    fix: 'kubectl patch svc api-svc -n prod -p \'{"spec":{"selector":{"app":"payments-v2"}}}\''
  },
  {
    cert: 'CKA', title: 'Control Plane Freeze After Losing 1 of 2 etcd Nodes',
    snippet: `$ etcdctl endpoint health\nhttps://10.0.0.10:2379 is healthy\nhttps://10.0.0.11:2379 is unhealthy: dial tcp timeout\n\n$ kubectl apply -f deploy.yaml\nError from server: etcdserver: request timed out`,
    question: 'A team deployed a 2-node etcd cluster for HA. When node 2 failed, all cluster writes froze. Why?',
    options: [
      'Raft quorum is floor(N/2) + 1: for N=2 quorum is 2, so losing 1 node breaks consensus. Always run odd counts (3 or 5).',
      'kube-apiserver requires at least 4 etcd nodes to write.',
      'etcd followers cannot serve writes unless restarted.',
      'TLS certificates expire when a peer disconnects.'
    ],
    correct: 0,
    explanation: 'Raft requires a strict majority `floor(N/2)+1`. A 2-node cluster needs 2 votes (zero fault tolerance), whereas a 3-node cluster needs 2 votes and survives 1 full node failure.',
    fix: 'Always provision 3 (tolerates 1 loss) or 5 (tolerates 2 losses) etcd members.'
  },
  {
    cert: 'CKA', title: 'New Pod Stuck Pending With WaitForFirstConsumer Disabled',
    snippet: `Events:\n  Warning  FailedScheduling  0/6 nodes are available:\n  3 node(s) had volume node affinity conflict,\n  3 node(s) didn't match Pod's node affinity.`,
    question: 'A StatefulSet Pod in `zone-b` cannot schedule because its dynamically created EBS volume landed in `zone-a`. How do you prevent this on the StorageClass?',
    options: [
      'Set `reclaimPolicy: Delete` on the StorageClass.',
      'Set `volumeBindingMode: WaitForFirstConsumer` so the CSI driver waits until the Scheduler picks a node/zone before creating the disk.',
      'Change accessMode from ReadWriteOnce to ReadOnlyMany.',
      'Disable the CSI Controller Deployment.'
    ],
    correct: 1,
    explanation: 'With `Immediate` binding, the CSI provisioner guesses a random Availability Zone before the Pod is scheduled. `WaitForFirstConsumer` defers provisioning until scheduling chooses the exact AZ.',
    fix: 'volumeBindingMode: WaitForFirstConsumer'
  },
  {
    cert: 'CKAD', title: 'Batch Job Stays Running Forever With Envoy Mesh Sidecar',
    snippet: `$ kubectl get pods -n batch\nNAME           READY   STATUS    RESTARTS\nnightly-9xk2   1/2     Running   0   (app=Completed, envoy=Running)`,
    question: 'Your CronJob’s main container exited 0, but the Job never completes because its Envoy sidecar keeps running. What is the native K8s 1.29+ fix?',
    options: [
      'Set `restartPolicy: Always` on the Job Pod spec.',
      'Move the Envoy container into `initContainers` with `restartPolicy: Always` (Native Sidecar) so kubelet terminates it automatically after the main container exits.',
      'Add a LivenessProbe that kills Envoy after 60 seconds.',
      'Use a DaemonSet instead of a Job.'
    ],
    correct: 1,
    explanation: 'Native Sidecars (`initContainers` + `restartPolicy: Always`) start before the main container, stay alive while it runs, and are cleanly sent SIGTERM by kubelet once all regular containers finish.',
    fix: 'initContainers:\n  - name: envoy\n    image: envoyproxy/envoy:v1.31\n    restartPolicy: Always'
  },
  {
    cert: 'CKAD', title: 'ConfigMap Update Never Appears Inside Running Pod',
    snippet: `volumeMounts:\n  - name: cfg\n    mountPath: /etc/app/config.yaml\n    subPath: config.yaml`,
    question: 'You updated `ConfigMap/app-cfg` 10 minutes ago, yet `/etc/app/config.yaml` inside the running Pod still has the old content. Why?',
    options: [
      'ConfigMaps can only be read as environment variables.',
      'Mounting a ConfigMap with `subPath` disables automatic kubelet symlink updates; remove `subPath` (mount the directory) or roll the Deployment.',
      'kubelet only syncs ConfigMaps every 24 hours.',
      'ConfigMaps require `readOnly: false` to update.'
    ],
    correct: 1,
    explanation: 'Kubelet atomically swaps a `..data` directory symlink to refresh mounted ConfigMaps. Using `subPath` bind-mounts a single file inode, bypassing symlink refreshes completely.',
    fix: 'Mount directory `/etc/app` without `subPath` (or trigger `kubectl rollout restart deploy/app`).'
  },
  {
    cert: 'CKAD', title: 'Brief 502 Bad Gateway Errors During Rolling Updates',
    snippet: `$ kubectl rollout restart deploy/checkout\n# Monitoring shows ~15 HTTP 502s during every deploy\n# Container immediately exits on SIGTERM in 20ms`,
    question: 'Why do clients hit 502 errors for ~1 second whenever a Pod terminates during a zero-downtime RollingUpdate?',
    options: [
      'ReadinessProbe is checked too frequently.',
      'EndpointSlice removal across kube-proxy nodes runs asynchronously in parallel with SIGTERM; add a `preStop: sleep 5` lifecycle hook so traffic drains before the app closes its socket.',
      'maxSurge must be set to 0.',
      'TCP keepalive packets are dropped by CoreDNS.'
    ],
    correct: 1,
    explanation: 'Because kube-proxy updates and Pod SIGTERM happen concurrently, packets still arrive for ~1–2s after deletion starts. A short `preStop` sleep allows iptables/eBPF rules to converge before the app stops listening.',
    fix: 'lifecycle:\n  preStop:\n    exec: { command: ["sh", "-c", "sleep 5"] }'
  },
  {
    cert: 'CKS', title: 'NetworkPolicy Accidentally Allows ALL Namespaces',
    snippet: `ingress:\n  - from:\n    - namespaceSelector:\n        matchLabels: { team: frontend }\n    - podSelector:\n        matchLabels: { app: web }`,
    question: 'You intended to allow ONLY Pods labeled `app: web` INSIDE namespace `team: frontend`, but every Pod in `team: frontend` AND every `app: web` Pod in any namespace can connect. Why?',
    options: [
      'Two leading dashes under `from:` create a logical OR; remove the second dash so both selectors sit in one item (logical AND).',
      'NetworkPolicies cannot combine namespaceSelector and podSelector.',
      'policyTypes must list Egress first.',
      'Cilium ignores matchLabels on namespaces.'
    ],
    correct: 0,
    explanation: 'In YAML, `- namespaceSelector` followed by `- podSelector` are two separate list elements evaluated with OR. Merging them under a single `-` item evaluates them with AND.',
    fix: 'from:\n  - namespaceSelector: { matchLabels: { team: frontend } }\n    podSelector: { matchLabels: { app: web } }'
  },
  {
    cert: 'CKS', title: 'Egress NetworkPolicy Breaks All Outbound Service Calls',
    snippet: `spec:\n  podSelector: { matchLabels: { app: api } }\n  policyTypes: [Egress]\n  egress:\n    - to: [{ podSelector: { matchLabels: { app: db } } }]\n      ports: [{ protocol: TCP, port: 5432 }]`,
    question: 'After applying this strict Egress NetworkPolicy, `api` logs `getaddrinfo EAI_AGAIN db-svc` and cannot reach the database. What is missing?',
    options: [
      'An Ingress rule allowing return packets from the database.',
      'An Egress allow rule for CoreDNS (UDP & TCP port 53 to `kube-system`), because selecting Egress blocks DNS lookups by default.',
      'Adding `hostNetwork: true` to the api Pod.',
      'Opening port 6443 to kube-apiserver.'
    ],
    correct: 1,
    explanation: 'Once a Pod is selected by an Egress policy, ALL unlisted outbound traffic—including DNS resolution to CoreDNS—is dropped until UDP/TCP 53 is explicitly permitted.',
    fix: '- to: [{ namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: kube-system } } }]\n  ports: [{ protocol: UDP, port: 53 }, { protocol: TCP, port: 53 }]'
  },
  {
    cert: 'CKS', title: 'Enabling etcd Encryption Leaves Old Secrets Unencrypted',
    snippet: `# Added --encryption-provider-config=/etc/kubernetes/enc.yaml\n# Restarted kube-apiserver cleanly\n$ ETCDCTL_API=3 etcdctl get /registry/secrets/prod/db-pass\n# Output STILL shows plaintext secret data!`,
    question: 'You configured EncryptionConfiguration on kube-apiserver and restarted it, yet existing Secrets in etcd are still readable in plaintext. Why?',
    options: [
      'EncryptionConfiguration only encrypts Secrets on WRITE; you must rewrite all existing Secrets so API Server encrypts them in etcd.',
      'etcd must be wiped and recreated from scratch.',
      'Secrets are only encrypted when mounted as volumes.',
      'AES-CBC does not work with etcd v3.'
    ],
    correct: 0,
    explanation: 'kube-apiserver encrypts objects only when writing them. Existing Secrets stay plaintext until rewritten in place via `kubectl replace`.',
    fix: 'kubectl get secrets -A -o json | kubectl replace -f -'
  },
  {
    cert: 'CKS', title: 'PSA Restricted Blocks Deployment Pods Without Failing Apply',
    snippet: `$ kubectl label ns prod pod-security.kubernetes.io/enforce=restricted\n$ kubectl apply -f deploy.yaml\ndeployment.apps/web created\n$ kubectl get deploy web -n prod\nREADY: 0/3`,
    question: '`kubectl apply` succeeded for the Deployment, yet 0 Pods exist! Why did the Deployment succeed while Pods failed?',
    options: [
      'Pod Security Admission evaluates Pod creation (triggered by the ReplicaSet), not the Deployment object itself; inspect `kubectl describe rs` to see the exact Restricted violations.',
      'PSA only works on StatefulSets.',
      'The namespace needs `enforce=privileged` first.',
      'kube-scheduler rejected the Deployment.'
    ],
    correct: 0,
    explanation: 'PSA enforces on Pod creation (and emits warnings on Deployment creation if `warn: restricted` is set). Always check ReplicaSet Events and set `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `drop: ["ALL"]`, and `seccompProfile: RuntimeDefault`.',
    fix: 'kubectl describe rs -n prod -l app=web'
  },
  {
    cert: 'CNPE', title: 'Two Custom Operators Silently Overwrite Each Other’s Status',
    snippet: `// Operator loop:\nobj, _ := client.Get(ctx, key)\nobj.Status.Phase = "Ready"\nclient.Status().Update(ctx, obj) // HTTP 409 Conflict!`,
    question: 'Your Operator logs intermittent `409 Conflict: the object has been modified` errors under high concurrency. How should a Kubernetes controller handle 409?',
    options: [
      'Strip `metadata.resourceVersion` before updating to force-overwrite etcd.',
      'Treat 409 as a normal Optimistic Concurrency retry signal: return the error to WorkQueue so Reconcile() re-reads the fresh revision and retries.',
      'Deploy a Redis distributed lock in front of kube-apiserver.',
      'Ignore the error and mark reconciliation complete.'
    ],
    correct: 1,
    explanation: '409 Conflict is Kubernetes’ lock-free Optimistic Concurrency Control protecting against lost updates. Returning the error to WorkQueue triggers a clean retry against the latest `resourceVersion`.',
    fix: 'Return err to WorkQueue (or use retry.RetryOnConflict / Server-Side Apply).'
  },
  {
    cert: 'CNPE', title: 'HPA Scales Pods From 4 -> 10, But 6 Stay Stuck Pending',
    snippet: `$ kubectl get hpa api-hpa\nTARGETS: 92%/70%   REPLICAS: 10\n$ kubectl get pods | grep Pending | wc -l\n6   (0/3 nodes are available: Insufficient cpu)`,
    question: 'HPA reacted instantly to the traffic spike, yet 6 new Pods are stuck Pending because all worker VMs are full. What platform component closes this loop?',
    options: [
      'Increase HPA `maxReplicas` to 20.',
      'Deploy a node-level autoscaler like Karpenter (or Cluster Autoscaler) to watch unschedulable Pending Pods and provision right-sized nodes automatically.',
      'Remove `resources.requests` from the Deployment.',
      'Restart kube-scheduler to pack more Pods beyond node CPU.'
    ],
    correct: 1,
    explanation: 'Kubernetes elasticity is two-tiered: HPA/KEDA scales Pods horizontally, while Karpenter watches Pending Pods and launches right-sized On-Demand/Spot nodes in ~35s.',
    fix: 'Configure a Karpenter NodePool + EC2NodeClass watching unschedulable Pending Pods.'
  },
  {
    cert: 'CKA', title: 'Static Pod Immediately Recreated After kubectl delete pod',
    snippet: `$ kubectl delete pod kube-scheduler-cp1 -n kube-system\npod "kube-scheduler-cp1" deleted\n$ kubectl get pod kube-scheduler-cp1 -n kube-system\nkube-scheduler-cp1   1/1   Running   0   4s`,
    question: 'You tried to delete `kube-scheduler-cp1` using kubectl, but it reappeared 4 seconds later. How do you actually stop or modify a Static Pod?',
    options: [
      'Scale down the kube-scheduler Deployment in kube-system.',
      'Move, edit, or delete its YAML manifest inside `/etc/kubernetes/manifests/` on node `cp1` because kubelet manages Static Pods locally.',
      'Delete the Mirror Pod from etcd directly.',
      'Run `kubectl cordon cp1`.'
    ],
    correct: 1,
    explanation: 'Static Pods are owned directly by kubelet via `staticPodPath` (`/etc/kubernetes/manifests`). The Pod shown in `kubectl` is only a read-only Mirror Pod.',
    fix: 'ssh cp1 "sudo mv /etc/kubernetes/manifests/kube-scheduler.yaml /tmp/"'
  },
  {
    cert: 'CKA', title: 'kubeadm upgrade apply Fails Because kubeadm Package Is Old',
    snippet: `$ sudo kubeadm upgrade apply v1.31.2\n[upgrade/config] FATAL: kubeadm version 1.30.4 cannot upgrade to 1.31.2`,
    question: 'What is the correct upgrade sequence on the first Control Plane node?',
    options: [
      'Upgrade `kubelet` first, then run `kubeadm upgrade node`.',
      'Upgrade `kubeadm` to 1.31.2 first, run `kubeadm upgrade apply v1.31.2`, then upgrade `kubelet` + `kubectl` and restart kubelet.',
      'Run `kubectl upgrade cluster v1.31.2`.',
      'Delete all Static Pods and re-run `kubeadm init`.'
    ],
    correct: 1,
    explanation: 'Always upgrade the `kubeadm` binary first, then run `kubeadm upgrade apply <ver>` on CP-1 (`kubeadm upgrade node` on other nodes), and finally upgrade `kubelet` + `kubectl`.',
    fix: 'apt-mark unhold kubeadm && apt-get install -y kubeadm=1.31.2-* && sudo kubeadm upgrade apply v1.31.2'
  },
  {
    cert: 'CKAD', title: 'Pod With Toleration Still Schedules Onto Non-GPU Nodes',
    snippet: `tolerations:\n- { key: "sku", operator: "Equal", value: "a100", effect: "NoSchedule" }\n# Expected: Pod runs ONLY on gpu-1\n# Actual: Pod landed on cpu-worker-3!`,
    question: 'Why did the Pod with the GPU toleration schedule onto a standard CPU worker node?',
    options: [
      'Tolerations only ALLOW scheduling onto tainted nodes—they do NOT prevent scheduling onto untainted nodes; add `nodeSelector` or `nodeAffinity` to attract it strictly to GPU nodes.',
      'The toleration effect must be `NoExecute`.',
      'kube-scheduler ignores tolerations on Deployments.',
      'Taints only work with DaemonSets.'
    ],
    correct: 0,
    explanation: 'Taints/Tolerations repel non-matching Pods, whereas `nodeAffinity`/`nodeSelector` attract Pods to specific nodes. Combine both for exclusive node pools.',
    fix: 'nodeSelector:\n  sku: a100'
  },
  {
    cert: 'CKAD', title: 'Pod Terminated With Exit Code 137 Despite Healthy Code',
    snippet: `$ kubectl get pod worker-7d9 -n prod\nNAME         READY   STATUS      RESTARTS\nworker-7d9   0/1     OOMKilled   4\n# lastState.terminated.exitCode: 137`,
    question: 'What caused Exit Code 137 (`OOMKilled`), and how do you resolve it?',
    options: [
      'LivenessProbe sent SIGTERM; increase `periodSeconds`.',
      'The container exceeded its cgroup `resources.limits.memory`, causing the Linux kernel to send SIGKILL (128+9=137); raise the memory limit or fix the app memory leak.',
      'Node CPU was throttled by CFS.',
      'Container image entrypoint was missing.'
    ],
    correct: 1,
    explanation: 'Exit Code 137 = 128 + 9 (SIGKILL), which Linux cgroup v2 triggers immediately when container RSS+cache hits `memory.max` (`resources.limits.memory`).',
    fix: 'resources:\n  requests: { memory: 512Mi }\n  limits: { memory: 1Gi }'
  },
  {
    cert: 'CNPE', title: 'External HTTPS Calls Trigger 8x CoreDNS Lookups Per Request',
    snippet: `$ kubectl exec app-pod -- cat /etc/resolv.conf\nsearch prod.svc.cluster.local svc.cluster.local cluster.local\noptions ndots:5\n# Tcpdump shows NXDOMAIN floods for api.stripe.com`,
    question: 'Why does calling `https://api.stripe.com` generate 4 failed CoreDNS lookups before resolving externally?',
    options: [
      'Because `api.stripe.com` has only 2 dots (< `ndots:5`), glibc appends every cluster search suffix first; append a trailing dot or set `dnsConfig` `ndots: 2` (and deploy NodeLocal DNSCache).',
      'CoreDNS caches NXDOMAIN as an error.',
      'Service type must be ExternalName.',
      'kube-proxy blocks UDP port 53.'
    ],
    correct: 0,
    explanation: 'With default `ndots:5`, any hostname with fewer than 5 dots is treated as cluster-internal first. Lowering `ndots` or using NodeLocal DNSCache eliminates lookup storms.',
    fix: 'dnsConfig:\n  options: [{ name: ndots, value: "2" }]'
  },
  {
    cert: 'CNPE', title: 'Kustomize ConfigMap Edit Never Triggers Pod Restart',
    snippet: `# Currently using plain Secret/ConfigMap in resources:\nresources:\n- configmap.yaml\n- deployment.yaml\n# Updating configmap.yaml leaves Pods running stale env vars`,
    question: 'Which Kustomize feature automatically appends a content hash to ConfigMaps/Secrets so edits trigger a clean Deployment RollingUpdate?',
    options: [
      '`namePrefix: v2-`',
      '`configMapGenerator` / `secretGenerator`, which hashes content into the resource name and updates every Deployment/Pod reference automatically.',
      '`commonLabels`',
      '`patchesStrategicMerge`'
    ],
    correct: 1,
    explanation: 'Kustomize `configMapGenerator` creates an immutable-style hashed name (e.g. `app-cfg-8b7d9k`) and rewrites `envFrom`/`volumes` references in Deployments so Pods roll cleanly.',
    fix: 'configMapGenerator:\n- name: app-cfg\n  literals: ["LOG_LEVEL=info"]'
  },
  {
    cert: 'CKS', title: 'User Certificate Signed via CSR Fails AuthN With Invalid Signer',
    snippet: `apiVersion: certificates.k8s.io/v1\nkind: CertificateSigningRequest\nmetadata: { name: jane-csr }\nspec:\n  signerName: kubernetes.io/kubelet-serving\n  usages: [client auth]`,
    question: 'Why was `jane-csr` rejected when signing a human user certificate for `kubectl`?',
    options: [
      'Human user client certificates must use `signerName: kubernetes.io/kube-apiserver-client` (not `kubelet-serving`).',
      'RSA 2048 keys are unsupported.',
      'CSRs must be created inside `kube-system`.',
      'usages must be `server auth`.'
    ],
    correct: 0,
    explanation: 'Kubernetes enforces strict signer validation: `kubernetes.io/kube-apiserver-client` signs client certificates accepted by kube-apiserver AuthN.',
    fix: 'signerName: kubernetes.io/kube-apiserver-client'
  },
  {
    cert: 'CKS', title: 'Istio Service Mesh Enforces mTLS Without Sidecar Memory Tax',
    snippet: `# Legacy sidecar mode injects 120MB Envoy into 1,000 Pods = 120 GB RAM!\n# Platform team wants transparent Pod-to-Pod mTLS without sidecars`,
    question: 'Which Service Mesh architecture provides node-shared L4 mTLS tunnels without injecting Envoy into every application Pod?',
    options: [
      'kube-proxy IPVS mode.',
      'Istio Ambient Mode, using a per-node Rust `ztunnel` DaemonSet for L4 mTLS + SPIFFE identity and optional shared `Waypoint` proxies for L7 policies.',
      'NodePort Services with externalTrafficPolicy: Local.',
      'CoreDNS forward plugin.'
    ],
    correct: 1,
    explanation: 'Istio Ambient Mesh decouples L4 secure transport (`ztunnel`) from optional L7 processing (`Waypoint`), saving ~75% RAM and requiring zero app container restarts.',
    fix: 'kubectl label namespace prod istio.io/dataplane-mode=ambient'
  },
  {
    cert: 'CKS', title: 'kube-bench Reports FAIL 1.2.1 & 1.2.20 on kube-apiserver',
    snippet: `$ kube-bench run --targets master\n[FAIL] 1.2.1 Ensure --anonymous-auth is set to false\n[FAIL] 1.2.20 Ensure --profiling is set to false`,
    question: 'Where do you apply these flags on a kubeadm cluster so `kube-apiserver` reloads securely?',
    options: [
      'Edit `/etc/kubernetes/manifests/kube-apiserver.yaml` and add `--anonymous-auth=false` and `--profiling=false` (kubelet auto-restarts the Static Pod).',
      'Run `kubectl edit pod kube-apiserver-cp1 -n kube-system`.',
      'Modify `/etc/systemd/system/kube-apiserver.service`.',
      'Add them to `kubeadm-config` ConfigMap only.'
    ],
    correct: 0,
    explanation: 'On kubeadm clusters, `kube-apiserver` is a Static Pod watched by kubelet at `/etc/kubernetes/manifests/kube-apiserver.yaml`. Editing that file triggers an automatic restart.',
    fix: 'Edit /etc/kubernetes/manifests/kube-apiserver.yaml -> verify via crictl ps & kube-bench'
  },
  {
    cert: 'CKS', title: 'Kubernetes Audit Log Dumps Plaintext Secret Passwords to Disk',
    snippet: `# /etc/kubernetes/audit-policy.yaml\nrules:\n- level: RequestResponse\n  resources: [{ group: "", resources: ["secrets", "pods"] }]`,
    question: 'Security audit found base64 Secret values inside `/var/log/kube-audit.log`. How do you fix `audit-policy.yaml`?',
    options: [
      'Set `level: Metadata` for `secrets` (and `configmaps`) BEFORE broader rules so only who/when/what is logged without request/response payloads.',
      'Set `level: None` for all Pods.',
      'Disable kube-apiserver TLS.',
      'Encrypt `/var/log/kube-audit.log` with base64.'
    ],
    correct: 0,
    explanation: 'Audit rules evaluate top-down (first match wins). Putting a `level: Metadata` rule for `secrets` at the top logs access metadata while stripping Secret bodies.',
    fix: '- level: Metadata\n  resources: [{ group: "", resources: ["secrets"] }]'
  },
  {
    cert: 'CKS', title: 'Pod SSRF Steals Cloud Node IAM Credentials via 169.254.169.254',
    snippet: `$ kubectl exec -it web-7f9 -- curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/\nworker-node-admin-role   <-- EXPOSED TO ANY POD!`,
    question: 'Which Kubernetes NetworkPolicy Egress rule blocks Pods from reaching the Cloud Instance Metadata IP (`169.254.169.254/32`) while keeping internet egress working?',
    options: [
      'Use `ipBlock: { cidr: 0.0.0.0/0, except: [169.254.169.254/32] }` inside an Egress NetworkPolicy (and enforce IMDSv2 hop-limit=1).',
      'Block TCP port 80 on Ingress.',
      'Set `automountServiceAccountToken: false`.',
      'Add a PodDisruptionBudget.'
    ],
    correct: 0,
    explanation: '`ipBlock.except: [169.254.169.254/32]` blackholes link-local cloud metadata access from Pods while still permitting general outbound HTTPS traffic.',
    fix: 'egress:\n- to: [{ ipBlock: { cidr: 0.0.0.0/0, except: [169.254.169.254/32] } }]'
  },
  {
    cert: 'CKS', title: 'Localhost Seccomp Profile Fails With "cannot load seccomp profile"',
    snippet: `# Profile stored on worker at: /var/lib/kubelet/seccomp/profiles/audit.json\nsecurityContext:\n  seccompProfile:\n    type: Localhost\n    localhostProfile: /var/lib/kubelet/seccomp/profiles/audit.json`,
    question: 'Why did kubelet fail to start the Pod with this `Localhost` Seccomp configuration?',
    options: [
      '`localhostProfile` must be a RELATIVE path under `/var/lib/kubelet/seccomp/` (i.e. `profiles/audit.json`), without repeating `/var/lib/kubelet/seccomp/`.',
      'Seccomp only works with `type: Unconfined`.',
      'Profiles must be stored in `/etc/apparmor.d/`.',
      'Seccomp requires `privileged: true`.'
    ],
    correct: 0,
    explanation: 'Kubelet automatically prepends `/var/lib/kubelet/seccomp/` to `localhostProfile`. Passing the absolute path duplicates the prefix and fails.',
    fix: 'localhostProfile: profiles/audit.json'
  },
  {
    cert: 'CKS', title: 'ImagePolicyWebhook Silently Allows Unscanned Images When Scanner Is Down',
    snippet: `# /etc/kubernetes/admission/imagepolicy-config.yaml\nimagePolicy:\n  kubeConfigFile: /etc/kubernetes/admission/webhook.kubeconfig\n  allowTTL: 50\n  defaultAllow: true`,
    question: 'During a scanner outage, `ImagePolicyWebhook` allowed an unverified `docker.io/evil:latest` Pod! What setting fixes this?',
    options: [
      'Set `defaultAllow: false` so ImagePolicyWebhook fails closed and rejects images whenever the external backend is unreachable.',
      'Set `allowTTL: 0`.',
      'Change `enable-admission-plugins` to `LimitRanger`.',
      'Set `imagePullPolicy: Never`.'
    ],
    correct: 0,
    explanation: '`defaultAllow: true` makes ImagePolicyWebhook fail open. Setting `defaultAllow: false` enforces fail-closed security.',
    fix: 'defaultAllow: false'
  },
  {
    cert: 'CKS', title: 'Untrusted Multi-Tenant Code Needs Kernel Isolation Beyond runc',
    snippet: `apiVersion: node.k8s.io/v1\nkind: RuntimeClass\nmetadata: { name: sandboxed }\nhandler: runsc`,
    question: 'You created `RuntimeClass/sandboxed` (`handler: runsc` for gVisor). How do you ensure untrusted tenant Pods actually run inside gVisor instead of standard `runc`?',
    options: [
      'Set `spec.runtimeClassName: sandboxed` on the Pod template (and verify `nodeSelector` if only specific nodes have `runsc`).',
      'Label the Namespace `runtime=gvisor`.',
      'Restart kube-scheduler.',
      'Set `securityContext.privileged: false`.'
    ],
    correct: 0,
    explanation: 'Creating a RuntimeClass registers the handler name, but Pods continue using the default `runc` runtime unless `spec.runtimeClassName: sandboxed` is set.',
    fix: 'spec:\n  runtimeClassName: sandboxed'
  },
  {
    cert: 'CKAD', title: 'Telepresence Intercept Breaks Teammates on Shared Dev Cluster',
    snippet: `$ telepresence intercept orders --port 8080:80\n# Problem: ALL staging traffic for "orders" now hits your laptop!`,
    question: 'How do you intercept ONLY your own test requests to `orders` on a shared staging cluster without disrupting teammates?',
    options: [
      'Use a personal header-based intercept (`--http-header=x-dev=alice`) so only matching HTTP requests route to your laptop while all other traffic stays in the remote Pod.',
      'Run `telepresence connect` twice.',
      'Scale the remote Deployment to 0 replicas.',
      'Use `kubectl port-forward` instead.'
    ],
    correct: 0,
    explanation: 'Telepresence Traffic Agent inspects incoming HTTP headers and forwards only matching requests over the tunnel to your workstation, leaving baseline traffic untouched.',
    fix: 'telepresence intercept orders --port 8080:80 --http-header=x-dev=alice'
  },
  {
    cert: 'CNPE', title: 'Local App Under Telepresence Lacks Cluster Secrets & Mounted Certs',
    snippet: `$ telepresence intercept orders --port 8080:80\nError: open /etc/certs/tls.crt: no such file or directory\nError: env DB_PASSWORD is empty`,
    question: 'Which Telepresence flags automatically sync the remote Pod’s ConfigMap/Secret env vars and volume files to your local container?',
    options: [
      '`--env-file ./app.env` + `--mount=/tmp/vols` (or `--docker-run`, which maps Linux container paths automatically).',
      '`kubectl cp` on every file manually.',
      '`--namespace=kube-system`.',
      '`--dry-run=server`.'
    ],
    correct: 0,
    explanation: '`--env-file` exports all Pod environment variables, `--mount` attaches remote volumes over SSHFS, and `--docker-run` maps both cleanly into a local Docker container.',
    fix: 'telepresence intercept orders --port 8080:80 --env-file ./app.env --docker-run -- orders-dev'
  },
  {
    cert: 'CKA', title: 'Scheduled Disaster Recovery & PV Backup With Velero',
    snippet: `# Need full cluster + PV backup stored off-cluster in S3\n# Must test restore cleanly into staging`,
    question: 'Which tool backs up BOTH Kubernetes API manifests and CSI `VolumeSnapshots` to S3/GCS/Blob on a schedule?',
    options: [
      'kube-proxy IPVS.',
      'Velero with VolumeSnapshot integration (`velero schedule create`) plus automated staging restore drills.',
      'kubectl cp -R /var/lib/etcd.',
      'HorizontalPodAutoscaler.'
    ],
    correct: 1,
    explanation: 'Velero snapshots both etcd/Kubernetes resource manifests and underlying CSI persistent volumes to remote object storage.',
    fix: 'velero schedule create nightly --schedule="0 2 * * *" --snapshot-volumes=true'
  },
  {
    cert: 'CKAD', title: 'Blue-Green Switch Causes Zero Downtime With Instant Rollback',
    snippet: `# Both app-blue (v1) and app-green (v2) are 5/5 Ready\n$ kubectl get svc app-prod -o jsonpath='{.spec.selector}'\n{"app":"myapp","slot":"blue"}`,
    question: 'How do you shift 100% of live traffic to `app-green` instantly with a 1-second rollback path?',
    options: [
      'Delete `app-blue` Deployment first.',
      'Patch the `app-prod` Service selector from `slot: blue` to `slot: green` (and patch back to `blue` if metrics degrade).',
      'Set `maxUnavailable: 100%`.',
      'Restart kube-apiserver.'
    ],
    correct: 1,
    explanation: 'Changing the Service `spec.selector` shifts endpoints atomically across kube-proxy/eBPF while keeping Blue warm for instant rollback.',
    fix: 'kubectl patch svc app-prod -p \'{"spec":{"selector":{"slot":"green"}}}\''
  },
  {
    cert: 'CNPE', title: 'HPA Must Scale on HTTP Requests/Sec Instead of CPU',
    snippet: `apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\n# Goal: scale when http_requests_per_sec > 100 per Pod`,
    question: 'What enables HPA `v2` to read Prometheus application metrics like `http_requests_per_sec`?',
    options: [
      'Deploy `prometheus-adapter` (or KEDA) to expose Prometheus metrics via the `custom.metrics.k8s.io` API and reference `type: Pods` in HPA.',
      'Set `requests.cpu: 100`.',
      'Use a Static Pod.',
      'Enable PodSecurity Admission.'
    ],
    correct: 0,
    explanation: 'HPA queries Kubernetes metrics APIs (`metrics.k8s.io`, `custom.metrics.k8s.io`). `prometheus-adapter` or KEDA bridges Prometheus/queue metrics into HPA.',
    fix: 'metrics:\n- type: Pods\n  pods: { metric: { name: http_requests_per_sec }, target: { type: AverageValue, averageValue: "100" } }'
  },
  {
    cert: 'CKAD', title: 'Right-Sizing Over-Provisioned Container Requests Automatically',
    snippet: `$ kubectl top pods -n prod\nNAME      CPU(cores)   MEMORY(bytes)\napi-1     18m          95Mi   # Requested: 1000m CPU, 2Gi RAM!`,
    question: 'Which Kubernetes autoscaler analyzes historical container usage and adjusts CPU/memory `requests` & `limits` automatically?',
    options: [
      'Cluster Autoscaler.',
      'Vertical Pod Autoscaler (VPA) — use `updateMode: Off` first for recommendations, or `Auto`/`InPlaceOrRecreate` to right-size.',
      'kube-proxy.',
      'CoreDNS.'
    ],
    correct: 1,
    explanation: 'HPA scales Pod count horizontally; VPA right-sizes per-container CPU/memory requests & limits vertically (avoid running HPA and VPA on the same CPU/RAM metric simultaneously).',
    fix: 'Deploy VerticalPodAutoscaler with updateMode: "Off" (recommendation mode) to audit waste'
  },
  {
    cert: 'CKA', title: 'Exposing a Service With Ingress Path & Prefix Routing',
    snippet: `# Requirement: Ingress "dev" in namespace "dev"\n# Route http://example.org/dev -> devserver-service:8080\n$ kubectl create ingress dev -n dev --rule="example.org/dev=devserver-service:8080" --dry-run=client -o yaml`,
    question: 'When creating an `Ingress` (`networking.k8s.io/v1`) to route `http://example.org/dev` to `devserver-service` on port `8080`, which fields are required in the rule?',
    options: [
      '`kind: Route`, `targetPort: 8080`, and `pathType: Wildcard`.',
      '`host: http://example.org/dev` with `servicePort` placed directly inside `spec`.',
      '`host: example.org`, `path: /dev`, `pathType: Prefix`, and `backend.service: { name: devserver-service, port: { number: 8080 } }`.',
      '`type: LoadBalancer` set inside `Ingress.spec`.'
    ],
    correct: 2,
    explanation: '`networking.k8s.io/v1` Ingress requires a bare hostname (`example.org`, no scheme), an explicit `pathType` (`Prefix` or `Exact`), and `backend.service.name` + `port.number`. Imperative `--rule="example.org/dev=devserver-service:8080"` generates this skeleton instantly.',
    fix: 'kubectl create ingress dev -n dev --rule="example.org/dev*=devserver-service:8080"'
  },
  {
    cert: 'CKA', title: 'Logging Sidecar Enters CrashLoopBackOff Tailing app.log',
    snippet: `# Deployment "app": shared emptyDir mounted at /var/log in both containers\n# Main container takes 8s to create /var/log/app.log\n$ kubectl get pod app-6c8b9\nNAME        READY   STATUS             RESTARTS\napp-6c8b9   1/2     CrashLoopBackOff   4 (sidecar)`,
    question: 'Your `busybox:stable` sidecar container keeps crashing with `tail: can\'t open \'/var/log/app.log\': No such file or directory`. What fixes this cleanly?',
    options: [
      'Change the volume from `emptyDir` to `hostPath: /var/log`.',
      'Wait for the log file before tailing: `until [ -f /var/log/app.log ]; do sleep 1; done; tail -n+1 -f /var/log/app.log` while sharing the `emptyDir` volume at `/var/log`.',
      'Set `restartPolicy: Never` on the Deployment Pod template.',
      'Mount the `emptyDir` inside the sidecar only.'
    ],
    correct: 1,
    explanation: 'Containers in a Pod start concurrently, so `tail` can execute before the main app creates `/var/log/app.log`. Polling with `until [ -f ... ]` prevents immediate container exit and CrashLoopBackOff.',
    fix: 'args: ["until [ -f /var/log/app.log ]; do sleep 1; done; tail -n+1 -f /var/log/app.log"]'
  },
  {
    cert: 'CKA', title: 'HPA Requires Custom 30s Scale-Down Stabilization Window',
    snippet: `$ kubectl autoscale deploy app -n autoscale --min=1 --max=4 --cpu-percent=50\n# Exam requirement missing from imperative flags:\n# Set downscale stabilization window = 30 seconds!`,
    question: '`kubectl autoscale` does not expose a flag for `stabilizationWindowSeconds`. How do you configure the 30-second downscale stabilization window on `HPA/app`?',
    options: [
      'Export the manifest using `--dry-run=client -o yaml`, add `spec.behavior.scaleDown.stabilizationWindowSeconds: 30` (`autoscaling/v2`), and apply/replace with `kubectl replace -f hpa.yaml --force`.',
      'Set `--downscale-window=30s` on the `Deployment` resource.',
      'Configure `stabilizationWindowSeconds: 30` on the `Service`.',
      'Restart `metrics-server` with `--metric-resolution=30s`.'
    ],
    correct: 0,
    explanation: 'Imperative `kubectl autoscale` covers basic min/max/target settings, while `autoscaling/v2` scaling policies live under `spec.behavior.scaleDown.stabilizationWindowSeconds`. Generate YAML with `--dry-run=client`, edit `behavior`, and apply or `replace --force`.',
    fix: 'behavior:\n  scaleDown:\n    stabilizationWindowSeconds: 30'
  },
  {
    cert: 'CKA', title: 'WordPress Pods Stuck Pending After Requesting Full Node Allocatable',
    snippet: `$ kubectl describe node worker-1 | grep -A3 Allocatable\nAllocatable:\n  cpu:     2000m\n  memory:  4Gi\n# Deployment wordpress (-n wordpress) has replicas: 3\n# Currently requests: 2000m CPU, 4Gi RAM per Pod -> 2/3 Pods Pending!`,
    question: 'You must divide node resources evenly across all 3 WordPress Pods while leaving ~10–20% stable overhead for the node. What `resources.requests` should each Pod set?',
    options: [
      'Keep `cpu: 2000m, memory: 4Gi` on requests and lower `limits` only.',
      'Set `cpu: 1000m, memory: 2Gi` per Pod.',
      'Divide Allocatable by 3 (`666m`, `1.33Gi`) and round down for ~15–25% headroom: `requests: { cpu: "500m", memory: "1Gi" }`.',
      'Delete `resources.requests` and keep `limits` at `0`.'
    ],
    correct: 2,
    explanation: 'Kube-scheduler schedules based on summed `resources.requests` vs Node `Allocatable`. Three Pods requesting `500m` CPU (`1500m <= 2000m`) and `1Gi` RAM (`3Gi <= 4Gi`) fit on the node while preserving safe CPU/memory headroom.',
    fix: 'requests:\n  cpu: "500m"\n  memory: "1Gi"'
  },
  {
    cert: 'CKA', title: 'Security Audit Fails Cluster CNI for Missing NetworkPolicy Support',
    snippet: `$ kubectl apply -f strict-netpol.yaml\nnetworkpolicy.networking.k8s.io/deny-all created\n$ kubectl exec untrusted -- curl -s --max-time 2 http://db:5432\nConnected!  <-- Cluster uses Flannel CNI`,
    question: 'Your cluster failed a security audit because its CNI ignores `NetworkPolicy` objects. Between **Flannel** and **Calico**, which CNI resolves this and how do you install it?',
    options: [
      'Keep Flannel and pass `--enable-network-policy` to `kube-proxy`.',
      'Install **Calico** (which enforces Kubernetes `NetworkPolicy` resources out of the box), e.g., applying `tigera-operator.yaml` and verifying Pods in `tigera-operator`.',
      'Flannel enforces L7 NetworkPolicies natively; wait 5 minutes for convergence.',
      'Enable CoreDNS `policy` plugin in `kube-system`.'
    ],
    correct: 1,
    explanation: 'Flannel handles pod overlay networking only and does NOT enforce `NetworkPolicy` rules natively. Calico (or Cilium) implements the NetworkPolicy controller so ingress/egress rules are enforced.',
    fix: 'kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/tigera-operator.yaml'
  },
  {
    cert: 'CKA', title: 'Bootstrapping a kubeadm Node: cri-dockerd & Persistent sysctl',
    snippet: `# Tasks on Ubuntu worker before kubeadm join:\n# 1. Install /home/candidate/cri-dockerd_0.3.9.3-0.ubuntu-jammy_amd64.deb & start service\n# 2. Persist net.bridge.bridge-nf-call-iptables=1, net.ipv4.ip_forward=1,\n#    net.ipv6.conf.all.forwarding=1, net.netfilter.nf_conntrack_max=131072 across reboots`,
    question: 'Which command sequence installs `cri-dockerd` and ensures all four kernel parameters persist across reboots?',
    options: [
      'Run `sysctl -w ...` only and extract the `.deb` with `tar -xf`.',
      'Install with `apt remove docker`, then write settings into `~/.bashrc`.',
      'Run `kubeadm init --skip-sysctl` before installing packages.',
      '`sudo dpkg -i .../cri-dockerd_*.deb && sudo systemctl enable --now cri-docker`, write the 4 params into `/etc/sysctl.d/k8s.conf`, and apply with `sudo sysctl --system`.'
    ],
    correct: 3,
    explanation: '`sysctl -w` resets on reboot! Writing kernel parameters under `/etc/sysctl.d/*.conf` persists settings cleanly across restarts, and `sudo sysctl --system` reloads them immediately.',
    fix: 'sudo dpkg -i /home/candidate/cri-dockerd_*.deb && sudo systemctl enable --now cri-docker && sudo sysctl --system'
  },
  {
    cert: 'CKA', title: 'Creating a Default StorageClass With WaitForFirstConsumer',
    snippet: `# Task: StorageClass "app-storage-class" for existing provisioner "xyz"\n# 1. Defer PV binding until Pod is scheduled\n# 2. Mark as cluster default StorageClass`,
    question: 'Which YAML configuration correctly sets both the default StorageClass behavior and late volume binding?',
    options: [
      '`metadata.annotations["storageclass.kubernetes.io/is-default-class"]: "true"`, `provisioner: xyz`, and `volumeBindingMode: WaitForFirstConsumer`.',
      '`spec.default: true` and `reclaimPolicy: WaitForFirstConsumer`.',
      '`metadata.labels.default: "true"` and `volumeBindingMode: Immediate`.',
      '`annotations["beta.storage/default"]: true` without specifying a provisioner.'
    ],
    correct: 0,
    explanation: 'Kubernetes identifies default StorageClasses strictly via the string annotation `"storageclass.kubernetes.io/is-default-class": "true"`, and `volumeBindingMode: WaitForFirstConsumer` waits for scheduler placement before provisioning.',
    fix: 'metadata:\n  name: app-storage-class\n  annotations:\n    storageclass.kubernetes.io/is-default-class: "true"\nprovisioner: xyz\nvolumeBindingMode: WaitForFirstConsumer'
  },
  {
    cert: 'CKA', title: 'Exposing an Existing Deployment via NodePort in One Command',
    snippet: `# Deployment "front-end" in namespace "production"\n# Container "nginx" listens on 80/tcp\n# Target: Service "front-end-svc" (type NodePort) on port 80 -> 80`,
    question: 'Which imperative command creates `front-end-svc` exposing `front-end` Pods over NodePort on TCP port 80 without writing YAML?',
    options: [
      '`kubectl create service nodeport front-end-svc --tcp=80:80 -n production` (matches Pods labeled `app=front-end-svc`!).',
      '`kubectl run service front-end-svc --type=NodePort --port=80 -n production`.',
      '`kubectl expose deployment front-end --name=front-end-svc --port=80 --target-port=80 --type=NodePort -n production`.',
      '`kubectl port-forward deployment/front-end 80:80 -n production`.'
    ],
    correct: 2,
    explanation: '`kubectl expose deployment front-end` automatically copies the Deployment\'s exact Pod selector labels onto the new `Service`, whereas `kubectl create service` guesses `app=<service-name>` and breaks endpoints if labels differ.',
    fix: 'kubectl expose deployment front-end --name=front-end-svc --port=80 --target-port=80 --type=NodePort -n production'
  },
  {
    cert: 'CKA', title: 'PriorityClass Preemption: One Less Than Highest User Priority',
    snippet: `$ kubectl get priorityclasses\nNAME                      VALUE        GLOBAL-DEFAULT\nsystem-cluster-critical   2000000000   false\nsystem-node-critical      2000001000   false\nbatch-critical            1000000      false\n# Task: Create "high-priority" = highest user-defined minus 1,\n# patch Deployment "app" (-n priority) to use it (evicting lower Pods).`,
    question: 'What `value` should `PriorityClass/high-priority` use, and where is `priorityClassName` patched on `Deployment/app`?',
    options: [
      'Set `value: 2000000999` (one below `system-node-critical`) and patch `metadata.priorityClassName`.',
      'Create `high-priority` with `value: 999999` (`1000000 - 1`, ignoring `system-*` built-ins) and patch `spec.template.spec.priorityClassName: "high-priority"`.',
      'Set `globalDefault: true` and patch `spec.selector.priorityClassName`.',
      'Negative priority value `-1` on `spec.strategy`.'
    ],
    correct: 1,
    explanation: '`system-node-critical` and `system-cluster-critical` are Kubernetes system classes; the highest user-defined PriorityClass is `batch-critical` (`1000000`), so `999999` is required. Patching `spec.template.spec.priorityClassName` triggers Pod preemption.',
    fix: 'kubectl patch deploy app -n priority -p \'{"spec":{"template":{"spec":{"priorityClassName":"high-priority"}}}}\''
  },
  {
    cert: 'CKA', title: 'Immutable ConfigMap TLSv1.2 Update Fails to Take Effect Until Restart',
    snippet: `# Deployment "app" (-n testing) mounts ConfigMap "app-config" (nginx.conf)\n# Tasks: allow TLSv1.2 + TLSv1.3, make ConfigMap immutable: true,\n# ensure Pods pick up changes & pass: curl --tls-max 1.2 https://web.k8s.local`,
    question: 'After setting `ssl_protocols TLSv1.2 TLSv1.3;` and `immutable: true` on `ConfigMap/app-config`, how do you ensure NGINX serves TLSv1.2 cleanly?',
    options: [
      'Run `kubectl rollout restart deployment app -n testing` so new Pods mount the updated immutable ConfigMap, then test with `curl --tls-max 1.2`. (Note: future edits to an immutable ConfigMap require deleting/recreating it or swapping to a new ConfigMap name.)',
      'Patch `immutable: false` inside the Deployment.',
      'Wait 60 seconds; immutable ConfigMaps hot-reload NGINX workers without signals.',
      'Re-encrypt etcd Secrets.'
    ],
    correct: 0,
    explanation: 'Making a ConfigMap `immutable: true` protects it from accidental edits and stops kubelet from polling the API server for changes on that ConfigMap. Running `kubectl rollout restart deploy/app -n testing` starts fresh NGINX Pods with TLSv1.2 enabled.',
    fix: 'kubectl rollout restart deployment app -n testing && curl --tls-max 1.2 https://web.k8s.local'
  },
  {
    cert: 'CKA', title: 'Restoring Deleted MariaDB Deployment & Binding Sole Existing PV',
    snippet: `$ kubectl get pv\nNAME      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      STORAGECLASS\nmaria-pv  250Mi      RWO            Retain           Available   manual\n# Task: Create PVC "mariadb" (RWO, 250Mi) in ns "mariadb"\n# Edit /home/deployments/mariadb-deployment.yaml to bind PVC & apply`,
    question: 'Why might a newly created `PVC/mariadb` stay stuck in `Pending` even though `maria-pv` (`Available`, `250Mi`, `RWO`) exists, and how do you bind the Deployment?',
    options: [
      'Change PVC `accessModes` to `ReadWriteMany`.',
      'Set `volumeMode: Block` on the Deployment container.',
      'Wait for `WaitForFirstConsumer` even if `storageClassName` differs.',
      'The PVC `spec.storageClassName` MUST match the PV (`manual`, or `""` if the PV had none) instead of falling back to the cluster default; set `storageClassName: manual` on `PVC/mariadb` and reference `persistentVolumeClaim: { claimName: mariadb }` in `mariadb-deployment.yaml`.'
    ],
    correct: 3,
    explanation: 'A PVC omits `storageClassName` at its own peril—Kubernetes auto-injects the default StorageClass if one exists, preventing it from binding to a PV with `manual` or `""`. Matching `storageClassName` binds it cleanly, and `claimName: mariadb` attaches it to the restored Deployment.',
    fix: 'Inspect `kubectl get pv -o yaml` -> match storageClassName on PVC -> set volumes[].persistentVolumeClaim.claimName: mariadb'
  }
];

const CHEATSHEETS = [
  {
    title: 'Imperative kubectl & Failure Triage Commands', certs: ['CKA', 'CKAD'],
    code: `# Fast YAML scaffolding (dry-run)\nkubectl run nginx --image=nginx --port=80 --dry-run=client -o yaml > pod.yaml\nkubectl create deploy api --image=app:v1 --replicas=3 --dry-run=client -o yaml > dep.yaml\nkubectl create job calc --image=busybox --dry-run=client -o yaml -- sh -c "echo ok"\n\n# Live Failure Triage (Pending / CrashLoop / OOM 137 / Endpoints)\nkubectl get events -A --sort-by='.lastTimestamp' | tail -n 15\nkubectl logs <pod> --previous\nkubectl get pod <pod> -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'\nkubectl get endpointslices -l kubernetes.io/service-name=api-svc\nkubectl debug -it pod/api --image=nicolaka/netshoot --target=api`
  },
  {
    title: 'Scheduling: Taints, NodeAffinity, AntiAffinity & PriorityClass', certs: ['CKA', 'CKAD'],
    code: `# Taint dedicated GPU node + matching Toleration\nkubectl taint nodes gpu-1 sku=a100:NoSchedule\ntolerations:\n- { key: "sku", operator: "Equal", value: "a100", effect: "NoSchedule" }\n\n# Hard NodeAffinity + HA PodAntiAffinity\naffinity:\n  nodeAffinity:\n    requiredDuringSchedulingIgnoredDuringExecution:\n      nodeSelectorTerms:\n      - matchExpressions: [{ key: sku, operator: In, values: [a100] }]\n  podAntiAffinity:\n    requiredDuringSchedulingIgnoredDuringExecution:\n    - labelSelector: { matchLabels: { app: api } }\n      topologyKey: kubernetes.io/hostname`
  },
  {
    title: 'Zero-Trust NetworkPolicy (Default-Deny + DNS + AND)', certs: ['CKS', 'CKA', 'CKAD'],
    code: `apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: api-zero-trust, namespace: prod }\nspec:\n  podSelector: { matchLabels: { app: api } }\n  policyTypes: [Ingress, Egress]\n  ingress:\n    - from:\n      - namespaceSelector: { matchLabels: { env: prod } }  # Single dash = AND!\n        podSelector: { matchLabels: { app: frontend } }\n      ports: [{ protocol: TCP, port: 8080 }]\n  egress:\n    - to: [{ namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: kube-system } } }]\n      ports: [{ protocol: UDP, port: 53 }, { protocol: TCP, port: 53 }]`
  },
  {
    title: 'Helm & Kustomize Overlays, Patches & Transformers', certs: ['CKAD', 'CNPE'],
    code: `# Helm atomic upgrade & template preview\nhelm template api ./chart -f values-prod.yaml\nhelm upgrade --install api ./chart -n prod -f values-prod.yaml --atomic\n\n# Kustomize overlay + JSON6902 patch + hashed ConfigMapGenerator\n# overlays/prod/kustomization.yaml\nresources: [../../base]\nnamePrefix: prod-\nimages: [{ name: ghcr.io/org/api, newTag: v2.4.1 }]\nconfigMapGenerator:\n- { name: app-cfg, literals: ["LOG_LEVEL=warn"] }\npatches:\n- target: { kind: Deployment, name: api }\n  patch: '[{"op":"replace","path":"/spec/replicas","value":6}]'`
  },
  {
    title: 'Cluster Maintenance & kubeadm Upgrade Playbook', certs: ['CKA'],
    code: `# 1. Backup etcd before upgrading\nETCDCTL_API=3 etcdctl snapshot save /root/etcd-pre-upgrade.db ...\n\n# 2. Control Plane 1 upgrade (1 minor version at a time)\napt-mark unhold kubeadm && apt-get update && apt-get install -y kubeadm=1.31.2-*\nkubeadm upgrade plan && sudo kubeadm upgrade apply v1.31.2\nkubectl drain cp-1 --ignore-daemonsets\napt-get install -y kubelet=1.31.2-* kubectl=1.31.2-* && systemctl restart kubelet\nkubectl uncordon cp-1\n\n# 3. Worker nodes (one by one)\nkubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data\n# On worker-1: install kubeadm=1.31.2-* -> kubeadm upgrade node -> install kubelet -> restart kubelet\nkubectl uncordon worker-1`
  },
  {
    title: 'User Cert Onboarding (CSR) & kubeconfig Contexts', certs: ['CKA', 'CKS'],
    code: `# 1. Key + CSR (CN=username, O=groups)\nopenssl genrsa -out jane.key 2048\nopenssl req -new -key jane.key -out jane.csr -subj "/CN=jane/O=devs"\n\n# 2. Approve CSR (signerName: kubernetes.io/kube-apiserver-client) & extract cert\nkubectl certificate approve jane-csr\nkubectl get csr jane-csr -o jsonpath='{.status.certificate}' | base64 -d > jane.crt\n\n# 3. Build kubeconfig + RBAC RoleBinding\nkubectl config set-credentials jane --client-certificate=jane.crt --client-key=jane.key --embed-certs=true\nkubectl config set-context jane-prod --cluster=kubernetes --user=jane --namespace=prod\nkubectl create rolebinding jane-view --clusterrole=view --user=jane -n prod`
  },
  {
    title: 'RBAC, PSA Restricted, Falco & ValidatingAdmissionPolicy CEL', certs: ['CKS', 'CNPE'],
    code: `# Enforce Pod Security Restricted\nkubectl label ns prod pod-security.kubernetes.io/enforce=restricted \\\n  pod-security.kubernetes.io/warn=restricted pod-security.kubernetes.io/audit=restricted\n\n# Native CEL ValidatingAdmissionPolicy expression\nvalidations:\n- expression: "object.spec.containers.all(c, !c.image.endsWith(':latest'))"\n  message: "Mutable :latest tags are forbidden"\n\n# etcd Encryption rewrite + Cert expiration check\nkubectl get secrets -A -o json | kubectl replace -f -\nkubeadm certs check-expiration && sudo kubeadm certs renew all`
  },
  {
    title: 'Gateway API Canary + Mirroring & Karpenter NodePool', certs: ['CKAD', 'CNPE'],
    code: `# HTTPRoute 90/10 Canary + RequestMirror\napiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nmetadata: { name: api-canary, namespace: prod }\nspec:\n  parentRefs: [{ name: prod-edge, namespace: edge }]\n  rules:\n  - filters: [{ type: RequestMirror, requestMirror: { backendRef: { name: svc-shadow, port: 80 } } }]\n    backendRefs:\n    - { name: svc-v1, port: 80, weight: 90 }\n    - { name: svc-v2, port: 80, weight: 10 }`
  },
  {
    title: 'Failure Modes & Root-Cause Triage Matrix', certs: ['CKA', 'CKAD', 'CNPE'],
    isMatrix: true,
    headers: ['Failure State', 'Root Cause', 'Triage Action'],
    rows: [
      ['Pending',               'Scheduler Filter failed (CPU/RAM, Taint, Unbound PVC, NodeAffinity)', 'kubectl describe pod -> Events'],
      ['ImagePullBackOff',      'Bad image tag, missing imagePullSecret, or registry DNS/TLS error', 'kubectl describe pod -> Events'],
      ['CreateContainerConfig', 'Referenced ConfigMap or Secret key missing in Namespace', 'kubectl describe pod + get cm/secret'],
      ['CrashLoopBackOff',      'Container starts then exits !=0 (app panic, bad cmd, Liveness fail)', 'kubectl logs <pod> --previous'],
      ['OOMKilled (Exit 137)',  'Container memory exceeded cgroup limits.memory (SIGKILL 128+9)', 'Raise limits.memory / fix leak'],
      ['Node NotReady',         'kubelet/containerd stopped, disk full, or node cert expired', 'systemctl status kubelet; journalctl']
    ]
  },
  {
    title: 'CKS Cluster Hardening: kube-bench, Auditing, UFW & IMDS Block', certs: ['CKS'],
    code: `# 1. CIS Benchmark audit & key file permissions\nkube-bench run --targets master,etcd,node\nchmod 600 /etc/kubernetes/pki/*.key /etc/kubernetes/admin.conf\n\n# 2. Host surface reduction: ports, kernel modules, UFW & SSH\nss -tulnp | grep LISTEN\necho "blacklist sctp" | sudo tee /etc/modprobe.d/blacklist-sctp.conf\nsudo ufw default deny incoming && sudo ufw allow 22/tcp && sudo ufw allow 6443/tcp && sudo ufw enable\n\n# 3. Block Cloud Node Metadata SSRF (169.254.169.254) via NetworkPolicy\negress:\n- to: [{ ipBlock: { cidr: 0.0.0.0/0, except: [169.254.169.254/32] } }]`
  },
  {
    title: 'CKS Supply Chain & Runtime: Trivy, SBOM, KubeLinter, Seccomp & RuntimeClass', certs: ['CKS'],
    code: `# 1. Supply chain: CVE scan, CycloneDX SBOM & static YAML linting\ntrivy image --severity CRITICAL,HIGH --exit-code 1 ghcr.io/org/api:v2.4\ntrivy image --format cyclonedx --output sbom.json ghcr.io/org/api:v2.4\nkube-linter lint deploy.yaml && kubesec scan pod.yaml\n\n# 2. Custom Seccomp (relative to /var/lib/kubelet/seccomp/) + AppArmor + gVisor RuntimeClass\nspec:\n  runtimeClassName: gvisor\n  securityContext:\n    seccompProfile: { type: Localhost, localhostProfile: profiles/audit.json }\n    appArmorProfile: { type: Localhost, localhostProfile: k8s-deny-write }\n    readOnlyRootFilesystem: true`
  },
  {
    title: 'Telepresence for Kubernetes: Connect, Intercept, Env, Volumes & Docker', certs: ['CKAD', 'CNPE'],
    code: `# 1. Install Traffic Manager once & connect laptop to cluster DNS/CIDRs\ntelepresence helm install\ntelepresence connect --namespace prod\ncurl http://orders.prod.svc.cluster.local:8080/health\n\n# 2. Header-scoped intercept + export env vars + mount remote volumes\ntelepresence intercept orders --port 8080:80 --http-header=x-dev=alice --env-file ./orders.env --mount=/tmp/vols\n\n# 3. Containerized local dev (exact Linux mount paths, zero host clutter)\ntelepresence connect --docker\ntelepresence intercept orders --port 8080:80 --docker-run -- --rm -v $(pwd):/src orders-dev:local\ntelepresence leave orders && telepresence quit`
  },
  {
    title: 'CNCF Certification Track Coverage Matrix', certs: ['CKA', 'CKAD', 'CKS', 'CNPE'],
    isMatrix: true,
    rows: [
      ['CKA',  'Cluster Arch & Upgrades (25%), Workloads & Scheduling (15%), Services/DNS/Ingress (20%), Storage (10%), Troubleshooting (30%)', 'Modules 01–05, 09–11'],
      ['CKAD', 'App Design & Volumes (20%), Deploy & Helm/Kustomize (20%), Failure Triage (15%), Config/Sec (25%), Services/Gateway (20%)', 'Modules 02–05, 08–09'],
      ['CKS',  'CIS kube-bench & PKI (15%), OS/UFW/Docker/Auditing (15%), PSA/Secrets/IMDS (10%), NetPol/Mesh/Taints (20%), Supply Chain/OPA/CEL (20%), Falco/Seccomp/gVisor (20%)', 'Modules 01, 03–07, 10'],
      ['CNPE', 'GitOps AppSets/Flux, Helm/Kustomize, CRDs/Operators, Control Plane Patterns, Managed vs Multi-Cluster, Karpenter', 'Modules 01, 05, 07–08, 10–13']
    ]
  }
];

const LAB_FEATURES = [
  { key: 'haEtcd',    name: 'HA 3-Node Control Plane & etcd', sub: 'Raft quorum survives 1 node loss', sec: 5,  rel: 30, plat: 15 },
  { key: 'psa',       name: 'PSA Restricted + Seccomp',       sub: 'Blocks privileged / UID 0 Pods',   sec: 25, rel: 5,  plat: 10 },
  { key: 'netpol',    name: 'Default-Deny NetworkPolicies',   sub: 'Cilium eBPF micro-segmentation',   sec: 25, rel: 5,  plat: 10 },
  { key: 'cel',       name: 'Native CEL Validating Policy',   sub: 'Blocks :latest & unsigned images', sec: 15, rel: 5,  plat: 15 },
  { key: 'rbac',      name: 'Least-Privilege RBAC & Bound SA',sub: 'No default SA roles · automount off', sec: 15, rel: 5, plat: 10 },
  { key: 'karpenter', name: 'HPA + Karpenter Autoscaling',    sub: 'Auto-scales Pods + Spot VMs (35s)',sec: 0,  rel: 25, plat: 15 },
  { key: 'gitops',    name: 'ArgoCD GitOps Self-Heal',        sub: 'Reverts manual kubectl drift',     sec: 5,  rel: 15, plat: 20 },
  { key: 'falco',     name: 'Falco eBPF Runtime Sensor',      sub: 'Detects live syscall intrusions',  sec: 10, rel: 10, plat: 5  }
];

const LAB_FEATURE_META = {
  haEtcd: {
    group: 'cluster', cert: 'CKA',
    plain: 'Runs 3+ stacked or external etcd & API server replicas so losing 1 control plane node preserves Raft majority quorum (2/3) with zero downtime.',
    yaml: `# Verify 3-member etcd quorum & leader health\nkubectl -n kube-system exec etcd-cp-1 -- etcdctl endpoint status --cluster -w table`
  },
  psa: {
    group: 'cluster', cert: 'CKS',
    plain: 'Enforces Pod Security Admission (restricted) and RuntimeDefault seccomp at the namespace boundary, rejecting root UID 0 and privileged containers.',
    yaml: `apiVersion: v1\nkind: Namespace\nmetadata:\n  name: prod\n  labels:\n    pod-security.kubernetes.io/enforce: restricted\n    pod-security.kubernetes.io/warn: restricted`
  },
  netpol: {
    group: 'cluster', cert: 'CKS',
    plain: 'Replaces Kubernetes’ default flat "allow-all" Pod network with Default-Deny CNI rules so Pods can only talk along explicit allow-listed ports.',
    yaml: `apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: default-deny-all, namespace: prod }\nspec:\n  podSelector: {}\n  policyTypes: [Ingress, Egress]`
  },
  cel: {
    group: 'cluster', cert: 'CKS',
    plain: 'Evaluates fast CEL ValidatingAdmissionPolicy rules inside kube-apiserver (zero webhook latency) to block mutable :latest tags and untrusted registries.',
    yaml: `validations:\n- expression: "!object.spec.containers.exists(c, c.image.endsWith(':latest'))"\n  message: "Immutable version/digest image tags required in prod"`
  },
  rbac: {
    group: 'cluster', cert: 'CKS',
    plain: 'Follows least privilege with scoped RoleBindings, projected time-bound ServiceAccount tokens, and automountServiceAccountToken: false where unneeded.',
    yaml: `automountServiceAccountToken: false\n# Bound projected token (auto-rotated every 1h)\nserviceAccountName: payments-reader`
  },
  karpenter: {
    group: 'cluster', cert: 'CNPE',
    plain: 'Pairs HPA v2 Pod autoscaling with Karpenter node provisioning (~35s right-sized Spot/On-Demand VMs) to handle flash traffic spikes and node losses.',
    yaml: `apiVersion: karpenter.sh/v1\nkind: NodePool\nspec:\n  disruption:\n    consolidationPolicy: WhenEmptyOrUnderutilized`
  },
  gitops: {
    group: 'cluster', cert: 'CNPE',
    plain: 'Continuously runs a 3-way diff between Git HEAD and live cluster state via ArgoCD, automatically reverting manual kubectl edits (selfHeal: true).',
    yaml: `syncPolicy:\n  automated:\n    prune: true\n    selfHeal: true`
  },
  falco: {
    group: 'cluster', cert: 'CKS',
    plain: 'Monitors Linux kernel syscalls via eBPF probes across every node to alert on interactive shells, /etc/shadow reads, or unexpected crypto/scanner binaries.',
    yaml: `- rule: Terminal Shell in Container\n  condition: spawned_process and container and shell_procs\n  priority: WARNING`
  },
  splitCache: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Uses SharedInformer in-memory watches for Reads and sends Writes directly to kube-apiserver, eliminating repetitive List/Get API storms.',
    yaml: `// controller-runtime Manager automatically uses Split Client\nmgr.GetClient().Get(ctx, key, &db) // reads local Informer RAM cache!`
  },
  predicate: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Filters out noisy Status-only and unchanged watch events before items ever hit the WorkQueue, stopping infinite Reconcile() loops.',
    yaml: `ctrl.NewControllerManagedBy(mgr).\n  For(&dbv1.Postgres{}).\n  WithEventFilter(predicate.GenerationChangedPredicate{}).\n  Complete(r)`
  },
  statusSub: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Separates .spec from .status into distinct API subresources so controller status updates never bump metadata.generation.',
    yaml: `// +kubebuilder:subresource:status\n// Status writes only update .status without changing generation:\nr.Status().Update(ctx, &cr)`
  },
  ownerRefs: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Stamps Parent->Child OwnerReferences via SetControllerReference and .Owns() watches so drifted Deployments heal and child deletion cascades via GC.',
    yaml: `ctrl.SetControllerReference(&cr, &deploy, r.Scheme)\n// Watch owned children:\nctrl.NewControllerManagedBy(mgr).For(&dbv1.Postgres{}).Owns(&appsv1.Deployment{})`
  },
  finalizers: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Pauses etcd erasure upon kubectl delete by setting DeletionTimestamp until external cloud infrastructure (AWS RDS/S3/DNS) confirms clean teardown.',
    yaml: `if !cr.DeletionTimestamp.IsZero() {\n  if err := r.deleteExternalRDS(ctx, &cr); err != nil { return ctrl.Result{}, err }\n  controllerutil.RemoveFinalizer(&cr, dbFinalizer)\n}`
  },
  celWebhook: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Enforces structural OpenAPI rules, CEL x-kubernetes-validations, and validating webhooks before malformed CRs ever persist in etcd.',
    yaml: `// +kubebuilder:validation:Minimum=1\n// +kubebuilder:validation:XValidation:rule="self >= oldSelf"\nReplicas int32 \`json:"replicas"\``
  },
  backoff: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Coalesces bursty events by ns/name key inside a rate-limited WorkQueue with exponential backoff, protecting kube-apiserver from retry floods.',
    yaml: `// Returning error triggers exponential backoff in WorkQueue (5ms -> 10ms -> ... -> 1000s)\nif err != nil { return ctrl.Result{}, err }`
  },
  leaderHA: {
    group: 'operator', cert: 'OPERATOR',
    plain: 'Runs active/standby operator replicas competing over a coordination.k8s.io/v1 Lease lock so pod OOM/restarts fail over without split-brain writes.',
    yaml: `mgr, _ := ctrl.NewManager(cfg, ctrl.Options{\n  LeaderElection: true,\n  LeaderElectionID: "postgres-operator.lock",\n  LeaderElectionReleaseOnCancel: true,\n})`
  }
};

const LAB_SCENARIOS = {
  normal: {
    group: 'cluster',
    title: 'Steady State — Baseline Production Cluster Verification',
    layman: 'Everything is humming smoothly in normal traffic: requests pass API admission gates, etcd stores state, Pods serve users, and runtime sensors keep watch.',
    req: [],
    okText: 'Cluster components are healthy. Use the Traffic Load Slider (1x–10x) or inject a Chaos/Attack simulation above to stress-test your current guardrails.',
    failText: '',
    kubectl: `kubectl get nodes,pods -A\nkubectl top nodes`,
    yamlFix: `# Run a baseline cluster health check across nodes and events\nkubectl get events -A --sort-by='.lastTimestamp' | tail -n 15`,
    steps: L => [
      ['1. API Gateway', 'kube-apiserver :6443', L.psa || L.cel ? 'Admission gates (PSA/CEL) actively validate incoming specs.' : 'Warning: API server accepts unvalidated root / :latest workloads.'],
      ['2. State & Sync', L.haEtcd ? '3-Node etcd Quorum' : '1-Node etcd (SPOF)', L.haEtcd ? '2/3 Raft quorum protects cluster state against node loss.' : 'Risk: A single control plane crash will freeze all API writes.'],
      ['3. Workload Fleet', L.netpol ? 'Zero-Trust NetPol' : 'Flat CNI Network', L.gitops ? 'ArgoCD continuously reconciles cluster state from Git.' : 'Manual kubectl changes are not tracked by GitOps.']
    ]
  },
  'kill-cp': {
    group: 'cluster',
    title: 'Kill 1 Control Plane Node — Raft Consensus & API Continuity Test',
    layman: 'Like losing one of your air-traffic control towers: with 3 towers voting (Raft quorum), the other 2 keep planes landing safely; with only 1 tower, the entire airport freezes.',
    req: ['haEtcd'],
    okText: 'Control Plane Node #3 crashed, but nodes #1 and #2 hold a 2/3 etcd Raft majority quorum. kube-apiserver keeps serving reads/writes and Pod workloads stay unaffected.',
    failText: 'With only 1 etcd/control-plane node (SPOF), losing it stalls every kubectl command, scheduler decision, and controller reconciliation across the cluster!',
    kubectl: `kubectl get componentstatuses || kubectl get nodes -l node-role.kubernetes.io/control-plane`,
    yamlFix: `# Stack 3 control-plane nodes so (3/2)+1 = 2 node Raft quorum survives 1 failure\nkubeadm init --control-plane-endpoint "k8s-api.internal:6443" --upload-certs`,
    steps: L => [
      ['1. Fault Injected', 'Control Plane Node #3', 'Hardware power loss terminates apiserver + etcd member #3 immediately.'],
      ['2. Quorum Vote', 'etcd Cluster', L.haEtcd ? 'Remaining 2 of 3 members maintain majority quorum (N/2 + 1 = 2) ✓' : '0 of 1 member reachable — cluster loses Raft consensus quorum ✕'],
      ['3. Cluster Outcome', 'kube-apiserver :6443', L.haEtcd ? 'Load balancer routes traffic cleanly to healthy CP nodes #1 & #2.' : 'COMPLETE API OUTAGE: kubectl times out; no Pods can reschedule.']
    ]
  },
  'root-pod': {
    group: 'cluster',
    title: 'Deploy Privileged Root Pod — Container Escape Defense Test',
    layman: 'Like someone trying to bring a master lockpick set (privileged: true, UID 0) into a secure building: Restricted security badges stop them at the lobby door before they ever get inside.',
    req: ['psa'],
    altReq: ['psa', 'cel'],
    okText: 'Pod Security Admission (restricted) rejected the Pod at admission with HTTP 403 Forbidden before it ever touched etcd or a worker node.',
    failText: 'SECURITY BREACH: The privileged UID 0 Pod bypassed API admission, mounted host namespaces on the worker node, and escaped into host root!',
    kubectl: `kubectl apply -f evil-root-pod.yaml\n# Expected when hardened: Error from server (Forbidden): violates PodSecurity "restricted:latest"`,
    yamlFix: `kubectl label ns prod pod-security.kubernetes.io/enforce=restricted --overwrite`,
    steps: L => [
      ['1. Attacker Submit', 'kubectl POST Pod', 'Submits Pod with privileged: true, hostNetwork: true, runAsUser: 0.'],
      ['2. Admission Gate', 'PSA / CEL Engine', (L.psa || L.cel) ? 'Policy denies privileged flag + root UID -> 403 Forbidden ✓' : 'No Restricted PSA/CEL policy configured -> request passes admission ✕'],
      ['3. Runtime Impact', 'Worker Node Kernel', (L.psa || L.cel) ? 'Zero container created; worker host filesystem remains isolated.' : 'Container runs as host UID 0 with full CAP_SYS_ADMIN access!']
    ]
  },
  'lateral-scan': {
    group: 'cluster',
    title: 'Lateral Pod Scan — East-West Micro-Segmentation Test',
    layman: 'Like putting keycard-locked doors between office departments: even if someone breaks into the reception desk (web pod), they cannot walk into the finance vault (Prod DB).',
    req: ['netpol'],
    okText: 'Cilium/CNI Default-Deny NetworkPolicy dropped TCP SYN packets to Prod DB :5432 at the eBPF/netfilter layer before reaching the database socket.',
    failText: 'LATERAL BREACH: On Kubernetes’ default flat network, the compromised rogue Pod scanned Prod DB :5432 directly over the cluster overlay!',
    kubectl: `kubectl exec -n prod rogue-pod -- nc -zv -w2 prod-db.prod.svc 5432`,
    yamlFix: `apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: db-allow-api-only, namespace: prod }\nspec:\n  podSelector: { matchLabels: { app: prod-db } }\n  ingress:\n  - from: [{ podSelector: { matchLabels: { app: payments-api } } }]\n    ports: [{ protocol: TCP, port: 5432 }]`,
    steps: L => [
      ['1. Compromised Pod', 'Rogue App Pod', 'Attempts port scan & credential brute-force against prod-db:5432.'],
      ['2. CNI Enforcement', 'eBPF / NetPol', L.netpol ? 'NetworkPolicy denies unmatched source labels -> TCP DROP ✓' : (L.falco ? 'Flat CNI allows packet! Falco emits eBPF alert too late to block traffic ⚠' : 'Flat CNI routes packet unimpeded directly to database Pod IP ✕')],
      ['3. Database Vault', 'Prod DB :5432', L.netpol ? 'Connection times out cleanly; zero attacker packets reach PostgreSQL.' : 'Attacker enumerates schema & attempts exfiltration over :5432!']
    ]
  },
  'cve-image': {
    group: 'cluster',
    title: 'Deploy Unverified :latest Image — Supply Chain Admission Test',
    layman: 'Like an unlabeled mystery box arriving at a restaurant kitchen: strict inspection stamps (:sha256 digest verification) reject unverified ingredients before anyone cooks with them.',
    req: ['cel'],
    okText: 'Native CEL ValidatingAdmissionPolicy rejected the mutable :latest tag immediately in-process (422 Unprocessable Entity), forcing pinned immutable image digests.',
    failText: 'SUPPLY CHAIN RISK: Mutable :latest image bypassed admission and pulled an unverified binary containing critical CVEs onto production nodes!',
    kubectl: `kubectl run supply-test --image=nginx:latest -n prod\n# Hardened output: ValidatingAdmissionPolicy "block-latest-tag" denied request`,
    yamlFix: `apiVersion: admissionregistration.k8s.io/v1\nkind: ValidatingAdmissionPolicy\nmetadata: { name: block-latest-tag }\nspec:\n  validations:\n  - expression: "object.spec.containers.all(c, !c.image.endsWith(':latest'))"\n    message: "Use pinned semver or @sha256 digests"`,
    steps: L => [
      ['1. CI/User Deploy', 'Deployment v2', 'Attempts rolling out image: app:latest without digest signature.'],
      ['2. Policy Engine', 'Native CEL Gate', L.cel ? 'CEL expression detects ":latest" suffix -> blocked in <1ms ✓' : 'No CEL admission policy active -> image pull reaches kubelet ✕'],
      ['3. Node Runtime', L.falco ? 'Falco eBPF' : 'Container Runtime', L.cel ? 'Pod never scheduled; fleet remains tamper-free.' : (L.falco ? 'Image starts; Falco flags unexpected outbound shell/binary activity ⚠' : 'Vulnerable image runs silently in production!')]
    ]
  },
  'traffic-spike': {
    group: 'cluster',
    title: '10x Flash Traffic Spike — HPA + Karpenter Capacity Burst',
    layman: 'Like ten tour buses pulling into a cafe at once: HPA opens extra cashiers immediately while Karpenter builds new dining tables in 35 seconds so nobody waits in line.',
    req: ['karpenter'],
    okText: 'HPA scaled App Pods from 3 -> 12 replicas on CPU/RPS surge, and Karpenter provisioned right-sized Spot capacity in ~35s to keep p99 latency under 45ms.',
    failText: 'DEGRADED SERVICE: Fixed static worker nodes hit 98% CPU saturation; incoming HTTP requests queue up and return 503 Gateway Timeout!',
    kubectl: `kubectl get hpa,nodeclaims\nkubectl top pods -n prod`,
    yamlFix: `apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata: { name: api-hpa }\nspec:\n  minReplicas: 3\n  maxReplicas: 25\n  metrics:\n  - type: Resource\n    resource: { name: cpu, target: { type: Utilization, averageUtilization: 65 } }`,
    steps: L => [
      ['1. Load Surge', 'Ingress Edge', 'Incoming traffic jumps 10x (~1,200 RPS); Pod CPU crosses 70% HPA target.'],
      ['2. Pod + Node Scale', 'HPA + Karpenter', L.karpenter ? 'HPA expands Pods -> Pending Pods trigger Karpenter NodeClaim (35s Spot boot) ✓' : 'No autoscaling active -> Pods remain capped at 3x on saturated nodes ✕'],
      ['3. User Latency', 'Service p99', L.karpenter ? 'Capacity absorbs 10x traffic smoothly; error rate 0.0% ✓' : 'CPU throttling spikes p99 > 2,400ms; 503 timeouts hit users!']
    ]
  },
  'worker-loss': {
    group: 'cluster',
    title: 'Worker Node / AZ Hardware Loss — Self-Healing & Reschedule',
    layman: 'Like one kitchen oven suddenly losing power: if you have backup capacity or fast auto-provisioning, orders seamlessly move to working ovens with zero ruined meals.',
    req: ['karpenter', 'haEtcd'],
    okText: 'Control plane marked the lost worker NotReady after Lease expiry; ReplicaSet + Karpenter automatically scheduled replacement capacity cleanly across healthy AZs.',
    failText: 'CAPACITY DROP: Without HA Control Plane + Karpenter node replacement, lost worker Pods stay stuck in Pending with Insufficient CPU/Memory!',
    kubectl: `kubectl get nodes -w\nkubectl get events --field-selector reason=FailedScheduling`,
    yamlFix: `topologySpreadConstraints:\n- maxSkew: 1\n  topologyKey: topology.kubernetes.io/zone\n  whenUnsatisfiable: DoNotSchedule`,
    steps: L => [
      ['1. Node Failure', 'Worker Node B', 'AZ fiber cut knocks Worker Node B offline; kubelet stops renewing Node Lease.'],
      ['2. Eviction + Drain', 'Controller Manager', L.haEtcd ? 'Control plane stays online & marks Unscheduled replacements immediately ✓' : 'If single CP node was on same host, cluster cannot evict or reschedule ✕'],
      ['3. Recovery', 'Scheduler / Karpenter', L.karpenter ? 'Karpenter provisions fresh replacement node in healthy AZ within 35s ✓' : 'Manual cloud VM replacement required while Pods remain Pending ⚠']
    ]
  },
  'manual-drift': {
    group: 'cluster',
    title: 'Manual kubectl Config Drift — GitOps Self-Heal Reconciliation',
    layman: 'Like an operator painting a store sign green without updating headquarters blueprints: ArgoCD spots the mismatch against Git immediately and repaints it back to spec in seconds.',
    req: ['gitops'],
    okText: 'ArgoCD detected live ReplicaSet divergence against Git HEAD (OutOfSync) and automatically healed replicas back to 3 in ~4 seconds.',
    failText: 'CONFIG DRIFT: Someone ran an ad-hoc `kubectl scale --replicas=1` in prod — cluster state is now permanently out of sync with Git!',
    kubectl: `kubectl -n argocd get application prod-app -o jsonpath='{.status.sync.status}'`,
    yamlFix: `# Enforce GitOps self-healing against manual kubectl edits:\nsyncPolicy:\n  automated:\n    prune: true\n    selfHeal: true`,
    steps: L => [
      ['1. Manual Edit', 'On-Call kubectl CLI', 'Operator runs `kubectl scale deploy/app --replicas=1` during hotfix.'],
      ['2. Diff Engine', 'ArgoCD / GitOps', L.gitops ? '3-way diff detects Git(3) != Live(1) -> status=OutOfSync ✓' : 'No continuous GitOps reconciler watching cluster state ✕'],
      ['3. Convergence', 'Target Deployment', L.gitops ? 'ArgoCD selfHeal applies declarative spec back to 3x healthy replicas ✓' : 'Cluster quietly runs at 1/3 capacity until next CI deploy!']
    ]
  },
  'invalid-cr': {
    group: 'operator',
    title: 'Submit Invalid CustomResource Spec — Pre-etcd Validation Test',
    layman: 'Like rejecting a food order asking for "-2 pizzas" right at the register before sending a nonsense ticket back to the kitchen.',
    req: ['celWebhook'],
    okText: 'Inline CRD CEL rules & ValidatingWebhook rejected `replicas: -2` at API admission (422 Invalid) — etcd and the Operator stay completely clean.',
    failText: 'POISON PILL IN ETCD: Invalid Custom Resource persisted into etcd, crashing the Go Reconcile() loop repeatedly on negative slice bounds!',
    kubectl: `kubectl apply -f - <<EOF\napiVersion: db.scale.io/v1\nkind: Postgres\nmetadata: { name: bad-db }\nspec: { replicas: -2 }\nEOF`,
    yamlFix: `// +kubebuilder:validation:Minimum=1\n// +kubebuilder:validation:Maximum=9\nReplicas int32 \`json:"replicas"\``,
    steps: L => [
      ['1. CR Apply', 'Client YAML', 'Sends Postgres CustomResource with `spec.replicas: -2`.'],
      ['2. API Validation', 'CEL / Webhook', L.celWebhook ? 'OpenAPI + CEL guardrails block invalid spec with 422 before etcd ✓' : 'Unguarded CRD accepts arbitrary invalid spec straight into etcd ✕'],
      ['3. Reconciler Health', 'Operator Manager', L.celWebhook ? 'Reconciler never sees corrupted input; zero wasted loops ✓' : 'Reconcile() fails on every retry backoff until manual cleanup!']
    ]
  },
  'delete-db': {
    group: 'operator',
    title: 'Delete CR With External Cloud RDS — Finalizer Cleanup Test',
    layman: 'Like canceling an apartment lease: a Finalizer ensures you turn off the utilities and hand back the keys (delete AWS RDS) BEFORE tearing up the contract (deleting etcd CR).',
    req: ['finalizers', 'ownerRefs'],
    okText: 'kubectl delete stamped DeletionTimestamp; Finalizer tore down external AWS RDS cleanly and removed itself so OwnerRefs cascaded in-cluster GC with 0 orphans.',
    failText: 'ORPHANED CLOUD BILL: Without Finalizers + OwnerRefs, kubectl delete erased the CR immediately while leaving the expensive AWS RDS instance running!',
    kubectl: `kubectl delete postgres prod-db\nkubectl get postgres prod-db -o jsonpath='{.metadata.finalizers}'`,
    yamlFix: `if cr.DeletionTimestamp.IsZero() {\n  controllerutil.AddFinalizer(&cr, "db.scale.io/finalizer")\n} else {\n  if err := cleanupAWSRDS(ctx, &cr); err == nil {\n    controllerutil.RemoveFinalizer(&cr, "db.scale.io/finalizer")\n  }\n}`,
    steps: L => [
      ['1. Delete Request', 'kubectl delete CR', 'User requests deletion of the Postgres Custom Resource owning an AWS RDS DB.'],
      ['2. Deletion Hook', 'Finalizer Gate', L.finalizers ? 'API sets DeletionTimestamp instead of deleting; Operator deletes AWS RDS first ✓' : 'API immediately purges CR from etcd -> AWS RDS permanently orphaned $$$ ✕'],
      ['3. Child Cleanup', 'K8s Garbage Collector', (L.ownerRefs && L.finalizers) ? 'After Finalizer unlocks CR delete, OwnerRefs cascade Deployment/Svc GC ✓' : 'In-cluster Deployments/PVCs or external DBs remain leaked!']
    ]
  },
  'status-storm': {
    group: 'operator',
    title: 'Reconcile Status Update Storm — Subresource & Predicate Test',
    layman: 'Like writing a sticky note saying "I checked the mailbox" onto the mailbox itself and letting that trigger another trip outside forever — /status + Predicates break that infinite loop.',
    req: ['predicate', 'statusSub'],
    okText: '/status subresource kept metadata.generation unchanged during status writes, and GenerationChangedPredicate dropped harmless watch noise before WorkQueue.',
    failText: 'INFINITE LOOP STORM: Status writes updated the main object and fired self-requeue watches at 100% CPU!',
    kubectl: `kubectl get postgres prod-db -o jsonpath='gen={.metadata.generation} obs={.status.observedGeneration}'`,
    yamlFix: `// Combine /status subresource + GenerationChangedPredicate:\nctrl.NewControllerManagedBy(mgr).\n  For(&dbv1.Postgres{}).\n  WithEventFilter(predicate.GenerationChangedPredicate{}).Complete(r)`,
    steps: L => [
      ['1. Status Write', 'Reconcile End', 'Controller calls Status().Update() to report Ready condition on the CR.'],
      ['2. Watch Event', 'Generation + Predicate', (L.statusSub && L.predicate) ? '/status leaves metadata.generation constant -> Predicate ignores noise ✓' : 'No /status isolation or Predicate -> Update event re-enqueues same CR ✕'],
      ['3. CPU / QPS', 'Operator WorkQueue', (L.statusSub && L.predicate) ? '0 extra reconciles queued; cluster rests idle until true spec change ✓' : 'Infinite self-triggering reconcile loop burns 100% CPU & API quota!']
    ]
  },
  'kill-leader': {
    group: 'operator',
    title: 'Kill Active Operator Pod — HA Lease Election & Failover Test',
    layman: 'Like two captains sharing one baton (Lease lock): when Captain A drops out, Captain B waits briefly for the baton timer to expire cleanly before taking the helm—never two captains steering at once.',
    req: ['leaderHA'],
    okText: 'Active Op-0 Pod was OOMKilled; Standby Op-1 watched Lease expiry and took leadership safely via atomic Compare-And-Swap with zero split-brain conflicts.',
    failText: 'OPERATOR OUTAGE: Only 1 un-elected Operator Pod ran (SPOF) — cluster CR automation is dead until kubelet restarts & stabilizes the Pod!',
    kubectl: `kubectl -n operators get lease postgres-operator.lock -o yaml`,
    yamlFix: `LeaderElection: true,\nLeaderElectionID: "postgres-operator.lock",\nLeaseDuration: &leaseDur, // e.g. 15s\nLeaderElectionReleaseOnCancel: true`,
    steps: L => [
      ['1. Pod Failure', 'Operator Pod-0', 'Active leader encounters sudden OOMKill / node preemption crash.'],
      ['2. Lease Handoff', 'coordination.k8s.io Lease', L.leaderHA ? 'Standby Replica acquires Lease atomically after TTL (~14s) ✓' : 'Single replica SPOF — no standby exists to claim leadership ✕'],
      ['3. Control Plane', 'Managed DB Fleet', L.leaderHA ? 'Reconciliation resumes cleanly with single-writer guarantee ✓' : 'Failovers, backups & DR scaling halt during outage window!']
    ]
  },
  'burst-500': {
    group: 'operator',
    title: 'Burst 500 Custom Resources — Informer Cache & Backoff Absorption',
    layman: 'Like 500 orders hitting a kitchen at once: a local whiteboard (SharedInformer RAM cache) + smart order batching (deduped WorkQueue + backoff) keeps the head office (API server) calm.',
    req: ['splitCache', 'backoff'],
    okText: 'SharedInformer served all reads from RAM at 0 API QPS while WorkQueue key deduplication & exponential backoff absorbed the 500-CR wave smoothly.',
    failText: '429 API SERVER THROTTLED: Direct uncached API GETs and tight unthrottled retry loops flooded kube-apiserver with 429 Too Many Requests!',
    kubectl: `kubectl get --raw /metrics | grep -E 'workqueue_depth|rest_client_requests_total'`,
    yamlFix: `// Tune concurrent workers cleanly over cached Informer reads:\nctrl.NewControllerManagedBy(mgr).\n  WithOptions(controller.Options{MaxConcurrentReconciles: 8})`,
    steps: L => [
      ['1. Mass Create', '500 CRs Applied', 'Platform team applies 500 tenant CustomResources simultaneously via GitOps.'],
      ['2. Read/Queue Path', 'Informer + WorkQueue', (L.splitCache && L.backoff) ? 'Reads hit local Informer RAM (0 QPS); WorkQueue deduplicates duplicate keys ✓' : 'Uncached API reads + hot retry spin flood kube-apiserver APF limits ✕'],
      ['3. Convergence', 'kube-apiserver Health', (L.splitCache && L.backoff) ? 'All 500 stacks converge gracefully without hitting 429 rate limits ✓' : 'API Server returns 429 TooManyRequests; cluster latency degrades!']
    ]
  }
};

const LAB_MISSIONS = [
  {
    id: 'm-ha', title: 'Mission 1: Survive Control Plane Loss', cert: 'CKA',
    goal: 'Harden against a sudden control plane crash so etcd retains Raft majority quorum.',
    check: L => !!L.haEtcd, testChaos: 'kill-cp'
  },
  {
    id: 'm-cks', title: 'Mission 2: Zero-Trust CKS Lockdown', cert: 'CKS',
    goal: 'Block privileged root Pods, mutable :latest images, lateral :5432 scans & detect runtime syscalls.',
    check: L => !!L.psa && !!L.netpol && !!L.cel && !!L.falco, testChaos: 'root-pod'
  },
  {
    id: 'm-scale', title: 'Mission 3: Elastic Cloud Auto-Heal', cert: 'CNPE',
    goal: 'Survive a 10x traffic spike, worker loss, and unauthorized manual kubectl drift automatically.',
    check: L => !!L.karpenter && !!L.gitops && !!L.haEtcd, testChaos: 'traffic-spike'
  },
  {
    id: 'm-op-loop', title: 'Mission 4: Stop Operator Loops & 429s', cert: 'OPERATOR',
    goal: 'Eliminate infinite status reconcile storms and absorb 500-CR bursts without API throttling.',
    check: L => !!L.splitCache && !!L.predicate && !!L.statusSub && !!L.backoff, testChaos: 'status-storm'
  },
  {
    id: 'm-op-safe', title: 'Mission 5: Clean External Deprovision HA', cert: 'OPERATOR',
    goal: 'Guarantee invalid CR rejection, zero leaked AWS RDS databases, and Lease failover.',
    check: L => !!L.celWebhook && !!L.finalizers && !!L.ownerRefs && !!L.leaderHA, testChaos: 'delete-db'
  },
  {
    id: 'm-full', title: 'Mission 6: 100% Production Sovereign Stack', cert: 'CNPE',
    goal: 'Enable all 16 Cluster Security, Scaling, GitOps & Operator HA guardrails.',
    check: L => Object.keys(LAB_FEATURE_META).every(k => !!L[k]), testChaos: 'normal'
  }
];
