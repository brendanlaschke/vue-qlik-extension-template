import qlik from "qlik";
import { Default_CustomCss } from "../src/constants";

var space = {
  label: "",
  component: "text"
}

function getMasterObjectList(): Promise<{ value: string, label: string, icon?: string}[]> {
  return new Promise((resolve) => {
    qlik.currApp().getAppObjectList('masterobject', async (data) => {
      var masterobjects = [];
      var sortedData = data.qAppObjectList.qItems.sort((item1, item2) => {
        if (item1.qData.rank < item2.qData.rank) return -1
        if (item1.qData.rank > item2.qData.rank) return 1
        return item1.qMeta.title.localeCompare(item2.qMeta.title)
      });

      for (let i = 0; i < sortedData.length; i++) {
        let masterProps = await qlik.currApp().getObjectProperties(sortedData[i].qInfo.qId);
        masterobjects.push({
          value: sortedData[i].qInfo.qId,
          label: sortedData[i].qMeta.title,
          icon: masterProps.properties?.extensionMeta?.icon
        });
      }
      resolve(masterobjects);
    });
  })
};
function getVariables(): Promise<{value: string; label: string}[]> {
  return new Promise((resolve) => {
    qlik.currApp().getList("VariableList").then((data) => {
      let variables = [];
      if (data?.layout?.qVariableList?.qItems != undefined) {
        for (let i = 0; i < data.layout.qVariableList.qItems.length; i++) {
          if (!data.layout.qVariableList.qItems[i].qIsReserved) {
            variables.push({
              label: data.layout.qVariableList.qItems[i].qName,
              value: data.layout.qVariableList.qItems[i].qName
            });
          }
        }
      }
      resolve(variables);
    })
  })
}
function getSheets(): Promise<{value: string; label: string}[]>{
  return new Promise((resolve) => {
    qlik.currApp().getList("sheet").then((data) => {
      let sheets = [];
      for (let i = 0; i < data.layout.qAppObjectList.qItems.length; i++) {
        sheets.push({
          label: data.layout.qAppObjectList.qItems[i].qData.title,
          value: data.layout.qAppObjectList.qItems[i].qInfo.qId
        });
      }
      resolve(sheets);
    });
  })
}



var styling = {
  type: "items",
  label: "Style",
  items: {
    disableDefaultQlikStyle: {
      ref: 'props.disableDefaultQlikStyle',
      label: "DisableDefaultQlikStyle",
      component: 'checkbox',
      defaultValue: false
    },
    customCss: {
      type: "string",
      ref: "props.customCss",
      expression: "optional",
      rows: 5,
      component: "textarea",
      defaultValue: Default_CustomCss,
      label: "Custom CSS"
    },
  },

}

export default {
  type: "items",
  component: "accordion",
  items: {
    appearance: {
      uses: "settings",
      items: {
        styling: styling,
      }
    },
  }
};
