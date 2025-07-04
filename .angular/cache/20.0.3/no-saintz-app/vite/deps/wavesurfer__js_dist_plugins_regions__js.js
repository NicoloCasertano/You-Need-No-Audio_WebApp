import "./chunk-WDMUDEB6.js";

// node_modules/wavesurfer.js/dist/plugins/regions.esm.js
var t = class {
  constructor() {
    this.listeners = {};
  }
  on(t2, e2, i2) {
    if (this.listeners[t2] || (this.listeners[t2] = /* @__PURE__ */ new Set()), this.listeners[t2].add(e2), null == i2 ? void 0 : i2.once) {
      const i3 = () => {
        this.un(t2, i3), this.un(t2, e2);
      };
      return this.on(t2, i3), i3;
    }
    return () => this.un(t2, e2);
  }
  un(t2, e2) {
    var i2;
    null === (i2 = this.listeners[t2]) || void 0 === i2 || i2.delete(e2);
  }
  once(t2, e2) {
    return this.on(t2, e2, { once: true });
  }
  unAll() {
    this.listeners = {};
  }
  emit(t2, ...e2) {
    this.listeners[t2] && this.listeners[t2].forEach((t3) => t3(...e2));
  }
};
var e = class extends t {
  constructor(t2) {
    super(), this.subscriptions = [], this.options = t2;
  }
  onInit() {
  }
  _init(t2) {
    this.wavesurfer = t2, this.onInit();
  }
  destroy() {
    this.emit("destroy"), this.subscriptions.forEach((t2) => t2());
  }
};
function i(t2, e2, i2, n2, s2 = 3, r2 = 0, o2 = 100) {
  if (!t2) return () => {
  };
  const a = matchMedia("(pointer: coarse)").matches;
  let l = () => {
  };
  const h = (h2) => {
    if (h2.button !== r2) return;
    h2.preventDefault(), h2.stopPropagation();
    let d = h2.clientX, c = h2.clientY, u = false;
    const v = Date.now(), g = (n3) => {
      if (n3.preventDefault(), n3.stopPropagation(), a && Date.now() - v < o2) return;
      const r3 = n3.clientX, l2 = n3.clientY, h3 = r3 - d, g2 = l2 - c;
      if (u || Math.abs(h3) > s2 || Math.abs(g2) > s2) {
        const n4 = t2.getBoundingClientRect(), { left: s3, top: o3 } = n4;
        u || (null == i2 || i2(d - s3, c - o3), u = true), e2(h3, g2, r3 - s3, l2 - o3), d = r3, c = l2;
      }
    }, p = (e3) => {
      if (u) {
        const i3 = e3.clientX, s3 = e3.clientY, r3 = t2.getBoundingClientRect(), { left: o3, top: a2 } = r3;
        null == n2 || n2(i3 - o3, s3 - a2);
      }
      l();
    }, m = (t3) => {
      t3.relatedTarget && t3.relatedTarget !== document.documentElement || p(t3);
    }, f = (t3) => {
      u && (t3.stopPropagation(), t3.preventDefault());
    }, b = (t3) => {
      u && t3.preventDefault();
    };
    document.addEventListener("pointermove", g), document.addEventListener("pointerup", p), document.addEventListener("pointerout", m), document.addEventListener("pointercancel", m), document.addEventListener("touchmove", b, { passive: false }), document.addEventListener("click", f, { capture: true }), l = () => {
      document.removeEventListener("pointermove", g), document.removeEventListener("pointerup", p), document.removeEventListener("pointerout", m), document.removeEventListener("pointercancel", m), document.removeEventListener("touchmove", b), setTimeout(() => {
        document.removeEventListener("click", f, { capture: true });
      }, 10);
    };
  };
  return t2.addEventListener("pointerdown", h), () => {
    l(), t2.removeEventListener("pointerdown", h);
  };
}
function n(t2, e2) {
  const i2 = e2.xmlns ? document.createElementNS(e2.xmlns, t2) : document.createElement(t2);
  for (const [t3, s2] of Object.entries(e2)) if ("children" === t3 && s2) for (const [t4, e3] of Object.entries(s2)) e3 instanceof Node ? i2.appendChild(e3) : "string" == typeof e3 ? i2.appendChild(document.createTextNode(e3)) : i2.appendChild(n(t4, e3));
  else "style" === t3 ? Object.assign(i2.style, s2) : "textContent" === t3 ? i2.textContent = s2 : i2.setAttribute(t3, s2.toString());
  return i2;
}
function s(t2, e2, i2) {
  const s2 = n(t2, e2 || {});
  return null == i2 || i2.appendChild(s2), s2;
}
var r = class extends t {
  constructor(t2, e2, i2 = 0) {
    var n2, s2, r2, o2, a, l, h, d, c, u;
    super(), this.totalDuration = e2, this.numberOfChannels = i2, this.element = null, this.minLength = 0, this.maxLength = 1 / 0, this.contentEditable = false, this.subscriptions = [], this.isRemoved = false, this.subscriptions = [], this.id = t2.id || `region-${Math.random().toString(32).slice(2)}`, this.start = this.clampPosition(t2.start), this.end = this.clampPosition(null !== (n2 = t2.end) && void 0 !== n2 ? n2 : t2.start), this.drag = null === (s2 = t2.drag) || void 0 === s2 || s2, this.resize = null === (r2 = t2.resize) || void 0 === r2 || r2, this.resizeStart = null === (o2 = t2.resizeStart) || void 0 === o2 || o2, this.resizeEnd = null === (a = t2.resizeEnd) || void 0 === a || a, this.color = null !== (l = t2.color) && void 0 !== l ? l : "rgba(0, 0, 0, 0.1)", this.minLength = null !== (h = t2.minLength) && void 0 !== h ? h : this.minLength, this.maxLength = null !== (d = t2.maxLength) && void 0 !== d ? d : this.maxLength, this.channelIdx = null !== (c = t2.channelIdx) && void 0 !== c ? c : -1, this.contentEditable = null !== (u = t2.contentEditable) && void 0 !== u ? u : this.contentEditable, this.element = this.initElement(), this.setContent(t2.content), this.setPart(), this.renderPosition(), this.initMouseEvents();
  }
  clampPosition(t2) {
    return Math.max(0, Math.min(this.totalDuration, t2));
  }
  setPart() {
    var t2;
    const e2 = this.start === this.end;
    null === (t2 = this.element) || void 0 === t2 || t2.setAttribute("part", `${e2 ? "marker" : "region"} ${this.id}`);
  }
  addResizeHandles(t2) {
    const e2 = { position: "absolute", zIndex: "2", width: "6px", height: "100%", top: "0", cursor: "ew-resize", wordBreak: "keep-all" }, n2 = s("div", { part: "region-handle region-handle-left", style: Object.assign(Object.assign({}, e2), { left: "0", borderLeft: "2px solid rgba(0, 0, 0, 0.5)", borderRadius: "2px 0 0 2px" }) }, t2), r2 = s("div", { part: "region-handle region-handle-right", style: Object.assign(Object.assign({}, e2), { right: "0", borderRight: "2px solid rgba(0, 0, 0, 0.5)", borderRadius: "0 2px 2px 0" }) }, t2);
    this.subscriptions.push(i(n2, (t3) => this.onResize(t3, "start"), () => null, () => this.onEndResizing(), 1), i(r2, (t3) => this.onResize(t3, "end"), () => null, () => this.onEndResizing(), 1));
  }
  removeResizeHandles(t2) {
    const e2 = t2.querySelector('[part*="region-handle-left"]'), i2 = t2.querySelector('[part*="region-handle-right"]');
    e2 && t2.removeChild(e2), i2 && t2.removeChild(i2);
  }
  initElement() {
    if (this.isRemoved) return null;
    const t2 = this.start === this.end;
    let e2 = 0, i2 = 100;
    this.channelIdx >= 0 && this.channelIdx < this.numberOfChannels && (i2 = 100 / this.numberOfChannels, e2 = i2 * this.channelIdx);
    const n2 = s("div", { style: { position: "absolute", top: `${e2}%`, height: `${i2}%`, backgroundColor: t2 ? "none" : this.color, borderLeft: t2 ? "2px solid " + this.color : "none", borderRadius: "2px", boxSizing: "border-box", transition: "background-color 0.2s ease", cursor: this.drag ? "grab" : "default", pointerEvents: "all" } });
    return !t2 && this.resize && this.addResizeHandles(n2), n2;
  }
  renderPosition() {
    if (!this.element) return;
    const t2 = this.start / this.totalDuration, e2 = (this.totalDuration - this.end) / this.totalDuration;
    this.element.style.left = 100 * t2 + "%", this.element.style.right = 100 * e2 + "%";
  }
  toggleCursor(t2) {
    var e2;
    this.drag && (null === (e2 = this.element) || void 0 === e2 ? void 0 : e2.style) && (this.element.style.cursor = t2 ? "grabbing" : "grab");
  }
  initMouseEvents() {
    const { element: t2 } = this;
    t2 && (t2.addEventListener("click", (t3) => this.emit("click", t3)), t2.addEventListener("mouseenter", (t3) => this.emit("over", t3)), t2.addEventListener("mouseleave", (t3) => this.emit("leave", t3)), t2.addEventListener("dblclick", (t3) => this.emit("dblclick", t3)), t2.addEventListener("pointerdown", () => this.toggleCursor(true)), t2.addEventListener("pointerup", () => this.toggleCursor(false)), this.subscriptions.push(i(t2, (t3) => this.onMove(t3), () => this.toggleCursor(true), () => {
      this.toggleCursor(false), this.drag && this.emit("update-end");
    })), this.contentEditable && this.content && (this.content.addEventListener("click", (t3) => this.onContentClick(t3)), this.content.addEventListener("blur", () => this.onContentBlur())));
  }
  _onUpdate(t2, e2) {
    var i2;
    if (!(null === (i2 = this.element) || void 0 === i2 ? void 0 : i2.parentElement)) return;
    const { width: n2 } = this.element.parentElement.getBoundingClientRect(), s2 = t2 / n2 * this.totalDuration, r2 = e2 && "start" !== e2 ? this.start : this.start + s2, o2 = e2 && "end" !== e2 ? this.end : this.end + s2, a = o2 - r2;
    r2 >= 0 && o2 <= this.totalDuration && r2 <= o2 && a >= this.minLength && a <= this.maxLength && (this.start = r2, this.end = o2, this.renderPosition(), this.emit("update", e2));
  }
  onMove(t2) {
    this.drag && this._onUpdate(t2);
  }
  onResize(t2, e2) {
    this.resize && (this.resizeStart || "start" !== e2) && (this.resizeEnd || "end" !== e2) && this._onUpdate(t2, e2);
  }
  onEndResizing() {
    this.resize && this.emit("update-end");
  }
  onContentClick(t2) {
    t2.stopPropagation();
    t2.target.focus(), this.emit("click", t2);
  }
  onContentBlur() {
    this.emit("update-end");
  }
  _setTotalDuration(t2) {
    this.totalDuration = t2, this.renderPosition();
  }
  play(t2) {
    this.emit("play", t2 && this.end !== this.start ? this.end : void 0);
  }
  getContent(t2 = false) {
    var e2;
    return t2 ? this.content || void 0 : this.element instanceof HTMLElement ? (null === (e2 = this.content) || void 0 === e2 ? void 0 : e2.innerHTML) || void 0 : "";
  }
  setContent(t2) {
    var e2;
    if (this.element) if (null === (e2 = this.content) || void 0 === e2 || e2.remove(), t2) {
      if ("string" == typeof t2) {
        const e3 = this.start === this.end;
        this.content = s("div", { style: { padding: `0.2em ${e3 ? 0.2 : 0.4}em`, display: "inline-block" }, textContent: t2 });
      } else this.content = t2;
      this.contentEditable && (this.content.contentEditable = "true"), this.content.setAttribute("part", "region-content"), this.element.appendChild(this.content), this.emit("content-changed");
    } else this.content = void 0;
  }
  setOptions(t2) {
    var e2, i2;
    if (this.element) {
      if (t2.color && (this.color = t2.color, this.element.style.backgroundColor = this.color), void 0 !== t2.drag && (this.drag = t2.drag, this.element.style.cursor = this.drag ? "grab" : "default"), void 0 !== t2.start || void 0 !== t2.end) {
        const n2 = this.start === this.end;
        this.start = this.clampPosition(null !== (e2 = t2.start) && void 0 !== e2 ? e2 : this.start), this.end = this.clampPosition(null !== (i2 = t2.end) && void 0 !== i2 ? i2 : n2 ? this.start : this.end), this.renderPosition(), this.setPart();
      }
      if (t2.content && this.setContent(t2.content), t2.id && (this.id = t2.id, this.setPart()), void 0 !== t2.resize && t2.resize !== this.resize) {
        const e3 = this.start === this.end;
        this.resize = t2.resize, this.resize && !e3 ? this.addResizeHandles(this.element) : this.removeResizeHandles(this.element);
      }
      void 0 !== t2.resizeStart && (this.resizeStart = t2.resizeStart), void 0 !== t2.resizeEnd && (this.resizeEnd = t2.resizeEnd);
    }
  }
  remove() {
    this.isRemoved = true, this.emit("remove"), this.subscriptions.forEach((t2) => t2()), this.element && (this.element.remove(), this.element = null);
  }
};
var o = class _o extends e {
  constructor(t2) {
    super(t2), this.regions = [], this.regionsContainer = this.initRegionsContainer();
  }
  static create(t2) {
    return new _o(t2);
  }
  onInit() {
    if (!this.wavesurfer) throw Error("WaveSurfer is not initialized");
    this.wavesurfer.getWrapper().appendChild(this.regionsContainer);
    let t2 = [];
    this.subscriptions.push(this.wavesurfer.on("timeupdate", (e2) => {
      const i2 = this.regions.filter((t3) => t3.start <= e2 && (t3.end === t3.start ? t3.start + 0.05 : t3.end) >= e2);
      i2.forEach((e3) => {
        t2.includes(e3) || this.emit("region-in", e3);
      }), t2.forEach((t3) => {
        i2.includes(t3) || this.emit("region-out", t3);
      }), t2 = i2;
    }));
  }
  initRegionsContainer() {
    return s("div", { style: { position: "absolute", top: "0", left: "0", width: "100%", height: "100%", zIndex: "5", pointerEvents: "none" } });
  }
  getRegions() {
    return this.regions;
  }
  avoidOverlapping(t2) {
    t2.content && setTimeout(() => {
      const e2 = t2.content, i2 = e2.getBoundingClientRect(), n2 = this.regions.map((e3) => {
        if (e3 === t2 || !e3.content) return 0;
        const n3 = e3.content.getBoundingClientRect();
        return i2.left < n3.left + n3.width && n3.left < i2.left + i2.width ? n3.height : 0;
      }).reduce((t3, e3) => t3 + e3, 0);
      e2.style.marginTop = `${n2}px`;
    }, 10);
  }
  adjustScroll(t2) {
    var e2, i2;
    if (!t2.element) return;
    const n2 = null === (i2 = null === (e2 = this.wavesurfer) || void 0 === e2 ? void 0 : e2.getWrapper()) || void 0 === i2 ? void 0 : i2.parentElement;
    if (!n2) return;
    const { clientWidth: s2, scrollWidth: r2 } = n2;
    if (r2 <= s2) return;
    const o2 = n2.getBoundingClientRect(), a = t2.element.getBoundingClientRect(), l = a.left - o2.left, h = a.right - o2.left;
    l < 0 ? n2.scrollLeft += l : h > s2 && (n2.scrollLeft += h - s2);
  }
  virtualAppend(t2, e2, i2) {
    const n2 = () => {
      if (!this.wavesurfer) return;
      const n3 = this.wavesurfer.getWidth(), s2 = this.wavesurfer.getScroll(), r2 = e2.clientWidth, o2 = this.wavesurfer.getDuration(), a = Math.round(t2.start / o2 * r2), l = a + (Math.round((t2.end - t2.start) / o2 * r2) || 1) > s2 && a < s2 + n3;
      l && !i2.parentElement ? e2.appendChild(i2) : !l && i2.parentElement && i2.remove();
    };
    setTimeout(() => {
      if (!this.wavesurfer) return;
      n2();
      const e3 = this.wavesurfer.on("scroll", n2);
      this.subscriptions.push(t2.once("remove", e3), e3);
    }, 0);
  }
  saveRegion(t2) {
    if (!t2.element) return;
    this.virtualAppend(t2, this.regionsContainer, t2.element), this.avoidOverlapping(t2), this.regions.push(t2);
    const e2 = [t2.on("update", (e3) => {
      e3 || this.adjustScroll(t2), this.emit("region-update", t2, e3);
    }), t2.on("update-end", () => {
      this.avoidOverlapping(t2), this.emit("region-updated", t2);
    }), t2.on("play", (e3) => {
      var i2;
      null === (i2 = this.wavesurfer) || void 0 === i2 || i2.play(t2.start, e3);
    }), t2.on("click", (e3) => {
      this.emit("region-clicked", t2, e3);
    }), t2.on("dblclick", (e3) => {
      this.emit("region-double-clicked", t2, e3);
    }), t2.on("content-changed", () => {
      this.emit("region-content-changed", t2);
    }), t2.once("remove", () => {
      e2.forEach((t3) => t3()), this.regions = this.regions.filter((e3) => e3 !== t2), this.emit("region-removed", t2);
    })];
    this.subscriptions.push(...e2), this.emit("region-created", t2);
  }
  addRegion(t2) {
    var e2, i2;
    if (!this.wavesurfer) throw Error("WaveSurfer is not initialized");
    const n2 = this.wavesurfer.getDuration(), s2 = null === (i2 = null === (e2 = this.wavesurfer) || void 0 === e2 ? void 0 : e2.getDecodedData()) || void 0 === i2 ? void 0 : i2.numberOfChannels, o2 = new r(t2, n2, s2);
    return this.emit("region-initialized", o2), n2 ? this.saveRegion(o2) : this.subscriptions.push(this.wavesurfer.once("ready", (t3) => {
      o2._setTotalDuration(t3), this.saveRegion(o2);
    })), o2;
  }
  enableDragSelection(t2, e2 = 3) {
    var n2;
    const s2 = null === (n2 = this.wavesurfer) || void 0 === n2 ? void 0 : n2.getWrapper();
    if (!(s2 && s2 instanceof HTMLElement)) return () => {
    };
    let o2 = null, a = 0;
    return i(s2, (t3, e3, i2) => {
      o2 && o2._onUpdate(t3, i2 > a ? "end" : "start");
    }, (e3) => {
      var i2, n3;
      if (a = e3, !this.wavesurfer) return;
      const s3 = this.wavesurfer.getDuration(), l = null === (n3 = null === (i2 = this.wavesurfer) || void 0 === i2 ? void 0 : i2.getDecodedData()) || void 0 === n3 ? void 0 : n3.numberOfChannels, { width: h } = this.wavesurfer.getWrapper().getBoundingClientRect(), d = e3 / h * s3, c = (e3 + 5) / h * s3;
      o2 = new r(Object.assign(Object.assign({}, t2), { start: d, end: c }), s3, l), this.emit("region-initialized", o2), o2.element && this.regionsContainer.appendChild(o2.element);
    }, () => {
      o2 && (this.saveRegion(o2), o2 = null);
    }, e2);
  }
  clearRegions() {
    this.regions.slice().forEach((t2) => t2.remove()), this.regions = [];
  }
  destroy() {
    this.clearRegions(), super.destroy(), this.regionsContainer.remove();
  }
};
export {
  o as default
};
//# sourceMappingURL=wavesurfer__js_dist_plugins_regions__js.js.map
