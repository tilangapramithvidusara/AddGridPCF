import moment from "moment";
import {stringReplace} from "../utils/StringReplace"
import { isValidDateFormat } from "./DateValidator";
import dayjs from "dayjs";

export const validationHandler = (_: any, value: any, validationData: any, isDate?: boolean, allData?: any,messages?:any, column?:any) => {

  const stringValue = value;
  // && value.toString();
  console.log("validation value",value)

  // Check if the value is null or empty
  if (validationData?.isMandatory) {
    console.log("inside mandatory:", value);
    if (stringValue == null || stringValue === "") {
      return Promise.reject(messages?.requiredError);
    }
  }

   // Check if the value is satisfy min or max length..
   if(validationData?.minLength || validationData?.maxLength || validationData?.maxValue || validationData?.minValue){
    if (validationData?.minLength && stringValue?.length < validationData?.minLength && !validationData?.maxLength && stringValue?.length >0) {
      const msg = stringReplace(messages?.minStringValidation ,validationData?.minLength);  
      return Promise.reject(msg);
    }
    if (validationData?.maxLength && stringValue?.length > validationData?.maxLength && !validationData?.minLength && stringValue?.length > 0) {
      const msg = stringReplace(messages?.maxStringValidation ,validationData?.maxLength);   
      return Promise.reject(msg);
    }
    if (validationData?.maxValue && value > validationData?.maxValue && !validationData?.minValue && value) {
      const msg = stringReplace(messages?.maxNumberValidation ,validationData?.maxValue );
      return Promise.reject(msg);
    }
    if (validationData?.minValue && value < validationData?.minValue && !validationData?.maxValue && value) {
      const msg = stringReplace(messages?.minNumberValidation ,validationData?.minValue );
      return Promise.reject(msg);
    }
  }

   // Check if the string length is within the specific length range
  if ((validationData.minLength != undefined && validationData.maxLength != undefined || validationData.minLength != null && validationData.maxLength != null) ) {
    if (
      stringValue?.length < validationData?.minLength ||
      stringValue?.length > validationData?.maxLength 
    ) {
      const msg = stringReplace(messages?.stringLengthValidation ,validationData?.minLength,validationData?.maxLength );
      return Promise.reject(msg);
    }
  }

  // Check if the number value is within the specific number range
  if (validationData.minValue != undefined  && validationData.maxValue !=undefined && value || validationData.minValue != null && validationData.maxValue != null && value) {
    if (value < validationData?.minValue || value > validationData?.maxValue) {
      const msg = stringReplace(messages?.numberValueValidation ,validationData?.minValue,validationData?.maxValue);
      return Promise.reject(msg);
    }
   }

  if ((value?.toString()?.split(".")[1] || "")?.length) {
    const decimalPoints = (value?.toString().split(".")[1] || "").length;

    if (decimalPoints > validationData?.numberOfDecimalPlaces && validationData?.minValue) {
      const msg = stringReplace(messages?.decimalValidation ,validationData?.numberOfDecimalPlaces);
      return Promise.reject(msg)
    }
  }

  if (validationData?.allowDuplicates && value) { 
    if (isDate) {
      const valueDate = moment().format('YYYY-MM-DD');
      const columnName = _?.field?.split('.')[1];
      const colIndex = Object.keys(allData[0])?.filter((item:any)=>item != "key")?.[column];
      let count = 0;
      if (allData && allData.length > 0) {
        allData.map((dataValue: any) => {
          if(typeof dataValue[colIndex] === "object" || isValidDateFormat(dataValue[colIndex])){
            dataValue[colIndex] = dayjs(dataValue[colIndex])?.format("YYYY-MM-DD");
          }
          if ( dayjs(dataValue[colIndex])?.format('YYYY-MM-DD') == dayjs(value)?.format('YYYY-MM-DD')) {
            count++;
          }
        });
        if (count > 1) {
          return Promise.reject(messages?.duplicateError)
        }
      }
      
    } else {
        const colIndex = Object.keys(allData[0])?.filter((item:any)=>item != "key")?.[column];
        let count = 0;
        if (allData && allData.length > 0) {
          allData.map((dataValue: any) => {
            if (dataValue[colIndex] == value) {
              count++;
            }
          });
          if (count > 1) {
            return Promise.reject(messages?.duplicateError)
          }
        } 
    }
  }
  
  return Promise.resolve();
}
