import React, { useEffect, useReducer, useRef, useState } from "react";
import { Button, Form, Table, } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { generateColumns } from "../utils/GenerateColumns";
import ColumnsDetails from "../ColumnsDetails.json";
import { fetchRecordId, fetchRequest, retrieveColumnDetails, saveColumnData, saveRequest } from "../utils/xrmapi/api";
import { GYDE_GRID_QUESTION, GYDE_SURVEY_TEMPLATE, SUCCESS_COLOUR_CODE } from "../constants/Constants";
import { isValidDateFormat } from "../utils/DateValidator";

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

declare global {
  interface Window {
    Xrm: any;
  }
}

const CustomTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<any>([]);
  const [form] = Form.useForm();
  const [count, setCount] = useState(0);
  const [questionId, setQuestionId] = useState("");
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [dynamicColumns, setDynamicColumns] = useState<any>([]);
  const [columns, setColumns] = useState<any>([]);
  const initialValues = {};
  const [inputValues, setInputValues] = useState<any>([]);
  const [lockData, setLockData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [savedColumns, setSavedColumns] = useState<any>([]);
  const [isDisable, setIsDisable] = useState(false);
  const [filteredCol, setFilteredCol] = useState();
  const [deleteTrigger, setDeleteTrigger] = useState(false);
  const xx: any = [
    [
      {
        "key":0,
        "Col1": "asfasfaa",
        "Col2": "12abc",
        "Tier": "abce",
        "Col3": 2,
        "Col4": "2023-05-14"
    },
    {
        "key":1,
        "Col1": "asfasfa",
        "Col2": "13abc",
        "Tier": "abcd",
        "Col3": 3,
        "Col4": null
    }
  ],
  [
      {
        "guid": "acAqwy54352Abvd",   
      },
      {
        "guid": "acwewy54352Abvd",
      },
      {
        "guid": "acyywy54352Abvd",
      },
      {
        "guid": "acAqwy5435opbvd",
      },
      {
        "guid": "acAqwy543cxAbvd",
      }
  ]
  ];

  // SAMPLE FOR DYNAMIC MESSAGES USE
  const [numberValueValidation, setNumberValueValidation] = useState<string>("Number must have a value between $ and $$");
  const [stringLengthValidation, setStringLengthValidation] = useState<string>("Input must have a length between $ and $$");
  const [requiredError, setRequiredError] = useState<string>("Required Field");
  const [decimalValidation, setDecimalValidation] = useState<string>("Number can have a maximum of $ decimal places");
  const [duplicateError, setDuplicateError] = useState<string>("Duplicates not allowed");
  const [saveDataNotify, setSaveDataNotify] = useState<string>("Data saved successfully");
  const [saveDataError, setSaveDataError] = useState<string>("Error in saving. Please try again");
  const [commonError, setCommonError] = useState<string>("Something went wrong. Please try again");
  const [minNumberValidation, setMinNumberValidation] = useState<string>("Number must be greater than $");
  const [maxNumberValidation, setMaxNumberValidation] = useState<string>("Number must be less than $");
  const [maxStringValidation, setMaxStringValidation] = useState<string>("Input must be less than $");
  const [minStringValidation, setMinStringValidation] = useState<string>("Input must be greater than $");

  const loadResourceString = async () => {
    const url =
      await window.parent.Xrm.Utility.getGlobalContext().getClientUrl();
    const language = await window.parent.Xrm.Utility.getGlobalContext()
      .userSettings.languageId;
    const webResourceUrl = `${url}/WebResources/gyde_localizedstrings.${language}.resx`;

    try {
      const response = await fetch(`${webResourceUrl}`);
      const data = await response.text();
      // CREATE YOUR OWN KEYS
      const filterKeys = ['AddGridData_NumberValueValidation', 'AddGridData_StringLengthValidation', 'AddGridData_RequiredError','AddGridData_DecimalValidation','AddGridData_DuplicateError','AddGridData_SaveDataNotify','AddGridData_SaveDataError','AddGridData_CommonError','AddGridData_MinNumberValidation','AddGridData_MaxNumberValidation','AddGridData_MaxStringValidation','AddGridData_MinStringValidation'];
       // Replace with the key you want to filter
      filterKeys.map((filterKey: string, index: number) => {
        const parser = new DOMParser();
        // Parse the XML string
        const xmlDoc = parser.parseFromString(data, "text/xml");
        // Find the specific data element with the given key
        const dataNode: any = xmlDoc.querySelector(`data[name="${filterKey}"]`);
        // Extract the value from the data element
        const value: any = dataNode?.querySelector("value").textContent;

        // SET MESSAGES ACCORDING TO YOUR ORDER
        if (index === 0) {
          setNumberValueValidation(value)
        }
        if (index === 1) {
          setStringLengthValidation(value)
        }
        if (index === 2) {
          setRequiredError(value)
        }
        if (index === 3) {
          setDecimalValidation(value)
        }
        if (index === 4) {
          setDuplicateError(value)
        }
        if (index === 5) {
          setSaveDataNotify(value)
        }
        if (index === 6) {
          setSaveDataError(value)
        }if (index === 7) {
          setCommonError(value)
        }if (index === 8) {
          setMinNumberValidation(value);
        }if (index === 9) {
          setMaxNumberValidation(value)
        }if (index === 10) {
          setMaxStringValidation(value)
        }if (index === 11) {
          setMinStringValidation(value)
        }
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const allDataFetch = async () => {
    setLoading(true);
    await fetchRecordId()
      .then(async (id) => {
        setQuestionId(id?.data);
        const getGridData = await fetchRequest(
          GYDE_SURVEY_TEMPLATE,
          id?.data,
          "?$select=gyde_name,gyde_jsoncolumn,gyde_jsondata,statuscode"
        )
          .then(async (records) => {
            const jsonParse = await JSON.parse(records.data.gyde_jsoncolumn);
            let tableData = await JSON.parse(records.data.gyde_jsondata);
            if (typeof tableData == "undefined") {
              tableData = [];
            }
            const restColumnData = await retrieveColumnDetails(GYDE_GRID_QUESTION,id?.data);
            const newColumnData = jsonParse?.map((item:any)=> {
            const completeData =  restColumnData?.data?.entities?.find((val:any)=> val?.gyde_surveytemplatequestiongridcolumnid == item?.guid);
              if(completeData){
                  return {
                    ...item,
                    validationData:{
                      allowDuplicates:completeData?.gyde_isdontallowduplicates,
                      isMandatory:completeData?.gyde_ismandatory,
                      maxLength:completeData?.gyde_maxlength,
                      maxValue:completeData?.gyde_maxvalue,
                      minLength:completeData?.gyde_minlength,
                      minValue:completeData?.gyde_minvalue,
                      numberOfDecimalPlaces:completeData?.gyde_numberofdecimalplaces
                    },
                    width:completeData?.gyde_columnwidth
                  }           
              }
              // console.log("full data set",newColumnData)  ; 
            })
            // console.log("restColumnData", restColumnData);
            // console.log("new column Details", newColumnData);
            // console.log("jsonParse ===>", jsonParse);
            // console.log("jsonData ===>", tableData);

            if (records.data.statuscode == 2 || records.data.statuscode == 528670001) {
              setIsDisable(true)
            } else {
              setIsDisable(false);
            }
            const newData = tableData?.[0]?.map((item: any, num: number) => {
              return {
                ...item,
                key: num,
              };
            });
            setSavedColumns( tableData?.[1])
            setDynamicColumns(newColumnData || []);
            setLockData(jsonParse);
            setDataSource(newData || []);
            newData?.length>0 && setInputValues(newData);
            setColumnsData(newColumnData || [], newData || [], form, isDisable,tableData?.[1],newData);
            setCount(count + 1);
            setLoading(false);
          })
          .catch((err) => {
            console.log("error when column fetching", err);
            setLoading(false);
            let notificationType = "ERROR";
            // const msg = <span style={{color:ERROR_COLOUR_CODE}}>{commonError}</span>;
            window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(commonError, notificationType);
            setTimeout(function () {
              window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
              }, 10000);
          });
      })
      .catch(() => {
        setLoading(false);
        let notificationType = "ERROR";
        // const msg = <span style={{color: ERROR_COLOUR_CODE}}>{commonError}</span>;
        window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(commonError, notificationType);
        setTimeout(function () {
          window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
        }, 10000);
      });
  };
  console.log("dataSource", dataSource);

  useEffect(() => {
    allDataFetch();
    // CALL WEBRESOURCES
    loadResourceString();

  }, []);

  const columnMapping = (data:any) => {
    const extractedIds = dynamicColumns?.map((obj:any) => obj.id);
    const modifiedData:any = [];
    data?.forEach((obj:any, index:number) => {
      const newObj: any = { key: index };
      extractedIds.forEach((id:any, num:number) => {
        const columnId = Object.keys(obj)?.filter((item:any)=>item !== "key")?.[num];
        if(columnId == id){             
          if(isValidDateFormat(obj[columnId])){
            newObj[id] = dayjs(obj[id]);
          }else{
            newObj[id] = obj[id];
          }
        }else{
          if( isValidDateFormat(obj[columnId])){
            newObj[id] = dayjs(obj[columnId]) ;
          }else{
            newObj[id] = obj[columnId];
          }
        }
      });
      modifiedData?.push(newObj);
    });
    return modifiedData;
  }

  useEffect(()=>{
    form.resetFields();   
  },[filteredCol])

  useEffect(() => {
    if(inputValues?.length>0){
      setColumnsData(dynamicColumns || [], dataSource || [], form,isDisable,savedColumns,inputValues);
    }
  }, [inputValues]);

  useEffect(() => {
    setColumnsData(dynamicColumns || [], dataSource || [], form, isDisable,savedColumns,inputValues);   
  }, [lockData, dataSource])

  // useEffect(() => {
  //   setDynamicColumns(ColumnsDetails);
  //   setDataSource(xx[0]);
  //   setLockData(xx[1])
  //   setInputValues(xx[0]);
  //   setColumnsData(ColumnsDetails, xx[0], form, isDisable, xx[1],inputValues);
  // }, []);

  const handleLockData = async(columnName: string, value: boolean) => {
    console.log("column name when edit:", columnName,lockData);
      const newData = await lockData ; 
      console.log("newData when edit:", newData); 
      const dataRecord = await newData && newData?.map((item:any)=>{
        if(item.guid == columnName){
          return{
            ...item,
            "iseditable":!value
          }
        }
        return {...item,"iseditable": value}
      });
      setTimeout(()=>{
        setLockData(dataRecord);
      },200)
      
      console.log("column changed:", newData, dataRecord);
  }

  const setColumnsData = (
    dynamicColumns: any,
    dataSource: any,
    formData: any,
    disable?: boolean,
    savedColumns?:any,
    inputValues?:any,
  ) => {
    const columns = generateColumns(
      dynamicColumns,
      dataSource,
      formData,
      initialValues,
      inputValues,
      {numberValueValidation,stringLengthValidation,requiredError,decimalValidation,duplicateError,minStringValidation,maxNumberValidation,maxStringValidation,minNumberValidation},
      disable,
      handleLockData,
      savedColumns,
      filteredColumn,
      handleKeyDown
    );
    setColumns(columns || []);
  };

  const filteredColumn = (val:any) => {
    setFilteredCol(val);
  }

  const arrayToObj = (arr: string[]) => {
    const obj: { [key: string]: any } = {};
    arr.forEach((item, index) => {
      obj[item] = "";
    });
    return obj;
  };

  const replaceUndefinedWithNull = (obj:any) => {
    Object?.keys(obj)?.forEach((key) => {
      if (obj[key] === undefined) {
        obj[key] = null;
      }
    });
  };

  const handleDelete = async(rows: []) => {
    const deletedRows = rows?.map((item:any)=>item?.key);
    const newData = await inputValues?.filter(
      (item: any) => !deletedRows?.includes(item?.key)
    );
    newData?.forEach((item:any) => {
      replaceUndefinedWithNull(item);
    });
    setDataSource(newData);
    setInputValues(newData);
    setSelectedRows([]);
    setTimeout(()=>{
      form.resetFields();
      form.setFieldsValue(columnMapping(newData));
    },300);
  };
 
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record:any) => ({
      disabled:isDisable
    }),
    columnWidth:15
  };

  const cancel = () => {
    form.resetFields();
  };

  const handleAdd = async() => {
    const column = await columns?.map((item: any) => item?.columnTitle);
    let modifiedObj = arrayToObj(column);
    dataSource?.push(modifiedObj);
    console.log("newData add", dataSource);
    const allData = [...dataSource]?.map((item:any,num:number)=>{
       const replaceKey = {...item ,key:num };
       const { key, ...restOfAttributes } = replaceKey;
        return { key, ...restOfAttributes };
    });
    console.log("allData add", allData);
    setDataSource([...allData]);
  };

  const handleSave = async (data: any) => {
    const convertedArray:any = Object.values(data);
    // const records = JSON.stringify(convertedArray);
    const columnData = JSON.stringify(lockData);
    for (let index = 0; index < convertedArray.length; index++) {
      const obj : any = convertedArray[index];
      for (let key in obj ) {
        if(typeof obj[key] == "object" && obj[key] != undefined && obj[key] != null){
          convertedArray[index][key] = convertedArray[index][key].format("YYYY-MM-DD") 
        }
      }     
    }
    convertedArray?.forEach((item:any) => {
      replaceUndefinedWithNull(item);
    });
    const filteredGuid = dynamicColumns?.map((item:any)=>{return{guid:item?.guid}});
    const final = [convertedArray, filteredGuid];
    console.log("final object to save:", final,"columns:",columnData);
    const records = JSON.stringify(final);
      if(lockData?.length>0){
         saveRequest(GYDE_SURVEY_TEMPLATE, questionId, records)
        .then((res) => {
          if (!res?.error) {
            saveColumnData(GYDE_SURVEY_TEMPLATE,questionId,columnData).then((res)=>{
              if(!res?.error){
                let notificationType = "INFO";
                allDataFetch();
                window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(saveDataNotify, notificationType);
                setTimeout(function () {
                window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
                }, 10000);
              }
            })     
          }
        })
        .catch((err) => {
          let notificationType = "ERROR";
          window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(saveDataError, notificationType);
          setTimeout(function () {
            window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
            }, 10000);
        });
      }
  };

  interface DataType {
    key: React.Key;
    name: string;
    age: number;
    address: string;
  }

  const handleValueChange = (changedValues: any, allValues: any) => {
    const data = form.getFieldsValue();
    const dataArray = Object.values(data);
    const newDataArray = dataArray?.map((item:any,num:number)=>{return{key:num,...item}})
    newDataArray?.length>0 && setInputValues(newDataArray);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>, id: number, column:string) => {

    const data = await form.getFieldsValue();
    const dataSet = await data && Object.values(data);
    const validate = await dataSet[dataSet?.length -1];
    const lastElementKeys = await validate && Object.keys(validate);
    const lastKey = lastElementKeys[lastElementKeys?.length - 1];
    if (event.key === 'Tab' && `${dataSet?.length -1}_${lastKey}` == `${id}_${column}`) {
      handleAdd();
    }
  };

  return (
    <div className="pcf-wrapper">
      <Form
        form={form}
        // initialValues={initialValues}
        onFinish={handleSave}
        onValuesChange={handleValueChange}
      >
        <div className="float-right mb-20">
        <Button
            onClick={() => handleDelete(selectedRows)}
            type="primary"
            className="btn-red-outline mr-10"
            disabled={isDisable}
          >
            Delete Row
          </Button>

          <Button
            onClick={handleAdd}
            type="primary"            
            className="btn-blue"
            disabled={isDisable}
          >
            Add Row
          </Button>
          
        </div>
          <Table
            className={dataSource?.length < 1 ? "overflow-wrapper" : ""}
            columns={columns}
            dataSource={dataSource}
            rowSelection={{ ...rowSelection }}
            pagination={false}
            tableLayout="fixed"
            scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
            sticky
            loading={loading}
          />
        <div className="float-right mb-20">
          <Form.Item>
          <Button
              onClick={() => cancel()}
              type="primary"
              className="btn-red-outline mr-10"
              disabled={isDisable}
            >
              Reset
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              className="btn-blue"
              disabled={isDisable}
            >
              Save
            </Button>            
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default CustomTable;
