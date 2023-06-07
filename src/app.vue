<script setup lang="ts">
import { inject, onBeforeUnmount, reactive, watch } from 'vue';
import { EEE_Layout, State } from '../types'
import { Default_CustomCss } from './constants';

// #region
const emitter: any = inject('emitter');
let backendApi: BackendAPI.IBackend;
let component: ExtensionAPI.IExtensionComponent;

const state: State = reactive({
  layout: {} as EEE_Layout,
  inEdit: false as boolean,
  extensionHtmlElement: null as HTMLElement,
  component: null as ExtensionAPI.IExtensionComponent,
})


emitter.on('updateExtData', (value: {
  ba: BackendAPI.IBackend, co: ExtensionAPI.IExtensionComponent, el?: HTMLElement
}) => {
  backendApi = value.ba;
  component = value.co;
  state.component = value.co;
  if (value.el) {
    state.extensionHtmlElement = value.el;
  }
});
emitter.on('changeEditMode', (value: boolean) => {
  state.inEdit = value;
});
emitter.on('updateLayout', (value: EEE_Layout) => {
  state.layout = value;
});

// Custom CSS & Qlik default style

watch(() => state.layout.props?.disableDefaultQlikStyle, () => {
  if (state.layout.props?.disableDefaultQlikStyle) {
    state.extensionHtmlElement.parentElement.parentElement.parentElement.style.backgroundColor = "rgba(255,255,255,0)";
    state.extensionHtmlElement.parentElement.parentElement.parentElement.parentElement.style.border = "none";
  } else {
    state.extensionHtmlElement.parentElement.parentElement.parentElement.style.backgroundColor = "";
    state.extensionHtmlElement.parentElement.parentElement.parentElement.parentElement.style.border = "";
  }
});
let customCssEle = undefined;
let customCss = undefined;
watch(() => state.layout.props?.customCss, () => {
  if (!state.layout.props) {
    return;
  }
  if (customCss != state.layout.props.customCss && state.layout.props.customCss != Default_CustomCss
    || (customCss != Default_CustomCss && state.layout.props.customCss == Default_CustomCss)) {
    customCss = state.layout.props.customCss;
    if (customCssEle == undefined) {
      customCssEle = document.createElement("style");
      document.head.appendChild(customCssEle);
    }
    customCssEle.innerHTML = customCss;
  }
})
onBeforeUnmount(() => {
  if (customCssEle) {
    document.head.removeChild(customCssEle);
    customCssEle = undefined;
    customCss = undefined;
  }
})

// #endregion

</script>

<template>
  <!-- replace 'eee' for every extension with some prefix (also in index.ts) -->
  <div class="eee_extension" v-if="state.layout?.props">

  </div>
</template>


<style scoped lang="less">
.eee_extension {
  display: flex;
  flex-flow: column nowrap;
}
</style>
