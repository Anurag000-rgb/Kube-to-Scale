/* =========================================================================
   KUBE TO SCALE — 2.5D ISOMETRIC RENDERER, PACKET ENGINE & PRO FEATURES
   ========================================================================= */

const CAT_COLORS = {
  ARCHITECTURE: '#D5E8FA', WORKLOAD: '#D9F2C9', STORAGE: '#E5DCFB',
  NETWORKING: '#FCE1C2', SECURITY: '#FAD6D4', EXTENSIBILITY: '#E5DCFB',
  'SYSTEM DESIGN': '#FEF0BF', PLATFORM: '#CCF0EA',
  CONCEPT: '#D5E8FA', 'GO CODE': '#FEF0BF', KUBEBUILDER: '#D9F2C9',
  PATTERN: '#E5DCFB', OLM: '#D5E8FA', OPS: '#FAD6D4'
};

const NODE_PALETTE = {
  sky:      { top: '#DCEEFD', left: '#BDDDF9', right: '#9CC8F2' },
  mint:     { top: '#E1F5D6', left: '#C4EBB0', right: '#A3DC87' },
  lavender: { top: '#ECE4FD', left: '#D4C3FA', right: '#BCA4F4' },
  peach:    { top: '#FDE9D1', left: '#F9CFA0', right: '#F2B572' },
  coral:    { top: '#FCE0DE', left: '#F7BCB8', right: '#EE9892' },
  yellow:   { top: '#FFF5CC', left: '#FCE695', right: '#F4D468' },
  teal:     { top: '#D7F4EE', left: '#B2E6DC', right: '#8BD5C8' },
  gray:     { top: '#E8E5DF', left: '#D4D0C8', right: '#BCB7AD' }
};

const EDGE_STYLE = {
  req:   { color: '#E07B24', marker: 'orange', speed: 0.44, count: 2 },
  act:   { color: '#E07B24', marker: 'orange', speed: 0.45, count: 2 },
  ok:    { color: '#1E824C', marker: 'green',  speed: 0.46, count: 2 },
  watch: { color: '#7B52AB', marker: 'purple', speed: 0.40, count: 2 },
  err:   { color: '#D13B3B', marker: 'red',    speed: 0.48, count: 2, dashed: true }
};

const state = {
  activeTab: 'learn',
  globalCert: 'ALL',
  currentLessonId: 'cp-request-flow',
  currentStepIndex: 0,
  isPaused: false,
  autoPlay: false,
  autoPlayTimer: null,
  speedMult: 1,
  zoomPan: false,
  pinnedNodeId: null,
  expandedModules: { m1: false, m2: false, m3: false, m4: false, m5: false, m6: false, m7: false, m8: false, m9: false, m10: false, m11: false, m12: false, m13: false, m14: false },
  visitedSteps: { 'cp-request-flow': new Set([0]) },
  practiceFilter: 'ALL',
  practiceIndex: 0,
  practiceAnswers: {},
  practiceMode: 'drills',
  scenarioCat: 'ALL',
  scenarioSearch: '',
  openScenarios: new Set(['sc-ha']),
  reviewedScenarios: new Set(),
  openRefPanels: { topicRefs: false, topicVideos: false, stepRefs: false, stepVideos: false },
  sheetFilter: 'ALL',
  resourceMode: 'channels',
  resourceCert: 'ALL',
  resourceSearch: '',
  lab: {
    haEtcd: true, psa: false, netpol: false, cel: false,
    rbac: true, karpenter: false, gitops: false, falco: false
  },
  labGroup: 'ALL',
  labLoad: 1,
  labPeekKey: null,
  labInspectorTab: 'flow',
  labMissionId: null,
  labPinnedNodeId: null,
  labChaos: 'normal',
  labLogs: [],
  searchMatches: [],
  searchSelected: 0,
  animFrameId: null,
  lastTs: 0,
  packetsBySvg: { learnSvg: [], labSvg: [] }
};

/* =========================================================================
   LOCALSTORAGE PERSISTENCE
   ========================================================================= */
function saveState() {
  try {
    const serializedVisited = {};
    Object.entries(state.visitedSteps).forEach(([k, set]) => {
      serializedVisited[k] = [...set];
    });
    localStorage.setItem('kts_adv_state_v1', JSON.stringify({
      visitedSteps: serializedVisited,
      practiceAnswers: state.practiceAnswers,
      reviewedScenarios: [...state.reviewedScenarios],
      lab: state.lab
    }));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem('kts_adv_state_v1') || 'null');
    if (!raw) return;
    if (raw.visitedSteps) {
      Object.entries(raw.visitedSteps).forEach(([k, arr]) => {
        state.visitedSteps[k] = new Set(arr);
      });
    }
    if (raw.practiceAnswers) state.practiceAnswers = raw.practiceAnswers;
    if (raw.reviewedScenarios) state.reviewedScenarios = new Set(raw.reviewedScenarios);
    if (raw.lab) state.lab = { ...state.lab, ...raw.lab };
  } catch (_) {}
}

/* =========================================================================
   2.5D ISOMETRIC SVG RENDERER & LIVE PACKET ENGINE
   ========================================================================= */
const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}, parent = null) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

function ensureSvgDefs(svg) {
  const defs = svgEl('defs', {}, svg);
  const markers = [
    ['orange', '#E07B24'], ['green', '#1E824C'],
    ['purple', '#7B52AB'], ['red', '#D13B3B'], ['ink', '#222222']
  ];
  markers.forEach(([name, color]) => {
    const m = svgEl('marker', {
      id: `${svg.id}-arr-${name}`, viewBox: '0 0 10 10',
      refX: '8', refY: '5', markerWidth: '5.5', markerHeight: '5.5', orient: 'auto-start-reverse'
    }, defs);
    svgEl('path', { d: 'M 0 1.5 L 8.5 5 L 0 8.5 z', fill: color }, m);
  });
  const filt = svgEl('filter', { id: `${svg.id}-sh`, x: '-20%', y: '-20%', width: '145%', height: '155%' }, defs);
  svgEl('feDropShadow', { dx: '0', dy: '4', stdDeviation: '2.4', 'flood-color': '#222222', 'flood-opacity': '0.13' }, filt);
}

