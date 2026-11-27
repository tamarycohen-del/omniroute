function worldState(S, f) {
  // ship pose: heel (roll about its length), sink, drift along +x, small pitch
  shipG.position.set(S.shipX ?? 0, -(S.sink ?? 0), S.shipZ ?? 0);
  shipG.rotation.set(S.roll ?? 0, 0, S.pitch ?? 0);
  ship.scaff.visible = !!S.scaff;
  const lid = S.lids ?? 0; ship.lids.forEach((h) => { h.rotation.x = -h.userData.s * lid * 1.25; });
  const nc = Math.round((S.cannons ?? 1) * ship.cannons.length);
  ship.cannons.forEach((c, i) => { const order = (c.userData.k * 2 + (c.userData.s > 0 ? 0 : 1)); c.visible = order < nc || (S.cannons ?? 1) >= 1;
    const pop = S.cannonPop ? Math.max(0, Math.min(1, S.cannonPop * 34 - c.userData.k * 1.0)) : 1;
    c.position.copy(c.userData.base); c.position.z += c.userData.s * (-0.9 + 0.9 * pop); });
  const sv = S.sails ?? 1; ship.sails.forEach((sl) => { sl.visible = sv > 0.03; sl.scale.y = Math.max(0.03, sv); });
  ship.flags.forEach((fl, i) => { const pa = fl.geometry.attributes.position, b0 = fl.userData.base;
    for (let k = 0; k < pa.count; k++) { const x = b0[k * 3]; pa.setZ(k, Math.sin(f * 0.25 + x * 2.4 + i) * 0.18 * (1.2 - x)); } pa.needsUpdate = true; });
  ship.crates.forEach((c, i) => { const d = S.crates ?? 1, t = Math.max(0, Math.min(1, d * 4 - i)); c.visible = t > 0; c.position.copy(c.userData.base); c.position.y += (1 - t * t) * 9; });
  ship.gold = S.glint ?? 0;
  waterU.t.value = f / 30;
}

