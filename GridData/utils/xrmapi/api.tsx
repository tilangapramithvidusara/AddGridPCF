import { GYDE_SURVEY_ANSWER, LIST } from "../../constants/Constants";
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

export const retriveListColumnAnsewrs = async(sourceArray: any[], questionId: string): Promise<any> => {
  try {
    let sourceDataSet = sourceArray;
    
    const response = sourceArray.map(async(sourceItem: any, index: number) => { 
      if (sourceItem?.datatype == LIST) {
        if (!sourceDataSet[index].data) {
          sourceDataSet[index].data = []
        } else {
          sourceDataSet[index].data = []
        }
        console.log('sourceItem?.identifier ==> ', sourceItem?.identifier, sourceDataSet[index].data);
        
        let fetchXml = `?fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
          <entity name="gyde_surveytemplatequestiongridcolumn">
            <attribute name="gyde_surveytemplatequestiongridcolumnid" />
            <attribute name="gyde_name" />
            <filter type="and">
              <condition attribute="gyde_internalid" operator="eq" value="${sourceItem?.identifier}" />  
              <condition attribute="gyde_surveytemplatequestion" operator="eq" value="${questionId}" />
            </filter>
          </entity>
        </fetch>`
        // identifier
        // const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords(GYDE_SURVEY_ANSWER, `?$select=gyde_surveytemplatequestionanswerid,gyde_answervalue,gyde_internalid,gyde_name&$filter=_gyde_relatedquestion_value eq ${sourceItem?.guid}`);
        const resultColumn = await window.parent.Xrm.WebApi.retrieveMultipleRecords('gyde_surveytemplatequestiongridcolumn', fetchXml);
        console.log('get column id using internal id ==> ', resultColumn);
        
        // await parent.window.Xrm.WebApi.retrieveMultipleRecords(`gyde_surveytemplatequestionanswer", "?$select=gyde_surveytemplatequestionanswerid,gyde_answervalue,gyde_internalid,gyde_name&$filter=_gyde_relatedquestion_value eq 78ab9768-2957-4010-9da8-12389ca44267`)        
        if (resultColumn && resultColumn?.entities && resultColumn?.entities?.length) {
          resultColumn.entities.forEach(async(columnItem: any) => {
            //gyde_surveytemplatequestiongridcolumnid
            const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords(GYDE_SURVEY_ANSWER, `?$select=gyde_surveytemplatequestionanswerid,gyde_answervalue,gyde_internalid,gyde_name&$filter=_gyde_relatedquestion_value eq ${columnItem?.gyde_surveytemplatequestiongridcolumnid}`);
            console.log('get column answers using internal id ==> ', result);
            
            if (result && result?.entities && result?.entities?.length) {
              if (!sourceDataSet[index].data) {
                sourceDataSet[index].data = []
              }
              result?.entities.forEach((item: any) => {
                console.log('result?.entities.forEach ==. ', item);
                
                let object = {
                  guid: item?.gyde_surveytemplatequestionanswerid,
                  identifier: item?.gyde_internalid,
                  label: item?.gyde_name,
                  value: item?.gyde_answervalue,
                }
                sourceDataSet[index].data.push(object)
                console.log('oooo ===> ', sourceDataSet[index]);
              });
            }
          });
        }
      }
    });
    // const resultColumn = await window.parent.Xrm.WebApi.retrieveMultipleRecords('gyde_surveytemplatequestiongridcolumn', fetchXml);
    // // await parent.window.Xrm.WebApi.retrieveMultipleRecords(`gyde_surveytemplatequestionanswer", "?$select=gyde_surveytemplatequestionanswerid,gyde_answervalue,gyde_internalid,gyde_name&$filter=_gyde_relatedquestion_value eq 78ab9768-2957-4010-9da8-12389ca44267`)        
    // if (resultColumn && resultColumn?.entities && resultColumn?.entities?.length) {
    //   resultColumn?.forEach(async(columnItem: any) => {
    //     //gyde_surveytemplatequestiongridcolumnid
    //     const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords(GYDE_SURVEY_ANSWER, `?$select=gyde_surveytemplatequestionanswerid,gyde_answervalue,gyde_internalid,gyde_name&$filter=_gyde_relatedquestion_value eq ${columnItem?.gyde_surveytemplatequestiongridcolumnid}`);
    //     if (result && result?.entities && result?.entities?.length) {
    //       if (!sourceDataSet[index].data) {
    //         sourceDataSet[index].data = []
    //       }
    //       result?.entities.forEach((item: any) => {
    //         let object = {
    //           guid: item?.gyde_surveytemplatequestionanswerid,
    //           identifier: item?.gyde_internalid,
    //           label: item?.gyde_name,
    //           value: item?.gyde_answervalue,
    //         }
    //         sourceDataSet[index].data.push(object)
    //       });
    //     }
    //   });
    // }
    await Promise.allSettled(response);
    console.log('sourceDataSet ==--==> ', sourceDataSet);
    
    return sourceDataSet;
  } catch (error) {
    console.log('error response  : => ', error);
    return sourceArray;
  }
  
}

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