function drawIsoGlyph(g, n) {
  const pal = NODE_PALETTE[n.col] || NODE_PALETTE.sky;
  const { x, y, shape, offline } = n;
  const stroke = '#222222';
  const sw = '1.55';
  const shUrl = `url(#${g.ownerSVGElement.id}-sh)`;

  if (shape === 'cyl') {
    const rx = 38, ry = 13, h = 42, cy = y - 14;
    svgEl('path', {
      d: `M ${x - rx} ${cy} L ${x - rx} ${cy + h} A ${rx} ${ry} 0 0 0 ${x + rx} ${cy + h} L ${x + rx} ${cy} Z`,
      fill: pal.left, stroke, 'stroke-width': sw, filter: shUrl
    }, g);
    svgEl('ellipse', { cx: x, cy, rx, ry, fill: pal.top, stroke, 'stroke-width': sw }, g);
    svgEl('ellipse', { cx: x, cy: cy + 14, rx: rx - 1, ry: ry * 0.72, fill: 'none', stroke, 'stroke-width': '0.9', 'stroke-opacity': '0.28' }, g);
  } else if (shape === 'hex') {
    const pts = (dx, dy) => [
      [x + dx, y - 34 + dy], [x + 42 + dx, y - 17 + dy], [x + 42 + dx, y + 17 + dy],
      [x + dx, y + 34 + dy], [x - 42 + dx, y + 17 + dy], [x - 42 + dx, y - 17 + dy]
    ].map(p => p.join(',')).join(' ');
    svgEl('polygon', { points: pts(0, 8), fill: pal.right, stroke, 'stroke-width': sw }, g);
    svgEl('polygon', { points: pts(0, 0), fill: pal.top, stroke, 'stroke-width': sw, filter: shUrl }, g);
    svgEl('circle', { cx: x, cy: y - 9, r: 6.5, fill: '#FBF9F5', stroke, 'stroke-width': '1.4' }, g);
  } else if (shape === 'shield') {
    const pathD = (dy) => `M ${x} ${y - 34 + dy} L ${x + 38} ${y - 22 + dy} L ${x + 34} ${y + 12 + dy} Q ${x} ${y + 36 + dy} ${x} ${y + 36 + dy} Q ${x} ${y + 36 + dy} ${x - 34} ${y + 12 + dy} L ${x - 38} ${y - 22 + dy} Z`;
    svgEl('path', { d: pathD(7), fill: pal.right, stroke, 'stroke-width': sw }, g);
    svgEl('path', { d: pathD(0), fill: pal.top, stroke, 'stroke-width': sw, filter: shUrl }, g);
    svgEl('path', { d: `M ${x - 7} ${y - 9} L ${x - 2} ${y - 4} L ${x + 8} ${y - 15}`, fill: 'none', stroke, 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  } else if (shape === 'router') {
    const w = 88, h = 58, d = 9;
    svgEl('rect', { x: x - w / 2, y: y - h / 2 + d, width: w, height: h, rx: 13, fill: pal.right, stroke, 'stroke-width': sw }, g);
    svgEl('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 13, fill: pal.top, stroke, 'stroke-width': sw, filter: shUrl }, g);
    svgEl('path', { d: `M ${x - 12} ${y - 10} L ${x + 12} ${y - 10} M ${x + 6} ${y - 15} L ${x + 12} ${y - 10} L ${x + 6} ${y - 5} M ${x + 12} ${y - 1} L ${x - 12} ${y - 1} M ${x - 6} ${y - 6} L ${x - 12} ${y - 1} L ${x - 6} ${y + 4}`, fill: 'none', stroke, 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  } else if (shape === 'cluster') {
    [[-26, -7], [0, 5], [26, -7]].forEach(([ox, oy]) => {
      const px = x + ox - 20, py = y + oy - 22;
      svgEl('rect', { x: px, y: py + 6, width: 40, height: 34, rx: 8, fill: pal.right, stroke, 'stroke-width': '1.4' }, g);
      svgEl('rect', { x: px, y: py, width: 40, height: 34, rx: 8, fill: pal.top, stroke, 'stroke-width': '1.4', filter: shUrl }, g);
      svgEl('circle', { cx: px + 20, cy: py + 17, r: 4, fill: '#FBF9F5', stroke, 'stroke-width': '1.3' }, g);
    });
  } else if (shape === 'stack') {
    [10, 5, 0].forEach((dy, i) => {
      const w = 86, h = 46;
      svgEl('rect', {
        x: x - w / 2, y: y - h / 2 - 4 + dy, width: w, height: h, rx: 10,
        fill: i === 2 ? pal.top : (i === 1 ? pal.left : pal.right),
        stroke, 'stroke-width': sw, filter: i === 2 ? shUrl : ''
      }, g);
    });
    svgEl('line', { x1: x - 22, y1: y - 13, x2: x + 22, y2: y - 13, stroke, 'stroke-width': '1.4', 'stroke-linecap': 'round' }, g);
    svgEl('line', { x1: x - 22, y1: y - 6, x2: x + 12, y2: y - 6, stroke, 'stroke-width': '1.4', 'stroke-linecap': 'round' }, g);
  } else if (shape === 'cloud') {
    const cloudD = (dy) => `M ${x - 28} ${y + 16 + dy} H ${x + 28} A 16 15 0 0 0 ${x + 30} ${y - 12 + dy} A 22 20 0 0 0 ${x - 10} ${y - 22 + dy} A 18 16 0 0 0 ${x - 30} ${y - 8 + dy} A 14 12 0 0 0 ${x - 28} ${y + 16 + dy} Z`;
    svgEl('path', { d: cloudD(7), fill: pal.right, stroke, 'stroke-width': sw }, g);
    svgEl('path', { d: cloudD(0), fill: pal.top, stroke, 'stroke-width': sw, filter: shUrl }, g);
  } else if (shape === 'users') {
    svgEl('rect', { x: x - 42, y: y - 12, width: 84, height: 38, rx: 11, fill: pal.right, stroke, 'stroke-width': sw }, g);
    svgEl('rect', { x: x - 42, y: y - 19, width: 84, height: 38, rx: 11, fill: '#FBF9F5', stroke, 'stroke-width': sw, filter: shUrl }, g);
    const uCols = ['#FCE1C2', '#D5E8FA', '#E5DCFB', '#D9F2C9'];
    [-22, -7, 8, 23].forEach((ox, idx) => {
      const fy = y - 5 + (idx % 2 === 0 ? -2 : 2);
      svgEl('rect', { x: x + ox - 4.5, y: fy, width: 9, height: 11, rx: 3.5, fill: uCols[idx], stroke, 'stroke-width': '1.3' }, g);
      svgEl('circle', { cx: x + ox, cy: fy - 5, r: 3.8, fill: uCols[idx], stroke, 'stroke-width': '1.3' }, g);
    });
  } else {
    const w = Math.max(90, n.label.length * 6.8 + 16), h = 60, d = 9;
    svgEl('rect', { x: x - w / 2, y: y - h / 2 + d, width: w, height: h, rx: 12, fill: pal.right, stroke, 'stroke-width': sw }, g);
    svgEl('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 12, fill: pal.top, stroke, 'stroke-width': sw, filter: shUrl }, g);
    if (shape === 'pod') {
      svgEl('rect', { x: x - 14, y: y - 19, width: 12, height: 12, rx: 3, fill: '#FBF9F5', stroke, 'stroke-width': '1.3' }, g);
      svgEl('rect', { x: x + 2, y: y - 19, width: 12, height: 12, rx: 3, fill: '#FBF9F5', stroke, 'stroke-width': '1.3' }, g);
    } else {
      svgEl('rect', { x: x - 11, y: y - 18, width: 22, height: 6, rx: 2, fill: '#FBF9F5', stroke, 'stroke-width': '1.25' }, g);
      svgEl('rect', { x: x - 11, y: y - 9, width: 22, height: 6, rx: 2, fill: '#FBF9F5', stroke, 'stroke-width': '1.25' }, g);
    }
  }

  if (offline) {
    svgEl('path', {
      d: `M ${x - 11} ${y - 20} L ${x + 11} ${y + 2} M ${x + 11} ${y - 20} L ${x - 11} ${y + 2}`,
      stroke: '#C93632', 'stroke-width': '3.4', 'stroke-linecap': 'round'
    }, g);
  }

  const lblY = (shape === 'cyl' || shape === 'cloud') ? y + 50 : ((shape === 'cluster' || shape === 'users') ? y + 40 : y + 18);
  const lbl = svgEl('text', {
    x, y: lblY, 'text-anchor': 'middle',
    'font-family': 'Inter, sans-serif', 'font-size': '11.4', 'font-weight': '800', fill: '#222222'
  }, g);
  lbl.textContent = n.label;

  if (n.sub) {
    const subY = (shape === 'cyl' || shape === 'cloud') ? y + 67 : ((shape === 'cluster' || shape === 'users') ? y + 57 : y + 49);
    const pw = Math.max(66, n.sub.length * 6.2 + 14);
    svgEl('rect', {
      x: x - pw / 2, y: subY - 9, width: pw, height: 17.5, rx: 8.75,
      fill: '#FBF9F5', stroke: '#222222', 'stroke-width': '1.15'
    }, g);
    const st = svgEl('text', {
      x, y: subY + 3.2, 'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace', 'font-size': '9.2', 'font-weight': '600', fill: '#4A4741'
    }, g);
    st.textContent = n.sub;
  }
}

function drawFloatingBadge(parent, n) {
  if (!n.badge) return;
  const [text, tone] = n.badge;
  const colors = {
    green:  { bg: '#D9F2C9', fg: '#164C25' },
    red:    { bg: '#FAD6D4', fg: '#7C1B18' },
    warn:   { bg: '#FEF0BF', fg: '#6E4106' },
    purple: { bg: '#E5DCFB', fg: '#41237A' }
  }[tone] || { bg: '#D9F2C9', fg: '#222222' };
  const by = n.y - 44;
  const bw = Math.max(62, text.length * 6.5 + 15);
  const bgG = svgEl('g', { class: 'badge-float' }, parent);
  svgEl('rect', {
    x: n.x - bw / 2, y: by - 10, width: bw, height: 20, rx: 10,
    fill: colors.bg, stroke: '#222222', 'stroke-width': '1.25'
  }, bgG);
  const bt = svgEl('text', {
    x: n.x, y: by + 3.3, 'text-anchor': 'middle',
    'font-family': 'JetBrains Mono, monospace', 'font-size': '9.6', 'font-weight': '700', fill: colors.fg
  }, bgG);
  bt.textContent = text;
}

function computeEdgePath(a, b, off = 0, stop = 1) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const padStart = 48, padEnd = 48;
  const sx = a.x + ux * padStart - uy * off;
  const sy = a.y + uy * padStart + ux * off;
  const fullEx = b.x - ux * padEnd - uy * off;
  const fullEy = b.y - uy * padEnd + ux * off;
  const ex = sx + (fullEx - sx) * stop;
  const ey = sy + (fullEy - sy) * stop;
  const mx = (sx + ex) / 2 - uy * (off * 0.7);
  const my = (sy + ey) / 2 + ux * (off * 0.7);
  return { d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, ex, ey };
}

function renderIsoScene(svgId, scene, enableTooltip = true) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = '';
  ensureSvgDefs(svg);

  const gZones = svgEl('g', {}, svg);
  const gEdges = svgEl('g', {}, svg);
  const gNodes = svgEl('g', {}, svg);
  const gPackets = svgEl('g', {}, svg);
  const gBadges = svgEl('g', {}, svg);

  // Zones
  (scene.zones || []).forEach(z => {
    svgEl('rect', {
      x: z.x, y: z.y, width: z.w, height: z.h, rx: 14,
      fill: '#FBF9F5', 'fill-opacity': '0.52',
      stroke: z.color || '#6E685E', 'stroke-width': '1.4', 'stroke-dasharray': '5 4'
    }, gZones);
    const zt = svgEl('text', {
      x: z.x + 12, y: z.y + 17,
      'font-family': 'JetBrains Mono, monospace', 'font-size': '9.6', 'font-weight': '700',
      'letter-spacing': '0.05em', fill: z.color || '#6E685E'
    }, gZones);
    zt.textContent = z.label;
  });

  const nodeMap = {};
  (scene.nodes || []).forEach(n => { nodeMap[n.id] = n; });

  const pinnedId = enableTooltip ? (svgId === 'labSvg' ? state.labPinnedNodeId : state.pinnedNodeId) : null;
  const connectedIds = new Set();
  if (pinnedId) {
    connectedIds.add(pinnedId);
    (scene.edges || []).forEach(e => {
      if (e.from === pinnedId || e.to === pinnedId) {
        connectedIds.add(e.from);
        connectedIds.add(e.to);
      }
    });
  }

  // Edges + Packets
  const pkts = [];
  (scene.edges || []).forEach(e => {
    const a = nodeMap[e.from], b = nodeMap[e.to];
    if (!a || !b) return;
    const st = EDGE_STYLE[e.kind] || EDGE_STYLE.req;
    const stop = e.stop || 1;
    const isHighlighted = !pinnedId || e.from === pinnedId || e.to === pinnedId;
    const { d, ex, ey } = computeEdgePath(a, b, e.off || 0, stop);
    const pathEl = svgEl('path', {
      d, fill: 'none', stroke: st.color,
      'stroke-width': isHighlighted && pinnedId ? '2.8' : (st.dashed ? '1.7' : '2.1'),
      'stroke-dasharray': st.dashed ? '5 4' : '',
      'stroke-opacity': isHighlighted ? '0.92' : '0.22',
      'marker-end': stop < 1 ? '' : `url(#${svgId}-arr-${st.marker})`
    }, gEdges);

    if (stop < 1) {
      svgEl('circle', { cx: ex, cy: ey, r: 8, fill: '#FAD6D4', stroke: '#C93632', 'stroke-width': '1.5', opacity: isHighlighted ? '1' : '0.25' }, gEdges);
      svgEl('path', {
        d: `M ${ex - 3.5} ${ey - 3.5} L ${ex + 3.5} ${ey + 3.5} M ${ex + 3.5} ${ey - 3.5} L ${ex - 3.5} ${ey + 3.5}`,
        stroke: '#C93632', 'stroke-width': '1.8', 'stroke-linecap': 'round', opacity: isHighlighted ? '1' : '0.25'
      }, gEdges);
    }

    const totalLen = pathEl.getTotalLength();
    const count = e.count ?? st.count;
    for (let i = 0; i < count; i++) {
      const dot = svgEl('circle', {
        r: '4.8', fill: st.color, stroke: '#222222', 'stroke-width': '1.35', cx: -20, cy: -20,
        opacity: isHighlighted ? '1' : '0.2'
      }, gPackets);
      pkts.push({ el: dot, pathEl, totalLen, progress: i / Math.max(1, count), speed: e.speed || st.speed });
    }
  });
  state.packetsBySvg[svgId] = pkts;

  // Nodes + Tooltips + Pinning (works for both learnSvg and labSvg)
  const getPin = () => (svgId === 'labSvg' ? state.labPinnedNodeId : state.pinnedNodeId);
  const setPin = v => { if (svgId === 'labSvg') state.labPinnedNodeId = v; else state.pinnedNodeId = v; };
  (scene.nodes || []).forEach(n => {
    const dim = pinnedId && !connectedIds.has(n.id);
    const ng = svgEl('g', {
      class: `iso-node${dim ? ' dimmed' : ''}`,
      opacity: n.offline ? '0.82' : '1'
    }, gNodes);
    drawIsoGlyph(ng, n);
    drawFloatingBadge(gBadges, n);
    if (enableTooltip && n.tip) {
      ng.addEventListener('mouseenter', ev => { if (!getPin()) showNodeTooltip(ev, n, svgId); });
      ng.addEventListener('mousemove', ev => { if (!getPin()) moveNodeTooltip(ev, svgId); });
      ng.addEventListener('mouseleave', () => { if (!getPin()) hideNodeTooltip(svgId); });
      ng.addEventListener('click', ev => {
        ev.stopPropagation();
        setPin(getPin() === n.id ? null : n.id);
        renderIsoScene(svgId, scene, true);
        if (getPin()) showNodeTooltip(ev, n, svgId);
        else hideNodeTooltip(svgId);
      });
    }
  });

  if (enableTooltip) {
    svg.onclick = () => {
      if (getPin()) {
        setPin(null);
        hideNodeTooltip(svgId);
        renderIsoScene(svgId, scene, true);
      }
    };
  }

  pkts.forEach(p => {
    const pt = p.pathEl.getPointAtLength(p.progress * p.totalLen);
    p.el.setAttribute('cx', pt.x.toFixed(1));
    p.el.setAttribute('cy', pt.y.toFixed(1));
  });
  ensureAnimLoop();
}

function ensureAnimLoop() {
  if (state.animFrameId) return;
  state.lastTs = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - state.lastTs) / 1000) * state.speedMult;
    state.lastTs = now;
    const activeSvg = state.activeTab === 'learn' ? 'learnSvg' : (state.activeTab === 'lab' ? 'labSvg' : null);
    if (activeSvg && !(activeSvg === 'learnSvg' && state.isPaused)) {
      const list = state.packetsBySvg[activeSvg] || [];
      for (const p of list) {
        p.progress = (p.progress + p.speed * dt) % 1;
        const pt = p.pathEl.getPointAtLength(p.progress * p.totalLen);
        p.el.setAttribute('cx', pt.x.toFixed(1));
        p.el.setAttribute('cy', pt.y.toFixed(1));
      }
    }
    state.animFrameId = requestAnimationFrame(tick);
  }
  state.animFrameId = requestAnimationFrame(tick);
}

function renderTraceDockHtml(trace) {
  if (!trace) return '';
  const [bText, bTone] = trace.banner || ['', 'green'];
  return `
    <div class="trace-dock-left">
      <span class="trace-head-pill"><span class="trace-dot"></span>${escapeHtml(trace.title)}</span>
      ${(trace.rows || []).map(([k, v]) => `<span class="trace-kv"><span>${escapeHtml(k)}:</span><strong>${escapeHtml(v)}</strong></span>`).join('')}
    </div>
    ${bText ? `<div class="trace-banner ${bTone}">${escapeHtml(bText)}</div>` : ''}
  `;
}

/* =========================================================================
   TOOLTIP HELPERS
   ========================================================================= */
function getTooltipEls(svgId = 'learnSvg') {
  if (svgId === 'labSvg') {
    return {
      tt: document.getElementById('labTooltip'),
      vp: document.getElementById('labViewport'),
      title: document.getElementById('labTtTitle'),
      role: document.getElementById('labTtRole'),
      desc: document.getElementById('labTtDesc'),
      pinId: state.labPinnedNodeId
    };
  }
  return {
    tt: document.getElementById('nodeTooltip'),
    vp: document.getElementById('learnViewport'),
    title: document.getElementById('ttTitle'),
    role: document.getElementById('ttRole'),
    desc: document.getElementById('ttDesc'),
    pinId: state.pinnedNodeId
  };
}

function showNodeTooltip(ev, node, svgId = 'learnSvg') {
  const els = getTooltipEls(svgId);
  if (!els.tt) return;
  els.title.textContent = node.label;
  els.role.textContent = `${node.sub || node.shape.toUpperCase()} ${els.pinId === node.id ? '· PINNED (click to unpin)' : ''}`;
  els.desc.textContent = node.tip;
  els.tt.classList.add('show');
  moveNodeTooltip(ev, svgId);
}

function moveNodeTooltip(ev, svgId = 'learnSvg') {
  const { tt, vp } = getTooltipEls(svgId);
  if (!tt || !vp) return;
  const r = vp.getBoundingClientRect();
  let left = ev.clientX - r.left + 14;
  let top = ev.clientY - r.top - 12;
  if (left + 250 > r.width) left = ev.clientX - r.left - 255;
  if (top + 100 > r.height) top = r.height - 108;
  tt.style.left = `${Math.max(8, left)}px`;
  tt.style.top = `${Math.max(8, top)}px`;
}

function hideNodeTooltip(svgId = 'learnSvg') {
  getTooltipEls(svgId).tt?.classList.remove('show');
}

/* =========================================================================
   LEARN VIEW RENDERING & ADVANCED CONTROLS
   ========================================================================= */
function getVisibleLessons() {
  return Object.values(LESSONS).filter(l => state.globalCert === 'ALL' || l.certs.includes(state.globalCert));
}

function renderCourseSidebar() {
  const tree = document.getElementById('courseTree');
  tree.innerHTML = '';
  let visibleCount = 0;

  MODULES.forEach(mod => {
    const modLessons = mod.lessons
      .map(id => LESSONS[id])
      .filter(l => l && (state.globalCert === 'ALL' || l.certs.includes(state.globalCert)));
    if (modLessons.length === 0) return;
    visibleCount += modLessons.length;

    const doneInMod = modLessons.filter(l => (state.visitedSteps[l.id]?.size || 0) >= l.steps.length).length;
    const isOpen = !!state.expandedModules[mod.id] || state.globalCert !== 'ALL';

    const grp = document.createElement('div');
    grp.className = `module-group${isOpen ? ' open' : ''}`;
    grp.innerHTML = `
      <button class="module-header" onclick="toggleModule('${mod.id}')">
        <span class="module-header-left">
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span class="folder-chip" style="background:${mod.color};"></span>
          <span class="module-title-txt">${mod.code}. ${mod.title}</span>
        </span>
        <span class="module-stat">${doneInMod}/${modLessons.length}</span>
      </button>
      <div class="module-lessons">
        ${modLessons.map(l => {
          const active = l.id === state.currentLessonId;
          const vis = state.visitedSteps[l.id]?.size || 0;
          const done = vis >= l.steps.length;
          return `
            <button class="lesson-btn ${active ? 'active' : ''} ${done ? 'done' : ''}" onclick="selectLesson('${l.id}', 0)">
              <span class="lesson-check">${done ? '✓' : ''}</span>
              <span style="min-width:0;flex:1;">
                <div style="line-height:1.3;">${l.title}</div>
                <div class="lesson-meta-mini">
                  ${l.certs.map(c => `<span class="cert-badge cert-${c}" style="font-size:8.5px;padding:0.5px 4px;">${c}</span>`).join('')}
                </div>
              </span>
            </button>
          `;
        }).join('')}
      </div>
    `;
    tree.appendChild(grp);
  });

  document.getElementById('sidebarLessonCount').textContent = `${visibleCount} lesson${visibleCount === 1 ? '' : 's'}`;

  const allLessons = Object.values(LESSONS);
  const completedLessons = allLessons.filter(l => (state.visitedSteps[l.id]?.size || 0) >= l.steps.length).length;
  const pct = Math.round((completedLessons / allLessons.length) * 100);
  document.getElementById('sidebarProgressText').textContent = `${completedLessons} / ${allLessons.length} (${pct}%)`;
  document.getElementById('sidebarProgressBar').style.width = `${pct}%`;
}

function renderCurrentLessonStep() {
  const lesson = LESSONS[state.currentLessonId];
  if (!lesson) return;
  const step = lesson.steps[state.currentStepIndex] || lesson.steps[0];

  if (!state.visitedSteps[lesson.id]) state.visitedSteps[lesson.id] = new Set();
  state.visitedSteps[lesson.id].add(state.currentStepIndex);
  saveState();

  const mod = MODULES.find(m => m.id === lesson.moduleId);
  const pos = mod ? mod.lessons.indexOf(lesson.id) + 1 : 1;
  document.getElementById('lessonBreadcrumb').textContent = `${mod.code}. ${mod.title} / Lesson ${pos} of ${mod.lessons.length}`;
  document.getElementById('lessonTitle').textContent = lesson.title;
  document.getElementById('lessonSubtitle').textContent = lesson.subtitle;

  const refMeta = (typeof LESSON_REFS !== 'undefined' && LESSON_REFS[lesson.id]) || {};
  const topicDescEl = document.getElementById('lessonTopicDesc');
  if (topicDescEl) topicDescEl.textContent = refMeta.topicDesc || '';

  document.getElementById('lessonHeadPills').innerHTML = `
    ${lesson.certs.map(c => `<span class="cert-badge cert-${c}">${c}</span>`).join('')}
    <span class="meta-pill">⏱ ${lesson.duration}</span>
    <span class="meta-pill">☰ ${lesson.steps.length} steps</span>
  `;

  document.getElementById('metricsGrid').innerHTML = (step.metrics || []).map(([lbl, val, tone]) => `
    <div class="metric-box">
      <span class="metric-lbl">${lbl}</span>
      <span class="metric-val ${tone || ''}">${val}</span>
    </div>
  `).join('');

  state.pinnedNodeId = null;
  hideNodeTooltip();
  renderIsoScene('learnSvg', step, true);
  document.getElementById('learnTraceDock').innerHTML = renderTraceDockHtml(step.trace);

  document.getElementById('timelineCounter').textContent = `Step ${state.currentStepIndex + 1} of ${lesson.steps.length}`;
  document.getElementById('timelineSteps').innerHTML = lesson.steps.map((s, idx) => {
    const isAct = idx === state.currentStepIndex;
    const isVis = state.visitedSteps[lesson.id]?.has(idx);
    return `
      <button class="t-step ${isAct ? 'active' : ''} ${isVis ? 'visited' : ''}" onclick="goToStep(${idx})">
        <span class="t-circle">${idx + 1}</span>
        <span class="t-label">${s.short}</span>
      </button>
    `;
  }).join('');

  document.getElementById('guideStepCounter').textContent = `STEP ${state.currentStepIndex + 1} / ${lesson.steps.length}`;
  const catEl = document.getElementById('guideCatPill');
  catEl.textContent = step.cat;
  catEl.style.background = CAT_COLORS[step.cat] || '#D5E8FA';
  document.getElementById('guideTitle').textContent = step.title;
  const stepDeep = refMeta.steps && refMeta.steps[state.currentStepIndex];
  const bodyHtml = step.body.map(p => `<p>${p}</p>`).join('');
  document.getElementById('guideBody').innerHTML = stepDeep
    ? `${bodyHtml}<div class="step-deep-note"><strong>In Practice:</strong> ${escapeHtml(stepDeep)}</div>`
    : bodyHtml;

  // Code / YAML block per step (supports both step.yaml and step.code)
  const codeBlock = document.getElementById('guideCodeBlock');
  const codeBody = step.yaml || step.code?.body;
  const codeTitle = step.yamlTitle || step.code?.title || 'CLI / YAML Reference';
  if (codeBody) {
    codeBlock.innerHTML = `
      <div class="step-yaml-box">
        <div class="step-yaml-head">
          <span>${escapeHtml(codeTitle)}</span>
          <button class="step-yaml-copy" onclick="copyText(this, ${JSON.stringify(codeBody).replace(/"/g, '&quot;')})">Copy</button>
        </div>
        <pre class="step-yaml-pre">${escapeHtml(codeBody)}</pre>
      </div>`;
  } else {
    codeBlock.innerHTML = '';
  }

  document.getElementById('guideTip').textContent = step.tip;
  renderLessonResources(lesson, step, refMeta);

  document.getElementById('prevStepBtn').disabled = state.currentStepIndex === 0;
  const nextBtn = document.getElementById('nextStepBtn');
  const nextLbl = document.getElementById('nextStepLabel');
  if (state.currentStepIndex < lesson.steps.length - 1) {
    nextLbl.textContent = `Next: ${lesson.steps[state.currentStepIndex + 1].short}`;
    nextBtn.className = 'btn btn-mint nav-next';
  } else {
    nextLbl.textContent = 'Next Lesson';
    nextBtn.className = 'btn btn-sky nav-next';
  }

  const visitedRatio = (state.visitedSteps[lesson.id]?.size || 1) / lesson.steps.length;
  const checkedCount = Math.max(1, Math.ceil(visitedRatio * lesson.checklist.length));
  document.getElementById('learnChecklist').innerHTML = lesson.checklist.map((item, idx) => {
    const ok = idx < checkedCount;
    return `<li class="checklist-li ${ok ? 'checked' : ''}"><span class="chk-sq">${ok ? '✓' : ''}</span><span>${item}</span></li>`;
  }).join('');

  renderCourseSidebar();
}

function resetRefPanels() {
  state.openRefPanels = { topicRefs: false, topicVideos: false, stepRefs: false, stepVideos: false };
}

function toggleRefPanel(key) {
  state.openRefPanels[key] = !state.openRefPanels[key];
  const lesson = LESSONS[state.currentLessonId];
  const step = lesson && (lesson.steps[state.currentStepIndex] || lesson.steps[0]);
  const refMeta = (typeof LESSON_REFS !== 'undefined' && lesson && LESSON_REFS[lesson.id]) || {};
  if (lesson && step) renderLessonResources(lesson, step, refMeta);
}

function renderRefDrawer(drawerId, btnId, links, icon, isOpen, labelBase) {
  const dr = document.getElementById(drawerId);
  const btn = document.getElementById(btnId);
  if (!dr || !btn) return;
  btn.classList.toggle('active', isOpen);
  btn.textContent = `${icon} ${labelBase} ${isOpen ? '▲' : '▾'}`;
  dr.classList.toggle('open', isOpen);
  dr.innerHTML = links.map(([lbl, url, summary]) => `
    <div class="ref-link-wrap">
      <a class="ref-link-item" href="${url}" target="_blank" rel="noopener noreferrer"><span>${icon} ${escapeHtml(lbl)}</span><span>↗</span></a>
      ${summary ? `<div class="ref-link-summary">${escapeHtml(summary)}</div>` : ''}
    </div>`
  ).join('');
}

function dedupeResourceLinks(list) {
  const seen = new Set();
  return list.filter(item => {
    if (!item || !item[1] || seen.has(item[1])) return false;
    seen.add(item[1]);
    return true;
  });
}

function enforceMaxOneSearch(list) {
  let keptSearch = false;
  return list.filter(item => {
    const isSearch = typeof item?.[1] === 'string' && item[1].includes('youtube.com/results');
    if (!isSearch) return true;
    if (keptSearch) return false;
    keptSearch = true;
    return true;
  });
}

function renderLessonResources(lesson, step, refMeta) {
  const topicRefs = refMeta.refs || [['Kubernetes Documentation', 'https://kubernetes.io/docs/home/']];
  const ytCurated = (typeof LESSON_YT_OVERRIDES !== 'undefined' && LESSON_YT_OVERRIDES[lesson.id])
    || (typeof MODULE_YT_DEFAULTS !== 'undefined' && MODULE_YT_DEFAULTS[lesson.moduleId])
    || [];
  const topicVideos = enforceMaxOneSearch(dedupeResourceLinks([...ytCurated, ...(refMeta.videos || [])])).slice(0, 4);
  const stepMap = (typeof STEP_VIDEOS !== 'undefined' && STEP_VIDEOS[lesson.id]) || null;
  const fallbackStepVid = [
    `Sub-topic Walkthrough: ${step.short}`,
    `https://www.youtube.com/results?search_query=${encodeURIComponent('Kubernetes ' + lesson.title + ' ' + step.short)}`,
    refMeta.steps?.[state.currentStepIndex] || step.explain || `Deep dive into ${step.title}.`
  ];
  const rawStepVideos = (stepMap && stepMap[state.currentStepIndex] && stepMap[state.currentStepIndex].length)
    ? stepMap[state.currentStepIndex]
    : [fallbackStepVid];
  const stepVideos = enforceMaxOneSearch(dedupeResourceLinks(rawStepVideos));

  renderRefDrawer('topicRefsDrawer', 'topicRefsBtn', topicRefs, '📚', !!state.openRefPanels.topicRefs, 'References');
  renderRefDrawer('topicVideosDrawer', 'topicVideosBtn', topicVideos, '▶', !!state.openRefPanels.topicVideos, 'YouTube Videos');
  renderRefDrawer('stepRefsDrawer', 'stepRefsBtn', topicRefs, '📚', !!state.openRefPanels.stepRefs, 'Section Refs');
  renderRefDrawer('stepVideosDrawer', 'stepVideosBtn', stepVideos, '▶', !!state.openRefPanels.stepVideos, 'Section Video');
}

function selectLesson(id, stepIdx = 0) {
  if (!LESSONS[id]) return;
  stopAutoPlay();
  resetRefPanels();
  state.currentLessonId = id;
  state.currentStepIndex = Math.min(stepIdx, LESSONS[id].steps.length - 1);
  state.expandedModules[LESSONS[id].moduleId] = true;
  switchTab('learn');
  renderCurrentLessonStep();
  toggleMobileSidebar(false);
}

function goToStep(idx) {
  const lesson = LESSONS[state.currentLessonId];
  if (!lesson || idx < 0 || idx >= lesson.steps.length) return;
  resetRefPanels();
  state.currentStepIndex = idx;
  renderCurrentLessonStep();
}

function prevStep() {
  stopAutoPlay();
  if (state.currentStepIndex > 0) goToStep(state.currentStepIndex - 1);
}

function nextStep() {
  const lesson = LESSONS[state.currentLessonId];
  if (state.currentStepIndex < lesson.steps.length - 1) {
    goToStep(state.currentStepIndex + 1);
  } else {
    stopAutoPlay();
    const visible = getVisibleLessons().map(l => l.id);
    const idx = visible.indexOf(state.currentLessonId);
    const nextId = visible[(idx + 1) % visible.length] || 'cp-request-flow';
    selectLesson(nextId, 0);
  }
}

function toggleModule(modId) {
  state.expandedModules[modId] = !state.expandedModules[modId];
  renderCourseSidebar();
}

function replayLearnStep() {
  if (state.isPaused) togglePause();
  const lesson = LESSONS[state.currentLessonId];
  if (lesson) renderIsoScene('learnSvg', lesson.steps[state.currentStepIndex], true);
}

function togglePause() {
  state.isPaused = !state.isPaused;
  document.getElementById('pauseIcon').textContent = state.isPaused ? '▶' : '⏸';
  document.getElementById('pauseLabel').textContent = state.isPaused ? 'Play' : 'Pause';
  document.getElementById('learnDiagramCard').classList.toggle('is-paused', state.isPaused);
}

function toggleAutoPlay() {
  if (state.autoPlay) {
    stopAutoPlay();
    return;
  }
  state.autoPlay = true;
  if (state.isPaused) togglePause();
  const btn = document.getElementById('autoPlayBtn');
  btn.textContent = '⏹ Stop';
  btn.classList.add('btn-yellow');
  state.autoPlayTimer = setInterval(() => {
    const lesson = LESSONS[state.currentLessonId];
    if (!lesson) { stopAutoPlay(); return; }
    if (state.currentStepIndex < lesson.steps.length - 1) {
      goToStep(state.currentStepIndex + 1);
    } else {
      stopAutoPlay();
      showToast('Lesson workflow walkthrough complete ✓');
    }
  }, 4200 / state.speedMult);
}

function stopAutoPlay() {
  state.autoPlay = false;
  if (state.autoPlayTimer) {
    clearInterval(state.autoPlayTimer);
    state.autoPlayTimer = null;
  }
  const btn = document.getElementById('autoPlayBtn');
  if (btn) {
    btn.textContent = '▶ Auto';
    btn.classList.remove('btn-yellow');
  }
}

function cycleAnimSpeed() {
  const speeds = [1, 1.5, 2, 0.5];
  const next = speeds[(speeds.indexOf(state.speedMult) + 1) % speeds.length];
  state.speedMult = next;
  document.getElementById('speedBtn').textContent = `${next}x`;
  if (state.autoPlay) {
    stopAutoPlay();
    toggleAutoPlay();
  }
}

function toggleDiagramZoom() {
  state.zoomPan = !state.zoomPan;
  const vp = document.getElementById('learnViewport');
  vp.classList.toggle('zoom-pan', state.zoomPan);
  const btn = document.getElementById('zoomPanBtn');
  btn.textContent = state.zoomPan ? '🔍 1.4x Pan' : '🔍 Fit';
  btn.classList.toggle('btn-mint', state.zoomPan);
}

function setGlobalCert(cert) {
  state.globalCert = cert;
  document.querySelectorAll('#globalCertPills .cert-pill, #sidebarCertPills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.cert === cert);
  });
  const visible = getVisibleLessons();
  if (visible.length && !visible.some(l => l.id === state.currentLessonId)) {
    state.currentLessonId = visible[0].id;
    state.currentStepIndex = 0;
  }
  renderCurrentLessonStep();
}

