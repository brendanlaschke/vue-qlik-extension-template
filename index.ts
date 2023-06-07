import qr from "qr";
import define from "./qlik/definition";
import init from "./qlik/initialProperties";

import "./css/styles.less";
import "@fortawesome/fontawesome-free/css/all.css";

import { createApp } from 'vue';
import App from './src/app.vue';
import { EEE_Layout } from "./types";
import mitt from 'mitt';

const cssFile = qr.toUrl(".") + "/" + process.env.APP_NAME + ".css";
qr(["css!" + cssFile]);

export default {
  definition: define,
  initialProperties: init,
  paint: function (el: HTMLElement, la: EEE_Layout) {
    if (!this.vueState) {
      this.vueState = {};
    }
    if (!el[0].getElementsByClassName('eee_extension')[0]) {
      this.vueState.initialized = false;
    }

    if (!this.vueState.initialized) {
      this.vueState.initialized = true;
      this.backendApi.setCacheOptions({
        enabled: false
      });
      this.vueState.emitter = mitt();
      this.vueState.app = createApp(App, { layout: la })
      this.vueState.app.provide('emitter', this.vueState.emitter);
      this.vueState.app.mount(el[0]);
      this.vueState.emitter.emit('updateExtData', { ba: this.backendApi, co: this.$scope.component, el: el[0] });
      this.vueState.emitter.emit('updateLayout', JSON.parse(JSON.stringify(la)));
      this.$scope.$watch('object._inEditState', (inEdit) => {
        this.vueState.emitter.emit('changeEditMode', inEdit ? true : false);
      });
    }
  },
  beforeDestroy: function () {
    this.vueState.app.unmount();
  },
  updateData: function (la: EEE_Layout) {
    if (!this.vueState) {
      this.vueState = {};
    }
    if (this.vueState.initialized) {
      this.vueState.emitter.emit('updateExtData', { ba: this.backendApi, co: this.$scope.component });
      this.vueState.emitter.emit('updateLayout', JSON.parse(JSON.stringify(la)));
    }
    return Promise.resolve();
  }
}

