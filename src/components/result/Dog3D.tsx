import { useRef, useState, type ReactNode } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { t } from '@/i18n';
import { gradients, radius, spacing, type } from '@/theme';

// Carga segura de la pila 3D. Si el dispositivo/entorno no la soporta, el
// componente cae a un respaldo sin romper la app.
/* eslint-disable @typescript-eslint/no-require-imports */
let GLView: any;
let Renderer: any;
let THREE: any;
try {
  GLView = require('expo-gl').GLView;
  Renderer = require('expo-three').Renderer;
  THREE = require('three');
} catch {
  /* 3D no disponible */
}
/* eslint-enable @typescript-eslint/no-require-imports */

const GOOD = 0x2fb66a;
const WARN = 0xf0a422;
const BAD = 0xe5484d;

// Zonas de grasa en el espacio del modelo (eje X: cabeza +, cola −).
const ZONES: { pos: [number, number, number]; weight: number }[] = [
  { pos: [1.05, 0.32, 0], weight: 0.55 }, // cuello
  { pos: [0.3, 0.05, 0.6], weight: 0.7 }, // costillas der
  { pos: [0.3, 0.05, -0.6], weight: 0.7 }, // costillas izq
  { pos: [0.05, -0.6, 0], weight: 1 }, // barriga
  { pos: [-1.35, 0.15, 0], weight: 0.85 }, // base de la cola
];

interface Props {
  bcs: number;
  /** Qué mostrar si el 3D no está disponible. */
  fallback?: ReactNode;
}

/**
 * Modelo 3D interactivo del perro (procedural, sin assets): se gira con el
 * dedo y las zonas donde acumula grasa brillan "en vivo" según el BCS.
 * Pesado pero espectacular; con respaldo seguro si GL falla.
 */
export function Dog3D({ bcs, fallback = null }: Props) {
  const [failed, setFailed] = useState(false);
  const rot = useRef({ y: 0.5, vy: 0.006, dragging: false, start: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        rot.current.dragging = true;
        rot.current.start = rot.current.y;
      },
      onPanResponderMove: (_e, g) => {
        rot.current.y = rot.current.start + g.dx * 0.01;
      },
      onPanResponderRelease: () => {
        rot.current.dragging = false;
      },
      onPanResponderTerminate: () => {
        rot.current.dragging = false;
      },
    }),
  ).current;

  if (!GLView || !Renderer || !THREE || failed) return <>{fallback}</>;

  const overall = Math.min(1, Math.max(0, (bcs - 4.5) / 4.5));
  const zoneColor = (sev: number) => (sev < 0.33 ? GOOD : sev < 0.66 ? WARN : BAD);

  const onContextCreate = (gl: any) => {
    try {
      const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor(0x101f19, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
      camera.position.set(0, 0.6, 6);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(3, 5, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x7cf2c8, 0.5);
      rim.position.set(-4, 2, -3);
      scene.add(rim);

      const dog = new THREE.Group();
      scene.add(dog);

      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe9e0d4, roughness: 0.75, metalness: 0 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2722, roughness: 0.6 });

      const addMesh = (geo: any, mat: any, pos: [number, number, number], scale?: [number, number, number]) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(pos[0], pos[1], pos[2]);
        if (scale) m.scale.set(scale[0], scale[1], scale[2]);
        dog.add(m);
        return m;
      };

      // Cuerpo (elipsoide), barriga más marcada cuanto mayor el BCS.
      addMesh(new THREE.SphereGeometry(1, 36, 28), bodyMat, [0, 0, 0], [1.7, 0.95 + overall * 0.18, 0.85 + overall * 0.22]);
      // Cabeza + hocico
      addMesh(new THREE.SphereGeometry(0.62, 32, 24), bodyMat, [1.6, 0.45, 0]);
      addMesh(new THREE.SphereGeometry(0.32, 24, 18), bodyMat, [2.2, 0.3, 0], [1.3, 0.85, 0.85]);
      // Orejas
      const earGeo = new THREE.ConeGeometry(0.2, 0.5, 18);
      addMesh(earGeo, bodyMat, [1.45, 1.0, 0.32]);
      addMesh(earGeo, bodyMat, [1.45, 1.0, -0.32]);
      // Ojos + hocico oscuro
      addMesh(new THREE.SphereGeometry(0.07, 12, 12), darkMat, [2.15, 0.4, 0.22]);
      addMesh(new THREE.SphereGeometry(0.07, 12, 12), darkMat, [2.15, 0.4, -0.22]);
      addMesh(new THREE.SphereGeometry(0.1, 14, 14), darkMat, [2.5, 0.28, 0]);
      // Patas
      const legGeo = new THREE.CylinderGeometry(0.17, 0.16, 1.0, 16);
      addMesh(legGeo, bodyMat, [0.95, -1.0, 0.45]);
      addMesh(legGeo, bodyMat, [0.95, -1.0, -0.45]);
      addMesh(legGeo, bodyMat, [-0.85, -1.0, 0.45]);
      addMesh(legGeo, bodyMat, [-0.85, -1.0, -0.45]);
      // Cola
      const tail = addMesh(new THREE.CylinderGeometry(0.09, 0.15, 0.95, 14), bodyMat, [-1.85, 0.45, 0]);
      tail.rotation.z = Math.PI / 3.5;

      // Zonas de grasa (glows emisivos)
      const glows: { mesh: any; phase: number }[] = [];
      ZONES.forEach((z, i) => {
        const sev = Math.min(1, overall * (0.55 + z.weight * 0.75));
        const color = zoneColor(sev);
        const r = 0.28 + z.weight * 0.22 * (0.5 + overall);
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.6 + sev,
          transparent: true,
          opacity: 0.45 + sev * 0.3,
        });
        const mesh = addMesh(new THREE.SphereGeometry(r, 18, 18), mat, z.pos);
        glows.push({ mesh, phase: i * 1.3 });
      });

      const clock = new THREE.Clock();
      const render = () => {
        requestAnimationFrame(render);
        const time = clock.getElapsedTime();
        if (!rot.current.dragging) rot.current.y += rot.current.vy;
        dog.rotation.y = rot.current.y;
        // Grasa "en vivo": pulso de brillo y tamaño.
        glows.forEach((g) => {
          const p = 0.7 + 0.3 * Math.sin(time * 2.4 + g.phase);
          g.mesh.material.emissiveIntensity = (0.6 + overall) * p;
          const s = 0.9 + 0.12 * Math.sin(time * 2.4 + g.phase);
          g.mesh.scale.set(s, s, s);
        });
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      render();
    } catch {
      setFailed(true);
    }
  };

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={gradients.dark} style={styles.card}>
        <Text style={styles.title}>{t('result.model3d.title')}</Text>
        <View style={styles.canvasWrap} {...pan.panHandlers}>
          <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
          <View style={styles.badge} pointerEvents="none">
            <Text style={styles.badgeText}>{t('result.model3d.drag')}</Text>
          </View>
        </View>
        <Text style={styles.hint}>{t('result.model3d.hint')}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  card: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    width: '100%',
    overflow: 'hidden',
  },
  title: { ...type.heading, color: '#FFFFFF', marginBottom: spacing.sm },
  canvasWrap: {
    width: '100%',
    height: 300,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#101f19',
  },
  badge: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  badgeText: { ...type.small, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  hint: { ...type.small, color: 'rgba(255,255,255,0.6)', marginTop: spacing.sm, textAlign: 'center' },
});
