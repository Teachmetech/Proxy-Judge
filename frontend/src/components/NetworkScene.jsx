import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Full-viewport Three.js background: a particle globe with animated
 * "packets" traveling along proxy-route arcs between nodes.
 */
export default function NetworkScene() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030308, 0.055);

        const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
        camera.position.set(0, 0.4, 7.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        const ACCENT = new THREE.Color('#22ffb2');
        const ACCENT_ALT = new THREE.Color('#4d8dff');
        const NODE_COLOR = new THREE.Color('#7a8ba8');

        const RADIUS = 2.6;
        const NODE_COUNT = isMobile ? 500 : 1100;
        const ARC_COUNT = isMobile ? 14 : 26;
        const PACKETS_PER_ARC = 2;

        // Fibonacci sphere distribution for the node cloud
        const nodePositions = new Float32Array(NODE_COUNT * 3);
        const nodePoints = [];
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < NODE_COUNT; i++) {
            const y = 1 - (i / (NODE_COUNT - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const theta = golden * i;
            const p = new THREE.Vector3(Math.cos(theta) * r * RADIUS, y * RADIUS, Math.sin(theta) * r * RADIUS);
            nodePoints.push(p);
            nodePositions.set([p.x, p.y, p.z], i * 3);
        }

        const nodeGeo = new THREE.BufferGeometry();
        nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
        const nodeMat = new THREE.PointsMaterial({
            color: NODE_COLOR,
            size: 0.028,
            transparent: true,
            opacity: 0.75,
            sizeAttenuation: true,
            depthWrite: false,
        });
        group.add(new THREE.Points(nodeGeo, nodeMat));

        // Faint solid core so the far side of the globe reads dimmer
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(RADIUS * 0.985, 48, 48),
            new THREE.MeshBasicMaterial({ color: 0x04060c, transparent: true, opacity: 0.92 })
        );
        group.add(core);

        // Wireframe hint
        const wire = new THREE.Mesh(
            new THREE.SphereGeometry(RADIUS, 28, 28),
            new THREE.MeshBasicMaterial({ color: 0x1c2740, wireframe: true, transparent: true, opacity: 0.14 })
        );
        group.add(wire);

        // Proxy-route arcs between random node pairs
        const curves = [];
        const arcLines = [];
        for (let i = 0; i < ARC_COUNT; i++) {
            const a = nodePoints[Math.floor(Math.random() * nodePoints.length)].clone();
            let b = nodePoints[Math.floor(Math.random() * nodePoints.length)].clone();
            let guard = 0;
            while (a.distanceTo(b) < RADIUS * 0.8 && guard++ < 20) {
                b = nodePoints[Math.floor(Math.random() * nodePoints.length)].clone();
            }
            const mid = a.clone().add(b).multiplyScalar(0.5);
            const lift = 1 + a.distanceTo(b) / (RADIUS * 2.2);
            mid.setLength(RADIUS * lift);
            const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
            curves.push(curve);

            const pts = curve.getPoints(48);
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
                color: i % 3 === 0 ? ACCENT_ALT : ACCENT,
                transparent: true,
                opacity: 0.16,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
            const line = new THREE.Line(geo, mat);
            arcLines.push(line);
            group.add(line);
        }

        // Packets that travel along the arcs
        const packetCount = ARC_COUNT * PACKETS_PER_ARC;
        const packetPositions = new Float32Array(packetCount * 3);
        const packetColors = new Float32Array(packetCount * 3);
        const packetMeta = [];
        for (let i = 0; i < packetCount; i++) {
            const curveIndex = i % ARC_COUNT;
            packetMeta.push({
                curveIndex,
                t: Math.random(),
                speed: 0.0016 + Math.random() * 0.0028,
            });
            const c = curveIndex % 3 === 0 ? ACCENT_ALT : ACCENT;
            packetColors.set([c.r, c.g, c.b], i * 3);
        }
        const packetGeo = new THREE.BufferGeometry();
        packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
        packetGeo.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
        const packetMat = new THREE.PointsMaterial({
            size: 0.09,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
        const packets = new THREE.Points(packetGeo, packetMat);
        group.add(packets);

        // Ambient starfield behind everything
        const STAR_COUNT = isMobile ? 200 : 450;
        const starPositions = new Float32Array(STAR_COUNT * 3);
        for (let i = 0; i < STAR_COUNT; i++) {
            const v = new THREE.Vector3().randomDirection().multiplyScalar(9 + Math.random() * 14);
            starPositions.set([v.x, v.y, v.z], i * 3);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const stars = new THREE.Points(
            starGeo,
            new THREE.PointsMaterial({ color: 0x3a4a6a, size: 0.035, transparent: true, opacity: 0.6, depthWrite: false })
        );
        scene.add(stars);

        group.rotation.z = 0.24;
        group.position.y = isMobile ? -0.4 : 0;

        // Pointer parallax
        const pointer = { x: 0, y: 0 };
        const onPointerMove = (e) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', onPointerMove, { passive: true });

        const onResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', onResize);

        const posAttr = packetGeo.getAttribute('position');
        const tmp = new THREE.Vector3();
        let rafId = 0;

        const tick = (time) => {
            rafId = requestAnimationFrame(tick);

            group.rotation.y = time * 0.00005 * (prefersReducedMotion ? 0 : 1) + pointer.x * 0.12;
            group.rotation.x = Math.sin(time * 0.00008) * 0.05 + pointer.y * 0.08;
            stars.rotation.y = time * 0.00001;

            if (!prefersReducedMotion) {
                for (let i = 0; i < packetCount; i++) {
                    const m = packetMeta[i];
                    m.t += m.speed;
                    if (m.t > 1) m.t = 0;
                    curves[m.curveIndex].getPoint(m.t, tmp);
                    posAttr.setXYZ(i, tmp.x, tmp.y, tmp.z);
                }
                posAttr.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('resize', onResize);
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
