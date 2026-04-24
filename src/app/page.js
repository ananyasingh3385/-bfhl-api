"use client";
import { useState } from "react";
import styles from "./page.module.css";

function TreeNode({ label, subtree, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const kids = Object.keys(subtree || {});
  return (
    <div className={styles.treeNode} style={{ marginLeft: depth * 20 }}>
      <span
        className={styles.nodeLabel}
        onClick={() => kids.length && setOpen(!open)}
        style={{ cursor: kids.length ? "pointer" : "default" }}
      >
        {kids.length ? (open ? "▾" : "▸") : "◦"} {label}
      </span>
      {open &&
        kids.map((k) => (
          <TreeNode key={k} label={k} subtree={subtree[k]} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState(
    'A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->H, G->I, hello, 1->2, A->'
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = input.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError("API call failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Node Hierarchy Explorer</h1>
        <p className={styles.subtitle}>SRM Full Stack Challenge · POST /bfhl</p>
      </header>

      <section className={styles.inputSection}>
        <label className={styles.label}>Enter node edges (comma-separated)</label>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="A->B, A->C, B->D, ..."
        />
        <button className={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing…" : "▶ Submit"}
        </button>
      </section>

      {error && <div className={styles.error}>⚠ {error}</div>}

      {result && (
        <section className={styles.results}>
          {/* Identity */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Identity</h2>
            <div className={styles.grid3}>
              <div><span className={styles.tag}>User ID</span><p>{result.user_id}</p></div>
              <div><span className={styles.tag}>Email</span><p>{result.email_id}</p></div>
              <div><span className={styles.tag}>Roll No</span><p>{result.college_roll_number}</p></div>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Summary</h2>
            <div className={styles.grid3}>
              <div><span className={styles.tag}>Trees</span><p className={styles.big}>{result.summary.total_trees}</p></div>
              <div><span className={styles.tag}>Cycles</span><p className={styles.big}>{result.summary.total_cycles}</p></div>
              <div><span className={styles.tag}>Largest Root</span><p className={styles.big}>{result.summary.largest_tree_root}</p></div>
            </div>
          </div>

          {/* Hierarchies */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Hierarchies</h2>
            <div className={styles.hierGrid}>
              {result.hierarchies.map((h) => (
                <div key={h.root} className={`${styles.hierCard} ${h.has_cycle ? styles.cycleCard : ""}`}>
                  <div className={styles.hierHeader}>
                    <strong>Root: {h.root}</strong>
                    {h.has_cycle
                      ? <span className={styles.badge}>⟳ Cycle</span>
                      : <span className={styles.badgeGreen}>Depth {h.depth}</span>
                    }
                  </div>
                  {h.has_cycle
                    ? <p className={styles.cycleMsg}>Cyclic group — no tree structure</p>
                    : <TreeNode label={h.root} subtree={h.tree[h.root]} />
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Invalid & Duplicates */}
          <div className={styles.twoCol}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Invalid Entries</h2>
              {result.invalid_entries.length
                ? result.invalid_entries.map((e) => <code key={e} className={styles.pill}>{e || '""'}</code>)
                : <p className={styles.none}>None</p>}
            </div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Duplicate Edges</h2>
              {result.duplicate_edges.length
                ? result.duplicate_edges.map((e) => <code key={e} className={styles.pillOrange}>{e}</code>)
                : <p className={styles.none}>None</p>}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
