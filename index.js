const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/bfhl', (req, res) => {
  const { data } = req.body;

  // ✏️ CHANGE THESE TO YOUR DETAILS
  const user_id = "ananyasingh_10062005";
  const email_id = "as6838@srmist.edu.in";
  const college_roll_number = "RA2311003010035";

  const validPattern = /^([A-Z])->([A-Z])$/;
  const invalid_entries = [];
  const validEdges = [];
  const seenEdges = new Set();
  const duplicate_edges = [];

  for (let raw of data) {
    const entry = typeof raw === 'string' ? raw.trim() : String(raw);
    if (!validPattern.test(entry)) { invalid_entries.push(entry); continue; }
    if (seenEdges.has(entry)) {
      if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
    } else {
      seenEdges.add(entry);
      validEdges.push(entry);
    }
  }

  const children = {};
  const parentCount = {};

  for (const edge of validEdges) {
    const [p, c] = edge.split('->');
    if (!children[p]) children[p] = [];
    if (parentCount[c] === undefined) {
      parentCount[c] = p;
      children[p].push(c);
    }
    if (!children[c]) children[c] = [];
  }

  const allNodes = new Set([...Object.keys(children), ...Object.keys(parentCount)]);
  const childNodes = new Set(Object.keys(parentCount));
  const roots = [...allNodes].filter(n => !childNodes.has(n)).sort();

  function getComponent(start) {
    const comp = new Set();
    const stack = [start];
    while (stack.length) {
      const n = stack.pop();
      if (comp.has(n)) continue;
      comp.add(n);
      (children[n] || []).forEach(c => stack.push(c));
    }
    return comp;
  }

  function hasCycle(root) {
    const recStack = new Set();
    function dfs(node) {
      recStack.add(node);
      for (const child of (children[node] || [])) {
        if (recStack.has(child)) return true;
        if (dfs(child)) return true;
      }
      recStack.delete(node);
      return false;
    }
    return dfs(root);
  }

  function buildTree(node, ancestors = new Set()) {
    const obj = {};
    for (const child of (children[node] || [])) {
      if (!ancestors.has(child)) obj[child] = buildTree(child, new Set([...ancestors, node]));
    }
    return obj;
  }

  function calcDepth(node, ancestors = new Set()) {
    let max = 0;
    for (const child of (children[node] || [])) {
      if (!ancestors.has(child)) {
        const d = calcDepth(child, new Set([...ancestors, node]));
        if (d > max) max = d;
      }
    }
    return 1 + max;
  }

  const hierarchies = [];
  const processedNodes = new Set();

  for (const root of roots) {
    if (processedNodes.has(root)) continue;
    const comp = getComponent(root);
    comp.forEach(n => processedNodes.add(n));
    if (hasCycle(root)) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      hierarchies.push({ root, tree: { [root]: buildTree(root) }, depth: calcDepth(root) });
    }
  }

  for (const node of allNodes) {
    if (!processedNodes.has(node)) {
      const comp = getComponent(node);
      comp.forEach(n => processedNodes.add(n));
      const compRoot = [...comp].sort()[0];
      hierarchies.push({ root: compRoot, tree: {}, has_cycle: true });
    }
  }

  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);
  let largest_tree_root = '';
  let maxDepth = -1;
  for (const h of nonCyclic) {
    if (h.depth > maxDepth || (h.depth === maxDepth && h.root < largest_tree_root)) {
      maxDepth = h.depth;
      largest_tree_root = h.root;
    }
  }

  res.json({
    user_id, email_id, college_roll_number, hierarchies,
    invalid_entries, duplicate_edges,
    summary: { total_trees: nonCyclic.length, total_cycles: cyclic.length, largest_tree_root }
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});