/* =========================================================================
   PRACTICE VIEW
   ========================================================================= */
function getFilteredPracticeIndices() {
  return PRACTICE_SCENARIOS.map((s, i) => ({ s, i }))
    .filter(x => state.practiceFilter === 'ALL' || x.s.cert === state.practiceFilter)
    .map(x => x.i);
}

function setPracticeFilter(cert) {
  state.practiceFilter = cert;
  state.practiceIndex = 0;
  document.querySelectorAll('#practiceFilterPills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.pcert === cert);
  });
  renderPractice();
}

function renderPractice() {
  const indices = getFilteredPracticeIndices();
  const card = document.getElementById('practiceCard');
  const total = indices.length;
  const correctCount = indices.filter(idx => state.practiceAnswers[idx] === PRACTICE_SCENARIOS[idx].correct).length;
  document.getElementById('practiceScore').textContent = correctCount;
  document.getElementById('practiceTotal').textContent = total;

  if (state.practiceIndex >= total) state.practiceIndex = 0;
  const realIdx = indices[state.practiceIndex];
  const sc = PRACTICE_SCENARIOS[realIdx];
  const chosen = state.practiceAnswers[realIdx];
  const answered = chosen !== undefined;
  const isRight = chosen === sc.correct;

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
      <div class="q-nav">
        ${indices.map((gIdx, pos) => {
          const ans = state.practiceAnswers[gIdx];
          let cls = pos === state.practiceIndex ? 'active' : '';
          if (ans !== undefined) cls += ans === PRACTICE_SCENARIOS[gIdx].correct ? ' correct' : ' wrong';
          return `<button class="q-num ${cls}" onclick="jumpPractice(${pos})">${pos + 1}</button>`;
        }).join('')}
      </div>
      <span class="cert-badge cert-${sc.cert}">${sc.cert} DRILL</span>
    </div>

    <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.015em;">${sc.title}</h2>
    <pre class="code-snippet">${escapeHtml(sc.snippet)}</pre>
    <p style="font-size:13.5px;font-weight:600;color:var(--ink);">${sc.question}</p>

    <div class="options-col">
      ${sc.options.map((opt, idx) => {
        let cls = '';
        if (answered) {
          if (idx === sc.correct) cls = 'correct';
          else if (idx === chosen) cls = 'wrong';
        }
        return `
          <button class="opt-btn ${cls}" ${answered ? 'disabled' : ''} onclick="answerPractice(${realIdx}, ${idx})">
            <span class="opt-key">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
          </button>
        `;
      }).join('')}
    </div>

    ${answered ? `
      <div class="explain-panel ${isRight ? 'correct' : 'wrong'}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <span style="font-family:var(--font-mono);font-weight:800;font-size:11.5px;">
            ${isRight ? '✓ CORRECT ROOT CAUSE' : '✗ NOT QUITE — ROOT CAUSE ANALYSIS'}
          </span>
          <button class="btn btn-sm" onclick="copyText(this, ${JSON.stringify(sc.fix).replace(/"/g, '&quot;')})">Copy Fix</button>
        </div>
        <div>${sc.explanation}</div>
        <pre class="code-snippet" style="margin-top:2px;"># Production Fix\n${escapeHtml(sc.fix)}</pre>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button class="btn" onclick="jumpPractice(${Math.max(0, state.practiceIndex - 1)})" ${state.practiceIndex === 0 ? 'disabled' : ''}>← Prev</button>
        <button class="btn btn-mint" onclick="jumpPractice(${(state.practiceIndex + 1) % total})">
          ${state.practiceIndex < total - 1 ? 'Next Scenario →' : 'Back to Scenario 1 ↻'}
        </button>
      </div>
    ` : ''}
  `;
}

function jumpPractice(pos) {
  state.practiceIndex = pos;
  renderPractice();
}

function answerPractice(realIdx, optIdx) {
  if (state.practiceAnswers[realIdx] !== undefined) return;
  state.practiceAnswers[realIdx] = optIdx;
  saveState();
  renderPractice();
}

function resetPractice() {
  state.practiceAnswers = {};
  state.practiceIndex = 0;
  saveState();
  renderPractice();
  showToast('Practice drill reset');
}

/* =========================================================================
   PRACTICE SCENARIO Q&A BANK
   ========================================================================= */
function setPracticeMode(mode) {
  state.practiceMode = mode;
  document.querySelectorAll('#practiceModePills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.pmode === mode);
  });
  document.getElementById('practiceDrillsWrap').style.display = mode === 'drills' ? 'flex' : 'none';
  document.getElementById('practiceScenariosWrap').style.display = mode === 'scenarios' ? 'flex' : 'none';
  if (mode === 'scenarios') renderScenarioBank();
  else renderPractice();
}

function setScenarioCat(cat) {
  state.scenarioCat = cat;
  document.querySelectorAll('#scenarioCatPills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.scat === cat);
  });
  renderScenarioBank();
}

function setScenarioSearch(q) {
  state.scenarioSearch = q.trim().toLowerCase();
  renderScenarioBank();
}

function toggleScenarioCard(id) {
  if (state.openScenarios.has(id)) state.openScenarios.delete(id);
  else {
    state.openScenarios.add(id);
    state.reviewedScenarios.add(id);
    saveState();
  }
  renderScenarioBank();
}

function toggleScenarioReviewed(ev, id) {
  ev.stopPropagation();
  if (state.reviewedScenarios.has(id)) state.reviewedScenarios.delete(id);
  else state.reviewedScenarios.add(id);
  saveState();
  renderScenarioBank();
}

function renderScenarioBank() {
  const list = document.getElementById('scenarioBankList');
  if (!list || typeof PRACTICE_SCENARIO_BANK === 'undefined') return;
  document.getElementById('scenarioReviewedCount').textContent = state.reviewedScenarios.size;

  const items = PRACTICE_SCENARIO_BANK.filter(s => {
    const matchCat = state.scenarioCat === 'ALL' || s.cat === state.scenarioCat;
    const hay = `${s.title} ${s.scenario} ${s.answer} ${s.layman} ${s.cat} ${s.cert}`.toLowerCase();
    return matchCat && (!state.scenarioSearch || hay.includes(state.scenarioSearch));
  });

  if (!items.length) {
    list.innerHTML = `<div class="practice-card" style="text-align:center;color:var(--muted);font-family:var(--font-mono);font-size:12px;">No matching scenarios found.</div>`;
    return;
  }

  list.innerHTML = items.map(s => {
    const isOpen = state.openScenarios.has(s.id);
    const isRev = state.reviewedScenarios.has(s.id);
    return `
      <article class="scenario-card ${isOpen ? 'open' : ''}">
        <div class="scenario-card-head" onclick="toggleScenarioCard('${s.id}')">
          <div style="min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
              <span class="cert-badge cert-${s.cert}">${s.cert}</span>
              <span class="meta-pill" style="padding:1px 7px;font-size:9.5px;">${escapeHtml(s.cat)}</span>
            </div>
            <div class="scenario-title">${escapeHtml(s.title)}</div>
            <div class="scenario-prompt">${escapeHtml(s.scenario)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <button class="btn btn-sm ${isRev ? 'btn-mint' : ''}" onclick="toggleScenarioReviewed(event, '${s.id}')">${isRev ? '✓ Reviewed' : 'Mark Read'}</button>
            <span class="kbd">${isOpen ? '▲' : '▼'}</span>
          </div>
        </div>
        <div class="scenario-body">
          <div class="scenario-answer-box">
            <div style="font-family:var(--font-mono);font-size:10px;font-weight:800;color:var(--ok);margin-bottom:4px;">TECHNICAL ARCHITECTURE ANSWER</div>
            <div>${escapeHtml(s.answer)}</div>
          </div>
          <div class="scenario-layman-box">
            <div style="font-family:var(--font-mono);font-size:10px;font-weight:800;color:var(--warn);margin-bottom:4px;">💡 LAYMAN EXPLANATION</div>
            <div>${escapeHtml(s.layman)}</div>
          </div>
          ${s.yaml ? `
            <div class="step-yaml-box" style="margin-top:0;">
              <div class="step-yaml-head">
                <span>Production YAML / CLI Reference</span>
                <button class="step-yaml-copy" onclick="copyText(this, ${JSON.stringify(s.yaml).replace(/"/g, '&quot;')})">Copy</button>
              </div>
              <pre class="step-yaml-pre">${escapeHtml(s.yaml)}</pre>
            </div>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

/* =========================================================================
   DESIGN LAB VIEW
   ========================================================================= */
function addLabLog(tag, text) {
  const ts = new Date().toTimeString().slice(0, 8);
  state.labLogs.unshift({ ts, tag, text });
  if (state.labLogs.length > 18) state.labLogs.pop();
  const box = document.getElementById('labConsole');
  if (box) {
    box.innerHTML = state.labLogs.map(l => `
      <div class="log-line">
        <span class="log-ts">[${l.ts}]</span>
        <span class="log-tag ${l.tag}">${l.tag.toUpperCase()}</span>
        <span>${l.text}</span>
      </div>
    `).join('');
  }
}

function toggleLabFeature(key) {
  state.lab[key] = !state.lab[key];
  saveState();
  const f = LAB_FEATURES.find(x => x.key === key);
  addLabLog('info', `${f.name}: ${state.lab[key] ? 'ENABLED' : 'DISABLED'}`);
  renderDesignLab();
}

function setLabGroup(grp) {
  state.labGroup = grp;
  document.querySelectorAll('#labGroupPills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.lgrp === grp);
  });
  renderDesignLab();
}

function setLabLoad(val) {
  state.labLoad = Math.max(1, Math.min(10, Number(val) || 1));
  if (state.labLoad >= 8 && state.labChaos === 'normal') {
    addLabLog(state.lab.karpenter ? 'ok' : 'bad', state.lab.karpenter
      ? `Traffic ${state.labLoad}x (~${state.labLoad * 120} RPS): HPA + Karpenter scaled capacity cleanly!`
      : `Traffic ${state.labLoad}x (~${state.labLoad * 120} RPS): CPU saturating — enable HPA + Karpenter!`);
  }
  renderDesignLab();
}

function toggleLabPeek(key) {
  state.labPeekKey = state.labPeekKey === key ? null : key;
  renderDesignLab();
}

function setLabInspectorTab(tab) {
  state.labInspectorTab = tab;
  renderDesignLab();
}

function fixLabGuardrails(keys) {
  (keys || []).forEach(k => { state.lab[k] = true; });
  saveState();
  const names = keys.map(k => LAB_FEATURES.find(x => x.key === k)?.name || k).join(' + ');
  addLabLog('ok', `Auto-Remediated: Enabled ${names}`);
  showToast(`Fixed: ${names}`);
  renderDesignLab();
}

function labPreset(mode) {
  const cksKeys = ['psa', 'netpol', 'cel', 'rbac', 'falco'];
  const haKeys = ['haEtcd', 'karpenter', 'gitops'];
  const opKeys = ['splitCache', 'predicate', 'statusSub', 'ownerRefs', 'finalizers', 'celWebhook', 'backoff', 'leaderHA'];
  LAB_FEATURES.forEach(f => {
    if (mode === 'hardened') state.lab[f.key] = true;
    else if (mode === 'cks') state.lab[f.key] = cksKeys.includes(f.key);
    else if (mode === 'ha') state.lab[f.key] = haKeys.includes(f.key);
    else if (mode === 'operator') state.lab[f.key] = opKeys.includes(f.key);
    else state.lab[f.key] = false;
  });
  state.labChaos = 'normal';
  saveState();
  const labels = {
    hardened: 'Applied Full Production Sovereign Stack (16/16)',
    cks: 'Applied Zero-Trust CKS Security Profile',
    ha: 'Applied High-Availability & Elastic Scale Profile',
    operator: 'Applied Production Operator HA Profile (8/8)',
    bare: 'Reset to Bare Unhardened Cluster (0/16)'
  };
  addLabLog(mode === 'bare' ? 'info' : 'ok', labels[mode] || 'Updated preset');
  renderDesignLab();
}

function startLabMission(id) {
  const m = (typeof LAB_MISSIONS !== 'undefined') && LAB_MISSIONS.find(x => x.id === id);
  if (!m) return;
  state.labMissionId = id;
  if (m.id.startsWith('m-op')) setLabGroup('operator');
  else if (m.id === 'm-full') setLabGroup('ALL');
  else setLabGroup('cluster');
  triggerLabChaos(m.testChaos || 'normal');
}

function isLabScenarioProtected(L, id) {
  if (id === 'normal') return true;
  if (id === 'kill-cp') return !!L.haEtcd;
  if (id === 'root-pod') return !!(L.psa || L.cel);
  if (id === 'lateral-scan') return !!L.netpol;
  if (id === 'cve-image') return !!L.cel;
  if (id === 'traffic-spike') return !!L.karpenter;
  if (id === 'worker-loss') return !!(L.karpenter && L.haEtcd);
  if (id === 'manual-drift') return !!L.gitops;
  if (id === 'invalid-cr') return !!L.celWebhook;
  if (id === 'delete-db') return !!(L.finalizers && L.ownerRefs);
  if (id === 'status-storm') return !!(L.predicate && L.statusSub);
  if (id === 'kill-leader') return !!L.leaderHA;
  if (id === 'burst-500') return !!(L.splitCache && L.backoff);
  return true;
}

function runLabAutoSweep() {
  const L = state.lab;
  const tests = Object.keys(LAB_SCENARIOS).filter(k => k !== 'normal');
  const failing = tests.filter(k => !isLabScenarioProtected(L, k));
  const passed = tests.length - failing.length;
  addLabLog(failing.length ? 'bad' : 'ok',
    `Auto-Stress Audit: ${passed} / ${tests.length} attacks & fault scenarios survived` +
    (failing.length ? ` (Weakness: ${failing.slice(0, 3).join(', ')})` : ' — 100% Resilient!'));
  triggerLabChaos(failing[0] || 'normal');
  showToast(`Audit Score: ${passed}/${tests.length} Protected`);
}

function exportLabSummary() {
  const active = LAB_FEATURES.filter(f => state.lab[f.key]).map(f => `- [x] ${f.name} (${f.sub})`);
  const inactive = LAB_FEATURES.filter(f => !state.lab[f.key]).map(f => `- [ ] ${f.name}`);
  const t = computeLabTelemetry(state.lab, state.labChaos, state.labLoad);
  const summary = `# Kube to Scale — Cluster Architecture Blueprint (Grade ${t.grade})\nLoad: ${state.labLoad}x (${state.labLoad * 120} RPS) | Active: ${active.length}/${LAB_FEATURES.length} | Active Fault: ${state.labChaos}\n\n## Telemetry Snapshot\n- API Load: ${t.apiVal} (${t.apiSub})\n- Cluster Capacity: ${t.capVal} (${t.capSub})\n- Blast Radius: ${t.blastVal} (${t.blastSub})\n\n## Enabled Guardrails (${active.length}/${LAB_FEATURES.length})\n${active.join('\n') || '- None'}\n\n## Missing Guardrails\n${inactive.join('\n') || '- None (100% hardened)'}`;
  copyString(summary, 'Architecture Blueprint copied!');
}

function triggerLabChaos(mode) {
  state.labChaos = mode;
  const L = state.lab;
  if (mode === 'normal') {
    addLabLog('ok', 'Cleared chaos injection — cluster returned to steady state.');
  } else if (mode === 'kill-cp') {
    addLabLog(L.haEtcd ? 'ok' : 'bad', L.haEtcd
      ? 'CP Node #3 killed — Raft Quorum (2/3) maintained, 0 API downtime!'
      : 'Single Control Plane Node killed — CLUSTER OUTAGE! Enable HA 3-Node etcd.');
  } else if (mode === 'root-pod') {
    addLabLog((L.psa || L.cel) ? 'ok' : 'bad', (L.psa || L.cel)
      ? 'Privileged Root Pod REJECTED at Admission (403 Forbidden by PSA/CEL)!'
      : 'SECURITY BREACH: Privileged Root Pod scheduled directly onto Worker Node!');
  } else if (mode === 'lateral-scan') {
    addLabLog(L.netpol ? 'ok' : (L.falco ? 'info' : 'bad'), L.netpol
      ? 'Lateral scan to Prod DB DROPPED by Default-Deny Cilium NetworkPolicy!'
      : (L.falco ? 'ALERT: Falco eBPF detected lateral scan (enable NetPol to block it proactively!).' : 'BREACH: Compromised Pod reached Prod DB :5432 over flat network!'));
  } else if (mode === 'cve-image') {
    addLabLog(L.cel ? 'ok' : (L.falco ? 'info' : 'bad'), L.cel
      ? 'Unverified :latest image BLOCKED by CEL ValidatingAdmissionPolicy (<1ms)!'
      : (L.falco ? 'ALERT: :latest image pulled; Falco monitoring suspicious binaries!' : 'SUPPLY CHAIN RISK: Unverified :latest image deployed in prod!'));
  } else if (mode === 'traffic-spike') {
    addLabLog(L.karpenter ? 'ok' : 'bad', L.karpenter
      ? '10x Spike handled: HPA scaled Pods & Karpenter booted Spot Node B in 35s!'
      : 'DEGRADED: Worker Node CPU 98% saturated & requests timing out! Enable HPA + Karpenter.');
  } else if (mode === 'worker-loss') {
    addLabLog((L.karpenter && L.haEtcd) ? 'ok' : 'bad', (L.karpenter && L.haEtcd)
      ? 'Worker AZ lost — HA Control Plane evicted & Karpenter provisioned healthy Spot capacity!'
      : 'DEGRADED: Lost worker Pods stuck Pending! Enable HA Control Plane + Karpenter.');
  } else if (mode === 'manual-drift') {
    addLabLog(L.gitops ? 'ok' : 'bad', L.gitops
      ? 'Manual kubectl scale=1 detected — ArgoCD selfHeal reverted to 3 replicas in 4s!'
      : 'CONFIG DRIFT: Manual kubectl edit left production permanently diverged from Git!');
  } else if (mode === 'invalid-cr') {
    addLabLog(L.celWebhook ? 'ok' : 'bad', L.celWebhook
      ? 'Invalid CR (replicas: -2) BLOCKED pre-etcd by CEL Validation & Webhooks (422)!'
      : 'CRASH: Invalid CR persisted to etcd — enable CEL Validation & Webhooks!');
  } else if (mode === 'delete-db') {
    addLabLog((L.finalizers && L.ownerRefs) ? 'ok' : 'bad', (L.finalizers && L.ownerRefs)
      ? 'DeletionTimestamp set -> Finalizer deleted AWS RDS -> OwnerRefs cascaded children (0 orphans)!'
      : 'ORPHAN LEAK: External AWS RDS DB left billing in cloud — enable Finalizers & OwnerReferences!');
  } else if (mode === 'status-storm') {
    addLabLog((L.predicate && L.statusSub) ? 'ok' : 'bad', (L.predicate && L.statusSub)
      ? '/status preserved generation & GenerationChangedPredicate dropped loop noise (0% storm)!'
      : 'RECONCILE STORM: Status updates keep re-enqueuing CR at 100% CPU — enable Predicate & /status!');
  } else if (mode === 'kill-leader') {
    addLabLog(L.leaderHA ? 'ok' : 'bad', L.leaderHA
      ? 'Leader Pod-0 OOMKilled -> Standby Pod-1 won Lease via CAS cleanly (0 split-brain)!'
      : 'OPERATOR OUTAGE: Single Operator Pod crashed — enable Leader Election Lease (HA)!');
  } else if (mode === 'burst-500') {
    addLabLog((L.splitCache && L.backoff) ? 'ok' : 'bad', (L.splitCache && L.backoff)
      ? '500 CR Burst absorbed: SharedInformer served reads at 0 QPS & WorkQueue coalesced retries!'
      : 'API SERVER 429 THROTTLED: Enable SharedInformer Cache + Exponential Backoff WorkQueue!');
  }
  renderDesignLab();
}

function computeLabTelemetry(L, C, load) {
  const effectiveLoad = (C === 'traffic-spike') ? Math.max(load, 9) : load;
  const activeCount = LAB_FEATURES.filter(f => L[f.key]).length;
  const pct = activeCount / LAB_FEATURES.length;

  let apiVal = L.splitCache ? '~16 QPS · 12ms' : '~140 QPS · 68ms';
  let apiSub = L.splitCache ? 'Informer RAM cache hits' : 'Direct List polling overhead';
  let apiTone = L.splitCache ? 'ok' : 'warn';
  if (C === 'burst-500' && !(L.splitCache && L.backoff)) {
    apiVal = '640 QPS · 429!'; apiSub = 'APF throttled — enable cache+backoff'; apiTone = 'bad';
  } else if (C === 'status-storm' && !(L.predicate && L.statusSub)) {
    apiVal = '490 QPS · LOOP!'; apiSub = 'Status writes triggering self-watch'; apiTone = 'bad';
  } else if (C === 'kill-cp' && !L.haEtcd) {
    apiVal = '0 QPS · TIMEOUT'; apiSub = 'API Server unreachable'; apiTone = 'bad';
  }

  let pods = Math.min(18, effectiveLoad * (L.karpenter ? 2 : 1));
  if (!L.karpenter && pods > 4) pods = 3;
  const cpuPct = L.karpenter ? Math.min(68, 22 + effectiveLoad * 4) : Math.min(99, 25 + effectiveLoad * 9);
  let capVal = `${pods} Pods · ${cpuPct}% CPU`;
  let capSub = L.karpenter ? `HPA + Karpenter (${effectiveLoad >= 6 ? '3 Spot Nodes' : '1 Node'})` : (cpuPct >= 80 ? 'Static 1 Node saturated!' : 'Static Node Pool');
  let capTone = cpuPct >= 85 ? 'bad' : (cpuPct >= 65 ? 'warn' : 'ok');
  if (C === 'worker-loss' && !(L.karpenter && L.haEtcd)) {
    capVal = 'Pods Pending!'; capSub = 'Insufficient CPU after AZ loss'; capTone = 'bad';
  } else if (C === 'manual-drift' && !L.gitops) {
    capVal = '1/3 Replicas!'; capSub = 'Manual kubectl drift undetected'; capTone = 'warn';
  }

  let blastVal = L.haEtcd ? '0s Quorum HA' : 'Full SPOF Outage';
  let blastSub = L.netpol ? 'Zero-Trust lateral shield' : 'Flat Pod network exposed';
  let blastTone = (L.haEtcd && L.netpol) ? 'ok' : (!L.haEtcd ? 'bad' : 'warn');
  if ((C === 'root-pod' && !L.psa && !L.cel) || (C === 'lateral-scan' && !L.netpol)) {
    blastVal = 'HOST/DB BREACH'; blastTone = 'bad';
  } else if (C === 'delete-db' && !L.finalizers) {
    blastVal = 'AWS RDS LEAKED'; blastTone = 'bad';
  } else if (C === 'kill-leader' && !L.leaderHA) {
    blastVal = 'OP SPOF DOWN'; blastTone = 'bad';
  }

  const grade = pct >= 0.9 ? 'A+ PROD' : (pct >= 0.7 ? 'A' : (pct >= 0.5 ? 'B' : (pct >= 0.25 ? 'C' : 'F RISK')));
  const gradeTone = pct >= 0.7 ? 'ok' : (pct >= 0.4 ? 'warn' : 'bad');
  return { apiVal, apiSub, apiTone, capVal, capSub, capTone, blastVal, blastSub, blastTone, grade, gradeTone, activeCount };
}

function buildOperatorChaosScene(L, C) {
  const opActive = (C === 'invalid-cr' || C === 'delete-db' || C === 'status-storm' || C === 'kill-leader' || C === 'burst-500');
  if (!opActive) return null;
  const invalidOk = C === 'invalid-cr' && !!L.celWebhook;
  const delOk = C === 'delete-db' && !!L.finalizers;
  const stormOk = C === 'status-storm' && !!L.predicate && !!L.statusSub;
  const haOk = C === 'kill-leader' && !!L.leaderHA;
  const burstOk = C === 'burst-500' && !!L.splitCache && !!L.backoff;
  const zones = [
    Z(48, 36, 230, 278, 'API SERVER + ETCD', (C === 'invalid-cr' && !invalidOk) || (C === 'burst-500' && !burstOk) ? '#C93632' : '#4A7BC7'),
    Z(300, 36, 250, 278, L.leaderHA ? 'OPERATOR HA (LEASE)' : 'OPERATOR POD (SPOF)', ((C === 'kill-leader' && !haOk) || (C === 'status-storm' && !stormOk)) ? '#C93632' : '#1E7E45'),
    Z(575, 36, 200, 278, 'MANAGED TARGETS', (C === 'delete-db' && !delOk) ? '#C93632' : '#6E47B8')
  ];
  const nodes = [
    N('api', 163, 118, 'cube', (C === 'burst-500' && !burstOk) ? 'coral' : 'sky', 'API Server', L.celWebhook ? 'CEL + Hook ON' : 'no validation', invalidOk ? ['422 blocked', 'green'] : (C === 'burst-500' && !burstOk ? ['429 flood', 'red'] : ['watching', 'purple']), 'kube-apiserver handling CR validation, /status, and Watch fan-out.'),
    N('cr', 163, 248, 'hex', (C === 'invalid-cr' && !invalidOk) ? 'coral' : (delOk ? 'yellow' : 'lavender'), C === 'delete-db' ? (delOk ? 'Terminating CR' : 'CR Deleted') : 'Postgres CR', L.statusSub ? '/status isolated' : 'no /status split', delOk ? ['finalizer held', 'warn'] : null, 'Custom Resource in etcd.', C === 'delete-db' && !delOk),
    N('op', 425, 118, 'cube', ((C === 'kill-leader' && !haOk) || (C === 'status-storm' && !stormOk)) ? 'coral' : 'mint', haOk ? 'Op-1 (Leader)' : 'Operator Pod', L.splitCache ? 'Split Cache ON' : 'Direct Poll ⚠', haOk ? ['Lease won ✓', 'green'] : (C === 'kill-leader' && !haOk ? ['OOM DOWN', 'red'] : (C === 'status-storm' && !stormOk ? ['100% CPU!', 'red'] : (burstOk ? ['coalesced', 'green'] : ['active', 'green']))), 'Go controller-runtime Manager executing Reconcile().', C === 'kill-leader' && !haOk),
    N('wq', 425, 248, 'stack', ((C === 'status-storm' && !stormOk) || (C === 'burst-500' && !burstOk)) ? 'coral' : (L.predicate ? 'yellow' : 'gray'), L.predicate ? 'Predicate + WQ' : 'Unfiltered WQ', L.backoff ? 'Exp. Backoff' : 'No Backoff ⚠', stormOk ? ['noise dropped', 'green'] : ((C === 'status-storm' && !stormOk) ? ['loop storm!', 'red'] : null), 'Filters Watch events and rate-limits WorkQueue keys.'),
    N('ch', 675, 118, 'stack', L.ownerRefs ? 'mint' : 'gray', 'Deploy + Svc', L.ownerRefs ? 'OwnerRef GC ✓' : 'No OwnerRef', delOk && L.ownerRefs ? ['GC clean ✓', 'green'] : null, 'In-cluster Kubernetes child resources.'),
    N('db', 675, 248, 'cloud', (C === 'delete-db' && !delOk) ? 'coral' : (delOk ? 'gray' : 'sky'), 'AWS RDS DB', (C === 'delete-db' && !delOk) ? 'ORPHANED $$$' : (delOk ? 'Deleted ✓' : (L.finalizers ? 'Finalizer Guard' : 'Unguarded ⚠')), (C === 'delete-db' && !delOk) ? ['ORPHAN $$$', 'red'] : (delOk ? ['0 orphans ✓', 'green'] : null), 'External cloud database.', delOk)
  ];
  const edges = [];
  if (invalidOk) edges.push(E('cr', 'api', 'err', { stop: 0.65 }));
  else if (C === 'invalid-cr') edges.push(E('cr', 'api', 'err'), E('api', 'op', 'err', { count: 3 }));
  else if (C === 'kill-leader' && !haOk) edges.push(E('api', 'op', 'err', { stop: 0.72 }));
  else if (stormOk) edges.push(E('api', 'wq', 'err', { stop: 0.58 }), E('op', 'ch', 'ok', { count: 1 }));
  else if (C === 'status-storm') edges.push(E('api', 'wq', 'err', { count: 3 }), E('wq', 'op', 'err', { count: 3 }), E('op', 'api', 'err', { off: 12, count: 3 }));
  else if (C === 'delete-db' && !delOk) edges.push(E('op', 'db', 'err', { stop: 0.52 }));
  else if (delOk) edges.push(E('cr', 'op', 'watch'), E('op', 'db', 'ok', { count: 3 }), E('op', 'ch', 'ok'));
  else if (C === 'burst-500' && !burstOk) edges.push(E('api', 'wq', 'err', { count: 3 }), E('op', 'api', 'err', { off: 12, count: 3 }));
  else edges.push(E('api', 'wq', 'watch', { count: 3 }), E('wq', 'op', 'act'), E('op', 'ch', 'ok'), E('op', 'db', 'ok'));

  const ok = invalidOk || delOk || stormOk || haOk || burstOk;
  const statusMap = {
    'invalid-cr': ok ? ['● INVALID CR BLOCKED PRE-ETCD', 'CEL / WEBHOOK BLOCKED BAD CR ✓'] : ['● CRASH: INVALID CR IN ETCD', 'ENABLE CEL / VALIDATING WEBHOOK ✕'],
    'delete-db':  ok ? ['● FINALIZER CLEANED AWS RDS', 'ZERO EXTERNAL ORPHANS ✓'] : ['● LEAK: AWS RDS ORPHANED!', 'ENABLE FINALIZERS TO CLEAN CLOUD ✕'],
    'status-storm': ok ? ['● STATUS STORM FILTERED OUT', 'PREDICATE + /STATUS PROTECTED ✓'] : ['● INFINITE RECONCILE STORM!', 'ENABLE PREDICATE & /STATUS ✕'],
    'kill-leader': ok ? ['● STANDBY LEADER PROMOTED', 'HA LEASE FAILOVER IN 14S ✓'] : ['● OUTAGE: LEADER POD OOM!', 'ENABLE LEADER ELECTION LEASE HA ✕'],
    'burst-500': ok ? ['● 500 CR BURST COALESCED', 'CACHE + WORKQUEUE ABSORBED ✓'] : ['● API SERVER 429 THROTTLED', 'ENABLE SPLIT CACHE + BACKOFF ✕']
  };
  const [statusTxt, bannerTxt] = statusMap[C];
  return {
    zones, nodes, edges, statusTxt, statusCol: ok ? 'var(--ok)' : 'var(--danger)',
    trace: { title: 'OPERATOR LAB TELEMETRY', rows: [['Guardrails', `${Object.values(L).filter(Boolean).length} / ${LAB_FEATURES.length}`], ['Fault Test', C], ['Result', ok ? 'Protected ✓' : 'Vulnerable ✕']], banner: [bannerTxt, ok ? 'green' : 'red'] }
  };
}

function buildLabScene() {
  const L = state.lab;
  const C = state.labChaos;
  const opScene = buildOperatorChaosScene(L, C);
  if (opScene) return opScene;
  let statusTxt = '● CLUSTER STEADY STATE';
  let statusCol = 'var(--ok)';
  const zones = [
    Z(48, 36, 330, 278, L.haEtcd ? 'HA CONTROL PLANE (3-NODE RAFT)' : 'SINGLE CONTROL PLANE (SPOF)', L.haEtcd ? '#4A7BC7' : '#C93632'),
    Z(410, 36, 360, 278, L.netpol ? 'WORKERS · ZERO-TRUST NETPOL' : 'WORKERS · FLAT NETWORK', L.netpol ? '#1E7E45' : '#A8640C')
  ];

  const loadHigh = (state.labLoad >= 7);
  const cpDead = (C === 'kill-cp' && !L.haEtcd);
  const cpSurvived = (C === 'kill-cp' && L.haEtcd);
  const rootBlocked = (C === 'root-pod' && (L.psa || L.cel));
  const rootBreach = (C === 'root-pod' && !L.psa && !L.cel);
  const cveBlocked = (C === 'cve-image' && L.cel);
  const cveBreach = (C === 'cve-image' && !L.cel);
  const scanBlocked = (C === 'lateral-scan' && L.netpol);
  const scanBreach = (C === 'lateral-scan' && !L.netpol);
  const spikeOk = ((C === 'traffic-spike' || loadHigh) && L.karpenter && C !== 'worker-loss');
  const spikeFail = ((C === 'traffic-spike' || loadHigh) && !L.karpenter && C === 'traffic-spike') || (loadHigh && !L.karpenter && C === 'normal');
  const workerOk = (C === 'worker-loss' && L.karpenter && L.haEtcd);
  const workerFail = (C === 'worker-loss' && !(L.karpenter && L.haEtcd));
  const driftHealed = (C === 'manual-drift' && L.gitops);
  const driftFail = (C === 'manual-drift' && !L.gitops);

  const nodes = [
    N('api', 155, 118, 'hex', cpDead ? 'gray' : 'sky', 'API + Gates',
      (L.psa || L.cel) ? 'PSA + CEL ON' : 'no admission',
      (rootBlocked || cveBlocked) ? ['✗ BLOCKED', 'green'] : (cpDead ? ['✗ DOWN', 'red'] : ['✓ :6443', 'green']),
      'kube-apiserver verifying RBAC, Pod Security Admission, and CEL policies before etcd writes.', cpDead),
    N('et', 295, 240, 'cyl', cpDead ? 'gray' : 'lavender', L.haEtcd ? 'etcd (3x)' : 'etcd (1x)',
      cpSurvived ? '2/3 Quorum OK' : (cpDead ? 'OUTAGE' : (L.haEtcd ? 'Raft HA' : 'SPOF ⚠')),
      cpSurvived ? ['✓ 2/3 alive', 'green'] : (cpDead ? ['✗ dead', 'red'] : null),
      'Cluster Raft state store holding all Kubernetes objects and secrets.', cpDead),
    N('git', 115, 250, 'cube', L.gitops ? 'mint' : 'gray', L.gitops ? 'ArgoCD' : 'Manual CLI',
      L.gitops ? 'selfHeal: ON' : 'no GitOps',
      driftHealed ? ['⚡ healed', 'green'] : (driftFail ? ['⚠ DRIFT', 'red'] : null),
      'Continuous GitOps controller reconciling Git HEAD against cluster reality.'),
    N('app', 525, 118, 'cluster', (spikeFail || rootBreach || cveBreach || workerFail) ? 'coral' : 'mint',
      spikeOk ? `App (${Math.max(6, state.labLoad * 2)}x Spot)` : (workerOk ? 'App (AZ Heal ✓)' : (driftFail ? 'App (1x!)' : `App Pods (${Math.min(6, state.labLoad + 2)}x)`)),
      spikeFail ? '98% CPU 503' : (workerFail ? 'AZ Lost · Pending!' : (rootBreach ? 'UID 0 BREACH!' : (cveBreach ? ':latest UNVERIFIED!' : (spikeOk ? 'Karpenter Spot' : 'Healthy')))),
      spikeFail ? ['🔥 overloaded', 'red'] : (workerFail ? ['⚠ Pending!', 'red'] : (rootBreach ? ['☠ root shell', 'red'] : (cveBreach ? ['⚠ CVE Risk', 'red'] : ((spikeOk || workerOk) ? ['✓ auto-scaled', 'green'] : (driftFail ? ['⚠ drifted', 'red'] : ['✓ Ready', 'green']))))),
      'Production application Deployments, Services, and Karpenter Spot compute capacity.'),
    N('db', 675, 240, 'cyl', scanBreach ? 'coral' : 'lavender', 'Prod DB',
      scanBlocked ? 'NetPol shielded' : (scanBreach ? 'EXPOSED!' : ':5432'),
      scanBlocked ? ['🔒 DROP ✕', 'green'] : (scanBreach ? ['⚠ SCANNED', 'red'] : null),
      'Sensitive production PostgreSQL database protected by east-west NetworkPolicies.'),
    N('att', 495, 250, C === 'normal' ? 'shield' : 'pod',
      C === 'normal' ? (L.falco ? 'teal' : 'gray') : (cveBlocked ? 'mint' : 'coral'),
      C === 'root-pod' ? 'Root Pod' : (C === 'lateral-scan' ? 'Rogue Pod' : (C === 'cve-image' ? 'Pod :latest' : (C === 'worker-loss' ? 'Failed AZ-B' : (L.falco ? 'Falco eBPF' : 'No Sensor')))),
      C === 'root-pod' ? 'privileged:true' : (C === 'lateral-scan' ? 'scanning :5432' : (C === 'cve-image' ? 'mutable digest' : (C === 'worker-loss' ? 'NotReady Node' : (L.falco ? 'watching' : 'blind')))),
      C === 'normal' ? (L.falco ? ['✓ eBPF', 'green'] : null) : ((rootBlocked || scanBlocked || cveBlocked || workerOk) ? ['✗ contained', 'green'] : ['⚠ active', 'red']),
      'Falco runtime eBPF threat sensor or simulated fault/attack vector.')
  ];

  const edges = [];
  if (!cpDead) {
    edges.push(E('api', 'et', 'watch'));
    edges.push(E('api', 'app', (spikeFail || workerFail) ? 'err' : 'ok', { count: spikeOk ? 3 : 2 }));
  }
  if (L.gitops) edges.push(E('git', 'api', driftHealed ? 'ok' : 'watch', { count: driftHealed ? 3 : 1 }));
  if (C === 'root-pod') {
    edges.push(rootBlocked ? E('att', 'api', 'err', { stop: 0.72 }) : E('att', 'app', 'err', { count: 3 }));
  } else if (C === 'cve-image') {
    edges.push(cveBlocked ? E('att', 'api', 'err', { stop: 0.72 }) : E('att', 'app', 'err', { count: 3 }));
  } else if (C === 'lateral-scan') {
    edges.push(scanBlocked ? E('att', 'db', 'err', { stop: 0.52 }) : E('att', 'db', 'err', { count: 3 }));
  } else if (C === 'manual-drift') {
    edges.push(E('git', 'app', driftHealed ? 'ok' : 'err', { count: 3 }));
  } else {
    edges.push(E('app', 'db', 'ok'));
  }

  let trace = {
    title: 'LIVE CLUSTER TELEMETRY',
    rows: [['Control Plane', L.haEtcd ? 'HA 3-node ✓' : 'Single SPOF ⚠'], ['Traffic Load', `${state.labLoad}x (${state.labLoad * 120} RPS)`], ['Active Guardrails', `${Object.values(L).filter(Boolean).length} / ${LAB_FEATURES.length}`]],
    banner: ['STEADY STATE HEALTHY ✓', 'green']
  };
  if (cpDead) { statusTxt = '● CONTROL PLANE OUTAGE'; statusCol = 'var(--danger)'; trace.banner = ['OUTAGE: ENABLE HA ETCD ✕', 'red']; }
  else if (cpSurvived) { statusTxt = '● SURVIVED CP NODE LOSS'; trace.banner = ['RAFT 2/3 QUORUM SURVIVED ✓', 'green']; }
  else if (rootBlocked) { statusTxt = '● ROOT POD BLOCKED BY PSA/CEL'; trace.banner = ['403 ADMISSION BLOCKED ✓', 'green']; }
  else if (rootBreach) { statusTxt = '● BREACH: PRIVILEGED ROOT POD!'; statusCol = 'var(--danger)'; trace.banner = ['BREACH: ENABLE PSA / CEL ✕', 'red']; }
  else if (cveBlocked) { statusTxt = '● :LATEST IMAGE BLOCKED BY CEL'; trace.banner = ['422 IMMUTABLE TAG ENFORCED ✓', 'green']; }
  else if (cveBreach) { statusTxt = '● RISK: UNVERIFIED :LATEST POD'; statusCol = 'var(--danger)'; trace.banner = ['RISK: ENABLE CEL POLICY ✕', 'red']; }
  else if (scanBlocked) { statusTxt = '● LATERAL SCAN DROPPED'; trace.banner = ['NETPOL BLOCKED LATERAL SCAN ✓', 'green']; }
  else if (scanBreach) { statusTxt = '● BREACH: DB PORT SCANNED!'; statusCol = 'var(--danger)'; trace.banner = ['EXPOSED: ENABLE NETPOL ✕', 'red']; }
  else if (workerOk) { statusTxt = '● AZ LOSS HEALED BY KARPENTER'; trace.banner = ['RESCHEDULED TO HEALTHY AZ ✓', 'green']; }
  else if (workerFail) { statusTxt = '● DEGRADED: WORKER PODS PENDING'; statusCol = 'var(--danger)'; trace.banner = ['ENABLE HA ETCD + KARPENTER ✕', 'red']; }
  else if (spikeOk) { statusTxt = '● KARPENTER ABSORBED TRAFFIC SURGE'; trace.banner = ['AUTO-SCALED SPOT CAPACITY ✓', 'green']; }
  else if (spikeFail) { statusTxt = '● SATURATED: 98% CPU 503s'; statusCol = 'var(--danger)'; trace.banner = ['OVERLOADED: ENABLE KARPENTER', 'red']; }
  else if (driftHealed) { statusTxt = '● ARGOCD SELF-HEALED DRIFT'; trace.banner = ['DRIFT REVERTED TO GIT ✓', 'green']; }
  else if (driftFail) { statusTxt = '● UNDETECTED CONFIG DRIFT'; statusCol = 'var(--warn)'; trace.banner = ['DRIFTED: ENABLE GITOPS ⚠', 'warn']; }

  return { zones, nodes, edges, trace, statusTxt, statusCol };
}

function renderDesignLab() {
  const L = state.lab;
  const C = state.labChaos;
  const metaMap = (typeof LAB_FEATURE_META !== 'undefined') ? LAB_FEATURE_META : {};
  const visibleFeatures = LAB_FEATURES.filter(f => {
    if (state.labGroup === 'ALL') return true;
    const grp = metaMap[f.key]?.group || 'cluster';
    return grp === state.labGroup;
  });

  document.getElementById('labToggles').innerHTML = visibleFeatures.map(f => {
    const m = metaMap[f.key] || {};
    const isPeek = state.labPeekKey === f.key;
    return `
      <div class="toggle-wrap-card">
        <div class="toggle-item ${L[f.key] ? 'on' : ''}" onclick="toggleLabFeature('${f.key}')">
          <div class="toggle-info">
            <div class="toggle-meta-row">
              ${m.cert ? `<span class="toggle-cert">${m.cert}</span>` : ''}
              <span class="toggle-name">${f.name}</span>
            </div>
            <span class="toggle-sub">${f.sub}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            ${m.plain ? `<button type="button" class="toggle-peek-btn ${isPeek ? 'open' : ''}" onclick="event.stopPropagation(); toggleLabPeek('${f.key}')">YAML</button>` : ''}
            <span class="switch-pill"></span>
          </div>
        </div>
        ${m.plain ? `
          <div class="toggle-peek-drawer ${isPeek ? 'open' : ''}">
            <div>${escapeHtml(m.plain)}</div>
            <div class="step-yaml-box" style="margin:0;">
              <div class="step-yaml-head">
                <span>Guardrail Snippet</span>
                <button type="button" class="step-yaml-copy" onclick="copyText(this, ${JSON.stringify(m.yaml || '').replace(/"/g, '&quot;')})">Copy</button>
              </div>
              <pre class="step-yaml-pre">${escapeHtml(m.yaml || '')}</pre>
            </div>
          </div>` : ''}
      </div>
    `;
  }).join('');

  const loadSlider = document.getElementById('labLoadSlider');
  const loadBadge = document.getElementById('labLoadBadge');
  const activeCountEl = document.getElementById('labActiveCount');
  if (loadSlider) loadSlider.value = String(state.labLoad);
  if (loadBadge) loadBadge.textContent = `${state.labLoad}x · ${state.labLoad * 120} RPS`;
  const totalActive = LAB_FEATURES.filter(f => L[f.key]).length;
  if (activeCountEl) activeCountEl.textContent = `${totalActive} / ${LAB_FEATURES.length} ON`;

  let sec = 0, rel = 0, plat = 0;
  LAB_FEATURES.forEach(f => {
    if (L[f.key]) { sec += f.sec; rel += f.rel; plat += f.plat; }
  });
  const setGauge = (valId, barId, score) => {
    const capped = Math.min(100, score);
    document.getElementById(valId).textContent = `${capped}%`;
    const bar = document.getElementById(barId);
    bar.style.width = `${capped}%`;
    bar.style.background = capped >= 75 ? '#59C26D' : (capped >= 40 ? '#F2B572' : '#EE9892');
  };
  setGauge('gSecVal', 'gSecBar', sec);
  setGauge('gRelVal', 'gRelBar', rel);
  setGauge('gPlatVal', 'gPlatBar', plat);

  // 4-Metric Live Telemetry Strip
  const tel = computeLabTelemetry(L, C, state.labLoad);
  const telRow = document.getElementById('labTelemetryRow');
  if (telRow) {
    telRow.innerHTML = `
      <div class="tel-card"><span class="tel-lbl">API SERVER LOAD</span><span class="tel-val ${tel.apiTone}">${escapeHtml(tel.apiVal)}</span><span class="tel-sub">${escapeHtml(tel.apiSub)}</span></div>
      <div class="tel-card"><span class="tel-lbl">COMPUTE &amp; CPU</span><span class="tel-val ${tel.capTone}">${escapeHtml(tel.capVal)}</span><span class="tel-sub">${escapeHtml(tel.capSub)}</span></div>
      <div class="tel-card"><span class="tel-lbl">BLAST RADIUS</span><span class="tel-val ${tel.blastTone}">${escapeHtml(tel.blastVal)}</span><span class="tel-sub">${escapeHtml(tel.blastSub)}</span></div>
      <div class="tel-card"><span class="tel-lbl">CLUSTER GRADE</span><span class="tel-val ${tel.gradeTone}">${escapeHtml(tel.grade)}</span><span class="tel-sub">${tel.activeCount} / ${LAB_FEATURES.length} Guardrails ON</span></div>
    `;
  }

  // Guided Architecture Missions
  if (typeof LAB_MISSIONS !== 'undefined') {
    const solvedCount = LAB_MISSIONS.filter(m => m.check(L)).length;
    const prog = document.getElementById('labMissionProgress');
    if (prog) prog.textContent = `${solvedCount} / ${LAB_MISSIONS.length} Solved`;
    const mGrid = document.getElementById('labMissionsGrid');
    if (mGrid) {
      mGrid.innerHTML = LAB_MISSIONS.map(m => {
        const solved = m.check(L);
        return `
          <button type="button" class="mission-card ${solved ? 'solved' : ''} ${state.labMissionId === m.id ? 'active' : ''}" onclick="startLabMission('${m.id}')">
            <div class="mission-top">
              <span class="cert-badge cert-${m.cert}">${m.cert}</span>
              <span style="font-family:var(--font-mono);font-size:10px;font-weight:800;color:${solved ? 'var(--ok)' : 'var(--muted)'};">${solved ? '✓ SOLVED' : 'Test →'}</span>
            </div>
            <div class="mission-title">${escapeHtml(m.title)}</div>
            <div class="mission-goal">${escapeHtml(m.goal)}</div>
          </button>
        `;
      }).join('');
    }
  }

  document.querySelectorAll('#labChaosBtns .chaos-btn').forEach(b => {
    b.classList.toggle('active-chaos', b.dataset.chaos === C);
  });

  const scene = buildLabScene();
  renderIsoScene('labSvg', scene, true);
  document.getElementById('labTraceDock').innerHTML = renderTraceDockHtml(scene.trace);
  const chip = document.getElementById('labStatusChip');
  chip.textContent = scene.statusTxt;
  chip.style.color = scene.statusCol;

  // Incident Deep-Dive Explainer Panel
  const expCard = document.getElementById('labExplainerCard');
  if (expCard && typeof LAB_SCENARIOS !== 'undefined') {
    const sc = LAB_SCENARIOS[C] || LAB_SCENARIOS.normal;
    const isOk = isLabScenarioProtected(L, C);
    const missing = (sc.req || []).filter(k => !L[k]);
    const fixKeys = (sc.altReq && !(L.psa || L.cel)) ? sc.altReq : missing;
    const stepsHtml = (typeof sc.steps === 'function' ? sc.steps(L) : []).map(([st, comp, desc]) => `
      <div class="causal-step">
        <span class="causal-stage">${escapeHtml(st)}</span>
        <span class="causal-comp">${escapeHtml(comp)}</span>
        <span class="causal-desc">${escapeHtml(desc)}</span>
      </div>
    `).join('');

    expCard.innerHTML = `
      <div class="exp-head">
        <div>
          <div class="lab-panel-title" style="margin-bottom:3px;">Incident Walkthrough &amp; Root-Cause Inspector</div>
          <div style="font-weight:800;font-size:14.5px;">${escapeHtml(sc.title)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="exp-status-pill ${C === 'normal' ? 'info' : (isOk ? 'ok' : 'bad')}">${C === 'normal' ? 'BASELINE HEALTHY' : (isOk ? 'PROTECTED / SURVIVED ✓' : 'VULNERABLE / INCIDENT ✕')}</span>
          <div class="exp-tabs">
            <button type="button" class="btn btn-sm ${state.labInspectorTab === 'flow' ? 'btn-mint' : ''}" onclick="setLabInspectorTab('flow')">🧭 How It Works</button>
            <button type="button" class="btn btn-sm ${state.labInspectorTab === 'yaml' ? 'btn-mint' : ''}" onclick="setLabInspectorTab('yaml')">📄 YAML &amp; kubectl Fix</button>
          </div>
        </div>
      </div>
      ${state.labInspectorTab === 'yaml' ? `
        <div class="step-yaml-box" style="margin:0;">
          <div class="step-yaml-head">
            <span>kubectl Inspection Command</span>
            <button type="button" class="step-yaml-copy" onclick="copyText(this, ${JSON.stringify(sc.kubectl).replace(/"/g, '&quot;')})">Copy</button>
          </div>
          <pre class="step-yaml-pre">${escapeHtml(sc.kubectl)}</pre>
        </div>
        <div class="step-yaml-box" style="margin:0;">
          <div class="step-yaml-head">
            <span>Production Guardrail Manifest / Code</span>
            <button type="button" class="step-yaml-copy" onclick="copyText(this, ${JSON.stringify(sc.yamlFix).replace(/"/g, '&quot;')})">Copy</button>
          </div>
          <pre class="step-yaml-pre">${escapeHtml(sc.yamlFix)}</pre>
        </div>
      ` : `
        <div style="font-size:12.6px;line-height:1.5;color:var(--ink);">${escapeHtml(isOk ? sc.okText : sc.failText)}</div>
        <div class="exp-layman"><strong>💡 In Simple Terms:</strong> ${escapeHtml(sc.layman)}</div>
        <div class="causal-steps">${stepsHtml}</div>
        ${(!isOk && fixKeys.length) ? `
          <div class="fix-bar">
            <span style="font-family:var(--font-mono);font-size:10.5px;font-weight:800;color:#7C1B18;">ONE-CLICK REMEDIATION:</span>
            ${fixKeys.map(k => {
              const fn = LAB_FEATURES.find(x => x.key === k)?.name || k;
              return `<button type="button" class="btn btn-sm fix-chip-btn" onclick="fixLabGuardrails(['${k}'])">⚡ Enable ${escapeHtml(fn)}</button>`;
            }).join('')}
            ${fixKeys.length > 1 ? `<button type="button" class="btn btn-sm fix-chip-btn" onclick="fixLabGuardrails(${JSON.stringify(fixKeys).replace(/"/g, '&quot;')})">★ Enable All Required</button>` : ''}
          </div>` : ''}
      `}
    `;
  }
}

/* =========================================================================
   CHEATSHEETS VIEW
   ========================================================================= */
function setSheetFilter(cert) {
  state.sheetFilter = cert;
  document.querySelectorAll('#sheetFilterPills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.scert === cert);
  });
  renderCheatsheets();
}

function renderCheatsheets() {
  const grid = document.getElementById('cheatsheetsGrid');
  const filtered = CHEATSHEETS.filter(s => state.sheetFilter === 'ALL' || s.certs.includes(state.sheetFilter));
  grid.innerHTML = filtered.map(sheet => {
    const realIdx = CHEATSHEETS.indexOf(sheet);
    if (sheet.isMatrix || sheet.isTable) {
      return `
        <article class="sheet-card">
          <div class="sheet-head">
            <span class="sheet-title">${sheet.title}</span>
            <div style="display:flex;gap:4px;align-items:center;">
              ${sheet.certs.map(c => `<span class="cert-badge cert-${c}">${c}</span>`).join('')}
              ${sheet.code ? `<button class="btn btn-sm" onclick="copyCheatsheet(${realIdx})">Copy</button>` : ''}
            </div>
          </div>
          <div style="overflow-x:auto;">
            <table class="matrix-table">
              <thead><tr>${(sheet.headers || ['Exam', 'Core Domains', 'Course Modules']).map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
              <tbody>
                ${sheet.rows.map(cols => `
                  <tr>
                    ${cols.map((val, ci) => {
                      if (ci === 0 && sheet.isMatrix) return `<td><span class="cert-badge cert-${val}">${val}</span></td>`;
                      if (ci === 0) return `<td style="font-family:var(--font-mono);font-weight:700;">${escapeHtml(val)}</td>`;
                      return `<td style="${ci === cols.length - 1 ? 'font-family:var(--font-mono);font-size:10.8px;' : ''}">${escapeHtml(val)}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </article>
      `;
    }
    return `
      <article class="sheet-card">
        <div class="sheet-head">
          <span class="sheet-title">
            ${sheet.title}
            ${sheet.certs.map(c => `<span class="cert-badge cert-${c}">${c}</span>`).join('')}
          </span>
          <button class="btn btn-sm" onclick="copyCheatsheet(${realIdx})">Copy</button>
        </div>
        <pre class="sheet-pre">${escapeHtml(sheet.code)}</pre>
      </article>
    `;
  }).join('');
}

function copyCheatsheet(idx) {
  const text = CHEATSHEETS[idx]?.code;
  if (text) copyString(text, 'Manifest / CLI snippet copied!');
}

function copyText(btn, text) {
  copyString(text, 'Copied to clipboard!');
  if (btn) {
    const old = btn.textContent;
    btn.textContent = 'Copied ✓';
    setTimeout(() => { btn.textContent = old; }, 1300);
  }
}

function copyString(text, toastMsg) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(toastMsg)).catch(() => fallbackCopy(text, toastMsg));
  } else {
    fallbackCopy(text, toastMsg);
  }
}

function fallbackCopy(text, toastMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(toastMsg);
  } catch (_) {
    showToast('Copy failed — select and copy manually.');
  }
  document.body.removeChild(ta);
}

/* =========================================================================
   SEARCH MODAL (⌘K) & GLOBAL NAVIGATION / SHORTCUTS
   ========================================================================= */
function openSearchModal() {
  document.getElementById('searchModal').classList.add('open');
  const inp = document.getElementById('searchInput');
  inp.value = '';
  inp.focus();
  updateSearch('');
}

function closeSearchModal() {
  document.getElementById('searchModal').classList.remove('open');
}

function updateSearch(raw) {
  const q = raw.trim().toLowerCase();
  const hits = [];
  Object.values(LESSONS).forEach(l => {
    if (!q || l.title.toLowerCase().includes(q) || l.subtitle.toLowerCase().includes(q) || l.certs.some(c => c.toLowerCase().includes(q))) {
      hits.push({ lessonId: l.id, stepIdx: 0, title: l.title, sub: l.subtitle, badge: l.certs[0] });
    }
    if (q) {
      l.steps.forEach((st, sIdx) => {
        if (st.title.toLowerCase().includes(q) || st.short.toLowerCase().includes(q) || st.body.join(' ').toLowerCase().includes(q) || (st.yaml || '').toLowerCase().includes(q)) {
          hits.push({ lessonId: l.id, stepIdx: sIdx, title: `${l.title} -> ${st.short}`, sub: st.title, badge: `Step ${sIdx + 1}` });
        }
      });
    }
  });
  state.searchMatches = hits.slice(0, 16);
  state.searchSelected = 0;
  renderSearchResults();
}

function renderSearchResults() {
  const box = document.getElementById('searchResults');
  if (!state.searchMatches.length) {
    box.innerHTML = `<div style="padding:18px;text-align:center;font-family:var(--font-mono);font-size:12px;color:var(--muted);">No Kubernetes concepts matched.</div>`;
    return;
  }
  box.innerHTML = state.searchMatches.map((m, i) => `
    <button class="search-item ${i === state.searchSelected ? 'selected' : ''}" onclick="pickSearch(${i})">
      <div style="min-width:0;">
        <div class="search-item-title">${escapeHtml(m.title)}</div>
        <div class="search-item-sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(m.sub)}</div>
      </div>
      <span class="kbd" style="flex-shrink:0;">${m.badge}</span>
    </button>
  `).join('');
}

function pickSearch(idx) {
  const m = state.searchMatches[idx];
  if (!m) return;
  closeSearchModal();
  selectLesson(m.lessonId, m.stepIdx);
}

function setResourceMode(mode) {
  state.resourceMode = mode;
  document.querySelectorAll('#resourceModePills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.rmode === mode);
  });
  renderResourcesPage();
}

function setResourceCert(cert) {
  state.resourceCert = cert;
  document.querySelectorAll('#resourceCertPills .cert-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.rcert === cert);
  });
  renderResourcesPage();
}

function setResourceSearch(q) {
  state.resourceSearch = q.trim().toLowerCase();
  renderResourcesPage();
}

function openLessonFromResource(lessonId) {
  if (!LESSONS[lessonId]) return;
  selectLesson(lessonId, 0);
  switchTab('learn');
}

function renderResourcesPage() {
  const box = document.getElementById('resourcesContent');
  const countEl = document.getElementById('resourceResultCount');
  if (!box) return;
  const q = state.resourceSearch;
  const cert = state.resourceCert;

  const avatarStyles = {
    kubesimplify: ['#D7F4EE', 'KS'], varjosh: ['#DCEEFD', 'VJ'], killershell: ['#FCE0DE', 'K$'],
    learnwithgvr: ['#ECE4FD', 'GVR'], cybersecure86: ['#FAD6D4', 'CS'], viveksinghggits: ['#FFF5CC', 'VS'],
    ardanlabs: ['#FDE9D1', 'AL'], freecodecamp: ['#E1F5D6', 'fCC'], cncf: ['#DCEEFD', 'CNCF'],
    linuxfoundation: ['#ECE4FD', 'LF'], piyush: ['#D9F2C9', 'TP'], beau: ['#FEF0BF', 'BC'], kodekloud: ['#D7F4EE', 'KK']
  };

  if (state.resourceMode === 'channels') {
    const channels = (typeof CURATED_YOUTUBE_CHANNELS !== 'undefined' ? CURATED_YOUTUBE_CHANNELS : []).filter(ch => {
      const matchCert = cert === 'ALL' || ch.certs.includes(cert);
      const hay = `${ch.name} ${ch.handle} ${ch.specialty} ${ch.summary} ${ch.featured.map(f => f[0] + ' ' + (f[2] || '')).join(' ')}`.toLowerCase();
      return matchCert && (!q || hay.includes(q));
    });
    if (countEl) countEl.textContent = `Showing ${channels.length} YouTube ${channels.length === 1 ? 'channel' : 'channels'}`;
    if (!channels.length) {
      box.innerHTML = `<div class="practice-card" style="text-align:center;color:var(--muted);font-family:var(--font-mono);font-size:12px;">No matching YouTube channels found.</div>`;
      return;
    }
    box.innerHTML = `<div class="channels-grid">${channels.map(ch => {
      const [bg, mono] = avatarStyles[ch.id] || ['#DCEEFD', ch.name.slice(0, 2).toUpperCase()];
      return `
      <article class="channel-card">
        <div class="channel-head">
          <div class="channel-id-wrap">
            <div class="channel-avatar" style="background:${bg};">${mono}</div>
            <div style="min-width:0;">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:3px;">
                ${ch.certs.map(c => `<span class="cert-badge cert-${c}">${c}</span>`).join('')}
                <span class="channel-handle">${escapeHtml(ch.handle)}</span>
              </div>
              <h2 style="font-size:16px;font-weight:800;letter-spacing:-0.015em;line-height:1.25;">${escapeHtml(ch.name)}</h2>
            </div>
          </div>
          <a class="btn btn-mint btn-sm" href="${ch.url}" target="_blank" rel="noopener noreferrer" style="flex-shrink:0;text-decoration:none;">▶ Channel ↗</a>
        </div>
        <div class="channel-spec">${escapeHtml(ch.specialty)}</div>
        <div class="channel-desc">${escapeHtml(ch.summary)}</div>
        <div class="channel-featured-col">
          ${ch.featured.map(([lbl, url, sum]) => `
            <div class="ref-link-wrap">
              <a class="ref-link-item" href="${url}" target="_blank" rel="noopener noreferrer"><span>▶ ${escapeHtml(lbl)}</span><span>↗</span></a>
              ${sum ? `<div class="ref-link-summary">${escapeHtml(sum)}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ${ch.relatedLessons?.length ? `
          <div class="channel-lesson-pills">
            <span style="font-family:var(--font-mono);font-size:9.5px;font-weight:700;color:var(--muted);">LESSONS:</span>
            ${ch.relatedLessons.filter(id => LESSONS[id]).map(id =>
              `<button type="button" class="lesson-jump-pill" onclick="openLessonFromResource('${id}')">${escapeHtml(LESSONS[id].title)} →</button>`
            ).join('')}
          </div>` : ''}
      </article>
    `;
    }).join('')}</div>`;
    return;
  }

  if (state.resourceMode === 'talks') {
    const lessonByUrl = {};
    Object.values(LESSONS).forEach(l => {
      const ytCur = (typeof LESSON_YT_OVERRIDES !== 'undefined' && LESSON_YT_OVERRIDES[l.id]) || [];
      ytCur.forEach(item => {
        if (item && item[1] && !lessonByUrl[item[1]]) lessonByUrl[item[1]] = l;
      });
    });
    const rawTalks = (typeof TOP_YT !== 'undefined' ? Object.values(TOP_YT) : []).filter(v =>
      v && v[1] && (String(v[1]).includes('watch?v=') || String(v[1]).includes('playlist?list='))
    );
    const filteredTalks = rawTalks.filter(([lbl, url, sum]) => {
      const linked = lessonByUrl[url];
      const matchCert = cert === 'ALL' || !linked || linked.certs.includes(cert);
      const hay = `${lbl} ${sum || ''} ${linked ? linked.title : ''}`.toLowerCase();
      return matchCert && (!q || hay.includes(q));
    });
    if (countEl) countEl.textContent = `Showing ${filteredTalks.length} direct videos`;
    if (!filteredTalks.length) {
      box.innerHTML = `<div class="practice-card" style="text-align:center;color:var(--muted);font-family:var(--font-mono);font-size:12px;">No matching talks found.</div>`;
      return;
    }
    box.innerHTML = `<div class="talks-grid">${filteredTalks.map(([lbl, url, sum]) => {
      const linked = lessonByUrl[url];
      return `
        <article class="talk-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">
            <span class="cert-badge ${linked ? `cert-${linked.certs[0]}` : 'cert-CNPE'}">${linked ? linked.certs[0] : 'CNCF'}</span>
            ${linked ? `<button type="button" class="lesson-jump-pill" onclick="openLessonFromResource('${linked.id}')">${escapeHtml(linked.title)} →</button>` : ''}
          </div>
          <a class="talk-title-link" href="${url}" target="_blank" rel="noopener noreferrer"><span>▶ ${escapeHtml(lbl)}</span><span>↗</span></a>
          <div class="ref-link-summary">${escapeHtml(sum || '')}</div>
          <div class="talk-footer">
            <span style="font-family:var(--font-mono);font-size:9.8px;color:var(--muted);">Verified YouTube Resource</span>
            <a class="btn btn-sm" href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">Watch ↗</a>
          </div>
        </article>
      `;
    }).join('')}</div>`;
    return;
  }

  // Official Docs & References aggregated from LESSON_REFS
  const groups = Object.values(MODULES).map(mod => {
    const items = [];
    const seenDoc = new Set();
    (mod.lessons || []).forEach(lid => {
      const l = LESSONS[lid];
      const meta = (typeof LESSON_REFS !== 'undefined' && LESSON_REFS[lid]) || {};
      if (!l) return;
      if (cert !== 'ALL' && !l.certs.includes(cert)) return;
      (meta.refs || []).forEach(([rlbl, rurl]) => {
        const hay = `${mod.title} ${l.title} ${rlbl}`.toLowerCase();
        if (q && !hay.includes(q)) return;
        if (seenDoc.has(rurl)) return;
        seenDoc.add(rurl);
        items.push({ lbl: rlbl, url: rurl, lessonTitle: l.title, lessonId: lid });
      });
    });
    return { mod, items };
  }).filter(g => g.items.length > 0);

  const totalRefs = groups.reduce((s, g) => s + g.items.length, 0);
  if (countEl) countEl.textContent = `Showing ${totalRefs} official refs across ${groups.length} modules`;
  if (!groups.length) {
    box.innerHTML = `<div class="practice-card" style="text-align:center;color:var(--muted);font-family:var(--font-mono);font-size:12px;">No matching documentation links found.</div>`;
    return;
  }

  box.innerHTML = `<div class="docs-grid">${groups.map(g => `
    <article class="channel-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding-bottom:6px;border-bottom:1.2px solid var(--border-soft);">
        <h2 style="font-size:14.5px;font-weight:800;">${escapeHtml(g.mod.title)}</h2>
        <span class="badge-chip">${g.items.length} refs</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${g.items.slice(0, 8).map(it => `
          <div class="ref-link-wrap">
            <a class="ref-link-item" href="${it.url}" target="_blank" rel="noopener noreferrer"><span>📚 ${escapeHtml(it.lbl)}</span><span>↗</span></a>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:3px;">
              <span class="ref-link-summary">Topic: ${escapeHtml(it.lessonTitle)}</span>
              <button type="button" class="lesson-jump-pill" onclick="openLessonFromResource('${it.lessonId}')">Open →</button>
            </div>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('')}</div>`;
}

function switchTab(tab) {
  stopAutoPlay();
  toggleMobileSidebar(false);
  state.activeTab = tab;
  ['learn', 'practice', 'lab', 'cheatsheets', 'resources'].forEach(t => {
    document.getElementById(`view-${t}`)?.classList.toggle('active', t === tab);
  });
  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  if (tab === 'practice') renderPractice();
  if (tab === 'lab') renderDesignLab();
  if (tab === 'cheatsheets') renderCheatsheets();
  if (tab === 'resources') renderResourcesPage();
}

function toggleMobileSidebar(force) {
  const sb = document.getElementById('leftSidebar');
  const bd = document.getElementById('sidebarBackdrop');
  const open = typeof force === 'boolean' ? force : !sb.classList.contains('open');
  sb.classList.toggle('open', open);
  bd.classList.toggle('open', open);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2100);
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* =========================================================================
   EVENT LISTENERS & INITIALIZATION
   ========================================================================= */
document.getElementById('mobileMenuBtn').addEventListener('click', () => toggleMobileSidebar());
document.getElementById('searchInput').addEventListener('input', e => updateSearch(e.target.value));

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openSearchModal();
    return;
  }
  const modalOpen = document.getElementById('searchModal').classList.contains('open');
  if (modalOpen) {
    if (e.key === 'Escape') closeSearchModal();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.searchSelected = (state.searchSelected + 1) % Math.max(1, state.searchMatches.length);
      renderSearchResults();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.searchSelected = (state.searchSelected - 1 + Math.max(1, state.searchMatches.length)) % Math.max(1, state.searchMatches.length);
      renderSearchResults();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pickSearch(state.searchSelected);
    }
    return;
  }

  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (state.activeTab === 'learn') {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextStep(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
    else if (e.key === ' ') { e.preventDefault(); togglePause(); }
    else if (e.key.toLowerCase() === 'r') { e.preventDefault(); replayLearnStep(); }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  try {
    MODULES.forEach(m => m.lessons.forEach(id => { if (LESSONS[id]) LESSONS[id].moduleId = m.id; }));
    loadState();
    addLabLog('info', 'Cluster Design Lab ready — toggle guardrails and inject chaos tests.');
    switchTab('learn');
    renderCurrentLessonStep();
  } catch (err) {
    console.error('Initialization error:', err);
  }
});
