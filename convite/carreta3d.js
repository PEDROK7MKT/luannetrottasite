// Carreta Furacão em 3D (Three.js r128): carreta de festa saindo de um furacão.
// Uso: window.Carreta3D.mount(elemento) -> retorna true se o WebGL iniciou.
(function(){
  function roundedRect(THREE, w, h, r){
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  // Caixa arredondada: largura em X, altura em Y, profundidade em Z
  function rbox(THREE, w, h, d, r, material){
    const bev = Math.min(r, d / 4, w / 4, h / 4);
    const inner = Math.max(r - bev, 0.001);
    const g = new THREE.ExtrudeGeometry(roundedRect(THREE, w - 2 * bev, h - 2 * bev, inner), {
      depth: d - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 6
    });
    g.center();
    return new THREE.Mesh(g, material);
  }

  function dotTexture(THREE){
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function shadowTexture(THREE){
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,0.75)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function buildTruck(THREE){
    const truck = new THREE.Group();
    const std = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.3, metalness: 0.15 }, o || {}));
    const yellow = std(0xFFD23F), pink = std(0xFF3DA5), violet = std(0x8B5CF6), cyan = std(0x2EE6D6);
    const dark = std(0x1B1026, { roughness: 0.6 });
    const chrome = std(0xD8DCE8, { roughness: 0.2, metalness: 0.45, emissive: 0x2A2A3A });
    const glass = std(0x251040, { roughness: 0.05, metalness: 0.6 });
    const add = (m, x, y, z) => { m.position.set(x, y, z); truck.add(m); return m; };

    // Chassi
    add(rbox(THREE, 6.2, 0.26, 1.3, 0.08, dark), -0.1, 0.62, 0);

    // Cabine
    add(rbox(THREE, 1.5, 1.75, 1.75, 0.28, yellow), 2.35, 1.5, 0);
    add(rbox(THREE, 1.0, 0.3, 1.6, 0.12, yellow), 2.2, 2.45, 0);
    add(rbox(THREE, 0.06, 0.62, 1.4, 0.03, glass), 3.11, 1.85, 0);
    [-1, 1].forEach(s => add(rbox(THREE, 0.7, 0.55, 0.06, 0.06, glass), 2.5, 1.85, s * 0.89));
    add(rbox(THREE, 0.08, 0.45, 1.15, 0.04, chrome), 3.12, 1.08, 0);
    add(rbox(THREE, 0.3, 0.22, 1.85, 0.08, chrome), 3.15, 0.66, 0);
    add(rbox(THREE, 1.5, 0.12, 0.05, 0.03, pink), 2.35, 1.3, 0.9);
    add(rbox(THREE, 1.5, 0.12, 0.05, 0.03, pink), 2.35, 1.3, -0.9);

    // Faróis
    const headMat = new THREE.MeshStandardMaterial({ color: 0xFFF6C8, emissive: 0xFFE27A, emissiveIntensity: 1.6 });
    [-1, 1].forEach(s => {
      const g = new THREE.CylinderGeometry(0.13, 0.13, 0.08, 20);
      g.rotateZ(Math.PI / 2);
      add(new THREE.Mesh(g, headMat), 3.14, 1.05, s * 0.68);
    });

    // Escapamentos cromados
    [-1, 1].forEach(s => add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 14), chrome), 1.5, 1.55, s * 0.8));

    // Plataforma da carreta
    add(rbox(THREE, 4.5, 0.36, 1.9, 0.1, pink), -0.95, 0.9, 0);
    add(rbox(THREE, 4.5, 0.1, 1.94, 0.04, yellow), -0.95, 0.76, 0);

    // Grade lateral
    const railMat = cyan;
    for(let i = 0; i <= 8; i++){
      const x = -3.1 + i * 0.54;
      [-1, 1].forEach(s => add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), railMat), x, 1.33, s * 0.9));
    }
    [-1, 1].forEach(s => {
      const g = new THREE.CylinderGeometry(0.045, 0.045, 4.4, 10);
      g.rotateZ(Math.PI / 2);
      add(new THREE.Mesh(g, railMat), -0.95, 1.58, s * 0.9);
    });

    // Palco: colunas + teto
    [[-3.05, -0.85], [-3.05, 0.85], [1.15, -0.85], [1.15, 0.85]].forEach(([x, z]) =>
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 10), chrome), x, 1.85, z));
    add(rbox(THREE, 4.5, 0.16, 1.95, 0.07, violet), -0.95, 2.7, 0);
    add(rbox(THREE, 4.6, 0.06, 2.0, 0.03, yellow), -0.95, 2.8, 0);

    // Caixas de som
    const speakerCone = new THREE.MeshStandardMaterial({ color: 0x2EE6D6, emissive: 0x2EE6D6, emissiveIntensity: 0.7 });
    [-1, 1].forEach(s => {
      add(rbox(THREE, 0.55, 0.85, 0.55, 0.08, dark), -2.65, 1.5, s * 0.5);
      const g = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20);
      g.rotateZ(Math.PI / 2);
      add(new THREE.Mesh(g, speakerCone), -2.36, 1.62, s * 0.5);
      const g2 = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
      g2.rotateZ(Math.PI / 2);
      add(new THREE.Mesh(g2, speakerCone), -2.36, 1.3, s * 0.5);
    });

    // Globo espelhado
    const disco = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 2),
      new THREE.MeshStandardMaterial({ color: 0xF2F4FF, roughness: 0.15, metalness: 0.35, emissive: 0x5A4A8A, emissiveIntensity: 0.6, flatShading: true })
    );
    add(disco, -0.9, 2.2, 0);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), chrome), -0.9, 2.5, 0);

    // Varal de luzes
    const bulbs = [];
    const bulbColors = [0xFF3DA5, 0xFFD23F, 0x2EE6D6, 0xFF7A2F, 0x8B5CF6];
    let k = 0;
    [-0.97, 0.97].forEach(z => {
      for(let i = 0; i < 11; i++){
        const c = bulbColors[k % bulbColors.length];
        const m = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.4 });
        const b = add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), m), -3.1 + i * 0.43, 2.55 - Math.sin(i / 10 * Math.PI) * 0.12, z);
        bulbs.push({ mesh: b, phase: k * 0.7 });
        k++;
      }
    });

    // Rodas
    const wheels = [];
    const tire = std(0x15101C, { roughness: 0.8 });
    [2.45, -1.6, -2.55].forEach(x => {
      [-1, 1].forEach(s => {
        const wheel = new THREE.Group();
        const tg = new THREE.CylinderGeometry(0.46, 0.46, 0.34, 28);
        tg.rotateX(Math.PI / 2);
        wheel.add(new THREE.Mesh(tg, tire));
        const hg = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 6);
        hg.rotateX(Math.PI / 2);
        wheel.add(new THREE.Mesh(hg, chrome));
        const pg = new THREE.CylinderGeometry(0.07, 0.07, 0.38, 10);
        pg.rotateX(Math.PI / 2);
        wheel.add(new THREE.Mesh(pg, pink));
        wheel.position.set(x, 0.46, s * 0.86);
        truck.add(wheel);
        wheels.push(wheel);
      });
    });

    return { truck, wheels, bulbs, disco };
  }

  function buildHurricane(THREE){
    const group = new THREE.Group();
    const N = 2600;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const data = [];
    const cA = new THREE.Color(0xFF3DA5), cB = new THREE.Color(0x8B5CF6), cC = new THREE.Color(0x2EE6D6), tmp = new THREE.Color();
    for(let i = 0; i < N; i++){
      const t = Math.pow(Math.random(), 0.85);
      const r = 0.3 + t * 3.3 + (Math.random() - 0.5) * 0.45;
      data.push({ t, r, a: Math.random() * Math.PI * 2, s: 1.8 + Math.random() * 1.2 });
      if(t < 0.5) tmp.copy(cA).lerp(cB, t * 2); else tmp.copy(cB).lerp(cC, (t - 0.5) * 2);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.2, map: dotTexture(THREE), vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    group.add(points);

    const rings = [];
    [[0.7, 0xFF3DA5], [1.8, 0xE040D0], [3.0, 0xA855F7], [4.2, 0x6C8CF5], [5.4, 0x2EE6D6]].forEach(([y, c], i) => {
      const r = 0.3 + (y / 6.2) * 3.3;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.06, 8, 64, Math.PI * 1.5),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.position.y = y;
      ring.rotation.x = Math.PI / 2 + (i % 2 ? 0.12 : -0.12);
      group.add(ring);
      rings.push(ring);
    });

    function update(dt){
      const p = geo.attributes.position.array;
      for(let i = 0; i < N; i++){
        const d = data[i];
        d.a += dt * d.s * (1.6 - d.t * 0.8);
        p[i * 3] = Math.cos(d.a) * d.r;
        p[i * 3 + 1] = d.t * 6.2;
        p[i * 3 + 2] = Math.sin(d.a) * d.r;
      }
      geo.attributes.position.needsUpdate = true;
      rings.forEach((r, i) => { r.rotation.z += dt * (2.2 - i * 0.25); });
    }
    update(0);
    return { group, update };
  }

  function mount(container){
    const THREE = window.THREE;
    if(!THREE || !container) return false;
    let renderer;
    try{
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    }catch(e){
      return false;
    }
    if(!renderer.getContext()) return false;

    const w = container.clientWidth || 320, h = container.clientHeight || 240;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    camera.position.set(7.4, 4.6, 11.6);
    camera.lookAt(-0.7, 2.2, 0);

    scene.add(new THREE.HemisphereLight(0xFFF1E2, 0x3A1660, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 9, 7);
    scene.add(key);
    const rimPink = new THREE.PointLight(0xFF3DA5, 2.6, 22);
    rimPink.position.set(-5, 3, -2);
    scene.add(rimPink);
    const rimCyan = new THREE.PointLight(0x2EE6D6, 2.0, 22);
    rimCyan.position.set(3, 3, -4);
    scene.add(rimCyan);

    const world = new THREE.Group();
    scene.add(world);

    const hurricane = buildHurricane(THREE);
    hurricane.group.position.set(-3.4, 0, -2.2);
    world.add(hurricane.group);

    const { truck, wheels, bulbs, disco } = buildTruck(THREE);
    truck.position.x = 0.6;
    world.add(truck);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 3.2),
      new THREE.MeshBasicMaterial({ map: shadowTexture(THREE), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0.4, 0.01, 0);
    world.add(shadow);

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let visible = true;
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(container);
    }

    function frame(){
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      hurricane.update(dt);
      wheels.forEach(wh => { wh.rotation.z -= dt * 7; });
      truck.position.y = Math.abs(Math.sin(t * 5.5)) * 0.06;
      truck.rotation.z = Math.sin(t * 5.5) * 0.012;
      disco.rotation.y += dt * 1.5;
      bulbs.forEach(b => { b.mesh.material.emissiveIntensity = 0.5 + 1.3 * (0.5 + 0.5 * Math.sin(t * 6 + b.phase)); });
      world.rotation.y = -0.18 + Math.sin(t * 0.45) * 0.22;
      renderer.render(scene, camera);
    }

    if(reduced){
      frame();
    }else{
      (function loop(){
        requestAnimationFrame(loop);
        if(visible) frame();
      })();
    }

    window.addEventListener('resize', () => {
      const nw = container.clientWidth, nh = container.clientHeight;
      if(!nw || !nh) return;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    return true;
  }

  window.Carreta3D = { mount };
})();
