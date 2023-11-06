import { filterKeys } from "../../constants/filterKeys";

declare global {
  interface Window {
    Xrm: any;
  }
}

export const fetchRecordId = async (

): Promise<any> => {
  try {
    const result = await window.parent.Xrm.Page.ui.formContext.data.entity.getId();
    // const str = '{AC3FE85C-90E5-ED11-A7C7-000D3A338DD2}';
    const removedBrackets = result.replace(/[{}]/g, '');

    return { error: false, data: removedBrackets, loading: false };
  } catch (error: any) {
    // handle error conditions
    return { error: true, data: [], loading: false };
  }
};

export const fetchRequest = async (
  entityLogicalName: any,
  id: string,
  columnsNames:string
): Promise<any> => {
  try {
    const result = await window.parent.Xrm.WebApi.retrieveRecord(entityLogicalName,id,columnsNames);
    // console.log("api result : ", result);
    return { error: false, data: result, loading: false };
  } catch (error: any) {
    // handle error conditions
    return { error: true, data: [], loading: false };
  }
};

export const saveRequest = async (
  entityLogicalName: any,
  id: string,
  data:any,
): Promise<any> => {
  try {
    const result = await window.parent.Xrm.WebApi.updateRecord(entityLogicalName,id,{"gyde_jsondata":data});
    return { error: false, data: result, loading: false };
  } catch (error: any) {
    // handle error conditions
    return { error: true, data: [], loading: false };
  }
};

export const saveColumnData = async (
  entityLogicalName: any,
  id: string,
  columnData:any
): Promise<any> => {
  try {
    // console.log("column Data with is editable", columnData)
    const result = await window.parent.Xrm.WebApi.updateRecord(entityLogicalName,id,{"gyde_jsoncolumn":columnData});
    return { error: false, data: result, loading: false };
  } catch (error: any) {
    // handle error conditions
    return { error: true, data: [], loading: false };
  }
};

export const retrieveColumnDetails = async (
  entityLogicalName: any,
  id: string,
): Promise<any> => {
  try {
    // console.log("column Data with is editable", columnData)
    const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, `?$select=gyde_columnwidth,gyde_defaultcolumnwidth,gyde_ismandatory,gyde_isdontallowduplicates,gyde_internalid,gyde_maxlength,gyde_lastupdateseerversion,gyde_maxvalue,gyde_minlength,gyde_minvalue,gyde_numberofdecimalplaces&$filter=_gyde_surveytemplatequestion_value eq ${id}`);
    console.log(" result ====>", result );
    return { error: false, data: result, loading: false };
  } catch (error: any) {
    // handle error conditions
    console.log('retrieveColumnDetails error ====> ', error);
    
    return { error: true, data: [], loading: false };
  }
};

export const loadResourceString = async () : Promise<any> => {

  const url = await window.parent.Xrm.Utility.getGlobalContext().getClientUrl();
  const language = await window.parent.Xrm.Utility.getGlobalContext().userSettings.languageId
  const webResourceUrl = `${url}/WebResources/gyde_localizedstrings.${language}.resx`;
  const mapper: any = [];

  try {
    const response = await fetch(`${webResourceUrl}`);
    const data = await response.text();
    console.log("Web Res Dataaa", data);
    console.log("Filter Keyssss", filterKeys);
    filterKeys?.map((filterKey: string, index: number) => {
      const parser = new DOMParser();
      // Parse the XML string
      const xmlDoc = parser.parseFromString(data, "text/xml");
      // Find the specific data element with the given key
      const dataNode: any = xmlDoc.querySelector(`data[name="${filterKey}"]`);
      // Extract the value from the data element
      const value: any = dataNode?.querySelector("value").textContent;
      console.log('data ====> ', index, value); 
      if (index && value) {
        mapper.push({ [filterKey]: value });
      }
    });
    
    return {
      error: false, data: mapper
    }
  } catch (e) {
    console.log("Language Translation Error", e);
    return {
      error: true, data: {}
    }
  }
  }