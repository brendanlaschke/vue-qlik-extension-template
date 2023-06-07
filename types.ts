export interface State {
    layout: EEE_Layout;
    inEdit: boolean;
    extensionHtmlElement: HTMLElement;
    component: ExtensionAPI.IExtensionComponent;
}

export interface EEE_Layout extends Layout_Qlik {
    props: Props;
    user: string;
}
export interface DefinitionData {
    layout: EEE_Layout;
}

export interface Props {
    disableDefaultQlikStyle: boolean;
    customCss: string;
}
