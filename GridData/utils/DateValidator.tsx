
export const isValidDateFormat = (value: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z)?$/;
    return regex.test(value);
  };
  