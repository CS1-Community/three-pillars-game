import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Three Pillars — Jordan's AI Paradigm" },
      {
        name: "description",
        content:
          "A WebGL game illustrating Michael I. Jordan's three-pillar paradigm: Computation, Inference, and Economics.",
      },
      { property: "og:title", content: "Three Pillars — Jordan's AI Paradigm" },
      {
        property: "og:description",
        content:
          "Route incoming problems to the right pillar — Computation, Inference, or Economics.",
      },
    ],
  }),
  component: Game,
});

type PillarKey = "C" | "I" | "E";

const PILLARS: Record<
  PillarKey,
  { name: string; subtitle: string; color: number; x: number; key: string }
> = {
  C: {
    name: "Computation",
    subtitle: "algorithms · scale · abstraction",
    color: 0x3b82f6,
    x: -3.2,
    key: "1",
  },
  I: {
    name: "Inference",
    subtitle: "uncertainty · causality · error bars",
    color: 0x10b981,
    x: 0,
    key: "2",
  },
  E: {
    name: "Economics",
    subtitle: "incentives · markets · welfare",
    color: 0xf59e0b,
    x: 3.2,
    key: "3",
  },
};

// Each task has a prompt and the pillar it most belongs to.
const TASKS: { text: string; pillar: PillarKey }[] = [
  { text: "Train a 70B LLM on a GPU cluster", pillar: "C" },
  { text: "Add error bars to a medical prediction", pillar: "I" },
  { text: "Design an auction so bidders are truthful", pillar: "E" },
  { text: "Quantify causal effect of a new drug", pillar: "I" },
  { text: "Shard a graph across 1024 machines", pillar: "C" },
  { text: "Reward data contributors fairly", pillar: "E" },
  { text: "Estimate confidence of a forecast", pillar: "I" },
  { text: "Coordinate strategic ride-share drivers", pillar: "E" },
  { text: "Optimize a transformer attention kernel", pillar: "C" },
  { text: "Detect distribution shift in production", pillar: "I" },
  { text: "Set prices when buyers know more than you", pillar: "E" },
  { text: "Compile a model to run on a phone", pillar: "C" },
  { text: "Bound the false-discovery rate", pillar: "I" },
  { text: "Match doctors to hospitals stably", pillar: "E" },
  { text: "Build a vector index over 1B docs", pillar: "C" },
];

