import React from "react";
import type { ColumnsType } from "antd/es/table";
import { DatePicker, InputNumber, Input, Select, Form, Checkbox } from "antd";
import { DateCol, List, Numeric, String } from "../constants/Constants";
import { validationHandler } from "./Validation";
// import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
import dayjs from "dayjs";

const { Option } = Select;

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

export const generateColumns = (
  columnConfig?: any,
  response?: any,
  form?: any,
  initialValues?: any,
  validationInputs?: any,
  messages?:any,
  isDisabled?: any,
  setIsDisabled?:any,
  savedColumns?:any,
  isColumnFetched?:any,
) => {
  const obj = {
    dataIndex: 'hidden',
    width: 'auto',
    render: () => (<div className="hidden-column"></div>),
  };
  const updatedColumns =  [...columnConfig, obj];
  const dynamicColumns : ColumnsType<any> = updatedColumns?.map(
    (column: any, num: any) => {
      const { id, order,guid ,datatype, data, validationData, width } = column;
      // find the relevant row details based on unique id - {guid}
      const row = columnConfig?.find((row:any)=> savedColumns?.find((id:any)=>id?.guid == row?.guid));
      const index = savedColumns?.findIndex((item:any)=>item?.guid==guid);
      // key attribute added in order to identify uniquely check boxes in delete functionality here remove that key -
      // because if not data inserted based on order of the attributes found in the object  
      const col = response && Object?.keys(response[0] || [])?.filter((item:any)=>item !== "key")?.[index];
      // console.log("row details", row);
      isColumnFetched(col);   
      let colWidth = 0;
      let columnRender;
      let title :any = '';
      if (datatype === String.name) {
        title = (
          <span  className="flex-wrap"> {id}   
            <Checkbox  
              key={guid}
              disabled={isDisabled}
              defaultChecked={row ? !row?.iseditable : !column?.iseditable}
              onChange={(e) => setIsDisabled( id, e.target.checked)}>
                Lock Data
            </Checkbox>
          </span>);
        colWidth = width  ? width : 160;
        columnRender = (item: any, record: any, index: number) => {
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={response[index]?.[col]}
              rules={[
                {
                  validator: (_: any, value: any) => {
                    return validationHandler(
                      _,
                      value,
                      validationData,
                      false,
                      validationInputs?.length>0 && validationInputs,
                      messages,
                      num
                    );
                  },
                },
              ]}
            >
              <Input
                placeholder={"Please insert string"}
                value={item || response[index]?.[id]}
                disabled={isDisabled}
              />
            </Form.Item>
          );
        };
      } else if (datatype === List.name) {
        colWidth = width   ? width : 160;
        columnRender = (item: any, record: any, index: number) => {
          // if saved values not similar with current drop down values {showOption=boolean}
          const showOptions = data?.some((item:any)=>item?.value == response[index]?.[col]); 
          const columnData = validationInputs?.map((item:any)=> item[id]);
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={showOptions ? response[index]?.[col] :null}
              rules={[
                { required: validationData?.isMandatory, message: messages?.requiredError },
              ]}
            >
              <Select
                placeholder={"Select a option"}
                // options={options}
                value={item || response[index]?.[col]} // new add
                disabled={isDisabled}
              >
               {data?.map((option: any) => {     
              return (
                   <Option disabled={validationData?.allowDuplicates ? columnData?.includes(option?.value) : false } key={option?.value} value={option?.value} >
                    {option?.label}
                   </Option>
                  )
               }   
               )}
              </Select>
            </Form.Item>
          );
        };
      } else if (datatype === Numeric.name) {
        colWidth = width   ? width : 160;
        columnRender = (item: any, record: any, index: number) => {
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={response[index]?.[col]}
              rules={[
                {
                  validator: (_: any, value: any) => {
                    return validationHandler(
                      _,
                      value,
                      validationData,
                      false,
                      validationInputs?.length>0 && validationInputs,
                      messages,
                      num
                    );
                  },
                },
              ]}
            >
              <InputNumber
                placeholder={"Insert a number"}
                value={item || response[index]?.[col]}
                disabled={isDisabled}
              />
            </Form.Item>
          );
        };
      } else if (datatype === DateCol.name) {
        colWidth = width   ? width : 160;
        columnRender = (item: any, record: any, index: number) => {
          // Parse the default date string into a moment object
          // const date: any = moment().format("YYYY-MM-DD");
          const defaultDate: string =  response[index]?.[col];
          // Parse the default date string into a Dayjs object
          const defaultDayjs:any = defaultDate ? dayjs(defaultDate): dayjs();
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              rules={[
                {
                  validator: (_: any, value: any) => {
                    return validationHandler(
                      _,
                      value?.format("YYYY-MM-DD"),
                      validationData,
                      true,
                      validationInputs?.length>0 && validationInputs,
                      messages,
                      num
                    );
                  },
                },
              ]}
              initialValue={defaultDayjs}
            >
              <DatePicker
                placeholder={`Select a date`}
                format={"DD MMM YYYY"}
                value={defaultDayjs}
                disabled={isDisabled}          
              />
            </Form.Item>
          );
        };
      }
      return {
        title: datatype === String.name ? title : id,
        columnTitle: id,    
        width: colWidth,
        dataIndex: order,
        ellipsis:true,
        render: columnRender,
      };
    }
  );

  return dynamicColumns;
};
