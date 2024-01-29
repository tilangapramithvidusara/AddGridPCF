
export const GYDE_SURVEY_TEMPLATE ="gyde_surveytemplatechaptersectionquestion";
export const GYDE_GRID_QUESTION = "gyde_surveytemplatequestiongridcolumn";
export const GYDE_SURVEY_ANSWER = "gyde_surveytemplatequestionanswer"

export const Numeric = {name:'Numeric', value:528670000}
export const String = {name:'String', value:528670001}
export const List = {name:'List', value:528670002}
export const DateCol = {name:'Date', value:528670003}
export const Grid = {name:'Grid', value:528670004}

export const ERROR_COLOUR_CODE = '#FF0000';  
export const SUCCESS_COLOUR_CODE = '#00FF00';

export const DATA = 'data'
export const LIST = 'List'

// const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords('gyde_surveytemplatequestiongridcolumn', `?$select=gyde_columnwidth,gyde_defaultcolumnwidth,gyde_ismandatory,gyde_isdontallowduplicates,gyde_internalid,gyde_maxlength,gyde_lastupdateseerversion,gyde_maxvalue,gyde_minlength,gyde_minvalue,gyde_numberofdecimalplaces&$filter=_gyde_surveytemplatequestion_value eq 79CA0BC1-B948-EE11-BE6F-6045BDD0EF22`)