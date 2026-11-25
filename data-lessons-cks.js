/* =========================================================================
   CKS SPECIALIST CURRICULUM ADDITIONS (KODEKLOUD CKS SYLLABUS):
   1. CIS Benchmarks & kube-bench
   2. OS & Node Hardening (SSH, UFW, Ports, Kernel Modules, Docker Daemon)
   3. Securing Cloud Node Metadata (IMDS SSRF) & Ingress Security
   4. Kubernetes Auditing & Control Plane TLS Cipher Suites
   5. Deep Syscall Defense (Custom Seccomp, AppArmor, Tracee, Immutability)
   6. Sandboxed Runtimes (gVisor, Kata Containers & RuntimeClass)
   7. Supply Chain Security (SBOM, Trivy, KubeLinter, kubesec, ImagePolicyWebhook)
   ========================================================================= */

Object.assign(LESSONS, {
  'cks-cis-kubebench': {
    id: 'cks-cis-kubebench', moduleId: 'm6', certs: ['CKS', 'CKA'],
    title: 'CIS Benchmarks & kube-bench Hardening',
    subtitle: 'Automated cluster security auditing against CIS Kubernetes Benchmark using Aqua Security kube-bench and remediating FAIL checks.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Run kube-bench against master, etcd, and worker node targets',
      'Remediate kube-apiserver FAIL checks (--anonymous-auth, --profiling)',
      'Harden kubelet config & /etc/kubernetes PKI file permissions (600)'
    ],
    steps: [
      {
        short: 'Run kube-bench', cat: 'SECURITY',
        title: 'Auditing Control Plane, etcd & Worker Nodes With kube-bench',
        body: ['The <strong>CIS Kubernetes Benchmark</strong> lists 100+ security checks across Control Plane, etcd, Policies, and Worker Nodes. <strong>kube-bench</strong> inspects live static pod manifests, systemd flags, and PKI file permissions—reporting <code>[PASS]</code>, <code>[FAIL]</code>, and <code>[WARN]</code> with exact remediation commands!'],
        yamlTitle: 'CLI · Run kube-bench & Inspect Failures',
        yaml: `kube-bench run --targets master,etcd\nkube-bench run --targets node --check 4.2.1,4.2.2`,
        tip: 'CKS Exam Classic: When fixing `kube-apiserver` or `etcd` flags in `/etc/kubernetes/manifests/*.yaml`, verify the pod restarts cleanly via `crictl ps` before re-running `kube-bench`!',
        metrics: [['TOOL', 'kube-bench'], ['TARGETS', 'master/etcd/node'], ['FIX MODE', 'Manifest Flags'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'KUBE-BENCH AUDIT', rows: [['1.2.1 anonymous-auth', 'FAIL -> set false ✓'], ['1.2.20 profiling', 'FAIL -> set false ✓'], ['4.2.1 kubelet auth', 'PASS ✓']], banner: ['CIS BENCHMARK AUDIT REMEDIATED ✓', 'green'] },
        zones: [Z(75, 38, 675, 275, 'CIS BENCHMARK CLUSTER AUDIT', '#C93632')],
        nodes: [
          N('kb', 175, 175, 'shield', 'sky', 'kube-bench', 'CIS v1.9 scan', ['↻ scanning', 'warn'], 'Reads /etc/kubernetes/manifests and kubelet config.yaml.'),
          N('cp', 425, 110, 'hex', 'coral', 'API + etcd', '2 FAIL flags', ['fix flags', 'red'], 'Disable --profiling=false, --insecure-port, enable Node,RBAC.'),
          N('nd', 425, 245, 'cube', 'yellow', 'kubelet', 'protect-kernel', ['check 4.2', 'warn'], 'Set anonymous.enabled=false and authorization.mode=Webhook.'),
          N('ps', 665, 175, 'cube', 'mint', 'Hardened Node', 'CIS PASS ✓', ['✓ PASS', 'green'], 'All critical CIS checks passing.')
        ],
        edges: [E('kb', 'cp', 'err'), E('kb', 'nd', 'req'), E('cp', 'ps', 'ok'), E('nd', 'ps', 'ok')]
      },
      {
        short: 'Fix Flags & Perms', cat: 'SECURITY',
        title: 'Common CKS Remediations: Flags, File Perms & Ownership',
        body: ['CIS requires strict OS file ownership (<code>chown root:root</code>, <code>chmod 600</code>) on <code>/etc/kubernetes/pki/*.key</code>, <code>admin.conf</code>, and <code>/var/lib/etcd</code> (<code>chown etcd:etcd</code>, <code>chmod 700</code>). On kubelet, always disable anonymous auth and set <code>authorization.mode: Webhook</code>!'],
        yamlTitle: 'CLI · Typical CKS CIS Hardening Fixes',
        yaml: `chmod 600 /etc/kubernetes/pki/*.key /etc/kubernetes/admin.conf\n# In /etc/kubernetes/manifests/kube-apiserver.yaml:\n# --profiling=false  --enable-admission-plugins=NodeRestriction`,
        tip: 'Never edit `/var/lib/kubelet/config.yaml` without running `systemctl restart kubelet` afterward!',
        metrics: [['PKI KEYS', 'chmod 600 ✓', 'green'], ['ETCD DIR', 'chmod 700 etcd', 'green'], ['KUBELET AUTH', 'Webhook Only ✓', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'REMEDIATION CHECK', rows: [['*.key perms', '0600 root:root ✓'], ['kubelet anon', 'false (Webhook) ✓'], ['NodeRestriction', 'enabled ✓']], banner: ['ALL CIS CONTROLS HARDENED ✓', 'green'] },
        zones: [Z(105, 42, 610, 265, 'OS PERMISSIONS + CONTROL PLANE FLAGS', '#1E7E45')],
        nodes: [
          N('fl', 235, 175, 'cube', 'mint', 'Control Flags', '--profiling=false', ['✓ applied', 'green'], 'Eliminates debug endpoints and enables NodeRestriction.'),
          N('pm', 575, 175, 'shield', 'mint', 'File Permissions', '0600 root:root', ['✓ locked', 'green'], 'Protects private keys and kubeconfig files on disk.')
        ],
        edges: [E('fl', 'pm', 'ok')]
      }
    ]
  },

  'cks-os-hardening': {
    id: 'cks-os-hardening', moduleId: 'm6', certs: ['CKS'],
    title: 'OS Hardening: SSH, UFW, Ports, Modules & Docker',
    subtitle: 'Shrink host attack surface: disable obsolete services, close open ports, blacklist kernel modules, configure UFW, harden SSH & Docker daemon.',
    duration: '12 min', difficulty: 'Intermediate',
    checklist: [
      'Audit & close unnecessary open ports and obsolete packages',
      'Harden SSH daemon & restrict sudo privilege escalation',
      'Configure UFW host firewall & blacklist kernel modules',
      'Secure Docker daemon (disable :2375, use mTLS / containerd)'
    ],
    steps: [
      {
        short: 'Ports, Svc & Modules', cat: 'SECURITY',
        title: 'Attack Surface Reduction: Ports, Packages & Kernel Modules',
        body: ['Every listening port and installed package widens your blast radius. Use <code>ss -tulnp</code> to find rogue daemons, purge obsolete tools (<code>telnet</code>, <code>rpcbind</code>), and blacklist risky Linux kernel modules (<code>usb-storage</code>, <code>dccp</code>, <code>sctp</code>) in <code>/etc/modprobe.d/blacklist.conf</code>!'],
        yamlTitle: 'CLI · Audit Ports & Blacklist Kernel Modules',
        yaml: `ss -tulnp | grep LISTEN\nsystemctl disable --now apache2 && apt purge -y apache2\necho "blacklist sctp" | sudo tee /etc/modprobe.d/blacklist-sctp.conf`,
        tip: 'Check active kernel modules with `lsmod` and unload unwanted ones live with `sudo modprobe -r <module>`.',
        metrics: [['OPEN PORTS', 'ss -tulnp'], ['MODULES', 'modprobe.d'], ['PACKAGES', 'Minimal OS ✓', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'NODE SURFACE AUDIT', rows: [['ss -tulnp', 'closed :80 / :23'], ['modprobe.d', 'dccp / sctp blacklisted'], ['sudoers', 'NOPASSWD removed ✓']], banner: ['HOST ATTACK SURFACE MINIMIZED ✓', 'green'] },
        zones: [Z(75, 38, 675, 275, 'LINUX WORKER HOST HARDENING', '#C93632')],
        nodes: [
          N('pt', 180, 175, 'router', 'coral', 'Open Ports', 'ss -tulnp', ['closed ✓', 'green'], 'Only :10250 (kubelet) & :22 (SSH) allowed.'),
          N('md', 415, 175, 'shield', 'yellow', 'Kernel Modules', '/etc/modprobe.d', ['blacklisted', 'warn'], 'Prevents loading unapproved kernel drivers.'),
          N('pk', 645, 175, 'cube', 'mint', 'Minimal OS', 'no telnet/gcc', ['✓ slim', 'green'], 'Fewer binaries for post-exploitation living-off-the-land.')
        ],
        edges: [E('pt', 'md', 'ok'), E('md', 'pk', 'ok')]
      },
      {
        short: 'SSH, UFW & Docker', cat: 'SECURITY',
        title: 'SSH Hardening, UFW Firewall & Securing Docker Daemon',
        body: ['In <code>/etc/ssh/sshd_config</code>, set <code>PermitRootLogin no</code> and <code>PasswordAuthentication no</code> (keys only) then reload <code>sshd</code>. Lock down host ingress with <strong>UFW</strong> (<code>ufw default deny incoming</code>, allow only <code>6443</code>/<code>22</code>/<code>10250</code>).', 'For Docker hosts, NEVER expose unauthenticated TCP <code>:2375</code>—use rootless/Unix socket or <code>--tlsverify</code> on <code>:2376</code>!'],
        yamlTitle: 'CLI · UFW Firewall & SSH Hardening',
        yaml: `sudo ufw default deny incoming && sudo ufw allow 22/tcp && sudo ufw allow 6443/tcp\nsudo ufw enable\n# /etc/ssh/sshd_config: PermitRootLogin no | PasswordAuthentication no\n# /etc/docker/daemon.json: remove tcp://0.0.0.0:2375, enforce tlsverify`,
        tip: 'CKS Trap: Never enable `ufw` BEFORE adding `ufw allow 22/tcp` or you will lock yourself out of your SSH session!',
        metrics: [['SSH', 'Keys Only (No Root)', 'green'], ['UFW', 'Allow 22,6443,10250'], ['DOCKER :2375', 'Closed ✕', 'red'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'HOST PERIMETER', rows: [['sshd', 'PermitRootLogin no ✓'], ['ufw status', 'allow 6443, 10250, 22'], ['docker.sock', 'root:docker (no TCP) ✓']], banner: ['SSH, UFW & DAEMON SECURED ✓', 'green'] },
        zones: [Z(265, 38, 500, 275, 'HOST FIREWALL & DAEMON SECURITY', '#1E7E45')],
        nodes: [
          N('ext', 140, 175, 'users', 'coral', 'Scanner', 'probing :2375', ['✗ blocked', 'red'], 'External port scans blocked by UFW.'),
          N('ufw', 405, 175, 'shield', 'mint', 'UFW + sshd', 'key-only + rules', ['🔒 deny-in', 'green'], 'Drops all unlisted inbound host ports.'),
          N('doc', 665, 175, 'cube', 'sky', 'Container Daemon', 'TLS / Unix sock', ['✓ safe', 'green'], 'Docker socket protected against unauthenticated remote root.')
        ],
        edges: [E('ext', 'ufw', 'err', { stop: 0.78 }), E('ufw', 'doc', 'ok')]
      }
    ]
  },

  'cks-imds-metadata': {
    id: 'cks-imds-metadata', moduleId: 'm6', certs: ['CKS'],
    title: 'Securing Cloud Node Metadata (IMDS) & Ingress',
    subtitle: 'Preventing SSRF cloud IAM credential theft from 169.254.169.254 using Egress NetworkPolicies, plus Ingress rewrite-target hardening.',
    duration: '8 min', difficulty: 'Intermediate',
    checklist: [
      'Understand Cloud IMDS (169.254.169.254) SSRF risk from Pods',
      'Block 169.254.169.254/32 in Egress NetworkPolicy ipBlock',
      'Use IMDSv2 hop-limit=1 & Ingress TLS / rewrite-target safely'
    ],
    steps: [
      {
        short: 'Block IMDS SSRF', cat: 'SECURITY',
        title: 'Blocking Pod Access to Cloud Node Metadata (169.254.169.254)',
        body: ['On AWS/GCP/Azure, every VM reaches the Instance Metadata Service at <code>169.254.169.254</code>—which hands out the Node’s IAM role tokens! If a Pod has an SSRF bug, attackers curl <code>http://169.254.169.254/latest/meta-data/iam/</code> and steal cloud admin creds!', 'Block it cleanly using an Egress <strong>NetworkPolicy</strong> with <code>ipBlock: { cidr: 0.0.0.0/0, except: [169.254.169.254/32] }</code> (plus IMDSv2 hop limit = 1).'],
        yamlTitle: 'YAML · Block Cloud IMDS Egress via NetworkPolicy',
        yaml: `policyTypes: [Egress]\negress:\n- to:\n  - ipBlock:\n      cidr: 0.0.0.0/0\n      except:\n      - 169.254.169.254/32`,
        tip: 'Using `except: [169.254.169.254/32]` allows normal external API egress while specifically blackholing the cloud metadata endpoint!',
        metrics: [['IMDS IP', '169.254.169.254'], ['ATTACK VECTOR', 'Pod SSRF -> IAM', 'red'], ['DEFENSE', 'NetPol except + IMDSv2', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'IMDS PROTECTION', rows: [['Pod -> 169.254.169.254', 'DROP ✕ (NetPol except)'], ['Pod -> api.stripe.com', 'ALLOW ✓'], ['AWS IMDSv2', 'hop-limit: 1 ✓']], banner: ['CLOUD METADATA SSRF BLOCKED ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'METADATA FIREWALL (NETPOL + IMDSV2)', '#C93632')],
        nodes: [
          N('pod', 145, 175, 'pod', 'coral', 'SSRF App Pod', 'curls 169.254...', ['⚠ SSRF', 'red'], 'Compromised web app trying to dump Node IAM creds.'),
          N('np', 435, 175, 'shield', 'mint', 'Egress NetPol', 'except: .169.254/32', ['🔒 blocked', 'green'], 'Drops packets destined for link-local metadata IP.'),
          N('md', 670, 108, 'cyl', 'gray', 'Cloud IMDS', '169.254.169.254', ['✗ isolated', 'green'], 'Node IAM credentials stay completely unreachable.', true),
          N('ex', 670, 245, 'users', 'sky', 'Public APIs', '0.0.0.0/0 OK', null, 'Legitimate outbound internet calls still work.')
        ],
        edges: [E('pod', 'np', 'req'), E('np', 'md', 'err', { stop: 0.72 }), E('np', 'ex', 'ok')]
      }
    ]
  },

  'cks-auditing-ciphers': {
    id: 'cks-auditing-ciphers', moduleId: 'm6', certs: ['CKS'],
    title: 'Kubernetes Auditing & Control Plane TLS Ciphers',
    subtitle: 'Configure AuditPolicy stages (None/Metadata/Request/RequestResponse), log rotation flags, and restrict weak TLS cipher suites.',
    duration: '10 min', difficulty: 'Intermediate',
    checklist: [
      'Write AuditPolicy rules using None, Metadata, Request, RequestResponse',
      'Protect Secrets by logging only Metadata (never RequestResponse!)',
      'Mount audit policy & log volumes in kube-apiserver + harden TLS ciphers'
    ],
    steps: [
      {
        short: 'AuditPolicy', cat: 'SECURITY',
        title: 'Kubernetes Audit Policy: Log Who Changed What Without Leaking Secrets',
        body: ['Enable auditing on <code>kube-apiserver</code> via <code>--audit-policy-file</code> and <code>--audit-log-path</code>. Audit rules evaluate top-down (first match wins!) across 4 verbosity levels: <code>None</code> (skip), <code>Metadata</code> (user+verb+resource, safe for Secrets!), <code>Request</code> (includes body), and <code>RequestResponse</code>.'],
        yamlTitle: 'YAML · CKS AuditPolicy Best Practice',
        yaml: `apiVersion: audit.k8s.io/v1\nkind: Policy\nrules:\n- level: None\n  verbs: ["get", "list", "watch"]\n- level: Metadata\n  resources: [{ group: "", resources: ["secrets", "configmaps"] }]\n- level: RequestResponse\n  resources: [{ group: "", resources: ["pods"] }]`,
        tip: 'CKS Trap: NEVER log `secrets` at `Request` or `RequestResponse` level—or plaintext credentials will be dumped into `/var/log/kube-audit.log`! Also always mount the hostPath volume + volumeMount inside `kube-apiserver.yaml`!',
        metrics: [['LEVELS', 'None/Meta/Req/Resp'], ['SECRETS LEVEL', 'Metadata Only ✓', 'green'], ['LOG FLAGS', 'maxage=30, maxbackup=10'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'AUDIT LOG STREAM', rows: [['GET /secrets', 'level: Metadata (no body ✓)'], ['CREATE /pods', 'level: RequestResponse'], ['TLS Ciphers', 'TLS_AES_128_GCM_SHA256 ✓']], banner: ['TAMPER-SAFE AUDIT LOGS ACTIVE ✓', 'green'] },
        zones: [Z(265, 36, 500, 278, 'KUBE-APISERVER AUDIT & TLS CIPHER ENGINE', '#6E47B8')],
        nodes: [
          N('req', 140, 175, 'users', 'sky', 'API Calls', 'Secret & Pod ops', null, 'Every API request generates an audit event.'),
          N('aud', 415, 112, 'shield', 'lavender', 'AuditPolicy', 'first-match wins', ['✓ Metadata', 'green'], 'Strips Secret payloads while capturing Pod mutations.'),
          N('cip', 415, 245, 'shield', 'mint', 'TLS Ciphers', 'TLS 1.3 / AEAD', ['🔒 strong', 'green'], '--tls-cipher-suites drops weak CBC/RC4 ciphers.'),
          N('log', 665, 112, 'cyl', 'peach', 'audit.log', 'hostPath + rotate', null, 'Persisted to host disk & shipped to SIEM.')
        ],
        edges: [E('req', 'aud', 'req'), E('req', 'cip', 'ok'), E('aud', 'log', 'watch')]
      }
    ]
  },

  'cks-seccomp-apparmor-tracee': {
    id: 'cks-seccomp-apparmor-tracee', moduleId: 'm6', certs: ['CKS'],
    title: 'Syscall Defense: Seccomp, AppArmor, Tracee & Immutability',
    subtitle: 'Custom Seccomp JSON profiles, AppArmor profiles, AquaSec Tracee eBPF syscall inspection, and runtime container immutability.',
    duration: '12 min', difficulty: 'Intermediate',
    checklist: [
      'Bind custom Seccomp JSON profiles from /var/lib/kubelet/seccomp',
      'Load & enforce AppArmor profiles on Nodes and Pods',
      'Inspect container syscalls via Tracee & enforce immutable rootfs'
    ],
    steps: [
      {
        short: 'Custom Seccomp', cat: 'SECURITY',
        title: 'Custom Localhost Seccomp Profiles & Tracee Syscall Inspection',
        body: ['Every container process issues Linux syscalls (<code>read</code>, <code>socket</code>, <code>mkdir</code>). Use <strong>AquaSec Tracee</strong> (eBPF) to observe exact syscalls, then lock Pods down with a custom <strong>Seccomp</strong> JSON profile stored under <code>/var/lib/kubelet/seccomp/</code> via <code>seccompProfile: { type: Localhost, localhostProfile: profiles/audit.json }</code>!'],
        yamlTitle: 'YAML · Localhost Seccomp + Immutable Container',
        yaml: `securityContext:\n  seccompProfile:\n    type: Localhost\n    localhostProfile: profiles/fine-grained.json\n  readOnlyRootFilesystem: true\n  allowPrivilegeEscalation: false`,
        tip: 'CKS Tip: `localhostProfile` path is ALWAYS relative to `/var/lib/kubelet/seccomp/` on the Worker Node—never include the `/var/lib/kubelet/seccomp/` prefix in your Pod YAML!',
        metrics: [['SECCOMP DIR', '/var/lib/kubelet/seccomp'], ['PATH IN YAML', 'Relative Path ✓', 'green'], ['TRACEE', 'eBPF Syscall Spy'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'SYSCALL HARDENING', rows: [['Tracee eBPF', 'logged 42 syscalls'], ['Seccomp JSON', 'SCMP_ACT_ERRNO on mkdir'], ['RootFS', 'readOnly: true (immutable) ✓']], banner: ['CUSTOM SYSCALL ALLOWLIST ENFORCED ✓', 'green'] },
        zones: [Z(75, 38, 680, 275, 'SYSCALL & IMMUTABILITY DEFENSE', '#6E47B8')],
        nodes: [
          N('tr', 175, 175, 'cube', 'sky', 'Aqua Tracee', 'eBPF spy', ['42 syscalls', 'purple'], 'Profiles exact syscalls used by your app.'),
          N('sc', 420, 110, 'shield', 'lavender', 'Seccomp Localhost', 'profiles/app.json', ['🔒 enforced', 'green'], 'Blocks unapproved syscalls at kernel boundary.'),
          N('aa', 420, 245, 'shield', 'mint', 'AppArmor', 'deny /etc/shadow', ['✓ enforced', 'green'], 'Restricts file paths, network & capabilities via aa-status.'),
          N('im', 665, 175, 'pod', 'mint', 'Immutable Pod', 'RO RootFS', ['✓ immutable', 'green'], 'Prevents dropping malware binaries at runtime.')
        ],
        edges: [E('tr', 'sc', 'watch'), E('tr', 'aa', 'watch'), E('sc', 'im', 'ok'), E('aa', 'im', 'ok')]
      },
      {
        short: 'AppArmor & Immutability', cat: 'SECURITY',
        title: 'Enforcing AppArmor Profiles & Runtime Immutability',
        body: ['Load custom <strong>AppArmor</strong> profiles on every Worker Node with <code>apparmor_parser -q /etc/apparmor.d/k8s-deny-write</code> and verify with <code>aa-status</code>. Attach to Pods using <code>securityContext.appArmorProfile: { type: Localhost, localhostProfile: k8s-deny-write }</code> (GA in 1.30; or legacy annotation on <1.30).', 'Combine with <code>readOnlyRootFilesystem: true</code> so attackers cannot modify files or install tools at runtime!'],
        yamlTitle: 'CLI & YAML · Load & Apply AppArmor Profile',
        yaml: `sudo apparmor_parser -q /etc/apparmor.d/k8s-deny-write && sudo aa-status\n# Pod securityContext (K8s 1.30+):\nsecurityContext:\n  appArmorProfile: { type: Localhost, localhostProfile: k8s-deny-write }`,
        tip: 'Remember: AppArmor profiles must be loaded on EVERY worker node where the Pod might schedule (usually automated via DaemonSet or node boot script).',
        metrics: [['TOOL', 'apparmor_parser'], ['CHECK CMD', 'aa-status ✓', 'green'], ['IMMUTABLE', 'readOnlyRootFS'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'APPARMOR + IMMUTABLE', rows: [['aa-status', 'k8s-deny-write (enforce)'], ['write /tmp/evil', 'Permission denied ✕'], ['container', '100% immutable runtime ✓']], banner: ['APPARMOR ENFORCING IMMUTABILITY ✓', 'green'] },
        zones: [Z(285, 38, 480, 275, 'KERNEL APPARMOR MAC ENFORCEMENT', '#1E7E45')],
        nodes: [
          N('pod', 145, 175, 'pod', 'coral', 'App Process', 'write /bin/x', ['✗ denied', 'red'], 'Attempts unauthorized filesystem write.'),
          N('aa', 435, 175, 'shield', 'mint', 'AppArmor LSM', 'k8s-deny-write', ['✓ enforce', 'green'], 'Mandatory Access Control denies write inside Linux kernel.'),
          N('fs', 665, 175, 'cyl', 'lavender', 'Host / RootFS', 'untouched ✓', null, 'Filesystem stays completely immutable.')
        ],
        edges: [E('pod', 'aa', 'err', { stop: 0.85 }), E('aa', 'fs', 'ok')]
      }
    ]
  },

  'cks-runtimes-gvisor-kata': {
    id: 'cks-runtimes-gvisor-kata', moduleId: 'm6', certs: ['CKS', 'CNPE'],
    title: 'Sandboxed Runtimes: gVisor, Kata & RuntimeClass',
    subtitle: 'Isolating untrusted workloads beyond shared Linux kernels using gVisor user-space kernel (runsc), Kata microVMs, and Kubernetes RuntimeClass.',
    duration: '9 min', difficulty: 'Intermediate',
    checklist: [
      'Compare standard runc vs gVisor (runsc) vs Kata Containers',
      'Create a Kubernetes RuntimeClass targeting containerd handlers',
      'Assign untrusted multi-tenant Pods via runtimeClassName'
    ],
    steps: [
      {
        short: 'gVisor vs Kata', cat: 'SECURITY',
        title: 'Strong Kernel Isolation: runc vs gVisor (runsc) vs Kata MicroVMs',
        body: ['Standard <code>runc</code> containers share the host Linux kernel directly—a kernel 0-day breaks all Pods on the node! <strong>gVisor (<code>runsc</code>)</strong> intercepts syscalls in a memory-safe Go user-space kernel. <strong>Kata Containers</strong> wraps each Pod inside a lightweight hardware-virtualized KVM microVM with its own dedicated guest kernel!'],
        yamlTitle: 'YAML · RuntimeClass + Sandboxed Pod',
        yaml: `apiVersion: node.k8s.io/v1\nkind: RuntimeClass\nmetadata: { name: gvisor }\nhandler: runsc\n---\nspec:\n  runtimeClassName: gvisor`,
        tip: 'CKS Tip: Creating a `RuntimeClass` (`handler: runsc` or `kata`) does nothing until you reference `spec.runtimeClassName` inside the Pod spec!',
        metrics: [['RUNC', 'Shared Host Kernel'], ['GVISOR', 'User-Space Kernel ✓', 'green'], ['KATA', 'Dedicated MicroVM', 'purple'], ['EXAM TRACK', 'CKS · CNPE', 'red']],
        trace: { title: 'RUNTIMECLASS ISOLATION', rows: [['Pod A (runc)', 'shared host kernel'], ['Pod B (gvisor)', 'runsc Go sentry ✓'], ['Pod C (kata)', 'KVM guest kernel ✓']], banner: ['UNTRUSTED WORKLOADS SANDBOXED ✓', 'green'] },
        zones: [Z(65, 38, 690, 275, 'KUBERNETES RUNTIMECLASS SANDBOXES', '#6E47B8')],
        nodes: [
          N('rc', 165, 175, 'cube', 'sky', 'kubelet CRI', 'runtimeClassName', null, 'Routes Pod creation to matching containerd handler.'),
          N('gv', 425, 108, 'shield', 'mint', 'gVisor (runsc)', 'user-space kernel', ['✓ Go sentry', 'green'], 'Intercepts syscalls before touching host kernel.'),
          N('kt', 425, 245, 'shield', 'lavender', 'Kata MicroVM', 'KVM guest kernel', ['✓ VM boundary', 'purple'], 'Hardware virtualization boundary per Pod.'),
          N('hk', 670, 175, 'cyl', 'peach', 'Host Kernel', 'shielded ✓', ['🔒 safe', 'green'], 'Protected against container kernel exploits.')
        ],
        edges: [E('rc', 'gv', 'ok'), E('rc', 'kt', 'watch'), E('gv', 'hk', 'ok'), E('kt', 'hk', 'ok')]
      }
    ]
  },

  'cks-supply-chain': {
    id: 'cks-supply-chain', moduleId: 'm6', certs: ['CKS', 'CNPE'],
    title: 'Supply Chain: SBOM, Trivy, KubeLinter & ImagePolicy',
    subtitle: 'Distroless multi-stage images, SPDX/CycloneDX SBOMs, Trivy CVE scans, static YAML analysis (KubeLinter/kubesec), and ImagePolicyWebhook.',
    duration: '12 min', difficulty: 'Intermediate',
    checklist: [
      'Shrink image footprint with multi-stage & distroless builds',
      'Generate SBOMs (SPDX/CycloneDX) & scan CVEs with Trivy',
      'Catch bad manifests early with KubeLinter & kubesec',
      'Enforce approved registries at admission via ImagePolicyWebhook'
    ],
    steps: [
      {
        short: 'SBOM & Trivy', cat: 'SECURITY',
        title: 'Minimal Base Images, SBOMs (SPDX/CycloneDX) & Trivy CVE Scans',
        body: ['Every extra OS tool (<code>curl</code>, <code>bash</code>, <code>apt</code>) in a container helps attackers. Build with <strong>multi-stage Dockerfiles</strong> onto <code>distroless</code> or <code>scratch</code>, generate an <strong>SBOM</strong> (Software Bill of Materials in <strong>SPDX</strong> or <strong>CycloneDX</strong> JSON via <code>syft</code> / <code>trivy</code>), and gate CI on <code>CRITICAL/HIGH</code> CVEs!'],
        yamlTitle: 'CLI · Generate SBOM & Scan Vulnerabilities',
        yaml: `trivy image --severity CRITICAL,HIGH --exit-code 1 ghcr.io/org/api:v2.4\ntrivy image --format cyclonedx --output sbom.json ghcr.io/org/api:v2.4`,
        tip: 'CKS Tip: Use `trivy image --ignore-unfixed` when triaging noisy unpatchable OS advisories, and pin images by immutable `@sha256:...` digest!',
        metrics: [['BASE IMAGE', 'Distroless / Scratch', 'green'], ['SBOM FORMAT', 'SPDX / CycloneDX'], ['SCANNER', 'Trivy / Grype'], ['EXAM TRACK', 'CKS · CNPE', 'red']],
        trace: { title: 'SUPPLY CHAIN GATE', rows: [['multi-stage', '18 MB distroless ✓'], ['SBOM', 'CycloneDX JSON signed'], ['Trivy CVE', '0 CRITICAL -> push ✓']], banner: ['MINIMAL SIGNED IMAGE + SBOM ✓', 'green'] },
        zones: [Z(70, 38, 690, 275, 'CI SUPPLY CHAIN VERIFICATION', '#1E7E45')],
        nodes: [
          N('df', 165, 175, 'cube', 'sky', 'Multi-Stage', 'distroless 18MB', ['no shell', 'green'], 'Compiles binary then copies to empty distroless base.'),
          N('sb', 415, 110, 'cube', 'lavender', 'SBOM + Cosign', 'CycloneDX + sig', null, 'Tracks every library & cryptographically signs digest.'),
          N('tr', 415, 245, 'shield', 'mint', 'Trivy Scan', '0 CRITICAL CVEs', ['✓ PASS', 'green'], 'Blocks vulnerable base packages before registry push.'),
          N('rg', 665, 175, 'cyl', 'mint', 'Private Registry', '@sha256:9f2a', ['✓ trusted', 'green'], 'Only verified immutable digests reach cluster.')
        ],
        edges: [E('df', 'sb', 'req'), E('df', 'tr', 'ok'), E('sb', 'rg', 'watch'), E('tr', 'rg', 'ok')]
      },
      {
        short: 'Lint & Webhook', cat: 'SECURITY',
        title: 'KubeLinter / kubesec Static Analysis & ImagePolicyWebhook',
        body: ['Run <strong>KubeLinter</strong> and <strong>kubesec</strong> in CI/PRs to score Pod YAMLs before deploy (catching missing <code>runAsNonRoot</code>, <code>readOnlyRootFilesystem</code>, or resource limits).', 'At cluster admission, enable <strong>ImagePolicyWebhook</strong> in <code>kube-apiserver</code> to block unapproved public registries (<code>docker.io/random</code>) and enforce corporate registry allowlists!'],
        yamlTitle: 'CLI · Static Manifest Scan & ImagePolicyWebhook',
        yaml: `kube-linter lint deploy.yaml\nkubesec scan pod.yaml\n# kube-apiserver.yaml:\n# --enable-admission-plugins=...,ImagePolicyWebhook\n# --admission-control-config-file=/etc/kubernetes/admission/admission.yaml`,
        tip: 'CKS Exam Classic: In `AdmissionConfiguration` for `ImagePolicyWebhook`, set `defaultAllow: false` so images are REJECTED if the external scanner webhook is unreachable!',
        metrics: [['STATIC LINT', 'KubeLinter / kubesec'], ['ADMISSION', 'ImagePolicyWebhook', 'red'], ['DEFAULT ALLOW', 'false (Fail-Closed)', 'green'], ['EXAM TRACK', 'CKS', 'red']],
        trace: { title: 'REGISTRY ALLOWLIST', rows: [['kubesec score', '+7 pts (hardened) ✓'], ['docker.io/evil', '403 DENIED (defaultAllow:false)'], ['corp.reg/app@sha', 'ADMITTED ✓']], banner: ['UNAPPROVED REGISTRIES BLOCKED ✓', 'green'] },
        zones: [Z(265, 38, 495, 275, 'ADMISSION: IMAGEPOLICYWEBHOOK', '#C93632')],
        nodes: [
          N('bd', 140, 108, 'pod', 'coral', 'docker.io/foo', 'untrusted', ['✗ 403', 'red'], 'Rejected because registry is not on corporate allowlist.'),
          N('gd', 140, 245, 'pod', 'mint', 'corp.reg/api', 'kubesec +7 ✓', ['✓ allowed', 'green'], 'Passed KubeLinter, kubesec, and signed digest check.'),
          N('iw', 435, 175, 'shield', 'lavender', 'ImagePolicyHook', 'defaultAllow: false', ['🔒 strict', 'green'], 'Calls external ImageReview backend over mTLS.'),
          N('et', 665, 175, 'cyl', 'mint', 'etcd', 'trusted only', null, 'Only verified corporate images enter cluster.')
        ],
        edges: [E('bd', 'iw', 'err', { stop: 0.78 }), E('gd', 'iw', 'ok'), E('iw', 'et', 'ok')]
      }
    ]
  }
});
