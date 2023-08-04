
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
    const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, `?$select=gyde_columnwidth,gyde_defaultcolumnwidth,gyde_isdontallowduplicates,gyde_maxlength,gyde_maxvalue,gyde_minlength,gyde_minvalue,gyde_numberofdecimalplaces&$filter=_gyde_surveytemplatequestion_value eq ${id}`);
    console.log(" result", result );
    return { error: false, data: result, loading: false };
  } catch (error: any) {
    // handle error conditions
    return { error: true, data: [], loading: false };
  }
};