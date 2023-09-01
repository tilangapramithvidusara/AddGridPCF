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

   // Check if the value is satisfy min Value
   if (!(validationData.minLength == 0 && validationData.minLength == null || validationData.minLength == undefined) ) {
    if (stringValue?.length < validationData?.minLength) {
      const msg = stringReplace(messages?.minStringValidation ,validationData?.minLength);
      // `Length must greater than ${validationData?.minLength}`   
      return Promise.reject(msg);
    }
  }

   // Check if the value is within the specified length range
  if (!(validationData.minLength == 0 && validationData.maxLength == 0 || validationData.maxLength == null || validationData.maxLength == undefined) ) {
    if (
      stringValue?.length < validationData?.minLength ||
      stringValue?.length > validationData?.maxLength
    ) {
      const msg = stringReplace(messages?.stringLengthValidation ,validationData?.minLength,validationData?.maxLength );
      return Promise.reject(msg);
    }
  }

    // Check if the value is satisfy min Value
    if (!(validationData.maxValue == 0 && validationData.maxValue == null || validationData.maxValue == undefined) ) {
      if (value > validationData?.maxValue) {
        const msg = stringReplace(messages?.maxNumberValidation ,validationData?.maxValue );
        // `Value must less than ${validationData?.maxValue}`
        return Promise.reject(msg);
      }
    }

  if (!(validationData.minValue == 0 || validationData.minValue == null || validationData.minValue == undefined )) {
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