function Game() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [streak, setStreak] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  // Mutable game state held in refs so the animation loop sees latest values.
  const stateRef = useRef({
    score: 0,
    lives: 5,
    streak: 0,
    running: false,
    routePillar: null as PillarKey | null,
  });

  const routeTask = (p: PillarKey) => {
    stateRef.current.routePillar = p;
  };

  useEffect(() => {
    stateRef.current.score = score;
    stateRef.current.lives = lives;
    stateRef.current.streak = streak;
    stateRef.current.running = started && !gameOver;
  }, [score, lives, streak, started, gameOver]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);
    scene.fog = new THREE.Fog(0x0b1020, 10, 30);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.2, 8.5);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 8, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6699ff, 0.4);
    rim.position.set(-6, 3, -4);
    scene.add(rim);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({
        color: 0x0f1530,
        roughness: 0.95,
        metalness: 0,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);

    // Grid
    const grid = new THREE.GridHelper(40, 40, 0x1e2a55, 0x141a35);
    grid.position.y = -0.49;
    scene.add(grid);

    // Pillars
    type PillarMesh = {
      key: PillarKey;
      group: THREE.Group;
      glow: THREE.Mesh;
      baseY: number;
    };
    const pillarMeshes: PillarMesh[] = [];

    (Object.keys(PILLARS) as PillarKey[]).forEach((k) => {
      const p = PILLARS[k];
      const group = new THREE.Group();
      group.position.x = p.x;

      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.7, 2.4, 24),
        new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.35,
          metalness: 0.2,
          emissive: p.color,
          emissiveIntensity: 0.15,
        }),
      );
      body.position.y = 0.7;
      group.add(body);

      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.18, 1.6),
        new THREE.MeshStandardMaterial({
          color: 0xeaeefb,
          roughness: 0.4,
          metalness: 0.3,
        }),
      );
      cap.position.y = 2.0;
      group.add(cap);

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.22, 1.8),
        new THREE.MeshStandardMaterial({
          color: 0xeaeefb,
          roughness: 0.5,
        }),
      );
      base.position.y = -0.4;
      group.add(base);

      // Soft glow disc on top — pulses when you route to this pillar
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(1.1, 32),
        new THREE.MeshBasicMaterial({
          color: p.color,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide,
        }),
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 2.11;
      group.add(glow);

      scene.add(group);
      pillarMeshes.push({ key: k, group, glow, baseY: group.position.y });
    });

    // Falling task object
    type Task = {
      mesh: THREE.Mesh;
      pillar: PillarKey;
      text: string;
      labelEl: HTMLDivElement;
    };
    let current: Task | null = null;

    const labelLayer = document.createElement("div");
    labelLayer.style.cssText =
      "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
    mount.appendChild(labelLayer);

    const makeLabel = (text: string, color: number) => {
      const el = document.createElement("div");
      const hex = "#" + color.toString(16).padStart(6, "0");
      el.style.cssText = `position:absolute;transform:translate(-50%,-50%);background:rgba(15,20,40,0.85);border:1px solid ${hex};color:#eaeefb;padding:6px 10px;border-radius:10px;font:500 13px ui-sans-serif,system-ui;white-space:nowrap;box-shadow:0 6px 24px rgba(0,0,0,0.4);backdrop-filter:blur(4px);`;
      el.textContent = text;
      labelLayer.appendChild(el);
      return el;
    };

    const spawnTask = () => {
      const t = TASKS[Math.floor(Math.random() * TASKS.length)];
      const color = PILLARS[t.pillar].color;
      const geo = new THREE.IcosahedronGeometry(0.42, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.4,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 1.2, 6.5, 0);
      scene.add(mesh);
      current = {
        mesh,
        pillar: t.pillar,
        text: t.text,
        labelEl: makeLabel(t.text, color),
      };
    };

    const removeCurrent = () => {
      if (!current) return;
      scene.remove(current.mesh);
      current.mesh.geometry.dispose();
      (current.mesh.material as THREE.Material).dispose();
      current.labelEl.remove();
      current = null;
    };

    const showFlash = (text: string, ok: boolean) => {
      setFlash({ text, ok });
      window.setTimeout(() => setFlash(null), 700);
    };

    const resolve = (chosen: PillarKey) => {
      if (!current) return;
      const correct = chosen === current.pillar;
      const target = pillarMeshes.find((p) => p.key === chosen)!;
      (target.glow.material as THREE.MeshBasicMaterial).opacity = 0.85;

      if (correct) {
        const s = stateRef.current;
        s.streak += 1;
        const gained = 10 + s.streak * 2;
        s.score += gained;
        setScore(s.score);
        setStreak(s.streak);
        showFlash(`+${gained} · ${PILLARS[chosen].name}`, true);
      } else {
        const s = stateRef.current;
        s.streak = 0;
        s.lives -= 1;
        setLives(s.lives);
        setStreak(0);
        showFlash(
          `Belongs to ${PILLARS[current.pillar].name}`,
          false,
        );
        if (s.lives <= 0) {
          setGameOver(true);
          s.running = false;
        }
      }
      removeCurrent();
    };

    // Project a world point to screen pixels relative to mount
    const project = (v: THREE.Vector3) => {
      const p = v.clone().project(camera);
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h };
    };

    // Pillar name labels under each pillar
    const pillarLabels = pillarMeshes.map((pm) => {
      const meta = PILLARS[pm.key];
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;transform:translate(-50%,0);text-align:center;color:#eaeefb;font:600 14px ui-sans-serif,system-ui;letter-spacing:0.02em;text-shadow:0 2px 8px rgba(0,0,0,0.6);`;
      el.innerHTML = `<div style="color:#${meta.color
        .toString(16)
        .padStart(6, "0")}">${meta.name} <span style="opacity:.55;font-weight:500">[${meta.key}]</span></div><div style="font:400 11px ui-sans-serif,system-ui;opacity:.65;margin-top:2px">${meta.subtitle}</div>`;
      labelLayer.appendChild(el);
      return { el, pm };
    });

    let last = performance.now();
    let spawnTimer = 0;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Pillar gentle bob + glow fade
      pillarMeshes.forEach((pm, i) => {
        pm.group.position.y = pm.baseY + Math.sin(now / 700 + i) * 0.04;
        const g = pm.glow.material as THREE.MeshBasicMaterial;
        if (g.opacity > 0) g.opacity = Math.max(0, g.opacity - dt * 2.2);
      });

      const s = stateRef.current;

      if (s.running) {
        if (!current) {
          spawnTimer -= dt;
          if (spawnTimer <= 0) {
            spawnTask();
            spawnTimer = 0.4;
          }
        } else {
          // Speed grows mildly with score
          const speed = 1.1 + Math.min(2.2, s.score / 120);
          current.mesh.position.y -= speed * dt;
          current.mesh.rotation.x += dt * 1.2;
          current.mesh.rotation.y += dt * 1.6;

          // If routed, snap toward that pillar
          if (s.routePillar) {
            const targetX = PILLARS[s.routePillar].x;
            current.mesh.position.x +=
              (targetX - current.mesh.position.x) * Math.min(1, dt * 8);
          }

          // Label follow
          const screen = project(current.mesh.position.clone().add(
            new THREE.Vector3(0, 0.6, 0),
          ));
          current.labelEl.style.left = `${screen.x}px`;
          current.labelEl.style.top = `${screen.y}px`;

          // Resolve when it reaches pillar tops
          if (current.mesh.position.y <= 2.1) {
            const chosen = s.routePillar;
            if (chosen) {
              resolve(chosen);
            } else {
              // Missed entirely
              s.streak = 0;
              s.lives -= 1;
              setLives(s.lives);
              setStreak(0);
              showFlash("Unrouted — pick 1 / 2 / 3", false);
              if (s.lives <= 0) {
                setGameOver(true);
                s.running = false;
              }
              removeCurrent();
            }
            s.routePillar = null;
          }
        }
      }

      // Update pillar name labels
      pillarLabels.forEach(({ el, pm }) => {
        const screen = project(
          new THREE.Vector3(pm.group.position.x, -0.55, 0),
        );
        el.style.left = `${screen.x}px`;
        el.style.top = `${screen.y}px`;
      });

      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") routeTask("C");
      else if (e.key === "2") routeTask("I");
      else if (e.key === "3") routeTask("E");
    };
    window.addEventListener("keydown", onKey);

    // Click on pillar to route
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      for (const pm of pillarMeshes) {
        const hit = ray.intersectObject(pm.group, true);
        if (hit.length > 0) {
          routeTask(pm.key);
          return;
        }
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      renderer.domElement.removeEventListener("click", onClick);
      removeCurrent();
      pillarLabels.forEach((p) => p.el.remove());
      labelLayer.remove();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const start = () => {
    stateRef.current = {
      score: 0,
      lives: 5,
      streak: 0,
      running: true,
      routePillar: null,
    };
    setScore(0);
    setLives(5);
    setStreak(0);
    setGameOver(false);
    setStarted(true);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b1020] text-[#eaeefb]">
      <div ref={mountRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Three Pillars
          </h1>
          <p className="text-xs text-white/55">
            M. I. Jordan's paradigm · route each problem to its discipline
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <Stat label="Score" value={score} />
          <Stat label="Streak" value={`×${streak}`} />
          <Stat
            label="Lives"
            value={"♥".repeat(Math.max(0, lives)) || "—"}
          />
        </div>
      </div>

      {/* Controls hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-white/55">
        Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">1</kbd>{" "}
        Computation ·{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5">2</kbd> Inference ·{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5">3</kbd> Economics —
        or click a pillar
      </div>

      {/* Flash */}
      {flash && (
        <div
          className={`pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-medium ${
            flash.ok
              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
              : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
          }`}
        >
          {flash.text}
        </div>
      )}

      {/* Start / Game Over overlay */}
      {(!started || gameOver) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b1020]/80 backdrop-blur-sm">
          <div className="max-w-lg rounded-2xl border border-white/10 bg-[#0f1530]/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold">
              {gameOver ? "System collapsed" : "Three Pillars"}
            </h2>
            <p className="mt-2 text-sm text-white/65">
              {gameOver
                ? `Final score: ${score}. A real AI system also fails when one pillar carries weight that belongs to another.`
                : "Jordan argues the future of AI rests on three thinking styles. Problems will fall from the sky — route each to the right pillar."}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <Card color="#3b82f6" name="Computation" hint="scale & algorithms" />
              <Card color="#10b981" name="Inference" hint="uncertainty & cause" />
              <Card color="#f59e0b" name="Economics" hint="incentives & welfare" />
            </div>
            <button
              onClick={start}
              className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#0b1020] transition hover:bg-white/90"
            >
              {gameOver ? "Play again" : "Start"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/45">
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Card({
  color,
  name,
  hint,
}: {
  color: string;
  name: string;
  hint: string;
}) {
  return (
    <div
      className="rounded-lg border border-white/10 p-3"
      style={{ background: `${color}14` }}
    >
      <div className="font-semibold" style={{ color }}>
        {name}
      </div>
      <div className="mt-0.5 text-white/55">{hint}</div>
    </div>
  );
}
