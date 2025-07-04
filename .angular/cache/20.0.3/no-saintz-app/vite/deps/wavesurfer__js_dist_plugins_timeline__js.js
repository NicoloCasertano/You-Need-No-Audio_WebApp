import "./chunk-WDMUDEB6.js";

// node_modules/wavesurfer.js/dist/plugins/timeline.esm.js
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
function i(t2, e2) {
  const n2 = e2.xmlns ? document.createElementNS(e2.xmlns, t2) : document.createElement(t2);
  for (const [t3, s2] of Object.entries(e2)) if ("children" === t3 && s2) for (const [t4, e3] of Object.entries(s2)) e3 instanceof Node ? n2.appendChild(e3) : "string" == typeof e3 ? n2.appendChild(document.createTextNode(e3)) : n2.appendChild(i(t4, e3));
  else "style" === t3 ? Object.assign(n2.style, s2) : "textContent" === t3 ? n2.textContent = s2 : n2.setAttribute(t3, s2.toString());
  return n2;
}
function n(t2, e2, n2) {
  return i(t2, e2 || {});
}
var s = { height: 20, timeOffset: 0, formatTimeCallback: (t2) => {
  if (t2 / 60 > 1) {
    return `${Math.floor(t2 / 60)}:${`${(t2 = Math.round(t2 % 60)) < 10 ? "0" : ""}${t2}`}`;
  }
  return `${Math.round(1e3 * t2) / 1e3}`;
} };
var r = class _r extends e {
  constructor(t2) {
    super(t2 || {}), this.options = Object.assign({}, s, t2), this.timelineWrapper = this.initTimelineWrapper();
  }
  static create(t2) {
    return new _r(t2);
  }
  onInit() {
    var t2;
    if (!this.wavesurfer) throw Error("WaveSurfer is not initialized");
    let e2 = this.wavesurfer.getWrapper();
    if (this.options.container instanceof HTMLElement) e2 = this.options.container;
    else if ("string" == typeof this.options.container) {
      const t3 = document.querySelector(this.options.container);
      if (!t3) throw Error(`No Timeline container found matching ${this.options.container}`);
      e2 = t3;
    }
    this.options.insertPosition ? (e2.firstElementChild || e2).insertAdjacentElement(this.options.insertPosition, this.timelineWrapper) : e2.appendChild(this.timelineWrapper), this.subscriptions.push(this.wavesurfer.on("redraw", () => this.initTimeline())), ((null === (t2 = this.wavesurfer) || void 0 === t2 ? void 0 : t2.getDuration()) || this.options.duration) && this.initTimeline();
  }
  destroy() {
    this.timelineWrapper.remove(), super.destroy();
  }
  initTimelineWrapper() {
    return n("div", { part: "timeline-wrapper", style: { pointerEvents: "none" } });
  }
  defaultTimeInterval(t2) {
    return t2 >= 25 ? 1 : 5 * t2 >= 25 ? 5 : 15 * t2 >= 25 ? 15 : 60 * Math.ceil(0.5 / t2);
  }
  defaultPrimaryLabelInterval(t2) {
    return t2 >= 25 ? 10 : 5 * t2 >= 25 ? 6 : 4;
  }
  defaultSecondaryLabelInterval(t2) {
    return t2 >= 25 ? 5 : 2;
  }
  virtualAppend(t2, e2, i2) {
    let n2 = false;
    const s2 = (s3, r3) => {
      if (!this.wavesurfer) return;
      const o2 = i2.clientWidth, l = t2 > s3 && t2 + o2 < r3;
      l !== n2 && (n2 = l, l ? e2.appendChild(i2) : i2.remove());
    };
    if (!this.wavesurfer) return;
    const r2 = this.wavesurfer.getScroll(), o = r2 + this.wavesurfer.getWidth();
    s2(r2, o), this.subscriptions.push(this.wavesurfer.on("scroll", (t3, e3, i3, n3) => {
      s2(i3, n3);
    }));
  }
  initTimeline() {
    var t2, e2, i2, s2, r2, o, l, a;
    const h = null !== (i2 = null !== (e2 = null === (t2 = this.wavesurfer) || void 0 === t2 ? void 0 : t2.getDuration()) && void 0 !== e2 ? e2 : this.options.duration) && void 0 !== i2 ? i2 : 0, p = ((null === (s2 = this.wavesurfer) || void 0 === s2 ? void 0 : s2.getWrapper().scrollWidth) || this.timelineWrapper.scrollWidth) / h, u = null !== (r2 = this.options.timeInterval) && void 0 !== r2 ? r2 : this.defaultTimeInterval(p), d = null !== (o = this.options.primaryLabelInterval) && void 0 !== o ? o : this.defaultPrimaryLabelInterval(p), c = this.options.primaryLabelSpacing, f = null !== (l = this.options.secondaryLabelInterval) && void 0 !== l ? l : this.defaultSecondaryLabelInterval(p), v = this.options.secondaryLabelSpacing, m = "beforebegin" === this.options.insertPosition, y = n("div", { style: Object.assign({ height: `${this.options.height}px`, overflow: "hidden", fontSize: this.options.height / 2 + "px", whiteSpace: "nowrap" }, m ? { position: "absolute", top: "0", left: "0", right: "0", zIndex: "2" } : { position: "relative" }) });
    y.setAttribute("part", "timeline"), "string" == typeof this.options.style ? y.setAttribute("style", y.getAttribute("style") + this.options.style) : "object" == typeof this.options.style && Object.assign(y.style, this.options.style);
    const b = n("div", { style: { width: "0", height: "50%", display: "flex", flexDirection: "column", justifyContent: m ? "flex-start" : "flex-end", top: m ? "0" : "auto", bottom: m ? "auto" : "0", overflow: "visible", borderLeft: "1px solid currentColor", opacity: `${null !== (a = this.options.secondaryLabelOpacity) && void 0 !== a ? a : 0.25}`, position: "absolute", zIndex: "1" } });
    for (let t3 = 0, e3 = 0; t3 < h; t3 += u, e3++) {
      const i3 = b.cloneNode(), n2 = Math.round(100 * t3) % Math.round(100 * d) == 0 || c && e3 % c == 0, s3 = Math.round(100 * t3) % Math.round(100 * f) == 0 || v && e3 % v == 0;
      (n2 || s3) && (i3.style.height = "100%", i3.style.textIndent = "3px", i3.textContent = this.options.formatTimeCallback(t3), n2 && (i3.style.opacity = "1"));
      const r3 = n2 ? "primary" : s3 ? "secondary" : "tick";
      i3.setAttribute("part", `timeline-notch timeline-notch-${r3}`);
      const o2 = Math.round(100 * (t3 + this.options.timeOffset)) / 100 * p;
      i3.style.left = `${o2}px`, this.virtualAppend(o2, y, i3);
    }
    this.timelineWrapper.innerHTML = "", this.timelineWrapper.appendChild(y), this.emit("ready");
  }
};
export {
  r as default
};
//# sourceMappingURL=wavesurfer__js_dist_plugins_timeline__js.js.map
